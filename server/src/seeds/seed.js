const bcrypt = require('bcryptjs');
const env = require('../config/env');
const { logger } = require('../config/logger');
const { runMigrations } = require('../migrations/runner');
const userRepository = require('../repositories/userRepository');
const bannerRepository = require('../repositories/bannerRepository');
const serviceRepository = require('../repositories/serviceRepository');
const teamRepository = require('../repositories/teamRepository');
const productRepository = require('../repositories/productRepository');
const articleRepository = require('../repositories/articleRepository');
const contentRepository = require('../repositories/contentRepository');

const INITIAL_BANNERS = [
  {
    image_url: '/banners/banner-1.jpg',
    target_url: '/products',
    alt_fa: 'تولید نرم‌افزار سفارشی و راهکارهای هوش مصنوعی ویرا پردازش هومان',
    alt_en: 'V.I.R.A Pardazesh Hoomaan Custom Software & Enterprise AI',
    badge_fa: 'ماده ۲ اساسنامه • تولید نرم‌افزار و هوش مصنوعی',
    badge_en: 'Charter Clause 2 • Bespoke Software & Enterprise AI',
    title_fa: 'تولید و پشتیبانی نرم‌افزارهای هوشمند سفارش مشتری و بسته‌های سازمانی',
    title_en: 'Custom Enterprise AI Software & Turnkey Organizational Suites',
    subtitle_fa:
      'طراحی و توسعه سامانه‌های هوش مصنوعی بومی، نرم‌افزارهای پایه و اتوماسیون فرآیندهای اداری ویژه شرکت‌ها، ادارات و سازمان‌ها',
    subtitle_en:
      'Designing sovereign AI platforms, core systems, and intelligent administrative workflows for companies and institutions.',
    sort_order: 1,
    is_active: true,
  },
  {
    image_url: '/banners/banner-2.jpg',
    target_url: '/services',
    alt_fa: 'اتوماسیون هوشمند صنعتی، برق، الکترونیک و کنترل ویرا پردازش هومان',
    alt_en: 'V.I.R.A Pardazesh Hoomaan Smart Industrial Automation & Control Engineering',
    badge_fa: 'ماده ۲ اساسنامه • برق، الکترونیک، کنترل و اتوماسیون',
    badge_en: 'Charter Clause 2 • Control Engineering & Industrial Automation',
    title_fa: 'خدمات سامانه‌های اتوماسیون صنعتی هوشمند، برق، الکترونیک و کنترل',
    title_en: 'Intelligent Industrial Automation, Control & Electronics Engineering',
    subtitle_fa:
      'پایش هوشمند خطوط تولید، نگهداری پیش‌بینانه تجهیزات صنعتی و یکپارچه‌سازی سخت‌افزار و هوش مصنوعی در لبه',
    subtitle_en:
      'Real-time factory telemetry, AI predictive maintenance, and embedded control engineering.',
    sort_order: 2,
    is_active: true,
  },
  {
    image_url: '/banners/banner-3.jpg',
    target_url: '/contact',
    alt_fa: 'مشاوره فاوا، شبکه داده و پژوهش فناوری اطلاعات ویرا پردازش هومان',
    alt_en: 'V.I.R.A Pardazesh Hoomaan ICT Consulting, Data Networks & R&D',
    badge_fa: 'ماده ۲ اساسنامه • مشاوره فاوا، شبکه داده و پژوهش',
    badge_en: 'Charter Clause 2 • ICT Consulting, Data Networks & R&D',
    title_fa: 'مشاوره، نظارت، بهره‌برداری شبکه داده‌ها و آموزش تخصصی فناوری اطلاعات',
    title_en: 'ICT Supervision, Secure Data Network Operations & Applied AI R&D',
    subtitle_fa:
      'طراحی و نگهداری مستمر شبکه‌های رایانه‌ای و ارتباطی، پیمانکاری طرح‌های فاوا و توانمندسازی هوشمند سازمان‌ها',
    subtitle_en:
      'End-to-end enterprise network engineering, ICT contracting, and executive AI training.',
    sort_order: 3,
    is_active: true,
  },
];

const INITIAL_TEAM_MEMBERS = [
  {
    full_name_fa: 'شهرام امیری',
    full_name_en: 'Shahram Amiri',
    role_fa: 'مدیرعامل و بنیان‌گذار',
    role_en: 'Chief Executive Officer & Founder',
    bio_fa:
      'راهبری کلان راهبردی، مشاوره تحول دیجیتال سازمان‌ها و نظارت بر اجرای طرح‌های فناوری اطلاعات و هوش مصنوعی شرکت ویرا پردازش هومان.',
    bio_en:
      'Executive leadership, enterprise digital transformation strategy, and ICT project supervision at V.I.R.A Pardazesh Hoomaan.',
    avatar_url: '',
    linkedin_url: 'https://www.linkedin.com',
    instagram_url: 'https://www.instagram.com',
    sort_order: 1,
    is_active: true,
  },
  {
    full_name_fa: 'هومان امیری',
    full_name_en: 'Houman Amiri',
    role_fa: 'راهبر فنی هوش مصنوعی و معماری نرم‌افزار',
    role_en: 'AI & Software Architecture Lead',
    bio_fa:
      'طراحی معماری سامانه‌های هوش مصنوعی سازمانی، توسعه نرم‌افزارهای سفارش مشتری و زیرساخت استقرار مدل‌های هوشمند بومی.',
    bio_en:
      'Enterprise AI systems architecture, custom full-stack software engineering, and sovereign model infrastructure.',
    avatar_url: '',
    linkedin_url: 'https://www.linkedin.com',
    instagram_url: 'https://www.instagram.com',
    sort_order: 2,
    is_active: true,
  },
  {
    full_name_fa: 'واحد مهندسی شبکه و اتوماسیون صنعتی',
    full_name_en: 'Network & Industrial Automation Team',
    role_fa: 'مهندسی کنترل، برق و زیرساخت مراکز داده',
    role_en: 'Control Systems & Data Network Engineering',
    bio_fa:
      'پیاده‌سازی و نگهداری شبکه‌های امن سازمانی، سامانه‌های اتوماسیون صنعتی هوشمند و پشتیبانی فنی مستمر پروژه‌ها.',
    bio_en:
      'Enterprise data network operations, smart industrial automation telemetry, and 24/7 SLA technical support.',
    avatar_url: '',
    linkedin_url: 'https://www.linkedin.com',
    instagram_url: 'https://www.instagram.com',
    sort_order: 3,
    is_active: true,
  },
];

