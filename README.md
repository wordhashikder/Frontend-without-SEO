# PickASparky Website

The public website and homeowner area for [PickASparky](https://www.pickasparky.com), a UK
marketplace that connects homeowners with vetted EV charger installers. Visitors compare
installers by town, request free quotes, read guides and, with a private email link, follow
their requests under *My Quotes*. Installers sign up and manage their account here and in the
Dashboard.

| | |
|---|---|
| **Stack** | Next.js 16 (App Router, Server Components and Actions) · React 19 · TypeScript · Tailwind CSS 4 |
| **Quality** | Biome (lint and format) · `tsc` strict type checking |
| **Data** | The PickASparky API (`backend/`); nothing is stored in the website itself |
| **Packaging** | Docker (standalone server, non-root, health-checked) |

> This project uses a recent Next.js with breaking changes from older versions. When changing
> framework code, read the matching guide in `node_modules/next/dist/docs/` first (see `AGENTS.md`).

## Quick start

You need Node.js 24 and the API running (see `backend/README.md`).

```bash
npm install
cat > .env.local <<'EOF'
NEXT_PUBLIC_SITE_URL=http://localhost:3000
API_URL=http://localhost:8000
EOF
npm run dev          # http://localhost:3000
```

## Configuration

| Variable | When | Purpose |
|---|---|---|
| `API_URL` | runtime (and build, optional) | Base URL of the API, server-side only. Default `http://localhost:8000`. If the API is reachable during the build, pages are pre-rendered with live data; otherwise they fill in on first request |
| `INTERNAL_API_KEY` | runtime | Shared secret with the API (the same value as the API's `INTERNAL_API_KEY`). It lets the API trust the visitor's real IP for rate limits and call `/api/revalidate`. Required in production |
| `NEXT_PUBLIC_SITE_URL` | build | Public address (`https://www.pickasparky.com`); used for canonical URLs, the sitemap and structured data |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | build | Google Analytics 4 ID (`G-XXXXXXXXXX`). Leave empty and nothing is loaded or sent. When set, the cookie banner is switched on automatically |
| `NEXT_PUBLIC_COOKIE_BANNER` | build | `on` shows the cookie banner even without analytics (staging previews) |
| `NEXT_PUBLIC_HOW_IT_WORKS_VIDEO_URL` | build | Cloudinary URL of the "how it works" video (default: the current upload). Leave blank to keep the default |
| `NEXT_PUBLIC_SOCIAL_X_URL`, `NEXT_PUBLIC_SOCIAL_LINKEDIN_URL` | build | Social profile links; omitted when blank |

`NEXT_PUBLIC_*` values are inlined into the bundle at build time, so in Docker they are build
arguments. Never put a secret in a `NEXT_PUBLIC_*` variable.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server with hot reload |
| `npm run build` | Production build (standalone output) |
| `npm run start` | Serve a production build locally |
| `npm run lint` | Biome lint and format check |
| `npm run format` | Format with Biome |
| `npm run typecheck` | TypeScript only |

Before opening a pull request: `npm run lint && npm run typecheck && npm run build`.

## How it works

- **Content comes from the API.** Page copy, locations, installers, reviews, blog posts and
  plans are fetched on the server and cached by tag. When the team publishes a change in the
  Dashboard, the API calls `POST /api/revalidate/` (authenticated with `X-Internal-Token`), so
  the change appears within seconds instead of when the cache expires.
- **Server Actions** (`src/actions/`) handle forms (quotes, enquiries, contact, sign-in,
  billing). Tokens stay in httpOnly cookies; the browser never calls the API directly.
  `src/proxy.ts` keeps installers signed in by rotating their tokens before account pages load.
- **Quote form resilience.** The postcode check never blocks a homeowner: if the lookup is
  unavailable the form simply continues and the API stores the request safely.
- **Security headers** (CSP, HSTS, frame and content-type protection) are set in
  `next.config.ts`; private pages (`/installer`, `/review`, `/messages`, `/uk/my-quotes`) are
  never measured by analytics.

## URL and SEO conventions

- Every page address ends with a slash, and links, redirects, canonical tags and the sitemap
  all use that form (`trailingSlash`; `src/lib/site.ts` holds every route).
- **City listings load on top of each other.** "Load More" on `/uk/ev-charger-installers/<town>/`
  opens `/uk/ev-charger-installers/<town>/page/N/`, which shows the installers already listed plus
  12 more (12 per step, up to 96). These pages repeat page 1 and add to it, so they share the city
  page's title and description, and their canonical (and `og:url`) is the main city page. Every
  installer profile is in the sitemap and linked from the site.
- **One title everywhere.** The browser tab, Open Graph and Twitter titles are identical and name the
  brand once. `pageMetadata()` (`src/lib/seo.ts`) adds " | PickASparky" unless the title already
  contains the brand or is marked `standalone`.
- **Breadcrumb schema only where a breadcrumb is shown.** `<Breadcrumbs>` renders the trail and its
  `BreadcrumbList` together (directory hub, locations, installer profiles, blog posts); other pages
  publish no breadcrumb markup.
- **No `#` in any URL.** Links never carry a fragment, canonical tags and the sitemap are clean,
  and structured-data identifiers are URNs (`entityId()` in `src/lib/seo.ts`). To take a reader to
  a section, use `ScrollButton` or `SectionLink` (`src/components/layout/section-link.tsx`):
  they scroll without changing the address.
- Structured data (JSON-LD) is generated in `src/lib/seo.ts`; `llms.txt`, `robots.txt` and the
  sitemap are generated routes.

## The "How PickASparky Works" video

A silent, looping walkthrough sits directly under the hero on the home page, How It Works, Get
Quotes and the EV installers directory (`HowItWorksVideo`, `src/components/sections/`).

- **Delivery.** The video lives on Cloudinary. `videoAssets()` (`src/lib/video.ts`) gives the browser a
  1280px, audio-free WebM (VP9) and MP4 (H.264) that Cloudinary makes from the same upload, plus a
  poster image, and the original file only as a last resort. Cloudinary may need a few seconds to
  make a new format the first time, so open the WebM and MP4 URLs once after changing the video.
- **Light on the page.** Nothing but the poster loads with the page. The video file downloads after
  the page has loaded and only when the video is within 200px of the screen; it plays only while
  visible. Its 16:9 space is reserved, so nothing shifts.
- **Accessible.** A pause/play button is always shown. With "reduce motion" or Data Saver on, or
  when the browser blocks autoplay, the video waits for the reader to press play.
- **Security.** The Content Security Policy allows `media-src` from `self` and `res.cloudinary.com`.

## Project layout

```
src/
  app/            routes (pages, layouts, sitemap, robots, API route for cache refresh)
  actions/        Server Actions for every form
  components/     UI by area: directory, profile, quote, account, legal, layout, sections...
  content/        static copy: quote questions, plan copy, site text
  lib/            API client, SEO helpers, routes, analytics, formatting
  proxy.ts        keeps installer sessions fresh
public/           static images and assets
```

## Deploying

The `Dockerfile` builds a standalone server (Node 24, non-root, port 3000) with a health check
on `/robots.txt`.

1. Pass the `NEXT_PUBLIC_*` values and, optionally, `API_URL` as **build arguments**.
2. Set `API_URL` and `INTERNAL_API_KEY` as **runtime** variables.
3. Put the site behind your reverse proxy on the public domain, and set the API's
   `FRONTEND_URL`, `FRONTEND_INTERNAL_URL` and `CORS_ORIGINS` to match.

After a deploy, check `/sitemap.xml`, `/robots.txt` and one location page's canonical tag.
