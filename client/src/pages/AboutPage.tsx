import { Link } from 'react-router-dom';
import {
  Award,
  Building,
  CheckCircle2,
  ExternalLink,
  FileCheck2,
  Instagram,
  Linkedin,
  Quote,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSiteStore } from '../store/useSiteStore';
import { SeoHead } from '../components/common/SeoHead';

export function AboutPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const isFa = lang.startsWith('fa');
  const { services, teamMembers, getText } = useSiteStore();

  const pageBadge = getText(
    'about.story_badge',
    lang,
    'V.I.R.A Pardazesh Hoomaan (VPH Labs)'
  );
  const storyTitle = getText(
    'about.story_title',
    lang,
    'مهندسی آینده هوشمند برای سازمان‌های پیشرو ایران'
  );
  const storyBody = getText(
    'about.story_body',
    lang,
    'شرکت ویرا پردازش هومان با مسئولیت محدود با هدف ارائه راهکارهای مبتنی بر هوش مصنوعی برای شرکت‌ها، ادارات و سازمان‌ها تأسیس شده است.'
  );
  const legalCardTitle = getText(
    'about.legal_card_title',
    lang,
    t('about.legalCardTitle')
  );
  const hqCardTitle = getText(
    'about.hq_section_title',
    lang,
    isFa
      ? 'نشانی دفتر مرکزی و اقامتگاه قانونی شرکت'
      : 'Corporate Headquarters Address'
  );
  const charterSectionTitle = getText(
    'about.charter_title',
    lang,
    t('about.charterSectionTitle')
  );
  const teamSectionTitle = getText(
    'about.team_title',
    lang,
    isFa ? 'معرفی مدیران و همکاران ویرا پردازش هومان' : 'Meet Our Leadership & Team'
  );
  const teamSectionSubtitle = getText(
    'about.team_subtitle',
    lang,
    isFa
      ? 'تیم متخصص مهندسی هوش مصنوعی، معماری نرم‌افزار و زیرساخت سازمانی در شرکت ویرا پردازش هومان'
      : 'AI engineers, enterprise software architects, and infrastructure specialists driving VPH Labs'
  );
  const ceoQuote = getText(
    'about.ceo_quote',
    lang,
    'هدف ما تبدیل هوش مصنوعی به ابزاری امن، بومی و ارزش‌آفرین در ترازنامه سازمان‌هاست.'
  );
  const ceoRole = getText(
    'about.ceo_role',
    lang,
    isFa
      ? 'مدیرعامل شرکت ویرا پردازش هومان'
      : 'CEO, V.I.R.A Pardazesh Hoomaan'
  );
  const ceoName = getText('company.ceo_name', lang, 'شهرام امیری');

  return (
    <div className="container" style={{ paddingBottom: '4rem' }}>
      <SeoHead
        title={`${t('nav.about')} — ${getText('company.legal_name_fa', lang, 'شرکت ویرا پردازش هومان')}`}
        description={storyBody}
        canonicalPath="/about"
      />

      <header className="page-header">
        <span className="badge" style={{ marginBottom: '0.75rem' }}>
          <ShieldCheck size={14} />
          <span>{pageBadge}</span>
        </span>
        <h1 className="page-title">{storyTitle}</h1>
        <p className="page-subtitle">{storyBody}</p>
      </header>

      <div
        className="grid-2"
        style={{ marginBottom: '2.5rem', alignItems: 'stretch' }}
      >
        {/* Official Legal Registration Profile (without شناسه ملی & شماره مکانیزه) */}
        <section className="card">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              marginBottom: '1.25rem',
            }}
          >
            <FileCheck2 size={22} style={{ color: 'var(--accent-primary)' }} />
            <h2 style={{ margin: 0, fontSize: '1.22rem' }}>{legalCardTitle}</h2>
          </div>

          <dl
            style={{
              margin: 0,
              display: 'grid',
              gridTemplateColumns: '1fr 1.25fr',
              rowGap: '1rem',
              columnGap: '1rem',
              fontSize: '0.94rem',
            }}
          >
            <dt style={{ color: 'var(--text-secondary)' }}>
              {t('about.entityType')}:
            </dt>
            <dd style={{ margin: 0, fontWeight: 600 }}>
              {getText(
                'company.legal_name_fa',
                lang,
                t('about.entityTypeValue')
              )}
            </dd>

            <dt style={{ color: 'var(--text-secondary)' }}>
              {t('about.regNo')}:
            </dt>
            <dd
              style={{
                margin: 0,
                fontWeight: 700,
                color: 'var(--accent-primary)',
              }}
            >
              {getText('company.reg_number', lang, '۳۵۴۵')}
            </dd>

            <dt style={{ color: 'var(--text-secondary)' }}>
              {t('about.ceo')}:
            </dt>
            <dd style={{ margin: 0, fontWeight: 700 }}>{ceoName}</dd>

            <dt style={{ color: 'var(--text-secondary)' }}>
              {t('about.postalCode')}:
            </dt>
            <dd style={{ margin: 0 }} className="mono">
              {getText('contact.postal_code', lang, '6571611860')}
            </dd>
          </dl>
        </section>

        {/* CEO Statement & Vision */}
        <section
          className="card"
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background:
              'linear-gradient(155deg, var(--bg-surface) 0%, var(--bg-elevated) 100%)',
          }}
        >
          <div>
            <Quote
              size={30}
              style={{
                color: 'var(--accent-primary)',
                marginBottom: '0.85rem',
                opacity: 0.85,
              }}
            />
            <blockquote
              style={{
                margin: '0 0 1.5rem',
                fontSize: '1.08rem',
                fontWeight: 500,
                lineHeight: 1.9,
              }}
            >
              «{ceoQuote}»
            </blockquote>
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
            <div>
              <div style={{ fontWeight: 700 }}>{ceoName}</div>
              <div
                style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}
              >
                {ceoRole}
              </div>
            </div>
            <Award size={24} style={{ color: 'var(--accent-emerald)' }} />
          </div>
        </section>
      </div>

      {/* Team / Colleagues Introduction Section (معرفی همکاران) */}
      {teamMembers.length > 0 && (
        <section style={{ marginBottom: '2.5rem' }}>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              gap: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            <div>
              <span className="badge" style={{ marginBottom: '0.6rem' }}>
                <Users size={14} />
                <span>{isFa ? 'همکاران ما' : 'Our Team'}</span>
              </span>
              <h2 style={{ margin: '0 0 0.35rem', fontSize: '1.45rem' }}>
                {teamSectionTitle}
              </h2>
              <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                {teamSectionSubtitle}
              </p>
            </div>
          </div>

          <div className="grid-2">
            {teamMembers.map((member) => {
              const displayName = isFa
                ? member.full_name_fa
                : member.full_name_en || member.full_name_fa;
              const displayRole = isFa
                ? member.role_fa
                : member.role_en || member.role_fa;
              const displayBio = isFa
                ? member.bio_fa
                : member.bio_en || member.bio_fa;
              const initial = (displayName || 'V').trim().charAt(0);

              return (
                <article
                  key={member.id}
                  className="card card-interactive team-card"
                >
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        marginBottom: '1rem',
                      }}
                    >
                      {member.avatar_url ? (
                        <img
                          src={member.avatar_url}
                          alt={displayName}
                          className="team-avatar"
                          loading="lazy"
                        />
                      ) : (
                        <div className="team-avatar-fallback" aria-hidden="true">
                          {initial}
                        </div>
                      )}

                      <div>
                        <h3 style={{ margin: '0 0 0.25rem', fontSize: '1.12rem' }}>
                          {displayName}
                        </h3>
                        <div
                          style={{
                            fontSize: '0.86rem',
                            fontWeight: 600,
                            color: 'var(--accent-primary)',
                          }}
                        >
                          {displayRole}
                        </div>
                      </div>
                    </div>

                    {displayBio && (
                      <p
                        style={{
                          margin: 0,
                          fontSize: '0.91rem',
                          color: 'var(--text-secondary)',
                          lineHeight: 1.8,
                        }}
                      >
                        {displayBio}
                      </p>
                    )}
                  </div>

                  {(member.linkedin_url || member.instagram_url) && (
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.55rem',
                        paddingTop: '0.9rem',
                        borderTop: '1px solid var(--border-subtle)',
                      }}
                    >
                      {member.linkedin_url && (
                        <a
                          href={member.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="social-pill"
                          aria-label={`LinkedIn — ${displayName}`}
                        >
                          <Linkedin
                            size={15}
                            style={{ color: '#0a66c2', flexShrink: 0 }}
                          />
                          <span>LinkedIn</span>
                          <ExternalLink size={12} style={{ opacity: 0.65 }} />
                        </a>
                      )}
                      {member.instagram_url && (
                        <a
                          href={member.instagram_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="social-pill"
                          aria-label={`Instagram — ${displayName}`}
                        >
                          <Instagram
                            size={15}
                            style={{ color: '#e1306c', flexShrink: 0 }}
                          />
                          <span>Instagram</span>
                          <ExternalLink size={12} style={{ opacity: 0.65 }} />
                        </a>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* Registered Headquarters */}
      <section className="card" style={{ marginBottom: '2.5rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            marginBottom: '0.65rem',
          }}
        >
          <Building size={20} style={{ color: 'var(--accent-primary)' }} />
          <h2 style={{ margin: 0, fontSize: '1.15rem' }}>{hqCardTitle}</h2>
        </div>
        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
          {getText(
            'contact.address_fa',
            lang,
            'همدان - ملایر - خیابان سعدی - کوچه مرتضی مهاجر - کوچه محبت - پلاک 4 - واحد 3'
          )}
        </p>
      </section>

      {/* All 12 Charter Clauses */}
      <section className="card">
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '1.25rem' }}>
            {charterSectionTitle}
          </h2>
          <Link to="/contact" className="btn btn-primary">
            {t('home.requestConsult')}
          </Link>
        </div>

        <div className="grid-2">
          {services.map((svc) => (
            <div
              key={svc.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.65rem',
                padding: '0.85rem 1rem',
                borderRadius: '0.7rem',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <CheckCircle2
                size={18}
                style={{
                  color: 'var(--accent-emerald)',
                  flexShrink: 0,
                  marginTop: '0.2rem',
                }}
              />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.94rem' }}>
                  {isFa ? svc.title_fa : svc.title_en || svc.title_fa}
                </div>
                {svc.isic_code && (
                  <span
                    className="mono"
                    style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}
                  >
                    کد آیسیک: {svc.isic_code}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
