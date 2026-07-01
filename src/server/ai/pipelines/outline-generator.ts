import { lectureOutlineSchema, type LectureOutline } from "@/lib/schemas/outline";
import { enrichOutlineMetadata } from "@/lib/lecture-timing";
import {
  getCourseFrameworkPrompt,
  getDefaultTargetSlides,
  resolveCourseFrameworkSlug,
  type CourseFrameworkSlug,
} from "@/lib/course-frameworks";
import { cacheGet, cacheSet, hashPrompt } from "@/server/cache/redis-cache";
import { getTextProvider } from "../registry";
import { OUTLINE_SYSTEM_PROMPT, buildOutlineUserPrompt } from "../prompts/outline";
import { parseWithRetry } from "./base";

export async function generateOutline(params: {
  title: string;
  description?: string;
  courseFrameworkSlug?: CourseFrameworkSlug | string | null;
  semesterWeek?: number;
}): Promise<LectureOutline> {
  const frameworkSlug = resolveCourseFrameworkSlug(
    params.title,
    params.description,
    params.courseFrameworkSlug,
  );
  const frameworkPrompt = getCourseFrameworkPrompt(frameworkSlug);
  const targetSlideCount = getDefaultTargetSlides(frameworkSlug);

  const cacheKey = hashPrompt({ type: "outline", frameworkSlug, ...params });
  const cached = await cacheGet(cacheKey);
  if (cached) {
    const parsed = lectureOutlineSchema.parse(JSON.parse(cached));
    return enrichOutlineMetadata(parsed);
  }

  const provider = getTextProvider();
  const userPrompt = buildOutlineUserPrompt({
    title: params.title,
    description: params.description,
    targetSlideCount,
    courseFrameworkPrompt: frameworkPrompt,
    semesterWeek: params.semesterWeek,
  });

  const generateRaw = async () => {
    const result = await provider.generate({
      systemPrompt: OUTLINE_SYSTEM_PROMPT,
      userPrompt,
      temperature: 0.5,
    });
    return result.content;
  };

  const raw = await generateRaw();
  const parsed = await parseWithRetry(raw, lectureOutlineSchema, generateRaw);
  const withMeta = enrichOutlineMetadata({
    ...parsed,
    courseFrameworkSlug: frameworkSlug === "default" ? undefined : frameworkSlug,
    semesterWeek: params.semesterWeek ?? parsed.semesterWeek,
    targetSlideCount: parsed.targetSlideCount ?? targetSlideCount,
  });
  await cacheSet(cacheKey, JSON.stringify(withMeta));
  return withMeta;
}
