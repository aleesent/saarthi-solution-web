import React, { useState, useRef } from 'react';
import { useData } from '../../context/DataContext';
import { Job, JobApplication, CandidateProfile } from '../../types';
import { ResumePreviewModal, ResumeCandidateData } from '../ResumePreviewModal';
import { 
  Briefcase, 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  MapPin, 
  IndianRupee, 
  Calendar, 
  Phone, 
  Mail, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  X,
  FileText,
  Star,
  Zap,
  Download,
  ExternalLink,
  UserCheck,
  Filter,
  Upload,
  Eye,
  RefreshCw,
  FileSpreadsheet,
  Grid,
  List,
  Building2,
  GraduationCap,
  Award,
  AlertCircle,
  Check
} from 'lucide-react';

export const AdminJobSeekersTab: React.FC = () => {
  const { 
    jobs, 
    addJob, 
    updateJob, 
    deleteJob,
    applications,
    addApplication,
    updateApplication,
    deleteApplication,
    candidates,
    addCandidate,
    updateCandidate,
    deleteCandidate,
    uploadCandidateResume
  } = useData();

  const [subTab, setSubTab] = useState<'jobs' | 'applications' | 'candidates'>('candidates');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  
  // Search & Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [expFilter, setExpFilter] = useState('ALL');
  const [locationFilter, setLocationFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [qualificationFilter, setQualificationFilter] = useState('ALL');

  // Job Form Modal State
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [jobFormData, setJobFormData] = useState<Partial<Job>>({
    title: '',
    companyName: 'Client of Sarthi Solutions',
    industry: 'Manufacturing & Industrial Operations',
    location: 'Silvassa (Dadra & Nagar Haveli)',
    salary: '₹35,000 - ₹50,000 / month',
    experience: '5–8 Years',
    qualification: 'Bachelor Degree',
    ageRange: '25–45 Years',
    employmentType: 'Full-time',
    genderPreference: 'Any',
    vacancies: 1,
    department: 'Plant Operations',
    workingHours: '9:00 AM – 6:30 PM',
    isUrgent: false,
    isFeatured: false,
    category: 'Manufacturing',
    contactPerson: 'Raajesh V',
    contactPhone: '+919824322206',
    whatsappNumber: '+919824322206',
    description: '',
    keyResponsibilitiesText: '',
    keyRequirementsText: ''
  });

  // Candidate Application Modal State
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [editingAppId, setEditingAppId] = useState<string | null>(null);
  const [appFormData, setAppFormData] = useState<Partial<JobApplication>>({
    jobId: '',
    jobTitle: 'Assistant Factory Manager',
    candidateName: '',
    phone: '',
    email: '',
    qualification: 'B.Tech / Degree',
    experience: '5 Years',
    currentLocation: 'Silvassa / Surat',
    currentCTC: '₹4.5 LPA',
    expectedCTC: '₹6.0 LPA',
    noticePeriod: 'Immediate',
    status: 'Pending Review',
    interviewDate: '',
    notes: ''
  });

  // Candidate Profile (Manual Add & Edit) Modal State
  const [isCandidateModalOpen, setIsCandidateModalOpen] = useState(false);
  const [editingCandidateId, setEditingCandidateId] = useState<string | null>(null);
  const [candidateFormData, setCandidateFormData] = useState<Partial<CandidateProfile>>({
    fullName: '',
    email: '',
    phone: '',
    currentDesignation: '',
    targetRole: '',
    industry: 'Manufacturing',
    qualification: 'BE / B.Tech Mechanical',
    highestQualification: 'BE / B.Tech Mechanical',
    experience: '5 Years',
    experienceYears: 5,
    primarySkill: '',
    skillsText: '',
    currentLocation: 'Silvassa (D&NH)',
    currentCompany: '',
    currentSalary: '₹4.5 LPA',
    expectedSalary: '₹6.0 LPA',
    noticePeriod: 'Immediate Joiner',
    status: 'Available',
    category: 'Manufacturing',
    notes: '',
    resumeUrl: '',
    resumeFileName: ''
  });

  // Resume File Upload State inside Modal
  const [selectedResumeFile, setSelectedResumeFile] = useState<File | null>(null);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Quick Resume Upload for existing candidate from table/card
  const quickFileInputRef = useRef<HTMLInputElement | null>(null);
  const [quickUploadCandId, setQuickUploadCandId] = useState<string | null>(null);

  // Resume Web Preview & Download Modal State
  const [previewCandidate, setPreviewCandidate] = useState<ResumeCandidateData | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  const handleOpenResumePreview = (cand: {
    id?: string;
    name?: string;
    fullName?: string;
    candidateName?: string;
    email?: string;
    phone?: string;
    targetRole?: string;
    currentDesignation?: string;
    jobTitle?: string;
    experience?: string;
    skills?: string[];
    skillsText?: string;
    primarySkill?: string;
    qualification?: string;
    highestQualification?: string;
    location?: string;
    currentLocation?: string;
    currentCompany?: string;
    currentSalary?: string;
    currentCTC?: string;
    expectedSalary?: string;
    expectedCTC?: string;
    noticePeriod?: string;
    notes?: string;
    resumeUrl?: string;
    resumeFileName?: string;
    status?: string;
  }) => {
    let skillsArr = cand.skills || [];
    if ((!skillsArr || skillsArr.length === 0) && cand.skillsText) {
      skillsArr = cand.skillsText.split(',').map(s => s.trim()).filter(Boolean);
    }
    if ((!skillsArr || skillsArr.length === 0) && cand.primarySkill) {
      skillsArr = [cand.primarySkill];
    }

    setPreviewCandidate({
      id: cand.id,
      name: cand.fullName || cand.candidateName || cand.name || 'Candidate',
      email: cand.email,
      phone: cand.phone,
      targetRole: cand.targetRole || cand.currentDesignation || cand.jobTitle || 'Industrial Professional',
      experience: cand.experience || 'Experienced',
      skills: skillsArr,
      qualification: cand.highestQualification || cand.qualification || 'Degree / Diploma',
      location: cand.currentLocation || cand.location || 'Gujarat / Silvassa',
      currentCompany: cand.currentCompany,
      currentCTC: cand.currentSalary || cand.currentCTC,
      expectedCTC: cand.expectedSalary || cand.expectedCTC,
      noticePeriod: cand.noticePeriod,
      notes: cand.notes,
      resumeUrl: cand.resumeUrl,
      resumeFileName: cand.resumeFileName,
      status: cand.status
    });
    setIsPreviewModalOpen(true);
  };

  // --- JOB HANDLERS ---
  const handleOpenAddJob = () => {
    setEditingJobId(null);
    setJobFormData({
      title: '',
      companyName: 'Client of Sarthi Solutions',
      industry: 'Manufacturing & Industrial Operations',
      location: 'Silvassa (Dadra & Nagar Haveli)',
      salary: '₹35,000 - ₹50,000 / month',
      experience: '5–8 Years',
      qualification: 'Bachelor Degree',
      ageRange: '25–45 Years',
      employmentType: 'Full-time',
      genderPreference: 'Any',
      vacancies: 1,
      department: 'Plant Operations',
      workingHours: '9:00 AM – 6:30 PM',
      isUrgent: false,
      isFeatured: false,
      category: 'Manufacturing',
      contactPerson: 'Raajesh V',
      contactPhone: '+919824322206',
      whatsappNumber: '+919824322206',
      description: '',
      keyResponsibilitiesText: 'Oversee daily plant operations.\nEnsure statutory compliance and reporting.',
      keyRequirementsText: 'Relevant industrial experience.\nProficient in MS Excel and English/Hindi.'
    });
    setIsJobModalOpen(true);
  };

  const handleOpenEditJob = (job: Job) => {
    setEditingJobId(job.id);
    setJobFormData({
      ...job,
      keyResponsibilitiesText: job.keyResponsibilities ? job.keyResponsibilities.join('\n') : '',
      keyRequirementsText: job.keyRequirements ? job.keyRequirements.join('\n') : ''
    });
    setIsJobModalOpen(true);
  };

  const handleDeleteJob = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete vacancy "${title}"?`)) {
      deleteJob(id);
    }
  };

  const handleSaveJob = (e: React.FormEvent) => {
    e.preventDefault();
    const responsibilities = (jobFormData as any).keyResponsibilitiesText
      ? (jobFormData as any).keyResponsibilitiesText.split('\n').filter((l: string) => l.trim().length > 0)
      : ['Perform assigned duties diligently.'];
    const requirements = (jobFormData as any).keyRequirementsText
      ? (jobFormData as any).keyRequirementsText.split('\n').filter((l: string) => l.trim().length > 0)
      : ['Relevant experience required.'];

    const payload: Partial<Job> = {
      title: jobFormData.title || 'Job Opening',
      companyName: jobFormData.companyName || 'Client of Sarthi Solutions',
      industry: jobFormData.industry || 'Manufacturing',
      location: jobFormData.location || 'Silvassa / Surat',
      salary: jobFormData.salary || 'Negotiable',
      experience: jobFormData.experience || '2–5 Years',
      qualification: jobFormData.qualification || 'Degree / Diploma',
      ageRange: jobFormData.ageRange || '22–45 Years',
      employmentType: jobFormData.employmentType || 'Full-time',
      genderPreference: jobFormData.genderPreference || 'Any',
      vacancies: Number(jobFormData.vacancies) || 1,
      department: jobFormData.department || 'Operations',
      workingHours: jobFormData.workingHours || '8:30 AM – 7:30 PM',
      isUrgent: !!jobFormData.isUrgent,
      isFeatured: !!jobFormData.isFeatured,
      category: jobFormData.category || 'Manufacturing',
      contactPerson: jobFormData.contactPerson || 'Raajesh V',
      contactPhone: jobFormData.contactPhone || '+919824322206',
      whatsappNumber: jobFormData.whatsappNumber || '+919824322206',
      description: jobFormData.description || 'Hiring for industrial client.',
      keyResponsibilities: responsibilities,
      keyRequirements: requirements
    };

    if (editingJobId) {
      updateJob(editingJobId, payload);
    } else {
      addJob(payload as any);
    }
    setIsJobModalOpen(false);
  };

  // --- APPLICATION HANDLERS ---
  const handleOpenAddApp = () => {
    setEditingAppId(null);
    setAppFormData({
      jobId: jobs[0]?.id || 'job-custom',
      jobTitle: jobs[0]?.title || 'Assistant Factory Manager',
      candidateName: '',
      phone: '',
      email: '',
      qualification: 'Degree / Diploma',
      experience: '3–5 Years',
      currentLocation: 'Surat / Silvassa',
      currentCTC: '₹3.5 LPA',
      expectedCTC: '₹4.8 LPA',
      noticePeriod: '15 Days',
      status: 'Pending Review',
      interviewDate: '',
      notes: ''
    });
    setIsAppModalOpen(true);
  };

  const handleOpenEditApp = (app: JobApplication) => {
    setEditingAppId(app.id);
    setAppFormData(app);
    setIsAppModalOpen(true);
  };

  const handleDeleteApp = (id: string, name: string) => {
    if (window.confirm(`Delete application for "${name}"?`)) {
      deleteApplication(id);
    }
  };

  const handleSaveApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAppId) {
      updateApplication(editingAppId, appFormData);
    } else {
      addApplication({
        jobId: appFormData.jobId || 'job-1',
        jobTitle: appFormData.jobTitle || 'Candidate Profile',
        candidateName: appFormData.candidateName || 'New Candidate',
        phone: appFormData.phone || '+91 98765 43210',
        email: appFormData.email || 'candidate@gmail.com',
        qualification: appFormData.qualification || 'Graduate',
        experience: appFormData.experience || '2 Years',
        currentLocation: appFormData.currentLocation || 'Gujarat',
        currentCTC: appFormData.currentCTC || '',
        expectedCTC: appFormData.expectedCTC || '',
        noticePeriod: appFormData.noticePeriod || 'Immediate',
        status: appFormData.status || 'Pending Review',
        interviewDate: appFormData.interviewDate || '',
        notes: appFormData.notes || ''
      });
    }
    setIsAppModalOpen(false);
  };

  // --- CANDIDATE PROFILE (MANUAL ADD & EDIT) HANDLERS ---
  const handleOpenAddCandidate = () => {
    setEditingCandidateId(null);
    setSelectedResumeFile(null);
    setUploadSuccessMessage(null);
    setCandidateFormData({
      fullName: '',
      email: '',
      phone: '',
      currentDesignation: '',
      targetRole: '',
      industry: 'Manufacturing',
      qualification: 'BE Mechanical / Diploma',
      highestQualification: 'BE Mechanical / Diploma',
      experience: '4–6 Years',
      experienceYears: 5,
      primarySkill: '',
      skillsText: '',
      currentLocation: 'Silvassa (Dadra & Nagar Haveli)',
      currentCompany: '',
      currentSalary: '₹4.5 LPA',
      expectedSalary: '₹6.0 LPA',
      noticePeriod: 'Immediate Joiner',
      status: 'Available',
      category: 'Manufacturing',
      notes: '',
      resumeUrl: '',
      resumeFileName: ''
    });
    setIsCandidateModalOpen(true);
  };

  const handleOpenEditCandidate = (cand: CandidateProfile) => {
    setEditingCandidateId(cand.id);
    setSelectedResumeFile(null);
    setUploadSuccessMessage(null);

    const skillsArray = cand.skills || cand.additionalSkills || cand.keySkills || [];
    const skillsText = skillsArray.join(', ');

    setCandidateFormData({
      ...cand,
      skillsText: skillsText,
      currentLocation: cand.currentLocation || cand.location || '',
      currentSalary: cand.currentSalary || cand.currentCTC || '',
      expectedSalary: cand.expectedSalary || cand.expectedCTC || '',
      qualification: cand.qualification || cand.highestQualification || '',
      highestQualification: cand.highestQualification || cand.qualification || '',
      experience: cand.experience || (cand.experienceYears ? `${cand.experienceYears} Years` : ''),
      targetRole: cand.targetRole || cand.currentDesignation || cand.primarySkill || ''
    });
    setIsCandidateModalOpen(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedResumeFile(file);
      setCandidateFormData((prev) => ({
        ...prev,
        resumeFileName: file.name
      }));
    }
  };

  const handleQuickResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && quickUploadCandId) {
      const file = e.target.files[0];
      try {
        setIsUploadingResume(true);
        await uploadCandidateResume(quickUploadCandId, file);
        alert(`Resume "${file.name}" uploaded successfully and linked to candidate profile in database!`);
      } catch (err) {
        console.error('Quick resume upload failed:', err);
        alert('Failed to upload resume. Please try again.');
      } finally {
        setIsUploadingResume(false);
        setQuickUploadCandId(null);
        if (quickFileInputRef.current) {
          quickFileInputRef.current.value = '';
        }
      }
    }
  };

  const handleSaveCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateFormData.fullName || !candidateFormData.phone) {
      alert('Please provide at least candidate full name and mobile number.');
      return;
    }

    setIsUploadingResume(true);

    try {
      // Parse skills from text or list
      const parsedSkills = (candidateFormData as any).skillsText
        ? (candidateFormData as any).skillsText
            .split(',')
            .map((s: string) => s.trim())
            .filter((s: string) => s.length > 0)
        : candidateFormData.skills || candidateFormData.additionalSkills || [];

      // Extract numeric experience years safely
      let expYears: number = 0;
      if (typeof candidateFormData.experienceYears === 'number') {
        expYears = candidateFormData.experienceYears;
      } else if (candidateFormData.experience) {
        const match = candidateFormData.experience.match(/([0-9]+(\.[0-9]+)?)/);
        if (match) expYears = parseFloat(match[1]);
      }

      const candidatePayload: Omit<CandidateProfile, 'id'> & { id?: string } = {
        fullName: candidateFormData.fullName || 'Candidate',
        email: candidateFormData.email || '',
        phone: candidateFormData.phone || '',
        qualification: candidateFormData.qualification || candidateFormData.highestQualification || 'Graduate',
        highestQualification: candidateFormData.highestQualification || candidateFormData.qualification || 'Graduate',
        experience: candidateFormData.experience || `${expYears} Years`,
        experienceYears: expYears,
        industry: candidateFormData.industry || 'Manufacturing',
        primarySkill: candidateFormData.primarySkill || (parsedSkills[0] || 'Technical Operations'),
        skills: parsedSkills,
        additionalSkills: parsedSkills,
        keySkills: parsedSkills,
        currentLocation: candidateFormData.currentLocation || 'Silvassa / Surat',
        location: candidateFormData.currentLocation || 'Silvassa / Surat',
        currentCompany: candidateFormData.currentCompany || '',
        currentDesignation: candidateFormData.currentDesignation || candidateFormData.targetRole || '',
        targetRole: candidateFormData.targetRole || candidateFormData.currentDesignation || '',
        currentSalary: candidateFormData.currentSalary || '',
        currentCTC: candidateFormData.currentSalary || '',
        expectedSalary: candidateFormData.expectedSalary || '',
        expectedCTC: candidateFormData.expectedSalary || '',
        noticePeriod: candidateFormData.noticePeriod || 'Immediate',
        status: candidateFormData.status || 'Available',
        category: candidateFormData.category || 'Manufacturing',
        notes: candidateFormData.notes || '',
        resumeUrl: candidateFormData.resumeUrl || '',
        resumeFileName: candidateFormData.resumeFileName || '',
        resumeUploadDate: candidateFormData.resumeUploadDate || new Date().toISOString().split('T')[0]
      };

      let candidateId = editingCandidateId;

      if (editingCandidateId) {
        await updateCandidate(editingCandidateId, candidatePayload);
      } else {
        candidateId = await addCandidate(candidatePayload);
      }

      // If a new resume file was selected, upload it to Firebase Storage and link to this candidate
      if (selectedResumeFile && candidateId) {
        const uploadResult = await uploadCandidateResume(candidateId, selectedResumeFile, {
          fullName: candidatePayload.fullName,
          email: candidatePayload.email,
          phone: candidatePayload.phone
        });
        console.log('Resume successfully stored in Firebase Storage:', uploadResult);
      }

      setIsCandidateModalOpen(false);
    } catch (err) {
      console.error('Error saving candidate:', err);
      alert('Error saving candidate record. Please check details and try again.');
    } finally {
      setIsUploadingResume(false);
    }
  };

  // --- EXPORT TO CSV FUNCTIONALITY ---
  const handleExportCSV = () => {
    if (filteredCandidates.length === 0) {
      alert('No candidates available to export.');
      return;
    }

    const headers = [
      'Candidate Name',
      'Phone',
      'Email',
      'Target Role / Designation',
      'Experience',
      'Highest Qualification',
      'Current Location',
      'Primary Skills',
      'Current CTC',
      'Expected CTC',
      'Notice Period',
      'Current Employer',
      'Status',
      'Resume URL / File',
      'Recruiter Notes'
    ];

    const rows = filteredCandidates.map((c) => [
      `"${(c.fullName || '').replace(/"/g, '""')}"`,
      `"${(c.phone || '').replace(/"/g, '""')}"`,
      `"${(c.email || '').replace(/"/g, '""')}"`,
      `"${(c.targetRole || c.currentDesignation || c.primarySkill || '').replace(/"/g, '""')}"`,
      `"${(c.experience || `${c.experienceYears || ''} Years`).replace(/"/g, '""')}"`,
      `"${(c.qualification || c.highestQualification || '').replace(/"/g, '""')}"`,
      `"${(c.currentLocation || c.location || '').replace(/"/g, '""')}"`,
      `"${(c.skills || c.additionalSkills || c.keySkills || [c.primarySkill || '']).join('; ').replace(/"/g, '""')}"`,
      `"${(c.currentSalary || c.currentCTC || '').replace(/"/g, '""')}"`,
      `"${(c.expectedSalary || c.expectedCTC || '').replace(/"/g, '""')}"`,
      `"${(c.noticePeriod || '').replace(/"/g, '""')}"`,
      `"${(c.currentCompany || '').replace(/"/g, '""')}"`,
      `"${(c.status || 'Available').replace(/"/g, '""')}"`,
      `"${(c.resumeUrl || c.resumeFileName || '').replace(/"/g, '""')}"`,
      `"${(c.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Sarthi_Solutions_Candidates_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- FILTERED DATA PIPELINES ---
  const filteredJobs = jobs.filter(
    (j) =>
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.companyName.toLowerCase().includes(search.toLowerCase()) ||
      j.location.toLowerCase().includes(search.toLowerCase()) ||
      j.category.toLowerCase().includes(search.toLowerCase())
  );

  const filteredApps = applications.filter(
    (a) =>
      a.candidateName.toLowerCase().includes(search.toLowerCase()) ||
      a.jobTitle.toLowerCase().includes(search.toLowerCase()) ||
      a.phone.includes(search) ||
      (a.currentLocation && a.currentLocation.toLowerCase().includes(search.toLowerCase())) ||
      (a.notes && a.notes.toLowerCase().includes(search.toLowerCase()))
  );

  // Advanced Candidate Search & Multi-field Filtering
  const filteredCandidates = candidates.filter((c) => {
    // 1. Keyword search (searches across name, role, skills, location, phone, email, notes, company, qualification)
    const q = search.trim().toLowerCase();
    const skillsArray = c.skills || c.additionalSkills || c.keySkills || [];
    const skillsMatch = skillsArray.some((s) => s.toLowerCase().includes(q)) || (c.primarySkill && c.primarySkill.toLowerCase().includes(q));
    const locationStr = (c.currentLocation || c.location || '').toLowerCase();
    const roleStr = (c.targetRole || c.currentDesignation || c.primarySkill || '').toLowerCase();
    const qualStr = (c.qualification || c.highestQualification || '').toLowerCase();
    const companyStr = (c.currentCompany || '').toLowerCase();
    const notesStr = (c.notes || '').toLowerCase();
    const resumeStr = (c.resumeFileName || '').toLowerCase();

    const matchesQuery =
      !q ||
      c.fullName.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.email.toLowerCase().includes(q) ||
      roleStr.includes(q) ||
      skillsMatch ||
      locationStr.includes(q) ||
      qualStr.includes(q) ||
      companyStr.includes(q) ||
      notesStr.includes(q) ||
      resumeStr.includes(q);

    if (!matchesQuery) return false;

    // 2. Role Filter
    if (roleFilter !== 'ALL') {
      const combinedRole = `${roleStr} ${c.category || ''} ${c.industry || ''}`.toLowerCase();
      if (!combinedRole.includes(roleFilter.toLowerCase())) {
        return false;
      }
    }

    // 3. Experience Filter
    if (expFilter !== 'ALL') {
      const expNum = typeof c.experienceYears === 'number' 
        ? c.experienceYears 
        : parseFloat(c.experience?.match(/([0-9]+(\.[0-9]+)?)/)?.[1] || '0');

      if (expFilter === 'fresher' && expNum > 1) return false;
      if (expFilter === '1-3' && (expNum < 1 || expNum > 3)) return false;
      if (expFilter === '3-5' && (expNum < 3 || expNum > 5)) return false;
      if (expFilter === '5-8' && (expNum < 5 || expNum > 8)) return false;
      if (expFilter === '8plus' && expNum < 8) return false;
    }

    // 4. Location Filter
    if (locationFilter !== 'ALL') {
      if (!locationStr.includes(locationFilter.toLowerCase())) {
        return false;
      }
    }

    // 5. Status Filter
    if (statusFilter !== 'ALL') {
      if (c.status !== statusFilter) {
        return false;
      }
    }

    // 6. Qualification Filter
    if (qualificationFilter !== 'ALL') {
      if (!qualStr.includes(qualificationFilter.toLowerCase())) {
        return false;
      }
    }

    return true;
  });

  const resetCandidateFilters = () => {
    setSearch('');
    setRoleFilter('ALL');
    setExpFilter('ALL');
    setLocationFilter('ALL');
    setStatusFilter('ALL');
    setQualificationFilter('ALL');
  };

  const hasActiveFilters = 
    search !== '' || 
    roleFilter !== 'ALL' || 
    expFilter !== 'ALL' || 
    locationFilter !== 'ALL' || 
    statusFilter !== 'ALL' || 
    qualificationFilter !== 'ALL';

  return (
    <div className="space-y-6">
      {/* Hidden File Input for Quick Resume Upload */}
      <input
        type="file"
        ref={quickFileInputRef}
        onChange={handleQuickResumeUpload}
        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="hidden"
      />

      {/* Sub Navigation Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="admin-subtab-candidates-btn"
            onClick={() => setSubTab('candidates')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              subTab === 'candidates'
                ? 'bg-[#0A3D91] text-white shadow-sm ring-2 ring-[#0A3D91]/20'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            Registered Candidates & Resumes ({candidates.length})
          </button>
          <button
            id="admin-subtab-jobs-btn"
            onClick={() => setSubTab('jobs')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              subTab === 'jobs'
                ? 'bg-[#0A3D91] text-white shadow-sm ring-2 ring-[#0A3D91]/20'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            Live Vacancies ({jobs.length})
          </button>
          <button
            id="admin-subtab-apps-btn"
            onClick={() => setSubTab('applications')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              subTab === 'applications'
                ? 'bg-[#0A3D91] text-white shadow-sm ring-2 ring-[#0A3D91]/20'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            Candidate Applications ({applications.length})
          </button>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {subTab === 'candidates' && (
            <button
              id="admin-add-candidate-btn"
              onClick={handleOpenAddCandidate}
              className="bg-[#0A3D91] hover:bg-[#083275] text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm transition-all whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Candidate & Resume
            </button>
          )}

          {subTab === 'jobs' && (
            <button
              id="admin-add-vacancy-btn"
              onClick={handleOpenAddJob}
              className="bg-[#0A3D91] hover:bg-[#083275] text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm transition-all whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Vacancy
            </button>
          )}

          {subTab === 'applications' && (
            <button
              id="admin-add-app-btn"
              onClick={handleOpenAddApp}
              className="bg-[#0A3D91] hover:bg-[#083275] text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm transition-all whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Application
            </button>
          )}
        </div>
      </div>

      {/* SUBTAB 3: REGISTERED CANDIDATES & RESUMES FROM FIRESTORE & STORAGE */}
      {subTab === 'candidates' && (
        <div className="space-y-4">
          {/* SEARCH & MULTI-CRITERIA FILTERS BAR */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
              {/* Keyword Search Input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="admin-candidate-search-input"
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by candidate name, role, skills (e.g. Factory Manager, Elevator, QC, AutoCAD), location, phone, email, notes..."
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* View Mode & Actions */}
              <div className="flex items-center gap-2 self-end lg:self-auto">
                <button
                  onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  title="Toggle Table or Card View"
                >
                  {viewMode === 'table' ? (
                    <>
                      <Grid className="w-3.5 h-3.5 text-[#0A3D91]" /> Card View
                    </>
                  ) : (
                    <>
                      <List className="w-3.5 h-3.5 text-[#0A3D91]" /> Table View
                    </>
                  )}
                </button>

                <button
                  id="admin-export-candidates-csv-btn"
                  onClick={handleExportCSV}
                  className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                  title="Export filtered candidates to CSV Excel spreadsheet"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" /> Export CSV ({filteredCandidates.length})
                </button>

                {hasActiveFilters && (
                  <button
                    onClick={resetCandidateFilters}
                    className="px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Reset Filters
                  </button>
                )}
              </div>
            </div>

            {/* Quick Filter Selects Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-2 border-t border-slate-100 text-xs">
              {/* Role / Category Filter */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Target Role / Domain
                </label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-slate-50 font-medium text-slate-700 focus:bg-white focus:ring-2 focus:ring-[#0A3D91] outline-none"
                >
                  <option value="ALL">All Roles / Domains</option>
                  <option value="Factory">Factory / Plant Management</option>
                  <option value="Sales">Sales / BD / Marketing</option>
                  <option value="Quality">Quality Control / QA</option>
                  <option value="Elevator">Elevator & Mechanical</option>
                  <option value="Engineering">Engineering / Design</option>
                  <option value="Account">Accounts & Finance</option>
                  <option value="HR">HR & Administration</option>
                  <option value="Manufacturing">Manufacturing / Industrial</option>
                </select>
              </div>

              {/* Experience Filter */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Experience Level
                </label>
                <select
                  value={expFilter}
                  onChange={(e) => setExpFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-slate-50 font-medium text-slate-700 focus:bg-white focus:ring-2 focus:ring-[#0A3D91] outline-none"
                >
                  <option value="ALL">All Experience Levels</option>
                  <option value="fresher">Freshers (&le; 1 Year)</option>
                  <option value="1-3">1 to 3 Years</option>
                  <option value="3-5">3 to 5 Years</option>
                  <option value="5-8">5 to 8 Years</option>
                  <option value="8plus">8+ Years (Senior)</option>
                </select>
              </div>

              {/* Location Filter */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Candidate Location
                </label>
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-slate-50 font-medium text-slate-700 focus:bg-white focus:ring-2 focus:ring-[#0A3D91] outline-none"
                >
                  <option value="ALL">All Locations</option>
                  <option value="Silvassa">Silvassa (D&NH)</option>
                  <option value="Surat">Surat</option>
                  <option value="Vapi">Vapi</option>
                  <option value="Valsad">Valsad</option>
                  <option value="Baroda">Vadodara / Baroda</option>
                  <option value="Gujarat">Gujarat (General)</option>
                </select>
              </div>

              {/* Qualification Filter */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Education / Degree
                </label>
                <select
                  value={qualificationFilter}
                  onChange={(e) => setQualificationFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-slate-50 font-medium text-slate-700 focus:bg-white focus:ring-2 focus:ring-[#0A3D91] outline-none"
                >
                  <option value="ALL">All Qualifications</option>
                  <option value="Mechanical">Mechanical / BE / B.Tech</option>
                  <option value="MBA">MBA / Management</option>
                  <option value="Diploma">Diploma / ITI</option>
                  <option value="QC">QA / QC Certified</option>
                  <option value="Degree">Graduate / Bachelor</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Candidate Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-slate-50 font-medium text-slate-700 focus:bg-white focus:ring-2 focus:ring-[#0A3D91] outline-none"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Available">Available</option>
                  <option value="In Screening">In Screening</option>
                  <option value="Interview Scheduled">Interview Scheduled</option>
                  <option value="Shortlisted">Shortlisted</option>
                  <option value="Placed">Placed</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Results Count & Active Filter Tags */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[11px] text-slate-500">
              <div>
                Showing <strong className="text-slate-900">{filteredCandidates.length}</strong> of{' '}
                <strong className="text-slate-900">{candidates.length}</strong> registered candidates
                {hasActiveFilters && <span className="text-[#0A3D91] font-bold ml-1.5">(Filtered)</span>}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Real-time Cloud Firestore & Storage Synced</span>
              </div>
            </div>
          </div>

          {/* TABLE VIEW */}
          {viewMode === 'table' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 uppercase text-[10px] text-slate-500 font-extrabold border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">Candidate Profile & Contact</th>
                    <th className="py-3.5 px-4">Role & Experience</th>
                    <th className="py-3.5 px-4">Education & Salary (CTC)</th>
                    <th className="py-3.5 px-4">Key Skills</th>
                    <th className="py-3.5 px-4">Resume / CV</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCandidates.map((cand) => {
                    const skillsList = cand.skills || cand.additionalSkills || cand.keySkills || [];
                    const displayRole = cand.targetRole || cand.currentDesignation || cand.primarySkill || 'Candidate Profile';
                    const displayLocation = cand.currentLocation || cand.location || 'Silvassa / Surat';
                    const displayExp = cand.experience || (cand.experienceYears ? `${cand.experienceYears} Years` : 'Experienced');
                    const displayQual = cand.qualification || cand.highestQualification || 'Degree / Diploma';
                    const displaySalary = cand.currentSalary || cand.currentCTC || 'Confidential';
                    const displayExpSalary = cand.expectedSalary || cand.expectedCTC || 'Negotiable';

                    return (
                      <tr key={cand.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-extrabold text-slate-900 text-[13px]">{cand.fullName}</div>
                          <div className="text-[11px] text-slate-600 flex items-center gap-1 mt-0.5 font-medium">
                            <Phone className="w-3 h-3 text-slate-400" /> {cand.phone}
                          </div>
                          {cand.email && (
                            <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <Mail className="w-3 h-3 text-slate-400" /> {cand.email}
                            </div>
                          )}
                          <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400" /> {displayLocation}
                          </div>
                          {cand.currentCompany && (
                            <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <Building2 className="w-3 h-3 text-slate-400" /> Current: {cand.currentCompany}
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-bold text-[#0A3D91] text-xs">{displayRole}</div>
                          <div className="inline-block mt-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 font-bold text-[10px] border border-amber-200">
                            ⏱️ {displayExp}
                          </div>
                          {cand.noticePeriod && (
                            <div className="text-[10px] text-slate-500 mt-1">
                              Notice: <span className="font-semibold text-slate-700">{cand.noticePeriod}</span>
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-800">{displayQual}</div>
                          <div className="text-[11px] text-slate-600 mt-1">
                            <span className="text-slate-400">Current:</span> {displaySalary}
                          </div>
                          <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                            <span className="text-slate-400">Expected:</span> {displayExpSalary}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {cand.primarySkill && (
                              <span className="px-2 py-0.5 rounded-md bg-[#0A3D91]/10 text-[#0A3D91] font-extrabold text-[10px] border border-[#0A3D91]/20">
                                ⭐ {cand.primarySkill}
                              </span>
                            )}
                            {skillsList.filter((s) => s !== cand.primarySkill).slice(0, 3).map((skill, sIdx) => (
                              <span
                                key={sIdx}
                                className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[10px] border border-slate-200"
                              >
                                {skill}
                              </span>
                            ))}
                            {skillsList.length > 3 && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] text-slate-400 font-bold">
                                +{skillsList.length - 3} more
                              </span>
                            )}
                          </div>
                          {cand.notes && (
                            <div className="text-[10px] text-slate-400 italic mt-1.5 line-clamp-1 max-w-[200px]" title={cand.notes}>
                              📝 {cand.notes}
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            <button
                              type="button"
                              onClick={() => handleOpenResumePreview(cand)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] border border-emerald-200 transition-all shadow-xs cursor-pointer"
                              title="Preview in Web & Download Resume"
                            >
                              <FileText className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{cand.resumeUrl ? 'Preview & Download' : 'Preview CV'}</span>
                            </button>
                            {cand.resumeFileName && (
                              <div className="text-[9px] text-slate-500 font-mono truncate max-w-[130px]" title={cand.resumeFileName}>
                                📄 {cand.resumeFileName}
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setQuickUploadCandId(cand.id);
                                quickFileInputRef.current?.click();
                              }}
                              className="text-[10px] text-blue-600 hover:text-blue-800 underline block cursor-pointer"
                            >
                              {cand.resumeUrl ? 'Replace Resume' : 'Attach File'}
                            </button>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <select
                            value={cand.status || 'Available'}
                            onChange={(e) =>
                              updateCandidate(cand.id, {
                                status: e.target.value as any
                              })
                            }
                            className={`text-[11px] font-bold px-2.5 py-1.5 rounded-lg border outline-none cursor-pointer ${
                              cand.status === 'Interview Scheduled'
                                ? 'bg-amber-50 text-amber-800 border-amber-300'
                                : cand.status === 'Shortlisted'
                                  ? 'bg-blue-50 text-blue-800 border-blue-300'
                                  : cand.status === 'Placed'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                    : cand.status === 'In Screening'
                                      ? 'bg-purple-50 text-purple-800 border-purple-300'
                                      : cand.status === 'Inactive'
                                        ? 'bg-slate-100 text-slate-500 border-slate-300'
                                        : 'bg-white text-slate-700 border-slate-300'
                            }`}
                          >
                            <option value="Available">Available</option>
                            <option value="In Screening">In Screening</option>
                            <option value="Interview Scheduled">Interview Scheduled</option>
                            <option value="Shortlisted">Shortlisted</option>
                            <option value="Placed">Placed</option>
                            <option value="Under Review">Under Review</option>
                            <option value="Inactive">Inactive</option>
                          </select>
                        </td>

                        <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                          {/* WhatsApp Chat Button */}
                          <a
                            href={`https://wa.me/${cand.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                              `Hello ${cand.fullName}, Sarthi Solutions Silvassa reviewed your candidate profile for "${displayRole}". Are you available for a preliminary job interview?`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 rounded-xl bg-green-50 text-green-700 hover:bg-green-600 hover:text-white inline-block transition-colors"
                            title="WhatsApp Candidate"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </a>

                          {/* Edit Candidate Button */}
                          <button
                            onClick={() => handleOpenEditCandidate(cand)}
                            className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-[#0A3D91] hover:text-white transition-colors cursor-pointer"
                            title="Edit Candidate & Resume Details"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {/* Delete Candidate Button */}
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete candidate record for "${cand.fullName}" from database?`)) {
                                deleteCandidate(cand.id);
                              }
                            }}
                            className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
                            title="Delete Candidate"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredCandidates.length === 0 && (
                <div className="p-12 text-center text-slate-500">
                  <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-extrabold text-sm text-slate-700">No candidate records match your search query or filters.</p>
                  <p className="text-xs text-slate-400 mt-1">Try resetting filters or click "+ Add Candidate & Resume" to store a new candidate in database.</p>
                  <button
                    onClick={resetCandidateFilters}
                    className="mt-4 px-4 py-2 bg-[#0A3D91] text-white text-xs font-bold rounded-xl"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          )}

          {/* CARDS VIEW */}
          {viewMode === 'cards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCandidates.map((cand) => {
                const skillsList = cand.skills || cand.additionalSkills || cand.keySkills || [];
                const displayRole = cand.targetRole || cand.currentDesignation || cand.primarySkill || 'Candidate Profile';
                const displayLocation = cand.currentLocation || cand.location || 'Silvassa / Surat';
                const displayExp = cand.experience || (cand.experienceYears ? `${cand.experienceYears} Years` : 'Experienced');
                const displayQual = cand.qualification || cand.highestQualification || 'Degree / Diploma';
                const displaySalary = cand.currentSalary || cand.currentCTC || 'Confidential';
                const displayExpSalary = cand.expectedSalary || cand.expectedCTC || 'Negotiable';

                return (
                  <div
                    key={cand.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-sm">{cand.fullName}</h4>
                          <p className="font-bold text-[#0A3D91] text-xs mt-0.5">{displayRole}</p>
                        </div>
                        <span
                          className={`px-2.5 py-1 rounded-lg font-bold text-[10px] ${
                            cand.status === 'Interview Scheduled'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : cand.status === 'Shortlisted'
                                ? 'bg-blue-50 text-blue-800 border border-blue-200'
                                : cand.status === 'Placed'
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {cand.status || 'Available'}
                        </span>
                      </div>

                      {/* Contact & Location Details */}
                      <div className="space-y-1 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 mb-3">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-bold">{cand.phone}</span>
                        </div>
                        {cand.email && (
                          <div className="flex items-center gap-1.5 text-slate-500">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span className="truncate">{cand.email}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{displayLocation}</span>
                        </div>
                      </div>

                      {/* Experience, Education & CTC Metrics */}
                      <div className="grid grid-cols-2 gap-2 text-[11px] mb-3">
                        <div className="p-2 rounded-lg bg-blue-50/50 border border-blue-100">
                          <span className="text-slate-400 block text-[10px]">Experience</span>
                          <span className="font-bold text-slate-800">⏱️ {displayExp}</span>
                        </div>
                        <div className="p-2 rounded-lg bg-amber-50/50 border border-amber-100">
                          <span className="text-slate-400 block text-[10px]">Qualification</span>
                          <span className="font-bold text-slate-800 truncate block" title={displayQual}>
                            🎓 {displayQual}
                          </span>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                          <span className="text-slate-400 block text-[10px]">Current CTC</span>
                          <span className="font-semibold text-slate-700">{displaySalary}</span>
                        </div>
                        <div className="p-2 rounded-lg bg-emerald-50/50 border border-emerald-100">
                          <span className="text-slate-400 block text-[10px]">Expected CTC</span>
                          <span className="font-bold text-emerald-700">{displayExpSalary}</span>
                        </div>
                      </div>

                      {/* Skills Tags */}
                      <div className="mb-3">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase mb-1">Key Competencies</span>
                        <div className="flex flex-wrap gap-1">
                          {cand.primarySkill && (
                            <span className="px-2 py-0.5 rounded-md bg-[#0A3D91]/10 text-[#0A3D91] font-bold text-[10px] border border-[#0A3D91]/20">
                              ⭐ {cand.primarySkill}
                            </span>
                          )}
                          {skillsList.filter((s) => s !== cand.primarySkill).slice(0, 4).map((skill, sIdx) => (
                            <span
                              key={sIdx}
                              className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[10px] border border-slate-200"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Recruiter Notes */}
                      {cand.notes && (
                        <p className="text-[11px] text-slate-500 italic bg-amber-50/30 p-2 rounded-lg border border-amber-100/50 mb-3">
                          📝 {cand.notes}
                        </p>
                      )}
                    </div>

                    {/* Card Footer Actions */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenResumePreview(cand)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] border border-emerald-200 cursor-pointer"
                          title="Preview in Web & Download"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>{cand.resumeUrl ? 'Preview & Download' : 'Preview CV'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setQuickUploadCandId(cand.id);
                            quickFileInputRef.current?.click();
                          }}
                          className="inline-flex items-center gap-1 px-2 py-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-[10px] font-bold border border-slate-200 cursor-pointer"
                          title="Attach or Replace Resume File"
                        >
                          <Upload className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <a
                          href={`https://wa.me/${cand.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                            `Hello ${cand.fullName}, Sarthi Solutions Silvassa reviewed your candidate profile for "${displayRole}". Are you available for a preliminary job interview?`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-xl bg-green-50 text-green-700 hover:bg-green-600 hover:text-white transition-colors"
                          title="WhatsApp Candidate"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleOpenEditCandidate(cand)}
                          className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-[#0A3D91] hover:text-white transition-colors cursor-pointer"
                          title="Edit Candidate"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete candidate record for "${cand.fullName}"?`)) {
                              deleteCandidate(cand.id);
                            }
                          }}
                          className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
                          title="Delete Candidate"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredCandidates.length === 0 && (
                <div className="col-span-full p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
                  <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-extrabold text-sm text-slate-700">No candidates match the specified filters.</p>
                  <button
                    onClick={resetCandidateFilters}
                    className="mt-4 px-4 py-2 bg-[#0A3D91] text-white text-xs font-bold rounded-xl"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 1: LIVE VACANCIES CRUD TABLE */}
      {subTab === 'jobs' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-x-auto">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="relative w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search vacancies..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
              />
            </div>
            <div className="text-xs text-slate-500 font-bold">
              Showing {filteredJobs.length} active vacancies
            </div>
          </div>
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 uppercase text-[10px] text-slate-500 font-extrabold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Job Title & Category</th>
                <th className="py-3.5 px-4">Company & Location</th>
                <th className="py-3.5 px-4">Salary Package</th>
                <th className="py-3.5 px-4">Experience & Vacancies</th>
                <th className="py-3.5 px-4">Badges</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredJobs.map((job) => (
                <tr key={job.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-extrabold text-slate-900">{job.title}</div>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded bg-blue-50 text-[#0A3D91] font-bold text-[10px] border border-blue-100">
                      {job.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-800">{job.companyName}</div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" /> {job.location}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-extrabold text-[#0A3D91]">{job.salary}</td>
                  <td className="py-3.5 px-4">
                    <div>{job.experience}</div>
                    <div className="text-[11px] text-slate-500">{job.vacancies} Vacancy(s)</div>
                  </td>
                  <td className="py-3.5 px-4 space-x-1">
                    {job.isUrgent && (
                      <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-bold text-[10px]">
                        URGENT
                      </span>
                    )}
                    {job.isFeatured && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                        FEATURED
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      onClick={() => handleOpenEditJob(job)}
                      className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-[#0A3D91] hover:text-white transition-colors cursor-pointer"
                      title="Edit Job Vacancy"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteJob(job.id, job.title)}
                      className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
                      title="Delete Job Vacancy"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredJobs.length === 0 && (
            <div className="p-8 text-center text-slate-500 font-bold text-xs">
              No matching job vacancies found.
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: CANDIDATE JOB APPLICATIONS CRUD TABLE */}
      {subTab === 'applications' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-x-auto">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="relative w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search applications..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
              />
            </div>
            <div className="text-xs text-slate-500 font-bold">
              Showing {filteredApps.length} candidate applications
            </div>
          </div>
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 uppercase text-[10px] text-slate-500 font-extrabold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Candidate Details</th>
                <th className="py-3.5 px-4">Target Job</th>
                <th className="py-3.5 px-4">Exp & CTC</th>
                <th className="py-3.5 px-4">Resume / CV</th>
                <th className="py-3.5 px-4">Status & Interview</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredApps.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-extrabold text-slate-900">{app.candidateName}</div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-slate-400" /> {app.phone}
                    </div>
                    {app.email && (
                      <div className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-400" /> {app.email}
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-[#0A3D91]">{app.jobTitle}</div>
                    <div className="text-[10px] text-slate-500">{app.qualification || 'Degree / Diploma'}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-800">{app.experience}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {app.currentCTC ? `CTC: ${app.currentCTC}` : ''}
                      {app.expectedCTC ? ` → Exp: ${app.expectedCTC}` : ''}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <button
                      type="button"
                      onClick={() => handleOpenResumePreview(app)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-[10px] border border-emerald-200 cursor-pointer"
                      title="Preview in Web & Download Resume"
                    >
                      <FileText className="w-3 h-3" /> Preview & Download
                    </button>
                  </td>
                  <td className="py-3.5 px-4">
                    <select
                      value={app.status}
                      onChange={(e) =>
                        updateApplication(app.id, {
                          status: e.target.value as any
                        })
                      }
                      className="text-[11px] font-bold px-2 py-1 rounded-lg border border-slate-300 bg-white"
                    >
                      <option value="Pending Review">Pending Review</option>
                      <option value="Pre-Screened">Pre-Screened</option>
                      <option value="Shortlisted">Shortlisted</option>
                      <option value="Interview Scheduled">Interview Scheduled</option>
                      <option value="Placed">Placed</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                    {app.interviewDate && (
                      <div className="text-[10px] text-blue-600 font-semibold mt-1">
                        📅 {app.interviewDate}
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 text-[11px]">{app.appliedDate}</td>
                  <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                    <a
                      href={`https://wa.me/91${app.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-600 hover:text-white inline-block transition-colors"
                      title="WhatsApp Candidate"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => handleOpenEditApp(app)}
                      className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-[#0A3D91] hover:text-white transition-colors cursor-pointer"
                      title="Edit Application"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteApp(app.id, app.candidateName)}
                      className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
                      title="Delete Application"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredApps.length === 0 && (
            <div className="p-8 text-center text-slate-500 font-bold text-xs">
              No candidate applications found.
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: ADD / EDIT CANDIDATE & RESUME (MANUAL ENTRY TO FIRESTORE & STORAGE) */}
      {isCandidateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl relative border border-slate-200 max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setIsCandidateModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <div className="p-2 rounded-xl bg-[#0A3D91]/10 text-[#0A3D91]">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#0A3D91]">
                  {editingCandidateId ? 'Edit Candidate Profile & Resume' : 'Manually Add Candidate with Resume'}
                </h3>
                <p className="text-xs text-slate-500">
                  Save candidate details & resume file directly to Cloud Firestore & Firebase Storage database.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveCandidate} className="mt-5 space-y-4 text-xs">
              {/* Basic Details */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-3">
                <div className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-[#0A3D91]" /> Candidate Personal & Contact Information
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Candidate Full Name *</label>
                    <input
                      type="text"
                      required
                      value={candidateFormData.fullName || ''}
                      onChange={(e) => setCandidateFormData({ ...candidateFormData, fullName: e.target.value })}
                      placeholder="e.g. Ramesh Chandra Patel"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-[#0A3D91] outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Mobile / WhatsApp Number *</label>
                    <input
                      type="text"
                      required
                      value={candidateFormData.phone || ''}
                      onChange={(e) => setCandidateFormData({ ...candidateFormData, phone: e.target.value })}
                      placeholder="+91 98243 12345"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-[#0A3D91] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                    <input
                      type="email"
                      value={candidateFormData.email || ''}
                      onChange={(e) => setCandidateFormData({ ...candidateFormData, email: e.target.value })}
                      placeholder="candidate.name@gmail.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-[#0A3D91] outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Current City / Location *</label>
                    <input
                      type="text"
                      required
                      value={candidateFormData.currentLocation || ''}
                      onChange={(e) => setCandidateFormData({ ...candidateFormData, currentLocation: e.target.value })}
                      placeholder="e.g. Silvassa (D&NH), Surat, Vapi"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-[#0A3D91] outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Role, Domain & Experience */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-3">
                <div className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-[#0A3D91]" /> Professional Role, Skills & Qualifications
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Target Role / Designation *</label>
                    <input
                      type="text"
                      required
                      value={candidateFormData.targetRole || candidateFormData.currentDesignation || ''}
                      onChange={(e) =>
                        setCandidateFormData({
                          ...candidateFormData,
                          targetRole: e.target.value,
                          currentDesignation: e.target.value
                        })
                      }
                      placeholder="e.g. Factory Manager, QC Engineer"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-[#0A3D91] outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Total Experience *</label>
                    <input
                      type="text"
                      required
                      value={candidateFormData.experience || ''}
                      onChange={(e) => setCandidateFormData({ ...candidateFormData, experience: e.target.value })}
                      placeholder="e.g. 5 Years (or Fresher)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-[#0A3D91] outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Highest Qualification *</label>
                    <input
                      type="text"
                      required
                      value={candidateFormData.qualification || candidateFormData.highestQualification || ''}
                      onChange={(e) =>
                        setCandidateFormData({
                          ...candidateFormData,
                          qualification: e.target.value,
                          highestQualification: e.target.value
                        })
                      }
                      placeholder="BE Mechanical / MBA / Diploma"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-[#0A3D91] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Primary Core Skill *</label>
                    <input
                      type="text"
                      value={candidateFormData.primarySkill || ''}
                      onChange={(e) => setCandidateFormData({ ...candidateFormData, primarySkill: e.target.value })}
                      placeholder="e.g. Factory Management & CGWA Compliance"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-[#0A3D91] outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Additional Skills (Comma-separated)</label>
                    <input
                      type="text"
                      value={(candidateFormData as any).skillsText || ''}
                      onChange={(e) => setCandidateFormData({ ...candidateFormData, skillsText: e.target.value } as any)}
                      placeholder="PF/ESIC, ISO 9001, AutoCAD, Vernier Caliper, MS Excel"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-[#0A3D91] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Current Employer / Company</label>
                    <input
                      type="text"
                      value={candidateFormData.currentCompany || ''}
                      onChange={(e) => setCandidateFormData({ ...candidateFormData, currentCompany: e.target.value })}
                      placeholder="e.g. Western Polymers Ltd"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-[#0A3D91] outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Current CTC / Salary</label>
                    <input
                      type="text"
                      value={candidateFormData.currentSalary || ''}
                      onChange={(e) => setCandidateFormData({ ...candidateFormData, currentSalary: e.target.value })}
                      placeholder="e.g. ₹4.5 LPA"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-[#0A3D91] outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Expected CTC / Salary</label>
                    <input
                      type="text"
                      value={candidateFormData.expectedSalary || ''}
                      onChange={(e) => setCandidateFormData({ ...candidateFormData, expectedSalary: e.target.value })}
                      placeholder="e.g. ₹6.0 LPA"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-[#0A3D91] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Notice Period</label>
                    <input
                      type="text"
                      value={candidateFormData.noticePeriod || ''}
                      onChange={(e) => setCandidateFormData({ ...candidateFormData, noticePeriod: e.target.value })}
                      placeholder="Immediate / 15 Days / 1 Month"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-[#0A3D91] outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Candidate Status</label>
                    <select
                      value={candidateFormData.status || 'Available'}
                      onChange={(e) => setCandidateFormData({ ...candidateFormData, status: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-[#0A3D91] outline-none font-bold"
                    >
                      <option value="Available">Available for Interviews</option>
                      <option value="In Screening">In Screening</option>
                      <option value="Interview Scheduled">Interview Scheduled</option>
                      <option value="Shortlisted">Shortlisted for Client</option>
                      <option value="Placed">Placed Successfully</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Inactive">Inactive / On Hold</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Resume File Upload & Storage Section */}
              <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200/80 space-y-3">
                <div className="font-extrabold text-emerald-950 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-emerald-700" /> Candidate Resume / CV File (Stored in Database)
                  </div>
                  {candidateFormData.resumeUrl && (
                    <a
                      href={candidateFormData.resumeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-700 hover:text-emerald-900 font-bold underline flex items-center gap-1 text-[11px]"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Existing Resume
                    </a>
                  )}
                </div>

                {/* File picker input */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">
                    Upload Resume Document (PDF, DOC, DOCX)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      className="text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#0A3D91] file:text-white hover:file:bg-[#083275] cursor-pointer"
                    />
                    {selectedResumeFile && (
                      <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-600" /> {selectedResumeFile.name} ({(selectedResumeFile.size / 1024).toFixed(0)} KB)
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    File will be securely uploaded to Firebase Storage and linked with candidate ID.
                  </p>
                </div>

                {/* External URL Fallback */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Or Paste Resume Cloud Link (Google Drive / Dropbox / Direct URL)
                  </label>
                  <input
                    type="url"
                    value={candidateFormData.resumeUrl || ''}
                    onChange={(e) => setCandidateFormData({ ...candidateFormData, resumeUrl: e.target.value })}
                    placeholder="https://drive.google.com/file/d/..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-[#0A3D91] outline-none text-xs"
                  />
                </div>
              </div>

              {/* Recruiter Notes */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Recruiter Notes & Verification Details</label>
                <textarea
                  rows={2}
                  value={candidateFormData.notes || ''}
                  onChange={(e) => setCandidateFormData({ ...candidateFormData, notes: e.target.value })}
                  placeholder="e.g. Verified 5 yrs CGWA compliance background. Excellent communication. Ready to join Silvassa plant on 10 days notice."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none text-xs"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCandidateModalOpen(false)}
                  className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploadingResume}
                  className="flex-1 bg-[#0A3D91] text-white py-3 rounded-xl font-bold hover:bg-[#083275] cursor-pointer shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isUploadingResume ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Storing in Database...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> {editingCandidateId ? 'Save Changes' : 'Store Candidate in Database'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD / EDIT JOB VACANCY */}
      {isJobModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl relative border border-slate-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsJobModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-extrabold text-[#0A3D91] mb-1">
              {editingJobId ? 'Edit Job Opening' : 'Create New Job Vacancy'}
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Enter complete vacancy details for Gujarat and Silvassa job seekers.
            </p>

            <form onSubmit={handleSaveJob} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Job Title *</label>
                <input
                  type="text"
                  required
                  value={jobFormData.title || ''}
                  onChange={(e) => setJobFormData({ ...jobFormData, title: e.target.value })}
                  placeholder="e.g. Assistant Factory Manager"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={jobFormData.companyName || ''}
                    onChange={(e) => setJobFormData({ ...jobFormData, companyName: e.target.value })}
                    placeholder="e.g. Premier Industrial Corp"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Location *</label>
                  <input
                    type="text"
                    required
                    value={jobFormData.location || ''}
                    onChange={(e) => setJobFormData({ ...jobFormData, location: e.target.value })}
                    placeholder="e.g. Silvassa (D&NH)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Salary Range *</label>
                  <input
                    type="text"
                    required
                    value={jobFormData.salary || ''}
                    onChange={(e) => setJobFormData({ ...jobFormData, salary: e.target.value })}
                    placeholder="e.g. ₹35,000 - ₹50,000 / month"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Experience *</label>
                  <input
                    type="text"
                    required
                    value={jobFormData.experience || ''}
                    onChange={(e) => setJobFormData({ ...jobFormData, experience: e.target.value })}
                    placeholder="e.g. 5–8 Years"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={jobFormData.category || 'Manufacturing'}
                    onChange={(e) => setJobFormData({ ...jobFormData, category: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                  >
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Elevator">Elevator</option>
                    <option value="Engineering">Engineering</option>
                    <option value="IT">IT</option>
                    <option value="HR">HR</option>
                    <option value="Finance">Finance</option>
                    <option value="Sales">Sales</option>
                    <option value="Executive">Executive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Qualification</label>
                  <input
                    type="text"
                    value={jobFormData.qualification || ''}
                    onChange={(e) => setJobFormData({ ...jobFormData, qualification: e.target.value })}
                    placeholder="BE / Diploma / B.Com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Age Limit</label>
                  <input
                    type="text"
                    value={jobFormData.ageRange || ''}
                    onChange={(e) => setJobFormData({ ...jobFormData, ageRange: e.target.value })}
                    placeholder="e.g. 28–45 Years"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Working Hours</label>
                  <input
                    type="text"
                    value={jobFormData.workingHours || ''}
                    onChange={(e) => setJobFormData({ ...jobFormData, workingHours: e.target.value })}
                    placeholder="8:30 AM – 7:30 PM"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 py-2 bg-slate-50 px-4 rounded-xl border border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={!!jobFormData.isUrgent}
                    onChange={(e) => setJobFormData({ ...jobFormData, isUrgent: e.target.checked })}
                    className="rounded text-[#0A3D91] focus:ring-0"
                  />
                  Mark as URGENT Vacancy
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={!!jobFormData.isFeatured}
                    onChange={(e) => setJobFormData({ ...jobFormData, isFeatured: e.target.checked })}
                    className="rounded text-[#0A3D91] focus:ring-0"
                  />
                  Featured on Top
                </label>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Job Description *</label>
                <textarea
                  rows={2}
                  required
                  value={jobFormData.description || ''}
                  onChange={(e) => setJobFormData({ ...jobFormData, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Key Responsibilities (One per line)</label>
                  <textarea
                    rows={3}
                    value={(jobFormData as any).keyResponsibilitiesText || ''}
                    onChange={(e) => setJobFormData({ ...jobFormData, keyResponsibilitiesText: e.target.value } as any)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Key Requirements (One per line)</label>
                  <textarea
                    rows={3}
                    value={(jobFormData as any).keyRequirementsText || ''}
                    onChange={(e) => setJobFormData({ ...jobFormData, keyRequirementsText: e.target.value } as any)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsJobModalOpen(false)}
                  className="flex-1 bg-slate-100 text-slate-700 py-2.5 rounded-xl font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#0A3D91] text-white py-2.5 rounded-xl font-bold hover:bg-[#083275] cursor-pointer"
                >
                  {editingJobId ? 'Save Vacancy' : 'Publish Vacancy'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD / EDIT CANDIDATE APPLICATION */}
      {isAppModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative border border-slate-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsAppModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-extrabold text-[#0A3D91] mb-1">
              {editingAppId ? 'Update Candidate Profile' : 'Add Candidate Application'}
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Manage candidate status, interview schedules, and notes.
            </p>

            <form onSubmit={handleSaveApp} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Candidate Full Name *</label>
                <input
                  type="text"
                  required
                  value={appFormData.candidateName || ''}
                  onChange={(e) => setAppFormData({ ...appFormData, candidateName: e.target.value })}
                  placeholder="e.g. Suresh Parmar"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={appFormData.phone || ''}
                    onChange={(e) => setAppFormData({ ...appFormData, phone: e.target.value })}
                    placeholder="+91 98251 12345"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email</label>
                  <input
                    type="email"
                    value={appFormData.email || ''}
                    onChange={(e) => setAppFormData({ ...appFormData, email: e.target.value })}
                    placeholder="candidate@gmail.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Job Applied / Target Role *</label>
                <input
                  type="text"
                  required
                  value={appFormData.jobTitle || ''}
                  onChange={(e) => setAppFormData({ ...appFormData, jobTitle: e.target.value })}
                  placeholder="e.g. Assistant Factory Manager"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Experience</label>
                  <input
                    type="text"
                    value={appFormData.experience || ''}
                    onChange={(e) => setAppFormData({ ...appFormData, experience: e.target.value })}
                    placeholder="e.g. 7 Years"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Current Location</label>
                  <input
                    type="text"
                    value={appFormData.currentLocation || ''}
                    onChange={(e) => setAppFormData({ ...appFormData, currentLocation: e.target.value })}
                    placeholder="e.g. Silvassa"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Application Status</label>
                  <select
                    value={appFormData.status || 'Pending Review'}
                    onChange={(e) => setAppFormData({ ...appFormData, status: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                  >
                    <option value="Pending Review">Pending Review</option>
                    <option value="Pre-Screened">Pre-Screened</option>
                    <option value="Shortlisted">Shortlisted</option>
                    <option value="Interview Scheduled">Interview Scheduled</option>
                    <option value="Placed">Placed</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Interview Date & Time</label>
                  <input
                    type="text"
                    value={appFormData.interviewDate || ''}
                    onChange={(e) => setAppFormData({ ...appFormData, interviewDate: e.target.value })}
                    placeholder="e.g. 2026-08-06 at 11:30 AM"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Recruiter Notes</label>
                <textarea
                  rows={2}
                  value={appFormData.notes || ''}
                  onChange={(e) => setAppFormData({ ...appFormData, notes: e.target.value })}
                  placeholder="Candidate strengths, verification notes, or interview feedback..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                />
              </div>

              <div className="pt-3 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAppModalOpen(false)}
                  className="flex-1 bg-slate-100 text-slate-700 py-2.5 rounded-xl font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#0A3D91] text-white py-2.5 rounded-xl font-bold hover:bg-[#083275] cursor-pointer"
                >
                  {editingAppId ? 'Save Candidate' : 'Add Candidate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* In-Web Resume Preview & Download Modal */}
      <ResumePreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        candidate={previewCandidate}
      />
    </div>
  );
};
