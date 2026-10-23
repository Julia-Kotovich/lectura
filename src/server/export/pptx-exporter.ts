import PptxGenJS from "pptxgenjs";
import type { SlideDocument } from "@/lib/schemas/slide";

function blockText(block: SlideDocument["blocks"][number]): string {
  if (typeof block.content === "string") return block.content;
  if (block.type === "bullets" && block.content.items) {
    return block.content.items.map((i) => `• ${i}`).join("\n");
  }
  if (block.type === "code" && block.content.code) {
    return block.content.code;
  }
  return "";
}

export async function exportDeckToPptx(
  title: string,
  slides: SlideDocument[],
): Promise<Buffer> {
  const pptx = new PptxGenJS();
  pptx.author = "ProfDeck";
  pptx.title = title;

  for (const slide of slides) {
    const s = pptx.addSlide();

    s.addText(slide.title, {
      x: 0.5,
      y: 0.3,
      w: 9,
      h: 0.8,
      fontSize: 28,
      bold: true,
      color: "1e293b",
    });

    let y = 1.2;
    for (const block of slide.blocks) {
      if (block.type === "heading") continue;
      const text = blockText(block);
      if (!text) continue;

      if (block.type === "code") {
        s.addText(text, {
          x: 0.5,
          y,
          w: 9,
          h: 2,
          fontSize: 12,
          fontFace: "Courier New",
          fill: { color: "0f172a" },
          color: "a7f3d0",
        });
        y += 2.2;
      } else {
        s.addText(text, {
          x: 0.5,
          y,
          w: 9,
          h: 1.5,
          fontSize: block.type === "bullets" ? 16 : 14,
          color: "334155",
        });
        y += 1.6;
      }
    }

    if (slide.speakerNotes) {
      s.addNotes(slide.speakerNotes);
    }
  }

  const data = await pptx.write({ outputType: "nodebuffer" });
  return Buffer.from(data as ArrayBuffer);
}
