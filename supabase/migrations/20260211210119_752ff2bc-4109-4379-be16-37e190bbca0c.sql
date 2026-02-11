
-- Change super_admin role to admin
UPDATE public.user_roles SET role = 'admin' WHERE role = 'super_admin';

-- Update is_super_admin to always return false (deprecated)
CREATE OR REPLACE FUNCTION public.is_super_admin(check_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT public.is_admin(check_user_id)
$$;

-- Update delete policy to allow any admin to delete non-self roles
DROP POLICY IF EXISTS "Only super admins can delete non-super roles" ON public.user_roles;
CREATE POLICY "Admins can delete other admin roles" ON public.user_roles FOR DELETE USING (
  is_admin(auth.uid()) AND user_id != auth.uid()
);
