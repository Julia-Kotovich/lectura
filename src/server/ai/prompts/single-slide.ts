export const SINGLE_SLIDE_SYSTEM_PROMPT = `You are an expert CS lecture slide designer.
Regenerate a single slide while preserving context from the surrounding deck.
Output ONLY valid JSON for one slide object.`;

export function buildSingleSlideUserPrompt(params: {
  lectureTitle: string;
  outlineSummary: string;
  adjacentSlides: string;
  currentSlide: string;
  instructions?: string;
}): string {
  return `Lecture: ${params.lectureTitle}

Outline summary:
${params.outlineSummary}

Adjacent slides:
${params.adjacentSlides}

Current slide to regenerate:
${params.currentSlide}

${params.instructions ? `Instructions: ${params.instructions}` : ""}

Return JSON for a single slide:
{
  "id": string,
  "title": string,
  "layout": "title" | "content" | "split" | "code" | "image",
  "blocks": [{ "id": string, "type": string, "content": string | object }],
  "speakerNotes": string,
  "metadata": {}
}

Size limits (STRICT — oversized responses get truncated and break JSON parsing):
- At most 4 blocks total; at most 1 activity block
- speakerNotes: max ~150 words (plain prose, no headings or timelines)
- Each activity explanation: max ~80 words
- Keep the whole JSON response under 4000 characters`;
}
