# ProfDeck — Technical Roadmap

## Phase 1 — MVP ✅

- [x] Architecture & project scaffold
- [x] PostgreSQL schema (Prisma)
- [x] tRPC API layer
- [x] AI provider abstraction + mock mode
- [x] Outline / slide generation
- [x] Visual slide editor + presentation mode
- [x] AI evaluation
- [x] Image generation hook
- [x] **PPTX export**
- [x] **Unit + E2E smoke tests**

## Phase 2 — AI & UX ✅ (foundation)

- [x] SSE streaming endpoint for outline (`/api/stream/outline`)
- [x] BullMQ + Redis job queue (opt-in via `USE_JOB_QUEUE=true`)
- [x] Per-slide regeneration with context
- [x] Response caching (Redis + in-memory fallback)
- [x] Stability AI / Replicate image providers
- [x] S3/MinIO + local asset storage
- [x] Shiki code highlighting
- [x] Mermaid diagram rendering
- [x] Deck version history (snapshots + restore)
- [x] Dark/light theme toggle

## Phase 3 — Collaboration ✅ (foundation)

- [x] Auth.js setup (Google OAuth when configured)
- [x] Organization model (schema)
- [x] Lecture sharing (viewer/editor roles)
- [x] Slide comments
- [ ] Real-time co-editing (Yjs) — future
- [x] Template library + seed data
- [ ] Import PPTX/PDF — future

## Phase 4 — SaaS Scaling (planned)

- Multi-tenant isolation, Stripe, quotas, production export, observability, deploy guides

See [ARCHITECTURE.md](./ARCHITECTURE.md) for system design.
