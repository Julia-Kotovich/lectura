import { createWriteStream } from "fs";
import { finished } from "stream/promises";
import PDFDocument from "pdfkit";
import type { LectureOutline } from "@/lib/schemas/outline";
import { formatStudyDuration } from "@/lib/lecture-timing";

export async function exportOutlineToPdf(
  outline: LectureOutline,
  outputPath: string,
): Promise<void> {
  const doc = new PDFDocument({ margin: 50 });
  const stream = createWriteStream(outputPath);
  doc.pipe(stream);

  doc.fontSize(22).text(outline.title, { align: "center" });
  doc.moveDown(0.5);
  doc.fontSize(11).fillColor("#444444");
  if (outline.targetSlideCount) {
    doc.text(`Target slides: ${outline.targetSlideCount}`, { align: "center" });
  }
  if (outline.estimatedStudyMinutes) {
    doc.text(
      `Estimated study time: ${formatStudyDuration(outline.estimatedStudyMinutes)}`,
      { align: "center" },
    );
  }
  doc.fillColor("#000000");
  doc.moveDown(1.5);

  doc.fontSize(14).text("Summary", { underline: true });
  doc.moveDown(0.3);
  doc.fontSize(11).text(outline.summary, { align: "justify" });
  doc.moveDown(1);

  doc.fontSize(14).text("Learning objectives", { underline: true });
  doc.moveDown(0.3);
  doc.fontSize(11);
  for (const obj of outline.learningObjectives) {
    doc.text(`• ${obj}`);
  }
  doc.moveDown(1);

  doc.fontSize(14).text("Lecture plan", { underline: true });
  doc.moveDown(0.5);

  outline.sections.forEach((section, index) => {
    doc.fontSize(12).fillColor("#1a1a1a").text(`${index + 1}. ${section.title}`);
    doc.moveDown(0.2);
    doc.fontSize(10).fillColor("#333333");
    for (const goal of section.learningGoals) {
      doc.text(`   ◦ ${goal}`);
    }
    for (const sub of section.subsections) {
      doc.text(`   — ${sub.title}`);
      for (const point of sub.keyPoints) {
        doc.text(`      • ${point}`);
      }
    }
    if (section.exercises?.length) {
      doc.text(`   Exercises: ${section.exercises.join("; ")}`);
    }
    doc.fillColor("#000000");
    doc.moveDown(0.6);
  });

  if (outline.suggestedResources?.length) {
    doc.addPage();
    doc.fontSize(14).text("Suggested resources", { underline: true });
    doc.moveDown(0.3);
    doc.fontSize(11);
    for (const r of outline.suggestedResources) {
      doc.text(`• ${r}`);
    }
  }

  doc.end();
  await finished(stream);
}
