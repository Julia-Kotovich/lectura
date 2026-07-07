export type CourseFrameworkSlug = "default";

export function resolveCourseFrameworkSlug(
  _title: string,
  _description?: string | null,
  explicit?: string | null,
): CourseFrameworkSlug {
  return explicit === "default" || !explicit ? "default" : "default";
}

export function getCourseFrameworkPrompt(_slug: CourseFrameworkSlug): string | null {
  return null;
}

export function getDefaultTargetSlides(_slug: CourseFrameworkSlug): number {
  return 10;
}
