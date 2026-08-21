import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useData } from '../context/DataContext';
import { Job, FilterState } from '../types';
import { JobDetailModal } from './JobDetailModal';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  IndianRupee, 
  Filter, 
  PhoneCall, 
  Building2, 
  Clock, 
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  X
} from 'lucide-react';

interface JobsSectionProps {
  onApplySuccess: () => void;
}

export const JobsSection: React.FC<JobsSectionProps> = ({ onApplySuccess }) => {
  const { jobs } = useData();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>('All');
  
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    location: '',
    category: '',
    qualification: '',
    experience: '',
    salaryRange: '',
    employmentType: '',
    genderPreference: ''
  });

  const categories = [
    'All',
    'Manufacturing',
    'Elevator',
    'Engineering',
    'IT',
    'HR',
    'Silvassa Special',
    'Surat Urgent'
  ];

  // Filter Jobs Logic
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // Category tab
      if (activeCategoryTab === 'Manufacturing' && job.category !== 'Manufacturing') return false;
      if (activeCategoryTab === 'Elevator' && job.category !== 'Elevator') return false;
      if (activeCategoryTab === 'Engineering' && job.category !== 'Engineering') return false;
      if (activeCategoryTab === 'IT' && job.category !== 'IT') return false;
      if (activeCategoryTab === 'HR' && job.category !== 'HR') return false;
      if (activeCategoryTab === 'Silvassa Special' && !job.location.includes('Silvassa')) return false;
      if (activeCategoryTab === 'Surat Urgent' && !job.location.includes('Surat')) return false;

      // Text search
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchTitle = job.title.toLowerCase().includes(query);
        const matchComp = job.companyName.toLowerCase().includes(query);
        const matchLoc = job.location.toLowerCase().includes(query);
        const matchDesc = job.description.toLowerCase().includes(query);
        if (!matchTitle && !matchComp && !matchLoc && !matchDesc) return false;
      }

      // Location Filter
      if (filters.location && !job.location.toLowerCase().includes(filters.location.toLowerCase())) {
        return false;
      }

      // Gender Preference
      if (filters.genderPreference && job.genderPreference && job.genderPreference !== 'Any') {
        if (!job.genderPreference.includes(filters.genderPreference)) return false;
      }

      return true;
    });
  }, [activeCategoryTab, filters]);

  const clearFilters = () => {
    setFilters({
      searchQuery: '',
      location: '',
      category: '',
      qualification: '',
      experience: '',
      salaryRange: '',
      employmentType: '',
      genderPreference: ''
    });
    setActiveCategoryTab('All');
  };

  return (
    <section id="jobs" className="py-12 sm:py-20 bg-gray-100/70 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#D9A21B]/20 text-[#0A3D91] font-extrabold text-xs uppercase tracking-wider mb-2">
            <span>Verified Current Vacancies</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1F2937] tracking-tight">
            Featured <span className="text-[#0A3D91]">Job Openings</span>
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm mt-2 font-normal">
            Direct client requirements with competitive salaries, immediate interview scheduling, and official HR contacts (+91 98243 22206).
          </p>
        </div>

        {/* Search & Multi-Filter Control Bar */}
        <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-xl border border-slate-200/80 mb-8 space-y-4">
          
          {/* Main Search Row */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search job title, skills (e.g. Assistant Factory Manager, Elevator, QC, AutoCAD)..."
                value={filters.searchQuery}
                onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0A3D91] bg-slate-50/50"
              />
            </div>

            <div className="relative md:w-56">
              <MapPin className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#0A3D91]" />
              <select
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0A3D91] bg-slate-50/50 appearance-none font-medium text-slate-700"
              >
                <option value="">All Locations</option>
                <option value="Silvassa">Silvassa (D&NH)</option>
                <option value="Surat">Surat (Bhestan / Hazira)</option>
                <option value="Vapi">Vapi (GIDC)</option>
                <option value="Ankleshwar">Ankleshwar</option>
              </select>
            </div>

            <div className="relative md:w-48">
              <select
                value={filters.genderPreference}
                onChange={(e) => setFilters({ ...filters, genderPreference: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0A3D91] bg-slate-50/50 font-medium text-slate-700"
              >
                <option value="">Any Gender</option>
                <option value="Male">Male Candidates</option>
                <option value="Female">Female Candidates</option>
              </select>
            </div>

            {(filters.searchQuery || filters.location || filters.genderPreference || activeCategoryTab !== 'All') && (
              <button
                onClick={clearFilters}
                className="px-4 py-3 rounded-2xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <X className="w-4 h-4" /> Reset
              </button>
            )}
          </div>

          {/* Category Tabs Pill Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2 scrollbar-none">
            {categories.map((cat) => {
              const isActive = activeCategoryTab === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategoryTab(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#0A3D91] text-white shadow-md scale-102'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

        </div>

        {/* Job Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredJobs.map((job, idx) => (
              <motion.div
                key={job.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: idx * 0.04 }}
                whileHover={{ y: -4 }}
                className={`bg-white rounded-3xl p-6 border shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative overflow-hidden ${
                  job.isFeatured ? 'border-amber-300 bg-gradient-to-b from-amber-50/20 to-white' : 'border-gray-200'
                }`}
              >
                {/* Highlight Tag */}
                {job.isUrgent && (
                  <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-xl shadow-xs">
                    Urgent Hiring
                  </div>
                )}

                <div>
                  {/* Top Row: Category & Location */}
                  <div className="flex items-center gap-2 mb-3 pr-20">
                    <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-[#0A3D91] text-[11px] font-extrabold border border-blue-100">
                      {job.category}
                    </span>
                    <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#0A3D91]" />
                      {job.location}
                    </span>
                  </div>

                  {/* Job Title */}
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 group-hover:text-[#0A3D91] transition-colors leading-snug mb-2">
                    {job.title}
                  </h3>

                  {/* Company Name */}
                  <div className="text-xs font-bold text-slate-600 mb-4 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-[#D9A21B]" />
                    <span>{job.companyName}</span>
                  </div>

                  {/* Key Attributes Pills */}
                  <div className="grid grid-cols-2 gap-2 mb-4 bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
                    <div className="text-xs text-slate-700">
                      <span className="text-[10px] text-slate-400 block font-medium">Salary</span>
                      <span className="font-extrabold text-[#0A3D91]">{job.salary}</span>
                    </div>

                    <div className="text-xs text-slate-700">
                      <span className="text-[10px] text-slate-400 block font-medium">Experience</span>
                      <span className="font-bold">{job.experience}</span>
                    </div>

                    {job.qualification && (
                      <div className="col-span-2 text-xs text-slate-700 pt-1 border-t border-slate-100 truncate">
                        <span className="text-[10px] text-slate-400 block font-medium">Qualification</span>
                        <span className="font-medium text-slate-800">{job.qualification}</span>
                      </div>
                    )}
                  </div>

                  {/* Mandatory Industry Restriction Alert if present */}
                  {job.mandatoryIndustryExp && (
                    <div className="mb-4 text-[11px] font-bold text-amber-900 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                      Note: {job.mandatoryIndustryExp} (Freshers Not Eligible)
                    </div>
                  )}

                  {/* Preview text */}
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-6">
                    {job.description}
                  </p>
                </div>

                {/* Bottom Action Footer */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <a
                    href={`https://wa.me/919824322206?text=Hello%20Sarthi%20Solutions,%20I%20am%20interested%20in%20${encodeURIComponent(job.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#0A3D91] hover:text-[#083275]"
                  >
                    <PhoneCall className="w-3.5 h-3.5" /> WhatsApp Direct
                  </a>

                  <button
                    onClick={() => setSelectedJob(job)}
                    className="bg-[#0A3D91] hover:bg-[#083275] text-white font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-sm group-hover:bg-[#D9A21B] group-hover:text-[#0A3D91] cursor-pointer"
                  >
                    <span>View Details & Apply</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredJobs.length === 0 && (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 my-8">
            <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-800">No Job Openings Match Your Filter Criteria</h3>
            <p className="text-xs text-gray-500 mt-1 mb-4">Try clearing your search keyword or location selection.</p>
            <button
              onClick={clearFilters}
              className="bg-[#0A3D91] text-white text-xs font-bold px-5 py-2.5 rounded-full hover:bg-[#083275] cursor-pointer"
            >
              Reset All Search Filters
            </button>
          </div>
        )}

      </div>

      {/* Selected Job Detail Modal */}
      <JobDetailModal
        job={selectedJob}
        onClose={() => setSelectedJob(null)}
        onApplySuccess={onApplySuccess}
      />
    </section>
  );
};
