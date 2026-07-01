/**
 * Parse CS50 lecture PDFs → course-structure.json + course-plan.pdf
 *
 * Usage:  npx tsx scripts/build-cs50-course.ts
 */

import { createWriteStream, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import PDFDocument from "pdfkit";
import {
  groupSlidesIntoSections,
  parsePdfFile,
  uniqueSlideTitles,
  type ParsedLectureFile,
} from "./lib/cs50-pdf-parser";

const SOURCE_FOLDER = join(process.cwd(), "CS50");
const JSON_OUT = join(process.cwd(), "src/lib/courses/data/cs50-structure.json");
const PDF_OUT = join(SOURCE_FOLDER, "course-plan.pdf");

const LECTURES = [
  { file: "lecture0.pdf", week: 0, topic: "Scratch", slug: "week-0-scratch" },
  { file: "lecture1.pdf", week: 1, topic: "C", slug: "week-1-c" },
  { file: "lecture2.pdf", week: 2, topic: "Arrays", slug: "week-2-arrays" },
  { file: "lecture3.pdf", week: 3, topic: "Algorithms", slug: "week-3-algorithms" },
  { file: "lecture4.pdf", week: 4, topic: "Memory", slug: "week-4-memory" },
  { file: "lecture5.pdf", week: 5, topic: "Data Structures", slug: "week-5-data-structures" },
  { file: "lecture6.pdf", week: 6, topic: "Python", slug: "week-6-python" },
  { file: "lecture7.pdf", week: 7, topic: "SQL", slug: "week-7-sql" },
  { file: "lecture8.pdf", week: 8, topic: "HTML, CSS, JavaScript", slug: "week-8-web" },
  { file: "lecture9.pdf", week: 9, topic: "Flask", slug: "week-9-flask" },
  { file: "lecture10.pdf", week: 10, topic: "The End", slug: "week-10-the-end" },
  { file: "ai.pdf", week: 11, topic: "Artificial Intelligence", slug: "week-11-ai" },
] as const;

const LECTURE_SUMMARIES: Record<string, string> = {
  "week-0-scratch":
    "Computational thinking, binary and ASCII, algorithms and pseudocode, then Scratch as a visual introduction to programming concepts.",
  "week-1-c":
    "From source code to machine code, the CS50 toolset, hello world in C, functions, variables, conditionals, loops, and Linux basics.",
  "week-2-arrays":
    "Strings as arrays of characters, cryptography, debugging, compiling, command-line arguments, and more C practice.",
  "week-3-algorithms":
    "Searching (linear and binary), sorting, running time, and asymptotic notation (O, Ω, Θ).",
  "week-4-memory":
    "Hexadecimal, pointers, strings, malloc/free, garbage collection, and common memory bugs.",
  "week-5-data-structures":
    "Linked lists, hash tables, tries, queues, stacks, and trade-offs among data structures.",
  "week-6-python":
    "Transition from C to Python: syntax, libraries, and solving familiar problems with higher-level abstractions.",
  "week-7-sql":
    "Relational databases, SQL queries, keys, indexes, and designing schemas.",
  "week-8-web":
    "The internet stack, HTTP, HTML, CSS, JavaScript, and the DOM.",
  "week-9-flask":
    "Server-side web programming with Flask, routes, templates, sessions, and a capstone web app.",
  "week-10-the-end":
    "Cybersecurity, encryption, hashing, and course wrap-up.",
  "week-11-ai":
    "Introduction to artificial intelligence, machine learning, neural networks, and ethical considerations.",
};

function buildOutline(lecture: ParsedLectureFile, slug: string) {
  const sections = groupSlidesIntoSections(lecture.slides);

  return {
    title: `Week ${lecture.week} — ${lecture.topic}`,
    summary: LECTURE_SUMMARIES[slug] ?? `CS50 lecture on ${lecture.topic}.`,
    learningObjectives: sections
      .filter((s) => s.title !== "Introduction" && s.slides.length > 0)
      .slice(0, 5)
      .map((s) => `Explain key ideas around "${s.title}"`),
    targetSlideCount: lecture.pages,
    estimatedStudyMinutes: lecture.slides.length * 5,
    semesterWeek: lecture.week + 1,
    sections: sections.map((sec) => {
      const titles = uniqueSlideTitles(sec.slides);
      return {
        title: sec.title,
        learningGoals: [`Cover ${sec.title}`],
        subsections: titles.map((t) => ({
          title: t,
          keyPoints: [t],
        })),
      };
    }),
    suggestedResources: [
      "CS50 lecture slides (Harvard)",
      "cs50.harvard.edu — course materials and problem sets",
    ],
    assessmentIdeas: ["Problem set for the week", "Short quiz on key concepts"],
  };
}

function renderPdf(lectures: ParsedLectureFile[]) {
  const doc = new PDFDocument({
    size: "A4",
    margin: 56,
    info: {
      Title: "CS50 — Course Plan (from slides)",
      Author: "Auto-generated from CS50 lecture decks",
      Subject: "Harvard CS50 — Introduction to Computer Science",
    },
  });
  doc.pipe(createWriteStream(PDF_OUT));
  doc.font("Helvetica");

  doc.font("Helvetica-Bold").fontSize(22).text("CS50: Introduction to Computer Science");
  doc.moveDown(0.3);
  doc.font("Helvetica").fontSize(13).fillColor("#444").text("Course plan reconstructed from lecture slides");
  doc.moveDown(0.6);
  doc.fillColor("#222").fontSize(11);
  doc.text("Institution: Harvard University — CS50");
  doc.text(`Source folder: CS50/ (${lectures.length} PDFs)`);
  doc.text(`Generated: ${new Date().toISOString().slice(0, 10)}`);
  doc.moveDown(1);

  doc.font("Helvetica-Bold").fontSize(14).text("Lectures");
  doc.moveDown(0.4);
  doc.font("Helvetica").fontSize(11);
  for (const lec of lectures) {
    doc.text(`Week ${lec.week} — ${lec.topic}`, { continued: true });
    doc.fillColor("#666").text(`   — ${lec.pages} slides   (${lec.file})`);
    doc.fillColor("#000");
  }

  for (const lec of lectures) {
    doc.addPage();
    doc.font("Helvetica-Bold").fontSize(18).text(`Week ${lec.week} — ${lec.topic}`);
    doc.moveDown(0.2);
    doc.font("Helvetica").fontSize(10).fillColor("#666");
    doc.text(`Source: ${lec.file}   ·   ${lec.pages} pages   ·   ${lec.slides.length} titled slides`);
    doc.fillColor("#000");
    doc.moveDown(0.5);

    const sections = groupSlidesIntoSections(lec.slides);
    for (const sec of sections) {
      doc.moveDown(0.3);
      doc.font("Helvetica-Bold").fontSize(12).fillColor("#1d4ed8").text(sec.title);
      doc.fillColor("#000");
      doc.font("Helvetica").fontSize(9.5);
      const titles = uniqueSlideTitles(sec.slides);
      for (const t of titles) {
        doc.text(`  •  ${t}`, { indent: 6, lineGap: 1 });
      }
    }
  }

  doc.end();
}

async function main() {
  console.log(`Parsing ${LECTURES.length} PDFs from ${SOURCE_FOLDER} ...`);
  const parsed: ParsedLectureFile[] = [];
  const courseLectures = [];

  for (const meta of LECTURES) {
    process.stdout.write(`  · ${meta.file} ... `);
    const lec = await parsePdfFile(SOURCE_FOLDER, meta.file, meta.week, meta.topic);
    const outline = buildOutline(lec, meta.slug);
    console.log(`${lec.pages} pages, ${lec.slides.length} titles, ${outline.sections.length} sections`);
    parsed.push(lec);
    courseLectures.push({
      slug: meta.slug,
      sourcePdf: meta.file,
      title: outline.title,
      summary: outline.summary,
      outline,
    });
  }

  const course = {
    slug: "cs50-harvard",
    title: "CS50: Introduction to Computer Science",
    subtitle: "Harvard's flagship intro CS course — from Scratch to AI",
    instructor: "David J. Malan and CS50 staff",
    institution: "Harvard University — School of Engineering and Applied Sciences",
    semester: "CS50 (ongoing)",
    sourceFolder: "CS50",
    description:
      "CS50 is Harvard's introduction to computer science and the art of programming. " +
      "The course covers computational thinking, C, data structures, algorithms, Python, SQL, " +
      "web development, and artificial intelligence — with problem sets that build real skills week by week.",
    topics: [
      "Computational thinking and Scratch",
      "Programming in C (types, memory, pointers)",
      "Arrays, strings, and cryptography",
      "Algorithms and asymptotic notation",
      "Data structures (linked lists, hash tables, tries)",
      "Python, SQL, and web programming (HTML/CSS/JS, Flask)",
      "Cybersecurity and artificial intelligence",
    ],
    lectures: courseLectures,
  };

  mkdirSync(join(process.cwd(), "src/lib/courses/data"), { recursive: true });
  writeFileSync(JSON_OUT, JSON.stringify(course, null, 2));
  console.log(`Wrote ${JSON_OUT}`);

  console.log(`Rendering ${PDF_OUT} ...`);
  renderPdf(parsed);
  await new Promise((r) => setTimeout(r, 400));
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
