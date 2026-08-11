-- ====================================================================
-- DRISHTI (दृष्टि) SUPABASE REALTIME CLOUD DATABASE SCHEMA
-- Copy and paste this script into Supabase SQL Editor and click RUN
-- ====================================================================

-- 1. Deep Links Table (Tools & Apps)
CREATE TABLE IF NOT EXISTS drishti_links (
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

-- 2. Hierarchical Notes & Course Tree Table (1., 1.1, 1.1.1)
CREATE TABLE IF NOT EXISTS drishti_tree_nodes (
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

-- 3. Active Recall Revision Flashcards Table
CREATE TABLE IF NOT EXISTS drishti_revision_cards (
    id TEXT PRIMARY KEY,
    master_tile_id TEXT DEFAULT 'ai',
    category TEXT DEFAULT 'AI & Deep Learning',
    question TEXT NOT NULL,
    difficulty TEXT DEFAULT 'Intermediate',
    hint TEXT DEFAULT '',
    tags TEXT[] DEFAULT '{}',
    answer_summary TEXT DEFAULT '',
    answer_markdown TEXT DEFAULT '',
    key_takeaways TEXT[] DEFAULT '{}',
    mastery_status TEXT DEFAULT 'learning',
    review_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Activity Logs Table (60 Days / 2 Months Rolling Retention)
CREATE TABLE IF NOT EXISTS drishti_activity_logs (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    category TEXT DEFAULT 'General',
    type TEXT DEFAULT 'link',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    date_str TEXT NOT NULL,
    time_str TEXT NOT NULL
);

-- Index for fast time querying and cleanup
CREATE INDEX IF NOT EXISTS idx_activity_timestamp ON drishti_activity_logs (timestamp DESC);

-- 5. Master Settings & Scratchpad Table
CREATE TABLE IF NOT EXISTS drishti_settings (
    id TEXT PRIMARY KEY DEFAULT 'master_config',
    theme TEXT DEFAULT 'obsidian',
    ui_scale INTEGER DEFAULT 100,
    scratchpad_content TEXT DEFAULT '',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default config row if not exists
INSERT INTO drishti_settings (id, theme, ui_scale, scratchpad_content)
VALUES ('master_config', 'obsidian', 100, '# Drishti Scratchpad\n')
ON CONFLICT (id) DO NOTHING;

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
ALTER TABLE drishti_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE drishti_tree_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE drishti_revision_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE drishti_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE drishti_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read/write access for single-owner dashboard
CREATE POLICY "Allow public access for drishti_links" ON drishti_links FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access for drishti_tree_nodes" ON drishti_tree_nodes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access for drishti_revision_cards" ON drishti_revision_cards FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access for drishti_activity_logs" ON drishti_activity_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access for drishti_settings" ON drishti_settings FOR ALL USING (true) WITH CHECK (true);

-- ====================================================================
-- REALTIME BROADCASTING
-- Enable Supabase Realtime so changes broadcast across all devices in <1s
-- ====================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE drishti_links;
ALTER PUBLICATION supabase_realtime ADD TABLE drishti_tree_nodes;
ALTER PUBLICATION supabase_realtime ADD TABLE drishti_revision_cards;
ALTER PUBLICATION supabase_realtime ADD TABLE drishti_activity_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE drishti_settings;

-- ====================================================================
-- AUTO-CLEANUP FUNCTION: Keep only last 60 days (2 months) of logs
-- ====================================================================
CREATE OR REPLACE FUNCTION clean_old_drishti_logs() RETURNS void AS $$
BEGIN
    DELETE FROM drishti_activity_logs
    WHERE timestamp < NOW() - INTERVAL '60 days';
END;
$$ LANGUAGE plpgsql;