// All 12 official authorized scopes from Article 2 of the Company Charter (اساسنامه)
const INITIAL_SERVICES = [
  {
    isic_code: '620201',
    title_fa: 'مشاوره و نظارت بر اجرای طرح‌های فناوری اطلاعات و ارتباطات',
    title_en: 'ICT & AI Transformation Consulting and Supervision',
    description_fa:
      'طراحی معماری کلان، تدوین نقشه راه تحول دیجیتال و نظارت مهندسی بر اجرای پروژه‌های فناوری اطلاعات در سازمان‌ها و ادارات.',
    description_en:
      'Enterprise architecture design, AI readiness roadmaps, and technical supervision for large-scale ICT initiatives.',
    ai_application_fa: 'ارزیابی بلوغ داده و طراحی معماری هوش مصنوعی سازمانی',
    ai_application_en: 'Data maturity assessment & enterprise AI architecture',
    icon_name: 'Compass',
    sort_order: 1,
  },
  {
    isic_code: '620101',
    title_fa: 'تولید و پشتیبانی نرم‌افزارهای سفارش مشتری مبتنی بر هوش مصنوعی',
    title_en: 'Custom Enterprise AI & Bespoke Software Engineering',
    description_fa:
      'توسعه سامانه‌های نرم‌افزاری اختصاصی، دستیارهای هوشمند سازمانی و اتوماسیون فرآیندهای اداری متناسب با نیاز دقیق هر سازمان.',
    description_en:
      'Tailor-made enterprise software platforms, intelligent copilots, and custom workflow automation.',
    ai_application_fa: 'توسعه مدل‌های اختصاصی پردازش زبان طبیعی فارسی و دستیار سازمانی',
    ai_application_en: 'Custom Persian NLP models & domain-specific enterprise copilots',
    icon_name: 'Code2',
    sort_order: 2,
  },
  {
    isic_code: '620102',
    title_fa: 'تولید و پشتیبانی بسته‌های نرم‌افزاری سازمانی',
    title_en: 'Enterprise Software Suites & Product Support',
    description_fa:
      'ارائه محصولات نرم‌افزاری یکپارچه، پرتال‌های سازمانی و سامانه‌های مدیریت دانش با پشتیبانی مستمر و توافق‌نامه سطح خدمات (SLA).',
    description_en:
      'Turnkey enterprise software products, knowledge management suites, and SLA-backed support.',
    ai_application_fa: 'بسته‌های آماده جستجوی معنایی، OCR فارسی و تحلیل اسناد',
    ai_application_en: 'Turnkey Persian OCR, semantic search & document intelligence suites',
    icon_name: 'Layers',
    sort_order: 3,
  },
  {
    isic_code: '620103',
    title_fa: 'تولید و پشتیبانی نرم‌افزار پایه، سیستم و ابزارهای زیرساختی',
    title_en: 'Core Systems, On-Premise AI Gateways & Developer Tooling',
    description_fa:
      'مهندسی میان‌افزارها، درگاه‌های امن استقرار بومی مدل‌های هوش مصنوعی و ابزارهای سیستمی با کارایی بالا.',
    description_en:
      'High-performance middleware, secure on-premise LLM inference gateways, and system tooling.',
    ai_application_fa: 'زیرساخت استقرار محلی مدل‌های زبانی بدون خروج داده از سازمان',
    ai_application_en: 'Air-gapped & on-premise LLM serving infrastructure',
    icon_name: 'Cpu',
    sort_order: 4,
  },
  {
    isic_code: '620906',
    title_fa: 'خدمات سامانه‌های اتوماسیون صنعتی هوشمند',
    title_en: 'Intelligent Industrial Automation Systems',
    description_fa:
      'پیاده‌سازی سامانه‌های مانیتورینگ صنعتی، یکپارچه‌سازی داده‌های سنسورها و هوشمندسازی خطوط تولید و بهره‌برداری.',
    description_en:
      'Smart SCADA telemetry analytics, sensor data fusion, and AI-assisted production optimization.',
    ai_application_fa: 'نگهداری پیش‌بینانه (Predictive Maintenance) و تشخیص زودهنگام خرابی تجهیزات',
    ai_application_en: 'AI predictive maintenance & anomaly detection on industrial lines',
    icon_name: 'Factory',
    sort_order: 5,
  },
  {
    isic_code: '711203',
    title_fa: 'خدمات فنی و مهندسی برق، الکترونیک، کنترل و اتوماسیون',
    title_en: 'Electrical, Electronics, Control & Edge AI Engineering',
    description_fa:
      'طراحی و مهندسی سیستم‌های کنترل، پردازش لبه (Edge Computing) و یکپارچه‌سازی سخت‌افزار و نرم‌افزارهای هوشمند.',
    description_en:
      'Control systems engineering, embedded edge-AI processing, and hardware-software co-design.',
    ai_application_fa: 'بینایی ماشین صنعتی در لبه و کنترل تطبیقی هوشمند',
    ai_application_en: 'Edge computer vision quality inspection & adaptive control',
    icon_name: 'CircuitBoard',
    sort_order: 6,
  },
  {
    isic_code: '631103',
    title_fa: 'خدمات شبکه داده‌های رایانه‌ای و ارتباطی',
    title_en: 'Enterprise Data Networks & Secure Connectivity',
    description_fa:
      'طراحی و پیاده‌سازی مراکز داده، شبکه‌های امن سازمانی و زیرساخت‌های انتقال داده پرسرعت ویژه پردازش‌های سنگین.',
    description_en:
      'Data center network design, secure enterprise topologies, and high-throughput data fabrics.',
    ai_application_fa: 'پایش هوشمند ترافیک شبکه و بهینه‌سازی زیرساخت پردازش هوش مصنوعی',
    ai_application_en: 'AI-driven network traffic telemetry & GPU cluster networking',
    icon_name: 'Network',
    sort_order: 7,
  },
  {
    isic_code: '351015',
    title_fa: 'بهره‌برداری، پایش و نگهداری مستمر از شبکه',
    title_en: 'Managed Network Operations & Proactive Reliability',
    description_fa:
      'نگهداری پیشگیرانه، پایش ۲۴/۷ پایداری سرویس‌ها و تضمین تداوم کسب‌وکار در شبکه‌های سازمانی و اداری.',
    description_en:
      '24/7 network reliability monitoring, preventive operations, and business continuity assurance.',
    ai_application_fa: 'تشخیص خودکار گلوگاه‌ها و هشدار هوشمند پیش از بروز قطعی (AIOps)',
    ai_application_en: 'AIOps root-cause analysis & automated incident prevention',
    icon_name: 'ShieldCheck',
    sort_order: 8,
  },
  {
    isic_code: '620104',
    title_fa: 'خدمات جامع فناوری اطلاعات سازمانی',
    title_en: 'Comprehensive Enterprise IT Services',
    description_fa:
      'ارائه راهکارهای یکپارچه فناوری اطلاعات، یکپارچه‌سازی پایگاه‌های داده جزیره‌ای و نوسازی سامانه‌های قدیمی ادارات.',
    description_en:
      'End-to-end enterprise IT modernization, legacy system integration, and unified data lakes.',
    ai_application_fa: 'تبدیل داده‌های پراکنده سازمانی به داشبوردهای تحلیلی و تصمیم‌یار',
    ai_application_en: 'Transforming siloed enterprise records into executive AI insights',
    icon_name: 'Database',
    sort_order: 9,
  },
  {
    isic_code: '620905',
    title_fa: 'آموزش تخصصی و پژوهش کاربردی در فناوری اطلاعات و هوش مصنوعی',
    title_en: 'Executive AI Training & Applied R&D',
    description_fa:
      'برگزاری دوره‌های توانمندسازی هوش مصنوعی برای مدیران و کارشناسان سازمان‌ها و انجام پروژه‌های تحقیق و توسعه کاربردی.',
    description_en:
      'Hands-on enterprise AI bootcamps for leadership & engineering teams plus applied R&D.',
    ai_application_fa: 'آموزش مهندسی پرامپت، امنیت هوش مصنوعی و کاربست عملی در ادارات',
    ai_application_en: 'Enterprise AI literacy, governance & applied engineering workshops',
    icon_name: 'GraduationCap',
    sort_order: 10,
  },
  {
    isic_code: '620903',
    title_fa: 'خدمات پشتیبانی تخصصی فناوری اطلاعات',
    title_en: 'Dedicated Enterprise IT & AI Support',
    description_fa:
      'پشتیبانی فنی چندلایه از سامانه‌های حیاتی، به‌روزرسانی امنیتی و بهینه‌سازی مستمر مدل‌ها و نرم‌افزارهای مستقر.',
    description_en:
      'Multi-tier technical support, security patching, and continuous model/system tuning.',
    ai_application_fa: 'پایش دقت مدل‌های هوش مصنوعی در محیط عملیاتی (MLOps)',
    ai_application_en: 'Continuous MLOps drift monitoring & production SLA support',
    icon_name: 'Headphones',
    sort_order: 11,
  },
  {
    isic_code: '620904',
    title_fa: 'خدمات پیمانکاری پروژه‌های ارتباطات و فناوری اطلاعات',
    title_en: 'Turnkey ICT & Smart Infrastructure Contracting',
    description_fa:
      'اجرای کلیددرست (Turnkey) پروژه‌های زیرساخت ارتباطی، هوشمندسازی ساختمان‌های اداری و استقرار کامل مراکز پردازش.',
    description_en:
      'Turnkey execution of ICT infrastructure, smart administrative complexes, and compute nodes.',
    ai_application_fa: 'استقرار یکپارچه سخت‌افزار، شبکه و سکوهای هوش مصنوعی بومی',
    ai_application_en: 'End-to-end delivery of compute, networking & on-prem AI stacks',
    icon_name: 'Building2',
    sort_order: 12,
  },
];

