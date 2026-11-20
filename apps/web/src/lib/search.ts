import { CATEGORIES, SITES, TRENDING_TAGS } from '../data/sites';
import type { Site } from '../types';
import { readJSON, writeJSON } from './storage';

export type SuggestionKind =
  | 'recent'
  | 'trend'
  | 'search'
  | 'site'
  | 'creator'
  | 'category'
  | 'tag';

export interface Suggestion {
  id: string;
  label: string;
  detail?: string;
  /** The query that is run when the suggestion is picked. */
  term: string;
  kind: SuggestionKind;
  score: number;
}

const HISTORY_KEY = 'searchHistory';
const HISTORY_LIMIT = 8;

export function readSearchHistory(): string[] {
  return readJSON<string[]>(HISTORY_KEY, []);
}

export function rememberSearch(term: string): string[] {
  const query = term.trim();
  if (!query) return readSearchHistory();
  const next = [
    query,
    ...readSearchHistory().filter((item) => item.toLowerCase() !== query.toLowerCase()),
  ].slice(0, HISTORY_LIMIT);
  writeJSON(HISTORY_KEY, next);
  return next;
}

export function forgetSearch(term: string): string[] {
  const next = readSearchHistory().filter(
    (item) => item.toLowerCase() !== term.toLowerCase(),
  );
  writeJSON(HISTORY_KEY, next);
  return next;
}

export function clearSearchHistory(): [] {
  writeJSON(HISTORY_KEY, []);
  return [];
}

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

function editDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > 2) return 99;
  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    const current = [i];
    for (let j = 1; j <= b.length; j += 1) {
      current[j] = Math.min(
        current[j - 1] + 1,
        previous[j] + 1,
        previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    previous = current;
  }
  return previous[b.length];
}

/** Loose closeness score so a typo still returns the nearest sites. */
function closeness(text: string, query: string): number {
  const needle = normalize(query);
  const value = normalize(text);
  if (!needle || !value) return 0;
  if (value === needle) return 100;
  if (value.startsWith(needle)) return 85 - Math.min(10, value.length - needle.length);
  const words = value.split(/\s+/);
  if (words.some((word) => word.startsWith(needle))) return 70;
  if (value.includes(needle)) return 55;

  let matched = 0;
  for (const char of value) {
    if (char === needle[matched]) matched += 1;
  }
  if (matched === needle.length) return 35;

  for (const word of words) {
    if (word.length < 4) continue;
    const distance = editDistance(word, needle);
    if (distance <= 2) return 28 - distance * 5;
  }
  return 0;
}

function add(out: Suggestion[], suggestion: Suggestion): void {
  out.push(suggestion);
}

/**
 * YouTube-style suggestions: recent searches first, a "search for this" row,
 * then the closest sites, makers, categories and tags. Works after every key.
 */
export function getSuggestions(
  sites: Site[] = SITES,
  query: string,
  history: string[] = readSearchHistory(),
  limit = 8,
): Suggestion[] {
  const raw = query.trim();
  if (!raw) {
    const empty: Suggestion[] = [];
    history.slice(0, 4).forEach((term) =>
      add(empty, {
        id: `recent:${term}`,
        label: term,
        detail: 'Recent search',
        term,
        kind: 'recent',
        score: 200 - empty.length,
      }),
    );
    TRENDING_TAGS.slice(0, 6).forEach((tag) =>
      add(empty, {
        id: `trend:${tag}`,
        label: tag,
        detail: 'Trending on Scroll',
        term: tag,
        kind: 'trend',
        score: 100,
      }),
    );
    return empty.slice(0, limit);
  }

  const out: Suggestion[] = [];

  history.forEach((term) => {
    const score = closeness(term, raw);
    if (score > 0) {
      add(out, {
        id: `recent:${term}`,
        label: term,
        detail: 'Recent search',
        term,
        kind: 'recent',
        score: 200 + score,
      });
    }
  });

  add(out, {
    id: `search:${raw}`,
    label: raw,
    detail: 'Search for this',
    term: raw,
    kind: 'search',
    score: 180,
  });

  sites.forEach((site) => {
    const title = closeness(site.title, raw);
    const creator = closeness(site.creator, raw);
    const category = closeness(site.category, raw);
    const tags = Math.max(0, ...site.tags.map((tag) => closeness(tag, raw)));
    const description = closeness(site.description, raw);
    const best = Math.max(
      title * 1.2,
      creator * 0.9,
      category * 0.8,
      tags * 0.75,
      description * 0.5,
    );
    if (best > 0) {
      add(out, {
        id: `site:${site.id}`,
        label: site.title,
        detail: `${site.category} · ${site.creator}`,
        term: site.title,
        kind: 'site',
        score: Math.round(best),
      });
    }
  });

  CATEGORIES.forEach((category) => {
    const score = closeness(category, raw);
    if (score > 0) {
      add(out, {
        id: `category:${category}`,
        label: category,
        detail: 'Category',
        term: category,
        kind: 'category',
        score: Math.round(score * 0.8),
      });
    }
  });

  TRENDING_TAGS.forEach((tag) => {
    const score = closeness(tag, raw);
    if (score > 0) {
      add(out, {
        id: `tag:${tag}`,
        label: tag,
        detail: 'Tag',
        term: tag,
        kind: 'tag',
        score: Math.round(score * 0.7),
      });
    }
  });

  const seen = new Set<string>();
  return out
    .sort((a, b) => b.score - a.score)
    .filter((item) => {
      const key = `${item.kind}:${item.term.toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, limit);
}
