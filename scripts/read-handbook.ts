import { readFileSync } from "node:fs";
import { join } from "node:path";

async function main() {
  const pdfjs = (await import("pdfjs-dist/legacy/build/pdf.mjs")) as typeof import("pdfjs-dist");
  const path = join(process.cwd(), "CS_Handbook_2025_v1_4.pdf");
  const data = new Uint8Array(readFileSync(path));
  const doc = await pdfjs.getDocument({ data, disableFontFace: true }).promise;
  console.log("Pages:", doc.numPages);

  const lines: string[] = [];
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const content = await page.getTextContent();
    type Item = { str: string; transform: number[] };
    const items = (content.items as unknown as Item[])
      .filter((it) => it.str?.trim())
      .map((it) => {
        const [, , , , e, f] = it.transform;
        return { str: it.str, x: e, y: f };
      })
      .sort((a, b) => b.y - a.y || a.x - b.x);

    let pageText = "";
    let lastY = -999;
    for (const it of items) {
      if (lastY !== -999 && Math.abs(it.y - lastY) > 4) pageText += "\n";
      else if (pageText && !pageText.endsWith("\n") && lastY !== -999) pageText += " ";
      pageText += it.str;
      lastY = it.y;
    }
    lines.push(`--- Page ${p} ---`);
    lines.push(pageText);
  }

  const out = lines.join("\n");
  console.log(out.slice(0, 15000));
  console.log("\n...\n");
  console.log("Total chars:", out.length);
}

main().catch(console.error);
