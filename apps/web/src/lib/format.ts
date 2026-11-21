export function formatCount(value: number): string {
  if (value >= 1_000_000) {
    return `${trim(value / 1_000_000)}M`;
  }
  if (value >= 1_000) {
    return `${trim(value / 1_000)}k`;
  }
  return String(value);
}

function trim(value: number): string {
  const rounded = value >= 100 ? Math.round(value) : Math.round(value * 10) / 10;
  return String(rounded).replace(/\.0$/, '');
}

export function formatRelativeDays(days: number): string {
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 14) return 'last week';
  if (days < 30) return `${Math.round(days / 7)} weeks ago`;
  if (days < 60) return 'last month';
  return `${Math.round(days / 30)} months ago`;
}

/** Deterministic, readable colour from a name — used for initials avatars. */
export function colourFromName(name: string): string {
  const palette = [
    '#4f46e5',
    '#c0392b',
    '#e67e22',
    '#b8860b',
    '#2e7d32',
    '#00897b',
    '#1565c0',
    '#5e35b1',
    '#8e24aa',
    '#ad1457',
    '#455a64',
    '#6d4c41',
  ];
  let hash = 0;
  for (let index = 0; index < name.length; index += 1) {
    hash = (hash * 31 + name.charCodeAt(index)) % 997;
  }
  return palette[hash % palette.length];
}

export function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function timeAgo(timestamp: number): string {
  const seconds = Math.max(1, Math.floor((Date.now() - timestamp) / 1000));
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

export function domainOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export function cn(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(' ');
}
