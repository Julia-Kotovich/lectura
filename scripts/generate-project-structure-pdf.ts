/**
 * Generate docs/project-structure.pdf — an English overview of the Lectura
 * repository layout and module responsibilities.
 *
 * Usage:  npx tsx scripts/generate-project-structure-pdf.ts
 */

import { createWriteStream } from "node:fs";
import { join } from "node:path";
import PDFDocument from "pdfkit";

const OUTPUT = join(process.cwd(), "docs", "project-structure.pdf");

type Doc = InstanceType<typeof PDFDocument>;

function heading(doc: Doc, text: string, level: 1 | 2 | 3 = 1) {
  const sizes = { 1: 16, 2: 13, 3: 11 } as const;
  doc.moveDown(level === 1 ? 0.8 : 0.4);
  doc.font("Helvetica-Bold").fontSize(sizes[level]).fillColor("#111").text(text);
  doc.fillColor("#000");
  doc.moveDown(0.25);
}

function para(doc: Doc, text: string) {
  doc.font("Helvetica").fontSize(10).text(text, { align: "left", lineGap: 2 });
  doc.moveDown(0.2);
}

function bullet(doc: Doc, text: string, indent = 12) {
  doc.font("Helvetica").fontSize(10).text(`•  ${text}`, { indent, lineGap: 1.5 });
}

function codeBlock(doc: Doc, text: string) {
  doc.moveDown(0.15);
  doc.font("Courier").fontSize(8.5).fillColor("#333");
  doc.text(text, { indent: 8, lineGap: 1 });
  doc.fillColor("#000");
  doc.moveDown(0.2);
}

function tableRow(doc: Doc, cols: [string, string], bold = false) {
  doc.font(bold ? "Helvetica-Bold" : "Helvetica").fontSize(9.5);
  const y = doc.y;
  doc.text(cols[0], 56, y, { width: 160, continued: false });
  doc.text(cols[1], 220, y, { width: 320 });
  doc.moveDown(0.1);
}

