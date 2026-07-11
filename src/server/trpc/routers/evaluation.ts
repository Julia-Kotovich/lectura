import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import * as lectureService from "../../services/lecture";
import {
  getBloomImproveProgress,
  improveAndReevaluateFromBloom,
  listBloomEvaluations,
} from "../../services/bloom-improve";

export const evaluationRouter = router({
  evaluateDeck: protectedProcedure
    .input(z.object({ lectureId: z.string() }))
    .mutation(({ ctx, input }) =>
      lectureService.evaluateLectureDeck(input.lectureId, ctx.user.id),
    ),

  listBloomHistory: protectedProcedure
    .input(z.object({ lectureId: z.string() }))
    .query(({ ctx, input }) => listBloomEvaluations(input.lectureId, ctx.user.id)),

  getImproveProgress: protectedProcedure
    .input(z.object({ lectureId: z.string() }))
    .query(({ ctx, input }) => getBloomImproveProgress(input.lectureId, ctx.user.id)),

  /** Targeted Improve + optional re-evaluate (default true). */
  improveAndReevaluate: protectedProcedure
    .input(
      z.object({
        lectureId: z.string(),
        reevaluate: z.boolean().optional(),
      }),
    )
    .mutation(({ ctx, input }) =>
      improveAndReevaluateFromBloom(input.lectureId, ctx.user.id, {
        reevaluate: input.reevaluate,
      }),
    ),

  /** Improve problem slides only (no automatic re-evaluate). */
  improveDeckFromBloom: protectedProcedure
    .input(z.object({ lectureId: z.string() }))
    .mutation(({ ctx, input }) =>
      improveAndReevaluateFromBloom(input.lectureId, ctx.user.id, { reevaluate: false }),
    ),
});
