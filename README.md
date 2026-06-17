# NURA Gallery

Web platform for NURA event photos. Guests browse and download photos from events they attended via a unique, link-only gallery. NURA admins create those galleries, upload photos, and notify guests by SMS.

This SPA hosts both experiences in one app, gated by route group:

| Route group | Audience | Auth |
|---|---|---|
| `/gallery/:token/*` | Guests | **No auth** — the token in the URL is the access |
| `/admin/*` | NURA platform admins | JWT (shared with the main NURA app) |

> **For engineering rules, theming, file conventions, and the full Tailwind + shadcn standards, read [`CLAUDE.md`](./CLAUDE.md).** That document is the source of truth for *how* this codebase is written.

---

## Tech stack

- **React 19** + **TypeScript** (strict)
- **Vite 8** (build) — **pnpm** (package manager)
- **Tailwind v4** (CSS-first config, theme tokens in `src/index.css`)
- **shadcn** primitives (`radix-nova` style) — vendored under `src/components/ui/`
- **TanStack Router** (file-based, auto code-splitting)
- **TanStack Query** *(planned)* — server state
- **React Hook Form + Zod** — every form
- **Biome** — lint + format (replaces ESLint + Prettier)
- **MSW** *(planned)* — API mocking
- **JSZip** *(planned)* — client-side bulk download

Storage: **Supabase Storage** (public bucket `gallery`). The frontend never holds Supabase credentials — uploads use backend-issued presigned PUT URLs. `@supabase/supabase-js` is **not** a dependency.

---

## Getting started

```bash
pnpm install
pnpm dev
```

The dev server runs at `http://localhost:5173` and starts the intimate theme automatically (`<html class="intimate">`). The router plugin generates `src/routeTree.gen.ts` on first run.

### Recommended VS Code extensions

The repo ships `.vscode/extensions.json` with two prompts on first open:

- `biomejs.biome` — lint + format on save (configured in `.vscode/settings.json`)
- `bradlc.vscode-tailwindcss` — Tailwind class autocomplete (also recognizes `cva` / `cn` variants)

---

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Vite dev server with HMR; regenerates `routeTree.gen.ts` on route changes |
| `pnpm build` | `tsc -b && vite build` — TypeScript first, then production bundle |
| `pnpm preview` | Preview the production build locally |
| `pnpm lint` | Biome lint (zero errors expected to ship) |
| `pnpm format` | Biome format-write across the project |
| `pnpm check` | Biome lint + format + auto-fix |

---

## Project structure

```
src/
├── routes/             # TanStack Router file-based routes
│   ├── __root.tsx      # Global shell (theme, toast portal, error boundary)
│   ├── gallery/$token/ # Guest experience (no auth)
│   └── admin/          # Admin experience (JWT-gated)
├── components/
│   └── ui/             # shadcn primitives — vendored, owned by us
├── features/           # Feature-scoped folders (components, hooks, api, utils)
├── lib/                # Cross-cutting utilities (cn, formatters)
├── hooks/              # Cross-feature shared hooks (rare)
├── index.css           # Theme tokens — the source of truth
└── main.tsx
```

**`src/index.css` carries the design system.** Every color, radius, and font in components references a token defined there — `bg-primary`, `text-foreground`, `border-border`, `rounded-md`. No hardcoded hex / oklch values anywhere else.

---

## Theming

One theme today: **intimate** (warm, dark, orange brand `#f87118`, Papyrus typeface).

Themes are applied as a class on `<html>`. To add another theme later (e.g. `serene`):

```css
.serene {
  --background: ...;
  --primary: ...;
  /* same token names, different values */
}
```

Then `<html class="serene">` switches everything. **No component changes required** — Tailwind utility classes resolve to the active theme automatically.

The `intimate` theme uses the Papyrus webfont under the unique family name `PapyrusWeb` (avoids collision with macOS's system Papyrus). Font files live in `public/fonts/`. See `public/fonts/README.md` for source / licensing notes.

---

## Backend dependencies

This frontend depends on the gallery backend (separate repo). Key endpoints:

**Guest (no auth — token in URL):**
- `GET /gallery/:token`
- `GET /gallery/:token/events/:eventId`
- `GET /gallery/:token/photos/:photoId`
- `GET /gallery/:token/photos/:photoId/download`

**Admin (JWT, NURA platform admin):**
- `POST /gallery/admin` — create gallery
- `GET /gallery/admin/list`
- `POST /gallery/admin/:id/events` — assign events
- `POST /gallery/admin/:id/events/:eventId/upload-urls` — presigned PUT URLs
- `POST /gallery/admin/:id/events/:eventId/photos/sync` — finalize uploads
- `POST /gallery/admin/:id/notify` — SMS guest

While the backend is in development, the frontend mocks these via MSW (planned) so feature work is unblocked.

### Photo upload flow (admin)

```
admin client ──ask──▶ backend ──issues──▶ presigned PUT URL (with metadata embedded)
admin client ──PUT file──▶ Supabase Storage  (bytes never touch our backend)
admin client ──sync──▶ backend  (BE reads Supabase metadata, creates DB rows)
```

### Bulk download (whole event)

Client-side via **JSZip**. The backend exposes no ZIP endpoint — the guest UI fetches the photo URL list, downloads each file directly from Supabase, and bundles in the browser.

---

## Engineering standards

See [`CLAUDE.md`](./CLAUDE.md) for the full standards. Highlights:

- Theme tokens in `src/index.css` are the source of truth — never hardcode colors.
- Two route groups: `/gallery/:token/*` (no auth, token-in-URL) and `/admin/*` (JWT).
- shadcn components are vendored under `src/components/ui/` and we own them.
- After running `shadcn add <component>`, manually relocate any new tokens from `:root` / `.dark` into the `.intimate` block.
- Forms = React Hook Form + Zod. No exceptions.
- Path alias `@/` resolves to `src/`. No relative paths that climb more than 2 levels.
- Biome handles all lint + format. ESLint and Prettier are not used.

---

## License

Internal — not for public distribution.
