// Renders the toast stack bottom-right, above the tray.
import { useEffect } from 'react';
import { useT } from '@/i18n/useT';
import { TOAST_MS, useToastStore, type Toast } from './store';
import styles from './Toast.module.css';

function ToastItem({ toast }: { toast: Toast }) {
  const dismiss = useToastStore((s) => s.dismiss);
  const t = useT();

  useEffect(() => {
    const timer = setTimeout(() => dismiss(toast.id), TOAST_MS);
    return () => clearTimeout(timer);
  }, [toast.id, dismiss]);

  return (
    <div className={styles.toast} role="status">
      <button
        type="button"
        className={styles.body}
        onClick={() => {
          toast.onClick?.();
          dismiss(toast.id);
        }}
      >
        {toast.icon && (
          <img
            className={styles.icon}
            src={toast.icon}
            alt=""
            width={32}
            height={32}
            draggable={false}
          />
        )}
        <span className={styles.lines}>
          <span className={styles.title}>{toast.title}</span>
          {toast.text && <span className={styles.text}>{toast.text}</span>}
        </span>
      </button>
      <button
        type="button"
        className={styles.close}
        aria-label={t('toast.close')}
        onClick={() => dismiss(toast.id)}
      >
        ×
      </button>
    </div>
  );
}

export function ToastLayer() {
  const toasts = useToastStore((s) => s.toasts);
  if (toasts.length === 0) return null;
  return (
    <div className={styles.layer} data-testid="toast-layer">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
