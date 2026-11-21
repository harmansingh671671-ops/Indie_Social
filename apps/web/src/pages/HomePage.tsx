import { SITES } from '../data/sites';
import { buildHomeFeed } from '../lib/feed';
import { SiteGrid } from '../components/feed/SiteGrid';

export function HomePage() {
  const feed = buildHomeFeed(SITES);

  return (
    <div className="page page--feed">
      <SiteGrid sites={feed} showMeta={false} />
    </div>
  );
}
