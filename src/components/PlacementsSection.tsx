import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useData } from '../context/DataContext';
import { 
  Trophy, 
  Building2, 
  CheckCircle2, 
  MapPin, 
  Briefcase, 
  Search, 
  TrendingUp, 
  UserCheck, 
  Award,
  ArrowRight
} from 'lucide-react';

export const PlacementsSection: React.FC = () => {
  const { placements, placementStats: dynamicStats } = useData();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const placementStatsList = [
    { label: 'Total Placements', value: dynamicStats.totalPlacements, icon: <Trophy className="w-5 h-5 text-[#D9A21B]" /> },
    { label: 'Partner Employers', value: dynamicStats.partnerEmployers, icon: <Building2 className="w-5 h-5 text-[#D9A21B]" /> },
    { label: 'Placement Rate', value: dynamicStats.placementRate, icon: <TrendingUp className="w-5 h-5 text-[#D9A21B]" /> },
    { label: 'Average Turnaround', value: dynamicStats.averageTurnaround, icon: <UserCheck className="w-5 h-5 text-[#D9A21B]" /> },
  ];

  const filteredPlacements = selectedCategory === 'All' 
    ? placements 
    : placements.filter(p => p.category === selectedCategory);

  return (
    <section id="placements" className="py-12 sm:py-20 bg-slate-50/70 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="text-xs font-bold text-[#0A3D91] uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
            <span className="w-4 h-0.5 bg-[#D9A21B]" />
            <span>Proven Track Record</span>
            <span className="w-4 h-0.5 bg-[#D9A21B]" />
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#0B192C] tracking-tight">
            Our Key <span className="text-[#D9A21B]">Placements & Success Stories</span>
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm mt-2 font-normal">
            Connecting thousands of qualified candidates with top manufacturing plants, elevator component manufacturers, and enterprises in Surat, Vapi, and Silvassa.
          </p>
        </div>

        {/* Highlight Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {placementStatsList.map((stat, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#0A3D91] flex items-center justify-center shrink-0">
                {stat.icon}
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-[#0A3D91]">{stat.value}</div>
                <div className="text-xs text-slate-500 font-medium">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-4 mb-8">
          {['All', 'Manufacturing', 'Elevator', 'Quality Assurance', 'Engineering', 'Administration'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#0A3D91] text-white shadow-md'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Placements Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredPlacements.map((item, idx) => (
              <motion.div
                key={item.candidate}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-3xl p-6 border border-slate-100 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#D9A21B]/10 rounded-bl-full pointer-events-none" />

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 rounded-full bg-blue-50 text-[#0A3D91] text-[10px] font-black uppercase tracking-wider border border-blue-100">
                      {item.category}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">{item.date}</span>
                  </div>

                  <h3 className="text-base font-black text-slate-900 group-hover:text-[#0A3D91] transition-colors mb-1">
                    {item.role}
                  </h3>
                  <div className="text-xs text-[#0A3D91] font-bold mb-3 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-[#D9A21B]" />
                    <span>{item.company}</span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 mb-4 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-blue-700" />
                      <span>Placed Candidate: <strong>{item.candidate}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-700" />
                      <span>Location: <strong>{item.location}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="text-xs">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Package Offered</span>
                    <span className="text-sm font-black text-[#0A3D91]">{item.salary}</span>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-bold text-blue-800 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-700" /> Verified Placement
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
};
