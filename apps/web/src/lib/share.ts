import type { Site } from '../types';

export function siteLink(site: Site): string {
  return `${window.location.origin}/pin/${site.id}`;
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const field = document.createElement('textarea');
      field.value = text;
      field.setAttribute('readonly', '');
      field.style.position = 'fixed';
      field.style.opacity = '0';
      document.body.appendChild(field);
      field.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(field);
      return ok;
    } catch {
      return false;
    }
  }
}

export function openSite(url: string): void {
  window.open(url, '_blank', 'noopener,noreferrer');
}
