import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CheckCircle2,
  Clock,
  Copy,
  Mail,
  MapPin,
  Phone,
  Send,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import apiClient from '../lib/axios';
import { trackEvent } from '../lib/analytics';
import { contactFormSchema, type ContactFormValues } from '../schemas/forms';
import { useSiteStore } from '../store/useSiteStore';
import { useToastStore } from '../store/useToastStore';
import { SeoHead } from '../components/common/SeoHead';
import type { ApiSuccessResponse } from '../types';

export function ContactPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const isFa = lang.startsWith('fa');
  const [searchParams] = useSearchParams();
  const getText = useSiteStore((s) => s.getText);
  const addToast = useToastStore((s) => s.addToast);

  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const initialProductId = searchParams.get('product_id')
    ? Number(searchParams.get('product_id'))
    : null;
  const initialSubject = searchParams.get('subject') || '';
  const initialDept = (searchParams.get('department') ||
    'ai-consulting') as ContactFormValues['department'];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      full_name: '',
      organization: '',
      email: '',
      phone: '',
      department: initialDept,
      product_id: initialProductId,
      subject: initialSubject,
      message: '',
    },
  });

  async function onSubmit(values: ContactFormValues) {
    setSubmitError(null);
    try {
      const res = await apiClient.post<
        ApiSuccessResponse<{ id: number; message: string }>
      >('/contacts', values);
      setSubmittedMessage(res.data.data.message);
      trackEvent('contact_form_submit', { department: values.department });
      addToast('درخواست شما با موفقیت ثبت شد.', 'success');
      reset();
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : 'خطا در ارسال پیام. مجدداً تلاش کنید.'
      );
    }
  }

  const pageTitle = getText('contact.page_title', lang, t('contact.title'));
  const pageSubtitle = getText(
    'contact.page_subtitle',
    lang,
    t('contact.subtitle')
  );
  const formTitle = getText('contact.form_title', lang, t('contact.formTitle'));
  const hqTitle = getText('contact.hq_title', lang, t('contact.hqTitle'));
  const workflowTitle = getText(
    'contact.onboarding_title',
    lang,
    isFa
      ? 'فرآیند آغاز همکاری سازمانی با ویرا پردازش هومان'
      : 'Enterprise Onboarding Workflow'
  );
  const workflowStep1 = getText(
    'contact.onboarding_step_1',
    lang,
    isFa
      ? 'برگزاری جلسه نیازسنجی فنی و امضای تفاهم‌نامه محرمانگی (NDA)'
      : 'Technical discovery session under mutual NDA'
  );
  const workflowStep2 = getText(
    'contact.onboarding_step_2',
    lang,
    isFa
      ? 'ارائه دمو زنده و پیشنهاد فنی-مالی منطبق بر زیرساخت سازمان'
      : 'Live tailored demo & on-premise architecture proposal'
  );
  const workflowStep3 = getText(
    'contact.onboarding_step_3',
    lang,
    isFa
      ? 'استقرار پایلوت، آموزش کارشناسان و پشتیبانی مستمر SLA'
      : 'Pilot rollout, staff training & SLA-backed support'
  );

  const address = getText(
    'contact.address_fa',
    lang,
    'همدان - ملایر - خیابان سعدی - کوچه مرتضی مهاجر - کوچه محبت - پلاک 4 - واحد 3'
  );
  const postalCode = getText('contact.postal_code', lang, '6571611860');
  const phone = getText('contact.phone', lang, '0912 576 2296');
  const email = getText('contact.email', lang, 'info@vphlabs.com');
  const workingHours = getText(
    'contact.working_hours',
    lang,
    'شنبه تا چهارشنبه: ۸:۰۰ الی ۱۷:۰۰ | پنجشنبه‌ها: ۸:۰۰ الی ۱۳:۰۰'
  );

  async function copyText(val: string, label: string) {
    try {
      await navigator.clipboard.writeText(val);
      addToast(`${label} کپی شد.`, 'success');
    } catch {
      // Ignore clipboard restriction
    }
  }

  return (
    <div className="container page-bottom-space">
      <SeoHead
        title={pageTitle}
        description={pageSubtitle}
        canonicalPath="/contact"
      />

      <header className="page-header">
        <h1 className="page-title">{pageTitle}</h1>
        <p className="page-subtitle">{pageSubtitle}</p>
      </header>

      <div className="grid-2 detail-grid" style={{ alignItems: 'start' }}>
        {/* RHF + Zod Validated Contact Form */}
        <section className="card">
          <h2
            style={{
              marginTop: 0,
              marginBottom: '1.35rem',
              fontSize: '1.25rem',
            }}
          >
            {formTitle}
          </h2>

          {submittedMessage ? (
            <div
              role="status"
              style={{
                padding: '2rem 1.25rem',
                textAlign: 'center',
                background: 'var(--bg-elevated)',
                borderRadius: '0.85rem',
                border: '1px solid var(--border-strong)',
              }}
            >
              <CheckCircle2
                size={40}
                style={{
                  color: 'var(--accent-emerald)',
                  marginInline: 'auto',
                  marginBottom: '0.85rem',
                }}
              />
              <h3 style={{ margin: '0 0 0.5rem' }}>{t('contact.successTitle')}</h3>
              <p
                style={{
                  color: 'var(--text-secondary)',
                  marginBottom: '1.5rem',
                }}
              >
                {submittedMessage}
              </p>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSubmittedMessage(null)}
              >
                {t('contact.sendAnother')}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              {submitError && (
                <div
                  role="alert"
                  style={{
                    padding: '0.85rem 1rem',
                    marginBottom: '1rem',
                    borderRadius: '0.6rem',
                    background: 'rgba(248, 113, 113, 0.12)',
                    border: '1px solid rgba(248, 113, 113, 0.35)',
                    color: 'var(--accent-danger)',
                    fontSize: '0.9rem',
                  }}
                >
                  {submitError}
                </div>
              )}

              <div className="grid-2" style={{ gap: '1rem' }}>
                <div className="form-group">
                  <label htmlFor="full_name" className="form-label">
                    {t('contact.fullName')} *
                  </label>
                  <input
                    id="full_name"
                    type="text"
                    className="form-input"
                    placeholder={
                      isFa ? 'مثلاً: مهندس سارا محمدی' : 'e.g. Sara Mohammadi'
                    }
                    {...register('full_name')}
                  />
                  {errors.full_name && (
                    <span className="form-error">
                      {errors.full_name.message}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="organization" className="form-label">
                    {t('contact.organization')}
                  </label>
                  <input
                    id="organization"
                    type="text"
                    className="form-input"
                    placeholder={
                      isFa ? 'نام سازمان، شرکت یا اداره' : 'Organization'
                    }
                    {...register('organization')}
                  />
                </div>
              </div>

              <div className="grid-2" style={{ gap: '1rem' }}>
                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    {t('contact.email')} *
                  </label>
                  <input
                    id="email"
                    type="email"
                    dir="ltr"
                    className="form-input"
                    placeholder="name@company.ir"
                    {...register('email')}
                  />
                  {errors.email && (
                    <span className="form-error">{errors.email.message}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="phone" className="form-label">
                    {t('contact.phone')} *
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    dir="ltr"
                    className="form-input"
                    placeholder="09123456789"
                    {...register('phone')}
                  />
                  {errors.phone && (
                    <span className="form-error">{errors.phone.message}</span>
                  )}
                </div>
              </div>

              <div className="grid-2" style={{ gap: '1rem' }}>
                <div className="form-group">
                  <label htmlFor="department" className="form-label">
                    {t('contact.department')}
                  </label>
                  <select
                    id="department"
                    className="form-select"
                    {...register('department')}
                  >
                    <option value="ai-consulting">
                      {isFa
                        ? 'مشاوره و استقرار هوش مصنوعی سازمانی'
                        : 'Enterprise AI Consulting'}
                    </option>
                    <option value="custom-software">
                      {isFa
                        ? 'تولید نرم‌افزار سفارش مشتری'
                        : 'Custom Software Development'}
                    </option>
                    <option value="industrial-automation">
                      {isFa
                        ? 'اتوماسیون صنعتی هوشمند و کنترل'
                        : 'Smart Industrial Automation'}
                    </option>
                    <option value="network-infrastructure">
                      {isFa
                        ? 'شبکه داده و زیرساخت مراکز پردازش'
                        : 'Network & Data Center Ops'}
                    </option>
                    <option value="support">
                      {isFa
                        ? 'پشتیبانی فنی و امور قراردادها'
                        : 'SLA Support & Contracts'}
                    </option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="subject" className="form-label">
                    {t('contact.subject')} *
                  </label>
                  <input
                    id="subject"
                    type="text"
                    className="form-input"
                    placeholder={
                      isFa
                        ? 'موضوع جلسه یا پروژه مورد نظر'
                        : 'Project or Demo Subject'
                    }
                    {...register('subject')}
                  />
                  {errors.subject && (
                    <span className="form-error">{errors.subject.message}</span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="message" className="form-label">
                  {t('contact.message')} *
                </label>
                <textarea
                  id="message"
                  rows={5}
                  className="form-textarea"
                  placeholder={
                    isFa
                      ? 'لطفاً نیازمندی سازمان، تعداد کاربران هدف یا سوالات فنی خود را بنویسید...'
                      : 'Describe your organization’s goals, scale, or technical questions...'
                  }
                  {...register('message')}
                />
                {errors.message && (
                  <span className="form-error">{errors.message.message}</span>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
                style={{ width: '100%' }}
              >
                <Send size={16} />
                <span>
                  {isSubmitting ? t('contact.submitting') : t('contact.submit')}
                </span>
              </button>
            </form>
          )}
        </section>

        {/* Official HQ & Direct Contact Card */}
        <aside
          style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
        >
          <div className="card">
            <h2
              style={{
                marginTop: 0,
                marginBottom: '1.25rem',
                fontSize: '1.2rem',
              }}
            >
              {hqTitle}
            </h2>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1.15rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  gap: '0.75rem',
                  alignItems: 'flex-start',
                }}
              >
                <MapPin
                  size={20}
                  style={{
                    color: 'var(--accent-primary)',
                    flexShrink: 0,
                    marginTop: '0.2rem',
                  }}
                />
                <div>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      marginBottom: '0.25rem',
                    }}
                  >
                    {isFa ? 'نشانی دفتر مرکزی (ملایر):' : 'Registered Address:'}
                  </div>
                  <div
                    style={{
                      color: 'var(--text-secondary)',
                      fontSize: '0.92rem',
                    }}
                  >
                    {address}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                      marginTop: '0.6rem',
                    }}
                  >
                    <button
                      type="button"
                      className="icon-btn"
                      onClick={() => copyText(address, 'نشانی')}
                    >
                      <Copy size={13} />
                      <span>{t('contact.copyAddress')}</span>
                    </button>
                    <button
                      type="button"
                      className="icon-btn"
                      onClick={() => copyText(postalCode, 'کد پستی')}
                    >
                      <Copy size={13} />
                      <span>
                        {t('contact.copyPostal')}:{' '}
                        <span className="mono">{postalCode}</span>
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: '0.75rem',
                  alignItems: 'center',
                }}
              >
                <Phone
                  size={19}
                  style={{ color: 'var(--accent-primary)', flexShrink: 0 }}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                    {isFa ? 'تلفن ارتباطات سازمانی:' : 'Corporate Phone:'}
                  </div>
                  <a
                    href={`tel:${phone.replace(/\s+/g, '')}`}
                    dir="ltr"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {phone}
                  </a>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: '0.75rem',
                  alignItems: 'center',
                }}
              >
                <Mail
                  size={19}
                  style={{ color: 'var(--accent-primary)', flexShrink: 0 }}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                    {isFa ? 'پست الکترونیک رسمی:' : 'Official Email:'}
                  </div>
                  <a
                    href={`mailto:${email}`}
                    className="mono"
                    style={{ color: 'var(--accent-primary)' }}
                  >
                    {email}
                  </a>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: '0.75rem',
                  alignItems: 'flex-start',
                }}
              >
                <Clock
                  size={19}
                  style={{
                    color: 'var(--accent-primary)',
                    flexShrink: 0,
                    marginTop: '0.2rem',
                  }}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                    {isFa ? 'ساعات کاری:' : 'Working Hours:'}
                  </div>
                  <div
                    style={{
                      color: 'var(--text-secondary)',
                      fontSize: '0.9rem',
                    }}
                  >
                    {workingHours}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card" style={{ background: 'var(--bg-elevated)' }}>
            <h3 style={{ marginTop: 0, fontSize: '1.02rem' }}>{workflowTitle}</h3>
            <ol
              style={{
                margin: 0,
                paddingInlineStart: '1.25rem',
                fontSize: '0.88rem',
                color: 'var(--text-secondary)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.45rem',
              }}
            >
              <li>{workflowStep1}</li>
              <li>{workflowStep2}</li>
              <li>{workflowStep3}</li>
            </ol>
          </div>
        </aside>
      </div>
    </div>
  );
}
