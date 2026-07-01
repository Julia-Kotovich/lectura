import { getImageProvider } from "../registry";
import { storeImageFromUrl } from "@/server/storage";
import type { ImageGenerationResult } from "../types";

export async function generateSlideImage(prompt: string): Promise<ImageGenerationResult> {
  const provider = getImageProvider();
  const enhancedPrompt = `Professional educational diagram for a university computer science lecture slide. Clean, minimal, high contrast. ${prompt}`;
  const result = await provider.generate({ prompt: enhancedPrompt, style: "natural" });

  if (result.url.startsWith("http")) {
    try {
      const stored = await storeImageFromUrl(result.url);
      return { ...result, url: stored.url };
    } catch {
      return result;
    }
  }
  return result;
}
