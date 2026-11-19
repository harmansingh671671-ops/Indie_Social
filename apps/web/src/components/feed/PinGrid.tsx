import type { Site } from '../../types';
import { PinCard } from './PinCard';
import { Masonry } from './Masonry';

export function PinGrid({ sites }: { sites: Site[] }) {
  return (
    <Masonry>
      {sites.map((site, index) => (
        <PinCard key={site.id} site={site} eager={index < 6} />
      ))}
    </Masonry>
  );
}
