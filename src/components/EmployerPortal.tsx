import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useData } from '../context/DataContext';
import { 
  Building2, 
  Users, 
  FileText, 
  PhoneCall, 
  CheckCircle2, 
  Send,
  Upload,
  Clock,
  MessageSquare,
  Search,
  Briefcase,
  MapPin,
  GraduationCap,
  Sparkles,
  Loader2,
  X,
  Award,
  ChevronRight,
  ShieldCheck,
  Building,
  ExternalLink,
  Copy,
  Check,
  FolderOpen,
  FileCheck,
  HardDrive,
  Database
} from 'lucide-react';

interface VettedCandidate {
  id: string;
  name: string;
  role: string;
  category: 'Engineering & Plant' | 'Elevator Mfg' | 'QA & Lab' | 'CAD & Design' | 'Sales & Commercial' | 'Operations';
  exp: string;
  loc: string;
  qualification: string;
  skills: string[];
  status: 'Pre-Screened' | 'Interview Ready' | 'Available Immediately';
  highlight: string;
}

const VETTED_CANDIDATE_POOL: VettedCandidate[] = [
  {
    id: 'cand-v-001',
    name: 'Rakesh Patel',
    role: 'Assistant Factory Manager',
    category: 'Engineering & Plant',
    exp: '9 Years Industrial',
    loc: 'Silvassa (D&NH) / Vapi',
    qualification: 'BE Mechanical',
    skills: ['Plant Operations', 'Team Management', 'Production Planning', '5S / Kaizen', 'Safety Audits'],
    status: 'Pre-Screened',
    highlight: 'Managed 150+ shop-floor workforce with 98% on-time delivery track record.'
  },
  {
    id: 'cand-v-002',
    name: 'Amit Shah',
    role: 'Sales Head (Elevator Components)',
    category: 'Elevator Mfg',
    exp: '7 Years Elevator Mfg',
    loc: 'Surat, Gujarat',
    qualification: 'MBA Marketing & Sales',
    skills: ['B2B Channel Sales', 'OEM Contracting', 'Elevator Components', 'Gujarat & Maharashtra Territory'],
    status: 'Interview Ready',
    highlight: 'Generated ₹12+ Cr annual B2B pipeline across OEM elevator manufacturers in Western India.'
  },
  {
    id: 'cand-v-003',
    name: 'Priya Joshi',
    role: 'Quality Control Executive',
    category: 'QA & Lab',
    exp: '3.5 Years QA / QC',
    loc: 'Surat / Sachin GIDC',
    qualification: 'B.Sc Chemistry / QMS Certified',
    skills: ['QMS Documentation', 'ISO 9001:2015', 'Raw Material Testing', 'Vendor Inspection'],
    status: 'Interview Ready',
    highlight: 'Expert in statistical process control (SPC) and vendor audits for precision manufacturing.'
  },
  {
    id: 'cand-v-004',
    name: 'Vijay Kumar',
    role: 'AutoCAD & SolidWorks Design Specialist',
    category: 'CAD & Design',
    exp: '5 Years CAD/CAM',
    loc: 'Bhestan Udhna, Surat',
    qualification: 'Diploma Mechanical Engineering',
    skills: ['AutoCAD 2D/3D', 'SolidWorks', 'Sheet Metal Fabrication', 'GD&T', 'Tooling Design'],
    status: 'Available Immediately',
    highlight: 'Designed 300+ precision elevator mechanical components with zero rework tolerance.'
  },
  {
    id: 'cand-v-005',
    name: 'Hitesh Solanki',
    role: 'Senior CNC & VMC Machine Programmer',
    category: 'Engineering & Plant',
    exp: '6 Years Machining',
    loc: 'Silvassa / Daman',
    qualification: 'ITI / Diploma Mechanical',
    skills: ['Fanuc CNC', 'Siemens VMC', 'MasterCAM', 'Precision Tolerances', 'Cycle Time Optimization'],
    status: 'Pre-Screened',
    highlight: 'Reduced machining cycle times by 18% across high-precision export tooling batches.'
  },
  {
    id: 'cand-v-006',
    name: 'Deepak Parmar',
    role: 'Industrial Store & Logistics Incharge',
    category: 'Operations',
    exp: '4.5 Years Warehouse',
    loc: 'Vapi / Ankleshwar GIDC',
    qualification: 'B.Com / Supply Chain Management',
    skills: ['SAP MM', 'Inventory Audits', 'Raw Material Dispatch', 'FIFO / LIFO', 'Gate Inward Systems'],
    status: 'Interview Ready',
    highlight: 'Maintained 99.8% stock reconciliation accuracy across 5,000+ industrial SKU inventory.'
  }
];

