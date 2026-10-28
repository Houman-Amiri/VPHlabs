import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Database,
  FileText,
  Image,
  Inbox,
  Package,
  Plus,
  Users,
} from 'lucide-react';
import apiClient from '../../lib/axios';
import { formatLocaleNumber } from '../../lib/formatters';
import { SeoHead } from '../../components/common/SeoHead';
import { ErrorState, LoadingState } from '../../components/common/UiStates';
import type { ApiSuccessResponse, ContactStatusCounts } from '../../types';

interface AdminStats {
  productsCount: number;
  articlesCount: number;
  bannersCount: number;
  servicesCount: number;
  teamCount?: number;
  messages: ContactStatusCounts;
  system: {
    uptimeSeconds: number;
    database: string;
    sqliteVersion: string;
    migrationsCount: number;
    lastMigration: string | null;
  };
}

export function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadStats() {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<ApiSuccessResponse<AdminStats>>(
        '/admin/stats'
      );
      setStats(res.data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در دریافت آمار');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStats();
  }, []);

  if (loading) return <LoadingState />;
  if (error || !stats)
    return <ErrorState message={error || 'خطا'} onRetry={loadStats} />;

  return (
    <div>
      <SeoHead title="پیشخوان مدیریت | ویرا پردازش هومان" />

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1.75rem',
        }}
      >
        <div>
          <h1 style={{ margin: '0 0 0.25rem', fontSize: '1.5rem' }}>
            پیشخوان مدیریت پویای ویرا پردازش هومان
          </h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            مدیریت لحظه‌ای محصولات، مقالات سئو، بنرهای صفحه اصلی و متن تمامی صفحات
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <Link to="/admin/articles" className="btn btn-primary">
            <Plus size={16} />
            <span>انتشار مقاله جدید</span>
          </Link>
          <Link to="/admin/products" className="btn btn-secondary">
            <Plus size={16} />
            <span>افزودن محصول</span>
          </Link>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: '1.75rem' }}>
        <Link to="/admin/products" className="card card-interactive">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                محصولات و راهکارها
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
                {formatLocaleNumber(stats.productsCount)}
              </div>
            </div>
            <Package size={28} style={{ color: 'var(--accent-primary)' }} />
          </div>
        </Link>

        <Link to="/admin/articles" className="card card-interactive">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                مقالات و جستارهای منتشرشده
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
                {formatLocaleNumber(stats.articlesCount)}
              </div>
            </div>
            <FileText size={28} style={{ color: 'var(--accent-primary)' }} />
          </div>
        </Link>

        <Link to="/admin/banners" className="card card-interactive">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                بنرهای اسلایدر صفحه اصلی
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
                {formatLocaleNumber(stats.bannersCount)}
              </div>
            </div>
            <Image size={28} style={{ color: 'var(--accent-primary)' }} />
          </div>
        </Link>

        <Link to="/admin/team" className="card card-interactive">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                همکاران معرفی‌شده (درباره ما)
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
                {formatLocaleNumber(stats.teamCount ?? 0)}
              </div>
            </div>
            <Users size={28} style={{ color: 'var(--accent-primary)' }} />
          </div>
        </Link>

        <Link to="/admin/messages" className="card card-interactive">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                پیام‌های خوانده‌نشده / کل پیام‌ها
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                {formatLocaleNumber(stats.messages.unread)} /{' '}
                {formatLocaleNumber(stats.messages.total)}
              </div>
            </div>
            <Inbox size={28} style={{ color: 'var(--accent-emerald)' }} />
          </div>
        </Link>
      </div>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
          <Database size={19} style={{ color: 'var(--accent-primary)' }} />
          <h2 style={{ margin: 0, fontSize: '1.1rem' }}>وضعیت سلامت پایگاه داده و مهاجرت‌ها</h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
            fontSize: '0.88rem',
          }}
        >
          <div className="stat-box">
            <div style={{ color: 'var(--text-secondary)' }}>وضعیت SQLite</div>
            <strong style={{ color: 'var(--accent-emerald)' }}>
              {stats.system.database === 'connected' ? 'متصل (WAL فعال)' : 'خطا'}
            </strong>
          </div>
          <div className="stat-box">
            <div style={{ color: 'var(--text-secondary)' }}>نسخه موتور SQLite</div>
            <strong className="mono">{stats.system.sqliteVersion}</strong>
          </div>
          <div className="stat-box">
            <div style={{ color: 'var(--text-secondary)' }}>مهاجرت‌های اعمال‌شده</div>
            <strong>{formatLocaleNumber(stats.system.migrationsCount)} فایل SQL</strong>
          </div>
          <div className="stat-box">
            <div style={{ color: 'var(--text-secondary)' }}>آخرین مهاجرت</div>
            <strong className="mono" style={{ fontSize: '0.78rem' }}>
              {stats.system.lastMigration}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
}
