import React, { useState, useRef } from 'react';
import { useData } from '../../context/DataContext';
import { Testimonial } from '../../types';
import { 
  Star, 
  Quote, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  CheckCircle, 
  CheckCircle2,
  XCircle,
  Building2, 
  User, 
  X,
  MapPin,
  Upload, 
  RefreshCw,
  Database,
  HardDrive,
  ExternalLink,
  Clock,
  ShieldCheck,
  Eye,
  EyeOff,
  Calendar,
  Check
} from 'lucide-react';

export const AdminTestimonialsTab: React.FC = () => {
  const { 
    testimonials, 
    addTestimonial, 
    updateTestimonial, 
    deleteTestimonial, 
    approveTestimonial, 
    rejectTestimonial, 
    refreshTestimonialsFromSupabase,
    uploadStorageFile 
  } = useData();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingReview, setViewingReview] = useState<Testimonial | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<{ id: string; name: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Testimonial>>({
    name: '',
    role: '',
    company: '',
    location: 'Surat, Gujarat',
    content: '',
    rating: 5,
    avatar: '/avatars/avatar-male.svg',
    type: 'Employer',
    status: 'approved',
    is_approved: true
  });

  const pendingCount = testimonials.filter((t) => t.status === 'pending' || t.is_approved === false).length;
  const approvedCount = testimonials.filter((t) => t.status === 'approved' || (t.is_approved === true && t.status !== 'rejected') || (!t.status && t.is_approved !== false)).length;
  const rejectedCount = testimonials.filter((t) => t.status === 'rejected').length;

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      name: '',
      role: '',
      company: '',
      location: 'Surat, Gujarat',
      content: '',
      rating: 5,
      avatar: '/avatars/avatar-male.svg',
      type: 'Employer',
      status: 'approved',
      is_approved: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: Testimonial) => {
    setEditingId(t.id);
    const effectiveStatus = t.status || (t.is_approved === false ? 'pending' : 'approved');
    setFormData({
      ...t,
      status: effectiveStatus,
      is_approved: effectiveStatus === 'approved'
    });
    setIsModalOpen(true);
  };

  const showNotification = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => {
      setSaveSuccessMsg(null);
    }, 4500);
  };

  const handleApprove = async (id: string, name: string) => {
    setActionLoadingId(id);
    try {
      await approveTestimonial(id);
      showNotification(`Approved review from "${name}"! It is now live on the public website.`);
      if (viewingReview && viewingReview.id === id) {
        setViewingReview({ ...viewingReview, status: 'approved', is_approved: true });
      }
    } catch (err: any) {
      alert(`Approval error: ${err.message || 'Please try again'}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (id: string, name: string) => {
    setActionLoadingId(id);
    try {
      await rejectTestimonial(id);
      showNotification(`Rejected review from "${name}". It has been hidden from the public website.`);
      if (viewingReview && viewingReview.id === id) {
        setViewingReview({ ...viewingReview, status: 'rejected', is_approved: false });
      }
    } catch (err: any) {
      alert(`Rejection error: ${err.message || 'Please try again'}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = (id: string, name: string) => {
    setDeleteConfirmTarget({ id, name });
  };

  const executeDelete = async () => {
    if (!deleteConfirmTarget) return;
    const { id, name } = deleteConfirmTarget;
    setActionLoadingId(id);
    setDeleteConfirmTarget(null);
    try {
      await deleteTestimonial(id);
      showNotification(`Review from "${name}" permanently deleted.`);
      if (viewingReview && viewingReview.id === id) {
        setViewingReview(null);
      }
    } catch (err: any) {
      alert(`Delete error: ${err.message || 'Please try again'}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    try {
      const uploaded = await uploadStorageFile(file, {
        fileName: `pfp_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`,
        relatedEntityType: 'testimonial_avatar',
        uploadedBy: formData.name || 'Admin',
        customFolder: 'Testimonial PFPs'
      });

      const finalUrl = uploaded.download_url || uploaded.storage_path || URL.createObjectURL(file);
      
      setFormData((prev) => ({
        ...prev,
        avatar: finalUrl,
        image: finalUrl
      }));

      showNotification('Profile photo uploaded to Supabase Storage!');
    } catch (err: any) {
      alert(`Avatar upload failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const isApproved = formData.status === 'approved';

      if (editingId) {
        await updateTestimonial(editingId, {
          ...formData,
          is_approved: isApproved
        });
        showNotification(`Updated review from "${formData.name}" successfully!`);
      } else {
        await addTestimonial({
          name: formData.name || 'Verified Client',
          role: formData.role || (formData.type === 'Employer' ? 'Client / HR Head' : 'Placed Candidate'),
          company: formData.company || (formData.type === 'Employer' ? 'Partner Enterprise' : 'Industrial Candidate'),
          location: formData.location || 'Surat, Gujarat',
          content: formData.content || 'Excellent recruitment support from Sarthi Solutions.',
          rating: Number(formData.rating) || 5,
          avatar: formData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          image: formData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          type: formData.type || 'Employer',
          status: formData.status || 'approved',
          is_approved: isApproved,
          submittedBy: 'Admin'
        });
        showNotification(`Added new review successfully!`);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      alert(`Save failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshTestimonialsFromSupabase();
      showNotification(`Refreshed and synchronized reviews with database.`);
    } catch (err) {
      console.warn('Sync error:', err);
    } finally {
      setIsRefreshing(false);
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
    return 'Recent';
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

  const filteredTestimonials = testimonials.filter((t) => {
    const effectiveStatus = t.status || (t.is_approved === false ? 'pending' : 'approved');

    // Status filter matching
    if (statusFilter === 'pending' && effectiveStatus !== 'pending') return false;
    if (statusFilter === 'approved' && effectiveStatus !== 'approved') return false;
    if (statusFilter === 'rejected' && effectiveStatus !== 'rejected') return false;

    // Search query matching
    const q = search.toLowerCase();
    return (
      (t.name || '').toLowerCase().includes(q) ||
      (t.company || '').toLowerCase().includes(q) ||
      (t.content || '').toLowerCase().includes(q) ||
      (t.type || '').toLowerCase().includes(q) ||
      (t.role || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {saveSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-2xl flex items-center justify-between text-xs font-bold shadow-xs animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
          <button 
            onClick={() => setSaveSuccessMsg(null)}
            className="text-emerald-600 hover:text-emerald-900 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header & Status Controls */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-base font-extrabold text-[#0A3D91]">
                Review Moderation Suite ({testimonials.length})
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                <Database className="w-3 h-3 text-emerald-600" /> Database Synced
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage incoming public reviews. Only approved reviews appear live on the public website.
            </p>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search reviews..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
              />
            </div>

            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer disabled:opacity-50"
              title="Sync with database"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#0A3D91]' : ''}`} />
            </button>

            <button
              onClick={handleOpenAdd}
              className="bg-[#0A3D91] hover:bg-[#083275] text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Review
            </button>
          </div>
        </div>

        {/* Status Tabs: All | Pending Approval | Approved (Live) | Rejected */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-100">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>All Reviews</span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full">{testimonials.length}</span>
          </button>

          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === 'pending'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Approval</span>
            {pendingCount > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${statusFilter === 'pending' ? 'bg-white/20 text-white' : 'bg-amber-200 text-amber-900'}`}>
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setStatusFilter('approved')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === 'approved'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Approved (Live on Website)</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${statusFilter === 'approved' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
              {approvedCount}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('rejected')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === 'rejected'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Rejected / Hidden</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${statusFilter === 'rejected' ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-800'}`}>
              {rejectedCount}
            </span>
          </button>
        </div>
      </div>

      {/* Grid of Testimonial Cards in Admin */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTestimonials.map((t) => {
          const effectiveStatus = t.status || (t.is_approved === false ? 'pending' : 'approved');
          const isPending = effectiveStatus === 'pending';
          const isApproved = effectiveStatus === 'approved';
          const isRejected = effectiveStatus === 'rejected';

          return (
            <div
              key={t.id}
              className={`bg-white rounded-2xl p-5 border shadow-xs flex flex-col justify-between hover:shadow-md transition-all relative ${
                isPending 
                  ? 'border-amber-300 ring-2 ring-amber-400/20 bg-amber-50/10' 
                  : isRejected 
                  ? 'border-rose-200 opacity-85' 
                  : 'border-slate-200'
              }`}
            >
              <div>
                {/* Header with Avatar & Actions */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-[#0A3D91] text-xs shrink-0 overflow-hidden">
                      {t.image || t.avatar ? (
                        <img
                          src={t.image || t.avatar}
                          alt={t.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <span>{t.name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-extrabold text-slate-900 truncate">{t.name}</h4>
                      <p className="text-[11px] text-slate-500 truncate">{t.role || 'Reviewer'}</p>
                    </div>
                  </div>

                  {/* Actions: View / Edit / Delete */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setViewingReview(t)}
                      className="p-1.5 rounded-lg bg-blue-50 text-[#0A3D91] hover:bg-[#0A3D91] hover:text-white transition-colors cursor-pointer"
                      title="View Full Review Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(t)}
                      className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-[#0A3D91] hover:text-white transition-colors cursor-pointer"
                      title="Edit Review"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(t.id, t.name)}
                      disabled={actionLoadingId === t.id}
                      className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                      title="Delete Review"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Status & Category Bar */}
                <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                  {/* Status Indicator */}
                  {isPending && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 animate-pulse">
                      <Clock className="w-3 h-3 text-amber-700" />
                      <span>Pending Approval</span>
                    </span>
                  )}
                  {isApproved && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Live on Website</span>
                    </span>
                  )}
                  {isRejected && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                      <XCircle className="w-3 h-3 text-rose-600" />
                      <span>Rejected / Hidden</span>
                    </span>
                  )}

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${getCategoryBadgeClass(t.type)}`}>
                    {t.type || 'Reviewer'}
                  </span>

                  <span className="text-[10px] text-slate-400 font-medium ml-auto flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>{formatReviewDate(t)}</span>
                  </span>
                </div>

                {/* Rating Stars */}
                <div className="flex items-center gap-1 mb-2">
                  <div className="flex text-[#D9A21B]">
                    {Array.from({ length: Number(t.rating) || 5 }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-[#D9A21B] text-[#D9A21B]" />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 ml-1">
                    {(Number(t.rating) || 5).toFixed(1)}
                  </span>
                </div>

                {/* Content preview */}
                <p className="text-xs text-slate-600 italic line-clamp-3 mb-3 leading-relaxed">
                  "{t.content}"
                </p>
              </div>

              {/* Card Footer: Moderation Action Buttons (Approve / Reject) */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <span className="font-bold text-slate-800 truncate max-w-[150px]">
                    {t.company || t.role || 'Direct Submission'}
                  </span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <MapPin className="w-3 h-3" /> {t.location || 'Gujarat'}
                  </span>
                </div>

                {/* One-Click Approval / Rejection Controls */}
                <div className="flex items-center gap-2">
                  {!isApproved ? (
                    <button
                      onClick={() => handleApprove(t.id, t.name)}
                      disabled={actionLoadingId === t.id}
                      className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
                    >
                      {actionLoadingId === t.id ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      )}
                      <span>Approve & Make Live</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleReject(t.id, t.name)}
                      disabled={actionLoadingId === t.id}
                      className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                      <span>Hide from Website</span>
                    </button>
                  )}

                  {isPending && (
                    <button
                      onClick={() => handleReject(t.id, t.name)}
                      disabled={actionLoadingId === t.id}
                      className="py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTestimonials.length === 0 && (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
          <p className="text-sm text-slate-500 font-bold">No reviews found matching the current filter.</p>
          <button
            onClick={() => { setStatusFilter('all'); setSearch(''); }}
            className="mt-3 text-xs text-[#0A3D91] font-bold hover:underline cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* VIEW REVIEW MODAL */}
      {viewingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative border border-slate-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setViewingReview(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-[#0A3D91]">
                  Review Details & Moderation
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getCategoryBadgeClass(viewingReview.type)}`}>
                  {viewingReview.type || 'Review'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Submitted date: {formatReviewDate(viewingReview)}
              </p>
            </div>

            {/* Author & Rating Banner */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 mb-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white border-2 border-[#D9A21B] flex items-center justify-center font-black text-[#0A3D91] text-sm overflow-hidden shrink-0">
                {viewingReview.image || viewingReview.avatar ? (
                  <img 
                    src={viewingReview.image || viewingReview.avatar} 
                    alt={viewingReview.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{viewingReview.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-extrabold text-slate-900 truncate">{viewingReview.name}</h4>
                <p className="text-xs text-slate-500">{viewingReview.role} • {viewingReview.company || viewingReview.location || 'Gujarat'}</p>
                <div className="flex items-center gap-1 mt-1 text-[#D9A21B]">
                  {Array.from({ length: Number(viewingReview.rating) || 5 }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-[#D9A21B]" />
                  ))}
                  <span className="text-xs font-bold text-slate-700 ml-1">
                    {(Number(viewingReview.rating) || 5).toFixed(1)} / 5
                  </span>
                </div>
              </div>
            </div>

            {/* Full Review Text */}
            <div className="mb-6">
              <label className="text-[11px] font-bold uppercase text-slate-400 tracking-wider block mb-1">
                Full Review Feedback
              </label>
              <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-800 leading-relaxed italic">
                "{viewingReview.content}"
              </div>
            </div>

            {/* Moderation Status */}
            <div className="mb-6 flex items-center justify-between p-3.5 rounded-2xl border bg-slate-50/50">
              <span className="text-xs font-bold text-slate-700">Current Status:</span>
              <div className="flex items-center gap-1.5">
                {viewingReview.status === 'pending' || viewingReview.is_approved === false ? (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Pending Admin Approval
                  </span>
                ) : viewingReview.status === 'rejected' ? (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-900 border border-rose-300 flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" /> Rejected / Hidden
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Live on Public Website
                  </span>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
              {viewingReview.status !== 'approved' && viewingReview.is_approved !== true && (
                <button
                  onClick={() => handleApprove(viewingReview.id, viewingReview.name)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Check className="w-4 h-4" /> Approve Review
                </button>
              )}

              {viewingReview.status !== 'rejected' && (
                <button
                  onClick={() => handleReject(viewingReview.id, viewingReview.name)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <X className="w-4 h-4" /> Reject Review
                </button>
              )}

              <button
                onClick={() => {
                  const toEdit = viewingReview;
                  setViewingReview(null);
                  handleOpenEdit(toEdit);
                }}
                className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5" /> Edit
              </button>

              <button
                onClick={() => handleDelete(viewingReview.id, viewingReview.name)}
                className="py-2.5 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT REVIEW MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative border border-slate-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-extrabold text-[#0A3D91]">
                {editingId ? 'Edit Review & Status' : 'Add New Review'}
              </h3>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                <Database className="w-2.5 h-2.5" /> Supabase
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              All review records are synchronized in database and can be moderated.
            </p>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              
              {/* Approval Status Selector */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <label className="font-bold text-slate-800 block mb-1.5">Moderation & Visibility Status</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, status: 'approved', is_approved: true })}
                    className={`py-2 px-2 rounded-xl font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                      formData.status === 'approved'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approved (Live)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, status: 'pending', is_approved: false })}
                    className={`py-2 px-2 rounded-xl font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                      formData.status === 'pending'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Pending</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, status: 'rejected', is_approved: false })}
                    className={`py-2 px-2 rounded-xl font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                      formData.status === 'rejected'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Rejected</span>
                  </button>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Reviewer Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ketan Shah"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none bg-white text-slate-900"
                />
              </div>

              {/* Category & Star Rating */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={formData.type || 'Employer'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none bg-white text-slate-900"
                  >
                    <option value="Employer">Employer / Client</option>
                    <option value="Candidate">Placed Candidate</option>
                    <option value="Other">Other / Client</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Rating (1-5)</label>
                  <select
                    value={formData.rating || 5}
                    onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none bg-white text-slate-900"
                  >
                    <option value={5}>5 Stars ★★★★★</option>
                    <option value={4}>4 Stars ★★★★☆</option>
                    <option value={3}>3 Stars ★★★☆☆</option>
                    <option value={2}>2 Stars ★★☆☆☆</option>
                    <option value={1}>1 Star ★☆☆☆☆</option>
                  </select>
                </div>
              </div>

              {/* Designation & Company (Optional) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Designation / Role</label>
                  <input
                    type="text"
                    value={formData.role || ''}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="e.g. Plant Manager / Engineer"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none bg-white text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Company / Location</label>
                  <input
                    type="text"
                    value={formData.company || ''}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="e.g. Surat Engineering Pvt Ltd"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none bg-white text-slate-900"
                  />
                </div>
              </div>

              {/* Simple Avatar Preset & Photo */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-700">Reviewer Avatar</label>
                  <span className="text-[10px] text-slate-500 font-semibold">
                    Select Simple Avatar or Upload Custom
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <img
                    src={formData.avatar || '/avatars/avatar-male.svg'}
                    alt="Preview"
                    className="w-10 h-10 rounded-full object-cover border border-slate-300 shrink-0 bg-white"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/avatars/avatar-male.svg';
                    }}
                  />
                  <div className="flex items-center gap-2 flex-1">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, avatar: '/avatars/avatar-male.svg', image: '/avatars/avatar-male.svg' })}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer flex items-center gap-1.5 ${
                        formData.avatar === '/avatars/avatar-male.svg' || !formData.avatar
                          ? 'bg-[#0A3D91] text-white border-[#0A3D91]'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <img src="/avatars/avatar-male.svg" alt="" className="w-4 h-4 rounded-full" />
                      <span>Male Avatar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, avatar: '/avatars/avatar-female.svg', image: '/avatars/avatar-female.svg' })}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer flex items-center gap-1.5 ${
                        formData.avatar === '/avatars/avatar-female.svg'
                          ? 'bg-[#0A3D91] text-white border-[#0A3D91]'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <img src="/avatars/avatar-female.svg" alt="" className="w-4 h-4 rounded-full" />
                      <span>Female Avatar</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Review Content */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Review Feedback *</label>
                <textarea
                  rows={3}
                  required
                  value={formData.content || ''}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Write the full feedback content..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none bg-white text-slate-900 leading-relaxed"
                />
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSaving}
                  className="flex-1 bg-slate-100 text-slate-700 py-2.5 rounded-xl font-bold hover:bg-slate-200 cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || isUploadingAvatar}
                  className="flex-1 bg-[#0A3D91] text-white py-2.5 rounded-xl font-bold hover:bg-[#083275] cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-[#D9A21B]" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingId ? 'Save Changes' : 'Publish Review'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* IN-APP DELETE CONFIRMATION MODAL */}
      {deleteConfirmTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-base font-black text-slate-900 mb-1">
              Delete Testimonial?
            </h3>
            <p className="text-xs text-slate-600 mb-5 leading-relaxed">
              Are you sure you want to delete the review by <strong className="text-slate-900 font-bold">"{deleteConfirmTarget.name}"</strong>? This will permanently remove it from the Supabase database and memory cache.
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmTarget(null)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeDelete}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Permanently</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
