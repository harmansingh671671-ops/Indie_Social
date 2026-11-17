# IndieSocial — Production Plan

> **Codename:** Scroll
> **Start date:** November 2026
> **Working folder:** `C:\IndieSocial`
> **Updated against:** `Scroll_Updated_Product_and_Execution_Plan.docx` (17 November 2026)

---

## 1. Vision (one paragraph)

A native mobile app for discovering and experiencing real websites through a visual feed. Creators opt in by registering and verifying sites they own; their sites can remain hosted anywhere. The app shows an instant captured preview while the live site loads, then opens it when it is ready and at least five seconds have passed. Viewers can search, save, organize, follow and share discoveries. The first product bet is repeat viewer use and meaningful creator value; paid hosting and advanced AI tools come later only if validated.

---

## 2. Key Decisions (locked in)

| Decision | Choice | Rationale |
|---|---|---|
| **Mobile stack** | React Native + react-native-webview | Native WebView is central. Start with one explicitly managed active WebView; validate lifecycle and memory before considering pooling. |
| **Backend** | TypeScript + Postgres + Redis + Playwright | Per doc recommendation. Hono or Fastify for API, Prisma for DB, BullMQ for job queue. |
| **Capture pipeline** | Playwright (headless Chromium) + ffmpeg | Poster frames, 5–8s muted loops, safety scans. |
| **First niche** | Creative coding / generative art | Visually striking in 5 seconds, strong communities (Neocities, creative-coding Discord/Reddit). |
| **Public comments** | Deferred | Start with likes, saves, follows and structured reactions/feedback; add comments only if evidence and moderation capacity justify them. |
| **Team assumption** | Solo founder for planning | Validate with a small prototype and technical spike before committing to the full native app. Roadmap durations are assumptions, not commitments. |
| **Object storage** | Cloudflare R2 or S3-compatible | For capture media (posters, loops). |
| **Hosting** | After audience validation | Keep hosting optional, portable and exportable. Do not ask creators to pay before Scroll can show distribution value. |
| **Discovery model** | Opt-in, curated launch | Only list owner-submitted, verified sites. Start with 30–50 exceptional candidates and a smaller permissioned collection. |
| **AI disclosure** | Human-made / AI-assisted / AI-generated | Creator-editable disclosure and viewer filters; AI is an assistive feature, not a dependency. |

---

## 3. Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                   MOBILE APP (React Native)         │
│  ┌─────────┐  ┌──────────┐  ┌───────────────────┐  │
│  │ Feed UI │  │ Active  │  │ Interaction Bar   │  │
│  │ (scroll)│  │ WebView │  │ (like/save/follow/│  │
│  │         │  │ lifecycle│ │  react/share/     │  │
│  │         │  │ + next   │  │  report)          │  │
│  └─────────┘  └──────────┘  └───────────────────┘  │
└──────────────────────┬──────────────────────────────┘
                       │ HTTPS
