import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpen, Clock, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import apiClient from '../lib/axios';
import { formatLocaleDate, formatLocaleNumber } from '../lib/formatters';
import { useSiteStore } from '../store/useSiteStore';
import { SeoHead } from '../components/common/SeoHead';
import { BannerCarousel } from '../components/home/BannerCarousel';
import { LiveSolutionMatcher } from '../components/home/LiveSolutionMatcher';
import { ErrorState, LoadingState } from '../components/common/UiStates';
import type { ApiSuccessResponse, Article, Product } from '../types';

export function HomePage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const isFa = lang.startsWith('fa');

  const { banners, services, getText } = useSiteStore();

  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [recentArticles, setRecentArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadHomeCollections() {
    setLoading(true);
    setError(null);
    try {
      const [prodRes, artRes] = await Promise.all([
        apiClient.get<ApiSuccessResponse<Product[]>>(
          '/products?featured=true&limit=3&sortBy=sort_order&order=asc'
        ),
        apiClient.get<ApiSuccessResponse<Article[]>>(
          '/articles?limit=3&sortBy=published_at&order=desc'
        ),
      ]);
      setFeaturedProducts(prodRes.data.data);
      setRecentArticles(artRes.data.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'خطا در دریافت اطلاعات صفحه اصلی'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHomeCollections();
  }, []);

  const missionBadge = getText(
    'home.mission_badge',
    lang,
    'نسل نوین مهندسی هوش مصنوعی و زیرساخت سازمانی در ایران'
  );
  const missionTitle = getText(
    'home.mission_title',
    lang,
    'ارائه راه‌حل‌های مبتنی بر هوش مصنوعی برای شرکت‌ها، ادارات و سازمان‌ها'
  );
  const missionSubtitle = getText(
    'home.mission_subtitle',
    lang,
    'شرکت ویرا پردازش هومان (VPH Labs) با ترکیب هوش مصنوعی بومی، تولید نرم‌افزار سفارشی و اتوماسیون صنعتی، سازمان‌ها را توانمند می‌سازد.'
  );
  const ctaPrimary = getText('home.cta_primary', lang, t('home.exploreProducts'));
  const ctaSecondary = getText('home.cta_secondary', lang, t('home.requestConsult'));
  const featuredTitle = getText(
    'home.featured_title',
    lang,
    t('home.featuredTitle')
  );
  const featuredSubtitle = getText(
    'home.featured_subtitle',
    lang,
    t('home.featuredSubtitle')
  );
  const articlesTitle = getText(
    'home.articles_title',
    lang,
    t('home.recentArticlesTitle')
  );
  const articlesSubtitle = getText(
    'home.articles_subtitle',
    lang,
    t('home.recentArticlesSubtitle')
  );
  const charterTitle = getText('home.charter_title', lang, t('home.charterTitle'));
  const charterSubtitle = getText(
    'home.charter_subtitle',
    lang,
    isFa
      ? 'خلاصه‌ای از مجوزها و موضوعات رسمی مندرج در ماده ۲ اساسنامه شرکت ویرا پردازش هومان'
      : 'Selected authorized engineering scopes from Article 2 of our corporate charter'
  );

  const address = getText(
    'contact.address_fa',
    lang,
    'همدان - ملایر - خیابان سعدی - کوچه مرتضی مهاجر - کوچه محبت - پلاک 4 - واحد 3'
  );
  const postalCode = getText('contact.postal_code', lang, '6571611860');
  const phone = getText('contact.phone', lang, '0912 576 2296');

  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'شرکت ویرا پردازش هومان با مسئولیت محدود',
    alternateName: 'V.I.R.A Pardazesh Hoomaan (VPH Labs)',
    url: 'https://vphlabs.com',
    logo: 'https://vphlabs.com/logo-vira.png',
    telephone: phone,
    founder: {
      '@type': 'Person',
      name: getText('company.ceo_name', 'fa', 'شهرام امیری'),
    },
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'IR',
      addressRegion: 'همدان',
      addressLocality: 'ملایر',
      postalCode,
      streetAddress: address,
    },
  };

  return (
    <>
      <SeoHead
        title={`${getText('company.name_fa', lang, 'ویرا پردازش هومان')} | راهکارهای هوش مصنوعی سازمانی (VPHLabs.com)`}
        description={missionSubtitle}
        canonicalPath="/"
        jsonLd={orgJsonLd}
      />

      {/* 1. Charter-Driven Banner Carousel */}
      <BannerCarousel banners={banners} />

      {/* 2. Dynamic Company Mission & Live Stats */}
      <section className="container page-section" style={{ paddingBottom: '2.25rem' }}>
        <div
          className="card hero-card"
          style={{
            background:
              'linear-gradient(145deg, var(--bg-surface) 0%, var(--bg-elevated) 100%)',
          }}
        >
          <span className="badge" style={{ marginBottom: '1rem' }}>
            <Sparkles size={14} />
            <span>{missionBadge}</span>
          </span>

          <h1
            style={{
              margin: '0 0 1rem',
              fontSize: 'clamp(1.5rem, 3.4vw, 2.65rem)',
              fontWeight: 800,
              lineHeight: 1.38,
            }}
          >
            {missionTitle}
          </h1>

          <p
            style={{
              margin: '0 0 1.65rem',
              color: 'var(--text-secondary)',
              fontSize: 'clamp(0.95rem, 1.4vw, 1.05rem)',
              maxWidth: '880px',
            }}
          >
            {missionSubtitle}
          </p>

          <div className="hero-actions">
            <Link to="/products" className="btn btn-primary">
              <span>{ctaPrimary}</span>
              {isFa ? <ArrowLeft size={17} /> : <ArrowRight size={17} />}
            </Link>
            <Link to="/contact" className="btn btn-secondary">
              {ctaSecondary}
            </Link>
            <Link to="/services" className="btn btn-ghost">
              {t('home.charterViewAll')}
            </Link>
          </div>

          <div className="stats-grid">
            <div className="stat-box">
              <div className="stat-value">
                {getText('home.stat_1_value', lang, '۱۲')}
              </div>
              <div className="stat-label">
                {getText(
                  'home.stat_1_label',
                  lang,
                  'حوزه رسمی فعالیت تخصصی در اساسنامه'
                )}
              </div>
            </div>
            <div className="stat-box">
              <div className="stat-value">
                {getText('home.stat_2_value', lang, '۱۰۰٪')}
              </div>
              <div className="stat-label">
                {getText(
                  'home.stat_2_label',
                  lang,
                  'حفظ حاکمیت و محرمانگی داده‌های سازمانی'
                )}
              </div>
            </div>
            <div className="stat-box">
              <div className="stat-value">
                {getText('home.stat_3_value', lang, '۲۴/۷')}
              </div>
              <div className="stat-label">
                {getText(
                  'home.stat_3_label',
                  lang,
                  'پایش هوشمند و پشتیبانی سامانه‌های حیاتی'
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Live Interactive Enterprise AI Solution Matcher */}
      <section className="container" style={{ marginBottom: '3.5rem' }}>
        <LiveSolutionMatcher />
      </section>

      {loading ? (
        <section className="container" style={{ marginBottom: '3.5rem' }}>
          <LoadingState />
        </section>
      ) : error ? (
        <section className="container" style={{ marginBottom: '3.5rem' }}>
          <ErrorState message={error} onRetry={loadHomeCollections} />
        </section>
      ) : (
        <>
          {/* 4. Featured AI Products */}
          <section className="container" style={{ marginBottom: '3.5rem' }}>
            <div className="section-head">
              <div>
                <h2 style={{ margin: '0 0 0.35rem', fontSize: 'clamp(1.28rem, 2.5vw, 1.55rem)' }}>
                  {featuredTitle}
                </h2>
                <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                  {featuredSubtitle}
                </p>
              </div>
              <Link to="/products" className="btn btn-secondary">
                <span>{t('home.viewAllProducts')}</span>
                {isFa ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
              </Link>
            </div>

            <div className="grid-3">
              {featuredProducts.map((product) => (
                <article
                  key={product.id}
                  className="card card-interactive"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '0.85rem',
                      }}
                    >
                      {product.badge && (
                        <span className="badge">{product.badge}</span>
                      )}
                      <span
                        className="mono"
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--text-muted)',
                        }}
                      >
                        ISIC {product.isic_code}
                      </span>
                    </div>

                    <h3 style={{ margin: '0 0 0.65rem', fontSize: '1.18rem' }}>
                      <Link to={`/products/${product.slug}`}>
                        {isFa
                          ? product.title_fa
                          : product.title_en || product.title_fa}
                      </Link>
                    </h3>

                    <p
                      style={{
                        color: 'var(--text-secondary)',
                        fontSize: '0.92rem',
                        margin: '0 0 1.25rem',
                      }}
                    >
                      {isFa
                        ? product.summary_fa
                        : product.summary_en || product.summary_fa}
                    </p>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '1rem',
                      borderTop: '1px solid var(--border-subtle)',
                    }}
                  >
                    <Link
                      to={`/products/${product.slug}`}
                      className="btn btn-ghost"
                    >
                      <span>{t('products.viewDetails')}</span>
                      {isFa ? <ArrowLeft size={15} /> : <ArrowRight size={15} />}
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* 5. Recent SEO Articles & Essays with Details */}
          <section className="container" style={{ marginBottom: '3.5rem' }}>
            <div className="section-head">
              <div>
                <h2 style={{ margin: '0 0 0.35rem', fontSize: 'clamp(1.28rem, 2.5vw, 1.55rem)' }}>
                  {articlesTitle}
                </h2>
                <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                  {articlesSubtitle}
                </p>
              </div>
              <Link to="/articles" className="btn btn-secondary">
                <span>{t('home.viewAllArticles')}</span>
                {isFa ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
              </Link>
            </div>

            <div className="grid-3">
              {recentArticles.map((article) => (
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
                          alt={
                            isFa
                              ? article.title_fa
                              : article.title_en || article.title_fa
                          }
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
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '0.5rem',
                          fontSize: '0.78rem',
                          color: 'var(--text-secondary)',
                          marginBottom: '0.7rem',
                        }}
                      >
                        <span className="badge">{article.category}</span>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                          }}
                        >
                          <Clock size={13} />
                          {formatLocaleNumber(
                            article.reading_time_minutes,
                            lang
                          )}{' '}
                          {t('articles.readingTime')}
                        </span>
                      </div>

                      <h3
                        style={{
                          margin: '0 0 0.65rem',
                          fontSize: '1.08rem',
                          lineHeight: 1.5,
                        }}
                      >
                        <Link to={`/articles/${article.slug}`}>
                          {isFa
                            ? article.title_fa
                            : article.title_en || article.title_fa}
                        </Link>
                      </h3>

                      <p
                        style={{
                          margin: 0,
                          color: 'var(--text-secondary)',
                          fontSize: '0.89rem',
                        }}
                      >
                        {isFa
                          ? article.excerpt_fa
                          : article.excerpt_en || article.excerpt_fa}
                      </p>
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '0.9rem 1.35rem',
                      borderTop: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.82rem',
                      color: 'var(--text-muted)',
                    }}
                  >
                    <time dateTime={article.published_at}>
                      {formatLocaleDate(article.published_at, lang)}
                    </time>
                    <Link
                      to={`/articles/${article.slug}`}
                      style={{
                        color: 'var(--accent-primary)',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      <BookOpen size={14} />
                      <span>{t('home.readArticle')}</span>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* 6. Official Charter Capabilities Highlight */}
          {services.length > 0 && (
            <section className="container" style={{ marginBottom: '2rem' }}>
              <div className="card section-card">
                <div className="section-head" style={{ marginBottom: '1.5rem' }}>
                  <div>
                    <h2 style={{ margin: '0 0 0.3rem', fontSize: 'clamp(1.18rem, 2.3vw, 1.35rem)' }}>
                      {charterTitle}
                    </h2>
                    <p
                      style={{
                        margin: 0,
                        color: 'var(--text-secondary)',
                        fontSize: '0.92rem',
                      }}
                    >
                      {charterSubtitle}
                    </p>
                  </div>
                  <Link to="/services" className="btn btn-secondary">
                    {t('home.charterViewAll')}
                  </Link>
                </div>

                <div className="grid-3">
                  {services.slice(0, 6).map((svc) => (
                    <div
                      key={svc.id}
                      style={{
                        padding: '1rem 1.15rem',
                        borderRadius: '0.75rem',
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      <div
                        className="mono"
                        style={{
                          fontSize: '0.74rem',
                          color: 'var(--accent-primary)',
                          marginBottom: '0.35rem',
                        }}
                      >
                        ISIC {svc.isic_code}
                      </div>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: '0.95rem',
                          marginBottom: '0.35rem',
                        }}
                      >
                        {isFa ? svc.title_fa : svc.title_en || svc.title_fa}
                      </div>
                      <div
                        style={{
                          fontSize: '0.84rem',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        {isFa
                          ? svc.ai_application_fa
                          : svc.ai_application_en || svc.ai_application_fa}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </>
      )}
    </>
  );
}
