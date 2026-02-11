
-- Update check_school_exists to also check category
CREATE OR REPLACE FUNCTION public.check_school_exists(school_name_param text, category_param text DEFAULT NULL)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.schools 
    WHERE normalize_school_name(school_name) = normalize_school_name(school_name_param)
      AND (category_param IS NULL OR category::text = category_param)
  )
$function$;
