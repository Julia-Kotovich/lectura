/** LLM prompt for CQI v1 lecture metrics: OC, TC, ALR. Keep in sync with notebook Step 5. */

export const CQI_ENGAGEMENT_SYSTEM_PROMPT = `You are an expert CS curriculum reviewer measuring constructive alignment.
Estimate objective coverage, topic coverage, and active-learning ratio for a lecture deck.
Output ONLY valid JSON. Be conservative and evidence-based.`;

export function buildCqiEngagementUserPrompt(params: {
  lectureTitle: string;
  learningObjectives: string[];
  plannedTopics: string[];
  slidesJson: string;
}): string {
  const objectives =
    params.learningObjectives.length > 0
      ? params.learningObjectives.map((o) => `- ${o}`).join("\n")
      : "N/A";
  const topics =
    params.plannedTopics.length > 0
      ? params.plannedTopics.map((t) => `- ${t}`).join("\n")
      : "N/A";

  return `Review lecture "${params.lectureTitle}".

Learning objectives:
${objectives}

Planned topics (from syllabus/lecture plan):
${topics}

Slides:
${params.slidesJson}

Return JSON:
{
  "objectiveCoverage": number (0-100, % of learning objectives clearly supported by slides),
  "topicCoverage": number (0-100, % of planned topics substantively covered),
  "activeLearningRatio": number (0-100, % of non-title slides requiring active/constructive student work: exercises, predict, discuss, implement, trace code, compare),
  "coveredObjectives": string[],
  "missingObjectives": string[],
  "coveredTopics": string[],
  "missingTopics": string[],
  "activeSlideCount": number,
  "contentSlideCount": number
}

Rules:
- Title/agenda/recap slides do not count as active learning
- Code demos without student task = passive unless slide asks students to trace/predict/implement
- Coverage requires substantive treatment, not a single mention`;
}
