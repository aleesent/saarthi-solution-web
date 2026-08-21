import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useData } from '../context/DataContext';
import { Star, Quote, CheckCircle2, MessageSquare, Send, ThumbsUp } from 'lucide-react';

export const TestimonialsSection: React.FC = () => {
  const { testimonials, addTestimonial } = useData();
  const [filter, setFilter] = useState<'All' | 'Employer' | 'Candidate'>('All');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [submittedReview, setSubmittedReview] = useState(false);

  const [reviewForm, setReviewForm] = useState({
    name: '',
    company: '',
    role: '',
    rating: 5,
    type: 'Employer' as 'Employer' | 'Candidate',
    content: ''
  });

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTestimonial({
      name: reviewForm.name,
      company: reviewForm.company || 'Enterprise Partner',
      role: reviewForm.role || 'Executive',
      rating: reviewForm.rating,
      type: reviewForm.type,
      content: reviewForm.content,
      location: 'Surat / Silvassa',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    });
    setSubmittedReview(true);
    setTimeout(() => {
      setSubmittedReview(false);
      setShowReviewForm(false);
      setReviewForm({
        name: '',
        company: '',
        role: '',
        rating: 5,
        type: 'Employer',
        content: ''
      });
    }, 2500);
  };

  return (
    <section id="testimonials" className="py-12 sm:py-20 bg-slate-50/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="text-xs font-bold text-[#0A3D91] uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
            <span className="w-4 h-0.5 bg-[#D9A21B]" />
            <span>Success Stories</span>
            <span className="w-4 h-0.5 bg-[#D9A21B]" />
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#0B192C] tracking-tight">
            What Our Employers & <span className="text-[#D9A21B]">Candidates Say</span>
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm mt-2 font-normal">
            Real feedback from Gujarat & Silvassa plant managers, elevator manufacturers, and placed candidates.
          </p>

          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="bg-[#0A3D91] hover:bg-[#083275] text-white font-bold text-xs px-5 py-2.5 rounded-full shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-[#D9A21B]" />
              <span>{showReviewForm ? 'Close Review Form' : 'Write A Review'}</span>
            </button>
          </div>
        </div>

        {/* Review Form Drawer */}
        <AnimatePresence>
          {showReviewForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl mb-12 max-w-2xl mx-auto overflow-hidden"
            >
              <h3 className="text-lg font-black text-[#0A3D91] mb-1">Submit Your Testimonial / Feedback</h3>
              <p className="text-xs text-slate-500 mb-6">Share your experience with Sarthi Solutions recruitment services.</p>

              {submittedReview ? (
                <div className="p-6 bg-blue-50 rounded-2xl text-center text-[#0A3D91] border border-blue-200">
                  <CheckCircle2 className="w-10 h-10 text-[#0A3D91] mx-auto mb-2 animate-bounce" />
                  <h4 className="font-bold text-sm">Thank You For Your Review!</h4>
                  <p className="text-xs text-slate-700 mt-1">Your feedback has been submitted to Sarthi Solutions moderation team.</p>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Your Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Anand Patel"
                        value={reviewForm.name}
                        onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none bg-white text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Company / Organization *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Universal Elevator Components"
                        value={reviewForm.company}
                        onChange={(e) => setReviewForm({ ...reviewForm, company: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none bg-white text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Designation / Role *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Managing Director / Quality Lead"
                        value={reviewForm.role}
                        onChange={(e) => setReviewForm({ ...reviewForm, role: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none bg-white text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Feedback Type</label>
                      <select
                        value={reviewForm.type}
                        onChange={(e) => setReviewForm({ ...reviewForm, type: e.target.value as 'Employer' | 'Candidate' })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none bg-white text-slate-900"
                      >
                        <option value="Employer">Employer Client</option>
                        <option value="Candidate">Placed Candidate</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Rating *</label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                          className="p-1 hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Star className={`w-6 h-6 ${star <= reviewForm.rating ? 'fill-[#D9A21B] text-[#D9A21B]' : 'text-slate-300'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Your Review / Experience *</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Share how Sarthi Solutions helped with your hiring or job search..."
                      value={reviewForm.content}
                      onChange={(e) => setReviewForm({ ...reviewForm, content: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0A3D91] outline-none bg-white text-slate-900"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#0A3D91] hover:bg-[#083275] text-white font-bold text-xs py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4 text-[#D9A21B]" /> Submit Review
                  </button>
                </form>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Testimonials Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials
            .filter((t) => filter === 'All' || t.type === filter)
            .map((t, idx) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative group"
              >
                <Quote className="w-8 h-8 text-[#D9A21B]/40 absolute top-6 right-6" />

                <div>
                  {/* Rating Stars */}
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(t.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#D9A21B] text-[#D9A21B]" />
                    ))}
                  </div>

                  {/* Content */}
                  <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed mb-6">
                    "{t.content}"
                  </p>
                </div>

                {/* Author Footer */}
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <img
                    src={t.image || t.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt={t.name}
                    className="w-11 h-11 rounded-full object-cover border-2 border-[#D9A21B]"
                  />
                  <div>
                    <div className="text-sm font-extrabold text-slate-900 flex items-center gap-1">
                      <span>{t.name}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-700 inline" />
                    </div>
                    <div className="text-xs text-slate-500 font-medium">{t.role}, {t.company}</div>
                  </div>
                </div>
              </motion.div>
            ))}
        </div>

      </div>
    </section>
  );
};
