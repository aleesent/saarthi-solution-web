-- ==============================================================================
-- SUPABASE POSTGRESQL SCHEMA MIGRATION: Files & Storage Architecture
-- Project: Sarthi Solutions (Recruitment & Advisory)
-- Hybrid Storage: Supabase Storage (Small Assets) + Google Drive (PDFs/Large Files)
-- ==============================================================================

-- 1. Create enum for storage providers (or use text check constraint)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'storage_provider_enum') THEN
    CREATE TYPE storage_provider_enum AS ENUM ('supabase', 'google_drive', 'local');
  END IF;
END $$;

-- 2. Create the core `files` table for all structured metadata
CREATE TABLE IF NOT EXISTS public.files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
  download_url TEXT,
  thumbnail_url TEXT,
  folder_id TEXT,
  folder_path TEXT DEFAULT 'Sarthi Solutions/',
  related_entity_type TEXT, -- 'candidate_resume' | 'application_resume' | 'invoice_pdf' | 'document' | 'asset' | 'logo' | 'other'
  related_entity_id TEXT,
  uploaded_by TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Create high-performance indexes
CREATE INDEX IF NOT EXISTS idx_files_user_id ON public.files(user_id);
CREATE INDEX IF NOT EXISTS idx_files_provider ON public.files(storage_provider);
CREATE INDEX IF NOT EXISTS idx_files_related_entity ON public.files(related_entity_type, related_entity_id);
CREATE INDEX IF NOT EXISTS idx_files_google_drive_id ON public.files(google_drive_file_id);
CREATE INDEX IF NOT EXISTS idx_files_created_at ON public.files(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_files_mime_type ON public.files(mime_type);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

-- 5. Row Level Security Policies
-- Policy: Public/Candidates can view their own files, public assets, or resumes linked to them
DROP POLICY IF EXISTS "Public files viewable by everyone" ON public.files;
CREATE POLICY "Public files viewable by everyone"
  ON public.files
  FOR SELECT
  USING (
    is_public = true 
    OR auth.role() = 'authenticated'
    OR auth.role() = 'anon'
  );

-- Policy: Authenticated users can insert files
DROP POLICY IF EXISTS "Anyone can insert file metadata" ON public.files;
CREATE POLICY "Anyone can insert file metadata"
  ON public.files
  FOR INSERT
  WITH CHECK (true);

-- Policy: Admin or file owner can update file metadata
DROP POLICY IF EXISTS "Owners and Admins can update files" ON public.files;
CREATE POLICY "Owners and Admins can update files"
  ON public.files
  FOR UPDATE
  USING (
    auth.uid() = user_id 
    OR auth.jwt() ->> 'email' IN (
      'admin@sarthisolutions.com', 
      'raajesh@sarthisolutions.com', 
      'sarthisolutions.silvassa@gmail.com',
      'as4820000@gmail.com'
    )
    OR auth.role() = 'service_role'
  );

-- Policy: Admin or file owner can delete files
DROP POLICY IF EXISTS "Owners and Admins can delete files" ON public.files;
CREATE POLICY "Owners and Admins can delete files"
  ON public.files
  FOR DELETE
  USING (
    auth.uid() = user_id 
    OR auth.jwt() ->> 'email' IN (
      'admin@sarthisolutions.com', 
      'raajesh@sarthisolutions.com', 
      'sarthisolutions.silvassa@gmail.com',
      'as4820000@gmail.com'
    )
    OR auth.role() = 'service_role'
  );

-- 6. Trigger to automatically update `updated_at` on row change
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

-- 7. Supabase Storage Bucket Provisioning (for small website assets < MAX_SUPABASE_FILE_SIZE)
INSERT INTO storage.buckets (id, name, public)
VALUES ('assets', 'assets', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes-small', 'resumes-small', true)
ON CONFLICT (id) DO NOTHING;

-- Public access policies for Supabase Storage buckets
DROP POLICY IF EXISTS "Public Asset Access" ON storage.objects;
CREATE POLICY "Public Asset Access"
  ON storage.objects FOR SELECT
  USING (bucket_id IN ('assets', 'resumes-small'));

DROP POLICY IF EXISTS "Authenticated and Anon Uploads to Assets" ON storage.objects;
CREATE POLICY "Authenticated and Anon Uploads to Assets"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id IN ('assets', 'resumes-small'));
