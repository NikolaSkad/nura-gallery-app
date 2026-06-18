# NURA Gallery — Engineering Standards

## Project Overview

NURA Gallery is the **web platform for event photos**. It is a separate web sub-platform from the main NURA event-management apps. v1 is web-only — no native gallery in the iOS / Android NURA apps.

This single SPA hosts **two distinct experiences**, gated by route group:

| Route group | Audience | Auth | Purpose |
|---|---|---|---|
| `/gallery/:token/*` | Guests | **No auth — the token in the URL is the access** | Browse events they attended, view photos, download single photos and whole events |
| `/admin/*` | NURA platform admins | JWT (existing NURA admin auth) | Create per-guest galleries, assign events, upload photos (direct-to-Supabase), trigger SMS notifications |

There is **no guest signup / login**. The unique gallery link IS the access. Each guest gallery is created and curated manually by a NURA admin.

### Domain model (per BE plan)

```
guest_galleries (1 per guest, identified by phone number, holds a unique token)
  └── guest_gallery_events (which events this guest's gallery shows)
        └── gallery_photos (photos of THIS guest at THIS event)
```

**Photos are per-guest-per-event.** The same event linked into two different galleries holds different photos in each. The token in the URL gates everything — at the API layer, every guest read validates `token → gallery → gallery_event → photo`.

### Upload flow (admin → Supabase, direct, no proxy)

```
1. Admin selects files in the admin UI.
2. Admin client → BE: POST /gallery/admin/:id/events/:eventId/upload-urls
   { files: [{ fileName, mimeType }, ...] }
   ← { uploads: [{ fileKey, uploadUrl }, ...] }     // presigned PUT URLs with embedded metadata
3. Admin client → Supabase Storage: PUT <uploadUrl> --data-binary <file>
   (Image bytes never touch our backend. Metadata travels in the presigned URL.)
4. Admin client → BE: POST /gallery/admin/:id/events/:eventId/photos/sync
   BE lists files in the Supabase path, creates gallery_photos rows for any
   files not yet in the DB (metadata read from Supabase).
```

The frontend never holds Supabase credentials — `@supabase/supabase-js` is **not** a dependency. Uploads are plain `fetch(uploadUrl, { method: 'PUT', body: file })`.

### Bulk download (whole event) — client-side

ZIP bundling happens **in the browser**, not on the backend. The guest view fetches the photo URL list from the API and zips client-side via **JSZip**. The backend has no ZIP endpoint by design.

### Image previews

Supabase Image Transformations: append `?width=400&height=400&resize=contain` to the public URL for the grid thumbnails. Full-res downloads hit the raw public URL.

### Notifications

SMS is sent by the backend (Twilio). The admin client triggers it via `POST /gallery/admin/:id/notify`. The frontend never sends SMS directly.

### External links

- Figma (design): `https://www.figma.com/design/psuZDBTtCTeXkelocKYBEN/Nura--in-dev-`
- Backend API: in development; FE mocks with MSW until ready
- Storage: Supabase Storage, bucket `gallery`, path `gallery/{galleryId}/{eventId}/{uuid}.{ext}`

### Open product questions (track separately, do not encode into FE behavior)

- Gallery retention policy (how long do galleries stay live?)
- Final allowed mime types (BE plan says JPEG / PNG / WebP — confirm HEIC support)
- Max file size (BE plan says 50MB)
- Max batch upload (BE plan says 50 files per request)

These are domain decisions that should not be hardcoded into FE constants until BE confirms. When the FE needs to enforce a limit, read it from a shared config or fall back to the BE-stated default with a `TODO(domain-confirm)` comment.

---

These rules govern all code generation, refactoring, and review in this repository.
They apply to every contributor — human or AI agent.

**Precedence:** Correctness and existing runtime behavior always win. Theme tokens in `src/index.css` are the source of truth for color, geometry, and typography. If this document and the code disagree on a domain value, the code wins; if they disagree on an architectural rule, this document wins.

---

## Git & Workflow

- Always work directly on the current branch. **Do not create git worktrees.**
- Do not push to remote unless explicitly asked.
- Do not create branches unless explicitly asked.
- Commits only when the user asks.

---

## Tech Stack

| Concern | Technology | Notes |
|---|---|---|
| Framework | React 19 + TypeScript (strict) | |
| Build | Vite 8 | |
| Package manager | pnpm | Never use npm or yarn |
| UI primitives | shadcn (radix-nova style) | Components are vendored under `src/components/ui/` and owned by us |
| Styling | Tailwind v4 (CSS-first config) | All design tokens live in `src/index.css` |
| Theming | CSS variables + `.<theme>` class on `<html>` | Single theme today: `intimate` |
| State (server) | TanStack Query | Wired in `main.tsx`. Devtools installed (`@tanstack/react-query-devtools`). Passed into TanStack Router context via `createRootRouteWithContext<{ queryClient, auth }>()`. Replaces RTK Query — do not introduce Redux. |
| State (client) | `useState` / URL state / route loaders | Lift only when needed |
| Routing | TanStack Router (file-based, with autoCodeSplitting) | Two route groups: `/gallery/:token/*` (no auth) and `/admin/*` (JWT) |
| Forms | React Hook Form + Zod | The only form pattern — no exceptions |
| Storage | Supabase Storage (presigned URLs from backend) | Frontend uses `fetch` PUT, no `@supabase/supabase-js` |
| Image previews | Supabase Image Transformations (`?width=&height=&resize=contain`) | Append query params to the public URL; full-res = raw public URL |
| Client-side ZIP (bulk download) | JSZip (planned, not yet installed) | Backend has no ZIP endpoint — bundling is FE's job |
| API mocking | MSW (planned) | Same `/api/...` paths as production |
| Lint + format | Biome | `pnpm lint`, `pnpm format`, `pnpm check` |

### Do not introduce

- Jest, Vitest, or any test runner infrastructure unless explicitly asked.
- Storybook.
- i18n / translation wrappers.
- CSS Modules or `.module.css` files.
- Material UI, Emotion, or any CSS-in-JS library — this app is Tailwind + shadcn only.
- Redux Toolkit, RTK Query, Jotai, Zustand, or any new state management library.
- `@supabase/supabase-js` on the frontend — uploads use the backend-issued presigned URL via `fetch`.
- Prettier — Biome handles formatting.
- ESLint — Biome handles linting.

---

