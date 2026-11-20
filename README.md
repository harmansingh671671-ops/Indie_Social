# Scroll

A visual discovery feed for strange, playful and beautiful corners of the indie web — built to feel like Pinterest, but every pin is a real interactive website.

> Part of the IndieSocial project. See `plan.md` for the full product and execution plan.

## Run it

```bash
npm install
npm run dev
```

Open <http://localhost:4000>.

| Command | What it does |
|---|---|
| `npm run dev` | Dev server on port 4000 |
| `npm run build` | Type-check and production build |
| `npm run preview` | Preview the production build |
| `npm run typecheck` | TypeScript only |
| `npm run posters` | Refresh and compress the local poster screenshots in `apps/web/public/posters/` |
| `npm run posters:optimize` | Re-compress existing posters to WebP and rebuild inline placeholders |

## What's in v1

- **Home feed** — responsive masonry, hover Save/Share/More actions
- **Explore** — category filters over the curated catalogue
- **Search** — full-text search over titles, makers, tags and descriptions
- **Pin detail** — large preview, creator row with Follow, Like, Save, tags, comments (persisted locally), "Visit site", related pins
- **Saved** — auto-generated boards grouped by category, with a stacked-image board preview
- **Profile** — Saved / Likes / Created tabs, stats, share and edit-profile actions
- **Mobile** — bottom navigation, 2-column masonry, compact search icon that opens a full search sheet with trending tags, categories and live suggestions (all header icons stay visible)

Saved pins, likes, follows and comments persist in `localStorage` under the `scroll.v1.*` keys. There is no backend yet.

## Project structure

```
apps/web/
├── index.html
├── src/
│   ├── config/site.ts        ← brand name, logo letter, demo profile
│   ├── data/sites.ts         ← the 30 sites (edit this to change content)
│   ├── data/posters.ts       ← generated map of local poster screenshots
│   ├── data/placeholders.ts  ← generated inline blurred previews
│   ├── types.ts
│   ├── lib/                  ← search, formatting, posters, storage, sharing
│   ├── state/AppState.tsx    ← saved / liked / followed / comments
│   ├── components/
│   │   ├── layout/           ← TopBar, SideRail, MobileNav, AppShell (CreateModal kept for later)
│   │   ├── feed/             ← Masonry, PinCard, PinGrid, CategoryChips
│   │   ├── pin/              ← SaveButton, PinActions
│   │   └── common/           ← Button, Avatar, Modal, Toast, ActionMenu, PinImage…
│   ├── pages/                ← Home, Explore, Search, Saved, Profile, PinDetail, 404
│   └── styles/               ← tokens.css + one stylesheet per area
└── vite.config.ts
```

## Where to change things

Everything is deliberately split so content edits never touch layout code.

| I want to… | Edit |
|---|---|
| Rename the product / change the demo user | `apps/web/src/config/site.ts` |
| Add, remove or rewrite a site | `apps/web/src/data/sites.ts` |
| Change a site's poster image | add `poster: '/posters/name.webp'` to that site and drop the file in `apps/web/public/posters/` |
| Change colours, radii, spacing | `apps/web/src/styles/tokens.css` |
| Restyle the feed or a card | `apps/web/src/styles/feed.css` |
| Restyle the pin detail page | `apps/web/src/styles/pin.css` |
| Change navigation items | `components/layout/SideRail.tsx` + `MobileNav.tsx` |
| Change saved/like/comment behaviour | `state/AppState.tsx` |
| Connect a backend | replace the helpers in `lib/` and the state provider; pages only use those APIs |

See `docs/customizing.md` for longer recipes.

## Posters

Every card's screenshot is stored locally in `apps/web/public/posters/` and mapped in `apps/web/src/data/posters.ts`. They are cropped to the first screen and optimised to 560px-wide WebP files (~14 KB each, 430 KB for all 30), so the feed never loads full pages or heavy media and needs no network round-trip beyond one small file per card. Cards only show the image; the real website opens on "Visit site". `npm run posters` refreshes them from WordPress' free mShots service, converts them to WebP and rebuilds the placeholders; sites with a hand-picked `poster` are skipped.

Poster resolution order:

1. `poster` on the site object in `data/sites.ts` (your own image).
2. A local poster from `data/posters.ts`.
3. A live mShots screenshot.

Each card also has a ~150-byte blurred placeholder inlined in the bundle (`data/placeholders.ts`), so the layout paints with real colours before the poster arrives. If a poster fails, the card falls back to a designed gradient with the site's initial — no broken images, no blank boxes, no layout shift.

## Notes and limits

- The site list is curated demo content. Every site belongs to its maker; Scroll only links out.
- Search, boards, likes and comments are local to the browser.
- The Create / submit-a-site flow is deferred to `plan.md`; its modal component is kept in the codebase for later.
- Cards show static landing-page screenshots only. Websites are never loaded inside the feed — use "Visit site" on a pin to open the real site.
- The app is a web client. The native WebView lifecycle work in `docs/webview-lifecycle-spike.md` is still future work.

## Next steps

1. Add a backend (Hono/Fastify + Postgres) and move the catalogue and interactions into it.
2. Replace local auth with magic-link login.
3. Wire the Create flow to site verification and the capture pipeline.
4. Add comments moderation before opening comments publicly.
5. Build the native app with `react-native-webview` and the load-aware lifecycle.
