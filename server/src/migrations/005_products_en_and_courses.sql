-- =============================================================================
-- Migration 005: English Equivalents for Smart Products + Training Courses (آموزش)
-- V.I.R.A Pardazesh Hoomaan (VPHLabs.com)
-- =============================================================================

ALTER TABLE products ADD COLUMN badge_en TEXT NOT NULL DEFAULT '';
ALTER TABLE products ADD COLUMN features_en_json TEXT NOT NULL DEFAULT '[]';

-- Populate default English badges & features for seeded products (only if still empty)
UPDATE products
SET badge_en = 'Enterprise Bestseller',
    features_en_json = '["100% air-gapped on-premise deployment without external internet","High-accuracy Persian layout-aware OCR for scanned letters & bylaws","Citation-backed answers referencing exact clause, page & source file","Role-Based Access Control (RBAC) integrated with Active Directory","REST API connectors for existing office automation suites"]'
WHERE slug = 'vira-docmind-ai' AND badge_en = '' AND features_en_json = '[]';

UPDATE products
SET badge_en = 'Industry 4.0 AI',
    features_en_json = '["Native Modbus, OPC-UA & MQTT industrial protocol ingestion","Real-time time-series anomaly detection across sensor streams","Schematic equipment health dashboard with SMS & enterprise alerts","Sub-50ms Edge AI inference directly on the factory floor"]'
WHERE slug = 'vira-autoguard-industrial' AND badge_en = '' AND features_en_json = '[]';

UPDATE products
SET badge_en = 'Smart Helpdesk',
    features_en_json = '["Deep understanding of formal administrative & conversational Persian","Automated ticket classification, routing & priority scoring","Real-time citizen/customer sentiment & satisfaction analytics","Deployable as web widget, on-site kiosk, or agent assist console"]'
WHERE slug = 'vira-deskyar-copilot' AND badge_en = '' AND features_en_json = '[]';

UPDATE products
SET badge_en = 'Smart Network Ops',
    features_en_json = '["Intelligent event correlation cutting alert fatigue by up to 90%","24/7 bandwidth, latency & critical service health telemetry","Executive SLA compliance & root-cause reporting"]'
WHERE slug = 'vira-netshield-aiops' AND badge_en = '' AND features_en_json = '[]';

UPDATE products
SET badge_en = 'Executive AI BI',
    features_en_json = '["Safe natural-language-to-SQL analytics & interactive KPI charts","Demand, cash-flow & resource consumption forecasting models","Connectors for SQL Server, PostgreSQL, Oracle & Excel"]'
WHERE slug = 'vira-corpinsight-bi' AND badge_en = '' AND features_en_json = '[]';

UPDATE products
SET badge_en = 'AI Security & Infra',
    features_en_json = '["Automated redaction of national IDs, account numbers & sensitive PII","Granular per-department GPU & token quota management","Immutable audit trail logs for cybersecurity & compliance teams"]'
WHERE slug = 'vira-coreops-llm-gateway' AND badge_en = '' AND features_en_json = '[]';

-- Training Courses (صفحه آموزش — دوره‌های تخصصی شرکت)
CREATE TABLE IF NOT EXISTS courses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title_fa TEXT NOT NULL,
  title_en TEXT NOT NULL DEFAULT '',
  summary_fa TEXT NOT NULL DEFAULT '',
  summary_en TEXT NOT NULL DEFAULT '',
  duration TEXT NOT NULL DEFAULT '',
  level_fa TEXT NOT NULL DEFAULT '',
  syllabus_fa_json TEXT NOT NULL DEFAULT '[]',
  syllabus_en_json TEXT NOT NULL DEFAULT '[]',
  is_in_person INTEGER NOT NULL DEFAULT 1 CHECK (is_in_person IN (0, 1)),
  is_online INTEGER NOT NULL DEFAULT 1 CHECK (is_online IN (0, 1)),
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_courses_active_sort ON courses(is_active, sort_order);
