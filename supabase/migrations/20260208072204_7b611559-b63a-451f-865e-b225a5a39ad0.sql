-- Create a function to get admin users with their emails
-- This uses SECURITY DEFINER to safely access auth.users
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
  SELECT 
    ur.user_id,
    ur.role,
    ur.created_at,
    au.email
  FROM public.user_roles ur
  LEFT JOIN auth.users au ON au.id = ur.user_id
  WHERE ur.role = 'admin'
  ORDER BY ur.created_at DESC
$$;