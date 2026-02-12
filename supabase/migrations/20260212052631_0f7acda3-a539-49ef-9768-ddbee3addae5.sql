-- Function to get categories a school is already registered in (by normalized name)
CREATE OR REPLACE FUNCTION public.get_school_registered_categories(school_name_param text)
 RETURNS TABLE(category text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT DISTINCT s.category::text
  FROM public.schools s
  WHERE normalize_school_name(s.school_name) = normalize_school_name(school_name_param)
$$;