import { mkdir, writeFile } from "fs/promises";
import path from "path";
import {
  S3Client,
  PutObjectCommand,
  HeadBucketCommand,
  CreateBucketCommand,
} from "@aws-sdk/client-s3";
import { nanoid } from "nanoid";

export interface StoredAsset {
  url: string;
  key: string;
}

async function storeLocal(buffer: Buffer, ext: string): Promise<StoredAsset> {
  const base = process.env.STORAGE_LOCAL_PATH ?? "./storage/uploads";
  await mkdir(base, { recursive: true });
  const key = `${nanoid()}.${ext}`;
  const filePath = path.join(base, key);
  await writeFile(filePath, buffer);
  const publicBase = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return { key, url: `${publicBase}/api/assets/${key}` };
}

let s3: S3Client | null = null;

function getS3(): S3Client {
  if (!s3) {
    s3 = new S3Client({
      region: process.env.S3_REGION ?? "us-east-1",
      endpoint: process.env.S3_ENDPOINT,
      forcePathStyle: true,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY ?? "",
        secretAccessKey: process.env.S3_SECRET_KEY ?? "",
      },
    });
  }
  return s3;
}

async function ensureBucket(client: S3Client, bucket: string) {
  try {
    await client.send(new HeadBucketCommand({ Bucket: bucket }));
  } catch {
    await client.send(new CreateBucketCommand({ Bucket: bucket }));
  }
}

async function storeS3(buffer: Buffer, ext: string, contentType: string): Promise<StoredAsset> {
  const bucket = process.env.S3_BUCKET ?? "profdeck";
  const client = getS3();
  await ensureBucket(client, bucket);
  const key = `slides/${nanoid()}.${ext}`;
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }),
  );
  const publicUrl = process.env.S3_PUBLIC_URL ?? `${process.env.S3_ENDPOINT}/${bucket}`;
  return { key, url: `${publicUrl}/${key}` };
}

export async function storeImageFromUrl(imageUrl: string): Promise<StoredAsset> {
  const res = await fetch(imageUrl);
  if (!res.ok) throw new Error(`Failed to fetch image: ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  const ext = imageUrl.includes(".png") ? "png" : "jpg";
  const contentType = ext === "png" ? "image/png" : "image/jpeg";

  if (process.env.STORAGE_PROVIDER === "s3") {
    return storeS3(buffer, ext, contentType);
  }
  return storeLocal(buffer, ext);
}

export async function storeImageBuffer(
  buffer: Buffer,
  ext = "png",
): Promise<StoredAsset> {
  const contentType = ext === "png" ? "image/png" : "image/jpeg";
  if (process.env.STORAGE_PROVIDER === "s3") {
    return storeS3(buffer, ext, contentType);
  }
  return storeLocal(buffer, ext);
}
