import { createClient, SupabaseClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { googleDriveService } from './googleDriveService';

export type StorageProvider = 'supabase' | 'google_drive' | 'local';

export interface FileMetadata {
  id: string;
  user_id?: string;
  file_name: string;
  original_file_name: string;
  mime_type: string;
  file_size: number;
  storage_provider: StorageProvider;
  storage_path?: string;
  google_drive_file_id?: string;
  google_drive_url?: string;
  google_drive_view_url?: string;
  download_url?: string;
  thumbnail_url?: string;
  folder_id?: string;
  folder_path?: string;
  related_entity_type?: string;
  related_entity_id?: string;
  uploaded_by?: string;
  metadata?: Record<string, any>;
  is_public?: boolean;
  created_at: string;
  updated_at: string;
}

// Fallback in-memory store for file metadata when Supabase DB is in mock/unconnected mode
const inMemoryFileStore = new Map<string, FileMetadata>();

// Seed in-memory store with initial system files
const seedInitialFiles = () => {
  const initial: FileMetadata[] = [
    {
      id: 'file-seed-001',
      file_name: 'Rajesh_Kumar_Executive_Resume_2026.pdf',
      original_file_name: 'Rajesh_Kumar_Resume_2026.pdf',
      mime_type: 'application/pdf',
      file_size: 245760, // 240 KB
      storage_provider: 'google_drive',
      google_drive_file_id: '1A2b3C4d5E6f_SampleGoogleDriveId001',
      google_drive_url: 'https://drive.google.com/file/d/1A2b3C4d5E6f_SampleGoogleDriveId001/view',
      google_drive_view_url: 'https://drive.google.com/file/d/1A2b3C4d5E6f_SampleGoogleDriveId001/preview',
      download_url: 'https://drive.google.com/uc?export=download&id=1A2b3C4d5E6f_SampleGoogleDriveId001',
      folder_path: 'Sarthi Solutions/Resumes/',
      related_entity_type: 'candidate_resume',
      related_entity_id: 'cand-001',
      uploaded_by: 'Rajesh Kumar',
      metadata: { qualification: 'B.Tech Mechanical', experience: '8 Years' },
      is_public: false,
      created_at: '2026-08-01T10:30:00.000Z',
      updated_at: '2026-08-01T10:30:00.000Z'
    },
    {
      id: 'file-seed-002',
      file_name: 'Amit_Patel_Factory_Manager_Resume.pdf',
      original_file_name: 'Amit_Patel_CV.pdf',
      mime_type: 'application/pdf',
      file_size: 312000,
      storage_provider: 'google_drive',
      google_drive_file_id: '1B3c4D5e6F7g_SampleGoogleDriveId002',
      google_drive_url: 'https://drive.google.com/file/d/1B3c4D5e6F7g_SampleGoogleDriveId002/view',
      google_drive_view_url: 'https://drive.google.com/file/d/1B3c4D5e6F7g_SampleGoogleDriveId002/preview',
      download_url: 'https://drive.google.com/uc?export=download&id=1B3c4D5e6F7g_SampleGoogleDriveId002',
      folder_path: 'Sarthi Solutions/Resumes/',
      related_entity_type: 'candidate_resume',
      related_entity_id: 'cand-002',
      uploaded_by: 'Amit Patel',
      metadata: { qualification: 'BE Production', experience: '12 Years' },
      is_public: false,
      created_at: '2026-08-05T14:15:00.000Z',
      updated_at: '2026-08-05T14:15:00.000Z'
    },
    {
      id: 'file-seed-003',
      file_name: 'Sarthi_Solutions_Corporate_Brochure_2026.pdf',
      original_file_name: 'Corporate_Brochure_2026.pdf',
      mime_type: 'application/pdf',
      file_size: 1450000, // 1.45 MB
      storage_provider: 'google_drive',
      google_drive_file_id: '1C4d5E6f7G8h_SampleGoogleDriveId003',
      google_drive_url: 'https://drive.google.com/file/d/1C4d5E6f7G8h_SampleGoogleDriveId003/view',
      google_drive_view_url: 'https://drive.google.com/file/d/1C4d5E6f7G8h_SampleGoogleDriveId003/preview',
      download_url: 'https://drive.google.com/uc?export=download&id=1C4d5E6f7G8h_SampleGoogleDriveId003',
      folder_path: 'Sarthi Solutions/Catalogues/',
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
      storage_path: 'assets/logos/sarthi_official_navy_gold_logo.svg',
      download_url: '/sarthi-logo.svg',
      thumbnail_url: '/sarthi-logo.svg',
      folder_path: 'Sarthi Solutions/Assets/',
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

function sanitizeUUID(val: any): string | null {
  if (!val || typeof val !== 'string') return null;
  const trimmed = val.trim();
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(trimmed) ? trimmed : null;
}

export class StorageService {
  private supabase: SupabaseClient | null = null;

  constructor() {
    this.initSupabase();
  }

  public initSupabase(): SupabaseClient | null {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
    if (url && key) {
      try {
        this.supabase = createClient(url, key, {
          auth: { persistSession: false }
        });
      } catch (err) {
        console.warn('[StorageService] Supabase client init warning:', err);
        this.supabase = null;
      }
    }
    return this.supabase;
  }

  /**
   * Determine storage provider strictly by TYPE and PURPOSE of data:
   * 
   * 1. ALL PDFs -> ALWAYS GOOGLE DRIVE (regardless of file size: 100KB, 1MB, 10MB, 100MB).
   * 2. DOC/DOCX, XLS/XLSX, PPT/PPTX, ZIP, RAR, Archives, Text/CSV documents -> GOOGLE DRIVE.
   * 3. Small UI/product images, Logos, and website assets (PNG, JPG, SVG, WEBP, GIF, ICO) -> SUPABASE STORAGE.
   * 4. Structured/Form/Database records -> SUPABASE POSTGRESQL (handled via database tables, not files).
   */
  public determineStorageProvider(file: {
    mimetype: string;
    originalname: string;
    size?: number;
    relatedEntityType?: string;
    preferProvider?: StorageProvider;
  }): StorageProvider {
    if (file.preferProvider) {
      return file.preferProvider;
    }

    const mime = (file.mimetype || '').toLowerCase();
    const name = (file.originalname || '').toLowerCase();
    const entity = (file.relatedEntityType || '').toLowerCase();

    // RULE 1: ALL PDFs ALWAYS GO TO GOOGLE DRIVE REGARDLESS OF SIZE
    if (mime === 'application/pdf' || name.endsWith('.pdf')) {
      return 'google_drive';
    }

    // RULE 2: Testimonial Profile Pictures (PFPs), User Avatars, or Reviewer Photos -> GOOGLE DRIVE
    if (
      entity === 'testimonial_avatar' ||
      entity === 'testimonial_pfp' ||
      entity === 'pfp' ||
      entity === 'avatar' ||
      entity === 'user_pfp' ||
      entity.includes('testimonial')
    ) {
      return 'google_drive';
    }

    // RULE 3: DOC/DOCX, XLS/XLSX, PPT/PPTX, ZIP, Archives, and downloadable documents -> GOOGLE DRIVE
    const isDocumentOrArchive =
      mime.includes('word') ||
      mime.includes('document') ||
      mime.includes('sheet') ||
      mime.includes('excel') ||
      mime.includes('presentation') ||
      mime.includes('powerpoint') ||
      mime.includes('zip') ||
      mime.includes('rar') ||
      mime.includes('tar') ||
      mime.includes('gzip') ||
      mime.includes('7z') ||
      mime.includes('csv') ||
      mime.includes('text/plain') ||
      Boolean(name.match(/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|zip|rar|7z|tar|gz|csv|txt|rtf|odt|ods|odp)$/i));

    if (isDocumentOrArchive) {
      return 'google_drive';
    }

    // RULE 4: UI assets, logos, website graphics -> SUPABASE STORAGE (assets bucket)
    const isImageAsset =
      mime.startsWith('image/') ||
      Boolean(name.match(/\.(png|jpg|jpeg|svg|webp|gif|ico|bmp|avif)$/i));

    if (isImageAsset) {
      return 'supabase';
    }

    // Default fallback for any other files
    return 'google_drive';
  }

  /**
   * Determine the appropriate Google Drive subfolder name based on purpose
   */
  public getCategorySubfolder(relatedEntityType?: string, originalname?: string, customFolder?: string): string {
    if (customFolder) return customFolder;
    const entity = (relatedEntityType || '').toLowerCase();
    const name = (originalname || '').toLowerCase();

    if (entity.includes('testimonial') || entity.includes('pfp') || entity.includes('avatar')) {
      return 'Testimonial PFPs';
    }
    if (entity.includes('resume') || name.includes('resume') || name.includes('cv')) {
      return 'Resumes';
    }
    if (entity.includes('invoice') || name.includes('invoice')) {
      return 'Invoices';
    }
    if (entity.includes('brochure') || entity.includes('catalogue') || name.includes('brochure') || name.includes('catalogue')) {
      return 'Brochures';
    }
    if (entity.includes('application') || entity.includes('job_app')) {
      return 'Job Applications';
    }
    if (entity.includes('doc') || entity.includes('document') || entity.includes('policy')) {
      return 'Documents';
    }
    return 'Other Documents';
  }

  /**
   * Upload file into either Google Drive or Supabase Storage and record metadata into Supabase Database.
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

    // Generate standard unique ID
    const fileId = `file_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const sanitizedName = originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    
    // Determine provider purely by TYPE/PURPOSE (never by size for PDFs)
    const provider = this.determineStorageProvider({
      mimetype,
      originalname,
      size,
      relatedEntityType,
      preferProvider: (params as any).preferProvider
    });

    const now = new Date().toISOString();
    let fileRecord: FileMetadata = {
      id: fileId,
      user_id: userId,
      file_name: `${Date.now()}_${sanitizedName}`,
      original_file_name: originalname,
      mime_type: mimetype || 'application/octet-stream',
      file_size: size,
      storage_provider: provider,
      related_entity_type: relatedEntityType,
      related_entity_id: relatedEntityId,
      uploaded_by: uploadedBy,
      metadata,
      is_public: provider === 'supabase',
      created_at: now,
      updated_at: now
    };

    // ==============================================================================
    // 1. GOOGLE DRIVE UPLOAD PATH (ALL PDFs, DOC/DOCX, XLS/XLSX, ZIP, Testimonial PFPs)
    // ==============================================================================
    if (provider === 'google_drive') {
      const subfolderName = this.getCategorySubfolder(relatedEntityType, originalname, customFolder);

      const driveClient = googleDriveService.getDriveClient();
      if (driveClient) {
        try {
          const driveResult = await googleDriveService.uploadFile({
            buffer,
            fileName: fileRecord.file_name,
            mimeType: mimetype,
            subfolderName,
            makePublicViewable: true
          });

          const isImg = (mimetype || '').startsWith('image/');
          const directImgUrl = isImg && driveResult.fileId ? `https://lh3.googleusercontent.com/d/${driveResult.fileId}` : undefined;

          fileRecord = {
            ...fileRecord,
            google_drive_file_id: driveResult.fileId,
            google_drive_url: driveResult.webViewLink,
            google_drive_view_url: driveResult.previewUrl,
            download_url: directImgUrl || driveResult.downloadUrl || driveResult.webViewLink,
            thumbnail_url: directImgUrl || (isImg ? `https://drive.google.com/thumbnail?id=${driveResult.fileId}&sz=w800` : undefined),
            folder_id: driveResult.folderId,
            folder_path: `Saarthi Solutions/${subfolderName}/`
          };
        } catch (driveErr: any) {
          console.warn('[StorageService] Google Drive upload error:', driveErr.message);
          // If credentials were provided but upload failed, bubble up clear error message
          if (process.env.GOOGLE_DRIVE_REFRESH_TOKEN && process.env.GOOGLE_DRIVE_FOLDER_ID) {
            throw new Error(`Google Drive Upload Failed: ${driveErr.message}`);
          }

          // In dev preview without credentials yet, provide graceful fallback
          const mockDriveId = `dev_gdrive_${Date.now()}`;
          fileRecord = {
            ...fileRecord,
            google_drive_file_id: mockDriveId,
            google_drive_url: `https://drive.google.com/file/d/${mockDriveId}/view`,
            google_drive_view_url: `https://drive.google.com/file/d/${mockDriveId}/preview`,
            download_url: `/api/storage/files/${fileId}/content`,
            folder_path: `Saarthi Solutions/${subfolderName}/`
          };
        }
      } else {
        // Missing Google Drive credentials
        if (process.env.GOOGLE_DRIVE_REFRESH_TOKEN || process.env.GOOGLE_DRIVE_FOLDER_ID) {
          throw new Error('Google Drive credentials are incomplete. Please verify GOOGLE_DRIVE_CLIENT_ID, GOOGLE_DRIVE_CLIENT_SECRET, GOOGLE_DRIVE_REFRESH_TOKEN, and GOOGLE_DRIVE_FOLDER_ID.');
        }

        // Local development preview fallback
        const mockDriveId = `dev_gdrive_${Date.now()}`;
        fileRecord = {
          ...fileRecord,
          google_drive_file_id: mockDriveId,
          google_drive_url: `https://drive.google.com/file/d/${mockDriveId}/view`,
          google_drive_view_url: `https://drive.google.com/file/d/${mockDriveId}/preview`,
          download_url: `/api/storage/files/${fileId}/content`,
          folder_path: `Saarthi Solutions/${subfolderName}/`
        };
      }
    } 
    // ==============================================================================
    // 2. SUPABASE STORAGE UPLOAD PATH (Logos, UI Assets, Small Images ONLY)
    // ==============================================================================
    else {
      const supabase = this.initSupabase();
      const storagePath = `assets/${relatedEntityType}/${fileRecord.file_name}`;

      if (supabase) {
        try {
          const { error: uploadError } = await supabase.storage
            .from('assets')
            .upload(storagePath, buffer, {
              contentType: mimetype,
              upsert: true
            });

          if (!uploadError) {
            const { data } = supabase.storage.from('assets').getPublicUrl(storagePath);
            fileRecord = {
              ...fileRecord,
              storage_path: storagePath,
              download_url: data.publicUrl,
              thumbnail_url: data.publicUrl,
              folder_path: `Saarthi Solutions/Assets/${relatedEntityType}/`
            };
          } else {
            console.warn('[StorageService] Supabase storage upload error:', uploadError.message);
            fileRecord.storage_path = storagePath;
            fileRecord.download_url = `/api/storage/files/${fileId}/content`;
            fileRecord.folder_path = `Saarthi Solutions/Assets/${relatedEntityType}/`;
          }
        } catch (supabaseErr: any) {
          console.warn('[StorageService] Supabase upload exception:', supabaseErr.message);
          fileRecord.storage_path = storagePath;
          fileRecord.download_url = `/api/storage/files/${fileId}/content`;
          fileRecord.folder_path = `Saarthi Solutions/Assets/${relatedEntityType}/`;
        }
      } else {
        fileRecord.storage_path = storagePath;
        fileRecord.download_url = `/api/storage/files/${fileId}/content`;
        fileRecord.folder_path = `Saarthi Solutions/Assets/${relatedEntityType}/`;
      }
    }

    // ==============================================================================
    // 3. PERSIST METADATA IN SUPABASE POSTGRESQL DATABASE
    // ==============================================================================
    const supabase = this.initSupabase();
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
          storage_provider: fileRecord.storage_provider,
          storage_path: fileRecord.storage_path,
          google_drive_file_id: fileRecord.google_drive_file_id,
          google_drive_url: fileRecord.google_drive_url,
          google_drive_view_url: fileRecord.google_drive_view_url,
          download_url: fileRecord.download_url,
          thumbnail_url: fileRecord.thumbnail_url,
          folder_id: fileRecord.folder_id,
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
          console.warn('[StorageService] Supabase database insert warning:', dbError.message);
        } else {
          console.log(`[StorageService] PDF/File link saved to Supabase files table: ${fileRecord.original_file_name} -> ${fileRecord.google_drive_url || fileRecord.download_url}`);
        }
      } catch (dbErr: any) {
        console.warn('[StorageService] Supabase database exception:', dbErr.message);
      }
    }

    // Keep in-memory map synchronized
    inMemoryFileStore.set(fileRecord.id, fileRecord);

    return fileRecord;
  }

  /**
   * List all stored files with optional filters
   */
  public async listFiles(filters?: {
    provider?: StorageProvider;
    relatedEntityType?: string;
    search?: string;
    limit?: number;
  }): Promise<FileMetadata[]> {
    const supabase = this.initSupabase();

    if (supabase) {
      try {
        let query = supabase.from('files').select('*').order('created_at', { ascending: false });

        if (filters?.provider) {
          query = query.eq('storage_provider', filters.provider);
        }
        if (filters?.relatedEntityType) {
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
        console.warn('[StorageService] Supabase fetch exception, falling back to local registry:', err);
      }
    }

    // Local in-memory registry fallback
    let files = Array.from(inMemoryFileStore.values());
    if (filters?.provider) {
      files = files.filter((f) => f.storage_provider === filters.provider);
    }
    if (filters?.relatedEntityType) {
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
   * Delete file from both storage provider (Google Drive / Supabase Storage) and Supabase database
   */
  public async deleteFile(fileId: string): Promise<{ success: boolean; message?: string }> {
    const file = await this.getFileById(fileId);
    if (!file) {
      return { success: false, message: 'File not found' };
    }

    // 1. Delete from Google Drive
    if (file.storage_provider === 'google_drive' && file.google_drive_file_id) {
      if (!file.google_drive_file_id.startsWith('mock_') && !file.google_drive_file_id.startsWith('dev_')) {
        await googleDriveService.deleteFile(file.google_drive_file_id);
      }
    }

    // 2. Delete from Supabase Storage
    if (file.storage_provider === 'supabase' && file.storage_path) {
      const supabase = this.initSupabase();
      if (supabase) {
        try {
          await supabase.storage.from('assets').remove([file.storage_path]);
        } catch (err: any) {
          console.warn('[StorageService] Supabase storage delete warning:', err.message);
        }
      }
    }

    // 3. Delete metadata from Supabase database
    const supabase = this.initSupabase();
    if (supabase) {
      try {
        await supabase.from('files').delete().eq('id', fileId);
      } catch (err: any) {
        console.warn('[StorageService] Supabase database delete warning:', err.message);
      }
    }

    inMemoryFileStore.delete(fileId);
    return { success: true, message: 'File deleted from storage provider and database' };
  }

  /**
   * Replace an existing file with a new upload (cleans up old file from storage)
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

    // Delete old physical storage asset
    if (oldFile) {
      if (oldFile.storage_provider === 'google_drive' && oldFile.google_drive_file_id) {
        if (!oldFile.google_drive_file_id.startsWith('mock_') && !oldFile.google_drive_file_id.startsWith('dev_')) {
          await googleDriveService.deleteFile(oldFile.google_drive_file_id);
        }
      } else if (oldFile.storage_provider === 'supabase' && oldFile.storage_path) {
        const supabase = this.initSupabase();
        if (supabase) {
          try {
            await supabase.storage.from('assets').remove([oldFile.storage_path]);
          } catch {}
        }
      }
    }

    // Upload replacement
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
  // STRUCTURED DATA METHODS (SUPABASE POSTGRESQL) - FORMS & APP DATA
  // ==============================================================================

  /**
   * Save contact submission directly into Supabase PostgreSQL (NO Google Drive file created)
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
          console.warn('[StorageService] Supabase contact insert warning:', error.message);
        }
      } catch (err) {
        console.warn('[StorageService] Supabase contact insert exception:', err);
      }
    }
    return record;
  }

  /**
   * Save job application into Supabase PostgreSQL (referencing Google Drive resume file if provided)
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
    resumeFileId?: string;
    resumeUrl?: string;
    resumeGoogleDriveUrl?: string;
    resumeFileName?: string;
  }) {
    const id = data.id || `app_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const resumeUrl = data.resumeUrl || data.resumeGoogleDriveUrl || null;
    const resumeGoogleDriveUrl = data.resumeGoogleDriveUrl || data.resumeUrl || null;

    const record = {
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
      resume_file_id: data.resumeFileId || null,
      resume_url: resumeUrl,
      resume_google_drive_url: resumeGoogleDriveUrl,
      resume_file_name: data.resumeFileName || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const supabase = this.initSupabase();
    if (supabase) {
      try {
        const { error } = await supabase.from('job_applications').upsert(record, { onConflict: 'id' });
        if (error) {
          console.warn('[StorageService] Supabase job application upsert warning:', error.message);
        } else {
          console.log(`[StorageService] Job application saved in Supabase with PDF Link: ${record.candidate_name} -> ${record.resume_google_drive_url || record.resume_url}`);
        }
      } catch (err) {
        console.warn('[StorageService] Supabase job application upsert exception:', err);
      }
    }
    return record;
  }

  /**
   * Save candidate profile and resume link in Supabase PostgreSQL
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
    resumeFileId?: string;
    resumeUrl?: string;
    resumeGoogleDriveUrl?: string;
    resumeFileName?: string;
    resumeStoragePath?: string;
  }) {
    const id = data.id || `cand_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const sanitizedUserId = sanitizeUUID(data.userId);
    const resumeUrl = data.resumeUrl || data.resumeGoogleDriveUrl || null;
    const resumeGoogleDriveUrl = data.resumeGoogleDriveUrl || data.resumeUrl || null;

    const record = {
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
      resume_file_id: data.resumeFileId || null,
      resume_url: resumeUrl,
      resume_google_drive_url: resumeGoogleDriveUrl,
      resume_file_name: data.resumeFileName || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const supabase = this.initSupabase();
    if (supabase) {
      try {
        const { error } = await supabase.from('candidates').upsert(record, { onConflict: 'id' });
        if (error) {
          console.warn('[StorageService] Supabase candidate upsert warning:', error.message);
        } else {
          console.log(`[StorageService] Candidate saved in Supabase with PDF Resume: ${record.full_name} -> ${record.resume_google_drive_url || record.resume_url}`);
        }
      } catch (err) {
        console.warn('[StorageService] Supabase candidate upsert exception:', err);
      }
    }
    return record;
  }

  /**
   * Save invoice and Google Drive PDF link in Supabase PostgreSQL
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
    pdfGoogleDriveUrl?: string;
  }) {
    const id = data.id || `inv_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const pdfUrl = data.pdfUrl || data.pdfGoogleDriveUrl || null;
    const pdfGoogleDriveUrl = data.pdfGoogleDriveUrl || data.pdfUrl || null;

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
      pdf_google_drive_url: pdfGoogleDriveUrl,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const supabase = this.initSupabase();
    if (supabase) {
      try {
        const { error } = await supabase.from('invoices').upsert(record, { onConflict: 'id' });
        if (error) {
          console.warn('[StorageService] Supabase invoice upsert warning:', error.message);
        } else {
          console.log(`[StorageService] Invoice saved in Supabase with PDF Link: ${record.invoice_number} -> ${record.pdf_google_drive_url || record.pdf_url}`);
        }
      } catch (err) {
        console.warn('[StorageService] Supabase invoice upsert exception:', err);
      }
    }
    return record;
  }

  /**
   * Save testimonial into Supabase PostgreSQL
   */
  public async saveTestimonial(data: {
    id?: string;
    name: string;
    role: string;
    company: string;
    location?: string;
    content: string;
    rating?: number;
    avatar?: string;
    image?: string;
    type?: string;
    status?: 'approved' | 'pending' | 'rejected';
    is_approved?: boolean;
    drive_file_id?: string;
    driveFileId?: string;
    drive_url?: string;
    driveUrl?: string;
    google_drive_url?: string;
    googleDriveUrl?: string;
    google_drive_view_url?: string;
    googleDriveViewUrl?: string;
    submitted_by?: string;
    submittedBy?: string;
  }) {
    const id = data.id || `test_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const avatarUrl =
      data.avatar ||
      data.image ||
      data.google_drive_view_url ||
      data.googleDriveViewUrl ||
      data.drive_url ||
      data.driveUrl ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

    const effectiveStatus = data.status || (data.is_approved === true ? 'approved' : data.is_approved === false ? 'pending' : 'approved');

    const record = {
      id,
      name: data.name,
      role: data.role,
      company: data.company,
      location: data.location || 'Gujarat',
      content: data.content,
      rating: data.rating || 5,
      avatar: avatarUrl,
      image: avatarUrl,
      type: data.type || 'Candidate',
      status: effectiveStatus,
      is_approved: effectiveStatus === 'approved',
      drive_file_id: data.drive_file_id || data.driveFileId || null,
      drive_url: data.drive_url || data.driveUrl || data.google_drive_url || data.googleDriveUrl || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const supabase = this.initSupabase();
    if (supabase) {
      try {
        const { error } = await supabase.from('testimonials').upsert(record, { onConflict: 'id' });
        if (error) {
          console.warn('[StorageService] Supabase testimonial upsert warning:', error.message);
        } else {
          console.log(`[StorageService] Testimonial saved in Supabase: ${record.name} (${record.company}) [Status: ${record.status}]`);
        }
      } catch (err) {
        console.warn('[StorageService] Supabase testimonial upsert exception:', err);
      }
    }
    return record;
  }

  /**
   * Update testimonial approval status in Supabase
   */
  public async updateTestimonialStatus(id: string, status: 'approved' | 'pending' | 'rejected') {
    const supabase = this.initSupabase();
    const isApproved = status === 'approved';
    const updatedAt = new Date().toISOString();

    if (supabase) {
      try {
        const { error } = await supabase
          .from('testimonials')
          .update({
            status,
            is_approved: isApproved,
            updated_at: updatedAt
          })
          .eq('id', id);

        if (error) {
          console.warn('[StorageService] Supabase testimonial status update warning:', error.message);
        } else {
          console.log(`[StorageService] Testimonial status updated: ${id} -> ${status}`);
        }
      } catch (err) {
        console.warn('[StorageService] Supabase testimonial status update exception:', err);
      }
    }
    return { success: true, id, status, is_approved: isApproved, updated_at: updatedAt };
  }

  /**
   * Get all testimonials from Supabase (with optional status filter)
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
        if (!error && data) {
          return data;
        }
      } catch (err) {
        console.warn('[StorageService] Supabase testimonials fetch exception:', err);
      }
    }
    return [];
  }

  /**
   * Delete testimonial from Supabase
   */
  public async deleteTestimonial(id: string) {
    const supabase = this.initSupabase();
    if (supabase) {
      try {
        const { error } = await supabase.from('testimonials').delete().eq('id', id);
        if (error) {
          console.warn('[StorageService] Supabase testimonial delete warning:', error.message);
        } else {
          console.log(`[StorageService] Testimonial deleted from Supabase: ${id}`);
        }
      } catch (err) {
        console.warn('[StorageService] Supabase testimonial delete exception:', err);
      }
    }
    return { success: true, message: 'Testimonial deleted from database' };
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
        const { error } = await supabase.from('placements').upsert(record, { onConflict: 'id' });
        if (error) {
          console.warn('[StorageService] Supabase placement upsert warning:', error.message);
        }
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
        console.warn('[StorageService] Supabase placements fetch exception:', err);
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
        const { error } = await supabase.from('services').upsert(record, { onConflict: 'id' });
        if (error) {
          console.warn('[StorageService] Supabase service upsert warning:', error.message);
        }
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
        console.warn('[StorageService] Supabase services fetch exception:', err);
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
    companyName: string;
    industry?: string;
    location?: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
    activeOpenings?: number;
    partnershipType?: string;
    status?: string;
    notes?: string;
  }) {
    const id = data.id || `emp_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const record = {
      id,
      company_name: data.companyName,
      industry: data.industry || 'Manufacturing',
      location: data.location || 'Gujarat',
      contact_person: data.contactPerson || '',
      phone: data.phone || '',
      email: data.email || '',
      active_openings: data.activeOpenings || 1,
      partnership_type: data.partnershipType || 'Permanent Hiring',
      status: data.status || 'Active Partner',
      notes: data.notes || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const supabase = this.initSupabase();
    if (supabase) {
      try {
        const { error } = await supabase.from('employers').upsert(record, { onConflict: 'id' });
        if (error) {
          console.warn('[StorageService] Supabase employer upsert warning:', error.message);
        }
      } catch (err) {
        console.warn('[StorageService] Supabase employer upsert exception:', err);
      }
    }
    return record;
  }

  public async getEmployers() {
    const supabase = this.initSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('employers').select('*').order('created_at', { ascending: false });
        if (!error && data) return data;
      } catch (err) {
        console.warn('[StorageService] Supabase employers fetch exception:', err);
      }
    }
    return [];
  }

  public async deleteEmployer(id: string) {
    const supabase = this.initSupabase();
    if (supabase) {
      try {
        await supabase.from('employers').delete().eq('id', id);
      } catch (err) {
        console.warn('[StorageService] Supabase employer delete exception:', err);
      }
    }
    return { success: true, message: 'Employer deleted' };
  }

  /**
   * Return health & credentials configuration status
   */
  public async getHealthStatus() {
    const hasSupabaseUrl = Boolean(process.env.SUPABASE_URL);
    const hasSupabaseAnonKey = Boolean(process.env.SUPABASE_ANON_KEY);
    const hasSupabaseServiceKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
    const driveStatus = await googleDriveService.getConnectionStatus();

    const isSupabaseReady = hasSupabaseUrl && (hasSupabaseServiceKey || hasSupabaseAnonKey);

    return {
      status: isSupabaseReady && driveStatus.connected ? 'healthy' : isSupabaseReady || driveStatus.configured ? 'configured' : 'fallback',
      supabaseConnected: isSupabaseReady,
      supabaseStorageReady: isSupabaseReady,
      googleDriveConnected: driveStatus.connected,
      googleDriveConfigured: driveStatus.configured,
      googleDriveFolderId: driveStatus.folderId || process.env.GOOGLE_DRIVE_FOLDER_ID || 'not-configured',
      googleDriveFolderName: driveStatus.folderName,
      googleDriveMessage: driveStatus.message,
      googleDriveError: driveStatus.error,
      routingRules: {
        pdfs: 'Google Drive (Always, 100KB to 100MB+)',
        documents: 'Google Drive (DOC, DOCX, XLS, ZIP, etc.)',
        assets: 'Supabase Storage (PNG, JPG, SVG, etc.)',
        formData: 'Supabase PostgreSQL (Structured Tables)'
      },
      environment: {
        hasSupabaseUrl,
        hasSupabaseAnonKey,
        hasSupabaseServiceKey,
        hasGoogleDriveClientId: driveStatus.hasClientId,
        hasGoogleDriveClientSecret: driveStatus.hasClientSecret,
        hasGoogleDriveRefreshToken: driveStatus.hasRefreshToken,
        hasGoogleDriveFolderId: driveStatus.hasFolderId
      }
    };
  }
}

export const storageService = new StorageService();
