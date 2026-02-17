-- Change position column from integer to text in point_table
ALTER TABLE point_table ALTER COLUMN position TYPE text;

-- Change position column from integer to text in results
ALTER TABLE results ALTER COLUMN position TYPE text;