## Theme System — The Schema in `index.css` Is The Source Of Truth

**The single most important rule in this project:** every color, radius, font family, and spacing token comes from `src/index.css`. Components reference tokens via Tailwind utility classes (`bg-primary`, `text-foreground`, `border-border`) or directly via `var(--token-name)`. **Never hardcode hex, rgba, oklch, or pixel values in components.**

### How theming works

1. Tokens (e.g. `--background`, `--primary`, `--foreground`) are defined inside a theme class block: `.intimate { ... }`.
2. The active theme is set by adding the class to `<html>`: `<html class="intimate">`.
3. Tailwind utility classes resolve to the active theme's values automatically — no `intimate:bg-primary` prefix needed.
4. To add a future theme, drop in a new block (`.serene { ... }`) and swap the class on `<html>`. Same token names, different values. **No component changes required.**

### Token hierarchy

Tokens are grouped in this order (mirror it in both `@theme inline` and each theme block):

1. **Typography** — `--font-sans` (and any theme-scoped overrides)
2. **Foundation** — `--background`, `--foreground`
3. **Brand** — `--primary`, `--primary-foreground`, `--ring`
4. **Surfaces** — `--card`, `--card-foreground`, `--popover`, `--popover-foreground`
5. **Component states** — `--secondary`, `--muted`, `--accent` (each with their `-foreground` pair)
6. **Text tiers (beyond foreground)** — `--text-tertiary` (placeholders, 30% off-white)
7. **Lines & inputs** — `--border`, `--input`
8. **Semantic state** — `--destructive`
9. **Geometry** — `--radius`

### Color usage rules

```tsx
// BAD — hardcoded
className="bg-[#f87118] text-white border-[#1c1c1c]"
style={{ color: '#ebebf5' }}

// GOOD — token references
className="bg-primary text-primary-foreground border-secondary"
```

For opacity tiers, use Tailwind's modifier syntax — **do not add a token for "primary at 60%"**:
```tsx
<span className="text-primary/60">Muted accent text</span>
<div className="bg-card/80" />
```

For text emphasis hierarchy (the design language for this app):
- **Body default** → `text-foreground` (off-white)
- **Primary emphasis / accents** → `text-primary` (brand orange)
- **Secondary / labels** → `text-muted-foreground` (off-white 60%)
- **Tertiary / placeholders** → `text-tertiary` (off-white 30%)

### The single-theme `dark` variant trick

shadcn components ship with `dark:` utility variants (e.g. `dark:border-input`). Because we only have one theme (`.intimate`) and no light mode, `src/index.css` rewrites the variant so it always applies:

```css
@custom-variant dark (&);
```

This means `dark:foo` behaves like `foo` everywhere. You **never** add `class="dark"` to any element. Future shadcn `add` commands that ship `dark:` classes will keep working transparently.

### After running `shadcn add <component>`

shadcn writes new component tokens into a fresh `:root` block (and sometimes a `.dark` block). After every `shadcn add`:

1. Move any new `--token` declarations from the auto-generated `:root` / `.dark` blocks **into `.intimate`**.
2. Delete the empty `:root` / `.dark` blocks shadcn left behind.
3. Add the corresponding `--color-*` line in `@theme inline` if the component expects a Tailwind utility for the new token.
4. Run `pnpm check` (Biome formats + lints).

### Path-alias awareness

shadcn's CLI reads `compilerOptions.paths` from the **root** `tsconfig.json`. If `paths` only lives in `tsconfig.app.json`, the CLI writes files to a literal `./@/` folder instead of resolving `@/` → `src/`. Both tsconfigs must carry the `paths` block. (TypeScript 6+ removed `baseUrl`; `paths` resolves relative to the tsconfig file location.)

### Font handling

The intimate theme uses a custom Papyrus webfont. Two things matter:

- **Family name `PapyrusWeb`**, not `Papyrus`. macOS has a system Papyrus font that wins the cascade if the web font shares its name, short-circuiting the download. The web `@font-face` declaration uses the unique `PapyrusWeb` name; the theme falls back to system `Papyrus`, then `Cinzel`, then `serif`.
- **Read `--font-sans` via `var()`, not `@apply font-sans`.** Tailwind v4's `@theme inline` inlines values at build time, so `@apply font-sans` hardcodes the default and ignores theme overrides. The `<html>` base rule uses `font-family: var(--font-sans)` directly.

### Biome scoping for shadcn

`src/components/ui/**` is treated as vendored code that follows shadcn's conventions rather than ours. `biome.json` has an `overrides` block that disables `useComponentExportOnlyModules` for that folder (shadcn variants export `cva` results alongside components — required pattern, not a smell). Do not extend this override to other folders.

### Tailwind directives + Biome CSS parser

`biome.json` has `css.parser.tailwindDirectives: true` so Biome recognizes `@apply`, `@theme`, `@custom-variant`, etc. without flagging them as unknown at-rules.

---

## Architecture: Feature-First

### Structure

```
src/
├── routes/                          # Routing only — thin orchestrators (~20 lines each)
│   ├── __root.tsx                   # createRootRouteWithContext<{queryClient,auth}>() — providers + <Outlet />
│   ├── index.tsx                    # Landing
│   ├── (gallery)/                   # Route group — parens stripped from URL, scope only
│   │   └── $token/
│   │       ├── route.tsx            # Guest shell: wrapping <div> (no auth)
│   │       ├── index.tsx            # → <GalleryEvents token={token} />   (URL: /$token)
│   │       └── ...
│   └── admin/
│       ├── route.tsx                # Bare <Outlet /> — no gate, no shell
│       ├── login.tsx                # → <AdminLogin />, reverse beforeLoad (authed → /admin)
│       └── _authed/                 # Pathless layout — strips from URL, scopes auth gate + shell
│           ├── route.tsx            # beforeLoad gate (status !== 'authed' → /admin/login) + shell <div>
│           ├── index.tsx            # → <AdminHome />            (URL: /admin)
│           └── galleries/
│               ├── new.tsx          # → <CreateGallery />        (URL: /admin/galleries/new)
│               └── $id.tsx          # → <AdminGalleryEvents id={id} /> (URL: /admin/galleries/$id)
├── components/
│   ├── ui/                          # shadcn primitives — vendored, owned by us (button, input, label, sheet)
│   ├── page.tsx                     # <Page> + <PageMain> — standard page shell (no className escape hatch)
│   ├── page-header.tsx              # <PageHeader> + <HeaderTitle> — per-page header
│   ├── title.tsx                    # <Title> — the only way to render an <h1> (size sm/md/lg/xl)
│   └── back-button.tsx
├── features/                        # Where the real code lives
│   └── <feature-name>/
│       ├── pages/                   # One file per route — kebab-case, no "-page" suffix (e.g. gallery-events.tsx)
│       ├── components/              # Feature-specific UI — kebab-case (e.g. gallery-card.tsx)
│       ├── hooks/                   # Feature-specific custom hooks
│       ├── api/                     # TanStack Query hooks + fetcher for this feature
│       ├── types.ts                 # Feature-level types
│       └── utils.ts                 # Feature-level utilities (incl. Zod schemas)
├── lib/                             # Cross-cutting utilities
│   ├── api.ts                       # adminFetch + ApiError + setOnUnauthorized
│   ├── auth/                        # AuthProvider, useAuth, LS persistence, AdminUser type
│   └── utils.ts                     # cn (clsx + tailwind-merge)
├── hooks/                           # Cross-feature shared hooks (rare)
├── index.css                        # Theme tokens (source of truth)
├── routeTree.gen.ts                 # Auto-generated by TanStack Router — committed, ignored by Biome
└── main.tsx                         # QueryClient, AuthProvider, gates RouterProvider on auth.status !== 'loading'
```

