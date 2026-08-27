import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useData } from '../context/DataContext';
import { Testimonial } from '../types';
import { uploadFileToUnifiedStorage } from '../lib/storageService';
import { 
  Star, 
  Quote, 
  CheckCircle2, 
  MessageSquare, 
  Send, 
  Building2, 
  User, 
  X, 
  RefreshCw, 
  Clock, 
  Calendar, 
  Sparkles, 
  ShieldCheck, 
  Check, 
  Upload, 
  Camera, 
  Image as ImageIcon, 
  Trash2,
  HardDrive
} from 'lucide-react';

export const TestimonialsSection: React.FC = () => {
  const { testimonials, addTestimonial } = useData();

  // Clean 3 Tabs: 'All' | 'Employer' | 'Candidate'
  const [activeTab, setActiveTab] = useState<'All' | 'Employer' | 'Candidate'>('All');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Form State - Review submission with optional PFP upload
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<'Employer' | 'Candidate' | 'Other'>('Employer');
  const [formRating, setFormRating] = useState<number>(5);
  const [formReview, setFormReview] = useState('');
  const [hoverRating, setHoverRating] = useState<number>(0);
  
  // PFP Upload State
  const [pfpFile, setPfpFile] = useState<File | null>(null);
  const [pfpPreview, setPfpPreview] = useState<string | null>(null);
  const [isUploadingPfp, setIsUploadingPfp] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePfpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image format
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPG, PNG, WEBP, etc.)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Image size exceeds 10MB limit. Please select a smaller photo.');
      return;
    }

    setPfpFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPfpPreview(objectUrl);
  };

  const handleRemovePfp = () => {
    setPfpFile(null);
    if (pfpPreview) {
      URL.revokeObjectURL(pfpPreview);
    }
    setPfpPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatReviewDate = (t: Testimonial) => {
    if (t.date) {
      if (t.date.includes('-') && !isNaN(Date.parse(t.date))) {
        return new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      }
      return t.date;
    }
    const raw = t.createdAt || t.created_at;
    if (raw && !isNaN(Date.parse(raw))) {
      return new Date(raw).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    }
    return 'Recent Review';
  };

  const getCategoryLabel = (type?: string) => {
    if (!type) return 'Placed Candidate';
    const lower = type.toLowerCase();
    if (lower.includes('employer') || lower.includes('client')) return 'Employer / Client';
    if (lower.includes('candidate') || lower.includes('placed')) return 'Placed Candidate';
    return 'Other / Client';
  };

  const getCategoryBadgeClass = (type?: string) => {
    const lower = (type || '').toLowerCase();
    if (lower.includes('employer') || lower.includes('client')) {
      return 'bg-blue-50 text-[#0A3D91] border-blue-200';
    }
    if (lower.includes('candidate') || lower.includes('placed')) {
      return 'bg-amber-50 text-amber-900 border-amber-200';
    }
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  // Only approved reviews should become visible on the public website
  const approvedTestimonials = testimonials.filter((t) => {
    // If status is explicitly rejected or pending, hide it
    if (t.status === 'rejected' || t.status === 'pending') return false;
    if (t.is_approved === false) return false;
    // Approved or legacy default reviews
    return t.status === 'approved' || t.is_approved === true || (!t.status && t.is_approved !== false);
  });

  // Filter based on active tab
  const filteredTestimonials = approvedTestimonials.filter((t) => {
    if (activeTab === 'All') return true;
    const lower = (t.type || '').toLowerCase();
    if (activeTab === 'Employer') {
      return lower.includes('employer') || lower.includes('client');
    }
    if (activeTab === 'Candidate') {
      return lower.includes('candidate') || lower.includes('placed');
    }
    return true;
  });

  const employerCount = approvedTestimonials.filter((t) => {
    const lower = (t.type || '').toLowerCase();
    return lower.includes('employer') || lower.includes('client');
  }).length;

  const candidateCount = approvedTestimonials.filter((t) => {
    const lower = (t.type || '').toLowerCase();
    return lower.includes('candidate') || lower.includes('placed');
  }).length;

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formReview.trim()) return;

    setIsSubmitting(true);
    const newId = `review-${Date.now()}`;
    const todayFormatted = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

    try {
      let uploadedDriveFileId: string | undefined = undefined;
      let uploadedImageUrl: string | undefined = undefined;
      let uploadedDriveUrl: string | undefined = undefined;

      // 1. If user uploaded a profile picture (PFP), store it to Google Drive and Supabase storage
      if (pfpFile) {
        setIsUploadingPfp(true);
        try {
          const cleanName = formName.trim().replace(/[^a-zA-Z0-9]/g, '_');
          const ext = pfpFile.name.split('.').pop() || 'jpg';
          const uploadResult = await uploadFileToUnifiedStorage(pfpFile, {
            fileName: `pfp_${cleanName}_${Date.now()}.${ext}`,
            relatedEntityType: 'testimonial_avatar',
            relatedEntityId: formName.trim(),
            uploadedBy: formName.trim(),
            customFolder: 'Testimonial PFPs'
          });

          uploadedDriveFileId = uploadResult.google_drive_file_id || uploadResult.id;
          uploadedDriveUrl = uploadResult.google_drive_url || uploadResult.download_url;
          uploadedImageUrl = uploadResult.google_drive_view_url || uploadResult.download_url || uploadResult.thumbnail_url || (uploadResult.storage_path ? uploadResult.download_url : undefined);
        } catch (uploadErr: any) {
          console.warn('[Testimonials] PFP upload to Drive warning:', uploadErr.message);
          // Graceful fallback to preview blob/data if network glitch
          uploadedImageUrl = pfpPreview || undefined;
        } finally {
          setIsUploadingPfp(false);
        }
      }

      const newReview: Testimonial = {
        id: newId,
        name: formName.trim(),
        role: formCategory === 'Employer' ? 'Client / Employer' : formCategory === 'Candidate' ? 'Placed Professional' : 'Client Feedback',
        company: formCategory === 'Employer' ? 'Partner Enterprise' : 'Industrial Candidate',
        location: 'Gujarat',
        rating: Number(formRating) || 5,
        type: formCategory,
        content: formReview.trim(),
        avatar: uploadedImageUrl,
        image: uploadedImageUrl,
        drive_file_id: uploadedDriveFileId,
        driveFileId: uploadedDriveFileId,
        drive_url: uploadedDriveUrl,
        driveUrl: uploadedDriveUrl,
        date: todayFormatted,
        status: 'pending', // Initially Pending
        is_approved: false, // Hidden from public until Admin approves
        submittedBy: 'Public Visitor',
        createdAt: new Date().toISOString()
      };

      // Save to Supabase backend & Firestore with initial Pending status
      await addTestimonial(newReview);

      // Close modal & reset form
      setShowReviewModal(false);
      setFormName('');
      setFormCategory('Employer');
      setFormRating(5);
      setFormReview('');
      handleRemovePfp();

      // Show friendly confirmation
      setSuccessBanner(
        `Thank you, ${formName.trim()}! Your review${uploadedImageUrl ? ' and profile photo' : ''} has been saved to the database and sent for admin approval.`
      );

      setTimeout(() => {
        setSuccessBanner(null);
      }, 7000);
    } catch (err: any) {
      alert(`Submission error: ${err.message || 'Please try again'}`);
    } finally {
      setIsSubmitting(false);
      setIsUploadingPfp(false);
    }
  };

  return (
    <section id="testimonials" className="py-12 sm:py-20 bg-slate-50/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="text-xs font-bold text-[#0A3D91] uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
            <span className="w-4 h-0.5 bg-[#D9A21B]" />
            <span>Verified Reviews & Experiences</span>
            <span className="w-4 h-0.5 bg-[#D9A21B]" />
          </div>
          
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#0B192C] tracking-tight">
            What Our Employers & <span className="text-[#D9A21B]">Candidates Say</span>
          </h2>
          
          <p className="text-slate-600 text-xs sm:text-sm mt-2 font-normal">
            Real feedback from recruitment partners, plant managers, and placed job seekers across Gujarat.
          </p>

          {/* Clearly Visible Write A Review Button */}
          <div className="mt-6 flex justify-center">
            <button
              id="btn-write-review-hero"
              onClick={() => setShowReviewModal(true)}
              className="bg-[#0A3D91] hover:bg-[#083275] text-white font-extrabold text-xs sm:text-sm px-6 py-3.5 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2.5 cursor-pointer transform active:scale-95 group border border-blue-800"
            >
              <MessageSquare className="w-4 h-4 text-[#D9A21B] group-hover:scale-110 transition-transform" />
              <span>Write A Review</span>
              <Sparkles className="w-3.5 h-3.5 text-[#D9A21B]" />
            </button>
          </div>
        </div>

        {/* Success Confirmation Toast Banner */}
        <AnimatePresence>
          {successBanner && (
            <motion.div
              initial={{ opacity: 0, y: -15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.95 }}
              className="bg-blue-900 text-white p-4 sm:p-5 rounded-3xl shadow-xl mb-8 max-w-2xl mx-auto flex items-start justify-between gap-4 border border-blue-700"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-400/20 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-6 h-6 text-[#D9A21B]" />
                </div>
                <div>
                  <h4 className="text-sm font-black flex items-center gap-1.5 text-white">
                    <span>Review Submitted Successfully</span>
                    <Clock className="w-4 h-4 text-amber-300" />
                  </h4>
                  <p className="text-xs text-blue-100 mt-1 leading-relaxed">
                    {successBanner}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSuccessBanner(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Clean Tabs: All Reviews | Employers / Clients | Placed Candidates */}
        <div className="flex items-center justify-center gap-2.5 mb-10 overflow-x-auto pb-1">
          <button
            id="tab-all-reviews"
            onClick={() => setActiveTab('All')}
            className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'All'
                ? 'bg-[#0A3D91] text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 shadow-2xs'
            }`}
          >
            <span>All Reviews</span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${activeTab === 'All' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'}`}>
              {approvedTestimonials.length}
            </span>
          </button>

          <button
            id="tab-employer-reviews"
            onClick={() => setActiveTab('Employer')}
            className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'Employer'
                ? 'bg-[#0A3D91] text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 shadow-2xs'
            }`}
          >
            <Building2 className={`w-4 h-4 ${activeTab === 'Employer' ? 'text-[#D9A21B]' : 'text-slate-500'}`} />
            <span>Employers / Clients</span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${activeTab === 'Employer' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'}`}>
              {employerCount}
            </span>
          </button>

          <button
            id="tab-candidate-reviews"
            onClick={() => setActiveTab('Candidate')}
            className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'Candidate'
                ? 'bg-[#0A3D91] text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 shadow-2xs'
            }`}
          >
            <User className={`w-4 h-4 ${activeTab === 'Candidate' ? 'text-[#D9A21B]' : 'text-slate-500'}`} />
            <span>Placed Candidates</span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${activeTab === 'Candidate' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'}`}>
              {candidateCount}
            </span>
          </button>
        </div>

        {/* Review Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTestimonials.length === 0 ? (
            <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
              <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-extrabold text-slate-800">No reviews in this category yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Be the first to share your feedback about Sarthi Solutions recruitment and placement services.
              </p>
              <button
                onClick={() => setShowReviewModal(true)}
                className="mt-4 px-5 py-2.5 bg-[#0A3D91] hover:bg-[#083275] text-white text-xs font-bold rounded-xl cursor-pointer shadow-sm transition-all"
              >
                Write A Review
              </button>
            </div>
          ) : (
            filteredTestimonials.map((t, idx) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: Math.min(idx * 0.05, 0.3) }}
                className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative group"
              >
                <Quote className="w-7 h-7 text-[#D9A21B]/20 absolute top-6 right-6 pointer-events-none" />

                <div>
                  {/* Card Header: Category Badge + Date */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${getCategoryBadgeClass(t.type)}`}>
                      {getCategoryLabel(t.type)}
                    </span>

                    <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{formatReviewDate(t)}</span>
                    </span>
                  </div>

                  {/* Star Rating */}
                  <div className="flex items-center gap-1 mb-3">
                    <div className="flex text-[#D9A21B]">
                      {Array.from({ length: Number(t.rating) || 5 }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-[#D9A21B] text-[#D9A21B]" />
                      ))}
                    </div>
                    <span className="text-[11px] font-black text-slate-700 ml-1.5">
                      {(Number(t.rating) || 5).toFixed(1)}
                    </span>
                  </div>

                  {/* Review Text */}
                  <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed mb-6 font-normal">
                    "{t.content}"
                  </p>
                </div>

                {/* Reviewer Name */}
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-[#D9A21B]/40 flex items-center justify-center font-black text-[#0A3D91] text-xs shrink-0 overflow-hidden shadow-2xs">
                    {t.image || t.avatar ? (
                      <img 
                        src={t.image || t.avatar} 
                        alt={t.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <span className="font-extrabold text-sm text-[#0A3D91]">
                        {t.name ? t.name.charAt(0).toUpperCase() : 'U'}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 truncate flex items-center gap-1">
                      <span className="truncate">{t.name}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    </h4>
                    <p className="text-[11px] text-slate-500 truncate">
                      {getCategoryLabel(t.type)}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

      </div>

      {/* Write A Review Modal - Simple, Direct, No Restrictions */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative border border-slate-200 max-h-[90vh] overflow-y-auto">
            
            {/* Close Button */}
            <button
              onClick={() => setShowReviewModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Title */}
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-[#0A3D91]">
                  Write A Review
                </h3>
                <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-amber-700" /> Admin Moderated
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Share your experience with Sarthi Solutions. Your review will be reviewed by admin before appearing live.
              </p>
            </div>

            {/* Direct Form */}
            <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
              
              {/* 1. Name */}
              <div>
                <label className="font-bold text-slate-800 block mb-1.5">
                  Your Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ketan Shah / Priya Sharma"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none text-slate-900 bg-white"
                />
              </div>

              {/* 2. Profile Photo (PFP) Upload (Optional) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-800 flex items-center gap-1.5">
                    <span>Profile Photo (PFP)</span>
                    <span className="text-[11px] font-normal text-slate-500">(Optional)</span>
                  </label>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                    <HardDrive className="w-3 h-3 text-emerald-600" /> Saved to Drive & DB
                  </span>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePfpChange}
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  className="hidden"
                />

                {pfpPreview ? (
                  <div className="flex items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#D9A21B] shrink-0 bg-white shadow-2xs">
                        <img 
                          src={pfpPreview} 
                          alt="PFP Preview" 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-800 truncate">
                          {pfpFile?.name || 'Uploaded Photo'}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {pfpFile ? `${(pfpFile.size / 1024).toFixed(0)} KB • Ready to upload` : 'Profile image selected'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-2.5 py-1.5 text-[11px] font-bold text-[#0A3D91] hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={handleRemovePfp}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                        title="Remove photo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-[#0A3D91] rounded-2xl p-3.5 text-center cursor-pointer transition-all bg-slate-50 hover:bg-blue-50/40 group"
                  >
                    <div className="flex items-center justify-center gap-2 text-slate-600 group-hover:text-[#0A3D91]">
                      <Camera className="w-4 h-4 text-[#D9A21B]" />
                      <span className="font-bold text-xs">Click to upload your profile picture</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Supports JPG, PNG, WEBP (Max 10MB) • Stored securely in Google Drive
                    </p>
                  </div>
                )}
              </div>

              {/* 3. Category: Employer / Client / Placed Candidate / Other */}
              <div>
                <label className="font-bold text-slate-800 block mb-1.5">
                  Category <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormCategory('Employer')}
                    className={`py-2.5 px-2 rounded-xl text-center font-bold text-xs transition-all cursor-pointer border ${
                      formCategory === 'Employer'
                        ? 'bg-[#0A3D91] text-white border-[#0A3D91] shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Employer / Client
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormCategory('Candidate')}
                    className={`py-2.5 px-2 rounded-xl text-center font-bold text-xs transition-all cursor-pointer border ${
                      formCategory === 'Candidate'
                        ? 'bg-[#0A3D91] text-white border-[#0A3D91] shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Placed Candidate
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormCategory('Other')}
                    className={`py-2.5 px-2 rounded-xl text-center font-bold text-xs transition-all cursor-pointer border ${
                      formCategory === 'Other'
                        ? 'bg-[#0A3D91] text-white border-[#0A3D91] shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Other
                  </button>
                </div>
              </div>

              {/* 3. Star Rating */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-800">
                    Star Rating <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] font-black text-[#0A3D91]">
                    {formRating} of 5 Stars
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setFormRating(star)}
                      className="p-1 hover:scale-110 transition-transform cursor-pointer"
                      title={`${star} Star${star > 1 ? 's' : ''}`}
                    >
                      <Star 
                        className={`w-7 h-7 ${
                          star <= (hoverRating || formRating)
                            ? 'fill-[#D9A21B] text-[#D9A21B]'
                            : 'text-slate-300'
                        }`} 
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Review / Feedback */}
              <div>
                <label className="font-bold text-slate-800 block mb-1.5">
                  Review / Feedback <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Share your experience with Sarthi Solutions recruitment, hiring quality, response time, or placement support..."
                  value={formReview}
                  onChange={(e) => setFormReview(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none text-slate-900 bg-white leading-relaxed"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  disabled={isSubmitting}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold cursor-pointer transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-2 bg-[#0A3D91] hover:bg-[#083275] text-white py-3 rounded-xl font-extrabold cursor-pointer transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-[#D9A21B]" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-[#D9A21B]" />
                      <span>Submit Review</span>
                    </>
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </section>
  );
};
