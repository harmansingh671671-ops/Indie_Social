import type { ReactNode } from 'react';
import { cn } from '../../lib/format';

export function Masonry({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('masonry', className)}>{children}</div>;
}
