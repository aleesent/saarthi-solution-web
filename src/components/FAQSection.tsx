import React, { useState } from 'react';
import { FAQS } from '../data/mockData';
import { ChevronDown, HelpCircle } from 'lucide-react';

export const FAQSection: React.FC = () => {
  const [openFaqId, setOpenFaqId] = useState<string | null>('f1');

  return (
    <section id="faq" className="py-16 sm:py-24 bg-white relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-xs font-bold text-[#0A3D91] uppercase tracking-widest mb-2 flex items-center justify-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-[#D9A21B]" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#0B192C] tracking-tight">
            Frequently Asked <span className="text-[#D9A21B]">Questions</span>
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm mt-2">
            Clear answers about applying for Assistant Factory Manager in Silvassa and Elevator Manufacturing vacancies in Surat.
          </p>
        </div>

        {/* Accordions */}
        <div className="space-y-3">
          {FAQS.map((faq) => {
            const isOpen = openFaqId === faq.id;
            return (
              <div
                key={faq.id}
                className="bg-slate-50/80 rounded-2xl border border-slate-200/80 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-[#0B192C] hover:text-[#0A3D91] cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#D9A21B]" />
                    {faq.question}
                  </span>
                  <ChevronDown className={`w-5 h-5 text-slate-400 shrink-0 transform transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#0A3D91]' : ''}`} />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-white">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
