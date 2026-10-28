# Project Brief — V.I.R.A Pardazesh Hoomaan (VPHLabs.com)

## 1. Company Identity & Official Charter Context (`اساسنامه`)
- **Official Persian Name:** شرکت ویرا پردازش هومان با مسئولیت محدود
- **English Brand Name:** V.I.R.A Pardazesh Hoomaan (VPH / VPH Labs)
- **Primary Domain:** `https://vphlabs.com`
- **Legal Entity Type:** شرکت با مسئولیت محدود (Limited Liability Company)
- **Registration Number (شماره ثبت):** `3545` (`۳۵۴۵`)
- **National Legal ID (شناسه ملی):** `14015495013` (`۱۴۰۱۵۴۹۵۰۱۳`)
- **Mechanized Charter ID (شماره مکانیزه):** `140580426772000032`
- **Charter Approval Date:** `1405/03/19` (Issued `1405/05/07`)
- **Chief Executive Officer (مدیرعامل):** شهرام امیری (Shahram Amiri)
- **Registered Legal Headquarters (ماده ۳ اساسنامه):**
  استان همدان، شهرستان ملایر، بخش مرکزی، شهر ملایر، شهرک ولیعصر، خیابان شهید کرم خدا صالحی [سینا]، بن‌بست سنبل، پلاک ۰، طبقه ۲، واحد ۳ — کد پستی: `۶۵۷۱۳۴۳۵۶۳`
- **Core Mission Statement:**
  > «ارائه راه‌حل‌های مبتنی بر هوش مصنوعی برای شرکت‌ها، ادارات و سازمان‌ها»
  > *(Delivering enterprise-grade Artificial Intelligence solutions for companies, government offices, and organizations.)*

### Official Authorized Scopes of Activity (ماده ۲ اساسنامه — ۱۲ ردیف رسمی با کد آیسیک)
1. خدمات مشاوره و نظارت بر اجرای طرح فن‌آوری اطلاعات و ارتباطات (`620201`)
2. خدمات فن‌آوری اطلاعات (`620104`)
3. خدمات شبکه داده‌های رایانه‌ای و ارتباطی (`631103`)
4. خدمات آموزش و پژوهش در زمینه فن‌آوری اطلاعات (`620905`)
5. تولید و پشتیبانی نرم‌افزار سفارش مشتری (`620101`)
6. خدمات فنی و مهندسی (برق، الکترونیک، کنترل و اتوماسیون) (`711203`)
7. خدمات پشتیبانی فن‌آوری اطلاعات (`620903`)
8. بهره‌برداری و نگهداری از شبکه (`351015`)
9. خدمات سامانه اتوماسیون صنعتی (`620906`)
10. خدمات پیمانکاری (ارتباطات و فن‌آوری اطلاعات) (`620904`)
11. تولید و پشتیبانی بسته نرم‌افزاری (`620102`)
12. تولید و پشتیبانی نرم‌افزار پایه، سیستم و ابزارها (`620103`)

---

## 2. Product Vision & UX Principles
1. **Iranian-First Accessibility & Performance:**
   - Default RTL Persian (`fa-IR`) interface using locally bundled **Vazirmatn** fonts (zero reliance on filtered/slow external Google Font CDNs in Iran) + seamless bilingual switch (`fa` / `en`) via `react-i18next`.
   - Native Persian numeral formatting (`Intl.NumberFormat('fa-IR')`) and Solar Hijri (Jalali) calendar formatting (`Intl.DateTimeFormat('fa-IR-u-ca-persian')`).
2. **Minimalist AI & Enterprise Tech Aesthetic:**
   - Clean, architectural dark & light theme switch with persistent preference and WCAG AA+ contrast.
   - Live interactive elements (interactive enterprise AI solution matcher, live reaction/helpful counters on articles, copyable legal/postal badges, interactive product inquiry triggers).
