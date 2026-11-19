import type { Site } from '../types';
import { CATEGORIES } from '../data/sites';

/**
 * Round-robins the catalogue by category so the home feed never shows
 * six music sites in a row. Featured sites bubble up inside their category.
 */
export function buildHomeFeed(sites: Site[]): Site[] {
  const buckets = CATEGORIES.map((category) =>
    sites
      .filter((site) => site.category === category)
      .sort((a, b) => {
        if (Boolean(b.featured) !== Boolean(a.featured)) {
          return Number(Boolean(b.featured)) - Number(Boolean(a.featured));
        }
        return a.addedDaysAgo - b.addedDaysAgo;
      }),
  );

  const feed: Site[] = [];
  let index = 0;
  while (feed.length < sites.length) {
    let added = false;
    for (const bucket of buckets) {
      const site = bucket[index];
      if (site) {
        feed.push(site);
        added = true;
      }
    }
    if (!added) break;
    index += 1;
  }
  return feed;
}

export function searchSites(sites: Site[], query: string): Site[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];

  return sites
    .map((site) => ({ site, rank: scoreSite(site, needle) }))
    .filter((entry) => entry.rank > 0)
    .sort((a, b) => b.rank - a.rank)
    .map((entry) => entry.site);
}

function scoreSite(site: Site, needle: string): number {
  let score = 0;
  if (site.title.toLowerCase() === needle) score += 100;
  if (site.title.toLowerCase().startsWith(needle)) score += 40;
  if (site.title.toLowerCase().includes(needle)) score += 25;
  if (site.creator.toLowerCase().includes(needle)) score += 15;
  if (site.category.toLowerCase().includes(needle)) score += 12;
  if (site.description.toLowerCase().includes(needle)) score += 6;
  if (site.tags.some((tag) => tag.toLowerCase().includes(needle))) score += 10;
  return score;
}

export function relatedSites(site: Site, sites: Site[], limit = 12): Site[] {
  const sameCategory = sites.filter(
    (candidate) => candidate.id !== site.id && candidate.category === site.category,
  );
  const rest = sites.filter(
    (candidate) => candidate.id !== site.id && candidate.category !== site.category,
  );
  return [...sameCategory, ...rest].slice(0, limit);
}

export function filterByCategory(sites: Site[], category: string): Site[] {
  if (category === 'All') return sites;
  return sites.filter((site) => site.category === category);
}
