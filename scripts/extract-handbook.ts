import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

async function extractAll() {
  const pdfjs = (await import("pdfjs-dist/legacy/build/pdf.mjs")) as typeof import("pdfjs-dist");
  const path = join(process.cwd(), "CS_Handbook_2025_v1_4.pdf");
  const data = new Uint8Array(readFileSync(path));
  const doc = await pdfjs.getDocument({ data, disableFontFace: true, standardFontDataUrl: `file://${join(process.cwd(), "node_modules/pdfjs-dist/standard_fonts/")}` }).promise;

  const pages: string[] = [];
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const content = await page.getTextContent();
    type Item = { str: string; transform: number[] };
    const items = (content.items as unknown as Item[]).filter((it) => it.str?.trim());
    let pageText = "";
    let lastY = -999;
    for (const it of items.map((i) => {
      const [, , , , e, f] = i.transform;
      return { str: i.str, x: e, y: f };
    }).sort((a, b) => b.y - a.y || a.x - b.x)) {
      if (lastY !== -999 && Math.abs(it.y - lastY) > 4) pageText += "\n";
      else if (pageText && !pageText.endsWith("\n") && lastY !== -999) pageText += " ";
      pageText += it.str;
      lastY = it.y;
    }
    pages.push(`=== PAGE ${p} ===\n${pageText}`);
  }
  return pages.join("\n\n");
}

extractAll()
  .then((t) => {
    writeFileSync(join(process.cwd(), "docs", "CS_Handbook_2025_extracted.txt"), t);
    console.log("Wrote docs/CS_Handbook_2025_extracted.txt, chars:", t.length);
  })
  .catch(console.error);
