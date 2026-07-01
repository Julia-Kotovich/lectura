import OpenAI from "openai";
import type { TextGenerationInput, TextGenerationResult, TextProvider } from "../types";

export class OpenAITextProvider implements TextProvider {
  readonly name = "openai";
  private client: OpenAI;
  private model: string;

  constructor(model = process.env.OPENAI_TEXT_MODEL ?? "gpt-4o-mini") {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is required when AI_TEXT_PROVIDER=openai");
    }
    this.client = new OpenAI({ apiKey });
    this.model = model;
  }

  async generate(input: TextGenerationInput): Promise<TextGenerationResult> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      temperature: input.temperature ?? 0.4,
      max_tokens: input.maxTokens ?? 4096,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: input.systemPrompt },
        { role: "user", content: input.userPrompt },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("OpenAI returned empty content");
    }

    return {
      content,
      raw: response,
      provider: this.name,
      model: this.model,
    };
  }
}
