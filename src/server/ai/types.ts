export interface TextGenerationInput {
  systemPrompt: string;
  userPrompt: string;
  jsonSchema?: Record<string, unknown>;
  temperature?: number;
  maxTokens?: number;
}

export interface TextGenerationResult {
  content: string;
  raw?: unknown;
  provider: string;
  model: string;
}

export interface ImageGenerationInput {
  prompt: string;
  size?: "1024x1024" | "1792x1024" | "1024x1792";
  style?: "natural" | "vivid";
}

export interface ImageGenerationResult {
  url: string;
  provider: string;
  revisedPrompt?: string;
}

export interface TextProvider {
  readonly name: string;
  generate(input: TextGenerationInput): Promise<TextGenerationResult>;
}

export interface ImageProvider {
  readonly name: string;
  generate(input: ImageGenerationInput): Promise<ImageGenerationResult>;
}
