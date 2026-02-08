
-- Create enums
CREATE TYPE public.school_category AS ENUM ('Pre School', 'Lower Grade', 'Primary', 'Junior Academy');

CREATE TYPE public.item_type AS ENUM (
  'Choral Verse', 'Play', 'Spoken Word', 'Solo Verse', 'Modern Dance',
  'Comedy', 'Live Broadcast', 'Podcast', 'Singing Games', 'Narratives',
  'Cultural Creative Dance', 'Video Song', 'Documentary', 'Advert'
);

CREATE TYPE public.item_language AS ENUM ('English', 'French', 'German');

CREATE TYPE public.item_status AS ENUM ('Registered', 'Files Submitted', 'Under Review', 'Adjudicated');

-- Schools table
CREATE TABLE public.schools (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_name TEXT NOT NULL,
  category school_category NOT NULL,
  teacher_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  total_items INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;

-- Public can insert (submit forms)
CREATE POLICY "Anyone can submit a school" ON public.schools FOR INSERT WITH CHECK (true);
-- Public can read (for confirmation page)
CREATE POLICY "Anyone can read schools" ON public.schools FOR SELECT USING (true);

-- Items table
CREATE TABLE public.items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  item_type item_type NOT NULL,
  language item_language,
  status item_status NOT NULL DEFAULT 'Registered',
  item_code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert items" ON public.items FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read items" ON public.items FOR SELECT USING (true);

-- Settings table for admin controls
CREATE TABLE public.app_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings (to check if submissions are open)
CREATE POLICY "Anyone can read settings" ON public.app_settings FOR SELECT USING (true);
-- Only authenticated users (admins) can update settings
CREATE POLICY "Authenticated users can update settings" ON public.app_settings FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Insert default setting
INSERT INTO public.app_settings (key, value) VALUES ('submissions_open', 'true');

-- Create index for item codes
CREATE INDEX idx_items_item_code ON public.items(item_code);
CREATE INDEX idx_items_school_id ON public.items(school_id);
