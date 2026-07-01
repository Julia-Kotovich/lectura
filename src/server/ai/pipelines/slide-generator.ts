import { slideDeckDraftSchema, type SlideDeckDraft } from "@/lib/schemas/slide";
import {
  getCourseFrameworkPrompt,
  resolveCourseFrameworkSlug,
} from "@/lib/course-frameworks";
import { getSlideTextProvider } from "../registry";
import { SLIDES_SYSTEM_PROMPT, buildSlidesUserPrompt } from "../prompts/slides";
import { parseWithRetry } from "./base";
import type { LectureOutline } from "@/lib/schemas/outline";

export async function generateSlidesFromOutline(params: {
  outline: LectureOutline;
  lectureTitle: string;
}): Promise<SlideDeckDraft> {
  const provider = getSlideTextProvider();
  const frameworkSlug = resolveCourseFrameworkSlug(
    params.lectureTitle,
    params.outline.summary,
    params.outline.courseFrameworkSlug,
  );
  const frameworkPrompt = getCourseFrameworkPrompt(frameworkSlug);
  const outlineJson = JSON.stringify(params.outline, null, 2);
  const userPrompt = buildSlidesUserPrompt({
    outlineJson,
    lectureTitle: params.lectureTitle,
    targetSlideCount: params.outline.targetSlideCount,
    courseFrameworkPrompt: frameworkPrompt,
  });

  const generateRaw = async () => {
    const result = await provider.generate({
      systemPrompt: SLIDES_SYSTEM_PROMPT,
      userPrompt,
      temperature: 0.6,
      maxTokens: 8192,
    });
    return result.content;
  };

  const raw = await generateRaw();
  return parseWithRetry(raw, slideDeckDraftSchema, generateRaw);
}
