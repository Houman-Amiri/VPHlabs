# شرکت ویرا پردازش هومان | V.I.R.A Pardazesh Hoomaan (`VPHLabs.com`)

وب‌سایت رسمی، سکوی معرفی محصولات هوش مصنوعی، مجله تخصصی سئو فارسی و پنل مدیریت پویای محتوا (CMS) ویژه **شرکت ویرا پردازش هومان با مسئولیت محدود** (شماره ثبت `۳۵۴۵` — شناسه ملی `۱۴۰۱۵۴۹۵۰۱۳`).

> **هسته اصلی فعالیت:** «ارائه راه‌حل‌های مبتنی بر هوش مصنوعی برای شرکت‌ها، ادارات و سازمان‌ها»

---

## معماری پروژه (Express MVC + SQLite بدون ORM + React/Vite TypeScript)

```text
VPHlabs/
├── project brief.md              # مستند مرجع بافت هوش مصنوعی و خلاصه اساسنامه شرکت
├── API_DOCS.md                   # مستندات خودکار استخراج‌شده از فایل‌های مسیر Express
├── .env.example                  # الگوی متغیرهای محیطی
├── .github/workflows/ci.yml      # خط لوله CI گیت‌هاب اکشنز (تست و بیلد روی main)
├── server/                       # بک‌اند Node.js + Express MVC + better-sqlite3
│   ├── src/
│   │   ├── connection/db.js      # اتصال better-sqlite3 با WAL و Foreign Keys
│   │   ├── migrations/           # فایل‌های شماره‌گذاری‌شده SQL + مهاجرت‌ران خودکار
│   │   ├── repositories/         # لایه Prepared Statements (کنترلرها مستقیماً به db دست نمی‌زنند)
│   │   ├── controllers/          # کنترلرهای MVC متصل به میان‌افزار خطای متمرکز
│   │   ├── middlewares/          # احراز هویت JWT، نقش‌ها، اعتبارسنجی Zod، Multer و امنیت
│   │   ├── validators/           # اسکیماهای اعتبارسنجی Zod
│   │   ├── routes/               # مسیرهای تفکیک‌شده هر موجودیت + خروجی متادیتای مستندات
│   │   └── seeds/seed.js         # داده‌های اولیه منطبق بر اساسنامه رسمی شرکت
│   └── tests/api.test.js         # تست‌های یکپارچه امنیتی، صفحه‌بندی، جستجو و RBAC
└── client/                       # فرانت‌اند React 18 + Vite + TypeScript
    ├── public/banners/           # بنرهای عریض اختصاصی صفحه اصلی
    └── src/
        ├── i18n/                 # دوزبانه فارسی (RTL پیش‌فرض) و انگلیسی (LTR) با react-i18next
        ├── lib/                  # Axios wrapper، Sentry و آنالیتیکس Umami
        ├── store/                # مدیریت وضعیت با Zustand (پوسته تاریک/روشن، نشست، محتوای پویا)
        ├── schemas/              # اعتبارسنجی فرم‌ها با React Hook Form + Zod
        ├── components/           # کامپوننت‌های ماژولار، گارد مسیرها و بنر کاروسل بدون متن روکش
        └── pages/                # صفحات مجزا (/، /products، /services، /articles/:id، /about، /contact، /admin/*)
```

---

## دستورات دقیق ترمینال جهت ساخت (Scaffold) اولیه پروژه React + Vite (TypeScript)

مطابق فاز ۳، دستورات استاندارد استفاده شده برای ایجاد پروژه فرانت‌اند **V.I.R.A Pardazesh Hoomaan (VPH)**:

```bash
# ۱. ساخت اسکلت اولیه React + Vite با TypeScript
npm create vite@latest client -- --template react-ts

# ۲. ورود به پوشه فرانت‌اند و نصب وابستگی‌های اصلی معماری
cd client
npm install react-router-dom@^6 axios zustand react-hook-form @hookform/resolvers zod \
  i18next react-i18next lucide-react @sentry/react \
  @fontsource/vazirmatn @fontsource/inter @fontsource/jetbrains-mono

# ۳. نصب ابزارهای تست (Vitest + React Testing Library)
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

---

## راه‌اندازی و اجرا در محیط توسعه

```bash
# ۱. نصب وابستگی‌های سرور و کلاینت
npm run install:all

# ۲. اجرای مهاجرت‌های SQL و بارگذاری داده‌های اولیه اساسنامه
npm run migrate
npm run seed

# ۳. اجرای هم‌زمان بک‌اند (پورت 4000) و فرانت‌اند (پورت 5173)
npm run dev:server
npm run dev:client
```

### اجرای تست‌ها و تولید مستندات بدون انحراف API
```bash
npm test            # اجرای تمام تست‌های بک‌اند و فرانت‌اند
npm run docs:api    # بازتولید API_DOCS.md مستقیماً از فایل‌های مسیر Express
npm run build       # بیلد نهایی TypeScript + Vite
```

---

## دسترسی به پنل مدیریت پویا (`/admin`)

پنل مدیریت از طریق تایپ مستقیم مسیر `/admin` در انتهای دامنه در دسترس است و مشخصات مدیر اولیه از متغیرهای محیطی (`SEED_ADMIN_EMAIL` و `SEED_ADMIN_PASSWORD`) بارگذاری می‌شود.

از طریق پنل مدیریت (`/admin`) می‌توانید به‌صورت کاملاً پویا موارد زیر را ویرایش، اضافه یا حذف کنید:
1. **محصولات و راهکارهای هوش مصنوعی** (به همراه بارگذاری تصویر با `multer`)
2. **مقالات و جستارهای تخصصی** (مجهز به فیلدهای کامل سئو فارسی، اسلاگ، متاتگ‌ها و ثبت خودکار در `/sitemap.xml`)
3. **تصاویر عریض کلیک‌پذیر بنر صفحه اصلی** و لینک مقصد هر اسلاید
4. **تمامی متون صفحات سایت** (صفحه اصلی، آمارها، درباره ما، پیام مدیرعامل، اطلاعات ثبتی، آدرس و تلفن تماس، فوتر و ۱۲ ردیف خدمات اساسنامه)
5. **پیام‌ها و درخواست‌های دمو سازمانی** ارسالی از فرم تماس
