-- Add has_csapat column to events table
ALTER TABLE events ADD COLUMN has_csapat boolean NOT NULL DEFAULT false;

-- Update check constraint on events table to ensure at least one category is selected
ALTER TABLE events DROP CONSTRAINT IF EXISTS at_least_one_category;
ALTER TABLE events ADD CONSTRAINT at_least_one_category CHECK (has_egyes OR has_paros OR has_vegyes OR has_csapat);

-- Update check constraint on results table to include 'Csapat'
ALTER TABLE results DROP CONSTRAINT IF EXISTS valid_result_category;
ALTER TABLE results ADD CONSTRAINT valid_result_category CHECK (category IN ('Egyes', 'Páros', 'Vegyes', 'Csapat'));
