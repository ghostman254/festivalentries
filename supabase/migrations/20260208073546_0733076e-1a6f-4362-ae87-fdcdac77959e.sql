-- Allow anyone to check if a school name exists (for duplicate detection)
CREATE POLICY "Anyone can check school names"
ON public.schools
FOR SELECT
USING (true);