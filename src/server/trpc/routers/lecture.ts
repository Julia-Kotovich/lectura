import { z } from "zod";
import { createLectureInputSchema } from "@/lib/schemas/lecture";
import { router, protectedProcedure } from "../trpc";
import * as lectureService from "../../services/lecture";
import { getLectureFolderPath } from "../../storage/lecture-files";

export const lectureRouter = router({
  create: protectedProcedure
    .input(createLectureInputSchema)
    .mutation(({ ctx, input }) => lectureService.createLecture(ctx.user.id, input)),

  list: protectedProcedure.query(({ ctx }) => lectureService.listLectures(ctx.user.id)),

  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const lecture = await lectureService.getLecture(ctx.user.id, input.id);
      if (!lecture) return null;
      return {
        ...lecture,
        storageFolder: getLectureFolderPath(lecture.id, lecture.title),
      };
    }),
});
