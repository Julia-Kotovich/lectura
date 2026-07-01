import { readFileSync } from "node:fs";
import { join } from "node:path";

export interface SlideTitle {
  page: number;
  title: string;
  fontSize: number;
}

export interface ParsedLectureFile {
  file: string;
  week: number;
  topic: string;
  pages: number;
  slides: SlideTitle[];
}

interface RawItem {
  str: string;
  x: number;
  y: number;
  size: number;
}

const CODE_RE =
  /#include|int main|printf\(|get_string|if \(x <|else if|clang |make hello|\{|\}|;$/;
const BINARY_NOISE_RE = /^[01\s]{16,}$/;
const LONG_NUM_RE = /^\d{10,}$/;

/** Titles that are clearly slide body content, not section headers. */
export function isBodySlide(title: string): boolean {
  const t = title.trim();
  if (t.length > 100) return true;
  if (CODE_RE.test(t)) return true;
  if (BINARY_NOISE_RE.test(t.replace(/\s/g, ""))) return true;
  if (LONG_NUM_RE.test(t.replace(/\s/g, ""))) return true;
  if (/^printf/.test(t)) return true;
  if (/^if \(/.test(t)) return true;
  if (/^string answer/.test(t)) return true;
  if (/^manual\.cs50\.io/.test(t)) return true;
  if (/^get_char get_/.test(t)) return true;
  if (/^cd cp ls/.test(t)) return true;
  if (/^= < <=/.test(t)) return true;
  if (/^bool char double/.test(t)) return true;
  if (/^O \( n \)|^Ω\(|^Θ\(/.test(t)) return true;
  if (/^For each door|^For i from|^If no doors|^If 50 is/.test(t)) return true;
  if (/^Pick up phone book/.test(t)) return true;
  if (/^One fish\.|^Before Grade|^Congratulations!|^It was a bright/.test(t)) return true;
  if (/^\[0\] \[1\]/.test(t)) return true;
  if (/^0 1 2 3 4 5 6 7 8 9 A B/.test(t)) return true;
  if (/^n n \/2/.test(t)) return true;
  if (/^72 73 33$/.test(t)) return true;
  if (/^01001000/.test(t)) return true;
  if (/^H I !/.test(t)) return true;
  if (/^00000000$|^11111111$|^01000001$|^01100001$/.test(t)) return true;
  if (/^# # #/.test(t)) return true;
  if (/^Visual Studio Code/i.test(t)) return true;
  if (/^CS50 Duck$/i.test(t)) return true;
  if (/^Not Reasonable$|^Reasonable$/i.test(t)) return true;
  if (/^code hello\.c/.test(t)) return true;
  if (t.split(/\s+/).length > 12) return true;
  return false;
}

/** Likely a CS50 topic header (large-font conceptual slide). */
export function isSectionHeader(title: string, fontSize: number): boolean {
  if (isBodySlide(title)) return false;
  const t = title.trim();
  if (t.length < 2) return false;
  // Large title slides (51pt) are often section openers
  if (fontSize >= 50) return true;
  // Standard 36pt conceptual headers
  if (fontSize >= 35 && t.split(/\s+/).length <= 8) return true;
  return false;
}

export async function parsePdfFile(
  folder: string,
  file: string,
  week: number,
  topic: string,
): Promise<ParsedLectureFile> {
  const pdfjs = (await import("pdfjs-dist/legacy/build/pdf.mjs")) as typeof import("pdfjs-dist");
  const data = new Uint8Array(readFileSync(join(folder, file)));
  const doc = await pdfjs.getDocument({ data, disableFontFace: true }).promise;
  const slides: SlideTitle[] = [];

  for (let pageIdx = 1; pageIdx <= doc.numPages; pageIdx++) {
    const page = await doc.getPage(pageIdx);
    const vp = page.getViewport({ scale: 1 });
    const content = await page.getTextContent();
    type Item = { str: string; transform: number[]; width: number };
    const items = (content.items as unknown as Item[]).filter((it) => it.str?.trim());
    if (items.length === 0) continue;

    const lines = new Map<number, { size: number; parts: RawItem[] }>();
    for (const it of items) {
      const [, , , d, e, f] = it.transform;
      const y = Math.round(f);
      const bucket = [...lines.keys()].find((k) => Math.abs(k - y) < 4) ?? y;
      const line = lines.get(bucket) ?? { size: d, parts: [] };
      line.parts.push({ str: it.str, x: e, y: f, size: d });
      line.size = Math.max(line.size, d);
      lines.set(bucket, line);
    }

    const sorted = [...lines.entries()].sort((a, b) => b[0] - a[0]);
    const pageH = vp.height;
    const upper = sorted.filter(([y]) => y > pageH * 0.35);
    const pool = upper.length ? upper : sorted;
    const maxSize = Math.max(...pool.map(([, l]) => l.size));
    const titleLines = pool.filter(([, l]) => l.size >= maxSize - 0.6);

    const title = titleLines
      .map(([, l]) =>
        l.parts
          .sort((a, b) => a.x - b.x)
          .map((p) => p.str)
          .join(" ")
          .trim(),
      )
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    if (!title || title.length < 2) continue;
    slides.push({ page: pageIdx, title, fontSize: maxSize });
  }

  return { file, week, topic, pages: doc.numPages, slides };
}

export interface GroupedSection {
  title: string;
  slides: SlideTitle[];
}

/** Group slides into sections by detecting topic-header slides. */
export function groupSlidesIntoSections(slides: SlideTitle[]): GroupedSection[] {
  const sections: GroupedSection[] = [];
  let current: GroupedSection | null = null;

  for (const slide of slides) {
    const header = isSectionHeader(slide.title, slide.fontSize);

    if (header) {
      // If same title as current section, treat as continuation slide
      if (current && current.title.toLowerCase() === slide.title.toLowerCase()) {
        current.slides.push(slide);
        continue;
      }
      current = { title: slide.title, slides: [slide] };
      sections.push(current);
    } else if (current) {
      current.slides.push(slide);
    } else {
      // Body slide before any header — intro bucket
      current = { title: "Introduction", slides: [slide] };
      sections.push(current);
    }
  }

  return sections;
}

/** Deduplicate consecutive identical titles for subsection key points. */
export function uniqueSlideTitles(slides: SlideTitle[]): string[] {
  const out: string[] = [];
  let prev = "";
  for (const s of slides) {
    const t = s.title.trim();
    if (t === prev) continue;
    out.push(t);
    prev = t;
  }
  return out;
}
