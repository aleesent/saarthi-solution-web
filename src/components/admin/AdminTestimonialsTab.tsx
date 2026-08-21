import React, { useState } from 'react';
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
  Building2, 
  User, 
  X,
  MapPin
} from 'lucide-react';

export const AdminTestimonialsTab: React.FC = () => {
  const { testimonials, addTestimonial, updateTestimonial, deleteTestimonial } = useData();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Testimonial>>({
    name: '',
    role: '',
    company: '',
    location: 'Surat / Silvassa',
    content: '',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    type: 'Candidate'
  });

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
      type: 'Candidate'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: Testimonial) => {
    setEditingId(t.id);
    setFormData(t);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Delete review from "${name}"?`)) {
      deleteTestimonial(id);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateTestimonial(editingId, formData);
    } else {
      addTestimonial({
        name: formData.name || 'Verified Client',
        role: formData.role || 'Professional',
        company: formData.company || 'Enterprise',
        location: formData.location || 'Gujarat',
        content: formData.content || 'Excellent recruitment support from Sarthi Solutions.',
        rating: Number(formData.rating) || 5,
        avatar: formData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        type: formData.type || 'Candidate'
      });
    }
    setIsModalOpen(false);
  };

  const filteredTestimonials = testimonials.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.company.toLowerCase().includes(search.toLowerCase()) ||
      t.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-[#0A3D91]">Testimonials & Reviews ({testimonials.length})</h2>
          <p className="text-xs text-slate-500">
            Manage feedback from placed candidates and corporate HR leaders.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-60">
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
            onClick={handleOpenAdd}
            className="bg-[#0A3D91] hover:bg-[#083275] text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm transition-all whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Review
          </button>
        </div>
      </div>

      {/* Grid of Testimonials */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTestimonials.map((t) => (
          <div
            key={t.id}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-all relative"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <img
                    src={t.avatar || t.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt={t.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-[#D9A21B]"
                  />
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
                    className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
                    title="Delete Review"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <div className="flex text-[#D9A21B]">
                  {Array.from({ length: t.rating || 5 }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-[#D9A21B]" />
                  ))}
                </div>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#0A3D91] text-[9px] font-extrabold">
                  {t.type}
                </span>
              </div>

              <p className="text-xs text-slate-600 italic line-clamp-3 mb-3">
                "{t.content}"
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
              <span className="font-bold text-slate-800 truncate max-w-[140px]">{t.company}</span>
              <span className="flex items-center gap-1 text-slate-400">
                <MapPin className="w-3 h-3" /> {t.location || 'Gujarat'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {filteredTestimonials.length === 0 && (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <p className="text-sm text-slate-500 font-bold">No testimonials found matching your search.</p>
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

            <h3 className="text-base font-extrabold text-[#0A3D91] mb-1">
              {editingId ? 'Edit Testimonial' : 'Add New Testimonial'}
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Showcase verified feedback from clients and placed candidates.
            </p>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
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
                    placeholder="e.g. Managing Director"
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

              <div>
                <label className="font-bold text-slate-700 block mb-1">Avatar Image URL</label>
                <input
                  type="url"
                  value={formData.avatar || ''}
                  onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                />
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
                  className="flex-1 bg-slate-100 text-slate-700 py-2.5 rounded-xl font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#0A3D91] text-white py-2.5 rounded-xl font-bold hover:bg-[#083275] cursor-pointer"
                >
                  {editingId ? 'Save Review' : 'Publish Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
