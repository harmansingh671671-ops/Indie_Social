import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/format';

type Variant = 'primary' | 'dark' | 'light' | 'outline' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

export function buttonClass(
  variant: Variant = 'primary',
  size: Size = 'md',
  extra?: string,
): string {
  return cn('btn', `btn--${variant}`, `btn--${size}`, extra);
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  block,
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClass(variant, size, cn(block ? 'btn--block' : '', className))}
      {...rest}
    >
      {children}
    </button>
  );
}
