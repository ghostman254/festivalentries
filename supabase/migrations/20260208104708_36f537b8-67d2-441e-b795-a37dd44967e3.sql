-- Remove overly permissive INSERT policies that allow anyone to insert directly
-- The edge function uses service role key which bypasses RLS, so these are not needed
-- and create an unnecessary security risk

-- Drop the public INSERT policy on schools table
DROP POLICY IF EXISTS "Anyone can submit a school" ON public.schools;

-- Drop the public INSERT policy on items table
DROP POLICY IF EXISTS "Anyone can insert items" ON public.items;

-- Create restrictive INSERT policies that only allow service role or admin access
-- (Service role bypasses RLS anyway, but this documents intent and blocks direct client access)

-- Only admins can insert schools directly (service role bypasses this for edge function)
CREATE POLICY "Only admins can insert schools" 
ON public.schools 
FOR INSERT 
WITH CHECK (is_admin(auth.uid()));

-- Only admins can insert items directly (service role bypasses this for edge function)
CREATE POLICY "Only admins can insert items" 
ON public.items 
FOR INSERT 
WITH CHECK (is_admin(auth.uid()));