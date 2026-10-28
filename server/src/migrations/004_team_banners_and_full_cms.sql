-- =============================================================================
-- Migration 004: Team Members (همکاران), Rich Charter Banner Texts,
-- Updated Address/Phone/Postal Code, and Full-Site Dynamic Page Texts CMS
-- =============================================================================

CREATE TABLE IF NOT EXISTS team_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name_fa TEXT NOT NULL,
  full_name_en TEXT NOT NULL DEFAULT '',
  role_fa TEXT NOT NULL,
  role_en TEXT NOT NULL DEFAULT '',
  bio_fa TEXT NOT NULL DEFAULT '',
  bio_en TEXT NOT NULL DEFAULT '',
  avatar_url TEXT NOT NULL DEFAULT '',
  linkedin_url TEXT NOT NULL DEFAULT '',
  instagram_url TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_team_members_active_sort
  ON team_members (is_active, sort_order ASC);

-- Add rich charter text columns to Home Carousel Banners
ALTER TABLE banners ADD COLUMN badge_fa TEXT NOT NULL DEFAULT '';
ALTER TABLE banners ADD COLUMN badge_en TEXT NOT NULL DEFAULT '';
ALTER TABLE banners ADD COLUMN title_fa TEXT NOT NULL DEFAULT '';
ALTER TABLE banners ADD COLUMN title_en TEXT NOT NULL DEFAULT '';
ALTER TABLE banners ADD COLUMN subtitle_fa TEXT NOT NULL DEFAULT '';
ALTER TABLE banners ADD COLUMN subtitle_en TEXT NOT NULL DEFAULT '';

-- Populate existing banners 1..3 with official اساسنامه activity texts
UPDATE banners SET
  badge_fa = 'ماده ۲ اساسنامه • تولید نرم‌افزار و هوش مصنوعی',
  badge_en = 'Charter Clause 2 • Bespoke Software & Enterprise AI',
  title_fa = 'تولید و پشتیبانی نرم‌افزارهای هوشمند سفارش مشتری و بسته‌های سازمانی',
  title_en = 'Custom Enterprise AI Software & Turnkey Organizational Suites',
  subtitle_fa = 'طراحی و توسعه سامانه‌های هوش مصنوعی بومی، نرم‌افزارهای پایه و اتوماسیون فرآیندهای اداری ویژه شرکت‌ها، ادارات و سازمان‌ها',
  subtitle_en = 'Designing sovereign AI platforms, core systems, and intelligent administrative workflows for companies and institutions.'
WHERE sort_order = 1 OR id = 1;

UPDATE banners SET
  badge_fa = 'ماده ۲ اساسنامه • برق، الکترونیک، کنترل و اتوماسیون',
  badge_en = 'Charter Clause 2 • Control Engineering & Industrial Automation',
  title_fa = 'خدمات سامانه‌های اتوماسیون صنعتی هوشمند، برق، الکترونیک و کنترل',
  title_en = 'Intelligent Industrial Automation, Control & Electronics Engineering',
  subtitle_fa = 'پایش هوشمند خطوط تولید، نگهداری پیش‌بینانه تجهیزات صنعتی و یکپارچه‌سازی سخت‌افزار و هوش مصنوعی در لبه',
  subtitle_en = 'Real-time factory telemetry, AI predictive maintenance, and embedded control engineering.'
WHERE sort_order = 2 OR id = 2;

UPDATE banners SET
  badge_fa = 'ماده ۲ اساسنامه • مشاوره فاوا، شبکه داده و پژوهش',
  badge_en = 'Charter Clause 2 • ICT Consulting, Data Networks & R&D',
  title_fa = 'مشاوره، نظارت، بهره‌برداری شبکه داده‌ها و آموزش تخصصی فناوری اطلاعات',
  title_en = 'ICT Supervision, Secure Data Network Operations & Applied AI R&D',
  subtitle_fa = 'طراحی و نگهداری مستمر شبکه‌های رایانه‌ای و ارتباطی، پیمانکاری طرح‌های فاوا و توانمندسازی هوشمند سازمان‌ها',
  subtitle_en = 'End-to-end enterprise network engineering, ICT contracting, and executive AI training.'
WHERE sort_order = 3 OR id = 3;

-- Remove deprecated legal ID keys removed per request
DELETE FROM site_contents WHERE content_key IN ('company.national_id', 'company.mechanized_no');

