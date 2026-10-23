/**
 * Import course-generation notebook output into the ProfDeck database,
 * so notebook runs can be viewed in the web UI like regular lectures.
 *
 * Usage:
 *   npx tsx scripts/import-notebook-run.ts                     # import all lectures of the default run
 *   npx tsx scripts/import-notebook-run.ts --lecture 1         # import a single lecture
 *   npx tsx scripts/import-notebook-run.ts --run 2025-mcsse-se-01 --user professor@localhost.dev
 *   npx tsx scripts/import-notebook-run.ts --force             # re-import (replaces same-titled lectures)
 */

import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { db } from "../src/lib/db";
import { ensureDevUser } from "../src/server/services/user";
import { replaceLectureSlides } from "../src/server/services/lecture-ext";
import { syncLectureFiles } from "../src/server/storage/lecture-files";
import { lectureOutlineSchema } from "../src/lib/schemas/outline";
import { slideDocumentSchema, type SlideDocument } from "../src/lib/schemas/slide";
import { bloomAnalysisSchema } from "../src/lib/schemas/evaluation";

const DEFAULT_RUN = "2025-mcsse-se-01";

function parseArgs() {
  const args = process.argv.slice(2);
  const get = (flag: string) => {
    const i = args.indexOf(flag);
    return i >= 0 ? args[i + 1] : undefined;
  };
  return {
    run: get("--run") ?? DEFAULT_RUN,
    lecture: get("--lecture") ? Number(get("--lecture")) : undefined,
    userEmail: get("--user"),
    force: args.includes("--force"),
  };
}

const ALLOWED_BLOCK_TYPES = new Set([
  "heading",
  "text",
  "bullets",
  "code",
  "image",
  "diagram",
  "quote",
]);

/** Notebook decks may contain block types the app schema doesn't know (e.g. "activity"). */
function normalizeBlock(block: Record<string, unknown>): Record<string, unknown> {
  const type = String(block.type ?? "text");
  const content = block.content;

  if (type === "activity" && content && typeof content === "object") {
    const c = content as Record<string, unknown>;
    const parts = [
      c.title ? `Activity: ${c.title}` : "Activity",
      c.instructions ? String(c.instructions) : "",
      c.purpose ? `Purpose: ${c.purpose}` : "",
    ].filter(Boolean);
    return { id: block.id ?? "", type: "text", content: parts.join("\n\n") };
  }

  if (!ALLOWED_BLOCK_TYPES.has(type)) {
    return {
      id: block.id ?? "",
      type: "text",
      content: typeof content === "string" ? content : JSON.stringify(content, null, 2),
    };
  }
  return block;
}

function normalizeSlides(deck: { slides?: Array<Record<string, unknown>> }): SlideDocument[] {
  return (deck.slides ?? []).map((slide) =>
    slideDocumentSchema.parse({
      ...slide,
      blocks: ((slide.blocks as Array<Record<string, unknown>>) ?? []).map(normalizeBlock),
    }),
  );
}

async function readJson<T = unknown>(filePath: string): Promise<T | null> {
  try {
    return JSON.parse(await readFile(filePath, "utf-8")) as T;
  } catch {
    return null;
  }
}

