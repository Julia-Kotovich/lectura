import { z } from "zod";
import { lectureOutlineSchema } from "@/lib/schemas/outline";
import { courseFrameworkSlugSchema } from "@/lib/schemas/lecture";
import { router, protectedProcedure } from "../trpc";
import * as lectureService from "../../services/lecture";

export const outlineRouter = router({
  generate: protectedProcedure
    .input(
      z.object({
        lectureId: z.string(),
        courseFrameworkSlug: courseFrameworkSlugSchema.optional(),
        semesterWeek: z.number().int().min(1).max(14).optional(),
      }),
    )
    .mutation(({ ctx, input }) =>
      lectureService.generateAndSaveOutline(input.lectureId, ctx.user.id, {
        courseFrameworkSlug: input.courseFrameworkSlug,
        semesterWeek: input.semesterWeek,
      }),
    ),

  update: protectedProcedure
    .input(z.object({ lectureId: z.string(), content: lectureOutlineSchema }))
    .mutation(({ ctx, input }) =>
      lectureService.updateOutline(input.lectureId, ctx.user.id, input.content),
    ),
});
