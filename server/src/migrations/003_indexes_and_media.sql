-- =============================================================================
-- Migration 003: Search, Filtering & Sorting Indexes + Media Uploads Audit
-- V.I.R.A Pardazesh Hoomaan (VPHLabs.com)
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_products_published_sort
  ON products (is_published, sort_order ASC, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_products_category
  ON products (category);

CREATE INDEX IF NOT EXISTS idx_articles_published_date
  ON articles (is_published, published_at DESC);

CREATE INDEX IF NOT EXISTS idx_articles_category
  ON articles (category);

CREATE INDEX IF NOT EXISTS idx_banners_active_sort
  ON banners (is_active, sort_order ASC);

CREATE INDEX IF NOT EXISTS idx_services_active_sort
  ON services (is_active, sort_order ASC);

CREATE INDEX IF NOT EXISTS idx_contact_messages_status
  ON contact_messages (status, created_at DESC);

CREATE TABLE IF NOT EXISTS media_uploads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  original_name TEXT NOT NULL,
  stored_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  storage_driver TEXT NOT NULL DEFAULT 'local',
  public_url TEXT NOT NULL,
  uploaded_by INTEGER NULL REFERENCES users(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
