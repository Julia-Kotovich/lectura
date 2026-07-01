import { z } from "zod";

const MAX_RETRIES = 3;

export async function parseWithRetry<T>(
  raw: string,
  schema: z.ZodType<T>,
  regenerate?: () => Promise<string>,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const parsed = JSON.parse(raw) as unknown;
      return schema.parse(parsed);
    } catch (error) {
      lastError = error;
      if (regenerate && attempt < MAX_RETRIES - 1) {
        raw = await regenerate();
      }
    }
  }

  throw new Error(
    `Failed to parse AI output after ${MAX_RETRIES} attempts: ${String(lastError)}`,
  );
}
