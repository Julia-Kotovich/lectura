import {
  matchesOopCourse,
  OOP_BACHELOR_AI_FRAMEWORK,
  OOP_BACHELOR_SLUG,
  OOP_TARGET_SLIDES_PER_LECTURE,
} from "./oop-bachelor";

export {
  OOP_BACHELOR_SLUG,
  OOP_SEMESTER_WEEKS,
  OOP_LECTURE_SECTIONS,
  OOP_TARGET_SLIDES_PER_LECTURE,
} from "./oop-bachelor";

export type CourseFrameworkSlug = "default" | typeof OOP_BACHELOR_SLUG;

export function resolveCourseFrameworkSlug(
  title: string,
  description?: string | null,
  explicit?: string | null,
): CourseFrameworkSlug {
  if (explicit === OOP_BACHELOR_SLUG) return OOP_BACHELOR_SLUG;
  if (matchesOopCourse(title, description)) return OOP_BACHELOR_SLUG;
  return "default";
}

export function getCourseFrameworkPrompt(slug: CourseFrameworkSlug): string | null {
  if (slug === OOP_BACHELOR_SLUG) return OOP_BACHELOR_AI_FRAMEWORK;
  return null;
}

export function getDefaultTargetSlides(slug: CourseFrameworkSlug): number {
  if (slug === OOP_BACHELOR_SLUG) return OOP_TARGET_SLIDES_PER_LECTURE;
  return 10;
}
