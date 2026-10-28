import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Building2, Cpu, Factory, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { trackEvent } from '../../lib/analytics';
import { useSiteStore } from '../../store/useSiteStore';

interface SectorBlueprint {
  id: string;
  labelFa: string;
  labelEn: string;
  icon: typeof Building2;
  architectureFa: string;
  architectureEn: string;
  impactFa: string;
  impactEn: string;
  deploymentFa: string;
  deploymentEn: string;
  recommendedSlug: string;
  recommendedNameFa: string;
  recommendedNameEn: string;
}

const BLUEPRINTS: SectorBlueprint[] = [
  {
    id: 'government',
    labelFa: 'ادارات، سازمان‌ها و بانک‌ها',
    labelEn: 'Government Offices & Banking',
    icon: Building2,
    architectureFa:
      'استقرار بومی سامانه جستجوی معنایی اسناد (RAG فارسی) + دستیار هوشمند پاسخگویی ارباب‌رجوع روی شبکه داخلی ایزوله.',
    architectureEn:
      'Air-gapped On-Premise Persian RAG Document Intelligence + Citizen Helpdesk Copilot inside private VLANs.',
    impactFa: '۷۰٪ کاهش زمان پاسخگویی به استعلامات و مکاتبات اداری',
    impactEn: '70% faster administrative & regulatory document retrieval',
    deploymentFa: 'سرور داخلی سازمان (On-Premise) — بدون خروج داده',
    deploymentEn: '100% On-Premise Sovereign Deployment',
    recommendedSlug: 'vira-docmind-ai',
    recommendedNameFa: 'ویرا داک‌مایند (VIRA DocMind AI)',
    recommendedNameEn: 'VIRA DocMind AI',
  },
  {
    id: 'industrial',
    labelFa: 'صنایع، کارخانجات و انرژی',
    labelEn: 'Manufacturing & Industrial Plants',
    icon: Factory,
    architectureFa:
      'اتصال امن پروتکل‌های PLC/SCADA به موتور تشخیص ناهنجاری سری‌زمانی در لبه (Edge AI) جهت نگهداری پیش‌بینانه خطوط تولید.',
    architectureEn:
      'Non-intrusive OPC-UA/Modbus sensor ingestion with Edge AI anomaly detection for predictive maintenance.',
    impactFa: '۴۵٪ کاهش توقفات اضطراری و هزینه‌های تعمیرات ناگهانی',
    impactEn: '45% reduction in unplanned line downtime',
    deploymentFa: 'پردازش لبه در سایت کارخانه با تأخیر زیر ۵۰ میلی‌ثانیه',
    deploymentEn: 'Sub-50ms Edge Compute Gateway on Factory Floor',
    recommendedSlug: 'vira-autoguard-industrial',
    recommendedNameFa: 'ویرا اتوگارد صنعتی (VIRA AutoGuard AI)',
    recommendedNameEn: 'VIRA AutoGuard AI',
  },
  {
    id: 'enterprise',
    labelFa: 'شرکت‌های بزرگ و هلدینگ‌ها',
    labelEn: 'Enterprises & Holdings',
    icon: Cpu,
    architectureFa:
      'هوش تجاری محاوره‌ای فارسی برای مدیران ارشد + اتوماسیون هوشمند تیکتینگ و تحلیل عملکرد واحدها.',
    architectureEn:
      'Conversational Persian Executive BI + Automated Multi-Department Workflow Copilot.',
    impactFa: 'گزارش‌گیری لحظه‌ای مدیریتی از پایگاه‌های داده جزیره‌ای',
    impactEn: 'Real-time executive analytics across siloed SQL databases',
    deploymentFa: 'ابر خصوصی سازمانی با کنترل دسترسی نقش‌محور (RBAC)',
    deploymentEn: 'Private Enterprise Cloud with Active Directory RBAC',
    recommendedSlug: 'vira-corpinsight-bi',
    recommendedNameFa: 'ویرا کورپ‌اینسایت (VIRA CorpInsight BI)',
    recommendedNameEn: 'VIRA CorpInsight BI',
  },
  {
    id: 'infrastructure',
    labelFa: 'مراکز داده و امنیت شبکه',
    labelEn: 'Data Centers & Network Ops',
    icon: Shield,
    architectureFa:
      'پایش هوشمند ترافیک شبکه (AIOps) به همراه درگاه متمرکز حاکمیت، ممیزی و فیلتر داده‌های حساس مدل‌های زبانی.',
    architectureEn:
      'AIOps Network Observability paired with Centralized LLM Governance & PII Redaction Gateway.',
    impactFa: '۹۰٪ کاهش هشدارهای کاذب شبکه و ممیزی کامل ترافیک هوش مصنوعی',
    impactEn: '90% reduction in alert fatigue + full AI audit trail',
    deploymentFa: 'کلاستر زیرساخت مرکزی با لاگ ممیزی استاندارد امنیتی',
    deploymentEn: 'High-Availability Core Cluster with Security Audit Logs',
    recommendedSlug: 'vira-coreops-llm-gateway',
    recommendedNameFa: 'ویرا کورآپس (VIRA CoreOps Gateway)',
    recommendedNameEn: 'VIRA CoreOps Gateway',
  },
];

