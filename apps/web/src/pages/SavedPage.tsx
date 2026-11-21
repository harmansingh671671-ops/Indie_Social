import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Compass, Layers } from 'lucide-react';
import { CATEGORIES, SITES } from '../data/sites';
import { useAppState } from '../state/AppState';
import { PageHeader } from '../components/layout/PageHeader';
import { SiteGrid } from '../components/feed/SiteGrid';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/common/Button';
import { posterFor } from '../lib/posters';
import { ROUTES } from '../config/site';
import { cn } from '../lib/format';
import type { Site } from '../types';

export function SavedPage() {
  const { savedIds } = useAppState();
  const [activeCollection, setActiveCollection] = useState('All');

  const savedSites = useMemo(
    () =>
      [...savedIds]
        .reverse()
        .map((id) => SITES.find((site) => site.id === id))
        .filter((site): site is Site => Boolean(site)),
    [savedIds],
  );

  const collections = useMemo(
    () =>
      CATEGORIES.map((category) => ({
        name: category,
        sites: savedSites.filter((site) => site.category === category),
      })).filter((collection) => collection.sites.length > 0),
    [savedSites],
  );

  const visible =
    activeCollection === 'All'
      ? savedSites
      : savedSites.filter((site) => site.category === activeCollection);

  return (
    <div className="page">
      <PageHeader
        eyebrow="Your collection"
        title="Saved"
        description={
          savedSites.length === 0
            ? 'Everything you save lands here, ready when you need it.'
            : `${savedSites.length} ${savedSites.length === 1 ? 'site' : 'sites'} across ${collections.length} ${collections.length === 1 ? 'collection' : 'collections'}.`
        }
        action={
          <Link to={ROUTES.explore}>
            <Button variant="light">
              <Compass size={16} /> Explore sites
            </Button>
          </Link>
        }
      />

      {savedSites.length === 0 ? (
        <EmptyState
          icon={<Bookmark size={30} />}
          title="Nothing saved yet"
          body="Tap Save on any site to keep it here. Your collections build themselves from what you collect."
          action={
            <Link to={ROUTES.explore}>
              <Button>Find something to save</Button>
            </Link>
          }
        />
      ) : (
        <>
          <section className="collections" aria-label="Your collections">
            <h2 className="section-title">
              <Layers size={18} /> Your collections
            </h2>
            <div className="collections__row">
              <button
                type="button"
                className={cn('collection-card', activeCollection === 'All' && 'is-active')}
                onClick={() => setActiveCollection('All')}
              >
                <span
                  className={cn(
                    'collection-card__preview',
                    `collection-card__preview--${Math.min(3, savedSites.length)}`,
                  )}
                >
                  {savedSites.slice(0, 3).map((site) => (
                    <img key={site.id} src={posterFor(site, 220)} alt="" loading="lazy" />
                  ))}
                </span>
                <span className="collection-card__name">All sites</span>
                <span className="collection-card__count">{savedSites.length}</span>
              </button>

              {collections.map((collection) => (
                <button
                  key={collection.name}
                  type="button"
                  className={cn(
                    'collection-card',
                    activeCollection === collection.name && 'is-active',
                  )}
                  onClick={() => setActiveCollection(collection.name)}
                >
                  <span
                    className={cn(
                      'collection-card__preview',
                      `collection-card__preview--${Math.min(3, collection.sites.length)}`,
                    )}
                  >
                    {collection.sites.slice(0, 3).map((site) => (
                      <img key={site.id} src={posterFor(site, 220)} alt="" loading="lazy" />
                    ))}
                  </span>
                  <span className="collection-card__name">{collection.name}</span>
                  <span className="collection-card__count">{collection.sites.length}</span>
                </button>
              ))}
            </div>
          </section>

          <SiteGrid sites={visible} />
        </>
      )}
    </div>
  );
}
