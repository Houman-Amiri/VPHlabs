import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import '../i18n';
import i18n from '../i18n';
import { BannerCarousel } from '../components/home/BannerCarousel';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { AboutPage } from '../pages/AboutPage';
import { RequireRole } from '../components/auth/RouteGuards';
import { useThemeStore } from '../store/useThemeStore';
import { useAuthStore } from '../store/useAuthStore';
import { useSiteStore } from '../store/useSiteStore';
import { contactFormSchema } from '../schemas/forms';
import type { Banner } from '../types';

const SAMPLE_BANNERS: Banner[] = [
  {
    id: 1,
    image_url: '/banners/banner-1.jpg',
    target_url: '/products',
    alt_fa: 'بنر اول ویرا پردازش هومان',
    alt_en: 'First Banner',
    badge_fa: 'هوش مصنوعی و مهندسی نرم‌افزار سفارشی',
    badge_en: 'Enterprise AI & Custom Software',
    title_fa: 'طراحی و تولید نرم‌افزارهای سفارشی و سامانه‌های هوش مصنوعی سازمانی',
    title_en: 'Custom Enterprise Software & Sovereign AI Platforms',
    subtitle_fa: 'مشاوره، تحلیل، طراحی و پشتیبانی نرم‌افزارهای سفارش مشتری بر اساس اساسنامه',
    subtitle_en: 'Consulting, design & deployment',
    sort_order: 1,
    is_active: true,
    created_at: '',
    updated_at: '',
  },
  {
    id: 2,
    image_url: '/banners/banner-2.jpg',
    target_url: '/services',
    alt_fa: 'بنر دوم ویرا پردازش هومان',
    alt_en: 'Second Banner',
    badge_fa: 'اتوماسیون صنعتی هوشمند',
    badge_en: 'Smart Industrial Automation',
    title_fa: 'طراحی و اجرای سیستم‌های کنترل و اتوماسیون صنعتی هوشمند',
    title_en: 'Industrial Control & Edge AI Automation',
    subtitle_fa: 'پایش هوشمند خطوط تولید و نگهداری پیش‌بینانه تجهیزات',
    subtitle_en: 'Predictive maintenance & industrial telemetry',
    sort_order: 2,
    is_active: true,
    created_at: '',
    updated_at: '',
  },
];

