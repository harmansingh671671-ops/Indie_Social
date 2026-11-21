import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, Settings, Share2, Sparkles } from 'lucide-react';
import { SITES } from '../data/sites';
import { useAppState } from '../state/AppState';
import { useToast } from '../components/common/Toast';
import { siteConfig, ROUTES } from '../config/site';
import { Avatar } from '../components/common/Avatar';
import { Button } from '../components/common/Button';
import { SiteGrid } from '../components/feed/SiteGrid';
import { EmptyState } from '../components/common/EmptyState';
import { copyText } from '../lib/share';
import { cn } from '../lib/format';
import type { Site } from '../types';

type Tab = 'saved' | 'likes' | 'created';

const TABS: Array<{ id: Tab; label: string }> = [
  { id: 'saved', label: 'Saved' },
  { id: 'likes', label: 'Likes' },
  { id: 'created', label: 'Created' },
];

export function ProfilePage() {
  const { savedIds, likedIds, followedHandles } = useAppState();
  const { showToast } = useToast();
  const [tab, setTab] = useState<Tab>('saved');

  const user = siteConfig.currentUser;

  const savedSites = useMemo(
    () =>
      savedIds
        .map((id) => SITES.find((site) => site.id === id))
        .filter((site): site is Site => Boolean(site)),
    [savedIds],
  );

  const likedSites = useMemo(
    () =>
      [...likedIds]
        .reverse()
        .map((id) => SITES.find((site) => site.id === id))
        .filter((site): site is Site => Boolean(site)),
    [likedIds],
  );

  const visible = tab === 'saved' ? savedSites : tab === 'likes' ? likedSites : [];

  return (
    <div className="page">
      <section className="profile-card" aria-labelledby="profile-name">
        <div className="profile-card__avatar">
          <Avatar name={user.name} size={112} />
        </div>

        <div className="profile-card__body">
          <h1 id="profile-name" className="profile-card__name">
            {user.name}
          </h1>
          <p className="profile-card__handle">@{user.handle}</p>
          <p className="profile-card__bio">{user.bio}</p>
          <p className="profile-card__location">
            <MapPin size={14} /> {user.location}
          </p>

          <div className="profile-card__stats">
            <span>
              <strong>{savedSites.length}</strong> saved
            </span>
            <span>
              <strong>{likedSites.length}</strong> liked
            </span>
            <span>
              <strong>{followedHandles.length}</strong> following
            </span>
            <span>
              <strong>{user.followers}</strong> followers
            </span>
          </div>
        </div>

        <div className="profile-card__actions">
          <Button
            variant="light"
            onClick={async () => {
              const ok = await copyText(`${window.location.origin}/profile`);
              showToast(ok ? 'Profile link copied' : 'Could not copy your link');
            }}
          >
            <Share2 size={16} /> Share
          </Button>
          <Button variant="dark" onClick={() => showToast('Profile editing is coming soon')}>
            <Settings size={16} /> Edit profile
          </Button>
        </div>
      </section>

      <nav className="profile-tabs" aria-label="Profile sections">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={cn('profile-tab', tab === item.id && 'is-active')}
            aria-pressed={tab === item.id}
            onClick={() => setTab(item.id)}
          >
            {item.label}
            {item.id === 'saved' && savedSites.length > 0 && (
              <span className="profile-tab__count">{savedSites.length}</span>
            )}
            {item.id === 'likes' && likedSites.length > 0 && (
              <span className="profile-tab__count">{likedSites.length}</span>
            )}
          </button>
        ))}
      </nav>

      {visible.length > 0 ? (
        <SiteGrid sites={visible} />
      ) : (
        <EmptyState
          icon={
            tab === 'created' ? (
              <Sparkles size={30} />
            ) : tab === 'likes' ? (
              <Heart size={30} />
            ) : (
              <Sparkles size={30} />
            )
          }
          title={
            tab === 'created'
              ? 'No sites created yet'
              : tab === 'likes'
                ? 'No likes yet'
                : 'Your saved sites will live here'
          }
          body={
            tab === 'created'
              ? 'Creator tools are coming. Soon you will be able to submit and manage sites from this page.'
              : 'Tap the heart on a site to keep a quiet list of favourites.'
          }
          action={
            <Link to={ROUTES.explore}>
              <Button>Explore the catalogue</Button>
            </Link>
          }
        />
      )}
    </div>
  );
}
