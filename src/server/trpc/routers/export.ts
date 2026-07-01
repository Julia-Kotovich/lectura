import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { getExportBuffer } from "../../services/lecture-ext";

export const exportRouter = router({
  getPptxBase64: protectedProcedure
    .input(z.object({ lectureId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { buffer, filename } = await getExportBuffer(
        input.lectureId,
        ctx.user.id,
      );
      return {
        filename,
        data: buffer.toString("base64"),
        mimeType:
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      };
    }),
});
