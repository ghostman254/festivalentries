
-- Clear existing data (categories and item types are fundamentally changing)
DELETE FROM items;
DELETE FROM schools;

-- Update school_category enum
ALTER TABLE schools ALTER COLUMN category TYPE text;
DROP TYPE IF EXISTS school_category;
CREATE TYPE school_category AS ENUM ('Pre-Primary', 'Lower Primary', 'Primary');
ALTER TABLE schools ALTER COLUMN category TYPE school_category USING category::school_category;

-- Update item_type enum
ALTER TABLE items ALTER COLUMN item_type TYPE text;
DROP TYPE IF EXISTS item_type;
CREATE TYPE item_type AS ENUM (
  'Dramatized Singing Games',
  'Dramatized Verse (Solo)',
  'Dramatized Verse (Choral)',
  'Dramatized Solo Verse',
  'Film for Early Years',
  'Play',
  'Cultural Creative Dance',
  'Modern Creative Dance',
  'Narrative',
  'Film',
  'Play in Kenyan Sign Language',
  'Dramatized Dance for Special Needs (Mentally Handicapped)',
  'Dramatized Dance for Special Needs (Physically Handicapped)'
);
ALTER TABLE items ALTER COLUMN item_type TYPE item_type USING item_type::item_type;

-- Drop the unique constraint that references old categories and recreate
-- (The unique constraint on schools for school_name + category should still work with new enum)

-- Update the check_school_exists function to work with new categories
CREATE OR REPLACE FUNCTION public.check_school_exists(school_name_param text, category_param text DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF category_param IS NOT NULL THEN
    RETURN EXISTS (
      SELECT 1 FROM schools
      WHERE normalize_school_name(school_name) = normalize_school_name(school_name_param)
        AND category = category_param::school_category
    );
  ELSE
    RETURN EXISTS (
      SELECT 1 FROM schools
      WHERE normalize_school_name(school_name) = normalize_school_name(school_name_param)
    );
  END IF;
END;
$$;