┌──────────────────────▼──────────────────────────────┐
│                   API SERVICE (TypeScript)           │
│  Auth · Registry · Feed · Interactions · Dashboard  │
│  ┌──────┐  ┌───────┐  ┌───────┐  ┌──────────────┐  │
│  │Postgres│ │ Redis │  │BullMQ │  │ Object Store │  │
│  │(data) │  │(cache,│  │(jobs) │  │ (R2 / S3)    │  │
│  │       │  │ rate) │  │       │  │              │  │
│  └──────┘  └───────┘  └───────┘  └──────────────┘  │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│              CAPTURE PIPELINE                        │
│  Playwright workers → poster frame + muted loop     │
│  + safety scan → upload to object store + CDN       │
│  ffmpeg for loop encoding                           │
└─────────────────────────────────────────────────────┘
```

---

## 4. Project Structure (monorepo)

```
C:\IndieSocial\
├── plan.md                  ← this file
├── apps/
│   ├── mobile/              ← React Native app
│   └── web/                 ← Future web client
├── packages/
│   ├── api/                 ← Backend API (Hono/Fastify + Prisma)
│   ├── capture/             ← Playwright capture pipeline
│   ├── shared/              ← Shared types, constants, manifest schema
│   └── admin/               ← Admin console (React web app)
├── infra/                   ← Docker compose, env templates, deploy scripts
├── docs/                    ← ADRs, API docs, manifest spec
└── scripts/                 ← Dev tooling, seed scripts
```

---

## 5. Phased Roadmap

### Phase 0 — Validate the experience (Weeks 1–3; planning estimate)

**Goal:** Test whether viewers enjoy discovery and return, whether creators see credible value, and whether the load-aware website lifecycle works on target devices.

| Week | Tasks | Deliverable |
|------|-------|-------------|
| **W1** | Prototype WebView lifecycle and readiness logic; loading starts on arrival; opening occurs at max(arrival + 5 seconds, app-ready time). Add bottom Next arrow and up-to-five-second outgoing WebView retention. Test low-end Android memory. Draft manifest v0 and safety checklist. | Technical spike with lifecycle timing, transition behaviour and device notes |
| **W2** | Build a clickable prototype with 10–15 sites, instant Tier 0 posters and Tier 2 live loading for selected sites. Add basic search/category and collection flows. Begin a 40–50-site candidate list and seek written permission from first 10 owners. | Clickable prototype and permissioned seed set in progress |
| **W3** | Test with 15–20 viewers and interview 10 creators. Observe loading, skips, full-site interactions, saves/shares, return intent; test slow, failed and heavy sites. Review product, content, performance and onboarding evidence. | Validation findings and GO / CHANGE / STOP decision |

**Exit criteria:**
- [ ] Testers understand the transition and navigate without gesture confusion
- [ ] Viewers show genuine interest in opening, saving and returning to sites
- [ ] Creators see a credible reason to participate
- [ ] Loading, failure handling and memory use are acceptable on target devices
- [ ] **Decision: GO / CHANGE / STOP**

Do not use a single five-second promotion percentage as the go/no-go measure. Five seconds is a minimum review period, not a fixed loading deadline.

---

### Phase 1 — Closed Alpha (Weeks 4–12; planning estimate)

**Goal:** A curated native app with verified sites, useful discovery controls and creator analytics. Target 30–50 sites and 100–300 invited viewers only if Phase 0 supports proceeding.

#### 1A: Backend Foundation (after Phase 0)
- [ ] Postgres schema: users, channels, sites, interactions/reactions, collections, captures and privacy-conscious feed events
- [ ] Auth (email magic link + OAuth: Google, GitHub)
- [ ] Site registry API: submit URL, verify ownership (well-known file or DNS TXT)
- [ ] Manifest parser: fetch `/.well-known/scroll.json`, fill missing fields from page meta / AI
- [ ] Feed API: curated order plus explainable basic ranking; preserve a discovery lane

#### 1B: Capture Pipeline Production (after Phase 0)
- [ ] Job queue (BullMQ): on site registration → capture job
- [ ] Poster frame (WebP), muted loop (MP4, 5–8s), hero frame
- [ ] Safety scan: URL reputation check, content classification
- [ ] Upload to object storage, serve via CDN
- [ ] Re-capture on schedule (weekly) for drift detection

#### 1C: Mobile App Alpha (after Phase 0)
- [ ] Auth flow (magic link deeplink)
- [ ] Feed screen: instant poster/loop while the live site loads, then load-aware opening
- [ ] Load-aware review state: poster immediately; open at max(five-second minimum, app-ready time); no misleading countdown
- [ ] Bottom Next arrow in full-site mode; site owns its gestures elsewhere
- [ ] Retain outgoing WebView up to five seconds after Next, with earlier cleanup for memory pressure
- [ ] Search, categories, interest onboarding, likes, saves, named collections, follows, structured reactions, share and report
- [ ] Data saver mode (reduce automatic media/background loading; allow tap-to-load)
- [ ] Failure/timeout state with Retry, Skip and Open in browser; retain Tier 0 preview
- [ ] Document the `ScrollPreview/1.0` user-agent token for creators; avoid unnecessary personal data

#### 1D: Viewer Feedback & Moderation (after alpha core)
- [ ] Likes, saves to collections, follows and structured reactions/feedback
- [ ] Report flow → admin review queue
- [ ] Creator controls: hide submitted content where applicable, block user
- [ ] Rate limits on submissions, follows and reactions (Redis)
- [ ] Defer public comments; revisit only with demonstrated demand and moderation capacity

#### 1E: Creator Dashboard (after core alpha signals)
- [ ] Distinguish impressions, preview loads, ready/open events, unique visitors and meaningful interactions
- [ ] Show load time, failures, saves, reactions and follows over time
- [ ] Site management: edit title/tags/AI-label, remove site
- [ ] Channel profile editing

#### 1F: Admin Console (as needed for invited alpha)
- [ ] Review queue for reported content
- [ ] Per-site kill switch
- [ ] Curation tools: pin sites, create themed sessions
- [ ] Content drift alerts and recheck workflow

**Exit criteria:**
- [ ] Repeat use is measurable and positive for the target cohort
- [ ] Creators submitting second sites
- [ ] No unhandled safety incident
- [ ] Reporting, blocking, takedown and safety review work in practice

---

### Phase 2 — Public Beta (Weeks 19–30)

**Goal:** Open submissions only once the curated experience, safety process and creator value are working. Grow repeat weekly use without paid acquisition.

- [ ] Open registration with verification + review queue
- [ ] Channels with multiple sites
- [ ] Topics / categories and search
- [ ] Better moderation and creator block lists; add comment support only if approved after validation
- [ ] AI labels (human-made / AI-assisted / AI-generated), creator explanation and viewer filter
- [ ] Explore Webmention outbound for supported reactions
- [ ] Data export (interactions, followers)
- [ ] Drift crawl: scheduled headless re-capture, screenshot diff, threshold pull
- [ ] Content rating system (everyone / teen / mature)
- [ ] Web client (Tier 0 + opt-in Tier 2 only, since iframe restrictions apply)
- [ ] Hosting waitlist, real provider cost quotes
- [ ] Unit economics validation: cost per 1K views vs. price

**Exit criteria:**
- [ ] WAU growing organically
- [ ] Submission pipeline manageable
- [ ] Hosting waitlist ≥50 creators

---

### Phase 3 — Creator Services (only after evidence; timing TBD)

- [ ] Pilot Scroll Host only if creator interviews and a waitlist justify it; keep it portable/exportable
- [ ] Metering: storage (GB-month), bandwidth (GB), requests
- [ ] Prepaid wallet with top-ups, spend cap (alert at 50/80/100%)
- [ ] Static fallback when wallet empty (don't kill the site)
- [ ] Custom domain add-on
- [ ] AI presentation tools first: suggest hero moment/title/tags and flag blank screens; require creator review
- [ ] Consider a full AI site builder only if demand is demonstrated
- [ ] Select billing providers after company, market and compliance decisions
- [ ] Free tier: small allowance for verified accounts
- [ ] Abuse prevention: scan at upload, rate limits, restricted types until trust earned
- [ ] Invoices, receipts, tax handling

**Exit criteria:**
- [ ] Paying creators exist
- [ ] Positive gross margin on usage
- [ ] Low abuse rate

---

### Phase 4 — Platform (Week 45+)

- [ ] In-site widget SDK (reactions, polls, guestbooks, live presence)
- [ ] Published manifest spec + third-party API
- [ ] Explore ActivityPub / AT Protocol federation
- [ ] Creator monetization (tips, subscriptions)
- [ ] Tier 1 preview (tap-state capture, if validated)

---

## 6. Tech Stack Detail

| Layer | Technology | Why |
|---|---|---|
| Mobile | React Native | JS/TS ecosystem, react-native-webview with explicit active-site lifecycle |
| WebView | react-native-webview | Non-persistent storage, navigation interception, JS injection |
| Navigation | React Navigation 7 | Standard RN navigation |
| State | Zustand or TanStack Query | Lightweight, familiar |
| API framework | Hono (on Node) or Fastify | Fast, TypeScript-native |
| ORM | Prisma | Type-safe, migrations, Postgres |
| Database | PostgreSQL 16 | Users, channels, sites, interactions |
| Cache / Rate limit | Redis 7 | Counters, rate limiting, session cache |
| Job queue | BullMQ | Capture jobs, scheduled crawls |
| Capture | Playwright | Headless Chromium, screenshots, video recording |
| Video encoding | ffmpeg | Loop encoding, format conversion |
| Object storage | Cloudflare R2 | S3-compatible, no egress fees |
| CDN | Cloudflare | Serve capture media globally |
| Auth | Email magic link + OAuth (Google, GitHub) | Low friction |
| Admin console | React + Vite | Internal tool |
| Monorepo | npm workspaces or Turborepo | Shared types, unified builds |

---

## 7. Database Schema (Core Tables)

```
users          (id, email, name, avatar_url, role, created_at)
channels       (id, user_id, name, bio, avatar_url, created_at)
sites          (id, channel_id, url, title, description, tags[], 
                made_with, content_rating, manifest_json,
                verified, status, poster_url, loop_url, hero_url,
                last_captured_at, last_drift_check, created_at)
