import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/format';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  variant?: 'light' | 'ghost' | 'dark';
  size?: 'sm' | 'md';
  children: ReactNode;
}

export function IconButton({
  label,
  variant = 'ghost',
  size = 'md',
  className,
  children,
  type = 'button',
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn('icon-btn', `icon-btn--${variant}`, `icon-btn--${size}`, className)}
      {...rest}
    >
      {children}
    </button>
  );
}
