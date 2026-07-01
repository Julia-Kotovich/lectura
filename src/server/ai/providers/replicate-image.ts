import Replicate from "replicate";
import type { ImageGenerationInput, ImageGenerationResult, ImageProvider } from "../types";

export class ReplicateImageProvider implements ImageProvider {
  readonly name = "replicate";
  private client: Replicate;

  constructor() {
    const token = process.env.REPLICATE_API_TOKEN;
    if (!token) {
      throw new Error("REPLICATE_API_TOKEN is required when AI_IMAGE_PROVIDER=replicate");
    }
    this.client = new Replicate({ auth: token });
  }

  async generate(input: ImageGenerationInput): Promise<ImageGenerationResult> {
    const output = await this.client.run(
      "black-forest-labs/flux-schnell",
      { input: { prompt: input.prompt } },
    );

    const url = Array.isArray(output) ? String(output[0]) : String(output);
    return { url, provider: this.name, revisedPrompt: input.prompt };
  }
}
