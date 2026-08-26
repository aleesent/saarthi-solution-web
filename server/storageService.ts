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

export class StorageService {
  private supabase: SupabaseClient | null = null;
  private maxSupabaseFileSize: number;

  constructor() {
    this.maxSupabaseFileSize = parseInt(process.env.MAX_SUPABASE_FILE_SIZE || '2097152', 10); // 2MB default
    this.initSupabase();
  }

  private initSupabase(): SupabaseClient | null {
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
   * Determine storage provider according to centralized architectural rules:
   * 1. All PDFs always go to Google Drive.
   * 2. Large documents, ZIPs, videos, or files >= MAX_SUPABASE_FILE_SIZE go to Google Drive.
   * 3. Small images and UI assets (< MAX_SUPABASE_FILE_SIZE) go to Supabase Storage.
   */
  public determineStorageProvider(file: {
    mimetype: string;
    size: number;
    originalname: string;
  }): StorageProvider {
    const isPdf = file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf');
    const isLarge = file.size >= this.maxSupabaseFileSize;
    const isDocument =
      file.mimetype.includes('word') ||
      file.mimetype.includes('document') ||
      file.mimetype.includes('sheet') ||
      file.mimetype.includes('presentation') ||
      file.mimetype.includes('zip') ||
      file.mimetype.includes('rar') ||
      file.mimetype.includes('video') ||
      Boolean(file.originalname.match(/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|zip|rar|7z|tar|gz|mp4|mov|avi)$/i));

    if (isPdf || isLarge || isDocument) {
      return 'google_drive';
    }

    return 'supabase';
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

    // Generate standard UUID or secure ID
    const fileId = `file_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const sanitizedName = originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const provider = this.determineStorageProvider({
      mimetype,
      size,
      originalname
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
    // 1. GOOGLE DRIVE UPLOAD PATH (PDFs, Large Documents, Videos, Archives)
    // ==============================================================================
    if (provider === 'google_drive') {
      const category = customFolder || (
        relatedEntityType === 'candidate_resume' || relatedEntityType === 'application_resume'
          ? 'Resumes'
          : relatedEntityType === 'invoice_pdf'
          ? 'Invoices'
          : relatedEntityType === 'asset' || relatedEntityType === 'logo'
          ? 'Assets'
          : 'Documents'
      );

      const driveClient = googleDriveService.getDriveClient();
      if (driveClient) {
        try {
          const driveResult = await googleDriveService.uploadFile({
            buffer,
            fileName: fileRecord.file_name,
            mimeType: mimetype,
            subfolderName: category,
            makePublicViewable: true
          });

          fileRecord = {
            ...fileRecord,
            google_drive_file_id: driveResult.fileId,
            google_drive_url: driveResult.webViewLink,
            google_drive_view_url: driveResult.previewUrl,
            download_url: driveResult.downloadUrl,
            folder_id: driveResult.folderId,
            folder_path: `Sarthi Solutions/${category}/`
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
            folder_path: `Sarthi Solutions/${category}/`
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
          folder_path: `Sarthi Solutions/${category}/`
        };
      }
    } 
    // ==============================================================================
    // 2. SUPABASE STORAGE UPLOAD PATH (Small website assets, icons, logos < 2MB)
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
              folder_path: `Sarthi Solutions/Assets/${relatedEntityType}/`
            };
          } else {
            console.warn('[StorageService] Supabase storage upload error:', uploadError.message);
            fileRecord.storage_path = storagePath;
            fileRecord.download_url = `/api/storage/files/${fileId}/content`;
            fileRecord.folder_path = `Sarthi Solutions/Assets/${relatedEntityType}/`;
          }
        } catch (supabaseErr: any) {
          console.warn('[StorageService] Supabase upload exception:', supabaseErr.message);
          fileRecord.storage_path = storagePath;
          fileRecord.download_url = `/api/storage/files/${fileId}/content`;
          fileRecord.folder_path = `Sarthi Solutions/Assets/${relatedEntityType}/`;
        }
      } else {
        fileRecord.storage_path = storagePath;
        fileRecord.download_url = `/api/storage/files/${fileId}/content`;
        fileRecord.folder_path = `Sarthi Solutions/Assets/${relatedEntityType}/`;
      }
    }

    // ==============================================================================
    // 3. PERSIST METADATA IN SUPABASE DATABASE
    // ==============================================================================
    const supabase = this.initSupabase();
    if (supabase) {
      try {
        const { error: dbError } = await supabase.from('files').insert({
          id: fileRecord.id,
          user_id: fileRecord.user_id,
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
        });

        if (dbError) {
          console.warn('[StorageService] Supabase database insert warning:', dbError.message);
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
      maxSupabaseFileSize: this.maxSupabaseFileSize,
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
