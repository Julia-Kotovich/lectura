import { z } from "zod";

export const courseFrameworkSlugSchema = z.enum(["default"]);

export const createLectureInputSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  courseFrameworkSlug: courseFrameworkSlugSchema.optional(),
  semesterWeek: z.number().int().min(1).max(52).optional(),
});

export type CreateLectureInput = z.infer<typeof createLectureInputSchema>;
