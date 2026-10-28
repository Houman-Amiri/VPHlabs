import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SeoHead } from '../components/common/SeoHead';

export function NotFoundPage() {
  const { i18n } = useTranslation();
  const isFa = i18n.language.startsWith('fa');

  return (
    <div className="container page-section" style={{ textAlign: 'center' }}>
      <SeoHead title="۴۰۴ — صفحه یافت نشد" />
      <div className="card auth-card" style={{ maxWidth: '540px', paddingBlock: '2.5rem' }}>
        <div
          className="mono"
          style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--accent-primary)' }}
        >
          404
        </div>
        <h1 style={{ margin: '0.5rem 0 0.75rem', fontSize: '1.45rem' }}>
          {isFa ? 'صفحه مورد نظر یافت نشد' : 'Page Not Found'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          {isFa
            ? 'ممکن است آدرس تغییر کرده باشد یا صفحه جابجا شده باشد.'
            : 'The requested page could not be found.'}
        </p>
        <Link to="/" className="btn btn-primary">
          {isFa ? 'بازگشت به صفحه اصلی' : 'Back to Home'}
        </Link>
      </div>
    </div>
  );
}
