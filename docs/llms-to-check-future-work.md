# LLMs to Check / Future Work

Notes for a small model A/B comparison in ProfDeck (slide generation quality), without changing the product yet.

## Current setup in this project

| Provider | API key in local `.env` | Current ProfDeck model |
|----------|-------------------------|------------------------|
| Anthropic | Present | `claude-sonnet-4-5-20250929` (baseline full run) |
| OpenAI | Empty / not set | Config defaults mention `gpt-4o` / `gpt-4o-mini`, but Sol cannot be run without a key |

**Baseline used in the MCSSE-SE-01 full run:** Anthropic Claude Sonnet 4.5  
- Notebook slug: `anthropic/claude-sonnet-4.5`  
- API id: `claude-sonnet-4-5-20250929`

## Recommended approach (before adding models to the product)

1. Do **not** add multiple models into the product first.
2. Run a **small A/B on one lecture** with fixed prompts and the same human rubric.
3. Change **only the model** between variants.
4. Measure success with human criteria (Correctness / Completeness / Clarity / Ready-to-teach / Usable), not only Bloom score.

## Candidate models for comparison

| # | Model | API model id | Role in experiment | Approx. price ($/MTok in → out) | Why it may fit ProfDeck | Risks / notes |
|---|--------|--------------|--------------------|----------------------------------|------------------------|---------------|
| **0** | **Claude Sonnet 4.5** | `claude-sonnet-4-5-20250929` | **Baseline** | ~$3 → $15 | Already used; reproducible control | Older relative to Claude 5 family; 200K context |
| **1** | **Claude Fable 5.1** | `claude-fable-5-1` | Claude upgrade (flagship) | ~$10 → $50 | Anthropic positions it for **document / spreadsheet / slide work**; strong long-horizon reasoning; 1M context, 128K output | Expensive; slower; may be overkill if the bottleneck is prompts, not raw model power |
| **2** | **GPT-5.6 Sol** | `gpt-5.6-sol` (alias `gpt-5.6`) | OpenAI flagship / cross-vendor | ~$4 → $20 (promo) | OpenAI flagship; strong reasoning/agentic work; good for structured professional writing | Needs OpenAI API key; prompting/API behavior may differ from Claude; do not confuse with Cursor agent model slugs |
| **3** | **Claude Opus 5** *(optional)* | `claude-opus-5` | Mid-premium Claude | ~$5 → $25 | Anthropic recommends **starting with Opus 5** for most workloads; use Fable when Opus is not enough | Cheaper than Fable, weaker on the hardest long-horizon tasks |
| **4** | **Claude Sonnet 5** *(optional)* | `claude-sonnet-5` | Cost/speed Claude | ~$2 → $10 | Balance of price/quality for larger course runs | May be insufficient for demanding MSc SE pedagogy |
| **5** | **GPT-5.6 Terra** *(optional)* | `gpt-5.6-terra` | Cheaper OpenAI | ~$2 → $12 | Useful if Sol is too expensive for iteration | Weaker than Sol on hard tasks |

## Public benchmarks / signals (not lecture-slide specific)

### Claude Fable 5.1

Sources: [Anthropic announcement](https://www.anthropic.com/claude-fable-and-mythos-5-1), [model docs](https://platform.claude.com/docs/en/models/fable-5-1/overview).

- Positioned as a top model for coding, knowledge work, and long-running agents.
- Customer quotes explicitly mention **PowerPoint / slide generation** and slide craft improvements.
- Strong on knowledge-work metrics (e.g. GDPval-AA family).
- Anthropic guidance: for most workloads start with Opus 5; use Fable when that is not enough.

### GPT-5.6 Sol

Sources: [OpenAI GPT-5.6](https://openai.com/index/gpt-5-6/), [API model page](https://developers.openai.com/api/docs/models/gpt-5.6-sol).

- Flagship tier of the GPT-5.6 family.
- Example published numbers from OpenAI materials: **GDPval-AA v2 ~1748 Elo**, **SWE-Bench Pro ~64.6%**, **Terminal-Bench 2.1 ~88.8%**.
- Strong signal for agentic / professional work.
- There is **no public “lecture-slide teachability rubric”** — for ProfDeck this remains a hypothesis to test.

### Important caveat

No public benchmark measures our criteria *Ready-to-teach / Clarity for MSc Software Engineering education*. Public scores are useful only as a **prior**: “this model is strong enough to be worth trying.”

## Recommended shortlist (3 variants)

| Variant | Model id | Purpose |
|---------|----------|---------|
| **A (control)** | `claude-sonnet-4-5-20250929` | What was used in the paper / full run |
| **B** | `claude-fable-5-1` | Strongest Claude upgrade + direct fit for slides/docs |
| **C** | `gpt-5.6-sol` | Strong cross-vendor baseline (requires OpenAI key) |

If budget is tight: use **`claude-opus-5`** as **B′** instead of Fable.

## Suggested experimental protocol (next step, not implemented yet)

1. Pick one benchmark lecture (e.g. Lecture 1 or Lecture 5).
2. Keep prompts, Bloom settings, and improve rounds fixed.
3. Generate variants A / B / C.
4. Score with the same human rubric used in the paper.
5. Optionally record Bloom alignment separately (do not treat it as the only success metric).
6. Scale the winning setup to the full course only after the single-lecture comparison.

## Bottom line

- **Fable 5.1** and **GPT-5.6 Sol** are real API models with documented ids.
- For ProfDeck, Fable is especially interesting because Anthropic/customers explicitly discuss **slide/document quality**.
- Sol is useful as a **different vendor + strong reasoning** check: is the bottleneck Claude-specific, or model quality in general?
- Before coding: add an OpenAI key and run **A vs B vs C** on one lecture with one rubric.

## Related local docs

- `docs/human-evaluation-rubric.md`
- `docs/human-evaluation-aggregated.md`
- `docs/human-evaluation-wave-comparison.md`
- `docs/human-evaluation-article-tables.md`
