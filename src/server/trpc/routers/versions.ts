import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import {
  listDeckVersions,
  restoreDeckVersion,
  saveDeckSnapshot,
} from "../../services/lecture-ext";

export const versionsRouter = router({
  listDeck: protectedProcedure
    .input(z.object({ lectureId: z.string() }))
    .query(({ ctx, input }) => listDeckVersions(input.lectureId, ctx.user.id)),

  saveDeck: protectedProcedure
    .input(z.object({ lectureId: z.string() }))
    .mutation(({ ctx, input }) => saveDeckSnapshot(input.lectureId, ctx.user.id)),

  restoreDeck: protectedProcedure
    .input(z.object({ lectureId: z.string(), versionId: z.string() }))
    .mutation(({ ctx, input }) =>
      restoreDeckVersion(input.lectureId, ctx.user.id, input.versionId),
    ),
});
