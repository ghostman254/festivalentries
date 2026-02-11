
-- Fix schools SELECT policy to use is_admin function
DROP POLICY IF EXISTS "Admins can read all schools" ON public.schools;
CREATE POLICY "Admins can read all schools" ON public.schools FOR SELECT USING (is_admin(auth.uid()));

-- Fix items SELECT policy to use is_admin function
DROP POLICY IF EXISTS "Admins can read all items" ON public.items;
CREATE POLICY "Admins can read all items" ON public.items FOR SELECT USING (is_admin(auth.uid()));

-- Fix app_settings UPDATE policy to use is_admin function
DROP POLICY IF EXISTS "Only admins can update settings" ON public.app_settings;
CREATE POLICY "Only admins can update settings" ON public.app_settings FOR UPDATE USING (is_admin(auth.uid()));

-- Fix user_roles SELECT policies
DROP POLICY IF EXISTS "Admins can read all user roles" ON public.user_roles;
CREATE POLICY "Admins can read all user roles" ON public.user_roles FOR SELECT USING (is_admin(auth.uid()) OR (auth.uid() = user_id));

-- Drop duplicate "Users can read own role" since the above policy covers it
DROP POLICY IF EXISTS "Users can read own role" ON public.user_roles;

-- Fix user_roles INSERT policy
DROP POLICY IF EXISTS "Admins can insert user roles" ON public.user_roles;
CREATE POLICY "Admins can insert user roles" ON public.user_roles FOR INSERT WITH CHECK (is_admin(auth.uid()));
