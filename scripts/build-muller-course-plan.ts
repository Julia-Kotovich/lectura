/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Build a course plan PDF for Prof. Peter Müller's "Concepts of OOP" lectures.
 *
 * Uses pdfjs-dist to read each PDF page with full layout information (text +
 * coordinates + font size). For every slide it identifies:
 *
 *   - the title (the largest-font line in the top half of the page)
 *   - the section path from the footer line (~y=517), e.g. "1.2 Introduction – Core Concepts"
 *
 * It then renders a clean structural plan into OOP_Peter_Muller/course-plan.pdf
 * that mirrors Müller's own section structure (X.Y) and lists every slide title
 * in order.
 *
 * Usage:  npx tsx scripts/build-muller-course-plan.ts
 */

import { readFileSync, createWriteStream } from "node:fs";
import { join } from "node:path";
import PDFDocument from "pdfkit";

const SOURCE_FOLDER = join(process.cwd(), "OOP_Peter_Muller");
const OUTPUT_FILE = join(SOURCE_FOLDER, "course-plan.pdf");

interface LectureSource {
  num: number;
  file: string;
  title: string;
}

const LECTURES: LectureSource[] = [
  { num: 1, file: "lecture_01_introduction.pdf", title: "1. Introduction" },
  { num: 2, file: "lecture_02_subtyping.pdf", title: "2. Types and Subtyping" },
  { num: 3, file: "lecture_03_inheritance.pdf", title: "3. Inheritance" },
  { num: 4, file: "lecture_04-types.pdf", title: "4. Types" },
  { num: 5, file: "lecture_05_object_structures.pdf", title: "5. Object Structures and Aliasing" },
  { num: 6, file: "lecture_06_initialization.pdf", title: "6. Initialization" },
  { num: 7, file: "lecture_07_reflection.pdf", title: "7. Reflection" },
];

interface ParsedSlide {
  number: number;
  title: string;
  /** "1.2 Introduction" (text left of the en/em-dash in the footer), or null. */
  section: string | null;
  /** "Core Concepts" (text right of the dash). */
  subsection: string | null;
}

interface ParsedLecture {
  source: LectureSource;
  totalSlides: number;
  slides: ParsedSlide[];
}

interface RawItem {
  str: string;
  x: number;
  y: number;
  size: number;
  width: number;
}

/** Group items into lines by Y coordinate (tolerance 2px). */
function groupIntoLines(items: RawItem[]): RawItem[][] {
  const sorted = [...items].sort((a, b) => b.y - a.y || a.x - b.x);
  const lines: RawItem[][] = [];
  for (const it of sorted) {
    const open = lines[lines.length - 1];
    if (open && Math.abs(open[0].y - it.y) < 3 && Math.abs(open[0].size - it.size) < 0.6) {
      open.push(it);
    } else {
      lines.push([it]);
    }
  }
  return lines.map((line) => line.sort((a, b) => a.x - b.x));
}

/** Concatenate the strings of a line, inserting a space when the X gap is wide. */
function lineToString(line: RawItem[]): string {
  let out = "";
  let prevEndX = -Infinity;
  for (const it of line) {
    if (it.str === "") continue;
    if (prevEndX !== -Infinity && it.x - prevEndX > it.size * 0.18 && !out.endsWith(" ")) {
      out += " ";
    }
    out += it.str;
    prevEndX = it.x + it.width;
  }
  return out.replace(/\s+/g, " ").trim();
}

const SECTION_PATH_RE = /^(\d+\.\d+)\s+(.+?)\s+[–-]\s+(.+)$/;

