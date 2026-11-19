import { useEffect, useState } from 'react';
import { cn } from '../../lib/format';

interface PinImageProps {
  src: string;
  alt: string;
  label: string;
  gradient: string;
  eager?: boolean;
  className?: string;
}

/**
 * Image with a skeleton while loading and a designed tinted fallback if the
 * screenshot service is unavailable. Nothing ever renders as a broken image.
 */
export function PinImage({
  src,
  alt,
  label,
  gradient,
  eager = false,
  className,
}: PinImageProps) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

  useEffect(() => {
    setStatus('loading');
  }, [src]);

  return (
    <span
      className={cn('pin-image', className)}
      style={{ background: gradient }}
      aria-busy={status === 'loading'}
    >
      {status !== 'error' && (
        <img
          className={cn('pin-image__img', status === 'loaded' && 'is-loaded')}
          src={src}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
        />
      )}
      {status === 'loading' && <span className="pin-image__shimmer" aria-hidden />}
      {status === 'error' && (
        <span className="pin-image__fallback">
          <span className="pin-image__fallback-mark" aria-hidden>
            {label.slice(0, 1)}
          </span>
          <span className="pin-image__fallback-label">{label}</span>
        </span>
      )}
    </span>
  );
}