### Rules

1. **Routes are thin orchestrators.** A route file parses params and renders one feature page component (e.g. `<GalleryEvents token={token} />`). All real logic, data fetching, and JSX live in `features/<name>/pages/<page>.tsx` (and the components it composes from `features/<name>/components/`). Target ~20 lines per route file.
2. **Per-route-group shells live in `route.tsx`.** The guest and admin groups have different chrome (no-auth vs JWT, different layout). Each group's `route.tsx` owns its wrapping `<div>` (max-width, centering, min-height) — **not `<main>`**. Pages render their own `<main>` under their `<PageHeader>`. See rule 4 and the *Per-group shell layout* example below.
3. **`__root.tsx` stays minimal.** Just providers, the toast portal, and a top-level `<ErrorBoundary>`. Do not put the `<main>` element or any chrome in `__root.tsx` — the route-group layouts own the wrapping container. The shape today is `createRootRouteWithContext<{ queryClient, auth }>()` so child `beforeLoad`s can read both off route context.
4. **`PageHeader` is rendered per page, and is a sibling of `<main>` — not inside it.** The header varies per screen (back vs title, different right actions). Each page renders `<Page><PageHeader /><PageMain>…body…</PageMain></Page>` (see rule 11 for the wrappers). Layout owns the wrapper, page owns its own `<main>`. This keeps exactly one `<main>` per rendered document (HTML5 spec: only one non-hidden `<main>` per document) and exposes both the `banner` (`<header>`) and `main` landmarks to screen readers.
5. **Default to a feature folder.** Anything tied to one or two screens goes in `features/<name>/`. Page components live in `features/<name>/pages/`; feature UI (cards, lists, dialogs, etc.) lives in `features/<name>/components/`. The split keeps the route → page wiring obvious and prevents non-page UI from leaking into the routing layer.
   - **Page file names** are kebab-case and **drop the "page" suffix** — the `pages/` folder already conveys "this is a page." So `features/guest-gallery/pages/gallery-events.tsx`, not `gallery-home-page.tsx`.
   - **Component file names** are kebab-case across the whole project: `gallery-card.tsx`, `photo-grid.tsx`, `back-button.tsx`. PascalCase file names like `GalleryCard.tsx` are not used.
   - **Exported component names stay PascalCase** (React requirement) and **do not use the `Page` suffix** — the file's location inside `features/<name>/pages/` already conveys that. So `gallery-events.tsx` exports `GalleryEvents`, `event-photos.tsx` exports `EventPhotos`, `admin-login.tsx` exports `AdminLogin`. Never `GalleryEventsPage`, `EventPhotosPage`, etc.
6. **Never create global dumping folders.** Do not add to `src/components/`, `src/hooks/`, or `src/lib/` unless the code is genuinely shared across 3+ features.
7. **`src/components/ui/` is shadcn-only.** Custom shared components (NuraDrawer-equivalents, layout primitives, `PageHeader`) go in `src/components/` at the root, not inside `ui/`.
8. **Co-locate types and schemas.** Feature-specific Zod schemas live in `features/<name>/utils.ts`. Cross-cutting types (e.g. `ApiError`) go in a shared location only when at least 3 features need them.
9. **Name the route component for what it IS, not the file path.** TanStack only cares about the `Route` export; the inner component name is for humans. `routes/(gallery)/$token/index.tsx` renders `<GalleryEvents />`, not `<Index />`. The file name stays as the routing contract (`index.tsx`) — only rename the component inside.
10. **Pages are audience-specific shells; sub-components are audience-agnostic.** The guest and admin experiences render the same underlying data (galleries, events, photos) but with different chrome, navigation graphs, and actions. Each audience gets its own page file under its own feature folder — never make a page that branches on `isAdmin`.
    - **Pages own the shell.** `features/guest-gallery/pages/gallery-events.tsx` (`GalleryEvents`) renders the guest chrome (title `<PageHeader>`, no back button). `features/admin/pages/admin-gallery-events-events.tsx` (`AdminGalleryEvents`) renders the admin chrome (back-to-dashboard, copy-link button, "Add Event"). Same data, different shells, two pages.
    - **Sub-components are shared and audience-agnostic.** The event list, photo grid, gallery card — these live in `features/guest-gallery/components/` and are imported by both the guest page and the admin page. They take their data as props and don't know who's looking at them.
    - **If a sub-component currently fetches its own data, refactor it to take data via props** before reusing it across audiences. The page is the right level to choose between `useGuestGallery(token)` and `useAdminGallery(id)` — the renderer just renders.
    - **Never import a page from another page.** Pages are leaves of the routing tree; reuse happens one layer down at the component level.
    - **Don't use `{isAdmin && ...}` conditionals in pages.** If you find yourself reaching for that, you're conflating two audiences in one shell — split them into two pages instead. The auth boundary lives at the pathless layout (`routes/admin/_authed/route.tsx`), not inside individual pages.
