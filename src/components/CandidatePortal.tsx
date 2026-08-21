import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { ResumePreviewModal, ResumeCandidateData } from './ResumePreviewModal';
import { 
  User, 
  FileText, 
  Briefcase, 
  Award, 
  Upload, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone,
  Mail,
  Download,
  Calendar,
  Sparkles,
  AlertCircle,
  ExternalLink,
  Eye
} from 'lucide-react';

export const CandidatePortal: React.FC = () => {
  const { 
    candidates, 
    applications, 
    uploadCandidateResume, 
    updateCandidate,
    addCandidate 
  } = useData();
  const { currentUser, userProfile } = useAuth();

  const [activeTab, setActiveTab] = useState<'applied' | 'profile' | 'offers'>('applied');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Find candidate profile matching current user or fallback to first demo candidate
  const currentEmail = (userProfile?.email || currentUser?.email || 'rajesh.k@gmail.com').toLowerCase();
  const currentCandidate = candidates.find(
    (c) => (c.email && c.email.toLowerCase() === currentEmail) || (currentUser && c.userId === currentUser.uid)
  ) || candidates[0] || {
    id: `cand-${Date.now()}`,
    fullName: userProfile?.displayName || 'Registered Candidate',
    email: currentEmail,
    phone: userProfile?.phone || '+91 98765 43210',
    qualification: 'B.Tech Mechanical',
    experienceYears: 8,
    experience: '8 Years',
    currentLocation: 'Silvassa / Surat',
    primarySkill: 'Plant Operations & Factory Management',
    status: 'Available',
    resumeFileName: 'Rajesh_Kumar_Resume_2026.pdf',
    resumeFileType: 'application/pdf',
    resumeFileSize: 245000,
    resumeUploadDate: '2026-08-01',
    resumeUrl: ''
  };

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    fullName: currentCandidate.fullName || '',
    phone: currentCandidate.phone || '',
    email: currentCandidate.email || currentEmail,
    qualification: currentCandidate.qualification || currentCandidate.highestQualification || 'B.Tech Mechanical',
    experience: currentCandidate.experience || `${currentCandidate.experienceYears || 5} Years`,
    primarySkill: currentCandidate.primarySkill || 'Plant Operations & Statutory Compliance',
    currentLocation: currentCandidate.currentLocation || 'Silvassa / Surat',
    currentCompany: currentCandidate.currentCompany || 'Western Polymers Ltd',
    expectedSalary: currentCandidate.expectedSalary || '₹6.5 LPA',
    noticePeriod: currentCandidate.noticePeriod || '15 Days'
  });

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);

  // Applications matching candidate
  const candidateApps = applications.filter(
    (app) => app.email.toLowerCase() === currentEmail || app.candidateName.toLowerCase() === currentCandidate.fullName.toLowerCase()
  );

  const activeAppsList = candidateApps.length > 0 ? candidateApps : applications.slice(0, 2);

  // Resume File Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    
    // Check file extension
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(pdf|doc|docx|jpg|png)$/i)) {
      setUploadError('Please upload a valid PDF, DOC, DOCX, or JPG/PNG resume file.');
      return;
    }

    // Size limit 15MB
    if (file.size > 15 * 1024 * 1024) {
      setUploadError('Resume file size must be less than 15MB.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const result = await uploadCandidateResume(currentCandidate.id, file, {
        fullName: profileForm.fullName || currentCandidate.fullName,
        email: currentEmail,
        phone: profileForm.phone || currentCandidate.phone,
        currentLocation: profileForm.currentLocation || currentCandidate.currentLocation,
        userId: currentUser?.uid
      });

      setUploadSuccess(`Resume "${result.fileName}" successfully uploaded to Firebase Storage and linked to your profile!`);
      setTimeout(() => setUploadSuccess(null), 6000);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload resume to Firebase Storage. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const exists = candidates.some((c) => c.id === currentCandidate.id);
      if (exists) {
        await updateCandidate(currentCandidate.id, {
          ...profileForm,
          userId: currentUser?.uid
        });
      } else {
        await addCandidate({
          ...currentCandidate,
          ...profileForm,
          userId: currentUser?.uid
        });
      }
      setProfileSaveSuccess(true);
      setTimeout(() => setProfileSaveSuccess(false), 4000);
    } catch (err) {
      console.warn('Error saving candidate profile:', err);
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Top Profile Capsule */}
      <div className="bg-[#0A3D91] text-white rounded-3xl p-6 sm:p-8 mb-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#D9A21B] text-[#0A3D91] font-black text-2xl flex items-center justify-center shadow-lg border-2 border-white shrink-0">
            {(currentCandidate.fullName || 'User').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                {currentCandidate.fullName || 'Registered Candidate'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500 text-white text-[10px] font-bold">
                {currentCandidate.status || 'Verified Candidate'}
              </span>
            </div>
            <p className="text-xs text-blue-200 mt-0.5">
              {currentCandidate.primarySkill || 'Industrial Candidate'} • {currentCandidate.qualification || 'Professional'} • {currentCandidate.experience || 'Experienced'}
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-[11px] text-blue-100">
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-[#D9A21B]" /> {currentCandidate.currentLocation || 'Gujarat / Silvassa'}</span>
              <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-[#D9A21B]" /> {currentCandidate.phone || '+91 98243 22206'}</span>
              <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-[#D9A21B]" /> {currentCandidate.email || currentEmail}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-blue-900/60 p-3.5 rounded-2xl border border-blue-700 text-center min-w-[100px]">
            <div className="text-xl font-black text-[#D9A21B]">{activeAppsList.length}</div>
            <div className="text-[10px] text-blue-200 uppercase tracking-wider font-bold">Applications</div>
          </div>
          <div className="bg-blue-900/60 p-3.5 rounded-2xl border border-blue-700 text-center min-w-[100px]">
            <div className="text-xl font-black text-white">
              {activeAppsList.filter((a) => a.status.includes('Interview')).length}
            </div>
            <div className="text-[10px] text-blue-200 uppercase tracking-wider font-bold">Interviews</div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {uploadSuccess && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{uploadSuccess}</span>
        </div>
      )}

      {uploadError && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Portal Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-8 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('applied')}
          className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'applied'
              ? 'bg-[#0A3D91] text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Briefcase className="w-4 h-4" /> Applied Jobs ({activeAppsList.length})
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-[#0A3D91] text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <User className="w-4 h-4" /> Profile & Firebase Resume
        </button>

        <button
          onClick={() => setActiveTab('offers')}
          className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'offers'
              ? 'bg-[#0A3D91] text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Award className="w-4 h-4" /> Offer Letters & Status
        </button>
      </div>

      {/* Tab Content 1: Applied Jobs */}
      {activeTab === 'applied' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-[#0A3D91]">Your Active Job Applications</h2>
            <span className="text-xs text-slate-500 font-semibold">Synced with Sarthi Solutions Cloud Database</span>
          </div>

          {activeAppsList.map((app) => (
            <div key={app.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100">
                <div>
                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold inline-block mb-1 border ${
                    app.status.includes('Interview')
                      ? 'bg-amber-50 text-amber-900 border-amber-200'
                      : app.status.includes('Shortlisted') || app.status.includes('Selected')
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                      : 'bg-blue-50 text-[#0A3D91] border-blue-100'
                  }`}>
                    {app.status}
                  </span>
                  <h3 className="text-lg font-black text-slate-900">{app.jobTitle}</h3>
                  <div className="text-xs text-slate-600 font-medium mt-0.5">
                    Candidate: <strong>{app.candidateName}</strong> • {app.currentLocation}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-black text-[#0A3D91]">{app.expectedCTC || app.currentCTC || 'Competitive Salary'}</div>
                  <div className="text-[11px] text-slate-500">Applied Date: {app.appliedDate}</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#0A3D91]" />
                  <span className="font-semibold text-slate-800">
                    {app.interviewDate ? `Scheduled Interview: ${app.interviewDate}` : 'Under profile screening with Sarthi Solutions HR team'}
                  </span>
                </div>

                <div className="text-slate-600">
                  Principal Consultant: <strong className="text-[#0A3D91]">Raajesh V (+91 98243 22206)</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab Content 2: Profile & Resume Upload to Firebase Storage */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Resume Upload Box */}
          <div className="lg:col-span-1 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm h-fit">
            <h3 className="text-base font-black text-[#0A3D91] mb-2 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#D9A21B]" />
              <span>Firebase Resume File</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Upload your CV directly to Firebase Storage. Sarthi Solutions HR will access this document for employer dispatches.
            </p>

            <div className="p-6 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/70 text-center mb-4">
              <FileText className="w-10 h-10 text-[#0A3D91] mx-auto mb-2" />
              <h4 className="text-xs font-bold text-slate-900 truncate">
                {currentCandidate.resumeFileName || 'No resume uploaded yet'}
              </h4>
              <p className="text-[11px] text-slate-500 mt-1">
                {currentCandidate.resumeUploadDate ? `Uploaded: ${currentCandidate.resumeUploadDate}` : 'Supports PDF, DOC, DOCX'}
              </p>
              {currentCandidate.resumeFileSize && (
                <p className="text-[10px] text-slate-400">
                  Size: {(currentCandidate.resumeFileSize / 1024).toFixed(1)} KB
                </p>
              )}

              <div className="mt-4 flex flex-col gap-2">
                <label className="bg-[#0A3D91] hover:bg-[#083275] text-white px-4 py-2.5 rounded-xl text-xs font-extrabold cursor-pointer transition-all inline-flex items-center justify-center gap-2 shadow-sm">
                  <Upload className="w-3.5 h-3.5 text-[#D9A21B]" />
                  <span>{isUploading ? 'Uploading to Firebase...' : 'Upload New Resume'}</span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    disabled={isUploading}
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>

                {currentCandidate.resumeUrl && (
                  <button
                    type="button"
                    onClick={() => setIsPreviewOpen(true)}
                    className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 px-4 py-2.5 rounded-xl text-xs font-black transition-all inline-flex items-center justify-center gap-1.5 border border-emerald-200 cursor-pointer shadow-xs"
                  >
                    <Eye className="w-4 h-4 text-emerald-600" />
                    <span>Preview & Download Resume</span>
                  </button>
                )}
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-[11px] text-amber-900">
              <strong>Security Guarantee:</strong> Resumes are stored securely in dedicated cloud storage buckets protected by Firestore security rules.
            </div>
          </div>

          {/* Profile Edit Form */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-[#0A3D91]">Candidate Profile Details</h3>
                <p className="text-xs text-slate-500">Keep your career preferences up to date for fast-track interview scheduling.</p>
              </div>
              {profileSaveSuccess && (
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full animate-in fade-in flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Saved!
                </span>
              )}
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={profileForm.fullName}
                    onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phone Number (WhatsApp) *</label>
                  <input
                    type="text"
                    required
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Highest Qualification</label>
                  <input
                    type="text"
                    value={profileForm.qualification}
                    onChange={(e) => setProfileForm({ ...profileForm, qualification: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Total Experience (Years)</label>
                  <input
                    type="text"
                    value={profileForm.experience}
                    onChange={(e) => setProfileForm({ ...profileForm, experience: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Primary Skill / Domain Expertise</label>
                <input
                  type="text"
                  value={profileForm.primarySkill}
                  onChange={(e) => setProfileForm({ ...profileForm, primarySkill: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Current Location</label>
                  <input
                    type="text"
                    value={profileForm.currentLocation}
                    onChange={(e) => setProfileForm({ ...profileForm, currentLocation: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Expected Salary (CTC)</label>
                  <input
                    type="text"
                    value={profileForm.expectedSalary}
                    onChange={(e) => setProfileForm({ ...profileForm, expectedSalary: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Notice Period</label>
                  <input
                    type="text"
                    value={profileForm.noticePeriod}
                    onChange={(e) => setProfileForm({ ...profileForm, noticePeriod: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="bg-[#0A3D91] hover:bg-[#083275] disabled:opacity-60 text-white font-black px-6 py-2.5 rounded-xl transition-all shadow-md cursor-pointer"
                >
                  {isSavingProfile ? 'Saving...' : 'Update Profile in Cloud Database'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab Content 3: Offers */}
      {activeTab === 'offers' && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center py-16">
          <Award className="w-14 h-14 text-[#D9A21B] mx-auto mb-3" />
          <h3 className="text-xl font-black text-slate-900">Offer Letters & Verification Desk</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-2 leading-relaxed">
            Once you clear final round interviews with client plant managers, verified offer letters issued by Sarthi Solutions hiring partners will be uploaded to your cloud storage vault here.
          </p>
          <div className="mt-6">
            <span className="px-4 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
              Status: Profile Actively Under Consideration
            </span>
          </div>
        </div>
      )}

      {/* In-Web Resume Preview & Download Modal */}
      {currentCandidate && (
        <ResumePreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          candidate={{
            id: currentCandidate.id,
            name: currentCandidate.fullName || 'Candidate',
            email: currentCandidate.email,
            phone: currentCandidate.phone,
            targetRole: currentCandidate.targetRole || currentCandidate.currentDesignation || 'Industrial Talent',
            experience: currentCandidate.experience || `${currentCandidate.experienceYears || 5} Years`,
            skills: currentCandidate.skills || (currentCandidate.primarySkill ? [currentCandidate.primarySkill] : []),
            qualification: currentCandidate.highestQualification || currentCandidate.qualification,
            location: currentCandidate.currentLocation || 'Gujarat / Silvassa',
            currentCompany: currentCandidate.currentCompany,
            currentCTC: currentCandidate.currentSalary,
            expectedCTC: currentCandidate.expectedSalary,
            noticePeriod: currentCandidate.noticePeriod,
            notes: currentCandidate.notes,
            resumeUrl: currentCandidate.resumeUrl,
            resumeFileName: currentCandidate.resumeFileName,
            status: currentCandidate.status
          }}
        />
      )}

    </div>
  );
};