export function LiveSolutionMatcher() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const isFa = lang.startsWith('fa');
  const getText = useSiteStore((s) => s.getText);
  const [selectedId, setSelectedId] = useState<string>('government');

  const active =
    BLUEPRINTS.find((b) => b.id === selectedId) || BLUEPRINTS[0];

  const matcherBadge = getText('home.matcher_badge', lang, t('home.matcherBadge'));
  const matcherTitle = getText('home.matcher_title', lang, t('home.matcherTitle'));
  const matcherSubtitle = getText(
    'home.matcher_subtitle',
    lang,
    t('home.matcherSubtitle')
  );

  return (
    <div className="card section-card">
      <div style={{ marginBottom: '1.35rem' }}>
        <span className="badge" style={{ marginBottom: '0.75rem' }}>
          <span className="pulse-dot" />
          <span>{matcherBadge}</span>
        </span>
        <h2 style={{ margin: '0.25rem 0 0.5rem', fontSize: 'clamp(1.22rem, 2.5vw, 1.5rem)' }}>
          {matcherTitle}
        </h2>
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.94rem' }}>
          {matcherSubtitle}
        </p>
      </div>

      <div
        role="tablist"
        aria-label={matcherTitle}
        className="matcher-tabs"
      >
        {BLUEPRINTS.map((item) => {
          const Icon = item.icon;
          const isSelected = item.id === active.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              className="matcher-tab-btn"
              onClick={() => {
                setSelectedId(item.id);
                trackEvent('solution_matcher_select', { sector: item.id });
              }}
              style={{
                background: isSelected ? 'var(--bg-subtle)' : 'var(--bg-elevated)',
                color: isSelected ? 'var(--accent-primary)' : 'var(--text-primary)',
                border: `1px solid ${
                  isSelected ? 'var(--border-strong)' : 'var(--border-subtle)'
                }`,
              }}
            >
              <Icon size={19} />
              <span>{isFa ? item.labelFa : item.labelEn}</span>
            </button>
          );
        })}
      </div>

      <div role="tabpanel" className="matcher-panel">
        <div className="grid-2" style={{ alignItems: 'center' }}>
          <div>
            <div
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                color: 'var(--accent-primary)',
                marginBottom: '0.4rem',
              }}
            >
              {isFa ? 'معماری پیشنهادی ویرا پردازش هومان' : 'Recommended VPH Architecture'}
            </div>
            <p style={{ margin: '0 0 1rem', fontSize: '0.98rem', fontWeight: 500 }}>
              {isFa ? active.architectureFa : active.architectureEn}
            </p>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.45rem',
                fontSize: '0.88rem',
                color: 'var(--text-secondary)',
              }}
            >
              <div>
                <strong style={{ color: 'var(--accent-emerald)' }}>
                  {isFa ? 'دستاورد کلیدی:' : 'Expected Impact:'}
                </strong>{' '}
                {isFa ? active.impactFa : active.impactEn}
              </div>
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>
                  {isFa ? 'الگوی استقرار:' : 'Deployment Model:'}
                </strong>{' '}
                {isFa ? active.deploymentFa : active.deploymentEn}
              </div>
            </div>
          </div>

          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '0.85rem',
              padding: '1.15rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem',
            }}
          >
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {isFa ? 'محصول پیشنهادی مرتبط' : 'Recommended Flagship Product'}
            </div>
            <div style={{ fontSize: '1.06rem', fontWeight: 700 }}>
              {isFa ? active.recommendedNameFa : active.recommendedNameEn}
            </div>
            <div className="cta-actions">
              <Link
                to={`/products/${active.recommendedSlug}`}
                className="btn btn-primary"
              >
                <span>{t('products.viewDetails')}</span>
                {isFa ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
              </Link>
              <Link
                to={`/contact?department=ai-consulting&subject=${encodeURIComponent(
                  isFa
                    ? `مشاوره استقرار ${active.recommendedNameFa}`
                    : `Consultation: ${active.recommendedNameEn}`
                )}`}
                className="btn btn-secondary"
              >
                {t('home.requestConsult')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
