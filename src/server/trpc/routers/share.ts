import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { shareLecture } from "../../services/lecture-ext";

export const shareRouter = router({
  invite: protectedProcedure
    .input(
      z.object({
        lectureId: z.string(),
        email: z.string().email(),
        role: z.enum(["VIEWER", "EDITOR"]),
      }),
    )
    .mutation(({ ctx, input }) =>
      shareLecture(input.lectureId, ctx.user.id, input.email, input.role),
    ),
});