function renderPdf() {
  const doc = new PDFDocument({
    size: "A4",
    margin: 56,
    info: {
      Title: "Lectura — Project Structure",
      Author: "Lectura",
      Subject: "Repository layout and module overview",
    },
  });
  doc.pipe(createWriteStream(OUTPUT));
  doc.font("Helvetica");

  // ── Cover ───────────────────────────────────────────────────────────────
  doc.font("Helvetica-Bold").fontSize(24).text("Lectura");
  doc.moveDown(0.3);
  doc.font("Helvetica").fontSize(14).fillColor("#444").text("Project Structure Overview");
  doc.moveDown(0.8);
  doc.fillColor("#222").fontSize(11);
  doc.text("AI-powered lecture slide creation for university CS professors");
  doc.moveDown(0.4);
  doc.fontSize(10).fillColor("#666");
  doc.text(`Generated: ${new Date().toISOString().slice(0, 10)}`);
  doc.fillColor("#000");

  // ── 1. What is Lectura ──────────────────────────────────────────────────
  heading(doc, "1. What is Lectura?");
  para(
    doc,
    "Lectura is a web application that helps university professors plan lectures, " +
      "generate structured outlines with AI, convert them into presentation slides, " +
      "create visuals, evaluate teaching quality, and present in fullscreen mode. " +
      "It is built as a modular monolith on Next.js 16 with end-to-end TypeScript type safety.",
  );

  // ── 2. Tech Stack ───────────────────────────────────────────────────────
  heading(doc, "2. Technology Stack");
  tableRow(doc, ["Layer", "Technology"], true);
  tableRow(doc, ["Framework", "Next.js 16 (App Router), React 19"]);
  tableRow(doc, ["Language", "TypeScript"]);
  tableRow(doc, ["API", "tRPC + Zod + SuperJSON"]);
  tableRow(doc, ["Database", "PostgreSQL + Prisma ORM"]);
  tableRow(doc, ["Client state", "Zustand + TanStack Query"]);
  tableRow(doc, ["Styling", "Tailwind CSS 4"]);
  tableRow(doc, ["AI (text)", "OpenAI / Anthropic (Claude) / Mock"]);
  tableRow(doc, ["AI (images)", "OpenAI / Stability / Replicate / Mock"]);
  tableRow(doc, ["Auth", "Auth.js v5 (optional; guest mode for local dev)"]);
  tableRow(doc, ["Jobs (optional)", "BullMQ + Redis"]);
  tableRow(doc, ["Storage (optional)", "Local filesystem or S3 (MinIO)"]);
  tableRow(doc, ["Export", "PPTX (pptxgenjs), PDF (pdfkit)"]);
  tableRow(doc, ["Testing", "Vitest (unit), Playwright (e2e)"]);

  // ── 3. Top-level layout ─────────────────────────────────────────────────
  heading(doc, "3. Repository Layout");
  codeBlock(
    doc,
    `lectura/
├── docs/                  Documentation (architecture, roadmap, PDFs)
├── OOP_Peter_Muller/      Source lecture PDFs + generated course plan
├── prisma/                Database schema, migrations, seed
├── public/                Static assets
├── scripts/               Dev utilities (worker, PDF generators)
├── src/                   Application source code
│   ├── app/               Next.js pages & API routes
│   ├── components/        React UI components
│   ├── lib/               Shared schemas, utilities, tRPC client
│   ├── server/            Backend: tRPC, services, AI pipelines
│   ├── stores/            Zustand client state
│   └── types/             TypeScript type re-exports
├── storage/               Local file storage for lecture exports
├── e2e/                   Playwright end-to-end tests
├── docker-compose.yml     Local Postgres, Redis, MinIO
├── package.json
└── README.md`,
  );

  // ── 4. Architecture layers ──────────────────────────────────────────────
  doc.addPage();
  heading(doc, "4. Architecture Layers");
  para(
    doc,
    "The codebase follows a layered modular monolith. Each layer has a clear boundary " +
      "so parts can be extracted into separate services later (e.g. an AI worker or export service).",
  );

  tableRow(doc, ["Path", "Responsibility"], true);
  tableRow(doc, ["src/app", "Pages, routing, thin composition of UI components"]);
  tableRow(doc, ["src/components", "React UI — no direct database access"]);
  tableRow(doc, ["src/stores", "Ephemeral editor state (selection, DnD, drafts)"]);
  tableRow(doc, ["src/lib/schemas", "Zod schemas — shared contracts for API and AI"]);
  tableRow(doc, ["src/server/trpc", "API routers — validation and orchestration"]);
  tableRow(doc, ["src/server/services", "Business logic, DB transactions"]);
  tableRow(doc, ["src/server/ai", "AI providers, prompts, generation pipelines"]);
  tableRow(doc, ["src/server/export", "PPTX/PDF export adapters"]);
  tableRow(doc, ["src/server/queue", "BullMQ job definitions (optional)"]);
  tableRow(doc, ["src/server/storage", "Local/S3 file storage abstraction"]);
  tableRow(doc, ["prisma/", "PostgreSQL schema and migrations"]);

  heading(doc, "4.1 Request Flow", 2);
  para(doc, "Browser → React page → tRPC client → tRPC router → Service → Prisma/AI pipeline → response");
  para(
    doc,
    "The server is the source of truth. The slide editor keeps local UI state in Zustand " +
      "and syncs changes back via tRPC mutations.",
  );

  // ── 5. Frontend ─────────────────────────────────────────────────────────
  heading(doc, "5. Frontend (src/app + src/components)");
  heading(doc, "5.1 Pages (App Router)", 2);
  bullet(doc, "/ — Dashboard: list of lectures");
  bullet(doc, "/lectures/new — Create a lecture, pick a template, generate outline");
  bullet(doc, "/lectures/[id] — Main editor: outline, slides, evaluation tabs");
  bullet(doc, "/lectures/[id]/present — Fullscreen presentation mode");
  bullet(doc, "/templates — Browse lecture templates (OS, Algorithms, ML, …)");
  bullet(doc, "/courses — Browse static reference courses");
  bullet(doc, "/courses/[slug] — Course detail with lecture outlines");
  bullet(doc, "/auth/signin — OAuth sign-in (when auth is enabled)");
  bullet(doc, "/api/trpc/[trpc] — tRPC HTTP handler");

  heading(doc, "5.2 Component Groups", 2);
  bullet(doc, "components/layout/ — App shell, navigation, theme toggle");
  bullet(doc, "components/lecture/ — Lecture form, outline editor");
  bullet(doc, "components/slides/ — Block editor, canvas, DnD reorder, presentation");
  bullet(doc, "components/evaluation/ — Quality scores, rubric display");
  bullet(doc, "components/ui/ — Reusable primitives (Button, Card, Badge, Input, …)");

  heading(doc, "5.3 Client State", 2);
  bullet(doc, "Zustand (stores/) — editor selection, panel state, drag-and-drop");
  bullet(doc, "TanStack Query via tRPC — server data cache with automatic invalidation");

  // ── 6. Backend API ─────────────────────────────────────────────────────
  doc.addPage();
  heading(doc, "6. Backend API (tRPC Routers)");
  para(doc, "All API endpoints are defined in src/server/trpc/routers/ and composed in root.ts:");

  tableRow(doc, ["Router", "Purpose"], true);
  tableRow(doc, ["lecture", "CRUD for lectures (create, get, list, update, delete)"]);
  tableRow(doc, ["outline", "AI outline generation and manual editing"]);
  tableRow(doc, ["slides", "Generate deck from outline, update/reorder slides"]);
  tableRow(doc, ["ai", "Per-slide regeneration, image generation"]);
  tableRow(doc, ["evaluation", "AI quality scoring (clarity, density, pedagogy, …)"]);
  tableRow(doc, ["export", "Export deck to PPTX or PDF"]);
  tableRow(doc, ["templates", "Lecture template library"]);
  tableRow(doc, ["courses", "Static reference courses (e.g. ETH Müller OOP)"]);
  tableRow(doc, ["versions", "Deck version snapshots and restore"]);
  tableRow(doc, ["share", "Lecture sharing (viewer/editor roles)"]);
  tableRow(doc, ["comments", "Per-slide comments"]);

  heading(doc, "6.1 Services", 2);
  para(doc, "Business logic lives in src/server/services/. Routers stay thin and delegate to services for:");
  bullet(doc, "Lecture CRUD and status transitions");
  bullet(doc, "Outline and slide persistence");
  bullet(doc, "Generation job orchestration");
  bullet(doc, "Version snapshots");
  bullet(doc, "Export file generation");

  // ── 7. AI System ────────────────────────────────────────────────────────
  heading(doc, "7. AI System (src/server/ai)");
  para(
    doc,
    "AI generation is provider-agnostic. A registry selects text/image providers from " +
      "environment variables (AI_TEXT_PROVIDER, AI_IMAGE_PROVIDER).",
  );

  heading(doc, "7.1 Providers", 2);
  bullet(doc, "providers/openai-text.ts, openai-image.ts — OpenAI GPT / DALL·E");
  bullet(doc, "providers/anthropic-text.ts — Anthropic Claude");
  bullet(doc, "providers/mock-text.ts, mock-image.ts — Deterministic dev fallback");
  bullet(doc, "providers/stability-image.ts, replicate-image.ts — Alternative image APIs");

  heading(doc, "7.2 Pipelines", 2);
  bullet(doc, "pipelines/outline-generator.ts — Topic → LectureOutline (Zod-validated JSON)");
  bullet(doc, "pipelines/slide-generator.ts — Outline → SlideDeck");
  bullet(doc, "pipelines/single-slide.ts — Regenerate one slide");
  bullet(doc, "pipelines/image-generator.ts — Prompt → image URL");
  bullet(doc, "pipelines/evaluation.ts — Deck → quality scores and suggestions");

  heading(doc, "7.3 Prompts", 2);
  para(
    doc,
    "Versioned prompt templates in prompts/ (outline.ts, slides.ts, evaluation.ts, single-slide.ts). " +
      "Course frameworks (see §9) are injected into outline/slide prompts when selected.",
  );

  heading(doc, "7.4 Pipeline Pattern", 2);
  para(doc, "buildPrompt() → callLLM() → parseStructured() → validate(Zod) → retry on failure");

  // ── 8. Data Model ───────────────────────────────────────────────────────
  doc.addPage();
  heading(doc, "8. Data Model (PostgreSQL / Prisma)");
  para(doc, "Schema: prisma/schema.prisma. Core entity relationships:");
  codeBlock(
    doc,
    `User ──< Lecture ──< OutlineVersion
              │         └──< SlideDeckVersion
              ├──< Slide ──< SlideBlock
              │         └──< SlideComment
              ├──< GenerationJob
              ├──< SlideEvaluation
              └──< LectureShare

Organization ──< OrganizationMember >── User
LectureTemplate (seeded templates, independent of users)`,
  );

  heading(doc, "8.1 Key Models", 2);
  bullet(doc, "Lecture — title, audience, duration, difficulty, status (DRAFT → PUBLISHED)");
  bullet(doc, "OutlineVersion — versioned JSON outline content");
  bullet(doc, "Slide — ordered slides with layout, JSON content, speaker notes");
  bullet(doc, "SlideBlock — normalized blocks (text, bullets, code, image, diagram)");
  bullet(doc, "GenerationJob — async AI job tracking (outline, slides, image, evaluation)");
  bullet(doc, "SlideEvaluation — AI rubric scores and feedback");
  bullet(doc, "LectureTemplate — pre-built outline templates for common CS topics");

  heading(doc, "8.2 Slide Document Model", 2);
  para(
    doc,
    "Slides use a block-based JSON representation (not a pixel canvas). Each slide has a layout " +
      "(title, content, split, code, image) and an ordered array of typed blocks. This enables " +
      "flexible editing, presentation rendering, and export to PPTX/PDF.",
  );

  // ── 9. Domain Schemas & Courses ─────────────────────────────────────────
  heading(doc, "9. Domain Schemas & Course Frameworks");
  heading(doc, "9.1 Zod Schemas (src/lib/schemas/)", 2);
  bullet(doc, "outline.ts — LectureOutline, sections, subsections, learning goals");
  bullet(doc, "slide.ts — SlideDeck, SlideDocument, SlideBlock types");
  bullet(doc, "evaluation.ts — DeckEvaluation, rubric dimensions");
  bullet(doc, "lecture.ts — Lecture creation/update inputs");

  heading(doc, "9.2 Course Frameworks (src/lib/course-frameworks/)", 2);
  para(
    doc,
    "Pedagogical templates that guide AI generation. When a professor selects a framework " +
      "(e.g. oop-bachelor), its structure, timing model, and rules are injected into AI prompts.",
  );
  bullet(doc, "oop-bachelor.ts — 12–14 week OOP course for CS undergraduates (default framework)");

  heading(doc, "9.3 Static Courses (src/lib/courses/)", 2);
  para(
    doc,
    "Pre-built reference courses derived from real lecture materials, served via the /courses UI " +
      "without requiring AI generation.",
  );
  bullet(doc, "coop-eth-mueller.ts — Prof. Peter Müller's ETH 'Concepts of OOP' (7 lectures)");
  bullet(doc, "OOP_Peter_Muller/ — Original PDF slides + course-plan.pdf (parsed outline)");

  // ── 10. Infrastructure ──────────────────────────────────────────────────
  doc.addPage();
  heading(doc, "10. Infrastructure & Configuration");
  heading(doc, "10.1 Environment Variables", 2);
  tableRow(doc, ["Variable", "Purpose"], true);
  tableRow(doc, ["DATABASE_URL", "PostgreSQL connection string"]);
  tableRow(doc, ["AI_TEXT_PROVIDER", "mock | openai | anthropic"]);
  tableRow(doc, ["AI_IMAGE_PROVIDER", "mock | openai | stability | replicate"]);
  tableRow(doc, ["ANTHROPIC_API_KEY", "Claude API key"]);
  tableRow(doc, ["OPENAI_API_KEY", "OpenAI API key"]);
  tableRow(doc, ["AUTH_DISABLED", "Skip OAuth, use guest user (local dev)"]);
  tableRow(doc, ["USE_JOB_QUEUE", "Enable BullMQ async generation"]);
  tableRow(doc, ["REDIS_URL", "Redis for cache and job queue"]);
  tableRow(doc, ["STORAGE_PROVIDER", "local or s3"]);

  heading(doc, "10.2 Local Development", 2);
  bullet(doc, "docker compose up -d — Postgres (5433), Redis, MinIO");
  bullet(doc, "brew services start postgresql@14 — Alternative local Postgres on 5432");
  bullet(doc, "npm run dev — Next.js dev server at http://127.0.0.1:3000");
  bullet(doc, "npm run worker — Background job processor (when USE_JOB_QUEUE=true)");
  bullet(doc, "scripts/start-local.sh — Full local bootstrap script");

  heading(doc, "10.3 Storage", 2);
  bullet(doc, "storage/lectures/ — Local export files (PDF plans, generated assets)");
  bullet(doc, "src/server/storage/ — Storage provider abstraction (local / S3)");

  // ── 11. Scripts & Tests ─────────────────────────────────────────────────
  heading(doc, "11. Scripts & Testing");
  tableRow(doc, ["Command / Path", "Purpose"], true);
  tableRow(doc, ["npm run dev", "Start development server"]);
  tableRow(doc, ["npm run build", "Production build"]);
  tableRow(doc, ["npm run db:migrate", "Run Prisma migrations"]);
  tableRow(doc, ["npm run db:seed", "Seed lecture templates"]);
  tableRow(doc, ["npm run test", "Vitest unit tests"]);
  tableRow(doc, ["npm run test:e2e", "Playwright smoke tests"]);
  tableRow(doc, ["scripts/worker.ts", "BullMQ background worker"]);
  tableRow(doc, ["scripts/build-muller-course-plan.ts", "Parse Müller PDFs → course plan"]);
  tableRow(doc, ["scripts/generate-project-structure-pdf.ts", "Generate this document"]);

  // ── 12. User Workflow ───────────────────────────────────────────────────
  heading(doc, "12. Typical User Workflow");
  bullet(doc, "1. Professor opens /lectures/new, enters topic and selects a template or course framework");
  bullet(doc, "2. AI generates a structured outline → professor edits sections in the outline editor");
  bullet(doc, "3. AI generates slides from the outline → professor edits blocks in the slide editor");
  bullet(doc, "4. Optional: regenerate individual slides, generate images, run quality evaluation");
  bullet(doc, "5. Export to PPTX or present in fullscreen mode at /lectures/[id]/present");
  bullet(doc, "Alternative: browse /courses for a reference course and adopt lectures into the library");

  heading(doc, "13. Further Reading", 2);
  bullet(doc, "docs/ARCHITECTURE.md — Full system design, risks, scalability path");
  bullet(doc, "docs/ROADMAP.md — Phased implementation plan (MVP → SaaS)");
  bullet(doc, "docs/PROJECT_STRUCTURE.md — Markdown version of this overview");
  bullet(doc, "docs/course-frameworks/oop-bachelor.md — OOP course framework specification");

  doc.end();
}

console.log(`Generating ${OUTPUT} ...`);
renderPdf();
setTimeout(() => console.log("Done."), 500);
