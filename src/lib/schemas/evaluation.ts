import { z } from "zod";

export const evaluationDimensionSchema = z.object({
  name: z.string(),
  score: z.number().min(0).max(100),
  rationale: z.string(),
});

export const deckEvaluationSchema = z.object({
  overallScore: z.number().min(0).max(100),
  dimensions: z.array(evaluationDimensionSchema),
  strengths: z.array(z.string()),
  warnings: z.array(z.string()),
  suggestions: z.array(z.string()),
});

export type DeckEvaluation = z.infer<typeof deckEvaluationSchema>;
