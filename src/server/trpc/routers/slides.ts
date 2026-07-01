import { z } from "zod";
import { slideDocumentSchema } from "@/lib/schemas/slide";
import { router, protectedProcedure } from "../trpc";
import * as lectureService from "../../services/lecture";

export const slidesRouter = router({
  generateFromOutline: protectedProcedure
    .input(z.object({ lectureId: z.string() }))
    .mutation(({ ctx, input }) =>
      lectureService.generateAndSaveSlides(input.lectureId, ctx.user.id),
    ),

  update: protectedProcedure
    .input(
      z.object({
        lectureId: z.string(),
        slideId: z.string(),
        content: slideDocumentSchema,
      }),
    )
    .mutation(({ ctx, input }) =>
      lectureService.updateSlide(
        input.lectureId,
        ctx.user.id,
        input.slideId,
        input.content,
      ),
    ),

  reorder: protectedProcedure
    .input(z.object({ lectureId: z.string(), slideIds: z.array(z.string()) }))
    .mutation(({ ctx, input }) =>
      lectureService.reorderSlides(input.lectureId, ctx.user.id, input.slideIds),
    ),
});
