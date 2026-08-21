import React from 'react';
import { BLOG_POSTS } from '../data/mockData';
import { Clock, User, ArrowRight } from 'lucide-react';

export const BlogSection: React.FC = () => {
  return (
    <section id="blog" className="py-16 sm:py-24 bg-slate-50/60 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="text-xs font-bold text-[#0A3D91] uppercase tracking-widest flex items-center gap-1.5 mb-2">
              <span className="w-4 h-0.5 bg-[#D9A21B]" />
              <span>Career Insights & Industry News</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#0B192C] tracking-tight">
              Latest <span className="text-[#D9A21B]">Recruitment Articles</span>
            </h2>
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {BLOG_POSTS.map((post) => (
            <article
              key={post.id}
              className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 bg-[#0A3D91] text-[#D9A21B] text-[10px] font-extrabold uppercase px-3 py-1 rounded-full shadow-md">
                    {post.category}
                  </span>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium mb-2">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-blue-700" />
                      {post.author}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-blue-700" />
                      {post.readTime}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 group-hover:text-[#0A3D91] transition-colors line-clamp-2 mb-2">
                    {post.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                    {post.excerpt}
                  </p>
                </div>
              </div>

              <div className="px-6 pb-6 pt-0">
                <button
                  onClick={() => alert(`Reading article: ${post.title}`)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0A3D91] group-hover:text-[#D9A21B] transition-colors cursor-pointer"
                >
                  <span>Read Full Article</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
};
