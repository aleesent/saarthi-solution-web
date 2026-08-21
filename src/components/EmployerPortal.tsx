import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useData } from '../context/DataContext';
import { 
  Building2, 
  PlusCircle, 
  Users, 
  FileText, 
  PhoneCall, 
  CheckCircle2, 
  Send,
  Upload,
  Clock,
  MessageSquare,
  ShieldAlert
} from 'lucide-react';

export const EmployerPortal: React.FC = () => {
  const { addEmployerInquiry } = useData();
  const [activeTab, setActiveTab] = useState<'callback' | 'submit_jd' | 'candidates'>('callback');
  
  // Callback Form State
  const [callbackSuccess, setCallbackSuccess] = useState(false);
  const [callbackForm, setCallbackForm] = useState({
    companyName: '',
    contactPerson: '',
    phone: '',
    email: '',
    preferredTime: 'Immediately',
    hiringUrgency: 'Urgent (Within 48 Hours)',
    note: ''
  });

  // Submit JD State
  const [jdSuccess, setJdSuccess] = useState(false);
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [jdForm, setJdForm] = useState({
    jobTitle: '',
    industry: 'Manufacturing & Engineering',
    location: 'Surat, Gujarat',
    salaryOffered: '',
    experienceRequired: '3-5 Years',
    qualificationNeeded: 'Degree / Diploma',
    description: '',
    contactName: '',
    phone: ''
  });

  const handleCallbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addEmployerInquiry({
      companyName: callbackForm.companyName,
      contactPerson: callbackForm.contactPerson,
      phone: callbackForm.phone,
      email: callbackForm.email,
      preferredTime: callbackForm.preferredTime,
      hiringUrgency: callbackForm.hiringUrgency,
      note: callbackForm.note,
      status: 'New',
      type: 'Callback Request'
    });
    setCallbackSuccess(true);
    setTimeout(() => {
      setCallbackSuccess(false);
      setCallbackForm({
        companyName: '',
        contactPerson: '',
        phone: '',
        email: '',
        preferredTime: 'Immediately',
        hiringUrgency: 'Urgent (Within 48 Hours)',
        note: ''
      });
    }, 4000);
  };

  const handleJdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addEmployerInquiry({
      companyName: jdForm.contactName ? `${jdForm.contactName}'s Company` : 'Corporate Employer',
      contactPerson: jdForm.contactName || 'HR Lead',
      phone: jdForm.phone || '+91 98243 22206',
      email: 'hr@employer.com',
      preferredTime: 'Business Hours',
      hiringUrgency: 'Immediate Mandate',
      note: jdForm.description,
      status: 'New',
      type: 'Job Description Submission',
      jobDetails: {
        jobTitle: jdForm.jobTitle,
        industry: jdForm.industry,
        location: jdForm.location,
        salaryOffered: jdForm.salaryOffered || 'Negotiable',
        experienceRequired: jdForm.experienceRequired,
        qualificationNeeded: jdForm.qualificationNeeded
      }
    });
    setJdSuccess(true);
    setTimeout(() => {
      setJdSuccess(false);
      setJdFile(null);
      setJdForm({
        jobTitle: '',
        industry: 'Manufacturing & Engineering',
        location: 'Surat, Gujarat',
        salaryOffered: '',
        experienceRequired: '3-5 Years',
        qualificationNeeded: 'Degree / Diploma',
        description: '',
        contactName: '',
        phone: ''
      });
    }, 4000);
  };

  return (
    <div id="employers" className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Top Header Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#0A3D91] text-white rounded-3xl p-6 sm:p-8 mb-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#D9A21B] text-[#0A3D91] font-black text-2xl flex items-center justify-center shadow-lg border-2 border-white shrink-0">
            <Building2 className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">Employer Hiring Services</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-[#D9A21B] text-[#0A3D91] text-[10px] font-black uppercase">
                Sarthi Solutions
              </span>
            </div>
            <p className="text-xs text-blue-200 mt-1">
              Connect directly with Principal Consultant Raajesh V (+91 98243 22206) for rapid industrial headcount sourcing in Surat & Silvassa.
            </p>
          </div>
        </div>

        {/* Action Highlights */}
        <div className="flex items-center gap-2">
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
            <FileText className="w-4 h-4" /> Submit Job Description
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
        
        {/* TAB 1: Request A Call Back */}
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
                Fill out your company contact details below. Principal Consultant <strong>Raajesh V</strong> will call you back at your preferred time to discuss manpower deployment.
              </p>

              {callbackSuccess ? (
                <div className="p-8 rounded-3xl bg-blue-50 border border-blue-200 text-center text-[#0A3D91] my-4">
                  <CheckCircle2 className="w-12 h-12 text-[#0A3D91] mx-auto mb-3 animate-bounce" />
                  <h3 className="text-lg font-black">Call Back Request Confirmed!</h3>
                  <p className="text-xs text-slate-700 mt-1 max-w-md mx-auto leading-relaxed">
                    Thank you! Raajesh V (+91 98243 22206) will personally call you back at <strong>{callbackForm.preferredTime}</strong> regarding hiring for <strong>{callbackForm.companyName || 'your organization'}</strong>.
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
                      <label className="font-bold text-slate-700 block mb-1">Hiring Urgency</label>
                      <select
                        value={callbackForm.hiringUrgency}
                        onChange={(e) => setCallbackForm({ ...callbackForm, hiringUrgency: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none bg-white"
                      >
                        <option value="Urgent (Within 48 Hours)">Urgent (Within 48 Hours)</option>
                        <option value="Standard (1-2 Weeks)">Standard (1-2 Weeks)</option>
                        <option value="Executive Headhunting">Executive Headhunting</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Brief Hiring Requirements / Notes</label>
                    <textarea
                      rows={3}
                      placeholder="Mention designations needed (e.g. Assistant Factory Manager, Quality Engineers, Elevator Sales)..."
                      value={callbackForm.note}
                      onChange={(e) => setCallbackForm({ ...callbackForm, note: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full sm:w-auto bg-[#0A3D91] hover:bg-[#083275] text-white font-black text-xs sm:text-sm px-8 py-3.5 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <PhoneCall className="w-4 h-4 text-[#D9A21B]" /> Request Immediate Call Back
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
                    <span><strong>Replacement Guarantee:</strong> 90-day candidate warranty.</span>
                  </li>
                </ul>
              </div>
            </div>

          </motion.div>
        )}

        {/* TAB 2: Submit A Job Description */}
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
              Provide details or upload your existing Job Description document. We will immediately match candidates from our 10,000+ candidate pool.
            </p>

            {jdSuccess ? (
              <div className="p-8 rounded-3xl bg-blue-50 border border-blue-200 text-center text-[#0A3D91] my-4">
                <CheckCircle2 className="w-12 h-12 text-[#0A3D91] mx-auto mb-3 animate-bounce" />
                <h3 className="text-lg font-black">Job Description Received!</h3>
                <p className="text-xs text-slate-700 mt-1 max-w-md mx-auto leading-relaxed">
                  Thank you! Your vacancy for <strong>{jdForm.jobTitle || 'New Position'}</strong> has been submitted to Sarthi Solutions. Raajesh V will dispatch pre-screened candidate resumes to your contact within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleJdSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <label className="font-bold text-slate-700 block mb-1">Attach JD File (PDF, DOCX, PNG) - Optional</label>
                  <div className="border-2 border-dashed border-slate-300 hover:border-[#0A3D91] rounded-2xl p-6 text-center bg-slate-50/50 transition-colors cursor-pointer relative">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.png,.jpg"
                      onChange={(e) => setJdFile(e.target.files?.[0] || null)}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <Upload className="w-8 h-8 text-[#0A3D91] mx-auto mb-2" />
                    {jdFile ? (
                      <div className="text-xs font-bold text-[#0A3D91]">
                        Selected File: {jdFile.name} ({(jdFile.size / 1024).toFixed(1)} KB)
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500">
                        <span className="font-extrabold text-[#0A3D91]">Click to browse</span> or drag and drop your JD document here
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
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
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#0A3D91] hover:bg-[#083275] text-white font-black text-xs sm:text-sm py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4 text-[#D9A21B]" /> Submit Job Description To Sarthi Solutions
                </button>
              </form>
            )}
          </motion.div>
        )}

        {/* TAB 3: Candidate Search Database */}
        {activeTab === 'candidates' && (
          <motion.div 
            key="candidates"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md"
          >
            <h2 className="text-xl font-black text-[#0A3D91] mb-2">Vetted Candidates Pre-Screened Database</h2>
            <p className="text-xs text-slate-500 mb-6">Explore ready-to-interview talent across Gujarat and Silvassa industrial manufacturing hubs.</p>

            <div className="space-y-4">
              {[
                { name: 'Rakesh Patel', role: 'Assistant Factory Manager', exp: '9 Years Industrial', loc: 'Silvassa (D&NH)', qualification: 'BE Mechanical', status: 'Pre-Screened' },
                { name: 'Amit Shah', role: 'Sales Head (Elevator Components)', exp: '7 Years Elevator Mfg', loc: 'Surat, Gujarat', qualification: 'MBA Marketing', status: 'Available' },
                { name: 'Priya Joshi', role: 'Quality Control Executive', exp: '3.5 Years QA', loc: 'Surat, Gujarat', qualification: 'B.Sc Chemistry', status: 'Interview Ready' },
                { name: 'Vijay Kumar', role: 'AutoCAD Design Specialist', exp: '5 Years CAD', loc: 'Bhestan Udhna, Surat', qualification: 'Diploma Mechanical', status: 'Shortlisted' }
              ].map((cand, idx) => (
                <div key={idx} className="p-5 rounded-2xl border border-slate-100 bg-slate-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-shadow">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black text-slate-900">{cand.name}</h3>
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0A3D91] text-[10px] font-extrabold border border-blue-100">
                        {cand.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-700 font-semibold mt-1">{cand.role} • {cand.qualification}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Experience: {cand.exp} | Location Preference: {cand.loc}</div>
                  </div>

                  <button
                    onClick={() => alert(`Requesting full resume & contact details of ${cand.name} from Raajesh V (+91 98243 22206)...`)}
                    className="bg-[#0A3D91] text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-[#083275] shadow-sm whitespace-nowrap self-start sm:self-center cursor-pointer"
                  >
                    Request Candidate Profile
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
};
