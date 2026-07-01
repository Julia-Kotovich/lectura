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
}`;
}
