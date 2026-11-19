import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Bookmark,
  ExternalLink,
  Globe,
  Heart,
  MessageCircle,
} from 'lucide-react';
import { SITES } from '../data/sites';
import { relatedSites } from '../lib/feed';
import { accentGradient, posterFor } from '../lib/posters';
import { PinImage } from '../components/common/PinImage';
import { Avatar } from '../components/common/Avatar';
import { Button } from '../components/common/Button';
import { PinActions } from '../components/pin/PinActions';
import { PinGrid } from '../components/feed/PinGrid';
import { useAppState } from '../state/AppState';
import { useToast } from '../components/common/Toast';
import { siteConfig, ROUTES } from '../config/site';
import {
  domainOf,
  formatCount,
  formatRelativeDays,
  timeAgo,
  cn,
} from '../lib/format';
import { NotFoundPage } from './NotFoundPage';

export function PinDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const {
    isLiked,
    toggleLike,
    isSaved,
    isFollowing,
    toggleFollow,
    commentsFor,
    addComment,
  } = useAppState();

  const [draft, setDraft] = useState('');

  const site = useMemo(() => SITES.find((candidate) => candidate.id === id), [id]);

  if (!site) return <NotFoundPage />;

  const liked = isLiked(site.id);
  const saved = isSaved(site.id);
  const following = isFollowing(site.creatorHandle);
  const comments = commentsFor(site.id);
  const related = relatedSites(site, SITES);

  const goBack = () => {
    if (location.key === 'default') navigate(ROUTES.home);
    else navigate(-1);
  };

  return (
    <div className="page page--detail">
      <button type="button" className="back-btn" onClick={goBack}>
        <ArrowLeft size={18} /> Back
      </button>

      <article className="pin-detail">
        <div className="pin-detail__visual">
          <PinImage
            src={posterFor(site, 1000)}
            alt={`Preview of ${site.title}`}
            label={site.title}
            gradient={accentGradient(site)}
            eager
          />
          <span className="pin-detail__source">
            <Globe size={14} /> {domainOf(site.url)}
          </span>
        </div>

        <div className="pin-detail__panel">
          <div className="pin-detail__topbar">
            <PinActions site={site} variant="detail" />
            <span className="pin-detail__added">
              Added {formatRelativeDays(site.addedDaysAgo)}
            </span>
          </div>

          <h1 className="pin-detail__title">{site.title}</h1>
          <p className="pin-detail__description">{site.description}</p>

          <div className="tags">
            {site.tags.map((tag) => (
              <Link
                key={tag}
                to={`${ROUTES.search}?q=${encodeURIComponent(tag)}`}
                className="tag"
              >
                {tag}
              </Link>
            ))}
          </div>

          <div className="creator-row">
            <Avatar name={site.creator} size={48} />
            <div className="creator-row__text">
              <p className="creator-row__name">{site.creator}</p>
              <p className="creator-row__meta">
                @{site.creatorHandle} · {site.category}
              </p>
            </div>
            <Button
              variant={following ? 'light' : 'dark'}
              size="sm"
              className="creator-row__follow"
              aria-pressed={following}
              onClick={() => {
                const next = toggleFollow(site.creatorHandle);
                showToast(next ? `Following ${site.creator}` : 'Unfollowed');
              }}
            >
              {following ? 'Following' : 'Follow'}
            </Button>
          </div>

          <div className="pin-stats">
            <button
              type="button"
              className={cn('pin-stat', liked && 'is-active')}
              aria-pressed={liked}
              aria-label={liked ? 'Unlike pin' : 'Like pin'}
              onClick={() => {
                const next = toggleLike(site.id);
                showToast(next ? 'Liked' : 'Like removed');
              }}
            >
              <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
              {formatCount(site.likes + (liked ? 1 : 0))}
            </button>
            <span className="pin-stat pin-stat--static">
              <Bookmark size={18} fill={saved ? 'currentColor' : 'none'} />
              {formatCount(site.saves + (saved ? 1 : 0))} saves
            </span>
            <span className="pin-stat pin-stat--static">
              <MessageCircle size={18} />
              {comments.length}
            </span>
          </div>

          <a
            className="btn btn--primary btn--md btn--block visit-site"
            href={site.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => showToast(`Opening ${domainOf(site.url)}`)}
          >
            Visit site <ExternalLink size={16} />
          </a>
          <p className="microcopy">Opens in a new tab. Your visit goes straight to the maker.</p>

          <section className="comments" aria-label="Comments">
            <h2 className="comments__title">
              Comments <span className="comments__count">{comments.length || ''}</span>
            </h2>

            {comments.length === 0 ? (
              <p className="comments__empty">
                No comments yet — tell people what you made or found.
              </p>
            ) : (
              <ul className="comments__list">
                {comments.map((comment) => (
                  <li key={comment.id} className="comment">
                    <Avatar name={comment.author} size={32} />
                    <div className="comment__body">
                      <div className="comment__head">
                        <span className="comment__author">{comment.author}</span>
                        <span className="comment__time">{timeAgo(comment.createdAt)}</span>
                      </div>
                      <p className="comment__text">{comment.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <form
              className="comment-form"
              onSubmit={(event) => {
                event.preventDefault();
                if (!draft.trim()) return;
                addComment(site.id, draft, siteConfig.currentUser.name);
                setDraft('');
                showToast('Comment posted');
              }}
            >
              <Avatar name={siteConfig.currentUser.name} size={32} />
              <label className="comment-form__field">
                <span className="sr-only">Add a comment</span>
                <textarea
                  className="comment-form__input"
                  placeholder="What do you think?"
                  maxLength={280}
                  rows={2}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                />
              </label>
              <Button type="submit" size="sm" disabled={!draft.trim()}>
                Post
              </Button>
            </form>
          </section>
        </div>
      </article>

      <section className="related" aria-labelledby="related-title">
        <h2 id="related-title" className="related__title">
          More like this
        </h2>
        <PinGrid sites={related} />
      </section>
    </div>
  );
}
