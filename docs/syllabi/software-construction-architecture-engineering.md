# Software Construction, Architecture and Engineering

**Module code:** MCSSE-SE-01  
**Program:** MSc Computer Science and Software Engineering  
**Institution:** Constructor University  
**Semester:** 1  
**Credits:** 5 CP  
**Recommended format:** 10 lectures x 90 minutes

## Course Description

This course introduces the foundations of modern software construction from the perspective of software quality, object-oriented design, architecture, and engineering discipline. It connects code-level design decisions with larger concerns such as maintainability, reliability, reuse, requirements, and delivery processes.

The module is positioned as a foundational Software Engineering course in the MSc CSSE program. It is especially relevant for students who want to design robust software systems, understand object-oriented reasoning beyond syntax, and connect implementation choices to architectural and process-level consequences.

## Course Goals

By the end of the course, students should be able to:

- use object-oriented techniques to produce high-quality software;
- apply inheritance, genericity, information hiding, and Design by Contract appropriately;
- reason about software reuse, modularity, and maintainability;
- apply fundamental design patterns in context rather than mechanically;
- connect class design decisions with architectural structure;
- understand how agile methods and requirements engineering influence construction choices.

## Recommended Delivery Model

- **10 lectures**
- **90 minutes per lecture**
- **18-24 slides per lecture**
- **Mix of concept slides, diagrams, code examples, and short in-class exercises**

This delivery model keeps the course rigorous without turning each lecture into an overloaded slide deck. It also maps well to later slide generation in Lectura.

## Lecture Plan

### Lecture 1. Course Framing and the Role of Software Construction

- **Duration:** 90 minutes
- **Target deck size:** 16-20 slides
- **Primary goal:** establish what software construction is and why quality must be designed, not patched in later.

**Main topics**

- what software construction covers within software engineering;
- software quality as more than functional correctness;
- the relation between construction, architecture, and engineering;
- why maintainability matters in long-lived systems;
- overview of the course structure and expectations.

**Suggested diagrams**

- software lifecycle overview;
- relationship between code, design, architecture, and process.

**Suggested exercise**

- ask students to compare two pieces of code that both work but differ in readability and evolvability.

### Lecture 2. Abstraction, ADTs, and Class Design

- **Duration:** 90 minutes
- **Target deck size:** 18-22 slides
- **Primary goal:** explain abstraction as the central tool for controlling complexity.

**Main topics**

- abstraction and separation of interface from implementation;
- abstract data types and their role in software design;
- classes as design tools, not just language syntax;
- encapsulation and information hiding;
- responsibility-driven class design.

**Suggested diagrams**

- interface vs implementation boundary;
- ADT-to-class mapping.

**Suggested exercise**

- redesign a poorly structured class into a cleaner abstraction with clearer responsibilities.

### Lecture 3. Inheritance, Polymorphism, and Dynamic Binding

- **Duration:** 90 minutes
- **Target deck size:** 20-24 slides
- **Primary goal:** develop a precise understanding of object-oriented variation mechanisms.

**Main topics**

- subtyping vs inheritance;
- dynamic binding and late dispatch;
- extension vs specialization;
- substitution and behavioral consistency;
- composition vs inheritance trade-offs.

**Suggested diagrams**

- inheritance hierarchy with dynamic dispatch flow;
- comparison of subclassing and composition.

**Suggested exercise**

- evaluate a design where inheritance is overused and propose a safer alternative.

### Lecture 4. Genericity, Reuse, and Component Thinking

- **Duration:** 90 minutes
- **Target deck size:** 18-22 slides
- **Primary goal:** show how reusable software components are designed for flexibility without losing clarity.

**Main topics**

- genericity and parameterized abstractions;
- software reuse beyond copy-paste;
- designing components for extension and safe reuse;
- stability vs flexibility in API design;
- libraries, frameworks, and reusable contracts.

**Suggested diagrams**

- reusable component model;
- generic container abstraction.

**Suggested exercise**

- identify which parts of a small module should be generalized and which should stay concrete.

### Lecture 5. Design by Contract and Correctness

- **Duration:** 90 minutes
- **Target deck size:** 20-24 slides
- **Primary goal:** introduce Design by Contract as a disciplined way to reason about software correctness.

**Main topics**

- preconditions, postconditions, and class invariants;
- client obligations and supplier obligations;
- correctness by specification;
- contracts vs defensive programming;
- Eiffel as a reference notation for precise design.

**Suggested diagrams**

- contract relationship between caller and callee;
- invariant-preserving state transitions.

**Suggested exercise**

- write contracts for a simple stack, queue, or bank-account abstraction.

### Lecture 6. Designing for Reliability and Maintainability

