import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import {
  createLectureFromCourseEntry,
  getCourseBySlug,
  listCourseSummaries,
} from "../../services/courses";

export const coursesRouter = router({
  list: protectedProcedure.query(() => listCourseSummaries()),

  get: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .query(({ input }) => {
      const course = getCourseBySlug(input.slug);
      if (!course) throw new Error("Course not found");
      return {
        slug: course.slug,
        title: course.title,
        subtitle: course.subtitle,
        instructor: course.instructor,
        institution: course.institution,
        semester: course.semester,
        description: course.description,
        topics: course.topics,
        lectures: course.lectures.map((l) => ({
          slug: l.slug,
          title: l.title,
          summary: l.summary,
          sourcePdf: l.sourcePdf,
          targetSlideCount: l.outline.targetSlideCount,
          sectionCount: l.outline.sections.length,
          learningObjectives: l.outline.learningObjectives,
          sections: l.outline.sections.map((s) => ({
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
        courseSlug: z.string(),
        lectureSlug: z.string(),
      }),
    )
    .mutation(({ ctx, input }) =>
      createLectureFromCourseEntry(ctx.user.id, input.courseSlug, input.lectureSlug),
    ),
});
