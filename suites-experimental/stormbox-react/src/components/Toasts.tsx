import { useEffect } from 'react';
import { X } from 'lucide-react';

import { useMailStore } from '../store/mail-store';

const TOAST_MS = 4000;

/** Outcome notices (sent, saved, scheduled) in the store toast's success dress. */
export function Toasts() {
  const toasts = useMailStore((s) => s.toasts);
  const dismiss = useMailStore((s) => s.dismissToast);
  useEffect(() => {
    if (toasts.length === 0) return undefined;
    const oldest = toasts[0];
    const timer = window.setTimeout(() => dismiss(oldest.id), TOAST_MS);
    return () => clearTimeout(timer);
  }, [toasts, dismiss]);
  if (toasts.length === 0) return null;
  return (
    <div className="store-error-toast" role="status" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <div key={toast.id} className="store-error-toast__item store-error-toast__item--success">
          <span className="store-error-toast__message">{toast.text}</span>
          <button className="store-error-toast__dismiss" type="button" aria-label="Dismiss notification" title="Dismiss" onClick={() => dismiss(toast.id)}>
            <X size={14} strokeWidth={2} aria-hidden="true" />
          </button>
        </div>
      ))}
    </div>
  );
}