- **Duration:** 90 minutes
- **Target deck size:** 18-22 slides
- **Primary goal:** connect local code quality decisions with long-term maintainability.

**Main topics**

- coupling and cohesion;
- readability, changeability, and evolvability;
- refactoring as quality improvement;
- common code smells in object-oriented systems;
- balancing clarity, extensibility, and correctness.

**Suggested diagrams**

- tight vs loose coupling comparison;
- cohesion examples across class designs.

**Suggested exercise**

- review a code fragment and identify maintainability risks.

### Lecture 7. Fundamental Design Patterns I

- **Duration:** 90 minutes
- **Target deck size:** 20-24 slides
- **Primary goal:** show how patterns capture recurring design solutions without replacing design judgment.

**Main topics**

- what a design pattern is and what it is not;
- Observer;
- Strategy;
- Template Method or Command;
- choosing patterns based on variation points.

**Suggested diagrams**

- Observer collaboration flow;
- Strategy substitution diagram.

**Suggested exercise**

- match a short problem statement to a suitable pattern and justify the choice.

### Lecture 8. Fundamental Design Patterns II

- **Duration:** 90 minutes
- **Target deck size:** 20-24 slides
- **Primary goal:** deepen pattern literacy and discuss the cost of abstraction.

**Main topics**

- Visitor;
- Factory and Abstract Factory;
- Adapter and Facade;
- patterns as architectural building blocks;
- overengineering and misuse of patterns.

**Suggested diagrams**

- Factory creation flow;
- Visitor traversal structure;
- Adapter vs Facade comparison.

**Suggested exercise**

- identify when a proposed pattern use adds value and when it adds unnecessary complexity.

### Lecture 9. Software Architecture for Large Systems

- **Duration:** 90 minutes
- **Target deck size:** 18-22 slides
- **Primary goal:** connect class-level construction to system-level architecture.

**Main topics**

- moving from class design to system structure;
- layers, components, and boundaries;
- architectural decomposition;
- quality attributes and architectural decisions;
- architecture documentation and communication.

**Suggested diagrams**

- layered architecture;
- component-and-connector view;
- architectural boundary map.

**Suggested exercise**

- sketch a high-level architecture for a medium-size software product and explain the main boundaries.

### Lecture 10. Engineering Beyond Code: Agile, Requirements, and Delivery

- **Duration:** 90 minutes
- **Target deck size:** 18-22 slides
- **Primary goal:** integrate construction practices with process, coordination, and delivery concerns.

**Main topics**

- why correct code alone is not enough;
- agile development basics;
- requirements engineering basics;
- traceability from requirements to implementation;
- closing synthesis: construction, architecture, and engineering as one discipline.

**Suggested diagrams**

- requirements-to-code traceability path;
- feedback loops in iterative development.

**Suggested exercise**

- take a small feature request and identify the path from requirement to design decision and implementation task.

## Assessment Ideas

- short design exercises during the semester;
- one applied mini-project or portfolio;
- written exam focused on reasoning, not memorization;
- code review or architecture critique assignment.

## Slide Production Guidance

When converting this syllabus into slide decks, prefer:

- **diagram-heavy lectures:** 2, 5, 9
- **code-heavy lectures:** 3, 4, 6
- **pattern-heavy mixed lectures:** 7, 8
- **concept/process-heavy lectures:** 1, 10

For most lectures, a good balance is:

- 20-25% framing and motivation;
- 40-50% core concepts;
- 20-25% examples or diagrams;
- 10-15% recap and discussion.

## Expansion Paths

This course can be expanded in several directions:

### More formal methods

- stronger emphasis on specification and verification;
- program proving and correctness arguments;
- connection to later advanced software engineering modules.

### More architecture depth

- architecture styles in greater detail;
- architecture documentation standards;
- trade-off analysis using quality attributes.

### More practical implementation work

- weekly code labs;
- design pattern implementation tasks;
- refactoring workshops;
- contract-writing assignments.

### More industry-oriented engineering

- CI and quality gates;
- review workflows and technical debt;
- requirement change management;
- software delivery in agile teams.

## Recommended References

- Bertrand Meyer, *Touch of Class*
- Carlo Ghezzi, Mehdi Jazayeri, Dino Mandrioli, *Fundamentals of Software Engineering*
- Frank Buschmann et al., *Pattern-Oriented Software Architecture*
- Len Bass, Paul Clements, Rick Kazman, *Software Architecture in Practice*

## Status in Lectura

At the moment, the Lectura catalog stores this module as a **single module-level outline**, not yet as a full lecture-by-lecture course. This syllabus is the bridge between the current module representation and a future full course model with separate lectures and slide decks.
