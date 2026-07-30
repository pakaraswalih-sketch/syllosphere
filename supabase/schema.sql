-- ============================================================
-- SYLLOSPHERE ADMIN DASHBOARD — SUPABASE SCHEMA
-- Run this in your Supabase SQL Editor
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- TABLE 1: pages
-- ============================================
CREATE TABLE IF NOT EXISTS pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE 2: sections
-- ============================================
CREATE TABLE IF NOT EXISTS sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'hero', 'summary_box', 'concept_grid',
    'modes_of_acquisition', 'text_block',
    'image_feature', 'cta', 'custom'
  )),
  label TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE 3: content_keys
-- ============================================
CREATE TABLE IF NOT EXISTS content_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT 'text' CHECK (type IN (
    'text', 'textarea', 'html', 'url', 'email', 'color'
  )),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(section_id, key)
);

-- ============================================
-- TABLE 4: grid_items
-- ============================================
CREATE TABLE IF NOT EXISTS grid_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL DEFAULT 0,
  data JSONB NOT NULL DEFAULT '{}',
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE 5: media_assets
-- ============================================
CREATE TABLE IF NOT EXISTS media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  mime_type TEXT,
  size_bytes INTEGER,
  alt_text TEXT DEFAULT '',
  uploaded_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE grid_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can do everything on pages"
  ON pages FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can do everything on sections"
  ON sections FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can do everything on content_keys"
  ON content_keys FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can do everything on grid_items"
  ON grid_items FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can do everything on media_assets"
  ON media_assets FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public read pages"
  ON pages FOR SELECT USING (is_published = true);

CREATE POLICY "Public read sections"
  ON sections FOR SELECT USING (is_visible = true);

CREATE POLICY "Public read content_keys"
  ON content_keys FOR SELECT USING (true);

CREATE POLICY "Public read grid_items"
  ON grid_items FOR SELECT USING (is_visible = true);

-- ============================================
-- TRIGGERS
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_pages_updated BEFORE UPDATE ON pages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_sections_updated BEFORE UPDATE ON sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_content_keys_updated BEFORE UPDATE ON content_keys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_grid_items_updated BEFORE UPDATE ON grid_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
