import React, { useState, useRef } from 'react';
import { 
  X, 
  Download, 
  ExternalLink, 
  Printer, 
  FileText, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Award, 
  Clock, 
  DollarSign, 
  CheckCircle2, 
  Share2, 
  Eye, 
  FileCheck,
  Building,
  Calendar,
  Upload,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  RefreshCw
} from 'lucide-react';
import { SarthiLogo } from './SarthiLogo';
import { useData } from '../context/DataContext';

export interface ResumeCandidateData {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  targetRole?: string;
  experience?: string;
  skills?: string[];
  qualification?: string;
  location?: string;
  currentCompany?: string;
  currentCTC?: string;
  expectedCTC?: string;
  noticePeriod?: string;
  notes?: string;
  resumeUrl?: string;
  resumeFileName?: string;
  lastUpdated?: string;
  gender?: string;
  status?: string;
}

interface ResumePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: ResumeCandidateData | null;
}

// Helper to determine if a string is a genuine, previewable file URL
export const isActualUploadedFileUrl = (url?: string): boolean => {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (trimmed.length === 0) return false;

  // Must start with http, https, data:, or blob:
  if (
    trimmed.startsWith('https://') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    try {
      if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        const parsed = new URL(trimmed);
        // If URL points to current web app root without a real static asset path, reject it
        if (parsed.origin === window.location.origin) {
          if (parsed.pathname === '/' || parsed.pathname === '/index.html' || !parsed.pathname.includes('.')) {
            return false;
          }
        }
      }
      return true;
    } catch {
      return false;
    }
  }

  // Reject plain filenames like "Rahul_Resume.pdf" from being passed to iframe src
  return false;
};

