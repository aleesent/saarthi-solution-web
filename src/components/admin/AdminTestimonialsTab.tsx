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
  Filter,
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
    updateTestimonialStatus,
    refreshTestimonialsFromSupabase,
    uploadStorageFile 
  } = useData();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Testimonial>>({
    name: '',
    role: '',
    company: '',
    location: 'Surat, Gujarat',
    content: '',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    type: 'Candidate',
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
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      type: 'Candidate',
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
      showNotification(`Approved "${name}" review! It is now live on the website.`);
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
      showNotification(`Rejected review from "${name}". It has been hidden from the website.`);
    } catch (err: any) {
      alert(`Rejection error: ${err.message || 'Please try again'}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Delete review from "${name}"? This will remove it from Supabase PostgreSQL and Firestore.`)) {
      setActionLoadingId(id);
      try {
        await deleteTestimonial(id);
        showNotification(`Review from "${name}" permanently deleted.`);
      } catch (err: any) {
        alert(`Delete error: ${err.message || 'Please try again'}`);
      } finally {
        setActionLoadingId(null);
      }
    }
  };

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    try {
      // Upload photo to Google Drive in folder "Saarthi Solutions/Testimonial PFPs"
      // and log in Supabase PostgreSQL files table
      const uploaded = await uploadStorageFile(file, {
        fileName: `pfp_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`,
        relatedEntityType: 'testimonial_avatar',
        uploadedBy: formData.name || 'Admin',
        customFolder: 'Testimonial PFPs'
      });

      const finalUrl = uploaded.google_drive_view_url || uploaded.download_url || uploaded.storage_path || URL.createObjectURL(file);
      
      setFormData((prev) => ({
        ...prev,
        avatar: finalUrl,
        image: finalUrl,
        drive_file_id: uploaded.google_drive_file_id || uploaded.id,
        drive_url: uploaded.google_drive_url || uploaded.download_url,
        googleDriveUrl: uploaded.google_drive_url || uploaded.download_url
      }));

      showNotification('Photo uploaded to Google Drive & linked in Supabase!');
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
        showNotification(`Updated "${formData.name}" review in Supabase PostgreSQL!`);
      } else {
        await addTestimonial({
          name: formData.name || 'Verified Client',
          role: formData.role || 'Professional',
          company: formData.company || 'Enterprise',
          location: formData.location || 'Gujarat',
          content: formData.content || 'Excellent recruitment support from Sarthi Solutions.',
          rating: Number(formData.rating) || 5,
          avatar: formData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          image: formData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          type: formData.type || 'Candidate',
          status: formData.status || 'approved',
          is_approved: isApproved,
          drive_file_id: formData.drive_file_id,
          drive_url: formData.drive_url,
          googleDriveUrl: formData.drive_url,
          submittedBy: 'Admin'
        });
        showNotification(`Added new testimonial to Supabase PostgreSQL!`);
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
      showNotification(`Refreshed and synced reviews with Supabase PostgreSQL.`);
    } catch (err) {
      console.warn('Sync error:', err);
    } finally {
      setIsRefreshing(false);
    }
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
      t.name.toLowerCase().includes(q) ||
      t.company.toLowerCase().includes(q) ||
      t.content.toLowerCase().includes(q) ||
      (t.location && t.location.toLowerCase().includes(q)) ||
      (t.role && t.role.toLowerCase().includes(q))
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

      {/* Header & Status Counters */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-base font-extrabold text-[#0A3D91]">
                Testimonials & Review Moderation ({testimonials.length})
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                <Database className="w-3 h-3 text-emerald-600" /> Supabase Synced
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
                <HardDrive className="w-3 h-3 text-blue-600" /> Google Drive PFPs
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              User reviews submitted from website require Admin approval to be visible on public cards.
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
              title="Sync with Supabase PostgreSQL"
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

        {/* Filter Badges / Status Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-100">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
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
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === 'pending'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Admin Approval</span>
            {pendingCount > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${statusFilter === 'pending' ? 'bg-white/20' : 'bg-amber-200 text-amber-900 font-black'}`}>
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setStatusFilter('approved')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === 'approved'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Approved (Live on Website)</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${statusFilter === 'approved' ? 'bg-white/20' : 'bg-emerald-100 text-emerald-800'}`}>
              {approvedCount}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('rejected')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === 'rejected'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Rejected / Hidden</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${statusFilter === 'rejected' ? 'bg-white/20' : 'bg-rose-100 text-rose-800'}`}>
              {rejectedCount}
            </span>
          </button>
        </div>
      </div>

      {/* Grid of Testimonials */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTestimonials.map((t) => {
          const effectiveStatus = t.status || (t.is_approved === false ? 'pending' : 'approved');
          const isPending = effectiveStatus === 'pending';
          const isApproved = effectiveStatus === 'approved';
          const isRejected = effectiveStatus === 'rejected';
          const hasDrivePfp = !!(t.drive_url || t.driveUrl || t.googleDriveUrl || t.drive_file_id || t.driveFileId);
          const driveLink = t.drive_url || t.driveUrl || t.googleDriveUrl;

          return (
            <div
              key={t.id}
              className={`bg-white rounded-2xl p-5 border shadow-xs flex flex-col justify-between hover:shadow-md transition-all relative ${
                isPending 
                  ? 'border-amber-300 ring-2 ring-amber-400/20 bg-amber-50/10' 
                  : isRejected 
                  ? 'border-rose-200 opacity-80' 
                  : 'border-slate-200'
              }`}
            >
              <div>
                {/* Header with Avatar & Top Badges */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="relative">
                      <img
                        src={t.avatar || t.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                        alt={t.name}
                        className="w-11 h-11 rounded-full object-cover border-2 border-[#D9A21B]"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
                        }}
                      />
                      {hasDrivePfp && (
                        <span 
                          title="PFP stored on Google Drive"
                          className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] shadow-xs"
                        >
                          <HardDrive className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900 leading-tight">{t.name}</h4>
                      <p className="text-[11px] text-slate-500">{t.role}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
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

                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                    t.type === 'Employer' ? 'bg-blue-50 text-[#0A3D91] border border-blue-200' : 'bg-amber-50 text-amber-900 border border-amber-200'
                  }`}>
                    {t.type || 'Candidate'}
                  </span>

                  {hasDrivePfp && driveLink && (
                    <a
                      href={driveLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 flex items-center gap-1"
                      title="View Profile Photo on Google Drive"
                    >
                      <HardDrive className="w-2.5 h-2.5 text-blue-600" />
                      <span>Drive PFP</span>
                      <ExternalLink className="w-2 h-2" />
                    </a>
                  )}
                </div>

                {/* Rating Stars */}
                <div className="flex items-center gap-1 mb-2">
                  <div className="flex text-[#D9A21B]">
                    {Array.from({ length: Number(t.rating) || 5 }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-[#D9A21B]" />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 ml-1">
                    {(Number(t.rating) || 5).toFixed(1)}
                  </span>
                </div>

                {/* Content */}
                <p className="text-xs text-slate-600 italic line-clamp-3 mb-3 leading-relaxed">
                  "{t.content}"
                </p>
              </div>

              {/* Card Footer: Metadata + Action Moderation Buttons */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <span className="font-bold text-slate-800 truncate max-w-[140px]">{t.company}</span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <MapPin className="w-3 h-3" /> {t.location || 'Gujarat'}
                  </span>
                </div>

                {/* Direct Moderation Action Buttons */}
                <div className="flex items-center gap-2">
                  {!isApproved ? (
                    <button
                      onClick={() => handleApprove(t.id, t.name)}
                      disabled={actionLoadingId === t.id}
                      className="flex-1 py-1.5 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
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
                      className="flex-1 py-1.5 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                      <span>Hide from Website</span>
                    </button>
                  )}

                  {isPending && (
                    <button
                      onClick={() => handleReject(t.id, t.name)}
                      disabled={actionLoadingId === t.id}
                      className="py-1.5 px-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
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
          <p className="text-sm text-slate-500 font-bold">No reviews found in this status category.</p>
          <button
            onClick={() => { setStatusFilter('all'); setSearch(''); }}
            className="mt-3 text-xs text-[#0A3D91] font-bold hover:underline cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Add / Edit Testimonial Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative border border-slate-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-extrabold text-[#0A3D91]">
                {editingId ? 'Edit Testimonial & Approval' : 'Add New Testimonial'}
              </h3>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                <Database className="w-2.5 h-2.5" /> Supabase
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Feedback is stored in Supabase PostgreSQL. Photos are stored in Google Drive.
            </p>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              {/* Approval Status Toggle in Form */}
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

              <div>
                <label className="font-bold text-slate-700 block mb-1">Author Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ketan Shah"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Designation / Role *</label>
                  <input
                    type="text"
                    required
                    value={formData.role || ''}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="e.g. Plant Head / Engineer"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Company *</label>
                  <input
                    type="text"
                    required
                    value={formData.company || ''}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="e.g. Surat Engineering Pvt Ltd"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Location *</label>
                  <input
                    type="text"
                    required
                    value={formData.location || ''}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Surat, Gujarat"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Rating (1-5)</label>
                  <select
                    value={formData.rating || 5}
                    onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                  >
                    <option value={5}>5 Stars ★★★★★</option>
                    <option value={4}>4 Stars ★★★★☆</option>
                    <option value={3}>3 Stars ★★★☆☆</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={formData.type || 'Candidate'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                  >
                    <option value="Candidate">Candidate</option>
                    <option value="Employer">Employer</option>
                  </select>
                </div>
              </div>

              {/* Photo / Avatar with Google Drive upload */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">Author Photo / Avatar</label>
                  <span className="text-[10px] text-blue-700 font-bold flex items-center gap-1">
                    <HardDrive className="w-3 h-3 text-blue-600" /> Google Drive Supported
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <img
                    src={formData.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'}
                    alt="Preview"
                    className="w-10 h-10 rounded-full object-cover border border-slate-300 shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80';
                    }}
                  />
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="url"
                      value={formData.avatar || ''}
                      onChange={(e) => setFormData({ ...formData, avatar: e.target.value, image: e.target.value })}
                      placeholder="Paste image URL (https://...)"
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none text-xs"
                    />
                  </div>
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleAvatarFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingAvatar}
                      className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-[#0A3D91] rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap text-xs border border-blue-200"
                      title="Upload image directly to Google Drive"
                    >
                      {isUploadingAvatar ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#0A3D91]" />
                      ) : (
                        <Upload className="w-3.5 h-3.5" />
                      )}
                      <span>{isUploadingAvatar ? 'Saving to Drive...' : 'Upload to Drive'}</span>
                    </button>
                  </div>
                </div>

                {formData.drive_url && (
                  <div className="mt-1.5 text-[10px] text-blue-700 flex items-center gap-1 bg-blue-50 p-1.5 rounded-lg">
                    <HardDrive className="w-3 h-3 text-blue-600 shrink-0" />
                    <span className="truncate">Google Drive URL: {formData.drive_url}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Review Content *</label>
                <textarea
                  rows={3}
                  required
                  value={formData.content || ''}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Write the full testimonial text..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                />
              </div>

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
                      <span>Saving to Supabase...</span>
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
    </div>
  );
};
