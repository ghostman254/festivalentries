
-- Drop the overly restrictive unique index that doesn't account for category
DROP INDEX IF EXISTS idx_schools_normalized_name;

-- Create a new unique index on normalized name + category (allows same school in different categories)
CREATE UNIQUE INDEX idx_schools_normalized_name_category 
ON public.schools (normalize_school_name(school_name), category);
