import { type CqiSlide, isStructuralSlide, slideHasSpeakerNotes, slideWordCount } from "./slide-text";

/** CQI v1 — Constructive Alignment Index (Variant A). Keep in sync with course-generation-algorithm.ipynb Step 5. */

export const CQI_V1_VERSION = "1.0";

export const CQI_LRS_WEIGHTS = {
  bloomAlignment: 0.35,
  objectiveCoverage: 0.25,
  topicCoverage: 0.2,
  activeLearningRatio: 0.1,
  deliveryQuality: 0.1,
} as const;

export const CQI_COURSE_WEIGHTS = {
  meanLectureReadiness: 0.6,
  syllabusCoverage: 0.15,
  progressionCoherence: 0.15,
  nonRedundancy: 0.1,
} as const;

export type CqiLevel = "excellent" | "good" | "adequate" | "needs_redesign";

export type CqiLectureMetrics = {
  version: typeof CQI_V1_VERSION;
  bloomAlignment: number;
  objectiveCoverage: number;
  topicCoverage: number;
  activeLearningRatio: number;
  deliveryQuality: number;
  lectureReadinessScore: number;
  level: CqiLevel;
  details?: {
    missingObjectives?: string[];
    missingTopics?: string[];
    activeSlideCount?: number;
    contentSlideCount?: number;
    avgWordsPerSlide?: number;
    notesCoveragePct?: number;
  };
};

export type CqiCourseMetrics = {
  version: typeof CQI_V1_VERSION;
  courseQualityIndex: number;
  level: CqiLevel;
  meanLectureReadiness: number;
  syllabusCoverage: number;
  progressionCoherence: number;
  redundancyPenalty: number;
  lectureScores: Array<{ number: number; title: string; lrs: number; level: CqiLevel }>;
};

export function interpretCqiScore(score: number): CqiLevel {
  if (score >= 85) return "excellent";
  if (score >= 70) return "good";
  if (score >= 55) return "adequate";
  return "needs_redesign";
}

export function cqiLevelLabel(level: CqiLevel): string {
  switch (level) {
    case "excellent":
      return "Excellent";
    case "good":
      return "Good";
    case "adequate":
      return "Adequate";
    case "needs_redesign":
      return "Needs redesign";
  }
}

/** Rule-based delivery quality proxy (no LLM). */
export function computeDeliveryQualityProxy(slides: CqiSlide[]): {
  score: number;
  avgWordsPerSlide: number;
  notesCoveragePct: number;
} {
  if (slides.length === 0) {
    return { score: 0, avgWordsPerSlide: 0, notesCoveragePct: 0 };
  }

  const contentSlides = slides.filter((s) => !isStructuralSlide(s));
  const wordCounts = contentSlides.map(slideWordCount);
  const avgWords =
    wordCounts.length > 0
      ? wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length
      : 0;

  const withNotes = slides.filter((s) => slideHasSpeakerNotes(s)).length;
  const notesCoveragePct = Math.round((withNotes / slides.length) * 100);

  let score = 100;
  if (avgWords > 120) score -= 30;
  else if (avgWords > 80) score -= 15;

  if (notesCoveragePct < 50) score -= 20;
  else if (notesCoveragePct < 70) score -= 10;

  const heavySlides = wordCounts.filter((w) => w > 200).length;
  score -= Math.min(20, heavySlides * 5);

  return {
    score: Math.max(0, Math.min(100, Math.round(score))),
    avgWordsPerSlide: Math.round(avgWords),
    notesCoveragePct,
  };
}

export function computeLectureReadinessScore(metrics: {
  bloomAlignment: number;
  objectiveCoverage: number;
  topicCoverage: number;
  activeLearningRatio: number;
  deliveryQuality: number;
}): number {
  const w = CQI_LRS_WEIGHTS;
  const raw =
    w.bloomAlignment * metrics.bloomAlignment +
    w.objectiveCoverage * metrics.objectiveCoverage +
    w.topicCoverage * metrics.topicCoverage +
    w.activeLearningRatio * metrics.activeLearningRatio +
    w.deliveryQuality * metrics.deliveryQuality;
  return Math.round(Math.max(0, Math.min(100, raw)));
}