const INITIAL_PRODUCTS = [
  {
    slug: 'vira-docmind-ai',
    title_fa: 'ویرا داک‌مایند (VIRA DocMind AI)',
    title_en: 'VIRA DocMind AI — Enterprise Persian RAG & Document Intelligence',
    summary_fa:
      'سامانه هوشمند پردازش اسناد، نامه‌های اداری و جستجوی معنایی دانش سازمانی مبتنی بر معماری RAG بومی بدون خروج داده از سازمان.',
    summary_en:
      'On-premise Persian document intelligence, OCR, and Retrieval-Augmented Generation (RAG) platform for government offices and enterprises.',
    description_fa: `ویرا داک‌مایند راهکار پرچم‌دار شرکت ویرا پردازش هومان برای سازمان‌ها، بانک‌ها و اداراتی است که با حجم عظیمی از بخشنامه‌ها، آیین‌نامه‌ها، قراردادها و مکاتبات اداری سروکار دارند.

این سامانه با بهره‌گیری از مدل‌های پیشرفته پردازش زبان طبیعی فارسی و تکنولوژی بازیابی تقویت‌شده با تولید (RAG)، به کارشناسان و مدیران اجازه می‌دهد به زبان طبیعی از آرشیو میلیون‌ها صفحه سند سازمانی پرسش کنند و پاسخ دقیق را به همراه ارجاع مستقیم به شماره ماده، صفحه و سند مرجع دریافت نمایند.

تمامی مراحل پردازش روی سرورهای داخلی سازمان (On-Premise) اجرا شده و هیچ داده‌ای به سرویس‌های ابری خارجی ارسال نمی‌شود.`,
    description_en: `VIRA DocMind AI enables Iranian enterprises and public sector institutions to unlock institutional knowledge across millions of Persian PDFs, scanned letters, bylaws, and contracts. Powered by air-gapped on-premise Retrieval-Augmented Generation (RAG), every answer cites the exact clause and source document while keeping 100% of sensitive data inside your corporate network.`,
    category: 'enterprise-ai',
    badge: 'پرفروش سازمانی',
    image_url: '/banners/banner-1.jpg',
    features: [
      'استقرار کاملاً بومی (On-Premise) بدون نیاز به اینترنت خارجی',
      'نویسه‌خوان نوری (OCR) دقیق ویژه اسناد اسکن‌شده و نامه‌های اداری فارسی',
      'پاسخگویی مستند با ذکر دقیق منبع، شماره بند و لینک به فایل اصلی',
      'کنترل دسترسی مبتنی بر نقش (RBAC) هماهنگ با ساختار سازمانی و اکتیودایرکتوری',
      'رابط برنامه‌نویسی (REST API) جهت اتصال به اتوماسیون‌های اداری موجود',
    ],
    target_sector: 'government',
    isic_code: '620101',
    demo_available: true,
    is_featured: true,
    is_published: true,
    sort_order: 1,
  },
  {
    slug: 'vira-autoguard-industrial',
    title_fa: 'ویرا اتوگارد صنعتی (VIRA AutoGuard AI)',
    title_en: 'VIRA AutoGuard AI — Predictive Maintenance & Industrial Telemetry',
    summary_fa:
      'پلتفرم هوشمند پایش لحظه‌ای خطوط تولید، تحلیل داده‌های کنترلی و پیش‌بینی خرابی تجهیزات پیش از توقف ناخواسته.',
    summary_en:
      'AI-powered industrial automation analytics and predictive maintenance suite for manufacturing plants and utilities.',
    description_fa: `ویرا اتوگارد پل ارتباطی میان مهندسی برق، کنترل و اتوماسیون صنعتی با الگوریتم‌های یادگیری ماشین است. این سامانه با دریافت بلادرنگ داده‌های ارتعاش، دما، جریان مصرفی و پارامترهای PLC/SCADA، الگوهای غیرعادی را هفته‌ها پیش از بروز خرابی مکانیکی یا الکتریکی شناسایی می‌کند.

استفاده از ویرا اتوگارد در کارخانجات و تأسیسات زیربنایی موجب کاهش چشمگیر توقفات اضطراری، افزایش طول عمر تجهیزات سرمایه و بهینه‌سازی مصرف انرژی می‌گردد.`,
    description_en: `Bridging industrial control engineering with machine learning, VIRA AutoGuard ingests live PLC/SCADA sensor streams to detect subtle vibration, thermal, and electrical anomalies weeks before catastrophic equipment failure.`,
    category: 'industrial-ai',
    badge: 'صنعت هوشمند ۴.۰',
    image_url: '/banners/banner-2.jpg',
    features: [
      'اتصال استاندارد به پروتکل‌های صنعتی Modbus، OPC-UA و MQTT',
      'تشخیص بلادرنگ ناهنجاری در داده‌های سری زمانی سنسورها',
      'داشبورد شماتیک وضعیت سلامت تجهیزات با هشدار پیامکی و سازمانی',
      'پردازش لبه (Edge AI) با تأخیر زیر ۵۰ میلی‌ثانیه در محل کارخانه',
    ],
    target_sector: 'industrial',
    isic_code: '620906',
    demo_available: true,
    is_featured: true,
    is_published: true,
    sort_order: 2,
  },
  {
    slug: 'vira-deskyar-copilot',
    title_fa: 'ویرا دسک‌یار (VIRA DeskYar Copilot)',
    title_en: 'VIRA DeskYar — Intelligent Citizen & Customer Service Copilot',
    summary_fa:
      'دستیار هوشمند میز خدمت و مرکز تماس سازمان‌ها؛ دسته‌بندی خودکار درخواست‌ها، پیش‌نویس پاسخ اداری و راهنمای ۲۴ ساعته ارباب‌رجوع.',
    summary_en:
      '24/7 Persian enterprise helpdesk copilot for automated ticket routing, citizen guidance, and response drafting.',
    description_fa: `ویرا دسک‌یار تجربه‌ی مراجعه به میز خدمت الکترونیک ادارات و واحدهای پشتیبانی شرکت‌ها را متحول می‌سازد. این سامانه درخواست‌های متنی مراجعین را درک کرده، به صورت خودکار به واحد مربوطه ارجاع می‌دهد و در کمتر از چند ثانیه پاسخ دقیق و منطبق بر ضوابط سازمان ارائه می‌کند.`,
    description_en: `VIRA DeskYar transforms public service portals and enterprise helpdesks with accurate 24/7 Persian conversational support, smart ticket triage, and instant agent assist.`,
    category: 'enterprise-ai',
    badge: 'میز خدمت هوشمند',
    image_url: '/banners/banner-3.jpg',
    features: [
      'درک عمیق محاوره و ادبیات رسمی اداری زبان فارسی',
      'مسیریابی و اولویت‌بندی خودکار تیکت‌ها و شکایات',
      'تحلیل احساسات و سنجش رضایت‌مندی مراجعین در لحظه',
      'امکان استقرار به صورت ویجت وب‌سایت، کیوسک ارباب‌رجوع یا پنل کارشناسان',
    ],
    target_sector: 'government',
    isic_code: '620102',
    demo_available: true,
    is_featured: true,
    is_published: true,
    sort_order: 3,
  },
  {
    slug: 'vira-netshield-aiops',
    title_fa: 'ویرا نت‌شیلد (VIRA NetShield AIOps)',
    title_en: 'VIRA NetShield AIOps — Intelligent Network Telemetry & Anomaly Defense',
    summary_fa:
      'سامانه هوشمند پایش پایداری شبکه، تحلیل ترافیک مراکز داده و شناسایی خودکار گلوگاه‌ها و تهدیدات زیرساختی.',
    summary_en:
      'AIOps observability platform for enterprise networks, automated bottleneck root-cause analysis, and traffic anomaly detection.',
    description_fa: `ویرا نت‌شیلد با ترکیب تخصص بهره‌برداری شبکه و هوش مصنوعی، دیدی یکپارچه از وضعیت سلامت سوئیچ‌ها، سرورها و لینک‌های ارتباطی سازمان فراهم می‌آورد و پیش از آنکه افت شبکه بر کاربران اثر بگذارد، علت ریشه‌ای را به تیم فنی گزارش می‌دهد.`,
    description_en: `Combining network engineering with AIOps machine learning, VIRA NetShield correlates telemetry across switches, routers, and servers to pinpoint bottlenecks before outages occur.`,
    category: 'infrastructure',
    badge: 'پایش هوشمند شبکه',
    image_url: '/banners/banner-2.jpg',
    features: [
      'همبستگی هوشمند رخدادها و کاهش ۹۰ درصدی هشدارهای کاذب (Alert Fatigue)',
      'پایش مستمر پهنای باند، تأخیر و سلامت سرویس‌های حیاتی',
      'گزارش‌های مدیریتی انطباق با توافق‌نامه سطح خدمات (SLA)',
    ],
    target_sector: 'infrastructure',
    isic_code: '631103',
    demo_available: true,
    is_featured: false,
    is_published: true,
    sort_order: 4,
  },
  {
    slug: 'vira-corpinsight-bi',
    title_fa: 'ویرا کورپ‌اینسایت (VIRA CorpInsight BI)',
    title_en: 'VIRA CorpInsight BI — Conversational Analytics & Executive Forecasting',
    summary_fa:
      'سامانه هوش تجاری نسل جدید با قابلیت گزارش‌گیری به زبان طبیعی فارسی و پیش‌بینی روندهای مالی و عملیاتی برای مدیران ارشد.',
    summary_en:
      'Next-generation conversational Business Intelligence and predictive forecasting suite for C-level executives.',
    description_fa: `با ویرا کورپ‌اینسایت، مدیران سازمان بدون نیاز به نوشتن کوئری‌های پیچیده فنی می‌توانند شاخص‌های کلیدی عملکرد (KPI)، روند بودجه، فروش و بهره‌وری واحدها را با پرسش به زبان فارسی به صورت نمودارهای تعاملی مشاهده و تحلیل کنند.`,
    description_en: `Ask questions in natural Persian and instantly generate verified SQL analytics, executive KPI charts, and multi-quarter demand forecasts.`,
    category: 'data-analytics',
    badge: 'تصمیم‌یار مدیران',
    image_url: '/banners/banner-3.jpg',
    features: [
      'تبدیل ایمن پرسش‌های فارسی به گزارش‌های تحلیلی و نمودار زنده',
      'مدل‌های پیش‌بینی تقاضا، جریان نقدینگی و مصرف منابع سازمانی',
      'اتصال به پایگاه‌های داده SQL Server، PostgreSQL، Oracle و اکسل',
    ],
    target_sector: 'enterprise',
    isic_code: '620104',
    demo_available: true,
    is_featured: false,
    is_published: true,
    sort_order: 5,
  },
  {
    slug: 'vira-coreops-llm-gateway',
    title_fa: 'ویرا کورآپس (VIRA CoreOps LLM Gateway)',
    title_en: 'VIRA CoreOps — Secure Enterprise AI Model Gateway & Governance',
    summary_fa:
      'درگاه متمرکز مدیریت، ممیزی امنیتی و توزیع بار مدل‌های هوش مصنوعی در داخل شبکه داخلی شرکت‌ها و سازمان‌ها.',
    summary_en:
      'Centralized governance, PII redaction, audit logging, and load-balancing gateway for enterprise AI workloads.',
    description_fa: `ویرا کورآپس زیرساخت نرم‌افزار پایه‌ای است که به تیم‌های فناوری اطلاعات سازمان‌ها اجازه می‌دهد دسترسی تمام نرم‌افزارهای داخلی به مدل‌های هوش مصنوعی را از یک درگاه امن، قابل ممیزی و مجهز به فیلتر داده‌های حساس مدیریت نمایند.`,
    description_en: `Unified OpenAI-compatible on-premise gateway with automatic Persian PII masking, token quotas per department, and full audit trails.`,
    category: 'infrastructure',
    badge: 'زیرساخت و امنیت AI',
    image_url: '/banners/banner-1.jpg',
    features: [
      'ماسک‌گذاری خودکار کد ملی، شماره حساب و اطلاعات محرمانه (PII Filter)',
      'سهمیه‌بندی منابع پردازشی به تفکیک هر واحد سازمانی',
      'ثبت کامل لاگ ممیزی (Audit Log) برای واحدهای حراست فناوری و امنیت اطلاعات',
    ],
    target_sector: 'infrastructure',
    isic_code: '620103',
    demo_available: true,
    is_featured: false,
    is_published: true,
    sort_order: 6,
  },
];

