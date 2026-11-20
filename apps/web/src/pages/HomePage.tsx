import { SITES } from '../data/sites';
import { buildHomeFeed } from '../lib/feed';
import { PinGrid } from '../components/feed/PinGrid';

export function HomePage() {
  const feed = buildHomeFeed(SITES);

  return (
    <div className="page page--feed">
      <PinGrid sites={feed} />
    </div>
  );
}
