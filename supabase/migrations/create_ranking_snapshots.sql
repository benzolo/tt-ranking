-- Migration: Create ranking_snapshots table
-- Run this in Supabase SQL Editor

-- Create ranking_snapshots table for historical ranking tracking
CREATE TABLE ranking_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  rank_position INTEGER NOT NULL,
  total_points INTEGER NOT NULL,
  events_count INTEGER NOT NULL,
  snapshot_date TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_snapshots_player ON ranking_snapshots(player_id);
CREATE INDEX idx_snapshots_date ON ranking_snapshots(snapshot_date DESC);
CREATE INDEX idx_snapshots_player_date ON ranking_snapshots(player_id, snapshot_date DESC);

-- Add comment
COMMENT ON TABLE ranking_snapshots IS 'Stores historical ranking snapshots for tracking rank changes over time';
