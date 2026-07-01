import { z } from "zod";

export const outlineSubsectionSchema = z.object({
  title: z.string(),
  keyPoints: z.array(z.string()),
  examples: z.array(z.string()).optional(),
  suggestedDiagram: z.string().optional(),
});

export const outlineSectionSchema = z.object({
  title: z.string(),
  durationMinutes: z.number().optional(),
  learningGoals: z.array(z.string()),
  subsections: z.array(outlineSubsectionSchema),
  exercises: z.array(z.string()).optional(),
});

export const lectureOutlineSchema = z.object({
  title: z.string(),
  summary: z.string(),
  learningObjectives: z.array(z.string()),
  sections: z.array(outlineSectionSchema),
  suggestedResources: z.array(z.string()).optional(),
  assessmentIdeas: z.array(z.string()).optional(),
  /** Target deck size — default ~10 slides */
  targetSlideCount: z.number().int().positive().optional(),
  /** Estimated self-study time (minutes) */
  estimatedStudyMinutes: z.number().int().positive().optional(),
  /** Estimated in-class presentation time (minutes) */
  estimatedPresentationMinutes: z.number().int().positive().optional(),
  /** Course framework used for generation (e.g. oop-bachelor) */
  courseFrameworkSlug: z.string().optional(),
  /** Week number in semester course (1–14) */
  semesterWeek: z.number().int().min(1).max(14).optional(),
});

export type LectureOutline = z.infer<typeof lectureOutlineSchema>;
export type OutlineSection = z.infer<typeof outlineSectionSchema>;
