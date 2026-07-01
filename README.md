# Meridian — Frontend

Meridian is a real-time collaborative document editor — Google Docs–style continuous prose, not block-based. Each document has three roles (Author, Editor, Viewer); authors get an AI chatbot that edits the document on their behalf, and can share documents via tokenized invite links with a configurable role and expiry.

This repository is the **frontend** — an authenticated single-page app. The backend (NestJS WebSocket gateway, Redis pub/sub, Postgres/Drizzle) is a separate service and is treated here as a fixed contract.

## Stack

- **Vite** + **React** + **TypeScript** — an authenticated SPA, no SSR/SEO needs
- **Tailwind CSS** + **shadcn/ui** — primitives in `components/ui/`, compositions in `components/custom-components/`
- **React Router** for routing, **TanStack Query** for all REST data, **Zustand** for session/auth + toasts
- **React Hook Form** + **Zod** for forms and validation
- **Tiptap** (ProseMirror) with **Yjs** for the collaborative editor — bound to a shared `content` XmlFragment whose schema is defined once in `modules/collaboration/editor-extensions.ts` (the contract the backend must mirror), over a hand-written WebSocket provider that speaks the backend's mixed JSON/binary protocol

## Getting started

Requires **Node 22+**.

```bash
npm install
cp .env.example .env.local   # then adjust the URLs if needed
npm run dev
```

### Environment

Validated at startup (`src/config/env.ts`) and must be a valid URL:

| Variable       | Description                                               | Example                 |
| -------------- | --------------------------------------------------------- | ----------------------- |
| `VITE_API_URL` | REST API origin (the `/v1` prefix is added by the client) | `http://localhost:8000` |

The REST client calls `VITE_API_URL` directly, in every environment — there's
no dev proxy or nginx proxy in front of it (see [Dockerfile](Dockerfile) /
[nginx.conf](nginx.conf)), since a same-origin relative path only works behind
something that proxies it, and static hosts like Vercel have no such layer.
**The backend must allow the app's origin via CORS.**

The WS gateway rides this same origin — no separate port or env var. The
collaboration provider derives its WS URL from `VITE_API_URL` (`http` →
`ws`, `https` → `wss`, same host, no explicit port).

## Scripts

| Script             | What it does                                |
| ------------------ | ------------------------------------------- |
| `npm run dev`      | Vite dev server                             |
| `npm run build`    | Typecheck (`tsc -b`) + production bundle    |
| `npm run preview`  | Serve the production build locally          |
| `npm run lint`     | ESLint                                      |
| `npm run format`   | Prettier (write) · `format:check` to verify |
| `npm test`         | Unit tests (Vitest)                         |
| `npm run test:e2e` | End-to-end smoke tests (Playwright)         |

A Husky pre-commit hook runs `lint-staged` (Prettier + ESLint) on staged files.

## Testing & CI

Unit tests live alongside source in `src/**` (Vitest); end-to-end smoke tests live in `e2e/` (Playwright, backend calls mocked). Both run on every pull request via [GitHub Actions](.github/workflows/ci.yml), alongside lint, format, and build checks.

```bash
npx playwright install chromium   # one-time, before the first e2e run
npm run test:e2e
```

## Production image

```bash
docker build -t meridian-frontend --build-arg VITE_API_URL=https://your-api .
docker run -p 8080:80 meridian-frontend
```

Multi-stage build (Node → nginx); nginx serves the SPA as static files with history fallback — no REST proxying, since the app calls `VITE_API_URL` directly.
