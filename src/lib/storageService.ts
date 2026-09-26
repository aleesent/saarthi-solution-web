import { FileRecord, StorageProvider, StorageHealthStatus } from '../types';

/**
 * Upload a file directly to Supabase Storage and register its metadata in Supabase PostgreSQL.
 */
export async function uploadFileToUnifiedStorage(
  file: File | Blob,
  options?: {
    fileName?: string;
    relatedEntityType?: 'candidate_resume' | 'application_resume' | 'invoice_pdf' | 'document' | 'asset' | 'other' | string;
    relatedEntityId?: string;
    uploadedBy?: string;
    userId?: string;
    customFolder?: string;
    metadata?: Record<string, any>;
  }
): Promise<FileRecord> {
  const formData = new FormData();
  
  if (file instanceof File) {
    formData.append('file', file, options?.fileName || file.name);
  } else {
    const defaultName = options?.fileName || `document_${Date.now()}.pdf`;
    formData.append('file', file, defaultName);
  }

  if (options?.relatedEntityType) {
    formData.append('relatedEntityType', options.relatedEntityType);
  }
  if (options?.relatedEntityId) {
    formData.append('relatedEntityId', options.relatedEntityId);
  }
  if (options?.uploadedBy) {
    formData.append('uploadedBy', options.uploadedBy);
  }
  if (options?.userId) {
    formData.append('userId', options.userId);
  }
  if (options?.customFolder) {
    formData.append('customFolder', options.customFolder);
  }
  if (options?.metadata) {
    formData.append('metadata', JSON.stringify(options.metadata));
  }

  const response = await fetch('/api/storage/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(errData.error || `Upload failed with status ${response.status}`);
  }

  const data = await response.json();
  return data.file as FileRecord;
}

/**
 * Fetch all registered files from Supabase / Backend Storage Registry.
 */
export async function fetchFilesRegistry(filters?: {
  provider?: StorageProvider;
  relatedEntityType?: string;
  search?: string;
  limit?: number;
}): Promise<FileRecord[]> {
  const params = new URLSearchParams();
  if (filters?.provider) params.set('provider', filters.provider);
  if (filters?.relatedEntityType) params.set('relatedEntityType', filters.relatedEntityType);
  if (filters?.search) params.set('search', filters.search);
  if (filters?.limit) params.set('limit', String(filters.limit));

  const url = `/api/storage/files${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error('Failed to fetch files from storage registry');
  }

  const data = await response.json();
  return data.files || [];
}

/**
 * Fetch a single file metadata by its ID.
 */
export async function fetchFileById(fileId: string): Promise<FileRecord | null> {
  const response = await fetch(`/api/storage/files/${fileId}`);
  if (!response.ok) return null;
  const data = await response.json();
  return data.file || null;
}

/**
 * Delete a file from its storage provider and Supabase database.
 */
export async function deleteStorageFile(fileId: string): Promise<{ success: boolean; message?: string }> {
  const response = await fetch(`/api/storage/files/${fileId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({ error: 'Delete failed' }));
    throw new Error(errData.error || 'Failed to delete file from storage');
  }

  return response.json();
}

/**
 * Replace an existing file with a new upload.
 */
export async function replaceStorageFile(
  fileId: string,
  newFile: File,
  uploadedBy?: string
): Promise<FileRecord> {
  const formData = new FormData();
  formData.append('file', newFile, newFile.name);
  if (uploadedBy) formData.append('uploadedBy', uploadedBy);

  const response = await fetch(`/api/storage/files/${fileId}/replace`, {
    method: 'PUT',
    body: formData,
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({ error: 'File replacement failed' }));
    throw new Error(errData.error || 'Failed to replace file');
  }

  const data = await response.json();
  return data.file as FileRecord;
}

/**
 * Check storage health & environment credentials configuration.
 */
export async function fetchStorageHealth(): Promise<StorageHealthStatus> {
  const response = await fetch('/api/storage/health');
  if (!response.ok) {
    throw new Error('Failed to fetch storage health');
  }
  return response.json();
}
