import { MockImageProvider } from "./providers/mock-image";
import { MockTextProvider } from "./providers/mock-text";
import { AnthropicTextProvider } from "./providers/anthropic-text";
import { OpenAIImageProvider } from "./providers/openai-image";
import { OpenAITextProvider } from "./providers/openai-text";
import { ReplicateImageProvider } from "./providers/replicate-image";
import { StabilityImageProvider } from "./providers/stability-image";
import type { ImageProvider, TextProvider } from "./types";

let textProvider: TextProvider | null = null;
let imageProvider: ImageProvider | null = null;

function resolveTextProviderName(): string {
  return (process.env.AI_TEXT_PROVIDER ?? "mock").toLowerCase();
}

function createTextProvider(model?: string): TextProvider {
  const name = resolveTextProviderName();

  switch (name) {
    case "openai":
      return new OpenAITextProvider(model ?? process.env.OPENAI_TEXT_MODEL ?? "gpt-4o-mini");
    case "anthropic":
    case "claude":
      return new AnthropicTextProvider(
        model ?? process.env.ANTHROPIC_TEXT_MODEL ?? "claude-sonnet-4-20250514",
      );
    default:
      return new MockTextProvider();
  }
}

export function getTextProvider(): TextProvider {
  if (!textProvider) textProvider = createTextProvider();
  return textProvider;
}

export function getImageProvider(): ImageProvider {
  if (imageProvider) return imageProvider;

  const name = process.env.AI_IMAGE_PROVIDER ?? "mock";
  switch (name) {
    case "openai":
      imageProvider = new OpenAIImageProvider();
      break;
    case "stability":
      imageProvider = new StabilityImageProvider();
      break;
    case "replicate":
      imageProvider = new ReplicateImageProvider();
      break;
    default:
      imageProvider = new MockImageProvider();
  }

  return imageProvider;
}

export function getSlideTextProvider(): TextProvider {
  const name = resolveTextProviderName();

  if (name === "openai") {
    return new OpenAITextProvider(process.env.OPENAI_SLIDE_MODEL ?? "gpt-4o");
  }
  if (name === "anthropic" || name === "claude") {
    return new AnthropicTextProvider(
      process.env.ANTHROPIC_SLIDE_MODEL ??
        process.env.ANTHROPIC_TEXT_MODEL ??
        "claude-sonnet-4-20250514",
    );
  }

  return new MockTextProvider();
}
