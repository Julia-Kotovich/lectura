import { COOP_ETH_MUELLER_COURSE, type Course } from "./coop-eth-mueller";
import { CS50_HARVARD_COURSE } from "./cs50-harvard";

export const COURSES: Course[] = [CS50_HARVARD_COURSE, COOP_ETH_MUELLER_COURSE];

export function listCourses() {
  return COURSES.map((c) => ({
    slug: c.slug,
    title: c.title,
    subtitle: c.subtitle,
    instructor: c.instructor,
    institution: c.institution,
    semester: c.semester,
    description: c.description,
    topics: c.topics,
    lectureCount: c.lectures.length,
  }));
}

export function getCourse(slug: string): Course | null {
  return COURSES.find((c) => c.slug === slug) ?? null;
}

export type { Course } from "./coop-eth-mueller";
export { COOP_ETH_MUELLER_COURSE } from "./coop-eth-mueller";
export { CS50_HARVARD_COURSE } from "./cs50-harvard";
