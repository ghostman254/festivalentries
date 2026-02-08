-- Fix 1: Add UPDATE policy for schools table so admins can correct errors
CREATE POLICY "Admins can update schools"
ON public.schools
FOR UPDATE
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Fix 2: Add UPDATE policy for items table so admins can update item status
CREATE POLICY "Admins can update items"
ON public.items
FOR UPDATE
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Fix 3: Restrict app_settings read access to authenticated users only
-- First drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can read settings" ON public.app_settings;

-- Create new policy that only allows authenticated users to read
CREATE POLICY "Authenticated users can read settings"
ON public.app_settings
FOR SELECT
USING (auth.role() = 'authenticated' OR auth.role() = 'anon');