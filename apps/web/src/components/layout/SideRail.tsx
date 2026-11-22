import { Fragment } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Bookmark,
  Compass,
  HelpCircle,
  Home,
  Settings,
  Shuffle,
} from 'lucide-react';
import { ROUTES } from '../../config/site';
import { useVisibleSites } from '../../lib/siteHealth';
import { cn } from '../../lib/format';

const NAV_ITEMS = [
  { to: ROUTES.home, label: 'Home', icon: Home, end: true },
  { to: ROUTES.explore, label: 'Explore', icon: Compass, end: false },
  { to: ROUTES.saved, label: 'Saved', icon: Bookmark, end: false },
];

export function SideRail() {
  const navigate = useNavigate();
  const sites = useVisibleSites();

  const openRandomSite = () => {
    const site = sites[Math.floor(Math.random() * sites.length)];
    if (site) navigate(`${ROUTES.engage}/${site.id}`);
  };

  return (
    <aside className="rail" aria-label="Primary">
      <div className="rail__group">
        {NAV_ITEMS.map((item, index) => (
          <Fragment key={item.to}>
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) => cn('rail__item', isActive && 'is-active')}
              title={item.label}
            >
              <item.icon size={24} strokeWidth={1.8} />
              <span className="rail__tooltip">{item.label}</span>
            </NavLink>

            {index === 1 && (
              <button
                type="button"
                className="rail__item"
                onClick={openRandomSite}
                title="Engage — open a random site"
                aria-label="Engage — open a random site"
              >
                <Shuffle size={24} strokeWidth={1.8} />
                <span className="rail__tooltip">Engage</span>
              </button>
            )}
          </Fragment>
        ))}
      </div>

      <div className="rail__group rail__group--bottom">
        <button type="button" className="rail__item" title="Settings">
          <Settings size={22} strokeWidth={1.8} />
          <span className="rail__tooltip">Settings</span>
        </button>
        <button type="button" className="rail__item" title="Help">
          <HelpCircle size={22} strokeWidth={1.8} />
          <span className="rail__tooltip">Help</span>
        </button>
      </div>
    </aside>
  );
}
