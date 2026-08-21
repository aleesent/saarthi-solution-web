import React, { useState } from 'react';
import { MessageSquare, X, PhoneCall } from 'lucide-react';

export const FloatingWhatsApp: React.FC = () => {
  const [openTooltip, setOpenTooltip] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {openTooltip && (
        <div className="bg-white text-slate-900 rounded-2xl p-4 shadow-2xl border border-slate-200 mb-3 max-w-xs animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-black text-[#0A3D91]">Raajesh V (Sarthi Solutions)</span>
            </div>
            <button onClick={() => setOpenTooltip(false)} className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed mb-3">
            Hello! Looking for a job or hiring industrial talent in Gujarat / Silvassa? Connect directly on WhatsApp.
          </p>
          <a
            href="https://wa.me/919824322206?text=Hello%20Raajesh%20V,%20I%20am%20contacting%20you%20from%20Sarthi%20Solutions%20website."
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors block text-center"
          >
            <MessageSquare className="w-3.5 h-3.5" /> Chat on WhatsApp (+91 98243 22206)
          </a>
        </div>
      )}

      <button
        onClick={() => setOpenTooltip(!openTooltip)}
        className="bg-emerald-500 hover:bg-emerald-600 text-white p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center border-2 border-white relative group cursor-pointer"
        aria-label="WhatsApp Recruitment Support"
      >
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#D9A21B] border-2 border-white animate-ping" />
        <MessageSquare className="w-6 h-6 fill-current" />
      </button>
    </div>
  );
};
