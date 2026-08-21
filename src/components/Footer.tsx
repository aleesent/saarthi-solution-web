import React from 'react';
import { Phone, MessageSquare } from 'lucide-react';
import { SarthiLogo } from './SarthiLogo';

interface FooterProps {
  onNavClick: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavClick }) => {
  return (
    <footer className="bg-[#0B192C] text-white pt-16 pb-8 border-t border-slate-800/80 relative overflow-hidden">
      {/* Background Creative Negative Space SVG Dot Grid & Geometric Vector Overlays */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
      
      {/* Radial Gradient Glow Accents */}
      <div className="absolute top-0 right-10 w-96 h-96 bg-[#D9A21B]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Abstract Structural Lines */}
      <svg className="absolute -top-10 -left-10 w-64 h-64 text-[#D9A21B]/10 pointer-events-none" viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1">
        <circle cx="100" cy="100" r="80" strokeDasharray="4 4" />
        <line x1="0" y1="0" x2="200" y2="200" />
      </svg>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white p-2.5 rounded-2xl inline-block shadow-md">
              <SarthiLogo 
                onClick={() => onNavClick('home')}
                heightDesktop={48}
                heightMobile={40}
              />
            </div>

            <p className="text-xs text-slate-300 leading-relaxed max-w-sm">
              Connecting Talent With Opportunity. Sarthi Solutions is Gujarat and Silvassa’s premier recruitment consultancy specializing in Manufacturing, Elevator Engineering, IT, HR, and Executive Placement.
            </p>

            <div className="text-xs text-slate-300 space-y-1 pt-1 font-medium">
              <div>📍 Bhestan Udhna Road & Ring Road, Surat, Gujarat</div>
              <div>📍 Industrial Hub, Silvassa (D&NH)</div>
              <div>📞 Hotline & WhatsApp: <strong className="text-white">+91 98243 22206</strong></div>
              <div>👤 Principal Consultant: <strong className="text-white">Raajesh V</strong></div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-black text-[#D9A21B] uppercase tracking-widest mb-4">Quick Links</h4>
            <ul className="space-y-2 text-xs text-slate-300 font-medium">
              <li><button onClick={() => onNavClick('home')} className="hover:text-white transition-colors cursor-pointer">Home</button></li>
              <li><button onClick={() => onNavClick('about')} className="hover:text-white transition-colors cursor-pointer">About Us</button></li>
              <li><button onClick={() => onNavClick('services')} className="hover:text-white transition-colors cursor-pointer">Services</button></li>
              <li><button onClick={() => onNavClick('jobs')} className="hover:text-white transition-colors cursor-pointer">Job Openings</button></li>
              <li><button onClick={() => onNavClick('employers')} className="hover:text-white transition-colors cursor-pointer">Employers</button></li>
              <li><button onClick={() => onNavClick('candidates')} className="hover:text-white transition-colors cursor-pointer">Candidates</button></li>
            </ul>
          </div>

          {/* Key Jobs */}
          <div>
            <h4 className="text-xs font-black text-[#D9A21B] uppercase tracking-widest mb-4">Special Vacancies</h4>
            <ul className="space-y-2 text-xs text-slate-300 font-medium">
              <li><button onClick={() => onNavClick('jobs')} className="hover:text-white transition-colors text-left cursor-pointer">Assistant Factory Manager (Silvassa)</button></li>
              <li><button onClick={() => onNavClick('jobs')} className="hover:text-white transition-colors text-left cursor-pointer">Sales Head - Elevator Component (Surat)</button></li>
              <li><button onClick={() => onNavClick('jobs')} className="hover:text-white transition-colors text-left cursor-pointer">Quality Control Executive (Surat)</button></li>
              <li><button onClick={() => onNavClick('jobs')} className="hover:text-white transition-colors text-left cursor-pointer">AutoCAD Executive (Surat)</button></li>
              <li><button onClick={() => onNavClick('jobs')} className="hover:text-white transition-colors text-left cursor-pointer">Data Entry Operator (Surat)</button></li>
            </ul>
          </div>

          {/* Contact Hotline */}
          <div>
            <h4 className="text-xs font-black text-[#D9A21B] uppercase tracking-widest mb-4">Recruitment Hotline</h4>
            <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-700 space-y-3">
              <div className="text-xs text-slate-300">
                Need urgent hiring or job guidance? Call Raajesh V:
              </div>
              <a
                href="tel:+919824322206"
                className="bg-[#D9A21B] hover:bg-[#c49218] text-[#0A3D91] font-black text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all text-center block"
              >
                <Phone className="w-3.5 h-3.5" /> Call +91 98243 22206
              </a>
              <a
                href="https://wa.me/919824322206?text=Hello%20Sarthi%20Solutions,%20I%20want%20to%20inquire%20about%20recruitment."
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all text-center block"
              >
                <MessageSquare className="w-3.5 h-3.5" /> WhatsApp Message
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Rights */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <div>
            © {new Date().getFullYear()} <strong>Sarthi Solutions</strong> — Recruitment & Advisory. All rights reserved.
          </div>
          <div className="flex gap-4">
            <button onClick={() => onNavClick('privacy')} className="hover:text-white transition-colors cursor-pointer">Privacy Policy</button>
            <button onClick={() => onNavClick('terms')} className="hover:text-white transition-colors cursor-pointer">Terms of Service</button>
            <button onClick={() => onNavClick('contact')} className="hover:text-white transition-colors cursor-pointer">Sitemap</button>
          </div>
        </div>

      </div>
    </footer>
  );
};
