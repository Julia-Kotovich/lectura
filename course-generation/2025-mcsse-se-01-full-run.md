# Full run — Software Construction, Architecture and Engineering

- **Module code:** 2025-MCSSE-SE-01
- **Lectures processed:** 10
- **Generated at:** 2026-07-12T14:13:40.417874+00:00

## Bloom summary

| # | Lecture | Bloom init | Bloom final | Rounds |
|---|---------|------------|-------------|--------||
| 1 | Introduction to Software Engineering and Object-Oriented Fundamentals | 72 | 88 | 3 |
| 2 | Inheritance, Polymorphism and Dynamic Binding | 68 | 88 | 3 |
| 3 | Genericity and Information Hiding | 72 | 92 | 3 |
| 4 | Design by Contract: Assertions and Program Correctness | 72 | 88 | 3 |
| 5 | Fundamental Design Patterns I: Creational and Structural Patterns | 68 | 88 | 3 |
| 6 | Fundamental Design Patterns II: Behavioral Patterns | 72 | 88 | 3 |
| 7 | Software Architecture: Structuring Large-Scale Programs | 68 | 88 | 3 |
| 8 | Requirements Engineering Fundamentals | 72 | 88 | 3 |
| 9 | Agile Development Methods and Practices | 72 | 82 | 3 |
| 10 | Software Engineering Process and Quality Assurance | 42 | 88 | 3 |

## Lecture 1. Introduction to Software Engineering and Object-Oriented Fundamentals
- **Outline summary:** This foundational lecture introduces modern software engineering principles and the critical role of object technology in building high-quality industrial software systems. Students will explore the challenges of contemporary software development, understand essential quality attributes (correctness, robustness, extendibility, reusability), and learn fundamental object-oriented programming concepts including classes, objects, and encapsulation. The lecture establishes the course framework and introduces Eiffel notation as the practical vehicle for learning.
- **Bloom:** 72 → 88
- **Bloom gaps:**
  - Systematic misalignment: All six learning objectives are stated at understand level, but 100% of slides with activities operate at analyze/evaluate/create levels. This creates expectation mismatch between stated objectives and actual cognitive demands.
  - Missing scaffolding for create-level tasks: Slide-15 jumps directly to designing a complete class without intermediate apply-level practice. Students need guided application of Eiffel syntax patterns before synthesizing original designs.
  - Slides 07-08 (extendibility, reusability) lack activities: These slides remain at understand level while surrounding slides engage analyze/evaluate. This creates uneven cognitive demand distribution and missed opportunities to apply quality attribute analysis.

## Lecture 2. Inheritance, Polymorphism and Dynamic Binding
- **Outline summary:** This lecture provides a comprehensive exploration of advanced object-oriented programming mechanisms essential for building flexible and reusable software architectures. Students will master single and multiple inheritance hierarchies, understand polymorphism and substitutability principles, and learn how dynamic binding enables runtime flexibility. Through practical examples in Eiffel and theoretical foundations, students will gain the skills to design extensible class hierarchies and apply these mechanisms to real-world software construction challenges.
- **Bloom:** 68 → 88
- **Bloom gaps:**
  - No create-level activities: Students never design novel inheritance architectures from scratch or synthesize new design patterns. All design tasks provide significant scaffolding (e.g., given scenarios, specific constraints).
  - Limited polymorphism application: While polymorphism is explained well (slides 10-12), students don't write polymorphic code themselves. The zoo example is presented, not constructed by students.
  - Template Method pattern (slide 17) remains at understand level: Students see the pattern but don't apply it to design a new template method hierarchy or analyze when to use it vs. alternatives.

