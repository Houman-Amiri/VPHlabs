import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  fa: {
    translation: {
      brand: {
        name: 'ویرا پردازش هومان',
        short: 'VPH Labs',
        tagline: 'راهکارهای هوش مصنوعی سازمانی',
      },
      nav: {
        home: 'صفحه اصلی',
        products: 'محصولات هوشمند',
        services: 'خدمات تخصصی',
        articles: 'مقالات و جستارها',
        about: 'درباره ما',
        contact: 'تماس و مشاوره',
        admin: 'پنل مدیریت',
        searchPlaceholder: 'جستجو در محصولات و مقالات...',
        skipToContent: 'پرش به محتوای اصلی',
      },
      theme: {
        dark: 'حالت تیره',
        light: 'حالت روشن',
        toggleLabel: 'تغییر پوسته روشن یا تیره',
      },
      home: {
        bannerPrev: 'تصویر قبلی بنر',
        bannerNext: 'تصویر بعدی بنر',
        exploreProducts: 'مشاهده محصولات هوشمند',
        requestConsult: 'درخواست جلسه مشاوره',
        matcherBadge: 'تعامل زنده سازمانی',
        matcherTitle: 'پیشنهادگر هوشمند راهکار متناسب با سازمان شما',
        matcherSubtitle:
          'نوع سازمان یا حوزه عملیاتی خود را انتخاب کنید تا معماری پیشنهادی ویرا پردازش هومان را به‌صورت زنده مشاهده نمایید.',
        featuredTitle: 'محصولات و سکوهای هوش مصنوعی ویرا',
        featuredSubtitle:
          'نرم‌افزارهای سازمانی طراحی‌شده برای استقرار امن در شبکه داخلی شرکت‌ها و ادارات',
        viewAllProducts: 'همه محصولات',
        recentArticlesTitle: 'تازه‌ترین مقالات و جستارهای تخصصی',
        recentArticlesSubtitle:
          'تحلیل‌های فنی و مدیریتی پیرامون هوش مصنوعی سازمانی، اتوماسیون صنعتی و امنیت داده',
        viewAllArticles: 'آرشیو مقالات',
        readArticle: 'مطالعه کامل مقاله',
        charterTitle: 'پشتوانه حقوقی و صلاحیت‌های رسمی اساسنامه',
        charterViewAll: 'مشاهده ۱۲ ردیف خدمات رسمی',
      },
      products: {
        title: 'محصولات و راهکارهای هوش مصنوعی سازمانی',
        subtitle:
          'مجموعه نرم‌افزارهای هوشمند، درگاه‌های بومی LLM و سامانه‌های پایش صنعتی شرکت ویرا پردازش هومان',
        searchPlaceholder: 'جستجوی نام یا قابلیت محصول...',
        allCategories: 'همه دسته‌ها',
        sortOrder: 'چینش پیشنهادی',
        sortNewest: 'جدیدترین محصولات',
        sortTitle: 'بر اساس نام',
        requestDemo: 'درخواست دمو سازمانی',
        viewDetails: 'بررسی مشخصات فنی',
        empty: 'محصولی مطابق با فیلتر انتخابی یافت نشد.',
        isicLabel: 'کد آیسیک اساسنامه',
      },
      articles: {
        title: 'مقالات، پژوهش‌ها و جستارهای تخصصی',
        subtitle:
          'مرجع تخصصی معماری هوش مصنوعی بومی، تحول دیجیتال سازمان‌ها و اتوماسیون صنعتی در ایران',
        searchPlaceholder: 'جستجو در عنوان، چکیده یا متن مقالات...',
        allCategories: 'همه موضوعات',
        readingTime: 'دقیقه مطالعه',
        views: 'بازدید',
        helpful: 'مفید بود',
        copyLink: 'کپی لینک مقاله',
        copied: 'لینک کپی شد!',
        relatedTitle: 'مقالات مرتبط پیشنهادی',
        empty: 'مقاله‌ای با این عبارت یافت نشد.',
        toc: 'سرفصل‌های این جستار',
      },
      services: {
        title: 'خدمات تخصصی و حوزه‌های مجاز اساسنامه',
        subtitle:
          'ترکیب ۱۲ ردیف صلاحیت رسمی ثبت‌شده در اساسنامه شرکت ویرا پردازش هومان با فناوری‌های پیشرفته هوش مصنوعی',
        aiCapability: 'رویکرد هوش مصنوعی ویرا',
        ctaTitle: 'نیازمند طراحی سامانه سفارشی یا مشاوره نظارت فنی هستید؟',
        ctaButton: 'ثبت درخواست مشاوره تخصصی',
      },
      about: {
        legalCardTitle: 'شناسنامه حقوقی و ثبتی شرکت',
        regNo: 'شماره ثبت',
        nationalId: 'شناسه ملی',
        mechanizedNo: 'شماره مکانیزه اساسنامه',
        ceo: 'مدیرعامل و نماینده قانونی',
        entityType: 'نوع شخصیت حقوقی',
        entityTypeValue: 'شرکت با مسئولیت محدود (تابعیت ایرانی)',
        postalCode: 'کد پستی دفتر مرکزی',
        charterSectionTitle: 'موضوع فعالیت رسمی شرکت (ماده ۲ اساسنامه)',
      },
      contact: {
        title: 'تماس با ویرا پردازش هومان و درخواست مشاوره',
        subtitle:
          'برای دریافت دمو سامانه‌های هوش مصنوعی، سفارش تولید نرم‌افزار اختصاصی یا مشاوره زیرساخت با ما در ارتباط باشید.',
        formTitle: 'فرم ثبت درخواست سازمانی',
        fullName: 'نام و نام خانوادگی',
        organization: 'نام شرکت / اداره / سازمان',
        email: 'پست الکترونیک سازمانی یا شخصی',
        phone: 'شماره تماس (موبایل یا تلفن ثابت با کد شهر)',
        department: 'واحد تخصصی مرتبط',
        subject: 'موضوع درخواست',
        message: 'شرح نیاز، چالش سازمانی یا جزئیات پروژه',
        submit: 'ارسال درخواست مشاوره',
        submitting: 'در حال ثبت درخواست...',
        successTitle: 'درخواست شما با موفقیت ثبت گردید',
        sendAnother: 'ثبت یک پیام دیگر',
        hqTitle: 'نشانی قانونی و اطلاعات تماس',
        copyAddress: 'کپی نشانی',
        copyPostal: 'کپی کد پستی',
      },
      common: {
        loading: 'در حال بارگذاری اطلاعات...',
        retry: 'تلاش مجدد',
        prevPage: 'صفحه قبل',
        nextPage: 'صفحه بعد',
        backToList: 'بازگشت به فهرست',
      },
    },
  },
  en: {
    translation: {
      brand: {
        name: 'V.I.R.A Pardazesh Hoomaan',
        short: 'VPH Labs',
        tagline: 'Enterprise AI Solutions',
      },
      nav: {
        home: 'Home',
        products: 'AI Products',
        services: 'Services',
        articles: 'Articles & Essays',
        about: 'About Us',
        contact: 'Contact',
        admin: 'Admin Panel',
        searchPlaceholder: 'Search products & articles...',
        skipToContent: 'Skip to main content',
      },
      theme: {
        dark: 'Dark Mode',
        light: 'Light Mode',
        toggleLabel: 'Toggle light or dark theme',
      },
      home: {
        bannerPrev: 'Previous banner slide',
        bannerNext: 'Next banner slide',
        exploreProducts: 'Explore AI Products',
        requestConsult: 'Book Enterprise Consultation',
        matcherBadge: 'Live Interactive Selector',
        matcherTitle: 'Interactive Enterprise AI Solution Matcher',
        matcherSubtitle:
          'Select your operational sector to preview V.I.R.A Pardazesh Hoomaan’s recommended on-premise AI stack.',
        featuredTitle: 'Featured Enterprise AI Platforms',
        featuredSubtitle:
          'Production-ready intelligent software engineered for private corporate & government networks',
        viewAllProducts: 'All Products',
        recentArticlesTitle: 'Latest Technical Articles & Essays',
        recentArticlesSubtitle:
          'In-depth engineering essays on Enterprise RAG, Industrial AI Automation, and Data Governance',
        viewAllArticles: 'All Articles',
        readArticle: 'Read Full Article',
        charterTitle: 'Official Corporate Charter Capabilities',
        charterViewAll: 'Explore All 12 Official Scopes',
      },
      products: {
        title: 'Enterprise AI Products & Solutions',
        subtitle:
          'On-premise document intelligence, LLM gateways, and smart industrial telemetry built by VPH Labs',
        searchPlaceholder: 'Search products or capabilities...',
        allCategories: 'All Categories',
        sortOrder: 'Recommended Order',
        sortNewest: 'Newest First',
        sortTitle: 'Alphabetical',
        requestDemo: 'Request Enterprise Demo',
        viewDetails: 'Technical Specs',
        empty: 'No products matched your search criteria.',
        isicLabel: 'Charter ISIC Code',
      },
      articles: {
        title: 'Technical Articles & Research Essays',
        subtitle:
          'Insights on sovereign enterprise AI, industrial predictive maintenance, and digital transformation',
        searchPlaceholder: 'Search articles, topics, or keywords...',
        allCategories: 'All Topics',
        readingTime: 'min read',
        views: 'views',
        helpful: 'Helpful',
        copyLink: 'Copy Article Link',
        copied: 'Link copied!',
        relatedTitle: 'Related Technical Essays',
        empty: 'No articles matched your query.',
        toc: 'In This Essay',
      },
      services: {
        title: 'Authorized Engineering & AI Services',
        subtitle:
          'All 12 official scopes of Article 2 of V.I.R.A Pardazesh Hoomaan’s corporate charter, supercharged with modern AI',
        aiCapability: 'VPH Applied AI Layer',
        ctaTitle: 'Need custom software engineering or AI supervision?',
        ctaButton: 'Schedule Technical Consultation',
      },
      about: {
        legalCardTitle: 'Official Legal Registration Profile',
        regNo: 'Registration Number',
        nationalId: 'National Legal ID',
        mechanizedNo: 'Mechanized Charter No.',
        ceo: 'Chief Executive Officer',
        entityType: 'Legal Entity Type',
        entityTypeValue: 'Limited Liability Company (Iran)',
        postalCode: 'HQ Postal Code',
        charterSectionTitle: 'Authorized Scopes of Activity (Charter Article 2)',
      },
      contact: {
        title: 'Contact & Enterprise Consultation',
        subtitle:
          'Connect with our engineering team for on-premise AI pilots, bespoke software, or network automation.',
        formTitle: 'Enterprise Inquiry Form',
        fullName: 'Full Name',
        organization: 'Company / Organization Name',
        email: 'Work or Personal Email',
        phone: 'Phone Number (Iran mobile or landline)',
        department: 'Target Department',
        subject: 'Inquiry Subject',
        message: 'Project Scope, Requirements, or Questions',
        submit: 'Submit Inquiry',
        submitting: 'Submitting...',
        successTitle: 'Your inquiry has been registered',
        sendAnother: 'Submit Another Inquiry',
        hqTitle: 'Registered Headquarters & Contact Details',
        copyAddress: 'Copy Address',
        copyPostal: 'Copy Postal Code',
      },
      common: {
        loading: 'Loading data...',
        retry: 'Try Again',
        prevPage: 'Previous',
        nextPage: 'Next',
        backToList: 'Back to list',
      },
    },
  },
};

const savedLang =
  typeof window !== 'undefined'
    ? localStorage.getItem('vph-lang') || 'fa'
    : 'fa';

export function syncDocumentDirection(lang: string) {
  if (typeof document === 'undefined') return;
  const isFa = lang.startsWith('fa');
  document.documentElement.lang = isFa ? 'fa' : 'en';
  document.documentElement.dir = isFa ? 'rtl' : 'ltr';
}

i18n.use(initReactI18next).init({
  resources,
  lng: savedLang,
  fallbackLng: 'fa',
  interpolation: {
    escapeValue: false,
  },
});

syncDocumentDirection(savedLang);

i18n.on('languageChanged', (lng) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('vph-lang', lng);
  }
  syncDocumentDirection(lng);
});

export default i18n;
