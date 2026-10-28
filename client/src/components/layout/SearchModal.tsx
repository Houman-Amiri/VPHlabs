import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Package, Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import apiClient from '../../lib/axios';
import type { ApiSuccessResponse, Article, Product } from '../../types';

interface SearchResults {
  query: string;
  products: Product[];
  articles: Article[];
}

export function SearchModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { t, i18n } = useTranslation();
  const isFa = i18n.language.startsWith('fa');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResults>({
    query: '',
    products: [],
    articles: [],
  });

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults({ query: trimmed, products: [], articles: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await apiClient.get<ApiSuccessResponse<SearchResults>>(
          `/search?q=${encodeURIComponent(trimmed)}`
        );
        setResults(res.data.data);
      } catch {
        // Ignore transient typing search failure
      } finally {
        setLoading(false);
      }
    }, 220);

    return () => clearTimeout(timer);
  }, [query]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="جستجو در سایت"
      onClick={onClose}
      className="search-modal-backdrop"
    >
      <div
        className="card search-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.55rem',
            borderBottom: '1px solid var(--border-subtle)',
            paddingBottom: '0.85rem',
          }}
        >
          <Search
            size={19}
            style={{ color: 'var(--accent-primary)', flexShrink: 0 }}
          />
          <input
            autoFocus
            type="search"
            className="form-input"
            style={{
              border: 'none',
              background: 'transparent',
              padding: '0.3rem',
              minWidth: 0,
            }}
            placeholder={t('nav.searchPlaceholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            type="button"
            className="icon-btn"
            aria-label="بستن جستجو"
            style={{ flexShrink: 0 }}
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ marginTop: '1rem' }}>
          {query.trim().length < 2 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>
              {isFa
                ? 'حداقل ۲ حرف تایپ کنید (مثلاً: داک‌مایند، اتوماسیون، RAG، شبکه)...'
                : 'Type at least 2 characters (e.g., DocMind, RAG, Automation)...'}
            </p>
          ) : loading ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {t('common.loading')}
            </p>
          ) : results.products.length === 0 && results.articles.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {isFa
                ? 'موردی مطابق با عبارت جستجو یافت نشد.'
                : 'No matching products or articles found.'}
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              {results.products.length > 0 && (
                <div>
                  <div
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: 'var(--accent-primary)',
                      marginBottom: '0.45rem',
                    }}
                  >
                    {t('nav.products')}
                  </div>
                  {results.products.map((prod) => (
                    <Link
                      key={prod.id}
                      to={`/products/${prod.slug}`}
                      onClick={onClose}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.65rem',
                        padding: '0.6rem 0.7rem',
                        borderRadius: '0.55rem',
                        whiteSpace: 'normal',
                      }}
                      className="nav-item"
                    >
                      <Package size={16} style={{ flexShrink: 0, marginTop: '0.2rem' }} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {isFa ? prod.title_fa : prod.title_en || prod.title_fa}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {(isFa ? prod.summary_fa : prod.summary_en || prod.summary_fa).slice(
                            0,
                            90
                          )}
                          ...
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {results.articles.length > 0 && (
                <div>
                  <div
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: 'var(--accent-primary)',
                      marginBottom: '0.45rem',
                    }}
                  >
                    {t('nav.articles')}
                  </div>
                  {results.articles.map((art) => (
                    <Link
                      key={art.id}
                      to={`/articles/${art.slug}`}
                      onClick={onClose}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.65rem',
                        padding: '0.6rem 0.7rem',
                        borderRadius: '0.55rem',
                        whiteSpace: 'normal',
                      }}
                      className="nav-item"
                    >
                      <FileText size={16} style={{ flexShrink: 0, marginTop: '0.2rem' }} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {isFa ? art.title_fa : art.title_en || art.title_fa}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {art.category}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
