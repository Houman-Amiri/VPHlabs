import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Globe, Menu, Moon, Search, Sun, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useThemeStore } from '../../store/useThemeStore';
import { useSiteStore } from '../../store/useSiteStore';
import { trackEvent } from '../../lib/analytics';
import { SearchModal } from './SearchModal';

export function Navbar() {
  const { t, i18n } = useTranslation();
  const isFa = i18n.language.startsWith('fa');
  const { theme, toggleTheme } = useThemeStore();
  const getText = useSiteStore((s) => s.getText);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const brandName = getText(
    'company.name_fa',
    i18n.language,
    t('brand.name')
  );
  const brandTagline = getText(
    'company.tagline_fa',
    i18n.language,
    t('brand.tagline')
  );

  function handleLanguageSwitch() {
    const nextLang = isFa ? 'en' : 'fa';
    i18n.changeLanguage(nextLang);
    trackEvent('language_switch', { lang: nextLang });
  }

  const navItems = [
    { to: '/', label: t('nav.home'), end: true },
    { to: '/products', label: t('nav.products') },
    { to: '/services', label: t('nav.services') },
    { to: '/articles', label: t('nav.articles') },
    { to: '/about', label: t('nav.about') },
    { to: '/contact', label: t('nav.contact') },
  ];

  return (
    <>
      <a href="#main-content" className="skip-link">
        {t('nav.skipToContent')}
      </a>

      <header className="site-header">
        <div className="container navbar-inner">
          <Link to="/" className="brand-link" aria-label={brandName}>
            <span className="brand-logo-box">
              <img
                src="/logo-vira.png"
                alt={brandName}
                className="brand-logo-img"
              />
            </span>
            <span className="brand-text-wrap">
              <span className="brand-title">{brandName}</span>
              <span className="brand-sub">{brandTagline}</span>
            </span>
          </Link>

          <nav className="nav-links" aria-label="منوی اصلی">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `nav-item${isActive ? ' active' : ''}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="nav-actions">
            <button
              type="button"
              className="icon-btn"
              aria-label={t('nav.searchPlaceholder')}
              onClick={() => {
                setSearchOpen(true);
                trackEvent('open_search_modal');
              }}
            >
              <Search size={16} />
            </button>

            <button
              type="button"
              className="icon-btn"
              onClick={handleLanguageSwitch}
              aria-label={isFa ? 'Switch to English' : 'تغییر زبان به فارسی'}
            >
              <Globe size={15} />
              <span>{isFa ? 'EN' : 'فا'}</span>
            </button>

            <button
              type="button"
              className="icon-btn"
              onClick={toggleTheme}
              aria-label={t('theme.toggleLabel')}
              title={theme === 'dark' ? t('theme.light') : t('theme.dark')}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <button
              type="button"
              className="icon-btn mobile-menu-btn"
              aria-expanded={mobileOpen}
              aria-label="باز کردن منوی موبایل"
              onClick={() => setMobileOpen((prev) => !prev)}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <nav className="mobile-drawer" aria-label="منوی موبایل">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `nav-item${isActive ? ' active' : ''}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        )}
      </header>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