export const ResumePreviewModal: React.FC<ResumePreviewModalProps> = ({
  isOpen,
  onClose,
  candidate: initialCandidate
}) => {
  const { uploadCandidateResume, updateCandidate } = useData();
  const [candidate, setCandidate] = useState<ResumeCandidateData | null>(initialCandidate);
  const [viewMode, setViewMode] = useState<'document' | 'profile'>('document');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const inModalFileInputRef = useRef<HTMLInputElement | null>(null);

  // Synchronize candidate when prop changes
  React.useEffect(() => {
    setCandidate(initialCandidate);
    setUploadSuccess(null);
  }, [initialCandidate]);

  if (!isOpen || !candidate) return null;

  const rawUrl = candidate.resumeUrl?.trim() || '';
  const hasValidFileUrl = isActualUploadedFileUrl(rawUrl);

  const isPdf = 
    rawUrl.startsWith('data:application/pdf') ||
    rawUrl.toLowerCase().includes('.pdf') || 
    Boolean(candidate.resumeFileName?.toLowerCase().endsWith('.pdf'));

  const isImage = 
    rawUrl.startsWith('data:image/') ||
    Boolean(rawUrl.match(/\.(jpeg|jpg|gif|png|webp|svg)($|\?)/i)) || 
    Boolean(candidate.resumeFileName?.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i));

  const isDoc = 
    rawUrl.toLowerCase().includes('.doc') || 
    rawUrl.toLowerCase().includes('.docx') ||
    Boolean(candidate.resumeFileName?.toLowerCase().endsWith('.doc')) ||
    Boolean(candidate.resumeFileName?.toLowerCase().endsWith('.docx'));

  // Generate safe embed URL for iframe
  const getEmbedSrc = (): string => {
    if (!hasValidFileUrl) return '';

    if (isDoc && (rawUrl.startsWith('http://') || rawUrl.startsWith('https://'))) {
      return `https://docs.google.com/viewer?url=${encodeURIComponent(rawUrl)}&embedded=true`;
    }

    return rawUrl;
  };

  // Quick In-Modal Resume Upload
  const handleInModalUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        setIsUploading(true);
        setUploadSuccess(null);

        const targetId = candidate.id || `cand-${Date.now()}`;
        const uploadRes = await uploadCandidateResume(targetId, file, {
          fullName: candidate.name,
          email: candidate.email,
          phone: candidate.phone,
          targetRole: candidate.targetRole
        });

        // Update local candidate view state immediately
        setCandidate((prev) => prev ? ({
          ...prev,
          resumeUrl: uploadRes.downloadUrl,
          resumeFileName: uploadRes.fileName
        }) : null);

        setUploadSuccess(`Uploaded "${file.name}" successfully!`);
        setViewMode('document');
      } catch (err) {
        console.error('In-modal upload failed:', err);
        alert('Failed to upload file. Please try again.');
      } finally {
        setIsUploading(false);
        if (inModalFileInputRef.current) {
          inModalFileInputRef.current.value = '';
        }
      }
    }
  };

  // Download handler
  const handleDownloadFile = async () => {
    if (!hasValidFileUrl) {
      handlePrintCV();
      return;
    }

    try {
      const fileName = candidate.resumeFileName || `${candidate.name.replace(/\s+/g, '_')}_Resume.pdf`;
      
      if (rawUrl.startsWith('data:') || rawUrl.startsWith('blob:')) {
        const a = document.createElement('a');
        a.href = rawUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        return;
      }

      try {
        const response = await fetch(rawUrl, { mode: 'cors' });
        if (response.ok) {
          const blob = await response.blob();
          const blobUrl = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(blobUrl);
          return;
        }
      } catch {
        // Fallback to direct navigation
      }

      const a = document.createElement('a');
      a.href = rawUrl;
      a.download = fileName;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download error:', err);
      window.open(rawUrl, '_blank');
    }
  };

  const handlePrintCV = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const summary = `*Candidate Profile - Sarthi Solutions*%0A` +
      `*Name:* ${candidate.name}%0A` +
      `*Role:* ${candidate.targetRole || 'Professional'}%0A` +
      `*Experience:* ${candidate.experience || 'Experienced'}%0A` +
      `*Location:* ${candidate.location || 'Gujarat / Silvassa'}%0A` +
      `*Qualification:* ${candidate.qualification || 'Degree / Diploma'}%0A` +
      (candidate.expectedCTC ? `*Expected CTC:* ${candidate.expectedCTC}%0A` : '') +
      (candidate.noticePeriod ? `*Notice Period:* ${candidate.noticePeriod}%0A` : '') +
      (hasValidFileUrl ? `*Resume Download Link:* ${encodeURIComponent(rawUrl)}%0A` : '') +
      `%0AVerified by Sarthi Solutions (Raajesh V: +91 98243 22206)`;
    
    window.open(`https://wa.me/?text=${summary}`, '_blank');
  };

  const handleCopyLink = () => {
    if (hasValidFileUrl) {
      navigator.clipboard.writeText(rawUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150">
        
        {/* Top Header Bar */}
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0A3D91] text-[#D9A21B] flex items-center justify-center font-black text-sm shrink-0 shadow-sm">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-[#0A3D91] truncate max-w-[280px] sm:max-w-md">
                  {candidate.name}
                </h3>
                {hasValidFileUrl ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Resume Attached
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> No File Attached
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-2">
                <span>{candidate.targetRole || 'Candidate Resume'}</span>
                {candidate.experience && (
                  <>
                    <span>•</span>
                    <span className="font-semibold text-slate-700">{candidate.experience}</span>
                  </>
                )}
                {candidate.location && (
                  <>
                    <span>•</span>
                    <span className="text-slate-600">{candidate.location}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* View Switcher Tabs */}
            <div className="flex p-1 bg-slate-200/80 rounded-xl text-xs font-bold mr-1">
              <button
                type="button"
                onClick={() => setViewMode('document')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'document' 
                    ? 'bg-[#0A3D91] text-white shadow-xs' 
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Uploaded Resume</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('profile')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'profile' 
                    ? 'bg-[#0A3D91] text-white shadow-xs' 
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Executive CV Sheet</span>
              </button>
            </div>

            {/* In-Modal Upload Button */}
            <label className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0A3D91] border border-blue-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-[#D9A21B]" />
              <span className="hidden sm:inline">{hasValidFileUrl ? 'Replace File' : 'Upload File'}</span>
              <input
                ref={inModalFileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                disabled={isUploading}
                className="hidden"
                onChange={handleInModalUpload}
              />
            </label>

            {/* Download Button */}
            {hasValidFileUrl && (
              <button
                type="button"
                onClick={handleDownloadFile}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                title="Download Resume File"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Download</span>
              </button>
            )}

            {/* Print CV */}
            <button
              type="button"
              onClick={handlePrintCV}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold transition-all cursor-pointer"
              title="Print / Save CV as PDF"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Share to WhatsApp */}
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition-all cursor-pointer"
              title="Share Candidate on WhatsApp"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors ml-1 cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {uploadSuccess && (
          <div className="bg-emerald-50 px-5 py-2 border-b border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{uploadSuccess}</span>
          </div>
        )}

        {/* Modal Main Body */}
        <div className="flex-1 overflow-y-auto bg-slate-100 p-3 sm:p-5">
          {viewMode === 'document' ? (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center">
              {hasValidFileUrl ? (
                <div className="w-full h-full min-h-[550px] bg-white rounded-2xl border border-slate-300 shadow-inner flex flex-col overflow-hidden">
                  <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
                    <div className="flex items-center gap-2 truncate">
                      <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-mono truncate font-medium text-slate-800">
                        {candidate.resumeFileName || `${candidate.name}_Resume`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                      {copiedLink ? (
                        <span className="text-[11px] text-emerald-700 font-bold">Link Copied!</span>
                      ) : (
                        <button
                          onClick={handleCopyLink}
                          className="text-[11px] text-[#0A3D91] hover:underline font-bold cursor-pointer"
                        >
                          Copy URL
                        </button>
                      )}
                      <a
                        href={rawUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-[#0A3D91] hover:underline font-bold"
                      >
                        <ExternalLink className="w-3 h-3" /> Open in New Tab
                      </a>
                    </div>
                  </div>

                  {/* Document Embedding - ONLY Real Uploaded Files */}
                  <div className="flex-1 w-full relative bg-slate-200 min-h-[520px]">
                    {isImage ? (
                      <div className="h-full flex items-center justify-center p-4 bg-slate-900/5 overflow-auto">
                        <img 
                          src={rawUrl} 
                          alt={`${candidate.name} Uploaded Resume Document`} 
                          className="max-h-[620px] max-w-full object-contain rounded-lg shadow-md bg-white"
                        />
                      </div>
                    ) : (
                      <iframe
                        src={getEmbedSrc()}
                        title={`Resume of ${candidate.name}`}
                        className="w-full h-full min-h-[550px] border-0 bg-white"
                      />
                    )}
                  </div>
                </div>
              ) : (
                /* When NO physical file is uploaded: ONLY show clean upload prompt and structured card, NEVER the web app! */
                <div className="w-full max-w-2xl bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center my-auto">
                  <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200">
                    <FileText className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-black text-[#0A3D91] mb-1">
                    No Resume File Uploaded Yet
                  </h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mb-6 leading-relaxed">
                    Only uploaded resume documents (PDF, DOC, DOCX, or Image) are previewed here. No resume attachment is linked to <strong>{candidate.name}</strong> currently.
                  </p>

                  {/* Immediate Upload Box */}
                  <div className="p-5 bg-blue-50/60 rounded-2xl border border-blue-100 max-w-lg mx-auto mb-6 text-center">
                    <div className="text-xs font-bold text-slate-800 mb-1">
                      Attach Resume File for {candidate.name}
                    </div>
                    <div className="text-[11px] text-slate-500 mb-3.5">
                      Supports PDF, DOCX, PNG, JPG (Saved securely to database)
                    </div>
                    <label className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0A3D91] hover:bg-[#083275] text-white text-xs font-extrabold cursor-pointer transition-all shadow-md">
                      <Upload className="w-4 h-4 text-[#D9A21B]" />
                      <span>{isUploading ? 'Uploading to Database...' : 'Choose Resume File to Upload'}</span>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        disabled={isUploading}
                        className="hidden"
                        onChange={handleInModalUpload}
                      />
                    </label>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setViewMode('profile')}
                      className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0A3D91] font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <User className="w-4 h-4 text-[#0A3D91]" />
                      <span>View Formatted Candidate CV Sheet</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Executive Structured Candidate Sheet (Printable format) */
            <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 sm:p-10 shadow-lg border border-slate-200 print:shadow-none print:border-0 print:p-0">
              {/* Header section with Sarthi Watermark */}
              <div className="flex items-center justify-between pb-6 border-b-2 border-slate-900/10 mb-6">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-[#0A3D91] tracking-tight">
                    {candidate.name}
                  </h2>
                  <div className="text-sm font-bold text-[#D9A21B] mt-0.5">
                    {candidate.targetRole || 'Industrial & Corporate Talent'}
                  </div>
                </div>
                <div className="text-right">
                  <SarthiLogo heightDesktop={40} heightMobile={32} />
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                    Verified Candidate Profile
                  </div>
                </div>
              </div>

              {/* Contact and Meta Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/80 mb-6 text-xs">
                {candidate.phone && (
                  <div className="flex items-center gap-2 text-slate-700">
                    <Phone className="w-3.5 h-3.5 text-[#0A3D91] shrink-0" />
                    <span className="font-semibold">{candidate.phone}</span>
                  </div>
                )}
                {candidate.email && (
                  <div className="flex items-center gap-2 text-slate-700">
                    <Mail className="w-3.5 h-3.5 text-[#0A3D91] shrink-0" />
                    <span className="truncate">{candidate.email}</span>
                  </div>
                )}
                {candidate.location && (
                  <div className="flex items-center gap-2 text-slate-700">
                    <MapPin className="w-3.5 h-3.5 text-[#0A3D91] shrink-0" />
                    <span>{candidate.location}</span>
                  </div>
                )}
                {candidate.experience && (
                  <div className="flex items-center gap-2 text-slate-700">
                    <Clock className="w-3.5 h-3.5 text-[#0A3D91] shrink-0" />
                    <span>Experience: <strong>{candidate.experience}</strong></span>
                  </div>
                )}
                {candidate.qualification && (
                  <div className="flex items-center gap-2 text-slate-700">
                    <GraduationCap className="w-3.5 h-3.5 text-[#0A3D91] shrink-0" />
                    <span>{candidate.qualification}</span>
                  </div>
                )}
                {candidate.currentCompany && (
                  <div className="flex items-center gap-2 text-slate-700">
                    <Building className="w-3.5 h-3.5 text-[#0A3D91] shrink-0" />
                    <span className="truncate">Org: {candidate.currentCompany}</span>
                  </div>
                )}
              </div>

              {/* Compensation & Availability Metrics */}
              {(candidate.currentCTC || candidate.expectedCTC || candidate.noticePeriod) && (
                <div className="mb-6">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-[#0A3D91]" /> Compensation & Availability
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-center">
                      <div className="text-[10px] text-slate-500 font-bold uppercase">Current CTC</div>
                      <div className="text-xs sm:text-sm font-black text-[#0A3D91] mt-0.5">
                        {candidate.currentCTC || 'Confidential'}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-center">
                      <div className="text-[10px] text-slate-500 font-bold uppercase">Expected CTC</div>
                      <div className="text-xs sm:text-sm font-black text-emerald-800 mt-0.5">
                        {candidate.expectedCTC || 'Negotiable'}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100 text-center">
                      <div className="text-[10px] text-slate-500 font-bold uppercase">Notice Period</div>
                      <div className="text-xs sm:text-sm font-black text-amber-900 mt-0.5">
                        {candidate.noticePeriod || 'Immediate'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Key Skills & Competencies */}
              {candidate.skills && candidate.skills.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-[#0A3D91]" /> Skills & Domain Expertise
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {candidate.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-bold border border-slate-200/80"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Recruiter Assessment Notes */}
              {candidate.notes && (
                <div className="mb-6 p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80">
                  <h4 className="text-xs font-black text-amber-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-700" /> Recruiter Assessment & Feedback
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed italic">
                    "{candidate.notes}"
                  </p>
                </div>
              )}

              {/* Footer Stamp */}
              <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-400">
                <div>
                  Sarthi Solutions • Gujarat & Silvassa Recruitment Hub
                </div>
                <div>
                  Placement Advisor: <strong>Raajesh V (+91 98243 22206)</strong>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Footer Bar */}
        <div className="px-5 py-3 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${hasValidFileUrl ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <span>{hasValidFileUrl ? 'Verified Resume Attached' : 'No File Attached'}</span>
            {candidate.resumeFileName && (
              <span className="font-mono text-[10px] text-slate-400 hidden sm:inline truncate max-w-xs">
                ({candidate.resumeFileName})
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {hasValidFileUrl ? (
              <button
                type="button"
                onClick={handleDownloadFile}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Resume File</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePrintCV}
                className="px-4 py-2 rounded-xl bg-[#0A3D91] hover:bg-[#083275] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Save CV Sheet</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
