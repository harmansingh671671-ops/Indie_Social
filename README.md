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
| `npm run posters` | Refresh the local poster screenshots in `apps/web/public/posters/` |

## What's in v1

- **Home feed** — responsive masonry, category chips, hover Save/Share/More actions
- **Explore** — trending searches, category filters, Popular / Newest sorting
- **Search** — full-text search over titles, makers, tags and descriptions
- **Pin detail** — large preview, creator row with Follow, Like, Save, tags, comments (persisted locally), "Visit site", related pins
- **Saved** — auto-generated boards grouped by category, with a stacked-image board preview
- **Profile** — Saved / Likes / Created tabs, stats, share and edit-profile actions
- **Submit a site** — Create flow that stores submissions in local storage
- **Mobile** — Pinterest-style bottom navigation, 2-column masonry, sticky search

Saved pins, likes, follows, comments and submissions persist in `localStorage` under the `scroll.v1.*` keys. There is no backend yet.

## Project structure

```
apps/web/
├── index.html
├── src/
│   ├── config/site.ts        ← brand name, logo letter, demo profile
│   ├── data/sites.ts         ← the 30 sites (edit this to change content)
│   ├── data/posters.ts       ← generated map of local poster screenshots
│   ├── types.ts
│   ├── lib/                  ← search, formatting, posters, storage, sharing
│   ├── state/AppState.tsx    ← saved / liked / followed / comments
│   ├── components/
│   │   ├── layout/           ← TopBar, SideRail, MobileNav, AppShell, CreateModal
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

Every card's screenshot is stored locally in `apps/web/public/posters/` and mapped in `apps/web/src/data/posters.ts`. `npm run posters` refreshes them from WordPress' free mShots service; sites with a hand-picked `poster` are skipped.

Poster resolution order:

1. `poster` on the site object in `data/sites.ts` (your own image).
2. A local poster from `data/posters.ts`.
3. A live mShots screenshot.

While images load, cards show a tinted skeleton; if a poster fails, they fall back to a designed gradient with the site's initial — no broken images.

## Notes and limits

- The site list is curated demo content. Every site belongs to its maker; Scroll only links out.
- Search, boards, likes and comments are local to the browser.
- The Create flow stores submissions in `localStorage`; it is a placeholder for the real creator pipeline described in `plan.md`.
- The app is a web client. The native WebView lifecycle work in `docs/webview-lifecycle-spike.md` is still future work.

## Next steps

1. Add a backend (Hono/Fastify + Postgres) and move the catalogue and interactions into it.
2. Replace local auth with magic-link login.
3. Wire the Create flow to site verification and the capture pipeline.
4. Add comments moderation before opening comments publicly.
5. Build the native app with `react-native-webview` and the load-aware lifecycle.
