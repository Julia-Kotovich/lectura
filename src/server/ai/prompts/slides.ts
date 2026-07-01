export const SLIDES_SYSTEM_PROMPT = `You are an expert presentation designer for university CS lectures.
Convert lecture outlines into engaging slide decks with speaker notes.
Use concise bullet points (max 5 per slide), include code snippets when relevant.
Output ONLY valid JSON.`;

export function buildSlidesUserPrompt(params: {
  outlineJson: string;
  lectureTitle: string;
  targetSlideCount?: number;
  courseFrameworkPrompt?: string | null;
}): string {
  const target = params.targetSlideCount ?? 10;
  const frameworkBlock = params.courseFrameworkPrompt
    ? `\nCourse framework rules:\n${params.courseFrameworkPrompt}\n`
    : "";

  return `Convert this lecture outline into a slide deck for "${params.lectureTitle}".
Target ${target} slides (±2 if needed for pacing).
${frameworkBlock}
Each slide must map to a lecture section. Follow cognitive flow: conceptual → visual → code → recap.
Avoid text-heavy slides.

Outline:
${params.outlineJson}

Return JSON:
{
  "slides": [{
    "id": string (unique),
    "title": string,
    "layout": "title" | "content" | "split" | "code" | "image",
    "blocks": [{
      "id": string,
      "type": "heading" | "text" | "bullets" | "code" | "image" | "diagram" | "quote",
      "content": string | { "items"?: string[], "language"?: string, "code"?: string, "prompt"?: string }
    }],
    "speakerNotes": string,
    "metadata": { "transition"?: string, "animation"?: string, "tags"?: string[] }
  }]
}

Guidelines:
- Start with a title slide
- One main idea per content slide
- Add diagram blocks with descriptive prompts where visuals help
- Include speaker notes for teaching tips`;
}
