# Lectura

**AI-powered lecture slide creation for university CS professors.**

Lectura helps professors plan lectures, generate structured outlines, convert them into presentation slides, create visuals, evaluate teaching quality, and present — with a production-oriented architecture ready for cloud deployment.

## Features

- Lecture topic input + **template library** (OS, Algorithms, ML)
- AI outline & slide generation (editable, mock or OpenAI)
- Block-based editor: DnD reorder, Shiki code, Mermaid diagrams
- Per-slide & image regeneration
- AI quality evaluation
- **PPTX export**
- Deck version history (snapshots + restore)
- Comments & lecture sharing (viewer/editor)
- Presentation mode + dark/light theme
- Optional: Auth.js (Google), Redis jobs, MinIO storage

## Tech stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| API | tRPC + Zod + SuperJSON |
| Database | PostgreSQL + Prisma |
| Client state | Zustand + TanStack Query |
| Styling | Tailwind CSS 4 |
| AI | OpenAI (text + images) with mock fallback |

See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for full system design.

## Prerequisites

- Node.js 20+ (22 LTS recommended)
- Docker (for local PostgreSQL)
- Optional: OpenAI API key for real AI generation

## Quick start

```bash
cd lectura
cp .env.example .env

# Start infrastructure (Postgres + Redis + MinIO)
docker compose up -d

npm install
npx prisma migrate deploy   # or: npm run db:migrate
npm run db:seed             # lecture templates

npm run dev
```

Optional background worker (when `USE_JOB_QUEUE=true`):

```bash
npm run worker
```

Open [http://localhost:3000](http://localhost:3000).

### Jupyter notebook (all-in-one)

```bash
jupyter notebook run-lectura.ipynb
```

Run cells top-to-bottom to install deps, start Docker, migrate, seed, and launch the dev server.

## Environment variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | see `.env.example` |
| `AI_TEXT_PROVIDER` | `mock`, `openai`, `anthropic` (alias: `claude`) | `mock` |
| `AI_IMAGE_PROVIDER` | `openai`, `mock`, `stability`, `replicate` | `mock` |
| `ANTHROPIC_API_KEY` | Required when using Claude | — |
| `ANTHROPIC_TEXT_MODEL` | Model for outlines | `claude-sonnet-4-5-20250929` |
| `ANTHROPIC_SLIDE_MODEL` | Model for slides | same as text model |
| `OPENAI_API_KEY` | Required when using OpenAI | — |
| `AUTH_DISABLED` | Skip OAuth, use guest user | `true` |
| `USE_JOB_QUEUE` | BullMQ async generation | `false` |
| `REDIS_URL` | Redis for cache & jobs | `redis://localhost:6379` |
| `STORAGE_PROVIDER` | `local` or `s3` | `local` |
| `DEV_USER_ID` | Local guest user ID | `dev-user-local` |

## Development commands

```bash
npm run dev          # Start Next.js dev server
npm run build        # Production build
npm run lint         # ESLint
npm run db:migrate   # Prisma migrate dev
npm run db:studio    # Prisma Studio GUI
npm run db:push      # Push schema without migration
npm run db:seed      # Seed lecture templates
npm run worker       # BullMQ worker (optional)
npm run test         # Vitest unit tests
npm run test:e2e     # Playwright smoke tests
```

## Project structure

```
src/
├── app/              # Pages & API routes
├── components/       # UI (lecture, slides, evaluation)
├── lib/              # Schemas, tRPC client, utilities
├── server/           # tRPC routers, services, AI pipelines
└── stores/           # Zustand editor state
```

## Workflow

1. **Create lecture** → `/lectures/new`
2. **AI generates outline** → edit sections
3. **Generate slides** → visual editor
4. **Evaluate quality** → scores & suggestions
5. **Present** → fullscreen mode

## Roadmap

See [docs/ROADMAP.md](./docs/ROADMAP.md):

- **Phase 1** — MVP (current)
- **Phase 2** — Streaming, job queues, more image providers
- **Phase 3** — Collaboration & auth
- **Phase 4** — SaaS scaling, export, billing

## Architecture highlights

- **Modular monolith** — single deployable, clear module boundaries
- **Provider abstraction** — swap OpenAI / Stability / Replicate
- **Structured AI outputs** — Zod validation + retry
- **JSON slide documents** — export-ready (PPTX adapter planned)

## License

Private / MIT (configure as needed).
