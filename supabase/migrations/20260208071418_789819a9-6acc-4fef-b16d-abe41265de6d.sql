-- Create a security definer function to check admin role (avoids recursion)
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = check_user_id AND role = 'admin'
  )
$$;

-- Allow admins to insert new user roles
CREATE POLICY "Admins can insert user roles"
ON public.user_roles
FOR INSERT
WITH CHECK (public.is_admin(auth.uid()));

-- Allow admins to read all user roles
CREATE POLICY "Admins can read all user roles"
ON public.user_roles
FOR SELECT
USING (public.is_admin(auth.uid()) OR auth.uid() = user_id);

-- Allow admins to delete user roles
CREATE POLICY "Admins can delete user roles"
ON public.user_roles
FOR DELETE
USING (public.is_admin(auth.uid()));