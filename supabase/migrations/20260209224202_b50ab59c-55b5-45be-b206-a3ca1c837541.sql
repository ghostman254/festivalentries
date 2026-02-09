
CREATE OR REPLACE FUNCTION public.get_registered_school_names()
RETURNS TABLE(school_name text, category text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT s.school_name, s.category::text
  FROM public.schools s
  ORDER BY s.school_name ASC;
$$;
