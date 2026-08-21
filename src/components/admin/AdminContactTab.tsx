import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { OfficeContact, ContactMessage } from '../../types';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  MessageSquare, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  ExternalLink, 
  Building2, 
  X,
  CheckCircle2
} from 'lucide-react';

export const AdminContactTab: React.FC = () => {
  const { 
    offices, 
    addOffice, 
    updateOffice, 
    deleteOffice,
    contactMessages,
    updateContactMessage,
    deleteContactMessage,
    addContactMessage
  } = useData();

  const [subTab, setSubTab] = useState<'offices' | 'messages'>('offices');
  const [search, setSearch] = useState('');

  // Office Modal State
  const [isOfficeModalOpen, setIsOfficeModalOpen] = useState(false);
  const [editingOfficeId, setEditingOfficeId] = useState<string | null>(null);
  const [officeForm, setOfficeForm] = useState<Partial<OfficeContact>>({
    branchName: '',
    city: 'Surat',
    address: '',
    contactPerson: 'Raajesh V (Principal Consultant)',
    phone: '+91 98243 22206',
    whatsapp: '+919824322206',
    email: 'info@sarthisolutions.com',
    workingHours: 'Monday - Saturday: 8:30 AM – 7:30 PM',
    isHeadOffice: false,
    googleMapsUrl: ''
  });

  const handleOpenAddOffice = () => {
    setEditingOfficeId(null);
    setOfficeForm({
      branchName: '',
      city: 'Surat',
      address: '',
      contactPerson: 'Raajesh V',
      phone: '+91 98243 22206',
      whatsapp: '+919824322206',
      email: 'info@sarthisolutions.com',
      workingHours: 'Monday - Saturday: 8:30 AM – 7:30 PM',
      isHeadOffice: false,
      googleMapsUrl: 'https://maps.google.com/?q=Surat+Gujarat'
    });
    setIsOfficeModalOpen(true);
  };

  const handleOpenEditOffice = (office: OfficeContact) => {
    setEditingOfficeId(office.id);
    setOfficeForm(office);
    setIsOfficeModalOpen(true);
  };

  const handleDeleteOffice = (id: string, name: string) => {
    if (window.confirm(`Delete office location "${name}"?`)) {
      deleteOffice(id);
    }
  };

  const handleSaveOffice = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingOfficeId) {
      updateOffice(editingOfficeId, officeForm);
    } else {
      addOffice({
        branchName: officeForm.branchName || 'Regional Office',
        city: officeForm.city || 'Gujarat',
        address: officeForm.address || 'Industrial Area',
        contactPerson: officeForm.contactPerson || 'Raajesh V',
        phone: officeForm.phone || '+91 98243 22206',
        whatsapp: officeForm.whatsapp || '+919824322206',
        email: officeForm.email || 'contact@sarthisolutions.com',
        workingHours: officeForm.workingHours || 'Mon-Sat 9 AM - 7 PM',
        isHeadOffice: !!officeForm.isHeadOffice,
        googleMapsUrl: officeForm.googleMapsUrl || 'https://maps.google.com'
      });
    }
    setIsOfficeModalOpen(false);
  };

  const handleDeleteMessage = (id: string, name: string) => {
    if (window.confirm(`Delete message from "${name}"?`)) {
      deleteContactMessage(id);
    }
  };

  const filteredOffices = offices.filter(
    (o) =>
      o.branchName.toLowerCase().includes(search.toLowerCase()) ||
      o.city.toLowerCase().includes(search.toLowerCase()) ||
      o.address.toLowerCase().includes(search.toLowerCase())
  );

  const filteredMessages = contactMessages.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.subject.toLowerCase().includes(search.toLowerCase()) ||
      m.phone.includes(search) ||
      m.message.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Sub Navigation Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSubTab('offices')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              subTab === 'offices'
                ? 'bg-[#0A3D91] text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Office Branches ({offices.length})
          </button>
          <button
            onClick={() => setSubTab('messages')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              subTab === 'messages'
                ? 'bg-[#0A3D91] text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Direct Messages ({contactMessages.length})
          </button>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={subTab === 'offices' ? 'Search offices...' : 'Search messages...'}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
            />
          </div>

          {subTab === 'offices' && (
            <button
              onClick={handleOpenAddOffice}
              className="bg-[#0A3D91] hover:bg-[#083275] text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm transition-all whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Branch
            </button>
          )}
        </div>
      </div>

      {/* SUBTAB 1: OFFICE BRANCHES CRUD */}
      {subTab === 'offices' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredOffices.map((office) => (
            <div
              key={office.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-all relative"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                      office.isHeadOffice
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-blue-50 text-[#0A3D91]'
                    }`}
                  >
                    {office.isHeadOffice ? '★ Corporate Head Office' : 'Regional Branch'}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditOffice(office)}
                      className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-[#0A3D91] hover:text-white transition-colors cursor-pointer"
                      title="Edit Office"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteOffice(office.id, office.branchName)}
                      className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
                      title="Delete Office"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-sm font-extrabold text-slate-900 mb-1">{office.branchName}</h3>
                <div className="text-xs text-slate-600 flex items-start gap-1.5 mb-3">
                  <MapPin className="w-4 h-4 text-[#D9A21B] shrink-0 mt-0.5" />
                  <span>{office.address}</span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-700 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-500">Contact:</span> {office.contactPerson}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{office.phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3 h-3 text-slate-400" />
                    <span className="truncate">{office.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{office.workingHours}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                <a
                  href={`https://wa.me/${office.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-green-700 hover:underline flex items-center gap-1"
                >
                  <MessageSquare className="w-3 h-3" /> WhatsApp Desk
                </a>

                {office.googleMapsUrl && (
                  <a
                    href={office.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-[#0A3D91] hover:underline flex items-center gap-1"
                  >
                    View Map <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SUBTAB 2: DIRECT MESSAGES CRUD */}
      {subTab === 'messages' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMessages.map((msg) => (
              <div
                key={msg.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0A3D91] text-[10px] font-bold">
                      {msg.userType} Message
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">{msg.date}</span>
                  </div>

                  <h3 className="text-sm font-extrabold text-slate-900">{msg.subject}</h3>
                  <div className="text-xs text-slate-700 font-bold mt-0.5">
                    From: {msg.name} ({msg.phone})
                  </div>
                  <div className="text-[11px] text-slate-500">{msg.email}</div>

                  <p className="my-3 p-3 rounded-xl bg-slate-50 text-xs border border-slate-100 text-slate-700 italic">
                    "{msg.message}"
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-400">Status:</span>
                    <select
                      value={msg.status}
                      onChange={(e) =>
                        updateContactMessage(msg.id, {
                          status: e.target.value as 'New' | 'In Progress' | 'Resolved'
                        })
                      }
                      className="text-[11px] font-bold px-2 py-1 rounded-lg border border-slate-300 bg-white"
                    >
                      <option value="New">New</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`https://wa.me/91${msg.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> Reply
                    </a>
                    <button
                      onClick={() => handleDeleteMessage(msg.id, msg.name)}
                      className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
                      title="Delete Message"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredMessages.length === 0 && (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 font-bold text-xs">
              No contact messages found.
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Office Modal */}
      {isOfficeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative border border-slate-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsOfficeModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-extrabold text-[#0A3D91] mb-1">
              {editingOfficeId ? 'Edit Branch Office' : 'Add New Branch Office'}
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Configure office contact details and map coordinates shown on the Contact page.
            </p>

            <form onSubmit={handleSaveOffice} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Branch Name *</label>
                <input
                  type="text"
                  required
                  value={officeForm.branchName || ''}
                  onChange={(e) => setOfficeForm({ ...officeForm, branchName: e.target.value })}
                  placeholder="e.g. Surat Corporate & Engineering Hub"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">City / Region *</label>
                  <input
                    type="text"
                    required
                    value={officeForm.city || ''}
                    onChange={(e) => setOfficeForm({ ...officeForm, city: e.target.value })}
                    placeholder="e.g. Surat"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Contact Person *</label>
                  <input
                    type="text"
                    required
                    value={officeForm.contactPerson || ''}
                    onChange={(e) => setOfficeForm({ ...officeForm, contactPerson: e.target.value })}
                    placeholder="e.g. Raajesh V"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Physical Address *</label>
                <textarea
                  rows={2}
                  required
                  value={officeForm.address || ''}
                  onChange={(e) => setOfficeForm({ ...officeForm, address: e.target.value })}
                  placeholder="Street, Landmark, City, State, PIN"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={officeForm.phone || ''}
                    onChange={(e) => setOfficeForm({ ...officeForm, phone: e.target.value })}
                    placeholder="+91 98243 22206"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">WhatsApp Number *</label>
                  <input
                    type="text"
                    required
                    value={officeForm.whatsapp || ''}
                    onChange={(e) => setOfficeForm({ ...officeForm, whatsapp: e.target.value })}
                    placeholder="+919824322206"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={officeForm.email || ''}
                    onChange={(e) => setOfficeForm({ ...officeForm, email: e.target.value })}
                    placeholder="info@sarthisolutions.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Working Hours</label>
                  <input
                    type="text"
                    value={officeForm.workingHours || ''}
                    onChange={(e) => setOfficeForm({ ...officeForm, workingHours: e.target.value })}
                    placeholder="Mon - Sat: 8:30 AM – 7:30 PM"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Google Maps URL</label>
                <input
                  type="url"
                  value={officeForm.googleMapsUrl || ''}
                  onChange={(e) => setOfficeForm({ ...officeForm, googleMapsUrl: e.target.value })}
                  placeholder="https://maps.google.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none"
                />
              </div>

              <div className="py-1">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={!!officeForm.isHeadOffice}
                    onChange={(e) => setOfficeForm({ ...officeForm, isHeadOffice: e.target.checked })}
                    className="rounded text-[#0A3D91] focus:ring-0"
                  />
                  Mark as Primary Corporate Head Office
                </label>
              </div>

              <div className="pt-3 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsOfficeModalOpen(false)}
                  className="flex-1 bg-slate-100 text-slate-700 py-2.5 rounded-xl font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#0A3D91] text-white py-2.5 rounded-xl font-bold hover:bg-[#083275] cursor-pointer"
                >
                  {editingOfficeId ? 'Save Office' : 'Create Branch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
