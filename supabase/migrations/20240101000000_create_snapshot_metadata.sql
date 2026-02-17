
-- Create snapshot_metadata table
CREATE TABLE IF NOT EXISTS snapshot_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    snapshot_date TIMESTAMPTZ NOT NULL,
    gender TEXT, -- 'Male', 'Female', 'Both' (though 'Both' might be split)
    age_category TEXT, -- 'Senior', 'U19', etc.
    is_public BOOLEAN DEFAULT FALSE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add metadata_id to ranking_snapshots if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ranking_snapshots' AND column_name = 'metadata_id') THEN
        ALTER TABLE ranking_snapshots ADD COLUMN metadata_id UUID REFERENCES snapshot_metadata(id);
    END IF;
END $$;

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_snapshot_metadata_date ON snapshot_metadata(snapshot_date);
CREATE INDEX IF NOT EXISTS idx_ranking_snapshots_metadata_id ON ranking_snapshots(metadata_id);
