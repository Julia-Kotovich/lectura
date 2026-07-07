import type { LectureOutline } from "@/lib/schemas/outline";
import type { CatalogLecture, Course } from "../types";
import courseData from "./data/cs50-structure.json";

/**
 * Reference course: CS50 — Introduction to Computer Science
 * Harvard University (David J. Malan et al.)
 * Source: 12 PDF lecture decks in /CS50
 *
 * Structure is auto-generated from slide titles via scripts/build-cs50-course.ts.
 * Re-run that script after updating the PDFs in CS50/.
 */

type RawLecture = {
  slug: string;
  sourcePdf: string;
  title: string;
  summary: string;
  outline: LectureOutline;
};

const lectures: CatalogLecture[] = (courseData.lectures as RawLecture[]).map((l) => ({
  slug: l.slug,
  sourcePdf: l.sourcePdf,
  title: l.title,
  summary: l.summary,
  outline: l.outline,
}));

export const CS50_HARVARD_COURSE: Course = {
  slug: courseData.slug,
  title: courseData.title,
  subtitle: courseData.subtitle,
  instructor: courseData.instructor,
  institution: courseData.institution,
  semester: courseData.semester,
  sourceFolder: courseData.sourceFolder,
  description: courseData.description,
  topics: courseData.topics,
  lectures,
};
