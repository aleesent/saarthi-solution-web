import 'dotenv/config';
import express from 'express';
import path from 'path';
import multer from 'multer';
import { storageService } from './server/storageService';
import { googleDriveService } from './server/googleDriveService';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Body parsing middlewares
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Multer in-memory storage for handling streaming uploads
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 100 * 1024 * 1024 // 100MB max upload
    }
  });

  // ==============================================================================
  // GOOGLE DRIVE OAUTH 2.0 ROUTES
  // ==============================================================================

  /**
   * GET /auth/google
   * Redirects user to Google OAuth 2.0 consent screen requesting offline access
   */
  app.get('/auth/google', (req, res) => {
    // Check if OAuth route has been locked
    if (process.env.DISABLE_GOOGLE_OAUTH_SETUP === 'true') {
      return res.status(403).send(`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <title>OAuth Setup Disabled</title>
            <style>
              body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
              .card { background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 32px; max-width: 500px; text-align: center; }
              h1 { color: #f59e0b; font-size: 20px; margin-bottom: 12px; }
              p { color: #94a3b8; font-size: 14px; line-height: 1.6; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>OAuth Setup is Disabled</h1>
              <p>Google OAuth setup has been locked via DISABLE_GOOGLE_OAUTH_SETUP=true for production security.</p>
            </div>
          </body>
        </html>
      `);
    }

    const hostOrigin = `${req.protocol}://${req.get('host')}`;
    const redirectUri = googleDriveService.getRedirectUri(hostOrigin);

    try {
      const authUrl = googleDriveService.generateAuthUrl(redirectUri);
      res.redirect(authUrl);
    } catch (err: any) {
      res.status(400).send(`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <title>Google OAuth Setup Error</title>
            <style>
              body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
              .card { background: #1e293b; border: 1px solid #dc2626; border-radius: 16px; padding: 32px; max-width: 560px; }
              h1 { color: #ef4444; font-size: 20px; margin-bottom: 12px; }
              p { color: #cbd5e1; font-size: 14px; line-height: 1.6; }
              code { background: #0f172a; padding: 3px 6px; border-radius: 6px; color: #38bdf8; font-family: monospace; }
              .steps { background: #0f172a; border-radius: 10px; padding: 16px; margin: 16px 0; font-size: 13px; color: #94a3b8; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>Missing Google OAuth Credentials</h1>
              <p>${err.message}</p>
              <div class="steps">
                <b>Required Environment Variables:</b><br />
                1. <code>GOOGLE_DRIVE_CLIENT_ID</code><br />
                2. <code>GOOGLE_DRIVE_CLIENT_SECRET</code><br />
                3. <code>GOOGLE_REDIRECT_URI</code> (Optional, defaults to <code>${redirectUri}</code>)
              </div>
              <p>Please add these credentials in your Render Web Service Environment Settings or <code>.env</code> and restart the app.</p>
            </div>
          </body>
        </html>
      `);
    }
  });

  /**
   * GET /auth/google/callback
   * Receives Google authorization code, exchanges it for refresh token, and presents it securely
   */
  app.get('/auth/google/callback', async (req, res) => {
    const { code, error, error_description } = req.query;
    const hostOrigin = `${req.protocol}://${req.get('host')}`;
    const redirectUri = googleDriveService.getRedirectUri(hostOrigin);

    if (error) {
      return res.status(400).send(`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <title>OAuth Consent Denied</title>
            <style>
              body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
              .card { background: #1e293b; border: 1px solid #ef4444; border-radius: 16px; padding: 32px; max-width: 560px; text-align: center; }
              h1 { color: #ef4444; font-size: 22px; margin-bottom: 12px; }
              p { color: #94a3b8; font-size: 14px; line-height: 1.6; }
              a { display: inline-block; margin-top: 20px; background: #2563eb; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>Google Authorization Failed</h1>
              <p>Google returned error: <b>${error}</b></p>
              ${error_description ? `<p>${error_description}</p>` : ''}
              <a href="/auth/google">Try Again</a>
            </div>
          </body>
        </html>
      `);
    }

    if (!code || typeof code !== 'string') {
      return res.status(400).send('Invalid request: Missing authorization code.');
    }

    try {
      const tokens = await googleDriveService.exchangeCodeForTokens(code, redirectUri);
      const refreshToken = tokens.refresh_token;

      if (!refreshToken) {
        return res.send(`
          <!DOCTYPE html>
          <html lang="en">
            <head>
              <meta charset="UTF-8" />
              <title>Google Drive Refresh Token</title>
              <style>
                body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
                .card { background: #1e293b; border: 1px solid #f59e0b; border-radius: 16px; padding: 32px; max-width: 600px; }
                h1 { color: #f59e0b; font-size: 20px; margin-bottom: 12px; }
                p { color: #cbd5e1; font-size: 14px; line-height: 1.6; }
                a { display: inline-block; margin-top: 16px; background: #2563eb; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; }
              </style>
            </head>
            <body>
              <div class="card">
                <h1>Notice: No Refresh Token Returned</h1>
                <p>Google only issues a new refresh token when explicit consent is requested. Since your Google account previously consented to this OAuth Client, Google provided only an access token.</p>
                <p>Click below to re-request consent with force prompt:</p>
                <a href="/auth/google">Re-Authorize with Force Consent</a>
              </div>
            </body>
          </html>
        `);
      }

      // Render Secure Token Display Page
      res.send(`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <title>Google Drive OAuth Success - Sarthi Solutions</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <style>
              body { font-family: system-ui, -apple-system, sans-serif; background: #090d16; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 24px; }
              .container { background: #131d2e; border: 1px solid #1e293b; border-radius: 20px; max-width: 680px; width: 100%; padding: 36px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
              .badge { display: inline-flex; align-items: center; gap: 6px; background: #064e3b; color: #34d399; font-size: 12px; font-weight: bold; padding: 4px 12px; border-radius: 9999px; margin-bottom: 16px; }
              h1 { font-size: 24px; font-weight: 800; color: #ffffff; margin: 0 0 8px 0; }
              p { color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0; }
              .token-box { background: #080c14; border: 1px solid #1e3a5f; border-radius: 12px; padding: 16px; margin-bottom: 24px; position: relative; }
              .token-label { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #38bdf8; letter-spacing: 0.05em; margin-bottom: 8px; }
              .token-val { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 13px; color: #34d399; word-break: break-all; user-select: all; line-height: 1.5; background: #0d1522; padding: 12px; border-radius: 8px; border: 1px dashed #334155; }
              .btn-copy { margin-top: 12px; background: #2563eb; hover:background: #1d4ed8; color: #ffffff; border: none; border-radius: 8px; padding: 10px 18px; font-weight: 700; font-size: 13px; cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center; gap: 8px; }
              .btn-copy:hover { background: #1d4ed8; }
              .steps { background: #0d1522; border-radius: 12px; border: 1px solid #1e293b; padding: 20px; margin-bottom: 24px; }
              .steps h3 { font-size: 14px; color: #f1f5f9; margin: 0 0 12px 0; font-weight: 700; }
              .steps ol { margin: 0; padding-left: 20px; color: #94a3b8; font-size: 13px; line-height: 1.8; }
              .steps code { background: #1e293b; color: #38bdf8; padding: 2px 6px; border-radius: 4px; font-size: 12px; font-family: monospace; }
              .footer-links { display: flex; gap: 12px; }
              .btn-admin { background: #1e293b; color: #f8fafc; text-decoration: none; padding: 10px 18px; border-radius: 8px; font-size: 13px; font-weight: 600; border: 1px solid #334155; display: inline-block; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="badge">✓ Google OAuth 2.0 Authorized</div>
              <h1>Google Drive Refresh Token Generated</h1>
              <p>Your Google Drive OAuth 2.0 authorization was successful. Copy the refresh token below and save it into your Render Web Service Environment Settings or local <code>.env</code> file.</p>

              <div class="token-box">
                <div class="token-label">GOOGLE_DRIVE_REFRESH_TOKEN</div>
                <div class="token-val" id="tokenValue">${refreshToken}</div>
                <button class="btn-copy" onclick="copyToken()">📋 Copy Refresh Token</button>
              </div>

              <div class="steps">
                <h3>Next Steps for Render Deployment:</h3>
                <ol>
                  <li>Open your <b>Render Dashboard</b> &gt; Web Service (<code>saarthi-solution-web</code>) &gt; <b>Environment</b>.</li>
                  <li>Set key <code>GOOGLE_DRIVE_REFRESH_TOKEN</code> to the value copied above.</li>
                  <li>Ensure <code>GOOGLE_DRIVE_FOLDER_ID</code> is set to your Google Drive root folder ID (from the folder URL).</li>
                  <li>Click <b>Save Changes</b> to redeploy. All future PDF/document uploads will sync automatically!</li>
                </ol>
              </div>

              <div class="footer-links">
                <a href="/admin" class="btn-admin">Return to Admin Dashboard</a>
                <a href="/api/storage/health" class="btn-admin" target="_blank">Verify Storage Health API</a>
              </div>
            </div>

            <script>
              function copyToken() {
                const text = document.getElementById('tokenValue').innerText.trim();
                navigator.clipboard.writeText(text).then(() => {
                  alert('Refresh token copied to clipboard! Paste it into your Render environment variables.');
                });
              }
            </script>
          </body>
        </html>
      `);
    } catch (err: any) {
      console.error('[OAuth /auth/google/callback] Error:', err);
      res.status(500).send(`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <title>OAuth Token Exchange Error</title>
            <style>
              body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
              .card { background: #1e293b; border: 1px solid #ef4444; border-radius: 16px; padding: 32px; max-width: 560px; }
              h1 { color: #ef4444; font-size: 20px; margin-bottom: 12px; }
              p { color: #cbd5e1; font-size: 14px; line-height: 1.6; }
              code { background: #0f172a; color: #f87171; padding: 4px 8px; border-radius: 6px; font-family: monospace; display: block; margin: 12px 0; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>OAuth Token Exchange Failed</h1>
              <p>An error occurred while exchanging the authorization code with Google OAuth servers:</p>
              <code>${err.message}</code>
              <p>Verify that your <code>GOOGLE_DRIVE_CLIENT_ID</code>, <code>GOOGLE_DRIVE_CLIENT_SECRET</code>, and redirect URI (<code>${redirectUri}</code>) match your Google Cloud Console OAuth 2.0 Client credentials.</p>
            </div>
          </body>
        </html>
      `);
    }
  });

  // ==============================================================================
  // API ROUTES
  // ==============================================================================

  // System Health
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Sarthi Solutions Recruitment & Storage Backend',
      timestamp: new Date().toISOString()
    });
  });

  // Storage Health & Provider Status
  app.get('/api/storage/health', async (req, res) => {
    try {
      const health = await storageService.getHealthStatus();
      res.json(health);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Google Drive Connection Test
  app.get('/api/storage/test-drive', async (req, res) => {
    try {
      const status = await googleDriveService.getConnectionStatus();
      res.json(status);
    } catch (err: any) {
      res.status(500).json({ configured: false, connected: false, error: err.message });
    }
  });

  // List all stored files
  app.get('/api/storage/files', async (req, res) => {
    try {
      const { provider, relatedEntityType, search, limit } = req.query;
      const files = await storageService.listFiles({
        provider: provider as any,
        relatedEntityType: relatedEntityType as string,
        search: search as string,
        limit: limit ? parseInt(limit as string, 10) : undefined
      });
      res.json({ success: true, count: files.length, files });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Get single file metadata
  app.get('/api/storage/files/:id', async (req, res) => {
    try {
      const file = await storageService.getFileById(req.params.id);
      if (!file) {
        return res.status(404).json({ success: false, error: 'File not found' });
      }
      res.json({ success: true, file });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Upload file (determines Google Drive vs Supabase Storage automatically)
  app.post('/api/storage/upload', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'No file provided in form-data payload' });
      }

      const {
        relatedEntityType,
        relatedEntityId,
        uploadedBy,
        userId,
        customFolder,
        metadata
      } = req.body;

      let parsedMeta = {};
      if (metadata) {
        try {
          parsedMeta = typeof metadata === 'string' ? JSON.parse(metadata) : metadata;
        } catch {}
      }

      const fileRecord = await storageService.uploadFile({
        buffer: req.file.buffer,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        relatedEntityType,
        relatedEntityId,
        uploadedBy,
        userId,
        customFolder,
        metadata: parsedMeta
      });

      res.status(201).json({
        success: true,
        message: `File successfully saved via ${fileRecord.storage_provider === 'google_drive' ? 'Google Drive' : 'Supabase Storage'}`,
        file: fileRecord
      });
    } catch (err: any) {
      console.error('[API /api/storage/upload] Error:', err);
      res.status(500).json({ success: false, error: err.message || 'File upload failed' });
    }
  });

  // Replace existing file
  app.put('/api/storage/files/:id/replace', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'No replacement file provided' });
      }

      const fileRecord = await storageService.replaceFile(req.params.id, {
        buffer: req.file.buffer,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        uploadedBy: req.body.uploadedBy
      });

      res.json({
        success: true,
        message: 'File replaced successfully',
        file: fileRecord
      });
    } catch (err: any) {
      console.error('[API /api/storage/files/:id/replace] Error:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Delete file
  app.delete('/api/storage/files/:id', async (req, res) => {
    try {
      const result = await storageService.deleteFile(req.params.id);
      if (!result.success) {
        return res.status(404).json(result);
      }
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ==============================================================================
  // STRUCTURED DATA API ROUTES (SUPABASE POSTGRESQL) - FORMS & CANDIDATES
  // ==============================================================================

  // 1. Contact Form Submissions (Direct to Supabase, NO Google Drive file created)
  app.post('/api/contact', async (req, res) => {
    try {
      const { name, email, phone, subject, userType, message } = req.body;
      if (!name || !email || !phone || !message) {
        return res.status(400).json({ success: false, error: 'Name, email, phone, and message are required' });
      }

      const submission = await storageService.saveContactSubmission({
        name,
        email,
        phone,
        subject,
        userType,
        message
      });

      res.status(201).json({
        success: true,
        message: 'Your inquiry has been recorded in our Supabase database. Our team will contact you shortly.',
        data: submission
      });
    } catch (err: any) {
      console.error('[API /api/contact] Error:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Get Contact Form Submissions
  app.get('/api/contact', async (req, res) => {
    try {
      const supabase = (storageService as any).initSupabase?.() || (storageService as any).supabase;
      if (supabase) {
        const { data, error } = await supabase
          .from('contact_submissions')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          return res.json({ success: true, count: data.length, data });
        }
      }
      res.json({ success: true, count: 0, data: [] });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 2. Job Applications (Structured data in Supabase + Resume PDF/Doc in Google Drive)
  app.post('/api/job-applications', upload.single('resume'), async (req, res) => {
    try {
      const {
        jobId,
        jobTitle,
        candidateName,
        email,
        phone,
        whatsapp,
        qualification,
        experience,
        currentLocation,
        currentCTC,
        expectedCTC,
        noticePeriod,
        coverLetter
      } = req.body;

      if (!jobId || !candidateName || !email || !phone) {
        return res.status(400).json({ success: false, error: 'Job ID, candidate name, email, and phone are required' });
      }

      let resumeFileRecord: any = null;

      // If a resume file is uploaded (PDF / DOC), route to Google Drive
      if (req.file) {
        resumeFileRecord = await storageService.uploadFile({
          buffer: req.file.buffer,
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          relatedEntityType: 'application_resume',
          relatedEntityId: jobId,
          uploadedBy: candidateName,
          metadata: {
            jobId,
            jobTitle,
            candidateEmail: email,
            candidatePhone: phone
          }
        });
      }

      // Save structured record into Supabase job_applications table
      const applicationRecord = await storageService.saveJobApplication({
        jobId,
        jobTitle: jobTitle || 'Position Application',
        candidateName,
        email,
        phone,
        whatsapp,
        qualification,
        experience,
        currentLocation,
        currentCTC,
        expectedCTC,
        noticePeriod,
        coverLetter,
        resumeFileId: resumeFileRecord?.id,
        resumeUrl: resumeFileRecord?.download_url || resumeFileRecord?.google_drive_url,
        resumeGoogleDriveUrl: resumeFileRecord?.google_drive_url,
        resumeFileName: resumeFileRecord?.original_file_name || req.file?.originalname
      });

      res.status(201).json({
        success: true,
        message: 'Application submitted successfully! Structured data stored in Supabase PostgreSQL, resume stored in Google Drive.',
        data: applicationRecord,
        resumeFile: resumeFileRecord
      });
    } catch (err: any) {
      console.error('[API /api/job-applications] Error:', err);
      res.status(500).json({ success: false, error: err.message || 'Job application submission failed' });
    }
  });

  // Get Job Applications
  app.get('/api/job-applications', async (req, res) => {
    try {
      const supabase = (storageService as any).initSupabase?.() || (storageService as any).supabase;
      if (supabase) {
        const { data, error } = await supabase
          .from('job_applications')
          .select('*, files:resume_file_id(*)')
          .order('created_at', { ascending: false });

        if (!error && data) {
          return res.json({ success: true, count: data.length, data });
        }
      }
      res.json({ success: true, count: 0, data: [] });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Download / View redirect or direct stream helper
  app.get('/api/storage/files/:id/content', async (req, res) => {
    try {
      const file = await storageService.getFileById(req.params.id);
      if (!file) {
        return res.status(404).send('File not found');
      }

      if (file.storage_provider === 'google_drive' && file.google_drive_file_id) {
        if (!file.google_drive_file_id.startsWith('mock_') && !file.google_drive_file_id.startsWith('dev_')) {
          try {
            const { metadata, stream } = await googleDriveService.getFileStream(file.google_drive_file_id);
            res.setHeader('Content-Type', metadata.mimeType || file.mime_type || 'application/octet-stream');
            res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(file.original_file_name)}"`);
            return (stream as any).pipe(res);
          } catch (streamErr) {
            console.warn('[API /api/storage/files/:id/content] Stream fallback to URL redirect:', streamErr);
          }
        }
      }

      if (file.google_drive_view_url) {
        return res.redirect(file.google_drive_view_url);
      } else if (file.google_drive_url) {
        return res.redirect(file.google_drive_url);
      } else if (file.download_url) {
        return res.redirect(file.download_url);
      }

      res.status(404).send('No file content available');
    } catch (err: any) {
      res.status(500).send(err.message);
    }
  });

  // Download redirect helper
  app.get('/api/storage/files/:id/download', async (req, res) => {
    try {
      const file = await storageService.getFileById(req.params.id);
      if (!file) {
        return res.status(404).send('File not found');
      }

      if (file.download_url) {
        return res.redirect(file.download_url);
      } else if (file.google_drive_url) {
        return res.redirect(file.google_drive_url);
      }

      res.status(404).send('No download URL available for this file');
    } catch (err: any) {
      res.status(500).send(err.message);
    }
  });

  // ==============================================================================
  // VITE MIDDLEWARE & STATIC ASSET SERVING
  // ==============================================================================
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Sarthi Solutions server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
