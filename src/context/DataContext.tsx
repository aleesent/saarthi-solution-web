import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Job,
  Service,
  Testimonial,
  PlacementItem,
  PlacementStats,
  EmployerPartner,
  EmployerInquiry,
  OfficeContact,
  ContactMessage,
  JobApplication,
  CandidateProfile,
  Invoice,
  WebsiteSettings,
  FileRecord
} from '../types';
import {
  uploadFileToUnifiedStorage,
  fetchFilesRegistry,
  deleteStorageFile,
  replaceStorageFile,
  fetchStorageHealth
} from '../lib/storageService';
import {
  INITIAL_JOBS,
  SERVICES as INITIAL_SERVICES,
  TESTIMONIALS as INITIAL_TESTIMONIALS,
  INITIAL_PLACEMENTS,
  INITIAL_PLACEMENT_STATS,
  INITIAL_EMPLOYERS,
  INITIAL_EMPLOYER_INQUIRIES,
  INITIAL_OFFICES,
  INITIAL_CONTACT_MESSAGES,
  INITIAL_JOB_APPLICATIONS,
  INITIAL_CANDIDATES,
  INITIAL_INVOICES,
  INITIAL_WEBSITE_SETTINGS
} from '../data/mockData';
import {
  db,
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  uploadFileToStorage
} from '../lib/firebase';

