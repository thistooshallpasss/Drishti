-- ====================================================================
-- DRISHTI (दृष्टि) - COMPLETE HARD DATABASE RESET SCRIPT
-- Paste this script into your Supabase SQL Editor and click RUN (▶)
-- This will wipe all tables, clear old data, and recreate everything fresh.
-- ====================================================================

-- Step 1: Drop all existing tables & functions cleanly
DROP TABLE IF EXISTS drishti_links CASCADE;
DROP TABLE IF EXISTS drishti_tree_nodes CASCADE;
DROP TABLE IF EXISTS drishti_revision_cards CASCADE;
DROP TABLE IF EXISTS drishti_activity_logs CASCADE;
DROP TABLE IF EXISTS drishti_settings CASCADE;
DROP FUNCTION IF EXISTS clean_old_drishti_logs CASCADE;

-- Step 2: Recreate 1. Deep Links Table (Tools & Apps)
CREATE TABLE drishti_links (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    category TEXT DEFAULT 'ai',
    description TEXT DEFAULT '',
    is_pinned BOOLEAN DEFAULT FALSE,
    order_index INTEGER DEFAULT 0,
    icon_type TEXT DEFAULT 'favicon',
    icon_value TEXT DEFAULT '',
    tags TEXT[] DEFAULT '{}',
    badge TEXT DEFAULT '',
    accent_color TEXT DEFAULT '',
    click_count INTEGER DEFAULT 0,
    last_visited TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recreate 2. Hierarchical Tree Nodes (Focus Hubs & Doc Trees: 1., 1.1, 1.1.1)
CREATE TABLE drishti_tree_nodes (
    id TEXT PRIMARY KEY,
    master_tile_id TEXT NOT NULL,
    sub_track TEXT NOT NULL,
    code TEXT NOT NULL,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    notes_snippet TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recreate 3. Active Recall Revision Flashcards
CREATE TABLE drishti_revision_cards (
    id TEXT PRIMARY KEY,
    master_tile_id TEXT DEFAULT 'ai',
    category TEXT DEFAULT 'AI & Deep Learning',
    question TEXT NOT NULL,
    difficulty TEXT DEFAULT 'Intermediate',
    hint TEXT DEFAULT '',
    tags TEXT[] DEFAULT '{}',
    answer_summary TEXT NOT NULL,
    answer_markdown TEXT DEFAULT '',
    code_language TEXT DEFAULT '',
    code_content TEXT DEFAULT '',
    key_takeaways TEXT[] DEFAULT '{}',
    mastery_status TEXT DEFAULT 'learning',
    review_count INTEGER DEFAULT 0,
    last_reviewed TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recreate 4. Activity Logs (Rolling 60-Day / 2-Month Retention)
CREATE TABLE drishti_activity_logs (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    category TEXT NOT NULL,
    type TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    date_str TEXT NOT NULL,
    time_str TEXT NOT NULL
);

-- Recreate 5. Settings & Scratchpad
CREATE TABLE drishti_settings (
    id TEXT PRIMARY KEY DEFAULT 'master_config',
    theme TEXT DEFAULT 'obsidian',
    ui_scale INTEGER DEFAULT 100,
    scratchpad_content TEXT DEFAULT '',
    custom_subtracks JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Enable Row Level Security (RLS) with open access policies
ALTER TABLE drishti_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE drishti_tree_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE drishti_revision_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE drishti_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE drishti_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access for drishti_links" ON drishti_links FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access for drishti_tree_nodes" ON drishti_tree_nodes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access for drishti_revision_cards" ON drishti_revision_cards FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access for drishti_activity_logs" ON drishti_activity_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access for drishti_settings" ON drishti_settings FOR ALL USING (true) WITH CHECK (true);

-- Step 4: Enable Realtime Broadcasting across all tables
ALTER PUBLICATION supabase_realtime ADD TABLE drishti_links;
ALTER PUBLICATION supabase_realtime ADD TABLE drishti_tree_nodes;
ALTER PUBLICATION supabase_realtime ADD TABLE drishti_revision_cards;
ALTER PUBLICATION supabase_realtime ADD TABLE drishti_activity_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE drishti_settings;

-- Step 5: Insert default settings
INSERT INTO drishti_settings (id, theme, ui_scale, scratchpad_content, custom_subtracks)
VALUES ('master_config', 'obsidian', 100, '# Drishti Scratchpad\n\n# SDE / AI Problem solving scratch area\n', '{}'::jsonb);

-- Step 6: 60-Day Rolling Log Cleanup Function
CREATE OR REPLACE FUNCTION clean_old_drishti_logs()
RETURNS void AS $$
BEGIN
    DELETE FROM drishti_activity_logs
    WHERE timestamp < NOW() - INTERVAL '60 days';
END;
$$ LANGUAGE plpgsql;
