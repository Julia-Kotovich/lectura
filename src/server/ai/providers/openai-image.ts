import OpenAI from "openai";
import type { ImageGenerationInput, ImageGenerationResult, ImageProvider } from "../types";

export class OpenAIImageProvider implements ImageProvider {
  readonly name = "openai";
  private client: OpenAI;
  private model: string;

  constructor(model = process.env.OPENAI_IMAGE_MODEL ?? "dall-e-3") {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is required when AI_IMAGE_PROVIDER=openai");
    }
    this.client = new OpenAI({ apiKey });
    this.model = model;
  }

  async generate(input: ImageGenerationInput): Promise<ImageGenerationResult> {
    const response = await this.client.images.generate({
      model: this.model,
      prompt: input.prompt,
      size: input.size ?? "1024x1024",
      n: 1,
    });

    const image = response.data?.[0];
    if (!image?.url) {
      throw new Error("OpenAI image generation returned no URL");
    }

    return {
      url: image.url,
      provider: this.name,
      revisedPrompt: image.revised_prompt,
    };
  }
}
