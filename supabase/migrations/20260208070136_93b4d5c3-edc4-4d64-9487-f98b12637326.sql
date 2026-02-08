-- Create user_roles table for admin access control
CREATE TABLE public.user_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Users can only read their own role
CREATE POLICY "Users can read own role" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Drop overly permissive policies on schools table
DROP POLICY IF EXISTS "Anyone can read schools" ON public.schools;

-- Create admin-only read policy for schools
CREATE POLICY "Admins can read all schools" 
ON public.schools 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Drop overly permissive policies on items table  
DROP POLICY IF EXISTS "Anyone can read items" ON public.items;

-- Create admin-only read policy for items
CREATE POLICY "Admins can read all items" 
ON public.items 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Update app_settings policy to require admin role
DROP POLICY IF EXISTS "Authenticated users can update settings" ON public.app_settings;

CREATE POLICY "Only admins can update settings" 
ON public.app_settings 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Keep the existing INSERT policies for schools and items (public submissions allowed)
-- These allow public form submission without authentication which is the intended behavior