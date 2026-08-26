-- ==============================================================================
-- SUPABASE POSTGRESQL SCHEMA MIGRATION: Testimonials, Placements, Services & Employers
-- Project: Saarthi Solutions (Recruitment & Advisory)
-- Run this in your Supabase Project -> SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Testimonials Table (Client & Candidate feedback reviews with Admin Approval & Google Drive PFP)
CREATE TABLE IF NOT EXISTS public.testimonials (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT DEFAULT 'Gujarat',
  content TEXT NOT NULL,
  rating NUMERIC(2,1) DEFAULT 5.0,
  avatar TEXT,
  image TEXT,
  type TEXT DEFAULT 'Candidate', -- 'Candidate' | 'Employer'
  status TEXT DEFAULT 'pending', -- 'pending' | 'approved' | 'rejected'
  is_approved BOOLEAN DEFAULT false,
  drive_file_id TEXT,
  drive_url TEXT,
  submitted_by TEXT DEFAULT 'Website User',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure columns exist if table was already created
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'approved';
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT true;
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS drive_file_id TEXT;
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS drive_url TEXT;
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS submitted_by TEXT DEFAULT 'Website User';

-- 2. Placements Table (Successful candidate career milestones)
CREATE TABLE IF NOT EXISTS public.placements (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  candidate TEXT NOT NULL,
  role TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT DEFAULT 'Surat / Silvassa',
  salary TEXT DEFAULT 'Competitive',
  category TEXT DEFAULT 'Manufacturing',
  date TEXT DEFAULT 'August 2026',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Services Table (Advisory, recruitment, payroll & compliance catalog)
CREATE TABLE IF NOT EXISTS public.services (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  short_desc TEXT,
  full_desc TEXT,
  icon_name TEXT DEFAULT 'Briefcase',
  features TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Employers Table (Corporate client partners & industrial recruiters)
CREATE TABLE IF NOT EXISTS public.employers (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  company_name TEXT NOT NULL,
  industry TEXT DEFAULT 'Manufacturing',
  location TEXT DEFAULT 'Gujarat',
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  active_openings INTEGER DEFAULT 1,
  partnership_type TEXT DEFAULT 'Permanent Hiring',
  status TEXT DEFAULT 'Active Partner',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Indexes for fast filtering and ordering
CREATE INDEX IF NOT EXISTS idx_testimonials_rating ON public.testimonials(rating DESC);
CREATE INDEX IF NOT EXISTS idx_testimonials_created ON public.testimonials(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_placements_category ON public.placements(category);
CREATE INDEX IF NOT EXISTS idx_placements_created ON public.placements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_employers_industry ON public.employers(industry);

-- 6. Enable Row Level Security (RLS)
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.placements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employers ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies (Public read and insert access)
DROP POLICY IF EXISTS "Public read testimonials" ON public.testimonials;
CREATE POLICY "Public read testimonials" ON public.testimonials FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert testimonials" ON public.testimonials;
CREATE POLICY "Anyone can insert testimonials" ON public.testimonials FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public read placements" ON public.placements;
CREATE POLICY "Public read placements" ON public.placements FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can modify placements" ON public.placements;
CREATE POLICY "Anyone can modify placements" ON public.placements FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public read services" ON public.services;
CREATE POLICY "Public read services" ON public.services FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can modify services" ON public.services;
CREATE POLICY "Anyone can modify services" ON public.services FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public read employers" ON public.employers;
CREATE POLICY "Public read employers" ON public.employers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can modify employers" ON public.employers;
CREATE POLICY "Anyone can modify employers" ON public.employers FOR ALL USING (true) WITH CHECK (true);
