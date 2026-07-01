# Project Structure

```
lectura/
├── docs/
│   ├── ARCHITECTURE.md       # System design (this repo)
│   ├── ROADMAP.md            # Phased implementation plan
│   └── PROJECT_STRUCTURE.md  # This file
├── prisma/
│   └── schema.prisma         # Database schema
├── public/                   # Static assets
├── src/
│   ├── app/                  # Next.js App Router pages
│   │   ├── api/trpc/         # tRPC HTTP handler
│   │   ├── lectures/         # Lecture workflows
│   │   │   ├── new/          # Create lecture + generate outline
│   │   │   └── [id]/         # Editor + presentation
│   │   ├── layout.tsx
│   │   ├── page.tsx          # Dashboard
│   │   └── globals.css
│   ├── components/
│   │   ├── evaluation/       # Score panels, rubric display
│   │   ├── layout/           # App shell, nav
│   │   ├── lecture/          # Forms, outline editor
│   │   ├── slides/           # Editor, canvas, presentation
│   │   └── ui/               # Reusable primitives (Button, Card, …)
│   ├── lib/
│   │   ├── schemas/          # Zod domain schemas (shared)
│   │   ├── trpc/             # Client + React provider
│   │   ├── db.ts             # Prisma singleton
│   │   └── utils.ts          # cn(), helpers
│   ├── server/
│   │   ├── ai/
│   │   │   ├── providers/    # OpenAI, Mock, (Stability future)
│   │   │   ├── prompts/      # Versioned prompt templates
│   │   │   ├── pipelines/    # Outline, slides, eval, image
│   │   │   └── registry.ts   # Provider selection from env
│   │   ├── services/         # Business logic (DB orchestration)
│   │   └── trpc/
│   │       ├── routers/      # Feature routers
│   │       ├── context.ts
│   │       ├── trpc.ts       # Procedures, middleware
│   │       └── root.ts
│   ├── stores/               # Zustand client state
│   └── types/                # TypeScript types (re-exports from schemas)
├── docker-compose.yml        # PostgreSQL for local dev
├── .env.example
└── README.md
```

## Layer responsibilities

| Path | Layer | Notes |
|------|-------|-------|
| `src/app` | Presentation | Thin pages, compose components |
| `src/components` | UI | No direct Prisma imports |
| `src/server/trpc` | API | Thin routers → services |
| `src/server/services` | Domain services | Transactions, orchestration |
| `src/server/ai` | AI infrastructure | No HTTP, no Prisma (pipelines receive/return data) |
| `src/lib/schemas` | Contracts | Single source of truth for shapes |
| `src/stores` | Client state | Editor-only ephemeral state |
