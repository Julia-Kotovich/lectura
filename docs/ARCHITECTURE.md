# ProfDeck — System Architecture

> AI-powered lecture slide creation platform for university CS professors.

## 1. Executive Summary

ProfDeck is a **modular monolith** built on **Next.js 16 (App Router)** with **TypeScript**, **PostgreSQL**, **Prisma**, and **tRPC**. The architecture optimizes for:

- Fast local MVP development
- End-to-end type safety
- Clear boundaries for future service extraction
- Provider-agnostic AI integration
- JSON-native slide documents (export-ready)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT (Browser)                               │
│  React 19 · Zustand · @dnd-kit · tRPC Client · React Query             │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌─────────────────┐ │
│  │ Lecture Form │ │Outline Editor│ │ Slide Editor │ │ Presentation    │ │
│  └──────────────┘ └──────────────┘ └──────────────┘ └─────────────────┘ │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │ tRPC (HTTP) + Streaming (future)
┌───────────────────────────────────▼─────────────────────────────────────┐
│                    NEXT.JS APPLICATION (Modular Monolith)                │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │ API Layer: tRPC Routers (lecture · outline · slides · ai · eval)   │ │
│  └───────────────────────────────┬─────────────────────────────────────┘ │
│  ┌───────────────────────────────▼─────────────────────────────────────┐ │
│  │ Service Layer: LectureService · GenerationService · EvalService      │ │
│  └───────────────────────────────┬─────────────────────────────────────┘ │
│  ┌───────────────────────────────▼─────────────────────────────────────┐ │
│  │ AI Layer: Pipelines · Prompts · Provider Registry · Cache (future)   │ │
│  └───────────────────────────────┬─────────────────────────────────────┘ │
│  ┌───────────────────────────────▼─────────────────────────────────────┐ │
│  │ Data Layer: Prisma ORM → PostgreSQL                                  │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        ▼                           ▼                           ▼
  ┌───────────┐              ┌─────────────┐            ┌─────────────┐
  │ PostgreSQL│              │ OpenAI API  │            │ Redis/BullMQ │
  │ (local)   │              │ (text/img)  │            │ (Phase 2+)   │
  └───────────┘              └─────────────┘            └─────────────┘
```

---

## 2. Stack Decisions & Rationale

| Layer | Choice | Why | Tradeoff |
|-------|--------|-----|----------|
| Framework | **Next.js 16 App Router** | Full-stack, SSR, API routes, Vercel-ready | Monolith coupling until split |
| Language | **TypeScript** | Safety across AI schemas, API, UI | Slightly slower iteration |
| API | **tRPC + Zod** | End-to-end types, no OpenAPI drift | Tied to TypeScript clients |
| Database | **PostgreSQL + Prisma** | Relational integrity, migrations, SaaS standard | Heavier than SQLite for tiny demos |
| Client state | **Zustand** | Simple, performant editor state | Less tooling than Redux |
| Server cache/query | **TanStack Query** | tRPC integration, stale-while-revalidate | Learning curve |
| Styling | **Tailwind CSS 4** | Rapid UI, design tokens | Verbose class names |
| UI primitives | **Custom + CVA** (shadcn-compatible) | Full control, no CLI dependency in scaffold | Manual component maintenance |
| AI text | **OpenAI** (structured JSON) | Best structured output support | Vendor lock-in mitigated by abstraction |
| AI images | **OpenAI DALL·E** (MVP) | Single provider simplicity | Cost per image |
| Auth (future) | **Auth.js v5** | Next.js native, OAuth ready | Not in MVP scope |
| Jobs (future) | **BullMQ + Redis** | Reliable generation queues | Extra infra locally |

### Why NOT separate microservices (yet)?

A single deployable unit reduces operational overhead for MVP. **Module boundaries** (`src/server/ai`, `src/server/services`, `src/server/trpc`) allow extracting:

- `ai-worker` service (generation queue)
- `export-service` (PPTX/PDF)
- `asset-cdn` (image storage)

when traffic or team size demands it.

---

## 3. Module Boundaries

### Frontend (`src/app`, `src/components`, `src/stores`)

| Responsibility | Does | Does NOT |
|----------------|------|----------|
| Pages & layouts | Routing, shell, presentation mode | Direct DB access |
| Components | UI, DnD editor, forms | AI prompt logic |
| Zustand stores | Optimistic UI, selection, draft edits | Source of truth (DB is) |

### API (`src/server/trpc`)

| Responsibility | Does | Does NOT |
|----------------|------|----------|
| Routers | Validation, auth hooks (future), orchestration | Raw OpenAI calls |
| Context | DB client, session, request ID | Business rules |

### Services (`src/server/services`)

| Responsibility | Does | Does NOT |
|----------------|------|----------|
| LectureService | CRUD, versioning hooks | UI formatting |
| GenerationService | Job orchestration, persistence | Provider SDK calls |

### AI (`src/server/ai`)

| Responsibility | Does | Does NOT |
|----------------|------|----------|
| Providers | OpenAI/Mock/Stability adapters | HTTP routing |
| Pipelines | Prompt → parse → validate → retry | Database writes |
| Prompts | Versioned templates | Runtime config UI |

### Domain (`src/types`, `src/lib/schemas`)

Shared Zod schemas for outlines, slides, evaluations — used by AI parsers **and** API validation.

---

## 4. Data Model

See `prisma/schema.prisma`. Core entities:

```
User ──< Lecture ──< OutlineVersion
                 └──< Slide ──< SlideBlock
                 └──< GenerationJob
                 └──< SlideEvaluation