const INITIAL_ARTICLES = [
  {
    slug: 'enterprise-rag-architecture-iran',
    title_fa: 'معماری سامانه‌های RAG سازمانی فارسی؛ راهنمای جامع استقرار هوش مصنوعی ایمن در ادارات و سازمان‌ها',
    title_en: 'Enterprise Persian RAG Architecture: Secure On-Premise AI for Organizations',
    excerpt_fa:
      'چگونه سازمان‌ها و ادارات ایرانی می‌توانند بدون خروج اطلاعات محرمانه از شبکه داخلی، میلیون‌ها برگ بخشنامه و سند اداری را به یک دستیار هوشمند دقیق و مستند تبدیل کنند؟',
    excerpt_en:
      'How Iranian organizations can transform millions of internal Persian documents into an accurate, citation-backed AI assistant without data leaving their private network.',
    content_fa: `## چالش مدیریت دانش در سازمان‌ها و ادارات امروزی

در بسیاری از شرکت‌های بزرگ، بانک‌ها و ادارات دولتی ایران، دانش سازمانی در قالب هزاران فایل PDF، بخشنامه‌های اسکن‌شده، صورت‌جلسات و آیین‌نامه‌های داخلی ذخیره شده است. جستجوی کلیدواژه‌ای سنتی قادر به درک مفهوم پرسش کارشناسان نیست و یافتن یک تبصره خاص گاه ساعت‌ها زمان می‌برد.

در عین حال، استفاده از چت‌بات‌های عمومی اینترنتی به دلیل **محرمانگی داده‌ها**، قوانین حاکمیت داده و احتمال خطای توهم (Hallucination) برای سازمان‌ها غیرممکن است.

## راهکار چیست؟ معماری بازیابی تقویت‌شده با تولید (Enterprise RAG)

معماری **RAG (Retrieval-Augmented Generation)** به جای تکیه بر حافظه عمومی مدل زبانی، ابتدا اسناد معتبر داخلی سازمان را به صورت معنایی جستجو کرده و سپس پاسخ را **صرفاً بر اساس مستندات رسمی بازیابی‌شده** تدوین می‌کند.

### چهار لایه کلیدی در معماری پیشنهادی ویرا پردازش هومان

1. **لایه پاک‌سازی و نویسه‌خوانی تخصصی فارسی (Persian OCR & Normalization):** اصلاح یکپارچگی حروف «ی» و «ک» فارسی، تشخیص جداول پیچیده اداری و استخراج متن از نامه‌های اسکن‌شده.
2. **قطعه بندی هوشمند مبتنی بر ساختار حقوقی و اداری (Semantic Chunking):** تفکیک اسناد بر اساس «ماده»، «بند» و «تبصره» تا زنجیره معنایی قوانین شکسته نشود.
3. **جستجوی ترکیبی (Hybrid Search: Dense Vector + BM25):** ترکیب جستجوی برداری معنایی با تطبیق دقیق شماره بخشنامه، کد ملی یا شماره ثبت برای دستیابی به بالاترین دقت.
4. **استنتاج بومی و کنترل دسترسی (On-Premise Inference + RBAC):** رعایت کامل سطح دسترسی کاربر؛ به‌گونه‌ای که هر کارشناس تنها پاسخ‌هایی از اسنادی دریافت کند که مجوز مشاهده آن‌ها را دارد.

## مزایای ملموس برای مدیران ارشد

- کاهش **۷۰ درصدی** زمان پاسخگویی به استعلامات اداری و حقوقی
- حفظ **۱۰۰ درصدی** امنیت داده‌ها در سرورهای داخلی سازمان
- جلوگیری از فراموشی دانش سازمانی با بازنشستگی یا جابجایی نیروهای باتجربه

تیم مهندسی **ویرا پردازش هومان** آماده طراحی و پیاده‌سازی پایلوت اختصاصی سامانه هوشمند اسناد بر روی داده‌های واقعی سازمان شما است.`,
    content_en: `## Solving Institutional Knowledge Silos Without Cloud Data Leakage

Organizations hold decades of operational wisdom trapped in scanned Persian letters, bylaws, and technical manuals. Public cloud AI services pose unacceptable data-sovereignty risks.

### V.I.R.A Pardazesh Hoomaan's 4-Stage On-Premise RAG Pipeline
1. **Persian Layout-Aware OCR & Unicode Normalization**
2. **Clause-Boundary Semantic Chunking**
3. **Hybrid Vector + Lexical Retrieval with Reranking**
4. **Role-Based Access Control (RBAC) & Exact Source Citations**`,
    cover_image: '/banners/banner-1.jpg',
    category: 'هوش مصنوعی سازمانی',
    tags: ['هوش مصنوعی سازمانی', 'RAG فارسی', 'امنیت داده', 'اتوماسیون اداری'],
    author_name: 'واحد تحقیق و توسعه ویرا پردازش هومان',
    reading_time_minutes: 6,
    meta_title: 'معماری RAG سازمانی فارسی و هوش مصنوعی بومی ادارات | ویرا پردازش هومان',
    meta_description:
      'راهنمای فنی و مدیریتی پیاده‌سازی هوش مصنوعی بومی (On-Premise RAG) برای جستجوی هوشمند اسناد و نامه‌های اداری در شرکت‌ها و سازمان‌های ایرانی.',
    meta_keywords: 'هوش مصنوعی سازمانی, RAG فارسی, پردازش اسناد فارسی, هوش مصنوعی بومی, ویرا پردازش هومان',
    views_count: 342,
    likes_count: 48,
    is_published: true,
    published_at: '2026-10-12T08:30:00.000Z',
  },
  {
    slug: 'ai-industrial-automation-predictive-maintenance',
    title_fa: 'نقش هوش مصنوعی در اتوماسیون صنعتی و نگهداری پیش‌بینانه (Predictive Maintenance) خطوط تولید',
    title_en: 'AI in Industrial Automation & Predictive Maintenance for Smart Factories',
    excerpt_fa:
      'بررسی چگونگی اتصال سامانه‌های کنترلی PLC و SCADA به الگوریتم‌های یادگیری ماشین برای پیشگیری از توقفات ناگهانی و کاهش هزینه‌های تعمیرات صنعتی.',
    excerpt_en:
      'Connecting PLC/SCADA telemetry to machine learning models to eliminate unplanned downtime and reduce industrial maintenance costs.',
    content_fa: `## گذار از تعمیرات واکنشی به نگهداری پیش‌بینانه هوشمند

در صنایع تولیدی، نیروگاهی و خدماتی، یک ساعت توقف ناگهانی خط تولید می‌تواند میلیاردها ریال خسارت مستقیم و غیرمستقیم ایجاد کند. روش‌های سنتی نگهداری دوره‌ای (PM) نیز اغلب باعث تعویض زودهنگام قطعات سالم یا غافلگیری در برابر خرابی‌های پیش‌بینی‌نشده می‌شوند.

## همگرایی مهندسی کنترل و هوش مصنوعی

شرکت **ویرا پردازش هومان** با تکیه بر ظرفیت‌های مهندسی برق، الکترونیک، کنترل و اتوماسیون صنعتی، رویکردی عملیاتی برای هوشمندسازی کارخانجات ارائه می‌دهد:

### ۱. جمع‌آوری امن داده‌های سنسوری بدون مداخله در حلقه کنترل
با استفاده از درگاه‌های یک‌طرفه و پروتکل‌های استاندارد صنعتی (OPC-UA / Modbus)، داده‌های لرزش، حرارت و جریان الکتریکی بدون کوچک‌ترین اختلال در عملکرد PLC استخراج می‌شوند.

### ۲. تشخیص ناهنجاری مبتنی بر سری‌های زمانی
مدل‌های یادگیری ماشین الگوی کارکرد نرمال هر الکتروموتور، پمپ یا کمپرسور را در شرایط بارهای مختلف آموخته و انحرافات جزئی را پیش از رسیدن به آستانه بحرانی تشخیص می‌دهند.

### ۳. داشبورد تصمیم‌یار واحد نت (نگهداری و تعمیرات)
به جای نمایش نمودارهای پیچیده خام، سامانه به تکنسین اعلام می‌کند کدام تجهیز، با چه احتمالی و در چه بازه زمانی نیازمند بازبینی فنی است.`,
    content_en: `## Moving Beyond Scheduled Maintenance with Edge AI

Unplanned industrial downtime is costly. By pairing non-intrusive OPC-UA/Modbus telemetry gateways with time-series anomaly detection models at the edge, industrial teams detect bearing wear, thermal drift, and electrical imbalances weeks before failure.`,
    cover_image: '/banners/banner-2.jpg',
    category: 'اتوماسیون صنعتی هوشمند',
    tags: ['اتوماسیون صنعتی', 'نگهداری پیش‌بینانه', 'اینترنت اشیاء صنعتی', 'کنترل و ابزاردقیق'],
    author_name: 'گروه مهندسی اتوماسیون و هوش مصنوعی ویرا',
    reading_time_minutes: 5,
    meta_title: 'نگهداری پیش‌بینانه با هوش مصنوعی در اتوماسیون صنعتی | ویرا پردازش هومان',
    meta_description:
      'آشنایی با کاربرد هوش مصنوعی و یادگیری ماشین در پایش تجهیزات صنعتی، اتصال به PLC/SCADA و کاهش توقفات خطوط تولید.',
    meta_keywords: 'اتوماسیون صنعتی هوشمند, نگهداری پیش بینانه, هوش مصنوعی در صنعت, ویرا پردازش هومان',
    views_count: 219,
    likes_count: 35,
    is_published: true,
    published_at: '2026-10-18T10:15:00.000Z',
  },
  {
    slug: 'on-premise-llm-security-governance',
    title_fa: 'حاکمیت داده و امنیت استقرار بومی مدل‌های زبانی بزرگ (On-Premise LLM) در شبکه داخلی شرکت‌ها',
    title_en: 'Data Governance & Security Checklist for On-Premise Enterprise LLMs',
    excerpt_fa:
      'چک‌لیست امنیتی و معماری شبکه برای مدیران فناوری اطلاعات و حراست سایبری هنگام راه‌اندازی زیرساخت هوش مصنوعی درون‌سازمانی.',
    excerpt_en:
      'Security architecture and governance checklist for CIOs and CISOs deploying private large language models inside corporate data centers.',
    content_fa: `## چرا امنیت هوش مصنوعی با امنیت نرم‌افزارهای سنتی متفاوت است؟

ورود مدل‌های زبانی بزرگ به سازمان‌ها علاوه بر تهدیدات کلاسیک شبکه، چالش‌های نوینی همچون **تزریق پرامپت (Prompt Injection)**، نشت ناخواسته اطلاعات پرسنلی یا مالی و مصرف کنترل‌نشده منابع پردازشی را به همراه دارد.

## پنج اصل طلایی استقرار امن در شرکت‌ها و ادارات

1. **ایزولاسیون کامل در شبکه داخلی (Air-Gapped / Private VLAN):** سرورهای استنتاج هوش مصنوعی نباید هیچ مسیر خروجی مستقیم به اینترنت عمومی داشته باشند.
2. **درگاه ممیزی و ناشناس‌سازی خودکار (PII Masking Gateway):** پیش از ارسال متن به مدل، اطلاعات حساسی مانند کد ملی، شماره تماس و ارقام محرمانه قراردادها به صورت خودکار پالایش یا توکنایز می‌شوند.
3. **احراز هویت یکپارچه و تفکیک نقش‌ها:** اتصال مستقیم سامانه به سامانه احراز هویت متمرکز سازمان و ثبت دقیق شناسه کاربر در تمامی پرسش‌وپاسخ‌ها.
4. **محدودسازی نرخ درخواست و سهمیه واحدها:** جلوگیری از اشغال منابع GPU توسط یک واحد یا فرآیند خودکار.
5. **پایش مستمر خروجی‌ها (Guardrails):** اطمینان از انطباق لحن و محتوای خروجی دستیار هوشمند با چارچوب‌های رسمی و حقوقی سازمان.`,
    content_en: `## 5 Security Pillars for Private Enterprise LLMs

1. Private VLAN / Air-Gapped Inference Nodes
2. Automated Persian PII Redaction Gateways
3. Strict Role-Based Access & Full Audit Logging
4. Per-Department Rate & Token Quotas
5. Output Policy Guardrails`,
    cover_image: '/banners/banner-3.jpg',
    category: 'امنیت و زیرساخت شبکه',
    tags: ['امنیت هوش مصنوعی', 'LLM بومی', 'شبکه داده', 'حاکمیت داده'],
    author_name: 'تیم امنیت و شبکه ویرا پردازش هومان',
    reading_time_minutes: 7,
    meta_title: 'امنیت و حاکمیت داده در استقرار بومی مدل‌های هوش مصنوعی (On-Premise LLM)',
    meta_description:
      'راهنمای تخصصی مدیران فناوری اطلاعات برای راه‌اندازی امن مدل‌های زبانی بزرگ در مراکز داده داخلی سازمان‌ها بدون ریسک نشت اطلاعات.',
    meta_keywords: 'استقرار بومی LLM, امنیت هوش مصنوعی سازمانی, حاکمیت داده, شبکه مراکز داده',
    views_count: 278,
    likes_count: 41,
    is_published: true,
    published_at: '2026-10-22T14:00:00.000Z',
  },
  {
    slug: 'digital-transformation-roadmap-iranian-enterprises',
    title_fa: 'نقشه راه عملیاتی تحول دیجیتال مبتنی بر هوش مصنوعی برای مدیران سازمان‌های ایرانی',
    title_en: 'Practical AI Digital Transformation Roadmap for Iranian Enterprises',
    excerpt_fa:
      'چگونه پروژه‌های هوش مصنوعی را از سطح شعارهای تبلیغاتی به راهکارهایی با بازگشت سرمایه واقعی و قابل سنجش در سازمان تبدیل کنیم؟',
    excerpt_en:
      'How executive leaders can select high-ROI AI pilot projects and scale them sustainably across Iranian organizations.',
    content_fa: `## از هیجان فناوری تا ارزش‌آفرینی واقعی در ترازنامه سازمان

بسیاری از سازمان‌ها بدون ارزیابی آمادگی داده‌ها، وارد پروژه‌های بزرگ هوش مصنوعی می‌شوند و در میانه راه با چالش کیفیت داده یا مقاومت سازمانی روبه‌رو می‌گردند. تجربه مشاوره و نظارت فنی در پروژه‌های سازمانی نشان می‌دهد موفقیت در گرو **شروع هدفمند، چابک و نتیجه‌محور** است.

## چارچوب ۴ مرحله‌ای ویرا برای پیاده‌سازی موفق هوش مصنوعی

### گام اول: ممیزی فرآیندها و شناسایی گلوگاه‌های پرتکرار
شناسایی فرآیندهایی که روزانه بیشترین وقت نیروی انسانی متخصص را صرف امور تکراری (مانند بررسی فرم‌ها، خلاصه‌سازی پرونده‌ها یا پاسخ به سوالات تکراری مراجعین) می‌کنند.

### گام دوم: اجرای پایلوت ۴ تا ۶ هفته‌ای با شاخص سنجش شفاف
به‌جای پروژه‌های چندساله مبهم، یک نمونه عملیاتی محدود روی داده‌های واقعی یک واحد پیاده‌سازی شده و دقت و سرعت آن سنجیده می‌شود.

### گام سوم: یکپارچه‌سازی با نرم‌افزارهای موجود سازمان
هوش مصنوعی زمانی بیشترین پذیرش را دارد که در دل کارتابل و نرم‌افزارهای فعلی کارمندان قرار گیرد، نه به عنوان یک جزیره جداگانه.

### گام چهارم: آموزش مستمر سرمایه انسانی و پشتیبانی فنی
توانمندسازی کارشناسان سازمان برای بهره‌گیری مؤثر از ابزارهای هوشمند، ضامن پایداری بلندمدت تحول دیجیتال است.`,
    content_en: `## Turning AI Strategy Into Measurable Operational ROI

Successful enterprise AI starts with bottleneck discovery, a focused 4-to-6-week KPI-driven pilot, seamless ERP/workflow integration, and practical workforce training.`,
    cover_image: '/banners/banner-1.jpg',
    category: 'تحول دیجیتال و مدیریت',
    tags: ['تحول دیجیتال', 'مشاوره فناوری اطلاعات', 'مدیریت سازمان', 'بازگشت سرمایه'],
    author_name: 'شهرام امیری — مدیرعامل ویرا پردازش هومان',
    reading_time_minutes: 5,
    meta_title: 'نقشه راه پیاده‌سازی هوش مصنوعی در شرکت‌ها و سازمان‌های ایران | ویرا پردازش هومان',
    meta_description:
      'چارچوب چهار مرحله‌ای برای انتخاب، اجرای پایلوت و مقیاس‌دهی موفق پروژه‌های هوش مصنوعی در شرکت‌ها، ادارات و سازمان‌های ایران.',
    meta_keywords: 'مشاوره هوش مصنوعی سازمانی, تحول دیجیتال ادارات, پیاده سازی هوش مصنوعی در شرکت ها',
    views_count: 195,
    likes_count: 39,
    is_published: true,
    published_at: '2026-10-26T09:00:00.000Z',
  },
];

