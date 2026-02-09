
DROP INDEX IF EXISTS idx_schools_normalized_name;
DROP FUNCTION IF EXISTS public.normalize_school_name(text);

CREATE OR REPLACE FUNCTION public.normalize_school_name(name text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path TO 'public'
AS $$
DECLARE
  result text;
  stop_words text[] := ARRAY['school','schools','academy','academies','comprehensive','primary','nursery','preparatory','prep','college','institute','institution','centre','center','learning'];
  words text[];
  filtered text[];
  w text;
BEGIN
  result := lower(trim(regexp_replace(name, '\s+', ' ', 'g')));
  words := string_to_array(result, ' ');
  filtered := ARRAY[]::text[];
  FOREACH w IN ARRAY words LOOP
    IF NOT (w = ANY(stop_words)) THEN
      filtered := array_append(filtered, w);
    END IF;
  END LOOP;
  IF array_length(filtered, 1) IS NULL THEN
    RETURN result;
  END IF;
  RETURN array_to_string(filtered, ' ');
END;
$$;

CREATE UNIQUE INDEX idx_schools_normalized_name 
ON public.schools (normalize_school_name(school_name));

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
