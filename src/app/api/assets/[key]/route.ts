import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  const { key } = await params;
  if (key.includes("..") || key.includes("/")) {
    return NextResponse.json({ error: "Invalid key" }, { status: 400 });
  }

  const base = process.env.STORAGE_LOCAL_PATH ?? "./storage/uploads";
  const filePath = path.join(base, key);

  try {
    const buffer = await readFile(filePath);
    const ext = key.split(".").pop()?.toLowerCase();
    const type =
      ext === "png" ? "image/png" : ext === "jpg" || ext === "jpeg" ? "image/jpeg" : "application/octet-stream";
    return new NextResponse(buffer, { headers: { "Content-Type": type } });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
