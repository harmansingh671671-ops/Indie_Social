import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Bell, MessageCircle, Search, X } from 'lucide-react';
import { siteConfig, ROUTES } from '../../config/site';
import { Avatar } from '../common/Avatar';
import { IconButton } from '../common/IconButton';
import { MobileSearch } from './MobileSearch';
import { useToast } from '../common/Toast';

export function TopBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const { showToast } = useToast();

  const urlQuery = params.get('q') ?? '';
  const [value, setValue] = useState(urlQuery);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue(urlQuery);
  }, [urlQuery, location.pathname]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable;
      if (
        event.key === '/' &&
        !typing &&
        !window.matchMedia('(max-width: 700px)').matches
      ) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const query = value.trim();
    navigate(query ? `${ROUTES.search}?q=${encodeURIComponent(query)}` : ROUTES.explore);
  };

  return (
    <header className="topbar">
      <Link to={ROUTES.home} className="logo" aria-label={`${siteConfig.name} home`}>
        <span className="logo__badge" aria-hidden>
          {siteConfig.logoLetter}
        </span>
      </Link>

      <MobileSearch />

      <form className="search" role="search" onSubmit={submit}>
        <Search size={18} className="search__icon" aria-hidden />
        <input
          ref={inputRef}
          className="search__input"
          type="search"
          placeholder="Search for ideas"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          aria-label="Search for ideas"
          autoComplete="off"
        />
        {value && (
          <IconButton
            label="Clear search"
            size="sm"
            className="search__clear"
            onClick={() => {
              setValue('');
              inputRef.current?.focus();
            }}
          >
            <X size={16} />
          </IconButton>
        )}
      </form>

      <div className="topbar__actions">
        <IconButton
          label="Notifications"
          variant="ghost"
          onClick={() => showToast('You are all caught up')}
        >
          <Bell size={22} />
        </IconButton>
        <IconButton
          label="Messages"
          variant="ghost"
          onClick={() => showToast('Messages are coming soon')}
        >
          <MessageCircle size={22} />
        </IconButton>
        <Link
          to={ROUTES.profile}
          className="topbar__avatar"
          aria-label="Your profile"
          title="Your profile"
        >
          <Avatar name={siteConfig.currentUser.name} size={32} />
        </Link>
      </div>
    </header>
  );
}
