import React from 'react';
import { Download, PhoneCall, CheckCircle2, Award, Users, Building, ShieldCheck, ArrowRight } from 'lucide-react';

interface AboutProps {
  onContactClick: () => void;
}

export const AboutSection: React.FC<AboutProps> = ({ onContactClick }) => {
  const stats = [
    { label: 'Candidates Placed', value: '10,000+' },
    { label: 'Hiring Companies', value: '500+' },
    { label: 'Years Experience', value: '12+' },
    { label: 'Placement Success', value: '98%' },
    { label: 'Registered Pool', value: '50,000+' }
  ];

  const handleDownloadProfile = () => {
    alert("Downloading Sarthi Solutions Company Profile PDF...");
  };

  return (
    <section id="about" className="py-16 sm:py-24 bg-[#0A3D91] text-white relative overflow-hidden">
      
      {/* Decorative Glow Elements */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#D9A21B]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#D9A21B]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column Graphic */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="relative w-full max-w-sm aspect-square flex items-center justify-center">
              
              {/* Gold Backdrop Circle */}
              <div className="absolute w-[82%] h-[82%] rounded-full bg-[#D9A21B] shadow-2xl" />

              {/* Founder/Recruiter Image cutout */}
              <div className="relative z-10 w-[88%] h-[88%] rounded-full overflow-hidden border-4 border-blue-900 shadow-2xl bg-blue-950">
                <img
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80"
                  alt="Raajesh V - Sarthi Solutions Founder"
                  className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>

              {/* Floating Arc Skill Badges */}
              <div className="absolute -bottom-4 z-20 flex flex-wrap justify-center gap-1.5 max-w-xs">
                <span className="px-3 py-1 rounded-full bg-white text-[#0A3D91] text-[10px] font-extrabold shadow-md border border-amber-300">
                  Manufacturing Hiring
                </span>
                <span className="px-3 py-1 rounded-full bg-[#D9A21B] text-[#0A3D91] text-[10px] font-extrabold shadow-md">
                  Elevator Industry Experts
                </span>
                <span className="px-3 py-1 rounded-full bg-blue-900 text-blue-100 text-[10px] font-bold border border-blue-700 shadow-md">
                  HR Compliance & Laws
                </span>
              </div>

            </div>
          </div>

          {/* Right Column Content */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Eyebrow */}
            <div className="text-xs font-bold text-[#D9A21B] uppercase tracking-widest flex items-center gap-2">
              <span className="w-5 h-0.5 bg-[#D9A21B]" />
              <span>About Us</span>
            </div>

            {/* Main Title */}
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Who is <span className="text-[#D9A21B]">Sarthi Solutions?</span>
            </h2>

            {/* Body Copy */}
            <p className="text-blue-100/90 text-sm sm:text-base leading-relaxed font-normal">
              Sarthi Solutions is an enterprise-grade Recruitment & HR Advisory firm headquartered in Gujarat with deep operational reach across South Gujarat (Surat, Vapi, Ankleshwar) and Silvassa (Dadra & Nagar Haveli). Guided by leadership from senior consultant <strong className="text-white">Raajesh V</strong>, we specialize in high-impact recruitment for manufacturing plants, elevator component manufacturers, chemical complexes, and IT firms.
            </p>

            <p className="text-blue-100/90 text-sm sm:text-base leading-relaxed">
              Whether placing Assistant Factory Managers, Sales Heads, Quality Control Executives, or AutoCAD Designers, our mission is to empower organizations with vetted talent while providing job seekers with transparent career trajectories.
            </p>

            {/* Animated Counter Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 pb-2 border-y border-blue-800/60">
              {stats.map((stat, idx) => (
                <div key={idx} className="bg-blue-900/40 p-3.5 rounded-2xl border border-blue-700/40">
                  <div className="text-2xl sm:text-3xl font-black text-[#D9A21B]">{stat.value}</div>
                  <div className="text-xs text-blue-200/80 font-medium mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Buttons & Handwritten Signature */}
            <div className="flex flex-wrap items-center justify-between gap-6 pt-2">
              <div className="flex flex-wrap gap-3">
                {/* Download Profile Button */}
                <button
                  onClick={handleDownloadProfile}
                  className="bg-[#D9A21B] hover:bg-[#c89215] text-[#0A3D91] font-extrabold text-xs sm:text-sm px-5 py-3 rounded-full flex items-center gap-2 shadow-lg transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4 text-[#0A3D91]" />
                  <span>Download Profile</span>
                </button>

                {/* Contact Recruitment Expert Button */}
                <button
                  onClick={onContactClick}
                  className="border border-blue-400/50 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-full transition-all flex items-center gap-2 cursor-pointer"
                >
                  <PhoneCall className="w-4 h-4 text-[#D9A21B]" />
                  <span>Contact Recruitment Expert</span>
                </button>
              </div>

              {/* Signature Branding */}
              <div className="flex flex-col items-end">
                <span className="font-serif italic text-xl sm:text-2xl text-[#D9A21B] tracking-wide">
                  Raajesh V
                </span>
                <span className="text-[10px] text-blue-200/80 uppercase tracking-widest font-semibold">
                  Founder & Principal Consultant
                </span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
