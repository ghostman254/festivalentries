
-- Add a unique index on normalized school name (lowercase, trimmed, collapsed spaces)
CREATE OR REPLACE FUNCTION public.normalize_school_name(name text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT lower(trim(regexp_replace(name, '\s+', ' ', 'g')))
$$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_schools_normalized_name 
ON public.schools (normalize_school_name(school_name));

-- Update check_school_exists to also normalize whitespace
CREATE OR REPLACE FUNCTION public.check_school_exists(school_name_param text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.schools 
    WHERE normalize_school_name(school_name) = normalize_school_name(school_name_param)
  )
$$;
