import { db } from "@/lib/db";
import { getProgram, listPrograms } from "@/lib/curriculum";
import type { LectureOutline } from "@/lib/schemas/outline";

export function listProgramSummaries() {
  return listPrograms();
}

export function getProgramBySlug(slug: string) {
  return getProgram(slug);
}

/** Spawn a user Lecture from one lecture-sized section inside a program module outline. */
export async function createLectureFromProgramSection(
  userId: string,
  programSlug: string,
  moduleSlug: string,
  sectionIndex: number,
) {
  const program = getProgram(programSlug);
  if (!program) throw new Error("Program not found");

  const mod = program.modules.find((m) => m.slug === moduleSlug);
  if (!mod) throw new Error("Module not found in program");
  const section = mod.outline.sections[sectionIndex];
  if (!section) throw new Error("Section not found in program module");

  const sectionOutline: LectureOutline = {
    title: section.title,
    summary: `${mod.title}. ${section.learningGoals.join(" ")}`,
    learningObjectives: section.learningGoals,
    sections: [section],
    suggestedResources: mod.outline.suggestedResources,
    assessmentIdeas: mod.outline.assessmentIdeas,
    targetSlideCount: 20,
    estimatedPresentationMinutes: section.durationMinutes ?? 90,
    estimatedStudyMinutes: 160,
    courseFrameworkSlug: mod.outline.courseFrameworkSlug,
    semesterWeek: mod.outline.semesterWeek,
  };

  const lecture = await db.lecture.create({
    data: {
      userId,
      title: `${mod.code} — ${section.title}`,
      description: `${program.title} · ${mod.title}`,
      status: "OUTLINE_READY",
    },
  });

  await db.outlineVersion.create({
    data: {
      lectureId: lecture.id,
      version: 1,
      content: sectionOutline,
      isActive: true,
    },
  });

  return lecture;
}
