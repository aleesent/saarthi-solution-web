import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SEOHead } from './components/SEOHead';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { MarqueeStrip } from './components/MarqueeStrip';
import { ServicesSection } from './components/ServicesSection';
import { JobsSection } from './components/JobsSection';
import { WhyChooseUs } from './components/WhyChooseUs';
import { RecruitmentProcess } from './components/RecruitmentProcess';
import { PlacementsSection } from './components/PlacementsSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { FAQSection } from './components/FAQSection';
import { ContactSection } from './components/ContactSection';
import { CandidatePortal } from './components/CandidatePortal';
import { EmployerPortal } from './components/EmployerPortal';
import { AdminPanel } from './components/AdminPanel';
import { LoginRegisterModal } from './components/LoginRegisterModal';
import { PageHeaderBanner } from './components/PageHeaderBanner';
import { Footer } from './components/Footer';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { 
  CheckCircle2, 
  Briefcase, 
  Building2, 
  Users, 
  Trophy, 
  MessageSquare, 
  PhoneCall, 
  ArrowRight,
  ShieldCheck,
  FileText
} from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('home');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Scroll to top when view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleApplySuccess = () => {
    showToast("Application submitted successfully! Raajesh V (+91 98243 22206) will review your profile.");
  };

  const handleNavigate = (viewId: string) => {
    setCurrentView(viewId);
  };

  // Quick navigation menu cards for Home page
  const homeNavCards = [
    {
      id: 'services',
      title: 'Our Services',
      description: 'Industrial Sourcing, Elevator Engineering, Executive Search & Payroll Management.',
      icon: <Briefcase className="w-6 h-6 text-[#0A3D91]" />,
      badge: '6 Core Services',
      color: 'bg-[#0A3D91]'
    },
    {
      id: 'employers',
      title: 'Employer Portal',
      description: 'Request a quick call back or submit your Job Description (JD) for immediate headcount deployment.',
      icon: <Building2 className="w-6 h-6 text-[#0A3D91]" />,
      badge: 'Priority Sourcing',
      color: 'bg-blue-700'
    },
    {
      id: 'jobs',
      title: 'Job Seekers',
      description: 'Explore live vacancies in Surat, Vapi & Silvassa or submit your candidate resume directly.',
      icon: <Users className="w-6 h-6 text-[#0A3D91]" />,
      badge: 'Live Openings',
      color: 'bg-[#0A3D91]'
    },
    {
      id: 'placements',
      title: 'Placements & Track Record',
      description: '10,480+ successful candidate placements across leading factories & enterprises.',
      icon: <Trophy className="w-6 h-6 text-[#0A3D91]" />,
      badge: '98.4% Success',
      color: 'bg-[#0A3D91]'
    },
    {
      id: 'testimonials',
      title: 'Client Reviews',
      description: 'Real feedback from Plant Managers, Elevator Manufacturers, and Placed Executives.',
      icon: <MessageSquare className="w-6 h-6 text-[#0A3D91]" />,
      badge: '520+ Reviews',
      color: 'bg-amber-600'
    },
    {
      id: 'contact',
      title: 'Contact & Offices',
      description: 'Connect with Principal Consultant Raajesh V at our Surat & Silvassa industrial hubs.',
      icon: <PhoneCall className="w-6 h-6 text-[#0A3D91]" />,
      badge: '+91 98243 22206',
      color: 'bg-[#0A3D91]'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 font-sans antialiased selection:bg-[#D9A21B] selection:text-[#0A3D91]">
      {/* SEO Metadata and JSON-LD schema markup */}
      <SEOHead />

      {/* Persistent Notification Toast */}
      {toastMessage && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-20 right-4 z-50 bg-[#0A3D91] text-white px-5 py-3 rounded-2xl shadow-2xl border border-[#D9A21B] flex items-center gap-2.5"
        >
          <CheckCircle2 className="w-5 h-5 text-[#D9A21B] shrink-0" />
          <span className="text-xs font-bold text-white">{toastMessage}</span>
        </motion.div>
      )}

      {/* Main Streamlined Header Capsule */}
      <Header
        currentView={currentView}
        setCurrentView={handleNavigate}
        isAdmin={isAdmin}
        setIsAdmin={setIsAdmin}
      />

      {/* Main Animated Page Routing Content */}
      <main className="min-h-screen">
        <AnimatePresence mode="wait">
          
          {/* PAGE 1: HOME PAGE */}
          {currentView === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="space-y-12"
            >
              {/* Hero Banner */}
              <Hero
                onExploreJobs={() => handleNavigate('jobs')}
                onApplyNow={() => handleNavigate('jobs')}
                onContactClick={() => handleNavigate('contact')}
              />

              {/* Ticker Marquee Strip */}
              <MarqueeStrip />

              {/* Separated Pages Feature Navigator Grid */}
              <section className="py-12 bg-slate-50/70 border-y border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center max-w-2xl mx-auto mb-10">
                    <div className="text-xs font-bold text-[#0A3D91] uppercase tracking-widest mb-1.5 flex items-center justify-center gap-2">
                      <span className="w-4 h-0.5 bg-[#D9A21B]" />
                      <span>Explore Sarthi Solutions</span>
                      <span className="w-4 h-0.5 bg-[#D9A21B]" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-[#0B192C]">
                      Browse <span className="text-[#D9A21B]">Dedicated Portals & Services</span>
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 mt-2">
                      Select a page below to view specialized solutions for employers, candidates, and industrial partners.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {homeNavCards.map((card) => (
                      <motion.div
                        key={card.id}
                        whileHover={{ y: -6, transition: { duration: 0.2 } }}
                        onClick={() => handleNavigate(card.id)}
                        className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full pointer-events-none" />

                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200/60 flex items-center justify-center group-hover:bg-[#D9A21B] transition-colors">
                              {card.icon}
                            </div>
                            <span className="px-3 py-1 rounded-full bg-blue-50 text-[#0A3D91] text-[10px] font-extrabold uppercase tracking-wider border border-blue-100">
                              {card.badge}
                            </span>
                          </div>

                          <h3 className="text-lg font-black text-slate-900 group-hover:text-[#0A3D91] transition-colors mb-2">
                            {card.title}
                          </h3>
                          <p className="text-xs text-slate-600 leading-relaxed mb-6">
                            {card.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs font-bold text-[#0A3D91] group-hover:text-[#D9A21B] transition-colors">
                          <span>Open Page</span>
                          <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Employer Call To Action Banner */}
              <section className="py-12 bg-[#0A3D91] text-white relative overflow-hidden">
                {/* Background Negative Space & Geometric Patterns */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
                <div className="absolute top-0 right-0 w-80 h-80 bg-[#D9A21B]/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/20 rounded-full blur-2xl pointer-events-none" />
                
                <svg className="absolute -bottom-10 -right-10 w-64 h-64 text-[#D9A21B]/10 pointer-events-none hidden sm:block" viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1">
                  <polygon points="100,20 180,100 100,180 20,100" />
                  <circle cx="100" cy="100" r="50" strokeDasharray="4 4" />
                </svg>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                  <div>
                    <span className="text-xs font-black text-[#D9A21B] uppercase tracking-widest block mb-1">
                      Industrial Employer Sourcing
                    </span>
                    <h3 className="text-xl sm:text-2xl font-extrabold">Need Factory Headcount or Executive Talent?</h3>
                    <p className="text-xs text-slate-200 mt-1 max-w-xl">
                      Sarthi Solutions connects plant owners in Surat, Silvassa & Vapi with pre-screened talent.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => handleNavigate('employers')}
                      className="bg-[#D9A21B] hover:bg-[#c49218] text-[#0A3D91] font-black text-xs px-6 py-3 rounded-2xl shadow-lg transition-all cursor-pointer"
                    >
                      Request A Call Back
                    </button>
                    <button
                      onClick={() => handleNavigate('employers')}
                      className="bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs px-6 py-3 rounded-2xl border border-white/20 transition-all cursor-pointer"
                    >
                      Submit A Job Description
                    </button>
                  </div>
                </div>
              </section>

              {/* Preview Highlights */}
              <ServicesSection onContactClick={() => handleNavigate('contact')} />
              <PlacementsSection />
              <RecruitmentProcess />
              <TestimonialsSection />
            </motion.div>
          )}

          {/* PAGE 2: SERVICES PAGE */}
          {currentView === 'services' && (
            <motion.div
              key="services"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
            >
              <PageHeaderBanner
                category="Services"
                title="Our Recruitment & HR Advisory Solutions"
                subtitle="End-to-end talent acquisition, executive headhunting, technical pre-screening, and payroll management for industrial plants and commercial enterprises."
                onBackToHome={() => handleNavigate('home')}
              />
              <ServicesSection onContactClick={() => handleNavigate('contact')} />
              <RecruitmentProcess />
              <FAQSection />
            </motion.div>
          )}

          {/* PAGE 3: EMPLOYERS PAGE */}
          {currentView === 'employers' && (
            <motion.div
              key="employers"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
            >
              <PageHeaderBanner
                category="Employers"
                title="Employer Hiring & Manpower Sourcing"
                subtitle="Request an immediate call back from Principal Consultant Raajesh V (+91 98243 22206) or submit your Job Description for candidate dispatch within 24-48 hours."
                onBackToHome={() => handleNavigate('home')}
              />
              <EmployerPortal />
              <WhyChooseUs />
            </motion.div>
          )}

          {/* PAGE 4: JOB SEEKERS PAGE */}
          {currentView === 'jobs' && (
            <motion.div
              key="jobs"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
            >
              <PageHeaderBanner
                category="Job Seekers"
                title="Career Vacancies & Resume Submission"
                subtitle="Search verified job openings across Surat, Silvassa, and Vapi industrial manufacturing hubs, or upload your resume for direct screening."
                onBackToHome={() => handleNavigate('home')}
              />
              
              {/* Dual View Option inside Jobs Page */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
                <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#0A3D91] text-[#D9A21B] flex items-center justify-center font-bold">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-[#0A3D91]">Want to submit your resume directly?</h3>
                      <p className="text-xs text-slate-600">Register your candidate profile in our candidate portal database.</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleNavigate('candidates')}
                    className="bg-[#0A3D91] hover:bg-[#083275] text-[#D9A21B] text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm whitespace-nowrap cursor-pointer"
                  >
                    Open Candidate Resume Portal
                  </button>
                </div>
              </div>

              <JobsSection onApplySuccess={handleApplySuccess} />
            </motion.div>
          )}

          {/* PAGE 5: CANDIDATES RESUME PORTAL */}
          {currentView === 'candidates' && (
            <motion.div
              key="candidates"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
            >
              <PageHeaderBanner
                category="Candidate Portal"
                title="Register Candidate Profile & Resume"
                subtitle="Upload your CV and share your career preferences to get matched with top industrial and corporate employers in Surat & Silvassa."
                onBackToHome={() => handleNavigate('home')}
              />
              <CandidatePortal />
            </motion.div>
          )}

          {/* PAGE 6: PLACEMENTS PAGE */}
          {currentView === 'placements' && (
            <motion.div
              key="placements"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
            >
              <PageHeaderBanner
                category="Placements"
                title="Our Placements & Proven Hiring Results"
                subtitle="Over 10,480+ professionals placed across plant management, elevator component engineering, quality control, and executive management."
                onBackToHome={() => handleNavigate('home')}
              />
              <PlacementsSection />
            </motion.div>
          )}

          {/* PAGE 7: TESTIMONIALS PAGE */}
          {currentView === 'testimonials' && (
            <motion.div
              key="testimonials"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
            >
              <PageHeaderBanner
                category="Testimonials"
                title="Client & Candidate Success Reviews"
                subtitle="Read real testimonials from manufacturing plant owners, elevator component industrialists, and placed candidates."
                onBackToHome={() => handleNavigate('home')}
              />
              <TestimonialsSection />
            </motion.div>
          )}

          {/* PAGE 8: CONTACT PAGE */}
          {currentView === 'contact' && (
            <motion.div
              key="contact"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
            >
              <PageHeaderBanner
                category="Contact"
                title="Contact Sarthi Solutions Offices"
                subtitle="Reach out to Principal Consultant Raajesh V (+91 98243 22206) at our Surat and Silvassa recruitment advisory centers."
                onBackToHome={() => handleNavigate('home')}
              />
              <ContactSection />
            </motion.div>
          )}

          {/* PAGE 9: ADMIN PANEL */}
          {(currentView === 'admin' || isAdmin) && (
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
            >
              <PageHeaderBanner
                category="Admin Dashboard"
                title="Sarthi Solutions Management Panel"
                subtitle="Manage live job postings, candidate applications, employer call back requests, and invoice generations."
                onBackToHome={() => {
                  setIsAdmin(false);
                  handleNavigate('home');
                }}
              />
              <AdminPanel />
            </motion.div>
          )}

          {/* PAGE 10: LOGIN PAGE */}
          {currentView === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
            >
              <PageHeaderBanner
                category="Portal Access"
                title="Sarthi Solutions Candidate & Admin Portal"
                subtitle="Sign in with your Candidate account or Admin ID & Password."
                onBackToHome={() => handleNavigate('home')}
              />
              <LoginRegisterModal
                onSuccess={(role) => {
                  if (role === 'Admin') {
                    setIsAdmin(true);
                    handleNavigate('admin');
                  } else {
                    handleNavigate('candidates');
                  }
                  showToast(`Logged in successfully as ${role}`);
                }}
                onClose={() => handleNavigate('home')}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Footer */}
      <Footer onNavClick={handleNavigate} />

      {/* Floating WhatsApp CTA (+91 98243 22206) */}
      <FloatingWhatsApp />
    </div>
  );
}
