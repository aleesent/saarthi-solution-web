import { google } from 'googleapis';
import { Readable } from 'stream';

export interface GoogleDriveUploadResult {
  fileId: string;
  name: string;
  webViewLink: string;
  previewUrl: string;
  downloadUrl: string;
  folderId?: string;
  size?: number;
}

export interface GoogleDriveConnectionStatus {
  configured: boolean;
  connected: boolean;
  hasClientId: boolean;
  hasClientSecret: boolean;
  hasRefreshToken: boolean;
  hasFolderId: boolean;
  folderId?: string;
  folderName?: string;
  message: string;
  error?: string;
}

class GoogleDriveService {
  private folderCache = new Map<string, string>();

  /**
   * Determine the effective OAuth redirect URI based on environment or request
   */
  public getRedirectUri(fallbackOrigin?: string): string {
    if (process.env.GOOGLE_REDIRECT_URI) {
      return process.env.GOOGLE_REDIRECT_URI;
    }
    const appUrl = process.env.APP_URL || fallbackOrigin || 'http://localhost:3000';
    return `${appUrl.replace(/\/$/, '')}/auth/google/callback`;
  }

  /**
   * Get an initialized OAuth2 client
   */
  public getOAuth2Client(redirectUri?: string) {
    const clientId = process.env.GOOGLE_DRIVE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_DRIVE_CLIENT_SECRET;
    const effectiveRedirectUri = redirectUri || this.getRedirectUri();

    if (!clientId || !clientSecret) {
      return null;
    }

    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      effectiveRedirectUri
    );

    const refreshToken = process.env.GOOGLE_DRIVE_REFRESH_TOKEN;
    if (refreshToken) {
      oauth2Client.setCredentials({
        refresh_token: refreshToken
      });
    }

