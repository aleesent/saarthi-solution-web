import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { SarthiLogo } from './SarthiLogo';
import { AdminDashboardTab } from './admin/AdminDashboardTab';
import { AdminServicesTab } from './admin/AdminServicesTab';
import { AdminEmployersTab } from './admin/AdminEmployersTab';
import { AdminJobSeekersTab } from './admin/AdminJobSeekersTab';
import { AdminPlacementsTab } from './admin/AdminPlacementsTab';
import { AdminTestimonialsTab } from './admin/AdminTestimonialsTab';
import { AdminContactTab } from './admin/AdminContactTab';
import { AdminInvoiceTab } from './admin/AdminInvoiceTab';
import { AdminFilesStorageTab } from './admin/AdminFilesStorageTab';
import { 
  LayoutDashboard, 
  Briefcase, 
  Building2, 
  Users, 
  Trophy, 
  Star, 
  MapPin, 
  FileSpreadsheet, 
  HardDrive,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  Bell,
  LogOut,
  SlidersHorizontal
} from 'lucide-react';

export type AdminTabType = 
  | 'dashboard' 
  | 'services' 
  | 'employers' 
  | 'job_seekers' 
  | 'placements' 
  | 'testimonials' 
  | 'contact' 
  | 'invoice'
  | 'files_storage';

interface AdminPanelProps {
  onLogout?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<AdminTabType>('dashboard');
  const { 
    services, 
    employers, 
    jobs, 
    applications, 
    placements, 
    testimonials, 
    offices, 
    storageFiles,
    resetAllToDefaults 
  } = useData();

  const handleResetData = () => {
    if (window.confirm('Reset all section data (Services, Employers, Jobs, Placements, Testimonials, Contact) back to default initial values?')) {
      resetAllToDefaults();
      alert('All sections reset to initial defaults.');
    }
  };

  const pendingTestimonialsCount = testimonials.filter((t) => t.status === 'pending' || t.is_approved === false).length;

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard, badge: null },
    { id: 'services', label: 'Services', icon: Briefcase, count: services.length },
    { id: 'employers', label: 'Employers', icon: Building2, count: employers.length },
    { id: 'job_seekers', label: 'Job Seekers', icon: Users, count: jobs.length },
    { id: 'placements', label: 'Placements', icon: Trophy, count: placements.length },
    { 
      id: 'testimonials', 
      label: 'Testimonials', 
      icon: Star, 
      count: testimonials.length, 
      badge: pendingTestimonialsCount > 0 ? `${pendingTestimonialsCount} pending` : null,
      badgeColor: pendingTestimonialsCount > 0 ? 'bg-amber-400 text-slate-900 animate-pulse' : undefined
    },
    { id: 'contact', label: 'Contact & Desks', icon: MapPin, count: offices.length },
    { id: 'invoice', label: 'Billing / Invoice', icon: FileSpreadsheet, badge: 'GST' },
    { id: 'files_storage', label: 'Files & Storage', icon: HardDrive, count: storageFiles.length, badge: 'Supabase' },
  ];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      {/* Top Header Bar */}
      <header className="bg-[#0A3D91] text-white sticky top-0 z-40 shadow-md border-b border-blue-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white px-2.5 py-1 rounded-xl shadow-xs flex items-center justify-center">
              <SarthiLogo heightDesktop={36} heightMobile={30} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-white">
                  SARTHI <span className="text-[#D9A21B]">ADMIN</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#D9A21B] text-[#0A3D91] text-[9px] font-black uppercase">
                  SINCE 2018
                </span>
              </div>
              <p className="text-[10px] text-blue-200 hidden sm:block">
                Industrial & Corporate Recruitment Operations Panel • Estd. 2018
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handleResetData}
              title="Reset data to defaults"
              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Reset Defaults</span>
            </button>

            {onLogout && (
              <button
                onClick={onLogout}
                className="text-xs font-bold px-3 py-1.5 rounded-xl bg-red-500/80 hover:bg-red-600 text-white flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto no-scrollbar border-t border-white/10">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as AdminTabType)}
                className={`py-3 px-3.5 text-xs font-extrabold whitespace-nowrap flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                  isActive
                    ? 'border-[#D9A21B] text-[#D9A21B] bg-white/10'
                    : 'border-transparent text-blue-100 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#D9A21B]' : 'text-blue-300'}`} />
                <span>{item.label}</span>
                {item.count !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                      isActive ? 'bg-[#D9A21B] text-[#0A3D91]' : 'bg-white/20 text-white'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
                {item.badge && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-black ${item.badgeColor || 'bg-amber-400 text-slate-900'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Admin Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'dashboard' && <AdminDashboardTab onNavigateTab={(tab) => setActiveTab(tab)} />}
        {activeTab === 'services' && <AdminServicesTab />}
        {activeTab === 'employers' && <AdminEmployersTab />}
        {activeTab === 'job_seekers' && <AdminJobSeekersTab />}
        {activeTab === 'placements' && <AdminPlacementsTab />}
        {activeTab === 'testimonials' && <AdminTestimonialsTab />}
        {activeTab === 'contact' && <AdminContactTab />}
        {activeTab === 'invoice' && <AdminInvoiceTab />}
        {activeTab === 'files_storage' && <AdminFilesStorageTab />}
      </main>

      {/* Admin Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500">
        <p>
          © {new Date().getFullYear()} Sarthi Solutions Management Portal • Principal Consultant: Raajesh V (+91 98243 22206)
        </p>
      </footer>
    </div>
  );
};
