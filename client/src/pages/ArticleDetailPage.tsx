import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, Check, Clock, Eye, Link2, ThumbsUp, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import apiClient from '../lib/axios';
import { trackEvent } from '../lib/analytics';
import { formatLocaleDate, formatLocaleNumber } from '../lib/formatters';
import { useToastStore } from '../store/useToastStore';
import { SeoHead } from '../components/common/SeoHead';
import { ErrorState, LoadingState } from '../components/common/UiStates';
import type { ApiSuccessResponse, Article } from '../types';

interface HeadingItem {
  id: string;
  level: 2 | 3;
  text: string;
}

function renderInlineBold(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={idx}>{part.slice(2, -2)}</strong>;
    }
    return <span key={idx}>{part}</span>;
  });
}

function parseMarkdownBlocks(markdown: string) {
  const lines = markdown.split('\n');
  const elements: React.ReactNode[] = [];
  const headings: HeadingItem[] = [];
  let listBuffer: { ordered: boolean; items: string[] } | null = null;

  const flushList = (keyPrefix: string) => {
    if (!listBuffer) return;
    const Tag = listBuffer.ordered ? 'ol' : 'ul';
    elements.push(
      <Tag key={`list-${keyPrefix}`}>
        {listBuffer.items.map((li, i) => (
          <li key={i}>{renderInlineBold(li)}</li>
        ))}
      </Tag>
    );
    listBuffer = null;
  };

  lines.forEach((rawLine, idx) => {
    const line = rawLine.trim();
    if (!line) {
      flushList(String(idx));
      return;
    }

    if (line.startsWith('### ')) {
      flushList(String(idx));
      const text = line.slice(4).trim();
      const hid = `section-${headings.length + 1}`;
      headings.push({ id: hid, level: 3, text });
      elements.push(
        <h3 id={hid} key={`h3-${idx}`}>
          {text}
        </h3>
      );
      return;
    }

    if (line.startsWith('## ')) {
      flushList(String(idx));
      const text = line.slice(3).trim();
      const hid = `section-${headings.length + 1}`;
      headings.push({ id: hid, level: 2, text });
      elements.push(
        <h2 id={hid} key={`h2-${idx}`}>
          {text}
        </h2>
      );
      return;
    }

    const unorderedMatch = line.match(/^[-*]\s+(.+)$/);
    if (unorderedMatch) {
      if (!listBuffer || listBuffer.ordered) {
        flushList(String(idx));
        listBuffer = { ordered: false, items: [] };
      }
      listBuffer.items.push(unorderedMatch[1]);
      return;
    }

    const orderedMatch = line.match(/^[\d۰-۹]+[.)]\s+(.+)$/);
    if (orderedMatch) {
      if (!listBuffer || !listBuffer.ordered) {
        flushList(String(idx));
        listBuffer = { ordered: true, items: [] };
      }
      listBuffer.items.push(orderedMatch[1]);
      return;
    }

    flushList(String(idx));
    elements.push(<p key={`p-${idx}`}>{renderInlineBold(line)}</p>);
  });

  flushList('end');
  return { elements, headings };
}

