import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Play, CheckCircle2, Award, Building2, Users, PhoneCall } from 'lucide-react';

interface HeroProps {
  onExploreJobs: () => void;
  onApplyNow: () => void;
  onContactClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreJobs, onApplyNow, onContactClick }) => {
  return (
    <section className="relative pt-6 pb-12 md:py-16 overflow-hidden">
      {/* Background Creative Negative Space Dot Grid & Geometric Vector Overlays */}
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#0A3D91_1px,transparent_1px)] [background-size:20px_20px] -z-10 pointer-events-none" />
      
      {/* Abstract Negative Space Wireframe Geometry */}
      <svg className="absolute -top-10 -right-10 w-96 h-96 text-[#0A3D91]/10 -z-10 pointer-events-none hidden lg:block" viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1">
        <circle cx="100" cy="100" r="90" strokeDasharray="4 4" />
        <circle cx="100" cy="100" r="70" />
        <polygon points="100,10 190,100 100,190 10,100" />
      </svg>

      {/* Background Subtle Gradient Accents */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-[#D9A21B]/15 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#0A3D91]/15 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Left Column: Copy & Actions */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="lg:col-span-7 flex flex-col items-start space-y-6"
          >
            
            {/* Eyebrow Badge */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-[#0A3D91]/20 text-[#0A3D91] text-xs font-bold tracking-wide shadow-xs"
            >
              <span className="w-2 h-2 rounded-full bg-[#D9A21B]" />
              <span>Sarthi Solutions • HR & Recruitment Advisory • Since 2018</span>
            </motion.div>

            {/* Main Headline with Gold Accent */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#1F2937] tracking-tight leading-[1.15]">
              Connecting Talent <br className="hidden sm:inline" />
              With <span className="text-[#0A3D91] relative inline-block">
                Opportunity
                <svg className="absolute -bottom-2 left-0 w-full h-3 text-[#D9A21B]" viewBox="0 0 100 20" preserveAspectRatio="none">
                  <path d="M0 15 Q 50 0, 100 15" stroke="currentColor" strokeWidth="4" fill="none" />
                </svg>
              </span>
            </h1>

            {/* Subtitle Paragraph */}
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl font-normal">
              Sarthi Solutions is Gujarat and Silvassa’s premier recruitment and HR advisory firm. We bridge the gap between ambitious professionals and top industrial manufacturers, elevator component plants, chemical complexes, IT innovators, and corporate leaders.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={onApplyNow}
                className="bg-[#D9A21B] hover:bg-[#c89215] text-[#0A3D91] font-extrabold text-sm sm:text-base px-7 py-3.5 rounded-full flex items-center gap-3 shadow-lg shadow-[#D9A21B]/25 hover:shadow-xl transition-all group cursor-pointer"
              >
                <span>Apply Now</span>
                <div className="w-6 h-6 rounded-full bg-[#0A3D91] text-white flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={onExploreJobs}
                className="border-2 border-[#0A3D91] text-[#0A3D91] hover:bg-[#0A3D91] hover:text-white font-bold text-sm sm:text-base px-7 py-3.5 rounded-full transition-all duration-200 flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <span>Explore Jobs</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>

              <a
                href="tel:+919824322206"
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#0A3D91] hover:text-[#D9A21B] transition-colors ml-2 py-2"
              >
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                  <PhoneCall className="w-4 h-4 text-[#0A3D91]" />
                </div>
                <span>+91 98243 22206</span>
              </a>
            </div>

            {/* Quick Stats Strip */}
            <div className="pt-6 border-t border-slate-200/80 w-full grid grid-cols-3 gap-4">
              <div>
                <div className="text-xl sm:text-2xl font-black text-[#0A3D91]">10,000+</div>
                <div className="text-xs text-slate-600 font-medium">Candidates Placed</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-[#0A3D91]">500+</div>
                <div className="text-xs text-slate-600 font-medium">Hiring Partners</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-[#0A3D91]">98%</div>
                <div className="text-xs text-slate-600 font-medium">Success Rate</div>
              </div>
            </div>

          </motion.div>

          {/* Right Column: Visual Layout with Floating Badges */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-5 relative flex justify-center lg:justify-end mt-4 lg:mt-0"
          >
            <div className="relative w-full max-w-md aspect-square flex items-center justify-center">
              
              {/* Gold Backdrop Circle */}
              <div className="absolute w-[82%] h-[82%] rounded-full bg-[#D9A21B] shadow-2xl -z-0 transform translate-x-2 translate-y-2" />

              {/* Main Recruiter Image */}
              <div className="relative z-10 w-[88%] h-[88%] rounded-full overflow-hidden border-4 border-white shadow-xl bg-blue-900/10">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80"
                  alt="Sarthi Solutions Recruitment Expert"
                  className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
                  loading="eager"
                />
              </div>

              {/* Floating Badges */}
              
              {/* Top-Left Floating Badge */}
              <motion.div 
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="absolute top-2 left-0 z-20 bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-2.5"
              >
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-[#0A3D91]">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-extrabold text-slate-900">10,000+ Placed</div>
                  <div className="text-[10px] text-slate-500 font-medium">Verified Candidates</div>
                </div>
              </motion.div>

              {/* Right Floating Gold Pill */}
              <motion.div 
                animate={{ y: [0, 6, 0] }}
                transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
                className="absolute top-1/3 -right-3 z-20 bg-[#D9A21B] text-[#0A3D91] px-4 py-2 rounded-full shadow-xl font-extrabold text-xs tracking-wide flex items-center gap-1.5 border border-amber-300"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Executive Search</span>
              </motion.div>

              {/* Bottom Left Blue Pill */}
              <motion.div 
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
                className="absolute bottom-8 -left-4 z-20 bg-[#0A3D91] text-white px-4 py-2 rounded-full shadow-xl font-bold text-xs tracking-wide flex items-center gap-2 border border-blue-800"
              >
                <Award className="w-4 h-4 text-[#D9A21B]" />
                <span>12+ Years Excellence</span>
              </motion.div>

              {/* Bottom Right Floating Card */}
              <motion.div 
                animate={{ y: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 3.8, ease: "easeInOut" }}
                className="absolute -bottom-2 right-4 z-20 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="text-xs font-bold text-slate-900">98% Placement Rate</div>
                  <div className="text-[10px] text-blue-700 font-medium">Verified Employers</div>
                </div>
              </motion.div>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
