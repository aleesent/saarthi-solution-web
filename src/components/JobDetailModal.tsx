import React, { useState } from 'react';
import { Job, ApplicationFormData } from '../types';
import { useData } from '../context/DataContext';
import { uploadFileToUnifiedStorage } from '../lib/storageService';
import { 
  X, 
  MapPin, 
  Briefcase, 
  IndianRupee, 
  GraduationCap, 
  Clock, 
  Users, 
  CheckCircle2, 
  PhoneCall, 
  MessageSquare, 
  Send, 
  Building2,
  Calendar,
  ShieldAlert,
  FileCheck2,
  Sparkles,
  Upload
} from 'lucide-react';

interface JobDetailModalProps {
  job: Job | null;
  onClose: () => void;
  onApplySuccess: () => void;
}

export const JobDetailModal: React.FC<JobDetailModalProps> = ({ job, onClose, onApplySuccess }) => {
  if (!job) return null;

  const { addApplication } = useData();
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<ApplicationFormData>({
    fullName: '',
    email: '',
    phone: '',
    whatsapp: '',
    experienceYears: job.experience,
    qualification: '',
    currentLocation: '',
    noticePeriod: '15 Days',
    currentCTC: '',
    expectedCTC: '',
    coverLetter: '',
    jobId: job.id,
    jobTitle: job.title
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    let uploadedUrl: string | undefined = undefined;
    let uploadedFileName: string | undefined = undefined;

    if (resumeFile) {
      try {
        const fileRecord = await uploadFileToUnifiedStorage(resumeFile, {
          fileName: resumeFile.name,
          relatedEntityType: 'application_resume',
          relatedEntityId: job.id,
          uploadedBy: formData.fullName,
          metadata: {
            jobId: job.id,
            jobTitle: job.title,
            candidateEmail: formData.email,
            candidatePhone: formData.phone
          }
        });
        uploadedUrl = fileRecord.google_drive_view_url || fileRecord.download_url || fileRecord.google_drive_url;
        uploadedFileName = fileRecord.original_file_name || resumeFile.name;
      } catch (err) {
        console.warn('Could not upload resume to unified cloud storage:', err);
      }
    }

    try {
      await addApplication({
        jobId: job.id,
        jobTitle: job.title,
        candidateName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        whatsapp: formData.whatsapp || formData.phone,
        experience: formData.experienceYears,
        currentLocation: formData.currentLocation || 'Gujarat',
        status: 'Pending Review',
        resumeUrl: uploadedUrl,
        resumeFileName: uploadedFileName
      });
    } catch (err) {
      console.error('Error submitting application:', err);
    }

    setIsSubmitting(false);
    setSubmitted(true);
    setTimeout(() => {
      onApplySuccess();
      onClose();
    }, 1800);
  };

  const handleWhatsAppApply = () => {
    const text = encodeURIComponent(
      `Hello Raajesh V (Sarthi Solutions),\n\nI am applying for position: *${job.title}*\nLocation: ${job.location}\nExperience: ${job.experience}\nCompany: ${job.companyName}\n\nPlease guide me on the next steps for my interview.`
    );
    window.open(`https://wa.me/919824322206?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full my-6 p-5 sm:p-8 shadow-2xl relative border border-gray-100 max-h-[92vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center transition-colors text-sm font-bold z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="border-b border-slate-100 pb-5 mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-[#D9A21B]/20 text-[#0A3D91] font-extrabold text-xs border border-[#D9A21B]/30">
              {job.category} Category
            </span>
            {job.isUrgent && (
              <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 font-extrabold text-xs animate-pulse">
                Urgent Vacancy
              </span>
            )}
            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-900 font-semibold text-xs border border-blue-100">
              Posted: {job.postedDate}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#0A3D91] leading-tight">
            {job.title}
          </h2>

          <div className="text-sm font-semibold text-slate-600 mt-1 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-[#D9A21B]" />
            <span>{job.companyName}</span>
          </div>
        </div>

        {/* Quick Info Grid Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div>
            <div className="text-[11px] text-slate-500 font-medium">Location</div>
            <div className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-blue-700 shrink-0" />
              <span>{job.location}</span>
            </div>
          </div>

          <div>
            <div className="text-[11px] text-slate-500 font-medium">Salary Package</div>
            <div className="text-xs sm:text-sm font-extrabold text-[#0A3D91] flex items-center gap-0.5 mt-0.5">
              <span>{job.salary}</span>
            </div>
          </div>

          <div>
            <div className="text-[11px] text-slate-500 font-medium">Experience Needed</div>
            <div className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1 mt-0.5">
              <Clock className="w-3.5 h-3.5 text-blue-700 shrink-0" />
              <span>{job.experience}</span>
            </div>
          </div>

          <div>
            <div className="text-[11px] text-slate-500 font-medium">Gender / Vacancies</div>
            <div className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1 mt-0.5">
              <Users className="w-3.5 h-3.5 text-blue-700 shrink-0" />
              <span>{job.genderPreference || 'Any'} ({job.vacancies || 1} Open)</span>
            </div>
          </div>
        </div>

        {/* Mandatory Warning Banner if elevator or freshers restriction */}
        {job.mandatoryIndustryExp && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-black text-amber-900 uppercase tracking-wider">Mandatory Client Requirements</h4>
              <p className="text-xs text-amber-800 font-medium mt-0.5">{job.mandatoryIndustryExp}</p>
              {job.workingHours && (
                <p className="text-xs text-amber-900 font-bold mt-1">Working Hours: {job.workingHours}</p>
              )}
            </div>
          </div>
        )}

        {/* Job Overview Description */}
        <div className="mb-6">
          <h3 className="text-sm font-extrabold text-[#0A3D91] uppercase tracking-wider mb-2">Job Description</h3>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-blue-50/40 p-4 rounded-2xl border border-blue-100/80">
            {job.description}
          </p>
        </div>

        {/* Specialized Skills Accordion/Cards for Assistant Factory Manager if applicable */}
        {job.hrComplianceSkills && (
          <div className="mb-6 space-y-4">
            <div className="p-4 rounded-2xl bg-[#0A3D91] text-white shadow-md">
              <h4 className="text-xs font-extrabold text-[#D9A21B] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4" /> HR Statutory & Compliance Expertise Required
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {job.hrComplianceSkills.map((skill, idx) => (
                  <span key={idx} className="bg-blue-900 text-blue-100 text-[11px] font-medium px-2.5 py-1 rounded-lg border border-blue-700">
                    ✓ {skill}
                  </span>
                ))}
              </div>
            </div>

            {job.plantOperationsKnowledge && (
              <div className="p-4 rounded-2xl bg-slate-900 text-white shadow-md">
                <h4 className="text-xs font-extrabold text-[#D9A21B] uppercase tracking-wider mb-2">
                  Plant & Supply Chain Operations
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {job.plantOperationsKnowledge.map((item, idx) => (
                    <span key={idx} className="bg-slate-800 text-slate-200 text-[11px] font-medium px-2.5 py-1 rounded-lg border border-slate-700">
                      • {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {job.commercialOpsKnowledge && (
              <div className="p-4 rounded-2xl bg-amber-900/10 border border-amber-200">
                <h4 className="text-xs font-extrabold text-amber-900 uppercase tracking-wider mb-2">
                  Commercial & Dispatch Operations
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {job.commercialOpsKnowledge.map((item, idx) => (
                    <span key={idx} className="bg-amber-100 text-amber-900 text-[11px] font-medium px-2.5 py-1 rounded-lg border border-amber-300">
                      + {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {job.preferredDepartmentKnowledge && (
              <div className="p-3.5 rounded-2xl bg-[#D9A21B]/15 border border-[#D9A21B]">
                <span className="text-xs font-black text-[#0A3D91] block">
                  ⭐ Special Preference: Experience in CGWA (Ground Water) & PCC (Pollution Control Committee) Department Work.
                </span>
              </div>
            )}
          </div>
        )}

        {/* Key Responsibilities */}
        <div className="mb-6">
          <h3 className="text-sm font-extrabold text-[#0A3D91] uppercase tracking-wider mb-2.5">Key Responsibilities</h3>
          <ul className="space-y-2">
            {job.keyResponsibilities.map((resp, index) => (
              <li key={index} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                <span>{resp}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Key Requirements */}
        <div className="mb-8">
          <h3 className="text-sm font-extrabold text-[#0A3D91] uppercase tracking-wider mb-2.5">Eligibility & Requirements</h3>
          <ul className="space-y-2">
            {job.keyRequirements.map((req, index) => (
              <li key={index} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                <div className="w-1.5 h-1.5 rounded-full bg-[#D9A21B] mt-2 shrink-0" />
                <span>{req}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recruiter Contact Bar */}
        <div className="bg-[#0A3D91] text-white p-4 rounded-2xl mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#D9A21B] text-[#0A3D91] font-extrabold flex items-center justify-center text-sm">
              RV
            </div>
            <div>
              <div className="text-xs text-[#D9A21B] font-semibold uppercase">Assigned Recruitment Officer</div>
              <div className="text-sm font-bold">{job.contactPerson} (Sarthi Solutions)</div>
              <div className="text-xs text-slate-200">Phone & WhatsApp: +91 98243 22206</div>
            </div>
          </div>

          <button
            onClick={handleWhatsAppApply}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" /> Send Resume on WhatsApp
          </button>
        </div>

        {/* Application Form Drawer / Switcher */}
        {!showApplyForm ? (
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={() => setShowApplyForm(true)}
              className="flex-1 bg-[#D9A21B] hover:bg-[#c49218] text-[#0A3D91] font-extrabold text-sm py-3.5 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" /> Apply Online Now
            </button>

            <button
              onClick={handleWhatsAppApply}
              className="flex-1 bg-[#0A3D91] hover:bg-[#083275] text-white font-bold text-sm py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <PhoneCall className="w-4 h-4 text-[#D9A21B]" /> Call / WhatsApp (+91 98243 22206)
            </button>
          </div>
        ) : (
          <div className="pt-4 border-t border-slate-200 animate-in fade-in duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-extrabold text-[#0A3D91]">Online Application Form</h3>
              <button
                onClick={() => setShowApplyForm(false)}
                className="text-xs text-slate-500 hover:text-slate-800 underline font-semibold cursor-pointer"
              >
                Back to Details
              </button>
            </div>

            {submitted ? (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center text-[#0A3D91]">
                <CheckCircle2 className="w-12 h-12 text-[#0A3D91] mx-auto mb-2 animate-bounce" />
                <h4 className="text-lg font-extrabold">Application Submitted Successfully!</h4>
                <p className="text-xs text-slate-700 mt-1">
                  Thank you, {formData.fullName}. Sarthi Solutions recruitment lead {job.contactPerson} will review your application and contact you shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitApplication} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      required
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="e.g. Rajesh Kumar"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0A3D91] outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="e.g. +91 9876543210"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0A3D91] outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">WhatsApp Number *</label>
                    <input
                      type="tel"
                      name="whatsapp"
                      required
                      value={formData.whatsapp}
                      onChange={handleInputChange}
                      placeholder="e.g. +91 9876543210"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0A3D91] outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="e.g. rajesh@gmail.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0A3D91] outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Total Experience (Years) *</label>
                    <input
                      type="text"
                      name="experienceYears"
                      required
                      value={formData.experienceYears}
                      onChange={handleInputChange}
                      placeholder="e.g. 8 Years"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0A3D91] outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Highest Qualification *</label>
                    <input
                      type="text"
                      name="qualification"
                      required
                      value={formData.qualification}
                      onChange={handleInputChange}
                      placeholder="e.g. BE Mechanical / BCom"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0A3D91] outline-none"
                    />
                  </div>
                </div>

                {/* Resume Upload Box */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Upload Resume (PDF/DOC) *</label>
                  <div className="border-2 border-dashed border-slate-300 hover:border-[#0A3D91] p-4 rounded-2xl bg-slate-50 text-center cursor-pointer relative transition-colors">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                    <span className="text-xs font-semibold text-slate-700 block">
                      {resumeFile ? resumeFile.name : 'Click or Drag & Drop Resume File Here'}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Supports PDF, DOC, DOCX up to 10MB</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-[#0A3D91] hover:bg-[#083275] text-white font-extrabold text-sm py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <span>Submitting Application...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-[#D9A21B]" />
                        <span>Submit Final Application</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
