import React from 'react';
import { 
  ShieldCheck, 
  Zap, 
  UserCheck, 
  Compass, 
  FileCheck, 
  Award, 
  Eye, 
  HeartHandshake 
} from 'lucide-react';

export const WhyChooseUs: React.FC = () => {
  const reasons = [
    {
      icon: <ShieldCheck className="w-6 h-6 text-[#0A3D91]" />,
      title: 'Verified Employers',
      desc: '100% genuine industrial plants, chemical companies, and corporate entities with transparent hiring practices.'
    },
    {
      icon: <Zap className="w-6 h-6 text-[#0A3D91]" />,
      title: 'Fast Recruitment Process',
      desc: 'We present pre-screened, verified candidates to employers within 24 to 48 hours for urgent openings.'
    },
    {
      icon: <UserCheck className="w-6 h-6 text-[#0A3D91]" />,
      title: 'Experienced Consultants',
      desc: 'Led by industry veteran Raajesh V with over 12 years of specialized Gujarat & Silvassa industrial hiring expertise.'
    },
    {
      icon: <Compass className="w-6 h-6 text-[#0A3D91]" />,
      title: 'Personal Career Guidance',
      desc: 'One-on-one career counseling for technical engineers, managers, and freshers to find their ideal career path.'
    },
    {
      icon: <FileCheck className="w-6 h-6 text-[#0A3D91]" />,
      title: 'Resume Assistance',
      desc: 'Free ATS-friendly resume formatting and highlighting of key industrial & commercial operational competencies.'
    },
    {
      icon: <Award className="w-6 h-6 text-[#0A3D91]" />,
      title: 'Interview Preparation',
      desc: 'Comprehensive guidance on answering technical, HR compliance, plant management, and commercial questions.'
    },
    {
      icon: <Eye className="w-6 h-6 text-[#0A3D91]" />,
      title: 'Transparent Hiring',
      desc: 'Zero hidden fees for job seekers and completely clear salary packages, working hours, and job expectations.'
    },
    {
      icon: <HeartHandshake className="w-6 h-6 text-[#0A3D91]" />,
      title: 'Dedicated Candidate Support',
      desc: 'Continuous post-placement support, onboarding assistance, and career trajectory reviews.'
    }
  ];

  return (
    <section className="py-16 sm:py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="text-xs font-bold text-[#0A3D91] uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
            <span className="w-4 h-0.5 bg-[#D9A21B]" />
            <span>Why Choose Us</span>
            <span className="w-4 h-0.5 bg-[#D9A21B]" />
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1F2937] tracking-tight">
            Why Companies & Candidates Trust <span className="text-[#0A3D91]">Sarthi Solutions</span>
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm mt-2 font-normal">
            Delivering excellence in recruitment, executive headhunting, and HR statutory advisory across Gujarat & Silvassa.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {reasons.map((item, idx) => (
            <div
              key={idx}
              className="bg-slate-50/80 rounded-2xl p-6 border border-slate-100 hover:border-[#D9A21B] hover:bg-white hover:shadow-xl transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-xl bg-[#D9A21B]/20 group-hover:bg-[#D9A21B] flex items-center justify-center mb-4 transition-colors duration-300">
                {item.icon}
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mb-2 group-hover:text-[#0A3D91] transition-colors">
                {item.title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