11. **Pages compose `<Page>` + `<PageMain>` + `<Title>` — not raw `<div>`, `<main>`, or `<h1>`.** These wrappers exist in `src/components/` to keep every page on the same visual rhythm. They are intentionally zero-prop (no `className` escape hatch) for `<Page>` / `<PageMain>` so new pages can't drift.
    - **`<Page>`** = the outer column wrapper. Renders `<div className="flex flex-1 flex-col gap-8 pb-8">`. Fills the route-group shell vertically; supplies the gap below the header and the bottom safe-area padding.
    - **`<PageMain>`** = the semantic `<main>`. Renders `<main className="flex flex-col gap-8 px-3">`. Standard horizontal padding and inter-section rhythm.
    - **`<Title>`** = the only way to render an `<h1>`. Sizes are `sm` (text-2xl) / `md` (text-3xl, default) / `lg` (text-4xl) / `xl` (text-5xl). Always `text-primary`, `tracking-wide`, `leading-none`. Accepts `as="h2"` and `className` for one-off leading/size tweaks — but reach for them only when a real design constraint forces it.
    - **Audience-specific page headers exist.** Admin pages use `<AdminPageHeader>` (wraps `<PageHeader>`, always renders a Logout icon button on the right; any caller-supplied `rightContent` sits to the left of it). Guest pages use `<PageHeader>` directly.
    - **Exceptions are rare and load-bearing.** `admin-login.tsx` doesn't use `<Page>`/`<PageMain>` because its layout is a vertically-centered form (`flex-1 justify-center`) that the standard top-stacked rhythm would break. `routes/index.tsx` (landing) and `not-found.tsx` use bespoke `<main>` because they own their own shell concerns (`mx-auto min-h-dvh max-w-sm`) — they live outside any route group's `route.tsx`. If you're tempted to add a third exception, push back: the shape probably belongs inside `<Page>`/`<PageMain>` instead.

---

## React Principles

Write React the way it was designed to be written. No hacks, no shortcuts. Every pattern below exists because the alternative leads to bugs, stale state, or unmaintainable code.

### Component design

- **Page/route components are thin orchestrators.** They compose hooks and components. No business logic in JSX. Target: 80–150 lines.
- **~150 lines per component is a warning sign.** A well-structured 170-line component is fine; a tangled 80-line one is not. The goal is single responsibility, not a line count.
- **Presentational components receive all data via props.** No data hooks. No business logic. Pass navigation as `onClick` callbacks from the parent.
- **Container/orchestrator components own data.** They call hooks, derive state, and pass results to presentational children.
- **Composition over large abstractions.** Build UIs by composing small, focused components. Never create "god components" that render everything conditionally.
- **Clear prop typing.** Every component has an explicit TypeScript interface for its props. No inline types, no `any`.
- **Avoid prop drilling.** If data needs to pass through 3+ levels, restructure the tree, use composition (`children` / render props), or use a shared hook/store for that concern.
- **Early returns for guard clauses.** Handle loading, error, and empty states at the top of the component, then render the happy path.

### State management

- **Derive state, don't sync it.** Never use `useEffect` to copy values from one state variable to another. Compute derived values with `useMemo` or inline expressions.
- **Event handlers over cascading effects.** If something should happen in response to a user action, put it in the event handler — not in a `useEffect` watching state that the handler sets.
- **Lift state only as high as needed.** The lowest common ancestor of the consumers, no higher.
- **Controlled forms with React Hook Form + Zod.** Never manage form state with `useState` per input. Never write ad-hoc validation. Use `useForm` with a Zod schema via `zodResolver`.
- **URL state for shareable / refreshable state.** TanStack Router's `useSearch` is the right place for filters, pagination, selected items, sort order — not `useState`.

```tsx
// BAD — syncing with useEffect
const [name, setName] = useState('');
useEffect(() => { setName(participant?.name ?? ''); }, [participant]);

// GOOD — derive directly
const name = participant?.name ?? '';
```

### Hooks

- **Single responsibility.** One hook, one concern.
- **~100 lines per hook is a warning sign.** Judge by responsibility count, not line count.
- **No god hooks.** A hook that aggregates 5+ others and re-exports a giant combined object is a god component in disguise. The page is the orchestrator.
- **No hook nesting within a feature.** Feature hooks do not call other custom hooks from the same feature. They call TanStack Query / Router hooks, React primitives, or truly cross-cutting app hooks.
- **Stable references.** Use `useCallback` for handlers passed to memoized children. Use `useMemo` for expensive derived values or for object/array references that would cause re-renders.

### Performance (heuristics, not hard rules)

- **Prefer `React.memo` on list item components** rendered inside `.map()`, especially for long lists.
- **Prefer `useCallback` for handlers passed as props** to memoized children.
- **Use `useMemo` for expensive computations** or stable references that affect children.
- **Do not memoize everything.** Only where re-renders are measurable or where prop identity matters.

### Error handling

- Surface API/user-facing errors via toast (a shared `useToast`-style hook will land alongside the first feature that needs one — do not pre-build it).
- Never use `console.error` as the only error handling for user-visible failures.
- Add `<ErrorBoundary>` at route group / feature entry points when registering routes.

### Code splitting

- TanStack Router's Vite plugin already does **automatic per-route code splitting** (`autoCodeSplitting: true` in `vite.config.ts`). Do not add manual `React.lazy()` wrappers around route components. For non-route lazy boundaries (a heavy modal opened on demand), `React.lazy()` + `<Suspense>` is fine.

---

## Tailwind + shadcn Standards

shadcn components are **vendored, not imported from a package**. They live in `src/components/ui/` and we own them. Treat them as source code: edit freely, but understand the conventions.

### The styling hierarchy (in order of preference)

1. **shadcn component props** — `variant`, `size`, `asChild`. The first thing to reach for.
2. **Variant additions in `cva`** — if the same className combination repeats across 3+ call sites, add a new variant to the component's `cva` block rather than passing className.
3. **Theme tokens via Tailwind utilities** — `bg-primary`, `text-muted-foreground`, `border-border`. These auto-switch with theme.
4. **`className` prop with utility classes** — for one-off layout / spacing / responsive tweaks: `className="mt-4 flex-1 md:w-1/2"`.
5. **`cn(...)` from `@/lib/utils`** — for conditional / merged classNames. Always use `cn` instead of template literals or string concatenation so `tailwind-merge` resolves conflicts correctly.

### What `className` is acceptable for

