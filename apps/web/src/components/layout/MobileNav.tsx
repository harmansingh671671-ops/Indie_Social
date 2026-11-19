import { NavLink } from 'react-router-dom';
import { Bookmark, Compass, Home, Plus, User } from 'lucide-react';
import { ROUTES } from '../../config/site';
import { cn } from '../../lib/format';

export function MobileNav({ onCreate }: { onCreate: () => void }) {
  const items = [
    { to: ROUTES.home, label: 'Home', icon: Home, end: true },
    { to: ROUTES.explore, label: 'Explore', icon: Compass, end: false },
    { to: ROUTES.saved, label: 'Saved', icon: Bookmark, end: false },
    { to: ROUTES.profile, label: 'Profile', icon: User, end: false },
  ];

  return (
    <nav className="mobile-nav" aria-label="Primary">
      {items.slice(0, 2).map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) => cn('mobile-nav__item', isActive && 'is-active')}
        >
          <item.icon size={26} strokeWidth={1.8} />
          <span className="sr-only">{item.label}</span>
        </NavLink>
      ))}

      <button type="button" className="mobile-nav__item" onClick={onCreate}>
        <Plus size={28} strokeWidth={1.8} />
        <span className="sr-only">Create</span>
      </button>

      {items.slice(2).map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) => cn('mobile-nav__item', isActive && 'is-active')}
        >
          <item.icon size={26} strokeWidth={1.8} />
          <span className="sr-only">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
