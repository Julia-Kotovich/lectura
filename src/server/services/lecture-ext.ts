import { db } from "@/lib/db";
import { lectureOutlineSchema } from "@/lib/schemas/outline";
import { slideDocumentSchema, type SlideDocument } from "@/lib/schemas/slide";
import { canAccessLecture } from "./access";
import { regenerateSingleSlide } from "../ai/pipelines/single-slide";
import { exportDeckToPptx } from "../export/pptx-exporter";
import { syncLectureFiles } from "../storage/lecture-files";
import type { ShareRole } from "@prisma/client";
import { nanoid } from "nanoid";

/** Assign DB-safe IDs — AI/mock output may reuse ids like "slide-1" across lectures. */
function withFreshSlideIds(slide: SlideDocument): SlideDocument {
  const id = nanoid();
  return {
    ...slide,
    id,
    blocks: slide.blocks.map((block) => ({ ...block, id: nanoid() })),
  };
}

export async function replaceLectureSlides(lectureId: string, slides: SlideDocument[]) {
  await db.slide.deleteMany({ where: { lectureId } });

  for (let i = 0; i < slides.length; i++) {
    const slide = withFreshSlideIds(slideDocumentSchema.parse(slides[i]));
    await db.slide.create({
      data: {
        id: slide.id,
        lectureId,
        orderIndex: i,
        title: slide.title,
        layout: slide.layout,
        content: slide,
        speakerNotes: slide.speakerNotes,
        metadata: slide.metadata ?? undefined,
        blocks: {
          create: slide.blocks.map((block, idx) => ({
            id: block.id,
            orderIndex: idx,
            type: block.type,
            content: block,
          })),
        },
      },
    });
  }
}

export async function saveDeckSnapshot(lectureId: string, userId: string) {
  const lecture = await canAccessLecture(userId, lectureId, "EDITOR");
  if (!lecture) throw new Error("Lecture not found or access denied");

  const slides = await db.slide.findMany({
    where: { lectureId },
    orderBy: { orderIndex: "asc" },
  });
  const snapshot = slides.map((s) => slideDocumentSchema.parse(s.content));

  const latest = await db.slideDeckVersion.findFirst({
    where: { lectureId },
    orderBy: { version: "desc" },
  });
  const nextVersion = (latest?.version ?? 0) + 1;

  await db.slideDeckVersion.updateMany({
    where: { lectureId, isActive: true },
    data: { isActive: false },
  });

  return db.slideDeckVersion.create({
    data: { lectureId, version: nextVersion, snapshot, isActive: true },
  });
}

export async function listDeckVersions(lectureId: string, userId: string) {
  const lecture = await canAccessLecture(userId, lectureId);
  if (!lecture) throw new Error("Lecture not found");

  return db.slideDeckVersion.findMany({
    where: { lectureId },
    orderBy: { version: "desc" },
    take: 20,
  });
}

export async function restoreDeckVersion(
  lectureId: string,
  userId: string,
  versionId: string,
) {
  const lecture = await canAccessLecture(userId, lectureId, "EDITOR");
  if (!lecture) throw new Error("Access denied");

  const version = await db.slideDeckVersion.findFirst({
    where: { id: versionId, lectureId },
  });
  if (!version) throw new Error("Version not found");

  const snapshot = version.snapshot as SlideDocument[];
  await replaceLectureSlides(lectureId, snapshot);

  const outlineVersion = await db.outlineVersion.findFirst({
    where: { lectureId, isActive: true },
  });

  await syncLectureFiles({
    lectureId,
    title: lecture.title,
    outline: outlineVersion
      ? lectureOutlineSchema.parse(outlineVersion.content)
      : undefined,
    slides: snapshot,
  });

  return snapshot;
}

export async function regenerateOneSlide(
  lectureId: string,
  userId: string,
  slideId: string,
  instructions?: string,
) {
  const lecture = await canAccessLecture(userId, lectureId, "EDITOR");
  if (!lecture) throw new Error("Access denied");

  await saveDeckSnapshot(lectureId, userId);

  const slides = await db.slide.findMany({
    where: { lectureId },
    orderBy: { orderIndex: "asc" },
  });
  const docs = slides.map((s) => slideDocumentSchema.parse(s.content));
  const idx = docs.findIndex((s) => s.id === slideId);
  if (idx === -1) throw new Error("Slide not found");

  const outlineVersion = await db.outlineVersion.findFirst({
    where: { lectureId, isActive: true },
  });
  const outline = outlineVersion
    ? lectureOutlineSchema.parse(outlineVersion.content)
    : null;

  const regenerated = await regenerateSingleSlide({
    lectureTitle: lecture.title,
    outlineSummary: outline?.summary ?? lecture.description ?? "",
    adjacentSlides: docs.filter((_, i) => Math.abs(i - idx) <= 1),
    currentSlide: docs[idx],
    instructions,
  });

  await db.slide.update({
    where: { id: slideId },
    data: {
      title: regenerated.title,
      layout: regenerated.layout,
      content: regenerated,
      speakerNotes: regenerated.speakerNotes,
      metadata: regenerated.metadata ?? undefined,
    },
  });

  return regenerated;
}

export async function getExportBuffer(lectureId: string, userId: string) {
  const lecture = await canAccessLecture(userId, lectureId);
  if (!lecture) throw new Error("Lecture not found");

  const slides = await db.slide.findMany({
    where: { lectureId },
    orderBy: { orderIndex: "asc" },
  });
  const docs = slides.map((s) => slideDocumentSchema.parse(s.content));
  const buffer = await exportDeckToPptx(lecture.title, docs);
  return { buffer, filename: `${lecture.title.replace(/\s+/g, "_")}.pptx` };
}

export async function shareLecture(
  lectureId: string,
  ownerId: string,
  email: string,
  role: ShareRole,
) {
  const lecture = await db.lecture.findFirst({
    where: { id: lectureId, userId: ownerId },
  });
  if (!lecture) throw new Error("Lecture not found");

  const user = await db.user.upsert({
    where: { email },
    update: {},
    create: { email, name: email.split("@")[0] },
  });

  return db.lectureShare.upsert({
    where: { lectureId_userId: { lectureId, userId: user.id } },
    update: { role },
    create: { lectureId, userId: user.id, role },
  });
}

export async function listComments(lectureId: string, slideId: string, userId: string) {
  const lecture = await canAccessLecture(userId, lectureId);
  if (!lecture) throw new Error("Lecture not found");

  return db.slideComment.findMany({
    where: { lectureId, slideId },
    orderBy: { createdAt: "asc" },
    include: { user: { select: { name: true, email: true, image: true } } },
  });
}

export async function addComment(
  lectureId: string,
  slideId: string,
  userId: string,
  body: string,
) {
  const lecture = await canAccessLecture(userId, lectureId);
  if (!lecture) throw new Error("Lecture not found");

  return db.slideComment.create({
    data: { lectureId, slideId, userId, body },
    include: { user: { select: { name: true, email: true } } },
  });
}
