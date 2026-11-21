import { Link } from 'react-router-dom';
import type { Site } from '../../types';
import { SiteImage } from '../common/SiteImage';
import { Avatar } from '../common/Avatar';
import { SiteActions } from '../site/SiteActions';
import { accentGradient, placeholderFor, posterFor } from '../../lib/posters';

interface SiteCardProps {
  site: Site;
  eager?: boolean;
  showMeta?: boolean;
}

export function SiteCard({ site, eager = false, showMeta = true }: SiteCardProps) {
  return (
    <article className="site-card">
      <div className="site-card__visual" style={{ aspectRatio: site.ratio }}>
        <SiteImage
          src={posterFor(site)}
          alt={`Preview of ${site.title}`}
          label={site.title}
          gradient={accentGradient(site)}
          placeholder={placeholderFor(site)}
          eager={eager}
        />

        <Link
          to={`/engage/${site.id}`}
          className="site-card__hitbox"
          aria-label={`${site.title} by ${site.creator}`}
        >
          <span className="sr-only">Open {site.title}</span>
        </Link>

        <div className="site-card__actions">
          <SiteActions site={site} />
        </div>
      </div>

      {showMeta && (
        <div className="site-card__meta">
          <Link to={`/engage/${site.id}`} className="site-card__title">
            {site.title}
          </Link>
          <div className="site-card__creator">
            <Avatar name={site.creator} size={24} />
            <span>{site.creator}</span>
          </div>
        </div>
      )}
    </article>
  );
}
