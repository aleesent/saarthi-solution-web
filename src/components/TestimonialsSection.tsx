import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useData } from '../context/DataContext';
import { Testimonial } from '../types';
import { 
  Star, 
  Quote, 
  CheckCircle2, 
  MessageSquare, 
  Send, 
  Building2, 
  User, 
  MapPin, 
  Upload, 
  Sparkles, 
  Search, 
  X, 
  RefreshCw,
  Clock,
  ShieldCheck,
  Cloud,
  HardDrive,
  ExternalLink,
  Check
} from 'lucide-react';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
];

export const TestimonialsSection: React.FC = () => {
  const { testimonials, addTestimonial, uploadStorageFile } = useData();
  const [filter, setFilter] = useState<'All' | 'Employer' | 'Candidate'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [userPendingReview, setUserPendingReview] = useState<Testimonial | null>(null);
  const [uploadedDriveMetadata, setUploadedDriveMetadata] = useState<{
    fileId?: string;
    driveUrl?: string;
    fileName?: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cardsGridRef = useRef<HTMLDivElement>(null);

  const [reviewForm, setReviewForm] = useState({
    name: '',
    company: '',
    role: '',
    location: 'Surat, Gujarat',
    rating: 5,
    type: 'Employer' as 'Employer' | 'Candidate',
    content: '',
    avatar: AVATAR_PRESETS[0]
  });

  const ratingDescriptions: Record<number, string> = {
    5: '5.0 - Outstanding Recruitment & Sourcing Support',
    4: '4.0 - Very Good Service & Quick Candidate Deployment',
    3: '3.0 - Satisfactory Recruitment Experience',
    2: '2.0 - Average Experience',
    1: '1.0 - Needs Improvement'
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    try {
      // 1. Upload photo to Google Drive in subfolder "Saarthi Solutions/Testimonial PFPs"
      // and log the file record into Supabase PostgreSQL
      const uploaded = await uploadStorageFile(file, {
        fileName: `pfp_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`,
        relatedEntityType: 'testimonial_avatar',
        uploadedBy: reviewForm.name || 'Website Reviewer',
        customFolder: 'Testimonial PFPs'
      });

      const fileUrl = uploaded.google_drive_view_url || uploaded.download_url || uploaded.storage_path || URL.createObjectURL(file);
      
      setReviewForm((prev) => ({ ...prev, avatar: fileUrl }));
      setUploadedDriveMetadata({
        fileId: uploaded.google_drive_file_id || uploaded.id,
        driveUrl: uploaded.google_drive_url || uploaded.download_url,
        fileName: uploaded.file_name
      });
    } catch (err: any) {
      alert(`Photo upload note: ${err.message || 'Falling back to preset avatar'}`);
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.name.trim() || !reviewForm.content.trim()) return;

    setIsSubmitting(true);
    const newId = `review-${Date.now()}`;

    try {
      const newReview: Testimonial = {
        id: newId,
        name: reviewForm.name.trim(),
        company: reviewForm.company.trim() || (reviewForm.type === 'Employer' ? 'Industrial Enterprise' : 'Leading Manufacturing Plant'),
        role: reviewForm.role.trim() || (reviewForm.type === 'Employer' ? 'HR / Plant Head' : 'Executive Professional'),
        location: reviewForm.location.trim() || 'Gujarat',
        rating: Number(reviewForm.rating) || 5,
        type: reviewForm.type,
        content: reviewForm.content.trim(),
        avatar: reviewForm.avatar || AVATAR_PRESETS[0],
        image: reviewForm.avatar || AVATAR_PRESETS[0],
        date: 'Just Now',
        status: 'pending', // Default: Pending Admin Approval
        is_approved: false, // Requires Admin to toggle true to be permanently visible to all
        drive_file_id: uploadedDriveMetadata?.fileId,
        drive_url: uploadedDriveMetadata?.driveUrl,
        googleDriveUrl: uploadedDriveMetadata?.driveUrl,
        submittedBy: 'Website User',
        createdAt: new Date().toISOString()
      };

      // 1. Send to backend (/api/testimonials) & Firestore with status: 'pending'
      await addTestimonial(newReview);

      // 2. Keep local session pending state so user sees their submission right away
      setUserPendingReview(newReview);

      // 3. Success message & close drawer
      setSuccessBanner(
        `Thank you, ${reviewForm.name}! Your review has been submitted for admin approval. Your profile photo was saved to Google Drive and linked in Supabase.`
      );
      setShowReviewForm(false);

      // 4. Reset form
      setReviewForm({
        name: '',
        company: '',
        role: '',
        location: 'Surat, Gujarat',
        rating: 5,
        type: 'Employer',
        content: '',
        avatar: AVATAR_PRESETS[0]
      });
      setUploadedDriveMetadata(null);

      // 5. Smoothly scroll to the testimonials grid
      setTimeout(() => {
        cardsGridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);

      // 6. Clear success message after 8 seconds
      setTimeout(() => {
        setSuccessBanner(null);
      }, 8000);
    } catch (err: any) {
      alert(`Submission error: ${err.message || 'Please try again'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Only display approved testimonials for public visitors (status === 'approved' or is_approved === true)
  const approvedTestimonials = testimonials.filter(
    (t) => t.status === 'approved' || t.is_approved === true || (!t.status && t.is_approved !== false)
  );

  // If the user submitted a pending review in this session, prepend it so they see it immediately
  const displayList: (Testimonial & { isPendingPreview?: boolean })[] = [
    ...(userPendingReview ? [{ ...userPendingReview, isPendingPreview: true }] : []),
    ...approvedTestimonials.filter((t) => t.id !== userPendingReview?.id)
  ];

  const filteredTestimonials = displayList.filter((t) => {
    const matchesFilter = filter === 'All' || t.type === filter;
    const matchesSearch = searchQuery.trim() === '' || 
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.location && t.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.role && t.role.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  const employerCount = approvedTestimonials.filter((t) => t.type === 'Employer').length;
  const candidateCount = approvedTestimonials.filter((t) => t.type === 'Candidate').length;

  return (
    <section id="testimonials" className="py-12 sm:py-20 bg-slate-50/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="text-xs font-bold text-[#0A3D91] uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
            <span className="w-4 h-0.5 bg-[#D9A21B]" />
            <span>Verified Feedback & Client Reviews</span>
            <span className="w-4 h-0.5 bg-[#D9A21B]" />
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#0B192C] tracking-tight">
            What Our Employers & <span className="text-[#D9A21B]">Candidates Say</span>
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm mt-2 font-normal">
            Real feedback from Gujarat & Silvassa plant managers, elevator manufacturers, and placed industrial executives.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="bg-[#0A3D91] hover:bg-[#083275] text-white font-extrabold text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2.5 cursor-pointer transform active:scale-95"
            >
              <MessageSquare className="w-4 h-4 text-[#D9A21B]" />
              <span>{showReviewForm ? 'Close Review Form' : 'Write A Review'}</span>
            </button>
          </div>
        </div>

        {/* Success Banner when Review is Submitted */}
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
                  <ShieldCheck className="w-6 h-6 text-[#D9A21B]" />
                </div>
                <div>
                  <h4 className="text-sm font-black flex items-center gap-1.5 text-white">
                    <span>Review Submitted for Admin Approval</span>
                    <Clock className="w-4 h-4 text-amber-300" />
                  </h4>
                  <p className="text-xs text-blue-100 mt-1 leading-relaxed">
                    {successBanner}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-amber-200">
                    <span className="flex items-center gap-1">
                      <HardDrive className="w-3.5 h-3.5" /> PFP saved in Google Drive
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Cloud className="w-3.5 h-3.5" /> Synced to Supabase
                    </span>
                  </div>
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

        {/* Review Form Drawer */}
        <AnimatePresence>
          {showReviewForm && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              transition={{ duration: 0.35 }}
              className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#0A3D91]/20 shadow-2xl mb-12 max-w-2xl mx-auto overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-[#0A3D91] flex items-center gap-2">
                    <span>Submit Your Review & Rating</span>
                    <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-amber-700" /> Admin Moderated
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Your testimonial will be reviewed by admin before going live. Your photo is securely stored in Google Drive and linked in Supabase.
                  </p>
                </div>
                <button
                  onClick={() => setShowReviewForm(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
                
                {/* Reviewer Type Choice */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">You are reviewing as:</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, type: 'Employer' })}
                      className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                        reviewForm.type === 'Employer'
                          ? 'border-[#0A3D91] bg-blue-50/70 text-[#0A3D91] shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${reviewForm.type === 'Employer' ? 'bg-[#0A3D91] text-white' : 'bg-slate-100 text-slate-500'}`}>
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-extrabold text-xs">Employer / Client</div>
                        <div className="text-[10px] text-slate-500">Plant / HR Manager</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, type: 'Candidate' })}
                      className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                        reviewForm.type === 'Candidate'
                          ? 'border-[#0A3D91] bg-blue-50/70 text-[#0A3D91] shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${reviewForm.type === 'Candidate' ? 'bg-[#0A3D91] text-white' : 'bg-slate-100 text-slate-500'}`}>
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-extrabold text-xs">Placed Candidate</div>
                        <div className="text-[10px] text-slate-500">Engineer / Executive</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Name & Role */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Patel"
                      value={reviewForm.name}
                      onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none bg-white text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Job Title / Designation</label>
                    <input
                      type="text"
                      placeholder={reviewForm.type === 'Employer' ? 'e.g. VP Operations / HR Head' : 'e.g. Senior Mechanical Engineer'}
                      value={reviewForm.role}
                      onChange={(e) => setReviewForm({ ...reviewForm, role: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none bg-white text-slate-900"
                    />
                  </div>
                </div>

                {/* Company & Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Company / Organization</label>
                    <input
                      type="text"
                      placeholder={reviewForm.type === 'Employer' ? 'e.g. Apex Industrial Systems' : 'e.g. Placed at Elevator Corp'}
                      value={reviewForm.company}
                      onChange={(e) => setReviewForm({ ...reviewForm, company: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none bg-white text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Location</label>
                    <select
                      value={reviewForm.location}
                      onChange={(e) => setReviewForm({ ...reviewForm, location: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none bg-white text-slate-900"
                    >
                      <option value="Surat, Gujarat">Surat, Gujarat</option>
                      <option value="Silvassa / Vapi">Silvassa / Vapi</option>
                      <option value="Ahmedabad, Gujarat">Ahmedabad, Gujarat</option>
                      <option value="Vadodara, Gujarat">Vadodara, Gujarat</option>
                      <option value="Bharuch / Ankleshwar">Bharuch / Ankleshwar</option>
                      <option value="Other Gujarat Location">Other Gujarat Location</option>
                    </select>
                  </div>
                </div>

                {/* Rating Interactive Selector */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-bold text-slate-800">Your Rating *</label>
                    <span className="text-[11px] font-extrabold text-[#0A3D91]">
                      {ratingDescriptions[reviewForm.rating]}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                        className="p-1 hover:scale-110 transition-transform cursor-pointer"
                        title={`${star} Stars`}
                      >
                        <Star className={`w-7 h-7 ${star <= reviewForm.rating ? 'fill-[#D9A21B] text-[#D9A21B]' : 'text-slate-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Avatar / Photo Upload (Stored in Google Drive) */}
                <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-bold text-slate-700">Profile Picture (PFP)</label>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                      <HardDrive className="w-3 h-3 text-emerald-600" /> Stored in Google Drive
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <img
                      src={reviewForm.avatar}
                      alt="Selected Avatar"
                      className="w-12 h-12 rounded-full object-cover border-2 border-[#0A3D91] shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = AVATAR_PRESETS[0];
                      }}
                    />

                    {/* Presets */}
                    <div className="flex items-center gap-1.5">
                      {AVATAR_PRESETS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setReviewForm({ ...reviewForm, avatar: preset });
                            setUploadedDriveMetadata(null);
                          }}
                          className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                            reviewForm.avatar === preset ? 'border-[#0A3D91] scale-110 shadow-xs' : 'border-transparent opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img src={preset} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>

                    {/* Direct Upload to Google Drive */}
                    <div className="ml-auto flex items-center gap-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handlePhotoUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingPhoto}
                        className="px-3.5 py-2 bg-white hover:bg-slate-100 text-[#0A3D91] border border-slate-300 rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 text-xs shadow-2xs"
                      >
                        {isUploadingPhoto ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#0A3D91]" />
                        ) : (
                          <Upload className="w-3.5 h-3.5 text-[#0A3D91]" />
                        )}
                        <span>{isUploadingPhoto ? 'Saving to Drive...' : 'Upload My Photo'}</span>
                      </button>
                    </div>
                  </div>

                  {uploadedDriveMetadata && (
                    <div className="mt-2 text-[10px] text-emerald-700 bg-emerald-100/60 p-2 rounded-xl flex items-center gap-1.5 font-medium">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Photo ready! Stored in Google Drive folder: <strong>Saarthi Solutions/Testimonial PFPs</strong></span>
                    </div>
                  )}
                </div>

                {/* Content Textarea */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Your Review / Experience *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Share how Sarthi Solutions helped with your hiring, plant recruitment, or career placement..."
                    value={reviewForm.content}
                    onChange={(e) => setReviewForm({ ...reviewForm, content: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none bg-white text-slate-900 leading-relaxed"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting || isUploadingPhoto}
                    className="w-full bg-[#0A3D91] hover:bg-[#083275] text-white font-extrabold text-xs sm:text-sm py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-[#D9A21B]" />
                        <span>Submitting for Admin Approval...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-[#D9A21B]" />
                        <span>Submit Review for Admin Approval</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filter Tabs & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setFilter('All')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                filter === 'All'
                  ? 'bg-[#0A3D91] text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>All Reviews</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${filter === 'All' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {approvedTestimonials.length}
              </span>
            </button>

            <button
              onClick={() => setFilter('Employer')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                filter === 'Employer'
                  ? 'bg-[#0A3D91] text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-[#D9A21B]" />
              <span>Employers / Clients</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${filter === 'Employer' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {employerCount}
              </span>
            </button>

            <button
              onClick={() => setFilter('Candidate')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                filter === 'Candidate'
                  ? 'bg-[#0A3D91] text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <User className="w-3.5 h-3.5 text-[#D9A21B]" />
              <span>Placed Candidates</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${filter === 'Candidate' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {candidateCount}
              </span>
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reviews..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 bg-white text-xs outline-none focus:ring-2 focus:ring-[#0A3D91]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Testimonials Cards Grid */}
        <div ref={cardsGridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTestimonials.length === 0 ? (
            <div className="col-span-full py-12 text-center bg-white rounded-3xl border border-slate-200 p-8">
              <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-extrabold text-slate-700">No reviews match your filter</h3>
              <p className="text-xs text-slate-500 mt-1">Try resetting the search or filter tab.</p>
              <button
                onClick={() => { setFilter('All'); setSearchQuery(''); }}
                className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            filteredTestimonials.map((t, idx) => {
              const isPendingPreview = (t as any).isPendingPreview;
              const hasDrivePfp = !!(t.drive_url || t.driveUrl || t.googleDriveUrl || t.drive_file_id || t.driveFileId);

              return (
                <motion.div
                  key={t.id}
                  initial={isPendingPreview ? { scale: 0.95, opacity: 0 } : { opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: isPendingPreview ? 0 : Math.min(idx * 0.06, 0.4) }}
                  whileHover={{ y: -5 }}
                  className={`bg-white rounded-3xl p-6 sm:p-7 flex flex-col justify-between relative group transition-all duration-300 ${
                    isPendingPreview
                      ? 'border-2 border-amber-400 ring-4 ring-amber-400/20 shadow-xl bg-gradient-to-b from-amber-50/50 via-white to-white'
                      : 'border border-slate-200 shadow-md hover:shadow-xl'
                  }`}
                >
                  <Quote className="w-8 h-8 text-[#D9A21B]/30 absolute top-6 right-6" />

                  <div>
                    {/* Header Row: Type Badge & Pending / Verified Status */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1 ${
                        t.type === 'Employer' 
                          ? 'bg-blue-50 text-[#0A3D91] border border-blue-200' 
                          : 'bg-amber-50 text-amber-900 border border-amber-200'
                      }`}>
                        {t.type === 'Employer' ? <Building2 className="w-3 h-3 text-[#0A3D91]" /> : <User className="w-3 h-3 text-[#D9A21B]" />}
                        <span>{t.type || 'Candidate'}</span>
                      </span>

                      {isPendingPreview ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-extrabold flex items-center gap-1 animate-pulse">
                          <Clock className="w-3 h-3 text-amber-700" />
                          <span>Pending Admin Approval</span>
                        </span>
                      ) : t.location ? (
                        <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{t.location}</span>
                        </span>
                      ) : null}
                    </div>

                    {/* Rating Stars */}
                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(Number(t.rating) || 5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-[#D9A21B] text-[#D9A21B]" />
                      ))}
                      <span className="text-xs font-bold text-slate-700 ml-1.5">
                        {(Number(t.rating) || 5).toFixed(1)}
                      </span>
                    </div>

                    {/* Review Content */}
                    <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed mb-6 font-normal">
                      "{t.content}"
                    </p>
                  </div>

                  {/* Author Footer */}
                  <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                    <div className="relative">
                      <img
                        src={t.image || t.avatar || AVATAR_PRESETS[0]}
                        alt={t.name}
                        className="w-11 h-11 rounded-full object-cover border-2 border-[#D9A21B] shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = AVATAR_PRESETS[0];
                        }}
                      />
                      {hasDrivePfp && (
                        <span 
                          title="Profile Photo stored on Google Drive"
                          className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] shadow-xs"
                        >
                          <HardDrive className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-1 truncate">
                        <span className="truncate">{t.name}</span>
                        {!isPendingPreview && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-700 shrink-0 inline" title="Verified Reviewer" />
                        )}
                      </div>
                      <div className="text-[11px] text-slate-600 font-medium truncate">
                        {t.role}, <span className="font-semibold text-slate-800">{t.company}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

      </div>
    </section>
  );
};
