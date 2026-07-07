import type { LectureOutline } from "@/lib/schemas/outline";
import type { Program, ProgramModule } from "../types";

const HANDBOOK = "CSSE_MSc_Handbook_ Fall 2025_V1_3.pdf";
const LECTURE_MIN = 90;

type ModuleSpec = {
  slug: string;
  code: string;
  title: string;
  summary: string;
  semester: number;
  cp: number;
  track: string;
  status: "mandatory" | "elective";
  learningObjectives: string[];
  sections: LectureOutline["sections"];
  resources?: string[];
  syllabusPath?: string;
  targetSlideCount?: number;
  estimatedPresentationMinutes?: number;
  estimatedStudyMinutes?: number;
};

function makeOutline(spec: ModuleSpec): LectureOutline {
  const slideCount = spec.targetSlideCount ?? (spec.cp >= 5 ? 14 : 10);
  const presentationMinutes = spec.estimatedPresentationMinutes ?? LECTURE_MIN;
  const studyMinutes = spec.estimatedStudyMinutes ?? slideCount * 8;
  return {
    title: spec.title,
    summary: spec.summary,
    learningObjectives: spec.learningObjectives,
    sections: spec.sections,
    suggestedResources: spec.resources ?? [
      `Constructor University CSSE MSc Handbook (Fall 2025) — ${spec.code}`,
      "https://constructor.university/programs/graduate-education/computer-science-software-engineering",
    ],
    assessmentIdeas: [
      "Portfolio / written exam per module handbook (Constructive Alignment)",
      "Applied project or lab report tied to module ILOs",
    ],
    targetSlideCount: slideCount,
    estimatedPresentationMinutes: presentationMinutes,
    estimatedStudyMinutes: studyMinutes,
    courseFrameworkSlug: "default",
    semesterWeek: spec.semester,
  };
}

function toModule(spec: ModuleSpec): ProgramModule {
  const outline = makeOutline(spec);
  return {
    slug: spec.slug,
    code: spec.code,
    title: outline.title,
    summary: outline.summary,
    outline,
    semester: spec.semester,
    cp: spec.cp,
    track: spec.track,
    status: spec.status,
    sourcePdf: HANDBOOK,
    syllabusPath: spec.syllabusPath,
  };
}

