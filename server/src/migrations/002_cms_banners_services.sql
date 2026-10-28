-- =============================================================================
-- Migration 002: Dynamic CMS (Home Carousel Banners, Charter Services, Site Texts)
-- V.I.R.A Pardazesh Hoomaan (VPHLabs.com)
-- =============================================================================

CREATE TABLE IF NOT EXISTS banners (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  image_url TEXT NOT NULL,
  target_url TEXT NOT NULL DEFAULT '/products',
  alt_fa TEXT NOT NULL DEFAULT 'بنر راهکارهای هوش مصنوعی ویرا پردازش هومان',
  alt_en TEXT NOT NULL DEFAULT 'V.I.R.A Pardazesh Hoomaan Enterprise AI Banner',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  isic_code TEXT NOT NULL DEFAULT '',
  title_fa TEXT NOT NULL,
  title_en TEXT NOT NULL DEFAULT '',
  description_fa TEXT NOT NULL,
  description_en TEXT NOT NULL DEFAULT '',
  ai_application_fa TEXT NOT NULL DEFAULT '',
  ai_application_en TEXT NOT NULL DEFAULT '',
  icon_name TEXT NOT NULL DEFAULT 'Cpu',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS site_contents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content_key TEXT NOT NULL UNIQUE,
  section TEXT NOT NULL DEFAULT 'general',
  label_fa TEXT NOT NULL,
  value_fa TEXT NOT NULL,
  value_en TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
