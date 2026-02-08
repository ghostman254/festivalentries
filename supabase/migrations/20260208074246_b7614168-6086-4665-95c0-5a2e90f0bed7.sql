-- Fix Issue 1: Remove public access to schools table that exposes teacher PII
-- The "Anyone can check school names" policy exposes teacher_name, phone_number, etc.
DROP POLICY IF EXISTS "Anyone can check school names" ON public.schools;

-- Create a secure function that only returns whether a school name exists (no PII)
CREATE OR REPLACE FUNCTION public.check_school_exists(school_name_param text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.schools 
    WHERE lower(school_name) = lower(school_name_param)
  )
$$;

-- Fix Issue 2: Secure the get_admin_users function to require admin authentication
-- Previously, anyone could call this and get all admin emails
CREATE OR REPLACE FUNCTION public.get_admin_users()
RETURNS TABLE (
  user_id uuid,
  role text,
  created_at timestamptz,
  email text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- Only return results if the caller is an authenticated admin
  SELECT 
    ur.user_id,
    ur.role,
    ur.created_at,
    au.email
  FROM public.user_roles ur
  LEFT JOIN auth.users au ON au.id = ur.user_id
  WHERE ur.role = 'admin'
    AND EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  ORDER BY ur.created_at DESC
$$;