const MODULES: ModuleSpec[] = [
  {
    slug: "mcsse-se-01-software-construction",
    code: "MCSSE-SE-01",
    title: "Software Construction, Architecture and Engineering",
    summary:
      "Mandatory Semester 1 (5 CP). Foundational Software Engineering module spanning object-oriented construction, abstraction, contracts, design patterns, architecture, and engineering process. Recommended delivery model: 10 lectures x 90 minutes.",
    semester: 1,
    cp: 5,
    track: "Software Engineering",
    status: "mandatory",
    learningObjectives: [
      "Use object-oriented techniques to produce high-quality software",
      "Apply inheritance, genericity, information hiding, and Design by Contract appropriately",
      "Reason about software reuse, modularity, and maintainability",
      "Apply fundamental design patterns in context rather than mechanically",
      "Connect class design decisions with architectural structure",
      "Understand how agile methods and requirements engineering influence construction choices",
    ],
    sections: [
      {
        title: "Lecture 1. Course Framing and the Role of Software Construction",
        durationMinutes: 90,
        learningGoals: [
          "Explain what software construction covers within software engineering",
          "Relate code quality to architecture, process, and maintainability",
        ],
        subsections: [
          {
            title: "Why construction matters",
            keyPoints: [
              "Software quality is more than functional correctness",
              "Construction, architecture, and engineering reinforce each other",
              "Long-term maintainability drives design choices",
            ],
            suggestedDiagram: "Software lifecycle overview showing code, design, architecture, and process",
          },
        ],
        exercises: [
          "Compare two working code snippets and discuss which one is more readable and evolvable",
        ],
      },
      {
        title: "Lecture 2. Abstraction, ADTs, and Class Design",
        durationMinutes: 90,
        learningGoals: [
          "Use abstraction to control complexity",
          "Separate interface design from implementation decisions",
        ],
        subsections: [
          {
            title: "Encapsulation and class responsibilities",
            keyPoints: [
              "Abstract data types express stable responsibilities",
              "Classes are design tools, not just syntax",
              "Information hiding supports safe change",
            ],
            suggestedDiagram: "ADT-to-class mapping and interface versus implementation boundary",
          },
        ],
        exercises: [
          "Redesign a poorly structured class into a cleaner abstraction with clearer responsibilities",
        ],
      },
      {
        title: "Lecture 3. Inheritance, Polymorphism, and Dynamic Binding",
        durationMinutes: 90,
        learningGoals: [
          "Distinguish subtyping from inheritance",
          "Evaluate when inheritance helps and when composition is safer",
        ],
        subsections: [
          {
            title: "Variation mechanisms in OOP",
            keyPoints: [
              "Dynamic binding and substitution shape behavior reuse",
              "Extension and specialization must preserve behavioral consistency",
              "Composition can avoid fragile inheritance hierarchies",
            ],
            suggestedDiagram: "Inheritance hierarchy with dynamic dispatch and subclassing versus composition",
          },
        ],
        exercises: [
          "Review an inheritance-heavy design and propose a composition-based alternative",
        ],
      },
      {
        title: "Lecture 4. Genericity, Reuse, and Component Thinking",
        durationMinutes: 90,
        learningGoals: [
          "Design abstractions for reuse without losing clarity",
          "Balance extension points with stable interfaces",
        ],
        subsections: [
          {
            title: "Reusable component design",
            keyPoints: [
              "Genericity enables parameterized abstractions",
              "Reuse requires thoughtful API and component design",
              "Libraries and frameworks embody reusable contracts",
            ],
            suggestedDiagram: "Generic container abstraction and reusable component model",
          },
        ],
        exercises: [
          "Identify which parts of a small module should be generalized and which should remain concrete",
        ],
      },
      {
        title: "Lecture 5. Design by Contract and Correctness",
        durationMinutes: 90,
        learningGoals: [
          "Use contracts to specify and reason about behavior precisely",
          "Relate correctness arguments to software design decisions",
        ],
        subsections: [
          {
            title: "Precise software behavior",
            keyPoints: [
              "Preconditions, postconditions, and invariants formalize responsibilities",
              "Contracts clarify client and supplier obligations",
              "Eiffel provides a reference notation for precise design",
            ],
            suggestedDiagram: "Contract relationship between caller and callee with invariant-preserving states",
          },
        ],
        exercises: [
          "Write contracts for a stack, queue, or bank-account abstraction",
        ],
      },
      {
        title: "Lecture 6. Designing for Reliability and Maintainability",
        durationMinutes: 90,
        learningGoals: [
          "Connect local code decisions with long-term maintainability",
          "Use quality attributes such as coupling and cohesion to guide refactoring",
        ],
        subsections: [
          {
            title: "Code quality under change",
            keyPoints: [
              "Coupling and cohesion shape maintainability",
              "Refactoring improves structure without changing intent",
              "Code smells reveal risks to readability and evolvability",
            ],
            suggestedDiagram: "Tight versus loose coupling and cohesion comparison across class designs",
          },
        ],
        exercises: [
          "Review a code fragment and identify maintainability risks and refactoring opportunities",
        ],
      },
      {
        title: "Lecture 7. Fundamental Design Patterns I",
        durationMinutes: 90,
        learningGoals: [
          "Explain why patterns exist as reusable design knowledge",
          "Choose patterns according to concrete variation points",
        ],
        subsections: [
          {
            title: "Observer, Strategy, and behavioral flexibility",
            keyPoints: [
              "Patterns capture recurring solutions without replacing judgment",
              "Observer and Strategy manage change in different ways",
              "Template Method or Command can encode stable workflows",
            ],
            suggestedDiagram: "Observer collaboration flow and Strategy substitution diagram",
          },
        ],
        exercises: [
          "Match a short problem statement to a suitable pattern and justify the choice",
        ],
      },
      {
        title: "Lecture 8. Fundamental Design Patterns II",
        durationMinutes: 90,
        learningGoals: [
          "Deepen pattern literacy with structural and creational patterns",
          "Recognize when patterns add clarity and when they cause overengineering",
        ],
        subsections: [
          {
            title: "Creational and structural trade-offs",
            keyPoints: [
              "Visitor, Factory, and Adapter solve different sources of rigidity",
              "Facade and related patterns can simplify architectural boundaries",
              "Patterns must justify their abstraction cost",
            ],
            suggestedDiagram: "Factory creation flow, Visitor traversal structure, and Adapter versus Facade comparison",
          },
        ],
        exercises: [
          "Decide whether a proposed pattern use adds value or unnecessary complexity",
        ],
      },
      {
        title: "Lecture 9. Software Architecture for Large Systems",
        durationMinutes: 90,
        learningGoals: [
          "Connect class-level design with system-level architecture",
          "Use architectural decomposition to support quality attributes",
        ],
        subsections: [
          {
            title: "From modules to systems",
            keyPoints: [
              "Layers, components, and boundaries organize large systems",
              "Architectural choices shape modifiability and communication",
              "Documentation is part of architectural design",
            ],
            suggestedDiagram: "Layered architecture, component-and-connector view, and architectural boundary map",
          },
        ],
        exercises: [
          "Sketch a high-level architecture for a medium-size product and explain its main boundaries",
        ],
      },
      {
        title: "Lecture 10. Engineering Beyond Code: Agile, Requirements, and Delivery",
        durationMinutes: 90,
        learningGoals: [
          "Connect construction practices with delivery and coordination",
          "Relate requirements to implementation and iterative development",
        ],
        subsections: [
          {
            title: "Process as part of engineering",
            keyPoints: [
              "Correct code alone is insufficient without requirements and delivery discipline",
              "Agile development and requirements engineering guide implementation choices",
              "Traceability links requirements, design decisions, and delivered software",
            ],
            suggestedDiagram: "Requirements-to-code traceability path and iterative feedback loops",
          },
        ],
        exercises: [
          "Take a small feature request and trace it from requirement to design decision to implementation task",
        ],
      },
    ],
    resources: [
      "Bertrand Meyer — Touch of Class",
      "Carlo Ghezzi, Mehdi Jazayeri, Dino Mandrioli — Fundamentals of Software Engineering",
      "Frank Buschmann et al. — Pattern-Oriented Software Architecture",
      "Len Bass, Paul Clements, Rick Kazman — Software Architecture in Practice",
    ],
    syllabusPath: "docs/syllabi/software-construction-architecture-engineering.md",
    targetSlideCount: 200,
    estimatedPresentationMinutes: 900,
    estimatedStudyMinutes: 1600,
  },
  {
    slug: "mcsse-se-02-quality-engineering",
    code: "MCSSE-SE-02",
    title: "Quality Engineering",
    summary:
      "Mandatory Semester 1 (5 CP). Testing and analysis techniques to verify software quality during and after development; quality planning for complex systems.",
    semester: 1,
    cp: 5,
    track: "Software Engineering",
    status: "mandatory",
    learningObjectives: [
      "Manage a software quality process",
      "Select and implement testing and analysis activities",
      "Design and monitor a suitable quality process",
    ],
    sections: [
      {
        title: "Principles of software quality",
        durationMinutes: 25,
        learningGoals: ["Understand why quality must be verified, not assumed"],
        subsections: [
          {
            title: "Quality process",
            keyPoints: ["Verification vs validation", "Role of test designer and quality manager"],
          },
        ],
      },
      {
        title: "Testing techniques",
        durationMinutes: 35,
        learningGoals: ["Apply structural and behavioral testing"],
        subsections: [
          {
            title: "Core techniques",
            keyPoints: ["Unit testing (JUnit)", "Complementarities among techniques", "Portfolio examination"],
          },
        ],
      },
      {
        title: "Program analysis",
        durationMinutes: 20,
        learningGoals: ["Choose analysis approaches for different failure modes"],
        subsections: [
          {
            title: "Static and dynamic analysis",
            keyPoints: ["Analysis principles", "Integrating testing into project workflow"],
          },
        ],
      },
    ],
  },
  {
    slug: "mcsse-se-03-architectural-strategy",
    code: "MCSSE-SE-03",
    title: "Architectural Strategy",
    summary:
      "Mandatory Semester 2 (5 CP). Software architectures for large systems: design, recovery, analysis, documentation, and quality-attribute trade-offs.",
    semester: 2,
    cp: 5,
    track: "Software Engineering",
    status: "mandatory",
    learningObjectives: [
      "Design complex systems using components and connectors",
      "Use UML to represent architectural concepts",
      "Document and justify design decisions via quality attributes",
    ],
    sections: [
      {
        title: "Software architecture foundations",
        durationMinutes: 30,
        learningGoals: ["Understand architecture as a strategic design activity"],
        subsections: [
          {
            title: "Views and styles",
            keyPoints: ["Components and connectors", "Quality attributes (performance, modifiability, …)"],
          },
        ],
      },
      {
        title: "Modeling and documentation",
        durationMinutes: 30,
        learningGoals: ["Communicate architecture to stakeholders"],
        subsections: [
          {
            title: "UML and architecture description",
            keyPoints: ["Architecture recovery", "Portfolio assessment"],
          },
        ],
      },
    ],
    resources: ["Pautasso — Software Architecture", "Bass, Clements, Kazman — SA in Practice"],
  },
  {
    slug: "mcsse-se-04-advances-in-se",
    code: "MCSSE-SE-04",
    title: "Advances in Software Engineering",
    summary:
      "Elective CORE (5 CP). Formal verification, requirements engineering, agile at scale, and advanced SE methods. Prerequisite: MCSSE-SE-01.",
    semester: 2,
    cp: 5,
    track: "Software Engineering",
    status: "elective",
    learningObjectives: [
      "Apply axiomatic semantics and program proving",
      "Apply requirements techniques (use cases, OO requirements)",
      "Combine agile methods with process models such as CMMI",
    ],
    sections: [
      {
        title: "Formal verification",
        durationMinutes: 35,
        learningGoals: ["Prove program correctness with supported tools"],
        subsections: [
          {
            title: "Axiomatic semantics & AutoProof",
            keyPoints: ["Floyd-Hoare-Dijkstra", "Model checking preview", "Abstract interpretation"],
          },
        ],
      },
      {
        title: "Requirements and agile at scale",
        durationMinutes: 30,
        learningGoals: ["Balance agility with engineering discipline"],
        subsections: [
          {
            title: "Requirements engineering",
            keyPoints: ["Use cases", "Meyer — Agile! productive vs harmful ideas"],
          },
        ],
      },
    ],
  },
  {
    slug: "mde-cs-04-advanced-databases",
    code: "MDE-CS-04",
    title: "Advanced Databases",
    summary: "Elective CORE (5 CP). Advanced database concepts for modern data-intensive systems (lecture + lab).",
    semester: 2,
    cp: 5,
    track: "Software Engineering",
    status: "elective",
    learningObjectives: [
      "Design and query advanced database schemas",
      "Apply database techniques in realistic lab projects",
    ],
    sections: [
      {
        title: "Advanced data modeling",
        durationMinutes: 40,
        learningGoals: ["Go beyond introductory relational databases"],
        subsections: [
          {
            title: "Lecture + lab",
            keyPoints: ["Written examination + laboratory report", "Integration with SE systems"],
          },
        ],
      },
    ],
  },
  {
    slug: "mcsse-cyb-01-cryptography",
    code: "MCSSE-CYB-01",
    title: "Cryptography",
    summary:
      "Cybersecurity main content (5 CP). Entry module for the Cybersecurity specialization; mandatory minimum 5 CP from CYB for all students.",
    semester: 1,
    cp: 5,
    track: "Cybersecurity",
    status: "elective",
    learningObjectives: [
      "Design and implement cryptographic protocols",
      "Evaluate security properties of cryptographic schemes",
    ],
    sections: [
      {
        title: "Cryptographic foundations",
        durationMinutes: 45,
        learningGoals: ["Understand primitives used in secure systems"],
        subsections: [
          {
            title: "Core topics",
            keyPoints: ["Symmetric and asymmetric crypto", "Hashes and signatures", "Written examination"],
          },
        ],
      },
    ],
  },
  {
    slug: "mcsse-cyb-02-system-security",
    code: "MCSSE-CYB-02",
    title: "System Security",
    summary: "Cybersecurity main content (5 CP). Security methods and tools at operating-system and platform level.",
    semester: 2,
    cp: 5,
    track: "Cybersecurity",
    status: "elective",
    learningObjectives: ["Analyze and harden system-level attack surfaces"],
    sections: [
      {
        title: "Platform security",
        durationMinutes: 45,
        learningGoals: ["Secure systems against common exploits"],
        subsections: [
          {
            title: "Threats and defenses",
            keyPoints: ["Access control", "Memory safety", "System hardening"],
          },
        ],
      },
    ],
  },
  {
    slug: "mcsse-cyb-03-network-security",
    code: "MCSSE-CYB-03",
    title: "Network Security",
    summary: "Cybersecurity main content (5 CP). Network-level security technologies and protocols.",
    semester: 3,
    cp: 5,
    track: "Cybersecurity",
    status: "elective",
    learningObjectives: ["Secure networked applications and infrastructure"],
    sections: [
      {
        title: "Network threats and controls",
        durationMinutes: 45,
        learningGoals: ["Apply network security in practice"],
        subsections: [
          {
            title: "Protocols and monitoring",
            keyPoints: ["TLS/VPN concepts", "Intrusion patterns", "Defense in depth"],
          },
        ],
      },
    ],
  },
  {
    slug: "mdssb-socb-01-cybercriminology",
    code: "MDSSB-SOCB-01",
    title: "Cybercriminology",
    summary: "Cybersecurity elective (5 CP). Social and criminological perspective on cybercrime (seminar / term paper).",
    semester: 3,
    cp: 5,
    track: "Cybersecurity",
    status: "elective",
    learningObjectives: ["Analyze cybercrime from interdisciplinary angles"],
    sections: [
      {
        title: "Cybercrime landscape",
        durationMinutes: 40,
        learningGoals: ["Connect technical security with societal context"],
        subsections: [
          {
            title: "Seminar work",
            keyPoints: ["Term paper assessment", "Policy and offender models"],
          },
        ],
      },
    ],
  },
  {
    slug: "mcsse-ai-01-deep-learning",
    code: "MCSSE-AI-01",
    title: "Deep Learning",
    summary: "AI main content (5 CP). Neural networks and deep learning — minimum 5 CP from AI required for all CSSE students.",
    semester: 1,
    cp: 5,
    track: "Artificial Intelligence",
    status: "elective",
    learningObjectives: ["Build and train deep neural models for practical tasks"],
    sections: [
      {
        title: "Deep learning stack",
        durationMinutes: 50,
        learningGoals: ["Apply modern DL architectures"],
        subsections: [
          {
            title: "From perceptrons to deep nets",
            keyPoints: ["Backpropagation", "CNN/RNN overview", "Written examination"],
          },
        ],
      },
    ],
  },
  {
    slug: "mcsse-ai-02-intelligent-autonomous-systems",
    code: "MCSSE-AI-02",
    title: "Intelligent Autonomous Systems",
    summary: "AI main content (5 CP). Cyber-physical and autonomous systems integrating perception, planning, and control.",
    semester: 3,
    cp: 5,
    track: "Artificial Intelligence",
    status: "elective",
    learningObjectives: ["Design intelligent agents in physical environments"],
    sections: [
      {
        title: "Autonomy pipeline",
        durationMinutes: 45,
        learningGoals: ["Integrate sensing, reasoning, and actuation"],
        subsections: [
          {
            title: "System view",
            keyPoints: ["Robotics and autonomy", "Safety and uncertainty"],
          },
        ],
      },
    ],
  },
  {
    slug: "mcsse-ai-03-symbolic-ai",
    code: "MCSSE-AI-03",
    title: "Symbolic Artificial Intelligence",
    summary: "AI main content (5 CP). Logic-based AI, knowledge representation, and symbolic reasoning.",
    semester: 2,
    cp: 5,
    track: "Artificial Intelligence",
    status: "elective",
    learningObjectives: ["Apply symbolic AI techniques to planning and inference problems"],
    sections: [
      {
        title: "Symbolic methods",
        durationMinutes: 45,
        learningGoals: ["Contrast symbolic AI with statistical learning"],
        subsections: [
          {
            title: "Knowledge & search",
            keyPoints: ["Logic programming", "Planning", "Expert systems heritage"],
          },
        ],
      },
    ],
  },
  {
    slug: "mdssb-met-02-nlp",
    code: "MDSSB-MET-02",
    title: "Text Analysis and Natural Language Processing",
    summary: "AI elective (5 CP). NLP methods and applications (seminar/lab with project report).",
    semester: 2,
    cp: 5,
    track: "Artificial Intelligence",
    status: "elective",
    learningObjectives: ["Process and analyze natural language data"],
    sections: [
      {
        title: "NLP pipeline",
        durationMinutes: 40,
        learningGoals: ["Build text analytics solutions"],
        subsections: [
          {
            title: "Methods and project",
            keyPoints: ["Tokenization to transformers intro", "Project report assessment"],
          },
        ],
      },
    ],
  },
  {
    slug: "mde-co-02-data-analytics",
    code: "MDE-CO-02",
    title: "Data Analytics",
    summary: "AI elective (5 CP). Analytical methods for large datasets; recommended entry for AI specialization newcomers.",
    semester: 1,
    cp: 5,
    track: "Artificial Intelligence",
    status: "elective",
    learningObjectives: ["Explore and model data for decision support"],
    sections: [
      {
        title: "Analytics workflow",
        durationMinutes: 40,
        learningGoals: ["Execute end-to-end analytics projects"],
        subsections: [
          {
            title: "From data to insight",
            keyPoints: ["Exploratory analysis", "Project report"],
          },
        ],
      },
    ],
  },
  {
    slug: "mde-co-04-machine-learning",
    code: "MDE-CO-04",
    title: "Machine Learning",
    summary: "AI elective (5 CP). Classical ML algorithms and model evaluation.",
    semester: 2,
    cp: 5,
    track: "Artificial Intelligence",
    status: "elective",
    learningObjectives: ["Train and evaluate ML models on structured data"],
    sections: [
      {
        title: "ML foundations",
        durationMinutes: 45,
        learningGoals: ["Select appropriate learning algorithms"],
        subsections: [
          {
            title: "Supervised learning",
            keyPoints: ["Bias-variance", "Cross-validation", "Written examination"],
          },
        ],
      },
    ],
  },
  {
    slug: "mcsse-bt-01-quantum-informatics",
    code: "MCSSE-BT-01",
    title: "Quantum Informatics",
    summary: "Breakthrough area elective (5 CP). Quantum computing concepts — lecture + lab (2.5 CP each).",
    semester: 3,
    cp: 5,
    track: "Breakthrough",
    status: "elective",
    learningObjectives: ["Understand quantum information basics and emerging applications"],
    sections: [
      {
        title: "Quantum information",
        durationMinutes: 40,
        learningGoals: ["Connect quantum models to future computing trends"],
        subsections: [
          {
            title: "Lecture + lab",
            keyPoints: ["Qubits and algorithms intro", "Portfolio / written exam"],
          },
        ],
      },
    ],
  },
  {
    slug: "mcsse-mgt-01-agile-product-development",
    code: "MCSSE-MGT-01",
    title: "Agile Product Development & Design",
    summary: "Mandatory management module (5 CP), Semester 1. Product thinking and agile delivery for digital products.",
    semester: 1,
    cp: 5,
    track: "Management",
    status: "mandatory",
    learningObjectives: ["Apply agile product development practices"],
    sections: [
      {
        title: "Product development in agile contexts",
        durationMinutes: 45,
        learningGoals: ["Bridge SE skills with product design"],
        subsections: [
          {
            title: "Design & delivery",
            keyPoints: ["User-centered design", "Presentation assessment"],
          },
        ],
      },
    ],
  },
  {
    slug: "mcsse-mgt-02-product-innovation-marketing",
    code: "MCSSE-MGT-02",
    title: "Product Innovation & Marketing",
    summary: "Mandatory management module (5 CP), Semester 2. Innovation and go-to-market for digital products.",
    semester: 2,
    cp: 5,
    track: "Management",
    status: "mandatory",
    learningObjectives: ["Position and market technology products"],
    sections: [
      {
        title: "Innovation and marketing",
        durationMinutes: 45,
        learningGoals: ["Connect engineering output to market success"],
        subsections: [
          {
            title: "Go-to-market",
            keyPoints: ["Value proposition", "Presentation during semester"],
          },
        ],
      },
    ],
  },
  {
    slug: "mcsse-mgt-03-transformational-change",
    code: "MCSSE-MGT-03",
    title: "Transformational Change Management",
    summary: "Mandatory management module (5 CP), Semester 3. Leading organizational change in digital transformation.",
    semester: 3,
    cp: 5,
    track: "Management",
    status: "mandatory",
    learningObjectives: ["Lead change initiatives in technology organizations"],
    sections: [
      {
        title: "Change leadership",
        durationMinutes: 45,
        learningGoals: ["Apply change models to digital contexts"],
        subsections: [
          {
            title: "Transformation",
            keyPoints: ["Stakeholder alignment", "Presentation assessment"],
          },
        ],
      },
    ],
  },
  {
    slug: "mcsse-las-leadership-skills",
    code: "MCSSE-LAS-*",
    title: "Leadership & Academic Skills (overview)",
    summary:
      "Mandatory 15 CP total across Semesters 1–3: Entrepreneurship, Communication for Executives, Organizational Behavior, Academic Writing, Agile Leadership, Customer-centric Mindset (2.5 CP each).",
    semester: 2,
    cp: 15,
    track: "Leadership / Academic Skills",
    status: "mandatory",
    learningObjectives: [
      "Communicate as an executive in international settings",
      "Write academically and work in diverse teams",
      "Apply entrepreneurial and agile leadership mindsets",
    ],
    sections: [
      {
        title: "Semester 1–2 skills",
        durationMinutes: 30,
        learningGoals: ["Build communication and entrepreneurship foundations"],
        subsections: [
          {
            title: "Core modules",
            keyPoints: [
              "Entrepreneurship & Intrapreneurship",
              "Communication & Presentation Skills for Executives",
              "Organizational Behavior",
              "Academic Writing / Intercultural Training",
            ],
          },
        ],
      },
      {
        title: "Semester 3 skills",
        durationMinutes: 25,
        learningGoals: ["Lead teams and customer-centric delivery"],
        subsections: [
          {
            title: "Advanced modules",
            keyPoints: [
              "Agile Leadership and Strategic Management",
              "Customer-centric Mindset and Agile Delivery Management",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "mcsse-capstone-track",
    code: "MCSSE-CAP-*",
    title: "Capstone Project (Startup track)",
    summary:
      "Startup orientation (15 CP): Capstone Project I + II + III (5 CP each), usually Semesters 1–3. End-to-end software product development.",
    semester: 3,
    cp: 15,
    track: "Startup",
    status: "elective",
    learningObjectives: ["Deliver a software product through iterative capstone milestones"],
    sections: [
      {
        title: "Capstone I → III",
        durationMinutes: 50,
        learningGoals: ["Experience full product lifecycle in team projects"],
        subsections: [
          {
            title: "Project assessments",
            keyPoints: ["Project assessment each semester", "Agile team delivery"],
          },
        ],
      },
    ],
  },
  {
    slug: "mcsse-research-track",
    code: "MCSSE-RL-* / MCSSE-RP-01",
    title: "Research Lab & Research Project",
    summary:
      "Research orientation (15 CP): Research Lab I + II + Research Project (5 CP each). Alternative to Capstone/Internship track.",
    semester: 3,
    cp: 15,
    track: "Research",
    status: "elective",
    learningObjectives: ["Formulate research questions and document results scientifically"],
    sections: [
      {
        title: "Research pathway",
        durationMinutes: 45,
        learningGoals: ["Gain hands-on research experience in CSSE areas"],
        subsections: [
          {
            title: "Labs and project",
            keyPoints: ["Lab reports", "Research project report", "Faculty supervision"],
          },
        ],
      },
    ],
  },
  {
    slug: "mcsse-int-01-internship",
    code: "MCSSE-INT-01",
    title: "Internship (Industry track)",
    summary:
      "Industry orientation: 10 CP summer internship + 5 CP additional technical CORE. Usually between Semesters 2 and 3.",
    semester: 3,
    cp: 10,
    track: "Industry",
    status: "elective",
    learningObjectives: ["Apply CSSE skills in a professional industry context"],
    sections: [
      {
        title: "Industry placement",
        durationMinutes: 30,
        learningGoals: ["Reflect on professional practice"],
        subsections: [
          {
            title: "Internship report",
            keyPoints: ["10 CP internship", "Supervisor feedback", "Career orientation"],
          },
        ],
      },
    ],
  },
  {
    slug: "mcsse-the-01-master-thesis",
    code: "MCSSE-THE-01",
    title: "Master Thesis CSSE",
    summary:
      "Mandatory Semester 4 (30 CP). Research, industrial application, or start-up oriented thesis concluding the MSc program.",
    semester: 4,
    cp: 30,
    track: "Thesis",
    status: "mandatory",
    learningObjectives: [
      "Independently research and document a CSSE topic",
      "Defend methods and results before specialists and non-specialists",
    ],
    sections: [
      {
        title: "Thesis workflow",
        durationMinutes: 40,
        learningGoals: ["Plan and execute a master-level research project"],
        subsections: [
          {
            title: "Milestones",
            keyPoints: ["Proposal and supervisor", "Thesis writing", "Defense / submission"],
          },
        ],
      },
      {
        title: "Thesis orientations",
        durationMinutes: 20,
        learningGoals: ["Choose academic, industrial, or start-up focus"],
        subsections: [
          {
            title: "Paths",
            keyPoints: ["Academic research", "Industrial case study", "Start-up venture"],
          },
        ],
      },
    ],
  },
];

const modules: ProgramModule[] = MODULES.map(toModule);

export const CSSE_CONSTRUCTOR_MSC_PROGRAM: Program = {
  slug: "csse-constructor-msc",
  title: "MSc Computer Science and Software Engineering",
  subtitle: "Constructor University — technical CORE + management + leadership",
  coordinator: "Prof. Dr. Jürgen Schönwälder",
  institution: "Constructor University, Bremen",
  cohort: "Fall 2025 (handbook V1.3)",
  ects: 120,
  sourceHandbook: HANDBOOK,
  description:
    "Consecutive master's program combining Software Engineering, Cybersecurity, and Artificial Intelligence with mandatory management and leadership modules. Curricula follow the Fall 2025 CSSE handbook: 45 CP technical CORE, 15 CP management, 15 CP leadership/academic skills, 15 CP startup/industry/research orientation, and 30 CP master thesis.",
  topics: [
    "Software Engineering (construction, quality, architecture)",
    "Cybersecurity (cryptography, systems, networks)",
    "Artificial Intelligence (DL, symbolic AI, ML, NLP)",
    "Quantum Informatics (breakthrough area)",
    "Agile product development & change management",
    "Leadership, entrepreneurship, and academic skills",
    "Capstone / internship / research lab tracks",
    "Master thesis",
  ],
  modules,
};