const INITIAL_SITE_CONTENTS = [
  {
    content_key: 'company.name_fa',
    section: 'company',
    label_fa: 'نام رسمی شرکت (فارسی)',
    value_fa: 'ویرا پردازش هومان',
    value_en: 'V.I.R.A Pardazesh Hoomaan',
  },
  {
    content_key: 'company.tagline_fa',
    section: 'company',
    label_fa: 'زیرعنوان کوتاه کنار لوگو در هدر',
    value_fa: 'راهکارهای هوش مصنوعی سازمانی',
    value_en: 'Enterprise AI Solutions',
  },
  {
    content_key: 'company.legal_name_fa',
    section: 'company',
    label_fa: 'عنوان حقوقی کامل طبق اساسنامه',
    value_fa: 'شرکت ویرا پردازش هومان با مسئولیت محدود',
    value_en: 'V.I.R.A Pardazesh Hoomaan LLC',
  },
  {
    content_key: 'company.reg_number',
    section: 'company',
    label_fa: 'شماره ثبت شرکت',
    value_fa: '۳۵۴۵',
    value_en: '3545',
  },
  {
    content_key: 'company.ceo_name',
    section: 'company',
    label_fa: 'نام مدیرعامل',
    value_fa: 'شهرام امیری',
    value_en: 'Shahram Amiri',
  },
  {
    content_key: 'footer.quick_links_title',
    section: 'company',
    label_fa: 'تیتر ستون دسترسی سریع در فوتر',
    value_fa: 'دسترسی سریع',
    value_en: 'Quick Links',
  },
  {
    content_key: 'footer.solutions_title',
    section: 'company',
    label_fa: 'تیتر ستون راهکارها در فوتر',
    value_fa: 'راهکارهای کلیدی',
    value_en: 'Core Solutions',
  },
  {
    content_key: 'footer.hq_title',
    section: 'company',
    label_fa: 'تیتر ستون اطلاعات تماس در فوتر',
    value_fa: 'ارتباط با ما',
    value_en: 'Contact Info',
  },
  {
    content_key: 'home.mission_badge',
    section: 'home',
    label_fa: 'نشان بالای معرفی صفحه اصلی',
    value_fa: 'نسل نوین مهندسی هوش مصنوعی و زیرساخت سازمانی در ایران',
    value_en: 'Next-Gen Enterprise AI & Infrastructure Engineering',
  },
  {
    content_key: 'home.mission_title',
    section: 'home',
    label_fa: 'تیتر اصلی H1 صفحه اصلی (شعار و هسته اصلی فعالیت)',
    value_fa: 'ارائه راه‌حل‌های مبتنی بر هوش مصنوعی برای شرکت‌ها، ادارات و سازمان‌ها',
    value_en: 'AI-Powered Solutions for Companies, Government Offices & Organizations',
  },
  {
    content_key: 'home.mission_subtitle',
    section: 'home',
    label_fa: 'توضیح تکمیلی زیر تیتر اصلی در صفحه اصلی',
    value_fa:
      'شرکت ویرا پردازش هومان (VPH Labs) با ترکیب هوش مصنوعی بومی، مهندسی نرم‌افزارهای سفارشی، اتوماسیون صنعتی و زیرساخت شبکه امن، فرآیندهای پیچیده سازمانی را به سامانه‌های هوشمند، سریع و قابل اعتماد تبدیل می‌کند.',
    value_en:
      'V.I.R.A Pardazesh Hoomaan (VPH Labs) combines secure on-premise AI, custom software engineering, smart industrial automation, and resilient network infrastructure to modernize organizational operations.',
  },
  {
    content_key: 'home.stat_1_value',
    section: 'home',
    label_fa: 'آمار اول — مقدار',
    value_fa: '۱۲',
    value_en: '12',
  },
  {
    content_key: 'home.stat_1_label',
    section: 'home',
    label_fa: 'آمار اول — عنوان',
    value_fa: 'حوزه رسمی فعالیت تخصصی در اساسنامه',
    value_en: 'Authorized Technical Charter Scopes',
  },
  {
    content_key: 'home.stat_2_value',
    section: 'home',
    label_fa: 'آمار دوم — مقدار',
    value_fa: '۱۰۰٪',
    value_en: '100%',
  },
  {
    content_key: 'home.stat_2_label',
    section: 'home',
    label_fa: 'آمار دوم — عنوان',
    value_fa: 'حفظ حاکمیت و محرمانگی داده‌های سازمانی',
    value_en: 'On-Premise Data Sovereignty',
  },
  {
    content_key: 'home.stat_3_value',
    section: 'home',
    label_fa: 'آمار سوم — مقدار',
    value_fa: '۲۴/۷',
    value_en: '24/7',
  },
  {
    content_key: 'home.stat_3_label',
    section: 'home',
    label_fa: 'آمار سوم — عنوان',
    value_fa: 'پایش هوشمند و پشتیبانی سامانه‌های حیاتی',
    value_en: 'Mission-Critical Monitoring & SLA Support',
  },
  {
    content_key: 'home.matcher_badge',
    section: 'home',
    label_fa: 'نشان بخش پیشنهادگر هوشمند (صفحه اصلی)',
    value_fa: 'تعامل زنده سازمانی',
    value_en: 'Live Interactive Selector',
  },
  {
    content_key: 'home.matcher_title',
    section: 'home',
    label_fa: 'تیتر H2 بخش پیشنهادگر راهکار (صفحه اصلی)',
    value_fa: 'پیشنهادگر هوشمند راهکار متناسب با سازمان شما',
    value_en: 'Interactive Enterprise AI Solution Matcher',
  },
  {
    content_key: 'home.matcher_subtitle',
    section: 'home',
    label_fa: 'توضیحات بخش پیشنهادگر راهکار (صفحه اصلی)',
    value_fa:
      'نوع سازمان یا حوزه عملیاتی خود را انتخاب کنید تا معماری پیشنهادی ویرا پردازش هومان را به‌صورت زنده مشاهده نمایید.',
    value_en:
      'Select your operational sector to preview V.I.R.A Pardazesh Hoomaan’s recommended on-premise AI stack.',
  },
  {
    content_key: 'home.featured_title',
    section: 'home',
    label_fa: 'تیتر H2 بخش محصولات برگزیده (صفحه اصلی)',
    value_fa: 'محصولات و سکوهای هوش مصنوعی ویرا',
    value_en: 'Featured Enterprise AI Platforms',
  },
  {
    content_key: 'home.featured_subtitle',
    section: 'home',
    label_fa: 'توضیحات بخش محصولات برگزیده (صفحه اصلی)',
    value_fa: 'نرم‌افزارهای سازمانی طراحی‌شده برای استقرار امن در شبکه داخلی شرکت‌ها و ادارات',
    value_en: 'Production-ready intelligent software engineered for private corporate & government networks',
  },
  {
    content_key: 'home.articles_title',
    section: 'home',
    label_fa: 'تیتر H2 بخش تازه‌ترین مقالات (صفحه اصلی)',
    value_fa: 'تازه‌ترین مقالات و جستارهای تخصصی',
    value_en: 'Latest Technical Articles & Essays',
  },
  {
    content_key: 'home.articles_subtitle',
    section: 'home',
    label_fa: 'توضیحات بخش تازه‌ترین مقالات (صفحه اصلی)',
    value_fa: 'تحلیل‌های فنی و مدیریتی پیرامون هوش مصنوعی سازمانی، اتوماسیون صنعتی و امنیت داده',
    value_en: 'In-depth engineering essays on Enterprise RAG, Industrial AI Automation, and Data Governance',
  },
  {
    content_key: 'home.charter_title',
    section: 'home',
    label_fa: 'تیتر H2 بخش صلاحیت‌های اساسنامه (صفحه اصلی)',
    value_fa: 'پشتوانه حقوقی و صلاحیت‌های رسمی اساسنامه',
    value_en: 'Official Corporate Charter Capabilities',
  },
  {
    content_key: 'home.charter_subtitle',
    section: 'home',
    label_fa: 'توضیحات بخش صلاحیت‌های اساسنامه (صفحه اصلی)',
    value_fa: 'خلاصه‌ای از مجوزها و موضوعات رسمی مندرج در ماده ۲ اساسنامه شرکت ویرا پردازش هومان',
    value_en: 'Selected authorized engineering scopes from Article 2 of our corporate charter',
  },
  {
    content_key: 'products.page_title',
    section: 'products',
    label_fa: 'تیتر اصلی H1 صفحه محصولات',
    value_fa: 'محصولات و راهکارهای هوش مصنوعی سازمانی',
    value_en: 'Enterprise AI Products & Solutions',
  },
  {
    content_key: 'products.page_subtitle',
    section: 'products',
    label_fa: 'توضیحات زیر تیتر اصلی صفحه محصولات',
    value_fa: 'مجموعه نرم‌افزارهای هوشمند، درگاه‌های بومی LLM و سامانه‌های پایش صنعتی شرکت ویرا پردازش هومان',
    value_en: 'On-premise document intelligence, LLM gateways, and smart industrial telemetry built by VPH Labs',
  },
  {
    content_key: 'products.detail_overview_title',
    section: 'products',
    label_fa: 'تیتر H2 بخش معرفی در صفحه تکی محصول',
    value_fa: 'معرفی و معماری راهکار',
    value_en: 'Solution Overview & Architecture',
  },
  {
    content_key: 'products.detail_features_title',
    section: 'products',
    label_fa: 'تیتر H2 بخش ویژگی‌ها در صفحه تکی محصول',
    value_fa: 'قابلیت‌ها و ویژگی‌های کلیدی',
    value_en: 'Key Capabilities',
  },
  {
    content_key: 'services.page_title',
    section: 'services',
    label_fa: 'تیتر اصلی H1 صفحه خدمات تخصصی',
    value_fa: 'خدمات تخصصی و حوزه‌های مجاز اساسنامه',
    value_en: 'Authorized Engineering & AI Services',
  },
  {
    content_key: 'services.page_subtitle',
    section: 'services',
    label_fa: 'توضیحات زیر تیتر اصلی صفحه خدمات',
    value_fa: 'ترکیب ۱۲ ردیف صلاحیت رسمی ثبت‌شده در اساسنامه شرکت ویرا پردازش هومان با فناوری‌های پیشرفته هوش مصنوعی',
    value_en: 'All 12 official scopes of Article 2 of V.I.R.A Pardazesh Hoomaan’s corporate charter, supercharged with modern AI',
  },
  {
    content_key: 'services.cta_title',
    section: 'services',
    label_fa: 'تیتر H2 باکس فراخوان مشاوره در انتهای صفحه خدمات',
    value_fa: 'نیازمند طراحی سامانه سفارشی یا مشاوره نظارت فنی هستید؟',
    value_en: 'Need custom software engineering or AI supervision?',
  },
  {
    content_key: 'services.cta_subtitle',
    section: 'services',
    label_fa: 'توضیحات باکس فراخوان مشاوره در صفحه خدمات',
    value_fa: 'تیم مهندسی ویرا پردازش هومان آماده عقد قراردادهای مشاوره، پیمانکاری و تولید نرم‌افزار سفارشی با شرکت‌ها و سازمان‌هاست.',
    value_en: 'V.I.R.A Pardazesh Hoomaan delivers SLA-backed enterprise software, AI consulting, and infrastructure projects.',
  },
  {
    content_key: 'services.cta_button',
    section: 'services',
    label_fa: 'متن دکمه فراخوان در صفحه خدمات',
    value_fa: 'ثبت درخواست مشاوره تخصصی',
    value_en: 'Schedule Technical Consultation',
  },
  {
    content_key: 'articles.page_title',
    section: 'articles',
    label_fa: 'تیتر اصلی H1 صفحه مقالات و جستارها',
    value_fa: 'مقالات، پژوهش‌ها و جستارهای تخصصی',
    value_en: 'Technical Articles & Research Essays',
  },
  {
    content_key: 'articles.page_subtitle',
    section: 'articles',
    label_fa: 'توضیحات زیر تیتر اصلی صفحه مقالات',
    value_fa: 'مرجع تخصصی معماری هوش مصنوعی بومی، تحول دیجیتال سازمان‌ها و اتوماسیون صنعتی در ایران',
    value_en: 'Insights on sovereign enterprise AI, industrial predictive maintenance, and digital transformation',
  },
  {
    content_key: 'articles.related_title',
    section: 'articles',
    label_fa: 'تیتر H2 بخش مقالات مرتبط در پایین هر مقاله',
    value_fa: 'مقالات مرتبط پیشنهادی',
    value_en: 'Related Technical Essays',
  },
  {
    content_key: 'about.story_badge',
    section: 'about',
    label_fa: 'نشان بالای تیتر صفحه درباره ما',
    value_fa: 'V.I.R.A Pardazesh Hoomaan (VPH Labs)',
    value_en: 'V.I.R.A Pardazesh Hoomaan (VPH Labs)',
  },
  {
    content_key: 'about.story_title',
    section: 'about',
    label_fa: 'تیتر اصلی H1 صفحه درباره ما',
    value_fa: 'مهندسی آینده هوشمند برای سازمان‌های پیشرو ایران',
    value_en: 'Engineering Intelligent Futures for Leading Organizations',
  },
  {
    content_key: 'about.story_body',
    section: 'about',
    label_fa: 'توضیحات معرفی شرکت زیر تیتر اصلی (صفحه درباره ما)',
    value_fa:
      'شرکت ویرا پردازش هومان با مسئولیت محدود (شماره ثبت ۳۵۴۵) با مأموریت تخصصی «ارائه راه‌حل‌های مبتنی بر هوش مصنوعی برای شرکت‌ها، ادارات و سازمان‌ها» فعالیت می‌کند. ما بر این باوریم که هوش مصنوعی سازمانی زمانی ارزشمند است که ایمن، دقیق، منطبق بر زبان و فرآیندهای بومی ایران و یکپارچه با زیرساخت واقعی شبکه و اتوماسیون سازمان باشد.',
    value_en:
      'V.I.R.A Pardazesh Hoomaan LLC (Reg. No. 3545) delivers secure, high-impact Artificial Intelligence solutions tailored for enterprises, administrative bodies, and industrial organizations.',
  },
  {
    content_key: 'about.legal_card_title',
    section: 'about',
    label_fa: 'تیتر H2 کارت شناسنامه حقوقی و ثبتی شرکت',
    value_fa: 'شناسنامه حقوقی و ثبتی شرکت',
    value_en: 'Official Legal Registration Profile',
  },
  {
    content_key: 'about.ceo_quote',
    section: 'about',
    label_fa: 'پیام مدیرعامل در صفحه درباره ما',
    value_fa:
      'هدف ما در ویرا پردازش هومان، تبدیل هوش مصنوعی از یک مفهوم انتزاعی به ابزاری ملموس، امن و بهره‌وری‌آفرین در میز کار کارشناسان، مدیران و خطوط تولید کشور است.',
    value_en:
      'Our commitment at V.I.R.A Pardazesh Hoomaan is turning AI from an abstract buzzword into a secure, dependable force-multiplier across offices, data centers, and industrial floors.',
  },
  {
    content_key: 'about.ceo_role',
    section: 'about',
    label_fa: 'سمت مدیرعامل زیر نقل‌قول در صفحه درباره ما',
    value_fa: 'مدیرعامل شرکت ویرا پردازش هومان',
    value_en: 'CEO, V.I.R.A Pardazesh Hoomaan',
  },
  {
    content_key: 'about.hq_section_title',
    section: 'about',
    label_fa: 'تیتر H2 بخش نشانی دفتر در صفحه درباره ما',
    value_fa: 'نشانی دفتر و اقامتگاه شرکت',
    value_en: 'Corporate Office Address',
  },
  {
    content_key: 'about.team_title',
    section: 'about',
    label_fa: 'تیتر H2 بخش معرفی همکاران (صفحه درباره ما)',
    value_fa: 'معرفی مدیران و همکاران ویرا پردازش هومان',
    value_en: 'Meet Our Leadership & Engineering Team',
  },
  {
    content_key: 'about.team_subtitle',
    section: 'about',
    label_fa: 'توضیحات بخش معرفی همکاران (صفحه درباره ما)',
    value_fa:
      'تیمی متشکل از متخصصان هوش مصنوعی، مهندسان نرم‌افزار، شبکه و اتوماسیون صنعتی در خدمت تحول هوشمند سازمان‌ها',
    value_en:
      'Specialists in artificial intelligence, enterprise software, data networks, and industrial automation.',
  },
  {
    content_key: 'about.charter_title',
    section: 'about',
    label_fa: 'تیتر H2 بخش موضوع فعالیت اساسنامه (صفحه درباره ما)',
    value_fa: 'موضوع فعالیت رسمی شرکت (ماده ۲ اساسنامه)',
    value_en: 'Authorized Scopes of Activity (Charter Article 2)',
  },
  {
    content_key: 'contact.page_title',
    section: 'contact',
    label_fa: 'تیتر اصلی H1 صفحه تماس و مشاوره',
    value_fa: 'تماس با ویرا پردازش هومان و درخواست مشاوره',
    value_en: 'Contact & Enterprise Consultation',
  },
  {
    content_key: 'contact.page_subtitle',
    section: 'contact',
    label_fa: 'توضیحات زیر تیتر اصلی صفحه تماس و مشاوره',
    value_fa:
      'برای دریافت دمو سامانه‌های هوش مصنوعی، سفارش تولید نرم‌افزار اختصاصی یا مشاوره زیرساخت با ما در ارتباط باشید.',
    value_en:
      'Connect with our engineering team for on-premise AI pilots, bespoke software, or network automation.',
  },
  {
    content_key: 'contact.form_title',
    section: 'contact',
    label_fa: 'تیتر H2 فرم ثبت درخواست در صفحه تماس',
    value_fa: 'فرم ثبت درخواست سازمانی',
    value_en: 'Enterprise Inquiry Form',
  },
  {
    content_key: 'contact.hq_title',
    section: 'contact',
    label_fa: 'تیتر H2 کارت نشانی و اطلاعات تماس در صفحه تماس',
    value_fa: 'نشانی و اطلاعات تماس شرکت',
    value_en: 'Headquarters & Contact Details',
  },
  {
    content_key: 'contact.address_fa',
    section: 'contact',
    label_fa: 'نشانی دفتر شرکت (نمایش در فوتر، تماس با ما و درباره ما)',
    value_fa:
      'همدان - ملایر - خیابان سعدی - کوچه مرتضی مهاجر - کوچه محبت - پلاک 4 - واحد 3',
    value_en:
      'Unit 3, No. 4, Mohabbat Alley, Morteza Mohajer Alley, Saadi St., Malayer, Hamedan, Iran',
  },
  {
    content_key: 'contact.postal_code',
    section: 'contact',
    label_fa: 'کد پستی دفتر مرکزی',
    value_fa: '6571611860',
    value_en: '6571611860',
  },
  {
    content_key: 'contact.email',
    section: 'contact',
    label_fa: 'ایمیل رسمی مکاتبات سازمانی',
    value_fa: 'info@vphlabs.com',
    value_en: 'info@vphlabs.com',
  },
  {
    content_key: 'contact.phone',
    section: 'contact',
    label_fa: 'شماره تماس (فوتر و صفحه تماس با ما)',
    value_fa: '0912 576 2296',
    value_en: '0912 576 2296',
  },
  {
    content_key: 'contact.working_hours',
    section: 'contact',
    label_fa: 'ساعات پاسخگویی اداری',
    value_fa: 'شنبه تا چهارشنبه: ۸:۰۰ الی ۱۷:۰۰ | پنجشنبه‌ها: ۸:۰۰ الی ۱۳:۰۰',
    value_en: 'Sat – Wed: 08:00 – 17:00 | Thu: 08:00 – 13:00 (IRST)',
  },
  {
    content_key: 'contact.onboarding_title',
    section: 'contact',
    label_fa: 'تیتر باکس مراحل آغاز همکاری در صفحه تماس',
    value_fa: 'فرآیند آغاز همکاری سازمانی با ویرا پردازش هومان',
    value_en: 'Enterprise Onboarding Workflow',
  },
  {
    content_key: 'contact.onboarding_step_1',
    section: 'contact',
    label_fa: 'مرحله اول همکاری (صفحه تماس)',
    value_fa: 'برگزاری جلسه نیازسنجی فنی و امضای تفاهم‌نامه محرمانگی (NDA)',
    value_en: 'Technical discovery session under mutual NDA',
  },
  {
    content_key: 'contact.onboarding_step_2',
    section: 'contact',
    label_fa: 'مرحله دوم همکاری (صفحه تماس)',
    value_fa: 'ارائه دمو زنده و پیشنهاد فنی-مالی منطبق بر زیرساخت سازمان',
    value_en: 'Live tailored demo & on-premise architecture proposal',
  },
  {
    content_key: 'contact.onboarding_step_3',
    section: 'contact',
    label_fa: 'مرحله سوم همکاری (صفحه تماس)',
    value_fa: 'استقرار پایلوت، آموزش کارشناسان و پشتیبانی مستمر SLA',
    value_en: 'Pilot rollout, staff training & SLA-backed support',
  },
  {
    content_key: 'footer.copyright',
    section: 'company',
    label_fa: 'متن کپی‌رایت فوتر',
    value_fa:
      'کلیه حقوق مادی و معنوی این وب‌سایت متعلق به شرکت ویرا پردازش هومان با مسئولیت محدود (VPHLabs.com) می‌باشد.',
    value_en:
      'All rights reserved © V.I.R.A Pardazesh Hoomaan LLC (VPHLabs.com).',
  },
];

