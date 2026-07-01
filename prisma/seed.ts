import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const templates = [
  {
    slug: "intro-operating-systems",
    title: "Introduction to Operating Systems",
    description: "Foundational OS lecture for CS undergraduates",
    category: "Systems",
    difficulty: "INTERMEDIATE" as const,
    outline: {
      title: "Introduction to Operating Systems",
      summary: "Overview of OS purpose, structure, and core abstractions.",
      learningObjectives: [
        "Define operating system responsibilities",
        "Explain kernel vs user mode",
        "Identify major OS subsystems",
      ],
      sections: [
        {
          title: "What is an OS?",
          durationMinutes: 15,
          learningGoals: ["Define OS", "List OS services"],
          subsections: [
            {
              title: "Role of the OS",
              keyPoints: ["Resource manager", "Abstraction layer", "Protection"],
              examples: ["Linux, Windows, macOS"],
            },
          ],
        },
        {
          title: "Processes",
          durationMinutes: 25,
          learningGoals: ["Explain process model", "Describe process states"],
          subsections: [
            {
              title: "Process lifecycle",
              keyPoints: ["PCB", "Context switch", "Scheduling"],
              suggestedDiagram: "Process state diagram",
            },
          ],
        },
      ],
    },
  },
  {
    slug: "algorithms-complexity",
    title: "Algorithm Analysis & Big-O",
    category: "Algorithms",
    difficulty: "INTERMEDIATE" as const,
    outline: {
      title: "Algorithm Analysis & Big-O",
      summary: "Asymptotic analysis and complexity classes for CS students.",
      learningObjectives: [
        "Define Big-O notation",
        "Analyze simple algorithms",
        "Compare growth rates",
      ],
      sections: [
        {
          title: "Asymptotic notation",
          durationMinutes: 20,
          learningGoals: ["Use Big-O", "Identify dominant terms"],
          subsections: [
            {
              title: "Big-O definition",
              keyPoints: ["Upper bound", "Worst case", "Ignore constants"],
              examples: ["O(n)", "O(n log n)", "O(n²)"],
            },
          ],
        },
      ],
    },
  },
  {
    slug: "intro-machine-learning",
    title: "Introduction to Machine Learning",
    category: "AI/ML",
    difficulty: "ADVANCED" as const,
    outline: {
      title: "Introduction to Machine Learning",
      summary: "Supervised learning basics and model evaluation.",
      learningObjectives: [
        "Differentiate supervised vs unsupervised learning",
        "Explain train/validation/test splits",
        "Interpret basic metrics",
      ],
      sections: [
        {
          title: "ML pipeline",
          durationMinutes: 30,
          learningGoals: ["Describe ML workflow"],
          subsections: [
            {
              title: "From data to model",
              keyPoints: ["Features", "Labels", "Training", "Inference"],
            },
          ],
        },
      ],
    },
  },
  {
    slug: "oop-bachelor-week-1",
    title: "OOP in CS — Week 1: Paradigms & OOP",
    description: "Bachelor OOP semester course — introduction lecture + lab",
    category: "Programming",
    difficulty: "INTERMEDIATE" as const,
    outline: {
      title: "Introduction to Programming Paradigms & OOP",
      summary: "Week 1 lecture: paradigms, OOP motivation, first classes. Lab: environment setup.",
      courseFrameworkSlug: "oop-bachelor",
      semesterWeek: 1,
      targetSlideCount: 22,
      learningObjectives: [
        "Compare procedural vs object-oriented paradigms",
        "Explain classes and objects at a high level",
        "Prepare for lab: environment setup and first classes",
      ],
      sections: [
        {
          title: "Introduction & Context",
          durationMinutes: 5,
          learningGoals: ["Recap prior programming", "Motivate OOP"],
          subsections: [
            {
              title: "Why OOP in CS",
              keyPoints: ["Industry relevance", "Learning objectives"],
            },
          ],
        },
        {
          title: "Core Theory Block #1",
          durationMinutes: 12,
          learningGoals: ["Define paradigm", "Introduce OOP pillars preview"],
          subsections: [
            {
              title: "Programming paradigms",
              keyPoints: ["Procedural", "OOP", "When to use each"],
            },
          ],
        },
      ],
    },
  },
];

async function main() {
  for (const t of templates) {
    await db.lectureTemplate.upsert({
      where: { slug: t.slug },
      update: {
        title: t.title,
        description: t.description,
        category: t.category,
        difficulty: t.difficulty,
        outline: t.outline,
      },
      create: {
        slug: t.slug,
        title: t.title,
        description: t.description,
        category: t.category,
        difficulty: t.difficulty,
        outline: t.outline,
      },
    });
  }
  console.log(`Seeded ${templates.length} lecture templates`);
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
