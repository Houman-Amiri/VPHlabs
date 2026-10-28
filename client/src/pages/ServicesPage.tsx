import { Link } from 'react-router-dom';
import {
  Building2,
  CircuitBoard,
  Code2,
  Compass,
  Cpu,
  Database,
  Factory,
  GraduationCap,
  Headphones,
  Layers,
  Network,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSiteStore } from '../store/useSiteStore';
import { SeoHead } from '../components/common/SeoHead';
import { LoadingState } from '../components/common/UiStates';

const ICON_MAP: Record<string, typeof Cpu> = {
  Compass,
  Code2,
  Layers,
  Cpu,
  Factory,
  CircuitBoard,
  Network,
  ShieldCheck,
  Database,
  GraduationCap,
  Headphones,
  Building2,
};

export function ServicesPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const isFa = lang.startsWith('fa');
  const { services, isLoading, getText } = useSiteStore();

  const pageTitle = getText('services.page_title', lang, t('services.title'));
  const pageSubtitle = getText(
    'services.page_subtitle',
    lang,
    t('services.subtitle')
  );
  const ctaTitle = getText('services.cta_title', lang, t('services.ctaTitle'));
  const ctaSubtitle = getText(
    'services.cta_subtitle',
    lang,
    isFa
      ? 'تیم مهندسی ویرا پردازش هومان آماده عقد قراردادهای مشاوره، پیمانکاری و تولید نرم‌افزار سفارشی با شرکت‌ها و سازمان‌هاست.'
      : 'V.I.R.A Pardazesh Hoomaan delivers SLA-backed enterprise software, AI consulting, and infrastructure projects.'
  );
  const ctaButton = getText(
    'services.cta_button',
    lang,
    t('services.ctaButton')
  );

  return (
    <div className="container page-bottom-space">
      <SeoHead
        title={pageTitle}
        description={pageSubtitle}
        canonicalPath="/services"
      />

      <header className="page-header">
        <h1 className="page-title">{pageTitle}</h1>
        <p className="page-subtitle">{pageSubtitle}</p>
      </header>

      {isLoading && services.length === 0 ? (
        <LoadingState />
      ) : (
        <div className="grid-3">
          {services.map((svc) => {
            const Icon = ICON_MAP[svc.icon_name] || Cpu;
            return (
              <article
                key={svc.id}
                className="card card-interactive"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '1rem',
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '1rem',
                    }}
                  >
                    <div
                      style={{
                        width: '2.7rem',
                        height: '2.7rem',
                        borderRadius: '0.7rem',
                        background: 'var(--bg-subtle)',
                        border: '1px solid var(--border-strong)',
                        color: 'var(--accent-primary)',
                        display: 'grid',
                        placeItems: 'center',
                      }}
                    >
                      <Icon size={20} />
                    </div>
                    {svc.isic_code && (
                      <span
                        className="mono"
                        style={{
                          fontSize: '0.76rem',
                          color: 'var(--text-muted)',
                          padding: '0.2rem 0.55rem',
                          borderRadius: '0.4rem',
                          border: '1px solid var(--border-subtle)',
                        }}
                      >
                        ISIC {svc.isic_code}
                      </span>
                    )}
                  </div>

                  <h2 style={{ margin: '0 0 0.65rem', fontSize: '1.1rem', lineHeight: 1.45 }}>
                    {isFa ? svc.title_fa : svc.title_en || svc.title_fa}
                  </h2>

                  <p
                    style={{
                      margin: 0,
                      color: 'var(--text-secondary)',
                      fontSize: '0.9rem',
                    }}
                  >
                    {isFa
                      ? svc.description_fa
                      : svc.description_en || svc.description_fa}
                  </p>
                </div>

                {(svc.ai_application_fa || svc.ai_application_en) && (
                  <div
                    style={{
                      padding: '0.75rem 0.9rem',
                      borderRadius: '0.65rem',
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.83rem',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        color: 'var(--accent-primary)',
                        fontWeight: 700,
                        marginBottom: '0.2rem',
                      }}
                    >
                      <Sparkles size={13} />
                      <span>{t('services.aiCapability')}</span>
                    </div>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {isFa
                        ? svc.ai_application_fa
                        : svc.ai_application_en || svc.ai_application_fa}
                    </span>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      <div
        className="card section-head section-card"
        style={{
          marginTop: '2.5rem',
          marginBottom: 0,
          alignItems: 'center',
        }}
      >
        <div>
          <h2 style={{ margin: '0 0 0.35rem', fontSize: 'clamp(1.16rem, 2.3vw, 1.3rem)' }}>
            {ctaTitle}
          </h2>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            {ctaSubtitle}
          </p>
        </div>
        <Link to="/contact" className="btn btn-primary">
          {ctaButton}
        </Link>
      </div>
    </div>
  );
}
