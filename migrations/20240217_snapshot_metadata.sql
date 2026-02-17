-- Create snapshot_metadata table
CREATE TABLE IF NOT EXISTS snapshot_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    snapshot_date TIMESTAMPTZ NOT NULL,
    gender TEXT, -- 'Male', 'Female'
    age_category TEXT, -- 'Senior', 'U19', etc.
    is_public BOOLEAN DEFAULT FALSE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    -- Enforce unique combination to avoid duplicates for same category/time
    UNIQUE(snapshot_date, gender, age_category)
);

-- Add metadata_id to ranking_snapshots
ALTER TABLE ranking_snapshots 
ADD COLUMN IF NOT EXISTS metadata_id UUID REFERENCES snapshot_metadata(id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_snapshot_metadata_public ON snapshot_metadata(is_public, gender, age_category, snapshot_date);
