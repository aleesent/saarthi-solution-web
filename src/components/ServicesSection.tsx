import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useData } from '../context/DataContext';
import { Service } from '../types';
import { 
  UserCheck, 
  Users, 
  Briefcase, 
  ShieldCheck, 
  Globe, 
  FileSpreadsheet, 
  Factory, 
  FileText, 
  ArrowRight, 
  Check,
  ChevronRight,
  X
} from 'lucide-react';

interface ServicesProps {
  onSelectService?: (service: Service) => void;
  onContactClick: () => void;
}

export const ServicesSection: React.FC<ServicesProps> = ({ onSelectService, onContactClick }) => {
  const { services } = useData();
  const [selectedServiceModal, setSelectedServiceModal] = useState<Service | null>(null);

  const getServiceIcon = (name: string) => {
    switch (name) {
      case 'UserCheck': return <UserCheck className="w-6 h-6 text-[#0A3D91]" />;
      case 'Users': return <Users className="w-6 h-6 text-[#0A3D91]" />;
      case 'Briefcase': return <Briefcase className="w-6 h-6 text-[#0A3D91]" />;
      case 'ShieldCheck': return <ShieldCheck className="w-6 h-6 text-[#0A3D91]" />;
      case 'Globe': return <Globe className="w-6 h-6 text-[#0A3D91]" />;
      case 'FileSpreadsheet': return <FileSpreadsheet className="w-6 h-6 text-[#0A3D91]" />;
      case 'Factory': return <Factory className="w-6 h-6 text-[#0A3D91]" />;
      case 'FileText': return <FileText className="w-6 h-6 text-[#0A3D91]" />;
      default: return <Briefcase className="w-6 h-6 text-[#0A3D91]" />;
    }
  };

  return (
    <section id="services" className="py-12 sm:py-20 bg-slate-50/60 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="text-xs font-bold text-[#0A3D91] uppercase tracking-widest flex items-center gap-1.5 mb-2">
              <span className="w-4 h-0.5 bg-[#D9A21B]" />
              <span>Services</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1F2937] tracking-tight">
              Services <span className="text-[#0A3D91]">We Provide</span>
            </h2>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onContactClick}
            className="self-start md:self-auto bg-[#0A3D91] hover:bg-[#083275] text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-full flex items-center gap-2 transition-all shadow-md group cursor-pointer"
          >
            <span>Consult Our HR Experts</span>
            <div className="w-5 h-5 rounded-full bg-[#D9A21B] text-[#0A3D91] flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
              <ArrowRight className="w-3 h-3" />
            </div>
          </motion.button>
        </div>

        {/* Services Cards Grid with Stagger Motion */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {services.map((service, idx) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              whileHover={{ y: -6 }}
              className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
            >
              {/* Top Accent Bar on Hover */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0A3D91] to-[#D9A21B] opacity-0 group-hover:opacity-100 transition-opacity" />

              <div>
                {/* Icon Box */}
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100/80 flex items-center justify-center mb-5 group-hover:bg-[#D9A21B] group-hover:border-[#D9A21B] transition-colors duration-300">
                  {getServiceIcon(service.iconName)}
                </div>

                {/* Title */}
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mb-2.5 group-hover:text-[#0A3D91] transition-colors">
                  {service.title}
                </h3>

                {/* Short Description */}
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                  {service.shortDesc}
                </p>
              </div>

              {/* Bottom Action Link */}
              <button
                onClick={() => setSelectedServiceModal(service)}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#0A3D91] group-hover:text-[#D9A21B] transition-colors pt-4 border-t border-slate-100 cursor-pointer"
              >
                <span>Learn more</span>
                <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          ))}
        </div>

      </div>

      {/* Detail Modal for Selected Service */}
      <AnimatePresence>
        {selectedServiceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative border border-gray-100 max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setSelectedServiceModal(null)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center transition-colors font-bold"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#D9A21B] text-[#0A3D91] flex items-center justify-center">
                  {getServiceIcon(selectedServiceModal.iconName)}
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-[#0A3D91]">{selectedServiceModal.title}</h3>
                  <span className="text-xs text-[#D9A21B] font-bold uppercase tracking-wider">Sarthi Solutions Core Service</span>
                </div>
              </div>

              <p className="text-sm text-slate-700 leading-relaxed mb-6 bg-blue-50/50 p-4 rounded-2xl border border-blue-100/60">
                {selectedServiceModal.fullDesc}
              </p>

              <h4 className="text-xs font-extrabold text-[#0A3D91] uppercase tracking-wider mb-3">Key Highlights & Deliverables</h4>
              <div className="space-y-2.5 mb-8">
                {selectedServiceModal.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-800">
                    <div className="w-4 h-4 rounded-full bg-[#D9A21B] text-[#0A3D91] flex items-center justify-center mt-0.5 shrink-0 font-bold">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <a
                  href="https://wa.me/919824322206?text=Hello%20Sarthi%20Solutions,%20I%20want%20to%20inquire%20about%20your%20service."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-[#0A3D91] hover:bg-[#083275] text-white text-center py-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  Inquire via WhatsApp
                </a>
                <button
                  onClick={() => setSelectedServiceModal(null)}
                  className="px-5 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs sm:text-sm hover:bg-slate-50 cursor-pointer"
                >
                  Close
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
