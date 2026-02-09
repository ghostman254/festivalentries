
DROP INDEX IF EXISTS idx_schools_normalized_name;

CREATE UNIQUE INDEX idx_schools_normalized_name 
ON public.schools (normalize_school_name(school_name));