## Lecture 3. Genericity and Information Hiding
- **Outline summary:** This lecture explores generic programming techniques for creating reusable components and information hiding principles for managing complexity and ensuring proper encapsulation in large systems. Students will learn how to design flexible, maintainable software through type parameters, constrained genericity, access control, and interface-implementation separation.
- **Bloom:** 72 → 92
- **Bloom gaps:**
  - Slide 6 (Type Instantiation) remains at understand level with only code examples and explanation. Consider adding brief activity requiring students to predict compile-time errors for mismatched type instantiations or to explain why certain instantiations fail—moving to apply level.
  - Slide 17 (Case Study) is passive observation of existing framework. Consider adding analysis task: given a new collection type requirement (e.g., PriorityQueue, ConcurrentMap), students determine where it fits in hierarchy, what interfaces it should implement, and what constraints are needed.
  - No explicit activity bridges from individual principles (genericity, information hiding) to integrated application before slide 16's synthesis. Consider adding intermediate task in slides 10-15 range requiring students to apply both principles simultaneously in smaller scope.

## Lecture 4. Design by Contract: Assertions and Program Correctness
- **Outline summary:** This lecture introduces Design by Contract (DbC) methodology as a systematic approach to building reliable software. Students will learn to specify software behavior using preconditions, postconditions, and class invariants, understand how contracts guarantee program correctness, and apply assertion-based reasoning to ensure software quality. The lecture emphasizes practical application of DbC principles in object-oriented programming and their role in achieving program reliability.
- **Bloom:** 72 → 88
- **Bloom gaps:**
  - Limited remember-level foundation: The deck jumps immediately into apply/analyze activities (Ariane 5 problem-solving in slide 1) without establishing basic terminology. Students unfamiliar with 'precondition' or 'postcondition' may struggle. Consider adding a brief definitions slide before slide 5.
  - Uneven create-level distribution: Only 5% create-level content, concentrated in slides 3, 12, and 16. The 'Integrate DbC techniques' objective suggests more synthesis opportunities. Consider adding a capstone activity requiring students to design a complete contracted class from scratch.
  - Missing explicit connection between assertion monitoring (slides 13-14) and contract inheritance (slides 15-16): These topics are taught separately but interact in practice—how do inherited contracts affect monitoring strategy? A bridging activity could strengthen integration.

## Lecture 5. Fundamental Design Patterns I: Creational and Structural Patterns
- **Outline summary:** This lecture introduces essential design patterns for object creation and structural composition in software engineering. Students will learn the Gang of Four patterns including Singleton, Factory Method, Abstract Factory, Adapter, Composite, and Decorator. The lecture emphasizes practical application, pattern selection criteria, and real-world implementation strategies within object-oriented systems.
- **Bloom:** 68 → 88
- **Bloom gaps:**
  - Create-level activities constitute only 4% of deck despite two objectives requiring synthesis (designing solutions, proposing architectures). Slides 5, 6, 7, and 11 include create-level components, but most activities stop at evaluate level.
  - Understand-level content (8%) is appropriately minimal for MSc-level, but slides 10, 12, 14 present pattern introductions without immediate application, creating passive segments between active learning.
  - Abstract Factory receives less hands-on implementation practice (slides 8-9) compared to Singleton (slides 4-5) and Factory Method (slides 6-7), despite being equally important creational pattern per objectives.

## Lecture 6. Fundamental Design Patterns II: Behavioral Patterns
- **Outline summary:** This lecture examines behavioral design patterns that manage object interactions and responsibilities in complex software systems. Students will explore the Observer, Visitor, Strategy, Command, and Template Method patterns, understanding their motivations, implementations, and trade-offs. The lecture emphasizes practical application of these patterns in object-oriented software construction and their role in creating flexible, maintainable architectures.
- **Bloom:** 72 → 88
- **Bloom gaps:**
  - No create-level tasks present. While MSc students should master apply/analyze/evaluate levels, opportunities for students to design novel pattern combinations or propose new pattern variations would strengthen higher-order thinking.
  - Template Method pattern receives less coverage (1 slide) compared to other patterns (3-4 slides each). While slide 16 provides apply-level work, additional slides analyzing Template Method trade-offs or comparing it with Strategy would balance coverage.
  - Limited explicit analysis of when NOT to use patterns. While slide 18 mentions anti-patterns and YAGNI, more activities requiring students to analyze scenarios where simpler solutions suffice would develop critical judgment.

