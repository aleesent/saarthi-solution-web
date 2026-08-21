import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Service } from '../../types';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  UserCheck, 
  Users, 
  Briefcase, 
  ShieldCheck, 
  Globe, 
  FileSpreadsheet, 
  Factory, 
  FileText,
  Check,
  X,
  Layers
} from 'lucide-react';

export const AdminServicesTab: React.FC = () => {
  const { services, addService, updateService, deleteService } = useData();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    title: string;
    shortDesc: string;
    fullDesc: string;
    iconName: string;
    featuresText: string;
  }>({
    title: '',
    shortDesc: '',
    fullDesc: '',
    iconName: 'Briefcase',
    featuresText: ''
  });

  const iconOptions = [
    { label: 'Briefcase (Corporate)', value: 'Briefcase' },
    { label: 'UserCheck (Recruitment)', value: 'UserCheck' },
    { label: 'Users (Staffing)', value: 'Users' },
    { label: 'ShieldCheck (Compliance)', value: 'ShieldCheck' },
    { label: 'Globe (Overseas)', value: 'Globe' },
    { label: 'FileSpreadsheet (Payroll)', value: 'FileSpreadsheet' },
    { label: 'Factory (Industrial/Plant)', value: 'Factory' },
    { label: 'FileText (Resume/Advisory)', value: 'FileText' }
  ];

  const getServiceIcon = (name: string) => {
    switch (name) {
      case 'UserCheck': return <UserCheck className="w-5 h-5 text-[#0A3D91]" />;
      case 'Users': return <Users className="w-5 h-5 text-[#0A3D91]" />;
      case 'Briefcase': return <Briefcase className="w-5 h-5 text-[#0A3D91]" />;
      case 'ShieldCheck': return <ShieldCheck className="w-5 h-5 text-[#0A3D91]" />;
      case 'Globe': return <Globe className="w-5 h-5 text-[#0A3D91]" />;
      case 'FileSpreadsheet': return <FileSpreadsheet className="w-5 h-5 text-[#0A3D91]" />;
      case 'Factory': return <Factory className="w-5 h-5 text-[#0A3D91]" />;
      case 'FileText': return <FileText className="w-5 h-5 text-[#0A3D91]" />;
      default: return <Briefcase className="w-5 h-5 text-[#0A3D91]" />;
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      title: '',
      shortDesc: '',
      fullDesc: '',
      iconName: 'Briefcase',
      featuresText: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (service: Service) => {
    setEditingId(service.id);
    setFormData({
      title: service.title,
      shortDesc: service.shortDesc,
      fullDesc: service.fullDesc,
      iconName: service.iconName,
      featuresText: service.features.join('\n')
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete service "${title}"?`)) {
      deleteService(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const features = formData.featuresText
      .split('\n')
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    if (editingId) {
      updateService(editingId, {
        title: formData.title,
        shortDesc: formData.shortDesc,
        fullDesc: formData.fullDesc,
        iconName: formData.iconName,
        features: features.length > 0 ? features : ['Tailored recruitment and advisory solutions.']
      });
    } else {
      addService({
        title: formData.title,
        shortDesc: formData.shortDesc,
        fullDesc: formData.fullDesc,
        iconName: formData.iconName,
        features: features.length > 0 ? features : ['Tailored recruitment and advisory solutions.']
      });
    }
    setIsModalOpen(false);
  };

  const filteredServices = services.filter(
    (s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.shortDesc.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0A3D91]">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[#0A3D91]">Services Management ({services.length})</h2>
            <p className="text-xs text-slate-500">Create, modify, and delete recruitment and HR service offerings.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search services..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
            />
          </div>
          <button
            onClick={handleOpenAdd}
            className="bg-[#0A3D91] hover:bg-[#083275] text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm transition-all whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Service
          </button>
        </div>
      </div>

      {/* Services Grid/Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredServices.map((service) => (
          <div
            key={service.id}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-all relative group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center">
                  {getServiceIcon(service.iconName)}
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(service)}
                    className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-[#0A3D91] hover:text-white transition-colors cursor-pointer"
                    title="Edit Service"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(service.id, service.title)}
                    className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
                    title="Delete Service"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h3 className="text-sm font-extrabold text-slate-900 mb-1.5">{service.title}</h3>
              <p className="text-xs text-slate-600 line-clamp-2 mb-3">{service.shortDesc}</p>

              <div className="space-y-1 pt-2 border-t border-slate-100">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Key Features:</div>
                {service.features.slice(0, 3).map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-700">
                    <Check className="w-3 h-3 text-[#D9A21B] shrink-0" />
                    <span className="truncate">{feat}</span>
                  </div>
                ))}
                {service.features.length > 3 && (
                  <span className="text-[10px] text-blue-600 font-semibold pl-4">
                    +{service.features.length - 3} more features
                  </span>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Icon: {service.iconName}</span>
              <span className="text-[#0A3D91] font-bold">ID: {service.id}</span>
            </div>
          </div>
        ))}
      </div>

      {filteredServices.length === 0 && (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <p className="text-sm text-slate-500 font-bold">No services found matching your search.</p>
        </div>
      )}

      {/* Add / Edit Modal */}
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
              {editingId ? 'Edit Service' : 'Add New Service Offering'}
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Configure service details to display on Home and Services pages.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Service Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Industrial & Plant Hiring"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Service Icon</label>
                <select
                  value={formData.iconName}
                  onChange={(e) => setFormData({ ...formData, iconName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                >
                  {iconOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Short Summary (Preview) *</label>
                <textarea
                  rows={2}
                  required
                  value={formData.shortDesc}
                  onChange={(e) => setFormData({ ...formData, shortDesc: e.target.value })}
                  placeholder="Brief description shown on cards..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Service Description</label>
                <textarea
                  rows={3}
                  value={formData.fullDesc}
                  onChange={(e) => setFormData({ ...formData, fullDesc: e.target.value })}
                  placeholder="In-depth details shown in the service details modal..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Key Features (One per line)</label>
                <textarea
                  rows={3}
                  value={formData.featuresText}
                  onChange={(e) => setFormData({ ...formData, featuresText: e.target.value })}
                  placeholder="Multi-tier Candidate Vetting&#10;90-Day Guarantee&#10;Statutory Compliance"
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
                  {editingId ? 'Save Changes' : 'Create Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
