# TDLF-2026

Frontenis tournament platform for "Torneo de las Fresas" 2026 edition.

## Project Overview
This project will consist of a landing page with tournament information and a countdown timer for the event date.

## Scope
The scope of this project includes:
- Landing Page: A landing page with tournament information and countdown timer.
- Tournament System: A system to manage groups, matches, and brackets with public and admin views.
- Ticket/Giveaway View (Tentative): A simple view for participants or attendees to participate in a giveaway.

## Tech Stack
- Framework: Next.js App Router
- Language: TypeScript
- Styling: Tailwind CSS
- Backend/Database: Supabase
- Hosting: Vercel

Optional additions like shadcn/ui may be used for admin tables/forms if needed later.

## Design Reference
For visual design inspiration, refer to last year's edition:
https://tdlf-2025.vercel.app/

Use this reference for structure, tone, and general layout patterns only — do not copy specific copy, dates, prize amounts, or sponsor names from it.

## Assumptions (to confirm with user)
- Single-elimination bracket after group stage; top 2 pairs per group advance.
- Group counts placeholder based on last year's edition (6 groups of 4 in Free / 4 groups of 3 in Masters). Confirm before finalizing.
- Registration cost TBD.

## Data Model Notes
- divisions: Free (Libre), Masters (50+)
- group stage → single elimination bracket
- top 2 per group advance to bracket

## Landing Page Sections (in order)
1. Hero section with title/edition, countdown timer, date & venue info + map link
2. Tournament info ("Lo que necesitas saber"): categories, registration, projected groups/pairs, courts & ball info
3. Rules bento grid: match rules, advancement rules, prep tips
4. Sponsors carousel
5. Awards section: prize breakdown per category
6. Agenda section: timestamped schedule
7. Merch section: product showcase with catalog links
8. Media gallery: photos from past editions

## Conventions
- All copy is Spanish (es-MX)
- All dates/times in America/Mexico_City timezone
- Package manager: pnpm
- Keep this updated as decisions change

## Decisions (locked 2026-08-26)
- Event date: Sunday, September 27, 2026 (America/Mexico_City).
- Venue: Deportiva Norte, Irapuato (same as previous edition); hero links to Google Maps.
- Edition labeling: "Cuarta edición".
- Visual direction (fresh design): street/urban dark theme — near-black background, oversized condensed display type (Anton), coral-fresa accent (#ff4d3d), grain texture, angled section dividers, subtle CSS-only motion (IntersectionObserver reveals, no animation libraries).
- Landing copy in Spanish; footer contact is an Instagram icon only.
- shadcn/ui deferred until the admin phase.
- Scaffold: create-next-app (Next.js App Router, TS, Tailwind v4, ESLint, Turbopack, `@/*` alias).

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
