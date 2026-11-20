import { Clock3, Globe2, Hash, Search, Sparkles, Tag, User, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../../lib/format';
import type { Suggestion } from '../../lib/search';

function Highlight({ text, query }: { text: string; query: string }) {
  const needle = query.trim();
  const index = needle ? text.toLowerCase().indexOf(needle.toLowerCase()) : -1;
  if (index < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, index)}
      <mark>{text.slice(index, index + needle.length)}</mark>
      {text.slice(index + needle.length)}
    </>
  );
}

function iconFor(kind: Suggestion['kind']): ReactNode {
  switch (kind) {
    case 'recent':
      return <Clock3 size={17} aria-hidden />;
    case 'trend':
      return <Sparkles size={17} aria-hidden />;
    case 'site':
      return <Globe2 size={17} aria-hidden />;
    case 'creator':
      return <User size={17} aria-hidden />;
    case 'category':
      return <Hash size={17} aria-hidden />;
    case 'tag':
      return <Tag size={17} aria-hidden />;
    default:
      return <Search size={17} aria-hidden />;
  }
}

interface SearchSuggestionsProps {
  suggestions: Suggestion[];
  activeIndex: number;
  query: string;
  onPick: (suggestion: Suggestion) => void;
  onHover: (index: number) => void;
  onRemove?: (suggestion: Suggestion) => void;
  onClearHistory?: () => void;
  inline?: boolean;
}

export function SearchSuggestions({
  suggestions,
  activeIndex,
  query,
  onPick,
  onHover,
  onRemove,
  onClearHistory,
  inline = false,
}: SearchSuggestionsProps) {
  if (suggestions.length === 0) return null;

  const recent = suggestions.filter((item) => item.kind === 'recent');
  const others = suggestions.filter((item) => item.kind !== 'recent');

  const row = (suggestion: Suggestion, index: number) => (
    <div
      key={suggestion.id}
      className={cn('suggestion', index === activeIndex && 'is-active')}
      role="option"
      aria-selected={index === activeIndex}
      onMouseDown={(event) => event.preventDefault()}
      onMouseEnter={() => onHover(index)}
      onClick={() => onPick(suggestion)}
    >
      <span className="suggestion__icon">{iconFor(suggestion.kind)}</span>
      <span className="suggestion__text">
        <strong>
          <Highlight text={suggestion.label} query={query} />
        </strong>
        {suggestion.detail && <small>{suggestion.detail}</small>}
      </span>
      {suggestion.kind === 'recent' && onRemove && (
        <button
          type="button"
          className="suggestion__remove"
          aria-label={`Remove ${suggestion.label} from recent searches`}
          onClick={(event) => {
            event.stopPropagation();
            onRemove(suggestion);
          }}
        >
          <X size={15} aria-hidden />
        </button>
      )}
    </div>
  );

  return (
    <div
      className={cn('suggestions', inline && 'suggestions--inline')}
      role="listbox"
      aria-label="Search suggestions"
    >
      {recent.length > 0 && (
        <>
          <div className="suggestions__head">
            <span>Recent searches</span>
            {onClearHistory && (
              <button type="button" className="suggestions__clear" onClick={onClearHistory}>
                Clear
              </button>
            )}
          </div>
          {recent.map((suggestion, index) => row(suggestion, index))}
        </>
      )}

      {recent.length > 0 && others.length > 0 && <div className="suggestions__divider" />}

      {others.length > 0 && (
        <>
          {!query.trim() && (
            <div className="suggestions__head">
              <span>Trending on Scroll</span>
            </div>
          )}
          {others.map((suggestion, index) => row(suggestion, recent.length + index))}
        </>
      )}
    </div>
  );
}
