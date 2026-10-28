# API Documentation — V.I.R.A Pardazesh Hoomaan (`VPHLabs.com`)

> **Zero-Drift Guarantee:** This document is automatically generated from the actual Express route stacks (`server/src/routes/*.js`) via `npm run docs:api`. Every endpoint listed below is verified against live Express `router.stack` definitions.

## Base Conventions
- **Base API Prefix:** `/api`
- **Response Envelope (Success):** `{ "success": true, "data": ..., "pagination"?: { "page", "limit", "total", "totalPages" } }`
- **Response Envelope (Error):** `{ "success": false, "error": { "code": "...", "message": "...", "details"?: [...] } }`
- **Authentication:** `httpOnly` JWT cookie (`vph_token`, `sameSite=lax`) or `Authorization: Bearer <token>` header.
- **Auth Rate Limit:** `/api/auth/*` is strictly limited to **5 requests / minute / IP**.

## Health-Check Endpoint
- **`GET /api/health`**
  - Returns HTTP `200` with service uptime, SQLite connection state, SQLite engine version, count of applied `.sql` migrations, and latest applied migration filename.

---

## System & Health

| Method | Endpoint | Access / Guards | Details |
| :--- | :--- | :--- | :--- |
| **`GET`** | `/api/health` | Public | System health-check (uptime, SQLite connection, applied SQL migrations). |
| **`GET`** | `/api/admin/stats` | Admin (`requireAuth` + `requireRole("admin")`) | Aggregated CMS dashboard counts and database health metrics. |

## Authentication & Session

| Method | Endpoint | Access / Guards | Details |
| :--- | :--- | :--- | :--- |
| **`POST`** | `/api/auth/login` | Public (Rate-limited: 5 req/min/IP) | Authenticates user with bcryptjs and issues httpOnly JWT cookie + Bearer token. <br/>**Body:** `{ email: string, password: string }` |
| **`POST`** | `/api/auth/logout` | Public | Clears the httpOnly authentication cookie. |
| **`GET`** | `/api/auth/me` | Authenticated (`requireAuth`) | Returns the currently authenticated user profile. |
| **`POST`** | `/api/auth/change-password` | Authenticated (`requireAuth`, Rate-limited: 5 req/min/IP) | Verifies current password and updates bcryptjs hash. <br/>**Body:** `{ currentPassword: string, newPassword: string }` |

## Products & AI Solutions

| Method | Endpoint | Access / Guards | Details |
| :--- | :--- | :--- | :--- |
| **`GET`** | `/api/products` | Public (Optional Admin Auth for `?all=true`) | Paginated, sortable, filterable list of AI & software products with SQL LIKE search (`?q=`). <br/>**Query:** `?page=1&limit=9&sortBy=sort_order|created_at|title_fa&order=asc|desc&category=&sector=&featured=&q=` |
| **`GET`** | `/api/products/:id` | Public | Fetch single product by numeric ID or URL slug. |
| **`POST`** | `/api/products` | Admin (`requireAuth` + `requireRole("admin")`) | Create a new product in SQLite via `productRepository`. <br/>**Body:** `createProductSchema (slug, title_fa, summary_fa, description_fa, features[], ...)` |
| **`PUT`** | `/api/products/:id` | Admin (`requireAuth` + `requireRole("admin")`) | Update an existing product by ID. <br/>**Body:** `updateProductSchema (partial fields)` |
| **`DELETE`** | `/api/products/:id` | Admin (`requireAuth` + `requireRole("admin")`) | Delete a product by ID. |

## Articles & Essays (Persian SEO)

| Method | Endpoint | Access / Guards | Details |
| :--- | :--- | :--- | :--- |
| **`GET`** | `/api/articles` | Public (Optional Admin Auth for `?all=true`) | Paginated SEO articles & essays list with category filter, tags, and SQL LIKE search. <br/>**Query:** `?page=1&limit=9&sortBy=published_at|views_count|likes_count&order=desc&category=&tag=&q=` |
| **`GET`** | `/api/articles/:id` | Public | Fetch single article by numeric ID or slug, increment view counter, and return related articles. |
| **`POST`** | `/api/articles/:id/like` | Public | Live interaction endpoint incrementing article helpful/clap counter. |
| **`POST`** | `/api/articles` | Admin (`requireAuth` + `requireRole("admin")`) | Publish or save a new article/essay. <br/>**Body:** `createArticleSchema (slug, title_fa, excerpt_fa, content_fa, SEO meta, ...)` |
| **`PUT`** | `/api/articles/:id` | Admin (`requireAuth` + `requireRole("admin")`) | Update an existing article/essay. <br/>**Body:** `updateArticleSchema` |
| **`DELETE`** | `/api/articles/:id` | Admin (`requireAuth` + `requireRole("admin")`) | Delete an article by ID. |

## Home Carousel Banners

| Method | Endpoint | Access / Guards | Details |
| :--- | :--- | :--- | :--- |
| **`GET`** | `/api/banners` | Public (`?all=true` for Admin) | List active plain wide clickable carousel banners ordered by `sort_order`. |
| **`POST`** | `/api/banners` | Admin (`requireAuth` + `requireRole("admin")`) | Add a new slide to the home carousel banner. <br/>**Body:** `{ image_url, target_url, alt_fa, alt_en?, sort_order?, is_active? }` |
| **`PUT`** | `/api/banners/:id` | Admin (`requireAuth` + `requireRole("admin")`) | Update banner image, destination URL, order, or active state. <br/>**Body:** `Partial banner fields` |
| **`DELETE`** | `/api/banners/:id` | Admin (`requireAuth` + `requireRole("admin")`) | Delete a home carousel banner slide. |

