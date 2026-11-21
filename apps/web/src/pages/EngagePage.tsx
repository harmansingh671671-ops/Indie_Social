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

interface FeedEntry {
  site: Site;
  /** Stable across prepends/appends so the iframe for the current site never remounts. */
  uid: string;
}

interface PendingScroll {
  target: number;
  /** Where the currently visible site lands after a cycle is prepended. */
  preserved?: number;
  direction: 1 | -1;
}

/** Immersive full-screen vertical feed of fully interactive websites. */
export function EngagePage() {
  const { id } = useParams();
  const navigate = useNavigate();
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
  const [copiedUid, setCopiedUid] = useState<string | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const cycleIdRef = useRef(0);
  const pendingRef = useRef<PendingScroll | null>(null);
  const targetRef = useRef(0);
  const animatingRef = useRef(false);
  const animatingTimerRef = useRef<number | null>(null);
  const copyTimerRef = useRef<number | null>(null);

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

  // Slide the scroller instead of jumping: translate it by one viewport, then
  // commit the new scrollTop while the transform hides the swap.
  const animateStep = useCallback((direction: 1 | -1, commit: () => void) => {
    const scroller = scrollerRef.current;
    if (!scroller || animatingRef.current) return;
    animatingRef.current = true;
    scroller.style.transition = 'none';
    scroller.style.transform = 'translateY(0)';
    void scroller.offsetHeight;

    requestAnimationFrame(() => {
      scroller.style.transition = 'transform 0.38s cubic-bezier(0.2, 0.7, 0.3, 1)';
      scroller.style.transform = `translateY(${direction > 0 ? '-100%' : '100%'})`;
    });

    if (animatingTimerRef.current) window.clearTimeout(animatingTimerRef.current);
    animatingTimerRef.current = window.setTimeout(() => {
      commit();
      scroller.style.transition = 'none';
      scroller.style.transform = 'translateY(0)';
      void scroller.offsetHeight;
      scroller.style.transition = '';
      scroller.style.transform = '';
      animatingRef.current = false;
      animatingTimerRef.current = null;
    }, 400);
  }, []);

  useEffect(
    () => () => {
      if (animatingTimerRef.current) window.clearTimeout(animatingTimerRef.current);
      if (copyTimerRef.current) window.clearTimeout(copyTimerRef.current);
    },
    [],
  );

  // Apply a prepend (which shifts every index) before the browser paints.
  useLayoutEffect(() => {
    const pending = pendingRef.current;
    const scroller = scrollerRef.current;
    if (!pending || !scroller) return;
    pendingRef.current = null;
    if (pending.preserved !== undefined) {
      scroller.scrollTop = pending.preserved * scroller.clientHeight;
    }
    targetRef.current = pending.target;
    setActive(pending.target);
    animateStep(pending.direction, () => {
      scroller.scrollTop = pending.target * scroller.clientHeight;
    });
  }, [entries, animateStep]);

  // Keep one extra cycle buffered above and below so reaching either edge extends
  // the stream instead of jumping back to the beginning.
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return undefined;

    const onScroll = () => {
      if (pendingRef.current || animatingRef.current) return;
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
          direction: -1,
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

  const goTo = (index: number, direction: 1 | -1) => {
    const scroller = scrollerRef.current;
    if (!scroller || animatingRef.current) return;

    if (index < 0) {
      const previous = makeCycle();
      const target = index + feed.length;
      pendingRef.current = {
        target,
        preserved: active + feed.length,
        direction,
      };
      targetRef.current = target;
      setEntries((current) => [...previous, ...current]);
      return;
    }

    if (index >= entries.length) {
      const next = makeCycle();
      pendingRef.current = { target: index, direction };
      targetRef.current = index;
      setEntries((current) => [...current, ...next]);
      return;
    }

    targetRef.current = index;
    setActive(index);
    animateStep(direction, () => {
      scroller.scrollTop = index * scroller.clientHeight;
    });
  };

  const step = (amount: number) => {
    goTo(targetRef.current + amount, amount > 0 ? 1 : -1);
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

  const pop = (element: HTMLElement) => {
    element.classList.remove('is-popping');
    void element.offsetWidth;
    element.classList.add('is-popping');
  };

  const share = async (url: string, uid: string) => {
    const ok = await copyText(url);
    if (!ok) return;
    setCopiedUid(uid);
    if (copyTimerRef.current) window.clearTimeout(copyTimerRef.current);
    copyTimerRef.current = window.setTimeout(() => setCopiedUid(null), 1600);
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
                    onClick={(event) => {
                      toggleFollow(item.creatorHandle);
                      pop(event.currentTarget);
                    }}
                  >
                    {following ? 'Following' : 'Follow'}
                  </button>
                </div>
                <h1 className="engage__title">Untitled experience</h1>
              </div>

              <div className="engage__actions">
                <div className="engage__tool">
                  <button
                    type="button"
                    className="engage__action"
                    aria-label={liked ? 'Unlike this site' : 'Like this site'}
                    aria-pressed={liked}
                    onClick={(event) => {
                      toggleLike(item.id);
                      pop(event.currentTarget);
                    }}
                  >
                    <Star size={23} fill={liked ? 'currentColor' : 'none'} />
                  </button>
                  <span className="engage__tool-label">
                    {formatCount(item.likes + (liked ? 1 : 0))}
                  </span>
                </div>

                <div className="engage__tool">
                  <button
                    type="button"
                    className="engage__action"
                    aria-label="Save to your sites"
                    aria-pressed={saved}
                    onClick={(event) => {
                      toggleSave(item.id);
                      pop(event.currentTarget);
                    }}
                  >
                    {saved ? <Check size={23} /> : <Bookmark size={23} />}
                  </button>
                  <span className="engage__tool-label">{saved ? 'Saved' : 'Save'}</span>
                </div>

                <div className="engage__tool">
                  <button
                    type="button"
                    className="engage__action"
                    aria-label="Share site"
                    onClick={(event) => {
                      pop(event.currentTarget);
                      void share(siteLink(item), entry.uid);
                    }}
                  >
                    <span className="engage__icon-swap" key={copiedUid === entry.uid ? 'copied' : 'share'}>
                      {copiedUid === entry.uid ? <Check size={23} /> : <Share2 size={23} />}
                    </span>
                  </button>
                  <span className="engage__tool-label">Share</span>
                </div>

                <div className="engage__tool">
                  <ActionMenu
                    label="More options"
                    align="right"
                    direction="up"
                    iconVariant="light"
                    trigger={<MoreHorizontal size={23} />}
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
                        onSelect: () => undefined,
                      },
                    ]}
                  />
                  <span className="engage__tool-label">More</span>
                </div>

                <div className="engage__tool">
                  <button
                    type="button"
                    className="engage__action"
                    aria-label="Visit website"
                    onClick={() => openSite(item.url)}
                  >
                    <ExternalLink size={23} />
                  </button>
                  <span className="engage__tool-label">Visit</span>
                </div>
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
