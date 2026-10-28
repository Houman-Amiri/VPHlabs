import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { trackEvent } from '../../lib/analytics';
import type { Banner } from '../../types';

interface BannerCarouselProps {
  banners: Banner[];
}

/**
 * Home Screen Banner Carousel:
 * - Displays clickable wide banner slides with corporate charter (اساسنامه) activity headlines & descriptions
 * - Fully editable via Admin Panel (/admin/banners)
 * - Two navigation arrows to move between slides
 */
export function BannerCarousel({ banners }: BannerCarouselProps) {
  const { t, i18n } = useTranslation();
  const isFa = i18n.language.startsWith('fa');
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const count = banners.length;

  const goPrev = useCallback(() => {
    if (count <= 1) return;
    setActiveIndex((idx) => (idx - 1 + count) % count);
  }, [count]);

  const goNext = useCallback(() => {
    if (count <= 1) return;
    setActiveIndex((idx) => (idx + 1) % count);
  }, [count]);

  useEffect(() => {
    if (activeIndex >= count && count > 0) {
      setActiveIndex(0);
    }
  }, [activeIndex, count]);

  useEffect(() => {
    if (count <= 1 || paused) return;
    const timer = setInterval(goNext, 6500);
    return () => clearInterval(timer);
  }, [count, paused, goNext]);

  if (count === 0) return null;

  const current = banners[activeIndex] || banners[0];
  const altText = isFa ? current.alt_fa : current.alt_en || current.alt_fa;
  const badgeText = isFa
    ? current.badge_fa
    : current.badge_en || current.badge_fa;
  const titleText = isFa
    ? current.title_fa
    : current.title_en || current.title_fa;
  const subtitleText = isFa
    ? current.subtitle_fa
    : current.subtitle_en || current.subtitle_fa;
  const hasOverlayText = Boolean(badgeText || titleText || subtitleText);
  const isExternal = /^https?:\/\//i.test(current.target_url);

  const slideInner = (
    <>
      <img
        src={current.image_url}
        alt={altText}
        className="banner-slide-img"
        loading={activeIndex === 0 ? 'eager' : 'lazy'}
        decoding="async"
      />
      {hasOverlayText && (
        <div className="banner-slide-overlay">
          {badgeText && (
            <span className="banner-badge">
              <Sparkles size={13} />
              <span>{badgeText}</span>
            </span>
          )}
          {titleText && <h2 className="banner-title">{titleText}</h2>}
          {subtitleText && <p className="banner-subtitle">{subtitleText}</p>}
        </div>
      )}
    </>
  );

  return (
    <section
      className="container banner-carousel-wrapper"
      aria-roledescription="carousel"
      aria-label={
        isFa
          ? 'گالری بنر فعالیت‌های اساسنامه ویرا پردازش هومان'
          : 'VPH Labs Charter Activities Banner Carousel'
      }
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="banner-carousel">
        {isExternal ? (
          <a
            href={current.target_url}
            target="_blank"
            rel="noopener noreferrer"
            className="banner-slide-link"
            onClick={() =>
              trackEvent('banner_click', {
                bannerId: current.id,
                target: current.target_url,
              })
            }
          >
            {slideInner}
          </a>
        ) : (
          <Link
            to={current.target_url || '/products'}
            className="banner-slide-link"
            onClick={() =>
              trackEvent('banner_click', {
                bannerId: current.id,
                target: current.target_url,
              })
            }
          >
            {slideInner}
          </Link>
        )}

        {count > 1 && (
          <>
            <button
              type="button"
              className="banner-arrow banner-arrow--prev"
              aria-label={t('home.bannerPrev')}
              onClick={goPrev}
            >
              {isFa ? <ChevronRight size={22} /> : <ChevronLeft size={22} />}
            </button>
            <button
              type="button"
              className="banner-arrow banner-arrow--next"
              aria-label={t('home.bannerNext')}
              onClick={goNext}
            >
              {isFa ? <ChevronLeft size={22} /> : <ChevronRight size={22} />}
            </button>
          </>
        )}
      </div>
    </section>
  );
}
