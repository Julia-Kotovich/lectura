export const EVALUATION_SYSTEM_PROMPT = `You are an expert instructional designer evaluating CS lecture slides.
Score the deck on clarity, information density, readability, teaching effectiveness, and visual balance.
Be constructive and specific. Output ONLY valid JSON.`;

export function buildEvaluationUserPrompt(params: {
  lectureTitle: string;
  slidesJson: string;
}): string {
  return `Evaluate this slide deck for "${params.lectureTitle}".

Slides:
${params.slidesJson}

Return JSON:
{
  "overallScore": number (0-100),
  "dimensions": [{ "name": string, "score": number, "rationale": string }],
  "strengths": string[],
  "warnings": string[],
  "suggestions": string[]
}

Dimension names must include: clarity, information_density, readability, teaching_effectiveness, visual_balance`;
}
