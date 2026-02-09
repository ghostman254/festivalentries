
-- Drop the check constraint to allow super_admin role
ALTER TABLE public.user_roles DROP CONSTRAINT user_roles_role_check;

-- Add updated check constraint including super_admin
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_role_check 
CHECK (role = ANY (ARRAY['admin'::text, 'user'::text, 'super_admin'::text]));

-- Update role to super_admin
UPDATE public.user_roles 
SET role = 'super_admin' 
WHERE user_id = 'cfc3114b-269a-4195-82b5-180fc1f60305';

-- Update is_admin function to also recognize super_admin
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = check_user_id AND role IN ('admin', 'super_admin')
  )
$$;

-- Create function to check if a user is super_admin
CREATE OR REPLACE FUNCTION public.is_super_admin(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = check_user_id AND role = 'super_admin'
  )
$$;

-- Update delete policy: only super_admins can delete roles, and super_admin roles cannot be deleted
DROP POLICY IF EXISTS "Admins can delete user roles" ON public.user_roles;
CREATE POLICY "Only super admins can delete non-super roles"
ON public.user_roles FOR DELETE
USING (
  is_super_admin(auth.uid()) AND role != 'super_admin'
);

-- Update insert policy
DROP POLICY IF EXISTS "Admins can insert user roles" ON public.user_roles;
CREATE POLICY "Admins can insert user roles"
ON public.user_roles FOR INSERT
WITH CHECK (
  is_admin(auth.uid())
);
