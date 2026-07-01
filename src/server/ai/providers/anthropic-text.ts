import Anthropic from "@anthropic-ai/sdk";
import type { TextGenerationInput, TextGenerationResult, TextProvider } from "../types";

/** Strip markdown fences if the model wraps JSON in ``` blocks */
export function extractJsonContent(raw: string): string {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)```$/i);
  if (fenced) return fenced[1].trim();
  const inline = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (inline) return inline[1].trim();
  return trimmed;
}

export class AnthropicTextProvider implements TextProvider {
  readonly name = "anthropic";
  private client: Anthropic;
  private model: string;

  constructor(model = process.env.ANTHROPIC_TEXT_MODEL ?? "claude-sonnet-4-20250514") {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY is required when AI_TEXT_PROVIDER=anthropic");
    }
    this.client = new Anthropic({ apiKey });
    this.model = model;
  }

  async generate(input: TextGenerationInput): Promise<TextGenerationResult> {
    const systemWithJson = `${input.systemPrompt}\n\nYou MUST respond with valid JSON only — no markdown, no code fences, no commentary before or after.`;

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: input.maxTokens ?? 8192,
      temperature: input.temperature ?? 0.4,
      system: systemWithJson,
      messages: [{ role: "user", content: input.userPrompt }],
    });

    const block = response.content.find((b) => b.type === "text");
    if (!block || block.type !== "text") {
      throw new Error("Anthropic returned no text content");
    }

    return {
      content: extractJsonContent(block.text),
      raw: response,
      provider: this.name,
      model: this.model,
    };
  }
}
