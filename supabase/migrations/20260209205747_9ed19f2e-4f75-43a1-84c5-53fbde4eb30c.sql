
-- Drop the old unique index first
DROP INDEX IF EXISTS idx_schools_normalized_name;

-- More aggressive normalization: strips common school-related words
CREATE OR REPLACE FUNCTION public.normalize_school_name(name text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path TO 'public'
AS $$
  SELECT trim(regexp_replace(
    regexp_replace(
      lower(trim(regexp_replace(name, '\s+', ' ', 'g'))),
      '\b(school|schools|academy|academies|comprehensive|primary|nursery|preparatory|prep|college|institute|institution|centre|center|learning)\b',
      '',
      'gi'
    ),
    '\s+', ' ', 'g'
  ))
$$;

-- Recreate unique index with new normalization
CREATE UNIQUE INDEX idx_schools_normalized_name 
ON public.schools (normalize_school_name(school_name));

-- Update check function
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
