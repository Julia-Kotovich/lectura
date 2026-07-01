import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import * as lectureService from "../../services/lecture";
import { regenerateOneSlide } from "../../services/lecture-ext";

export const aiRouter = router({
  regenerateSlide: protectedProcedure
    .input(
      z.object({
        lectureId: z.string(),
        slideId: z.string(),
        instructions: z.string().optional(),
      }),
    )
    .mutation(({ ctx, input }) =>
      regenerateOneSlide(
        input.lectureId,
        ctx.user.id,
        input.slideId,
        input.instructions,
      ),
    ),

  regenerateImage: protectedProcedure
    .input(
      z.object({
        lectureId: z.string(),
        slideId: z.string(),
        blockId: z.string(),
        prompt: z.string().min(5),
      }),
    )
    .mutation(({ ctx, input }) =>
      lectureService.regenerateSlideImage(
        input.lectureId,
        ctx.user.id,
        input.slideId,
        input.blockId,
        input.prompt,
      ),
    ),
});
