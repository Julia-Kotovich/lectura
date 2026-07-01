import type { LectureOutline } from "@/lib/schemas/outline";

/**
 * Reference course: "Concepts of Object-Oriented Programming"
 * Lecturer: Prof. Peter Müller — Programming Methodology Group, ETH Zürich
 * Source: 7 PDF lecture decks (Autumn Semester 2025) in /OOP_Peter_Muller
 *
 * Outlines mirror Müller's own section structure (1.1, 2.2, 3.3, ...) and the
 * subsections shown in his slides, so they can be regenerated or refined later
 * via AI without losing the curated structure.
 */

const COURSE_FRAMEWORK_SLUG = "oop-bachelor";
const LECTURE_DURATION_MIN = 90;

function makeOutline(params: {
  title: string;
  summary: string;
  semesterWeek: number;
  targetSlideCount: number;
  learningObjectives: string[];
  sections: LectureOutline["sections"];
  resources?: string[];
  assessment?: string[];
}): LectureOutline {
  return {
    title: params.title,
    summary: params.summary,
    learningObjectives: params.learningObjectives,
    sections: params.sections,
    suggestedResources: params.resources ?? [
      "Peter Müller — Concepts of OOP, lecture slides (ETH Zürich, Autumn 2025)",
      "B. C. Pierce — Types and Programming Languages. MIT Press, 2002",
      "B. Liskov & J. Wing — A Behavioral Notion of Subtyping. ACM TOPLAS, 1994",
    ],
    assessmentIdeas: params.assessment ?? [
      "Short conceptual quiz (5 questions)",
      "Code-reading exercise comparing the same concept in 2–3 languages",
      "Exam-style essay: explain a design trade-off observed in the lecture",
    ],
    targetSlideCount: params.targetSlideCount,
    estimatedPresentationMinutes: LECTURE_DURATION_MIN,
    estimatedStudyMinutes: params.targetSlideCount * 7,
    courseFrameworkSlug: COURSE_FRAMEWORK_SLUG,
    semesterWeek: params.semesterWeek,
  };
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Lecture 1 — Introduction (source: 57 slides)                              */
/* ────────────────────────────────────────────────────────────────────────── */
const LECTURE_1: LectureOutline = makeOutline({
  title: "Lecture 1 — Introduction",
  summary:
    "Why OOP exists, what its core and language concepts are, how Müller's ETH course is organized, and how to reason about language design trade-offs.",
  semesterWeek: 1,
  targetSlideCount: 28,
  learningObjectives: [
    "Motivate object-oriented programming from real software engineering requirements",
    "Identify the core concepts of OOP (object model, classification + polymorphism, encapsulation)",
    "Distinguish language concepts (inheritance, subtyping, dynamic binding) from core concepts",
    "Reason about language-design goals (simplicity, expressiveness, modularity, safety, performance, portability)",
  ],
  sections: [
    {
      title: "1.1 Requirements motivating OOP",
      durationMinutes: 15,
      learningGoals: [
        "Identify the forces that pushed programming languages toward OOP",
        "See where procedural reuse breaks down",
      ],
      subsections: [
        {
          title: "History of programming languages",
          keyPoints: [
            "Procedural → declarative → object-oriented timeline (1950s–today)",
            "Drivers: software crisis, GUIs, networks, multi-core, mobile, datacenters",
            "Family tree: Fortran/Cobol → C/Pascal → Smalltalk/C++/Eiffel → Java/C#/Scala/Kotlin/Rust",
          ],
          suggestedDiagram: "Timeline of paradigms with example languages",
        },
        {
          title: "Motivating requirements",
          keyPoints: [
            "Reuse, extendibility, adaptability",
            "Modeling real-world entities and dynamic systems",
            "Distributed code & data, communication, concurrency",
            "Documented, stable interfaces",
          ],
        },
        {
          title: "Procedural reuse breaks down",
          keyPoints: [
            "University admin example in C: Student / Professor / Person",
            "Tagged union (`enum kind`) + `switch` in `printAll`",
            "Adding Assistant requires touching shared code",
            "Cons: code duplication, casts, layout coupling, undefined behavior (aliasing)",
          ],
          examples: ["printAll over Person* with kind ∈ {STU, PROF}"],
        },
      ],
      exercises: ["Re-implement the C example in Java and compare diff size"],
    },
    {
      title: "1.2 Core Concepts of OOP",
      durationMinutes: 18,
      learningGoals: ["Define the object model", "Relate classification, polymorphism, encapsulation"],
      subsections: [
        {
          title: "Object model",
          keyPoints: [
            "Object = state (fields) + identity + behavior (methods)",
            "Communication via messages / method dispatch",
          ],
        },
        {
          title: "Classification & polymorphism",
          keyPoints: [
            "Classes group objects with the same structure",
            "Subtype polymorphism: many subclasses behind one interface",
            "Inheritance vs. multiple inheritance (preview)",
          ],
          suggestedDiagram: "Class hierarchy: Person ← Student",
        },
        {
          title: "Interfaces & encapsulation",
          keyPoints: [
            "Public interface vs. private state",
            "Information hiding as a design principle",
          ],
        },
      ],
    },
    {
      title: "1.3 Language Concepts (C vs Java)",
      durationMinutes: 22,
      learningGoals: ["Map core concepts onto language features", "See why language support matters"],
      subsections: [
        {
          title: "Simulating OOP in C",
          keyPoints: [
            "Structs with function pointers act as objects + vtables",
            "Casts simulate subtyping but break type safety",
            "Same field/function order required → memory-layout coupling",
          ],
        },
        {
          title: "Inheritance + dynamic binding in C",
          keyPoints: [
            "Copy struct, adapt signatures, override `print`",
            "Cast Student* to Person* to reuse `printAll`",
          ],
        },
        {
          title: "The Java solution",
          keyPoints: [
            "Inheritance avoids code duplication",
            "Subtyping expresses classification",
            "Overriding + dynamic dispatch adapt reused algorithms",
            "Result: simpler, type-safe, easier to maintain",
          ],
          examples: ["class Student extends Person { @Override void print() }"],
        },
        {
          title: "Concept map",
          keyPoints: [
            "Core: object model, classification + polymorphism, interfaces + encapsulation",
            "Language: inheritance, subtyping, dynamic binding (and language constructs)",
          ],
          suggestedDiagram: "Two-layer diagram: Core concepts ↔ Language concepts",
        },
      ],
      exercises: ["Identify undefined behavior in the C version (strict aliasing rule)"],
    },
    {
      title: "1.4 Course Organization",
      durationMinutes: 10,
      learningGoals: ["Know the course outline, exams, sessions"],
      subsections: [
        {
          title: "Course outline (Lectures 2–7)",
          keyPoints: [
            "L2 Types & Subtyping",
            "L3 Inheritance",
            "L4 Static Safety & Parametric Polymorphism",
            "L5 Object Structures & Aliasing",
            "L6 Object & Class Initialization",
            "L7 Reflection",
          ],
        },
        {
          title: "Logistics",
          keyPoints: [
            "Mid-term written exam (45 min, bonus 20%)",
            "End-term written exam (2 h, closed-book, registration required)",
            "Weekly Friday exercise sessions (CAB / CHN)",
            "Slides available 2 days before each lecture",
          ],
        },
      ],
    },
    {
      title: "1.5 Language Design",
      durationMinutes: 20,
      learningGoals: ["Reason about design goals and their trade-offs"],
      subsections: [
        {
          title: "What is a good OO-language?",
          keyPoints: [
            "Not popularity, not raw productivity — fit-for-domain trade-offs",
          ],
        },
        {
          title: "Design goal: simplicity",
          keyPoints: [
            "Syntax and semantics easy to understand",
            "Pascal, Java 1.0 — simple; Java 5 generics took 10 years to declare sound",
          ],
        },
        {
          title: "Design goal: expressiveness",
          keyPoints: [
            "Easily express complex processes & data",
            "Examples: C#, Scala, Python",
            "Conflicts with simplicity",
          ],
        },
        {
          title: "Other goals",
          keyPoints: [
            "Modularity, safety, performance, portability",
            "Trade-off: performance vs. safety (C vs. Java); simplicity vs. expressiveness (Pascal vs. Scala)",
          ],
        },
      ],
      exercises: ["Pick a familiar language and rank it on each design goal"],
    },
    {
      title: "Summary & transition",
      durationMinutes: 5,
      learningGoals: ["Preview Lecture 2"],
      subsections: [
        {
          title: "Take-aways",
          keyPoints: [
            "OOP exists to make code reusable, adaptable and safe",
            "Languages encode the same concepts very differently",
            "Next week: what is a type, what is subtyping, and what is Liskov's substitution principle",
          ],
        },
      ],
    },
  ],
});

/* ────────────────────────────────────────────────────────────────────────── */
/* Lecture 2 — Types and Subtyping (source: 68 slides)                       */
/* ────────────────────────────────────────────────────────────────────────── */
const LECTURE_2: LectureOutline = makeOutline({
  title: "Lecture 2 — Types and Subtyping",
  summary:
    "Type systems as a safety mechanism; nominal vs structural typing; the subtype relation with all its overriding rules; behavioral subtyping (Liskov) and its limits.",
  semesterWeek: 2,
  targetSlideCount: 30,
  learningObjectives: [
    "Define what a type system is and what it guarantees",
    "Distinguish weak/strong, nominal/structural, and static/dynamic typing",
    "Apply the rules for sound overriding (existence, access, params, results, fields)",
    "Apply the Liskov Substitution Principle (preconditions, postconditions, invariants, history constraints)",
  ],
  sections: [
    {
      title: "Recap & motivation",
      durationMinutes: 8,
      learningGoals: ["Refresh the C-vs-Java example", "Motivate static checking"],
      subsections: [
        {
          title: "Message-not-understood errors",
          keyPoints: ["Receiver lacks the field / method", "Type systems detect this statically"],
        },
        {
          title: "Java security model & sandbox",
          keyPoints: [
            "Applets → API → OS, with security manager",
            "Type safety underpins sandboxing",
          ],
        },
      ],
    },
    {
      title: "2.1 Types",
      durationMinutes: 30,
      learningGoals: ["Define types formally", "Compare weak/strong, nominal/structural, static/dynamic"],
      subsections: [
        {
          title: "What is a type system?",
          keyPoints: [
            "Pierce: 'a tractable syntactic method for proving the absence of certain program behaviors'",
            "Phrases are classified by the kinds of values they compute",
          ],
        },
        {
          title: "Weak vs. strong typing",
          keyPoints: [
            "Untyped (assembly)",
            "Weakly-typed (C, C++): casts not strictly enforced",
            "Strongly-typed (Java, C#, Scala, Python, Smalltalk, Eiffel)",
          ],
          examples: ["(int) argv[0] in C compiles; same code is inconvertible-types in Java"],
        },
        {
          title: "Types: definition",
          keyPoints: [
            "A type is a set of values sharing some properties",
            "v has type T iff v ∈ T",
          ],
        },
        {
          title: "Nominal vs structural types",
          keyPoints: [
            "Nominal: identity by name (C++, C#, Eiffel, Java, Scala)",
            "Structural: identity by available methods/fields (Go, OCaml, Python, Ruby)",
          ],
          suggestedDiagram: "Two classes S, T with same fields → nominal: 2 types, structural: 1",
        },
        {
          title: "Static type checking",
          keyPoints: [
            "Every expression has a declared or inferred type",
            "Type rules check programs at compile time",
          ],
        },
        {
          title: "Dynamic type checking",
          keyPoints: [
            "Every value carries a type, checked at run time",
            "Example: Python — operations fail at execution if mismatched",
          ],
        },
        {
          title: "Type safety & run-time checks",
          keyPoints: [
            "Type invariant: value of v ∈ declared type of v in every state",
            "Most static systems still need run-time checks (casts, covariant arrays)",
          ],
        },
        {
          title: "Bypassing static checks; gradual typing",
          keyPoints: [
            "C# `dynamic`, Scala dynamic — escape hatches",
            "Gradual typing: TypeScript / mypy with `Any`",
          ],
        },
        {
          title: "Static vs dynamic checking — trade-offs",
          keyPoints: [
            "Static: more errors caught early, optimizations, tooling, documentation",
            "Dynamic: expressiveness, no annotations, simpler",
          ],
        },
        {
          title: "Type systems in OO-languages — the 2×2",
          keyPoints: [
            "Nominal-static (Java, C#, Eiffel, Scala)",
            "Structural-static (Go, OCaml)",
            "Dynamic structural (JavaScript, Python, Ruby) — 'duck typing'",
          ],
          suggestedDiagram: "Static/Dynamic × Nominal/Structural quadrant",
        },
      ],
    },
    {
      title: "2.2 Subtyping",
      durationMinutes: 28,
      learningGoals: ["Define the subtype relation", "Apply nominal subtyping rules"],
      subsections: [
        {
          title: "Classification & substitution",
          keyPoints: [
            "Substitution principle: a subtype value may stand in for a supertype value",
            "Syntactic (interface) vs semantic (behavior) classification",
          ],
        },
        {
          title: "Subtyping definition",
          keyPoints: [
            "Subset relation on the values of a type",
            "S <: T ⇔ values(S) ⊆ values(T)",
          ],
          suggestedDiagram: "String ⊆ Object",
        },
        {
          title: "Nominal vs structural subtyping",
          keyPoints: [
            "Nominal: subtype relation declared explicitly (`extends`)",
            "Structural: subtype iff the interface is wider",
          ],
        },
        {
          title: "Existence",
          keyPoints: [
            "Subtypes may add, but not remove members",
            "Removing `bar()` in Sub → calling m(Super) on Sub object fails",
          ],
        },
        {
          title: "Accessibility",
          keyPoints: [
            "Overriding method must not be less accessible than the overridden one",
          ],
        },
        {
          title: "Overriding: parameter types (contravariance)",
          keyPoints: [
            "Sub.bar(String) instead of Super.bar(Object) breaks type safety",
            "Override may not require more specific parameters",
          ],
        },
        {
          title: "Overriding: result types (covariance)",
          keyPoints: [
            "Override may not return more general type than the supertype's result",
            "Out-parameters and thrown exceptions count as results",
          ],
        },
        {
          title: "Overriding: fields",
          keyPoints: [
            "Fields are bound statically — types must not change in subtype",
            "Immutable fields are special (can be specialized in theory)",
          ],
        },
        {
          title: "Covariant arrays",
          keyPoints: [
            "Java/C#: `S[] <: T[]` if `S <: T`",
            "Unsound — each array update needs a runtime check (ArrayStoreException)",
          ],
          examples: ["new String[5] passed as Object[] then assigned `new Object()`"],
        },
        {
          title: "Shortcomings of nominal subtyping",
          keyPoints: [
            "Cannot subtype reused library classes (Resident, Employee → Person)",
            "Overly restrictive method signatures",
          ],
        },
        {
          title: "Workarounds: adapter, additional supertypes, optional methods",
          keyPoints: [
            "Adapter (wrapper): boilerplate + indirection",
            "Optional methods in Java collections — sacrifices static safety",
          ],
        },
        {
          title: "Structural subtyping",
          keyPoints: [
            "Automatically obtain supertype: smaller interface ⇒ supertype",
            "Static (Go) and dynamic (Python) variants",
          ],
        },
        {
          title: "Subtyping landscape (sweetspots)",
          keyPoints: [
            "Nominal-static: max static safety",
            "Structural-dynamic: max flexibility",
            "Other quadrants: problems with semantics / availability",
          ],
        },
      ],
    },
    {
      title: "2.3 Behavioral Subtyping",
      durationMinutes: 18,
      learningGoals: ["State and apply LSP"],
      subsections: [
        {
          title: "Contracts",
          keyPoints: [
            "Method behavior: preconditions / postconditions / old-expressions",
            "Object invariants in visible (pre/post) states",
            "History constraints (reflexive, transitive)",
          ],
        },
        {
          title: "Static vs dynamic contract checking",
          keyPoints: [
            "Static: more errors at compile time, but undecidable in general",
            "Dynamic: runtime assertions, useful but partial",
          ],
        },
        {
          title: "Rules for behavioral subtyping",
          keyPoints: [
            "Preconditions weaken: Pre_T ⇒ Pre_S",
            "Postconditions strengthen: Post_S ⇒ Post_T",
            "Invariants strengthen: Inv_S ⇒ Inv_T",
            "History constraints strengthen: Cons_S ⇒ Cons_T",
          ],
          examples: ["UndoNaturalNumber vs Number — invariant 0 < n vs n == p"],
        },
        {
          title: "Improved postcondition rule",
          keyPoints: [
            "Naive rule too restrictive: assume supertype's precondition holds (pre-state)",
            "Final rule: old(Pre_T.m) ⇒ (Post_S.m ⇒ Post_T.m)",
          ],
        },
        {
          title: "Automatic checking & undecidability",
          keyPoints: [
            "Static entailments quickly become undecidable",
            "Specification inheritance enforces behavioral subtyping by construction",
          ],
        },
        {
          title: "Behavioral nominal vs structural subtyping",
          keyPoints: [
            "Nominal: programmers verify when declaring subtypes (often code review)",
            "Structural: dynamic systems can't establish/assume contracts; callers can't be blamed for failure",
          ],
        },
        {
          title: "Types as contracts",
          keyPoints: [
            "Type assertions seen as invariants on fields and pre/post on params/results",
            "Subtyping rules ⇒ contravariant params, covariant fields & results",
          ],
        },
        {
          title: "Invariants over inherited fields",
          keyPoints: [
            "Methods of friend classes can break a subclass's invariants over a superclass field",
            "Static checking is not modular",
          ],
        },
      ],
    },
    {
      title: "Real-world impact & wrap-up",
      durationMinutes: 6,
      learningGoals: ["Connect to APIs and frameworks"],
      subsections: [
        {
          title: "Why this matters",
          keyPoints: [
            "Public library APIs rely on behavioral subtyping",
            "Refactoring without breaking clients",
            "Square-vs-Rectangle classic anti-pattern",
          ],
        },
      ],
    },
  ],
});

/* ────────────────────────────────────────────────────────────────────────── */
/* Lecture 3 — Inheritance (source: 98 slides)                               */
/* ────────────────────────────────────────────────────────────────────────── */
const LECTURE_3: LectureOutline = makeOutline({
  title: "Lecture 3 — Inheritance",
  summary:
    "Inheritance vs subtyping, dynamic dispatch and the fragile-base-class problem, information hiding, multiple inheritance with its diamond and ambiguity issues, and Scala-style trait linearization.",
  semesterWeek: 3,
  targetSlideCount: 32,
  learningObjectives: [
    "Distinguish inheritance (code reuse) from subtyping (classification)",
    "Reason about dynamic method binding and the fragile base class problem",
    "Apply visibility rules and the override/hide distinction",
    "Compare single, multiple, and trait-based inheritance and compute Scala linearizations",
  ],
  sections: [
    {
      title: "Recap & motivation",
      durationMinutes: 8,
      learningGoals: ["Contrast reuse via inheritance with aggregation"],
      subsections: [
        {
          title: "Reuse via inheritance vs aggregation",
          keyPoints: [
            "Inheritance: 1 object, relation fixed at compile time, usually + subtyping",
            "Aggregation: 2+ objects, has-a, dynamic, no subtyping",
          ],
          suggestedDiagram: "Person ← Student (extends) vs Car → Engine (has-a)",
        },
      ],
    },
    {
      title: "3.1 Inheritance and Subtyping",
      durationMinutes: 18,
      learningGoals: ["Decouple inheritance from subtyping"],
      subsections: [
        {
          title: "Two orthogonal concepts",
          keyPoints: [
            "Subtyping = classification + substitution",
            "Inheritance = code reuse + specialization",
            "Subclassing = subtyping + inheritance",
          ],
        },
        {
          title: "Simulation by delegation",
          keyPoints: [
            "Subclassing via interfaces + has-a + delegation",
            "Useful when only single inheritance is available",
            "OOP needs subtyping, not inheritance",
          ],
        },
        {
          title: "Case study: immutable vs mutable",
          keyPoints: [
            "Why ImmutableCell <: Cell breaks (wider mutable interface)",
            "Why Cell <: ImmutableCell breaks (history constraint specialization)",
            "Clean solutions: no subtyping, common abstract superclass, aggregation, inheritance w/o subtyping",
          ],
          examples: ["Java AbstractCollection with optional methods"],
        },
      ],
    },
    {
      title: "3.2 Dynamic Method Binding",
      durationMinutes: 22,
      learningGoals: ["Explain dynamic dispatch and avoid the fragile-base-class trap"],
      subsections: [
        {
          title: "Static vs dynamic binding",
          keyPoints: [
            "Static: chosen by static type of receiver expression (C++, C# default)",
            "Dynamic: chosen by dynamic type of object (Eiffel, Java, Scala default)",
            "Cost: lookup overhead + harder to evolve",
          ],
        },
        {
          title: "Fragile Base Class scenario",
          keyPoints: [
            "Superclass develops, subclass implements, superclass is modified — and breaks the subclass",
          ],
          suggestedDiagram: "Develop super → Implement sub → Modify super",
        },
        {
          title: "Example 1: Selective overriding (Bag/CountingBag)",
          keyPoints: [
            "Override `add` to bump `size`; superclass changes `addAll` to bypass `add` — invariant broken",
            "Rule: do not change calls to dynamically-bound methods in superclass",
            "Rule: override all methods that could break invariants",
          ],
        },
        {
          title: "Example 2: Unjustified assumptions (Math.fourthRt)",
          keyPoints: [
            "Subclass relies on implementation details, not contracts",
            "Rule: rely on interface documentation, not implementation",
          ],
        },
        {
          title: "Example 3: Mutual recursion (inc1/inc2)",
          keyPoints: [
            "Rule: avoid specializing classes expected to change often",
          ],
        },
        {
          title: "Example 4: Accidental overriding",
          keyPoints: [
            "C# `new` vs `virtual`/`override` prevent accidental binding changes",
          ],
        },
        {
          title: "Example 5: Overload resolution changes",
          keyPoints: [
            "Adding methods to a superclass can change Java overload resolution",
            "C# resolves overloads in the receiver's class first",
          ],
        },
        {
          title: "Rules for proper subclassing — summary",
          keyPoints: [
            "Subclass only on true 'is-a'",
            "Document contracts, don't rely on implementation",
            "When evolving, leave dynamically-bound method calls alone",
            "Avoid specializing fast-evolving superclasses",
          ],
        },
        {
          title: "Binary methods",
          keyPoints: [
            "Behavior depends on dynamic types of both arguments",
            "Covariant parameters are not statically safe",
          ],
        },
        {
          title: "Solutions for binary methods",
          keyPoints: [
            "1) Explicit type tests",
            "2) Double invocation (Visitor pattern) — two single dispatches",
            "3) Overloading + dynamic (C#)",
            "4) Multiple dispatch (CLU, Cecil, MultiJava)",
          ],
          examples: ["Shape.intersect(Rectangle)"],
        },
      ],
    },
    {
      title: "3.3 Information Hiding",
      durationMinutes: 12,
      learningGoals: ["Use visibility modifiers correctly"],
      subsections: [
        {
          title: "Client / friend / subclass interfaces",
          keyPoints: [
            "Client interface: name, type parameters, supertypes, exported methods/fields",
            "Friend interface: mutual access for cooperating classes (default access, packages)",
            "Subclass interface: efficient access to superclass internals",
          ],
        },
        {
          title: "Access modifiers across languages",
          keyPoints: [
            "Java: public / protected / default / private",
            "Eiffel: clients clause; feature {ANY|T|NONE}",
          ],
        },
        {
          title: "Method selection in Java",
          keyPoints: [
            "Compile time: declaration, accessibility, invocation mode",
            "Run time: receiver, locate the actual method",
          ],
        },
        {
          title: "Override rule + the Access rule",
          keyPoints: [
            "Override widens or keeps access",
            "Sub.m overrides Super.m only if Super.m is accessible from Sub",
            "Private methods cannot be overridden, only hidden",
          ],
        },
        {
          title: "Problems with default & protected methods",
          keyPoints: [
            "Across-package default methods don't override but get dispatched anyway (JLS1 vs JLS2 fix)",
            "Protected can be 'less accessible' from a caller's perspective",
          ],
        },
        {
          title: "Another fragile base class problem",
          keyPoints: [
            "Changing private → protected in super changes which method runs",
          ],
        },
      ],
    },
    {
      title: "3.4 Multiple Inheritance",
      durationMinutes: 14,
      learningGoals: ["Identify ambiguity and diamond/repeated inheritance issues"],
      subsections: [
        {
          title: "Why multiple inheritance",
          keyPoints: [
            "Multiple subtyping is universal; multiple inheritance is rarer",
            "Avoids boilerplate of delegation",
          ],
          suggestedDiagram: "PhDStudent extends Assistant + Student",
        },
        {
          title: "Ambiguity resolution",
          keyPoints: [
            "Explicit selection (C++ `Assistant::workLoad`)",
            "Merging in the subclass (combine both inherited methods)",
            "Renaming (Eiffel `rename test as takeExam`)",
          ],
        },
        {
          title: "Repeated inheritance (diamonds)",
          keyPoints: [
            "How many copies of the superclass fields?",
            "C++ virtual inheritance → one copy; non-virtual → multiple copies",
          ],
          examples: ["PhDStudent inherits Person twice via Student & Assistant"],
        },
        {
          title: "Initialization in C++ multiple inheritance",
          keyPoints: [
            "Smallest subclass must call the virtual superclass constructor",
            "Constructors cannot rely on virtual-superclass-constructor invariants",
          ],
        },
        {
          title: "Pros & cons",
          keyPoints: [
            "Pros: expressiveness, no delegation overhead",
            "Cons: ambiguity, repeated-inheritance semantics, complicated",
          ],
        },
      ],
    },
    {
      title: "3.5 Linearization (mixins & traits)",
      durationMinutes: 14,
      learningGoals: ["Compute Scala's MRO and reason about stackable specializations"],
      subsections: [
        {
          title: "Mixins & traits",
          keyPoints: [
            "Methods + state mixed into classes",
            "Languages: Python, Ruby, Scala, Squeak",
            "Use: thin → thick interfaces, stackable specializations",
          ],
        },
        {
          title: "Scala traits",
          keyPoints: [
            "Trait extends exactly one superclass (+ other traits)",
            "Traits may have fields, methods, overrides",
            "Mixed in at declaration or instantiation",
          ],
          examples: ["class Cell; trait Backup extends Cell; new Cell with Backup"],
        },
        {
          title: "Linearization algorithm",
          keyPoints: [
            "L(C extends C' with C1 ... Cn) = C, L(Cn) • ... • L(C1) • L(C')",
            "Operator • removes duplicates, keeping last",
          ],
          examples: ["L(PhDStudent) = PhDStudent, L(Assistant), L(Student), Person"],
        },
        {
          title: "Overriding & super-calls along the linearization",
          keyPoints: [
            "`override` follows linear order",
            "`super.foo` resolves to the next item in the MRO",
          ],
        },
        {
          title: "Repeated inheritance & init order",
          keyPoints: [
            "Each constructor called exactly once",
            "Classes initialized in reverse linear order",
            "Args to a repeated super are supplied by the immediately preceding class",
          ],
        },
        {
          title: "Stackable specializations",
          keyPoints: [
            "Queue ← Filter ← Timer, each `override def put(...) { super.put(...) }`",
            "Compose behaviors flexibly",
          ],
        },
        {
          title: "Traits & behavioral subtyping",
          keyPoints: [
            "Overriding depends on mix-in order",
            "Behavioral subtyping checkable only at mix-in time",
            "Traits don't know their super-init or super-call targets — static reasoning is hard",
          ],
        },
      ],
    },
    {
      title: "Summary & references",
      durationMinutes: 2,
      learningGoals: ["Wrap up; preview Lecture 4"],
      subsections: [
        {
          title: "References",
          keyPoints: [
            "Mikhajlov & Sekerinski — Fragile Base Class Problem (LNCS 1998)",
            "Malayeri & Aldrich — CZ: Multiple Inheritance w/o Diamonds (OOPSLA 2009)",
            "Odersky, Spoon, Venners — Programming in Scala",
          ],
        },
      ],
    },
  ],
});

/* ────────────────────────────────────────────────────────────────────────── */
/* Lecture 4 — Static Safety & Parametric Polymorphism (source: 75 slides)   */
/* ────────────────────────────────────────────────────────────────────────── */
const LECTURE_4: LectureOutline = makeOutline({
  title: "Lecture 4 — Static Safety & Parametric Polymorphism",
  summary:
    "How the JVM keeps mobile code safe via class loaders and bytecode verification (inference and checking), and how generics provide type-safe reuse — with variance, erasure, wildcards, and C++ templates.",
  semesterWeek: 4,
  targetSlideCount: 30,
  learningObjectives: [
    "Describe how bytecode verification preserves type safety (inference & checking)",
    "Use parametric polymorphism (generics) correctly with bounds, wildcards, variance",
    "Compare Java erasure, C# reified generics, and C++ templates",
    "Reason about decidability of subtyping with wildcards",
  ],
  sections: [
    {
      title: "4.1 Bytecode Verification — motivation",
      durationMinutes: 12,
      learningGoals: ["Why we trust downloaded code"],
      subsections: [
        {
          title: "Mobile code",
          keyPoints: [
            "Applets, mobile devices, server customization, code distribution",
          ],
        },
        {
          title: "Class loaders",
          keyPoints: [
            "Programs compiled to platform-independent bytecode (.class)",
            "Custom class loaders extend ClassLoader; programs ship their own",
          ],
          suggestedDiagram: "OS → JVM → ClassLoader ← .class files",
        },
        {
          title: "Security in mobile environments",
          keyPoints: [
            "Untrusted code/compiler can be unsafe, malicious, DoS",
            "Goal: minimum security level via type safety + sandbox",
          ],
        },
      ],
    },
    {
      title: "4.1 Bytecode Verification — algorithm",
      durationMinutes: 25,
      learningGoals: ["Walk through verifier passes"],
      subsections: [
        {
          title: "Sandbox & JVM essentials",
          keyPoints: [
            "Stack-based VM, registers hold locals/parameters",
            "Instructions are typed; control via intra-method jumps",
          ],
        },
        {
          title: "Properties to verify",
          keyPoints: [
            "Each instruction type-correct, only initialized vars read, no stack over-/underflow",
            "Combination of load-time bytecode verification + run-time checks",
          ],
        },
        {
          title: "Type inference for the verifier",
          keyPoints: [
            "Simulate execution over types (not values)",
            "Each instruction: rule (S, R) → (S', R')",
          ],
          examples: ["iadd: (int.int.S, R) → (int.S, R)"],
        },
        {
          title: "Lattice of types in the verifier",
          keyPoints: [
            "Primitives, refs, null, T (top = uninitialized)",
            "Object hierarchy + arrays",
          ],
        },
        {
          title: "Selected rules",
          keyPoints: [
            "iconst, iload, astore, invokevirtual — guarded by stack/register and signature constraints",
          ],
        },
        {
          title: "Joins & smallest common supertype (SCS)",
          keyPoints: [
            "Jumps lead to joins → take SCS of incoming type states",
            "Multiple subtyping breaks unique SCS → JVM treats interfaces as Object + invokeinterface runtime checks",
          ],
        },
        {
          title: "Fixpoint inference algorithm",
          keyPoints: [
            "Worklist-based; in/out states per instruction",
            "pointwise_scs joins flow states",
          ],
        },
        {
          title: "Bytecode verification by type checking (Java 6+)",
          keyPoints: [
            "Annotate each basic block entry with declared types",
            "Skip the fixpoint; avoid interface imprecision",
          ],
        },
        {
          title: "Type inference for source programs",
          keyPoints: [
            "C# 3.0 `var`, Scala `var/val` — local-only inference",
            "Method/field type inference is non-modular",
          ],
        },
      ],
    },
    {
      title: "4.2 Parametric Polymorphism — basics",
      durationMinutes: 18,
      learningGoals: ["Use generics with bounds and reason about variance"],
      subsections: [
        {
          title: "Why parametric polymorphism",
          keyPoints: [
            "Subtype polymorphism + downcasts loses precise types",
            "Subtyping is sometimes not desirable (covariant arrays)",
          ],
        },
        {
          title: "Generic classes & methods",
          keyPoints: [
            "Modular type checking once per generic class",
            "Queue<T>: T elem; void enqueue(T); T dequeue();",
          ],
        },
        {
          title: "Upper bounds",
          keyPoints: [
            "`<T extends Comparable<T>>` to type-check generic body",
          ],
        },
        {
          title: "Subtyping & generics: variance",
          keyPoints: [
            "Covariance (S<:T ⇒ C<S><:C<T>) — unsafe with mutations",
            "Contravariance (S<:T ⇒ C<T><:C<S>) — unsafe with reads",
            "Java's choice: non-variance + wildcards",
          ],
        },
        {
          title: "Scala variance annotations",
          keyPoints: [
            "`class Random[+T]`: covariance ok for read-only",
            "`class OutputChannel[-T]`: contravariance ok for write-only",
            "Type-checker forbids other positions",
          ],
        },
      ],
    },
    {
      title: "4.2 Wildcards & use-site variance",
      durationMinutes: 18,
      learningGoals: ["Use wildcards and bounded wildcards"],
      subsections: [
        {
          title: "Wildcards as existentials",
          keyPoints: [
            "`Collection<?>` = ∃T. Collection<T>",
            "Two `<?>` are not the same existential",
          ],
        },
        {
          title: "Bounded wildcards",
          keyPoints: [
            "`<? extends T>` for read-only; `<? super T>` for write-only (PECS)",
          ],
          examples: ["Cell.copyFrom(Cell<? extends T>), copyTo(Cell<? super T>)"],
        },
        {
          title: "Use-site vs declaration-site variance",
          keyPoints: [
            "Java: wildcards = use-site",
            "Scala: annotations = declaration-site",
          ],
        },
        {
          title: "TreeSet revisited",
          keyPoints: [
            "`TreeSet<E>(Comparator<? super E>)` — accept a universal comparator",
          ],
        },
        {
          title: "Wildcards vs method type params",
          keyPoints: [
            "Often interchangeable; Java has no lower-bounded type params",
            "Wildcards allow instantiation to change over time when stored in fields",
          ],
        },
        {
          title: "Decidability",
          keyPoints: [
            "Java generics are Turing-complete (Grigore POPL 2017)",
            "Subtyping with wildcards is undecidable",
          ],
        },
      ],
    },
    {
      title: "4.2 Erasure, C# reified generics, C++ templates",
      durationMinutes: 14,
      learningGoals: ["Compare runtime representations of generics"],
      subsections: [
        {
          title: "Java type erasure",
          keyPoints: [
            "C<T> → C; T → upper bound; casts added",
            "One classfile + one Class<?> per generic",
          ],
        },
        {
          title: "Lost run-time info",
          keyPoints: [
            "`instanceof Cell<String>` not allowed",
            "`Cell<String>[]` not allowed",
            "Possible heap pollution",
          ],
        },
        {
          title: "C# reified generics",
          keyPoints: [
            "Run-time representation available",
            "Dynamic type tests, generic arrays, runtime check on update",
          ],
        },
        {
          title: "Erasure side-effects",
          keyPoints: [
            "Name clashes by erasure",
            "Static fields shared across instantiations in Java (per-instantiation in C#)",
          ],
        },
        {
          title: "C++ templates",
          keyPoints: [
            "Compiler generates a fresh class per instantiation",
            "Type checking per instantiation — flexibility, but late errors",
            "No upper bounds needed; structural-like flexibility",
          ],
        },
        {
          title: "C++ concepts & template metaprogramming",
          keyPoints: [
            "Concepts: declarative constraints on template args",
            "Template metaprogramming is Turing-complete (Fact<n>)",
          ],
        },
      ],
    },
    {
      title: "Wrap-up",
      durationMinutes: 3,
      learningGoals: ["Tie to next week (aliasing)"],
      subsections: [
        {
          title: "Preview",
          keyPoints: ["Type safety still doesn't prevent aliasing bugs → Lecture 5"],
        },
      ],
    },
  ],
});

/* ────────────────────────────────────────────────────────────────────────── */
/* Lecture 5 — Object Structures and Aliasing (source: 82 slides)            */
/* ────────────────────────────────────────────────────────────────────────── */
const LECTURE_5: LectureOutline = makeOutline({
  title: "Lecture 5 — Object Structures and Aliasing",
  summary:
    "Object graphs, the real-world problems aliasing causes for invariants, security and refactoring, and the language mechanisms (unique references in C++/Rust, readonly references via const, immutable references in Rust) that tame it.",
  semesterWeek: 5,
  targetSlideCount: 32,
  learningObjectives: [
    "Recognize intended and unintended aliasing (capturing & leaking)",
    "Reason about invariants under shared references",
    "Use unique references / ownership (C++ unique_ptr, Rust ownership + borrow checker)",
    "Use readonly references (C++ const, Rust immutable refs) and understand transitivity",
  ],
  sections: [
    {
      title: "Motivation: object structures",
      durationMinutes: 8,
      learningGoals: ["See objects in context, not in isolation"],
      subsections: [
        {
          title: "Object structures",
          keyPoints: [
            "Most useful abstractions are sets of cooperating objects",
            "Examples: ArrayList, Doubly-linked list + iterator",
          ],
          suggestedDiagram: "DLinkedList with head/size + Entry nodes (n, p) + ListItr",
        },
      ],
    },
    {
      title: "5.1 Aliasing",
      durationMinutes: 14,
      learningGoals: ["Define aliasing and recognize its forms"],
      subsections: [
        {
          title: "Definition",
          keyPoints: [
            "An object o is aliased iff ≥2 variables hold references to o",
            "Variables: instance fields, statics, locals (incl. this), parameters, expression results",
          ],
        },
        {
          title: "Heap and stack aliases",
          keyPoints: [
            "Two list objects sharing the same array",
            "Local alias to a field array",
          ],
        },
        {
          title: "Intended aliasing: efficiency",
          keyPoints: [
            "Imperative programming uses destructive updates without copying",
            "Aliases are the cost",
          ],
        },
        {
          title: "Intended aliasing: sharing",
          keyPoints: [
            "Object identity demands shared mutation",
            "LinkedList ↔ Entry ↔ ListItr need shared references",
          ],
        },
        {
          title: "Unintended aliasing: capturing",
          keyPoints: [
            "Constructor or setter stores a parameter object internally",
            "Caller can later by-pass interface via its retained alias",
          ],
        },
        {
          title: "Unintended aliasing: leaking",
          keyPoints: [
            "Method returns a reference to an internal object (e.g., `getElems()`)",
            "Caller can by-pass interface",
          ],
        },
      ],
    },
    {
      title: "5.2 Problems of Aliasing",
      durationMinutes: 16,
      learningGoals: ["Diagnose aliasing-induced bugs and security issues"],
      subsections: [
        {
          title: "Big lie of OOP",
          keyPoints: [
            "Hogg (1991): 'objects provide encapsulation' — only at the object level",
          ],
        },
        {
          title: "Exchanging implementations",
          keyPoints: [
            "Information hiding promises safe re-implementation under preserved interface",
            "Aliases by-pass the interface → behavior changes (array-based vs Entry-based List)",
          ],
        },
        {
          title: "Object consistency",
          keyPoints: [
            "Invariants over one state, history constraints over visible states",
            "Textbook capsule model: only the receiver's own methods modify it",
          ],
        },
        {
          title: "Java specifically",
          keyPoints: [
            "`private` does not protect against same-class objects",
            "Eiffel `feature {NONE}` is object-level",
          ],
        },
        {
          title: "Consistency of object structures",
          keyPoints: [
            "Invariants depend on fields of multiple cooperating objects",
            "Aliases (captured or leaked) can violate them",
          ],
        },
        {
          title: "Real security breach: Java 1.1.1",
          keyPoints: [
            "`Class.getSigners()` leaked the identity array",
            "Attacker overwrites trusted signer entry → privilege escalation",
            "Hard to prevent with info hiding alone",
          ],
        },
        {
          title: "Other problems",
          keyPoints: [
            "Synchronization in concurrent programs",
            "Explicit memory management (refcount = 1 free)",
            "Optimizations (object inlining requires no aliases)",
          ],
        },
      ],
    },
    {
      title: "5.3 Unique References",
      durationMinutes: 22,
      learningGoals: ["Use unique references / ownership"],
      subsections: [
        {
          title: "Alias control by convention (Java)",
          keyPoints: [
            "LinkedList: Entry and ListItr as private inner classes",
            "String: final, internal char[] not exposed",
          ],
        },
        {
          title: "C++ unique_ptr",
          keyPoints: [
            "`unique_ptr<T>` library-level uniqueness",
            "Deleted copy constructor + assignment operator",
            "`->` and `.get()` for access, `std::move` for transfer",
          ],
        },
        {
          title: "Memory management with unique_ptr",
          keyPoints: [
            "Destruction frees the owned object automatically",
            "Aliases via `.get()` lead to dangling pointers if owner dies",
          ],
        },
        {
          title: "Ownership transfer & temporary transfer",
          keyPoints: [
            "Move assignment nulls source (destructive read)",
            "Awkward to use ownership twice — pass `unique_ptr*` or `.get()` for borrowing",
          ],
        },
        {
          title: "Shallow ownership; discussion",
          keyPoints: [
            "Ownership of the referenced object, not its sub-objects",
            "Pros: expresses intent; Cons: no static guarantees, awkward params",
          ],
        },
        {
          title: "Rust ownership",
          keyPoints: [
            "Built into the type system; deep ownership",
            "Every assignment moves; using a moved value is a compile-time error",
            "`Box<T>` for heap allocation",
          ],
        },
        {
          title: "Borrowing & borrow checker",
          keyPoints: [
            "`&` and `&mut` borrow without transferring ownership",
            "Borrow checker tracks lifetimes; can require lifetime annotations across fns",
            "Borrowed place unusable until borrow expires",
          ],
        },
        {
          title: "Leaking & capturing in Rust",
          keyPoints: [
            "Capturing via ownership transfer is safe",
            "Leaking through references is possible but temporary",
          ],
        },
        {
          title: "Uniqueness guarantee & memory management",
          keyPoints: [
            "At most one usable place that can access a value (will be refined as 'aliasing XOR mutability')",
            "Drives data-race freedom & GC-free memory management",
          ],
        },
        {
          title: "Limitations",
          keyPoints: [
            "Tree-shaped only; cyclic structures need `unsafe` or Rc/RefCell",
            "Encapsulate unsafe code in libraries",
          ],
        },
      ],
    },
    {
      title: "5.4 Readonly References",
      durationMinutes: 22,
      learningGoals: ["Use readonly access and reason about transitivity"],
      subsections: [
        {
          title: "Drawbacks of uniqueness",
          keyPoints: [
            "Aliases are useful for shared side-effects",
            "Cloning is expensive; often you only need read access",
          ],
        },
        {
          title: "Requirements for readonly access",
          keyPoints: [
            "Apply to references, not whole objects",
            "Effectiveness: prevent unwanted modifications",
            "Transitivity: extend to sub-objects",
          ],
        },
        {
          title: "Readonly via supertypes",
          keyPoints: [
            "Define an interface with only read operations",
            "Limits: library classes, non-public members, casts, transitivity awkward",
            "Not safe: side-effect-free not enforced",
          ],
        },
        {
          title: "C++ const pointers",
          keyPoints: [
            "No field updates or non-const method calls through const T*",
            "Works for libraries, arrays, fields",
          ],
        },
        {
          title: "C++ const functions",
          keyPoints: [
            "`f() const` can't modify the receiver",
            "Allowed call target via const reference",
          ],
        },
        {
          title: "Casts & non-transitivity in C++",
          keyPoints: [
            "`(T*)this` casts away const → no run-time check",
            "Const-ness must be propagated to sub-objects explicitly",
          ],
        },
        {
          title: "Rust immutable references",
          keyPoints: [
            "`&T` allows many concurrent readers",
            "Value remains immutable while ≥1 immutable borrow exists",
            "Cannot derive `&mut` from `&`",
          ],
        },
        {
          title: "Aliasing XOR Mutability",
          keyPoints: [
            "Stronger guarantee in Rust: either one mutable borrow XOR many immutable borrows",
            "Ensures data race freedom & safe automatic memory management",
          ],
        },
        {
          title: "Readonly in Rust — discussion",
          keyPoints: [
            "Transitive, library-friendly",
            "Strong but sometimes overly restrictive for some data structures",
          ],
        },
      ],
    },
    {
      title: "Summary & references",
      durationMinutes: 3,
      learningGoals: ["Connect to Lecture 6"],
      subsections: [
        {
          title: "Take-aways",
          keyPoints: [
            "Aliasing is unavoidable but controllable",
            "Stroustrup — A Tour of C++; Klabnik & Nichols — The Rust Programming Language",
            "Next: initialization (partially-initialized objects + aliasing are explosive)",
          ],
        },
      ],
    },
  ],
});

/* ────────────────────────────────────────────────────────────────────────── */
/* Lecture 6 — Object and Class Initialization (source: 71 slides)           */
/* ────────────────────────────────────────────────────────────────────────── */
const LECTURE_6: LectureOutline = makeOutline({
  title: "Lecture 6 — Object and Class Initialization",
  summary:
    "Hoare's billion-dollar mistake, non-null types with data-flow analysis, four canonical problems of object initialization (method calls, callbacks, escaping via calls/fields) solved by a free/committed/unclassified type system, and three approaches to global-data initialization with their pitfalls.",
  semesterWeek: 6,
  targetSlideCount: 30,
  learningObjectives: [
    "Argue for / against null and use option/non-null types",
    "Trace object construction order and identify partially-initialized objects",
    "Apply a free / committed / unclassified type system to track initialization",
    "Compare three solutions for global-data initialization (init methods, static initializers, once methods)",
  ],
  sections: [
    {
      title: "Motivation: the billion-dollar mistake",
      durationMinutes: 6,
      learningGoals: ["Quote Hoare and understand the impact"],
      subsections: [
        {
          title: "Hoare's quote",
          keyPoints: [
            "1965 invention of null; 40+ years of NPEs",
            "Modern languages: Spec#, Kotlin, Swift, C# nullable refs",
          ],
        },
        {
          title: "Main uses of null today",
          keyPoints: [
            "Terminate recursion (linked list-like structures)",
            "Indicate 'no result'",
            "But most variables are non-null at runtime",
          ],
        },
      ],
    },
    {
      title: "6.1 Simple Non-Null Types",
      durationMinutes: 22,
      learningGoals: ["Use non-null types and data-flow analysis"],
      subsections: [
        {
          title: "Non-null & possibly-null types",
          keyPoints: [
            "T! consists of refs to T-objects; T? = T! ∪ {null}",
            "Default depends on language design",
          ],
        },
        {
          title: "Type safety invariant",
          keyPoints: [
            "Statically non-null expression ⇒ value ≠ null at runtime",
            "Receivers of field, array, method, throw must be non-null",
          ],
        },
        {
          title: "Subtyping & casts",
          keyPoints: [
            "T! <: T?, S! <: T!, downcasts T? → T! need runtime checks",
          ],
        },
        {
          title: "Type rules",
          keyPoints: [
            "Most Java type rules unchanged; new constraints for derefs",
          ],
        },
        {
          title: "Comparing against null + flow-sensitive refinement",
          keyPoints: [
            "After `if (n == null) return;` the type of `n` is non-null in the else branch",
            "Implemented via data-flow analysis on the CFG",
          ],
        },
        {
          title: "Data flow analysis",
          keyPoints: [
            "Tracks possible values per program point",
            "Works for locals; not modular for heap locations",
          ],
        },
        {
          title: "Limitations",
          keyPoints: [
            "Cannot track field/object state across calls",
            "Concurrent threads may mutate heap behind the analysis",
          ],
        },
      ],
    },
    {
      title: "6.2 Object Initialization — problems",
      durationMinutes: 18,
      learningGoals: ["See where naive non-null type checking fails"],
      subsections: [
        {
          title: "Constructor and non-null fields",
          keyPoints: [
            "All fields default to null → type invariant violated mid-construction",
            "Goal: definite assignment by end of constructor + 'this' must not escape",
          ],
        },
        {
          title: "Definite assignment of fields",
          keyPoints: [
            "Apply definite-assignment rule to fields in constructor",
            "Works in trivial cases",
          ],
        },
        {
          title: "Problem 1: method calls during construction",
          keyPoints: [
            "Super's constructor calls a virtual method overridden in subclass — sees uninitialized field",
          ],
        },
        {
          title: "Problem 2: callbacks via observer",
          keyPoints: [
            "Constructor registers `this`; observer immediately calls update on partly-initialized object",
          ],
        },
        {
          title: "Problem 3: escaping via method calls",
          keyPoints: [
            "Stored in a list, separate thread calls update with NPE",
          ],
        },
        {
          title: "Problem 4: escaping via field updates",
          keyPoints: [
            "Inserting a new node in a cyclic list before its fields are set",
          ],
        },
      ],
    },
    {
      title: "6.2 Object Initialization — solution",
      durationMinutes: 16,
      learningGoals: ["Apply a free/committed/unclassified type system"],
      subsections: [
        {
          title: "Initialization phases",
          keyPoints: [
            "Object created → construction completed",
            "Free type (under construction) vs committed type (done)",
            "Unclassified — could be either",
          ],
          suggestedDiagram: "Timeline: created → (free) → committed; unc covers both",
        },
        {
          title: "Construction types",
          keyPoints: [
            "T!, T? (committed); free T!, free T? (free); unc T!, unc T? (unclassified)",
            "T! <: unc T!, free T! <: unc T!",
          ],
        },
        {
          title: "Requirement 1: local initialization",
          keyPoints: [
            "Committed object: all non-null fields hold non-null values",
          ],
        },
        {
          title: "Requirement 2: transitive initialization",
          keyPoints: [
            "Committed ⇒ all reachable objects are locally initialized",
          ],
        },
        {
          title: "Requirement 3: cyclic structures",
          keyPoints: [
            "`this` is free inside its constructor",
            "Fields can be assigned `this`/`new` with `free` types",
          ],
        },
        {
          title: "Type rules",
          keyPoints: [
            "Field write: e1 free, or e2 committed",
            "Field read: read of committed is at non-null type; otherwise unc",
            "Constructors: receiver has free type; non-null fields must be definitely assigned",
            "Methods/calls: signatures include construction types; co/contravariance",
          ],
        },
        {
          title: "Completing construction",
          keyPoints: [
            "new with committed args → committed; with free args → free",
            "Construction completes after nested new + new finishes",
          ],
        },
        {
          title: "Problems revisited",
          keyPoints: [
            "Adding free annotations to methods/parameters surfaces previous bugs at compile time",
          ],
        },
        {
          title: "Lazy initialization & arrays",
          keyPoints: [
            "Lazy fields: client sees non-null after first call",
            "Array element non-nullness: definite assignment hard; use initializers, prefill, or runtime checks (Spec#'s AssertInitialized)",
          ],
        },
        {
          title: "Guidelines for writing constructors",
          keyPoints: [
            "Avoid calling dynamically bound methods on this",
            "Be careful when the new object escapes the constructor",
            "Remember subclass constructors haven't run yet",
          ],
        },
      ],
    },
    {
      title: "6.3 Initialization of Global Data",
      durationMinutes: 16,
      learningGoals: ["Compare global-data initialization mechanisms"],
      subsections: [
        {
          title: "Flyweight pattern + global data motivation",
          keyPoints: [
            "Factories, caches, flyweights, singletons",
            "Issues: how to access? how to initialize?",
          ],
          suggestedDiagram: "Factory → repository of shared flyweights",
        },
        {
          title: "Design goals",
          keyPoints: [
            "Effectiveness, clarity, laziness",
          ],
        },
        {
          title: "Solution 1: global vars + init-methods",
          keyPoints: [
            "Manual `init()` calls; main needs to know internal dependencies",
            "Cons: error-prone, breaks information hiding, no laziness",
          ],
        },
        {
          title: "Variation: C++ initializers",
          keyPoints: [
            "Globals initialized at program start in source order; no laziness; programmer manages deps",
          ],
        },
        {
          title: "Solution 2: static fields + static initializers",
          keyPoints: [
            "JVM runs `<clinit>` lazily on first active use",
            "Mutual dependencies → NPE because the recursive triggering sees partially initialized class",
            "Side effects of static initializers make reasoning non-modular",
          ],
        },
        {
          title: "Scala singleton objects",
          keyPoints: [
            "Translated to Java statics — same pros/cons",
          ],
        },
        {
          title: "Solution 3: Eiffel once methods",
          keyPoints: [
            "Body runs only the first call; result cached",
            "Mutual deps → recursive call returns current (often nonsensical) value",
            "Arguments of subsequent calls are ignored",
          ],
        },
        {
          title: "Summary",
          keyPoints: [
            "No solution ensures initialization before first access in all cases",
            "Mutual dependencies remain unsolved",
            "Initializing global data well is genuinely hard",
          ],
        },
      ],
    },
    {
      title: "Wrap-up",
      durationMinutes: 2,
      learningGoals: ["Preview reflection"],
      subsections: [
        {
          title: "Next week",
          keyPoints: ["Reflection — breaks many invariants if used carelessly"],
        },
      ],
    },
  ],
});

/* ────────────────────────────────────────────────────────────────────────── */
/* Lecture 7 — Reflection (source: 31 slides)                                */
/* ────────────────────────────────────────────────────────────────────────── */
const LECTURE_7: LectureOutline = makeOutline({
  title: "Lecture 7 — Reflection",
  summary:
    "Three degrees of reflection — introspection (observing program structure at runtime), reflective code generation (creating code at runtime), and dynamic code manipulation (modifying existing code) — and how each affects type checking, safety, and performance.",
  semesterWeek: 7,
  targetSlideCount: 22,
  learningObjectives: [
    "Distinguish dynamic type checking, introspection, and full reflection",
    "Use the Java reflection API safely for serialization, DI, test frameworks",
    "Build a reflective Visitor and understand its trade-offs",
    "Compare C# expression trees, Python dynamic method swapping, and their type-checking implications",
  ],
  sections: [
    {
      title: "Recap & motivation",
      durationMinutes: 6,
      learningGoals: ["Refresh dynamic type checking"],
      subsections: [
        {
          title: "Dynamic type checking & instanceof",
          keyPoints: [
            "Type information available at runtime",
            "Casts (String) oa[0] guarded by `instanceof`",
            "Pattern matching on types (Java 16+, Kotlin `is`)",
          ],
        },
        {
          title: "Levels of reflection",
          keyPoints: [
            "Base level: instances",
            "Meta level: Class, Method, Field — first-class meta-objects",
          ],
          suggestedDiagram: "Base ↔ Meta with Class/Method/Field arrows",
        },
      ],
    },
    {
      title: "7.1 Introspection",
      durationMinutes: 32,
      learningGoals: ["Use Java reflection responsibly"],
      subsections: [
        {
          title: "Class objects",
          keyPoints: [
            "Class<T>.forName(name), .getMethods(), .getMethod(name, paramTypes), .newInstance()",
            "Class.getSuperclass(), isAssignableFrom",
          ],
        },
        {
          title: "Example: FieldInspector",
          keyPoints: [
            "Walk a class's declared fields, print name + type",
          ],
        },
        {
          title: "Universal toString-method",
          keyPoints: [
            "Use getDeclaredFields + Field.get to print state",
            "Need exception handling (IllegalArgumentException, IllegalAccessException)",
          ],
        },
        {
          title: "Field.get & safety checks",
          keyPoints: [
            "Type checking (does object have field?) at runtime",
            "Accessibility checking (private field requires setAccessible(true))",
            "Implication: reflection breaks encapsulation",
          ],
        },
        {
          title: "Example: unit testing",
          keyPoints: [
            "Find methods starting with `test`, invoke each on a fresh instance",
            "Basic JUnit mechanism (modern: @Test annotation)",
          ],
        },
        {
          title: "Class.newInstance — runtime checks",
          keyPoints: [
            "Class must be concrete with a no-arg constructor",
            "Constructor must be accessible",
            "InstantiationException, IllegalAccessException",
          ],
        },
        {
          title: "Reminder: Visitor pattern",
          keyPoints: [
            "accept(visitor) + visitor.visitX(this) — two single dispatches",
          ],
        },
        {
          title: "Reflective Visitor",
          keyPoints: [
            "`visit(e)` looks up `visit<TypeName>` dynamically and invokes it",
            "No accept methods needed in the visited hierarchy",
          ],
        },
        {
          title: "Reflective Visitor — trade-offs",
          keyPoints: [
            "Pros: simpler code; flexible look-up (e.g., most specific match)",
            "Cons: not statically safe; slower due to runtime checks",
          ],
        },
        {
          title: "Java generics & reflection",
          keyPoints: [
            "Erasure: `getMethod(\"add\", String.class)` fails on LinkedList<String>",
            "Use Object.class to find the erased signature",
          ],
        },
      ],
    },
    {
      title: "7.2 Reflective Code Generation",
      durationMinutes: 16,
      learningGoals: ["Generate executable code at runtime"],
      subsections: [
        {
          title: "Motivation",
          keyPoints: [
            "Code as data — generate code dynamically",
            "Examples: Java class loading, C# expression trees → SQL",
          ],
        },
        {
          title: "C# expression trees",
          keyPoints: [
            "Build AST for lambdas: ParameterExpression, ConstantExpression, BinaryExpression",
            "`Expression.Compile()` compiles the tree to executable code at runtime",
          ],
        },
        {
          title: "Example: dynamic filter",
          keyPoints: [
            "Parse condition → build expression → compile → use as Func<int, bool>",
            "Main application: LINQ → SQL translation",
          ],
        },
      ],
    },
    {
      title: "7.3 Dynamic Code Manipulation",
      durationMinutes: 14,
      learningGoals: ["Modify code at runtime safely"],
      subsections: [
        {
          title: "Motivation",
          keyPoints: [
            "Adapt program to user input / environment",
            "Apply systematic changes (code instrumentation, mocking, AOP)",
          ],
        },
        {
          title: "Example: Python case-insensitive string class",
          keyPoints: [
            "Define `iStr(str)`; replace methods like __eq__, find, index using setattr",
            "Wrap original method with a lower-cased call",
          ],
          examples: ["_makeCI('__eq__')"],
        },
        {
          title: "Reflection and type checking",
          keyPoints: [
            "Introspection: code can be type-checked once at compile time",
            "Reflective code generation: type-checked when code is created",
            "Dynamic code manipulation: typically dynamic type checking only",
          ],
          suggestedDiagram: "3-row table: Introspection / Code gen / Code manipulation × type checking",
        },
      ],
    },
    {
      title: "Course wrap-up",
      durationMinutes: 12,
      learningGoals: ["Synthesize the course"],
      subsections: [
        {
          title: "Reflection summary",
          keyPoints: [
            "Applications: plugins, serialization, persistence, design patterns, dynamic code gen",
            "Drawbacks: not statically safe, breaks info hiding, hard to understand/debug, slower",
          ],
        },
        {
          title: "What the course covered",
          keyPoints: [
            "Concepts > syntax: subtyping, dispatch, generics, aliasing, init, reflection",
            "Real-language trade-offs across C++, C#, Eiffel, Java, Python, Rust, Scala",
          ],
        },
        {
          title: "Exam logistics",
          keyPoints: [
            "Closed-book end-term exam (2 h)",
            "Past papers as preparation",
          ],
        },
      ],
    },
  ],
});

/* ────────────────────────────────────────────────────────────────────────── */
/* Course definition + exports                                               */
/* ────────────────────────────────────────────────────────────────────────── */

export type CourseLectureEntry = {
  slug: string;
  sourcePdf: string;
  title: string;
  summary: string;
  outline: LectureOutline;
};

export type Course = {
  slug: string;
  title: string;
  subtitle: string;
  instructor: string;
  institution: string;
  semester: string;
  sourceFolder: string;
  description: string;
  topics: string[];
  lectures: CourseLectureEntry[];
};

export const COOP_ETH_MUELLER_COURSE: Course = {
  slug: "coop-eth-mueller",
  title: "Concepts of Object-Oriented Programming",
  subtitle: "An ETH Zürich course on the deep ideas behind OO languages",
  instructor: "Prof. Peter Müller",
  institution: "ETH Zürich — Programming Methodology Group",
  semester: "Autumn Semester 2025",
  sourceFolder: "OOP_Peter_Muller",
  description:
    "A concepts-first course on object-oriented programming. Rather than teaching one language, it compares C++, C#, Eiffel, Java, Python, Rust and Scala to show how each design choice (typing, inheritance, generics, aliasing, initialization, reflection) trades off safety, expressiveness and performance.",
  topics: [
    "Object model and language design trade-offs",
    "Types and subtyping (incl. behavioral subtyping / LSP)",
    "Inheritance, dynamic dispatch, multiple inheritance, linearization",
    "Bytecode verification & parametric polymorphism (generics, wildcards, templates)",
    "Object structures, aliasing, ownership, readonly references",
    "Object and class initialization (non-null types, construction order)",
    "Reflection: introspection, code generation, dynamic code manipulation",
  ],
  lectures: [
    {
      slug: "lecture-01-introduction",
      sourcePdf: "lecture_01_introduction.pdf",
      title: LECTURE_1.title,
      summary: LECTURE_1.summary,
      outline: LECTURE_1,
    },
    {
      slug: "lecture-02-subtyping",
      sourcePdf: "lecture_02_subtyping.pdf",
      title: LECTURE_2.title,
      summary: LECTURE_2.summary,
      outline: LECTURE_2,
    },
    {
      slug: "lecture-03-inheritance",
      sourcePdf: "lecture_03_inheritance.pdf",
      title: LECTURE_3.title,
      summary: LECTURE_3.summary,
      outline: LECTURE_3,
    },
    {
      slug: "lecture-04-types",
      sourcePdf: "lecture_04-types.pdf",
      title: LECTURE_4.title,
      summary: LECTURE_4.summary,
      outline: LECTURE_4,
    },
    {
      slug: "lecture-05-object-structures",
      sourcePdf: "lecture_05_object_structures.pdf",
      title: LECTURE_5.title,
      summary: LECTURE_5.summary,
      outline: LECTURE_5,
    },
    {
      slug: "lecture-06-initialization",
      sourcePdf: "lecture_06_initialization.pdf",
      title: LECTURE_6.title,
      summary: LECTURE_6.summary,
      outline: LECTURE_6,
    },
    {
      slug: "lecture-07-reflection",
      sourcePdf: "lecture_07_reflection.pdf",
      title: LECTURE_7.title,
      summary: LECTURE_7.summary,
      outline: LECTURE_7,
    },
  ],
};
