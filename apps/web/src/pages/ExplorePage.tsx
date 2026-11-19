import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownWideNarrow, Flame } from 'lucide-react';
import { CATEGORIES, SITES, TRENDING_TAGS } from '../data/sites';
import { filterByCategory } from '../lib/feed';
import { CategoryChips } from '../components/feed/CategoryChips';
import { PinGrid } from '../components/feed/PinGrid';
import { PageHeader } from '../components/layout/PageHeader';
import { ROUTES } from '../config/site';
import { cn } from '../lib/format';

type SortMode = 'popular' | 'newest';

export function ExplorePage() {
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState<SortMode>('popular');

  const visible = useMemo(() => {
    const filtered = filterByCategory(SITES, category);
    return [...filtered].sort((a, b) =>
      sort === 'popular' ? b.likes - a.likes : a.addedDaysAgo - b.addedDaysAgo,
    );
  }, [category, sort]);

  return (
    <div className="page">
      <PageHeader
        eyebrow="Find something new"
        title="Explore"
        description="Interactive toys, generative art and beautiful corners of the indie web."
        action={
          <div className="sort-toggle" role="group" aria-label="Sort sites">
            <button
              type="button"
              className={cn('sort-toggle__btn', sort === 'popular' && 'is-active')}
              aria-pressed={sort === 'popular'}
              onClick={() => setSort('popular')}
            >
              <Flame size={15} /> Popular
            </button>
            <button
              type="button"
              className={cn('sort-toggle__btn', sort === 'newest' && 'is-active')}
              aria-pressed={sort === 'newest'}
              onClick={() => setSort('newest')}
            >
              <ArrowDownWideNarrow size={15} /> Newest
            </button>
          </div>
        }
      />

      <div className="trending" aria-label="Trending searches">
        <span className="trending__label">Trending</span>
        {TRENDING_TAGS.map((tag) => (
          <Link key={tag} to={`${ROUTES.search}?q=${encodeURIComponent(tag)}`} className="trending__tag">
            {tag}
          </Link>
        ))}
      </div>

      <CategoryChips
        categories={['All', ...CATEGORIES]}
        active={category}
        onChange={setCategory}
      />
      <PinGrid sites={visible} />
    </div>
  );
}
