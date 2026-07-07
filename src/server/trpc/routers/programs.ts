import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import {
  createLectureFromProgramSection,
  getProgramBySlug,
  listProgramSummaries,
} from "../../services/programs";

export const programsRouter = router({
  list: protectedProcedure.query(() => listProgramSummaries()),

  get: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .query(({ input }) => {
      const program = getProgramBySlug(input.slug);
      if (!program) throw new Error("Program not found");
      return {
        slug: program.slug,
        title: program.title,
        subtitle: program.subtitle,
        coordinator: program.coordinator,
        institution: program.institution,
        cohort: program.cohort,
        ects: program.ects,
        sourceHandbook: program.sourceHandbook,
        description: program.description,
        topics: program.topics,
        modules: program.modules.map((m) => ({
          slug: m.slug,
          code: m.code,
          title: m.title,
          summary: m.summary,
          semester: m.semester,
          cp: m.cp,
          track: m.track,
          status: m.status,
          sourcePdf: m.sourcePdf,
          hasSyllabus: Boolean(m.syllabusPath),
          targetSlideCount: m.outline.targetSlideCount,
          sectionCount: m.outline.sections.length,
          learningObjectives: m.outline.learningObjectives,
          sections: m.outline.sections.map((s) => ({
            title: s.title,
            learningGoals: s.learningGoals,
            exerciseCount: s.exercises?.length ?? 0,
            subsections: s.subsections.map((ss) => ({
              title: ss.title,
              keyPointCount: ss.keyPoints.length,
              exampleCount: ss.examples?.length ?? 0,
              hasDiagram: Boolean(ss.suggestedDiagram),
            })),
          })),
        })),
      };
    }),

  createLecture: protectedProcedure
    .input(
      z.object({
        programSlug: z.string(),
        moduleSlug: z.string(),
        sectionIndex: z.number().int().min(0),
      }),
    )
    .mutation(({ ctx, input }) =>
      createLectureFromProgramSection(
        ctx.user.id,
        input.programSlug,
        input.moduleSlug,
        input.sectionIndex,
      ),
    ),
});
