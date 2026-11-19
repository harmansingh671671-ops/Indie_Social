import { Link } from 'react-router-dom';
import type { Site } from '../../types';
import { PinImage } from '../common/PinImage';
import { Avatar } from '../common/Avatar';
import { PinActions } from '../pin/PinActions';
import { accentGradient, posterFor } from '../../lib/posters';

interface PinCardProps {
  site: Site;
  eager?: boolean;
}

export function PinCard({ site, eager = false }: PinCardProps) {
  return (
    <article className="pin-card">
      <div className="pin-card__visual" style={{ aspectRatio: site.ratio }}>
        <PinImage
          src={posterFor(site)}
          alt={`Preview of ${site.title}`}
          label={site.title}
          gradient={accentGradient(site)}
          eager={eager}
        />

        <Link
          to={`/pin/${site.id}`}
          className="pin-card__hitbox"
          aria-label={`${site.title} by ${site.creator}`}
        >
          <span className="sr-only">Open {site.title}</span>
        </Link>

        <div className="pin-card__actions">
          <PinActions site={site} variant="card" />
        </div>
      </div>

      <div className="pin-card__meta">
        <Link to={`/pin/${site.id}`} className="pin-card__title">
          {site.title}
        </Link>
        <div className="pin-card__creator">
          <Avatar name={site.creator} size={24} />
          <span>{site.creator}</span>
        </div>
      </div>
    </article>
  );
}
