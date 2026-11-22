import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, Search, X } from 'lucide-react';
import { useVisibleSites } from '../../lib/siteHealth';
import { ROUTES } from '../../config/site';
import {
  forgetSearch,
  getSuggestions,
  readSearchHistory,
  rememberSearch,
  type Suggestion,
} from '../../lib/search';
import { IconButton } from '../common/IconButton';
import { SearchSuggestions } from '../search/SearchSuggestions';

/**
 * On phones the header shows just a search icon. Tapping it opens this sheet
 * with recent searches, trending terms and live suggestions.
 */
export function MobileSearch() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [active, setActive] = useState(-1);
  const [history, setHistory] = useState<string[]>(() => readSearchHistory());
  const inputRef = useRef<HTMLInputElement>(null);
  const sites = useVisibleSites();

  const suggestions = useMemo(
    () => getSuggestions(sites, value, history),
    [sites, value, history],
  );
  useEffect(() => {
    if (!open) return;
    setHistory(readSearchHistory());
    document.body.classList.add('no-scroll');
    const frame = requestAnimationFrame(() => inputRef.current?.focus());
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('keydown', onKeyDown);
      document.body.classList.remove('no-scroll');
    };
  }, [open]);

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
        window.matchMedia('(max-width: 700px)').matches
      ) {
        event.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const runSearch = (term: string) => {
    const query = term.trim();
    setHistory(rememberSearch(query));
    setOpen(false);
    setValue('');
    navigate(query ? `${ROUTES.search}?q=${encodeURIComponent(query)}` : ROUTES.explore);
  };

  const pick = (suggestion: Suggestion) => runSearch(suggestion.term);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    runSearch(value);
  };

  const onInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive((index) => Math.min(index + 1, suggestions.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((index) => Math.max(index - 1, 0));
    } else if (event.key === 'Enter' && active >= 0 && suggestions[active]) {
      event.preventDefault();
      pick(suggestions[active]);
    }
  };

  return (
    <>
      <IconButton
        label="Search"
        className="search-toggle"
        onClick={() => setOpen(true)}
      >
        <Search size={22} />
      </IconButton>

      {open && createPortal(
        <div
          className="search-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Search SiteHub"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <div className="search-sheet">
            <div className="search-sheet__top">
              <form className="search-sheet__field" role="search" onSubmit={submit}>
                <Search size={20} className="search-sheet__icon" aria-hidden />
                <input
                  ref={inputRef}
                  className="search-sheet__input"
                  type="search"
                  placeholder="Search sites, makers, tags"
                  value={value}
                  onChange={(event) => setValue(event.target.value)}
                  onKeyDown={onInputKeyDown}
                  aria-label="Search sites"
                  aria-autocomplete="list"
                  autoComplete="off"
                />
                {value && (
                  <IconButton
                    label="Clear search"
                    size="sm"
                    onClick={() => {
                      setValue('');
                      inputRef.current?.focus();
                    }}
                  >
                    <X size={16} />
                  </IconButton>
                )}
              </form>
              <IconButton label="Close search" onClick={() => setOpen(false)}>
                <X size={22} />
              </IconButton>
            </div>

            <div className="search-sheet__body">
              <SearchSuggestions
                suggestions={suggestions}
                activeIndex={active}
                query={value}
                onPick={pick}
                onHover={setActive}
                onRemove={(suggestion) => setHistory(forgetSearch(suggestion.term))}
                inline
              />

              {value && (
                <button type="button" className="search-sheet__all" onClick={() => runSearch(value)}>
                  Search for “{value.trim()}” <ArrowUpRight size={16} aria-hidden />
                </button>
              )}
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
