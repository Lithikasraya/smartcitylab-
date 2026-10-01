'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BlogItem } from '@/lib/data';
import { ArrowUpRight, Eye, Heart, Share2, Check } from 'lucide-react';
import { usePortalStore } from '@/lib/store';

interface BlogCardProps {
  blog: BlogItem;
}

export default function BlogCard({ blog }: BlogCardProps) {
  const { toggleBlogLike } = usePortalStore();
  const [likes, setLikes] = useState(blog.likes || 0);
  const [hasLiked, setHasLiked] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!hasLiked) {
      setHasLiked(true);
      setLikes((prev) => prev + 1);
      toggleBlogLike(blog.id);
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = typeof window !== 'undefined' ? `${window.location.origin}/blogs/${blog.slug}` : `/blogs/${blog.slug}`;
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <article className="group flex flex-col justify-between h-full bg-white rounded-[26px] p-3.5 border border-black/[0.06] shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_45px_rgba(0,0,0,0.08)] hover:-translate-y-1.5 transition-all duration-300">
      <Link href={`/blogs/${blog.slug}`} className="block flex-1">
        
        {/* Aspect Ratio Image Container */}
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[20px] bg-[#F3F4F6] border border-black/[0.04]">
          <img
            src={blog.coverImage}
            alt={blog.title}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
          />
          {blog.durationDays && (
            <span className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-full border border-white/20 shadow-sm">
              {blog.durationDays}
            </span>
          )}
        </div>

        {/* Content Body */}
        <div className="pt-5 pb-3 px-1.5 text-left space-y-2.5">
          {/* Category Label & View Count */}
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-bold text-[#6366F1] uppercase tracking-wider bg-indigo-50/80 border border-indigo-100/80 px-2.5 py-0.5 rounded-full">
              {blog.category || blog.tags?.[0] || 'Research'}
            </span>
            <span className="text-[12px] text-[#9CA3AF] flex items-center gap-1 font-medium">
              <Eye className="w-3.5 h-3.5" />
              {blog.views || 0}
            </span>
          </div>

          {/* Title with Diagonal Arrow Button */}
          <div className="flex items-start justify-between gap-3 pt-0.5">
            <h3 className="text-[18px] font-bold text-[#0A0A0A] leading-snug tracking-tight group-hover:text-[#2563EB] transition-colors line-clamp-2">
              {blog.title}
            </h3>
            <div className="w-7 h-7 rounded-full bg-black/[0.04] group-hover:bg-[#2563EB] group-hover:text-white flex items-center justify-center shrink-0 transition-all duration-300 mt-0.5">
              <ArrowUpRight className="w-4 h-4 text-[#6B7280] group-hover:text-white transition-colors" />
            </div>
          </div>

          {/* Excerpt */}
          <p className="text-[14px] text-[#6B7280] line-clamp-2 leading-relaxed font-normal">
            {blog.excerpt}
          </p>
        </div>
      </Link>

      {/* Author and Action Row */}
      <div className="pt-3.5 pb-1 px-1.5 border-t border-[#F3F4F6] flex items-center justify-between mt-auto">
        <div className="flex items-center gap-2.5">
          <img
            src={blog.author.avatar}
            alt={blog.author.name}
            className="w-8 h-8 rounded-full object-cover border border-[#E5E7EB] shadow-xs"
          />
          <div className="text-left leading-tight">
            <p className="text-[13px] font-bold text-[#0A0A0A] tracking-tight">
              {blog.author.name}
            </p>
            <p className="text-[11.5px] text-[#9CA3AF]">
              {blog.publishedAt}
            </p>
          </div>
        </div>

        {/* Quick Public Action Buttons: Like & Share */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleLike}
            title="Like this blog"
            className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-all ${
              hasLiked
                ? 'text-rose-600 bg-rose-50 border border-rose-200'
                : 'text-[#6B7280] hover:text-rose-600 hover:bg-[#F8F9FA] border border-transparent'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${hasLiked ? 'fill-rose-600' : ''}`} />
            <span>{likes}</span>
          </button>

          <button
            onClick={handleShare}
            title={copied ? 'Link copied!' : 'Share public link'}
            className="p-1.5 rounded-full text-[#6B7280] hover:text-[#0A0A0A] hover:bg-[#F8F9FA] transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </article>
  );
}