async function main() {
  const { run, lecture: onlyLecture, userEmail, force } = parseArgs();
  const baseDir = path.join(process.cwd(), "output", "course-generation");
  const lecturesDir = path.join(baseDir, run, "lectures");

  const user = userEmail
    ? await db.user.findUnique({ where: { email: userEmail } })
    : await ensureDevUser();
  if (!user) {
    throw new Error(`User not found: ${userEmail}. Omit --user to use the local dev user.`);
  }

  const plan = await readJson<{
    lectures?: Array<{ number?: number; title?: string; durationMinutes?: number }>;
  }>(path.join(baseDir, `${run}-lecture-plan.json`));

  const files = await readdir(lecturesDir);
  const numbers = [
    ...new Set(
      files
        .map((f) => /^lecture-(\d+)-deck\.json$/.exec(f)?.[1])
        .filter((n): n is string => Boolean(n))
        .map(Number),
    ),
  ].sort((a, b) => a - b);

  const targets = onlyLecture ? numbers.filter((n) => n === onlyLecture) : numbers;
  if (targets.length === 0) {
    throw new Error(`No lecture decks found in ${lecturesDir}`);
  }

  console.log(`Importing run "${run}" (${targets.length} lecture(s)) as ${user.email ?? user.id}`);

  for (const number of targets) {
    const prefix = path.join(lecturesDir, `lecture-${String(number).padStart(2, "0")}`);
    const deck = await readJson<{ slides?: Array<Record<string, unknown>> }>(`${prefix}-deck.json`);
    const bloomRaw = await readJson(`${prefix}-bloom.json`);
    const outlineRaw = await readJson(`${prefix}-outline.json`);
    const improveHistory =
      (await readJson<Array<Record<string, unknown>>>(`${prefix}-improve-history.json`)) ?? [];

    if (!deck) {
      console.warn(`  [${number}] deck.json missing — skipped`);
      continue;
    }

    const planLecture = plan?.lectures?.find((l) => l.number === number);
    const outline = lectureOutlineSchema.safeParse(outlineRaw);
    const bloom = bloomAnalysisSchema.safeParse(bloomRaw);
    const title =
      outline.success && outline.data.title
        ? outline.data.title
        : `Lecture ${number}. ${planLecture?.title ?? "Imported lecture"}`;

    const existing = await db.lecture.findFirst({ where: { userId: user.id, title } });
    if (existing) {
      if (!force) {
        console.log(`  [${number}] "${title}" already exists (${existing.id}) — skipped (use --force)`);
        continue;
      }
      await db.lecture.delete({ where: { id: existing.id } });
      console.log(`  [${number}] replaced existing lecture ${existing.id}`);
    }

    const slides = normalizeSlides(deck);
    const lectureRow = await db.lecture.create({
      data: {
        userId: user.id,
        title,
        description: outline.success ? outline.data.summary : planLecture?.title,
        durationMinutes: planLecture?.durationMinutes ?? 90,
        difficulty: "GRADUATE",
        status: "SLIDES_READY",
      },
    });

    if (outline.success) {
      await db.outlineVersion.create({
        data: { lectureId: lectureRow.id, version: 1, content: outline.data, isActive: true },
      });
    }

    await replaceLectureSlides(lectureRow.id, slides);

    // Bloom history: initial score, then one evaluation per improve round, final state last.
    const baseTime = Date.now();
    let step = 0;
    const initialScore = (improveHistory[0]?.before_score as number | undefined) ?? null;
    if (initialScore != null) {
      await db.slideEvaluation.create({
        data: {
          lectureId: lectureRow.id,
          scores: [],
          feedback: { importedNote: "Initial evaluation (score only, from notebook run)" },
          overall: initialScore,
          createdAt: new Date(baseTime + step++ * 1000),
        },
      });
    }
    for (const round of improveHistory) {
      if (round.status !== "completed") continue;
      const roundBloom = bloomAnalysisSchema.safeParse(round.evaluation);
      if (!roundBloom.success) continue;
      await db.slideEvaluation.create({
        data: {
          lectureId: lectureRow.id,
          scores: [],
          feedback: { bloomAnalysis: roundBloom.data },
          overall: roundBloom.data.alignmentScore,
          createdAt: new Date(baseTime + step++ * 1000),
        },
      });
      await db.generationJob.create({
        data: {
          lectureId: lectureRow.id,
          type: "EVALUATION",
          status: "COMPLETED",
          input: { kind: "bloom-improve", imported: true },
          output: {
            status: "completed",
            phase: "done",
            current: (round.improved_count as number) ?? 0,
            total: (round.improved_count as number) ?? 0,
            improvedSlideIds: (round.improved_slide_ids as string[]) ?? [],
            improvedCount: (round.improved_count as number) ?? 0,
            beforeScore: (round.before_score as number) ?? null,
            afterScore: (round.after_score as number) ?? null,
            keptBest: (round.kept_best as boolean) ?? false,
            rawAfterScore: (round.raw_after_score as number) ?? null,
            reevaluated: (round.reevaluated as boolean) ?? true,
          },
        },
      });
    }
    // Final evaluation last so the UI shows the kept-best deck state.
    // Skip when identical to the last round's evaluation (kept-best duplicates it).
    const lastRound = [...improveHistory].reverse().find((r) => r.status === "completed");
    const lastRoundBloom = lastRound
      ? bloomAnalysisSchema.safeParse(lastRound.evaluation)
      : null;
    const finalDuplicatesLastRound =
      bloom.success &&
      lastRoundBloom?.success === true &&
      JSON.stringify(lastRoundBloom.data) === JSON.stringify(bloom.data);
    if (bloom.success && !finalDuplicatesLastRound) {
      await db.slideEvaluation.create({
        data: {
          lectureId: lectureRow.id,
          scores: [],
          feedback: { bloomAnalysis: bloom.data },
          overall: bloom.data.alignmentScore,
          createdAt: new Date(baseTime + step++ * 1000),
        },
      });
    }

    try {
      await syncLectureFiles({
        lectureId: lectureRow.id,
        title,
        outline: outline.success ? outline.data : undefined,
        slides,
      });
    } catch (error) {
      console.warn(`  [${number}] storage sync failed (non-fatal):`, error);
    }

    console.log(
      `  [${number}] imported "${title}" → /lectures/${lectureRow.id} ` +
        `(${slides.length} slides, Bloom ${bloom.success ? bloom.data.alignmentScore : "—"})`,
    );
  }

  console.log("Done.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
