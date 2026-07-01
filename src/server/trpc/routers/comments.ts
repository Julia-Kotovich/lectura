import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { addComment, listComments } from "../../services/lecture-ext";

export const commentsRouter = router({
  list: protectedProcedure
    .input(z.object({ lectureId: z.string(), slideId: z.string() }))
    .query(({ ctx, input }) =>
      listComments(input.lectureId, input.slideId, ctx.user.id),
    ),

  add: protectedProcedure
    .input(
      z.object({
        lectureId: z.string(),
        slideId: z.string(),
        body: z.string().min(1).max(2000),
      }),
    )
    .mutation(({ ctx, input }) =>
      addComment(input.lectureId, input.slideId, ctx.user.id, input.body),
    ),
});
