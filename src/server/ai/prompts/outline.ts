import { DEFAULT_TARGET_SLIDES } from "@/lib/lecture-timing";

export const OUTLINE_SYSTEM_PROMPT = `You are an expert computer science professor and curriculum designer.
Generate a structured university lecture outline in JSON format.
Focus on clear learning progression, practical examples, and CS pedagogy.
Design the outline for a slide deck of approximately ${DEFAULT_TARGET_SLIDES} slides (one main idea per slide).
Output ONLY valid JSON matching the requested schema.`;

export function buildOutlineUserPrompt(params: {
  title: string;
  description?: string;
  targetSlideCount?: number;
  courseFrameworkPrompt?: string | null;
  semesterWeek?: number;
}): string {
  const targetSlides = params.targetSlideCount ?? DEFAULT_TARGET_SLIDES;
  const frameworkBlock = params.courseFrameworkPrompt
    ? `\n\n---\nCOURSE FRAMEWORK (follow strictly):\n${params.courseFrameworkPrompt}\n---\n`
    : "";

  const weekLine =
    params.semesterWeek != null ? `Semester week: ${params.semesterWeek}\n` : "";

  return `Create a lecture outline with the following parameters:
Title: ${params.title}
Description: ${params.description ?? "N/A"}
${weekLine}Target slide count: ${targetSlides}
${frameworkBlock}

Return JSON with this structure:
{
  "title": string,
  "summary": string,
  "learningObjectives": string[],
  "targetSlideCount": ${targetSlides},
  "estimatedStudyMinutes": number (realistic self-study time in minutes),
  "sections": [{
    "title": string,
    "learningGoals": string[],
    "subsections": [{
      "title": string,
      "keyPoints": string[],
      "examples": string[],
      "suggestedDiagram": string
    }],
    "exercises": string[]
  }],
  "suggestedResources": string[],
  "assessmentIdeas": string[],
  "courseFrameworkSlug": string | null,
  "semesterWeek": number | null
}

If a course framework requires fixed lecture sections, use those exact section titles in "sections".
Map subsections and keyPoints to support slide generation. Include lab preparation in exercises and assessmentIdeas.`;
}
