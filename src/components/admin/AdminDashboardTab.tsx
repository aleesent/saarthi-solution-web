import React from 'react';
import { useData } from '../../context/DataContext';
import { 
  Briefcase, 
  Building2, 
  Users, 
  Trophy, 
  Star, 
  MapPin, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  MessageSquare,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

interface AdminDashboardTabProps {
  onNavigateTab: (tab: any) => void;
}

export const AdminDashboardTab: React.FC<AdminDashboardTabProps> = ({ onNavigateTab }) => {
  const { 
    jobs, 
    applications, 
    employers, 
    employerInquiries, 
    services, 
    placements, 
    testimonials, 
    offices,
    contactMessages
  } = useData();

  const urgentJobs = jobs.filter((j) => j.isUrgent).length;
  const pendingApplications = applications.filter((a) => a.status === 'Pending Review').length;
  const newInquiries = employerInquiries.filter((i) => i.status === 'New').length;
  const newMessages = contactMessages.filter((m) => m.status === 'New').length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#0A3D91] to-[#0d4ea8] text-white p-6 sm:p-7 rounded-3xl shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-900 text-[10px] font-black uppercase tracking-wider">
              Management Portal
            </span>
            <span className="text-xs text-blue-200">Raajesh V & Team</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Sarthi Solutions Central Administration
          </h2>
          <p className="text-xs text-blue-100 mt-1 max-w-xl">
            Live management hub for Services, Employers, Job Seekers, Placements, Testimonials, and Office Contacts across Surat, Silvassa, and Gujarat.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('job_seekers')}
            className="bg-[#D9A21B] hover:bg-[#c49116] text-[#0A3D91] font-black text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            + New Vacancy
          </button>
          <button
            onClick={() => onNavigateTab('employers')}
            className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-4 py-2.5 rounded-xl border border-white/20 transition-all cursor-pointer"
          >
            Manage Employers
          </button>
        </div>
      </div>

      {/* 6 Quick Action Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <button
          onClick={() => onNavigateTab('services')}
          className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-[#0A3D91] shadow-xs text-left transition-all group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0A3D91] flex items-center justify-center mb-3 group-hover:bg-[#0A3D91] group-hover:text-white transition-colors">
            <Briefcase className="w-4 h-4" />
          </div>
          <div className="text-lg font-black text-slate-900">{services.length}</div>
          <div className="text-xs font-bold text-slate-500 flex items-center justify-between">
            <span>Services</span>
            <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-[#0A3D91] transition-opacity" />
          </div>
        </button>

        <button
          onClick={() => onNavigateTab('employers')}
          className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-[#0A3D91] shadow-xs text-left transition-all group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-[#D9A21B] flex items-center justify-center mb-3 group-hover:bg-[#D9A21B] group-hover:text-[#0A3D91] transition-colors">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="text-lg font-black text-slate-900">{employers.length}</div>
          <div className="text-xs font-bold text-slate-500 flex items-center justify-between">
            <span>Employers</span>
            <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-[#0A3D91] transition-opacity" />
          </div>
        </button>

        <button
          onClick={() => onNavigateTab('job_seekers')}
          className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-[#0A3D91] shadow-xs text-left transition-all group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mb-3 group-hover:bg-purple-700 group-hover:text-white transition-colors">
            <Users className="w-4 h-4" />
          </div>
          <div className="text-lg font-black text-slate-900">{jobs.length} / {applications.length}</div>
          <div className="text-xs font-bold text-slate-500 flex items-center justify-between">
            <span>Jobs / Apps</span>
            <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-purple-700 transition-opacity" />
          </div>
        </button>

        <button
          onClick={() => onNavigateTab('placements')}
          className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-[#0A3D91] shadow-xs text-left transition-all group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-green-50 text-green-700 flex items-center justify-center mb-3 group-hover:bg-green-700 group-hover:text-white transition-colors">
            <Trophy className="w-4 h-4" />
          </div>
          <div className="text-lg font-black text-slate-900">{placements.length}</div>
          <div className="text-xs font-bold text-slate-500 flex items-center justify-between">
            <span>Placements</span>
            <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-green-700 transition-opacity" />
          </div>
        </button>

        <button
          onClick={() => onNavigateTab('testimonials')}
          className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-[#0A3D91] shadow-xs text-left transition-all group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:bg-amber-600 group-hover:text-white transition-colors">
            <Star className="w-4 h-4" />
          </div>
          <div className="text-lg font-black text-slate-900">{testimonials.length}</div>
          <div className="text-xs font-bold text-slate-500 flex items-center justify-between">
            <span>Reviews</span>
            <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-amber-600 transition-opacity" />
          </div>
        </button>

        <button
          onClick={() => onNavigateTab('contact')}
          className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-[#0A3D91] shadow-xs text-left transition-all group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-3 group-hover:bg-teal-700 group-hover:text-white transition-colors">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="text-lg font-black text-slate-900">{offices.length}</div>
          <div className="text-xs font-bold text-slate-500 flex items-center justify-between">
            <span>Offices</span>
            <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-teal-700 transition-opacity" />
          </div>
        </button>
      </div>

      {/* Actionable Alerts & Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Urgent Hiring Mandates */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
              <h3 className="text-sm font-extrabold text-slate-900">Urgent Mandates ({urgentJobs})</h3>
            </div>
            <button
              onClick={() => onNavigateTab('job_seekers')}
              className="text-xs font-bold text-[#0A3D91] hover:underline cursor-pointer"
            >
              View All Jobs →
            </button>
          </div>

          <div className="space-y-3">
            {jobs
              .filter((j) => j.isUrgent)
              .slice(0, 3)
              .map((job) => (
                <div key={job.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="font-extrabold text-xs text-slate-900">{job.title}</div>
                    <div className="text-[11px] text-slate-500">{job.companyName} • {job.location}</div>
                    <div className="text-[10px] font-bold text-[#0A3D91] mt-0.5">{job.salary}</div>
                  </div>
                  <span className="px-2 py-1 rounded bg-red-100 text-red-700 text-[10px] font-black">
                    URGENT
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* Recent Candidate Applications */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <h3 className="text-sm font-extrabold text-slate-900">Recent Applications ({applications.length})</h3>
            </div>
            <button
              onClick={() => onNavigateTab('job_seekers')}
              className="text-xs font-bold text-[#0A3D91] hover:underline cursor-pointer"
            >
              View Applications →
            </button>
          </div>

          <div className="space-y-3">
            {applications.slice(0, 3).map((app) => (
              <div key={app.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-extrabold text-xs text-slate-900">{app.candidateName}</div>
                  <div className="text-[11px] text-slate-500">Applied for: {app.jobTitle}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{app.phone} • {app.experience}</div>
                </div>
                <span className="px-2 py-1 rounded bg-blue-100 text-[#0A3D91] text-[10px] font-bold">
                  {app.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
