-- =============================================================================
-- Migration 001: Core Entities (Users, Products, Articles, Contact Messages)
-- V.I.R.A Pardazesh Hoomaan (VPHLabs.com)
-- =============================================================================

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'editor', 'viewer')),
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title_fa TEXT NOT NULL,
  title_en TEXT NOT NULL DEFAULT '',
  summary_fa TEXT NOT NULL,
  summary_en TEXT NOT NULL DEFAULT '',
  description_fa TEXT NOT NULL,
  description_en TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'enterprise-ai',
  badge TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL DEFAULT '',
  features_json TEXT NOT NULL DEFAULT '[]',
  target_sector TEXT NOT NULL DEFAULT 'enterprise',
  isic_code TEXT NOT NULL DEFAULT '620101',
  demo_available INTEGER NOT NULL DEFAULT 1 CHECK (demo_available IN (0, 1)),
  is_featured INTEGER NOT NULL DEFAULT 0 CHECK (is_featured IN (0, 1)),
  is_published INTEGER NOT NULL DEFAULT 1 CHECK (is_published IN (0, 1)),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS articles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title_fa TEXT NOT NULL,
  title_en TEXT NOT NULL DEFAULT '',
  excerpt_fa TEXT NOT NULL,
  excerpt_en TEXT NOT NULL DEFAULT '',
  content_fa TEXT NOT NULL,
  content_en TEXT NOT NULL DEFAULT '',
  cover_image TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'هوش مصنوعی سازمانی',
  tags_json TEXT NOT NULL DEFAULT '[]',
  author_name TEXT NOT NULL DEFAULT 'تیم پژوهش هوش مصنوعی ویرا',
  reading_time_minutes INTEGER NOT NULL DEFAULT 5,
  meta_title TEXT NOT NULL DEFAULT '',
  meta_description TEXT NOT NULL DEFAULT '',
  meta_keywords TEXT NOT NULL DEFAULT '',
  views_count INTEGER NOT NULL DEFAULT 0,
  likes_count INTEGER NOT NULL DEFAULT 0,
  is_published INTEGER NOT NULL DEFAULT 1 CHECK (is_published IN (0, 1)),
  published_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name TEXT NOT NULL,
  organization TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  subject TEXT NOT NULL,
  department TEXT NOT NULL DEFAULT 'ai-consulting',
  product_id INTEGER NULL REFERENCES products(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'responded', 'archived')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