    return oauth2Client;
  }

  /**
   * Generate Google OAuth authorization URL for offline access (refresh token)
   */
  public generateAuthUrl(redirectUri?: string, state?: string): string {
    const clientId = process.env.GOOGLE_DRIVE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_DRIVE_CLIENT_SECRET;
    const effectiveRedirectUri = redirectUri || this.getRedirectUri();

    if (!clientId || !clientSecret) {
      throw new Error('GOOGLE_DRIVE_CLIENT_ID or GOOGLE_DRIVE_CLIENT_SECRET is missing in environment variables.');
    }

    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      effectiveRedirectUri
    );

    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent', // Forces Google to provide a refresh_token every time
      scope: [
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/drive.metadata.readonly'
      ],
      state: state || 'admin_oauth_setup'
    });
  }

  /**
   * Exchange authorization code from Google OAuth callback for tokens
   */
  public async exchangeCodeForTokens(code: string, redirectUri?: string) {
    const clientId = process.env.GOOGLE_DRIVE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_DRIVE_CLIENT_SECRET;
    const effectiveRedirectUri = redirectUri || this.getRedirectUri();

    if (!clientId || !clientSecret) {
      throw new Error('GOOGLE_DRIVE_CLIENT_ID or GOOGLE_DRIVE_CLIENT_SECRET is missing in environment variables.');
    }

    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      effectiveRedirectUri
    );

    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
  }

  /**
   * Get an authorized Google Drive API client instance
   */
  public getDriveClient() {
    const oauth2Client = this.getOAuth2Client();
    if (!oauth2Client) {
      return null;
    }
    const refreshToken = process.env.GOOGLE_DRIVE_REFRESH_TOKEN;
    if (!refreshToken) {
      return null;
    }
    return google.drive({ version: 'v3', auth: oauth2Client });
  }

  /**
   * Verify and validate the root Google Drive folder
   */
  public async verifyRootFolder(): Promise<{ valid: boolean; folderId: string; folderName?: string; error?: string }> {
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    if (!folderId || folderId === 'root_folder_id_placeholder') {
      return {
        valid: false,
        folderId: folderId || '',
        error: 'GOOGLE_DRIVE_FOLDER_ID is not configured in environment variables.'
      };
    }

    const drive = this.getDriveClient();
    if (!drive) {
      return {
        valid: false,
        folderId,
        error: 'Google Drive client is not authorized. Please check GOOGLE_DRIVE_REFRESH_TOKEN.'
      };
    }

    try {
      const response = await drive.files.get({
        fileId: folderId,
        fields: 'id, name, mimeType, trashed'
      });

      if (response.data.trashed) {
        return {
          valid: false,
          folderId,
          error: `Google Drive folder "${response.data.name}" (${folderId}) is in the trash bin.`
        };
      }

      if (response.data.mimeType !== 'application/vnd.google-apps.folder') {
        return {
          valid: false,
          folderId,
          error: `The specified ID (${folderId}) is a file ("${response.data.name}"), not a Google Drive folder.`
        };
      }

      return {
        valid: true,
        folderId,
        folderName: response.data.name || 'Root Folder'
      };
    } catch (err: any) {
      const msg = err.message || 'Unknown Google Drive API error';
      return {
        valid: false,
        folderId,
        error: `Could not access Google Drive folder (${folderId}): ${msg}. Ensure the authorized Google account has Editor access to this folder.`
      };
    }
  }

  /**
   * Get or create a dedicated subfolder inside the root Google Drive folder
   */
  public async getOrCreateSubfolder(subfolderName: string): Promise<string> {
    const rootFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    if (!rootFolderId) {
      throw new Error('GOOGLE_DRIVE_FOLDER_ID is not configured.');
    }

    const cacheKey = `${rootFolderId}_${subfolderName}`;
    if (this.folderCache.has(cacheKey)) {
      return this.folderCache.get(cacheKey)!;
    }

    const drive = this.getDriveClient();
    if (!drive) {
      throw new Error('Google Drive client is not authorized.');
    }

    try {
      // 1. Search for existing subfolder
      const query = `mimeType='application/vnd.google-apps.folder' and name='${subfolderName.replace(/'/g, "\\'")}' and '${rootFolderId}' in parents and trashed=false`;
      const listRes = await drive.files.list({
        q: query,
        fields: 'files(id, name)',
        spaces: 'drive'
      });

      if (listRes.data.files && listRes.data.files.length > 0) {
        const existingId = listRes.data.files[0].id!;
        this.folderCache.set(cacheKey, existingId);
        return existingId;
      }

      // 2. Create subfolder inside rootFolderId
      const createRes = await drive.files.create({
        requestBody: {
          name: subfolderName,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [rootFolderId]
        },
        fields: 'id, name'
      });

      const newId = createRes.data.id!;
      this.folderCache.set(cacheKey, newId);
      return newId;
    } catch (err: any) {
      console.warn(`[GoogleDriveService] Error finding/creating subfolder "${subfolderName}", using root folder fallback:`, err.message);
      return rootFolderId;
    }
  }

  /**
   * Upload a file buffer directly to Google Drive
   */
  public async uploadFile(params: {
    buffer: Buffer;
    fileName: string;
    mimeType: string;
    subfolderName?: string;
    makePublicViewable?: boolean;
  }): Promise<GoogleDriveUploadResult> {
    const {
      buffer,
      fileName,
      mimeType,
      subfolderName,
      makePublicViewable = true
    } = params;

    const drive = this.getDriveClient();
    if (!drive) {
      throw new Error(
        'Google Drive is not connected. Missing GOOGLE_DRIVE_CLIENT_ID, GOOGLE_DRIVE_CLIENT_SECRET, or GOOGLE_DRIVE_REFRESH_TOKEN.'
      );
    }

    // Verify root folder
    const folderVerification = await this.verifyRootFolder();
    if (!folderVerification.valid) {
      throw new Error(`Google Drive Root Folder Error: ${folderVerification.error}`);
    }

    // Determine target parent folder
    let targetFolderId = folderVerification.folderId;
    if (subfolderName) {
      targetFolderId = await this.getOrCreateSubfolder(subfolderName);
    }

    // Stream buffer to Drive
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);

    const response = await drive.files.create({
      requestBody: {
        name: fileName,
        mimeType: mimeType || 'application/octet-stream',
        parents: [targetFolderId]
      },
      media: {
        mimeType: mimeType || 'application/octet-stream',
        body: stream
      },
      fields: 'id, name, webViewLink, webContentLink, size, mimeType'
    });

    const fileId = response.data.id;
    if (!fileId) {
      throw new Error('Failed to obtain file ID from Google Drive API response.');
    }

    // Grant public view permission if requested so preview/download URLs work seamlessly
    if (makePublicViewable) {
      try {
        await drive.permissions.create({
          fileId,
          requestBody: {
            role: 'reader',
            type: 'anyone'
          }
        });
      } catch (permErr: any) {
        console.warn(`[GoogleDriveService] Could not set public permission on file ${fileId} (organization policy might restrict):`, permErr.message);
      }
    }

    const webViewLink = response.data.webViewLink || `https://drive.google.com/file/d/${fileId}/view`;
    const previewUrl = `https://drive.google.com/file/d/${fileId}/preview`;
    const downloadUrl = response.data.webContentLink || `https://drive.google.com/uc?export=download&id=${fileId}`;

    return {
      fileId,
      name: response.data.name || fileName,
      webViewLink,
      previewUrl,
      downloadUrl,
      folderId: targetFolderId,
      size: response.data.size ? parseInt(response.data.size, 10) : buffer.length
    };
  }

  /**
   * Delete a file from Google Drive by ID
   */
  public async deleteFile(fileId: string): Promise<boolean> {
    const drive = this.getDriveClient();
    if (!drive) {
      console.warn('[GoogleDriveService] Cannot delete file from Google Drive: Drive client not initialized.');
      return false;
    }

    try {
      await drive.files.delete({ fileId });
      return true;
    } catch (err: any) {
      if (err.status === 404 || err.code === 404) {
        // File was already deleted or doesn't exist
        return true;
      }
      console.warn(`[GoogleDriveService] Error deleting file (${fileId}) from Google Drive:`, err.message);
      return false;
    }
  }

  /**
   * Stream a file's content directly from Google Drive (proxy download/preview)
   */
  public async getFileStream(fileId: string) {
    const drive = this.getDriveClient();
    if (!drive) {
      throw new Error('Google Drive client is not initialized.');
    }

    const metaRes = await drive.files.get({
      fileId,
      fields: 'id, name, mimeType, size'
    });

    const streamRes = await drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'stream' }
    );

    return {
      metadata: metaRes.data,
      stream: streamRes.data
    };
  }

  /**
   * Comprehensive connection and configuration diagnostic
   */
  public async getConnectionStatus(): Promise<GoogleDriveConnectionStatus> {
    const hasClientId = Boolean(process.env.GOOGLE_DRIVE_CLIENT_ID);
    const hasClientSecret = Boolean(process.env.GOOGLE_DRIVE_CLIENT_SECRET);
    const hasRefreshToken = Boolean(process.env.GOOGLE_DRIVE_REFRESH_TOKEN);
    const hasFolderId = Boolean(process.env.GOOGLE_DRIVE_FOLDER_ID);
    const configured = hasClientId && hasClientSecret && hasRefreshToken && hasFolderId;

    if (!configured) {
      const missing: string[] = [];
      if (!hasClientId) missing.push('GOOGLE_DRIVE_CLIENT_ID');
      if (!hasClientSecret) missing.push('GOOGLE_DRIVE_CLIENT_SECRET');
      if (!hasRefreshToken) missing.push('GOOGLE_DRIVE_REFRESH_TOKEN');
      if (!hasFolderId) missing.push('GOOGLE_DRIVE_FOLDER_ID');

      return {
        configured: false,
        connected: false,
        hasClientId,
        hasClientSecret,
        hasRefreshToken,
        hasFolderId,
        message: `Missing Google Drive environment credentials: ${missing.join(', ')}.`
      };
    }

    try {
      const folderCheck = await this.verifyRootFolder();
      if (!folderCheck.valid) {
        return {
          configured: true,
          connected: false,
          hasClientId,
          hasClientSecret,
          hasRefreshToken,
          hasFolderId,
          folderId: folderCheck.folderId,
          message: folderCheck.error || 'Could not access Google Drive root folder.',
          error: folderCheck.error
        };
      }

      return {
        configured: true,
        connected: true,
        hasClientId,
        hasClientSecret,
        hasRefreshToken,
        hasFolderId,
        folderId: folderCheck.folderId,
        folderName: folderCheck.folderName,
        message: `Connected successfully to Google Drive folder: "${folderCheck.folderName}" (${folderCheck.folderId})`
      };
    } catch (err: any) {
      return {
        configured: true,
        connected: false,
        hasClientId,
        hasClientSecret,
        hasRefreshToken,
        hasFolderId,
        message: `Google Drive connection error: ${err.message}`,
        error: err.message
      };
    }
  }
}

export const googleDriveService = new GoogleDriveService();
