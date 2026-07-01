import type { LectureOutline } from "@/lib/schemas/outline";
import { OOP_BACHELOR_SLUG, OOP_TARGET_SLIDES_PER_LECTURE } from "@/lib/course-frameworks";

export const DEFAULT_TARGET_SLIDES = 10;
/** Self-study: reading, notes, light exercises per slide */
const MINUTES_PER_SLIDE_STUDY = 7;

export function enrichOutlineMetadata(outline: LectureOutline): LectureOutline {
  const frameworkDefault =
    outline.courseFrameworkSlug === OOP_BACHELOR_SLUG
      ? OOP_TARGET_SLIDES_PER_LECTURE
      : DEFAULT_TARGET_SLIDES;
  const targetSlideCount = outline.targetSlideCount ?? frameworkDefault;

  const estimatedStudyMinutes =
    outline.estimatedStudyMinutes ??
    Math.round(targetSlideCount * MINUTES_PER_SLIDE_STUDY);

  return {
    ...outline,
    targetSlideCount,
    estimatedStudyMinutes,
  };
}

export function formatStudyDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h} h ${m} min` : `${h} h`;
}
