import { AlertTriangle, Inbox, Loader2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatLocaleNumber } from '../../lib/formatters';
import { useToastStore } from '../../store/useToastStore';
import type { PaginationMeta } from '../../types';

export function LoadingState({ message }: { message?: string }) {
  const { t } = useTranslation();
  return (
    <div
      role="status"
      aria-live="polite"
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3.25rem 1.5rem',
        gap: '0.85rem',
        textAlign: 'center',
      }}
    >
      <Loader2
        size={30}
        style={{
          color: 'var(--accent-primary)',
          animation: 'vph-spin 1s linear infinite',
        }}
      />
      <style>{`@keyframes vph-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
        {message || t('common.loading')}
      </span>
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div
      role="alert"
      className="card"
      style={{
        borderColor: 'rgba(248, 113, 113, 0.35)',
        textAlign: 'center',
        padding: '2.75rem 1.5rem',
      }}
    >
      <AlertTriangle
        size={32}
        style={{ color: 'var(--accent-danger)', marginInline: 'auto', marginBottom: '0.75rem' }}
      />
      <p style={{ margin: '0 0 1.15rem', fontWeight: 600 }}>{message}</p>
      {onRetry && (
        <button type="button" className="btn btn-secondary" onClick={onRetry}>
          {t('common.retry')}
        </button>
      )}
    </div>
  );
}

export function EmptyState({
  message,
  actionLabel,
  onAction,
}: {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div
      className="card"
      style={{
        textAlign: 'center',
        padding: '3rem 1.5rem',
      }}
    >
      <Inbox
        size={34}
        style={{ color: 'var(--text-muted)', marginInline: 'auto', marginBottom: '0.75rem' }}
      />
      <p style={{ margin: '0 0 1rem', color: 'var(--text-secondary)' }}>{message}</p>
      {actionLabel && onAction && (
        <button type="button" className="btn btn-secondary" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export function Pagination({
  meta,
  onPageChange,
}: {
  meta: PaginationMeta;
  onPageChange: (nextPage: number) => void;
}) {
  const { t, i18n } = useTranslation();
  if (!meta || meta.totalPages <= 1) return null;

  return (
    <nav
      aria-label="Pagination"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.65rem',
        marginTop: '2.25rem',
      }}
    >
      <button
        type="button"
        className="btn btn-secondary"
        disabled={meta.page <= 1}
        onClick={() => onPageChange(meta.page - 1)}
      >
        {t('common.prevPage')}
      </button>
      <span
        style={{
          fontSize: '0.9rem',
          color: 'var(--text-secondary)',
          paddingInline: '0.5rem',
        }}
      >
        {formatLocaleNumber(meta.page, i18n.language)} /{' '}
        {formatLocaleNumber(meta.totalPages, i18n.language)}
      </span>
      <button
        type="button"
        className="btn btn-secondary"
        disabled={meta.page >= meta.totalPages}
        onClick={() => onPageChange(meta.page + 1)}
      >
        {t('common.nextPage')}
      </button>
    </nav>
  );
}

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();
  if (toasts.length === 0) return null;

  return (
    <div className="toast-stack" aria-live="polite">
      {toasts.map((item) => (
        <div
          key={item.id}
          className="toast-item"
          style={{
            borderColor:
              item.type === 'error'
                ? 'var(--accent-danger)'
                : item.type === 'success'
                ? 'var(--accent-emerald)'
                : 'var(--border-strong)',
          }}
        >
          <span>{item.message}</span>
          <button
            type="button"
            className="icon-btn"
            aria-label="بستن اعلان"
            style={{ height: '1.75rem', paddingInline: '0.35rem' }}
            onClick={() => removeToast(item.id)}
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
