import { z } from "zod";

export const courseFrameworkSlugSchema = z.enum(["default", "oop-bachelor"]);

export const createLectureInputSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(2000).optional(),
  courseFrameworkSlug: courseFrameworkSlugSchema.optional(),
  semesterWeek: z.number().int().min(1).max(14).optional(),
});

export const updateLectureInputSchema = createLectureInputSchema
  .partial()
  .extend({ id: z.string() });

export type CreateLectureInput = z.infer<typeof createLectureInputSchema>;
export type UpdateLectureInput = z.infer<typeof updateLectureInputSchema>;
