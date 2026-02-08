-- Allow admins to delete schools
CREATE POLICY "Admins can delete schools"
ON public.schools
FOR DELETE
USING (is_admin(auth.uid()));

-- Allow admins to delete items
CREATE POLICY "Admins can delete items"
ON public.items
FOR DELETE
USING (is_admin(auth.uid()));