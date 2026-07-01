import type { LectureOutline } from "@/lib/schemas/outline";
import type { SlideDeckDraft, SlideDocument } from "@/lib/schemas/slide";
import {
  OOP_BACHELOR_SLUG,
  OOP_LECTURE_SECTIONS,
  OOP_SEMESTER_WEEKS,
  OOP_TARGET_SLIDES_PER_LECTURE,
} from "@/lib/course-frameworks";
import { DEFAULT_TARGET_SLIDES, formatStudyDuration } from "@/lib/lecture-timing";

export function buildMockOutline(params: {
  title: string;
  description?: string;
  durationMinutes: number;
  targetSlideCount?: number;
}): LectureOutline {
  const target = params.targetSlideCount ?? DEFAULT_TARGET_SLIDES;
  const perSection = Math.max(1, Math.floor((target - 1) / 3));

  const sectionTemplates = [
    {
      title: "Introduction & motivation",
      goals: ["Explain why this topic matters", "Connect to prior courses"],
      points: ["Real-world applications", "Course roadmap"],
    },
    {
      title: "Core concepts",
      goals: ["Define key terminology", "Build mental models"],
      points: ["Definitions", "Architecture / structure", "Common patterns"],
    },
    {
      title: "Deep dive & examples",
      goals: ["Walk through representative examples", "Highlight pitfalls"],
      points: ["Worked example", "Edge cases", "Best practices"],
    },
  ];

  const sections = sectionTemplates.flatMap((template, si) =>
    Array.from({ length: si === 1 ? perSection + (target % 3) : perSection }, (_, i) => ({
      title: `${template.title}${perSection > 1 ? ` (${i + 1})` : ""}`,
      durationMinutes: Math.round(params.durationMinutes / target),
      learningGoals: template.goals,
      subsections: [
        {
          title: template.title,
          keyPoints: template.points,
          examples: [`${params.title} example ${si + 1}.${i + 1}`],
          suggestedDiagram: `Diagram for ${template.title}`,
        },
      ],
      exercises: [`Short check: ${template.title}`],
    })),
  ).slice(0, Math.max(target - 1, 3));

  const studyMinutes = Math.max(target * 7, params.durationMinutes);

  return {
    title: params.title,
    summary:
      params.description ??
      `A ${params.durationMinutes}-minute lecture on ${params.title}, structured for ${target} slides.`,
    learningObjectives: [
      `Understand fundamentals of ${params.title}`,
      "Apply concepts to small practical problems",
      "Evaluate trade-offs in typical CS scenarios",
    ],
    sections,
    suggestedResources: [`Course notes: ${params.title}`, "Recommended textbook chapter"],
    assessmentIdeas: ["5-question recap quiz", "One coding or design exercise"],
    targetSlideCount: target,
    estimatedStudyMinutes: studyMinutes,
    estimatedPresentationMinutes: params.durationMinutes,
  };
}

export function buildMockOopOutline(params: {
  title: string;
  description?: string;
  durationMinutes: number;
  semesterWeek?: number;
}): LectureOutline {
  const week = params.semesterWeek ?? 1;
  const weekPlan = OOP_SEMESTER_WEEKS.find((w) => w.week === week) ?? OOP_SEMESTER_WEEKS[0];
  const target = OOP_TARGET_SLIDES_PER_LECTURE;

  const sections = OOP_LECTURE_SECTIONS.map((section) => ({
    title: section.title,
    durationMinutes: section.durationMinutes,
    learningGoals: [`Cover ${weekPlan.lecture} — ${section.title}`],
    subsections: [
      {
        title: section.title,
        keyPoints: [
          `Topic: ${weekPlan.lecture}`,
          section.title.includes("Example")
            ? "Code walkthrough and UML"
            : "Definitions and intuition",
        ],
        examples: [`${params.title} — ${section.title}`],
        suggestedDiagram: section.title.includes("Visualization")
          ? "UML class diagram or object diagram"
          : undefined,
      },
    ],
    exercises:
      section.title === "Summary & Transition"
        ? [`Lab prep: ${weekPlan.lab}`, "Preview next week"]
        : [`Think-pair: ${section.title}`],
  }));

  return {
    title: params.title,
    summary:
      params.description ??
      `Week ${week}: ${weekPlan.lecture}. Lab: ${weekPlan.lab}. Bachelor OOP course (60 min lecture + lab).`,
    learningObjectives: [
      `Explain core ideas of ${weekPlan.lecture}`,
      "Connect concepts to prior weeks",
      `Prepare for lab: ${weekPlan.lab}`,
    ],
    sections,
    suggestedResources: ["Course textbook — OOP chapter", "Official language docs"],
    assessmentIdeas: [
      `Lab: ${weekPlan.lab}`,
      "5-minute conceptual recap quiz",
    ],
    targetSlideCount: target,
    estimatedStudyMinutes: target * 7,
    estimatedPresentationMinutes: params.durationMinutes,
    courseFrameworkSlug: OOP_BACHELOR_SLUG,
    semesterWeek: week,
  };
}

export function buildMockSlidesFromOutline(
  lectureTitle: string,
  outline: LectureOutline,
): SlideDeckDraft {
  const target = outline.targetSlideCount ?? DEFAULT_TARGET_SLIDES;
  const slides: SlideDocument[] = [];

  slides.push({
    id: "mock-title",
    title: lectureTitle,
    layout: "title",
    blocks: [
      { id: "b-title", type: "heading", content: lectureTitle },
      {
        id: "b-sub",
        type: "text",
        content: `${target} slides · ${formatStudyDuration(outline.estimatedStudyMinutes ?? target * 7)} study`,
      },
    ],
    speakerNotes: outline.summary,
  });

  const topics: { title: string; points: string[] }[] = [];
  for (const section of outline.sections) {
    topics.push({
      title: section.title,
      points: section.learningGoals,
    });
    for (const sub of section.subsections) {
      topics.push({
        title: sub.title,
        points: sub.keyPoints,
      });
    }
  }

  let topicIndex = 0;
  while (slides.length < target) {
    const topic = topics[topicIndex % topics.length] ?? {
      title: `Topic ${slides.length}`,
      points: ["Key idea", "Example", "Takeaway"],
    };
    topicIndex++;

    slides.push({
      id: `mock-slide-${slides.length}`,
      title: topic.title,
      layout: slides.length % 3 === 0 ? "split" : "content",
      blocks: [
        { id: `h-${slides.length}`, type: "heading", content: topic.title },
        {
          id: `bl-${slides.length}`,
          type: "bullets",
          content: { items: topic.points.slice(0, 5) },
        },
      ],
      speakerNotes: `Cover ${topic.title} with a concrete example.`,
    });
  }

  return { slides: slides.slice(0, target) };
}
