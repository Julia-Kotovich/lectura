export const EVALUATION_SYSTEM_PROMPT = `You are an expert instructional designer evaluating CS lecture slides using Revised Bloom's taxonomy only.
Analyze cognitive level alignment between learning objectives and slide content.
Be constructive and specific.
Output ONLY a single valid JSON object. No markdown, no trailing commas, no comments, no text before/after JSON.`;

const BLOOM_LEVELS_DOC = `
Revised Bloom levels (low → high):
- remember: recall facts, terms, definitions
- understand: explain, summarize, classify, compare
- apply: use concepts in examples, implement patterns, solve standard problems
- analyze: break down designs, compare trade-offs, diagnose structure
- evaluate: critique choices, justify decisions, assess quality
- create: design solutions, propose architectures, synthesize new structures
`;

export function buildEvaluationUserPrompt(params: {
  lectureTitle: string;
  slidesJson: string;
  learningObjectives?: string[];
}): string {
  const objectivesBlock =
    params.learningObjectives && params.learningObjectives.length > 0
      ? `\nLearning objectives:\n${params.learningObjectives.map((o) => `- ${o}`).join("\n")}\n`
      : "";

  return `Evaluate this slide deck for "${params.lectureTitle}" using Revised Bloom's taxonomy only.
${objectivesBlock}
Slides (compact):
${params.slidesJson}

${BLOOM_LEVELS_DOC}

Return JSON:
{
  "alignmentScore": number (0-100),
  "dominantLevel": "remember" | "understand" | "apply" | "analyze" | "evaluate" | "create",
  "distribution": {
    "remember": number, "understand": number, "apply": number,
    "analyze": number, "evaluate": number, "create": number
  },
  "objectiveAlignments": [{
    "objective": string,
    "expectedLevel": "remember" | "understand" | "apply" | "analyze" | "evaluate" | "create",
    "observedLevel": "remember" | "understand" | "apply" | "analyze" | "evaluate" | "create",
    "status": "aligned" | "partially_aligned" | "misaligned",
    "rationale": string
  }],
  "slideTags": [{ "slideTitle": string, "primaryLevel": string, "evidence": string }],
  "gaps": string[],
  "suggestions": string[]
}

Rules:
- Valid JSON only: double quotes, no trailing commas, complete all arrays/objects
- Keep rationale/evidence/gaps/suggestions concise (1 sentence each)
- Include 3–8 slideTags max
- distribution values are percentages of deck cognitive demand and should sum to 100
- For each learning objective, infer expectedLevel from its wording, then compare to what slides actually teach
- status = aligned when observedLevel matches expectedLevel; partially_aligned when one level off; misaligned when two or more levels off
- For MSc-level CS lectures, flag gaps when distribution is >60% remember+understand without apply/analyze content
- Do not evaluate clarity, readability, or visual design — Bloom taxonomy only`;
}
