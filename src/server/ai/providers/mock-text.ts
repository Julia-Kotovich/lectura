import type { TextGenerationInput, TextGenerationResult, TextProvider } from "../types";
import { lectureOutlineSchema, type LectureOutline } from "@/lib/schemas/outline";
import { slideDeckDraftSchema } from "@/lib/schemas/slide";
import { deckEvaluationSchema } from "@/lib/schemas/evaluation";
import { enrichOutlineMetadata } from "@/lib/lecture-timing";
import {
  buildMockOutline,
  buildMockSlidesFromOutline,
} from "../mock-deck";

export class MockTextProvider implements TextProvider {
  readonly name = "mock";

  async generate(input: TextGenerationInput): Promise<TextGenerationResult> {
    const user = input.userPrompt.toLowerCase();
    const system = input.systemPrompt.toLowerCase();

    // Single-slide regeneration
    if (system.includes("single slide") || user.includes("current slide to regenerate")) {
      const deck = slideDeckDraftSchema.parse({
        slides: [
          {
            id: "slide-regen",
            title: "Regenerated Slide (Mock)",
            layout: "content",
            blocks: [
              { id: "b1", type: "heading", content: "Updated concept" },
              {
                id: "b2",
                type: "bullets",
                content: {
                  items: ["Clearer explanation", "New example", "Check understanding"],
                },
              },
            ],
            speakerNotes: "Emphasize the core idea with a live demo.",
          },
        ],
      });
      return {
        content: JSON.stringify(deck.slides[0]),
        provider: this.name,
        model: "mock-single-slide-v1",
      };
    }

    // Bloom evaluation (prompt also mentions "slide deck")
    if (system.includes("bloom") || user.includes("evaluate this slide deck")) {
      const evaluation = deckEvaluationSchema.parse({
        alignmentScore: 72,
        dominantLevel: "understand",
        distribution: {
          remember: 10,
          understand: 35,
          apply: 30,
          analyze: 15,
          evaluate: 5,
          create: 5,
        },
        objectiveAlignments: [
          {
            objective: "Explain core concepts",
            expectedLevel: "understand",
            observedLevel: "understand",
            status: "aligned",
            rationale: "Definitions and explanations are well covered.",
          },
          {
            objective: "Apply concepts to practical problems",
            expectedLevel: "apply",
            observedLevel: "understand",
            status: "partially_aligned",
            rationale: "Examples are present but lack guided application exercises.",
          },
        ],
        slideTags: [
          {
            slideTitle: "Introduction",
            primaryLevel: "remember",
            evidence: "Terminology and course framing.",
          },
          {
            slideTitle: "Core concepts",
            primaryLevel: "understand",
            evidence: "Explains relationships between ideas.",
          },
        ],
        gaps: ["Limited analyze-level comparison of design alternatives"],
        suggestions: [
          "Add one slide requiring students to compare two design approaches",
          "Include a short exercise at apply level before the recap",
        ],
      });

      return {
        content: JSON.stringify(evaluation),
        provider: this.name,
        model: "mock-eval-v1",
      };
    }

    // Slide deck — must run before outline check (slide prompts mention "outline")
    if (system.includes("presentation designer") || user.includes("convert this lecture outline")) {
      const lectureTitle = extractQuotedTitle(input.userPrompt) ?? "Lecture";
      const outline =
        extractOutlineFromPrompt(input.userPrompt) ??
        buildMockOutline({ title: lectureTitle, durationMinutes: 60 });
      const deck = buildMockSlidesFromOutline(lectureTitle, outline);

      return {
        content: JSON.stringify(slideDeckDraftSchema.parse(deck)),
        provider: this.name,
        model: "mock-slides-v1",
      };
    }

    if (system.includes("curriculum designer") || user.includes("create a lecture outline")) {
      const title = extractTitle(input.userPrompt) ?? "Lecture";
      const durationMinutes = extractDuration(input.userPrompt) ?? 60;
      const description = extractDescription(input.userPrompt);
      const raw = buildMockOutline({ title, description, durationMinutes });
      const outline = enrichOutlineMetadata(raw);

      return {
        content: JSON.stringify(outline),
        provider: this.name,
        model: "mock-outline-v1",
      };
    }

    throw new Error(`MockTextProvider: unrecognized prompt (system: ${system.slice(0, 80)}…)`);
  }
}

function extractTitle(prompt: string): string | null {
  const match = prompt.match(/title:\s*(.+)/i);
  return match?.[1]?.trim() ?? null;
}

function extractQuotedTitle(prompt: string): string | null {
  const match = prompt.match(/slide deck for "([^"]+)"/i);
  return match?.[1]?.trim() ?? null;
}

function extractDuration(prompt: string): number | null {
  const match = prompt.match(/duration:\s*(\d+)/i);
  return match ? parseInt(match[1], 10) : null;
}

function extractDescription(prompt: string): string | undefined {
  const match = prompt.match(/description:\s*(.+)/i);
  const value = match?.[1]?.trim();
  return value && value !== "n/a" ? value : undefined;
}

function extractOutlineFromPrompt(prompt: string): LectureOutline | null {
  const marker = "outline:\n";
  const lower = prompt.toLowerCase();
  const idx = lower.indexOf(marker);
  if (idx === -1) return null;

  const start = idx + marker.length;
  const rest = prompt.slice(start);
  const endMatch = rest.match(/\n\nreturn json/i);
  const jsonText = (endMatch ? rest.slice(0, endMatch.index) : rest).trim();

  try {
    return lectureOutlineSchema.parse(JSON.parse(jsonText));
  } catch {
    return null;
  }
}
