import { Check } from 'lucide-react';
import { useAppState } from '../../state/AppState';
import { useToast } from '../common/Toast';
import { buttonClass } from '../common/Button';
import { cn } from '../../lib/format';

interface SaveButtonProps {
  siteId: string;
  size?: 'sm' | 'md';
  className?: string;
  stopPropagation?: boolean;
}

export function SaveButton({
  siteId,
  size = 'sm',
  className,
  stopPropagation = true,
}: SaveButtonProps) {
  const { isSaved, toggleSave } = useAppState();
  const { showToast } = useToast();
  const saved = isSaved(siteId);

  return (
    <button
      type="button"
      aria-pressed={saved}
      className={cn(
        buttonClass(saved ? 'dark' : 'primary', size),
        'save-btn',
        className,
      )}
      onClick={(event) => {
        if (stopPropagation) {
          event.preventDefault();
          event.stopPropagation();
        }
        const next = toggleSave(siteId);
        showToast(next ? 'Saved to your pins' : 'Removed from saved pins');
      }}
    >
      {saved ? (
        <>
          <Check size={size === 'sm' ? 14 : 16} aria-hidden />
          Saved
        </>
      ) : (
        'Save'
      )}
    </button>
  );
}
