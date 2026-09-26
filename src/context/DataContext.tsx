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
  refreshEmployersFromSupabase: () => Promise<void>;

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
  approveTestimonial: (id: string) => Promise<void>;
  rejectTestimonial: (id: string) => Promise<void>;
  updateTestimonialStatus: (id: string, status: 'approved' | 'pending' | 'rejected') => Promise<void>;
  refreshTestimonialsFromSupabase: () => Promise<void>;

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
  uploadInvoicePdf: (invoiceNumber: string, pdfBlob: Blob) => Promise<{ downloadUrl: string; storagePath: string }>;

  // 10. File & Cloud Storage (Supabase Storage)
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
  refreshAllFromSupabase: () => Promise<void>;
  syncAllToSupabase: () => Promise<{ success: boolean; message: string; stats?: any }>;
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

  // Storage Files (Supabase PostgreSQL + Supabase Storage)
  const [storageFiles, setStorageFiles] = useState<FileRecord[]>([]);

  const [isSyncing, setIsSyncing] = useState(false);

  // Initial load of storage files and testimonials from backend registry
  const refreshStorageFiles = async () => {
    try {
      const files = await fetchFilesRegistry();
      setStorageFiles(files);
    } catch (err) {
      console.warn('Storage registry fetch note:', err);
    }
  };

  const refreshTestimonialsFromSupabase = async () => {
    try {
      const res = await fetch('/api/testimonials');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setTestimonials((prev) => {
            const map = new Map<string, Testimonial>();
            // Keep initial/prev items
            prev.forEach((t) => map.set(t.id, t));
            // Overwrite/add Supabase items
            json.data.forEach((item: any) => {
              const statusVal = item.status || (item.is_approved === false ? 'pending' : 'approved');
              map.set(item.id, {
                id: item.id,
                name: item.name,
                role: item.role,
                company: item.company,
                location: item.location || 'Gujarat',
                content: item.content,
                rating: Number(item.rating) || 5,
                avatar: item.avatar || item.image || item.download_url || undefined,
                image: item.avatar || item.image || item.download_url || undefined,
                type: item.type || 'Candidate',
                date: item.created_at ? item.created_at.split('T')[0] : undefined,
                status: statusVal,
                is_approved: statusVal === 'approved',
                createdAt: item.created_at,
                updatedAt: item.updated_at
              });
            });
            return Array.from(map.values());
          });
        }
      }
    } catch (err) {
      console.warn('Supabase testimonials fetch note:', err);
    }
  };

  const refreshEmployersFromSupabase = async () => {
    try {
      const res = await fetch('/api/employers');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setEmployers((prev) => {
            const map = new Map<string, EmployerPartner>();
            prev.forEach((e) => map.set(e.id, e));
            json.data.forEach((item: any) => {
              const jdLink = item.jd_url || item.jdUrl || item.website;

              map.set(item.id, {
                id: item.id,
                companyName: item.company_name || item.companyName || 'Enterprise Partner',
                industry: item.industry || 'Manufacturing & Engineering',
                location: item.location || 'Gujarat',
                contactPerson: item.contact_person || item.contactPerson || 'HR Lead',
                phone: item.phone || '+91 98243 22206',
                email: item.email || 'hr@company.com',
                activeOpenings: item.active_openings || item.activeOpenings || 1,
                partnershipType: item.partnership_type || item.partnershipType || 'Permanent Hiring',
                status: (item.status || 'Active Partner') as any,
                notes: item.notes || item.website || '',
                website: item.website,
                jdUrl: jdLink,
                jdFileId: item.jd_file_id || item.jdFileId,
                jdFileName: item.jd_file_name || item.jdFileName,
                jdFileSize: item.jd_file_size || item.jdFileSize
              });
            });
            return Array.from(map.values());
          });
        }
      }
    } catch (err) {
      console.warn('Supabase employers fetch note:', err);
    }
  };

  const refreshJobsFromSupabase = async () => {
    try {
      const res = await fetch('/api/jobs');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setJobs(json.data);
        }
      }
    } catch (err) {
      console.warn('Supabase jobs fetch note:', err);
    }
  };

  const refreshCandidatesFromSupabase = async () => {
    try {
      const res = await fetch('/api/candidates');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setCandidates(json.data);
        }
      }
    } catch (err) {
      console.warn('Supabase candidates fetch note:', err);
    }
  };

  const refreshApplicationsFromSupabase = async () => {
    try {
      const res = await fetch('/api/job-applications');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setApplications(json.data);
        }
      }
    } catch (err) {
      console.warn('Supabase job applications fetch note:', err);
    }
  };

  const refreshInvoicesFromSupabase = async () => {
    try {
      const res = await fetch('/api/invoices');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setInvoices(json.data);
        }
      }
    } catch (err) {
      console.warn('Supabase invoices fetch note:', err);
    }
  };

  const refreshPlacementsFromSupabase = async () => {
    try {
      const res = await fetch('/api/placements');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setPlacements(json.data);
        }
      }
    } catch (err) {
      console.warn('Supabase placements fetch note:', err);
    }
  };

  const refreshServicesFromSupabase = async () => {
    try {
      const res = await fetch('/api/services');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setServices(json.data.map((s: any) => ({
            id: s.id,
            title: s.title,
            shortDesc: s.short_desc || s.shortDesc || '',
            fullDesc: s.full_desc || s.fullDesc || '',
            iconName: s.icon_name || s.iconName || 'Briefcase',
            features: s.features || []
          })));
        }
      }
    } catch (err) {
      console.warn('Supabase services fetch note:', err);
    }
  };

  const refreshContactFromSupabase = async () => {
    try {
      const res = await fetch('/api/contact');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setContactMessages(json.data);
        }
      }
    } catch (err) {
      console.warn('Supabase contact fetch note:', err);
    }
  };

  const refreshSettingsFromSupabase = async () => {
    try {
      const res = await fetch('/api/website-settings');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setWebsiteSettings((prev) => ({ ...prev, ...json.data }));
        }
      }
    } catch (err) {
      console.warn('Supabase settings fetch note:', err);
    }
  };

  const refreshAllFromSupabase = async () => {
    await Promise.allSettled([
      refreshStorageFiles(),
      refreshJobsFromSupabase(),
      refreshCandidatesFromSupabase(),
      refreshApplicationsFromSupabase(),
      refreshEmployersFromSupabase(),
      refreshInvoicesFromSupabase(),
      refreshTestimonialsFromSupabase(),
      refreshPlacementsFromSupabase(),
      refreshServicesFromSupabase(),
      refreshContactFromSupabase(),
      refreshSettingsFromSupabase()
    ]);
  };

  const syncAllToSupabase = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/sync-all-to-supabase', { method: 'POST' });
      const json = await res.json();
      await refreshAllFromSupabase();
      setIsSyncing(false);
      return json;
    } catch (e: any) {
      setIsSyncing(false);
      return { success: false, message: e.message || 'Sync failed' };
    }
  };

  useEffect(() => {
    refreshAllFromSupabase();
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
        const list = snapshot.docs.map((d) => {
          const data = d.data();
          const status = data.status || (data.is_approved === true ? 'approved' : data.is_approved === false ? 'pending' : 'pending');
          return {
            ...data,
            id: d.id,
            status,
            is_approved: status === 'approved',
            content: data.content || data.review || '',
            type: data.category || data.type || 'Candidate'
          } as Testimonial;
        });
        setTestimonials(list);
      }
    }, (err) => console.log('Firestore testimonials sync listener:', err.message));

    // Also fetch initial testimonials from server API
    refreshTestimonialsFromSupabase();

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
      await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newService)
      });
    } catch (apiErr) {
      console.warn('Supabase service save warning:', apiErr);
    }

    try {
      await setDoc(doc(db, 'services', id), newService, { merge: true });
    } catch (e) {
      console.warn('Firestore write warning:', e);
    }
  };

  const updateService = async (id: string, updated: Partial<Service>) => {
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, ...updated } : s)));

    try {
      await fetch(`/api/services/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
    } catch (apiErr) {
      console.warn('Supabase service update warning:', apiErr);
    }

    try {
      await updateDoc(doc(db, 'services', id), updated);
    } catch (e) {
      console.warn('Firestore write warning:', e);
    }
  };

  const deleteService = async (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));

    try {
      await fetch(`/api/services/${id}`, { method: 'DELETE' });
    } catch (apiErr) {
      console.warn('Supabase service delete warning:', apiErr);
    }

    try {
      await deleteDoc(doc(db, 'services', id));
    } catch (e) {
      console.warn('Firestore delete warning:', e);
    }
  };

  // 2. Employers CRUD (Supabase + Firestore synchronized)
  const addEmployer = async (employer: Omit<EmployerPartner, 'id'> & { id?: string }) => {
    const id = employer.id || `emp-${Date.now()}`;
    const newEmployer: EmployerPartner = { ...employer, id };
    setEmployers((prev) => [newEmployer, ...prev.filter((e) => e.id !== id)]);

    // 1. Sync with Supabase employers table
    try {
      await fetch('/api/employers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          companyName: newEmployer.companyName,
          industry: newEmployer.industry,
          location: newEmployer.location,
          contactPerson: newEmployer.contactPerson,
          phone: newEmployer.phone,
          email: newEmployer.email,
          activeOpenings: newEmployer.activeOpenings || 1,
          partnershipType: newEmployer.partnershipType || 'Permanent Hiring',
          status: newEmployer.status || 'Active Partner',
          website: newEmployer.notes || ''
        })
      });
    } catch (apiErr) {
      console.warn('Supabase employer save warning:', apiErr);
    }

    // 2. Sync with Firestore
    try {
      await setDoc(doc(db, 'employers', id), newEmployer, { merge: true });
    } catch (e) {
      console.warn('Firestore write warning:', e);
    }
  };

  const updateEmployer = async (id: string, updated: Partial<EmployerPartner>) => {
    setEmployers((prev) => prev.map((e) => (e.id === id ? { ...e, ...updated } : e)));

    // 1. Sync with Supabase employers table
    try {
      await fetch(`/api/employers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: updated.companyName,
          industry: updated.industry,
          location: updated.location,
          contactPerson: updated.contactPerson,
          phone: updated.phone,
          email: updated.email,
          activeOpenings: updated.activeOpenings,
          partnershipType: updated.partnershipType,
          status: updated.status,
          website: updated.notes
        })
      });
    } catch (apiErr) {
      console.warn('Supabase employer update warning:', apiErr);
    }

    // 2. Sync with Firestore
    try {
      await updateDoc(doc(db, 'employers', id), updated);
    } catch (e) {
      console.warn('Firestore write warning:', e);
    }
  };

  const deleteEmployer = async (id: string) => {
    setEmployers((prev) => prev.filter((e) => e.id !== id));

    // 1. Delete from Supabase employers table
    try {
      await fetch(`/api/employers/${id}`, {
        method: 'DELETE'
      });
    } catch (apiErr) {
      console.warn('Supabase employer delete warning:', apiErr);
    }

    // 2. Delete from Firestore
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

    // Build rich source descriptor for the Supabase employers table
    const details = [];
    if (inquiry.type) details.push(`[${inquiry.type}]`);
    if (inquiry.jobDetails?.jobTitle) details.push(`Role: ${inquiry.jobDetails.jobTitle}`);
    if (inquiry.jobDetails?.salaryOffered) details.push(`Salary: ${inquiry.jobDetails.salaryOffered}`);
    if (inquiry.jobDetails?.experienceRequired) details.push(`Exp: ${inquiry.jobDetails.experienceRequired}`);
    if (inquiry.preferredTime) details.push(`Preferred Time: ${inquiry.preferredTime}`);
    if (inquiry.note) details.push(`Note: ${inquiry.note}`);
    if (inquiry.jdUrl) details.push(`JD Document: ${inquiry.jdUrl}`);
    const sourceString = details.join(' | ');

    const companyName = (inquiry.companyName || (inquiry.contactPerson ? `${inquiry.contactPerson}'s Enterprise` : 'Corporate Partner')).trim();
    const contactPerson = (inquiry.contactPerson || 'HR Lead / Manager').trim();
    const email = (inquiry.email || `${companyName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'contact'}@company.com`).trim();
    const phone = (inquiry.phone || '+91 98243 22206').trim();
    const industry = inquiry.jobDetails?.industry || 'Manufacturing & Engineering';
    const location = inquiry.jobDetails?.location || 'Surat / Silvassa / Gujarat';
    const statusText = `Inquiry: ${inquiry.type}${inquiry.hiringUrgency ? ` (${inquiry.hiringUrgency})` : ''}`;

    const jdUrl = inquiry.jdUrl || null;

    // 1. Insert directly into the Supabase employers table with JD link
    try {
      const resp = await fetch('/api/employers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          companyName,
          contactPerson,
          email,
          phone,
          industry,
          location,
          website: jdUrl ? `${sourceString.slice(0, 300)} | [JD: ${jdUrl}]` : sourceString.slice(0, 500),
          notes: sourceString,
          status: statusText,
          jdUrl: jdUrl,
          jdFileId: inquiry.jdFileId,
          jdFileName: inquiry.jdFileName,
          jdFileSize: inquiry.jdFileSize
        })
      });
      if (resp.ok) {
        console.log('Successfully stored inquiry in Supabase employers table with JD link:', id);
      }
    } catch (apiErr) {
      console.warn('Supabase employer inquiry save warning:', apiErr);
    }

    // 2. Also register in local employers state as a lead
    setEmployers((prev) => {
      if (prev.some((e) => e.id === id)) return prev;
      const partnerEntry: EmployerPartner = {
        id,
        companyName,
        industry,
        location,
        contactPerson,
        phone,
        email,
        activeOpenings: 1,
        partnershipType: 'Permanent Hiring',
        status: 'Pending Review',
        notes: sourceString,
        website: jdUrl || undefined,
        jdUrl: jdUrl || undefined,
        jdFileId: inquiry.jdFileId,
        jdFileName: inquiry.jdFileName,
        jdFileSize: inquiry.jdFileSize
      };
      return [partnerEntry, ...prev];
    });

    // 3. Sync to Firestore
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
      await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newJob)
      });
    } catch (apiErr) {
      console.warn('Supabase job save warning:', apiErr);
    }

    try {
      await setDoc(doc(db, 'jobs', id), newJob, { merge: true });
    } catch (e) {
      console.warn('Firestore write warning:', e);
    }
  };

  const updateJob = async (id: string, updated: Partial<Job>) => {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, ...updated } : j)));

    try {
      await fetch(`/api/jobs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
    } catch (apiErr) {
      console.warn('Supabase job update warning:', apiErr);
    }

    try {
      await updateDoc(doc(db, 'jobs', id), updated);
    } catch (e) {
      console.warn('Firestore write warning:', e);
    }
  };

  const deleteJob = async (id: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== id));

    try {
      await fetch(`/api/jobs/${id}`, { method: 'DELETE' });
    } catch (apiErr) {
      console.warn('Supabase job delete warning:', apiErr);
    }

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

    // 1. Sync candidate record and PDF resume link to Supabase
    try {
      await fetch('/api/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          userId: newCandidate.userId,
          fullName: newCandidate.fullName,
          email: newCandidate.email,
          phone: newCandidate.phone,
          qualification: newCandidate.qualification,
          experience: newCandidate.experience,
          experienceYears: newCandidate.experienceYears,
          currentLocation: newCandidate.currentLocation,
          primarySkill: newCandidate.primarySkill,
          currentCompany: newCandidate.currentCompany,
          expectedSalary: newCandidate.expectedSalary,
          noticePeriod: newCandidate.noticePeriod,
          status: newCandidate.status,
          resumeFileId: newCandidate.resumeFileId,
          resumeUrl: newCandidate.resumeUrl,
          resumeFileName: newCandidate.resumeFileName,
          resumeStoragePath: newCandidate.resumeStoragePath
        })
      });
    } catch (e) {
      console.warn('Supabase candidate API sync warning:', e);
    }

    // 2. Sync to Firestore if configured
    try {
      await setDoc(doc(db, 'candidates', id), newCandidate, { merge: true });
    } catch (e) {
      console.warn('Firestore write warning:', e);
    }
    return id;
  };

  const updateCandidate = async (id: string, updated: Partial<CandidateProfile>) => {
    setCandidates((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated, updatedAt: new Date().toISOString() } : c)));
    const existing = candidates.find((c) => c.id === id);
    const merged = { ...existing, ...updated, id };

    // 1. Sync candidate update and PDF resume link to Supabase
    try {
      await fetch('/api/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          userId: merged.userId,
          fullName: merged.fullName,
          email: merged.email,
          phone: merged.phone,
          qualification: merged.qualification,
          experience: merged.experience,
          experienceYears: merged.experienceYears,
          currentLocation: merged.currentLocation,
          primarySkill: merged.primarySkill,
          currentCompany: merged.currentCompany,
          expectedSalary: merged.expectedSalary,
          noticePeriod: merged.noticePeriod,
          status: merged.status,
          resumeFileId: merged.resumeFileId,
          resumeUrl: merged.resumeUrl,
          resumeFileName: merged.resumeFileName,
          resumeStoragePath: merged.resumeStoragePath
        })
      });
    } catch (e) {
      console.warn('Supabase candidate update warning:', e);
    }

    // 2. Sync to Firestore
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
      await fetch(`/api/candidates/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('Supabase candidate delete warning:', e);
    }
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
  ): Promise<{ downloadUrl: string; storagePath: string; fileName: string }> => {
    try {
      // 1. Upload to Supabase Storage ('resumes' bucket)
      const fileRecord = await uploadFileToUnifiedStorage(file, {
        fileName: file.name,
        relatedEntityType: 'candidate_resume',
        relatedEntityId: candidateId,
        uploadedBy: extraData?.fullName || 'Candidate'
      });

      // Update storage files state
      setStorageFiles((prev) => [fileRecord, ...prev.filter((f) => f.id !== fileRecord.id)]);

      const targetUrl = fileRecord.download_url || fileRecord.storage_path || '';
      const storagePath = fileRecord.storage_path || fileRecord.folder_path || `resumes/${file.name}`;

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
        fileName: file.name
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
    
    // 1. Post structured record and resume PDF link to Supabase PostgreSQL backend API
    try {
      await fetch('/api/job-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          jobId: app.jobId,
          jobTitle: app.jobTitle,
          candidateName: app.candidateName,
          email: app.email,
          phone: app.phone,
          whatsapp: app.whatsapp,
          experience: app.experience,
          currentLocation: app.currentLocation,
          status: newApp.status,
          resumeUrl: app.resumeUrl,
          resumeFileName: app.resumeFileName,
          resumeFileId: (app as any).resumeFileId
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
    const existing = applications.find((a) => a.id === id);
    const merged = { ...existing, ...updated, id };

    // 1. Sync update to Supabase
    try {
      await fetch('/api/job-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          jobId: merged.jobId,
          jobTitle: merged.jobTitle,
          candidateName: merged.candidateName,
          email: merged.email,
          phone: merged.phone,
          whatsapp: merged.whatsapp,
          experience: merged.experience,
          currentLocation: merged.currentLocation,
          status: merged.status,
          resumeUrl: merged.resumeUrl,
          resumeFileName: merged.resumeFileName,
          resumeFileId: (merged as any).resumeFileId
        })
      });
    } catch (e) {
      console.warn('Supabase job application update warning:', e);
    }

    // 2. Sync to Firestore
    try {
      await updateDoc(doc(db, 'applications', id), updated);
    } catch (e) {
      console.warn('Firestore write warning:', e);
    }
  };

  const deleteApplication = async (id: string) => {
    setApplications((prev) => prev.filter((a) => a.id !== id));
    try {
      await fetch(`/api/job-applications/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('Supabase application delete warning:', e);
    }
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
      await fetch('/api/placements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPlacement)
      });
    } catch (apiErr) {
      console.warn('Supabase placement save warning:', apiErr);
    }

    try {
      await setDoc(doc(db, 'placements', id), newPlacement, { merge: true });
    } catch (e) {
      console.warn('Firestore write warning:', e);
    }
  };

  const updatePlacement = async (id: string, updated: Partial<PlacementItem>) => {
    setPlacements((prev) => prev.map((p) => (p.id === id ? { ...p, ...updated } : p)));

    try {
      await fetch(`/api/placements/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
    } catch (apiErr) {
      console.warn('Supabase placement update warning:', apiErr);
    }

    try {
      await updateDoc(doc(db, 'placements', id), updated);
    } catch (e) {
      console.warn('Firestore write warning:', e);
    }
  };

  const deletePlacement = async (id: string) => {
    setPlacements((prev) => prev.filter((p) => p.id !== id));

    try {
      await fetch(`/api/placements/${id}`, { method: 'DELETE' });
    } catch (apiErr) {
      console.warn('Supabase placement delete warning:', apiErr);
    }

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
    const id = testimonial.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `test-${Date.now()}`);
    const effectiveStatus = testimonial.status || (testimonial.is_approved === true ? 'approved' : testimonial.is_approved === false ? 'pending' : 'pending');
    const newTestimonial: Testimonial = {
      ...testimonial,
      id,
      status: effectiveStatus,
      is_approved: effectiveStatus === 'approved',
      createdAt: testimonial.createdAt || new Date().toISOString()
    };
    setTestimonials((prev) => [newTestimonial, ...prev.filter((t) => t.id !== id)]);

    // 1. Sync to Supabase PostgreSQL database
    try {
      const response = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          name: newTestimonial.name,
          role: newTestimonial.role,
          company: newTestimonial.company,
          location: newTestimonial.location,
          content: newTestimonial.content,
          rating: newTestimonial.rating,
          avatar: newTestimonial.avatar || newTestimonial.image,
          image: newTestimonial.avatar || newTestimonial.image,
          type: newTestimonial.type,
          status: newTestimonial.status,
          is_approved: newTestimonial.is_approved,
          submitted_by: newTestimonial.submittedBy
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          const serverItem = result.data;
          setTestimonials((prev) =>
            prev.map((t) =>
              t.id === id || t.id === serverItem.id
                ? {
                    ...t,
                    id: serverItem.id,
                    avatar: serverItem.avatar || t.avatar,
                    image: serverItem.image || t.image,
                    status: serverItem.status || t.status,
                    is_approved: serverItem.is_approved !== undefined ? serverItem.is_approved : t.is_approved
                  }
                : t
            )
          );
        }
      }
    } catch (e) {
      console.warn('Supabase testimonial add API warning:', e);
    }

    // 2. Sync to Firestore
    try {
      await setDoc(doc(db, 'testimonials', id), newTestimonial, { merge: true });
    } catch (e) {
      console.warn('Firestore write warning:', e);
    }
  };

  const updateTestimonial = async (id: string, updated: Partial<Testimonial>) => {
    setTestimonials((prev) => prev.map((t) => (t.id === id ? { ...t, ...updated } : t)));
    const existing = testimonials.find((t) => t.id === id);
    const merged = { ...existing, ...updated, id };

    // 1. Sync to Supabase PostgreSQL database
    try {
      await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          name: merged.name,
          role: merged.role,
          company: merged.company,
          location: merged.location,
          content: merged.content,
          rating: merged.rating,
          avatar: merged.avatar || merged.image,
          image: merged.avatar || merged.image,
          type: merged.type,
          status: merged.status,
          is_approved: merged.is_approved
        })
      });
    } catch (e) {
      console.warn('Supabase testimonial update API warning:', e);
    }

    // 2. Sync to Firestore
    try {
      await updateDoc(doc(db, 'testimonials', id), updated);
    } catch (e) {
      console.warn('Firestore write warning:', e);
    }
  };

  const approveTestimonial = async (id: string) => {
    setTestimonials((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'approved', is_approved: true } : t))
    );
    try {
      await fetch(`/api/testimonials/${encodeURIComponent(id)}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' })
      });
    } catch (e) {
      console.warn('Supabase testimonial approve API warning:', e);
    }
    try {
      await updateDoc(doc(db, 'testimonials', id), { status: 'approved', is_approved: true });
    } catch (e) {
      console.warn('Firestore write warning:', e);
    }
  };

  const rejectTestimonial = async (id: string) => {
    setTestimonials((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'rejected', is_approved: false } : t))
    );
    try {
      await fetch(`/api/testimonials/${encodeURIComponent(id)}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected' })
      });
    } catch (e) {
      console.warn('Supabase testimonial reject API warning:', e);
    }
    try {
      await updateDoc(doc(db, 'testimonials', id), { status: 'rejected', is_approved: false });
    } catch (e) {
      console.warn('Firestore write warning:', e);
    }
  };

  const updateTestimonialStatus = async (id: string, status: 'approved' | 'pending' | 'rejected') => {
    if (status === 'approved') {
      await approveTestimonial(id);
    } else if (status === 'rejected') {
      await rejectTestimonial(id);
    } else {
      setTestimonials((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: 'pending', is_approved: false } : t))
      );
      try {
        await fetch(`/api/testimonials/${encodeURIComponent(id)}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'pending' })
        });
      } catch (e) {
        console.warn('Supabase status update error:', e);
      }
      try {
        await updateDoc(doc(db, 'testimonials', id), { status: 'pending', is_approved: false });
      } catch (e) {
        console.warn('Firestore write warning:', e);
      }
    }
  };

  const deleteTestimonial = async (id: string) => {
    setTestimonials((prev) => prev.filter((t) => t.id !== id));

    // 1. Sync delete to Supabase PostgreSQL database
    try {
      await fetch(`/api/testimonials/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
    } catch (e) {
      console.warn('Supabase testimonial delete API warning:', e);
    }

    // 2. Sync to Firestore
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
      await fetch(`/api/contact/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('Supabase contact delete warning:', e);
    }
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

    // 1. Sync invoice structured data and PDF link to Supabase
    try {
      await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          invoiceNumber: newInvoice.invoiceNumber,
          invoiceDate: newInvoice.invoiceDate,
          dueDate: newInvoice.dueDate,
          clientName: newInvoice.clientName,
          clientCompany: (newInvoice as any).clientCompany || newInvoice.clientName,
          clientGstin: newInvoice.clientGstin,
          clientAddress: newInvoice.clientAddress,
          taxMode: newInvoice.taxMode,
          items: newInvoice.items,
          subtotal: newInvoice.subtotal,
          discount: newInvoice.discount,
          taxableAmount: newInvoice.taxableAmount,
          totalGst: newInvoice.totalGst,
          grandTotal: newInvoice.grandTotal,
          paymentStatus: newInvoice.paymentStatus || 'Pending',
          pdfFileId: newInvoice.pdfFileId,
          pdfUrl: newInvoice.pdfUrl
        })
      });
    } catch (e) {
      console.warn('Supabase invoice API call warning:', e);
    }

    // 2. Sync to Firestore
    try {
      await setDoc(doc(db, 'invoices', id), newInvoice, { merge: true });
    } catch (e) {
      console.warn('Firestore write warning:', e);
    }
    return id;
  };

  const updateInvoice = async (id: string, updated: Partial<Invoice>) => {
    setInvoices((prev) => prev.map((i) => (i.id === id ? { ...i, ...updated, updatedAt: new Date().toISOString() } : i)));
    const existing = invoices.find((i) => i.id === id);
    const merged = { ...existing, ...updated, id };

    // 1. Sync update to Supabase
    try {
      await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          invoiceNumber: merged.invoiceNumber,
          invoiceDate: merged.invoiceDate,
          dueDate: merged.dueDate,
          clientName: merged.clientName,
          clientCompany: (merged as any).clientCompany || merged.clientName,
          clientGstin: merged.clientGstin,
          clientAddress: merged.clientAddress,
          taxMode: merged.taxMode,
          items: merged.items,
          subtotal: merged.subtotal,
          discount: merged.discount,
          taxableAmount: merged.taxableAmount,
          totalGst: merged.totalGst,
          grandTotal: merged.grandTotal,
          paymentStatus: merged.paymentStatus || 'Pending',
          pdfFileId: merged.pdfFileId,
          pdfUrl: merged.pdfUrl
        })
      });
    } catch (e) {
      console.warn('Supabase invoice update warning:', e);
    }

    // 2. Sync to Firestore
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
      await fetch(`/api/invoices/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('Supabase invoice delete warning:', e);
    }
    try {
      await deleteDoc(doc(db, 'invoices', id));
    } catch (e) {
      console.warn('Firestore delete warning:', e);
    }
  };

  const uploadInvoicePdf = async (
    invoiceNumber: string, 
    pdfBlob: Blob
  ): Promise<{ downloadUrl: string; storagePath: string }> => {
    try {
      const fileName = `Invoice_${invoiceNumber.replace(/[^a-zA-Z0-9._-]/g, '_')}.pdf`;
      const fileRecord = await uploadFileToUnifiedStorage(pdfBlob, {
        fileName,
        relatedEntityType: 'invoice_pdf',
        relatedEntityId: invoiceNumber,
        uploadedBy: 'Sarthi Accounts'
      });

      setStorageFiles((prev) => [fileRecord, ...prev.filter((f) => f.id !== fileRecord.id)]);

      const targetUrl = fileRecord.download_url || fileRecord.storage_path || '';
      const storagePath = fileRecord.storage_path || fileRecord.folder_path || `invoices/${fileName}`;

      const matching = invoices.find((i) => i.invoiceNumber === invoiceNumber);
      if (matching) {
        await updateInvoice(matching.id, {
          pdfUrl: targetUrl,
          pdfStoragePath: storagePath
        });
      }

      return {
        downloadUrl: targetUrl,
        storagePath: storagePath
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
      await fetch('/api/website-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
    } catch (e) {
      console.warn('Supabase website settings update warning:', e);
    }

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
        refreshEmployersFromSupabase,
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
        approveTestimonial,
        rejectTestimonial,
        updateTestimonialStatus,
        refreshTestimonialsFromSupabase,

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
        resetAllToDefaults,
        refreshAllFromSupabase,
        syncAllToSupabase
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
