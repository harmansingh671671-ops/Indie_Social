import { useMemo, useState } from 'react';
import { CATEGORIES, SITES } from '../data/sites';
import { filterByCategory } from '../lib/feed';
import { CategoryChips } from '../components/feed/CategoryChips';
import { PinGrid } from '../components/feed/PinGrid';
import { PageHeader } from '../components/layout/PageHeader';

export function ExplorePage() {
  const [category, setCategory] = useState('All');
  const visible = useMemo(() => filterByCategory(SITES, category), [category]);

  return (
    <div className="page">
      <PageHeader title="Explore" />
      <CategoryChips
        categories={['All', ...CATEGORIES]}
        active={category}
        onChange={setCategory}
      />
      <PinGrid sites={visible} />
    </div>
  );
}
