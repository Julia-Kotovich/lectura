import type { BloomAnalysis, BloomSlideTag } from "@/lib/schemas/evaluation";

export function findBloomSlideTag(
  bloom: BloomAnalysis,
  slideTitle: string,
): BloomSlideTag | undefined {
  if (!bloom.slideTags?.length) return undefined;
  const norm = slideTitle.trim().toLowerCase();
  return bloom.slideTags.find((tag) => tag.slideTitle.trim().toLowerCase() === norm);
}

export function buildBloomImprovementInstructions(params: {
  bloom: BloomAnalysis;
  slideTitle: string;
  slideTag?: BloomSlideTag;
}): string {
  const { bloom, slideTitle, slideTag } = params;
  const misaligned = bloom.objectiveAlignments.filter((o) => o.status !== "aligned");

  const lines: string[] = [
    "Improve this slide using the Bloom taxonomy evaluation of the full deck.",
    "",
    `Deck alignment score: ${bloom.alignmentScore}/100. Dominant level: ${bloom.dominantLevel}.`,
    "",
    "Current deck cognitive distribution (%):",
    ...Object.entries(bloom.distribution).map(([level, pct]) => `- ${level}: ${pct}%`),
    "",
  ];

  if (bloom.gaps.length > 0) {
    lines.push("Gaps to address:", ...bloom.gaps.map((g) => `- ${g}`), "");
  }

  if (bloom.suggestions.length > 0) {
    lines.push("Suggestions:", ...bloom.suggestions.map((s) => `- ${s}`), "");
  }

  if (misaligned.length > 0) {
    lines.push("Learning objectives that need higher cognitive levels:");
    for (const item of misaligned) {
      lines.push(
        `- "${item.objective}": target ${item.expectedLevel}, observed ${item.observedLevel} — ${item.rationale}`,
      );
    }
    lines.push("");
  }

  if (slideTag) {
    lines.push(
      `This slide ("${slideTitle}") is tagged as ${slideTag.primaryLevel}: ${slideTag.evidence}`,
    );
  } else {
    lines.push(`Rewrite slide "${slideTitle}" to address the gaps and objectives above.`);
  }

  lines.push(
    "Keep the slide topic and its place in the deck. Raise cognitive demand (apply, analyze, evaluate, create) where it supports misaligned objectives.",
  );

  return lines.join("\n");
}
