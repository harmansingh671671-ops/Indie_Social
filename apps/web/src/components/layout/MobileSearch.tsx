import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, Search, Sparkles, X } from 'lucide-react';
import { CATEGORIES, SITES, TRENDING_TAGS } from '../../data/sites';
import { ROUTES } from '../../config/site';
import { searchSites } from '../../lib/feed';
import { posterFor } from '../../lib/posters';
import { IconButton } from '../common/IconButton';

/**
 * On phones the header shows just a search icon. Tapping it opens this sheet
 * with trending tags, categories and live suggestions.
 */
export function MobileSearch() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => searchSites(SITES, value).slice(0, 5), [value]);
  const popular = useMemo(() => SITES.filter((site) => site.featured).slice(0, 3), []);

  useEffect(() => {
    if (!open) return;
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

  const go = (path: string) => {
    setOpen(false);
    setValue('');
    navigate(path);
  };

  const runSearch = () => {
    const query = value.trim();
    go(query ? `${ROUTES.search}?q=${encodeURIComponent(query)}` : ROUTES.explore);
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    runSearch();
  };

  const searchFor = (term: string) => {
    go(`${ROUTES.search}?q=${encodeURIComponent(term)}`);
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
          aria-label="Search Scroll"
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
                  placeholder="Search ideas, makers, feelings…"
                  value={value}
                  onChange={(event) => setValue(event.target.value)}
                  aria-label="Search for ideas"
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
              {value ? (
                results.length > 0 ? (
                  <>
                    <p className="search-sheet__label">Ideas for “{value.trim()}”</p>
                    <ul className="search-results">
                      {results.map((site) => (
                        <li key={site.id}>
                          <button
                            type="button"
                            className="search-result"
                            onClick={() => go(`/pin/${site.id}`)}
                          >
                            <img src={posterFor(site, 120)} alt="" />
                            <span className="search-result__text">
                              <strong>{site.title}</strong>
                              <span>{site.category} · {site.creator}</span>
                            </span>
                            <ArrowUpRight size={18} aria-hidden />
                          </button>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      className="search-sheet__all"
                      onClick={runSearch}
                    >
                      See all results <ArrowUpRight size={16} aria-hidden />
                    </button>
                  </>
                ) : (
                  <div className="search-sheet__empty">
                    <Search size={26} aria-hidden />
                    <strong>No ideas matched “{value.trim()}”</strong>
                    <span>Try “art”, “music”, “calm” or “space”.</span>
                  </div>
                )
              ) : (
                <>
                  <p className="search-sheet__label">
                    <Sparkles size={15} aria-hidden /> Trending searches
                  </p>
                  <div className="search-sheet__chips">
                    {TRENDING_TAGS.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        className="search-chip"
                        onClick={() => searchFor(tag)}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>

                  <p className="search-sheet__label">Browse a category</p>
                  <div className="search-sheet__chips">
                    {CATEGORIES.map((category) => (
                      <button
                        key={category}
                        type="button"
                        className="search-chip search-chip--dark"
                        onClick={() => searchFor(category)}
                      >
                        {category}
                      </button>
                    ))}
                  </div>

                  <p className="search-sheet__label">Popular right now</p>
                  <ul className="search-results">
                    {popular.map((site) => (
                      <li key={site.id}>
                        <button
                          type="button"
                          className="search-result"
                          onClick={() => go(`/pin/${site.id}`)}
                        >
                          <img src={posterFor(site, 120)} alt="" />
                          <span className="search-result__text">
                            <strong>{site.title}</strong>
                            <span>{site.category} · {site.creator}</span>
                          </span>
                          <ArrowUpRight size={18} aria-hidden />
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
