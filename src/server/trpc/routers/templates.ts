import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { createFromTemplate, listTemplates } from "../../services/lecture-ext";

export const templatesRouter = router({
  list: protectedProcedure.query(() => listTemplates()),

  createLecture: protectedProcedure
    .input(
      z.object({
        templateSlug: z.string(),
        title: z.string().optional(),
      }),
    )
    .mutation(({ ctx, input }) =>
      createFromTemplate(ctx.user.id, input.templateSlug, input.title),
    ),
});
