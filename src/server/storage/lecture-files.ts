import { mkdir, writeFile, readFile } from "fs/promises";
import path from "path";
import type { LectureOutline } from "@/lib/schemas/outline";
import type { SlideDocument } from "@/lib/schemas/slide";
import { exportOutlineToPdf } from "../export/outline-pdf";

export interface LectureFolderMeta {
  lectureId: string;
  title: string;
  folderPath: string;
  status?: string;
  createdAt: string;
  updatedAt: string;
  targetSlideCount?: number;
  estimatedStudyMinutes?: number;
  estimatedPresentationMinutes?: number;
  slideCount?: number;
}

function lecturesBasePath(): string {
  return process.env.STORAGE_LECTURES_PATH ?? path.join(process.cwd(), "storage", "lectures");
}

export function slugifyTitle(title: string): string {
  return (
    title
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 50) || "lecture"
  );
}

export function getLectureFolderPath(lectureId: string, title: string): string {
  return path.join(lecturesBasePath(), `${slugifyTitle(title)}-${lectureId.slice(0, 8)}`);
}

async function writeJson(filePath: string, data: unknown): Promise<void> {
  await writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}

export async function ensureLectureFolder(
  lectureId: string,
  title: string,
): Promise<string> {
  const folderPath = getLectureFolderPath(lectureId, title);
  await mkdir(folderPath, { recursive: true });

  const metaPath = path.join(folderPath, "meta.json");
  try {
    await readFile(metaPath, "utf-8");
  } catch {
    const meta: LectureFolderMeta = {
      lectureId,
      title,
      folderPath,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await writeJson(metaPath, meta);
  }

  return folderPath;
}

export async function syncLectureFiles(params: {
  lectureId: string;
  title: string;
  status?: string;
  outline?: LectureOutline;
  slides?: SlideDocument[];
}): Promise<string> {
  const folderPath = await ensureLectureFolder(params.lectureId, params.title);
  const now = new Date().toISOString();

  let meta: LectureFolderMeta;
  try {
    meta = JSON.parse(
      await readFile(path.join(folderPath, "meta.json"), "utf-8"),
    ) as LectureFolderMeta;
  } catch {
    meta = {
      lectureId: params.lectureId,
      title: params.title,
      folderPath,
      createdAt: now,
      updatedAt: now,
    };
  }

  meta.title = params.title;
  meta.updatedAt = now;
  if (params.status) meta.status = params.status;

  if (params.outline) {
    meta.targetSlideCount = params.outline.targetSlideCount;
    meta.estimatedStudyMinutes = params.outline.estimatedStudyMinutes;
    meta.estimatedPresentationMinutes = params.outline.estimatedPresentationMinutes;
    await writeJson(path.join(folderPath, "outline.json"), params.outline);
    await exportOutlineToPdf(params.outline, path.join(folderPath, "lecture-plan.pdf"));
  }

  if (params.slides) {
    meta.slideCount = params.slides.length;
    await writeJson(path.join(folderPath, "slides.json"), {
      updatedAt: now,
      slides: params.slides,
    });
  }

  await writeJson(path.join(folderPath, "meta.json"), meta);
  return folderPath;
}