-- Update universal address, postal code, phone & about story text
INSERT INTO site_contents (content_key, section, label_fa, value_fa, value_en, updated_at)
VALUES
  (
    'contact.address_fa',
    'contact',
    'نشانی دفتر شرکت (نمایش در فوتر، تماس با ما و درباره ما)',
    'همدان - ملایر - خیابان سعدی - کوچه مرتضی مهاجر - کوچه محبت - پلاک 4 - واحد 3',
    'Unit 3, No. 4, Mohabbat Alley, Morteza Mohajer Alley, Saadi St., Malayer, Hamedan, Iran',
    datetime('now')
  ),
  (
    'contact.postal_code',
    'contact',
    'کد پستی دفتر مرکزی',
    '6571611860',
    '6571611860',
    datetime('now')
  ),
  (
    'contact.phone',
    'contact',
    'شماره تماس (فوتر و صفحه تماس با ما)',
    '0912 576 2296',
    '0912 576 2296',
    datetime('now')
  ),
  (
    'about.story_body',
    'about',
    'توضیحات معرفی شرکت زیر تیتر اصلی (صفحه درباره ما)',
    'شرکت ویرا پردازش هومان با مسئولیت محدود (شماره ثبت ۳۵۴۵) با مأموریت تخصصی «ارائه راه‌حل‌های مبتنی بر هوش مصنوعی برای شرکت‌ها، ادارات و سازمان‌ها» فعالیت می‌کند. ما بر این باوریم که هوش مصنوعی سازمانی زمانی ارزشمند است که ایمن، دقیق، منطبق بر زبان و فرآیندهای بومی ایران و یکپارچه با زیرساخت واقعی شبکه و اتوماسیون سازمان باشد.',
    'V.I.R.A Pardazesh Hoomaan LLC (Reg. No. 3545) delivers secure, high-impact Artificial Intelligence solutions tailored for enterprises, government offices, and industrial organizations.',
    datetime('now')
  )
ON CONFLICT(content_key) DO UPDATE SET
  label_fa = excluded.label_fa,
  value_fa = excluded.value_fa,
  value_en = excluded.value_en,
  updated_at = datetime('now');

