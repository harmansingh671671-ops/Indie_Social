import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Compass, Layers } from 'lucide-react';
import { CATEGORIES, SITES } from '../data/sites';
import { useAppState } from '../state/AppState';
import { PageHeader } from '../components/layout/PageHeader';
import { PinGrid } from '../components/feed/PinGrid';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/common/Button';
import { posterFor } from '../lib/posters';
import { ROUTES } from '../config/site';
import { cn } from '../lib/format';
import type { Site } from '../types';

export function SavedPage() {
  const { savedIds } = useAppState();
  const [activeBoard, setActiveBoard] = useState('All');

  const savedSites = useMemo(
    () =>
      [...savedIds]
        .reverse()
        .map((id) => SITES.find((site) => site.id === id))
        .filter((site): site is Site => Boolean(site)),
    [savedIds],
  );

  const boards = useMemo(
    () =>
      CATEGORIES.map((category) => ({
        name: category,
        sites: savedSites.filter((site) => site.category === category),
      })).filter((board) => board.sites.length > 0),
    [savedSites],
  );

  const visible =
    activeBoard === 'All'
      ? savedSites
      : savedSites.filter((site) => site.category === activeBoard);

  return (
    <div className="page">
      <PageHeader
        eyebrow="Your collection"
        title="Saved"
        description={
          savedSites.length === 0
            ? 'Everything you save lands here, ready when you need it.'
            : `${savedSites.length} ${savedSites.length === 1 ? 'pin' : 'pins'} across ${boards.length} ${
                boards.length === 1 ? 'board' : 'boards'
              }.`
        }
        action={
          <Link to={ROUTES.explore}>
            <Button variant="light">
              <Compass size={16} /> Explore ideas
            </Button>
          </Link>
        }
      />

      {savedSites.length === 0 ? (
        <EmptyState
          icon={<Bookmark size={30} />}
          title="Nothing saved yet"
          body="Tap Save on any pin to keep it here. Your boards build themselves from what you collect."
          action={
            <Link to={ROUTES.explore}>
              <Button>Find something to save</Button>
            </Link>
          }
        />
      ) : (
        <>
          <section className="boards" aria-label="Your boards">
            <h2 className="section-title">
              <Layers size={18} /> Your boards
            </h2>
            <div className="boards__row">
              <button
                type="button"
                className={cn('board-card', activeBoard === 'All' && 'is-active')}
                onClick={() => setActiveBoard('All')}
              >
                <span
                  className={cn(
                    'board-card__preview',
                    `board-card__preview--${Math.min(3, savedSites.length)}`,
                  )}
                >
                  {savedSites.slice(0, 3).map((site) => (
                    <img key={site.id} src={posterFor(site, 220)} alt="" loading="lazy" />
                  ))}
                </span>
                <span className="board-card__name">All pins</span>
                <span className="board-card__count">{savedSites.length}</span>
              </button>

              {boards.map((board) => (
                <button
                  key={board.name}
                  type="button"
                  className={cn('board-card', activeBoard === board.name && 'is-active')}
                  onClick={() => setActiveBoard(board.name)}
                >
                  <span
                    className={cn(
                      'board-card__preview',
                      `board-card__preview--${Math.min(3, board.sites.length)}`,
                    )}
                  >
                    {board.sites.slice(0, 3).map((site) => (
                      <img key={site.id} src={posterFor(site, 220)} alt="" loading="lazy" />
                    ))}
                  </span>
                  <span className="board-card__name">{board.name}</span>
                  <span className="board-card__count">{board.sites.length}</span>
                </button>
              ))}
            </div>
          </section>

          <PinGrid sites={visible} />
        </>
      )}
    </div>
  );
}
