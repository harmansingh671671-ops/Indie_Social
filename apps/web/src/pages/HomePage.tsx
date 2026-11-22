import { useMemo } from 'react';
import { buildHomeFeed } from '../lib/feed';
import { useVisibleSites } from '../lib/siteHealth';
import { SiteGrid } from '../components/feed/SiteGrid';

export function HomePage() {
  const sites = useVisibleSites();
  const feed = useMemo(() => buildHomeFeed(sites), [sites]);

  return (
    <div className="page page--feed">
      <SiteGrid sites={feed} showMeta={false} />
    </div>
  );
}
