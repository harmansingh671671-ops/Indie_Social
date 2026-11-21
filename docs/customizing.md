# Customising SiteHub

A short map of the edits you are most likely to make. No build configuration needs to change for any of these.

## 1. Add a site

Open `apps/web/src/data/sites.ts` and copy an existing object. Only `id` must be unique.

```ts
{
  id: 'my-site',
  title: 'My Site',
  creator: 'Your Name',
  creatorHandle: 'yourhandle',
  category: 'Experiments',      // Art | Music | Games | Experiments | Worlds | Tools
  description: 'One or two sentences about the experience.',
  url: 'https://example.com',
  accent: '#4f46e5',            // used for the fallback poster tint
  ratio: 0.8,                   // image width / height. 0.75 = portrait, 1.25 = landscape
  tags: ['drawing', 'calm'],
  likes: 1200,
  saves: 300,
  addedDaysAgo: 3,
  poster: '/posters/my-site.webp', // optional
}
```

The home feed interleaves categories automatically, so you do not need to worry about ordering. Mark a site `featured: true` to surface it earlier within its category. Categories are declared in `CATEGORIES` at the bottom of the same file. Add a new category there and it appears in the Explore chip row.

## 2. Use your own posters

Every site already ships with a local screenshot in `apps/web/public/posters/`, listed in `data/posters.ts`. To replace one:

1. Save the image to `apps/web/public/posters/` (560px wide works well).
2. Point the site at it with `poster: '/posters/file-name.webp'` in `data/sites.ts`.

Recommended size: 560px wide, portrait orientation, cropped to the landing page. WebP keeps the feed fast; the shipped set is 430 KB for all 30 cards.

To regenerate the automatic screenshots after adding sites, run `npm run posters`. It screenshots every site without a `poster`, converts the result to WebP, rebuilds `data/posters.ts` and regenerates `data/placeholders.ts` (the tiny blurred previews that make cards appear instantly). Then hand-tune any card by adding the `poster` field.

Already have JPEGs? Drop them in `apps/web/public/posters/` and run `npm run posters:optimize`. It converts every JPEG to WebP, writes the placeholders and deletes the originals.

## 3. Change the look

All global values live in `apps/web/src/styles/tokens.css`:

```css
:root {
  --accent: #6d4aff;    /* bluish-purple primary action colour */
  --ink: #111111;       /* text, active pills and the wordmark */
  --surface-2: #f1f1f1; /* search field, chips */
  --radius-md: 16px;    /* feed cards */
  --header-h: 80px;
  --rail-w: 80px;
  --font: -apple-system, ...;
}
```

Per-area stylesheets:

| File | Covers |
|---|---|
| `layout.css` | top bar, black wordmark logo, side rail, mobile nav, page frame |
| `components.css` | buttons, avatars, menus, modal, toast, forms, empty states |
| `feed.css` | masonry, site cards, action overlays, category chips |
| `engage.css` | full-screen interactive website stream |
| `pages.css` | page headers, trending, sort toggle, collections, profile |

## 4. Change branding and the demo profile

`apps/web/src/config/site.ts` holds the product name, product domain and the profile shown on `/profile`. The header renders the name as a black wordmark with no coloured badge; restyle it in `apps/web/src/styles/layout.css` under `.logo`. The document title and meta description are in `apps/web/index.html`, and the favicon is `apps/web/public/favicon.svg`.

## 5. Add a page

1. Create `apps/web/src/pages/MyPage.tsx`.
2. Add a route in `apps/web/src/App.tsx`.
3. Add a link in `components/layout/SideRail.tsx` (desktop) and `MobileNav.tsx` (mobile).

## 6. Swap local state for an API

`state/AppState.tsx` is the only place that reads and writes saved sites, likes and follows. Replace `usePersistedState` with server calls and keep the same exposed functions; every page will keep working unchanged.

Posters, search and formatting are isolated in `lib/`, so they can be replaced independently.

## 7. Deploy

```bash
npm run build
```

The output is a static SPA in `apps/web/dist`. Host it on Cloudflare Pages, Netlify or Vercel. Because routing is client-side, configure a fallback rewrite to `/index.html` (Vercel and Netlify do this for SPAs; on Cloudflare Pages add a `_redirects` file containing `/* /index.html 200`).
