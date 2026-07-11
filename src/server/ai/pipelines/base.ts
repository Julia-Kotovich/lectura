import { z } from "zod";
import { parseJsonLoose } from "../json";

const MAX_RETRIES = 3;

export async function parseWithRetry<T>(
  raw: string,
  schema: z.ZodType<T>,
  regenerate?: () => Promise<string>,
): Promise<T> {
  let lastError: unknown;
  let current = raw;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const parsed = parseJsonLoose(current);
      return schema.parse(parsed);
    } catch (error) {
      lastError = error;
      if (regenerate && attempt < MAX_RETRIES - 1) {
        // On later attempts, ask the model again; first failure already tried local repair.
        current = await regenerate();
      }
    }
  }

  throw new Error(
    `Failed to parse AI output after ${MAX_RETRIES} attempts: ${String(lastError)}`,
  );
}