async function parseLecture(src: LectureSource): Promise<ParsedLecture> {
  const pdfjs = (await import(
    "pdfjs-dist/legacy/build/pdf.mjs"
  )) as typeof import("pdfjs-dist");

  const data = new Uint8Array(readFileSync(join(SOURCE_FOLDER, src.file)));
  const doc = await pdfjs.getDocument({ data, disableFontFace: true }).promise;

  const slides: ParsedSlide[] = [];

  // We skip page 1 (cover) and parse the rest.
  for (let pageNum = 2; pageNum <= doc.numPages; pageNum++) {
    const page = await doc.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1 });
    const content = await page.getTextContent();

    const items: RawItem[] = [];
    for (const it0 of content.items as unknown as Array<{
      str: string;
      transform: number[];
      width: number;
    }>) {
      const [, , , d, e, f] = it0.transform;
      if (typeof it0.str !== "string") continue;
      if (it0.str.trim() === "") continue; // empty placeholder runs
      items.push({ str: it0.str, x: e, y: f, size: d, width: it0.width });
    }

    if (items.length === 0) {
      slides.push({ number: pageNum, title: "(blank slide)", section: null, subsection: null });
      continue;
    }

    const pageHeight = viewport.height;
    const lines = groupIntoLines(items);

    // PDF coordinates are bottom-up. For Müller's decks:
    //   - the breadcrumb "1.1 Introduction – Requirements" sits at y≈517 (just below the top)
    //   - the slide number sits at y≈518 in the top-right
    //   - the big slide title sits at y≈470
    //   - the author footer "Peter Müller – ..." sits at the very bottom (y≈13)
    const TOP_BAND_FROM_TOP = 35; // px from the top of the page

    // ── Breadcrumb / section path (top band) ──
    const topBandLines = lines.filter((l) => l[0].y > pageHeight - TOP_BAND_FROM_TOP);
    let section: string | null = null;
    let subsection: string | null = null;
    for (const tl of topBandLines) {
      const s = lineToString(tl).trim();
      if (!s) continue;
      // skip "<page number>"
      if (/^\d{1,3}$/.test(s)) continue;
      const m = s.match(SECTION_PATH_RE);
      if (m) {
        section = `${m[1]} ${m[2]}`.trim();
        // pdfjs groups the breadcrumb and the top-right page number on the same
        // baseline, so we strip any trailing page-number digits from subsection.
        subsection = m[3].replace(/\s+\d+\s*$/, "").trim();
        break;
      }
    }

    // ── Title ──
    // Largest-font line(s) in the middle of the page (below the top band, above the
    // bottom author-footer band).
    const middle = lines.filter(
      (l) => l[0].y < pageHeight - TOP_BAND_FROM_TOP && l[0].y > 30,
    );
    const maxSize = middle.reduce((mx, l) => Math.max(mx, l[0].size), 0);
    // Title items are usually placed near the top of the slide body; restrict to
    // upper half to avoid catching equally-large code/banner text below.
    const titleCandidates = middle.filter(
      (l) => Math.abs(l[0].size - maxSize) < 0.6 && l[0].y > pageHeight / 2,
    );
    const titleText = titleCandidates.map((l) => lineToString(l)).join(" ").trim();

    slides.push({
      number: pageNum,
      title: titleText || "(no title detected)",
      section,
      subsection,
    });
  }

  return {
    source: src,
    totalSlides: doc.numPages,
    slides,
  };
}

/**
 * A "TOC slide" is one where the title is just the chapter heading
 * (e.g. "1. Introduction") and is followed by sub-section markers.
 * We rename its title for clarity.
 */
function isTocDividerTitle(title: string, lectureTitle: string): boolean {
  if (!title) return false;
  if (title.trim() === lectureTitle.trim()) return true;
  if (/^\d+\.\s+[A-Z]/.test(title) && title.length <= 60) return true;
  return false;
}

/**
 * Slides without their own section path inherit the last known one
 * (Müller drops footers on closing slides of a chapter).
 */
function applyCarryForward(slides: ParsedSlide[]): void {
  let lastSection: string | null = null;
  let lastSubsection: string | null = null;
  for (const s of slides) {
    if (s.section) {
      lastSection = s.section;
      lastSubsection = s.subsection;
    } else if (lastSection) {
      s.section = lastSection;
      s.subsection = lastSubsection;
    }
  }
}

interface SectionGroup {
  section: string;
  subsections: { name: string; slides: ParsedSlide[] }[];
}

function groupBySection(slides: ParsedSlide[]): SectionGroup[] {
  const order: string[] = [];
  const map = new Map<string, Map<string, ParsedSlide[]>>();

  for (const s of slides) {
    const sectionKey = s.section ?? "Lecture intro";
    const subKey = s.subsection ?? "(overview)";
    if (!map.has(sectionKey)) {
      map.set(sectionKey, new Map());
      order.push(sectionKey);
    }
    const sub = map.get(sectionKey)!;
    if (!sub.has(subKey)) sub.set(subKey, []);
    sub.get(subKey)!.push(s);
  }

  return order.map((sectionKey) => ({
    section: sectionKey,
    subsections: Array.from(map.get(sectionKey)!.entries()).map(([name, slides]) => ({
      name,
      slides,
    })),
  }));
}

/* ────────────────────────────────────────────────────────────────────────── */
/* PDF rendering                                                              */
/* ────────────────────────────────────────────────────────────────────────── */

