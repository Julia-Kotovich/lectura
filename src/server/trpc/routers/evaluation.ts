import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import * as lectureService from "../../services/lecture";

export const evaluationRouter = router({
  evaluateDeck: protectedProcedure
    .input(z.object({ lectureId: z.string() }))
    .mutation(({ ctx, input }) =>
      lectureService.evaluateLectureDeck(input.lectureId, ctx.user.id),
    ),
});
