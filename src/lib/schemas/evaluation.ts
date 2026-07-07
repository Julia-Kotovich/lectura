import { z } from "zod";

/** Revised Bloom's taxonomy — cognitive levels (low → high). */
export const bloomLevelSchema = z.enum([
  "remember",
  "understand",
  "apply",
  "analyze",
  "evaluate",
  "create",
]);

export type BloomLevel = z.infer<typeof bloomLevelSchema>;

export const BLOOM_LEVELS: BloomLevel[] = [
  "remember",
  "understand",
  "apply",
  "analyze",
  "evaluate",
  "create",
];

export const bloomAlignmentStatusSchema = z.enum([
  "aligned",
  "partially_aligned",
  "misaligned",
]);

export type BloomAlignmentStatus = z.infer<typeof bloomAlignmentStatusSchema>;

/**
 * Estimated share of deck cognitive demand per Bloom level (should sum to ~100).
 */
export const bloomDistributionSchema = z.object({
  remember: z.number().min(0).max(100),
  understand: z.number().min(0).max(100),
  apply: z.number().min(0).max(100),
  analyze: z.number().min(0).max(100),
  evaluate: z.number().min(0).max(100),
  create: z.number().min(0).max(100),
});

export type BloomDistribution = z.infer<typeof bloomDistributionSchema>;

/** Maps one learning objective to expected vs observed Bloom level. */
export const bloomObjectiveAlignmentSchema = z.object({
  objective: z.string(),
  expectedLevel: bloomLevelSchema,
  observedLevel: bloomLevelSchema,
  status: bloomAlignmentStatusSchema,
  rationale: z.string(),
});

export type BloomObjectiveAlignment = z.infer<typeof bloomObjectiveAlignmentSchema>;

/** Optional per-slide Bloom tagging for detailed reviews. */
export const bloomSlideTagSchema = z.object({
  slideTitle: z.string(),
  primaryLevel: bloomLevelSchema,
  evidence: z.string(),
});

export type BloomSlideTag = z.infer<typeof bloomSlideTagSchema>;

/**
 * Bloom's taxonomy evaluation for a slide deck.
 * Stored inside SlideEvaluation.feedback.bloomAnalysis in the database.
 */
export const bloomAnalysisSchema = z.object({
  /** 0–100: how well slides support stated learning objectives at the intended Bloom levels */
  alignmentScore: z.number().min(0).max(100),
  dominantLevel: bloomLevelSchema,
  distribution: bloomDistributionSchema,
  objectiveAlignments: z.array(bloomObjectiveAlignmentSchema),
  /** Slides tagged by primary cognitive level (optional, 3–8 items recommended) */
  slideTags: z.array(bloomSlideTagSchema).optional(),
  gaps: z.array(z.string()),
  suggestions: z.array(z.string()),
});

export type BloomAnalysis = z.infer<typeof bloomAnalysisSchema>;

/** Deck evaluation is Bloom-only. */
export const deckEvaluationSchema = bloomAnalysisSchema;
export type DeckEvaluation = BloomAnalysis;
