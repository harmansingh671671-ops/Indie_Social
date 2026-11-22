import { useMemo, useSyncExternalStore } from 'react';
import { healthConfig } from '../config/health';
import { EMBED_STATUS } from '../data/embedStatus';
import { SITES } from '../data/sites';
import { readJSON, writeJSON } from './storage';
import type { Site } from '../types';

/**
 * Background website health checks.
 *
 * - The build-time header scan (`data/embedStatus.ts`) hides sites that forbid
 *   framing, because JavaScript cannot read that cross-origin.
 * - At runtime a lightweight `fetch(no-cors)` proves the host is reachable.
 *   Checks are sequential, start after the first paint, pause while the tab is
 *   hidden or the device is offline, and back off to once a day after three
 *   identical results.
 * - Anything currently failing is hidden from every page.
 */

export type SiteHealthStatus = 'ok' | 'down';

export interface SiteHealthRecord {
  status: SiteHealthStatus;
  /** Consecutive identical results. */
  streak: number;
  checkedAt: number;
  nextAt: number;
  reason?: string;
}

interface StoredHealth {
  version: 1;
  records: Record<string, SiteHealthRecord>;
}

const STORAGE_KEY = 'health';
const EMPTY: StoredHealth = { version: 1, records: {} };

/** Sites the header scan already knows cannot be framed. */
const HEADER_BLOCKED = new Set(
  Object.entries(EMBED_STATUS)
    .filter(([, status]) => !status.embeddable)
    .map(([id]) => id),
);

const SITE_IDS = new Set(SITES.map((site) => site.id));

function load(): Record<string, SiteHealthRecord> {
  const stored = readJSON<StoredHealth>(STORAGE_KEY, EMPTY);
  const records: Record<string, SiteHealthRecord> = {};
  if (!stored || stored.version !== 1 || typeof stored.records !== 'object') {
    return records;
  }
  for (const [id, record] of Object.entries(stored.records)) {
    if (!SITE_IDS.has(id)) continue;
    if (record?.status !== 'ok' && record?.status !== 'down') continue;
    if (
      typeof record.streak !== 'number' ||
      typeof record.checkedAt !== 'number' ||
      typeof record.nextAt !== 'number'
    ) {
      continue;
    }
    records[id] = record;
  }
  return records;
}

let records: Record<string, SiteHealthRecord> = load();
const listeners = new Set<() => void>();
let running = false;
let timer: number | null = null;
let probing = false;

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getRecords() {
  return records;
}

function saveRecord(id: string, record: SiteHealthRecord) {
  records = { ...records, [id]: record };
  writeJSON<StoredHealth>(STORAGE_KEY, { version: 1, records });
  emit();
}

interface NetworkInformation {
  saveData?: boolean;
  effectiveType?: string;
}

function connection(): NetworkInformation | undefined {
  return (navigator as Navigator & { connection?: NetworkInformation }).connection;
}

function shouldWait(): boolean {
  if (document.hidden) return true;
  if (!navigator.onLine) return true;
  const net = connection();
  if (net?.saveData) return true;
  return net?.effectiveType === 'slow-2g' || net?.effectiveType === '2g';
}

/**
 * A cross-origin iframe cannot tell a working site from a blocked or missing
 * one (Chrome fires `load` for all of them), so reachability is measured with
 * an opaque request. The body is cancelled as soon as the headers arrive.
 */
function probe(url: string): Promise<{ status: SiteHealthStatus; reason?: string }> {
  const controller = new AbortController();
  const timerId = window.setTimeout(
    () => controller.abort(),
    healthConfig.probeTimeoutMs,
  );

  return fetch(url, {
    mode: 'no-cors',
    cache: 'no-store',
    credentials: 'omit',
    redirect: 'follow',
    signal: controller.signal,
  })
    .then(() => {
      // Headers arrived; stop downloading the rest of the page.
      controller.abort();
      return { status: 'ok' as const };
    })
    .catch(() => ({
      status: 'down' as const,
      reason: controller.signal.aborted ? 'timeout' : 'unreachable',
    }))
    .finally(() => window.clearTimeout(timerId));
}

function nextCandidate(): { site: Site; dueAt: number } | null {
  let best: { site: Site; dueAt: number } | null = null;
  for (const site of SITES) {
    if (HEADER_BLOCKED.has(site.id)) continue;
    const dueAt = records[site.id]?.nextAt ?? 0;
    if (!best || dueAt < best.dueAt) best = { site, dueAt };
  }
  return best;
}

async function check(site: Site) {
  probing = true;
  const result = await probe(site.url);
  probing = false;

  if (!running) return;
  // Never blame a site for the device losing its connection mid-check.
  if (!navigator.onLine) {
    schedule(healthConfig.checkIntervalMs);
    return;
  }

  const previous = records[site.id];
  const streak = previous?.status === result.status ? previous.streak + 1 : 1;
  const interval =
    streak >= healthConfig.stableStreak
      ? healthConfig.stableIntervalMs
      : healthConfig.checkIntervalMs;

  const now = Date.now();
  saveRecord(site.id, {
    status: result.status,
    streak,
    checkedAt: now,
    nextAt: now + interval,
    reason: result.reason,
  });

  schedule(healthConfig.idleGapMs);
}

function tick() {
  timer = null;
  if (!running || probing) return;
  if (shouldWait()) return; // visibilitychange / online wake us again

  const candidate = nextCandidate();
  if (!candidate) return;

  const delay = candidate.dueAt - Date.now();
  if (delay > 0) {
    schedule(delay);
    return;
  }
  void check(candidate.site);
}

function schedule(delay: number) {
  if (!running) return;
  if (timer !== null) window.clearTimeout(timer);
  timer = window.setTimeout(tick, Math.max(0, delay));
}

/** Starts the background checker. Safe to call more than once. */
export function startSiteHealth(): () => void {
  if (running) return () => {};
  running = true;

  const wake = () => schedule(healthConfig.startDelayMs / 3);
  const onVisibility = () => {
    if (!document.hidden) wake();
  };

  document.addEventListener('visibilitychange', onVisibility);
  window.addEventListener('online', wake);
  schedule(healthConfig.startDelayMs);

  return () => {
    running = false;
    if (timer !== null) window.clearTimeout(timer);
    timer = null;
    document.removeEventListener('visibilitychange', onVisibility);
    window.removeEventListener('online', wake);
  };
}

/** IDs hidden because of the header scan or a failing runtime check. */
export function useHiddenSiteIds(): ReadonlySet<string> {
  const snapshot = useSyncExternalStore(subscribe, getRecords);
  return useMemo(() => {
    const hidden = new Set(HEADER_BLOCKED);
    for (const [id, record] of Object.entries(snapshot)) {
      if (record.status === 'down') hidden.add(id);
    }
    return hidden;
  }, [snapshot]);
}

/** The catalogue minus hidden sites, used by every page. */
export function useVisibleSites(): Site[] {
  const hidden = useHiddenSiteIds();
  return useMemo(() => {
    const visible = SITES.filter((site) => !hidden.has(site.id));
    // Never empty the whole app if a burst of checks fails at once.
    return visible.length > 0 ? visible : SITES;
  }, [hidden]);
}