## Charter Services (اساسنامه)

| Method | Endpoint | Access / Guards | Details |
| :--- | :--- | :--- | :--- |
| **`GET`** | `/api/services` | Public (`?all=true` for Admin) | List official charter ICT & AI enterprise services. |
| **`POST`** | `/api/services` | Admin (`requireAuth` + `requireRole("admin")`) | Add a new company service capability. <br/>**Body:** `createServiceSchema` |
| **`PUT`** | `/api/services/:id` | Admin (`requireAuth` + `requireRole("admin")`) | Update an existing service item. <br/>**Body:** `updateServiceSchema` |
| **`DELETE`** | `/api/services/:id` | Admin (`requireAuth` + `requireRole("admin")`) | Delete a service item. |

## Team & Colleagues (همکاران)

| Method | Endpoint | Access / Guards | Details |
| :--- | :--- | :--- | :--- |
| **`GET`** | `/api/team` | Public (`?all=true` for Admin) | List active team members / colleagues (همکاران) with LinkedIn & Instagram links. |
| **`POST`** | `/api/team` | Admin (`requireAuth` + `requireRole("admin")`) | Add a new colleague to the About Us page. <br/>**Body:** `{ full_name_fa, role_fa, bio_fa?, avatar_url?, linkedin_url?, instagram_url?, sort_order?, is_active? }` |
| **`PUT`** | `/api/team/:id` | Admin (`requireAuth` + `requireRole("admin")`) | Update colleague details, photo, or social links. <br/>**Body:** `Partial team member fields` |
| **`DELETE`** | `/api/team/:id` | Admin (`requireAuth` + `requireRole("admin")`) | Remove a colleague entry. |

## Dynamic Page Texts CMS

| Method | Endpoint | Access / Guards | Details |
| :--- | :--- | :--- | :--- |
| **`GET`** | `/api/content/bootstrap` | Public | Returns dynamic CMS key-value page texts, active banners, and charter services. |
| **`GET`** | `/api/content` | Admin (`requireAuth` + `requireRole("admin")`) | List all editable dynamic site text keys for the Admin CMS. <br/>**Query:** `?section=home|about|contact|company` |
| **`PUT`** | `/api/content` | Admin (`requireAuth` + `requireRole("admin")`) | Upsert a single dynamic site text block. <br/>**Body:** `{ content_key, section, label_fa, value_fa, value_en }` |
| **`PUT`** | `/api/content/bulk` | Admin (`requireAuth` + `requireRole("admin")`) | Atomically update multiple dynamic page texts across the website. <br/>**Body:** `{ items: ContentItem[] }` |

## Contact & Consultation Inquiries

| Method | Endpoint | Access / Guards | Details |
| :--- | :--- | :--- | :--- |
| **`POST`** | `/api/contacts` | Public (Rate-limited: 15 req/15min/IP) | Submit a contact or enterprise AI consultation inquiry. <br/>**Body:** `{ full_name, organization?, email, phone, subject, department, product_id?, message }` |
| **`GET`** | `/api/contacts` | Admin (`requireAuth` + `requireRole("admin")`) | Paginated list of incoming contact/consultation inquiries. <br/>**Query:** `?status=unread|read|responded|archived&page=1&limit=20` |
| **`PATCH`** | `/api/contacts/:id/status` | Admin (`requireAuth` + `requireRole("admin")`) | Update inquiry workflow status. <br/>**Body:** `{ status: "unread" | "read" | "responded" | "archived" }` |
| **`DELETE`** | `/api/contacts/:id` | Admin (`requireAuth` + `requireRole("admin")`) | Delete a contact inquiry by ID. |

## Media Uploads (Multer Local/S3)

| Method | Endpoint | Access / Guards | Details |
| :--- | :--- | :--- | :--- |
| **`POST`** | `/api/uploads` | Admin (`requireAuth` + `requireRole("admin")`) | Validates image MIME + magic bytes via Multer and stores in local `/uploads` or S3-compatible bucket. <br/>**Body:** `multipart/form-data (`file`: JPG/PNG/WEBP/GIF up to 5MB)` |
| **`GET`** | `/api/uploads` | Admin (`requireAuth` + `requireRole("admin")`) | Lists recent uploaded media assets. |

## Search (SQL LIKE)

| Method | Endpoint | Access / Guards | Details |
| :--- | :--- | :--- | :--- |
| **`GET`** | `/api/search` | Public | Unified raw SQL `LIKE` search across published AI products and technical articles. <br/>**Query:** `?q=keyword` |

## Persian SEO & Search Crawlers

| Method | Endpoint | Access / Guards | Details |
| :--- | :--- | :--- | :--- |
| **`GET`** | `/sitemap.xml` | Public | Dynamic XML sitemap including all static pages, products, and Persian SEO articles. |
| **`GET`** | `/robots.txt` | Public | Search crawler directives pointing to `/sitemap.xml` and disallowing `/admin`. |

---
*Total verified Express endpoints: **42**.*