interface DataContextType {
  // 1. Services
  services: Service[];
  addService: (service: Omit<Service, 'id'> & { id?: string }) => Promise<void>;
  updateService: (id: string, updated: Partial<Service>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;

  // 2. Employers
  employers: EmployerPartner[];
  addEmployer: (employer: Omit<EmployerPartner, 'id'> & { id?: string }) => Promise<void>;
  updateEmployer: (id: string, updated: Partial<EmployerPartner>) => Promise<void>;
  deleteEmployer: (id: string) => Promise<void>;

  employerInquiries: EmployerInquiry[];
  addEmployerInquiry: (inquiry: Omit<EmployerInquiry, 'id' | 'date'> & { id?: string; date?: string }) => Promise<void>;
  updateEmployerInquiry: (id: string, updated: Partial<EmployerInquiry>) => Promise<void>;
  deleteEmployerInquiry: (id: string) => Promise<void>;

  // 3. Jobs
  jobs: Job[];
  addJob: (job: Omit<Job, 'id' | 'postedDate'> & { id?: string; postedDate?: string }) => Promise<void>;
  updateJob: (id: string, updated: Partial<Job>) => Promise<void>;
  deleteJob: (id: string) => Promise<void>;

  // 4. Candidates & Resume Upload
  candidates: CandidateProfile[];
  addCandidate: (candidate: Omit<CandidateProfile, 'id'> & { id?: string }) => Promise<string>;
  updateCandidate: (id: string, updated: Partial<CandidateProfile>) => Promise<void>;
  deleteCandidate: (id: string) => Promise<void>;
  uploadCandidateResume: (candidateId: string, file: File, extraData?: Partial<CandidateProfile>) => Promise<{ downloadUrl: string; storagePath: string; fileName: string }>;

  // 5. Job Applications
  applications: JobApplication[];
  addApplication: (app: Omit<JobApplication, 'id' | 'appliedDate'> & { id?: string; appliedDate?: string }) => Promise<string>;
  updateApplication: (id: string, updated: Partial<JobApplication>) => Promise<void>;
  deleteApplication: (id: string) => Promise<void>;

  // 6. Placements
  placements: PlacementItem[];
  placementStats: PlacementStats;
  addPlacement: (placement: Omit<PlacementItem, 'id'> & { id?: string }) => Promise<void>;
  updatePlacement: (id: string, updated: Partial<PlacementItem>) => Promise<void>;
  deletePlacement: (id: string) => Promise<void>;
  updatePlacementStats: (stats: Partial<PlacementStats>) => Promise<void>;

  // 7. Testimonials
  testimonials: Testimonial[];
  addTestimonial: (testimonial: Omit<Testimonial, 'id'> & { id?: string }) => Promise<void>;
  updateTestimonial: (id: string, updated: Partial<Testimonial>) => Promise<void>;
  deleteTestimonial: (id: string) => Promise<void>;

  // 8. Contact & Offices
  offices: OfficeContact[];
  addOffice: (office: Omit<OfficeContact, 'id'> & { id?: string }) => Promise<void>;
  updateOffice: (id: string, updated: Partial<OfficeContact>) => Promise<void>;
  deleteOffice: (id: string) => Promise<void>;

  contactMessages: ContactMessage[];
  addContactMessage: (msg: Omit<ContactMessage, 'id' | 'date'> & { id?: string; date?: string }) => Promise<void>;
  updateContactMessage: (id: string, updated: Partial<ContactMessage>) => Promise<void>;
  deleteContactMessage: (id: string) => Promise<void>;

  // 9. Invoices
  invoices: Invoice[];
  addInvoice: (invoice: Omit<Invoice, 'id' | 'createdAt'> & { id?: string; createdAt?: string }) => Promise<string>;
  updateInvoice: (id: string, updated: Partial<Invoice>) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  uploadInvoicePdf: (invoiceNumber: string, pdfBlob: Blob) => Promise<{ downloadUrl: string; storagePath: string; googleDriveUrl?: string }>;

  // 10. Unified File & Cloud Storage (Supabase + Google Drive)
  storageFiles: FileRecord[];
  refreshStorageFiles: () => Promise<void>;
  uploadStorageFile: (
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
  ) => Promise<FileRecord>;
  deleteFileRecord: (id: string) => Promise<void>;
  replaceFileRecord: (id: string, file: File, uploadedBy?: string) => Promise<FileRecord>;

  // 11. Website Settings
  websiteSettings: WebsiteSettings;
  updateWebsiteSettings: (settings: Partial<WebsiteSettings>) => Promise<void>;

  // System
  isSyncing: boolean;
  resetAllToDefaults: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const LOCAL_STORAGE_KEYS = {
  SERVICES: 'sarthi_admin_services_v3',
  EMPLOYERS: 'sarthi_admin_employers_v3',
  EMPLOYER_INQUIRIES: 'sarthi_admin_employer_inquiries_v3',
  JOBS: 'sarthi_admin_jobs_v3',
  CANDIDATES: 'sarthi_admin_candidates_v3',
  APPLICATIONS: 'sarthi_admin_applications_v3',
  PLACEMENTS: 'sarthi_admin_placements_v3',
  PLACEMENT_STATS: 'sarthi_admin_placement_stats_v3',
  TESTIMONIALS: 'sarthi_admin_testimonials_v3',
  OFFICES: 'sarthi_admin_offices_v3',
  CONTACT_MESSAGES: 'sarthi_admin_contact_messages_v3',
  INVOICES: 'sarthi_admin_invoices_v3',
  SETTINGS: 'sarthi_admin_settings_v3',
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Local state with safe hydration
  const [services, setServices] = useState<Service[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.SERVICES);
      return saved ? JSON.parse(saved) : INITIAL_SERVICES;
    } catch {
      return INITIAL_SERVICES;
    }
  });

  const [employers, setEmployers] = useState<EmployerPartner[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.EMPLOYERS);
      return saved ? JSON.parse(saved) : INITIAL_EMPLOYERS;
    } catch {
      return INITIAL_EMPLOYERS;
    }
  });

  const [employerInquiries, setEmployerInquiries] = useState<EmployerInquiry[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.EMPLOYER_INQUIRIES);
      return saved ? JSON.parse(saved) : INITIAL_EMPLOYER_INQUIRIES;
    } catch {
      return INITIAL_EMPLOYER_INQUIRIES;
    }
  });

  const [jobs, setJobs] = useState<Job[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.JOBS);
      return saved ? JSON.parse(saved) : INITIAL_JOBS;
    } catch {
      return INITIAL_JOBS;
    }
  });

  const [candidates, setCandidates] = useState<CandidateProfile[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.CANDIDATES);
      return saved ? JSON.parse(saved) : INITIAL_CANDIDATES;
    } catch {
      return INITIAL_CANDIDATES;
    }
  });

  const [applications, setApplications] = useState<JobApplication[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.APPLICATIONS);
      return saved ? JSON.parse(saved) : INITIAL_JOB_APPLICATIONS;
    } catch {
      return INITIAL_JOB_APPLICATIONS;
    }
  });

  const [placements, setPlacements] = useState<PlacementItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.PLACEMENTS);
      return saved ? JSON.parse(saved) : INITIAL_PLACEMENTS;
    } catch {
      return INITIAL_PLACEMENTS;
    }
  });

  const [placementStats, setPlacementStats] = useState<PlacementStats>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.PLACEMENT_STATS);
      return saved ? JSON.parse(saved) : INITIAL_PLACEMENT_STATS;
    } catch {
      return INITIAL_PLACEMENT_STATS;
    }
  });

  const [testimonials, setTestimonials] = useState<Testimonial[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.TESTIMONIALS);
      return saved ? JSON.parse(saved) : INITIAL_TESTIMONIALS;
    } catch {
      return INITIAL_TESTIMONIALS;
    }
  });

  const [offices, setOffices] = useState<OfficeContact[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.OFFICES);
      return saved ? JSON.parse(saved) : INITIAL_OFFICES;
    } catch {
      return INITIAL_OFFICES;
    }
  });

  const [contactMessages, setContactMessages] = useState<ContactMessage[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.CONTACT_MESSAGES);
      return saved ? JSON.parse(saved) : INITIAL_CONTACT_MESSAGES;
    } catch {
      return INITIAL_CONTACT_MESSAGES;
    }
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.INVOICES);
      return saved ? JSON.parse(saved) : INITIAL_INVOICES;
    } catch {
      return INITIAL_INVOICES;
    }
  });

  const [websiteSettings, setWebsiteSettings] = useState<WebsiteSettings>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.SETTINGS);
      return saved ? JSON.parse(saved) : INITIAL_WEBSITE_SETTINGS;
    } catch {
      return INITIAL_WEBSITE_SETTINGS;
    }
  });

  // Storage Files (Supabase Postgres + Google Drive / Supabase Storage)
  const [storageFiles, setStorageFiles] = useState<FileRecord[]>([]);

  const [isSyncing, setIsSyncing] = useState(false);

  // Initial load of storage files from backend registry
  const refreshStorageFiles = async () => {
    try {
      const files = await fetchFilesRegistry();
      setStorageFiles(files);
    } catch (err) {
      console.warn('Storage registry fetch note:', err);
    }
  };

  useEffect(() => {
    refreshStorageFiles();
  }, []);

  const uploadStorageFile = async (
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
  ): Promise<FileRecord> => {
    const record = await uploadFileToUnifiedStorage(file, options);
    setStorageFiles((prev) => [record, ...prev.filter((f) => f.id !== record.id)]);
    return record;
  };

  const deleteFileRecord = async (id: string) => {
    setStorageFiles((prev) => prev.filter((f) => f.id !== id));
    try {
      await deleteStorageFile(id);
    } catch (e) {
      console.warn('Storage file delete warning:', e);
    }
  };

  const replaceFileRecord = async (id: string, file: File, uploadedBy?: string): Promise<FileRecord> => {
    const record = await replaceStorageFile(id, file, uploadedBy);
    setStorageFiles((prev) => prev.map((f) => (f.id === id ? record : f)));
    return record;
  };

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.SERVICES, JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.EMPLOYERS, JSON.stringify(employers));
  }, [employers]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.EMPLOYER_INQUIRIES, JSON.stringify(employerInquiries));
  }, [employerInquiries]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.JOBS, JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.CANDIDATES, JSON.stringify(candidates));
  }, [candidates]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.APPLICATIONS, JSON.stringify(applications));
  }, [applications]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.PLACEMENTS, JSON.stringify(placements));
  }, [placements]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.PLACEMENT_STATS, JSON.stringify(placementStats));
  }, [placementStats]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.TESTIMONIALS, JSON.stringify(testimonials));
  }, [testimonials]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.OFFICES, JSON.stringify(offices));
  }, [offices]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.CONTACT_MESSAGES, JSON.stringify(contactMessages));
  }, [contactMessages]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.SETTINGS, JSON.stringify(websiteSettings));
  }, [websiteSettings]);

  // Real-time Firestore Listeners Setup
  useEffect(() => {
    setIsSyncing(true);

    const unsubServices = onSnapshot(collection(db, 'services'), (snapshot) => {
      if (!snapshot.empty) {
        const list = snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as Service));
        setServices(list);
      }
    }, (err) => console.log('Firestore services sync listener:', err.message));

    const unsubEmployers = onSnapshot(collection(db, 'employers'), (snapshot) => {
      if (!snapshot.empty) {
        const list = snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as EmployerPartner));
        setEmployers(list);
      }
    }, (err) => console.log('Firestore employers sync listener:', err.message));

    const unsubJobs = onSnapshot(collection(db, 'jobs'), (snapshot) => {
      if (!snapshot.empty) {
        const list = snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as Job));
        setJobs(list);
      }
    }, (err) => console.log('Firestore jobs sync listener:', err.message));

    const unsubCandidates = onSnapshot(collection(db, 'candidates'), (snapshot) => {
      if (!snapshot.empty) {
        const list = snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as CandidateProfile));
        setCandidates(list);
      }
    }, (err) => console.log('Firestore candidates sync listener:', err.message));

    const unsubApplications = onSnapshot(collection(db, 'applications'), (snapshot) => {
      if (!snapshot.empty) {
        const list = snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as JobApplication));
        setApplications(list);
      }
    }, (err) => console.log('Firestore applications sync listener:', err.message));

    const unsubPlacements = onSnapshot(collection(db, 'placements'), (snapshot) => {
      if (!snapshot.empty) {
        const list = snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as PlacementItem));
        setPlacements(list);
      }
    }, (err) => console.log('Firestore placements sync listener:', err.message));

    const unsubTestimonials = onSnapshot(collection(db, 'testimonials'), (snapshot) => {
      if (!snapshot.empty) {
        const list = snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as Testimonial));
        setTestimonials(list);
      }
    }, (err) => console.log('Firestore testimonials sync listener:', err.message));

    const unsubBranches = onSnapshot(collection(db, 'branches'), (snapshot) => {
      if (!snapshot.empty) {
        const list = snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as OfficeContact));
        setOffices(list);
      }
    }, (err) => console.log('Firestore branches sync listener:', err.message));

    const unsubMessages = onSnapshot(collection(db, 'contact_messages'), (snapshot) => {
      if (!snapshot.empty) {
        const list = snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as ContactMessage));
        setContactMessages(list);
      }
    }, (err) => console.log('Firestore contact messages sync listener:', err.message));

    const unsubInvoices = onSnapshot(collection(db, 'invoices'), (snapshot) => {
      if (!snapshot.empty) {
        const list = snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as Invoice));
        setInvoices(list);
      }
    }, (err) => console.log('Firestore invoices sync listener:', err.message));

    const unsubSettings = onSnapshot(doc(db, 'website_settings', 'general'), (docSnap) => {
      if (docSnap.exists()) {
        setWebsiteSettings(docSnap.data() as WebsiteSettings);
      }
    }, (err) => console.log('Firestore settings sync listener:', err.message));

    setIsSyncing(false);

    return () => {
      unsubServices();
      unsubEmployers();
      unsubJobs();
      unsubCandidates();
      unsubApplications();
      unsubPlacements();
      unsubTestimonials();
      unsubBranches();
      unsubMessages();
      unsubInvoices();
      unsubSettings();
    };
  }, []);

  // 1. Services CRUD
  const addService = async (service: Omit<Service, 'id'> & { id?: string }) => {
    const id = service.id || `serv-${Date.now()}`;
    const newService: Service = { ...service, id };
    setServices((prev) => [newService, ...prev.filter((s) => s.id !== id)]);
    try {
      await setDoc(doc(db, 'services', id), newService, { merge: true });
    } catch (e) {
      console.warn('Firestore write warning:', e);
    }
  };

  const updateService = async (id: string, updated: Partial<Service>) => {
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, ...updated } : s)));
    try {
      await updateDoc(doc(db, 'services', id), updated);
    } catch (e) {
      console.warn('Firestore write warning:', e);
    }
  };

  const deleteService = async (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
    try {
      await deleteDoc(doc(db, 'services', id));
    } catch (e) {
      console.warn('Firestore delete warning:', e);
    }
  };

  // 2. Employers CRUD
  const addEmployer = async (employer: Omit<EmployerPartner, 'id'> & { id?: string }) => {
    const id = employer.id || `emp-${Date.now()}`;
    const newEmployer: EmployerPartner = { ...employer, id };
    setEmployers((prev) => [newEmployer, ...prev.filter((e) => e.id !== id)]);
    try {
      await setDoc(doc(db, 'employers', id), newEmployer, { merge: true });
    } catch (e) {
      console.warn('Firestore write warning:', e);
    }
  };

  const updateEmployer = async (id: string, updated: Partial<EmployerPartner>) => {
    setEmployers((prev) => prev.map((e) => (e.id === id ? { ...e, ...updated } : e)));
    try {
      await updateDoc(doc(db, 'employers', id), updated);
    } catch (e) {
      console.warn('Firestore write warning:', e);
    }
  };

  const deleteEmployer = async (id: string) => {
    setEmployers((prev) => prev.filter((e) => e.id !== id));
    try {
      await deleteDoc(doc(db, 'employers', id));
    } catch (e) {
      console.warn('Firestore delete warning:', e);
    }
  };

  const addEmployerInquiry = async (inquiry: Omit<EmployerInquiry, 'id' | 'date'> & { id?: string; date?: string }) => {
    const id = inquiry.id || `inq-${Date.now()}`;
    const newInquiry: EmployerInquiry = {
      ...inquiry,
      id,
      date: inquiry.date || new Date().toISOString().split('T')[0]
    };
    setEmployerInquiries((prev) => [newInquiry, ...prev]);
    try {
      await setDoc(doc(db, 'employer_inquiries', id), newInquiry, { merge: true });
    } catch (e) {
      console.warn('Firestore write warning:', e);
    }
  };

  const updateEmployerInquiry = async (id: string, updated: Partial<EmployerInquiry>) => {
    setEmployerInquiries((prev) => prev.map((i) => (i.id === id ? { ...i, ...updated } : i)));
    try {
      await updateDoc(doc(db, 'employer_inquiries', id), updated);
    } catch (e) {
      console.warn('Firestore write warning:', e);
    }
  };

  const deleteEmployerInquiry = async (id: string) => {
    setEmployerInquiries((prev) => prev.filter((i) => i.id !== id));
    try {
      await deleteDoc(doc(db, 'employer_inquiries', id));
    } catch (e) {
      console.warn('Firestore delete warning:', e);
    }
  };

  // 3. Jobs CRUD
  const addJob = async (job: Omit<Job, 'id' | 'postedDate'> & { id?: string; postedDate?: string }) => {
    const id = job.id || `job-${Date.now()}`;
    const newJob: Job = {
      ...job,
      id,
      postedDate: job.postedDate || new Date().toISOString().split('T')[0]
    };
    setJobs((prev) => [newJob, ...prev.filter((j) => j.id !== id)]);
    try {
      await setDoc(doc(db, 'jobs', id), newJob, { merge: true });
    } catch (e) {
      console.warn('Firestore write warning:', e);
    }
  };

  const updateJob = async (id: string, updated: Partial<Job>) => {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, ...updated } : j)));
    try {
      await updateDoc(doc(db, 'jobs', id), updated);
    } catch (e) {
      console.warn('Firestore write warning:', e);
    }
  };

  const deleteJob = async (id: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== id));
    try {
      await deleteDoc(doc(db, 'jobs', id));
    } catch (e) {
      console.warn('Firestore delete warning:', e);
    }
  };

  // 4. Candidates & Resume Upload
  const addCandidate = async (candidate: Omit<CandidateProfile, 'id'> & { id?: string }): Promise<string> => {
    const id = candidate.id || `cand-${Date.now()}`;
    const newCandidate: CandidateProfile = {
      ...candidate,
      id,
      createdAt: candidate.createdAt || new Date().toISOString()
    };
    setCandidates((prev) => [newCandidate, ...prev.filter((c) => c.id !== id)]);
    try {
      await setDoc(doc(db, 'candidates', id), newCandidate, { merge: true });
    } catch (e) {
      console.warn('Firestore write warning:', e);
    }
    return id;
  };

  const updateCandidate = async (id: string, updated: Partial<CandidateProfile>) => {
    setCandidates((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated, updatedAt: new Date().toISOString() } : c)));
    try {
      await updateDoc(doc(db, 'candidates', id), {
        ...updated,
        updatedAt: new Date().toISOString()
      });
    } catch (e) {
      console.warn('Firestore write warning:', e);
    }
  };

  const deleteCandidate = async (id: string) => {
    setCandidates((prev) => prev.filter((c) => c.id !== id));
    try {
      await deleteDoc(doc(db, 'candidates', id));
    } catch (e) {
      console.warn('Firestore delete warning:', e);
    }
  };

  const uploadCandidateResume = async (
    candidateId: string, 
    file: File, 
    extraData?: Partial<CandidateProfile>
  ): Promise<{ downloadUrl: string; storagePath: string; fileName: string; googleDriveUrl?: string }> => {
    try {
      // 1. Upload to Unified Hybrid Storage (Google Drive for PDFs, Supabase for small assets)
      const fileRecord = await uploadFileToUnifiedStorage(file, {
        fileName: file.name,
        relatedEntityType: 'candidate_resume',
        relatedEntityId: candidateId,
        uploadedBy: extraData?.fullName || 'Candidate'
      });

      // Update storage files state
      setStorageFiles((prev) => [fileRecord, ...prev.filter((f) => f.id !== fileRecord.id)]);

      const targetUrl = fileRecord.google_drive_view_url || fileRecord.download_url || fileRecord.google_drive_url || '';
      const storagePath = fileRecord.folder_path || fileRecord.storage_path || `Sarthi Solutions/Resumes/${file.name}`;

      const resumeMetadata: Partial<CandidateProfile> = {
        resumeFileName: file.name,
        resumeFileType: file.type,
        resumeFileSize: file.size,
        resumeStoragePath: storagePath,
        resumeUrl: targetUrl,
        resumeUploadDate: new Date().toISOString().split('T')[0],
        ...extraData
      };

      const targetId = candidateId || `cand-${Date.now()}`;
      const exists = candidates.some((c) => c.id === targetId);

      if (exists) {
        await updateCandidate(targetId, resumeMetadata);
      } else {
        await addCandidate({
          id: targetId,
          fullName: extraData?.fullName || file.name.split('.')[0] || 'Candidate',
          email: extraData?.email || 'candidate@gmail.com',
          phone: extraData?.phone || '+91 98243 22206',
          currentLocation: extraData?.currentLocation || 'Surat / Silvassa',
          status: 'Available',
          ...resumeMetadata
        });
      }

      return {
        downloadUrl: targetUrl,
        storagePath: storagePath,
        fileName: file.name,
        googleDriveUrl: fileRecord.google_drive_url
      };
    } catch (err) {
      console.warn('Unified storage upload fallback to storage:', err);
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const storagePath = `resumes/${candidateId}_${Date.now()}_${cleanFileName}`;
      
      const uploadResult = await uploadFileToStorage(storagePath, file, {
        candidateId,
        uploadedAt: new Date().toISOString()
      });

      const resumeMetadata: Partial<CandidateProfile> = {
        resumeFileName: file.name,
        resumeFileType: file.type,
        resumeFileSize: file.size,
        resumeStoragePath: uploadResult.fullPath,
        resumeUrl: uploadResult.downloadUrl,
        resumeUploadDate: new Date().toISOString().split('T')[0],
        ...extraData
      };

      const targetId = candidateId || `cand-${Date.now()}`;
      const exists = candidates.some((c) => c.id === targetId);

      if (exists) {
        await updateCandidate(targetId, resumeMetadata);
      } else {
        await addCandidate({
          id: targetId,
          fullName: extraData?.fullName || file.name.split('.')[0] || 'Candidate',
          email: extraData?.email || 'candidate@gmail.com',
          phone: extraData?.phone || '+91 98243 22206',
          currentLocation: extraData?.currentLocation || 'Surat / Silvassa',
          status: 'Available',
          ...resumeMetadata
        });
      }

      return {
        downloadUrl: uploadResult.downloadUrl,
        storagePath: uploadResult.fullPath,
        fileName: file.name
      };
    }
  };

  // 5. Job Applications CRUD
  const addApplication = async (app: Omit<JobApplication, 'id' | 'appliedDate'> & { id?: string; appliedDate?: string }): Promise<string> => {
    const id = app.id || `app-${Date.now()}`;
    const newApp: JobApplication = {
      ...app,
      id,
      appliedDate: app.appliedDate || new Date().toISOString().split('T')[0]
    };
    setApplications((prev) => [newApp, ...prev.filter((a) => a.id !== id)]);
    
    // 1. Post structured record to Supabase PostgreSQL backend API
    try {
      await fetch('/api/job-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: app.jobId,
          jobTitle: app.jobTitle,
          candidateName: app.candidateName,
          email: app.email,
          phone: app.phone,
          whatsapp: app.whatsapp,
          experience: app.experience,
          currentLocation: app.currentLocation,
          resumeUrl: app.resumeUrl,
          resumeFileName: app.resumeFileName
        })
      });
    } catch (e) {
      console.warn('Supabase job application API call warning:', e);
    }

    // 2. Sync to local state & Firestore if available
    try {
      await setDoc(doc(db, 'applications', id), newApp, { merge: true });
    } catch (e) {
      console.warn('Firestore write warning:', e);
    }
    return id;
  };

  const updateApplication = async (id: string, updated: Partial<JobApplication>) => {
    setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, ...updated } : a)));
    try {
      await updateDoc(doc(db, 'applications', id), updated);
    } catch (e) {
      console.warn('Firestore write warning:', e);
    }
  };

  const deleteApplication = async (id: string) => {
    setApplications((prev) => prev.filter((a) => a.id !== id));
    try {
      await deleteDoc(doc(db, 'applications', id));
    } catch (e) {
      console.warn('Firestore delete warning:', e);
    }
  };

  // 6. Placements CRUD
  const addPlacement = async (placement: Omit<PlacementItem, 'id'> & { id?: string }) => {
    const id = placement.id || `plc-${Date.now()}`;
    const newPlacement: PlacementItem = { ...placement, id };
    setPlacements((prev) => [newPlacement, ...prev.filter((p) => p.id !== id)]);
    try {
      await setDoc(doc(db, 'placements', id), newPlacement, { merge: true });
    } catch (e) {
      console.warn('Firestore write warning:', e);
    }
  };

  const updatePlacement = async (id: string, updated: Partial<PlacementItem>) => {
    setPlacements((prev) => prev.map((p) => (p.id === id ? { ...p, ...updated } : p)));
    try {
      await updateDoc(doc(db, 'placements', id), updated);
    } catch (e) {
      console.warn('Firestore write warning:', e);
    }
  };

  const deletePlacement = async (id: string) => {
    setPlacements((prev) => prev.filter((p) => p.id !== id));
    try {
      await deleteDoc(doc(db, 'placements', id));
    } catch (e) {
      console.warn('Firestore delete warning:', e);
    }
  };

  const updatePlacementStats = async (stats: Partial<PlacementStats>) => {
    const updated = { ...placementStats, ...stats };
    setPlacementStats(updated);
    try {
      await setDoc(doc(db, 'placement_stats', 'general'), updated, { merge: true });
    } catch (e) {
      console.warn('Firestore write warning:', e);
    }
  };

  // 7. Testimonials CRUD
  const addTestimonial = async (testimonial: Omit<Testimonial, 'id'> & { id?: string }) => {
    const id = testimonial.id || `test-${Date.now()}`;
    const newTestimonial: Testimonial = { ...testimonial, id };
    setTestimonials((prev) => [newTestimonial, ...prev.filter((t) => t.id !== id)]);
    try {
      await setDoc(doc(db, 'testimonials', id), newTestimonial, { merge: true });
    } catch (e) {
      console.warn('Firestore write warning:', e);
    }
  };

  const updateTestimonial = async (id: string, updated: Partial<Testimonial>) => {
    setTestimonials((prev) => prev.map((t) => (t.id === id ? { ...t, ...updated } : t)));
    try {
      await updateDoc(doc(db, 'testimonials', id), updated);
    } catch (e) {
      console.warn('Firestore write warning:', e);
    }
  };

  const deleteTestimonial = async (id: string) => {
    setTestimonials((prev) => prev.filter((t) => t.id !== id));
    try {
      await deleteDoc(doc(db, 'testimonials', id));
    } catch (e) {
      console.warn('Firestore delete warning:', e);
    }
  };

  // 8. Contact & Offices CRUD
  const addOffice = async (office: Omit<OfficeContact, 'id'> & { id?: string }) => {
    const id = office.id || `off-${Date.now()}`;
    const newOffice: OfficeContact = { ...office, id };
    setOffices((prev) => [newOffice, ...prev.filter((o) => o.id !== id)]);
    try {
      await setDoc(doc(db, 'branches', id), newOffice, { merge: true });
    } catch (e) {
      console.warn('Firestore write warning:', e);
    }
  };

  const updateOffice = async (id: string, updated: Partial<OfficeContact>) => {
    setOffices((prev) => prev.map((o) => (o.id === id ? { ...o, ...updated } : o)));
    try {
      await updateDoc(doc(db, 'branches', id), updated);
    } catch (e) {
      console.warn('Firestore write warning:', e);
    }
  };

  const deleteOffice = async (id: string) => {
    setOffices((prev) => prev.filter((o) => o.id !== id));
    try {
      await deleteDoc(doc(db, 'branches', id));
    } catch (e) {
      console.warn('Firestore delete warning:', e);
    }
  };

  const addContactMessage = async (msg: Omit<ContactMessage, 'id' | 'date'> & { id?: string; date?: string }) => {
    const id = msg.id || `msg-${Date.now()}`;
    const newMsg: ContactMessage = {
      ...msg,
      id,
      date: msg.date || new Date().toISOString().split('T')[0]
    };
    setContactMessages((prev) => [newMsg, ...prev]);

    // 1. Post structured form message directly to Supabase PostgreSQL backend API
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: msg.name,
          email: msg.email,
          phone: msg.phone,
          subject: msg.subject,
          userType: msg.userType,
          message: msg.message
        })
      });
    } catch (e) {
      console.warn('Supabase contact message API warning:', e);
    }

    // 2. Sync with local state & Firestore
    try {
      await setDoc(doc(db, 'contact_messages', id), newMsg, { merge: true });
    } catch (e) {
      console.warn('Firestore write warning:', e);
    }
  };

  const updateContactMessage = async (id: string, updated: Partial<ContactMessage>) => {
    setContactMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...updated } : m)));
    try {
      await updateDoc(doc(db, 'contact_messages', id), updated);
    } catch (e) {
      console.warn('Firestore write warning:', e);
    }
  };

  const deleteContactMessage = async (id: string) => {
    setContactMessages((prev) => prev.filter((m) => m.id !== id));
    try {
      await deleteDoc(doc(db, 'contact_messages', id));
    } catch (e) {
      console.warn('Firestore delete warning:', e);
    }
  };

  // 9. Invoices CRUD
  const addInvoice = async (invoice: Omit<Invoice, 'id' | 'createdAt'> & { id?: string; createdAt?: string }): Promise<string> => {
    const id = invoice.id || `inv-${Date.now()}`;
    const newInvoice: Invoice = {
      ...invoice,
      id,
      createdAt: invoice.createdAt || new Date().toISOString()
    };
    setInvoices((prev) => [newInvoice, ...prev.filter((i) => i.id !== id)]);
    try {
      await setDoc(doc(db, 'invoices', id), newInvoice, { merge: true });
    } catch (e) {
      console.warn('Firestore write warning:', e);
    }
    return id;
  };

  const updateInvoice = async (id: string, updated: Partial<Invoice>) => {
    setInvoices((prev) => prev.map((i) => (i.id === id ? { ...i, ...updated, updatedAt: new Date().toISOString() } : i)));
    try {
      await updateDoc(doc(db, 'invoices', id), {
        ...updated,
        updatedAt: new Date().toISOString()
      });
    } catch (e) {
      console.warn('Firestore write warning:', e);
    }
  };

  const deleteInvoice = async (id: string) => {
    setInvoices((prev) => prev.filter((i) => i.id !== id));
    try {
      await deleteDoc(doc(db, 'invoices', id));
    } catch (e) {
      console.warn('Firestore delete warning:', e);
    }
  };

  const uploadInvoicePdf = async (
    invoiceNumber: string, 
    pdfBlob: Blob
  ): Promise<{ downloadUrl: string; storagePath: string; googleDriveUrl?: string }> => {
    try {
      const fileName = `Invoice_${invoiceNumber.replace(/[^a-zA-Z0-9._-]/g, '_')}.pdf`;
      const fileRecord = await uploadFileToUnifiedStorage(pdfBlob, {
        fileName,
        relatedEntityType: 'invoice_pdf',
        relatedEntityId: invoiceNumber,
        uploadedBy: 'Sarthi Accounts'
      });

      setStorageFiles((prev) => [fileRecord, ...prev.filter((f) => f.id !== fileRecord.id)]);

      const targetUrl = fileRecord.google_drive_view_url || fileRecord.download_url || fileRecord.google_drive_url || '';
      const storagePath = fileRecord.folder_path || fileRecord.storage_path || `Sarthi Solutions/Invoices/${fileName}`;

      const matching = invoices.find((i) => i.invoiceNumber === invoiceNumber);
      if (matching) {
        await updateInvoice(matching.id, {
          pdfUrl: targetUrl,
          pdfStoragePath: storagePath
        });
      }

      return {
        downloadUrl: targetUrl,
        storagePath: storagePath,
        googleDriveUrl: fileRecord.google_drive_url
      };
    } catch (err) {
      console.warn('Invoice upload fallback to storage:', err);
      const storagePath = `invoices/${invoiceNumber.replace(/[^a-zA-Z0-9._-]/g, '_')}.pdf`;
      const uploadResult = await uploadFileToStorage(storagePath, pdfBlob, {
        invoiceNumber,
        uploadedAt: new Date().toISOString()
      });

      const matching = invoices.find((i) => i.invoiceNumber === invoiceNumber);
      if (matching) {
        await updateInvoice(matching.id, {
          pdfUrl: uploadResult.downloadUrl,
          pdfStoragePath: uploadResult.fullPath
        });
      }

      return {
        downloadUrl: uploadResult.downloadUrl,
        storagePath: uploadResult.fullPath
      };
    }
  };

  // 10. Website Settings
  const updateWebsiteSettings = async (settings: Partial<WebsiteSettings>) => {
    const updated = { ...websiteSettings, ...settings };
    setWebsiteSettings(updated);
    try {
      await setDoc(doc(db, 'website_settings', 'general'), updated, { merge: true });
    } catch (e) {
      console.warn('Firestore write warning:', e);
    }
  };

  // System Reset
  const resetAllToDefaults = async () => {
    setServices(INITIAL_SERVICES);
    setEmployers(INITIAL_EMPLOYERS);
    setEmployerInquiries(INITIAL_EMPLOYER_INQUIRIES);
    setJobs(INITIAL_JOBS);
    setCandidates(INITIAL_CANDIDATES);
    setApplications(INITIAL_JOB_APPLICATIONS);
    setPlacements(INITIAL_PLACEMENTS);
    setPlacementStats(INITIAL_PLACEMENT_STATS);
    setTestimonials(INITIAL_TESTIMONIALS);
    setOffices(INITIAL_OFFICES);
    setContactMessages(INITIAL_CONTACT_MESSAGES);
    setInvoices(INITIAL_INVOICES);
    setWebsiteSettings(INITIAL_WEBSITE_SETTINGS);

    // Save to Firestore collections
    try {
      for (const s of INITIAL_SERVICES) await setDoc(doc(db, 'services', s.id), s, { merge: true });
      for (const e of INITIAL_EMPLOYERS) await setDoc(doc(db, 'employers', e.id), e, { merge: true });
      for (const j of INITIAL_JOBS) await setDoc(doc(db, 'jobs', j.id), j, { merge: true });
      for (const c of INITIAL_CANDIDATES) await setDoc(doc(db, 'candidates', c.id), c, { merge: true });
      for (const a of INITIAL_JOB_APPLICATIONS) await setDoc(doc(db, 'applications', a.id), a, { merge: true });
      for (const p of INITIAL_PLACEMENTS) await setDoc(doc(db, 'placements', p.id), p, { merge: true });
      for (const t of INITIAL_TESTIMONIALS) await setDoc(doc(db, 'testimonials', t.id), t, { merge: true });
      for (const o of INITIAL_OFFICES) await setDoc(doc(db, 'branches', o.id), o, { merge: true });
      for (const m of INITIAL_CONTACT_MESSAGES) await setDoc(doc(db, 'contact_messages', m.id), m, { merge: true });
      for (const i of INITIAL_INVOICES) await setDoc(doc(db, 'invoices', i.id), i, { merge: true });
      await setDoc(doc(db, 'website_settings', 'general'), INITIAL_WEBSITE_SETTINGS, { merge: true });
    } catch (err) {
      console.warn('Reset to Firestore completed with warnings:', err);
    }
  };

  return (
    <DataContext.Provider
      value={{
        services,
        addService,
        updateService,
        deleteService,

        employers,
        addEmployer,
        updateEmployer,
        deleteEmployer,
        employerInquiries,
        addEmployerInquiry,
        updateEmployerInquiry,
        deleteEmployerInquiry,

        jobs,
        addJob,
        updateJob,
        deleteJob,

        candidates,
        addCandidate,
        updateCandidate,
        deleteCandidate,
        uploadCandidateResume,

        applications,
        addApplication,
        updateApplication,
        deleteApplication,

        placements,
        placementStats,
        addPlacement,
        updatePlacement,
        deletePlacement,
        updatePlacementStats,

        testimonials,
        addTestimonial,
        updateTestimonial,
        deleteTestimonial,

        offices,
        addOffice,
        updateOffice,
        deleteOffice,

        contactMessages,
        addContactMessage,
        updateContactMessage,
        deleteContactMessage,

        invoices,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        uploadInvoicePdf,

        storageFiles,
        refreshStorageFiles,
        uploadStorageFile,
        deleteFileRecord,
        replaceFileRecord,

        websiteSettings,
        updateWebsiteSettings,

        isSyncing,
        resetAllToDefaults
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
