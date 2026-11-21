import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ArrowLeft,
  Bookmark,
  Check,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Flag,
  MoreHorizontal,
  Share2,
  Star,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { SITES } from '../data/sites';
import { buildHomeFeed } from '../lib/feed';
import { posterFor } from '../lib/posters';
import { copyText, openSite, siteLink } from '../lib/share';
import { formatCount } from '../lib/format';
import { useAppState } from '../state/AppState';
import type { Site } from '../types';
import { Avatar } from '../components/common/Avatar';
import { ActionMenu } from '../components/common/ActionMenu';
import { useToast } from '../components/common/Toast';

interface FeedEntry {
  site: Site;
  /** Stable across prepends/appends so the iframe for the current site never remounts. */
  uid: string;
}

type ScrollBehavior = 'auto' | 'smooth';

interface PendingScroll {
  target: number;
  /** Where the currently visible site lands after a cycle is prepended. */
  preserved?: number;
  behavior: ScrollBehavior;
}

/** Immersive full-screen vertical feed of fully interactive websites. */
export function EngagePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { isSaved, toggleSave, isLiked, toggleLike, isFollowing, toggleFollow } =
    useAppState();

  // All available sites, starting with the one the user tapped. No artificial limit.
  const feed = useMemo(() => {
    const ordered = buildHomeFeed(SITES);
    const index = ordered.findIndex((site) => site.id === id);
    return index < 0 ? ordered : [...ordered.slice(index), ...ordered.slice(0, index)];
  }, [id]);

  const [entries, setEntries] = useState<FeedEntry[]>(() =>
    feed.map((site) => ({ site, uid: `0:${site.id}` })),
  );
  const [active, setActive] = useState(0);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const cycleIdRef = useRef(0);
  const pendingRef = useRef<PendingScroll | null>(null);
  const targetRef = useRef(0);

  const makeCycle = useCallback(
    (): FeedEntry[] => {
      cycleIdRef.current += 1;
      const cycle = cycleIdRef.current;
      return feed.map((site) => ({ site, uid: `${cycle}:${site.id}` }));
    },
    [feed],
  );

  // A new starting site resets the stream to a single cycle.
  useEffect(() => {
    cycleIdRef.current = 0;
    pendingRef.current = null;
    targetRef.current = 0;
    setEntries(feed.map((site) => ({ site, uid: `0:${site.id}` })));
    setActive(0);
    const scroller = scrollerRef.current;
    if (scroller) scroller.scrollTop = 0;
  }, [feed]);

  // Apply a prepend (which shifts every index) before the browser paints.
  useLayoutEffect(() => {
    const pending = pendingRef.current;
    const scroller = scrollerRef.current;
    if (!pending || !scroller) return;
    pendingRef.current = null;
    if (pending.preserved !== undefined) {
      scroller.scrollTop = pending.preserved * scroller.clientHeight;
    }
    scroller.scrollTo({
      top: pending.target * scroller.clientHeight,
      behavior: pending.behavior,
    });
    targetRef.current = pending.target;
    setActive(pending.target);
  }, [entries]);

  // Keep one extra cycle buffered above and below so reaching either edge extends
  // the stream instead of jumping back to the beginning.
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return undefined;

    const onScroll = () => {
      if (pendingRef.current) return;
      const index = Math.round(scroller.scrollTop / scroller.clientHeight);
      setActive(index);

      if (index >= entries.length - 1) {
        const next = makeCycle();
        setEntries((current) => [...current, ...next]);
      } else if (index <= 0 && entries.length > feed.length) {
        const previous = makeCycle();
        pendingRef.current = {
          target: index + feed.length,
          preserved: index + feed.length,
          behavior: 'auto',
        };
        setEntries((current) => [...previous, ...current]);
      }
    };

    const onScrollEnd = () => {
      targetRef.current = Math.round(scroller.scrollTop / scroller.clientHeight);
    };

    scroller.addEventListener('scroll', onScroll, { passive: true });
    scroller.addEventListener('scrollend', onScrollEnd);
    return () => {
      scroller.removeEventListener('scroll', onScroll);
      scroller.removeEventListener('scrollend', onScrollEnd);
    };
  }, [entries, feed.length, makeCycle]);

  const goTo = (index: number) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    if (index < 0) {
      const previous = makeCycle();
      const target = index + feed.length;
      pendingRef.current = {
        target,
        preserved: active + feed.length,
        behavior: 'auto',
      };
      targetRef.current = target;
      setEntries((current) => [...previous, ...current]);
      return;
    }

    if (index >= entries.length) {
      const next = makeCycle();
      pendingRef.current = { target: index, behavior: 'auto' };
      targetRef.current = index;
      setEntries((current) => [...current, ...next]);
      return;
    }

    targetRef.current = index;
    scroller.scrollTo({
      top: index * scroller.clientHeight,
      behavior: 'auto',
    });
    setActive(index);
  };

  const step = (amount: number) => {
    goTo(targetRef.current + amount);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const direction =
        event.key === 'ArrowDown' || event.key === 'PageDown'
          ? 1
          : event.key === 'ArrowUp' || event.key === 'PageUp'
            ? -1
            : 0;
      if (!direction) return;
      event.preventDefault();
      step(direction);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  const share = async (url: string) => {
    const ok = await copyText(url);
    showToast(ok ? 'Link copied' : 'Could not copy the link');
  };

  return (
    <div className="engage">
      <div className="engage__scroller" ref={scrollerRef}>
        {entries.map((entry, index) => {
          const item = entry.site;
          // Only the current slide and its two neighbours load a real website.
          const distance = Math.abs(index - active);
          const loadWebsite = distance <= 2;
          const saved = isSaved(item.id);
          const liked = isLiked(item.id);
          const following = isFollowing(item.creatorHandle);

          return (
            <section className="engage__slide" key={entry.uid}>
              {loadWebsite ? (
                <iframe
                  className="engage__frame"
                  src={item.url}
                  title={`Interactive website: ${item.title}`}
                  inert={distance !== 0}
                  loading={distance <= 1 ? 'eager' : 'lazy'}
                  allow="autoplay; fullscreen; clipboard-read; clipboard-write; geolocation; microphone; camera; midi; serial; gamepad; xr-spatial-tracking"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                />
              ) : (
                <img className="engage__poster" src={posterFor(item)} alt="" />
              )}

              <div className="engage__meta">
                <div className="engage__creator">
                  <Avatar name={item.creator} size={32} />
                  <span className="engage__handle">@{item.creatorHandle}</span>
                  <button
                    type="button"
                    className="engage__follow"
                    onClick={() => {
                      const next = toggleFollow(item.creatorHandle);
                      showToast(next ? 'Following' : 'Unfollowed');
                    }}
                  >
                    {following ? 'Following' : 'Follow'}
                  </button>
                </div>
                <h1 className="engage__title">Untitled experience</h1>
              </div>

              <div className="engage__actions">
                <div className="engage__star">
                  <button
                    type="button"
                    className={`engage__action engage__action--star${liked ? ' is-liked' : ''}`}
                    aria-label={liked ? 'Unlike this site' : 'Like this site'}
                    aria-pressed={liked}
                    onClick={() => {
                      const next = toggleLike(item.id);
                      showToast(next ? 'Liked' : 'Like removed');
                    }}
                  >
                    <Star size={25} fill={liked ? 'currentColor' : 'none'} />
                  </button>
                  <span className="engage__star-count">
                    {formatCount(item.likes + (liked ? 1 : 0))}
                  </span>
                </div>

                <button
                  type="button"
                  className={`engage__action engage__action--save${saved ? ' is-saved' : ''}`}
                  aria-label="Save to your sites"
                  aria-pressed={saved}
                  onClick={() => {
                    const next = toggleSave(item.id);
                    showToast(next ? 'Saved to your sites' : 'Removed from saved sites');
                  }}
                >
                  {saved ? <Check size={24} /> : <Bookmark size={24} />}
                </button>
                <button
                  type="button"
                  className="engage__action"
                  aria-label="Share project"
                  onClick={() => share(siteLink(item))}
                >
                  <Share2 size={22} />
                </button>
                <ActionMenu
                  label="More options"
                  align="right"
                  direction="up"
                  iconVariant="light"
                  trigger={<MoreHorizontal size={22} />}
                  items={[
                    {
                      label: 'Open website',
                      icon: <ExternalLink size={17} />,
                      onSelect: () => openSite(item.url),
                    },
                    {
                      label: 'Report',
                      icon: <Flag size={17} />,
                      danger: true,
                      onSelect: () => showToast('Thanks — this site is queued for review'),
                    },
                  ]}
                />
                <button
                  type="button"
                  className="engage__visit"
                  onClick={() => openSite(item.url)}
                >
                  Visit site <ExternalLink size={15} />
                </button>
              </div>
            </section>
          );
        })}
      </div>

      <button type="button" className="engage__back" aria-label="Back" onClick={() => navigate(-1)}>
        <ArrowLeft size={20} />
      </button>

      <button
        type="button"
        className="engage__nav engage__nav--up"
        aria-label="Previous website"
        onClick={() => step(-1)}
      >
        <ChevronUp size={22} />
      </button>
      <button
        type="button"
        className="engage__nav engage__nav--down"
        aria-label="Next website"
        onClick={() => step(1)}
      >
        <ChevronDown size={22} />
      </button>
    </div>
  );
}
