export interface Job {
  id: string;
  title: string;
  companyName: string;
  industry: string;
  location: string;
  salary: string;
  experience: string;
  qualification: string;
  ageRange?: string;
  employmentType: 'Full-time' | 'Contract' | 'Part-time' | 'Urgent';
  genderPreference?: 'Male' | 'Female' | 'Male/Female' | 'Any';
  vacancies?: number;
  department?: string;
  workingHours?: string;
  isUrgent?: boolean;
  isFeatured?: boolean;
  category: 'Manufacturing' | 'Industrial' | 'Elevator' | 'Engineering' | 'IT' | 'Finance' | 'Sales' | 'HR' | 'Executive';
  contactPerson: string;
  contactPhone: string;
  whatsappNumber: string;
  description: string;
  keyResponsibilities: string[];
  keyRequirements: string[];
  hrComplianceSkills?: string[];
  plantOperationsKnowledge?: string[];
  commercialOpsKnowledge?: string[];
  preferredDepartmentKnowledge?: string[];
  mandatoryIndustryExp?: string;
  freshersEligible?: boolean;
  postedDate: string;
}

export interface Service {
  id: string;
  title: string;
  shortDesc: string;
  fullDesc: string;
  iconName: string;
  features: string[];
  category?: string;
  benefits?: string[];
  deliverable?: string;
  timeline?: string;
  order?: number;
}

export interface ApplicationFormData {
  fullName: string;
  email: string;
  phone: string;
  whatsapp?: string;
  experienceYears?: string;
  qualification?: string;
  currentLocation?: string;
  noticePeriod?: string;
  currentCTC?: string;
  expectedCTC?: string;
  resumeFileName?: string;
  resumeUrl?: string;
  resumeStoragePath?: string;
  coverLetter?: string;
  jobId: string;
  jobTitle: string;
}

export interface EnquiryFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  userType: 'Candidate' | 'Employer' | 'General';
  message: string;
}

export interface CandidateProfile {
  id: string;
  userId?: string;
  fullName: string;
  email: string;
  phone: string;
  qualification?: string;
  highestQualification?: string;
  experience?: string;
  experienceYears?: number | string;
  industry?: string;
  keySkills?: string[];
  skills?: string[];
  primarySkill?: string;
  additionalSkills?: string[];
  currentLocation?: string;
  location?: string;
  currentCompany?: string;
  currentDesignation?: string;
  targetRole?: string;
  currentSalary?: string;
  currentCTC?: string;
  expectedSalary?: string;
  expectedCTC?: string;
  noticePeriod?: string;
  gender?: string;
  dob?: string;
  resumeFileId?: string;
  resumeUrl?: string;
  resumeGoogleDriveUrl?: string;
  resumeStoragePath?: string;
  resumeFileName?: string;
  resumeFileSize?: number;
  resumeFileType?: string;
  resumeUploadDate?: string;
  appliedJobsCount?: number;
  status: 'Available' | 'In Screening' | 'Interview Scheduled' | 'Shortlisted' | 'Placed' | 'Pending Review' | 'Under Review' | 'Rejected' | 'Inactive';
  category?: string;
  notes?: string;
  extractedInfo?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  image?: string;
  avatar?: string;
  content: string;
  rating: number;
  type: 'Candidate' | 'Employer';
  location?: string;
  date?: string;
  status?: 'approved' | 'pending' | 'rejected';
  is_approved?: boolean;
  driveFileId?: string;
  drive_file_id?: string;
  driveUrl?: string;
  drive_url?: string;
  googleDriveUrl?: string;
  googleDriveViewUrl?: string;
  submittedBy?: string;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  image: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'Candidates' | 'Employers' | 'General';
}

export interface PlacementItem {
  id: string;
  candidate: string;
  candidateName?: string;
  role: string;
  company: string;
  companyName?: string;
  location: string;
  salary: string;
  package?: string;
  category: string;
  industry?: string;
  date: string;
  photoUrl?: string;
}

export interface PlacementStats {
  totalPlacements: string;
  partnerEmployers: string;
  placementRate: string;
  averageTurnaround: string;
}

export interface EmployerPartner {
  id: string;
  companyName: string;
  name?: string;
  industry: string;
  location: string;
  contactPerson: string;
  phone: string;
  email: string;
  activeOpenings: number;
  hiresCount?: number;
  partnershipType?: 'Permanent Hiring' | 'Contract Staffing' | 'Executive Search' | 'HR Advisory';
  status: 'Active Partner' | 'Pending Review' | 'Urgent Hiring';
  isFeatured?: boolean;
  relationshipYears?: number;
  notes?: string;
  logoUrl?: string;
}

