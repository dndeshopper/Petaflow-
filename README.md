# PetalFlow

**Never lose a valuable idea again.**

PetalFlow is a visual timeline of curiosity. Save videos, articles, tweets, threads, posts, and websites — then revisit them on an elegant botanical timeline.

## Tech Stack

- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui, Lucide Icons
- **Backend:** Supabase (PostgreSQL + Storage)
- **Infrastructure:** Vercel
- **Preview Engine:** OpenGraph → Playwright → Fallback Card

## Design source

The dashboard UI is driven by **`design/PetalFlow-Dashboard-standalone.html`** (your original HTML file).

- `design/sections/` — sidebar, header, right panel extracted from HTML
- `lib/design/html-sections.ts` — HTML embedded in code (auto-generated)
- `components/design/design-app-shell.tsx` — renders the HTML in the app
- `public/design/preview.html` — static preview

```bash
npm run sync-design   # after editing the standalone HTML
```

## Getting Started

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app runs in **demo mode** with sample data when Supabase is not configured.

## Project Structure

```
app/
  (dashboard)/
    dashboard/     # Today view (main timeline)
    timeline/      # Full timeline
    search/        # Instant search with filters
    garden/        # Interest visualization
    inbox/         # Unviewed petals
    collections/   # Curated groups
    settings/      # Profile + Ask PetalFlow
  api/
    petals/        # CRUD + async preview
    search/        # Full-text search
    ask/           # AI assistant
    preview/       # Preview engine test endpoint

components/
  sidebar/         # Left nav + insight panel
  header/          # Greeting, date picker, search
  timeline/        # Vertical stem timeline
  petals/          # Petal cards
  search/          # Search + Ask PetalFlow
  garden/          # Plant visualization

lib/
  supabase/        # Client + server clients
  openGraph/       # OG metadata extraction
  playwright/      # Screenshot + fallback cards
  queue/           # Async preview queue
  ai/              # Multi-provider AI layer

chrome-extension/  # Manifest V3 extension
supabase/          # Database schema
```

## Database Setup

1. Create a Supabase project
2. Run `supabase/schema.sql` in the SQL Editor
3. Add credentials to `.env.local`

## Chrome Extension

1. Open `chrome://extensions`
2. Enable Developer mode
3. Load unpacked → select `chrome-extension/`
4. Right-click any page → **Add to PetalFlow**

Configure the API URL in the extension popup (default: `http://localhost:3000`).

## Preview Engine

Petal creation never depends on preview generation:

1. **OpenGraph** — extract og:title, og:image, og:description
2. **Playwright** — screenshot fallback
3. **Fallback Card** — generated SVG with platform, title, note

## Ask PetalFlow

AI assistant scoped to your saved content only. Supports OpenAI, Claude, Gemini, or local rule-based responses via `AI_PROVIDER` env var.

## Environment Variables

See `.env.example` for all configuration options.

## Deploy to Vercel

```bash
vercel
```

Set environment variables in the Vercel dashboard. Playwright screenshots require a serverless-compatible setup or external worker for production.
