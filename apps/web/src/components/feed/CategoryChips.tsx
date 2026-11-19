import { cn } from '../../lib/format';

interface CategoryChipsProps {
  categories: readonly string[];
  active: string;
  onChange: (category: string) => void;
  label?: string;
}

export function CategoryChips({
  categories,
  active,
  onChange,
  label = 'Filter by category',
}: CategoryChipsProps) {
  return (
    <nav className="chips" aria-label={label}>
      {categories.map((category) => {
        const isActive = category === active;
        return (
          <button
            key={category}
            type="button"
            className={cn('chip', isActive && 'is-active')}
            aria-pressed={isActive}
            onClick={() => onChange(category)}
          >
            {category}
          </button>
        );
      })}
    </nav>
  );
}