-- Insert full-page CMS keys for EVERY page's H1, H2, and descriptions
INSERT OR IGNORE INTO site_contents (content_key, section, label_fa, value_fa, value_en) VALUES
  ('company.tagline_fa', 'company', 'زیرعنوان کوتاه کنار لوگو در هدر', 'راهکارهای هوش مصنوعی سازمانی', 'Enterprise AI Solutions'),
  ('footer.quick_links_title', 'company', 'تیتر ستون دسترسی سریع در فوتر', 'دسترسی سریع', 'Quick Links'),
  ('footer.solutions_title', 'company', 'تیتر ستون راهکارها در فوتر', 'راهکارهای کلیدی', 'Core Solutions'),
  ('footer.hq_title', 'company', 'تیتر ستون اطلاعات تماس در فوتر', 'ارتباط با ما', 'Contact Info'),

  ('home.matcher_badge', 'home', 'نشان بخش پیشنهادگر هوشمند (صفحه اصلی)', 'تعامل زنده سازمانی', 'Live Interactive Selector'),
  ('home.matcher_title', 'home', 'تیتر H2 بخش پیشنهادگر راهکار (صفحه اصلی)', 'پیشنهادگر هوشمند راهکار متناسب با سازمان شما', 'Interactive Enterprise AI Solution Matcher'),
  ('home.matcher_subtitle', 'home', 'توضیحات بخش پیشنهادگر راهکار (صفحه اصلی)', 'نوع سازمان یا حوزه عملیاتی خود را انتخاب کنید تا معماری پیشنهادی ویرا پردازش هومان را به‌صورت زنده مشاهده نمایید.', 'Select your operational sector to preview V.I.R.A Pardazesh Hoomaan’s recommended on-premise AI stack.'),
  ('home.featured_title', 'home', 'تیتر H2 بخش محصولات برگزیده (صفحه اصلی)', 'محصولات و سکوهای هوش مصنوعی ویرا', 'Featured Enterprise AI Platforms'),
  ('home.featured_subtitle', 'home', 'توضیحات بخش محصولات برگزیده (صفحه اصلی)', 'نرم‌افزارهای سازمانی طراحی‌شده برای استقرار امن در شبکه داخلی شرکت‌ها و ادارات', 'Production-ready intelligent software engineered for private corporate & government networks'),
  ('home.articles_title', 'home', 'تیتر H2 بخش تازه‌ترین مقالات (صفحه اصلی)', 'تازه‌ترین مقالات و جستارهای تخصصی', 'Latest Technical Articles & Essays'),
  ('home.articles_subtitle', 'home', 'توضیحات بخش تازه‌ترین مقالات (صفحه اصلی)', 'تحلیل‌های فنی و مدیریتی پیرامون هوش مصنوعی سازمانی، اتوماسیون صنعتی و امنیت داده', 'In-depth engineering essays on Enterprise RAG, Industrial AI Automation, and Data Governance'),
  ('home.charter_title', 'home', 'تیتر H2 بخش صلاحیت‌های اساسنامه (صفحه اصلی)', 'پشتوانه حقوقی و صلاحیت‌های رسمی اساسنامه', 'Official Corporate Charter Capabilities'),
  ('home.charter_subtitle', 'home', 'توضیحات بخش صلاحیت‌های اساسنامه (صفحه اصلی)', 'خلاصه‌ای از مجوزها و موضوعات رسمی مندرج در ماده ۲ اساسنامه شرکت ویرا پردازش هومان', 'Selected authorized engineering scopes from Article 2 of our corporate charter'),

  ('products.page_title', 'products', 'تیتر اصلی H1 صفحه محصولات', 'محصولات و راهکارهای هوش مصنوعی سازمانی', 'Enterprise AI Products & Solutions'),
  ('products.page_subtitle', 'products', 'توضیحات زیر تیتر اصلی صفحه محصولات', 'مجموعه نرم‌افزارهای هوشمند، درگاه‌های بومی LLM و سامانه‌های پایش صنعتی شرکت ویرا پردازش هومان', 'On-premise document intelligence, LLM gateways, and smart industrial telemetry built by VPH Labs'),
  ('products.detail_overview_title', 'products', 'تیتر H2 بخش معرفی در صفحه تکی محصول', 'معرفی و معماری راهکار', 'Solution Overview & Architecture'),
  ('products.detail_features_title', 'products', 'تیتر H2 بخش ویژگی‌ها در صفحه تکی محصول', 'قابلیت‌ها و ویژگی‌های کلیدی', 'Key Capabilities'),

  ('services.page_title', 'services', 'تیتر اصلی H1 صفحه خدمات تخصصی', 'خدمات تخصصی و حوزه‌های مجاز اساسنامه', 'Authorized Engineering & AI Services'),
  ('services.page_subtitle', 'services', 'توضیحات زیر تیتر اصلی صفحه خدمات', 'ترکیب ۱۲ ردیف صلاحیت رسمی ثبت‌شده در اساسنامه شرکت ویرا پردازش هومان با فناوری‌های پیشرفته هوش مصنوعی', 'All 12 official scopes of Article 2 of V.I.R.A Pardazesh Hoomaan’s corporate charter, supercharged with modern AI'),
  ('services.cta_title', 'services', 'تیتر H2 باکس فراخوان مشاوره در انتهای صفحه خدمات', 'نیازمند طراحی سامانه سفارشی یا مشاوره نظارت فنی هستید؟', 'Need custom software engineering or AI supervision?'),
  ('services.cta_subtitle', 'services', 'توضیحات باکس فراخوان مشاوره در صفحه خدمات', 'تیم مهندسی ویرا پردازش هومان آماده عقد قراردادهای مشاوره، پیمانکاری و تولید نرم‌افزار سفارشی با شرکت‌ها و سازمان‌هاست.', 'V.I.R.A Pardazesh Hoomaan delivers SLA-backed enterprise software, AI consulting, and infrastructure projects.'),
  ('services.cta_button', 'services', 'متن دکمه فراخوان در صفحه خدمات', 'ثبت درخواست مشاوره تخصصی', 'Schedule Technical Consultation'),

  ('articles.page_title', 'articles', 'تیتر اصلی H1 صفحه مقالات و جستارها', 'مقالات، پژوهش‌ها و جستارهای تخصصی', 'Technical Articles & Research Essays'),
  ('articles.page_subtitle', 'articles', 'توضیحات زیر تیتر اصلی صفحه مقالات', 'مرجع تخصصی معماری هوش مصنوعی بومی، تحول دیجیتال سازمان‌ها و اتوماسیون صنعتی در ایران', 'Insights on sovereign enterprise AI, industrial predictive maintenance, and digital transformation'),
  ('articles.related_title', 'articles', 'تیتر H2 بخش مقالات مرتبط در پایین هر مقاله', 'مقالات مرتبط پیشنهادی', 'Related Technical Essays'),

  ('about.story_badge', 'about', 'نشان بالای تیتر صفحه درباره ما', 'V.I.R.A Pardazesh Hoomaan (VPH Labs)', 'V.I.R.A Pardazesh Hoomaan (VPH Labs)'),
  ('about.legal_card_title', 'about', 'تیتر H2 کارت شناسنامه حقوقی و ثبتی شرکت', 'شناسنامه حقوقی و ثبتی شرکت', 'Official Legal Registration Profile'),
  ('about.ceo_role', 'about', 'سمت مدیرعامل زیر نقل‌قول در صفحه درباره ما', 'مدیرعامل شرکت ویرا پردازش هومان', 'CEO, V.I.R.A Pardazesh Hoomaan'),
  ('about.hq_section_title', 'about', 'تیتر H2 بخش نشانی دفتر در صفحه درباره ما', 'نشانی دفتر و اقامتگاه شرکت', 'Corporate Office Address'),
  ('about.team_title', 'about', 'تیتر H2 بخش معرفی همکاران (صفحه درباره ما)', 'معرفی مدیران و همکاران ویرا پردازش هومان', 'Meet Our Leadership & Engineering Team'),
  ('about.team_subtitle', 'about', 'توضیحات بخش معرفی همکاران (صفحه درباره ما)', 'تیمی متشکل از متخصصان هوش مصنوعی، مهندسان نرم‌افزار، شبکه و اتوماسیون صنعتی در خدمت تحول هوشمند سازمان‌ها', 'Specialists in artificial intelligence, enterprise software, data networks, and industrial automation.'),
  ('about.charter_title', 'about', 'تیتر H2 بخش موضوع فعالیت اساسنامه (صفحه درباره ما)', 'موضوع فعالیت رسمی شرکت (ماده ۲ اساسنامه)', 'Authorized Scopes of Activity (Charter Article 2)'),

  ('contact.page_title', 'contact', 'تیتر اصلی H1 صفحه تماس و مشاوره', 'تماس با ویرا پردازش هومان و درخواست مشاوره', 'Contact & Enterprise Consultation'),
  ('contact.page_subtitle', 'contact', 'توضیحات زیر تیتر اصلی صفحه تماس و مشاوره', 'برای دریافت دمو سامانه‌های هوش مصنوعی، سفارش تولید نرم‌افزار اختصاصی یا مشاوره زیرساخت با ما در ارتباط باشید.', 'Connect with our engineering team for on-premise AI pilots, bespoke software, or network automation.'),
  ('contact.form_title', 'contact', 'تیتر H2 فرم ثبت درخواست در صفحه تماس', 'فرم ثبت درخواست سازمانی', 'Enterprise Inquiry Form'),
  ('contact.hq_title', 'contact', 'تیتر H2 کارت نشانی و اطلاعات تماس در صفحه تماس', 'نشانی و اطلاعات تماس شرکت', 'Headquarters & Contact Details'),
  ('contact.onboarding_title', 'contact', 'تیتر باکس مراحل آغاز همکاری در صفحه تماس', 'فرآیند آغاز همکاری سازمانی با ویرا پردازش هومان', 'Enterprise Onboarding Workflow'),
  ('contact.onboarding_step_1', 'contact', 'مرحله اول همکاری (صفحه تماس)', 'برگزاری جلسه نیازسنجی فنی و امضای تفاهم‌نامه محرمانگی (NDA)', 'Technical discovery session under mutual NDA'),
  ('contact.onboarding_step_2', 'contact', 'مرحله دوم همکاری (صفحه تماس)', 'ارائه دمو زنده و پیشنهاد فنی-مالی منطبق بر زیرساخت سازمان', 'Live tailored demo & on-premise architecture proposal'),
  ('contact.onboarding_step_3', 'contact', 'مرحله سوم همکاری (صفحه تماس)', 'استقرار پایلوت، آموزش کارشناسان و پشتیبانی مستمر SLA', 'Pilot rollout, staff training & SLA-backed support');