3. **Strict Multi-Page Architecture (No Single-Page Tab Cramming):**
   - `/` — Live Landing Page:
     - **Home Carousel Banner Rule (Strict):** Plain wide clickable image carousel with **NO overlay text or CTA buttons**, navigated solely via **two directional arrows** positioned over the banner edges.
     - Live company introduction, interactive AI enterprise solution explorer, featured AI products, and recent SEO articles with rich metadata.
   - `/products` & `/products/:slug` — Dynamic AI & software catalog with SQL `LIKE` search, category filters, sorting, and server-side pagination.
   - `/services` — Enterprise AI & ICT engineering services mapped to the 12 official charter clauses.
   - `/articles` & `/articles/:id` (and `/Articles/:id`) — Persian SEO-optimized technical blog & essay reader with Schema.org JSON-LD, OpenGraph tags, reading time, tags, and table of contents.
   - `/about` — Official company story, CEO profile, legal registration details, and charter overview.
   - `/contact` (`/Contact`) — Enterprise consultation & contact form (`react-hook-form` + `zod`) + official Malayer headquarters details.
   - `/admin/*` — Protected full dynamic CMS allowing admins to create/update/delete **Products**, **Articles/Essays**, **Home Carousel Banners**, **Services**, **Page Texts/Sections across the entire site**, **Uploaded Media**, and **Contact Inquiries**.

---

## 3. Technical Architecture & Guardrails

### Back-End (`server/` — Node.js + Express MVC + `better-sqlite3`, No ORM)
- **Database Layer:**
  - `server/src/connection/db.js` manages the `better-sqlite3` connection (`WAL` journal mode, `foreign_keys = ON`, `busy_timeout = 5000`).
  - Numbered SQL migrations (`server/src/migrations/001_*.sql`, etc.) tracked in `migrations_applied`, executed **before** the HTTP server starts.
  - **Repository Rule (Strict):** All SQL lives inside `server/src/repositories/*Repository.js` using prepared statements (`db.prepare(...)`). Controllers **never** import or touch `db` directly.
- **MVC & Validation:**
  - `routes/` -> `middlewares/validate.js` (Zod) -> `controllers/` -> `repositories/`.
  - Centralized `AppError` + `errorHandler` middleware; controllers throw `AppError` instances cleanly.
- **Security & Observability:**
  - Password hashing with `bcryptjs` (cost factor 12) + JWT in `httpOnly`, `sameSite: 'lax'`, `secure` (in prod) cookies + optional Bearer token support.
  - Role-Based Access Control via `requireAuth` and `requireRole('admin')`.
  - `helmet`, strict `cors` configuration, recursive XSS/prototype-pollution input sanitization, and `express-rate-limit` (**5 req/min per IP** on `/api/auth/*`).
  - `morgan` + `pino` structured logging and `@sentry/node` error tracking.
  - `multer` file uploads supporting both `local` disk storage and `S3-compatible` object storage (e.g., ArvanCloud Object Storage / MinIO / AWS S3).
  - Auto-generated API documentation (`API_DOCS.md`) extracted directly from route metadata, plus `/api/health`, `/sitemap.xml`, and `/robots.txt`.

### Front-End (`client/` — React 18 + Vite + TypeScript)
- **Routing:** React Router v6 with `<RequireAuth>` and `<RequireRole>` guards.
- **Networking:** Centralized Axios instance (`baseURL: '/api'`, `withCredentials: true`, token attachment, normalized `ApiError` handling). Never hardcode `localhost` in browser code; rely on relative `/api` and `/uploads` paths proxied by Vite in dev and Express/reverse-proxy in production.
- **State Management:** Zustand (`useThemeStore`, `useAuthStore`, `useSiteStore`, `useToastStore`).
- **Forms:** `react-hook-form` + `zod` schemas matching backend API validators, complete with loading, error, empty, and success states.
- **Analytics & Monitoring:** `@sentry/react` error boundary + Umami privacy-first analytics integration.
