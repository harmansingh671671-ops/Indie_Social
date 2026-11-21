# SiteHub / IndieSocial — working context

Read this file **once at the start of a session** (rule in `AGENTS.md`). Don't re-read it
repeatedly. Before every commit, add the important changes to the **Change log** below.
If this file passes **15,000 words**, rewrite it shorter while keeping everything that
still matters.

## What this is

**SiteHub** (domain `sitehub.sites`) is a visual discovery app for real interactive websites.
It is a **web prototype only**: the feed shows local landing-page screenshots, never live
sites. Clicking a card opens the immersive **Engage** feed, where the active site and its two
neighbours load in iframes. The old `/pin/:id` detail page has been deleted; there is no
"pin" terminology left in the app.

- Monorepo root: `C:\IndieSocial`, npm workspaces, branch `main`.
- Stack: Vite 8 + React 19 + TypeScript + plain CSS. No backend, no auth, no database.
- Persistence: `localStorage`, keys prefixed `sitehub.v1.*` (`saves`, `likes`, `follows`,
  `searchHistory`).
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
  config/site.ts          brand name, domain, demo profile, ROUTES
  data/sites.ts           the 30 sites, CATEGORIES, TRENDING_TAGS
  data/posters.ts         generated id -> /posters/*.webp map
  data/placeholders.ts    generated tiny inline blurred previews
  lib/feed.ts             buildHomeFeed, searchSites, relatedSites, filterByCategory
  lib/search.ts           suggestions, fuzzy closeness, recent-search history
  lib/posters.ts          posterFor, placeholderFor, accentGradient
  lib/storage.ts          readJSON / writeJSON under sitehub.v1.*
  components/common/      Avatar, Button, IconButton, Modal, SiteImage, Toast, ...
  components/layout/      TopBar, MobileSearch, SideRail, MobileNav, AppShell, ...
  components/search/      SearchSuggestions (shared desktop/mobile dropdown rows)
  components/feed/        SiteGrid, SiteCard, CategoryChips
  components/site/        SaveButton, SiteActions
  pages/                  Home, Explore, Search, Engage, Saved, Profile, 404
  styles/                 tokens, base, layout, components, feed, pages, engage
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
- `SiteImage` shows placeholder -> poster, with a designed gradient fallback on error. It also
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
- Recent searches persist in `sitehub.v1.searchHistory` (max 8). Per-item X removes one —
  hidden until row hover on hover-capable devices, always visible on touch. Clear-all was
  removed at the user's request. `readSearchHistory()` sanitises bad stored values so a
  corrupted entry cannot crash the search UI.
- Hovering/arrow-selecting a suggestion lifts it 2px, adds a shadow and a slight backdrop
  blur; the whole dropdown is lightly frosted.
- Search results page shows a "Did you mean …?" link when a query finds nothing.

### Engage page (new vertical experience)
- Clicking a website card opens `/engage/:id`, an immersive full-screen vertical snap-scroll
  feed. `siteLink()` also points to `/engage/:id`; there is no separate detail page any more.
- `AppShell` renders Engage without the header, rail or bottom nav. Current layout: standalone
  back arrow top-left, up/down arrow buttons at top/bottom centre (they wrap through all 30
  sites), bottom-left creator meta + "Untitled experience" (real naming comes later), and a
  bottom-right Save/Share/More/Visit stack. Save/Follow/Like use the existing `AppState`.
  The old island header, dots, progress bar, category badge, swipe hint and the top/bottom
  black gradient scrims were removed, so websites render edge-to-edge with no shading.
- Each active slide and its two neighbours render the real website in an `<iframe>` so it is
  fully interactive; further slides show only the local poster. Only 3–5 iframes exist at
  once. Some external sites refuse framing (X-Frame-Options/CSP), so "Visit site" opens the
  real site in a new tab as a fallback.
- Design reference was generated with **Stitch MCP** (project `5010295139379108609`,
  "Scroll — Engage", screen "Engage — Indie Discovery Feed"; generated before the SiteHub
  rename). The React implementation lives
  in `pages/EngagePage.tsx` with styles in `styles/engage.css`.

### Navigation / pages
- Desktop: fixed top island + 80px side rail (Home, Explore, Engage/random, Saved,
  Settings, Help) +
  masonry. Mobile: bottom nav (Home, Explore, Saved) + 2-column masonry.
- Engage replaces the old detail page: full-screen interactive stream with Save/Share/More.
  The side rail's shuffle button picks a random site from `SITES` and navigates to
  `/engage/:id`; `ROUTES.engage` is the base path.
- Saved collections are auto-generated by category. Profile has Saved/Likes/Created tabs.
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
- `SiteImage` cache fix: detect already-complete images so Home/Explore cards show the real
  poster immediately after page switches instead of staying blurred.
- Search blank-screen fix: remove all `onClearHistory` references after deleting the Clear
  link, harden `readSearchHistory()` against malformed `localStorage`, and **restart the dev
  server** — Vite on port 4000 was still serving the stale pre-fix module from memory.
- `SiteCard`/`SiteGrid` gained `showMeta`; Home and Explore pass `false` so cards are
  image-only while other pages keep the title/creator row. Enabled Vite file polling and
  restarted the dev server because port 4000 was serving the stale module.
- Retired the 4001 preview server; all verification is done on the 4000 dev server.
- Added Engage vertical feed (Stitch-generated design), routed card clicks to `/engage/:id`,
  and hid the normal app shell on that route. Later switched slides to real interactive
  iframes (±2 window), removed the island/dots/progress/badge, and added wrapping top/bottom
  navigation arrows.
- Rebranded the app from "Scroll" to **SiteHub** (domain `sitehub.sites`): brand config,
  document titles/meta, page titles, search strings, storage prefix (`sitehub.v1.*`), package
  metadata, README/docs/plan. Removed the black top/bottom gradient scrims from Engage.
- Removed the old Pinterest-style detail page and all "pin" wording: deleted `/pin/:id`,
  `PinDetailPage.tsx`, `pin.css`, comment state and the unused `Board` type. Renamed
  `PinImage`/`PinCard`/`PinGrid`/`PinActions` to `Site*`, classes to `site-*`, and Saved
  "boards" to "collections". Replaced the red circular logo with a black "SiteHub" wordmark,
  changed the accent to indigo (`--accent: #4f46e5`), and made the favicon a black "SH".
- Added a shuffle/Engage button to the desktop side rail that opens a random website in the
  Engage stream.
- Engage is now a continuous loop: instead of wrapping by jumping to `scrollTop = 0`, reaching
  either edge appends or prepends another 30-site cycle. A stable `uid` per cycle keeps the
  current iframe mounted, and `overflow-anchor: none` plus an explicit `scrollTop` restore
  prevents the browser from shifting the view when a cycle is prepended.
- Engage no longer shows toasts for Like/Save/Follow/Share. Those actions animate their icons
  instead: `engage-pop` lifts, tilts, scales and settles the icon back (YouTube-like), and
  `engage-icon-in` drops a changed icon into place (Bookmark -> check, Share -> check for 1.6s
  after a copy). The expanding glow/wave was removed. The star uses its own `engage-star-spin`
  the Share tool label changes to "Copied" for the same 1.6s; the star uses the same
  `engage-icon-in` change animation as Save. The Report menu item is a no-op.
- Engage navigation redesigned: removed the top/bottom arrows. A single page-level right rail
  now holds a pill-shaped, snap-scrolling thumbnail navigator (previous / current / next,
  cropped local posters) above the action buttons. Scrolling or flinging the strip drives the
  feed via `scrollend`; clicking a thumbnail jumps to that site. The main website can still be
  scrolled/swiped directly and stays in sync. A top-right hide button toggles all overlays
  (back arrow, meta, rail/actions, navigator); only the hide button remains when hidden.
  After 5s of no app-chrome interaction the overlays fade out automatically (0.7s opacity
  transition); any pointer/key activity resets the timer. The navigator renders only a 4-site
  window around the active site; overlay sizes were reduced slightly.
  The per-slide meta/action controls were moved out of the slides into one page-level overlay.
- Engage arrow navigation is animated by rAF-driven `scrollTop` changes over 380ms (scroll
  snapping is temporarily disabled). The earlier CSS-transform version made cross-origin
  iframes render dark until repaint, so it was replaced. A short `focusin` guard blurs iframes
  that steal focus right after a step and restores the target scroll position, which also
  fixed the one-slide skip. Clicks during the animation are ignored; wrapping still works.
- Engage action stack: all five tools (Like, Save, Share, More, Visit) now share the same
  violet gradient circle, with a small stroked label underneath each one. Visit is an
  icon-only button; the old wide "Visit site" pill and the count pill were removed. The Like
  tool's label shows only the formatted like count (no "Like" word).
- Engage action stack now has a YouTube-style Like star above Save: it toggles the shared
  `isLiked` state, fills violet when liked and shows a formatted like count. The old "Like"
  item was removed from the More menu. `ActionMenu` gained a `direction="up"` option, used by
  the 3-dot menu so its panel opens above the trigger.
- Bluish-purple theme: `--accent` is now `#6d4aff` (hover `#5b3ce0`) and avatar colours are
  all blue/violet shades. Engage's creator meta sits in a translucent violet frosted panel so
  it stays readable on any website background. The panel background was later removed — the
  meta is now fully transparent and the handle/title use white fill with a thin dark
  `-webkit-text-stroke` plus a small shadow for contrast. The creator avatar, handle, title, action
  buttons and Visit site pill were enlarged and recoloured to match. The embedded-site
  ActionMenu icon buttons are restyled via `.engage .menu > .icon-btn` (no white circles).
- Engage scrollbar hiding: the scroller is explicitly `overflow-x: hidden` with
  `scrollbar-width: none`, and each iframe is 24px wider/taller than its slide so scrollbars
  drawn by the embedded website itself fall outside the clipped slide.
- Card hover: the whole card scales up 2% (`transform: scale(1.02)`) with a blurred halo
  behind it; the other cards in the feed blur 0.5px while one is hovered/focused; removed the
  inner image zoom and the dark dimming overlay (posters stay bright). Scale/blur/halo
  transitions are 80ms so switching cards feels immediate but still gradual.
