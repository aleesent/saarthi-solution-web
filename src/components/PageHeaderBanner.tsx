import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Home, ChevronRight } from 'lucide-react';

interface PageHeaderBannerProps {
  title: string;
  subtitle: string;
  category: string;
  onBackToHome: () => void;
}

export const PageHeaderBanner: React.FC<PageHeaderBannerProps> = ({
  title,
  subtitle,
  category,
  onBackToHome
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-[#0A3D91] text-white py-10 px-4 sm:px-6 lg:px-8 mb-8 relative overflow-hidden rounded-b-3xl shadow-lg"
    >
      {/* Background Creative Negative Space & SVG Grid Patterns */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
      
      {/* Abstract Negative Space Lines & Geometric Polygons */}
      <svg className="absolute -top-12 -right-12 w-80 h-80 text-[#D9A21B]/15 pointer-events-none" viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1">
        <circle cx="100" cy="100" r="90" strokeDasharray="4 4" />
        <circle cx="100" cy="100" r="60" />
        <line x1="0" y1="100" x2="200" y2="100" />
        <line x1="100" y1="0" x2="100" y2="200" />
      </svg>
      <div className="absolute bottom-0 right-1/3 w-96 h-24 bg-gradient-to-r from-transparent via-[#D9A21B]/10 to-transparent -rotate-12 pointer-events-none" />

      {/* Subtle Radial Accents */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#D9A21B]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-blue-400/20 rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div>
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs text-blue-200/90 font-medium mb-3">
            <button 
              onClick={onBackToHome}
              className="flex items-center gap-1 hover:text-[#D9A21B] transition-colors cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>
            <ChevronRight className="w-3 h-3 text-blue-300" />
            <span className="text-[#D9A21B] font-bold">{category}</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#D9A21B] text-[11px] font-black uppercase tracking-wider mb-2">
            <span>{category}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            {title}
          </h1>
          
          <p className="text-xs sm:text-sm text-slate-200 mt-2 max-w-2xl font-normal leading-relaxed">
            {subtitle}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHome}
            className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-4 py-2.5 rounded-full border border-white/20 transition-all flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back To Home</span>
          </button>

          <a
            href="https://wa.me/919824322206?text=Hello%20Raajesh%20V,%20I%20am%20inquiring%20from%20your%20website."
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#D9A21B] hover:bg-[#c49218] text-[#0A3D91] font-black text-xs px-5 py-2.5 rounded-full transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <span>Direct Hotline</span>
          </a>
        </div>
      </div>
    </motion.div>
  );
};
