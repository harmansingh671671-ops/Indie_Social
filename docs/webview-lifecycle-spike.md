# WebView Lifecycle Spike

## Goal

Validate the core transition before building the wider app: a live site begins loading when its item becomes active, and opens only after both the five-second minimum review period and the app-ready signal have occurred.

## State model

`review_loading` → `open` → `retained` → `destroyed`

- On arrival, show the captured poster and start the live WebView load.
- Track arrival with a monotonic clock. Do not use wall-clock time for the five-second interval.
- Enter `open` when `now >= arrivedAt + 5 seconds` and the current WebView reports app-ready.
- If ready comes first, remain in the review state until the five-second minimum elapses.
- If the five-second minimum comes first, remain in review and open as soon as app-ready arrives.
- If readiness does not arrive before a configurable timeout, keep the poster visible and offer Retry, Skip and Open in browser.
- In open mode, the website owns its gestures. A persistent bottom Next arrow advances the feed.
- On Next, retain the outgoing WebView for at most five seconds. Destroy sooner under memory pressure, app backgrounding or safety intervention.
- Ignore callbacks from any WebView that is no longer the active item. On destruction, stop loading and release timers, listeners, media and references.

## Readiness policy to prototype

Do not wait for network idle. Start with a document-ready signal plus a small app-defined visual/content readiness check. A creator-provided manifest hint may help identify the main content but cannot override the app's timeout or safety policy.

## Spike scenarios

1. Site is ready in two seconds: open at five seconds from arrival.
2. Site is ready in eight seconds: open immediately at eight seconds.
3. Site never becomes ready: show timeout actions; never leave the viewer stuck.
4. Viewer taps Next repeatedly: only one active WebView; old callbacks cannot open a newer item.
5. Memory pressure occurs during retention: destroy immediately and keep the feed responsive.
6. Site has canvas, drag, or its own scrolling: verify the site keeps touch gestures after opening; Next remains a separate control.

## Device validation

Run on a low-end Android device. Record device/model, Android version, memory before and after repeated transitions, time-to-ready, open timing, jank, crashes and whether early cleanup occurred. Exercise at least 50 transitions. Choose the actual target device and acceptable memory budget before treating results as a go/no-go.

## First implementation sequence

1. Build the arrival/readiness/timer state handling with stale-callback protection.
2. Add one active React Native WebView and a static poster fallback.
3. Add the bottom Next control and five-second maximum retention timer.
4. Add timeout/retry/skip/external-browser actions.
5. Measure on-device memory and transition behaviour before considering any WebView pool.
