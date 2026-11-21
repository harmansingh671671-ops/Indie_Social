import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Bell, MessageCircle, Search, X } from 'lucide-react';
import { siteConfig, ROUTES } from '../../config/site';
import { SITES } from '../../data/sites';
import {
  forgetSearch,
  getSuggestions,
  readSearchHistory,
  rememberSearch,
  type Suggestion,
} from '../../lib/search';
import { Avatar } from '../common/Avatar';
import { IconButton } from '../common/IconButton';
import { useToast } from '../common/Toast';
import { MobileSearch } from './MobileSearch';
import { SearchSuggestions } from '../search/SearchSuggestions';

export function TopBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const { showToast } = useToast();

  const urlQuery = params.get('q') ?? '';
  const [value, setValue] = useState(urlQuery);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [history, setHistory] = useState<string[]>(() => readSearchHistory());
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = useMemo(
    () => getSuggestions(SITES, value, history),
    [value, history],
  );

  useEffect(() => {
    setValue(urlQuery);
  }, [urlQuery, location.pathname]);

  useEffect(() => {
    setActive(-1);
  }, [value]);

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

  const runSearch = (term: string) => {
    const query = term.trim();
    setHistory(rememberSearch(query));
    setOpen(false);
    setActive(-1);
    navigate(query ? `${ROUTES.search}?q=${encodeURIComponent(query)}` : ROUTES.explore);
  };

  const pick = (suggestion: Suggestion) => {
    runSearch(suggestion.term);
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    runSearch(value);
  };

  const onInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
      setActive((index) => Math.min(index + 1, suggestions.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((index) => Math.max(index - 1, 0));
    } else if (event.key === 'Escape') {
      setOpen(false);
      setActive(-1);
    } else if (event.key === 'Enter' && active >= 0 && suggestions[active]) {
      event.preventDefault();
      pick(suggestions[active]);
    }
  };

  return (
    <header className="topbar">
      <Link to={ROUTES.home} className="logo" aria-label={`${siteConfig.name} home`}>
        <span className="logo__wordmark">{siteConfig.name}</span>
      </Link>

      <MobileSearch />

      <form className="search" role="search" onSubmit={submit}>
        <Search size={18} className="search__icon" aria-hidden />
        <input
          ref={inputRef}
          className="search__input"
          type="search"
          placeholder="Search sites"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            setHistory(readSearchHistory());
            setOpen(true);
          }}
          onBlur={() => setOpen(false)}
          onKeyDown={onInputKeyDown}
          aria-label="Search sites"
          aria-autocomplete="list"
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
        {open && (
          <SearchSuggestions
            suggestions={suggestions}
            activeIndex={active}
            query={value}
            onPick={pick}
            onHover={setActive}
            onRemove={(suggestion) => setHistory(forgetSearch(suggestion.term))}
          />
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
