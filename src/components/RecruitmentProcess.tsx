import React from 'react';
import { 
  UserPlus, 
  Upload, 
  SearchCheck, 
  UserCheck, 
  Wrench, 
  Award, 
  FileText, 
  CheckCircle2 
} from 'lucide-react';

export const RecruitmentProcess: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Register',
      desc: 'Create your candidate profile on Sarthi Solutions portal with contact info.',
      icon: <UserPlus className="w-5 h-5 text-[#0A3D91]" />
    },
    {
      num: '02',
      title: 'Upload Resume',
      desc: 'Submit your updated resume with qualification & technical experience details.',
      icon: <Upload className="w-5 h-5 text-[#0A3D91]" />
    },
    {
      num: '03',
      title: 'Profile Screening',
      desc: 'Our HR experts evaluate your skills against employer requirements.',
      icon: <SearchCheck className="w-5 h-5 text-[#0A3D91]" />
    },
    {
      num: '04',
      title: 'HR Interview',
      desc: 'Telephonic or video interview to assess communication and commercial fitment.',
      icon: <UserCheck className="w-5 h-5 text-[#0A3D91]" />
    },
    {
      num: '05',
      title: 'Technical Interview',
      desc: 'In-person meeting with plant heads or executive client management.',
      icon: <Wrench className="w-5 h-5 text-[#0A3D91]" />
    },
    {
      num: '06',
      title: 'Final Selection',
      desc: 'Client confirms selection and salary package negotiation is finalized.',
      icon: <Award className="w-5 h-5 text-[#0A3D91]" />
    },
    {
      num: '07',
      title: 'Offer Letter',
      desc: 'Official appointment letter issued with detailed terms and benefits.',
      icon: <FileText className="w-5 h-5 text-[#0A3D91]" />
    },
    {
      num: '08',
      title: 'Joining',
      desc: 'Onboarding support on Day 1 at client plant or corporate office.',
      icon: <CheckCircle2 className="w-5 h-5 text-[#0A3D91]" />
    }
  ];

  return (
    <section className="py-16 sm:py-24 bg-[#0A3D91] text-white relative overflow-hidden">
      {/* Background Creative Negative Space & SVG Grid Patterns */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
      
      {/* Radial Gradient Glow Blobs */}
      <div className="absolute -top-20 -left-20 w-96 h-96 bg-[#D9A21B]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />

      {/* Abstract Negative Space Wireframe Geometric Polygons */}
      <svg className="absolute top-12 right-12 w-64 h-64 text-[#D9A21B]/10 pointer-events-none hidden lg:block" viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1">
        <polygon points="100,10 190,60 190,160 100,190 10,160 10,60" />
        <polygon points="100,40 160,75 160,145 100,165 40,145 40,75" />
        <circle cx="100" cy="100" r="30" strokeDasharray="4 4" />
      </svg>
      <svg className="absolute bottom-10 left-10 w-48 h-48 text-white/5 pointer-events-none hidden lg:block" viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1.5">
        <line x1="0" y1="0" x2="200" y2="200" strokeDasharray="6 6" />
        <line x1="200" y1="0" x2="0" y2="200" strokeDasharray="6 6" />
        <circle cx="100" cy="100" r="60" />
      </svg>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="text-xs font-bold text-[#D9A21B] uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
            <span className="w-4 h-0.5 bg-[#D9A21B]" />
            <span>Structured Placement Journey</span>
            <span className="w-4 h-0.5 bg-[#D9A21B]" />
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Our 8-Step <span className="text-[#D9A21B]">Recruitment Process</span>
          </h2>
          <p className="text-slate-200 text-xs sm:text-sm mt-2 font-normal">
            A seamless, transparent roadmap ensuring zero friction from initial registration to successful onboarding.
          </p>
        </div>

        {/* Timeline Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="bg-blue-950/70 backdrop-blur-md rounded-2xl p-6 border border-blue-700/50 hover:border-[#D9A21B] hover:bg-blue-900/90 transition-all duration-300 relative group flex flex-col justify-between overflow-hidden shadow-lg"
            >
              {/* Negative Space Gold Corner Cut Accent */}
              <div className="absolute top-0 right-0 w-12 h-12 bg-[#D9A21B]/10 rounded-bl-3xl pointer-events-none group-hover:bg-[#D9A21B]/20 transition-colors" />

              {/* Step Number Circle */}
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-[#D9A21B] flex items-center justify-center font-bold text-sm shadow-md group-hover:scale-105 transition-transform">
                  {step.icon}
                </div>
                <span className="text-2xl font-black text-blue-300/60 group-hover:text-[#D9A21B] transition-colors">
                  {step.num}
                </span>
              </div>

              <div className="relative z-10">
                <h3 className="text-base font-extrabold text-white mb-2 group-hover:text-[#D9A21B] transition-colors">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-200/90 leading-relaxed">
                  {step.desc}
                </p>
              </div>

              {/* Progress Connector Indicator */}
              <div className="mt-4 pt-3 border-t border-blue-800/80 text-[10px] text-blue-200 font-bold uppercase tracking-wider flex items-center justify-between relative z-10">
                <span>Step {idx + 1} of 8</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#D9A21B]" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
