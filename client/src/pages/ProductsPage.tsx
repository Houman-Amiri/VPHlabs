import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import apiClient from '../lib/axios';
import { useSiteStore } from '../store/useSiteStore';
import { SeoHead } from '../components/common/SeoHead';
import {
  EmptyState,
  ErrorState,
  LoadingState,
  Pagination,
} from '../components/common/UiStates';
import type { ApiSuccessResponse, PaginationMeta, Product } from '../types';

export function ProductsPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const isFa = lang.startsWith('fa');
  const getText = useSiteStore((s) => s.getText);
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get('page') || '1');
  const category = searchParams.get('category') || '';
  const sortBy = searchParams.get('sortBy') || 'sort_order';
  const q = searchParams.get('q') || '';

  const [searchInput, setSearchInput] = useState(q);
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 6,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '6');
      params.set('sortBy', sortBy);
      params.set('order', sortBy === 'created_at' ? 'desc' : 'asc');
      if (category) params.set('category', category);
      if (q) params.set('q', q);

      const res = await apiClient.get<ApiSuccessResponse<Product[]>>(
        `/products?${params.toString()}`
      );
      setProducts(res.data.data);
      if (res.data.pagination) {
        setPagination(res.data.pagination);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در دریافت محصولات');
    } finally {
      setLoading(false);
    }
  }, [page, category, sortBy, q]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  function updateFilter(key: string, value: string) {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    next.set('page', '1');
    setSearchParams(next);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateFilter('q', searchInput.trim());
  }

  const categories = [
    { value: '', labelFa: 'همه دسته‌ها', labelEn: 'All Categories' },
    { value: 'enterprise-ai', labelFa: 'هوش مصنوعی سازمانی', labelEn: 'Enterprise AI' },
    { value: 'industrial-ai', labelFa: 'اتوماسیون صنعتی هوشمند', labelEn: 'Industrial AI' },
    { value: 'data-analytics', labelFa: 'تحلیل داده و هوش تجاری', labelEn: 'Data & BI' },
    { value: 'infrastructure', labelFa: 'زیرساخت و شبکه', labelEn: 'Infrastructure' },
  ];

  const pageTitle = getText('products.page_title', lang, t('products.title'));
  const pageSubtitle = getText(
    'products.page_subtitle',
    lang,
    t('products.subtitle')
  );

  return (
    <div className="container" style={{ paddingBottom: '4rem' }}>
      <SeoHead
        title={pageTitle}
        description={pageSubtitle}
        canonicalPath="/products"
      />

      <header className="page-header">
        <h1 className="page-title">{pageTitle}</h1>
        <p className="page-subtitle">{pageSubtitle}</p>
      </header>

      <div className="toolbar-bar">
        <form
          onSubmit={handleSearchSubmit}
          style={{ display: 'flex', gap: '0.5rem', flex: '1 1 280px' }}
        >
          <input
            type="search"
            className="form-input"
            placeholder={t('products.searchPlaceholder')}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button type="submit" className="btn btn-secondary" aria-label="جستجو">
            <Search size={17} />
          </button>
        </form>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
          <select
            className="form-select"
            style={{ width: 'auto' }}
            aria-label="فیلتر دسته‌بندی"
            value={category}
            onChange={(e) => updateFilter('category', e.target.value)}
          >
            {categories.map((c) => (
              <option key={c.value} value={c.value}>
                {isFa ? c.labelFa : c.labelEn}
              </option>
            ))}
          </select>

          <select
            className="form-select"
            style={{ width: 'auto' }}
            aria-label="مرتب‌سازی"
            value={sortBy}
            onChange={(e) => updateFilter('sortBy', e.target.value)}
          >
            <option value="sort_order">{t('products.sortOrder')}</option>
            <option value="created_at">{t('products.sortNewest')}</option>
            <option value="title_fa">{t('products.sortTitle')}</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchProducts} />
      ) : products.length === 0 ? (
        <EmptyState
          message={t('products.empty')}
          actionLabel={t('products.allCategories')}
          onAction={() => {
            setSearchInput('');
            setSearchParams({});
          }}
        />
      ) : (
        <>
          <div className="grid-3">
            {products.map((product) => (
              <article
                key={product.id}
                className="card card-interactive"
                style={{
                  padding: 0,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  {product.image_url && (
                    <Link to={`/products/${product.slug}`}>
                      <img
                        src={product.image_url}
                        alt={isFa ? product.title_fa : product.title_en || product.title_fa}
                        loading="lazy"
                        style={{
                          width: '100%',
                          height: '175px',
                          objectFit: 'cover',
                          borderBottom: '1px solid var(--border-subtle)',
                        }}
                      />
                    </Link>
                  )}

                  <div style={{ padding: '1.35rem' }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '0.75rem',
                      }}
                    >
                      {product.badge ? (
                        <span className="badge">{product.badge}</span>
                      ) : (
                        <span />
                      )}
                      <span
                        className="mono"
                        style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}
                      >
                        ISIC {product.isic_code}
                      </span>
                    </div>

                    <h2 style={{ margin: '0 0 0.6rem', fontSize: '1.15rem' }}>
                      <Link to={`/products/${product.slug}`}>
                        {isFa
                          ? product.title_fa
                          : product.title_en || product.title_fa}
                      </Link>
                    </h2>

                    <p
                      style={{
                        margin: 0,
                        color: 'var(--text-secondary)',
                        fontSize: '0.9rem',
                      }}
                    >
                      {isFa
                        ? product.summary_fa
                        : product.summary_en || product.summary_fa}
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    padding: '1rem 1.35rem',
                    borderTop: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.5rem',
                  }}
                >
                  <Link
                    to={`/products/${product.slug}`}
                    className="btn btn-secondary"
                    style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem' }}
                  >
                    <span>{t('products.viewDetails')}</span>
                    {isFa ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}
                  </Link>
                  {product.demo_available && (
                    <Link
                      to={`/contact?product_id=${product.id}&subject=${encodeURIComponent(
                        `درخواست دمو: ${product.title_fa}`
                      )}`}
                      className="btn btn-ghost"
                      style={{ fontSize: '0.84rem' }}
                    >
                      {t('products.requestDemo')}
                    </Link>
                  )}
                </div>
              </article>
            ))}
          </div>

          <Pagination
            meta={pagination}
            onPageChange={(nextPage) => {
              const next = new URLSearchParams(searchParams);
              next.set('page', String(nextPage));
              setSearchParams(next);
            }}
          />
        </>
      )}
    </div>
  );
}
