import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BookOpen, Clock, Eye, Search, ThumbsUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import apiClient from '../lib/axios';
import { formatLocaleDate, formatLocaleNumber } from '../lib/formatters';
import { useSiteStore } from '../store/useSiteStore';
import { SeoHead } from '../components/common/SeoHead';
import {
  EmptyState,
  ErrorState,
  LoadingState,
  Pagination,
} from '../components/common/UiStates';
import type { ApiSuccessResponse, Article, PaginationMeta } from '../types';

export function ArticlesPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const isFa = lang.startsWith('fa');
  const getText = useSiteStore((s) => s.getText);
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get('page') || '1');
  const category = searchParams.get('category') || '';
  const tag = searchParams.get('tag') || '';
  const q = searchParams.get('q') || '';

  const [searchInput, setSearchInput] = useState(q);
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 6,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadArticles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '6');
      if (category) params.set('category', category);
      if (tag) params.set('tag', tag);
      if (q) params.set('q', q);

      const res = await apiClient.get<ApiSuccessResponse<Article[]>>(
        `/articles?${params.toString()}`
      );
      setArticles(res.data.data);
      if (res.data.categories) setCategories(res.data.categories);
      if (res.data.pagination) setPagination(res.data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در دریافت مقالات');
    } finally {
      setLoading(false);
    }
  }, [page, category, tag, q]);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.set('page', '1');
    setSearchParams(next);
  }

  const pageTitle = getText('articles.page_title', lang, t('articles.title'));
  const pageSubtitle = getText(
    'articles.page_subtitle',
    lang,
    t('articles.subtitle')
  );

  return (
    <div className="container" style={{ paddingBottom: '4rem' }}>
      <SeoHead
        title={pageTitle}
        description={pageSubtitle}
        canonicalPath="/articles"
      />

      <header className="page-header">
        <h1 className="page-title">{pageTitle}</h1>
        <p className="page-subtitle">{pageSubtitle}</p>
      </header>

      <div className="toolbar-bar">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateParam('q', searchInput.trim());
          }}
          style={{ display: 'flex', gap: '0.5rem', flex: '1 1 280px' }}
        >
          <input
            type="search"
            className="form-input"
            placeholder={t('articles.searchPlaceholder')}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button type="submit" className="btn btn-secondary" aria-label="جستجوی مقاله">
            <Search size={17} />
          </button>
        </form>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
          <button
            type="button"
            className={`btn ${!category ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.45rem 0.9rem', fontSize: '0.84rem' }}
            onClick={() => updateParam('category', '')}
          >
            {t('articles.allCategories')}
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`btn ${category === cat ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.45rem 0.9rem', fontSize: '0.84rem' }}
              onClick={() => updateParam('category', cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={loadArticles} />
      ) : articles.length === 0 ? (
        <EmptyState
          message={t('articles.empty')}
          actionLabel={t('articles.allCategories')}
          onAction={() => {
            setSearchInput('');
            setSearchParams({});
          }}
        />
      ) : (
        <>
          <div className="grid-3">
            {articles.map((article) => (
              <article
                key={article.id}
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
                  {article.cover_image && (
                    <Link to={`/articles/${article.slug}`}>
                      <img
                        src={article.cover_image}
                        alt={isFa ? article.title_fa : article.title_en || article.title_fa}
                        loading="lazy"
                        style={{
                          width: '100%',
                          height: '185px',
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
                        marginBottom: '0.7rem',
                        fontSize: '0.78rem',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      <span className="badge">{article.category}</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Clock size={13} />
                        {formatLocaleNumber(article.reading_time_minutes, lang)}{' '}
                        {t('articles.readingTime')}
                      </span>
                    </div>

                    <h2 style={{ margin: '0 0 0.65rem', fontSize: '1.1rem', lineHeight: 1.5 }}>
                      <Link to={`/articles/${article.slug}`}>
                        {isFa
                          ? article.title_fa
                          : article.title_en || article.title_fa}
                      </Link>
                    </h2>

                    <p
                      style={{
                        margin: '0 0 0.9rem',
                        fontSize: '0.9rem',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {isFa
                        ? article.excerpt_fa
                        : article.excerpt_en || article.excerpt_fa}
                    </p>

                    {article.tags.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                        {article.tags.slice(0, 3).map((tg) => (
                          <button
                            key={tg}
                            type="button"
                            onClick={() => updateParam('tag', tg)}
                            style={{
                              fontSize: '0.74rem',
                              padding: '0.15rem 0.5rem',
                              borderRadius: '0.35rem',
                              border: '1px solid var(--border-subtle)',
                              background: 'var(--bg-elevated)',
                              color: 'var(--text-secondary)',
                              cursor: 'pointer',
                            }}
                          >
                            #{tg}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    padding: '0.85rem 1.35rem',
                    borderTop: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <time dateTime={article.published_at}>
                      {formatLocaleDate(article.published_at, lang)}
                    </time>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Eye size={13} />
                      {formatLocaleNumber(article.views_count, lang)}
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      <ThumbsUp size={13} />
                      {formatLocaleNumber(article.likes_count, lang)}
                    </span>
                  </div>
                  <Link
                    to={`/articles/${article.slug}`}
                    style={{
                      color: 'var(--accent-primary)',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                    }}
                  >
                    <BookOpen size={14} />
                    <span>{t('home.readArticle')}</span>
                  </Link>
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
