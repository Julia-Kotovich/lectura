/** Minimal slide shape for rule-based CQI metrics (matches notebook / deck JSON). */
export type CqiSlideBlock = {
  type?: string;
  content?: unknown;
};

export type CqiSlide = {
  title?: string;
  layout?: string;
  blocks?: CqiSlideBlock[];
  speakerNotes?: string;
  metadata?: { tags?: string[] };
};

function collectStrings(value: unknown, out: string[]): void {
  if (value == null) return;
  if (typeof value === "string") {
    const t = value.trim();
    if (t) out.push(t);
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectStrings(item, out);
    return;
  }
  if (typeof value === "object") {
    for (const v of Object.values(value as Record<string, unknown>)) {
      collectStrings(v, out);
    }
  }
}

export function slideWordCount(slide: CqiSlide): number {
  const parts: string[] = [];
  if (slide.title) parts.push(slide.title);
  for (const block of slide.blocks ?? []) {
    collectStrings(block.content, parts);
  }
  return parts.join(" ").split(/\s+/).filter(Boolean).length;
}

export function isStructuralSlide(slide: CqiSlide): boolean {
  const title = (slide.title ?? "").toLowerCase();
  const layout = (slide.layout ?? "").toLowerCase();
  if (layout === "title") return true;
  return /^(title|agenda|overview|outline|recap|summary|questions|thank|welcome)/.test(title);
}

export function slideHasSpeakerNotes(slide: CqiSlide, minChars = 40): boolean {
  return (slide.speakerNotes?.trim().length ?? 0) >= minChars;
}
