import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/common/Button';
import { ROUTES } from '../config/site';

export function NotFoundPage() {
  return (
    <div className="page">
      <EmptyState
        icon={<Compass size={30} />}
        title="This pin has wandered off"
        body="The page you were looking for doesn't exist — or the site was removed."
        action={
          <Link to={ROUTES.home}>
            <Button>Back to the feed</Button>
          </Link>
        }
      />
    </div>
  );
}
