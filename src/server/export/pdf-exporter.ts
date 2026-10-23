import { PassThrough } from "stream";
import { finished } from "stream/promises";
import PDFDocument from "pdfkit";
import type { SlideDocument } from "@/lib/schemas/slide";

function blockText(block: SlideDocument["blocks"][number]): string {
  if (typeof block.content === "string") return block.content;

  if (block.type === "bullets" && block.content.items) {
    return block.content.items.map((item) => `- ${item}`).join("\n");
  }

  if (block.type === "code" && block.content.code) {
    return block.content.code;
  }

  if (block.type === "diagram" && block.content.mermaid) {
    return block.content.mermaid;
  }

  if (block.type === "image") {
    return block.content.alt ?? block.content.prompt ?? "";
  }

  return "";
}

export async function exportDeckToPdf(
  title: string,
  slides: SlideDocument[],
): Promise<Buffer> {
  const doc = new PDFDocument({
    margin: 48,
    size: "LETTER",
    info: {
      Author: "ProfDeck",
      Title: title,
    },
  });
  const stream = new PassThrough();
  const chunks: Buffer[] = [];

  stream.on("data", (chunk: Buffer) => chunks.push(chunk));
  doc.pipe(stream);

  slides.forEach((slide, index) => {
    if (index > 0) {
      doc.addPage();
    }

    doc
      .font("Helvetica-Bold")
      .fontSize(9)
      .fillColor("#7c3aed")
      .text(`Slide ${index + 1} of ${slides.length}`, { align: "right" });

    doc.moveDown(0.4);
    doc.font("Helvetica-Bold").fontSize(24).fillColor("#1e293b").text(slide.title);
    doc.moveDown(0.8);

    for (const block of slide.blocks) {
      if (block.type === "heading") continue;

      const text = blockText(block);
      if (!text) continue;

      if (block.type === "code" || block.type === "diagram") {
        doc
          .font("Courier")
          .fontSize(9)
          .fillColor("#d1fae5")
          .rect(doc.x, doc.y, 500, Math.min(190, text.split("\n").length * 14 + 24))
          .fill("#0f172a")
          .fillColor("#d1fae5")
          .text(text, doc.x + 12, doc.y + 12, {
            width: 476,
            lineGap: 2,
          });
      } else {
        doc.font("Helvetica").fontSize(12).fillColor("#334155").text(text, {
          lineGap: 4,
        });
      }

      doc.moveDown(0.8);
    }

    if (slide.speakerNotes) {
      doc
        .moveDown(0.4)
        .font("Helvetica-Bold")
        .fontSize(10)
        .fillColor("#475569")
        .text("Speaker notes");
      doc
        .moveDown(0.2)
        .font("Helvetica")
        .fontSize(10)
        .fillColor("#64748b")
        .text(slide.speakerNotes, { lineGap: 3 });
    }
  });

  const done = finished(stream);
  doc.end();
  await done;

  return Buffer.concat(chunks);
}
