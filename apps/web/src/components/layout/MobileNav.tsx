import { NavLink } from 'react-router-dom';
import { Bookmark, Compass, Home } from 'lucide-react';
import { ROUTES } from '../../config/site';
import { cn } from '../../lib/format';

const NAV_ITEMS = [
  { to: ROUTES.home, label: 'Home', icon: Home, end: true },
  { to: ROUTES.explore, label: 'Explore', icon: Compass, end: false },
  { to: ROUTES.saved, label: 'Saved', icon: Bookmark, end: false },
];

export function MobileNav() {
  return (
    <nav className="mobile-nav" aria-label="Primary">
      {NAV_ITEMS.map((item) => (
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
