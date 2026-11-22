/**
 * Website health-check tuning.
 *
 * Checks run in the background, one at a time, only while the tab is visible and
 * the device is online. Results are stored in `localStorage` and used to hide
 * sites that currently fail to load.
 */
export const healthConfig = {
  /** Re-check a site every hour while its result keeps changing. */
  checkIntervalMs: 60 * 60 * 1000,
  /** Identical results needed before the slower interval takes over. */
  stableStreak: 3,
  /** Re-check a stable site once a day. */
  stableIntervalMs: 24 * 60 * 60 * 1000,
  /** Give up on a single request after this long. */
  probeTimeoutMs: 12_000,
  /** Let the first paint settle before touching the network. */
  startDelayMs: 3_000,
  /** Gap between checks so probing never competes with the page. */
  idleGapMs: 4_000,
} as const;