describe('V.I.R.A Pardazesh Hoomaan Front-End Suite', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('fa');
    useThemeStore.getState().setTheme('dark');
  });

  it('BannerCarousel renders charter-based overlay text + clickable wide image + 2 arrows', () => {
    const { container } = render(
      <MemoryRouter>
        <BannerCarousel banners={SAMPLE_BANNERS} />
      </MemoryRouter>
    );

    const img = screen.getByRole('img', { name: 'بنر اول ویرا پردازش هومان' });
    expect(img).toHaveAttribute('src', '/banners/banner-1.jpg');
    expect(
      screen.getByText(
        'طراحی و تولید نرم‌افزارهای سفارشی و سامانه‌های هوش مصنوعی سازمانی'
      )
    ).toBeInTheDocument();

    const link = img.closest('a');
    expect(link).toHaveAttribute('href', '/products');

    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBe(2);

    fireEvent.click(buttons[1]);
    expect(
      screen.getByText('طراحی و اجرای سیستم‌های کنترل و اتوماسیون صنعتی هوشمند')
    ).toBeInTheDocument();
  });

  it('Navbar & Footer render /logo-vira.png, hide admin button, omit شناسه ملی, and display updated phone & address', () => {
    const { container } = render(
      <MemoryRouter>
        <Navbar />
        <Footer />
      </MemoryRouter>
    );

    const logoImgs = container.querySelectorAll('img[src="/logo-vira.png"]');
    expect(logoImgs.length).toBe(2);

    // No link to /admin or /admin/login in public header/footer
    expect(container.querySelector('a[href*="/admin"]')).toBeNull();

    // Updated phone & address present, شناسه ملی removed
    expect(screen.getByText('0912 576 2296')).toBeInTheDocument();
    expect(
      screen.getByText(
        'همدان - ملایر - خیابان سعدی - کوچه مرتضی مهاجر - کوچه محبت - پلاک 4 - واحد 3'
      )
    ).toBeInTheDocument();
    expect(screen.queryByText(/شناسه ملی/)).toBeNull();
  });

  it('AboutPage omits شناسه ملی & شماره مکانیزه and renders همکاران with LinkedIn & Instagram links', () => {
    useSiteStore.setState({
      teamMembers: [
        {
          id: 1,
          full_name_fa: 'شهرام امیری',
          full_name_en: 'Shahram Amiri',
          role_fa: 'مدیرعامل و هم‌بنیان‌گذار',
          role_en: 'CEO',
          bio_fa: 'راهبر استراتژی هوش مصنوعی سازمانی',
          bio_en: 'Enterprise AI Strategy Lead',
          avatar_url: '',
          linkedin_url: 'https://www.linkedin.com/company/vphlabs',
          instagram_url: 'https://www.instagram.com/vphlabs',
          sort_order: 1,
          is_active: true,
          created_at: '',
          updated_at: '',
        },
      ],
      services: [],
    });

    render(
      <MemoryRouter>
        <AboutPage />
      </MemoryRouter>
    );

    expect(screen.queryByText(/شناسه ملی/)).toBeNull();
    expect(screen.queryByText(/شماره مکانیزه/)).toBeNull();
    expect(screen.getByText('مدیرعامل و هم‌بنیان‌گذار')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /LinkedIn — شهرام امیری/i })
    ).toHaveAttribute('href', 'https://www.linkedin.com/company/vphlabs');
    expect(
      screen.getByRole('link', { name: /Instagram — شهرام امیری/i })
    ).toHaveAttribute('href', 'https://www.instagram.com/vphlabs');
  });

  it('ThemeStore switches between dark and light mode on documentElement', () => {
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    useThemeStore.getState().toggleTheme();
    expect(useThemeStore.getState().theme).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('i18n dynamically switches HTML dir between RTL (fa) and LTR (en)', async () => {
    expect(document.documentElement.dir).toBe('rtl');
    await i18n.changeLanguage('en');
    expect(document.documentElement.dir).toBe('ltr');
    await i18n.changeLanguage('fa');
    expect(document.documentElement.dir).toBe('rtl');
  });

  it('Zod contactFormSchema accepts Persian phone digits and rejects invalid email', () => {
    const valid = contactFormSchema.safeParse({
      full_name: 'شهرام امیری',
      organization: 'ویرا پردازش هومان',
      email: 'info@vphlabs.com',
      phone: '۰۹۱۲۵۷۶۲۲۹۶',
      department: 'ai-consulting',
      subject: 'درخواست مشاوره هوش مصنوعی',
      message: 'لطفاً زمان جلسه فنی را هماهنگ فرمایید.',
    });
    expect(valid.success).toBe(true);

    const invalid = contactFormSchema.safeParse({
      full_name: 'الف',
      email: 'not-an-email',
      phone: '123',
      department: 'ai-consulting',
      subject: 'ک',
      message: 'کوتاه',
    });
    expect(invalid.success).toBe(false);
  });

  it('RequireRole blocks non-admin users with 403 alert', () => {
    useAuthStore.setState({
      user: {
        id: 2,
        name: 'Viewer',
        email: 'viewer@vphlabs.com',
        role: 'viewer',
        is_active: true,
        created_at: '',
      },
      isInitialized: true,
      isLoading: false,
    });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route
            path="/admin"
            element={
              <RequireRole role="admin">
                <div>Secret Admin Panel</div>
              </RequireRole>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole('alert')).toHaveTextContent('۴۰۳');
    expect(screen.queryByText('Secret Admin Panel')).toBeNull();
  });
});
