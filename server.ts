import 'dotenv/config';
import express from 'express';
import path from 'path';
import multer from 'multer';
import { storageService } from './server/storageService';

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
  app.get('/api/storage/health', (req, res) => {
    try {
      const health = storageService.getHealthStatus();
      res.json(health);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
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

  // Download / View redirect helper
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
