import React from 'react';

export const MarqueeStrip: React.FC = () => {
  const categories = [
    "Manufacturing Jobs",
    "Elevator & Engineering",
    "Assistant Factory Manager",
    "IT & Software Jobs",
    "Sales & Marketing",
    "HR & Payroll Advisory",
    "Finance & Accounts",
    "Quality Control (QC)",
    "AutoCAD Drafting",
    "Overseas Opportunities",
    "Silvassa & Surat Hiring",
    "Executive Headhunting"
  ];

  return (
    <div className="w-full bg-[#D9A21B] text-[#0A3D91] py-3 overflow-hidden shadow-sm border-y border-[#c49218]">
      <div className="flex whitespace-nowrap animate-marquee">
        {[...categories, ...categories, ...categories].map((item, index) => (
          <div key={index} className="flex items-center mx-4 sm:mx-6 font-bold text-xs sm:text-sm tracking-wider uppercase">
            <span>{item}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#0A3D91] ml-8 opacity-80" />
          </div>
        ))}
      </div>
    </div>
  );
};
