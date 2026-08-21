import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useData } from '../context/DataContext';
import { 
  PhoneCall, 
  MessageSquare, 
  Mail, 
  MapPin, 
  Send, 
  Clock, 
  CheckCircle2,
  Building2,
  UserCheck,
  ExternalLink
} from 'lucide-react';

export const ContactSection: React.FC = () => {
  const { offices, addContactMessage } = useData();
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [enquiry, setEnquiry] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    userType: 'Candidate' as 'Candidate' | 'Employer' | 'General',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addContactMessage({
      name: enquiry.name,
      email: enquiry.email,
      phone: enquiry.phone,
      subject: enquiry.subject,
      userType: enquiry.userType,
      message: enquiry.message,
      status: 'New'
    });
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setEnquiry({
        name: '',
        email: '',
        phone: '',
        subject: 'General Inquiry',
        userType: 'Candidate',
        message: ''
      });
    }, 4000);
  };

  return (
    <section id="contact" className="py-12 sm:py-20 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="text-xs font-bold text-[#0A3D91] uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
            <span className="w-4 h-0.5 bg-[#D9A21B]" />
            <span>Official Contact Info</span>
            <span className="w-4 h-0.5 bg-[#D9A21B]" />
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#0B192C] tracking-tight">
            Get In Touch With <span className="text-[#D9A21B]">Sarthi Solutions</span>
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm mt-2 font-normal">
            Connect directly with principal consultant Raajesh V for immediate job placement or employer hiring requirements.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Official Contact Card */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-5 bg-[#0A3D91] text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col justify-between"
          >
            {/* Background Negative Space & Geometric Patterns */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:18px_18px] pointer-events-none" />
            
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#D9A21B]/15 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/20 rounded-full blur-2xl pointer-events-none" />

            <svg className="absolute -bottom-8 -right-8 w-48 h-48 text-[#D9A21B]/10 pointer-events-none" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1">
              <circle cx="50" cy="50" r="40" strokeDasharray="3 3" />
              <polygon points="50,10 90,50 50,90 10,50" />
            </svg>

            <div className="space-y-6 relative z-10">
              
              <div>
                <span className="px-3 py-1 rounded-full bg-[#D9A21B] text-[#0A3D91] font-black text-xs uppercase tracking-wider inline-block mb-3">
                  Sarthi Solutions
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  Recruitment & Advisory
                </h3>
                <p className="text-xs text-slate-200 mt-1">
                  Connecting Talent With Opportunity across Gujarat & Silvassa.
                </p>
              </div>

              {/* Direct Info List */}
              <div className="space-y-4 pt-4 border-t border-blue-800/80">
                
                {/* Contact Person */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#D9A21B] text-[#0A3D91] flex items-center justify-center shrink-0 font-extrabold">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] text-blue-200 font-bold uppercase">Principal Consultant</div>
                    <div className="text-base font-extrabold text-white">Raajesh V</div>
                    <div className="text-xs text-slate-200">Senior Recruitment Expert</div>
                  </div>
                </div>

                {/* Phone & WhatsApp */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-800/80 text-[#D9A21B] flex items-center justify-center shrink-0">
                    <PhoneCall className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] text-blue-200 font-bold uppercase">Phone & WhatsApp Hotline</div>
                    <a
                      href="tel:+919824322206"
                      className="text-base font-extrabold text-white hover:text-[#D9A21B] transition-colors block"
                    >
                      +91 98243 22206
                    </a>
                    <div className="text-xs text-slate-200">Call / Message anytime for urgent hiring</div>
                  </div>
                </div>

                {/* Office Location */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-800/80 text-[#D9A21B] flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] text-blue-200 font-bold uppercase">Office Locations</div>
                    <div className="text-xs font-semibold text-white">
                      Bhestan Udhna Road & Ring Road, Surat, Gujarat • Silvassa Industrial Hub
                    </div>
                  </div>
                </div>

                {/* Hours */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-800/80 text-[#D9A21B] flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] text-blue-200 font-bold uppercase">Business Hours</div>
                    <div className="text-xs font-semibold text-white">
                      Monday to Saturday: 8:30 AM to 7:30 PM
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Direct WhatsApp Callout Button */}
            <div className="mt-8 pt-6 border-t border-blue-800/80">
              <a
                href="https://wa.me/919824322206?text=Hello%20Raajesh%20V,%20I%20want%20to%20inquire%20about%20Sarthi%20Solutions%20recruitment%20services."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#D9A21B] hover:bg-[#c49218] text-[#0A3D91] font-extrabold text-xs sm:text-sm py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <MessageSquare className="w-4 h-4" /> Start WhatsApp Chat (+91 98243 22206)
              </a>
            </div>

          </motion.div>

          {/* Right Column: Contact & Enquiry Form */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-7 bg-slate-50/80 rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm"
          >
            <h3 className="text-lg font-extrabold text-[#0A3D91] mb-2">Send an Instant Message</h3>
            <p className="text-xs text-slate-600 mb-6">Fill out the quick form below to submit your resume or employer hiring request.</p>

            {formSubmitted ? (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center text-[#0A3D91] my-8">
                <CheckCircle2 className="w-12 h-12 text-[#0A3D91] mx-auto mb-2 animate-bounce" />
                <h4 className="text-lg font-extrabold">Enquiry Sent Successfully!</h4>
                <p className="text-xs text-slate-700 mt-1">
                  Thank you, {enquiry.name}. Raajesh V will contact you at {enquiry.phone} shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Your Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Patel"
                      value={enquiry.name}
                      onChange={(e) => setEnquiry({ ...enquiry, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0A3D91] bg-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +91 98243 22206"
                      value={enquiry.phone}
                      onChange={(e) => setEnquiry({ ...enquiry, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0A3D91] bg-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="e.g. ramesh@gmail.com"
                      value={enquiry.email}
                      onChange={(e) => setEnquiry({ ...enquiry, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0A3D91] bg-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">I am a *</label>
                    <select
                      value={enquiry.userType}
                      onChange={(e) => setEnquiry({ ...enquiry, userType: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0A3D91] bg-white outline-none"
                    >
                      <option value="Candidate">Candidate Looking for Job</option>
                      <option value="Employer">Employer Looking to Hire</option>
                      <option value="General">General HR Advisory Inquiry</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Your Message or Hiring Requirement *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Provide details about your qualification or required vacancies..."
                    value={enquiry.message}
                    onChange={(e) => setEnquiry({ ...enquiry, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0A3D91] bg-white outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-[#0A3D91] hover:bg-[#083275] text-white font-extrabold text-xs sm:text-sm px-6 py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 w-full sm:w-auto cursor-pointer"
                >
                  <Send className="w-4 h-4 text-[#D9A21B]" /> Send Message
                </button>
              </form>
            )}
          </motion.div>

        </div>

        {/* Dynamic Branch Offices & Desks */}
        {offices && offices.length > 0 && (
          <div className="mt-14 pt-10 border-t border-slate-100">
            <div className="text-center mb-8">
              <h3 className="text-lg sm:text-xl font-extrabold text-[#0A3D91]">
                Our Branch & Liaison Network ({offices.length} Locations)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Visit or call our local industrial desks across Gujarat and Union Territory.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {offices.map((office) => (
                <div
                  key={office.id}
                  className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 flex flex-col justify-between hover:shadow-md transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        office.isHeadOffice ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-blue-50 text-[#0A3D91]'
                      }`}>
                        {office.isHeadOffice ? '★ Head Office' : 'Regional Branch'}
                      </span>
                      <span className="text-[11px] font-extrabold text-[#0A3D91]">{office.city}</span>
                    </div>

                    <h4 className="font-extrabold text-sm text-slate-900 mb-1">{office.branchName}</h4>
                    <p className="text-xs text-slate-600 mb-3 flex items-start gap-1.5">
                      <MapPin className="w-4 h-4 text-[#D9A21B] shrink-0 mt-0.5" />
                      <span>{office.address}</span>
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-200/80 space-y-1 text-xs text-slate-700">
                    <div><span className="font-bold text-slate-500">Contact:</span> {office.contactPerson}</div>
                    <div><span className="font-bold text-slate-500">Phone:</span> {office.phone}</div>
                    <div className="text-[11px] text-slate-500"><span className="font-bold">Hours:</span> {office.workingHours}</div>
                    
                    <div className="pt-2 flex items-center justify-between">
                      <a
                        href={`https://wa.me/${office.whatsapp.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-green-700 hover:underline flex items-center gap-1"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                      </a>
                      {office.googleMapsUrl && (
                        <a
                          href={office.googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-[#0A3D91] hover:underline flex items-center gap-1"
                        >
                          Map <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
