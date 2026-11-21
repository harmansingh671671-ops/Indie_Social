import { useLayoutEffect, useRef, useState } from 'react';
import { cn } from '../../lib/format';

interface SiteImageProps {
  src: string;
  alt: string;
  label: string;
  gradient: string;
  placeholder?: string;
  eager?: boolean;
  className?: string;
}

/**
 * Image with an instant inline preview and a designed tinted fallback. Cached
 * images do not always fire `load` again when a page remounts, so we also check
 * `complete` before paint — otherwise they stay invisible on the placeholder.
 */
export function SiteImage({
  src,
  alt,
  label,
  gradient,
  placeholder,
  eager = false,
  className,
}: SiteImageProps) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const imgRef = useRef<HTMLImageElement>(null);

  useLayoutEffect(() => {
    setStatus('loading');
    const img = imgRef.current;
    if (img?.complete) {
      setStatus(img.naturalWidth > 0 ? 'loaded' : 'error');
    }
  }, [src]);

  const background = placeholder
    ? `url("${placeholder}") center / cover no-repeat, ${gradient}`
    : gradient;

  return (
    <span
      className={cn('site-image', className)}
      style={{ background }}
      aria-busy={status === 'loading'}
    >
      {status !== 'error' && (
        <img
          ref={imgRef}
          className={cn('site-image__img', status === 'loaded' && 'is-loaded')}
          src={src}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          fetchPriority={eager ? 'high' : 'low'}
          decoding="async"
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
        />
      )}
      {status === 'loading' && !placeholder && <span className="site-image__shimmer" aria-hidden />}
      {status === 'error' && (
        <span className="site-image__fallback">
          <span className="site-image__fallback-mark" aria-hidden>
            {label.slice(0, 1)}
          </span>
          <span className="site-image__fallback-label">{label}</span>
        </span>
      )}
    </span>
  );
}
