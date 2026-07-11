import { deckEvaluationSchema, type DeckEvaluation } from "@/lib/schemas/evaluation";
import { getTextProvider } from "../registry";
import { EVALUATION_SYSTEM_PROMPT, buildEvaluationUserPrompt } from "../prompts/evaluation";
import { parseWithRetry } from "./base";
import type { SlideDocument } from "@/lib/schemas/slide";

/** Compact slide payload so evaluation JSON is less likely to truncate. */
function compactSlidesForEvaluation(slides: SlideDocument[]) {
  return slides.map((slide, index) => ({
    index: index + 1,
    title: slide.title,
    layout: slide.layout,
    bullets: slide.blocks.flatMap((block) => {
      if (block.type === "heading" && typeof block.content === "string") {
        return [block.content];
      }
      if (block.type === "text" && typeof block.content === "string") {
        return [block.content.slice(0, 220)];
      }
      if (
        block.type === "bullets" &&
        typeof block.content === "object" &&
        Array.isArray(block.content.items)
      ) {
        return block.content.items.slice(0, 8);
      }
      if (block.type === "code") return ["[code block]"];
      if (block.type === "diagram" || block.type === "image") return [`[${block.type}]`];
      return [];
    }).slice(0, 12),
  }));
}

export async function evaluateDeck(params: {
  lectureTitle: string;
  slides: SlideDocument[];
  learningObjectives?: string[];
}): Promise<DeckEvaluation> {
  const provider = getTextProvider();
  const slidesJson = JSON.stringify(compactSlidesForEvaluation(params.slides), null, 2);
  const userPrompt = buildEvaluationUserPrompt({
    lectureTitle: params.lectureTitle,
    slidesJson,
    learningObjectives: params.learningObjectives,
  });

  const generateRaw = async () => {
    const result = await provider.generate({
      systemPrompt: EVALUATION_SYSTEM_PROMPT,
      userPrompt,
      temperature: 0.2,
      maxTokens: 4096,
    });
    return result.content;
  };

  const raw = await generateRaw();
  return parseWithRetry(raw, deckEvaluationSchema, generateRaw);
}
