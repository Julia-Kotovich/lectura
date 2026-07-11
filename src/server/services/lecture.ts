import { db } from "@/lib/db";
import type { CreateLectureInput } from "@/lib/schemas/lecture";
import { lectureOutlineSchema } from "@/lib/schemas/outline";
import { slideDocumentSchema } from "@/lib/schemas/slide";
import { generateOutline } from "../ai/pipelines/outline-generator";
import { generateSlidesFromOutline } from "../ai/pipelines/slide-generator";
import { evaluateDeck } from "../ai/pipelines/evaluation";
import { generateSlideImage } from "../ai/pipelines/image-generator";
import { canAccessLecture } from "./access";
import { replaceLectureSlides, saveDeckSnapshot } from "./lecture-ext";
import { enqueueGenerationJob } from "../queue";
import { ensureLectureFolder, syncLectureFiles } from "../storage/lecture-files";

export async function createLecture(userId: string, input: CreateLectureInput) {
  const lecture = await db.lecture.create({
    data: {
      userId,
      title: input.title,
      description: input.description,
    },
  });

  await ensureLectureFolder(lecture.id, lecture.title);
  return lecture;
}

export async function listLectures(userId: string) {
  return db.lecture.findMany({
    where: {
      OR: [{ userId }, { shares: { some: { userId } } }],
    },
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { slides: true } },
    },
  });
}

export async function getLecture(userId: string, lectureId: string) {
  const allowed = await canAccessLecture(userId, lectureId);
  if (!allowed) return null;

  return db.lecture.findFirst({
    where: { id: lectureId },
    include: {
      outlineVersions: { where: { isActive: true }, take: 1 },
      slides: { orderBy: { orderIndex: "asc" }, include: { blocks: { orderBy: { orderIndex: "asc" } } } },
      evaluations: { orderBy: { createdAt: "desc" }, take: 12 },
    },
  });
}

export async function generateAndSaveOutline(
  lectureId: string,
  userId: string,
  options?: {
    courseFrameworkSlug?: string;
    semesterWeek?: number;
  },
) {
  const lecture = await canAccessLecture(userId, lectureId, "EDITOR");
  if (!lecture) throw new Error("Lecture not found");

  const queued = await enqueueGenerationJob({
    lectureId,
    userId,
    type: "outline.generate",
  });
  if (queued.queued) {
    return { queued: true, jobId: queued.jobId } as const;
  }

  const job = await db.generationJob.create({
    data: { lectureId, type: "OUTLINE", status: "RUNNING" },
  });

  try {
    const outline = await generateOutline({
      title: lecture.title,
      description: lecture.description ?? undefined,
      courseFrameworkSlug: options?.courseFrameworkSlug,
      semesterWeek: options?.semesterWeek,
    });

    const latestVersion = await db.outlineVersion.findFirst({
      where: { lectureId },
      orderBy: { version: "desc" },
    });
    const nextVersion = (latestVersion?.version ?? 0) + 1;

    await db.outlineVersion.updateMany({
      where: { lectureId, isActive: true },
      data: { isActive: false },
    });

    const outlineVersion = await db.outlineVersion.create({
      data: {
        lectureId,
        version: nextVersion,
        content: outline,
        isActive: true,
      },
    });

    await db.lecture.update({
      where: { id: lectureId },
      data: { status: "OUTLINE_READY" },
    });

    await db.generationJob.update({
      where: { id: job.id },
      data: { status: "COMPLETED", output: outline },
    });

    await syncLectureFiles({
      lectureId,
      title: lecture.title,
      status: "OUTLINE_READY",
      outline,
    });

    return { outline, outlineVersion, queued: false as const };
  } catch (error) {
    await db.generationJob.update({
      where: { id: job.id },
      data: { status: "FAILED", error: String(error) },
    });
    throw error;
  }
}

export async function updateOutline(lectureId: string, userId: string, content: unknown) {
  const lecture = await canAccessLecture(userId, lectureId, "EDITOR");
  if (!lecture) throw new Error("Lecture not found");

  const parsed = lectureOutlineSchema.parse(content);
  const active = await db.outlineVersion.findFirst({
    where: { lectureId, isActive: true },
  });

  const saved = active
    ? await db.outlineVersion.update({
        where: { id: active.id },
        data: { content: parsed },
      })
    : await db.outlineVersion.create({
        data: { lectureId, version: 1, content: parsed, isActive: true },
      });

  await syncLectureFiles({
    lectureId,
    title: lecture.title,
    outline: parsed,
  });

  return saved;
}