```

**Slide document model** (JSON in `Slide.content` + normalized `SlideBlock` rows for querying):

```typescript
SlideDocument {
  id, title, layout: 'title' | 'content' | 'split' | 'code' | 'image'
  blocks: SlideBlock[]  // text | bullets | code | image | diagram
  speakerNotes: string
  metadata: { transitions?, animations?, tags? }
}
```

**Why JSON + blocks?** JSON enables flexible editor and export adapters; optional normalized blocks support future search/analytics.

---

## 5. API Structure (tRPC)

| Router | Procedures | Purpose |
|--------|------------|---------|
| `lecture` | `create`, `get`, `list`, `update` | Lecture CRUD |
| `outline` | `generate`, `get`, `update` | AI outline + manual edits |
| `slides` | `generateFromOutline`, `getDeck`, `updateSlide`, `reorder` | Deck management |
| `ai` | `regenerateSlide`, `generateImage` | Targeted AI ops |
| `evaluation` | `evaluateDeck`, `evaluateSlide` | Quality scoring |

All inputs/outputs validated with **Zod** schemas in `src/lib/schemas/`.

---

## 6. State Management Strategy

| State type | Store | Sync |
|------------|-------|------|
| Server data (lectures, slides) | React Query via tRPC | Automatic cache invalidation |
| Editor UI (selection, panel, DnD) | Zustand `editor-store` | Local only |
| Generation progress | Zustand + tRPC polling | Phase 2: SSE/WebSocket |
| Auth session | Auth.js (future) | HTTP-only cookies |

**Principle:** Server is source of truth; Zustand holds ephemeral editor state and debounced drafts synced via `slides.updateSlide`.

---

## 7. Authentication (Future-Ready)

MVP uses a **development guest user** (`DEV_USER_ID` in `.env`). Production path:

1. Auth.js with Google/Microsoft OAuth (university SSO later)
2. `User` table already linked to all resources
3. tRPC `protectedProcedure` middleware checks session
4. Row-level isolation: `where: { userId: ctx.session.user.id }`

No auth UI in MVP — architecture supports drop-in.

---

## 8. Slide Rendering Strategy

### Internal representation
Block-based JSON (Notion/Gamma-inspired), not pixel canvas.

### Rendering pipeline
```
SlideDocument → SlideRenderer → React components per block type
                              → PresentationMode (fullscreen, keyboard nav)
