import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  Bookmark,
  Check,
  ChevronsUp,
  ExternalLink,
  Flag,
  Heart,
  MoreHorizontal,
  Share2,
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { SITES } from '../data/sites';
import { buildHomeFeed } from '../lib/feed';
import { posterFor } from '../lib/posters';
import { copyText, openSite, siteLink } from '../lib/share';
import { useAppState } from '../state/AppState';
import { Avatar } from '../components/common/Avatar';
import { ActionMenu } from '../components/common/ActionMenu';
import { useToast } from '../components/common/Toast';

/** Immersive full-screen vertical feed opened from a website card. */
export function EngagePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const {
    isSaved,
    toggleSave,
    isFollowing,
    toggleFollow,
    toggleLike,
  } = useAppState();

  const feed = useMemo(() => {
    const ordered = buildHomeFeed(SITES);
    const index = ordered.findIndex((site) => site.id === id);
    return index < 0 ? ordered : [...ordered.slice(index), ...ordered.slice(0, index)];
  }, [id]);

  const [active, setActive] = useState(0);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const site = feed[active] ?? feed[0];

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

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const step =
        event.key === 'ArrowDown' || event.key === 'PageDown'
          ? 1
          : event.key === 'ArrowUp' || event.key === 'PageUp'
            ? -1
            : 0;
      if (!step) return;
      event.preventDefault();
      const scroller = scrollerRef.current;
      if (!scroller) return;
      setActive((current) => {
        const next = Math.max(0, Math.min(feed.length - 1, current + step));
        scroller.scrollTo({ top: next * scroller.clientHeight, behavior: 'smooth' });
        return next;
      });
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [feed.length]);

  const share = async (url: string) => {
    const ok = await copyText(url);
    showToast(ok ? 'Link copied' : 'Could not copy the link');
  };

  const dotStart = Math.max(0, Math.min(active - 2, feed.length - 5));
  const dots = feed.slice(dotStart, dotStart + 5).map((item, index) => ({
    index: dotStart + index,
    id: item.id,
  }));

  return (
    <div className="engage">
      <div className="engage__scroller" ref={scrollerRef}>
        {feed.map((item, index) => {
          const saved = isSaved(item.id);
          const following = isFollowing(item.creatorHandle);
          return (
            <section className="engage__slide" key={item.id}>
              <img className="engage__poster" src={posterFor(item)} alt="" />
              <div className="engage__scrim engage__scrim--top" aria-hidden />
              <div className="engage__scrim engage__scrim--bottom" aria-hidden />

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
                <span className="engage__badge">
                  {item.category} · {item.tags.slice(0, 2).join(' · ')}
                </span>
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

              {index === active && <span className="sr-only">Engaging with {item.title}</span>}
            </section>
          );
        })}
      </div>

      <header className="engage__header">
        <button
          type="button"
          className="engage__back"
          aria-label="Back"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={19} />
        </button>
        <span className="engage__mode">
          <span className="engage__pulse" aria-hidden />
          Engage
        </span>
        <Link to="/profile" className="engage__profile" aria-label="Your profile">
          <Avatar name="Harman Singh" size={28} />
        </Link>
      </header>

      <aside className="engage__dots" aria-label="Page stream indicator">
        {dots.map((dot) => (
          <button
            key={dot.id}
            type="button"
            aria-label={`Go to experience ${dot.index + 1}`}
            className={`engage__dot${dot.index === active ? ' is-active' : ''}`}
            onClick={() => {
              const scroller = scrollerRef.current;
              if (!scroller) return;
              scroller.scrollTo({ top: dot.index * scroller.clientHeight, behavior: 'smooth' });
              setActive(dot.index);
            }}
          />
        ))}
      </aside>

      <div className="engage__hint" aria-hidden>
        <ChevronsUp size={18} />
        Swipe up for next
      </div>

      <div className="engage__progress" aria-hidden>
        <span style={{ width: `${((active + 1) / feed.length) * 100}%` }} />
      </div>
    </div>
  );
}