- One-off layout adjustments: `className="mt-2 flex-1"`
- Responsive: `className="w-full md:w-1/2"`
- Conditional via `cn`: `cn('opacity-100', isDisabled && 'opacity-50')`
- Truly unique visual treatments that appear once in the app

### What `className` is NOT acceptable for

- **Hardcoded colors** (`bg-[#f87118]`, `text-[#fff]`) — use theme tokens (`bg-primary`, `text-foreground`)
- **Repeated patterns** across multiple components — extract to a new shadcn variant
- **Bypassing shadcn variants** with verbose utility chains when a variant prop exists

### Custom-variant pattern (with CVA)

When designing a component variant against a Figma frame, capture **bg, border, text, radius, padding, font** as independent axes:

- `variant` axis controls bg / border / text color
- `size` axis controls padding / font / gap
- Use `compoundVariants` for surgical overrides when a specific `variant × size` combo diverges from the cross-product (example: filled buttons use a fixed radius instead of pill)

### Mobile / touch UX

Base button (and any other tap target) classes ship the following for native-feeling mobile UX:

- `touch-manipulation` — kills iOS Safari's 300ms tap delay
- `[-webkit-tap-highlight-color:transparent]` — removes iOS gray-flash overlay
- `transition-colors duration-150` — snappy color response
- `active:bg-primary/10` (or matching) — touch-start feedback that mirrors the desktop hover color, so the feel is consistent across input modes. **No `active:scale-…`** unless the user explicitly asks for press transforms.

Tailwind v4's `hover:` variant is already gated to `(hover: hover)` — desktop only. You do not need to add `pointer-fine:` prefixes.

### Path aliases

Always use `@/` for imports from `src/`. Never use relative paths that climb more than 2 levels (`../../../`).

---

## TanStack Router (file-based)

- Routes live in `src/routes/`. The Vite plugin watches this folder and writes `src/routeTree.gen.ts`. **`routeTree.gen.ts` is committed** — do not gitignore it. Biome ignores it via `biome.json`.
- The root route is `src/routes/__root.tsx`. It renders a `<RouterProvider>` outlet and is where global layout (toast portal, error boundary, theme class) lives.
- **Do not add manual `React.lazy()`** around route components. The `tanstackRouter` plugin handles per-route code splitting automatically.
- Use TanStack Router's `<Link>` (not raw `<a>`) for in-app navigation. The `Register` augmentation in `main.tsx` gives you full type-checked `to=` props.
- For data dependencies that should preload with the route, use route `loader` functions paired with TanStack Query (queryClient lives in route context).

### The two route groups

```
src/routes/
├── __root.tsx                          # createRootRouteWithContext<{queryClient,auth}>() + <Outlet />
├── index.tsx                           # Landing
├── (gallery)/
│   └── $token/
│       ├── route.tsx                   # Guest shell: wrapping <div> (no auth)
│       ├── index.tsx                   # → <GalleryEvents token={token} />
│       ├── events.$eventId.tsx         # → <EventPhotos token={t} eventId={e} />
│       └── photos.$photoId.tsx         # → <PhotoViewer … />
└── admin/
    ├── route.tsx                       # Bare <Outlet /> — no gate, no shell
    ├── login.tsx                       # → <AdminLogin /> + reverse beforeLoad (authed → /admin)
    └── _authed/                        # Pathless layout — strips from URL, scopes the auth gate
        ├── route.tsx                   # beforeLoad gate (status !== 'authed' → /admin/login) + shell <div>
        ├── index.tsx                   # → <AdminHome />            (URL: /admin)
        └── galleries/
            ├── new.tsx                 # → <CreateGallery />        (URL: /admin/galleries/new)
            └── $id.tsx                 # → <AdminGalleryEvents id={id} /> (URL: /admin/galleries/$id)
```

(Layout above is the **target**; routes get added as features land — do not pre-scaffold empty files.)

### URL map (current state)

| URL | Auth | Page component | File |
|---|---|---|---|
| `/` | none | `Home` | `routes/index.tsx` |
| `/$token` | token in URL | `GalleryEvents` | `routes/(gallery)/$token/index.tsx` |
| `/$token/events/$eventId` | token in URL | `EventPhotos` | `routes/(gallery)/$token/events.$eventId.tsx` |
| `/admin` | JWT (gated by `_authed`) | `AdminHome` | `routes/admin/_authed/index.tsx` |
| `/admin/login` | none | `AdminLogin` | `routes/admin/login.tsx` |
| `/admin/galleries/new` | JWT (gated by `_authed`) | `CreateGallery` | `routes/admin/_authed/galleries/new.tsx` |
| `/admin/galleries/$id` | JWT (gated by `_authed`) | `AdminGalleryEvents` | `routes/admin/_authed/galleries/$id.tsx` |
| _any unmatched_ | none | `NotFound` | `defaultNotFoundComponent` in `main.tsx` |

Three things to know when reading the table:

- **Route groups don't appear in the URL.** The folder `routes/(gallery)/` is a TanStack Router *route group* — parentheses get stripped, so the guest URLs sit at the root (`/$token`), not under `/gallery/$token`. The group exists only to scope the guest shell (`route.tsx`) without adding a URL segment.
- **Underscore-prefixed segments don't appear in the URL either.** `routes/admin/_authed/` is a TanStack Router *pathless layout route* — the `_authed` segment is stripped from URLs, so `_authed/index.tsx` resolves to `/admin`, not `/admin/_authed`. The folder exists to scope the auth boundary (`beforeLoad`) and shell to authed routes only, without leaking into the URL.
- **`/admin/login` is the only admin route open to anonymous visitors.** It's a sibling of `_authed/` (not a child), so it's not subject to the auth gate. The auth gate lives in `_authed/route.tsx`, which means new authed admin routes are added under `_authed/` and inherit the gate for free. The home page's "Log in as admin" link points directly to `/admin/login` so users hit the form without a redirect bounce.

