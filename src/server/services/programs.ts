import { db } from "@/lib/db";
import { getProgram, listPrograms } from "@/lib/curriculum";

export function listProgramSummaries() {
  return listPrograms();
}

export function getProgramBySlug(slug: string) {
  return getProgram(slug);
}

/** Spawn a user Lecture from a program module outline. */
export async function createLectureFromProgramModule(
  userId: string,
  programSlug: string,
  moduleSlug: string,
) {
  const program = getProgram(programSlug);
  if (!program) throw new Error("Program not found");

  const mod = program.modules.find((m) => m.slug === moduleSlug);
  if (!mod) throw new Error("Module not found in program");

  const lecture = await db.lecture.create({
    data: {
      userId,
      title: `${program.title} — ${mod.title}`,
      description: mod.summary,
      status: "OUTLINE_READY",
    },
  });

  await db.outlineVersion.create({
    data: {
      lectureId: lecture.id,
      version: 1,
      content: mod.outline,
      isActive: true,
    },
  });

  return lecture;
}
