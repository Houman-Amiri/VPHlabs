import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSiteStore } from '../../store/useSiteStore';

export function Footer() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const isFa = lang.startsWith('fa');
  const getText = useSiteStore((s) => s.getText);

  const legalName = getText(
    'company.legal_name_fa',
    lang,
    'شرکت ویرا پردازش هومان با مسئولیت محدود'
  );
  const footerAbout = getText(
    'company.footer_about',
    lang,
    'ارائه راه‌حل‌های مبتنی بر هوش مصنوعی برای شرکت‌ها، ادارات و سازمان‌ها بر پایه اساسنامه رسمی شرکت ویرا پردازش هومان'
  );
  const regNo = getText('company.reg_number', lang, '۳۵۴۵');
  const address = getText(
    'contact.address_fa',
    lang,
    'همدان - ملایر - خیابان سعدی - کوچه مرتضی مهاجر - کوچه محبت - پلاک 4 - واحد 3'
  );
  const email = getText('contact.email', lang, 'info@vphlabs.com');
  const phone = getText('contact.phone', lang, '0912 576 2296');
  const quickLinksTitle = getText(
    'footer.quick_links_title',
    lang,
    isFa ? 'دسترسی سریع' : 'Quick Links'
  );
  const solutionsTitle = getText(
    'footer.solutions_title',
    lang,
    isFa ? 'راهکارهای کلیدی' : 'Core Solutions'
  );
  const hqTitle = getText(
    'footer.hq_title',
    lang,
    isFa ? 'ارتباط با دفتر مرکزی' : 'Headquarters'
  );
  const copyright = getText(
    'footer.copyright',
    lang,
    'کلیه حقوق مادی و معنوی این وب‌سایت متعلق به شرکت ویرا پردازش هومان با مسئولیت محدود (VPHLabs.com) می‌باشد.'
  );

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '0.9rem',
              }}
            >
              <Link to="/" className="brand-logo-box" aria-label={legalName}>
                <img
                  src="/logo-vira.png"
                  alt={legalName}
                  className="brand-logo-img brand-logo-img--footer"
                />
              </Link>
              <strong>{legalName}</strong>
            </div>
            <p
              style={{
                color: 'var(--text-secondary)',
                fontSize: '0.9rem',
                margin: '0 0 1rem',
              }}
            >
              {footerAbout}
            </p>
            <div
              style={{
                display: 'inline-flex',
                flexWrap: 'wrap',
                gap: '0.75rem',
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
                padding: '0.5rem 0.75rem',
                borderRadius: '0.6rem',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <ShieldCheck
                  size={14}
                  style={{ color: 'var(--accent-emerald)' }}
                />
                {t('about.regNo')}: <strong>{regNo}</strong>
              </span>
            </div>
          </div>

          <div>
            <h3 style={{ margin: '0 0 0.85rem', fontSize: '0.95rem' }}>
              {quickLinksTitle}
            </h3>
            <div className="footer-links-list">
              <Link to="/">{t('nav.home')}</Link>
              <Link to="/products">{t('nav.products')}</Link>
              <Link to="/services">{t('nav.services')}</Link>
              <Link to="/articles">{t('nav.articles')}</Link>
              <Link to="/about">{t('nav.about')}</Link>
              <Link to="/contact">{t('nav.contact')}</Link>
            </div>
          </div>

          <div>
            <h3 style={{ margin: '0 0 0.85rem', fontSize: '0.95rem' }}>
              {solutionsTitle}
            </h3>
            <div className="footer-links-list">
              <Link to="/products/vira-docmind-ai">
                {isFa ? 'ویرا داک‌مایند (RAG فارسی)' : 'VIRA DocMind AI'}
              </Link>
              <Link to="/products/vira-autoguard-industrial">
                {isFa ? 'ویرا اتوگارد (صنعت هوشمند)' : 'VIRA AutoGuard AI'}
              </Link>
              <Link to="/products/vira-deskyar-copilot">
                {isFa ? 'ویرا دسک‌یار (میز خدمت)' : 'VIRA DeskYar Copilot'}
              </Link>
              <Link to="/products/vira-coreops-llm-gateway">
                {isFa ? 'ویرا کورآپس (درگاه LLM)' : 'VIRA CoreOps Gateway'}
              </Link>
            </div>
          </div>

          <div>
            <h3 style={{ margin: '0 0 0.85rem', fontSize: '0.95rem' }}>
              {hqTitle}
            </h3>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem',
                fontSize: '0.86rem',
                color: 'var(--text-secondary)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  alignItems: 'flex-start',
                }}
              >
                <MapPin
                  size={16}
                  style={{
                    flexShrink: 0,
                    marginTop: '0.25rem',
                    color: 'var(--accent-primary)',
                  }}
                />
                <span>{address}</span>
              </div>
              <div
                style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}
              >
                <Phone
                  size={15}
                  style={{ flexShrink: 0, color: 'var(--accent-primary)' }}
                />
                <a href={`tel:${phone.replace(/\s+/g, '')}`} dir="ltr">
                  {phone}
                </a>
              </div>
              <div
                style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}
              >
                <Mail
                  size={15}
                  style={{ flexShrink: 0, color: 'var(--accent-primary)' }}
                />
                <a href={`mailto:${email}`} className="mono">
                  {email}
                </a>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: '2.5rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            fontSize: '0.82rem',
            color: 'var(--text-muted)',
          }}
        >
          <span>{copyright}</span>
          <span className="mono">VPHLabs.com</span>
        </div>
      </div>
    </footer>
  );
}
