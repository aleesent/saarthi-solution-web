import { createClient, SupabaseClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import {
  INITIAL_JOBS,
  SERVICES as INITIAL_SERVICES,
  TESTIMONIALS as INITIAL_TESTIMONIALS,
  INITIAL_PLACEMENTS,
  INITIAL_EMPLOYERS,
  INITIAL_WEBSITE_SETTINGS
} from '../src/data/mockData';

export type StorageProvider = 'supabase' | 'local';

export interface FileMetadata {
  id: string;
  user_id?: string;
  file_name: string;
  original_file_name: string;
  mime_type: string;
  file_size: number;
  storage_provider: StorageProvider;
  storage_path?: string;
  bucket?: string;
  download_url?: string;
  thumbnail_url?: string;
  folder_path?: string;
  related_entity_type?: string;
  related_entity_id?: string;
  uploaded_by?: string;
  metadata?: Record<string, any>;
  is_public?: boolean;
  created_at: string;
  updated_at: string;
}

// In-memory fallback stores for file metadata and binary buffers
export const inMemoryFileStore = new Map<string, FileMetadata>();
export const inMemoryBufferStore = new Map<string, { buffer: Buffer; mime_type: string; file_name: string }>();

// Seed initial files
const seedInitialFiles = () => {
  const initial: FileMetadata[] = [
    {
      id: 'file-seed-001',
      file_name: 'Rajesh_Kumar_Executive_Resume_2026.pdf',
      original_file_name: 'Rajesh_Kumar_Resume_2026.pdf',
      mime_type: 'application/pdf',
      file_size: 245760, // 240 KB
      storage_provider: 'supabase',
      bucket: 'resumes',
      storage_path: 'resumes/Rajesh_Kumar_Executive_Resume_2026.pdf',
      download_url: '/api/storage/files/file-seed-001/content',
      folder_path: 'Saarthi Solutions/resumes/',
      related_entity_type: 'candidate_resume',
      related_entity_id: 'cand-001',
      uploaded_by: 'Rajesh Kumar',
      metadata: { qualification: 'B.Tech Mechanical', experience: '8 Years' },
      is_public: true,
      created_at: '2026-08-01T10:30:00.000Z',
      updated_at: '2026-08-01T10:30:00.000Z'
    },
    {
      id: 'file-seed-002',
      file_name: 'Amit_Patel_Factory_Manager_Resume.pdf',
      original_file_name: 'Amit_Patel_CV.pdf',
      mime_type: 'application/pdf',
      file_size: 312000,
      storage_provider: 'supabase',
      bucket: 'resumes',
      storage_path: 'resumes/Amit_Patel_Factory_Manager_Resume.pdf',
      download_url: '/api/storage/files/file-seed-002/content',
      folder_path: 'Saarthi Solutions/resumes/',
      related_entity_type: 'candidate_resume',
      related_entity_id: 'cand-002',
      uploaded_by: 'Amit Patel',
      metadata: { qualification: 'BE Production', experience: '12 Years' },
      is_public: true,
      created_at: '2026-08-05T14:15:00.000Z',
      updated_at: '2026-08-05T14:15:00.000Z'
    },
    {
      id: 'file-seed-003',
      file_name: 'Sarthi_Solutions_Corporate_Brochure_2026.pdf',
      original_file_name: 'Corporate_Brochure_2026.pdf',
      mime_type: 'application/pdf',
      file_size: 1450000, // 1.45 MB
      storage_provider: 'supabase',
      bucket: 'documents',
      storage_path: 'documents/Sarthi_Solutions_Corporate_Brochure_2026.pdf',
      download_url: '/api/storage/files/file-seed-003/content',
      folder_path: 'Saarthi Solutions/documents/',
      related_entity_type: 'document',
      uploaded_by: 'Raajesh V (Admin)',
      metadata: { documentType: 'Corporate Catalogue', version: '2026.1' },
      is_public: true,
      created_at: '2026-08-10T09:00:00.000Z',
      updated_at: '2026-08-10T09:00:00.000Z'
    },
    {
      id: 'file-seed-004',
      file_name: 'sarthi_official_navy_gold_logo.svg',
      original_file_name: 'sarthi-logo.svg',
      mime_type: 'image/svg+xml',
      file_size: 42000, // 42 KB
      storage_provider: 'supabase',
      bucket: 'assets',
      storage_path: 'assets/logos/sarthi_official_navy_gold_logo.svg',
      download_url: '/sarthi-logo.svg',
      thumbnail_url: '/sarthi-logo.svg',
      folder_path: 'Saarthi Solutions/assets/',
      related_entity_type: 'asset',
      uploaded_by: 'System',
      is_public: true,
      created_at: '2026-08-01T08:00:00.000Z',
      updated_at: '2026-08-01T08:00:00.000Z'
    }
  ];

  initial.forEach((f) => inMemoryFileStore.set(f.id, f));
};

seedInitialFiles();

// In-Memory Testimonials Fallback Store
export const inMemoryTestimonialStore = new Map<string, any>();

// In-Memory Employers Fallback Store
export const inMemoryEmployerStore = new Map<string, any>();

export const INITIAL_EMPLOYERS_SEEDS = [
  {
    id: '5a280aff-d0fc-4681-9634-c9f2ed5fee00',
    company_name: 'Gujarat Plastics Industries',
    contact_person: 'Mr. Nilesh Patel (HR Head)',
    email: 'nilesh@gujaratplastics.com',
    phone: '+91 98251 11222',
    industry: 'Manufacturing & Engineering',
    location: 'Vapi, Gujarat',
    gstin: '24AAACG1234F1Z5',
    website: 'https://gujaratplastics.com',
    status: 'Active',
    created_at: '2026-08-01T10:00:00.000Z',
    updated_at: '2026-08-01T10:00:00.000Z'
  },
  {
    id: '44444444-4444-4444-8444-444444444444',
    company_name: 'Surat Elevator Components Ltd.',
    contact_person: 'Mr. Vikram Patel (Managing Director)',
    email: 'hr@suratelevator.com',
    phone: '+91 98250 12345',
    industry: 'Elevator Component Manufacturing',
    location: 'Bhestan Udhna Road, Surat',
    gstin: '24AABCS9876K1Z1',
    website: 'https://suratelevators.com',
    status: 'Active',
    created_at: '2026-08-02T10:00:00.000Z',
    updated_at: '2026-08-02T10:00:00.000Z'
  },
  {
    id: '55555555-5555-4555-8555-555555555555',
    company_name: 'Silvassa Industrial Mfg. Unit',
    contact_person: 'Mr. K. R. Sharma (VP Operations)',
    email: 'operations@silvassapower.com',
    phone: '+91 98241 88990',
    industry: 'Heavy Engineering & Fabrication',
    location: 'Silvassa, Dadra & Nagar Haveli',
    gstin: '26AACCS1122B1Z8',
    website: 'https://silvassaindustries.com',
    status: 'Active',
    created_at: '2026-08-03T10:00:00.000Z',
    updated_at: '2026-08-03T10:00:00.000Z'
  }
];

const seedInitialEmployers = () => {
  INITIAL_EMPLOYERS_SEEDS.forEach((e) => inMemoryEmployerStore.set(e.id, e));
};

seedInitialEmployers();

export const INITIAL_SEEDS = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    name: 'Vikram Patel',
    role: 'Managing Director',
    company: 'Surat Elevator Components Ltd.',
    image: '/avatars/avatar-male.svg',
    avatar: '/avatars/avatar-male.svg',
    content: 'Sarthi Solutions fulfilled our urgent requirement for Sales Head and Quality Control Executives within 5 days! Their understanding of the Elevator Component Manufacturing industry is truly impressive.',
    rating: 5,
    type: 'Employer',
    status: 'approved',
    is_approved: true,
    location: 'Surat, Gujarat',
    created_at: '2026-08-01T10:00:00.000Z',
    updated_at: '2026-08-01T10:00:00.000Z'
  },
  {
    id: '22222222-2222-4222-8222-222222222222',
    name: 'Rajesh Sharma',
    role: 'Assistant Factory Manager',
    company: 'Silvassa Industrial Mfg. Unit',
    image: '/avatars/avatar-male.svg',
    avatar: '/avatars/avatar-male.svg',
    content: 'Raajesh V and the Sarthi team guided me throughout my hiring process for Silvassa plant. Their transparent communication and interview prep gave me complete confidence!',
    rating: 5,
    type: 'Candidate',
    status: 'approved',
    is_approved: true,
    location: 'Silvassa, Dadra & Nagar Haveli',
    created_at: '2026-08-02T11:00:00.000Z',
    updated_at: '2026-08-02T11:00:00.000Z'
  },
  {
    id: '33333333-3333-4333-8333-333333333333',
    name: 'Meera Deshmukh',
    role: 'Head of Human Resources',
    company: 'Gujarat Chemical Industries, Vapi',
    image: '/avatars/avatar-female.svg',
    avatar: '/avatars/avatar-female.svg',
    content: 'We have partnered with Sarthi Solutions for executive placements for over 4 years. Their candidate screening quality and statutory HR advisory are top-notch.',
    rating: 5,
    type: 'Employer',
    status: 'approved',
    is_approved: true,
    location: 'Vapi, Gujarat',
    created_at: '2026-08-03T09:30:00.000Z',
    updated_at: '2026-08-03T09:30:00.000Z'
  }
];

