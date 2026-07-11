import { db } from "@/lib/db";
import {
  BLOOM_MAX_IMPROVE_ROUNDS,
  BLOOM_TARGET_SCORE,
  selectProblemSlides,
} from "@/lib/bloom/problem-slides";
import { bloomAnalysisSchema } from "@/lib/schemas/evaluation";
import { lectureOutlineSchema } from "@/lib/schemas/outline";
import { slideDocumentSchema, type SlideDocument } from "@/lib/schemas/slide";
import {
  buildBloomImprovementInstructions,
  findBloomSlideTag,
} from "../ai/prompts/bloom-improvement";
import { regenerateSingleSlide } from "../ai/pipelines/single-slide";
import { canAccessLecture } from "./access";
import { saveDeckSnapshot } from "./lecture-ext";
import { syncLectureFiles } from "../storage/lecture-files";

export type BloomImproveProgress = {
  status: "idle" | "running" | "completed" | "failed" | "skipped";
  phase: "improving" | "reevaluating" | "done";
  current: number;
  total: number;
  currentSlideTitle?: string;
  improvedSlideIds: string[];
  skippedReason?: string;
  beforeScore?: number;
  afterScore?: number;
  improvedCount?: number;
  reevaluated?: boolean;
  error?: string;
  jobId?: string;
};

type ProgressPatch = Partial<BloomImproveProgress>;

async function writeProgress(jobId: string, patch: ProgressPatch) {
  const job = await db.generationJob.findUnique({ where: { id: jobId } });
  if (!job) return;
  const prev = (job.output as BloomImproveProgress | null) ?? {
    status: "running",
    phase: "improving",
    current: 0,
    total: 0,
    improvedSlideIds: [],
  };
  await db.generationJob.update({
    where: { id: jobId },
    data: {
      output: { ...prev, ...patch },
      ...(patch.status === "failed"
        ? { status: "FAILED", error: patch.error ?? "Bloom improve failed" }
        : patch.status === "completed" || patch.status === "skipped"
          ? { status: "COMPLETED" }
          : { status: "RUNNING" }),
    },
  });
}

export async function getBloomImproveProgress(
  lectureId: string,
  userId: string,
): Promise<BloomImproveProgress & { roundsUsed: number; maxRounds: number; targetScore: number }> {
  if (!(await canAccessLecture(userId, lectureId))) {
    throw new Error("Lecture not found");
  }

  const roundsUsed = await countBloomImproveRounds(lectureId);
  const meta = {
    roundsUsed,
    maxRounds: BLOOM_MAX_IMPROVE_ROUNDS,
    targetScore: BLOOM_TARGET_SCORE,
  };

  const job = await db.generationJob.findFirst({
    where: { lectureId, type: "EVALUATION" },
    orderBy: { createdAt: "desc" },
  });
  if (!job?.output || typeof job.output !== "object") {
    return {
      status: "idle",
      phase: "done",
      current: 0,
      total: 0,
      improvedSlideIds: [],
      jobId: job?.id,
      ...meta,
    };
  }

  return {
    ...(job.output as BloomImproveProgress),
    jobId: job.id,
    status:
      job.status === "FAILED"
        ? "failed"
        : job.status === "RUNNING" || job.status === "PENDING"
          ? "running"
          : ((job.output as BloomImproveProgress).status ?? "completed"),
    ...meta,
  };
}

export async function listBloomEvaluations(lectureId: string, userId: string) {
  if (!(await canAccessLecture(userId, lectureId))) {
    throw new Error("Lecture not found");
  }

  const rows = await db.slideEvaluation.findMany({
    where: { lectureId },
    orderBy: { createdAt: "desc" },
    take: 12,
  });

  return rows.map((row) => {
    const bloom = bloomAnalysisSchema.safeParse(
      (row.feedback as { bloomAnalysis?: unknown } | null)?.bloomAnalysis,
    );
    return {
      id: row.id,
      createdAt: row.createdAt,
      overall: row.overall,
      alignmentScore: bloom.success ? bloom.data.alignmentScore : Math.round(row.overall),
      dominantLevel: bloom.success ? bloom.data.dominantLevel : null,
      gapCount: bloom.success ? bloom.data.gaps.length : 0,
    };
  });
}

