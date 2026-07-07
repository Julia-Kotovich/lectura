import { CS50_HARVARD_COURSE } from "./courses/cs50-harvard";
import { CSSE_CONSTRUCTOR_MSC_PROGRAM } from "./programs/csse-constructor-msc";

export type { CatalogLecture, Course, Program, ProgramModule } from "./types";

export { CS50_HARVARD_COURSE } from "./courses/cs50-harvard";
export { CSSE_CONSTRUCTOR_MSC_PROGRAM } from "./programs/csse-constructor-msc";

const COURSES = [CS50_HARVARD_COURSE];
const PROGRAMS = [CSSE_CONSTRUCTOR_MSC_PROGRAM];

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

export function getCourse(slug: string) {
  return COURSES.find((c) => c.slug === slug) ?? null;
}

export function listPrograms() {
  return PROGRAMS.map((p) => ({
    slug: p.slug,
    title: p.title,
    subtitle: p.subtitle,
    coordinator: p.coordinator,
    institution: p.institution,
    cohort: p.cohort,
    ects: p.ects,
    description: p.description,
    topics: p.topics,
    moduleCount: p.modules.length,
  }));
}

export function getProgram(slug: string) {
  return PROGRAMS.find((p) => p.slug === slug) ?? null;
}
