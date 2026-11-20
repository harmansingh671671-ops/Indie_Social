import type { Site } from '../../types';
import { PinCard } from './PinCard';
import { Masonry } from './Masonry';

interface PinGridProps {
  sites: Site[];
  showMeta?: boolean;
}

export function PinGrid({ sites, showMeta = true }: PinGridProps) {
  return (
    <Masonry>
      {sites.map((site, index) => (
        <PinCard key={site.id} site={site} eager={index < 6} showMeta={showMeta} />
      ))}
    </Masonry>
  );
}