## Lecture 7. Software Architecture: Structuring Large-Scale Programs
- **Outline summary:** This lecture explores fundamental techniques for organizing and structuring large software systems. Students will learn architectural thinking principles, examine common architectural styles including layered and component-based architectures, understand module dependencies and coupling, explore package organization strategies, and discover techniques for managing complexity in large-scale systems. The lecture emphasizes practical application of architectural principles to real-world software construction challenges.
- **Bloom:** 68 → 88
- **Bloom gaps:**
  - Limited create-level engagement: Only 5% of deck cognitive demand reaches create level (slides 17-18), despite 'Design component-based systems' objective implying synthesis of novel solutions. Most design activities apply established patterns rather than requiring architectural innovation.
  - Component design objective partially underserved: While slides 8-10 provide substantial component design practice, activities primarily involve applying component thinking to given requirements rather than synthesizing original architectural solutions from ambiguous or competing constraints.
  - Missing scaffolding for architectural trade-off evaluation: While slide 4 introduces trade-off thinking for monolith vs. microservices, subsequent slides don't systematically develop this critical skill. Students would benefit from more activities explicitly comparing competing architectural approaches across quality attributes.

## Lecture 8. Requirements Engineering Fundamentals
- **Outline summary:** This lecture introduces the fundamental concepts and practices of requirements engineering in software development. Students will learn systematic approaches to eliciting, analyzing, documenting, and validating software requirements. The lecture covers the requirements engineering process, various elicitation techniques, the distinction between functional and non-functional requirements, documentation methods including use cases and scenarios, and requirements validation and management strategies.
- **Bloom:** 72 → 88
- **Bloom gaps:**
  - Limited create-level opportunities: Only slide 3 requires students to design/synthesize a complete solution from scratch. For MSc-level work, consider adding 1-2 more activities requiring students to create comprehensive artifacts (e.g., complete SRS section, requirements management plan).
  - Slide 18 (Best Practices) remains at understand level without application. Consider adding a brief case study where students must identify which pitfall occurred and propose the appropriate mitigation strategy.
  - No explicit activity connecting requirements to downstream SDLC phases. Consider adding an analyze-level activity where students trace how a requirement change impacts design, implementation, and testing artifacts.

## Lecture 9. Agile Development Methods and Practices
- **Outline summary:** This lecture provides a comprehensive overview of agile software development methodologies, exploring the Agile Manifesto, Scrum framework, Extreme Programming practices, and iterative development approaches. Students will understand how agile techniques integrate with software engineering principles and learn to apply basic agile development techniques in real-world contexts.
- **Bloom:** 72 → 82
- **Bloom gaps:**
  - Slide 9 (Scrum Artifacts) presents concepts at understand level without activity to apply artifact creation or analysis, creating passive learning gap in otherwise hands-on Scrum sequence
  - Slide 13 (XP Practices map) explains practice integration at understand level but misses opportunity for students to analyze how practices reinforce each other in specific scenarios or design practice adoption sequences
  - Slide 18 (Agile vs Traditional comparison) provides framework at understand level without requiring students to evaluate methodology selection for cases, despite this being explicit learning objective

## Lecture 10. Software Engineering Process and Quality Assurance
- **Outline summary:** This lecture synthesizes the key concepts from the Software Construction, Architecture and Engineering module, focusing on software engineering processes, quality assurance practices, and professional development methodologies. Students will explore software development lifecycle models, testing strategies, configuration management, continuous integration/deployment, and software metrics. The lecture integrates object-oriented principles, design patterns, Design by Contract, and agile methods into a cohesive framework for building high-quality industrial software systems.
- **Bloom:** 42 → 88
- **Bloom gaps:**
  - Limited explicit remember/understand content for foundational concepts. Students encountering SDLC models, testing strategies, or Git workflows for first time may struggle with immediate evaluate-level demands without conceptual scaffolding.
  - Slide 2's three-pillar framework introduced at understand level but immediately leveraged for analyze-level mapping. Consider brief remember-level review of OO principles, patterns, and DbC from prior lectures before demanding integration.
  - Mutation testing (slide 9) introduced as new concept within evaluate-level activity. Students unfamiliar with mutation scores may struggle to critique test suite quality without prior understand-level explanation of what mutation testing measures.
