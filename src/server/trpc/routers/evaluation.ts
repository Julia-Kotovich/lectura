import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import * as lectureService from "../../services/lecture";
import { improveDeckFromBloom } from "../../services/lecture-ext";

export const evaluationRouter = router({
  evaluateDeck: protectedProcedure
    .input(z.object({ lectureId: z.string() }))
    .mutation(({ ctx, input }) =>
      lectureService.evaluateLectureDeck(input.lectureId, ctx.user.id),
    ),

  improveDeckFromBloom: protectedProcedure
    .input(z.object({ lectureId: z.string() }))
    .mutation(({ ctx, input }) =>
      improveDeckFromBloom(input.lectureId, ctx.user.id),
    ),
});
