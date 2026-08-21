import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { EmployerPartner, EmployerInquiry } from '../../types';
import { 
  Building2, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Phone, 
  Mail, 
  MapPin, 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  MessageSquare,
  FileText,
  X,
  ExternalLink
} from 'lucide-react';

export const AdminEmployersTab: React.FC = () => {
  const { 
    employers, 
    addEmployer, 
    updateEmployer, 
    deleteEmployer,
    employerInquiries,
    addEmployerInquiry,
    updateEmployerInquiry,
    deleteEmployerInquiry
  } = useData();

  const [subTab, setSubTab] = useState<'partners' | 'inquiries'>('partners');
  const [search, setSearch] = useState('');
  
  // Employer Partner Modal State
  const [isEmpModalOpen, setIsEmpModalOpen] = useState(false);
  const [editingEmpId, setEditingEmpId] = useState<string | null>(null);
  const [empForm, setEmpForm] = useState<Partial<EmployerPartner>>({
    companyName: '',
    industry: 'Manufacturing',
    location: 'Surat, Gujarat',
    contactPerson: '',
    phone: '',
    email: '',
    activeOpenings: 1,
    partnershipType: 'Permanent Hiring',
    status: 'Active Partner',
    notes: ''
  });

  // Employer Inquiry Modal State
  const [selectedInquiry, setSelectedInquiry] = useState<EmployerInquiry | null>(null);

  const handleOpenAddPartner = () => {
    setEditingEmpId(null);
    setEmpForm({
      companyName: '',
      industry: 'Manufacturing & Engineering',
      location: 'Silvassa / Surat',
      contactPerson: '',
      phone: '',
      email: '',
      activeOpenings: 1,
      partnershipType: 'Permanent Hiring',
      status: 'Active Partner',
      notes: ''
    });
    setIsEmpModalOpen(true);
  };

  const handleOpenEditPartner = (emp: EmployerPartner) => {
    setEditingEmpId(emp.id);
    setEmpForm(emp);
    setIsEmpModalOpen(true);
  };

  const handleDeletePartner = (id: string, name: string) => {
    if (window.confirm(`Delete client company "${name}"?`)) {
      deleteEmployer(id);
    }
  };

  const handleSavePartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEmpId) {
      updateEmployer(editingEmpId, empForm);
    } else {
      addEmployer({
        companyName: empForm.companyName || 'New Client Company',
        industry: empForm.industry || 'Manufacturing',
        location: empForm.location || 'Gujarat',
        contactPerson: empForm.contactPerson || 'HR Manager',
        phone: empForm.phone || '+91 98243 22206',
        email: empForm.email || 'hr@company.com',
        activeOpenings: Number(empForm.activeOpenings) || 1,
        partnershipType: empForm.partnershipType || 'Permanent Hiring',
        status: empForm.status || 'Active Partner',
        notes: empForm.notes || ''
      });
    }
    setIsEmpModalOpen(false);
  };

  const handleDeleteInquiry = (id: string, comp: string) => {
    if (window.confirm(`Delete inquiry from "${comp}"?`)) {
      deleteEmployerInquiry(id);
    }
  };

  const filteredEmployers = employers.filter(
    (e) =>
      e.companyName.toLowerCase().includes(search.toLowerCase()) ||
      e.industry.toLowerCase().includes(search.toLowerCase()) ||
      e.location.toLowerCase().includes(search.toLowerCase())
  );

  const filteredInquiries = employerInquiries.filter(
    (i) =>
      i.companyName.toLowerCase().includes(search.toLowerCase()) ||
      i.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
      i.phone.includes(search)
  );

  return (
    <div className="space-y-6">
      {/* Sub Navigation Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSubTab('partners')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              subTab === 'partners'
                ? 'bg-[#0A3D91] text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Client Companies ({employers.length})
          </button>
          <button
            onClick={() => setSubTab('inquiries')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              subTab === 'inquiries'
                ? 'bg-[#0A3D91] text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Hiring Enquiries & JDs ({employerInquiries.length})
          </button>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search employers..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
            />
          </div>

          {subTab === 'partners' && (
            <button
              onClick={handleOpenAddPartner}
              className="bg-[#0A3D91] hover:bg-[#083275] text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm transition-all whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Employer
            </button>
          )}
        </div>
      </div>

      {/* SUBTAB 1: CLIENT EMPLOYERS CRUD TABLE */}
      {subTab === 'partners' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 uppercase text-[10px] text-slate-500 font-extrabold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Company</th>
                <th className="py-3.5 px-4">Industry / Location</th>
                <th className="py-3.5 px-4">Contact Person</th>
                <th className="py-3.5 px-4">Type / Openings</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEmployers.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-extrabold text-slate-900">{emp.companyName}</div>
                    {emp.notes && <div className="text-[11px] text-slate-500 truncate max-w-xs">{emp.notes}</div>}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-800">{emp.industry}</div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" /> {emp.location}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{emp.contactPerson}</div>
                    <div className="text-[11px] text-slate-500">{emp.phone}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-[#0A3D91]">{emp.partnershipType}</div>
                    <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 font-extrabold text-[10px]">
                      {emp.activeOpenings} Active Vacancies
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold inline-block ${
                        emp.status === 'Active Partner'
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : emp.status === 'Urgent Hiring'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {emp.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                    <a
                      href={`https://wa.me/91${emp.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-600 hover:text-white inline-block transition-colors"
                      title="WhatsApp Client"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => handleOpenEditPartner(emp)}
                      className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-[#0A3D91] hover:text-white transition-colors cursor-pointer"
                      title="Edit Employer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeletePartner(emp.id, emp.companyName)}
                      className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
                      title="Delete Employer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredEmployers.length === 0 && (
            <div className="p-8 text-center text-slate-500 font-bold text-xs">
              No client employers found.
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: EMPLOYER HIRING INQUIRIES & JD SUBMISSIONS */}
      {subTab === 'inquiries' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredInquiries.map((inq) => (
              <div
                key={inq.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0A3D91] text-[10px] font-bold border border-blue-100">
                      {inq.type}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">{inq.date}</span>
                  </div>

                  <h3 className="text-sm font-extrabold text-slate-900">{inq.companyName}</h3>
                  <div className="text-xs text-slate-700 font-bold mt-0.5">
                    Contact: {inq.contactPerson} ({inq.phone})
                  </div>
                  {inq.email && <div className="text-[11px] text-slate-500">{inq.email}</div>}

                  <div className="my-3 p-3 rounded-xl bg-slate-50 text-xs border border-slate-100 text-slate-700">
                    <div className="font-bold text-[#0A3D91]">Urgency: {inq.hiringUrgency}</div>
                    {inq.preferredTime && <div>Preferred Time: {inq.preferredTime}</div>}
                    {inq.note && <p className="mt-1 text-slate-600 italic">"{inq.note}"</p>}
                    {inq.jobDetails && (
                      <div className="mt-2 pt-2 border-t border-slate-200 text-[11px]">
                        <span className="font-bold">JD:</span> {inq.jobDetails.jobTitle} ({inq.jobDetails.experienceRequired}) - {inq.jobDetails.salaryOffered}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-400">Status:</span>
                    <select
                      value={inq.status}
                      onChange={(e) =>
                        updateEmployerInquiry(inq.id, {
                          status: e.target.value as 'New' | 'Contacted' | 'In Sourcing' | 'Fulfilled'
                        })
                      }
                      className="text-[11px] font-bold px-2 py-1 rounded-lg border border-slate-300 bg-white"
                    >
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="In Sourcing">In Sourcing</option>
                      <option value="Fulfilled">Fulfilled</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`https://wa.me/91${inq.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> Call/WhatsApp
                    </a>
                    <button
                      onClick={() => handleDeleteInquiry(inq.id, inq.companyName)}
                      className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
                      title="Delete Inquiry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredInquiries.length === 0 && (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 font-bold text-xs">
              No employer inquiries found.
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Partner Modal */}
      {isEmpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative border border-slate-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsEmpModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-extrabold text-[#0A3D91] mb-1">
              {editingEmpId ? 'Edit Client Employer' : 'Add New Client Partner'}
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Add or modify enterprise client profile and recruitment mandates.
            </p>

            <form onSubmit={handleSavePartner} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  value={empForm.companyName || ''}
                  onChange={(e) => setEmpForm({ ...empForm, companyName: e.target.value })}
                  placeholder="e.g. Surat Precision Polymers Ltd"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Industry Sector *</label>
                  <input
                    type="text"
                    required
                    value={empForm.industry || ''}
                    onChange={(e) => setEmpForm({ ...empForm, industry: e.target.value })}
                    placeholder="e.g. Manufacturing"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Location *</label>
                  <input
                    type="text"
                    required
                    value={empForm.location || ''}
                    onChange={(e) => setEmpForm({ ...empForm, location: e.target.value })}
                    placeholder="e.g. Silvassa (D&NH)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Contact Person *</label>
                  <input
                    type="text"
                    required
                    value={empForm.contactPerson || ''}
                    onChange={(e) => setEmpForm({ ...empForm, contactPerson: e.target.value })}
                    placeholder="e.g. Ketan Bhai"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Contact Phone *</label>
                  <input
                    type="text"
                    required
                    value={empForm.phone || ''}
                    onChange={(e) => setEmpForm({ ...empForm, phone: e.target.value })}
                    placeholder="+91 98251 12345"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Partnership Type</label>
                  <select
                    value={empForm.partnershipType || 'Permanent Hiring'}
                    onChange={(e) => setEmpForm({ ...empForm, partnershipType: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                  >
                    <option value="Permanent Hiring">Permanent Hiring</option>
                    <option value="Contract Staffing">Contract Staffing</option>
                    <option value="Executive Search">Executive Search</option>
                    <option value="HR Advisory">HR Advisory</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Client Status</label>
                  <select
                    value={empForm.status || 'Active Partner'}
                    onChange={(e) => setEmpForm({ ...empForm, status: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                  >
                    <option value="Active Partner">Active Partner</option>
                    <option value="Urgent Hiring">Urgent Hiring</option>
                    <option value="Pending Review">Pending Review</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Active Openings Count</label>
                <input
                  type="number"
                  min="0"
                  value={empForm.activeOpenings || 1}
                  onChange={(e) => setEmpForm({ ...empForm, activeOpenings: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Recruitment Notes</label>
                <textarea
                  rows={2}
                  value={empForm.notes || ''}
                  onChange={(e) => setEmpForm({ ...empForm, notes: e.target.value })}
                  placeholder="Key hiring requirements or special mandates..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                />
              </div>

              <div className="pt-3 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEmpModalOpen(false)}
                  className="flex-1 bg-slate-100 text-slate-700 py-2.5 rounded-xl font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#0A3D91] text-white py-2.5 rounded-xl font-bold hover:bg-[#083275] cursor-pointer"
                >
                  {editingEmpId ? 'Save Client' : 'Add Client Partner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
