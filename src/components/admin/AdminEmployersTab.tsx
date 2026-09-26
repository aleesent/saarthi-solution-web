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
  ExternalLink,
  RefreshCw,
  Database,
  Users,
  ShieldCheck,
  AlertTriangle,
  HardDrive
} from 'lucide-react';

export const AdminEmployersTab: React.FC = () => {
  const { 
    employers, 
    addEmployer, 
    updateEmployer, 
    deleteEmployer,
    refreshEmployersFromSupabase,
    employerInquiries,
    addEmployerInquiry,
    updateEmployerInquiry,
    deleteEmployerInquiry
  } = useData();

  const [subTab, setSubTab] = useState<'partners' | 'inquiries'>('partners');
  const [search, setSearch] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshSuccess, setRefreshSuccess] = useState(false);
  
  // Employer Partner Modal State
  const [isEmpModalOpen, setIsEmpModalOpen] = useState(false);
  const [editingEmpId, setEditingEmpId] = useState<string | null>(null);
  const [empForm, setEmpForm] = useState<Partial<EmployerPartner>>({
    companyName: '',
    industry: 'Manufacturing & Engineering',
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

  // In-App Delete Confirmation Modal State
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'partner' | 'inquiry';
    id: string;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleRefreshSupabase = async () => {
    setIsRefreshing(true);
    try {
      await refreshEmployersFromSupabase();
      setRefreshSuccess(true);
      setTimeout(() => setRefreshSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to refresh employers from Supabase:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

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

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      if (deleteTarget.type === 'partner') {
        await deleteEmployer(deleteTarget.id);
      } else {
        await deleteEmployerInquiry(deleteTarget.id);
      }
      setDeleteTarget(null);
    } catch (err) {
      console.error('Error deleting record:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSavePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEmpId) {
      await updateEmployer(editingEmpId, empForm);
    } else {
      await addEmployer({
        companyName: empForm.companyName || 'New Client Company',
        industry: empForm.industry || 'Manufacturing & Engineering',
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

  const filteredEmployers = employers.filter(
    (e) =>
      e.companyName.toLowerCase().includes(search.toLowerCase()) ||
      e.industry.toLowerCase().includes(search.toLowerCase()) ||
      e.location.toLowerCase().includes(search.toLowerCase()) ||
      e.contactPerson.toLowerCase().includes(search.toLowerCase())
  );

  const filteredInquiries = employerInquiries.filter(
    (i) =>
      i.companyName.toLowerCase().includes(search.toLowerCase()) ||
      i.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
      i.phone.includes(search) ||
      (i.type && i.type.toLowerCase().includes(search.toLowerCase())) ||
      (i.note && i.note.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Top Banner with Supabase Sync */}
      <div className="bg-gradient-to-r from-[#0A3D91] to-[#08285c] rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#D9A21B] text-[#0A3D91] flex items-center justify-center font-black shrink-0 shadow-md">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black">Employer Data & Mandate Hub</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold border border-emerald-400/30 flex items-center gap-1">
                <Database className="w-3 h-3" /> Supabase Synchronized
              </span>
            </div>
            <p className="text-xs text-blue-100 mt-0.5">
              Manage client companies, callback requests, submitted JDs, and vetted talent sourcing inquiries.
            </p>
          </div>
        </div>

        <button
          onClick={handleRefreshSupabase}
          disabled={isRefreshing}
          className="bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white text-xs font-bold px-4 py-2.5 rounded-2xl border border-white/20 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Syncing...' : refreshSuccess ? 'Synced Successfully!' : 'Sync Supabase Data'}</span>
        </button>
      </div>

      {/* Sub Navigation Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSubTab('partners')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              subTab === 'partners'
                ? 'bg-[#0A3D91] text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Client Companies ({employers.length})</span>
          </button>
          <button
            onClick={() => setSubTab('inquiries')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              subTab === 'inquiries'
                ? 'bg-[#0A3D91] text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Hiring Enquiries & JDs ({employerInquiries.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search companies, names, phone..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
            />
          </div>

          {subTab === 'partners' && (
            <button
              onClick={handleOpenAddPartner}
              className="bg-[#0A3D91] hover:bg-[#083275] text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all whitespace-nowrap cursor-pointer"
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
              {filteredEmployers.map((emp) => {
                const jdDocumentLink = emp.jdUrl || emp.jdGoogleDriveUrl || (emp.website?.includes('storage') || emp.website?.includes('supabase') ? emp.website : null);
                return (
                <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                      <span>{emp.companyName}</span>
                      {jdDocumentLink && (
                        <span className="px-1.5 py-0.5 rounded bg-blue-50 text-[#0A3D91] text-[9px] font-black border border-blue-200 flex items-center gap-0.5" title="JD Document Attached">
                          <HardDrive className="w-2.5 h-2.5" /> JD
                        </span>
                      )}
                    </div>
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
                    {jdDocumentLink && (
                      <a
                        href={jdDocumentLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-blue-50 text-[#0A3D91] hover:bg-[#0A3D91] hover:text-white inline-block transition-colors"
                        title="View JD Document"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
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
                      onClick={() => setDeleteTarget({ type: 'partner', id: emp.id, name: emp.companyName })}
                      className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
                      title="Delete Employer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>

          {filteredEmployers.length === 0 && (
            <div className="p-8 text-center text-slate-500 font-bold text-xs">
              No client employers match your search.
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: EMPLOYER HIRING INQUIRIES & JD SUBMISSIONS */}
      {subTab === 'inquiries' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredInquiries.map((inq) => {
              const inqJdLink = inq.jdUrl || inq.jdGoogleDriveUrl || (inq.note?.includes('http') ? inq.note.match(/https?:\/\/[^\s\]]+/)?.[0] : null);
              return (
              <div
                key={inq.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0A3D91] text-[10px] font-black border border-blue-100">
                      {inq.type || 'Hiring Inquiry'}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">{inq.date}</span>
                  </div>

                  <h3 className="text-sm font-extrabold text-slate-900">{inq.companyName}</h3>
                  <div className="text-xs text-slate-700 font-bold mt-0.5">
                    Contact: {inq.contactPerson} ({inq.phone})
                  </div>
                  {inq.email && <div className="text-[11px] text-slate-500">{inq.email}</div>}

                  <div className="my-3 p-3 rounded-xl bg-slate-50 text-xs border border-slate-100 text-slate-700 space-y-1">
                    {inq.hiringUrgency && (
                      <div className="font-bold text-[#0A3D91]">Urgency: {inq.hiringUrgency}</div>
                    )}
                    {inq.preferredTime && (
                      <div className="text-slate-600">Preferred Time: {inq.preferredTime}</div>
                    )}
                    {inq.note && (
                      <p className="mt-1 text-slate-600 italic bg-white p-2 rounded-lg border border-slate-200/60">
                        "{inq.note}"
                      </p>
                    )}
                    {inq.jobDetails && (
                      <div className="mt-2 pt-2 border-t border-slate-200 text-[11px] space-y-0.5">
                        <div className="font-extrabold text-[#0A3D91]">Role: {inq.jobDetails.jobTitle}</div>
                        <div><strong>Exp Required:</strong> {inq.jobDetails.experienceRequired} | <strong>Budget:</strong> {inq.jobDetails.salaryOffered}</div>
                        {inq.jobDetails.location && <div><strong>Location:</strong> {inq.jobDetails.location}</div>}
                      </div>
                    )}
                    {inqJdLink && (
                      <div className="mt-2 pt-2 border-t border-blue-100 flex items-center justify-between">
                        <span className="text-[10px] font-extrabold text-[#0A3D91] flex items-center gap-1">
                          <HardDrive className="w-3 h-3" /> Stored in Supabase Storage
                        </span>
                        <a
                          href={inqJdLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-[#0A3D91] hover:bg-[#083275] text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" /> Open JD Document
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2 flex-wrap">
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
                      onClick={() => setDeleteTarget({ type: 'inquiry', id: inq.id, name: inq.companyName })}
                      className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
                      title="Delete Inquiry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
              );
            })}
          </div>

          {filteredInquiries.length === 0 && (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 font-bold text-xs">
              No employer inquiries or JD submissions found.
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
              Add or modify enterprise client profile and recruitment mandates. All updates sync with Supabase.
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
                  <label className="font-bold text-slate-700 block mb-1">Official Email</label>
                  <input
                    type="email"
                    value={empForm.email || ''}
                    onChange={(e) => setEmpForm({ ...empForm, email: e.target.value })}
                    placeholder="hr@company.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                  />
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
                  className="flex-1 bg-[#0A3D91] text-white py-2.5 rounded-xl font-bold hover:bg-[#083275] cursor-pointer shadow-md"
                >
                  {editingEmpId ? 'Save Client' : 'Add Client Partner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-900 mb-1">Confirm Deletion</h3>
            <p className="text-xs text-slate-600 mb-5">
              Are you sure you want to delete {deleteTarget.type === 'partner' ? 'client company' : 'inquiry'} <strong>"{deleteTarget.name}"</strong>? This will remove it from the Supabase database.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold py-2.5 rounded-xl shadow-md cursor-pointer"
              >
                {isDeleting ? 'Deleting...' : 'Delete Record'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
