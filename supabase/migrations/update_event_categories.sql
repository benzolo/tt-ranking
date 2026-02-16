-- Update events table to support multiple categories
-- Change from single 'category' column to boolean flags for each category type

-- Drop old category column
ALTER TABLE events DROP COLUMN IF EXISTS category;

-- Add new category boolean columns
ALTER TABLE events ADD COLUMN has_egyes BOOLEAN DEFAULT false NOT NULL;
ALTER TABLE events ADD COLUMN has_paros BOOLEAN DEFAULT false NOT NULL;
ALTER TABLE events ADD COLUMN has_vegyes BOOLEAN DEFAULT false NOT NULL;

-- Add check constraint to ensure at least one category is selected
ALTER TABLE events ADD CONSTRAINT at_least_one_category 
  CHECK (has_egyes = true OR has_paros = true OR has_vegyes = true);

-- Add category to results table
ALTER TABLE results ADD COLUMN category TEXT;
ALTER TABLE results ADD CONSTRAINT valid_result_category 
  CHECK (category IN ('Egyes', 'Páros', 'Vegyes'));

COMMENT ON COLUMN results.category IS 'The category this result belongs to (Egyes, Páros, Vegyes)';

-- Add comments
COMMENT ON COLUMN events.has_egyes IS 'Event includes Egyes (Singles) category';
COMMENT ON COLUMN events.has_paros IS 'Event includes Páros (Doubles) category';
COMMENT ON COLUMN events.has_vegyes IS 'Event includes Vegyes (Mixed) category';
