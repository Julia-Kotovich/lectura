import {
  BLOOM_LEVELS,
  type BloomAnalysis,
  type BloomLevel,
} from "@/lib/schemas/evaluation";
import type { SlideDocument } from "@/lib/schemas/slide";
import { findBloomSlideTag } from "@/server/ai/prompts/bloom-improvement";

/** Stop improving once alignment reaches this score. */
export const BLOOM_TARGET_SCORE = 95;

/** Max Improve runs per lecture (prevents endless loops). */
export const BLOOM_MAX_IMPROVE_ROUNDS = 3;

/** Cap how many slides one Improve pass regenerates. */
export const BLOOM_MAX_PROBLEM_SLIDES = 8;

const LOW_LEVELS: BloomLevel[] = ["remember", "understand"];

function levelRank(level: BloomLevel): number {
  return BLOOM_LEVELS.indexOf(level);
}

function norm(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

function textMentionsSlide(haystack: string, slideTitle: string): boolean {
  const title = norm(slideTitle);
  if (title.length < 3) return false;
  if (haystack.includes(title)) return true;
  const tokens = title.split(" ").filter((t) => t.length > 4);
  return tokens.length > 0 && tokens.filter((t) => haystack.includes(t)).length >= Math.ceil(tokens.length / 2);
}

/**
 * Pick slides that most need Bloom improvement — cheaper than regenerating the whole deck.
 */
export function selectProblemSlides(
  bloom: BloomAnalysis,
  slides: SlideDocument[],
): { slides: SlideDocument[]; reasons: Record<string, string> } {
  if (slides.length === 0) return { slides: [], reasons: {} };

  const misaligned = bloom.objectiveAlignments.filter((o) => o.status !== "aligned");
  const feedbackText = norm(
    [...bloom.gaps, ...bloom.suggestions, ...misaligned.map((o) => `${o.objective} ${o.rationale}`)].join(
      "\n",
    ),
  );
  const highestExpected = misaligned.reduce(
    (max, o) => Math.max(max, levelRank(o.expectedLevel)),
    0,
  );

  const scored = slides.map((slide, index) => {
    let score = 0;
    const notes: string[] = [];
    const tag = findBloomSlideTag(bloom, slide.title);

    if (textMentionsSlide(feedbackText, slide.title)) {
      score += 40;
      notes.push("mentioned in Bloom gaps/suggestions");
    }

    if (tag && LOW_LEVELS.includes(tag.primaryLevel) && highestExpected >= levelRank("apply")) {
      score += 30;
      notes.push(`tagged ${tag.primaryLevel}, objectives need higher levels`);
    }

    if (tag && misaligned.some((o) => levelRank(tag.primaryLevel) < levelRank(o.expectedLevel))) {
      score += 20;
      notes.push("slide level below a misaligned objective");
    }

    // Prefer middle content over title/agenda/recap when nothing else matches.
    const titleNorm = norm(slide.title);
    if (/^(title|agenda|overview|outline|recap|summary|questions|thank)/.test(titleNorm)) {
      score -= 15;
    } else if (index > 0 && index < slides.length - 1) {
      score += 5;
    }

    if (misaligned.length > 0 && score === 0 && tag && LOW_LEVELS.includes(tag.primaryLevel)) {
      score += 10;
      notes.push("low-level tag fallback");
    }

    return { slide, score, reason: notes.join("; ") || "content candidate" };
  });

  scored.sort((a, b) => b.score - a.score);

  let selected = scored.filter((s) => s.score > 0).slice(0, BLOOM_MAX_PROBLEM_SLIDES);

  // Fallback: if heuristics found nothing, improve a small mid-deck window.
  if (selected.length === 0 && misaligned.length + bloom.gaps.length > 0) {
    const mid = slides.slice(1, Math.max(slides.length - 1, 2));
    selected = mid.slice(0, Math.min(3, BLOOM_MAX_PROBLEM_SLIDES)).map((slide) => ({
      slide,
      score: 1,
      reason: "fallback mid-deck slides for remaining gaps",
    }));
  }

  const reasons: Record<string, string> = {};
  for (const item of selected) {
    reasons[item.slide.id] = item.reason;
  }

  return { slides: selected.map((s) => s.slide), reasons };
}
