import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import apiClient from '../../lib/axios';
import { formatLocaleDate } from '../../lib/formatters';
import { useToastStore } from '../../store/useToastStore';
import { EmptyState, LoadingState } from '../../components/common/UiStates';
import type { ApiSuccessResponse, ContactMessage } from '../../types';

export function AdminMessagesPage() {
  const addToast = useToastStore((s) => s.addToast);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);

  async function loadMessages(status = statusFilter) {
    setLoading(true);
    try {
      const qs = status ? `?status=${status}` : '';
      const res = await apiClient.get<ApiSuccessResponse<ContactMessage[]>>(
        `/contacts${qs}`
      );
      setMessages(res.data.data);
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : 'خطا در دریافت پیام‌ها',
        'error'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMessages(statusFilter);
  }, [statusFilter]);

  async function handleStatusChange(
    id: number,
    nextStatus: ContactMessage['status']
  ) {
    try {
      await apiClient.patch(`/contacts/${id}/status`, { status: nextStatus });
      addToast('وضعیت پیام بروزرسانی شد.', 'success');
      loadMessages(statusFilter);
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'خطا در بروزرسانی', 'error');
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm('آیا از حذف این پیام اطمینان دارید؟')) return;
    try {
      await apiClient.delete(`/contacts/${id}`);
      addToast('پیام حذف شد.', 'info');
      loadMessages(statusFilter);
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'خطا در حذف', 'error');
    }
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '1.35rem' }}>
          پیام‌های دریافتی و درخواست‌های دمو سازمانی
        </h1>

        <select
          className="form-select"
          style={{ width: 'auto' }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">همه پیام‌ها</option>
          <option value="unread">خوانده‌نشده</option>
          <option value="read">بررسی‌شده</option>
          <option value="responded">پاسخ‌داده‌شده</option>
          <option value="archived">بایگانی‌شده</option>
        </select>
      </div>

      {loading ? (
        <LoadingState />
      ) : messages.length === 0 ? (
        <EmptyState message="هیچ پیامی در این بخش وجود ندارد." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {messages.map((msg) => (
            <article key={msg.id} className="card">
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '0.75rem',
                }}
              >
                <div>
                  <strong style={{ fontSize: '1.05rem' }}>{msg.subject}</strong>
                  {msg.product_title_fa && (
                    <span
                      className="badge"
                      style={{ marginInlineStart: '0.6rem' }}
                    >
                      محصول: {msg.product_title_fa}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <select
                    className="form-select"
                    style={{ width: 'auto', padding: '0.35rem 0.65rem', fontSize: '0.84rem' }}
                    value={msg.status}
                    onChange={(e) =>
                      handleStatusChange(
                        msg.id,
                        e.target.value as ContactMessage['status']
                      )
                    }
                  >
                    <option value="unread">خوانده‌نشده</option>
                    <option value="read">بررسی‌شده</option>
                    <option value="responded">پاسخ‌داده‌شده</option>
                    <option value="archived">بایگانی‌شده</option>
                  </select>

                  <button
                    type="button"
                    className="icon-btn"
                    aria-label="حذف پیام"
                    onClick={() => handleDelete(msg.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '1.25rem',
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                  marginBottom: '0.85rem',
                }}
              >
                <span>فرستنده: {msg.full_name}</span>
                {msg.organization && <span>سازمان: {msg.organization}</span>}
                <span dir="ltr">{msg.phone}</span>
                <span className="mono">{msg.email}</span>
                <span>{formatLocaleDate(msg.created_at, 'fa')}</span>
              </div>

              <p
                style={{
                  margin: 0,
                  padding: '0.9rem 1rem',
                  borderRadius: '0.65rem',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {msg.message}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