export interface EmployerInquiry {
  id: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  preferredTime: string;
  hiringUrgency: string;
  note?: string;
  date: string;
  status: 'New' | 'Contacted' | 'In Sourcing' | 'Fulfilled';
  type: 'Callback Request' | 'Job Description Submission';
  jobDetails?: {
    jobTitle?: string;
    industry?: string;
    location?: string;
    salaryOffered?: string;
    experienceRequired?: string;
    qualificationNeeded?: string;
    description?: string;
  };
}

export interface OfficeContact {
  id: string;
  branchName: string;
  city: string;
  address: string;
  contactPerson: string;
  phone: string;
  whatsapp: string;
  email: string;
  workingHours: string;
  isHeadOffice?: boolean;
  isPrimary?: boolean;
  googleMapsUrl?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  userType: 'Candidate' | 'Employer' | 'General';
  message: string;
  date: string;
  status: 'New' | 'In Progress' | 'Resolved';
}

export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  candidateId?: string;
  candidateName: string;
  phone: string;
  whatsapp?: string;
  email: string;
  qualification?: string;
  experience: string;
  currentLocation: string;
  currentCTC?: string;
  expectedCTC?: string;
  noticePeriod?: string;
  appliedDate: string;
  status: 'Pending Review' | 'Pre-Screened' | 'Shortlisted' | 'Interview Scheduled' | 'Placed' | 'Selected' | 'Rejected';
  interviewDate?: string;
  resumeFileId?: string;
  resumeUrl?: string;
  resumeGoogleDriveUrl?: string;
  resumeStoragePath?: string;
  resumeFileName?: string;
  notes?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  candidateName?: string;
  sacCode?: string;
  hsnSac?: string;
  annualCtc?: number;
  feePercentage?: number;
  quantity?: number;
  unitPrice?: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  poNumber?: string;
  placeOfSupply?: string;
  clientName: string;
  clientCompany?: string;
  clientGst?: string;
  clientGstin?: string;
  clientAddress: string;
  clientContactPerson?: string;
  clientPhone?: string;
  clientEmail?: string;
  billingType?: string;
  taxMode: 'INTRA_STATE' | 'INTER_STATE' | 'EXEMPT';
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  taxableAmount: number;
  isInterState?: boolean;
  cgstRate?: number;
  cgstAmount?: number;
  sgstRate?: number;
  sgstAmount?: number;
  igstRate?: number;
  igstAmount?: number;
  totalGst: number;
  grandTotal: number;
  totalInWords: string;
  paymentStatus: 'Pending' | 'Paid' | 'Partially Paid' | 'Draft' | 'Cancelled';
  paymentMethod?: string;
  transactionRef?: string;
  notes?: string;
  termsAndConditions?: string;
  pdfFileId?: string;
  pdfStoragePath?: string;
  pdfUrl?: string;
  pdfGoogleDriveUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface WebsiteSettings {
  companyName: string;
  proprietor: string;
  tagline: string;
  gstin: string;
  pan: string;
  msme: string;
  address: string;
  primaryPhone: string;
  whatsappNumber: string;
  email: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  ifscCode: string;
  branchName: string;
  termsConditions: string;
}

export interface UserAccount {
  uid: string;
  email: string;
  displayName: string;
  role: 'Admin' | 'Candidate';
  phone?: string;
  companyName?: string;
  createdAt?: string;
}

export interface FilterState {
  searchQuery: string;
  location: string;
  category: string;
  qualification: string;
  experience: string;
  salaryRange: string;
  employmentType: string;
  genderPreference: string;
}

export type StorageProvider = 'supabase' | 'google_drive' | 'local';

export interface FileRecord {
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
  created_at: string;
  updated_at: string;
}

export interface StorageUploadResponse {
  success: boolean;
  file: FileRecord;
  message?: string;
}

export interface StorageHealthStatus {
  status: 'healthy' | 'configured' | 'fallback';
  supabaseConnected: boolean;
  supabaseStorageReady: boolean;
  googleDriveConnected: boolean;
  googleDriveFolderId?: string;
  maxSupabaseFileSize: number;
  environment: {
    hasSupabaseUrl: boolean;
    hasSupabaseAnonKey: boolean;
    hasSupabaseServiceKey: boolean;
    hasGoogleDriveClientId: boolean;
    hasGoogleDriveClientSecret: boolean;
    hasGoogleDriveRefreshToken: boolean;
    hasGoogleDriveFolderId: boolean;
  };
}
