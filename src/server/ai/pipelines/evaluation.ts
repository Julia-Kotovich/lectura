import { deckEvaluationSchema, type DeckEvaluation } from "@/lib/schemas/evaluation";
import { getTextProvider } from "../registry";
import { EVALUATION_SYSTEM_PROMPT, buildEvaluationUserPrompt } from "../prompts/evaluation";
import { parseWithRetry } from "./base";
import type { SlideDocument } from "@/lib/schemas/slide";

export async function evaluateDeck(params: {
  lectureTitle: string;
  slides: SlideDocument[];
}): Promise<DeckEvaluation> {
  const provider = getTextProvider();
  const slidesJson = JSON.stringify(params.slides, null, 2);
  const userPrompt = buildEvaluationUserPrompt({
    lectureTitle: params.lectureTitle,
    slidesJson,
  });

  const generateRaw = async () => {
    const result = await provider.generate({
      systemPrompt: EVALUATION_SYSTEM_PROMPT,
      userPrompt,
      temperature: 0.3,
    });
    return result.content;
  };

  const raw = await generateRaw();
  return parseWithRetry(raw, deckEvaluationSchema, generateRaw);
}
