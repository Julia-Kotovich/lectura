import type { LectureOutline } from "@/lib/schemas/outline";

/**
 * Reference lecture inside a semester **Course** (e.g. CS50 lecture 0).
 * Distinct from the user's editable `Lecture` row in the database.
 */
export type CatalogLecture = {
  slug: string;
  sourcePdf: string;
  title: string;
  summary: string;
  outline: LectureOutline;
};

/**
 * A semester-long **Course** made of multiple lecture sessions.
 * Example: CS50 — Introduction to Computer Science.
 */
export type Course = {
  slug: string;
  title: string;
  subtitle: string;
  instructor: string;
  institution: string;
  semester: string;
  sourceFolder: string;
  description: string;
  topics: string[];
  lectures: CatalogLecture[];
};

/**
 * A **ProgramModule** is one curriculum unit inside a degree **Program**
 * (handbook module, 2.5–30 ECTS). Example: MCSSE-SE-01 Quality Engineering.
 *
 * Not a full course and not necessarily one weekly lecture — it is the official
 * module students take and receive credit for.
 */
export type ProgramModule = {
  slug: string;
  code: string;
  title: string;
  summary: string;
  outline: LectureOutline;
  semester: number;
  cp: number;
  track: string;
  status: "mandatory" | "elective";
  sourcePdf: string;
  syllabusPath?: string;
};

/**
 * A full degree **Program** (e.g. MSc CSSE, 120 ECTS) composed of modules.
 */
export type Program = {
  slug: string;
  title: string;
  subtitle: string;
  coordinator: string;
  institution: string;
  cohort: string;
  ects: number;
  sourceHandbook: string;
  description: string;
  topics: string[];
  modules: ProgramModule[];
};
