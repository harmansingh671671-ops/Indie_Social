import type { Site } from '../../types';
import { SiteCard } from './SiteCard';
import { Masonry } from './Masonry';

interface SiteGridProps {
  sites: Site[];
  showMeta?: boolean;
}

export function SiteGrid({ sites, showMeta = true }: SiteGridProps) {
  return (
    <Masonry>
      {sites.map((site, index) => (
        <SiteCard key={site.id} site={site} eager={index < 6} showMeta={showMeta} />
      ))}
    </Masonry>
  );
}
