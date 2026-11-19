import { useState } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useToast } from '../common/Toast';
import { readJSON, writeJSON } from '../../lib/storage';

interface CreateModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Create isn't a full pin editor yet. This captures site submissions locally
 * so the flow is testable; swap the submit handler for an API call later.
 */
export function CreateModal({ open, onClose }: CreateModalProps) {
  const { showToast } = useToast();
  const [url, setUrl] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    try {
      new URL(url);
    } catch {
      setError('Enter a full URL, for example https://your-site.com');
      return;
    }

    const submissions = readJSON<Array<{ url: string; email: string; at: number }>>(
      'submissions',
      [],
    );
    writeJSON('submissions', [
      { url, email, at: Date.now() },
      ...submissions,
    ]);

    showToast('Thanks — your site is in the review queue');
    setUrl('');
    setEmail('');
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Submit a site"
      size="sm"
      footer={
        <div className="create-modal__foot">
          <p className="muted">We review every submission by hand.</p>
          <Button type="submit" form="create-form">
            <Send size={16} /> Submit
          </Button>
        </div>
      }
    >
      <div className="create-modal__intro">
        <span className="create-modal__icon" aria-hidden>
          <Sparkles size={22} />
        </span>
        <p>
          <strong>Creator tools are next.</strong> For now, send us a site you made —
          interactive, strange or beautiful things all welcome.
        </p>
      </div>

      <form id="create-form" className="form" onSubmit={submit}>
        <label className="field">
          <span className="field__label">Site URL</span>
          <input
            className="field__input"
            type="url"
            placeholder="https://your-site.com"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            required
          />
        </label>
        <label className="field">
          <span className="field__label">Email (optional)</span>
          <input
            className="field__input"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        {error && <p className="field__error">{error}</p>}
      </form>
    </Modal>
  );
}