export async function countBloomImproveRounds(lectureId: string): Promise<number> {
  const jobs = await db.generationJob.findMany({
    where: { lectureId, type: "EVALUATION", status: "COMPLETED" },
    select: { output: true },
  });
  return jobs.filter((job) => {
    const out = job.output as BloomImproveProgress | null;
    return out?.status === "completed" && (out.improvedCount ?? 0) > 0;
  }).length;
}

/**
 * Improve only problem slides from the latest Bloom evaluation, optionally re-evaluate.
 * Progress is written to GenerationJob.output for UI polling.
 */
export async function improveAndReevaluateFromBloom(
  lectureId: string,
  userId: string,
  options?: { reevaluate?: boolean },
) {
  const reevaluate = options?.reevaluate !== false;
  const lecture = await canAccessLecture(userId, lectureId, "EDITOR");
  if (!lecture) throw new Error("Access denied");

  const slides = await db.slide.findMany({
    where: { lectureId },
    orderBy: { orderIndex: "asc" },
  });
  if (slides.length === 0) throw new Error("No slides to improve");

  const evaluation = await db.slideEvaluation.findFirst({
    where: { lectureId },
    orderBy: { createdAt: "desc" },
  });
  if (!evaluation) throw new Error("Run Bloom evaluation before improving the deck");

  const bloomParsed = bloomAnalysisSchema.safeParse(
    (evaluation.feedback as { bloomAnalysis?: unknown }).bloomAnalysis,
  );
  if (!bloomParsed.success) {
    throw new Error("No Bloom evaluation found. Run Evaluate Bloom first.");
  }
  const bloom = bloomParsed.data;
  const beforeScore = bloom.alignmentScore;

  const job = await db.generationJob.create({
    data: {
      lectureId,
      type: "EVALUATION",
      status: "RUNNING",
      input: { kind: "bloom-improve", reevaluate },
      output: {
        status: "running",
        phase: "improving",
        current: 0,
        total: 0,
        improvedSlideIds: [],
        beforeScore,
      } satisfies BloomImproveProgress,
    },
  });

  try {
    const rounds = await countBloomImproveRounds(lectureId);
    if (rounds >= BLOOM_MAX_IMPROVE_ROUNDS) {
      const progress: BloomImproveProgress = {
        status: "skipped",
        phase: "done",
        current: 0,
        total: 0,
        improvedSlideIds: [],
        beforeScore,
        afterScore: beforeScore,
        improvedCount: 0,
        skippedReason: `Improve limit reached (${BLOOM_MAX_IMPROVE_ROUNDS} rounds). Edit slides manually or raise the target another way.`,
        jobId: job.id,
      };
      await writeProgress(job.id, progress);
      return progress;
    }

    if (beforeScore >= BLOOM_TARGET_SCORE) {
      const progress: BloomImproveProgress = {
        status: "skipped",
        phase: "done",
        current: 0,
        total: 0,
        improvedSlideIds: [],
        beforeScore,
        afterScore: beforeScore,
        improvedCount: 0,
        skippedReason: `Alignment already ≥ ${BLOOM_TARGET_SCORE}. No improve needed.`,
        jobId: job.id,
      };
      await writeProgress(job.id, progress);
      return progress;
    }

    const docs = slides.map((s) => ({
      rowId: s.id,
      doc: slideDocumentSchema.parse(s.content),
    }));
    const { slides: problemDocs, reasons } = selectProblemSlides(
      bloom,
      docs.map((d) => d.doc),
    );

    if (problemDocs.length === 0) {
      const progress: BloomImproveProgress = {
        status: "skipped",
        phase: "done",
        current: 0,
        total: 0,
        improvedSlideIds: [],
        beforeScore,
        afterScore: beforeScore,
        improvedCount: 0,
        skippedReason: "No problem slides identified from the latest Bloom report.",
        jobId: job.id,
      };
      await writeProgress(job.id, progress);
      return progress;
    }

    const problemIds = new Set(problemDocs.map((s) => s.id));
    const problemRows = docs.filter((d) => problemIds.has(d.doc.id));

    await writeProgress(job.id, {
      status: "running",
      phase: "improving",
      current: 0,
      total: problemRows.length,
      beforeScore,
      improvedSlideIds: [],
    });

    await saveDeckSnapshot(lectureId, userId);

    const outlineVersion = await db.outlineVersion.findFirst({
      where: { lectureId, isActive: true },
    });
    const outline = outlineVersion
      ? lectureOutlineSchema.parse(outlineVersion.content)
      : null;

    const improvedSlideIds: string[] = [];
    const updatedById = new Map<string, SlideDocument>();

    for (let i = 0; i < problemRows.length; i++) {
      const { rowId, doc: current } = problemRows[i]!;
      await writeProgress(job.id, {
        status: "running",
        phase: "improving",
        current: i + 1,
        total: problemRows.length,
        currentSlideTitle: current.title,
        improvedSlideIds,
        beforeScore,
      });

      const slideIndex = docs.findIndex((d) => d.rowId === rowId);
      const adjacentSlides: SlideDocument[] = [];
      if (slideIndex > 0) {
        const prev = docs[slideIndex - 1]!;
        adjacentSlides.push(updatedById.get(prev.doc.id) ?? prev.doc);
      }
      if (slideIndex < docs.length - 1) {
        const next = docs[slideIndex + 1]!;
        adjacentSlides.push(updatedById.get(next.doc.id) ?? next.doc);
      }

      const slideTag = findBloomSlideTag(bloom, current.title);
      const instructions = buildBloomImprovementInstructions({
        bloom,
        slideTitle: current.title,
        slideTag,
        selectionReason: reasons[current.id],
      });

      const regenerated = await regenerateSingleSlide({
        lectureTitle: lecture.title,
        outlineSummary: outline?.summary ?? lecture.description ?? "",
        adjacentSlides,
        currentSlide: current,
        instructions,
      });

      await db.slide.update({
        where: { id: rowId },
        data: {
          title: regenerated.title,
          layout: regenerated.layout,
          content: regenerated,
          speakerNotes: regenerated.speakerNotes,
          metadata: regenerated.metadata ?? undefined,
        },
      });

      updatedById.set(current.id, regenerated);
      improvedSlideIds.push(current.id);
    }

    const allDocs = docs.map((d) => updatedById.get(d.doc.id) ?? d.doc);
    await syncLectureFiles({
      lectureId,
      title: lecture.title,
      outline: outline ?? undefined,
      slides: allDocs,
    });

    let afterScore = beforeScore;
    if (reevaluate) {
      await writeProgress(job.id, {
        status: "running",
        phase: "reevaluating",
        current: problemRows.length,
        total: problemRows.length,
        currentSlideTitle: undefined,
        improvedSlideIds,
        beforeScore,
        improvedCount: improvedSlideIds.length,
      });
      const { evaluateLectureDeck } = await import("./lecture");
      const nextEval = await evaluateLectureDeck(lectureId, userId);
      afterScore = nextEval.overall;
    }

    const progress: BloomImproveProgress = {
      status: "completed",
      phase: "done",
      current: problemRows.length,
      total: problemRows.length,
      improvedSlideIds,
      beforeScore,
      afterScore,
      improvedCount: improvedSlideIds.length,
      reevaluated: reevaluate,
      jobId: job.id,
    };
    await writeProgress(job.id, progress);
    return progress;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await writeProgress(job.id, {
      status: "failed",
      phase: "done",
      error: message,
      beforeScore,
    });
    throw error;
  }
}

/** @deprecated Prefer improveAndReevaluateFromBloom — kept for compatibility. */
export async function improveDeckFromBloom(lectureId: string, userId: string) {
  return improveAndReevaluateFromBloom(lectureId, userId, { reevaluate: false });
}