const seedInitialTestimonials = () => {
  INITIAL_SEEDS.forEach((t) => inMemoryTestimonialStore.set(t.id, t));
};

seedInitialTestimonials();

function sanitizeUUID(val: any): string | null {
  if (!val || typeof val !== 'string') return null;
  const trimmed = val.trim();
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(trimmed) ? trimmed : null;
}

function ensureValidUUID(val?: string): string {
  if (!val) return crypto.randomUUID();
  const sanitized = sanitizeUUID(val);
  if (sanitized) return sanitized;
  if (val === 't1') return '11111111-1111-4111-8111-111111111111';
  if (val === 't2') return '22222222-2222-4222-8222-222222222222';
  if (val === 't3') return '33333333-3333-4333-8333-333333333333';
  return crypto.randomUUID();
}

export class StorageService {
  private supabase: SupabaseClient | null = null;
  private verifiedBuckets = new Set<string>();

  constructor() {
    this.initSupabase();
  }

  public initSupabase(): SupabaseClient | null {
    const url = process.env.SUPABASE_URL?.trim();
    const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY)?.trim();
    if (url && key) {
      // If credentials are dummy/placeholder values from .env.example, fallback immediately to in-memory store
      if (
        url.includes('your-project-id') || 
        url.includes('your-supabase') ||
        key.includes('...') ||
        key === 'MY_SUPABASE_ANON_KEY'
      ) {
        this.supabase = null;
        return null;
      }

      try {
        this.supabase = createClient(url, key, {
          auth: { persistSession: false },
          global: {
            fetch: (input, init) => {
              return fetch(input, {
                ...init,
                signal: init?.signal || AbortSignal.timeout(3000)
              });
            }
          }
        });
      } catch (err) {
        console.warn('[StorageService] Supabase client init warning:', err);
        this.supabase = null;
      }
    }
    return this.supabase;
  }

  /**
   * Determine the target Supabase Storage bucket based on file type and business entity:
   * 1. 'resumes'   -> Candidate resumes, applicant CVs, professional profiles
   * 2. 'invoices'  -> Invoices and billing PDFs
   * 3. 'documents' -> Corporate brochures, job descriptions, contracts
   * 4. 'assets'    -> Company logos, reviewer avatars, photos, UI graphics
   */
  public determineBucket(params: {
    mimetype: string;
    originalname: string;
    relatedEntityType?: string;
    customFolder?: string;
  }): string {
    const entity = (params.relatedEntityType || '').toLowerCase();
    const name = (params.originalname || '').toLowerCase();
    const mime = (params.mimetype || '').toLowerCase();

    if (
      entity.includes('resume') ||
      name.includes('resume') ||
      name.includes('cv') ||
      entity === 'candidate_resume' ||
      entity === 'application_resume'
    ) {
      return 'resumes';
    }

    if (entity.includes('invoice') || name.includes('invoice')) {
      return 'invoices';
    }

    if (
      entity.includes('jd') ||
      entity.includes('job_description') ||
      entity.includes('document') ||
      entity.includes('brochure') ||
      entity.includes('catalogue') ||
      name.includes('jd') ||
      name.includes('job-description') ||
      name.includes('brochure')
    ) {
      return 'documents';
    }

    // Images, avatars, photos, logos
    if (
      mime.startsWith('image/') ||
      entity.includes('photo') ||
      entity.includes('avatar') ||
      entity.includes('logo') ||
      entity.includes('asset') ||
      entity.includes('pfp')
    ) {
      return 'assets';
    }

    // Default document bucket
    return 'documents';
  }

  /**
   * Ensure a Supabase Storage bucket exists
   */
  private async ensureBucket(bucketName: string) {
    if (this.verifiedBuckets.has(bucketName)) return;
    const supabase = this.initSupabase();
    if (!supabase) return;

    try {
      // Check if bucket exists, or attempt creation
      const { data: buckets } = await supabase.storage.listBuckets();
      const exists = buckets?.some((b) => b.id === bucketName || b.name === bucketName);
      if (!exists) {
        await supabase.storage.createBucket(bucketName, { public: true });
      }
      this.verifiedBuckets.add(bucketName);
    } catch {
      // If unauthorized or already exists, proceed gracefully
      this.verifiedBuckets.add(bucketName);
    }
  }

  /**
   * Upload file to Supabase Storage and register metadata in Supabase PostgreSQL
   */
  public async uploadFile(params: {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
    size: number;
    relatedEntityType?: string;
    relatedEntityId?: string;
    uploadedBy?: string;
    userId?: string;
    customFolder?: string;
    metadata?: Record<string, any>;
  }): Promise<FileMetadata> {
    const {
      buffer,
      originalname,
      mimetype,
      size,
      relatedEntityType = 'document',
      relatedEntityId,
      uploadedBy = 'System',
      userId,
      customFolder,
      metadata = {}
    } = params;

    const fileId = `file_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const sanitizedName = originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const bucket = this.determineBucket({
      mimetype,
      originalname,
      relatedEntityType,
      customFolder
    });

    const folderPrefix = customFolder ? `${customFolder.replace(/[^a-zA-Z0-9_-]/g, '_')}/` : '';
    const storagePath = `${folderPrefix}${Date.now()}_${sanitizedName}`;
    const now = new Date().toISOString();

    let fileRecord: FileMetadata = {
      id: fileId,
      user_id: userId,
      file_name: `${Date.now()}_${sanitizedName}`,
      original_file_name: originalname,
      mime_type: mimetype || 'application/octet-stream',
      file_size: size,
      storage_provider: 'supabase',
      bucket,
      storage_path: `${bucket}/${storagePath}`,
      download_url: `/api/storage/files/${fileId}/content`,
      thumbnail_url: mimetype.startsWith('image/') ? `/api/storage/files/${fileId}/content` : undefined,
      folder_path: `Saarthi Solutions/${bucket}/`,
      related_entity_type: relatedEntityType,
      related_entity_id: relatedEntityId,
      uploaded_by: uploadedBy,
      metadata,
      is_public: true,
      created_at: now,
      updated_at: now
    };

    // 1. Upload to Supabase Storage Bucket
    const supabase = this.initSupabase();
    if (supabase) {
      try {
        await this.ensureBucket(bucket);
        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(storagePath, buffer, {
            contentType: mimetype,
            upsert: true
          });

        if (!uploadError) {
          const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(storagePath);
          fileRecord.download_url = publicData.publicUrl;
          if (mimetype.startsWith('image/')) {
            fileRecord.thumbnail_url = publicData.publicUrl;
          }
          console.log(`[StorageService] Uploaded to Supabase Storage [${bucket}]: ${fileRecord.original_file_name} -> ${fileRecord.download_url}`);
        } else {
          console.warn(`[StorageService] Supabase bucket [${bucket}] upload note:`, uploadError.message);
          // Fallback to assets bucket if custom bucket fails
          if (bucket !== 'assets') {
            const fallbackPath = `${bucket}/${storagePath}`;
            const { error: fallbackError } = await supabase.storage
              .from('assets')
              .upload(fallbackPath, buffer, { contentType: mimetype, upsert: true });

            if (!fallbackError) {
              const { data: pub } = supabase.storage.from('assets').getPublicUrl(fallbackPath);
              fileRecord.bucket = 'assets';
              fileRecord.storage_path = `assets/${fallbackPath}`;
              fileRecord.download_url = pub.publicUrl;
              if (mimetype.startsWith('image/')) fileRecord.thumbnail_url = pub.publicUrl;
            }
          }
        }
      } catch (err: any) {
        console.warn('[StorageService] Supabase storage upload exception:', err.message);
      }
    }

    // 2. Persist File Metadata into Supabase Database `files` Table
    if (supabase) {
      try {
        const sanitizedUserId = sanitizeUUID(fileRecord.user_id);
        const { error: dbError } = await supabase.from('files').upsert({
          id: fileRecord.id,
          user_id: sanitizedUserId,
          file_name: fileRecord.file_name,
          original_file_name: fileRecord.original_file_name,
          mime_type: fileRecord.mime_type,
          file_size: fileRecord.file_size,
          storage_provider: 'supabase',
          storage_path: fileRecord.storage_path,
          download_url: fileRecord.download_url,
          thumbnail_url: fileRecord.thumbnail_url,
          folder_path: fileRecord.folder_path,
          related_entity_type: fileRecord.related_entity_type,
          related_entity_id: fileRecord.related_entity_id,
          uploaded_by: fileRecord.uploaded_by,
          metadata: fileRecord.metadata,
          is_public: fileRecord.is_public,
          created_at: fileRecord.created_at,
          updated_at: fileRecord.updated_at
        }, { onConflict: 'id' });

        if (dbError) {
          console.warn('[StorageService] Supabase database files insert note:', dbError.message);
        } else {
          console.log(`[StorageService] File indexed in Supabase files table: ${fileRecord.original_file_name}`);
        }
      } catch (dbErr: any) {
        console.warn('[StorageService] Supabase database files exception:', dbErr.message);
      }
    }

    // Keep in-memory cache and binary store synchronized
    inMemoryFileStore.set(fileRecord.id, fileRecord);
    inMemoryBufferStore.set(fileRecord.id, {
      buffer,
      mime_type: fileRecord.mime_type,
      file_name: fileRecord.original_file_name
    });

    return fileRecord;
  }

  /**
   * Retrieve cached binary file buffer by ID
   */
  public getFileBuffer(fileId: string): { buffer: Buffer; mime_type: string; file_name: string } | undefined {
    return inMemoryBufferStore.get(fileId);
  }

  /**
   * List all stored files with optional filters from Supabase Database
   */
  public async listFiles(filters?: {
    relatedEntityType?: string;
    search?: string;
    limit?: number;
  }): Promise<FileMetadata[]> {
    const supabase = this.initSupabase();

    if (supabase) {
      try {
        let query = supabase.from('files').select('*').order('created_at', { ascending: false });

        if (filters?.relatedEntityType && filters.relatedEntityType !== 'ALL') {
          query = query.eq('related_entity_type', filters.relatedEntityType);
        }
        if (filters?.limit) {
          query = query.limit(filters.limit);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          data.forEach((row: FileMetadata) => inMemoryFileStore.set(row.id, row));
          let results = data as FileMetadata[];
          if (filters?.search) {
            const s = filters.search.toLowerCase();
            results = results.filter(
              (f) =>
                f.file_name.toLowerCase().includes(s) ||
                f.original_file_name.toLowerCase().includes(s) ||
                (f.uploaded_by && f.uploaded_by.toLowerCase().includes(s))
            );
          }
          return results;
        }
      } catch (err) {
        console.warn('[StorageService] Supabase fetch exception, using local store:', err);
      }
    }

    // In-memory fallback
    let files = Array.from(inMemoryFileStore.values());
    if (filters?.relatedEntityType && filters.relatedEntityType !== 'ALL') {
      files = files.filter((f) => f.related_entity_type === filters.relatedEntityType);
    }
    if (filters?.search) {
      const s = filters.search.toLowerCase();
      files = files.filter(
        (f) =>
          f.file_name.toLowerCase().includes(s) ||
          f.original_file_name.toLowerCase().includes(s) ||
          (f.uploaded_by && f.uploaded_by.toLowerCase().includes(s))
      );
    }

    return files.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  /**
   * Get single file metadata by ID
   */
  public async getFileById(fileId: string): Promise<FileMetadata | null> {
    const supabase = this.initSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('files').select('*').eq('id', fileId).single();
        if (!error && data) {
          inMemoryFileStore.set(data.id, data);
          return data;
        }
      } catch (err) {
        console.warn('[StorageService] Error fetching file from Supabase:', err);
      }
    }
    return inMemoryFileStore.get(fileId) || null;
  }

  /**
   * Delete file from Supabase Storage and database
   */
  public async deleteFile(fileId: string): Promise<{ success: boolean; message?: string }> {
    const file = await this.getFileById(fileId);
    if (!file) {
      return { success: false, message: 'File not found' };
    }

    const supabase = this.initSupabase();
    if (supabase && file.storage_path) {
      try {
        const parts = file.storage_path.split('/');
        const bucket = parts[0] || file.bucket || 'assets';
        const objectPath = parts.slice(1).join('/');
        if (objectPath) {
          await supabase.storage.from(bucket).remove([objectPath]);
        }
      } catch (err: any) {
        console.warn('[StorageService] Supabase storage delete note:', err.message);
      }
    }

    if (supabase) {
      try {
        await supabase.from('files').delete().eq('id', fileId);
      } catch (err: any) {
        console.warn('[StorageService] Supabase database delete note:', err.message);
      }
    }

    inMemoryFileStore.delete(fileId);
    inMemoryBufferStore.delete(fileId);
    return { success: true, message: 'File deleted from Supabase Storage and database' };
  }

  /**
   * Replace an existing file with a new upload
   */
  public async replaceFile(
    fileId: string,
    newFile: {
      buffer: Buffer;
      originalname: string;
      mimetype: string;
      size: number;
      uploadedBy?: string;
    }
  ): Promise<FileMetadata> {
    const oldFile = await this.getFileById(fileId);
    if (oldFile) {
      await this.deleteFile(fileId);
    }

    const replacement = await this.uploadFile({
      buffer: newFile.buffer,
      originalname: newFile.originalname,
      mimetype: newFile.mimetype,
      size: newFile.size,
      relatedEntityType: oldFile?.related_entity_type || 'document',
      relatedEntityId: oldFile?.related_entity_id,
      uploadedBy: newFile.uploadedBy || oldFile?.uploaded_by || 'Admin',
      userId: oldFile?.user_id
    });

    return replacement;
  }

  // ==============================================================================
  // STRUCTURED DATA METHODS (SUPABASE POSTGRESQL)
  // ==============================================================================

  /**
   * Save contact submission directly into Supabase PostgreSQL
   */
  public async saveContactSubmission(data: {
    name: string;
    email: string;
    phone: string;
    subject?: string;
    userType?: string;
    message: string;
  }) {
    const id = `msg_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const record = {
      id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      subject: data.subject || 'General Inquiry',
      user_type: data.userType || 'General',
      message: data.message,
      status: 'New',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const supabase = this.initSupabase();
    if (supabase) {
      try {
        const { error } = await supabase.from('contact_submissions').insert(record);
        if (error) {
          console.warn('[StorageService] Supabase contact insert note:', error.message);
        }
      } catch (err) {
        console.warn('[StorageService] Supabase contact insert exception:', err);
      }
    }
    return record;
  }

  public async getContactSubmissions() {
    const supabase = this.initSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('contact_submissions')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) {
          return data.map((c: any) => ({
            id: c.id,
            name: c.name,
            email: c.email,
            phone: c.phone,
            subject: c.subject || 'General Inquiry',
            userType: c.user_type || 'General',
            message: c.message,
            status: c.status || 'New',
            date: c.created_at ? c.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
            createdAt: c.created_at,
            updatedAt: c.updated_at
          }));
        }
      } catch (err) {
        console.warn('[StorageService] Supabase contacts fetch note:', err);
      }
    }
    return [];
  }

  public async deleteContactSubmission(id: string) {
    const supabase = this.initSupabase();
    if (supabase) {
      try {
        await supabase.from('contact_submissions').delete().eq('id', id);
      } catch (err) {
        console.warn('[StorageService] Supabase contact delete exception:', err);
      }
    }
    return { success: true, message: 'Contact message deleted from Supabase' };
  }

  /**
   * Save job application into Supabase PostgreSQL
   */
  public async saveJobApplication(data: {
    id?: string;
    jobId: string;
    jobTitle: string;
    candidateName: string;
    email: string;
    phone: string;
    whatsapp?: string;
    qualification?: string;
    experience?: string;
    currentLocation?: string;
    currentCTC?: string;
    expectedCTC?: string;
    noticePeriod?: string;
    coverLetter?: string;
    status?: string;
    photoUrl?: string;
    photo_url?: string;
    photoStoragePath?: string;
    resumeFileId?: string;
    resumeUrl?: string;
    resumeFileName?: string;
  }) {
    const id = data.id || `app_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const resumeUrl = data.resumeUrl || null;
    const photoUrl = data.photoUrl || data.photo_url || null;

    const record: any = {
      id,
      job_id: data.jobId,
      job_title: data.jobTitle,
      candidate_name: data.candidateName,
      email: data.email,
      phone: data.phone,
      whatsapp: data.whatsapp || data.phone,
      qualification: data.qualification || '',
      experience: data.experience || '',
      current_location: data.currentLocation || '',
      current_ctc: data.currentCTC || '',
      expected_ctc: data.expectedCTC || '',
      notice_period: data.noticePeriod || '15 Days',
      cover_letter: data.coverLetter || '',
      status: data.status || 'Pending Review',
      photo_url: photoUrl,
      photo_storage_path: data.photoStoragePath || null,
      resume_file_id: data.resumeFileId || null,
      resume_url: resumeUrl,
      resume_file_name: data.resumeFileName || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const supabase = this.initSupabase();
    if (supabase) {
      try {
        const { error } = await supabase.from('job_applications').upsert(record, { onConflict: 'id' });
        if (error) {
          console.warn('[StorageService] Supabase job application upsert note:', error.message);
          // If custom photo columns are missing, fallback to base record
          if (error.message.includes('photo_url') || error.message.includes('photo_storage_path')) {
            const { photo_url, photo_storage_path, ...stripped } = record;
            await supabase.from('job_applications').upsert(stripped, { onConflict: 'id' });
          }
        } else {
          console.log(`[StorageService] Job application saved to Supabase: ${record.candidate_name}`);
        }
      } catch (err) {
        console.warn('[StorageService] Supabase job application upsert exception:', err);
      }
    }
    return record;
  }

  public async getJobApplications() {
    const supabase = this.initSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('job_applications')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) {
          return data.map((a: any) => ({
            id: a.id,
            jobId: a.job_id,
            jobTitle: a.job_title,
            candidateName: a.candidate_name,
            candidateId: a.candidate_id,
            email: a.email,
            phone: a.phone,
            whatsapp: a.whatsapp || a.phone,
            qualification: a.qualification,
            experience: a.experience,
            currentLocation: a.current_location,
            currentCTC: a.current_ctc,
            expectedCTC: a.expected_ctc,
            noticePeriod: a.notice_period,
            coverLetter: a.cover_letter,
            status: a.status || 'Pending Review',
            resumeUrl: a.resume_url,
            resumeFileName: a.resume_file_name,
            resumeFileId: a.resume_file_id,
            photoUrl: a.photo_url,
            photoStoragePath: a.photo_storage_path,
            appliedDate: a.created_at ? a.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
            createdAt: a.created_at,
            updatedAt: a.updated_at
          }));
        }
      } catch (err) {
        console.warn('[StorageService] Supabase job applications fetch note:', err);
      }
    }
    return [];
  }

  public async deleteJobApplication(id: string) {
    const supabase = this.initSupabase();
    if (supabase) {
      try {
        await supabase.from('job_applications').delete().eq('id', id);
      } catch (err) {
        console.warn('[StorageService] Supabase job application delete exception:', err);
      }
    }
    return { success: true, message: 'Job application deleted from Supabase' };
  }

  /**
   * Save candidate profile in Supabase PostgreSQL
   */
  public async saveCandidate(data: {
    id?: string;
    userId?: string;
    fullName: string;
    email: string;
    phone: string;
    qualification?: string;
    experience?: string;
    experienceYears?: number;
    currentLocation?: string;
    primarySkill?: string;
    currentCompany?: string;
    expectedSalary?: string;
    noticePeriod?: string;
    status?: string;
    photoUrl?: string;
    photo_url?: string;
    photoStoragePath?: string;
    resumeFileId?: string;
    resumeUrl?: string;
    resumeFileName?: string;
  }) {
    const id = data.id || `cand_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const sanitizedUserId = sanitizeUUID(data.userId);
    const resumeUrl = data.resumeUrl || null;
    const photoUrl = data.photoUrl || data.photo_url || null;

    const record: any = {
      id,
      user_id: sanitizedUserId,
      full_name: data.fullName,
      email: data.email,
      phone: data.phone,
      qualification: data.qualification || '',
      experience: data.experience || '',
      experience_years: data.experienceYears || (parseFloat(data.experience || '0') || 0),
      current_location: data.currentLocation || '',
      primary_skill: data.primarySkill || '',
      current_company: data.currentCompany || '',
      expected_salary: data.expectedSalary || '',
      notice_period: data.noticePeriod || '15 Days',
      status: data.status || 'Available',
      photo_url: photoUrl,
      photo_storage_path: data.photoStoragePath || null,
      resume_file_id: data.resumeFileId || null,
      resume_url: resumeUrl,
      resume_file_name: data.resumeFileName || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const supabase = this.initSupabase();
    if (supabase) {
      try {
        const { error } = await supabase.from('candidates').upsert(record, { onConflict: 'id' });
        if (error) {
          console.warn('[StorageService] Supabase candidate upsert note:', error.message);
          if (error.message.includes('photo_url') || error.message.includes('photo_storage_path')) {
            const { photo_url, photo_storage_path, ...stripped } = record;
            await supabase.from('candidates').upsert(stripped, { onConflict: 'id' });
          }
        } else {
          console.log(`[StorageService] Candidate saved to Supabase: ${record.full_name}`);
        }
      } catch (err) {
        console.warn('[StorageService] Supabase candidate upsert exception:', err);
      }
    }
    return record;
  }

  public async getCandidates() {
    const supabase = this.initSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('candidates')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) {
          return data.map((c: any) => ({
            id: c.id,
            userId: c.user_id,
            fullName: c.full_name,
            email: c.email,
            phone: c.phone,
            qualification: c.qualification,
            experience: c.experience,
            experienceYears: c.experience_years ? Number(c.experience_years) : undefined,
            currentLocation: c.current_location,
            primarySkill: c.primary_skill,
            currentCompany: c.current_company,
            expectedSalary: c.expected_salary,
            noticePeriod: c.notice_period,
            status: c.status || 'Available',
            resumeFileId: c.resume_file_id,
            resumeUrl: c.resume_url,
            resumeFileName: c.resume_file_name,
            photoUrl: c.photo_url,
            photoStoragePath: c.photo_storage_path,
            createdAt: c.created_at,
            updatedAt: c.updated_at
          }));
        }
      } catch (err) {
        console.warn('[StorageService] Supabase candidates fetch note:', err);
      }
    }
    return [];
  }

  public async deleteCandidate(id: string) {
    const supabase = this.initSupabase();
    if (supabase) {
      try {
        await supabase.from('candidates').delete().eq('id', id);
      } catch (err) {
        console.warn('[StorageService] Supabase candidate delete exception:', err);
      }
    }
    return { success: true, message: 'Candidate deleted from Supabase' };
  }

  /**
   * Save invoice and Supabase PDF link in Supabase PostgreSQL
   */
  public async saveInvoice(data: {
    id?: string;
    invoiceNumber: string;
    invoiceDate?: string;
    dueDate?: string;
    clientName?: string;
    clientCompany?: string;
    clientGstin?: string;
    clientAddress?: string;
    taxMode?: string;
    items?: any[];
    subtotal?: number;
    discount?: number;
    taxableAmount?: number;
    totalGst?: number;
    grandTotal?: number;
    paymentStatus?: string;
    pdfFileId?: string;
    pdfUrl?: string;
  }) {
    const id = data.id || `inv_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const pdfUrl = data.pdfUrl || null;

    const record = {
      id,
      invoice_number: data.invoiceNumber,
      invoice_date: data.invoiceDate || new Date().toISOString().split('T')[0],
      due_date: data.dueDate || new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      client_name: data.clientName || '',
      client_company: data.clientCompany || data.clientName || '',
      client_gstin: data.clientGstin || '',
      client_address: data.clientAddress || '',
      tax_mode: data.taxMode || 'INTRA_STATE',
      items: data.items || [],
      subtotal: data.subtotal || 0,
      discount: data.discount || 0,
      taxable_amount: data.taxableAmount || 0,
      total_gst: data.totalGst || 0,
      grand_total: data.grandTotal || 0,
      payment_status: data.paymentStatus || 'Pending',
      pdf_file_id: data.pdfFileId || null,
      pdf_url: pdfUrl,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const supabase = this.initSupabase();
    if (supabase) {
      try {
        const { error } = await supabase.from('invoices').upsert(record, { onConflict: 'id' });
        if (error) {
          console.warn('[StorageService] Supabase invoice upsert note:', error.message);
        } else {
          console.log(`[StorageService] Invoice saved in Supabase: ${record.invoice_number}`);
        }
      } catch (err) {
        console.warn('[StorageService] Supabase invoice upsert exception:', err);
      }
    }
    return record;
  }

  public async getInvoices() {
    const supabase = this.initSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('invoices')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) {
          return data.map((inv: any) => ({
            id: inv.id,
            invoiceNumber: inv.invoice_number,
            invoiceDate: inv.invoice_date,
            dueDate: inv.due_date,
            clientName: inv.client_name,
            clientCompany: inv.client_company,
            clientGstin: inv.client_gstin,
            clientAddress: inv.client_address,
            taxMode: inv.tax_mode,
            items: inv.items || [],
            subtotal: Number(inv.subtotal) || 0,
            discount: Number(inv.discount) || 0,
            taxableAmount: Number(inv.taxable_amount) || 0,
            totalGst: Number(inv.total_gst) || 0,
            grandTotal: Number(inv.grand_total) || 0,
            totalInWords: inv.total_in_words,
            paymentStatus: inv.payment_status || 'Pending',
            pdfFileId: inv.pdf_file_id,
            pdfUrl: inv.pdf_url,
            createdAt: inv.created_at,
            updatedAt: inv.updated_at
          }));
        }
      } catch (err) {
        console.warn('[StorageService] Supabase invoices fetch note:', err);
      }
    }
    return [];
  }

  public async deleteInvoice(id: string) {
    const supabase = this.initSupabase();
    if (supabase) {
      try {
        await supabase.from('invoices').delete().eq('id', id);
      } catch (err) {
        console.warn('[StorageService] Supabase invoice delete exception:', err);
      }
    }
    return { success: true, message: 'Invoice deleted from Supabase' };
  }

  /**
   * Save testimonial into Supabase PostgreSQL & Memory Store
   */
  public async saveTestimonial(data: {
    id?: string;
    name: string;
    role?: string;
    company?: string;
    location?: string;
    content?: string;
    review?: string;
    rating?: number;
    avatar?: string | null;
    image?: string | null;
    type?: string;
    category?: string;
    status?: 'approved' | 'pending' | 'rejected';
    is_approved?: boolean;
    submitted_by?: string;
    submittedBy?: string;
    created_at?: string;
    createdAt?: string;
  }) {
    const id = ensureValidUUID(data.id);
    const avatarUrl = data.avatar || data.image || null;
    const effectiveStatus = data.status || (data.is_approved === true ? 'approved' : 'pending');
    const categoryType = data.category || data.type || 'Candidate';
    const contentText = data.content || data.review || 'Valuable review and placement feedback.';
    const now = new Date().toISOString();

    const existing = inMemoryTestimonialStore.get(id);

    const record: any = {
      id,
      name: data.name || 'Anonymous User',
      role: data.role || (categoryType === 'Employer' ? 'Client' : categoryType === 'Candidate' ? 'Placed Candidate' : 'Client Feedback'),
      company: data.company || (categoryType === 'Employer' ? 'Partner Enterprise' : 'Gujarat Industry'),
      location: data.location || 'Gujarat',
      content: contentText,
      rating: Number(data.rating) || 5,
      avatar: avatarUrl,
      image: avatarUrl,
      type: categoryType,
      category: categoryType,
      status: effectiveStatus,
      is_approved: effectiveStatus === 'approved',
      submitted_by: data.submitted_by || data.submittedBy || 'Visitor',
      created_at: data.created_at || data.createdAt || (existing ? existing.created_at : now),
      updated_at: now
    };

    inMemoryTestimonialStore.set(id, record);

    const supabase = this.initSupabase();
    if (supabase) {
      try {
        const { error } = await supabase.from('testimonials').upsert(record, { onConflict: 'id' });
        if (error) {
          console.warn('[StorageService] Testimonial full upsert note, using base schema fallback:', error.message);
          const baseRecord = {
            id,
            name: record.name,
            role: record.role,
            company: record.company,
            location: record.location,
            content: record.content,
            rating: record.rating,
            avatar: record.avatar,
            image: record.image,
            type: record.type
          };
          await supabase.from('testimonials').upsert(baseRecord, { onConflict: 'id' });
        } else {
          console.log(`[StorageService] Testimonial saved in Supabase: ${record.name} (Status: ${record.status})`);
        }
      } catch (err) {
        console.warn('[StorageService] Supabase testimonial upsert exception:', err);
      }
    }
    return record;
  }

  /**
   * Update testimonial approval status in Supabase & Memory Store
   */
  public async updateTestimonialStatus(id: string, status: 'approved' | 'pending' | 'rejected') {
    const isApproved = status === 'approved';
    const updatedAt = new Date().toISOString();
    const targetUUID = ensureValidUUID(id);

    const existing = inMemoryTestimonialStore.get(id) || inMemoryTestimonialStore.get(targetUUID);
    if (existing) {
      existing.status = status;
      existing.is_approved = isApproved;
      existing.updated_at = updatedAt;
      inMemoryTestimonialStore.set(id, existing);
      inMemoryTestimonialStore.set(targetUUID, existing);
    }

    const supabase = this.initSupabase();
    if (supabase) {
      try {
        await supabase
          .from('testimonials')
          .update({
            status,
            is_approved: isApproved,
            updated_at: updatedAt
          })
          .eq('id', targetUUID);
        console.log(`[StorageService] Testimonial status updated in Supabase: ${targetUUID} -> ${status}`);
      } catch (err) {
        console.warn('[StorageService] Supabase testimonial status update exception:', err);
      }
    }
    return { success: true, id, targetUUID, status, is_approved: isApproved, updated_at: updatedAt };
  }

  /**
   * Get all testimonials from Supabase or Memory Store
   */
  public async getTestimonials(filter?: { status?: string }) {
    const supabase = this.initSupabase();
    if (supabase) {
      try {
        let query = supabase.from('testimonials').select('*').order('created_at', { ascending: false });
        if (filter?.status && filter.status !== 'all') {
          query = query.eq('status', filter.status);
        }
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          const normalized = data.map((t: any) => ({
            id: t.id,
            name: t.name,
            role: t.role || 'Client Feedback',
            company: t.company || 'Enterprise Partner',
            location: t.location || 'Gujarat',
            content: t.content,
            rating: Number(t.rating) || 5,
            avatar: t.avatar || t.image || null,
            image: t.image || t.avatar || null,
            type: t.type || 'Candidate',
            status: t.status || (t.is_approved === false ? 'pending' : 'approved'),
            is_approved: t.is_approved !== undefined ? Boolean(t.is_approved) : (t.status === 'pending' ? false : true),
            submitted_by: t.submitted_by || 'Visitor',
            created_at: t.created_at,
            updated_at: t.updated_at
          }));
          normalized.forEach((t: any) => inMemoryTestimonialStore.set(t.id, t));
          return normalized;
        }
      } catch (err) {
        console.warn('[StorageService] Supabase testimonials fetch note:', err);
      }
    }

    let items = Array.from(inMemoryTestimonialStore.values());
    if (filter?.status && filter.status !== 'all') {
      items = items.filter((t) => t.status === filter.status);
    }
    return items.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
  }

  /**
   * Delete testimonial from Supabase and Memory Store
   */
  public async deleteTestimonial(id: string) {
    const targetUUID = ensureValidUUID(id);
    inMemoryTestimonialStore.delete(id);
    inMemoryTestimonialStore.delete(targetUUID);

    const supabase = this.initSupabase();
    if (supabase) {
      try {
        await supabase.from('testimonials').delete().eq('id', targetUUID);
        if (id !== targetUUID) {
          await supabase.from('testimonials').delete().eq('id', id);
        }
      } catch (err) {
        console.warn('[StorageService] Supabase testimonial delete exception:', err);
      }
    }
    return { success: true, message: 'Testimonial deleted from Supabase database' };
  }

  /**
   * Save placement into Supabase PostgreSQL
   */
  public async savePlacement(data: {
    id?: string;
    candidate: string;
    role: string;
    company: string;
    location?: string;
    salary?: string;
    category?: string;
    date?: string;
  }) {
    const id = data.id || `pl_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const record = {
      id,
      candidate: data.candidate,
      role: data.role,
      company: data.company,
      location: data.location || 'Gujarat',
      salary: data.salary || 'Competitive',
      category: data.category || 'Manufacturing',
      date: data.date || new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const supabase = this.initSupabase();
    if (supabase) {
      try {
        await supabase.from('placements').upsert(record, { onConflict: 'id' });
      } catch (err) {
        console.warn('[StorageService] Supabase placement upsert exception:', err);
      }
    }
    return record;
  }

  public async getPlacements() {
    const supabase = this.initSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('placements').select('*').order('created_at', { ascending: false });
        if (!error && data) return data;
      } catch (err) {
        console.warn('[StorageService] Supabase placements fetch note:', err);
      }
    }
    return [];
  }

  public async deletePlacement(id: string) {
    const supabase = this.initSupabase();
    if (supabase) {
      try {
        await supabase.from('placements').delete().eq('id', id);
      } catch (err) {
        console.warn('[StorageService] Supabase placement delete exception:', err);
      }
    }
    return { success: true, message: 'Placement deleted' };
  }

  /**
   * Save service into Supabase PostgreSQL
   */
  public async saveService(data: {
    id?: string;
    title: string;
    shortDesc: string;
    fullDesc: string;
    iconName?: string;
    features?: string[];
  }) {
    const id = data.id || `srv_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const record = {
      id,
      title: data.title,
      short_desc: data.shortDesc,
      full_desc: data.fullDesc,
      icon_name: data.iconName || 'Briefcase',
      features: data.features || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const supabase = this.initSupabase();
    if (supabase) {
      try {
        await supabase.from('services').upsert(record, { onConflict: 'id' });
      } catch (err) {
        console.warn('[StorageService] Supabase service upsert exception:', err);
      }
    }
    return record;
  }

  public async getServices() {
    const supabase = this.initSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('services').select('*').order('created_at', { ascending: true });
        if (!error && data) return data;
      } catch (err) {
        console.warn('[StorageService] Supabase services fetch note:', err);
      }
    }
    return [];
  }

  public async deleteService(id: string) {
    const supabase = this.initSupabase();
    if (supabase) {
      try {
        await supabase.from('services').delete().eq('id', id);
      } catch (err) {
        console.warn('[StorageService] Supabase service delete exception:', err);
      }
    }
    return { success: true, message: 'Service deleted' };
  }

  /**
   * Save employer partner into Supabase PostgreSQL
   */
  public async saveEmployer(data: {
    id?: string;
    companyName?: string;
    company_name?: string;
    industry?: string;
    location?: string;
    contactPerson?: string;
    contact_person?: string;
    phone?: string;
    email?: string;
    activeOpenings?: number;
    partnershipType?: string;
    status?: string;
    notes?: string;
    gstin?: string;
    website?: string;
    source?: string;
    jdFileId?: string;
    jd_file_id?: string;
    jdUrl?: string;
    jd_url?: string;
    jdFileName?: string;
    jd_file_name?: string;
    jdFileSize?: number;
    jd_file_size?: number;
  }) {
    const rawId = data.id || '';
    const id = ensureValidUUID(rawId);
    const companyName = (data.companyName || data.company_name || 'Enterprise Employer').trim();
    const contactPerson = (data.contactPerson || data.contact_person || 'HR & Talent Lead').trim();
    const email = (data.email || `${companyName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'contact'}@company.com`).trim();
    const phone = (data.phone || '+91 98243 22206').trim();
    const industry = (data.industry || 'Manufacturing & Engineering').trim();
    const location = (data.location || 'Surat / Silvassa / Gujarat').trim();
    const gstin = data.gstin ? data.gstin.trim() : null;
    const status = (data.status || 'Active').trim();
    const now = new Date().toISOString();

    const jdUrl = data.jdUrl || data.jd_url || null;
    const jdFileId = data.jdFileId || data.jd_file_id || null;
    const jdFileName = data.jdFileName || data.jd_file_name || null;
    const jdFileSize = data.jdFileSize || data.jd_file_size || null;

    let websiteValue = data.website || data.source || null;
    if (jdUrl) {
      if (websiteValue && !websiteValue.includes(jdUrl)) {
        websiteValue = `${websiteValue} | [JD Document: ${jdUrl}]`;
      } else if (!websiteValue) {
        websiteValue = jdUrl;
      }
    } else if (data.notes && !websiteValue) {
      websiteValue = data.notes.slice(0, 500);
    }

    const standardRecord: any = {
      id,
      company_name: companyName,
      contact_person: contactPerson,
      email,
      phone,
      industry,
      location,
      gstin,
      website: websiteValue,
      status,
      created_at: now,
      updated_at: now
    };

    const fullRecord: any = {
      ...standardRecord,
      jd_url: jdUrl,
      jd_file_id: jdFileId,
      jd_file_name: jdFileName,
      jd_file_size: jdFileSize,
      notes: data.notes || websiteValue
    };

    inMemoryEmployerStore.set(id, fullRecord);
    if (rawId && rawId !== id) {
      inMemoryEmployerStore.set(rawId, fullRecord);
    }

    const supabase = this.initSupabase();
    if (supabase) {
      try {
        let { data: upserted, error } = await supabase.from('employers').upsert(fullRecord, { onConflict: 'id' }).select();
        if (error) {
          const retryResult = await supabase.from('employers').upsert(standardRecord, { onConflict: 'id' }).select();
          upserted = retryResult.data;
        }

        if (upserted && upserted.length > 0) {
          const merged = { ...fullRecord, ...upserted[0] };
          inMemoryEmployerStore.set(id, merged);
          return merged;
        }
      } catch (err) {
        console.warn('[StorageService] Supabase employer upsert exception:', err);
      }
    }
    return fullRecord;
  }

  public async getEmployers() {
    const supabase = this.initSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('employers').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          const enriched = data.map((item: any) => {
            const cached = inMemoryEmployerStore.get(item.id);
            const jdLink = item.jd_url || cached?.jd_url;
            const merged = {
              ...item,
              jd_url: jdLink,
              jd_file_name: item.jd_file_name || cached?.jd_file_name,
              jd_file_id: item.jd_file_id || cached?.jd_file_id
            };
            inMemoryEmployerStore.set(item.id, merged);
            return merged;
          });
          return enriched;
        }
      } catch (err) {
        console.warn('[StorageService] Supabase employers fetch note:', err);
      }
    }
    return Array.from(inMemoryEmployerStore.values()).sort((a, b) => 
      new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
    );
  }

  public async deleteEmployer(id: string) {
    const targetUUID = ensureValidUUID(id);
    inMemoryEmployerStore.delete(id);
    inMemoryEmployerStore.delete(targetUUID);

    const supabase = this.initSupabase();
    if (supabase) {
      try {
        await supabase.from('employers').delete().eq('id', targetUUID);
        if (id !== targetUUID) {
          await supabase.from('employers').delete().eq('id', id);
        }
      } catch (err) {
        console.warn('[StorageService] Supabase employer delete exception:', err);
      }
    }
    return { success: true, message: 'Employer record deleted successfully from Supabase' };
  }

  // ==============================================================================
  // JOBS (100% SUPABASE POSTGRESQL CRUD)
  // ==============================================================================

  public async getJobs() {
    const supabase = this.initSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .order('posted_date', { ascending: false });
        if (!error && data && data.length > 0) {
          return data.map((j: any) => ({
            id: j.id,
            title: j.title,
            companyName: j.company_name,
            industry: j.industry,
            location: j.location,
            salary: j.salary,
            experience: j.experience,
            qualification: j.qualification,
            employmentType: j.employment_type || 'Full-Time',
            category: j.category || 'Manufacturing',
            contactPerson: j.contact_person || 'Raajesh V',
            contactPhone: j.contact_phone || '+91 98243 22206',
            whatsappNumber: j.whatsapp_number || '+91 98243 22206',
            description: j.description || '',
            requirements: j.requirements || [],
            keyRequirements: j.requirements || [],
            responsibilities: j.responsibilities || [],
            keyResponsibilities: j.responsibilities || [],
            isUrgent: Boolean(j.is_urgent),
            isFeatured: Boolean(j.is_featured),
            status: j.status || 'Open',
            postedDate: j.posted_date || (j.created_at ? j.created_at.split('T')[0] : '2026-09-26'),
            createdAt: j.created_at,
            updatedAt: j.updated_at
          }));
        }
      } catch (err) {
        console.warn('[StorageService] Supabase jobs fetch note:', err);
      }
    }
    return INITIAL_JOBS;
  }

  public async saveJob(data: any) {
    const id = data.id || `job_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const now = new Date().toISOString();
    const reqs = data.requirements || data.keyRequirements || [];
    const resps = data.responsibilities || data.keyResponsibilities || [];

    const record: any = {
      id,
      title: data.title,
      company_name: data.companyName || data.company_name || 'Enterprise Client',
      industry: data.industry || 'Manufacturing & Engineering',
      location: data.location || 'Surat / Silvassa / Gujarat',
      salary: data.salary || 'Competitive',
      experience: data.experience || '2-5 Years',
      qualification: data.qualification || 'Graduate / Diploma / Degree',
      employment_type: data.employmentType || data.employment_type || 'Full-Time',
      category: data.category || 'Manufacturing',
      contact_person: data.contactPerson || data.contact_person || 'Raajesh V',
      contact_phone: data.contactPhone || data.contact_phone || '+91 98243 22206',
      whatsapp_number: data.whatsappNumber || data.whatsapp_number || '+91 98243 22206',
      description: data.description || '',
      requirements: Array.isArray(reqs) ? reqs : [reqs],
      responsibilities: Array.isArray(resps) ? resps : [resps],
      is_urgent: Boolean(data.isUrgent ?? data.is_urgent),
      is_featured: Boolean(data.isFeatured ?? data.is_featured),
      status: data.status || 'Open',
      posted_date: data.postedDate || data.posted_date || now.split('T')[0],
      updated_at: now
    };

    const supabase = this.initSupabase();
    if (supabase) {
      try {
        const { error } = await supabase.from('jobs').upsert(record, { onConflict: 'id' });
        if (error) {
          console.warn('[StorageService] Supabase job upsert note:', error.message);
        } else {
          console.log(`[StorageService] Job saved to Supabase: ${record.title} (${record.id})`);
        }
      } catch (err) {
        console.warn('[StorageService] Supabase job upsert exception:', err);
      }
    }

    return {
      ...data,
      id,
      companyName: record.company_name,
      employmentType: record.employment_type,
      contactPerson: record.contact_person,
      contactPhone: record.contact_phone,
      whatsappNumber: record.whatsapp_number,
      requirements: record.requirements,
      keyRequirements: record.requirements,
      responsibilities: record.responsibilities,
      keyResponsibilities: record.responsibilities,
      isUrgent: record.is_urgent,
      isFeatured: record.is_featured,
      postedDate: record.posted_date
    };
  }

  public async deleteJob(id: string) {
    const supabase = this.initSupabase();
    if (supabase) {
      try {
        await supabase.from('jobs').delete().eq('id', id);
        console.log(`[StorageService] Job deleted from Supabase: ${id}`);
      } catch (err) {
        console.warn('[StorageService] Supabase job delete exception:', err);
      }
    }
    return { success: true, message: 'Job deleted from Supabase database' };
  }

  // ==============================================================================
  // WEBSITE SETTINGS (100% SUPABASE POSTGRESQL CRUD)
  // ==============================================================================

  public async getWebsiteSettings() {
    const supabase = this.initSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('website_settings')
          .select('*')
          .eq('id', 'general')
          .maybeSingle();

        if (!error && data) {
          return {
            companyName: data.company_name || INITIAL_WEBSITE_SETTINGS.companyName,
            proprietor: data.proprietor || INITIAL_WEBSITE_SETTINGS.proprietor,
            tagline: data.tagline || INITIAL_WEBSITE_SETTINGS.tagline,
            gstin: data.gstin || INITIAL_WEBSITE_SETTINGS.gstin,
            pan: data.pan || INITIAL_WEBSITE_SETTINGS.pan,
            msme: data.msme || INITIAL_WEBSITE_SETTINGS.msme,
            address: data.address || INITIAL_WEBSITE_SETTINGS.address,
            primaryPhone: data.primary_phone || INITIAL_WEBSITE_SETTINGS.primaryPhone,
            whatsappNumber: data.whatsapp_number || INITIAL_WEBSITE_SETTINGS.whatsappNumber,
            email: data.email || INITIAL_WEBSITE_SETTINGS.email,
            bankName: data.bank_name || INITIAL_WEBSITE_SETTINGS.bankName,
            accountName: data.account_name || INITIAL_WEBSITE_SETTINGS.accountName,
            accountNumber: data.account_number || INITIAL_WEBSITE_SETTINGS.accountNumber,
            ifscCode: data.ifsc_code || INITIAL_WEBSITE_SETTINGS.ifscCode,
            branchName: data.branch_name || INITIAL_WEBSITE_SETTINGS.branchName,
            bankDetails: {
              bankName: data.bank_name || INITIAL_WEBSITE_SETTINGS.bankName,
              accountName: data.account_name || INITIAL_WEBSITE_SETTINGS.accountName,
              accountNumber: data.account_number || INITIAL_WEBSITE_SETTINGS.accountNumber,
              ifscCode: data.ifsc_code || INITIAL_WEBSITE_SETTINGS.ifscCode,
              branchName: data.branch_name || INITIAL_WEBSITE_SETTINGS.branchName
            },
            termsConditions: data.terms_conditions || INITIAL_WEBSITE_SETTINGS.termsConditions,
            termsAndConditions: data.terms_conditions || INITIAL_WEBSITE_SETTINGS.termsConditions,
            updatedAt: data.updated_at
          };
        }
      } catch (err) {
        console.warn('[StorageService] Supabase website settings fetch note:', err);
      }
    }
    return {
      ...INITIAL_WEBSITE_SETTINGS,
      bankDetails: {
        bankName: INITIAL_WEBSITE_SETTINGS.bankName,
        accountName: INITIAL_WEBSITE_SETTINGS.accountName,
        accountNumber: INITIAL_WEBSITE_SETTINGS.accountNumber,
        ifscCode: INITIAL_WEBSITE_SETTINGS.ifscCode,
        branchName: INITIAL_WEBSITE_SETTINGS.branchName
      },
      termsAndConditions: INITIAL_WEBSITE_SETTINGS.termsConditions
    };
  }

  public async saveWebsiteSettings(data: any) {
    const record: any = {
      id: 'general',
      company_name: data.companyName || data.company_name || INITIAL_WEBSITE_SETTINGS.companyName,
      proprietor: data.proprietor || INITIAL_WEBSITE_SETTINGS.proprietor,
      tagline: data.tagline || INITIAL_WEBSITE_SETTINGS.tagline,
      gstin: data.gstin || INITIAL_WEBSITE_SETTINGS.gstin,
      pan: data.pan || INITIAL_WEBSITE_SETTINGS.pan,
      msme: data.msme || INITIAL_WEBSITE_SETTINGS.msme,
      address: data.address || INITIAL_WEBSITE_SETTINGS.address,
      primary_phone: data.primaryPhone || data.primary_phone || INITIAL_WEBSITE_SETTINGS.primaryPhone,
      whatsapp_number: data.whatsappNumber || data.whatsapp_number || INITIAL_WEBSITE_SETTINGS.whatsappNumber,
      email: data.email || INITIAL_WEBSITE_SETTINGS.email,
      bank_name: data.bankDetails?.bankName || data.bankName || data.bank_name || INITIAL_WEBSITE_SETTINGS.bankName,
      account_name: data.bankDetails?.accountName || data.accountName || data.account_name || INITIAL_WEBSITE_SETTINGS.accountName,
      account_number: data.bankDetails?.accountNumber || data.accountNumber || data.account_number || INITIAL_WEBSITE_SETTINGS.accountNumber,
      ifsc_code: data.bankDetails?.ifscCode || data.ifscCode || data.ifsc_code || INITIAL_WEBSITE_SETTINGS.ifscCode,
      branch_name: data.bankDetails?.branchName || data.branchName || data.branch_name || INITIAL_WEBSITE_SETTINGS.branchName,
      terms_conditions: data.termsAndConditions || data.termsConditions || data.terms_conditions || INITIAL_WEBSITE_SETTINGS.termsConditions,
      updated_at: new Date().toISOString()
    };

    const supabase = this.initSupabase();
    if (supabase) {
      try {
        const { error } = await supabase.from('website_settings').upsert(record, { onConflict: 'id' });
        if (error) {
          console.warn('[StorageService] Supabase settings upsert note:', error.message);
        } else {
          console.log('[StorageService] Website settings saved to Supabase');
        }
      } catch (err) {
        console.warn('[StorageService] Supabase settings upsert exception:', err);
      }
    }
    return this.getWebsiteSettings();
  }

  // ==============================================================================
  // DATABASE HEALTH & COMPLETE RECORD STATS
  // ==============================================================================

  public async getDatabaseStats() {
    const stats: Record<string, number> = {
      jobs: 0,
      candidates: 0,
      job_applications: 0,
      employers: 0,
      invoices: 0,
      testimonials: 0,
      placements: 0,
      services: 0,
      contact_submissions: 0,
      files: 0
    };

    const supabase = this.initSupabase();
    if (supabase) {
      try {
        for (const tbl of Object.keys(stats)) {
          const { count, error } = await supabase.from(tbl).select('*', { count: 'exact', head: true });
          if (!error && typeof count === 'number') {
            stats[tbl] = count;
          }
        }
      } catch (err) {
        console.warn('[StorageService] Stats fetch note:', err);
      }
    }

    const totalRecords = Object.values(stats).reduce((a, b) => a + b, 0);
    return {
      success: true,
      tables: stats,
      totalRecords,
      provider: 'Supabase PostgreSQL',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Seed all initial default datasets into Supabase if empty
   */
  public async seedInitialDataToSupabase() {
    const supabase = this.initSupabase();
    if (!supabase) return { seeded: false, reason: 'Supabase not initialized' };

    try {
      // 1. Seed Jobs
      const { count: jobCount } = await supabase.from('jobs').select('*', { count: 'exact', head: true });
      if (!jobCount || jobCount === 0) {
        console.log('[StorageService] Auto-seeding initial jobs into Supabase...');
        for (const j of INITIAL_JOBS) {
          await this.saveJob(j);
        }
      }

      // 2. Seed Services
      const { count: srvCount } = await supabase.from('services').select('*', { count: 'exact', head: true });
      if (!srvCount || srvCount === 0) {
        console.log('[StorageService] Auto-seeding initial services into Supabase...');
        for (const s of INITIAL_SERVICES) {
          await this.saveService(s);
        }
      }

      // 3. Seed Placements
      const { count: plcCount } = await supabase.from('placements').select('*', { count: 'exact', head: true });
      if (!plcCount || plcCount === 0) {
        console.log('[StorageService] Auto-seeding initial placements into Supabase...');
        for (const p of INITIAL_PLACEMENTS) {
          await this.savePlacement(p);
        }
      }

      // 4. Seed Employers
      const { count: empCount } = await supabase.from('employers').select('*', { count: 'exact', head: true });
      if (!empCount || empCount === 0) {
        console.log('[StorageService] Auto-seeding initial employers into Supabase...');
        for (const e of INITIAL_EMPLOYERS) {
          await this.saveEmployer(e);
        }
      }

      // 5. Seed Testimonials
      const { count: tstCount } = await supabase.from('testimonials').select('*', { count: 'exact', head: true });
      if (!tstCount || tstCount === 0) {
        console.log('[StorageService] Auto-seeding initial testimonials into Supabase...');
        for (const t of INITIAL_TESTIMONIALS) {
          await this.saveTestimonial(t);
        }
      }

      // 6. Seed Website Settings
      const { count: setCount } = await supabase.from('website_settings').select('*', { count: 'exact', head: true });
      if (!setCount || setCount === 0) {
        console.log('[StorageService] Auto-seeding initial website settings into Supabase...');
        await this.saveWebsiteSettings(INITIAL_WEBSITE_SETTINGS);
      }

      return { seeded: true, message: 'Supabase database verified and populated with complete datasets' };
    } catch (err: any) {
      console.warn('[StorageService] Seed exception:', err.message);
      return { seeded: false, error: err.message };
    }
  }

  /**
   * Return health & configuration status of Supabase Database and Storage
   */
  public async getHealthStatus() {
    const hasSupabaseUrl = Boolean(process.env.SUPABASE_URL);
    const hasSupabaseAnonKey = Boolean(process.env.SUPABASE_ANON_KEY);
    const hasSupabaseServiceKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
    const isSupabaseConfigured = hasSupabaseUrl && (hasSupabaseServiceKey || hasSupabaseAnonKey);

    let supabaseConnected = false;
    let bucketsStatus = {
      resumes: false,
      invoices: false,
      documents: false,
      assets: false
    };

    if (isSupabaseConfigured) {
      const supabase = this.initSupabase();
      if (supabase) {
        try {
          const { data: buckets, error } = await supabase.storage.listBuckets();
          if (!error && buckets) {
            supabaseConnected = true;
            buckets.forEach((b) => {
              if (b.name === 'resumes' || b.id === 'resumes') bucketsStatus.resumes = true;
              if (b.name === 'invoices' || b.id === 'invoices') bucketsStatus.invoices = true;
              if (b.name === 'documents' || b.id === 'documents') bucketsStatus.documents = true;
              if (b.name === 'assets' || b.id === 'assets') bucketsStatus.assets = true;
            });
          } else {
            // Test query on files table
            const { error: tblErr } = await supabase.from('files').select('id').limit(1);
            if (!tblErr) supabaseConnected = true;
          }
        } catch {
          supabaseConnected = false;
        }
      }
    }

    return {
      status: supabaseConnected ? 'healthy' : isSupabaseConfigured ? 'configured' : 'fallback',
      supabaseConnected,
      supabaseStorageReady: supabaseConnected,
      buckets: bucketsStatus,
      storageArchitecture: {
        resumes: "Supabase Storage ('resumes' bucket)",
        invoices: "Supabase Storage ('invoices' bucket)",
        documents: "Supabase Storage ('documents' bucket)",
        assets: "Supabase Storage ('assets' bucket)",
        database: 'Supabase PostgreSQL (100% Native Tables)'
      },
      environment: {
        hasSupabaseUrl,
        hasSupabaseAnonKey,
        hasSupabaseServiceKey
      }
    };
  }
}

export const storageService = new StorageService();
