import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '../../lib/format';
import { IconButton } from './IconButton';

export interface MenuItem {
  label: string;
  icon?: ReactNode;
  onSelect: () => void;
  danger?: boolean;
}

interface ActionMenuProps {
  label: string;
  items: MenuItem[];
  trigger: ReactNode;
  iconVariant?: 'light' | 'ghost' | 'dark';
  align?: 'left' | 'right';
  className?: string;
}

export function ActionMenu({
  label,
  items,
  trigger,
  iconVariant = 'ghost',
  align = 'right',
  className,
}: ActionMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return undefined;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div className={cn('menu', className)} ref={rootRef}>
      <IconButton
        label={label}
        variant={iconVariant}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setOpen((value) => !value);
        }}
      >
        {trigger}
      </IconButton>

      {open && (
        <div className={cn('menu__panel', align === 'left' ? 'is-left' : 'is-right')} role="menu">
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              className={cn('menu__item', item.danger && 'menu__item--danger')}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setOpen(false);
                item.onSelect();
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
