import { NavLink } from 'react-router-dom';
import {
  Bookmark,
  Compass,
  HelpCircle,
  Home,
  Plus,
  Settings,
  User,
} from 'lucide-react';
import { ROUTES } from '../../config/site';
import { cn } from '../../lib/format';

const NAV_ITEMS = [
  { to: ROUTES.home, label: 'Home', icon: Home, end: true },
  { to: ROUTES.explore, label: 'Explore', icon: Compass, end: false },
  { to: ROUTES.saved, label: 'Saved', icon: Bookmark, end: false },
  { to: ROUTES.profile, label: 'Profile', icon: User, end: false },
];

export function SideRail({ onCreate }: { onCreate: () => void }) {
  return (
    <aside className="rail" aria-label="Primary">
      <div className="rail__group">
        {NAV_ITEMS.slice(0, 2).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => cn('rail__item', isActive && 'is-active')}
            title={item.label}
          >
            <item.icon size={24} strokeWidth={1.8} />
            <span className="rail__tooltip">{item.label}</span>
          </NavLink>
        ))}

        <button
          type="button"
          className="rail__item"
          onClick={onCreate}
          title="Create"
        >
          <Plus size={24} strokeWidth={1.8} />
          <span className="rail__tooltip">Create</span>
        </button>

        {NAV_ITEMS.slice(2).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => cn('rail__item', isActive && 'is-active')}
            title={item.label}
          >
            <item.icon size={24} strokeWidth={1.8} />
            <span className="rail__tooltip">{item.label}</span>
          </NavLink>
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
