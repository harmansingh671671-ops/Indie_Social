import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  Bookmark,
  Check,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Flag,
  Heart,
  MoreHorizontal,
  Share2,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { SITES } from '../data/sites';
import { buildHomeFeed } from '../lib/feed';
import { posterFor } from '../lib/posters';
import { copyText, openSite, siteLink } from '../lib/share';
import { useAppState } from '../state/AppState';
import { Avatar } from '../components/common/Avatar';
import { ActionMenu } from '../components/common/ActionMenu';
import { useToast } from '../components/common/Toast';

/** Immersive full-screen vertical feed of fully interactive websites. */
export function EngagePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { isSaved, toggleSave, isFollowing, toggleFollow, toggleLike } = useAppState();

  // All available sites, starting with the one the user tapped. No artificial limit.
  const feed = useMemo(() => {
    const ordered = buildHomeFeed(SITES);
    const index = ordered.findIndex((site) => site.id === id);
    return index < 0 ? ordered : [...ordered.slice(index), ...ordered.slice(0, index)];
  }, [id]);

  const [active, setActive] = useState(0);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return undefined;
    const onScroll = () => {
      setActive(
        Math.min(feed.length - 1, Math.round(scroller.scrollTop / scroller.clientHeight)),
      );
    };
    scroller.addEventListener('scroll', onScroll, { passive: true });
    return () => scroller.removeEventListener('scroll', onScroll);
  }, [feed.length]);

  const goTo = (index: number) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const next = (index + feed.length) % feed.length;
    scroller.scrollTo({ top: next * scroller.clientHeight, behavior: 'smooth' });
    setActive(next);
  };

  const step = (amount: number) => goTo(active + amount);

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
        {feed.map((item, index) => {
          // Only the current slide and its two neighbours load a real website.
          const distance = Math.abs(index - active);
          const loadWebsite = distance <= 2;
          const saved = isSaved(item.id);
          const following = isFollowing(item.creatorHandle);

          return (
            <section className="engage__slide" key={item.id}>
              {loadWebsite ? (
                <iframe
                  className="engage__frame"
                  src={item.url}
                  title={`Interactive website: ${item.title}`}
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
                  <Avatar name={item.creator} size={28} />
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
                <button
                  type="button"
                  className={`engage__action engage__action--save${saved ? ' is-saved' : ''}`}
                  aria-label="Save to your pins"
                  aria-pressed={saved}
                  onClick={() => {
                    const next = toggleSave(item.id);
                    showToast(next ? 'Saved to your pins' : 'Removed from saved pins');
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
                  iconVariant="light"
                  trigger={
                    <span className="engage__action engage__action--static">
                      <MoreHorizontal size={22} />
                    </span>
                  }
                  items={[
                    {
                      label: 'Like this experience',
                      icon: <Heart size={17} />,
                      onSelect: () => {
                        const next = toggleLike(item.id);
                        showToast(next ? 'Liked' : 'Like removed');
                      },
                    },
                    {
                      label: 'Open website',
                      icon: <ExternalLink size={17} />,
                      onSelect: () => openSite(item.url),
                    },
                    {
                      label: 'Report',
                      icon: <Flag size={17} />,
                      danger: true,
                      onSelect: () => showToast('Thanks — this pin is queued for review'),
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
