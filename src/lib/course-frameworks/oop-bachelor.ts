/** OOP bachelor course — reference framework for AI generation and semester UI */

export const OOP_BACHELOR_SLUG = "oop-bachelor";

export const OOP_TARGET_SLIDES_PER_LECTURE = 22;

export const OOP_LECTURE_SECTIONS = [
  { title: "Introduction & Context", durationMinutes: 5 },
  { title: "Core Theory Block #1", durationMinutes: 12 },
  { title: "Guided Example / Visualization", durationMinutes: 8 },
  { title: "Core Theory Block #2", durationMinutes: 12 },
  { title: "Interactive Thinking Segment", durationMinutes: 5 },
  { title: "Real-World Engineering Context", durationMinutes: 5 },
  { title: "Summary & Transition", durationMinutes: 5 },
] as const;

export const OOP_SEMESTER_WEEKS = [
  { week: 1, lecture: "Introduction to Programming Paradigms & OOP", lab: "Environment setup + first classes" },
  { week: 2, lecture: "Classes and Objects", lab: "Build simple object models" },
  { week: 3, lecture: "Encapsulation & Access Modifiers", lab: "Refactor unsafe code into encapsulated structures" },
  { week: 4, lecture: "Constructors & Object Lifecycle", lab: "Design multi-object systems" },
  { week: 5, lecture: "Inheritance", lab: "Build inheritance hierarchies" },
  { week: 6, lecture: "Polymorphism", lab: "Dynamic dispatch exercises" },
  { week: 7, lecture: "Interfaces & Abstract Classes", lab: "Design flexible architectures" },
  { week: 8, lecture: "Composition vs Inheritance", lab: "Refactor systems using composition" },
  { week: 9, lecture: "Exception Handling", lab: "Build resilient applications" },
  { week: 10, lecture: "Collections & Generics", lab: "Implement data-driven applications" },
  { week: 11, lecture: "SOLID Principles & Design Patterns", lab: "Apply clean architecture principles" },
  { week: 12, lecture: "Mini Project Architecture", lab: "Project work and consultations" },
  { week: 13, lecture: "Project Presentations / Review", lab: "Presentations and course wrap-up" },
] as const;

/** Condensed framework for AI system prompts (full reference in docs/course-frameworks/oop-bachelor.md) */
export const OOP_BACHELOR_AI_FRAMEWORK = `
COURSE CONTEXT (Object-Oriented Programming — Bachelor CS, European university):
- 1 semester (12–14 weeks): 1 lecture/week (60 min) + 1 lab/week (60–120 min)
- Lectures: conceptual (theory, examples, intuition). Labs: implementation (coding, debugging)
- Progressive complexity; each week builds on prior weeks; maintain continuity lecture ↔ lab ↔ homework

REQUIRED 60-MINUTE LECTURE OUTLINE (use these 7 sections exactly, with timing):
1. Introduction & Context (5 min) — recap, motivation, learning objectives
2. Core Theory Block #1 (10–15 min) — first major concept, definitions, diagrams
3. Guided Example / Visualization (5–10 min) — code walkthrough, UML, memory model
4. Core Theory Block #2 (10–15 min) — deeper concepts, tradeoffs, best practices
5. Interactive Thinking Segment (5 min) — questions, predict output, design discussion
6. Real-World Engineering Context (5 min) — architecture, APIs, frameworks, why it matters
7. Summary & Transition (5 min) — recap, lab prep, preview next week

LAB SESSION (mention in exercises / assessmentIdeas):
- Warm-up (10–15 min) → Guided coding (20–30 min) → Independent task (20–40 min) → Review (10 min)

PEDAGOGY:
- Max 1–3 major concepts per lecture; avoid overload; reinforce previous weeks
- Connect theory to professional software engineering

SLIDES (for this framework):
- Target 18–25 slides per 60-min lecture (default ${OOP_TARGET_SLIDES_PER_LECTURE})
- Ratio: ~40% conceptual, 30% diagrams/visuals, 20% code (minimal readable), 10% recap/questions
- Each slide maps to a lecture section; support one learning objective; low text density
`.trim();

export function matchesOopCourse(title: string, description?: string | null): boolean {
  const text = `${title} ${description ?? ""}`.toLowerCase();
  return (
    /\boop\b/.test(text) ||
    /object[- ]oriented/.test(text) ||
    /объектно[- ]ориентирован/.test(text)
  );
}
