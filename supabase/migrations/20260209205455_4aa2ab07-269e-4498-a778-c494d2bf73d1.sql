
CREATE OR REPLACE FUNCTION public.normalize_school_name(name text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path TO 'public'
AS $$
  SELECT lower(trim(regexp_replace(name, '\s+', ' ', 'g')))
$$;
