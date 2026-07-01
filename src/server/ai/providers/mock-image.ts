import type { ImageGenerationInput, ImageGenerationResult, ImageProvider } from "../types";

export class MockImageProvider implements ImageProvider {
  readonly name = "mock";

  async generate(input: ImageGenerationInput): Promise<ImageGenerationResult> {
    const encoded = encodeURIComponent(input.prompt.slice(0, 80));
    return {
      url: `https://placehold.co/1024x576/1e293b/e2e8f0/png?text=${encoded}`,
      provider: this.name,
      revisedPrompt: input.prompt,
    };
  }
}
