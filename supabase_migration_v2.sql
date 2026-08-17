-- ====================================================================
-- DRISHTI MIGRATION v2 — Run this in Supabase SQL Editor
-- Adds: master_tile_id to drishti_links
--       daily_voice_notes to drishti_settings
-- Safe to run multiple times (all steps use IF NOT EXISTS)
-- ====================================================================

-- 1. Add master_tile_id column to drishti_links (if not exists)
ALTER TABLE drishti_links
  ADD COLUMN IF NOT EXISTS master_tile_id TEXT DEFAULT NULL;

-- 2. Add daily_voice_notes JSONB column to drishti_settings (if not exists)
ALTER TABLE drishti_settings
  ADD COLUMN IF NOT EXISTS daily_voice_notes JSONB DEFAULT '[]'::jsonb;

-- 3. Backfill master_tile_id based on category (best-effort migration for existing rows)
UPDATE drishti_links SET master_tile_id = 'ai'         WHERE master_tile_id IS NULL AND category = 'ai';
UPDATE drishti_links SET master_tile_id = 'life-sutras' WHERE master_tile_id IS NULL AND category = 'spiritual';
UPDATE drishti_links SET master_tile_id = 'tools'       WHERE master_tile_id IS NULL;

-- 4. Enable Realtime for drishti_settings (safe — ignores error if already a member)
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE drishti_settings;
EXCEPTION WHEN duplicate_object THEN
  RAISE NOTICE 'drishti_settings is already in supabase_realtime — skipping.';
END;
$$;

-- Done!
SELECT 'Migration v2 complete — master_tile_id and daily_voice_notes added.' AS status;
