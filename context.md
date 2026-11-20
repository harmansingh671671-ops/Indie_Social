# Scroll / IndieSocial — working context

Read this file **once at the start of a session** (rule in `AGENTS.md`). Don't re-read it
repeatedly. Before every commit, add the important changes to the **Change log** below.
If this file passes **15,000 words**, rewrite it shorter while keeping everything that
still matters.

## What this is

"Scroll" is a Pinterest-like web app for discovering real interactive websites. It is a
**web prototype only**: the feed shows local landing-page screenshots, never live sites.
Clicking a card opens a Pinterest-style detail page; the real site opens on "Visit site".

- Monorepo root: `C:\IndieSocial`, npm workspaces, branch `main`.
- Stack: Vite 8 + React 19 + TypeScript + plain CSS. No backend, no auth, no database.
- Persistence: `localStorage`, keys prefixed `scroll.v1.*` (`saves`, `likes`, `follows`,
  `comments`, `boards`, `searchHistory`, ...).
- 30 curated real sites in 6 categories: Art, Music, Games, Experiments, Worlds, Tools.

## Commands / verification

```
npm run dev          # dev server on port 4000
npm run build        # tsc --noEmit && vite build
npm run typecheck    # TypeScript only
npm run preview      # preview built output
npm run posters      # mShots screenshots -> WebP -> inline placeholders
npm run posters:optimize  # re-compress existing JPGs to WebP + placeholders
```

Always run `npm run typecheck` and `npm run build` before committing. Browser checks use
Playwright; screenshots go to gitignored `shots/`. **Only use port 4000** for all browser
checks — the old 4001 preview server has been stopped and must not be used again. `sharp` is
a devDependency used only by poster scripts.

## Code map

```
apps/web/src/
  config/site.ts          brand name, logo letter, demo profile, ROUTES
  data/sites.ts           the 30 sites, CATEGORIES, TRENDING_TAGS
  data/posters.ts         generated id -> /posters/*.webp map
  data/placeholders.ts    generated tiny inline blurred previews
  lib/feed.ts             buildHomeFeed, searchSites, relatedSites, filterByCategory
  lib/search.ts           suggestions, fuzzy closeness, recent-search history
  lib/posters.ts          posterFor, placeholderFor, accentGradient
  lib/storage.ts          readJSON / writeJSON under scroll.v1.*
  components/common/      Avatar, Button, IconButton, Modal, PinImage, Toast, ...
  components/layout/      TopBar, MobileSearch, SideRail, MobileNav, AppShell, ...
  components/search/      SearchSuggestions (shared desktop/mobile dropdown rows)
  components/feed/        PinGrid, PinCard, CategoryChips
  components/pin/         PinActions, comments
  pages/                  Home, Explore, Search, Pin detail, Saved, Profile, 404
  styles/                 tokens, base, layout, components, feed, pages, pin
```

`CreateModal.tsx` is intentionally kept but not imported — see Deferred below.

## Key behaviours and design decisions

### Feed and posters
- Home = feed only (no category chips). Explore = title + category chips + feed only.
  Both grids use `showMeta={false}`: cards show only the poster (no title/creator below).
  Search/Saved/Profile/related grids still show the title + creator metadata.
- Every poster is a local 560px-wide WebP (~14 KB each, ~430 KB total) in
  `apps/web/public/posters/`. Each has a ~150-byte inline blurred placeholder in
  `data/placeholders.ts`, so cards paint instantly with real colour; no blank/skeleton
  flash and no layout shift.
- First 6 cards are `eager` + high `fetchPriority`; the rest are lazy. All 30 load locally
  with no network fallback.
- `PinImage` shows placeholder -> poster, with a designed gradient fallback on error. It also
  checks `img.complete` in a layout effect: cached images don't re-fire `load` on remount,
  which previously left every card stuck on its blurred placeholder after route changes.
- Replacing posters: drop a WebP in `public/posters/`, set `poster: '/posters/name.webp'`
  on the site in `data/sites.ts`. Regenerate with `npm run posters`.

### Header (always the "island")
- `.topbar` is `position: fixed` (not sticky) so page rubber-band overscroll at top/bottom
  does not drag it; only the cards area stretches.
- There is **no solid-bar state and no transition**. The header is always a floating pill:
  `.topbar::before` is the opaque pill (`inset: 6px 12px`, mobile `6px 8px`).
- `.topbar::after` is a blur band from the very top of the screen down past the pill
  bottom (`header height + 28px`), with a mask gradient fading the blur to 0 at the end.
  The pill sits over this blur. No fade animations (they caused a translucent flash).
- Mobile header keeps logo, search icon, notifications, messages and avatar all visible.

