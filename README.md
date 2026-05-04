# InfluenceMatch

Find the right creators for your brand. Paste a URL — we analyse it, infer your niche & audience with Claude, then return ranked creators from Instagram, TikTok, YouTube, X, and Twitch.

---

## Quick start

```bash
# 1. Install
pnpm install

# 2. Configure
cp .env.example .env.local
# Edit .env.local — at minimum set DATABASE_URL (see below)

# 3. Start Postgres (Docker) and run migrations
docker compose up -d
pnpm db:push

# 4. Seed 200 mock creators
pnpm db:seed

# 5. Run dev server
pnpm dev          # → http://localhost:3000
```

`DEV_AUTH_BYPASS=true` (default in `.env.example`) bypasses Clerk — no auth account needed locally.

---

## Environment variables

See [`.env.example`](.env.example) for the full annotated list.

| Key | Required | Notes |
|-----|----------|-------|
| `DATABASE_URL` | yes | Postgres. Use docker-compose locally or Neon/Supabase in prod |
| `ANTHROPIC_API_KEY` | recommended | Falls back to lexical stub if absent |
| `DEV_AUTH_BYPASS` | local-only | `true` = skip Clerk, use a seeded dev user |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` + `CLERK_SECRET_KEY` | prod | Leave empty in dev when using bypass |
| `UPSTASH_REDIS_REST_URL` + `_TOKEN` | optional | Falls back to in-memory limiter |
| `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` | optional | Billing UI disabled if absent |
| `STRIPE_PRICE_PRO` + `STRIPE_PRICE_AGENCY` | with Stripe | Stripe Price IDs from your dashboard |

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│  Browser (Next.js App Router, React 19)             │
│  /  (marketing)  /search  /shortlists  /settings   │
└─────────────────┬───────────────────────────────────┘
                  │ fetch
┌─────────────────▼───────────────────────────────────┐
│  Next.js API routes  (Edge-compatible)              │
│  /api/analyze   /api/jobs/[id]   /api/creators/search│
│  /api/shortlists/**   /api/stripe/**                │
└──┬────────────────────────────────────┬─────────────┘
   │                                    │
┌──▼──────────────────┐  ┌─────────────▼──────────────┐
│  lib/scraper        │  │  lib/niche-inference        │
│  ├ url-validator    │  │  ├ Claude API (sonnet)      │
│  ├ fetch (SSRF-safe)│  │  ├ stub (no API key)       │
│  └ extract (cheerio)│  │  └ brandSignalsSchema (Zod)│
└──┬──────────────────┘  └─────────────┬──────────────┘
   │                                   │
   └──────────────────┬────────────────┘
                      │
┌─────────────────────▼──────────────────────────────┐
│  lib/matcher  (cosine sim + engagement + recency)   │
│  Returns { niche_fit, audience_overlap, …, final }  │
└──────────────────────┬─────────────────────────────┘
                       │
┌──────────────────────▼─────────────────────────────┐
│  lib/providers  (InfluencerProvider interface)      │
│  ├ mock  (Prisma — seeded 200 creators)             │
│  └ TODO  modash | phyllo | hypeauditor adapters     │
└──────────────────────┬─────────────────────────────┘
                       │
┌──────────────────────▼─────────────────────────────┐
│  PostgreSQL (Prisma ORM)                            │
│  User · Project · AnalysisJob · Creator             │
│  Shortlist · ShortlistEntry · Subscription          │
└────────────────────────────────────────────────────┘
```

---

## Database

```bash
# Local (Docker)
docker compose up -d postgres
pnpm db:push          # apply schema (dev, no migration history)
pnpm db:seed          # load 200 mock creators
pnpm db:studio        # Prisma Studio at :5555

# Production (Neon)
# Set DATABASE_URL=postgresql://... in Vercel env vars, then:
pnpm db:migrate       # creates migration history
pnpm db:seed          # seed once
```

---

## Running tests

```bash
# Unit (Vitest) — url-validator SSRF cases + matcher scoring + niche stub
pnpm test

# E2E (Playwright) — requires dev server running
pnpm dev &
pnpm test:e2e
```

---

## Swapping the mock influencer provider

1. Create `lib/providers/modash.ts` implementing `InfluencerProvider`:

```ts
import type { InfluencerProvider, CreatorSearchFilters } from "./types";
import type { MatcherCreator } from "@/lib/matcher";

export const modashProvider: InfluencerProvider = {
  name: "modash",
  async searchCreators(filters: CreatorSearchFilters): Promise<MatcherCreator[]> {
    const res = await fetch("https://api.modash.io/v1/instagram/search", {
      headers: { Authorization: `Bearer ${process.env.MODASH_API_KEY}` },
      method: "POST",
      body: JSON.stringify({ /* map filters to Modash query */ }),
    });
    const data = await res.json();
    return data.results.map(mapModashToCreator); // implement mapping
  },
};
```

2. In `lib/providers/index.ts`, add `case "modash": return modashProvider;`.
3. Set `INFLUENCER_PROVIDER=modash` in env.

The matcher works identically regardless of provider — it only sees `MatcherCreator[]`.

---

## Deployment (Vercel + Neon)

1. Push repo to GitHub.
2. Import into Vercel. Framework: Next.js.
3. Set all env vars from `.env.example` (use real Clerk/Stripe/Anthropic keys).
4. `DATABASE_URL` → Neon connection string (Neon has a Vercel integration).
5. After first deploy: `pnpm db:migrate && pnpm db:seed` from local against prod DB, or use Vercel's deploy hook to run the seed.
6. Wire Stripe webhook → `https://your-domain.com/api/stripe/webhook`.

---

## Design decisions

| Decision | Choice | Why |
|----------|--------|-----|
| Auth | Clerk | Fastest email+Google setup; swap to NextAuth if you want self-hosted sessions |
| Jobs | fire-and-forget `void runAnalysisJob()` | No Redis needed locally; swap to Inngest (`inngest.createFunction`) for reliable retries in prod |
| Rate limiting | In-memory fallback → Upstash Redis | Works without Redis in dev; Upstash is Vercel-native |
| Niche inference | Claude Sonnet + lexical stub fallback | Pipeline never hard-fails; stub covers dev without API key |
| Influencer data | Mock (Prisma) | 200 seeded creators across 8 niches give realistic UX without paying for a data API |

---

## TODOs (user action required)

- [ ] **Real influencer API**: implement `lib/providers/modash.ts` (or Phyllo/HypeAuditor) and set `INFLUENCER_PROVIDER=modash`
- [ ] **Stripe products**: create Pro + Agency products in Stripe dashboard, copy Price IDs to `STRIPE_PRICE_PRO` / `STRIPE_PRICE_AGENCY`
- [ ] **Clerk**: create app at clerk.com, copy publishable + secret keys, set `DEV_AUTH_BYPASS=false` in prod
- [ ] **Monthly quota reset**: add a cron job (Vercel Cron or Inngest scheduled fn) that resets `User.analysesUsed = 0` on the 1st of each month
- [ ] **Inngest**: for reliable async jobs in prod, wire `runAnalysisJob` into an Inngest function and call via `inngest.send()`
- [ ] **Multi-seat (Agency)**: current schema is single-user per account; add `Organization` model and membership table
