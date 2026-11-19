import { useMemo, useState } from 'react';
import { CATEGORIES, SITES } from '../data/sites';
import { buildHomeFeed, filterByCategory } from '../lib/feed';
import { CategoryChips } from '../components/feed/CategoryChips';
import { PinGrid } from '../components/feed/PinGrid';

export function HomePage() {
  const [category, setCategory] = useState('All');
  const feed = useMemo(() => buildHomeFeed(SITES), []);
  const visible = useMemo(() => filterByCategory(feed, category), [feed, category]);

  return (
    <div className="page page--feed">
      <CategoryChips
        categories={['All', ...CATEGORIES]}
        active={category}
        onChange={setCategory}
        label="Filter your home feed"
      />
      <PinGrid sites={visible} />
    </div>
  );
}