export function ArticleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const isFa = lang.startsWith('fa');
  const addToast = useToastStore((s) => s.addToast);

  const [article, setArticle] = useState<Article | null>(null);
  const [related, setRelated] = useState<Article[]>([]);
  const [liked, setLiked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!id) return;
      setLoading(true);
      setError(null);
      setLiked(false);
      try {
        const res = await apiClient.get<ApiSuccessResponse<Article>>(
          `/articles/${encodeURIComponent(id)}`
        );
        setArticle(res.data.data);
        setRelated(res.data.related || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'مقاله یافت نشد');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const bodyText = useMemo(() => {
    if (!article) return '';
    return isFa
      ? article.content_fa
      : article.content_en || article.content_fa;
  }, [article, isFa]);

  const { elements, headings } = useMemo(
    () => parseMarkdownBlocks(bodyText),
    [bodyText]
  );

  async function handleLike() {
    if (!article || liked) return;
    try {
      const res = await apiClient.post<
        ApiSuccessResponse<{ id: number; likes_count: number }>
      >(`/articles/${article.slug}/like`);
      setArticle((prev) =>
        prev ? { ...prev, likes_count: res.data.data.likes_count } : prev
      );
      setLiked(true);
      trackEvent('article_like', { slug: article.slug });
      addToast(
        isFa ? 'از بازخورد ارزشمند شما سپاسگزاریم!' : 'Thank you for your feedback!',
        'success'
      );
    } catch {
      addToast('خطا در ثبت امتیاز', 'error');
    }
  }

  async function handleCopyLink() {
    if (typeof window === 'undefined') return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      addToast(t('articles.copied'), 'success');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard fallback ignored
    }
  }

  if (loading) {
    return (
      <div className="container page-section">
        <LoadingState />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="container page-section">
        <ErrorState message={error || 'مقاله مورد نظر یافت نشد.'} />
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <Link to="/articles" className="btn btn-secondary">
            {t('common.backToList')}
          </Link>
        </div>
      </div>
    );
  }

  const title = isFa ? article.title_fa : article.title_en || article.title_fa;
  const excerpt = isFa
    ? article.excerpt_fa
    : article.excerpt_en || article.excerpt_fa;

  const articleJsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'TechArticle',
      headline: article.title_fa,
      description: article.meta_description || article.excerpt_fa,
      image: article.cover_image
        ? `https://vphlabs.com${article.cover_image}`
        : 'https://vphlabs.com/banners/banner-1.jpg',
      datePublished: article.published_at,
      dateModified: article.updated_at,
      inLanguage: isFa ? 'fa-IR' : 'en-US',
      keywords: article.meta_keywords || article.tags.join(', '),
      author: {
        '@type': 'Organization',
        name: article.author_name,
      },
      publisher: {
        '@type': 'Organization',
        name: 'شرکت ویرا پردازش هومان',
        url: 'https://vphlabs.com',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'صفحه اصلی',
          item: 'https://vphlabs.com/',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'مقالات',
          item: 'https://vphlabs.com/articles',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: article.title_fa,
          item: `https://vphlabs.com/articles/${article.slug}`,
        },
      ],
    },
  ];

  return (
    <div className="container" style={{ paddingBlock: '2rem 4rem' }}>
      <SeoHead
        title={article.meta_title || title}
        description={article.meta_description || excerpt}
        keywords={article.meta_keywords || article.tags.join(', ')}
        canonicalPath={`/articles/${article.slug}`}
        ogType="article"
        ogImage={article.cover_image || '/banners/banner-1.jpg'}
        jsonLd={articleJsonLd}
      />

      <div style={{ marginBottom: '1.25rem' }}>
        <Link to="/articles" className="btn btn-ghost">
          <ArrowRight size={16} style={{ transform: isFa ? 'none' : 'rotate(180deg)' }} />
          <span>{t('common.backToList')}</span>
        </Link>
      </div>

      <article className="card" style={{ padding: 'clamp(1.35rem, 3.5vw, 2.75rem)' }}>
        <header style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', marginBottom: '1rem' }}>
            <span className="badge">{article.category}</span>
            <time
              dateTime={article.published_at}
              style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}
            >
              {formatLocaleDate(article.published_at, lang)}
            </time>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
              }}
            >
              <Clock size={14} />
              {formatLocaleNumber(article.reading_time_minutes, lang)}{' '}
              {t('articles.readingTime')}
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
              }}
            >
              <Eye size={14} />
              {formatLocaleNumber(article.views_count, lang)} {t('articles.views')}
            </span>
          </div>

          <h1
            style={{
              margin: '0 0 1rem',
              fontSize: 'clamp(1.6rem, 3.2vw, 2.35rem)',
              lineHeight: 1.4,
            }}
          >
            {title}
          </h1>

          <p
            style={{
              margin: '0 0 1.25rem',
              fontSize: '1.06rem',
              color: 'var(--text-secondary)',
            }}
          >
            {excerpt}
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.88rem',
              color: 'var(--text-muted)',
            }}
          >
            <User size={15} />
            <span>{article.author_name}</span>
          </div>
        </header>

        {article.cover_image && (
          <img
            src={article.cover_image}
            alt={title}
            style={{
              width: '100%',
              maxHeight: '380px',
              objectFit: 'cover',
              borderRadius: '0.95rem',
              border: '1px solid var(--border-subtle)',
              marginBottom: '2rem',
            }}
          />
        )}

        {headings.length > 1 && (
          <nav
            aria-label={t('articles.toc')}
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '0.85rem',
              padding: '1.15rem 1.35rem',
              marginBottom: '2rem',
            }}
          >
            <strong style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.92rem' }}>
              {t('articles.toc')}
            </strong>
            <ul style={{ margin: 0, paddingInlineStart: '1.25rem', fontSize: '0.9rem' }}>
              {headings.map((h) => (
                <li
                  key={h.id}
                  style={{
                    marginBottom: '0.3rem',
                    marginInlineStart: h.level === 3 ? '1rem' : 0,
                  }}
                >
                  <a href={`#${h.id}`} style={{ color: 'var(--accent-primary)' }}>
                    {h.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <div className="prose-article">{elements}</div>

        <footer
          style={{
            marginTop: '2.5rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
            {article.tags.map((tg) => (
              <Link
                key={tg}
                to={`/articles?tag=${encodeURIComponent(tg)}`}
                className="badge"
              >
                #{tg}
              </Link>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <button
              type="button"
              className={`btn ${liked ? 'btn-primary' : 'btn-secondary'}`}
              onClick={handleLike}
              disabled={liked}
            >
              <ThumbsUp size={16} />
              <span>{t('articles.helpful')}</span>
              <span>({formatLocaleNumber(article.likes_count, lang)})</span>
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCopyLink}
            >
              {copied ? <Check size={16} /> : <Link2 size={16} />}
              <span>{copied ? t('articles.copied') : t('articles.copyLink')}</span>
            </button>
          </div>
        </footer>
      </article>

      {related.length > 0 && (
        <section style={{ marginTop: '3rem' }}>
          <h2 style={{ marginBottom: '1.25rem', fontSize: '1.35rem' }}>
            {t('articles.relatedTitle')}
          </h2>
          <div className="grid-3">
            {related.map((rel) => (
              <Link
                key={rel.id}
                to={`/articles/${rel.slug}`}
                className="card card-interactive"
              >
                <span className="badge" style={{ marginBottom: '0.65rem' }}>
                  {rel.category}
                </span>
                <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.02rem' }}>
                  {isFa ? rel.title_fa : rel.title_en || rel.title_fa}
                </h3>
                <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                  {(isFa ? rel.excerpt_fa : rel.excerpt_en || rel.excerpt_fa).slice(0, 110)}...
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
