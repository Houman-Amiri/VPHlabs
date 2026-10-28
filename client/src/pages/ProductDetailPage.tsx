import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Cpu } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import apiClient from '../lib/axios';
import { trackEvent } from '../lib/analytics';
import { SeoHead } from '../components/common/SeoHead';
import { ErrorState, LoadingState } from '../components/common/UiStates';
import type { ApiSuccessResponse, Product } from '../types';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const isFa = i18n.language.startsWith('fa');

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const res = await apiClient.get<ApiSuccessResponse<Product>>(
          `/products/${encodeURIComponent(id)}`
        );
        setProduct(res.data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'محصول یافت نشد');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="container page-section">
        <LoadingState />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container page-section">
        <ErrorState message={error || 'محصول یافت نشد'} />
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <Link to="/products" className="btn btn-secondary">
            {t('common.backToList')}
          </Link>
        </div>
      </div>
    );
  }

  const title = isFa ? product.title_fa : product.title_en || product.title_fa;
  const summary = isFa
    ? product.summary_fa
    : product.summary_en || product.summary_fa;
  const description = isFa
    ? product.description_fa
    : product.description_en || product.description_fa;

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: product.title_fa,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Linux, Windows Server, On-Premise Docker/Kubernetes',
    description: product.summary_fa,
    provider: {
      '@type': 'Organization',
      name: 'شرکت ویرا پردازش هومان',
      url: 'https://vphlabs.com',
    },
  };

  return (
    <div className="container page-bottom-space" style={{ paddingTop: '2rem' }}>
      <SeoHead
        title={title}
        description={summary}
        canonicalPath={`/products/${product.slug}`}
        ogImage={product.image_url || '/banners/banner-1.jpg'}
        jsonLd={productJsonLd}
      />

      <div style={{ marginBottom: '1.25rem' }}>
        <Link to="/products" className="btn btn-ghost">
          <ArrowRight size={16} style={{ transform: isFa ? 'none' : 'rotate(180deg)' }} />
          <span>{t('common.backToList')}</span>
        </Link>
      </div>

      <div className="card hero-card">
        <div className="grid-2 detail-grid" style={{ alignItems: 'start' }}>
          <div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '1rem' }}>
              {product.badge && <span className="badge">{product.badge}</span>}
              <span className="badge mono">
                <Cpu size={13} />
                ISIC {product.isic_code}
              </span>
            </div>

            <h1 style={{ margin: '0 0 1rem', fontSize: 'clamp(1.45rem, 3vw, 2.2rem)', lineHeight: 1.38 }}>
              {title}
            </h1>

            <p
              style={{
                fontSize: 'clamp(0.95rem, 1.4vw, 1.05rem)',
                color: 'var(--text-secondary)',
                margin: '0 0 1.5rem',
              }}
            >
              {summary}
            </p>

            <div className="cta-actions">
              <Link
                to={`/contact?product_id=${product.id}&subject=${encodeURIComponent(
                  `درخواست دمو و جلسه فنی: ${product.title_fa}`
                )}`}
                className="btn btn-primary"
                onClick={() =>
                  trackEvent('product_demo_click', { slug: product.slug })
                }
              >
                {t('products.requestDemo')}
              </Link>
              <Link to="/services" className="btn btn-secondary">
                {t('nav.services')}
              </Link>
            </div>
          </div>

          {product.image_url && (
            <img
              src={product.image_url}
              alt={title}
              style={{
                width: '100%',
                borderRadius: '0.9rem',
                border: '1px solid var(--border-subtle)',
                objectFit: 'cover',
                maxHeight: '320px',
              }}
            />
          )}
        </div>

        <hr
          style={{
            border: 'none',
            borderTop: '1px solid var(--border-subtle)',
            marginBlock: '2rem',
          }}
        />

        <div className="grid-2 detail-grid">
          <div>
            <h2 style={{ marginTop: 0, fontSize: '1.28rem' }}>
              {isFa ? 'معرفی و معماری راهکار' : 'Solution Overview & Architecture'}
            </h2>
            {description.split(/\n\n+/).map((para, idx) => (
              <p
                key={idx}
                style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}
              >
                {para}
              </p>
            ))}
          </div>

          {product.features.length > 0 && (
            <div
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '0.9rem',
                padding: '1.5rem',
                height: 'fit-content',
              }}
            >
              <h2 style={{ marginTop: 0, fontSize: '1.18rem', marginBottom: '1rem' }}>
                {isFa ? 'قابلیت‌ها و ویژگی‌های کلیدی' : 'Key Capabilities'}
              </h2>
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                }}
              >
                {product.features.map((feat, i) => (
                  <li
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.6rem',
                      fontSize: '0.94rem',
                    }}
                  >
                    <CheckCircle2
                      size={18}
                      style={{
                        color: 'var(--accent-emerald)',
                        flexShrink: 0,
                        marginTop: '0.2rem',
                      }}
                    />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
