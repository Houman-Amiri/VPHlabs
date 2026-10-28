import { useEffect } from 'react';

interface SeoHeadProps {
  title: string;
  description?: string;
  keywords?: string;
  canonicalPath?: string;
  ogType?: 'website' | 'article';
  ogImage?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

function setOrCreateMeta(attr: 'name' | 'property', key: string, content: string) {
  if (!content || typeof document === 'undefined') return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/**
 * Persian & Bilingual SEO manager updating document title, meta tags,
 * canonical link, OpenGraph attributes, and Schema.org JSON-LD structured data.
 */
export function SeoHead({
  title,
  description,
  keywords,
  canonicalPath,
  ogType = 'website',
  ogImage = '/banners/banner-1.jpg',
  jsonLd,
}: SeoHeadProps) {
  useEffect(() => {
    const fullTitle = title.includes('ویرا پردازش هومان') || title.includes('VPH')
      ? title
      : `${title} | ویرا پردازش هومان (VPHLabs.com)`;

    document.title = fullTitle;

    if (description) {
      setOrCreateMeta('name', 'description', description);
      setOrCreateMeta('property', 'og:description', description);
    }
    if (keywords) {
      setOrCreateMeta('name', 'keywords', keywords);
    }
    setOrCreateMeta('property', 'og:title', fullTitle);
    setOrCreateMeta('property', 'og:type', ogType);
    setOrCreateMeta('property', 'og:image', ogImage);

    if (canonicalPath && typeof window !== 'undefined') {
      const href = `https://vphlabs.com${canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`}`;
      let link = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', href);
    }

    let scriptEl: HTMLScriptElement | null = null;
    if (jsonLd) {
      scriptEl = document.createElement('script');
      scriptEl.type = 'application/ld+json';
      scriptEl.setAttribute('data-vph-jsonld', 'true');
      scriptEl.text = JSON.stringify(jsonLd);
      document.head.appendChild(scriptEl);
    }

    return () => {
      if (scriptEl && scriptEl.parentNode) {
        scriptEl.parentNode.removeChild(scriptEl);
      }
    };
  }, [title, description, keywords, canonicalPath, ogType, ogImage, jsonLd]);

  return null;
}
