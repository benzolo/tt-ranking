-- Add license_id to players table
ALTER TABLE players ADD COLUMN license_id TEXT UNIQUE;

-- Add index for faster lookups
CREATE INDEX idx_players_license_id ON players(license_id);

-- Add comment
COMMENT ON COLUMN players.license_id IS 'Player license ID for official identification';
