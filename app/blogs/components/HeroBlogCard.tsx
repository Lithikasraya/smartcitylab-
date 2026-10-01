'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BlogItem } from '@/lib/data';
import { ArrowUpRight, Eye, Heart, Share2, Check, Sparkles } from 'lucide-react';
import { usePortalStore } from '@/lib/store';

interface HeroBlogCardProps {
  blog: BlogItem;
}

export default function HeroBlogCard({ blog }: HeroBlogCardProps) {
  const { toggleBlogLike } = usePortalStore();
  const [likes, setLikes] = useState(blog.likes || 142);
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
    <div className="group relative w-full rounded-[32px] overflow-hidden bg-[#0A0A0A] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.25)] ring-1 ring-black/10 transition-all duration-500 hover:shadow-[0_35px_80px_-15px_rgba(0,0,0,0.35)]">
      <Link href={`/blogs/${blog.slug}`} className="block relative min-h-[480px] sm:min-h-[540px] flex flex-col justify-end">
        
        {/* Background Image with Cinematic Depth & Hover Parallax */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src={blog.coverImage}
            alt={blog.title}
            className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
          />
          {/* Multi-layered Vignette Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/98 via-black/60 to-black/20" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(99,102,241,0.2),transparent_70%)]" />
        </div>

        {/* Top Badges & Public Actions */}
        <div className="absolute top-6 left-6 right-6 z-10 flex items-center justify-between pointer-events-none">
          <span className="bg-white/15 backdrop-blur-xl text-white text-[12px] font-bold tracking-wide uppercase px-3.5 py-1.5 rounded-full border border-white/20 shadow-lg flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Featured Spotlight</span>
          </span>

          <div className="flex items-center gap-2 pointer-events-auto">
            {/* Direct Public Share Button */}
            <button
              onClick={handleShare}
              title={copied ? 'Link copied!' : 'Share public link'}
              className="bg-black/50 hover:bg-black/80 backdrop-blur-xl text-white px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border border-white/20 shadow-lg transition-all duration-200 hover:scale-105"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-white/80" />}
              <span>{copied ? 'Link Copied!' : 'Share'}</span>
            </button>

            {/* Direct Public Like Button */}
            <button
              onClick={handleLike}
              title="Like this article"
              className={`backdrop-blur-xl px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border shadow-lg transition-all duration-200 hover:scale-105 ${
                hasLiked
                  ? 'bg-rose-500/90 border-rose-400 text-white'
                  : 'bg-black/50 hover:bg-rose-500/40 border-white/20 text-white'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${hasLiked ? 'fill-white text-white' : 'text-white/80'}`} />
              <span>{likes}</span>
            </button>
          </div>
        </div>

        {/* Hero Bottom Overlay Text Content */}
        <div className="relative z-10 p-6 sm:p-12 text-left space-y-4 max-w-5xl">
          
          {/* Title with Diagonal Arrow */}
          <div className="flex items-start justify-between gap-6">
            <h2 className="text-[26px] sm:text-[38px] lg:text-[44px] font-black text-white tracking-[-0.02em] leading-[1.12] group-hover:text-blue-100 transition-colors">
              {blog.title}
            </h2>
            <div className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-xl border border-white/25 flex items-center justify-center shrink-0 group-hover:bg-white group-hover:text-black group-hover:scale-110 transition-all shadow-md">
              <ArrowUpRight className="w-5 h-5 text-white group-hover:text-black transition-colors" />
            </div>
          </div>

          {/* Excerpt */}
          <p className="text-[15px] sm:text-[17px] text-white/85 max-w-3xl leading-relaxed font-normal">
            {blog.excerpt}
          </p>

          {/* 3-Column Metadata Row matching Screenshot */}
          <div className="pt-6 border-t border-white/15 grid grid-cols-1 sm:grid-cols-3 gap-5 items-center">
            
            {/* Col 1: Written by */}
            <div className="space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-white/60 font-semibold block">
                Written by
              </span>
              <div className="flex items-center gap-2.5">
                <img
                  src={blog.author.avatar}
                  alt={blog.author.name}
                  className="w-8 h-8 rounded-full object-cover border-2 border-white/50 shadow-sm"
                />
                <span className="text-[14px] font-bold text-white tracking-tight">
                  {blog.author.name}
                </span>
              </div>
            </div>

            {/* Col 2: Published on */}
            <div className="space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-white/60 font-semibold block">
                Published on
              </span>
              <div className="flex items-center gap-2.5">
                <span className="text-[14px] font-bold text-white">
                  {blog.publishedAt}
                </span>
                <span className="text-[11px] font-medium text-white/80 flex items-center gap-1 bg-white/15 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/10">
                  <Eye className="w-3 h-3 text-blue-300" />
                  {blog.views || 0} views
                </span>
              </div>
            </div>

            {/* Col 3: Filed under */}
            <div className="space-y-1 sm:text-right">
              <span className="text-[11px] uppercase tracking-wider text-white/60 font-semibold block">
                Filed under
              </span>
              <div className="flex flex-wrap sm:justify-end gap-1.5">
                {blog.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="text-[11.5px] font-semibold px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-white border border-white/20 shadow-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

          </div>
        </div>

      </Link>
    </div>
  );
}