function seedDatabase() {
  runMigrations();

  let seededAdmin = false;
  const targetAdmin = userRepository.findByEmailWithHash(env.seedAdminEmail);

  if (targetAdmin) {
    const passwordMatches = bcrypt.compareSync(
      env.seedAdminPassword,
      targetAdmin.password_hash
    );
    const needsRoleOrActiveFix =
      targetAdmin.role !== 'admin' || !targetAdmin.is_active;

    if (!passwordMatches || needsRoleOrActiveFix) {
      const hash = bcrypt.hashSync(env.seedAdminPassword, 12);
      userRepository.updateCredentials(targetAdmin.id, {
        email: env.seedAdminEmail,
        password_hash: hash,
      });
      logger.info(
        { email: env.seedAdminEmail },
        'Synchronized admin password & active role with configured environment credentials'
      );
    }
  } else {
    const existingAdmin =
      userRepository.findByEmailWithHash('admin@vphlabs.com') ||
      userRepository.findFirstAdminWithHash();

    if (existingAdmin) {
      const hash = bcrypt.hashSync(env.seedAdminPassword, 12);
      userRepository.updateCredentials(existingAdmin.id, {
        email: env.seedAdminEmail,
        password_hash: hash,
      });
      logger.info(
        { previousEmail: existingAdmin.email, email: env.seedAdminEmail },
        'Migrated existing admin account to configured environment credentials'
      );
    } else {
      const hash = bcrypt.hashSync(env.seedAdminPassword, 12);
      userRepository.create({
        name: env.seedAdminName,
        email: env.seedAdminEmail,
        password_hash: hash,
        role: 'admin',
      });
      seededAdmin = true;
      logger.info({ email: env.seedAdminEmail }, 'Seeded initial admin user');
    }
  }

  if (bannerRepository.countAll() === 0) {
    for (const banner of INITIAL_BANNERS) {
      bannerRepository.create(banner);
    }
    logger.info({ count: INITIAL_BANNERS.length }, 'Seeded initial home banners');
  }

  if (serviceRepository.countAll() === 0) {
    for (const service of INITIAL_SERVICES) {
      serviceRepository.create(service);
    }
    logger.info({ count: INITIAL_SERVICES.length }, 'Seeded charter services');
  }

  if (teamRepository.countAll() === 0) {
    for (const member of INITIAL_TEAM_MEMBERS) {
      teamRepository.create(member);
    }
    logger.info({ count: INITIAL_TEAM_MEMBERS.length }, 'Seeded initial team members');
  }

  if (productRepository.countAll() === 0) {
    for (const product of INITIAL_PRODUCTS) {
      productRepository.create(product);
    }
    logger.info({ count: INITIAL_PRODUCTS.length }, 'Seeded initial AI products');
  }

  if (articleRepository.countAll() === 0) {
    for (const article of INITIAL_ARTICLES) {
      articleRepository.create(article);
    }
    logger.info({ count: INITIAL_ARTICLES.length }, 'Seeded initial SEO articles');
  }

  const insertedContents = contentRepository.seedMissing(INITIAL_SITE_CONTENTS);
  if (insertedContents > 0) {
    logger.info(
      { count: insertedContents },
      'Seeded missing dynamic site contents'
    );
  }

  return { seededAdmin };
}

if (require.main === module) {
  try {
    seedDatabase();
    console.log('[seed] Database seed completed successfully.');
  } catch (err) {
    console.error('[seed] Failed to seed database:', err);
    process.exit(1);
  }
}

module.exports = {
  seedDatabase,
};
