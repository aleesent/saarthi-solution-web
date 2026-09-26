-- ==============================================================================
-- SUPABASE POSTGRESQL & STORAGE COMPLETE MIGRATION: 100% SUPABASE ARCHITECTURE
-- Project: Saarthi Solutions (Recruitment & Advisory)
-- Purpose: Completely remove Google Drive. Make Supabase the SOLE storage & database system.
-- Run this script in: Supabase Dashboard -> SQL Editor -> New query -> Run
-- ==============================================================================

-- 1. Create or update storage provider enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'storage_provider_enum') THEN
    CREATE TYPE storage_provider_enum AS ENUM ('supabase', 'local');
  END IF;
END $$;

-- ==============================================================================
-- 2. PROVISION SUPABASE STORAGE BUCKETS
-- ==============================================================================
-- 1. 'resumes'   -> Resumes, Candidate CVs, Application Documents (PDF, DOC, DOCX)
-- 2. 'invoices'  -> Invoices, Billing Statements, Receipts (PDF)
-- 3. 'documents' -> Corporate Brochures, Job Descriptions, Service Catalogues
-- 4. 'assets'    -> Company Logos, Reviewer Avatars, Candidate Photos, UI Graphics

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('resumes', 'resumes', true, 52428800, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/octet-stream']),
  ('invoices', 'invoices', true, 52428800, ARRAY['application/pdf', 'application/octet-stream']),
  ('documents', 'documents', true, 52428800, NULL),
  ('assets', 'assets', true, 20971520, ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp', 'image/gif', 'image/x-icon'])
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = EXCLUDED.file_size_limit;

-- Enable Storage Objects RLS & Configure Policies
DROP POLICY IF EXISTS "Public Read All Saarthi Buckets" ON storage.objects;
CREATE POLICY "Public Read All Saarthi Buckets"
  ON storage.objects FOR SELECT
  USING (bucket_id IN ('resumes', 'invoices', 'documents', 'assets'));

DROP POLICY IF EXISTS "Public & Auth Upload to Saarthi Buckets" ON storage.objects;
CREATE POLICY "Public & Auth Upload to Saarthi Buckets"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id IN ('resumes', 'invoices', 'documents', 'assets'));

DROP POLICY IF EXISTS "Public & Auth Update Saarthi Buckets" ON storage.objects;
CREATE POLICY "Public & Auth Update Saarthi Buckets"
  ON storage.objects FOR UPDATE
  USING (bucket_id IN ('resumes', 'invoices', 'documents', 'assets'))
  WITH CHECK (bucket_id IN ('resumes', 'invoices', 'documents', 'assets'));

DROP POLICY IF EXISTS "Public & Auth Delete Saarthi Buckets" ON storage.objects;
CREATE POLICY "Public & Auth Delete Saarthi Buckets"
  ON storage.objects FOR DELETE
  USING (bucket_id IN ('resumes', 'invoices', 'documents', 'assets'));

-- ==============================================================================
-- 3. CORE `files` METADATA TABLE (SUPABASE DATABASE ONLY)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.files (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  original_file_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  storage_provider TEXT NOT NULL DEFAULT 'supabase',
  storage_path TEXT,
  download_url TEXT,
  thumbnail_url TEXT,
  folder_id TEXT,
  folder_path TEXT DEFAULT 'Saarthi Solutions/',
  related_entity_type TEXT,
  related_entity_id TEXT,
  uploaded_by TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure storage_provider constraint allows 'supabase' and 'local'
ALTER TABLE public.files DROP CONSTRAINT IF EXISTS files_storage_provider_check;
ALTER TABLE public.files ADD CONSTRAINT files_storage_provider_check CHECK (storage_provider IN ('supabase', 'local'));

-- Ensure columns exist
ALTER TABLE public.files ADD COLUMN IF NOT EXISTS storage_path TEXT;
ALTER TABLE public.files ADD COLUMN IF NOT EXISTS download_url TEXT;
ALTER TABLE public.files ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
ALTER TABLE public.files ADD COLUMN IF NOT EXISTS related_entity_type TEXT;
ALTER TABLE public.files ADD COLUMN IF NOT EXISTS related_entity_id TEXT;
ALTER TABLE public.files ADD COLUMN IF NOT EXISTS uploaded_by TEXT;
ALTER TABLE public.files ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.files ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;

-- Migrate any legacy google_drive files to supabase
UPDATE public.files 
SET storage_provider = 'supabase' 
WHERE storage_provider = 'google_drive';

-- Drop obsolete Google Drive columns if present
ALTER TABLE public.files DROP COLUMN IF EXISTS google_drive_file_id;
ALTER TABLE public.files DROP COLUMN IF EXISTS google_drive_url;
ALTER TABLE public.files DROP COLUMN IF EXISTS google_drive_view_url;
ALTER TABLE public.files DROP COLUMN IF EXISTS google_drive_download_url;

-- ==============================================================================
-- 4. APPLICATION TABLES & SCHEMA ALIGNMENT
-- ==============================================================================

-- 4.1 Contact Form Submissions Table
CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  subject TEXT DEFAULT 'General Inquiry',
  user_type TEXT DEFAULT 'General',
  message TEXT NOT NULL,
  status TEXT DEFAULT 'New',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4.2 Job Applications Table
CREATE TABLE IF NOT EXISTS public.job_applications (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  job_id TEXT NOT NULL,
  job_title TEXT NOT NULL,
  candidate_id TEXT,
  candidate_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp TEXT,
  qualification TEXT,
  experience TEXT,
  current_location TEXT,
  current_ctc TEXT,
  expected_ctc TEXT,
  notice_period TEXT DEFAULT '15 Days',
  cover_letter TEXT,
  status TEXT DEFAULT 'Pending Review',
  resume_file_id TEXT REFERENCES public.files(id) ON DELETE SET NULL,
  resume_url TEXT,
  resume_file_name TEXT,
  photo_url TEXT,
  photo_storage_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS resume_file_id TEXT;
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS resume_url TEXT;
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS resume_file_name TEXT;
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS photo_storage_path TEXT;

-- Drop obsolete Google Drive column if present
ALTER TABLE public.job_applications DROP COLUMN IF EXISTS resume_google_drive_url;

-- 4.3 Candidates Registry Table
CREATE TABLE IF NOT EXISTS public.candidates (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  qualification TEXT,
  experience TEXT,
  experience_years NUMERIC,
  current_location TEXT,
  primary_skill TEXT,
  current_company TEXT,
  expected_salary TEXT,
  notice_period TEXT,
  resume_file_id TEXT REFERENCES public.files(id) ON DELETE SET NULL,
  resume_url TEXT,
  resume_file_name TEXT,
  photo_url TEXT,
  photo_storage_path TEXT,
  status TEXT DEFAULT 'Available',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS resume_file_id TEXT;
ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS resume_url TEXT;
ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS resume_file_name TEXT;
ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS photo_storage_path TEXT;
ALTER TABLE public.candidates DROP COLUMN IF EXISTS resume_google_drive_url;

-- 4.4 Jobs Vacancies Table
CREATE TABLE IF NOT EXISTS public.jobs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  company_name TEXT NOT NULL,
  industry TEXT,
  location TEXT NOT NULL,
  salary TEXT,
  experience TEXT,
  qualification TEXT,
  employment_type TEXT DEFAULT 'Full-Time',
  category TEXT DEFAULT 'Manufacturing',
  contact_person TEXT,
  contact_phone TEXT,
  whatsapp_number TEXT,
  description TEXT,
  requirements TEXT[] DEFAULT ARRAY[]::TEXT[],
  responsibilities TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_urgent BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'Open',
  posted_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4.5 Invoices Table
CREATE TABLE IF NOT EXISTS public.invoices (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  invoice_number TEXT UNIQUE NOT NULL,
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  client_name TEXT NOT NULL,
  client_company TEXT,
  client_gstin TEXT,
  client_address TEXT,
  tax_mode TEXT DEFAULT 'INTRA_STATE',
  items JSONB DEFAULT '[]'::jsonb,
  subtotal NUMERIC(12,2) DEFAULT 0,
  discount NUMERIC(12,2) DEFAULT 0,
  taxable_amount NUMERIC(12,2) DEFAULT 0,
  total_gst NUMERIC(12,2) DEFAULT 0,
  grand_total NUMERIC(12,2) DEFAULT 0,
  total_in_words TEXT,
  payment_status TEXT DEFAULT 'Pending',
  pdf_file_id TEXT REFERENCES public.files(id) ON DELETE SET NULL,
  pdf_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS pdf_file_id TEXT;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS pdf_url TEXT;
ALTER TABLE public.invoices DROP COLUMN IF EXISTS pdf_google_drive_url;

-- 4.6 Website Settings Table
CREATE TABLE IF NOT EXISTS public.website_settings (
  id TEXT PRIMARY KEY DEFAULT 'general',
  company_name TEXT DEFAULT 'Saarthi Solutions',
  proprietor TEXT DEFAULT 'Raajesh V',
  tagline TEXT,
  gstin TEXT,
  pan TEXT,
  msme TEXT,
  address TEXT,
  primary_phone TEXT,
  whatsapp_number TEXT,
  email TEXT,
  bank_name TEXT,
  account_name TEXT,
  account_number TEXT,
  ifsc_code TEXT,
  branch_name TEXT,
  terms_conditions TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4.7 Testimonials Table
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
  type TEXT DEFAULT 'Candidate',
  status TEXT DEFAULT 'approved',
  is_approved BOOLEAN DEFAULT true,
  submitted_by TEXT DEFAULT 'Website User',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'approved';
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT true;
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS avatar TEXT;
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS image TEXT;
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS submitted_by TEXT DEFAULT 'Website User';
ALTER TABLE public.testimonials DROP COLUMN IF EXISTS drive_file_id;
ALTER TABLE public.testimonials DROP COLUMN IF EXISTS drive_url;

-- 4.8 Placements Table
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

-- 4.9 Services Table
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

-- 4.10 Employers Table (with direct Supabase Storage JD document link)
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
  website TEXT,
  jd_url TEXT,
  jd_file_id TEXT,
  jd_file_name TEXT,
  jd_file_size BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.employers ADD COLUMN IF NOT EXISTS jd_url TEXT;
ALTER TABLE public.employers ADD COLUMN IF NOT EXISTS jd_file_id TEXT;
ALTER TABLE public.employers ADD COLUMN IF NOT EXISTS jd_file_name TEXT;
ALTER TABLE public.employers ADD COLUMN IF NOT EXISTS jd_file_size BIGINT;
ALTER TABLE public.employers DROP COLUMN IF EXISTS jd_google_drive_url;
ALTER TABLE public.employers DROP COLUMN IF EXISTS jd_google_drive_view_url;

-- ==============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.placements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employers ENABLE ROW LEVEL SECURITY;

-- Files table policies
DROP POLICY IF EXISTS "Public files access" ON public.files;
CREATE POLICY "Public files access" ON public.files FOR SELECT USING (true);
DROP POLICY IF EXISTS "Anyone can insert files" ON public.files;
CREATE POLICY "Anyone can insert files" ON public.files FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Anyone can update files" ON public.files;
CREATE POLICY "Anyone can update files" ON public.files FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Anyone can delete files" ON public.files;
CREATE POLICY "Anyone can delete files" ON public.files FOR DELETE USING (true);

-- Contact submissions policies
DROP POLICY IF EXISTS "Public read contact submissions" ON public.contact_submissions;
CREATE POLICY "Public read contact submissions" ON public.contact_submissions FOR SELECT USING (true);
DROP POLICY IF EXISTS "Anyone can insert contact submission" ON public.contact_submissions;
CREATE POLICY "Anyone can insert contact submission" ON public.contact_submissions FOR INSERT WITH CHECK (true);

-- Job applications policies
DROP POLICY IF EXISTS "Public read job applications" ON public.job_applications;
CREATE POLICY "Public read job applications" ON public.job_applications FOR SELECT USING (true);
DROP POLICY IF EXISTS "Anyone can insert job application" ON public.job_applications;
CREATE POLICY "Anyone can insert job application" ON public.job_applications FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Anyone can update job applications" ON public.job_applications;
CREATE POLICY "Anyone can update job applications" ON public.job_applications FOR ALL USING (true) WITH CHECK (true);

-- Candidates policies
DROP POLICY IF EXISTS "Public read candidates" ON public.candidates;
CREATE POLICY "Public read candidates" ON public.candidates FOR ALL USING (true) WITH CHECK (true);

-- Jobs policies
DROP POLICY IF EXISTS "Public read jobs" ON public.jobs;
CREATE POLICY "Public read jobs" ON public.jobs FOR ALL USING (true) WITH CHECK (true);

-- Invoices policies
DROP POLICY IF EXISTS "Public read invoices" ON public.invoices;
CREATE POLICY "Public read invoices" ON public.invoices FOR ALL USING (true) WITH CHECK (true);

-- Settings policies
DROP POLICY IF EXISTS "Public read website settings" ON public.website_settings;
CREATE POLICY "Public read website settings" ON public.website_settings FOR ALL USING (true) WITH CHECK (true);

-- Testimonials policies
DROP POLICY IF EXISTS "Public read testimonials" ON public.testimonials;
CREATE POLICY "Public read testimonials" ON public.testimonials FOR ALL USING (true) WITH CHECK (true);

-- Placements policies
DROP POLICY IF EXISTS "Public read placements" ON public.placements;
CREATE POLICY "Public read placements" ON public.placements FOR ALL USING (true) WITH CHECK (true);

-- Services policies
DROP POLICY IF EXISTS "Public read services" ON public.services;
CREATE POLICY "Public read services" ON public.services FOR ALL USING (true) WITH CHECK (true);

-- Employers policies
DROP POLICY IF EXISTS "Public read employers" ON public.employers;
CREATE POLICY "Public read employers" ON public.employers FOR ALL USING (true) WITH CHECK (true);
