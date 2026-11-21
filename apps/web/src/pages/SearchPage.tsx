import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchX } from 'lucide-react';
import { CATEGORIES, SITES } from '../data/sites';
import { filterByCategory, searchSites } from '../lib/feed';
import { getSuggestions } from '../lib/search';
import { CategoryChips } from '../components/feed/CategoryChips';
import { SiteGrid } from '../components/feed/SiteGrid';
import { PageHeader } from '../components/layout/PageHeader';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/common/Button';
import { Link } from 'react-router-dom';
import { ROUTES } from '../config/site';

export function SearchPage() {
  const [params] = useSearchParams();
  const query = params.get('q') ?? '';
  const [category, setCategory] = useState('All');

  const results = useMemo(() => searchSites(SITES, query), [query]);
  const visible = useMemo(() => filterByCategory(results, category), [results, category]);
  const didYouMean = useMemo(() => {
    if (!query.trim() || results.length > 0) return undefined;
    return getSuggestions(SITES, query, [], 6).find((item) => item.kind !== 'search');
  }, [query, results.length]);

  return (
    <div className="page">
      <PageHeader
        eyebrow="Search"
        title={query ? `Results for “${query}”` : 'Search SiteHub'}
        description={
          query
            ? `${results.length} ${results.length === 1 ? 'site' : 'sites'} found`
            : 'Try a site name, a maker, or a feeling like “calm” or “chaos”.'
        }
      />

      {results.length > 0 && (
        <>
          <CategoryChips
            categories={['All', ...CATEGORIES]}
            active={category}
            onChange={setCategory}
            label="Filter search results"
          />
          <SiteGrid sites={visible} />
        </>
      )}

      {results.length === 0 && didYouMean && (
        <p className="did-you-mean">
          Did you mean{' '}
          <Link to={`${ROUTES.search}?q=${encodeURIComponent(didYouMean.term)}`}>
            {didYouMean.label}
          </Link>
          ?
        </p>
      )}

      {results.length === 0 && (
        <EmptyState
          icon={<SearchX size={30} />}
          title={query ? 'No sites matched that search' : 'What are you in the mood for?'}
          body={
            query
              ? 'Try a broader word — “art”, “music”, “space” — or explore the full catalogue.'
              : 'Search for an experience, a maker, or just browse everything the indie web has to offer.'
          }
          action={
            <Link to={ROUTES.explore}>
              <Button>Explore everything</Button>
            </Link>
          }
        />
      )}
    </div>
  );
}