export function buildLectureCqiMetrics(input: {
  bloomAlignment: number;
  objectiveCoverage: number;
  topicCoverage: number;
  activeLearningRatio: number;
  deliveryQuality: number;
  details?: CqiLectureMetrics["details"];
}): CqiLectureMetrics {
  const lectureReadinessScore = computeLectureReadinessScore(input);
  return {
    version: CQI_V1_VERSION,
    bloomAlignment: input.bloomAlignment,
    objectiveCoverage: input.objectiveCoverage,
    topicCoverage: input.topicCoverage,
    activeLearningRatio: input.activeLearningRatio,
    deliveryQuality: input.deliveryQuality,
    lectureReadinessScore,
    level: interpretCqiScore(lectureReadinessScore),
    details: input.details,
  };
}

function normTokenSet(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((t) => t.length > 3),
  );
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 0;
  let inter = 0;
  for (const t of a) if (b.has(t)) inter++;
  const union = a.size + b.size - inter;
  return union === 0 ? 0 : inter / union;
}

/** Unique planned topics covered across processed lectures / all plan topics. */
export function computeSyllabusCoverage(
  planTopics: string[],
  coveredTopics: string[],
): number {
  if (planTopics.length === 0) return 100;
  const coveredNorm = coveredTopics.map((t) => t.toLowerCase());
  let hit = 0;
  for (const topic of planTopics) {
    const t = topic.toLowerCase();
    if (coveredNorm.some((c) => c.includes(t) || t.includes(c))) hit++;
  }
  return Math.round((hit / planTopics.length) * 100);
}

/** Penalize large Bloom score drops between consecutive lectures. */
export function computeProgressionCoherence(bloomScores: number[]): number {
  if (bloomScores.length <= 1) return 100;
  let penalty = 0;
  for (let i = 1; i < bloomScores.length; i++) {
    const drop = bloomScores[i - 1]! - bloomScores[i]!;
    if (drop > 15) penalty += 10;
    else if (drop > 8) penalty += 5;
  }
  return Math.max(0, 100 - penalty);
}

/** Average max title-similarity between lecture pairs (higher = more redundant). */
export function computeRedundancyPenalty(
  lectureTitles: string[],
): number {
  if (lectureTitles.length <= 1) return 0;
  const sets = lectureTitles.map((t) => normTokenSet(t));
  let sum = 0;
  let pairs = 0;
  for (let i = 0; i < sets.length; i++) {
    let maxSim = 0;
    for (let j = 0; j < sets.length; j++) {
      if (i === j) continue;
      maxSim = Math.max(maxSim, jaccard(sets[i]!, sets[j]!));
    }
    sum += maxSim;
    pairs++;
  }
  return Math.round((sum / pairs) * 100);
}

export function computeCourseQualityIndex(input: {
  lectureReadinessScores: number[];
  syllabusCoverage: number;
  progressionCoherence: number;
  redundancyPenalty: number;
}): number {
  const meanLrs =
    input.lectureReadinessScores.length > 0
      ? input.lectureReadinessScores.reduce((a, b) => a + b, 0) /
        input.lectureReadinessScores.length
      : 0;
  const w = CQI_COURSE_WEIGHTS;
  const raw =
    w.meanLectureReadiness * meanLrs +
    w.syllabusCoverage * input.syllabusCoverage +
    w.progressionCoherence * input.progressionCoherence +
    w.nonRedundancy * (100 - input.redundancyPenalty);
  return Math.round(Math.max(0, Math.min(100, raw)));
}

export function buildCourseCqiMetrics(input: {
  lectures: Array<{ number: number; title: string; metrics: CqiLectureMetrics }>;
  planTopics: string[];
  coveredTopics: string[];
}): CqiCourseMetrics {
  const lectureScores = input.lectures.map((l) => ({
    number: l.number,
    title: l.title,
    lrs: l.metrics.lectureReadinessScore,
    level: l.metrics.level,
  }));
  const lrsList = lectureScores.map((l) => l.lrs);
  const bloomList = input.lectures.map((l) => l.metrics.bloomAlignment);
  const syllabusCoverage = computeSyllabusCoverage(input.planTopics, input.coveredTopics);
  const progressionCoherence = computeProgressionCoherence(bloomList);
  const redundancyPenalty = computeRedundancyPenalty(input.lectures.map((l) => l.title));
  const courseQualityIndex = computeCourseQualityIndex({
    lectureReadinessScores: lrsList,
    syllabusCoverage,
    progressionCoherence,
    redundancyPenalty,
  });

  return {
    version: CQI_V1_VERSION,
    courseQualityIndex,
    level: interpretCqiScore(courseQualityIndex),
    meanLectureReadiness: Math.round(
      lrsList.length ? lrsList.reduce((a, b) => a + b, 0) / lrsList.length : 0,
    ),
    syllabusCoverage,
    progressionCoherence,
    redundancyPenalty,
    lectureScores,
  };
}
