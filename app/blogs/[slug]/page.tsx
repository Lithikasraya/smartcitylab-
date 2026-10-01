'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import Button from '@/components/shared/Button';
import { usePortalStore } from '@/lib/store';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Eye, 
  Heart, 
  Share2, 
  Check, 
  Bookmark, 
  Award,
  ExternalLink,
  Code,
  Copy
} from 'lucide-react';

export default function BlogDetailPage() {
  const params = useParams();
  const { blogs, incrementBlogViews, toggleBlogLike } = usePortalStore();
  const slug = params?.slug as string;

  const blog = blogs.find((b) => b.slug === slug || b.id === slug) || blogs[0];

  const [likes, setLikes] = useState(blog?.likes || 0);
  const [hasLiked, setHasLiked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedCodeIdx, setCopiedCodeIdx] = useState<number | null>(null);

  // Automatically increment view count once on mount
  useEffect(() => {
    if (blog?.id) {
      incrementBlogViews(blog.id);
    }
  }, [blog?.id]);

  useEffect(() => {
    if (blog) {
      setLikes(blog.likes || 0);
    }
  }, [blog]);

  const handleLike = () => {
    if (!hasLiked && blog) {
      setHasLiked(true);
      setLikes((prev) => prev + 1);
      toggleBlogLike(blog.id);
    }
  };

  const handleShare = () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyCode = (codeText: string, idx: number) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(codeText);
      setCopiedCodeIdx(idx);
      setTimeout(() => setCopiedCodeIdx(null), 2000);
    }
  };

  if (!blog) {
    return (
      <div className="min-h-screen bg-white text-[#0A0A0A] flex flex-col font-sans">
        <Navbar />
        <main className="flex-grow flex items-center justify-center p-8">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">Article Not Found</h2>
            <Link href="/blogs">
              <Button variant="primary" size="md">Return to Resources & Insights</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Related articles (different from this one)
  const relatedBlogs = blogs.filter((b) => b.id !== blog.id && b.status === 'approved').slice(0, 3);

  return (
    <div className="min-h-screen bg-white text-[#0A0A0A] flex flex-col font-sans">
      <Navbar />

      <main className="flex-grow pt-8 pb-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          
          {/* ================= TOP NAV & ACTIONS ================= */}
          <div className="flex items-center justify-between pb-6 mb-8 border-b border-[#E5E7EB]">
            <Link
              href="/blogs"
              className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-[#6B7280] hover:text-[#0A0A0A] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Resources & Insights</span>
            </Link>

            {/* Public Interactive Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="px-3.5 py-1.5 rounded-lg border border-[#E5E7EB] hover:bg-[#F8F9FA] text-[13px] font-semibold text-[#0A0A0A] flex items-center gap-1.5 transition-colors"
                title="Share this public link"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-[#6B7280]" />}
                <span>{copied ? 'Link Copied!' : 'Share Public Link'}</span>
              </button>

              <button
                onClick={handleLike}
                className={`px-3.5 py-1.5 rounded-lg border text-[13px] font-semibold flex items-center gap-1.5 transition-colors ${
                  hasLiked
                    ? 'bg-rose-50 border-rose-300 text-rose-600'
                    : 'border-[#E5E7EB] hover:bg-[#F8F9FA] text-[#0A0A0A]'
                }`}
                title="Like article"
              >
                <Heart className={`w-4 h-4 ${hasLiked ? 'fill-rose-600 text-rose-600' : 'text-[#6B7280]'}`} />
                <span>{likes}</span>
              </button>
            </div>
          </div>

          {/* ================= HEADER SECTION ================= */}
          <header className="space-y-4 text-left">
            {/* Category and Tags */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[13px] font-bold uppercase tracking-wider text-[#6366F1] bg-indigo-50 border border-indigo-100 px-3 py-0.5 rounded-full">
                {blog.category || blog.tags?.[0] || 'Technical Paper'}
              </span>

              {blog.durationDays && (
                <span className="text-[12px] font-medium text-[#6B7280] bg-[#F8F9FA] border border-[#E5E7EB] px-2.5 py-0.5 rounded-full">
                  ⏱ Duration: {blog.durationDays}
                </span>
              )}
            </div>

            {/* Article Title */}
            <h1 className="text-[32px] sm:text-[46px] font-extrabold text-[#0A0A0A] tracking-tight leading-[1.15]">
              {blog.title}
            </h1>

            {/* Subtitle / Excerpt Callout */}
            <p className="text-[17px] sm:text-[19px] text-[#4B5563] leading-relaxed font-normal">
              {blog.excerpt}
            </p>

            {/* Author and Metadata Bar */}
            <div className="pt-6 pb-6 border-y border-[#E5E7EB] flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={blog.author.avatar}
                  alt={blog.author.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                />
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-[15px] font-bold text-[#0A0A0A]">
                      {blog.author.name}
                    </span>
                    <span className="text-[11px] font-semibold bg-[#F8F9FA] text-[#2563EB] px-2 py-0.5 rounded border border-[#E5E7EB]">
                      {blog.teamName}
                    </span>
                  </div>
                  <p className="text-[12px] text-[#6B7280]">
                    {blog.author.role} • Roll No: {blog.author.rollNo}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-[13px] text-[#6B7280]">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#9CA3AF]" />
                  {blog.publishedAt}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#9CA3AF]" />
                  {blog.readTime}
                </span>
                <span className="flex items-center gap-1.5 bg-[#F8F9FA] px-2.5 py-1 rounded-full border border-[#E5E7EB] text-[#0A0A0A] font-semibold">
                  <Eye className="w-4 h-4 text-[#2563EB]" />
                  {blog.views || 0} views
                </span>
              </div>
            </div>
          </header>

          {/* ================= HERO COVER IMAGE ================= */}
          <div className="my-8 rounded-[24px] overflow-hidden border border-[#E5E7EB] bg-[#F8F9FA] shadow-md">
            <img
              src={blog.coverImage}
              alt={blog.title}
              className="w-full max-h-[480px] object-cover"
            />
          </div>

          {/* ================= ARTICLE CONTENT RENDERING ================= */}
          <article className="prose prose-lg max-w-none text-left text-[#1F2937] leading-relaxed space-y-6 pt-2">
            {blog.content.split('\n\n').map((block, idx) => {
              const trimmed = block.trim();

              // Code block formatting
              if (trimmed.startsWith('```')) {
                const lines = trimmed.split('\n');
                const lang = lines[0].replace('```', '') || 'code';
                const codeBody = lines.slice(1, -1).join('\n');
                return (
                  <div key={idx} className="my-6 rounded-xl overflow-hidden border border-[#1E293B] bg-[#0F172A] text-white">
                    <div className="px-4 py-2 bg-[#1E293B] flex items-center justify-between text-xs text-slate-400 font-mono">
                      <span>{lang}</span>
                      <button
                        onClick={() => handleCopyCode(codeBody, idx)}
                        className="flex items-center gap-1 hover:text-white transition-colors"
                      >
                        {copiedCodeIdx === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedCodeIdx === idx ? 'Copied' : 'Copy snippet'}</span>
                      </button>
                    </div>
                    <pre className="p-4 overflow-x-auto text-[13px] font-mono leading-relaxed text-emerald-400">
                      <code>{codeBody}</code>
                    </pre>
                  </div>
                );
              }

              // H2 Header
              if (trimmed.startsWith('## ')) {
                return (
                  <h2 key={idx} className="text-[26px] font-bold text-[#0A0A0A] pt-6 pb-1 tracking-tight border-b border-[#F3F4F6]">
                    {trimmed.replace('## ', '')}
                  </h2>
                );
              }

              // H3 Header
              if (trimmed.startsWith('### ')) {
                return (
                  <h3 key={idx} className="text-[20px] font-bold text-[#0A0A0A] pt-4 tracking-tight">
                    {trimmed.replace('### ', '')}
                  </h3>
                );
              }

              // Bullet lists
              if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                const listItems = trimmed.split('\n').map((item) => item.replace(/^[-*]\s*/, ''));
                return (
                  <ul key={idx} className="space-y-2 list-disc pl-5 text-[16px] text-[#374151]">
                    {listItems.map((li, i) => (
                      <li key={i}>{li}</li>
                    ))}
                  </ul>
                );
              }

              // Standard Paragraph
              return (
                <p key={idx} className="text-[17px] text-[#374151] leading-[1.75]">
                  {trimmed}
                </p>
              );
            })}
          </article>

          {/* ================= FILED UNDER TAGS ================= */}
          <div className="pt-8 pb-4 mt-12 border-t border-[#E5E7EB] text-left">
            <span className="text-[12px] uppercase font-bold text-[#9CA3AF] tracking-wider block mb-2">
              Filed Under Topics
            </span>
            <div className="flex flex-wrap gap-2">
              {blog.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full text-[13px] font-semibold bg-[#F8F9FA] text-[#0A0A0A] border border-[#E5E7EB]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* ================= AUTHOR BIO & LAB CREDENTIALS CARD ================= */}
          <section className="mt-8 p-6 sm:p-8 rounded-2xl bg-[#F8F9FA] border border-[#E5E7EB] text-left flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <img
              src={blog.author.avatar}
              alt={blog.author.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm shrink-0"
            />
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="text-[17px] font-bold text-[#0A0A0A]">
                  {blog.author.name}
                </h4>
                <span className="text-[11px] font-semibold bg-blue-100 text-[#2563EB] px-2.5 py-0.5 rounded-full">
                  Verified Intern
                </span>
              </div>
              <p className="text-[14px] text-[#4B5563]">
                {blog.author.role} at KIET Smart City Lab ({blog.teamName}). Roll: {blog.author.rollNo}
              </p>
              <p className="text-[13px] text-[#6B7280]">
                Research documented in the Smart City Innovation Center, Academic Block C. Fully public open-access publication.
              </p>
            </div>
          </section>

          {/* ================= RELATED ARTICLES ================= */}
          {relatedBlogs.length > 0 && (
            <section className="mt-16 text-left space-y-6">
              <h3 className="text-[22px] font-bold text-[#0A0A0A] tracking-tight">
                Related Research & Articles
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedBlogs.map((item) => (
                  <Link
                    key={item.id}
                    href={`/blogs/${item.slug}`}
                    className="group block p-4 rounded-xl border border-[#E5E7EB] hover:border-[#0A0A0A] bg-white transition-all space-y-2"
                  >
                    <span className="text-[11px] font-semibold text-[#6366F1]">
                      {item.category || item.tags?.[0]}
                    </span>
                    <h5 className="text-[14px] font-bold text-[#0A0A0A] line-clamp-2 group-hover:text-[#2563EB] transition-colors">
                      {item.title}
                    </h5>
                    <p className="text-[12px] text-[#6B7280] line-clamp-2">
                      {item.excerpt}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}