import { cn, colourFromName, initialsOf } from '../../lib/format';

interface AvatarProps {
  name: string;
  size?: number;
  className?: string;
  title?: string;
}

/** Initials avatar. Deterministic colour means no broken profile images. */
export function Avatar({ name, size = 32, className, title }: AvatarProps) {
  return (
    <span
      className={cn('avatar', className)}
      style={{
        width: size,
        height: size,
        background: colourFromName(name),
        fontSize: Math.max(10, Math.round(size * 0.36)),
      }}
      title={title ?? name}
      aria-hidden={title ? undefined : true}
      aria-label={title ? name : undefined}
    >
      {initialsOf(name)}
    </span>
  );
}