interactions   (id, user_id, site_id, type[like/save/follow/reaction],
                reaction_key, body, created_at)
collections    (id, user_id, name, created_at)
collection_items (collection_id, site_id)
reports        (id, user_id, site_id, reason, status, created_at)
feed_events    (id, user_id, site_id, event[impression/preview_load/ready/open/skip],
                occurred_at, load_ms, failure_reason)
```

---

## 8. The Manifest Spec (`/.well-known/scroll.json`)

```json
{
  "title": "Pixel Garden",
  "description": "Grow tiny generative plants.",
  "tags": ["generative-art", "toy"],
  "made_with": "human",
  "ai_explanation": "",
  "preview": {
    "url": "https://example.com/?preview=1",
    "interactions": ["tap", "drag"],
    "readiness_hint": "main-content"
  },
  "language": "en",
  "content_rating": "everyone"
}
```

Fields are optional. Missing values may be suggested from page metadata or AI, but creators must be able to review and edit them. `readiness_hint` is advisory; the app enforces its own readiness checks and timeout.

---

## 9. Load-Aware Lifecycle and Gesture Ownership

| Mode | Navigation and interaction |
|------|----------------------------|
| **Review/loading** | Feed owns navigation; taps may interact only with permitted preview controls. Show poster immediately while live site loads. |
| **Open site** | Open when both conditions hold: at least five seconds since arrival and the app-defined ready event has fired. The website owns gestures. |
| **Advance** | A persistent, accessible bottom Next arrow advances to the next item. Do not hijack the site's vertical swipes. |
| **Previous site** | Keep the outgoing WebView for up to five seconds after leaving, then unload; memory pressure or safety events may unload it earlier. Restoration is best effort only while it remains alive. |

Readiness must not depend on universal network-idle. Use document readiness plus practical app-defined checks and a configurable maximum loading window. On timeout or failure, offer Retry, Skip and Open in browser. Track arrival, load start, document-ready, app-ready, open, Next tap and destruction with privacy minimization. Handle Android Back and iOS navigation deliberately. Cancel requests, timers, listeners and media when destroying a WebView; reject stale callbacks from older items.

Test this lifecycle with real games, canvas experiences, drag interactions and pages with their own scrolling.

---

## 10. Preview Sandbox Restrictions

- No navigation away from site origin; no popups
- Form submissions, downloads, payments, file pickers blocked
- No camera, mic, location, clipboard, notifications
- Audio muted until viewer taps unmute
- CPU + network budgets with kill switch
- Non-persistent storage (no cookies persist from preview)
- User-agent token: document it for creators and avoid embedding unnecessary personal data.
- The review state must not silently grant sensitive permissions after opening. Apply a separate full-site permission and safety policy.

---

## 11. Safety & Trust Checklist

- [ ] URL reputation check on registration (Google Safe Browsing API)
- [ ] Content classification (screenshot → ML model or API)
- [ ] Per-site kill switch in admin console
- [ ] Drift crawl: weekly re-capture + screenshot diff
- [ ] Comment moderation only if public comments are introduced; baseline safety covers reporting, blocking and rapid takedown
- [ ] Report queue with response-time targets (<24h review)
- [ ] Rate limits: submissions, follows and reactions; extend if public comments are introduced
- [ ] Creator terms of service (ownership, takedown process)
- [ ] Privacy policy (what WebView loads expose)
- [ ] India data protection and intermediary rules review; GDPR review if serving EU users
- [ ] App store UGC requirements (reporting, blocking, moderation)
- [ ] Legal review before public launch

---

## 12. Key Metrics to Track

| Category | Metrics |
|----------|---------|
| **Viewers** | Cards/session, search/category use, skips, D1/D7/D30 retention, voluntary return, saves/collections/shares/reactions |
| **Website experience** | Live open rate, time to ready, load success/failure, external-browser opens, meaningful interaction rate |
| **Creators** | Sites submitted & active, unique visitors, meaningful interactions, creator return rate, second-site rate |
| **Hosting** | Free→paid conversion, gross margin per 1K views, abuse rate, chargeback rate |
| **Quality and safety** | Reports per 1K opens, time to takedown, blocked sites, crash rate, memory use, load failures |

An impression is a visible feed card. A website open is a ready live site shown to the viewer. A preview load is not a genuine visit; a meaningful interaction requires evidence such as a user action or creator-provided event. Do not treat dwell time alone as engagement.

---

## 13. Risks & Mitigations

| Risk | Mitigation | When to address |
|------|-----------|-----------------|
| WebView memory/jank on low-end Android | One active live site, explicit lifecycle, early release on memory pressure, long-session testing | Phase 0 |
| Readiness signal is misleading or never fires | Define app-ready checks, maximum loading window, timeout and fallback; test slow/heavy sites | Phase 0 |
| Gesture conflict feels broken | Site owns gestures when open; bottom Next arrow; test real experiences | Phase 0 |
| Cold start or repetitive feed | Permissioned high-quality seed, category variety, creator-led invites and curated sessions | Phase 0–1 |
| Viewers do not return | Test interest controls, search, collections and repeat-use patterns before scaling | Phase 0–2 |
| Creators see no value | Measure actual opens and meaningful interactions; provide useful analytics | Phase 0–1 |
| Bait-and-switch sites | Drift crawls, kill switch, verification | Phase 1 |
| Indie community AI backlash | Clear human-made / AI-assisted / AI-generated labels, creator explanation and viewer filters | Phase 1 |
| Bandwidth bills for hosting | Prepaid wallet, spend caps, static fallback | Phase 3 |
| Hosting abuse (phishing, spam) | Verification, upload scanning, tiered trust | Phase 3 |
| App store rejection | Read guidelines before building, ship moderation from alpha | Phase 1 |
| Hosting vendor lock-in | Own deploy interface, abstraction layer | Phase 3 |

---

## 14. Go-to-Market: First 30 Sites

Only list sites that their owners submitted and verified. Directories and communities are sources of creator leads, not permission to list sites.

**Where to find creators:**
- Neocities explore page
- Creative coding communities: OpenProcessing, Shadertoy, Dwitter
- Reddit: r/creativecoding, r/generative, r/webdev
- Twitter/Mastodon: #creativecoding, #generativeart
- IndieWeb community
- Personal network

**The pitch:**
- Founding-creator badge
- Early analytics (impressions, ready opens, useful interactions and load quality)
- Direct say in product direction
- Their work shown to an audience that cares
- Optional future hosting credits, only after distribution value is demonstrated

---

## 15. First 30 Days

### Week 1

1. Prototype the WebView lifecycle and load-ready rule: start loading on arrival; open at max(arrival + five seconds, app-ready time).
2. Add the bottom Next arrow and up-to-five-second outgoing-WebView retention; unload sooner under memory pressure.
3. Test on a low-end Android phone and record memory use and transition behaviour.
4. Draft manifest v0, the site safety checklist, and creator pitch; list 40–50 candidates and seek permission.

### Week 2

- Build a clickable prototype with 10–15 sites, Tier 0 poster previews and Tier 2 loading for selected partners.
- Begin creator outreach; obtain written permission from the first 10 site owners.
- Add basic search/category and collection flows.

### Week 3

- Test with 15–20 viewers and interview 10 creators.
- Observe readiness timing, skips, site interaction, saves, shares and return intent; test slow, failed and heavy sites.
- Decide whether to proceed, change direction or stop based on viewer, creator, performance and content evidence.

### Week 4

- If proceeding, finalize the closed-alpha backlog and budget.
- Draft terms, privacy policy and takedown process.
- Revisit product decisions that user and creator research can answer.

---

## 16. Open Questions

- [ ] App name: "Scroll" is a placeholder. Final name TBD.
- [ ] Product emphasis: continuous discovery feed, visual library, or a blend?
- [ ] Should a feed item represent a whole site, a particular experience/page, or both?
- [ ] Which first audience should lead: general curious viewers, designers, developers/makers, or people who like unusual web experiences?
- [ ] What team size and budget are available for the first release?
- [ ] What evidence would justify introducing public comments?
- [ ] What creator explanation should accompany AI disclosure?
- [ ] Select the low-end Android test device and define its memory/performance budget.
- [ ] Confirm Android SDK setup and local React Native build requirements before committing to the native app.

Company registration and payment-provider choice remain later decisions tied to whether hosting is validated.

---

*This plan is a living document. Update it as decisions are made and phases complete.*