export async function generateAndSaveSlides(lectureId: string, userId: string) {
  const lecture = await db.lecture.findFirst({
    where: { id: lectureId },
    include: { outlineVersions: { where: { isActive: true }, take: 1 } },
  });
  if (!(await canAccessLecture(userId, lectureId, "EDITOR"))) {
    throw new Error("Lecture not found");
  }
  if (!lecture) throw new Error("Lecture not found");

  await saveDeckSnapshot(lectureId, userId);

  const outlineVersion = lecture.outlineVersions[0];
  if (!outlineVersion) throw new Error("No active outline. Generate outline first.");

  const outline = lectureOutlineSchema.parse(outlineVersion.content);

  const job = await db.generationJob.create({
    data: { lectureId, type: "SLIDES", status: "RUNNING" },
  });

  try {
    const deck = await generateSlidesFromOutline({
      outline,
      lectureTitle: lecture.title,
    });

    await replaceLectureSlides(lectureId, deck.slides);

    await db.lecture.update({
      where: { id: lectureId },
      data: { status: "SLIDES_READY" },
    });

    const slides = deck.slides.map((s) => slideDocumentSchema.parse(s));
    await syncLectureFiles({
      lectureId,
      title: lecture.title,
      status: "SLIDES_READY",
      outline,
      slides,
    });

    await db.generationJob.update({
      where: { id: job.id },
      data: { status: "COMPLETED", output: deck },
    });

    return deck;
  } catch (error) {
    await db.generationJob.update({
      where: { id: job.id },
      data: { status: "FAILED", error: String(error) },
    });
    throw error;
  }
}

export async function updateSlide(
  lectureId: string,
  userId: string,
  slideId: string,
  content: unknown,
) {
  const lecture = await canAccessLecture(userId, lectureId, "EDITOR");
  if (!lecture) throw new Error("Lecture not found");

  const slide = slideDocumentSchema.parse(content);
  const updated = await db.slide.update({
    where: { id: slideId, lectureId },
    data: {
      title: slide.title,
      layout: slide.layout,
      content: slide,
      speakerNotes: slide.speakerNotes,
      metadata: slide.metadata ?? undefined,
    },
  });

  const allSlides = await db.slide.findMany({
    where: { lectureId },
    orderBy: { orderIndex: "asc" },
  });
  const outlineVersion = await db.outlineVersion.findFirst({
    where: { lectureId, isActive: true },
  });

  await syncLectureFiles({
    lectureId,
    title: lecture.title,
    outline: outlineVersion
      ? lectureOutlineSchema.parse(outlineVersion.content)
      : undefined,
    slides: allSlides.map((s) => slideDocumentSchema.parse(s.content)),
  });

  return updated;
}

export async function reorderSlides(
  lectureId: string,
  userId: string,
  slideIds: string[],
) {
  const lecture = await canAccessLecture(userId, lectureId, "EDITOR");
  if (!lecture) throw new Error("Lecture not found");

  await db.$transaction(
    slideIds.map((id, index) =>
      db.slide.update({
        where: { id, lectureId },
        data: { orderIndex: index },
      }),
    ),
  );
}

export async function evaluateLectureDeck(lectureId: string, userId: string) {
  const lecture = await db.lecture.findFirst({
    where: { id: lectureId },
    include: {
      slides: { orderBy: { orderIndex: "asc" } },
      outlineVersions: { where: { isActive: true }, take: 1 },
    },
  });
  if (!(await canAccessLecture(userId, lectureId))) {
    throw new Error("Lecture not found");
  }
  if (!lecture) throw new Error("Lecture not found");
  if (lecture.slides.length === 0) throw new Error("No slides to evaluate");

  const slides = lecture.slides.map((s) => slideDocumentSchema.parse(s.content));
  const outlineContent = lecture.outlineVersions[0]?.content;
  const outline = outlineContent
    ? lectureOutlineSchema.safeParse(outlineContent)
    : null;
  const learningObjectives =
    outline?.success ? outline.data.learningObjectives : undefined;

  const evaluation = await evaluateDeck({
    lectureTitle: lecture.title,
    slides,
    learningObjectives,
  });

  return db.slideEvaluation.create({
    data: {
      lectureId,
      scores: [],
      feedback: { bloomAnalysis: evaluation },
      overall: evaluation.alignmentScore,
    },
  });
}

export async function regenerateSlideImage(
  lectureId: string,
  userId: string,
  slideId: string,
  blockId: string,
  prompt: string,
) {
  const lecture = await canAccessLecture(userId, lectureId, "EDITOR");
  if (!lecture) throw new Error("Lecture not found");

  const slide = await db.slide.findFirst({ where: { id: slideId, lectureId } });
  if (!slide) throw new Error("Slide not found");

  const doc = slideDocumentSchema.parse(slide.content);
  const result = await generateSlideImage(prompt);

  const updatedBlocks = doc.blocks.map((block) => {
    if (block.id !== blockId) return block;
    return {
      ...block,
      type: "image" as const,
      content: {
        ...(typeof block.content === "object" ? block.content : {}),
        url: result.url,
        prompt,
        alt: prompt,
      },
    };
  });

  const updatedDoc = { ...doc, blocks: updatedBlocks };
  await db.slide.update({
    where: { id: slideId },
    data: { content: updatedDoc },
  });

  return { url: result.url, slide: updatedDoc };
}