### Search (YouTube-like)
- Desktop (>`700px`): full search field with a dropdown of live suggestions.
- Mobile (<=`700px`): search field hidden, search icon opens a full-screen search sheet
  anchored at `y = 0` (top corners square), with no visible scrollbar. The sheet contains
  only the field + recent/trending suggestions; category chips, "Popular right now" and
  the red "Clear" link were deliberately removed.
- `lib/search.ts` builds ranked suggestions after every keystroke: recent searches, a
  "search for this" row, closest sites, makers, categories and tags. It is typo-tolerant
  (Levenshtein/subsequence matching). `SearchSuggestions` renders them with highlighted
  matches, icons, ↑/↓ + Enter keyboard navigation and Escape to close.
- Recent searches persist in `scroll.v1.searchHistory` (max 8). Per-item X removes one —
  hidden until row hover on hover-capable devices, always visible on touch. Clear-all was
  removed at the user's request. `readSearchHistory()` sanitises bad stored values so a
  corrupted entry cannot crash the search UI.
- Hovering/arrow-selecting a suggestion lifts it 2px, adds a shadow and a slight backdrop
  blur; the whole dropdown is lightly frosted.
- Search results page shows a "Did you mean …?" link when a query finds nothing.

### Navigation / pages
- Desktop: fixed top island + 80px side rail (Home, Explore, Saved, Settings, Help) +
  masonry. Mobile: bottom nav (Home, Explore, Saved) + 2-column masonry.
- Pin detail: preview, creator row, Save/Share/More, tags, comments, Visit site, related.
- Saved boards are auto-generated by category. Profile has Saved/Likes/Created tabs.
- All vertical scrollbars are hidden globally (`base.css`) while scrolling still works.

### Git / tooling notes
- `.webp` posters replaced the old `.jpg` set; `sharp` handles conversion. No ImageMagick,
  cwebp, ffmpeg or sharp CLI available globally (sharp is installed via npm).
- `shots/` is gitignored. Dev/preview servers are started detached when needed.
- Use higher-specificity selectors when overriding component styles: `components.css` is
  imported after `layout.css`, so equal-specificity rules there win even inside media
  queries (this bit the mobile search toggle once).
- If the dev server keeps serving an **old module** (e.g. an error about a prop that no
  longer exists, or old card markup), its in-memory Vite transform cache is stale — restart
  `npm run dev`. A browser hard refresh will not help because the server sends the old code.
  `vite.config.ts` now enables `server.watch.usePolling` so external file edits are picked up
  reliably on Windows, but a restart is still the fallback.

## Deferred / deliberately not built

- Create / "Submit a site" flow — `CreateModal.tsx` kept for later, not wired up.
- Explore extras — trending tag chips, Popular/Newest sort, eyebrow/description; styles
  and optional `PageHeader` props remain.
- Profile in the side rail — top-right avatar is enough.
- Backend, auth, real creator registry, live WebView/iframe site loading — future phases.

## Change log

- `d9e675a` initial Scroll prototype (feed, Explore, detail, Saved, Profile, 30 posters).
- `c0a3790` instant covers: WebP posters + inline placeholders; reduced nav.
- `1b4e3c0` fixed header during overscroll; `28bfb44` blurred solid bar bottom edge.
- `bfdd735` smooth island morph; `08cff98` gradient blur band; `3ae429e` always-island
  (solid state and scroll listener removed).
- `b186145` compact mobile search icon + full search sheet.
- `8e32ec1` YouTube-style live suggestions, fuzzy matching, history, did-you-mean.
- `da121fa` search sheet anchored to top; `3242619` hidden search scrollbars.
- `cb62dd0` removed Clear link and category/popular sections from search sheet.
- `a88823a` hover-lift/frost on suggestions, hover-only recent X.
- `4af40e0` hide vertical scrollbars on all pages.
- `context.md` + `AGENTS.md` added: mandatory once-per-session read, update before each
  commit, compress past 15K words.
- `PinImage` cache fix: detect already-complete images so Home/Explore cards show the real
  poster immediately after page switches instead of staying blurred.
- Search blank-screen fix: remove all `onClearHistory` references after deleting the Clear
  link, harden `readSearchHistory()` against malformed `localStorage`, and **restart the dev
  server** — Vite on port 4000 was still serving the stale pre-fix module from memory.
- `PinCard`/`PinGrid` gained `showMeta`; Home and Explore pass `false` so cards are image-only
  while other pages keep the title/creator row. Enabled Vite file polling and restarted the
  dev server because port 4000 was serving the stale pre-change `PinCard` transform.
- Retired the 4001 preview server; all verification is done on the 4000 dev server.
- Card hover: the whole card lifts 4px with a blurred halo behind it; removed the inner image
  zoom and the dark dimming overlay (posters stay bright on hover).