function renderPlanPdf(lectures: ParsedLecture[]) {
  const doc = new PDFDocument({
    size: "A4",
    margin: 56,
    info: {
      Title: "Concepts of OOP — Course Plan (from slides)",
      Author: "Auto-generated from Prof. Peter Müller's lecture decks",
      Subject: "ETH Zürich — Autumn Semester 2025",
    },
  });
  doc.pipe(createWriteStream(OUTPUT_FILE));
  doc.font("Helvetica");

  // ── Cover ─────────────────────────────────────────────────────────────
  doc.font("Helvetica-Bold").fontSize(22).text("Concepts of Object-Oriented Programming");
  doc.moveDown(0.3);
  doc.font("Helvetica").fontSize(13).fillColor("#444").text("Course plan reconstructed from lecture slides");
  doc.moveDown(0.6);
  doc.fillColor("#222").fontSize(11);
  doc.text("Lecturer: Prof. Peter Müller");
  doc.text("Institution: ETH Zürich — Programming Methodology Group");
  doc.text("Semester: Autumn 2025");
  doc.text(`Source folder: OOP_Peter_Muller/ (${lectures.length} PDFs)`);
  doc.text(`Generated: ${new Date().toISOString().slice(0, 10)}`);
  doc.moveDown(1);

  doc.font("Helvetica-Oblique").fontSize(10).fillColor("#666");
  doc.text(
    "This plan reproduces Prof. Müller's own section structure (X.Y) and lists every slide " +
      "title in the order it appears in his deck. Titles are extracted by reading each slide's " +
      "largest font in the top half of the page; section paths come from the bottom-line footer. " +
      "No external pedagogical template has been applied.",
    { align: "left" },
  );
  doc.fillColor("#000");
  doc.moveDown(1);

  // ── Table of contents ─────────────────────────────────────────────────
  doc.font("Helvetica-Bold").fontSize(14).text("Lectures");
  doc.moveDown(0.4);
  doc.font("Helvetica").fontSize(11);
  for (const lec of lectures) {
    doc.fillColor("#000").text(`${lec.source.title}`, { continued: true });
    doc
      .fillColor("#666")
      .text(`   — ${lec.totalSlides} slides   (${lec.source.file})`, { align: "left" });
  }
  doc.fillColor("#000");

  // ── Per lecture ───────────────────────────────────────────────────────
  for (const lec of lectures) {
    doc.addPage();
    doc.font("Helvetica-Bold").fontSize(18).fillColor("#000").text(lec.source.title);
    doc.moveDown(0.2);
    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor("#666")
      .text(`Source: ${lec.source.file}   ·   ${lec.totalSlides} slides total`);
    doc.fillColor("#000");
    doc.moveDown(0.6);

    const groups = groupBySection(lec.slides);

    for (const g of groups) {
      doc.moveDown(0.4);
      doc.font("Helvetica-Bold").fontSize(13).fillColor("#1d4ed8").text(g.section);
      doc.fillColor("#000");
      doc.moveDown(0.15);

      for (const sub of g.subsections) {
        if (sub.name !== "(overview)") {
          doc.font("Helvetica-Bold").fontSize(11).fillColor("#222").text(sub.name);
          doc.fillColor("#000");
        }
        doc.font("Helvetica").fontSize(10).fillColor("#000");

        for (const s of sub.slides) {
          const numCol = `  ${String(s.number).padStart(3, " ")}.`;
          const title = s.title || "(no title)";
          doc.text(`${numCol}  ${title}`, { indent: 6, lineGap: 1.5 });
        }
        doc.moveDown(0.25);
      }
    }
  }

  doc.end();
}

/* ────────────────────────────────────────────────────────────────────────── */
async function main() {
  console.log(`Parsing ${LECTURES.length} PDFs from ${SOURCE_FOLDER} ...`);
  const lectures: ParsedLecture[] = [];
  for (const src of LECTURES) {
    process.stdout.write(`  · ${src.file} ... `);
    const parsed = await parseLecture(src);
    // Mark TOC dividers
    for (const s of parsed.slides) {
      if (isTocDividerTitle(s.title, src.title)) {
        s.title = "§ Chapter divider / table of contents";
      }
    }
    applyCarryForward(parsed.slides);
    console.log(`${parsed.totalSlides} slides`);
    lectures.push(parsed);
  }

  console.log(`Rendering plan → ${OUTPUT_FILE}`);
  renderPlanPdf(lectures);

  await new Promise((r) => setTimeout(r, 400));
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
