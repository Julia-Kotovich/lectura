import type { ImageGenerationInput, ImageGenerationResult, ImageProvider } from "../types";

export class StabilityImageProvider implements ImageProvider {
  readonly name = "stability";

  async generate(input: ImageGenerationInput): Promise<ImageGenerationResult> {
    const apiKey = process.env.STABILITY_API_KEY;
    if (!apiKey) {
      throw new Error("STABILITY_API_KEY is required when AI_IMAGE_PROVIDER=stability");
    }

    const res = await fetch(
      "https://api.stability.ai/v2beta/stable-image/generate/sd3",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "application/json",
        },
        body: (() => {
          const form = new FormData();
          form.append("prompt", input.prompt);
          form.append("output_format", "png");
          return form;
        })(),
      },
    );

    if (!res.ok) {
      throw new Error(`Stability API error: ${res.status} ${await res.text()}`);
    }

    const json = (await res.json()) as { image?: string };
    if (!json.image) throw new Error("Stability returned no image");

    const url = `data:image/png;base64,${json.image}`;
    return { url, provider: this.name, revisedPrompt: input.prompt };
  }
}