Planned-but-not-yet-built URLs (don't scaffold until the feature lands):

- `/$token/photos/$photoId` → guest single-photo viewer
- `/admin/galleries/$id/events/$eventId` → admin event view (with upload / delete actions)

### The orchestrator pattern

Route files exist to wire URL → page. They do not own UI or data.

```tsx
// routes/(gallery)/$token/index.tsx — thin orchestrator
import { createFileRoute } from '@tanstack/react-router';
import { GalleryHome } from '@/features/guest-gallery/pages/gallery-events';

export const Route = createFileRoute('/(gallery)/$token/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { token } = Route.useParams();
  return <GalleryEvents token={token} />;
}
```

```tsx
// features/guest-gallery/pages/gallery-events.tsx — the real page
export function GalleryHome({ token }: { token: string }) {
  const { data, isLoading } = useGallery(token);
  // PageHeader + content live here
}
```

### Per-group shell layout (`route.tsx`)

Each route group's `route.tsx` owns the shared wrapping `<div>` (max-width, centering, min-height) and any safe-area padding. **It does not own `<main>`** — the page does (see rule 4). The admin group's `_authed/route.tsx` additionally owns the `beforeLoad` auth gate. Pages render content only — they do not repeat the wrapper.

```tsx
// routes/(gallery)/$token/route.tsx — guest shell
import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/(gallery)/$token')({ component: GuestLayout });

function GuestLayout() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-screen-sm flex-col">
      <Outlet />
    </div>
  );
}
```

```tsx
// routes/admin/_authed/route.tsx — authed admin shell + auth gate
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/_authed')({
  beforeLoad: ({ context }) => {
    if (context.auth.status !== 'authed') throw redirect({ to: '/admin/login' });
  },
  component: AuthedLayout,
});

function AuthedLayout() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-screen-sm flex-col">
      <Outlet />
    </div>
  );
}
```

The two wrappers are intentionally identical today but stay duplicated rather than hoisted — see the note in the *AI Agent Behavior* section below ("Why we don't hoist the shell to `__root.tsx`").

Each page then composes `<Page>` + `<PageHeader>` + `<PageMain>` + `<Title>`:

```tsx
// features/guest-gallery/pages/gallery-events.tsx — page owns its <main>
export function GalleryHome({ token }: { token: string }) {
  return (
    <Page>
      <PageHeader leftContent={<HeaderTitle>Photo Gallery</HeaderTitle>} />
      <PageMain>
        <Title size="sm">John Williams gallery</Title>
        {/* body */}
      </PageMain>
    </Page>
  );
}
```

Admin pages swap `<PageHeader>` for `<AdminPageHeader>` (same API, with a Logout icon always pinned right).

### Guest route group (`/gallery/$token/*`)

- **No authentication header.** The token in the URL path is the only credential.
- Every API call from a guest route hits an endpoint shaped `/gallery/:token/...` and the backend re-validates the chain (`token → gallery → gallery_event → photo`) on every request. The FE does not cache or compare tokens — treat every API response that includes `id`s as authoritative.
- **Do not store the token in `localStorage`, cookies, or any client state.** It stays in the URL. If the user reloads, the URL provides it again.
- **Do not link out of the guest experience into `/admin/*`.** Guests don't see admin UI at all.

### Admin route group (`/admin/*`)

- Wrapped by an auth boundary in `admin/_authed/route.tsx` (pathless layout) — redirects to `/admin/login` when `auth.status !== 'authed'`. `admin/route.tsx` itself is bare; `admin/login.tsx` is a sibling of `_authed/` and has its own reverse `beforeLoad` (already-authed → `/admin`).
- The JWT mechanism is shared with the main NURA app (existing infra: `POST /auth/sms/generate`, `POST /auth/sms/validate`, `GET /auth/me`). Do not invent a new auth flow.
- Admin API calls hit the BE through `adminFetch` (`src/lib/api.ts`), which attaches `Authorization: Bearer <jwt>` and on 401 triggers `setOnUnauthorized` → `AuthProvider.logout` → the gate redirects to `/admin/login` on the next route load. Wrap `adminFetch` in TanStack Query `useQuery` / `useMutation` per the *TanStack Query Standards* section.
- Admin actions never touch the guest token system. Uploads target a specific gallery + event by their UUIDs.
- See the *Admin auth* section below for the full provider / boundary / mutation pattern.

---

## Forms — React Hook Form + Zod

All forms use RHF + Zod. No exceptions, no manual `useState` per input.

```tsx
const schema = z.object({
  title: z.string().min(1, 'Required'),
  caption: z.string().max(280).optional(),
});

type FormData = z.infer<typeof schema>;

const { control, handleSubmit } = useForm<FormData>({
  resolver: zodResolver(schema),
  defaultValues: { title: '', caption: '' },
});
```

- Schemas live in the feature's `utils.ts` (or `schemas.ts` for large schemas).
- Cross-field validation uses `.refine()` / `.superRefine()`.
- Use `z.infer<typeof schema>` for the form type — never maintain a parallel `interface FormData`.

---

## TanStack Query Standards

TanStack Query is **wired**. Devtools (`@tanstack/react-query-devtools`) is a devDep — open them when debugging server state.

- One `QueryClient` instance, created in `main.tsx`, wrapped in `<QueryClientProvider>`. Also passed into TanStack Router's context so route `loader`s can prefetch. Available in `beforeLoad`/`loader` as `context.queryClient`.
- **Query keys are arrays starting with the resource name**: `['gallery', token]`, `['gallery-event', token, eventId]`, `['admin-galleries']`, `['admin-photos', galleryId, eventId]`, `['auth', 'me']`. Always include any IDs and filter args.
- **Feature-specific query hooks live in `features/<name>/api/`**, not in a global `api/` folder. Auth mutations live in `features/admin/api/auth.ts`.
- **`enabled: false` (or a boolean expression) for queries that depend on a missing ID** (TanStack Query's equivalent of RTK Query's `skip`). `AuthProvider`'s `useQuery(['auth', 'me'])` uses `enabled: token !== null`.
- **Mutations invalidate the precise query keys they affect**, not the whole cache. Verify-OTP's mutation seeds the cache directly via `queryClient.setQueryData(['auth', 'me'], response.user)` rather than invalidating — no second round-trip after login.
- DTOs (response types) live next to the hook that uses them in the same file. Cross-cutting types (`ApiError`, `Paginated<T>`) belong in `src/lib/api.ts` or similar — only when 3+ features need them. `ApiError` is already in `src/lib/api.ts`.
- **Server state goes through TanStack Query — even for `/auth/me`.** Don't reach for raw `useEffect` + `fetch().then()` because it feels simpler. The cache, devtools, and `setQueryData` are the point of having the library. If you're not using them, you're paying its bundle cost for nothing.
- **Two fetcher functions**, not one: a `guestFetch` (no `Authorization` header, takes token from URL — not yet implemented; will land with the first guest API call) and `adminFetch` (already in `src/lib/api.ts`; attaches `Authorization: Bearer <jwt>`, throws `ApiError`, calls `setOnUnauthorized()` on 401). Wrap them in the `queryFn` of the relevant query hooks. **Never reuse the admin fetcher in a guest hook** — it would leak the JWT into a public context.

### Upload flow specifics (admin)

The 3-step `upload-urls → PUT to Supabase → sync` flow is the canonical pattern. Implement it as **three sequential mutations** in a single orchestrator hook (`useUploadPhotos`), not as one large `async` function buried in a component:

1. `useRequestUploadUrls` — `POST /gallery/admin/:id/events/:eventId/upload-urls`. Returns `{ uploads: [{ fileKey, uploadUrl }, ...] }`.
2. **Direct PUT to Supabase** (no TanStack Query mutation — just `fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': mimeType }, body: file })`). Run these in parallel via `Promise.allSettled` with a concurrency cap (default 6 — matches browser parallel-fetch limit). Track per-file progress for the UI.
3. `useSyncPhotos` — `POST /gallery/admin/:id/events/:eventId/photos/sync`. On success, invalidate the photo list query key.

Failure handling: if step 2 fails for a subset of files, surface per-file errors in the UI and let the user retry just the failed ones. **Never silently swallow upload failures** — partial successes are common (network blips on large batches).

---

## Admin auth

The admin auth flow is **OTP-only** (phone + 6-digit code). Same backend as the main NURA Events app — do not invent a new flow, do not deviate from the wire format.

### Endpoints (BE, existing)

| Endpoint | Body | Response |
|---|---|---|
| `POST /auth/sms/generate` | `{ phoneNumber: string }` (E.164) | `204` / void |
| `POST /auth/sms/validate` | `{ phoneNumber: string, verificationCode: string }` | `{ user: AdminUser, accessToken: { token: string }, refreshToken: { token: string } }` |
| `GET /auth/me` | — | `AdminUser` |

### Persistence

JWT tokens are persisted in `localStorage` under the exact keys NURA Events uses: `accessToken` and `refreshToken`. **Both raw strings, no envelope, no obfuscation.** Obfuscating a JWT in LS adds zero security (XSS attackers run in your origin); the only real mitigation is `httpOnly` cookies, which requires a BE change. Keys are intentionally identical to NURA Events so that if the two apps ever share an origin in prod, a session created in one is visible to the other. **Do not rename, do not encode.**

There is no `isLoggedIn` flag — the gallery never reads one, and "do tokens exist" is the same boolean.

### Provider + boundary shape

- `src/lib/auth/` holds the provider: `AuthProvider`, `useAuth`, `storage.ts` (LS read/write), `types.ts` (`AdminUser`, `AuthStatus`, `VerifyOtpResponse`, `AuthContextValue`).
- `AuthProvider` reads persisted tokens on first render; if a token exists, drives `/auth/me` via `useQuery(['auth', 'me'])` to rehydrate the user. Status is derived: `token === null → 'anon'`, query has data → `'authed'`, otherwise → `'loading'`.
- `main.tsx` renders `<AppRouter>` which gates `<RouterProvider>` behind `auth.status !== 'loading'`. This guarantees the auth state is settled before `beforeLoad` runs — refresh on a deep authed route does not flicker-bounce to `/admin/login`.
- The router context carries `{ queryClient, auth }`. `beforeLoad` in `admin/_authed/route.tsx` reads `context.auth.status`; `admin/login.tsx` has the reverse `beforeLoad` (already authed → `/admin`).
- `login(response)` writes the persisted tokens AND seeds the cache with `queryClient.setQueryData(['auth', 'me'], response.user)` — no `/auth/me` round-trip after verify.
- `logout()` clears LS, sets `token` state to `null`, and `queryClient.removeQueries({ queryKey: ['auth', 'me'] })`. The boundary then re-evaluates on the next route load.

### 401 handling

`adminFetch` calls a module-level callback (`onUnauthorized`) on any 401. `AuthProvider` registers `logout` as that callback in a `useEffect`. So: any admin request that returns 401 → tokens cleared → status flipped to `'anon'` → router context changes → boundary redirects to `/admin/login`. Do not catch 401 inside individual mutations or components — it's centralized.

### Phone input — no `react-international-phone`

Admin users type the full E.164 number themselves (`+1...`, `+381...`). The login phone field is a plain shadcn `Input type="tel"` with a placeholder hint (`+1 555 123 4567`) and Zod regex `/^\+[1-9]\d{6,14}$/`. Trim whitespace before submit. The BE wire format is identical to NURA Events; only the input chrome differs. Do not add `react-international-phone` for this.

### OTP entry

The verify phase uses a hand-rolled 6-cell input in `features/admin/components/otp-input.tsx`. Behavior matches NURA Events:

- Length 6, digit-only, numeric `inputMode`.
- Auto-advance to the next cell on each keystroke.
- Backspace on an empty cell focuses the previous cell.
- Paste fills cells in order, focusing the last filled cell (or last cell if longer than 6).
- Click on a cell after the first empty one redirects focus to the first empty cell.
- Auto-submit fires the verify mutation when 6 digits are entered.

Resend cooldown is 15s (matches NURA Events), implemented in `features/admin/components/resend-code-button.tsx`.

### Login flow shape — single route

`/admin/login` is a **single route**, not a multi-route flow. Phase (`'request' | 'verify'`) is component state, not URL state. Rationale: one OTP per session, no MFA layering, small known admin pool, no deep-link value to the verify phase (the OTP only validates against the matching server-side `phoneNumber` — landing on a "verify" URL cold is meaningless). This matches Clerk / Supabase Auth UI / Amplify — not Auth0 Universal Login (which is multi-page because it's a hosted IdP supporting SSO and bookmarkable resume, neither of which applies here). Do not split into `/admin/login` + `/admin/login/verify`.

---

## File & Naming Conventions

| Entity | Convention | Example |
|---|---|---|
| Folders | kebab-case | `event-photos/`, `host-gallery/` |
| Component files | kebab-case | `gallery-card.tsx`, `upload-button.tsx`, `photo-grid.tsx` |
| Page files (inside `features/<name>/pages/`) | kebab-case, **no `-page` suffix** | `gallery-events.tsx`, `event-photos.tsx` (NOT `gallery-home-page.tsx`) |
| Exported component names | PascalCase (React requirement); **never** use the `Page` suffix on page exports — the `pages/` folder already conveys it | `GalleryCard`, `EventPhotos`, `AdminLogin` (NOT `EventPhotosPage`) |
| Hook files | camelCase with `use` prefix | `useGallery.ts`, `useUploadUrl.ts` |
| Utility files | camelCase | `imageHelpers.ts`, `formatBytes.ts` |
| Type files | camelCase | `types.ts` |
| Route files | kebab-case (TanStack Router conventions) | `gallery.$id.tsx`, `__root.tsx` |
| shadcn UI files | kebab-case (as shipped) | `button.tsx`, `dialog.tsx` |

### Import order (convention, not enforced)

React → third-party → `@/lib`, `@/components`, `@/hooks` → feature-local → types. Biome's `organizeImports` handles sorting within groups.

### Path aliases

`@/` resolves to `src/`. Always prefer it over relative paths that climb more than 2 levels.

---

## TypeScript Standards

- **Strict mode is enabled.** Do not add `// @ts-ignore` or `// @ts-expect-error` without a comment explaining why.
- **No `any`.** Use `unknown` and narrow with type guards.
- **`verbatimModuleSyntax` is on.** Type-only imports must use `import type { Foo } from '...'` or `import { type Foo } from '...'`.
- **`erasableSyntaxOnly` is on.** No `enum`, no `namespace`, no parameter properties — modern TS only.
- **Explicit return types on exported functions** when the inferred type would be unclear.
- **Use `interface` for object shapes, `type` for unions / intersections / mapped types.**
- **Use `z.infer<>` for form types** — single source of truth (the Zod schema).

---

## Code Quality

- **Small, readable functions.** Judge by clarity and responsibility, not line count.
- **Early returns.** Handle edge cases first, then the happy path.
- **No dead code.** Delete unused vars, imports, commented-out blocks, unreachable branches. Do not leave `// TODO` without a tracked issue.
- **No duplication.** If the same pattern appears in 3+ places, extract it. Two instances are not a pattern.
- **Avoid premature abstraction.** Three similar lines is better than a premature abstraction. Code should be easy to delete, move, and refactor.
- **No backwards-compatibility hacks.** No renamed unused `_vars`, no re-exporting removed types, no `// removed` comments. If something is unused, delete it.
- **No comments that restate the code.** Only add a comment when the *why* is non-obvious (a hidden constraint, a subtle invariant, a workaround for a specific platform bug).

---

## Lint, Format, Build

| Command | What it does |
|---|---|
| `pnpm dev` | Vite dev server; regenerates `routeTree.gen.ts` on route changes |
| `pnpm build` | `tsc -b && vite build` — TypeScript first, then production bundle |
| `pnpm lint` | Biome lint (zero errors expected to ship) |
| `pnpm format` | Biome format-write across the project |
| `pnpm check` | Biome lint + format + auto-fix combined |
| `pnpm preview` | Preview the built bundle |

**Format on save is configured via `.vscode/settings.json`** (committed). VS Code prompts for the Biome and Tailwind CSS IntelliSense extensions on first open (via `.vscode/extensions.json`).

---

## Maintainability

- **Code should be easy to delete.** Features are self-contained — removing one means deleting its folder, removing its route, and cleaning up any genuinely shared imports.
- **Prefer composition over inheritance.** Compose small pieces. Avoid deep component hierarchies.
- **Do not design for hypothetical future requirements.** Build what is needed now. The right amount of complexity is what the task requires.
- **Do not add features, refactor, or "improve" beyond what was asked.** A bug fix doesn't need surrounding cleanup. A simple feature doesn't need extra configurability.

---

## AI Agent Behavior

All rules above apply to AI agents. In addition:

1. **Read before writing.** Always read existing files in the feature area before generating new code. Understand the patterns already in use — especially in `src/index.css` (the theme schema), `src/components/ui/button.tsx` (the canonical CVA pattern), and `src/main.tsx` (router + provider wiring).
2. **Theme tokens, always.** Never write a hex/rgba/oklch value or a hardcoded font family in a component. If the design needs a color the schema doesn't carry, add it to `src/index.css` first.
3. **Do not introduce new dependencies** without explicit approval.
4. **Do not create test infrastructure, documentation files, or README files** unless explicitly asked.
5. **Match existing patterns.** When unsure: shadcn's `Button` for component patterns; the file-based route layout in `src/routes/` for routing; the schema in `src/index.css` for design tokens.
6. **When `shadcn add <component>` writes to `:root` / `.dark`, manually relocate the new tokens to `.intimate`** before considering the task done. This is a one-time chore per added component.
7. **When the design references a font, verify the family name doesn't collide with a system font** (the Papyrus / PapyrusWeb lesson). Use unique web-font family names + a fallback chain ending in a generic family.
8. **Don't hoist route-group chrome into `__root.tsx`.** Each group's `route.tsx` owns its own wrapping `<div>` (max-width, min-height, centering). Today guest and admin happen to use identical classes — that's not duplication worth abstracting, it's intentional flexibility. The landing (`routes/index.tsx`) already uses different chrome (`max-w-sm` + its own padding + `justify-between` vertical rhythm), so hoisting would clobber it. Future groups (a wide desktop admin dashboard, a full-bleed photo viewer) will diverge. The cost of two repeated lines is lower than the cost of having to escape a hoisted root. Same reasoning for AdminShell — there is no shared shell component; per-page `<PageHeader>` is the pattern.
9. **`src/components/ui/**` runs under a scoped Biome override** so vendored shadcn primitives don't trigger `noLabelWithoutControl` (shadcn's `Label` is intentionally bare — consumers wire it via `htmlFor`). The override is scoped to `ui/**` only. Do not extend it elsewhere. `useComponentExportOnlyModules` is off globally for this project — mixed component/constant exports are allowed everywhere.
10. **Don't reach for raw `useEffect` + `fetch().then()` when TanStack Query fits.** Server state is server state — that includes auth hydration. See the rule in the *TanStack Query Standards* section. The cache, the devtools, and `setQueryData` are the value props of the library; skipping them in one place breaks the cache invariant everywhere else (e.g., a second consumer of `user` won't share data with `AuthProvider`).