export const EmployerPortal: React.FC = () => {
  const { addEmployerInquiry, uploadStorageFile } = useData();
  const [activeTab, setActiveTab] = useState<'callback' | 'submit_jd' | 'candidates'>('callback');
  
  // Callback Form State
  const [callbackLoading, setCallbackLoading] = useState(false);
  const [callbackSuccess, setCallbackSuccess] = useState(false);
  const [callbackForm, setCallbackForm] = useState({
    companyName: '',
    contactPerson: '',
    phone: '',
    email: '',
    preferredTime: 'Immediately (Within 30 Mins)',
    hiringUrgency: 'Urgent (Within 48 Hours)',
    location: 'Surat, Gujarat',
    note: ''
  });

  // Submit JD State
  const [jdLoading, setJdLoading] = useState(false);
  const [jdSuccess, setJdSuccess] = useState(false);
  const [jdProgressMsg, setJdProgressMsg] = useState<string | null>(null);
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [submittedJdResult, setSubmittedJdResult] = useState<{
    companyName: string;
    jobTitle: string;
    googleDriveUrl?: string;
    googleDriveViewUrl?: string;
    fileName?: string;
    fileSize?: number;
    supabaseId?: string;
  } | null>(null);
  const [copiedDriveLink, setCopiedDriveLink] = useState(false);
  const jdFileInputRef = useRef<HTMLInputElement | null>(null);

  const [jdForm, setJdForm] = useState({
    companyName: '',
    jobTitle: '',
    industry: 'Manufacturing & Engineering',
    location: 'Surat, Gujarat',
    salaryOffered: '',
    experienceRequired: '3-5 Years',
    qualificationNeeded: 'Degree / Diploma',
    description: '',
    contactName: '',
    phone: '',
    email: ''
  });

  // Explore Vetted Talent State
  const [talentSearch, setTalentSearch] = useState('');
  const [talentCategory, setTalentCategory] = useState<string>('All');
  const [selectedCandidate, setSelectedCandidate] = useState<VettedCandidate | null>(null);
  const [talentRequestModalOpen, setTalentRequestModalOpen] = useState(false);
  const [talentRequestLoading, setTalentRequestLoading] = useState(false);
  const [talentRequestSuccess, setTalentRequestSuccess] = useState(false);
  const [talentForm, setTalentForm] = useState({
    companyName: '',
    contactPerson: '',
    phone: '',
    email: '',
    location: 'Surat / Silvassa / Gujarat',
    joiningUrgency: 'Immediate (Within 7 Days)',
    targetSalary: 'As Per Industry Standard',
    hiringNotes: ''
  });

  // Filtered Vetted Talent
  const filteredCandidates = useMemo(() => {
    return VETTED_CANDIDATE_POOL.filter((cand) => {
      const matchesSearch = 
        cand.name.toLowerCase().includes(talentSearch.toLowerCase()) ||
        cand.role.toLowerCase().includes(talentSearch.toLowerCase()) ||
        cand.loc.toLowerCase().includes(talentSearch.toLowerCase()) ||
        cand.skills.some((s) => s.toLowerCase().includes(talentSearch.toLowerCase()));
      
      const matchesCategory = talentCategory === 'All' || cand.category === talentCategory;
      return matchesSearch && matchesCategory;
    });
  }, [talentSearch, talentCategory]);

  // 1. Submit Callback Form (Persists to Supabase employers table)
  const handleCallbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCallbackLoading(true);
    try {
      await addEmployerInquiry({
        companyName: callbackForm.companyName.trim(),
        contactPerson: callbackForm.contactPerson.trim(),
        phone: callbackForm.phone.trim(),
        email: callbackForm.email.trim() || `${callbackForm.companyName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'contact'}@company.com`,
        preferredTime: callbackForm.preferredTime,
        hiringUrgency: callbackForm.hiringUrgency,
        note: callbackForm.note.trim(),
        status: 'New',
        type: 'Callback Request',
        jobDetails: {
          location: callbackForm.location,
          industry: 'Industrial Manufacturing & Engineering'
        }
      });
      setCallbackSuccess(true);
      setTimeout(() => {
        setCallbackSuccess(false);
        setCallbackForm({
          companyName: '',
          contactPerson: '',
          phone: '',
          email: '',
          preferredTime: 'Immediately (Within 30 Mins)',
          hiringUrgency: 'Urgent (Within 48 Hours)',
          location: 'Surat, Gujarat',
          note: ''
        });
      }, 5000);
    } catch (err) {
      console.error('Error submitting callback request:', err);
    } finally {
      setCallbackLoading(false);
    }
  };

  // 2. Submit JD Form (Uploads JD document to Google Drive & stores record in Supabase database)
  const handleJdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setJdLoading(true);
    setJdProgressMsg('Submitting job description...');
    try {
      let fileAttachmentUrl = '';
      let fileViewUrl = '';
      let driveFileId = '';
      let fileName = '';
      let fileSize = 0;

      const companyTitle = jdForm.companyName ? jdForm.companyName.trim() : (jdForm.contactName ? `${jdForm.contactName}'s Enterprise` : 'Corporate Employer');
      const contactPersonTitle = jdForm.contactName ? jdForm.contactName.trim() : 'HR Lead';
      const emailAddress = jdForm.email.trim() || `${companyTitle.toLowerCase().replace(/[^a-z0-9]/g, '') || 'hr'}@company.com`;

      // 1. Upload JD file to Google Drive (background)
      if (jdFile) {
        setJdProgressMsg(`Uploading document "${jdFile.name}"...`);
        try {
          const uploadedRecord = await uploadStorageFile(jdFile, {
            fileName: `JD_${jdForm.jobTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.${jdFile.name.split('.').pop()}`,
            relatedEntityType: 'job_description',
            customFolder: 'Job Descriptions',
            uploadedBy: jdForm.contactName || companyTitle,
            metadata: {
              companyName: companyTitle,
              jobTitle: jdForm.jobTitle,
              industry: jdForm.industry,
              location: jdForm.location
            }
          });
          fileAttachmentUrl = uploadedRecord.google_drive_url || uploadedRecord.download_url || '';
          fileViewUrl = uploadedRecord.google_drive_view_url || uploadedRecord.google_drive_url || uploadedRecord.download_url || '';
          driveFileId = uploadedRecord.google_drive_file_id || uploadedRecord.id;
          fileName = uploadedRecord.original_file_name || jdFile.name;
          fileSize = uploadedRecord.file_size || jdFile.size;
        } catch (uploadErr) {
          console.warn('JD file upload notice:', uploadErr);
        }
      }

      setJdProgressMsg('Registering hiring mandate...');

      const fullNote = `${jdForm.description} ${fileAttachmentUrl ? `[Google Drive JD: ${fileAttachmentUrl}]` : ''}`.trim();
      const generatedId = `jd-${Date.now()}`;

      await addEmployerInquiry({
        id: generatedId,
        companyName: companyTitle,
        contactPerson: contactPersonTitle,
        phone: jdForm.phone.trim() || '+91 98243 22206',
        email: emailAddress,
        preferredTime: 'Business Hours (9 AM - 6 PM)',
        hiringUrgency: 'Immediate Mandate',
        note: fullNote,
        status: 'New',
        type: 'Job Description Submission',
        jdUrl: fileAttachmentUrl || undefined,
        jdGoogleDriveUrl: fileAttachmentUrl || undefined,
        jdGoogleDriveViewUrl: fileViewUrl || fileAttachmentUrl || undefined,
        jdFileId: driveFileId || undefined,
        jdFileName: fileName || undefined,
        jdFileSize: fileSize || undefined,
        jobDetails: {
          jobTitle: jdForm.jobTitle.trim(),
          industry: jdForm.industry,
          location: jdForm.location,
          salaryOffered: jdForm.salaryOffered || 'Negotiable / Standard',
          experienceRequired: jdForm.experienceRequired,
          qualificationNeeded: jdForm.qualificationNeeded,
          description: fullNote
        }
      });

      setSubmittedJdResult({
        companyName: companyTitle,
        jobTitle: jdForm.jobTitle.trim(),
        googleDriveUrl: fileAttachmentUrl || undefined,
        googleDriveViewUrl: fileViewUrl || fileAttachmentUrl || undefined,
        fileName: fileName || jdFile?.name,
        fileSize: fileSize || jdFile?.size,
        supabaseId: generatedId
      });

      setJdSuccess(true);
    } catch (err) {
      console.error('Error submitting job description:', err);
      alert('An error occurred while submitting the Job Description. Please try again.');
    } finally {
      setJdLoading(false);
      setJdProgressMsg(null);
    }
  };

  const handleResetJdForm = () => {
    setJdSuccess(false);
    setSubmittedJdResult(null);
    setJdFile(null);
    if (jdFileInputRef.current) jdFileInputRef.current.value = '';
    setJdForm({
      companyName: '',
      jobTitle: '',
      industry: 'Manufacturing & Engineering',
      location: 'Surat, Gujarat',
      salaryOffered: '',
      experienceRequired: '3-5 Years',
      qualificationNeeded: 'Degree / Diploma',
      description: '',
      contactName: '',
      phone: '',
      email: ''
    });
  };

  // 3. Submit Explore Vetted Talent Request (Persists to Supabase employers table)
  const handleTalentRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidate) return;
    setTalentRequestLoading(true);
    try {
      const companyTitle = talentForm.companyName.trim() || `${talentForm.contactPerson}'s Enterprise`;
      const contactPersonTitle = talentForm.contactPerson.trim() || 'HR Director';
      const emailAddress = talentForm.email.trim() || `${companyTitle.toLowerCase().replace(/[^a-z0-9]/g, '') || 'recruitment'}@company.com`;
      const noteDetails = `Requested Vetted Candidate: ${selectedCandidate.name} (${selectedCandidate.role}) | Target Joining: ${talentForm.joiningUrgency} | Target Salary: ${talentForm.targetSalary} | Specific Requirements: ${talentForm.hiringNotes || 'Standard pre-screened profile request'}`;

      await addEmployerInquiry({
        companyName: companyTitle,
        contactPerson: contactPersonTitle,
        phone: talentForm.phone.trim() || '+91 98243 22206',
        email: emailAddress,
        preferredTime: 'Priority Dispatch (Within 24 Hours)',
        hiringUrgency: talentForm.joiningUrgency,
        note: noteDetails,
        status: 'New',
        type: 'Callback Request',
        jobDetails: {
          jobTitle: `Talent Sourcing: ${selectedCandidate.role} (${selectedCandidate.name})`,
          industry: selectedCandidate.category,
          location: talentForm.location,
          salaryOffered: talentForm.targetSalary,
          experienceRequired: selectedCandidate.exp,
          qualificationNeeded: selectedCandidate.qualification,
          description: noteDetails
        }
      });

      setTalentRequestSuccess(true);
      setTimeout(() => {
        setTalentRequestSuccess(false);
        setTalentRequestModalOpen(false);
        setSelectedCandidate(null);
        setTalentForm({
          companyName: '',
          contactPerson: '',
          phone: '',
          email: '',
          location: 'Surat / Silvassa / Gujarat',
          joiningUrgency: 'Immediate (Within 7 Days)',
          targetSalary: 'As Per Industry Standard',
          hiringNotes: ''
        });
      }, 4000);
    } catch (err) {
      console.error('Error submitting talent profile request:', err);
    } finally {
      setTalentRequestLoading(false);
    }
  };

  const openTalentModal = (cand: VettedCandidate) => {
    setSelectedCandidate(cand);
    setTalentRequestSuccess(false);
    setTalentRequestModalOpen(true);
  };

  return (
    <div id="employers" className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Top Header Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-[#0A3D91] to-[#082a63] text-white rounded-3xl p-6 sm:p-8 mb-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#D9A21B] text-[#0A3D91] font-black text-2xl flex items-center justify-center shadow-lg border-2 border-white shrink-0">
            <Building2 className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">Employer Hiring Portal</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-[#D9A21B] text-[#0A3D91] text-[10px] font-black uppercase tracking-wider">
                Supabase PostgreSQL Synchronized
              </span>
            </div>
            <p className="text-xs text-blue-100 mt-1 max-w-2xl leading-relaxed">
              Partner directly with Principal Consultant <strong>Raajesh V</strong> (+91 98243 22206) for rapid industrial manpower deployment across Surat, Silvassa, Vapi, and Gujarat manufacturing belts.
            </p>
          </div>
        </div>

        {/* Action Highlights */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('callback')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 shadow-md cursor-pointer ${
              activeTab === 'callback'
                ? 'bg-[#D9A21B] text-[#0A3D91]'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <PhoneCall className="w-4 h-4" /> Request Call Back
          </button>
          
          <button
            onClick={() => setActiveTab('submit_jd')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 shadow-md cursor-pointer ${
              activeTab === 'submit_jd'
                ? 'bg-[#D9A21B] text-[#0A3D91]'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <FileText className="w-4 h-4" /> Submit JD
          </button>

          <button
            onClick={() => setActiveTab('candidates')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 shadow-md cursor-pointer ${
              activeTab === 'candidates'
                ? 'bg-[#D9A21B] text-[#0A3D91]'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Users className="w-4 h-4" /> Explore Talent
          </button>
        </div>
      </motion.div>

      {/* Main Employer Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-8 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('callback')}
          className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-extrabold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'callback'
              ? 'bg-[#0A3D91] text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <PhoneCall className="w-4 h-4 text-[#D9A21B]" />
          <span>Request A Call Back</span>
        </button>

        <button
          onClick={() => setActiveTab('submit_jd')}
          className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-extrabold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'submit_jd'
              ? 'bg-[#0A3D91] text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileText className="w-4 h-4 text-[#D9A21B]" />
          <span>Submit A Job Description</span>
        </button>

        <button
          onClick={() => setActiveTab('candidates')}
          className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-extrabold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'candidates'
              ? 'bg-[#0A3D91] text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4 text-[#D9A21B]" />
          <span>Explore Vetted Talent</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        
        {/* ========================================================================= */}
        {/* TAB 1: Request A Call Back                                                */}
        {/* ========================================================================= */}
        {activeTab === 'callback' && (
          <motion.div 
            key="callback"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Left Form */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md">
              <div className="flex items-center gap-2 text-[#0A3D91] font-black text-xs uppercase tracking-wider mb-1">
                <PhoneCall className="w-4 h-4 text-[#D9A21B]" />
                <span>Priority Employer Service</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#0A3D91] mb-2">Request A Direct Call Back</h2>
              <p className="text-xs text-slate-600 mb-6 leading-relaxed">
                Fill out your company contact details below. Data is saved directly to our verified employer database, and Principal Consultant <strong>Raajesh V</strong> will call you back at your designated time.
              </p>

              {callbackSuccess ? (
                <div className="p-8 rounded-3xl bg-blue-50 border border-blue-200 text-center text-[#0A3D91] my-4">
                  <CheckCircle2 className="w-12 h-12 text-[#0A3D91] mx-auto mb-3 animate-bounce" />
                  <h3 className="text-lg font-black">Call Back Request Confirmed & Persisted!</h3>
                  <p className="text-xs text-slate-700 mt-1 max-w-md mx-auto leading-relaxed">
                    Thank you! Your inquiry is securely recorded in the Supabase <code>employers</code> table. Raajesh V (+91 98243 22206) will personally call you at <strong>{callbackForm.preferredTime}</strong> regarding your requirements for <strong>{callbackForm.companyName || 'your company'}</strong>.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleCallbackSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Company / Industry Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Surat Elevator Components Pvt Ltd"
                        value={callbackForm.companyName}
                        onChange={(e) => setCallbackForm({ ...callbackForm, companyName: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Contact Person Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Mr. Sharma (HR Head)"
                        value={callbackForm.contactPerson}
                        onChange={(e) => setCallbackForm({ ...callbackForm, contactPerson: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Mobile / Direct Phone Number *</label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. +91 98251 00000"
                        value={callbackForm.phone}
                        onChange={(e) => setCallbackForm({ ...callbackForm, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Preferred Call Time *</label>
                      <select
                        value={callbackForm.preferredTime}
                        onChange={(e) => setCallbackForm({ ...callbackForm, preferredTime: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none bg-white"
                      >
                        <option value="Immediately (Within 30 Mins)">Immediately (Within 30 Mins)</option>
                        <option value="Today Morning (9 AM - 12 PM)">Today Morning (9 AM - 12 PM)</option>
                        <option value="Today Afternoon (2 PM - 5 PM)">Today Afternoon (2 PM - 5 PM)</option>
                        <option value="Today Evening (5 PM - 8 PM)">Today Evening (5 PM - 8 PM)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Official Email Address</label>
                      <input
                        type="email"
                        placeholder="e.g. hr@suratelevators.com"
                        value={callbackForm.email}
                        onChange={(e) => setCallbackForm({ ...callbackForm, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Plant / Office Location</label>
                      <input
                        type="text"
                        placeholder="e.g. Surat, Silvassa, Vapi"
                        value={callbackForm.location}
                        onChange={(e) => setCallbackForm({ ...callbackForm, location: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Hiring Urgency</label>
                    <select
                      value={callbackForm.hiringUrgency}
                      onChange={(e) => setCallbackForm({ ...callbackForm, hiringUrgency: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none bg-white"
                    >
                      <option value="Urgent (Within 48 Hours)">Urgent (Within 48 Hours)</option>
                      <option value="Standard (1-2 Weeks)">Standard (1-2 Weeks)</option>
                      <option value="Executive Headhunting">Executive Headhunting</option>
                      <option value="Bulk Plant Workforce">Bulk Plant Workforce</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Brief Hiring Requirements / Notes</label>
                    <textarea
                      rows={3}
                      placeholder="Mention designations needed (e.g. Assistant Factory Manager, Quality Engineers, Elevator Sales, CNC Operators)..."
                      value={callbackForm.note}
                      onChange={(e) => setCallbackForm({ ...callbackForm, note: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={callbackLoading}
                    className="w-full sm:w-auto bg-[#0A3D91] hover:bg-[#083275] disabled:opacity-50 text-white font-black text-xs sm:text-sm px-8 py-3.5 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {callbackLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Submitting to Supabase...
                      </>
                    ) : (
                      <>
                        <PhoneCall className="w-4 h-4 text-[#D9A21B]" /> Request Immediate Call Back
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Right Info Box */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-[#0A3D91] text-white rounded-3xl p-6 sm:p-8 shadow-xl">
                <h3 className="text-lg font-black text-[#D9A21B] mb-3">Instant Hotline Access</h3>
                <p className="text-xs text-blue-100 leading-relaxed mb-6">
                  Prefer to speak right now? Call or message Principal Consultant Raajesh V directly.
                </p>

                <div className="space-y-4 pt-2 border-t border-blue-800">
                  <a
                    href="tel:+919824322206"
                    className="bg-[#D9A21B] hover:bg-[#c49218] text-[#0A3D91] font-black text-xs sm:text-sm p-4 rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all text-center block"
                  >
                    <PhoneCall className="w-4 h-4" /> Call Raajesh V (+91 98243 22206)
                  </a>

                  <a
                    href="https://wa.me/919824322206?text=Hello%20Raajesh%20V,%20I%20am%20an%20employer%20looking%20to%20hire%20industrial%20staff."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-600 hover:bg-blue-500 text-white font-black text-xs sm:text-sm p-4 rounded-2xl flex items-center justify-center gap-2 transition-all text-center block"
                  >
                    <MessageSquare className="w-4 h-4" /> WhatsApp Urgent Request
                  </a>
                </div>
              </div>

              <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200">
                <h4 className="text-sm font-extrabold text-[#0A3D91] mb-2">Why Sarthi Solutions?</h4>
                <ul className="space-y-2 text-xs text-slate-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#0A3D91] shrink-0 mt-0.5" />
                    <span><strong>12+ Years Experience</strong> in Silvassa & Gujarat industrial hubs.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#0A3D91] shrink-0 mt-0.5" />
                    <span><strong>Pre-Vetted Profiles:</strong> Only top 5% screened candidates dispatched.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#0A3D91] shrink-0 mt-0.5" />
                    <span><strong>Database Sync:</strong> All employer inquiries are stored in Supabase PostgreSQL.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#0A3D91] shrink-0 mt-0.5" />
                    <span><strong>Replacement Guarantee:</strong> 90-day candidate warranty.</span>
                  </li>
                </ul>
              </div>
            </div>

          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: Submit A Job Description                                           */}
        {/* ========================================================================= */}
        {activeTab === 'submit_jd' && (
          <motion.div 
            key="submit_jd"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md max-w-4xl mx-auto"
          >
            <div className="flex items-center gap-2 text-[#0A3D91] font-black text-xs uppercase tracking-wider mb-1">
              <FileText className="w-4 h-4 text-[#D9A21B]" />
              <span>Post Vacancy & Sourcing Mandate</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#0A3D91] mb-2">Submit A Job Description (JD)</h2>
            <p className="text-xs text-slate-600 mb-6 leading-relaxed">
              Upload your JD document or specify vacancy requirements. Our recruitment team will review your mandate and share pre-screened talent profiles within 24 hours.
            </p>

            {jdSuccess ? (
              <div className="p-6 sm:p-8 rounded-3xl bg-blue-50/60 border border-blue-200 text-center my-4 space-y-5">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div className="max-w-lg mx-auto">
                  <h3 className="text-lg sm:text-xl font-black text-[#0A3D91]">
                    Job Description Submitted Successfully!
                  </h3>
                  <p className="text-xs text-slate-700 mt-2 leading-relaxed">
                    Thank you! Your hiring mandate for <strong>{submittedJdResult?.jobTitle || 'New Position'}</strong> ({submittedJdResult?.companyName || 'Your Enterprise'}) has been received by our recruitment team.
                  </p>
                </div>

                {/* Sourcing Timeline & Support Card */}
                <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-xs max-w-xl mx-auto text-left space-y-3">
                  <div className="flex items-center gap-2 text-xs font-black text-[#0A3D91]">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>What Happens Next:</span>
                  </div>
                  <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
                    <li>Our recruitment specialist will review the mandate requirements and salary benchmark.</li>
                    <li>We will shortlist and screen candidates matching your required skill matrix and experience.</li>
                    <li>Pre-screened profiles with interview availability will be dispatched within <strong>24 business hours</strong>.</li>
                  </ul>
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                    <span>Direct Helpline: <strong className="text-slate-800">+91 98243 22206</strong></span>
                    <span>Email: <strong className="text-slate-800">hr@sarthisolutions.com</strong></span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleResetJdForm}
                    className="bg-[#0A3D91] hover:bg-[#083275] text-white text-xs font-bold px-6 py-2.5 rounded-2xl shadow-md cursor-pointer transition-all inline-flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4 text-[#D9A21B]" /> Submit Another Job Description
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleJdSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Company / Enterprise Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Gujarat Precision Engineering Ltd."
                      value={jdForm.companyName}
                      onChange={(e) => setJdForm({ ...jdForm, companyName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Job Designation / Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Assistant Factory Manager / Quality Executive"
                      value={jdForm.jobTitle}
                      onChange={(e) => setJdForm({ ...jdForm, jobTitle: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Industry Sector *</label>
                    <select
                      value={jdForm.industry}
                      onChange={(e) => setJdForm({ ...jdForm, industry: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none bg-white"
                    >
                      <option value="Manufacturing & Engineering">Manufacturing & Engineering</option>
                      <option value="Elevator Components">Elevator Component Manufacturing</option>
                      <option value="Chemical & Polymers">Chemical & Polymers</option>
                      <option value="Textile & Garments">Textile & Garments</option>
                      <option value="IT & Software">IT & Software Solutions</option>
                      <option value="HR & Executive">HR & Executive Management</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Plant / Office Location *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Bhestan Udhna Road, Surat / Silvassa"
                      value={jdForm.location}
                      onChange={(e) => setJdForm({ ...jdForm, location: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Salary Budget Offered *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ₹35,000 - ₹50,000 / month"
                      value={jdForm.salaryOffered}
                      onChange={(e) => setJdForm({ ...jdForm, salaryOffered: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Experience Required *</label>
                    <select
                      value={jdForm.experienceRequired}
                      onChange={(e) => setJdForm({ ...jdForm, experienceRequired: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none bg-white"
                    >
                      <option value="Fresher / 0-1 Year">Fresher / 0-1 Year</option>
                      <option value="1-3 Years">1-3 Years</option>
                      <option value="3-5 Years">3-5 Years</option>
                      <option value="5-8 Years">5-8 Years</option>
                      <option value="8+ Years Executive">8+ Years Executive</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Qualification Needed *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. BE Mechanical / Diploma / MBA / Any Graduate"
                      value={jdForm.qualificationNeeded}
                      onChange={(e) => setJdForm({ ...jdForm, qualificationNeeded: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                    />
                  </div>
                </div>

                {/* Upload JD File Area */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700 block">
                      Attach JD Document (PDF, Word, Text)
                    </label>
                    <span className="text-[10px] text-slate-500 font-medium">
                      PDF, DOCX, DOC, TXT (Max 50MB)
                    </span>
                  </div>

                  <div className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all relative ${
                    jdFile ? 'border-emerald-400 bg-emerald-50/30' : 'border-slate-300 hover:border-[#0A3D91] bg-slate-50/50'
                  }`}>
                    <input
                      ref={jdFileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx,.txt,.rtf,.odt"
                      onChange={(e) => setJdFile(e.target.files?.[0] || null)}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    
                    {jdFile ? (
                      <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-emerald-200 shadow-xs">
                        <div className="flex items-center gap-3 text-left">
                          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-black">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-xs font-black text-slate-800 truncate max-w-[280px] sm:max-w-md">
                              {jdFile.name}
                            </div>
                            <div className="text-[10px] text-slate-500 flex items-center gap-2">
                              <span>{(jdFile.size / 1024).toFixed(1)} KB</span>
                              <span>•</span>
                              <span className="text-emerald-700 font-bold">Document attached</span>
                            </div>
                          </div>
                        </div>
                        
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setJdFile(null);
                            if (jdFileInputRef.current) jdFileInputRef.current.value = '';
                          }}
                          className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors cursor-pointer z-10"
                          title="Remove file"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="py-2">
                        <Upload className="w-8 h-8 text-[#0A3D91] mx-auto mb-2" />
                        <div className="text-xs text-slate-600">
                          <span className="font-extrabold text-[#0A3D91]">Click to browse</span> or drag and drop your JD file here
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">
                          Upload your PDF, DOCX, DOC, or TXT file (optional)
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Text Description */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Paste Job Description Text or Key Responsibilities *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Detail job responsibilities, machine operation requirements, working hours, and candidate criteria..."
                    value={jdForm.description}
                    onChange={(e) => setJdForm({ ...jdForm, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                  />
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Your Name / Designation *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Shah (HR Manager)"
                      value={jdForm.contactName}
                      onChange={(e) => setJdForm({ ...jdForm, contactName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Phone / WhatsApp Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +91 98243 22206"
                      value={jdForm.phone}
                      onChange={(e) => setJdForm({ ...jdForm, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Official Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. hr@gujaratprecision.com"
                      value={jdForm.email}
                      onChange={(e) => setJdForm({ ...jdForm, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={jdLoading}
                  className="w-full bg-[#0A3D91] hover:bg-[#083275] disabled:opacity-50 text-white font-black text-xs sm:text-sm py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {jdLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{jdProgressMsg || 'Submitting Job Description...'}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-[#D9A21B]" />
                      <span>Submit Job Description</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: Explore Vetted Talent                                              */}
        {/* ========================================================================= */}
        {activeTab === 'candidates' && (
          <motion.div 
            key="candidates"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Header and Filter Controls */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2 text-[#0A3D91] font-black text-xs uppercase tracking-wider mb-1">
                    <Users className="w-4 h-4 text-[#D9A21B]" />
                    <span>Live Pre-Screened Database</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-[#0A3D91]">Explore Vetted Industrial Talent</h2>
                  <p className="text-xs text-slate-600 mt-1">
                    Directly request candidate profiles and interviews. Submissions are saved to the Supabase <code>employers</code> table for immediate consultant dispatch.
                  </p>
                </div>

                {/* Search Bar */}
                <div className="relative min-w-[260px] sm:min-w-[320px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by role, skills, location..."
                    value={talentSearch}
                    onChange={(e) => setTalentSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0A3D91] outline-none"
                  />
                </div>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                {['All', 'Engineering & Plant', 'Elevator Mfg', 'QA & Lab', 'CAD & Design', 'Operations'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setTalentCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                      talentCategory === cat
                        ? 'bg-[#0A3D91] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Candidate Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCandidates.map((cand) => (
                <div 
                  key={cand.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <h3 className="text-base font-black text-slate-900">{cand.name}</h3>
                        <div className="text-xs font-extrabold text-[#0A3D91] flex items-center gap-1 mt-0.5">
                          <Briefcase className="w-3.5 h-3.5 text-[#D9A21B]" />
                          <span>{cand.role}</span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-blue-50 text-[#0A3D91] text-[10px] font-black border border-blue-100 whitespace-nowrap">
                        {cand.status}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span><strong>Experience:</strong> {cand.exp}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span><strong>Location:</strong> {cand.loc}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span><strong>Education:</strong> {cand.qualification}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 italic bg-amber-50/70 p-3 rounded-2xl border border-amber-100 mb-4">
                      "{cand.highlight}"
                    </p>

                    <div className="mb-4">
                      <div className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider mb-1.5">Core Competencies</div>
                      <div className="flex flex-wrap gap-1.5">
                        {cand.skills.map((skill, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-semibold">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => openTalentModal(cand)}
                    className="w-full bg-[#0A3D91] hover:bg-[#083275] text-white font-bold text-xs py-3 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    <Send className="w-3.5 h-3.5 text-[#D9A21B]" />
                    <span>Request Candidate Profile</span>
                  </button>
                </div>
              ))}
            </div>

            {filteredCandidates.length === 0 && (
              <div className="p-12 bg-white rounded-3xl border border-slate-200 text-center text-slate-500">
                <Users className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <p className="text-sm font-bold text-slate-700">No vetted candidates match your search.</p>
                <p className="text-xs text-slate-400 mt-1">Try searching for other keywords or submit a custom Job Description.</p>
              </div>
            )}
          </motion.div>
        )}

      </AnimatePresence>

      {/* ========================================================================= */}
      {/* VETTED TALENT REQUEST MODAL (Saves to Supabase employers table)           */}
      {/* ========================================================================= */}
      {talentRequestModalOpen && selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 border border-slate-200 shadow-2xl relative max-h-[90vh] overflow-y-auto"
          >
            <button
              onClick={() => setTalentRequestModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {talentRequestSuccess ? (
              <div className="py-8 text-center text-[#0A3D91]">
                <CheckCircle2 className="w-14 h-14 text-[#0A3D91] mx-auto mb-3 animate-bounce" />
                <h3 className="text-xl font-black">Talent Request Saved to Supabase!</h3>
                <p className="text-xs text-slate-700 mt-2 max-w-md mx-auto leading-relaxed">
                  Thank you! Your sourcing request for <strong>{selectedCandidate.name} ({selectedCandidate.role})</strong> has been saved to the Supabase <code>employers</code> table. Raajesh V will personally reach out with the complete resume and schedule your interview.
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 text-[#0A3D91] font-black text-xs uppercase tracking-wider mb-1">
                  <ShieldCheck className="w-4 h-4 text-[#D9A21B]" />
                  <span>Verified Candidate Sourcing</span>
                </div>
                <h3 className="text-xl font-black text-[#0A3D91] mb-1">Request Profile: {selectedCandidate.name}</h3>
                <p className="text-xs text-slate-600 mb-4">
                  {selectedCandidate.role} • {selectedCandidate.exp} • {selectedCandidate.loc}
                </p>

                <form onSubmit={handleTalentRequestSubmit} className="space-y-3.5 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Your Company / Enterprise Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Surat Engineering Unit"
                        value={talentForm.companyName}
                        onChange={(e) => setTalentForm({ ...talentForm, companyName: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Contact Person Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ketan Mehta (Plant Head)"
                        value={talentForm.contactPerson}
                        onChange={(e) => setTalentForm({ ...talentForm, contactPerson: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Mobile / Direct Phone Number *</label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. +91 98250 12345"
                        value={talentForm.phone}
                        onChange={(e) => setTalentForm({ ...talentForm, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Official Work Email *</label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. ketan@suratprecision.com"
                        value={talentForm.email}
                        onChange={(e) => setTalentForm({ ...talentForm, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Target Joining Timeline</label>
                      <select
                        value={talentForm.joiningUrgency}
                        onChange={(e) => setTalentForm({ ...talentForm, joiningUrgency: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none bg-white"
                      >
                        <option value="Immediate (Within 7 Days)">Immediate (Within 7 Days)</option>
                        <option value="15-30 Days Notice">15-30 Days Notice</option>
                        <option value="Next Month">Next Month</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Target Salary Budget</label>
                      <input
                        type="text"
                        placeholder="e.g. ₹40,000 - ₹55,000 / mo"
                        value={talentForm.targetSalary}
                        onChange={(e) => setTalentForm({ ...talentForm, targetSalary: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Job Location / Plant Address</label>
                    <input
                      type="text"
                      placeholder="e.g. Silvassa Industrial Estate / Bhestan, Surat"
                      value={talentForm.location}
                      onChange={(e) => setTalentForm({ ...talentForm, location: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Specific Candidate Requirements / Notes</label>
                    <textarea
                      rows={3}
                      placeholder="Mention any machine experience, software skills, shift timings, or interview availability..."
                      value={talentForm.hiringNotes}
                      onChange={(e) => setTalentForm({ ...talentForm, hiringNotes: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setTalentRequestModalOpen(false)}
                      className="px-5 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={talentRequestLoading}
                      className="bg-[#0A3D91] hover:bg-[#083275] disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl shadow-md flex items-center gap-2 cursor-pointer"
                    >
                      {talentRequestLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Saving to Supabase...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 text-[#D9A21B]" /> Submit Talent Request
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </motion.div>
        </div>
      )}

    </div>
  );
};
