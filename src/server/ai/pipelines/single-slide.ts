import { slideDocumentSchema, type SlideDocument } from "@/lib/schemas/slide";
import { getSlideTextProvider } from "../registry";
import { SINGLE_SLIDE_SYSTEM_PROMPT, buildSingleSlideUserPrompt } from "../prompts/single-slide";
import { parseWithRetry } from "./base";
import { cacheGet, cacheSet, hashPrompt } from "@/server/cache/redis-cache";

export async function regenerateSingleSlide(params: {
  lectureTitle: string;
  outlineSummary: string;
  adjacentSlides: SlideDocument[];
  currentSlide: SlideDocument;
  instructions?: string;
}): Promise<SlideDocument> {
  const cacheKey = hashPrompt({
    type: "single-slide",
    ...params,
    currentId: params.currentSlide.id,
  });
  const cached = await cacheGet(cacheKey);
  if (cached) {
    return slideDocumentSchema.parse(JSON.parse(cached));
  }

  const provider = getSlideTextProvider();
  const userPrompt = buildSingleSlideUserPrompt({
    lectureTitle: params.lectureTitle,
    outlineSummary: params.outlineSummary,
    adjacentSlides: JSON.stringify(params.adjacentSlides, null, 2),
    currentSlide: JSON.stringify(params.currentSlide, null, 2),
    instructions: params.instructions,
  });

  const generateRaw = async () => {
    const result = await provider.generate({
      systemPrompt: SINGLE_SLIDE_SYSTEM_PROMPT,
      userPrompt,
      temperature: 0.6,
    });
    return result.content;
  };

  const raw = await generateRaw();
  const parsed = await parseWithRetry(raw, slideDocumentSchema, generateRaw);
  const slide = { ...parsed, id: params.currentSlide.id };
  await cacheSet(cacheKey, JSON.stringify(slide));
  return slide;
}
