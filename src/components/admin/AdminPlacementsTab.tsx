import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { PlacementItem, PlacementStats } from '../../types';
import { 
  Trophy, 
  Building2, 
  TrendingUp, 
  Clock, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  MapPin, 
  Save, 
  Check, 
  X,
  UserCheck
} from 'lucide-react';

export const AdminPlacementsTab: React.FC = () => {
  const { 
    placements, 
    placementStats, 
    addPlacement, 
    updatePlacement, 
    deletePlacement, 
    updatePlacementStats 
  } = useData();

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Placement Form State
  const [formData, setFormData] = useState<Partial<PlacementItem>>({
    candidate: '',
    role: '',
    company: '',
    location: 'Silvassa / Surat',
    salary: '₹6.0 LPA',
    category: 'Manufacturing',
    date: 'August 2026'
  });

  // Placement Stats Edit State
  const [isEditingStats, setIsEditingStats] = useState(false);
  const [statsForm, setStatsForm] = useState<PlacementStats>(placementStats);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      candidate: '',
      role: '',
      company: '',
      location: 'Surat, Gujarat',
      salary: '₹5.5 LPA',
      category: 'Manufacturing',
      date: 'August 2026'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: PlacementItem) => {
    setEditingId(item.id);
    setFormData(item);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Delete placement record for "${name}"?`)) {
      deletePlacement(id);
    }
  };

  const handleSavePlacement = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updatePlacement(editingId, formData);
    } else {
      addPlacement({
        candidate: formData.candidate || 'Candidate Placed',
        role: formData.role || 'Executive',
        company: formData.company || 'Client Partner',
        location: formData.location || 'Surat / Silvassa',
        salary: formData.salary || '₹5.0 LPA',
        category: formData.category || 'Manufacturing',
        date: formData.date || 'August 2026'
      });
    }
    setIsModalOpen(false);
  };

  const handleSaveStats = (e: React.FormEvent) => {
    e.preventDefault();
    updatePlacementStats(statsForm);
    setIsEditingStats(false);
  };

  const filteredPlacements = placements.filter(
    (p) =>
      p.candidate.toLowerCase().includes(search.toLowerCase()) ||
      p.role.toLowerCase().includes(search.toLowerCase()) ||
      p.company.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Placement Statistics Live Cards */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-extrabold text-[#0A3D91] uppercase tracking-wider">
              Live Placement Highlights & Numbers
            </h3>
            <p className="text-xs text-slate-500">
              These key statistics appear across the Hero, Placements page, and marketing banners.
            </p>
          </div>

          <button
            onClick={() => {
              setStatsForm(placementStats);
              setIsEditingStats(!isEditingStats);
            }}
            className="text-xs font-bold px-3.5 py-1.5 rounded-xl bg-slate-100 text-[#0A3D91] hover:bg-[#0A3D91] hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Edit className="w-3.5 h-3.5" />
            {isEditingStats ? 'Cancel Editing' : 'Edit Numbers'}
          </button>
        </div>

        {isEditingStats ? (
          <form onSubmit={handleSaveStats} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Total Placements</label>
              <input
                type="text"
                required
                value={statsForm.totalPlacements}
                onChange={(e) => setStatsForm({ ...statsForm, totalPlacements: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Partner Employers</label>
              <input
                type="text"
                required
                value={statsForm.partnerEmployers}
                onChange={(e) => setStatsForm({ ...statsForm, partnerEmployers: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Placement Rate</label>
              <input
                type="text"
                required
                value={statsForm.placementRate}
                onChange={(e) => setStatsForm({ ...statsForm, placementRate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Average Turnaround</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={statsForm.averageTurnaround}
                  onChange={(e) => setStatsForm({ ...statsForm, averageTurnaround: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                />
                <button
                  type="submit"
                  className="bg-[#0A3D91] text-white px-4 py-2 rounded-xl font-bold text-xs hover:bg-[#083275] shrink-0 cursor-pointer"
                >
                  Save
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0A3D91] text-[#D9A21B] flex items-center justify-center font-black">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase">Total Placed</div>
                <div className="text-lg font-black text-[#0A3D91]">{placementStats.totalPlacements}</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#D9A21B] text-[#0A3D91] flex items-center justify-center font-black">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase">Partner Employers</div>
                <div className="text-lg font-black text-slate-900">{placementStats.partnerEmployers}</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-green-50/60 border border-green-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-700 text-white flex items-center justify-center font-black">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase">Success Rate</div>
                <div className="text-lg font-black text-green-700">{placementStats.placementRate}</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center font-black">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase">Turnaround Time</div>
                <div className="text-lg font-black text-slate-800">{placementStats.averageTurnaround}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Placements CRUD Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-[#0A3D91]">Candidate Placements Records ({placements.length})</h2>
          <p className="text-xs text-slate-500">Manage individual candidate placement entries and salary packages.</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search placements..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
            />
          </div>

          <button
            onClick={handleOpenAdd}
            className="bg-[#0A3D91] hover:bg-[#083275] text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm transition-all whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Placement
          </button>
        </div>
      </div>

      {/* Placements CRUD Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 uppercase text-[10px] text-slate-500 font-extrabold border-b border-slate-200">
            <tr>
              <th className="py-3.5 px-4">Candidate Name</th>
              <th className="py-3.5 px-4">Designation / Role</th>
              <th className="py-3.5 px-4">Hiring Company & Location</th>
              <th className="py-3.5 px-4">Package (CTC)</th>
              <th className="py-3.5 px-4">Sector / Date</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredPlacements.map((plc) => (
              <tr key={plc.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3.5 px-4 font-extrabold text-slate-900">{plc.candidate}</td>
                <td className="py-3.5 px-4 font-bold text-[#0A3D91]">{plc.role}</td>
                <td className="py-3.5 px-4">
                  <div className="font-bold text-slate-800">{plc.company}</div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" /> {plc.location}
                  </div>
                </td>
                <td className="py-3.5 px-4 font-black text-green-700">{plc.salary}</td>
                <td className="py-3.5 px-4">
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-[#0A3D91] font-bold text-[10px]">
                    {plc.category}
                  </span>
                  <div className="text-[10px] text-slate-400 mt-0.5">{plc.date}</div>
                </td>
                <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                  <button
                    onClick={() => handleOpenEdit(plc)}
                    className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-[#0A3D91] hover:text-white transition-colors cursor-pointer"
                    title="Edit Placement"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(plc.id, plc.candidate)}
                    className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
                    title="Delete Placement"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredPlacements.length === 0 && (
          <div className="p-8 text-center text-slate-500 font-bold text-xs">
            No placement records found.
          </div>
        )}
      </div>

      {/* Add / Edit Placement Modal */}
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
              {editingId ? 'Edit Placement Record' : 'Add New Placement Record'}
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Record a successful candidate hire to showcase on the Placements page.
            </p>

            <form onSubmit={handleSavePlacement} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Candidate Name *</label>
                <input
                  type="text"
                  required
                  value={formData.candidate || ''}
                  onChange={(e) => setFormData({ ...formData, candidate: e.target.value })}
                  placeholder="e.g. Rajesh Kumar M."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Designation / Role *</label>
                <input
                  type="text"
                  required
                  value={formData.role || ''}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="e.g. Assistant Factory Manager"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Company *</label>
                  <input
                    type="text"
                    required
                    value={formData.company || ''}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="e.g. Premier Industrial Corp"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Location *</label>
                  <input
                    type="text"
                    required
                    value={formData.location || ''}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Silvassa (D&NH)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Salary Package *</label>
                  <input
                    type="text"
                    required
                    value={formData.salary || ''}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    placeholder="e.g. ₹6.5 LPA"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Sector</label>
                  <select
                    value={formData.category || 'Manufacturing'}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                  >
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Elevator">Elevator</option>
                    <option value="Quality Assurance">Quality Assurance</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Administration">Administration</option>
                    <option value="IT & Tech">IT & Tech</option>
                    <option value="HR & Finance">HR & Finance</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Date</label>
                  <input
                    type="text"
                    value={formData.date || ''}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    placeholder="e.g. July 2026"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                  />
                </div>
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
                  {editingId ? 'Save Placement' : 'Record Placement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
