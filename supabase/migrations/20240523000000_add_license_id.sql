-- Add license_id column
ALTER TABLE players ADD COLUMN license_id text;

-- Populate existing players with temporary license_id
UPDATE players SET license_id = 'TEMP-' || id WHERE license_id IS NULL;

-- Add constraints
ALTER TABLE players ALTER COLUMN license_id SET NOT NULL;
ALTER TABLE players ADD CONSTRAINT players_license_id_key UNIQUE (license_id);
