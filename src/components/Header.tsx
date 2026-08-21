import React, { useState } from 'react';
import { Phone, Menu, X, ArrowUpRight, User, Shield, ChevronRight } from 'lucide-react';
import { SarthiLogo } from './SarthiLogo';

interface HeaderProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  isAdmin: boolean;
  setIsAdmin: (val: boolean) => void;
  onOpenApplyModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  setCurrentView,
  isAdmin,
  setIsAdmin,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'services', label: 'Services' },
    { id: 'employers', label: 'Employers' },
    { id: 'jobs', label: 'Job Seekers' },
    { id: 'placements', label: 'Placements' },
    { id: 'testimonials', label: 'Testimonials' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleNavClick = (viewId: string) => {
    setCurrentView(viewId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-2 z-50 px-3 sm:px-6 max-w-7xl mx-auto transition-all">
      {/* Sticky Glassmorphism Navbar with White Background & Soft Shadow */}
      <div className="bg-white/95 backdrop-blur-md text-[#1F2937] rounded-2xl px-4 sm:px-6 py-2.5 shadow-lg border border-slate-200/80 flex items-center justify-between">
        
        {/* Official Brand Logo - Top Left with 12-16px padding */}
        <div className="flex items-center py-1 pr-4 sm:pr-6">
          <SarthiLogo 
            onClick={() => handleNavClick('home')}
            heightDesktop={52}
            heightMobile={40}
          />
        </div>

        {/* Desktop Menu - Centered */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 mx-auto">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`px-3 py-1.5 rounded-full text-xs xl:text-sm font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#0A3D91] text-white shadow-sm'
                    : 'text-slate-700 hover:text-[#0A3D91] hover:bg-slate-100'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Actions & Contact Us CTA */}
        <div className="flex items-center gap-2 pl-2">
          {/* Unified Login Portal Trigger */}
          <button
            onClick={() => handleNavClick(isAdmin ? 'admin' : 'login')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
              isAdmin
                ? 'bg-[#D9A21B] text-[#0A3D91] border-[#D9A21B] shadow-xs'
                : currentView === 'login'
                ? 'bg-[#0A3D91] text-white border-[#0A3D91]'
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 hover:text-[#0A3D91]'
            }`}
          >
            {isAdmin ? (
              <>
                <Shield className="w-3.5 h-3.5" />
                <span>Admin Panel</span>
              </>
            ) : (
              <>
                <User className="w-3.5 h-3.5" />
                <span>Login</span>
              </>
            )}
          </button>

          {/* Contact Us CTA Button */}
          <button
            onClick={() => handleNavClick('contact')}
            className="bg-[#0A3D91] hover:bg-[#083275] text-white font-bold text-xs sm:text-sm px-4 sm:px-5 py-2.5 rounded-full flex items-center gap-2 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer ml-1"
          >
            <span>Contact Us</span>
            <div className="w-5 h-5 rounded-full bg-[#D9A21B] text-[#0A3D91] flex items-center justify-center text-xs font-black">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors ml-1 cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-2 bg-white text-slate-800 rounded-2xl p-5 shadow-2xl border border-slate-200 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-1">
              <span className="text-xs uppercase tracking-widest text-[#0A3D91] font-bold">
                Sarthi Menu
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                Helpline: +91 98243 22206
              </span>
            </div>

            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm text-left transition-all cursor-pointer ${
                  currentView === item.id
                    ? 'bg-[#0A3D91] text-white font-bold'
                    : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <span>{item.label}</span>
                <ChevronRight className="w-4 h-4 opacity-60" />
              </button>
            ))}

            <div className="pt-3 border-t border-slate-100 mt-2 flex flex-col gap-2">
              <button
                onClick={() => handleNavClick(isAdmin ? 'admin' : 'login')}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0A3D91] text-sm font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                {isAdmin ? (
                  <>
                    <Shield className="w-4 h-4 text-[#D9A21B]" />
                    <span>Admin Control Dashboard</span>
                  </>
                ) : (
                  <>
                    <User className="w-4 h-4 text-[#0A3D91]" />
                    <span>Unified Login Portal (User & Admin)</span>
                  </>
                )}
              </button>
              
              <a
                href="https://wa.me/919824322206?text=Hello%20Sarthi%20Solutions,%20I%20am%20interested%20in%20your%20recruitment%20services."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer"
              >
                <Phone className="w-4 h-4" /> WhatsApp Us (+91 98243 22206)
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

