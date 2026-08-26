-- ==============================================================================
-- SUPABASE POSTGRESQL SCHEMA MIGRATION: Final Storage & Application Architecture
-- Project: Saarthi Solutions (Recruitment & Advisory)
-- Architecture:
--   1. PDFs (Resumes, Invoices, Brochures) -> ALWAYS Google Drive
--   2. Documents & Archives (DOC, XLS, ZIP) -> Google Drive
--   3. UI & Website Assets (Logos, Icons, Small Images) -> Supabase Storage (assets bucket)
--   4. Structured Data (Inquiries, Job Apps, Candidates, Invoices) -> Supabase PostgreSQL
-- ==============================================================================

-- 1. Create enum for storage providers
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'storage_provider_enum') THEN
    CREATE TYPE storage_provider_enum AS ENUM ('supabase', 'google_drive', 'local');
  END IF;
END $$;

-- 2. Core `files` table for all file metadata & cloud references
CREATE TABLE IF NOT EXISTS public.files (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  original_file_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  storage_provider TEXT NOT NULL CHECK (storage_provider IN ('supabase', 'google_drive', 'local')),
  storage_path TEXT,
  google_drive_file_id TEXT,
  google_drive_url TEXT,
  google_drive_view_url TEXT,
  google_drive_download_url TEXT,
  download_url TEXT,
  thumbnail_url TEXT,
  folder_id TEXT,
  folder_path TEXT DEFAULT 'Saarthi Solutions/',
  related_entity_type TEXT, -- 'candidate_resume' | 'application_resume' | 'invoice_pdf' | 'document' | 'asset' | 'logo' | 'other'
  related_entity_id TEXT,
  uploaded_by TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Contact Form Submissions Table (Direct structured data in PostgreSQL)
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

-- 4. Job Applications Table (Direct structured data + Google Drive resume reference)
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
  resume_google_drive_url TEXT,
  resume_file_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Candidates Registry Table
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
  resume_google_drive_url TEXT,
  resume_file_name TEXT,
  status TEXT DEFAULT 'Available',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Jobs Vacancies Table
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

-- 7. Invoices Table (Direct structured data + Google Drive invoice PDF reference)
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

-- 8. Website & Company Settings Table
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

-- 9. Create High-Performance Database Indexes
CREATE INDEX IF NOT EXISTS idx_files_user_id ON public.files(user_id);
CREATE INDEX IF NOT EXISTS idx_files_provider ON public.files(storage_provider);
CREATE INDEX IF NOT EXISTS idx_files_related_entity ON public.files(related_entity_type, related_entity_id);
CREATE INDEX IF NOT EXISTS idx_files_google_drive_id ON public.files(google_drive_file_id);
CREATE INDEX IF NOT EXISTS idx_files_created_at ON public.files(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_files_mime_type ON public.files(mime_type);

CREATE INDEX IF NOT EXISTS idx_contact_created ON public.contact_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_apps_job_id ON public.job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_apps_email ON public.job_applications(email);
CREATE INDEX IF NOT EXISTS idx_candidates_email ON public.candidates(email);
CREATE INDEX IF NOT EXISTS idx_jobs_category ON public.jobs(category);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON public.invoices(invoice_number);

-- 10. Enable Row Level Security (RLS) on all tables
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_settings ENABLE ROW LEVEL SECURITY;

-- 11. Row Level Security Policies
-- Public view policies
DROP POLICY IF EXISTS "Public files access" ON public.files;
CREATE POLICY "Public files access" ON public.files FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert files" ON public.files;
CREATE POLICY "Anyone can insert files" ON public.files FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can insert contact submission" ON public.contact_submissions;
CREATE POLICY "Anyone can insert contact submission" ON public.contact_submissions FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public read contact submissions" ON public.contact_submissions;
CREATE POLICY "Public read contact submissions" ON public.contact_submissions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert job application" ON public.job_applications;
CREATE POLICY "Anyone can insert job application" ON public.job_applications FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public read job applications" ON public.job_applications;
CREATE POLICY "Public read job applications" ON public.job_applications FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read jobs" ON public.jobs;
CREATE POLICY "Public read jobs" ON public.jobs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read website settings" ON public.website_settings;
CREATE POLICY "Public read website settings" ON public.website_settings FOR SELECT USING (true);

-- 12. Trigger to automatically update `updated_at` on row changes
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_files_updated_at ON public.files;
CREATE TRIGGER set_files_updated_at
  BEFORE UPDATE ON public.files
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 13. Supabase Storage Bucket Provisioning (ONLY for website assets, logos, and images)
INSERT INTO storage.buckets (id, name, public)
VALUES ('assets', 'assets', true)
ON CONFLICT (id) DO NOTHING;

-- Public access policies for Supabase Storage assets bucket
DROP POLICY IF EXISTS "Public Asset Access" ON storage.objects;
CREATE POLICY "Public Asset Access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'assets');

DROP POLICY IF EXISTS "Authenticated and Anon Uploads to Assets" ON storage.objects;
CREATE POLICY "Authenticated and Anon Uploads to Assets"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'assets');

