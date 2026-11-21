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
  ExternalLink,
  Eye,
  EyeOff,
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
}

const NAV_ITEM_H = 40;

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
  const [chromeHidden, setChromeHidden] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const navigatorRef = useRef<HTMLDivElement>(null);
  const cycleIdRef = useRef(0);
  const pendingRef = useRef<PendingScroll | null>(null);
  const targetRef = useRef(0);
  const animatingRef = useRef(false);
  const navigatorSyncRef = useRef(false);
  const copyTimerRef = useRef<number | null>(null);
  const settleRef = useRef<{ top: number; until: number } | null>(null);
  const settleTimerRef = useRef<number | null>(null);

  const activeEntry = entries[active] ?? entries[0];
  const activeSite = activeEntry.site;
  const saved = isSaved(activeSite.id);
  const liked = isLiked(activeSite.id);
  const following = isFollowing(activeSite.creatorHandle);

  // Keep latest values reachable from listeners attached once.
  const activeRef = useRef(active);
  activeRef.current = active;
  const entriesRef = useRef(entries);
  entriesRef.current = entries;

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
    settleRef.current = null;
    targetRef.current = 0;
    setEntries(feed.map((site) => ({ site, uid: `0:${site.id}` })));
    setActive(0);
    const scroller = scrollerRef.current;
    if (scroller) scroller.scrollTop = 0;
  }, [feed]);

  // Animate by scrolling (not by transforming the scroller): CSS transforms on a
  // container of cross-origin iframes make them render dark until they repaint.
  const animateStep = useCallback((target: number) => {
    const scroller = scrollerRef.current;
    if (!scroller || animatingRef.current) return;

    const start = scroller.scrollTop;
    const end = target * scroller.clientHeight;
    const duration = 380;
    const startedAt = performance.now();
    animatingRef.current = true;
    scroller.style.scrollSnapType = 'none';

    const frame = (now: number) => {
      if (!animatingRef.current) return;
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      scroller.scrollTop = start + (end - start) * eased;
      if (progress < 1) {
        requestAnimationFrame(frame);
        return;
      }
      scroller.scrollTop = end;
      scroller.style.scrollSnapType = '';
      animatingRef.current = false;

      // Embedded sites can grab focus a moment later and scroll themselves into
      // view. Keep the requested slide in place during that short settle window.
      settleRef.current = { top: end, until: performance.now() + 800 };
      if (settleTimerRef.current) window.clearTimeout(settleTimerRef.current);
      settleTimerRef.current = window.setTimeout(() => {
        settleRef.current = null;
        settleTimerRef.current = null;
      }, 820);
    };

    requestAnimationFrame(frame);
  }, []);

  useEffect(
    () => () => {
      if (copyTimerRef.current) window.clearTimeout(copyTimerRef.current);
      if (settleTimerRef.current) window.clearTimeout(settleTimerRef.current);
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
    animateStep(pending.target);
  }, [entries, animateStep]);

  // Keep one extra cycle buffered above and below so reaching either edge extends
  // the stream instead of jumping back to the beginning.
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return undefined;

    const onFocusIn = (event: FocusEvent) => {
      const settle = settleRef.current;
      const target = event.target as HTMLElement | null;
      if (!settle || performance.now() >= settle.until || target?.tagName !== 'IFRAME') return;
      target.blur();
      scroller.scrollTop = settle.top;
    };

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
        };
        setEntries((current) => [...previous, ...current]);
      }
    };

    const onScrollEnd = () => {
      targetRef.current = Math.round(scroller.scrollTop / scroller.clientHeight);
    };

    scroller.addEventListener('scroll', onScroll, { passive: true });
    scroller.addEventListener('scrollend', onScrollEnd);
    scroller.addEventListener('focusin', onFocusIn);
    return () => {
      scroller.removeEventListener('scroll', onScroll);
      scroller.removeEventListener('scrollend', onScrollEnd);
      scroller.removeEventListener('focusin', onFocusIn);
    };
  }, [entries, feed.length, makeCycle]);

  const goTo = (index: number) => {
    if (animatingRef.current || !scrollerRef.current) return;

    if (index < 0) {
      const previous = makeCycle();
      const target = index + feed.length;
      pendingRef.current = {
        target,
        preserved: active + feed.length,
      };
      targetRef.current = target;
      setEntries((current) => [...previous, ...current]);
      return;
    }

    if (index >= entries.length) {
      const next = makeCycle();
      pendingRef.current = { target: index };
      targetRef.current = index;
      setEntries((current) => [...current, ...next]);
      return;
    }

    targetRef.current = index;
    setActive(index);
    animateStep(index);
  };
  const goToRef = useRef(goTo);
  goToRef.current = goTo;

  const step = (amount: number) => goTo(targetRef.current + amount);

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

  // Keep the thumbnail navigator centred on the active website.
  useEffect(() => {
    const strip = navigatorRef.current;
    if (!strip) return undefined;
    navigatorSyncRef.current = true;
    strip.scrollTo({ top: active * NAV_ITEM_H, behavior: 'smooth' });
    const timer = window.setTimeout(() => {
      navigatorSyncRef.current = false;
    }, 400);
    return () => window.clearTimeout(timer);
  }, [active, entries.length, chromeHidden]);

  // Let the navigator drive the feed when the user scrolls or flings it.
  useEffect(() => {
    const strip = navigatorRef.current;
    if (!strip) return undefined;
    const onEnd = () => {
      if (navigatorSyncRef.current) return;
      const index = Math.round(strip.scrollTop / NAV_ITEM_H);
      const list = entriesRef.current;
      if (index >= 0 && index < list.length && index !== activeRef.current) {
        goToRef.current(index);
      }
    };
    strip.addEventListener('scrollend', onEnd);
    return () => strip.removeEventListener('scrollend', onEnd);
  }, [chromeHidden]);

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
        {entries.map((entry) => (
          <section className="engage__slide" key={entry.uid}>
            {Math.abs(entries.indexOf(entry) - active) <= 2 ? (
              <iframe
                className="engage__frame"
                src={entry.site.url}
                title={`Interactive website: ${entry.site.title}`}
                inert={Math.abs(entries.indexOf(entry) - active) !== 0}
                loading={Math.abs(entries.indexOf(entry) - active) <= 1 ? 'eager' : 'lazy'}
                allow="autoplay; fullscreen; clipboard-read; clipboard-write; geolocation; microphone; camera; midi; serial; gamepad; xr-spatial-tracking"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : (
              <img className="engage__poster" src={posterFor(entry.site)} alt="" />
            )}
          </section>
        ))}
      </div>

      {!chromeHidden && (
        <>
          <div className="engage__meta">
            <div className="engage__creator">
              <Avatar name={activeSite.creator} size={32} />
              <span className="engage__handle">@{activeSite.creatorHandle}</span>
              <button
                type="button"
                className="engage__follow"
                onClick={(event) => {
                  toggleFollow(activeSite.creatorHandle);
                  pop(event.currentTarget);
                }}
              >
                {following ? 'Following' : 'Follow'}
              </button>
            </div>
            <h1 className="engage__title">Untitled experience</h1>
          </div>

          <div className="engage__rail">
            <div className="engage__navigator" ref={navigatorRef} aria-label="Website navigator">
              {entries.map((entry, index) => (
                <button
                  key={entry.uid}
                  type="button"
                  className={`engage__nav-item${index === active ? ' is-current' : ''}`}
                  aria-label={`Go to ${entry.site.title}`}
                  onClick={() => goTo(index)}
                >
                  <img src={posterFor(entry.site, 96)} alt="" />
                </button>
              ))}
            </div>

            <div className="engage__actions">
              <div className="engage__tool">
                <button
                  type="button"
                  className="engage__action"
                  aria-label={liked ? 'Unlike this site' : 'Like this site'}
                  aria-pressed={liked}
                  onClick={() => toggleLike(activeSite.id)}
                >
                  <span className="engage__icon-swap" key={liked ? 'liked' : 'like'}>
                    <Star size={23} fill={liked ? 'currentColor' : 'none'} />
                  </span>
                </button>
                <span className="engage__tool-label">
                  {formatCount(activeSite.likes + (liked ? 1 : 0))}
                </span>
              </div>

              <div className="engage__tool">
                <button
                  type="button"
                  className="engage__action"
                  aria-label="Save to your sites"
                  aria-pressed={saved}
                  onClick={(event) => {
                    toggleSave(activeSite.id);
                    pop(event.currentTarget);
                  }}
                >
                  <span className="engage__icon-swap" key={saved ? 'saved' : 'save'}>
                    {saved ? <Check size={23} /> : <Bookmark size={23} />}
                  </span>
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
                    void share(siteLink(activeSite), activeEntry.uid);
                  }}
                >
                  <span
                    className="engage__icon-swap"
                    key={copiedUid === activeEntry.uid ? 'copied' : 'share'}
                  >
                    {copiedUid === activeEntry.uid ? <Check size={23} /> : <Share2 size={23} />}
                  </span>
                </button>
                <span className="engage__tool-label">
                  {copiedUid === activeEntry.uid ? 'Copied' : 'Share'}
                </span>
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
                      onSelect: () => openSite(activeSite.url),
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
                  onClick={() => openSite(activeSite.url)}
                >
                  <ExternalLink size={23} />
                </button>
                <span className="engage__tool-label">Visit</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="engage__back"
            aria-label="Back"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={20} />
          </button>
        </>
      )}

      <button
        type="button"
        className="engage__hide"
        aria-label={chromeHidden ? 'Show controls' : 'Hide controls'}
        aria-pressed={chromeHidden}
        onClick={() => setChromeHidden((value) => !value)}
      >
        {chromeHidden ? <Eye size={19} /> : <EyeOff size={19} />}
      </button>
    </div>
  );
}