```

### Layout system
Predefined layouts (`title`, `content`, `split`, `code`, `image`) map to CSS grid templates in `SlideCanvas`.

### Future export
Adapter interface:

```typescript
interface ExportAdapter {
  format: 'pptx' | 'pdf' | 'google-slides'
  export(deck: SlideDeck): Promise<Buffer | string>
}
```

Implementations: `pptxgenjs`, Puppeteer PDF, Google Slides API.

---

## 9. Image Generation Pipeline

```
SlideBlock(image prompt) 
  → ImageGenerationPipeline
  → ImageProvider (OpenAI | Stability | Replicate)
  → Store URL/path (MVP: base64/data URL in DB; prod: S3 + CDN)
  → Update SlideBlock.assetUrl
```

**Provider abstraction:**

```typescript
interface ImageProvider {
  name: string
  generate(input: ImageGenerationInput): Promise<ImageGenerationResult>
}
```

**Retry policy:** 3 attempts, exponential backoff, fallback to MockProvider in dev.

**Caching (Phase 2):** Hash(prompt + provider + model) → skip duplicate generations.

---

## 10. AI Evaluation / Scoring Architecture

```
SlideDeck → EvaluationPipeline
         → Prompt with rubric (clarity, density, readability, pedagogy, visual balance)
         → Structured JSON output (Zod validated)
         → SlideEvaluation record
         → UI ScorePanel with warnings/suggestions
```

**Rubric dimensions (0–100 each):**
- Clarity — can a student follow the main point?
- Information density — not too sparse or crowded
- Readability — typography, hierarchy, bullet length
- Teaching effectiveness — examples, progression, learning alignment
- Visual balance — text vs visuals ratio

**Per-slide vs deck-level:** Deck evaluation in MVP; per-slide in Phase 2.

---

## 11. AI System Design

### Prompt pipelines
Each pipeline: `buildPrompt()` → `callLLM()` → `parseStructured()` → `validate(Zod)` → `retry if invalid`

| Pipeline | Model (default) | Output schema |
|----------|-----------------|---------------|
| OutlineGenerator | gpt-4o-mini | `LectureOutline` |
| SlideGenerator | gpt-4o | `SlideDeckDraft` |
| EvaluationPipeline | gpt-4o-mini | `DeckEvaluation` |
| ImageGeneration | dall-e-3 | binary URL |

### Provider registry
`src/server/ai/registry.ts` selects providers from env:

```
AI_TEXT_PROVIDER=openai|mock
AI_IMAGE_PROVIDER=openai|mock
```

### Streaming (Phase 2)
Server-Sent Events for outline/slide token streaming; UI progressive render.

### Generation queues (Phase 2)
BullMQ jobs: `outline.generate`, `slides.generate`, `image.generate`, `evaluation.run`

### Caching (Phase 2)
Redis: prompt hash → response TTL 24h for identical lecture configs.

---

## 12. Scalability Path

| Stage | Architecture |
|-------|--------------|
| Local MVP | Monolith + Docker Postgres |
| Beta | Vercel + Neon Postgres + Upstash Redis |
| Growth | S3/R2 assets, BullMQ workers on Railway/Fly |
| Scale | Split AI worker, CDN, read replicas, multi-tenant RLS |

---

## 13. Engineering Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| AI output drift / invalid JSON | Broken generation | Zod + retry + mock fallback |
| Long generation times | Poor UX | Streaming, job queue, progress UI |
| Image cost | Budget overrun | Caching, user confirmation, mock mode |
| Slide JSON schema changes | Data migration pain | Version field on Slide, migration scripts |
| Editor complexity | Slow MVP | Block model, limited layouts first |
| Vendor lock-in | Migration cost | Provider interfaces from day one |

---

## 14. Assumptions (Documented)

1. **Single professor per lecture** in MVP (no real-time collaboration).
2. **English UI** for MVP; i18n hooks reserved in metadata.
3. **Guest auth** locally; real auth before cloud deploy.
4. **Images stored as URLs** (external or data URLs) — S3 in production.
5. **CS-focused prompts** — domain templates in `src/server/ai/prompts/`.

---

## 15. Folder Structure

See `docs/PROJECT_STRUCTURE.md` and repository root `src/` tree.
