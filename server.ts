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
      fileSize: 50 * 1024 * 1024 // 50MB max upload
    }
  });

  // ==============================================================================
  // SYSTEM & STORAGE HEALTH API ROUTES
  // ==============================================================================

  // System Health
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Saarthi Solutions Supabase-Powered Backend',
      storageProvider: 'Supabase Storage',
      databaseProvider: 'Supabase PostgreSQL',
      timestamp: new Date().toISOString()
    });
  });

  // Storage Health & Provider Status (100% Supabase)
  app.get('/api/storage/health', async (req, res) => {
    try {
      const health = await storageService.getHealthStatus();
      res.json(health);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // List all stored files from Supabase
  app.get('/api/storage/files', async (req, res) => {
    try {
      const { relatedEntityType, search, limit } = req.query;
      const files = await storageService.listFiles({
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

  // Upload file directly to Supabase Storage
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
        message: `File successfully saved in Supabase Storage [${fileRecord.bucket || 'resumes'}]`,
        file: fileRecord
      });
    } catch (err: any) {
      console.error('[API /api/storage/upload] Error:', err);
      res.status(500).json({ success: false, error: err.message || 'File upload failed' });
    }
  });

  // Replace existing file in Supabase Storage
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
        message: 'File replaced successfully in Supabase Storage',
        file: fileRecord
      });
    } catch (err: any) {
      console.error('[API /api/storage/files/:id/replace] Error:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Delete file from Supabase Storage and database
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
  // APPLICATION API ROUTES (SUPABASE POSTGRESQL & STORAGE)
  // ==============================================================================

  // 1. Contact Form Submissions
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

  app.get(['/api/contact', '/api/contact-submissions'], async (req, res) => {
    try {
      const data = await storageService.getContactSubmissions();
      res.json({ success: true, count: data.length, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete(['/api/contact/:id', '/api/contact-submissions/:id'], async (req, res) => {
    try {
      const result = await storageService.deleteContactSubmission(req.params.id);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 2. Job Applications (Direct to Supabase Storage + PostgreSQL)
  app.post(
    '/api/job-applications',
    upload.fields([
      { name: 'resume', maxCount: 1 },
      { name: 'photo', maxCount: 1 },
      { name: 'profilePhoto', maxCount: 1 }
    ]),
    async (req, res) => {
      try {
        const {
          id,
          jobId,
          job_id,
          jobTitle,
          job_title,
          candidateName,
          candidate_name,
          email,
          phone,
          whatsapp,
          qualification,
          experience,
          currentLocation,
          current_location,
          currentCTC,
          current_ctc,
          expectedCTC,
          expected_ctc,
          noticePeriod,
          notice_period,
          coverLetter,
          cover_letter,
          status,
          photoUrl,
          photo_url,
          resumeUrl,
          resume_url,
          resumeFileName,
          resume_file_name,
          resumeFileId,
          resume_file_id
        } = req.body;

        const targetJobId = jobId || job_id;
        const targetCandidateName = candidateName || candidate_name;

        if (!targetJobId || !targetCandidateName || !email || !phone) {
          return res.status(400).json({ success: false, error: 'Job ID, candidate name, email, and phone are required' });
        }

        const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
        const resumeFile = files?.['resume']?.[0] || (req.file?.fieldname === 'resume' ? req.file : undefined);
        const photoFile =
          files?.['photo']?.[0] ||
          files?.['profilePhoto']?.[0] ||
          (req.file?.fieldname === 'photo' || req.file?.fieldname === 'profilePhoto' ? req.file : undefined);

        let resumeFileRecord: any = null;
        let photoFileRecord: any = null;

        // 1. Profile photo -> Supabase Storage (assets bucket)
        if (photoFile) {
          try {
            photoFileRecord = await storageService.uploadFile({
              buffer: photoFile.buffer,
              originalname: photoFile.originalname,
              mimetype: photoFile.mimetype,
              size: photoFile.size,
              relatedEntityType: 'candidate_photo',
              relatedEntityId: targetCandidateName,
              uploadedBy: targetCandidateName
            });
          } catch (photoErr: any) {
            console.warn('[API /api/job-applications] Photo upload note:', photoErr.message);
          }
        }

        // 2. Resume / CV -> Supabase Storage (resumes bucket)
        if (resumeFile) {
          resumeFileRecord = await storageService.uploadFile({
            buffer: resumeFile.buffer,
            originalname: resumeFile.originalname,
            mimetype: resumeFile.mimetype,
            size: resumeFile.size,
            relatedEntityType: 'application_resume',
            relatedEntityId: targetJobId,
            uploadedBy: targetCandidateName,
            metadata: {
              jobId: targetJobId,
              jobTitle: jobTitle || job_title,
              candidateEmail: email,
              candidatePhone: phone
            }
          });
        }

        const finalPhotoUrl =
          photoFileRecord?.download_url ||
          photoFileRecord?.thumbnail_url ||
          photoUrl ||
          photo_url ||
          null;

        const finalResumeFileId =
          resumeFileRecord?.id ||
          resumeFileId ||
          resume_file_id ||
          null;

        const finalResumeUrl =
          resumeFileRecord?.download_url ||
          resumeUrl ||
          resume_url ||
          null;

        const finalResumeFileName =
          resumeFileRecord?.original_file_name ||
          resumeFile?.originalname ||
          resumeFileName ||
          resume_file_name ||
          null;

        // 3. Save structured record in Supabase job_applications table
        const applicationRecord = await storageService.saveJobApplication({
          id,
          jobId: targetJobId,
          jobTitle: jobTitle || job_title || 'Position Application',
          candidateName: targetCandidateName,
          email,
          phone,
          whatsapp: whatsapp || phone,
          qualification,
          experience,
          currentLocation: currentLocation || current_location,
          currentCTC: currentCTC || current_ctc,
          expectedCTC: expectedCTC || expected_ctc,
          noticePeriod: noticePeriod || notice_period,
          coverLetter: coverLetter || cover_letter,
          status: status || 'Pending Review',
          photoUrl: finalPhotoUrl,
          photoStoragePath: photoFileRecord?.storage_path,
          resumeFileId: finalResumeFileId,
          resumeUrl: finalResumeUrl,
          resumeFileName: finalResumeFileName
        });

        res.status(201).json({
          success: true,
          message: 'Application submitted successfully! Resume and profile stored securely in Supabase.',
          data: applicationRecord,
          resumeFile: resumeFileRecord,
          photoFile: photoFileRecord
        });
      } catch (err: any) {
        console.error('[API /api/job-applications] Error:', err);
        res.status(500).json({ success: false, error: err.message || 'Job application submission failed' });
      }
    }
  );

  app.get('/api/job-applications', async (req, res) => {
    try {
      const data = await storageService.getJobApplications();
      res.json({ success: true, count: data.length, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.put('/api/job-applications/:id', async (req, res) => {
    try {
      const applicationRecord = await storageService.saveJobApplication({
        ...req.body,
        id: req.params.id
      });
      res.json({ success: true, data: applicationRecord, message: 'Job application updated in Supabase' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/job-applications/:id', async (req, res) => {
    try {
      const result = await storageService.deleteJobApplication(req.params.id);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 3. Candidates (Supabase Storage + PostgreSQL)
  app.post(
    '/api/candidates',
    upload.fields([
      { name: 'resume', maxCount: 1 },
      { name: 'photo', maxCount: 1 },
      { name: 'profilePhoto', maxCount: 1 }
    ]),
    async (req, res) => {
      try {
        const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
        const resumeFile = files?.['resume']?.[0] || (req.file?.fieldname === 'resume' ? req.file : undefined);
        const photoFile =
          files?.['photo']?.[0] ||
          files?.['profilePhoto']?.[0] ||
          (req.file?.fieldname === 'photo' || req.file?.fieldname === 'profilePhoto' ? req.file : undefined);

        let candidateData = { ...req.body };

        // 1. Photo -> Supabase Storage (assets bucket)
        if (photoFile) {
          try {
            const photoRecord = await storageService.uploadFile({
              buffer: photoFile.buffer,
              originalname: photoFile.originalname,
              mimetype: photoFile.mimetype,
              size: photoFile.size,
              relatedEntityType: 'candidate_photo',
              relatedEntityId: candidateData.fullName || 'Candidate',
              uploadedBy: candidateData.fullName || 'Candidate'
            });
            candidateData.photoUrl = photoRecord.download_url || photoRecord.thumbnail_url;
            candidateData.photoStoragePath = photoRecord.storage_path;
          } catch (pErr: any) {
            console.warn('[API /api/candidates] Photo upload note:', pErr.message);
          }
        }

        // 2. Resume -> Supabase Storage (resumes bucket)
        if (resumeFile) {
          const resumeRecord = await storageService.uploadFile({
            buffer: resumeFile.buffer,
            originalname: resumeFile.originalname,
            mimetype: resumeFile.mimetype,
            size: resumeFile.size,
            relatedEntityType: 'candidate_resume',
            relatedEntityId: candidateData.id || candidateData.fullName,
            uploadedBy: candidateData.fullName || 'Candidate'
          });
          candidateData.resumeFileId = resumeRecord.id;
          candidateData.resumeUrl = resumeRecord.download_url;
          candidateData.resumeFileName = resumeRecord.original_file_name;
        }

        const candidateRecord = await storageService.saveCandidate(candidateData);
        res.status(200).json({
          success: true,
          message: 'Candidate profile and resume saved to Supabase successfully',
          data: candidateRecord
        });
      } catch (err: any) {
        console.error('[API /api/candidates] Error:', err);
        res.status(500).json({ success: false, error: err.message });
      }
    }
  );

  app.get('/api/candidates', async (req, res) => {
    try {
      const data = await storageService.getCandidates();
      res.json({ success: true, count: data.length, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.put('/api/candidates/:id', async (req, res) => {
    try {
      const candidateRecord = await storageService.saveCandidate({
        ...req.body,
        id: req.params.id
      });
      res.json({ success: true, data: candidateRecord, message: 'Candidate updated in Supabase' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/candidates/:id', async (req, res) => {
    try {
      const result = await storageService.deleteCandidate(req.params.id);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 4. Invoices (Supabase Storage + PostgreSQL)
  app.post('/api/invoices', async (req, res) => {
    try {
      const invoiceRecord = await storageService.saveInvoice(req.body);
      res.status(200).json({
        success: true,
        message: 'Invoice and PDF record saved to Supabase',
        data: invoiceRecord
      });
    } catch (err: any) {
      console.error('[API /api/invoices] Error:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get('/api/invoices', async (req, res) => {
    try {
      const data = await storageService.getInvoices();
      res.json({ success: true, count: data.length, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.put('/api/invoices/:id', async (req, res) => {
    try {
      const record = await storageService.saveInvoice({
        ...req.body,
        id: req.params.id
      });
      res.json({ success: true, data: record, message: 'Invoice updated in Supabase' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/invoices/:id', async (req, res) => {
    try {
      const result = await storageService.deleteInvoice(req.params.id);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 5. Testimonials & Client Reviews (Supabase Storage + PostgreSQL)
  app.post(
    '/api/testimonials',
    upload.fields([
      { name: 'pfp', maxCount: 1 },
      { name: 'avatar', maxCount: 1 },
      { name: 'photo', maxCount: 1 },
      { name: 'image', maxCount: 1 }
    ]),
    async (req, res) => {
      try {
        const {
          id,
          name,
          role,
          company,
          location,
          content,
          review,
          rating,
          avatar,
          image,
          type,
          category,
          status,
          is_approved,
          isApproved,
          submitted_by,
          submittedBy,
          created_at,
          createdAt
        } = req.body;

        const reviewContent = content || review;
        if (!name || !reviewContent) {
          return res.status(400).json({ success: false, error: 'Author name and review content are required' });
        }

        const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
        const pfpFile =
          files?.['pfp']?.[0] ||
          files?.['avatar']?.[0] ||
          files?.['photo']?.[0] ||
          files?.['image']?.[0] ||
          (req.file ? req.file : undefined);

        let uploadedPfpRecord: any = null;
        if (pfpFile) {
          try {
            uploadedPfpRecord = await storageService.uploadFile({
              buffer: pfpFile.buffer,
              originalname: pfpFile.originalname,
              mimetype: pfpFile.mimetype,
              size: pfpFile.size,
              relatedEntityType: 'testimonial_avatar',
              relatedEntityId: name || 'Reviewer',
              uploadedBy: name || 'Visitor',
              customFolder: 'Testimonial_Avatars'
            });
          } catch (uploadErr: any) {
            console.warn('[API /api/testimonials] Avatar upload note:', uploadErr.message);
          }
        }

        const finalAvatar =
          uploadedPfpRecord?.download_url ||
          uploadedPfpRecord?.thumbnail_url ||
          avatar ||
          image ||
          null;

        const reviewCategory = category || type || 'Candidate';

        const testimonialRecord = await storageService.saveTestimonial({
          id,
          name,
          role: role || (reviewCategory === 'Employer' ? 'Client' : reviewCategory === 'Candidate' ? 'Placed Candidate' : 'Client Feedback'),
          company: company || (reviewCategory === 'Employer' ? 'Partner Enterprise' : 'Gujarat Industry'),
          location: location || 'Gujarat',
          content: reviewContent,
          review: reviewContent,
          rating: Number(rating) || 5,
          avatar: finalAvatar,
          image: finalAvatar,
          type: reviewCategory,
          category: reviewCategory,
          status: status || (is_approved === true || isApproved === true ? 'approved' : 'pending'),
          is_approved: status === 'approved' || is_approved === true || isApproved === true,
          submitted_by: submitted_by || submittedBy || 'Visitor',
          created_at: created_at || createdAt
        });

        res.status(200).json({
          success: true,
          message: `Review saved successfully in Supabase (Status: ${testimonialRecord.status})`,
          data: testimonialRecord,
          pfpFile: uploadedPfpRecord
        });
      } catch (err: any) {
        console.error('[API /api/testimonials] Error:', err);
        res.status(500).json({ success: false, error: err.message });
      }
    }
  );

  app.get('/api/testimonials', async (req, res) => {
    try {
      const statusFilter = typeof req.query.status === 'string' ? req.query.status : undefined;
      const testimonials = await storageService.getTestimonials({ status: statusFilter });
      res.json({ success: true, count: testimonials.length, data: testimonials });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Update Testimonial Status
  app.patch('/api/testimonials/:id/status', async (req, res) => {
    try {
      const { status } = req.body;
      if (!status || !['approved', 'pending', 'rejected'].includes(status)) {
        return res.status(400).json({ success: false, error: 'Valid status is required ("approved" | "pending" | "rejected")' });
      }

      const result = await storageService.updateTestimonialStatus(req.params.id, status as any);
      res.json({
        success: true,
        message: `Testimonial status updated to "${status}"`,
        data: result
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.put('/api/testimonials/:id/status', async (req, res) => {
    try {
      const { status } = req.body;
      if (!status || !['approved', 'pending', 'rejected'].includes(status)) {
        return res.status(400).json({ success: false, error: 'Valid status is required ("approved" | "pending" | "rejected")' });
      }

      const result = await storageService.updateTestimonialStatus(req.params.id, status as any);
      res.json({
        success: true,
        message: `Testimonial status updated to "${status}"`,
        data: result
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.put('/api/testimonials/:id', async (req, res) => {
    try {
      const testimonialRecord = await storageService.saveTestimonial({
        ...req.body,
        id: req.params.id
      });
      res.json({
        success: true,
        message: 'Testimonial updated successfully in Supabase',
        data: testimonialRecord
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/testimonials/:id', async (req, res) => {
    try {
      const result = await storageService.deleteTestimonial(req.params.id);
      res.json({ success: true, message: result.message });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 6. Placements (Supabase PostgreSQL)
  app.post('/api/placements', async (req, res) => {
    try {
      const record = await storageService.savePlacement(req.body);
      res.json({ success: true, data: record });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get('/api/placements', async (req, res) => {
    try {
      const data = await storageService.getPlacements();
      res.json({ success: true, count: data.length, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.put('/api/placements/:id', async (req, res) => {
    try {
      const record = await storageService.savePlacement({ ...req.body, id: req.params.id });
      res.json({ success: true, data: record, message: 'Placement updated in Supabase' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/placements/:id', async (req, res) => {
    try {
      const result = await storageService.deletePlacement(req.params.id);
      res.json({ success: true, message: result.message });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 7. Services (Supabase PostgreSQL)
  app.post('/api/services', async (req, res) => {
    try {
      const record = await storageService.saveService(req.body);
      res.json({ success: true, data: record });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get('/api/services', async (req, res) => {
    try {
      const data = await storageService.getServices();
      res.json({ success: true, count: data.length, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.put('/api/services/:id', async (req, res) => {
    try {
      const record = await storageService.saveService({ ...req.body, id: req.params.id });
      res.json({ success: true, data: record, message: 'Service updated in Supabase' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/services/:id', async (req, res) => {
    try {
      const result = await storageService.deleteService(req.params.id);
      res.json({ success: true, message: result.message });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 8. Employers & Submit Job Description (Supabase Storage + PostgreSQL)
  app.post(
    '/api/employers/submit-jd',
    upload.single('jdFile'),
    async (req, res) => {
      try {
        const {
          id,
          companyName,
          jobTitle,
          industry,
          location,
          salaryOffered,
          experienceRequired,
          qualificationNeeded,
          description,
          contactName,
          contactPerson,
          phone,
          email,
          hiringUrgency,
          notes
        } = req.body;

        const effectiveCompanyName = (companyName || (contactName || contactPerson ? `${contactName || contactPerson}'s Enterprise` : 'Corporate Employer')).trim();
        const effectiveContact = (contactName || contactPerson || 'HR Lead').trim();
        const effectivePhone = (phone || '+91 98243 22206').trim();
        const effectiveEmail = (email || `${effectiveCompanyName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'hr'}@company.com`).trim();

        let jdFileRecord: any = null;

        // Upload JD file directly to Supabase Storage ('documents' bucket)
        if (req.file) {
          jdFileRecord = await storageService.uploadFile({
            buffer: req.file.buffer,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            relatedEntityType: 'job_description',
            relatedEntityId: id || effectiveCompanyName,
            uploadedBy: effectiveContact,
            customFolder: 'Job_Descriptions',
            metadata: {
              companyName: effectiveCompanyName,
              jobTitle: jobTitle || 'Position Mandate',
              industry: industry || 'Manufacturing & Engineering',
              location: location || 'Surat / Silvassa / Gujarat'
            }
          });
        }

        const finalJdUrl = jdFileRecord?.download_url || req.body.jdUrl || null;
        const finalFileId = jdFileRecord?.id || req.body.jdFileId || null;
        const finalFileName = jdFileRecord?.original_file_name || req.file?.originalname || req.body.jdFileName || null;
        const finalFileSize = jdFileRecord?.file_size || req.file?.size || req.body.jdFileSize || null;

        const jobDescriptionDetails = [
          jobTitle ? `Role: ${jobTitle}` : '',
          experienceRequired ? `Exp: ${experienceRequired}` : '',
          salaryOffered ? `Budget: ${salaryOffered}` : '',
          qualificationNeeded ? `Qual: ${qualificationNeeded}` : '',
          description ? `Details: ${description}` : '',
          finalJdUrl ? `[JD Document: ${finalJdUrl}]` : ''
        ].filter(Boolean).join(' | ');

        // Persist in Supabase employers table with direct file link
        const employerRecord = await storageService.saveEmployer({
          id,
          companyName: effectiveCompanyName,
          contactPerson: effectiveContact,
          phone: effectivePhone,
          email: effectiveEmail,
          industry: industry || 'Manufacturing & Engineering',
          location: location || 'Surat, Gujarat',
          status: `Mandate: ${jobTitle || 'Job Description'} (${hiringUrgency || 'Immediate'})`,
          notes: notes ? `${notes} | ${jobDescriptionDetails}` : jobDescriptionDetails,
          website: finalJdUrl || undefined,
          jdFileId: finalFileId,
          jdUrl: finalJdUrl,
          jdFileName: finalFileName,
          jdFileSize: finalFileSize
        });

        res.status(201).json({
          success: true,
          message: 'Job Description submitted successfully! Document stored in Supabase Storage and registered in Supabase database.',
          employer: employerRecord,
          file: jdFileRecord,
          downloadUrl: finalJdUrl,
          supabaseRecordId: employerRecord.id
        });
      } catch (err: any) {
        console.error('[API /api/employers/submit-jd] Error:', err);
        res.status(500).json({ success: false, error: err.message || 'Job description submission failed' });
      }
    }
  );

  app.post('/api/employers', upload.single('jdFile'), async (req, res) => {
    try {
      let payload = { ...req.body };

      if (req.file) {
        const jdFileRecord = await storageService.uploadFile({
          buffer: req.file.buffer,
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          relatedEntityType: 'job_description',
          relatedEntityId: payload.id || payload.companyName,
          uploadedBy: payload.contactPerson || 'Client Employer',
          customFolder: 'Job_Descriptions'
        });
        payload.jdUrl = jdFileRecord.download_url;
        payload.jdFileId = jdFileRecord.id;
        payload.jdFileName = jdFileRecord.original_file_name;
        payload.jdFileSize = jdFileRecord.file_size;
      }

      const record = await storageService.saveEmployer(payload);
      res.json({ success: true, data: record, message: 'Employer saved to Supabase successfully' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get('/api/employers', async (req, res) => {
    try {
      const data = await storageService.getEmployers();
      res.json({ success: true, count: data.length, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.put('/api/employers/:id', async (req, res) => {
    try {
      const record = await storageService.saveEmployer({
        ...req.body,
        id: req.params.id
      });
      res.json({ success: true, data: record, message: 'Employer updated in Supabase successfully' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/employers/:id', async (req, res) => {
    try {
      const result = await storageService.deleteEmployer(req.params.id);
      res.json({ success: true, message: result.message });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ==============================================================================
  // 9. JOBS (100% SUPABASE POSTGRESQL CRUD)
  // ==============================================================================

  app.get('/api/jobs', async (req, res) => {
    try {
      const data = await storageService.getJobs();
      res.json({ success: true, count: data.length, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/jobs', async (req, res) => {
    try {
      const record = await storageService.saveJob(req.body);
      res.status(201).json({ success: true, data: record, message: 'Job vacancy saved to Supabase database' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.put('/api/jobs/:id', async (req, res) => {
    try {
      const record = await storageService.saveJob({ ...req.body, id: req.params.id });
      res.json({ success: true, data: record, message: 'Job vacancy updated in Supabase database' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/jobs/:id', async (req, res) => {
    try {
      const result = await storageService.deleteJob(req.params.id);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ==============================================================================
  // 10. WEBSITE SETTINGS (100% SUPABASE POSTGRESQL CRUD)
  // ==============================================================================

  app.get('/api/website-settings', async (req, res) => {
    try {
      const data = await storageService.getWebsiteSettings();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.put('/api/website-settings', async (req, res) => {
    try {
      const data = await storageService.saveWebsiteSettings(req.body);
      res.json({ success: true, data, message: 'Website settings saved in Supabase database' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/website-settings', async (req, res) => {
    try {
      const data = await storageService.saveWebsiteSettings(req.body);
      res.json({ success: true, data, message: 'Website settings saved in Supabase database' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ==============================================================================
  // 11. DATABASE STATS & SYSTEM SYNCHRONIZATION
  // ==============================================================================

  app.get(['/api/database/stats', '/api/storage/database-stats'], async (req, res) => {
    try {
      const stats = await storageService.getDatabaseStats();
      res.json(stats);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/sync-all-to-supabase', async (req, res) => {
    try {
      const seedResult = await storageService.seedInitialDataToSupabase();
      const stats = await storageService.getDatabaseStats();
      res.json({
        success: true,
        message: 'All application records are verified and synchronized in Supabase database & storage',
        seedResult,
        stats
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Download / View content helper for Supabase files
  app.get('/api/storage/files/:id/content', async (req, res) => {
    try {
      const cached = storageService.getFileBuffer(req.params.id);
      if (cached) {
        res.setHeader('Content-Type', cached.mime_type || 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(cached.file_name)}"`);
        return res.send(cached.buffer);
      }

      const file = await storageService.getFileById(req.params.id);
      if (!file) {
        return res.status(404).send('File not found');
      }

      if (file.download_url && file.download_url !== `/api/storage/files/${file.id}/content`) {
        return res.redirect(file.download_url);
      }

      res.status(404).send('No file content available');
    } catch (err: any) {
      res.status(500).send(err.message);
    }
  });

  // Direct download helper
  app.get('/api/storage/files/:id/download', async (req, res) => {
    try {
      const cached = storageService.getFileBuffer(req.params.id);
      if (cached) {
        res.setHeader('Content-Type', cached.mime_type || 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(cached.file_name)}"`);
        return res.send(cached.buffer);
      }

      const file = await storageService.getFileById(req.params.id);
      if (!file) {
        return res.status(404).send('File not found');
      }

      if (file.download_url && file.download_url !== `/api/storage/files/${file.id}/download`) {
        return res.redirect(file.download_url);
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

  // Ensure Supabase database has initial core records
  try {
    await storageService.seedInitialDataToSupabase();
  } catch (seedErr: any) {
    console.warn('[Server] Supabase auto-seed warning:', seedErr.message);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Saarthi Solutions running on http://0.0.0.0:${PORT} (100% Supabase Architecture)`);
  });
}

startServer();
