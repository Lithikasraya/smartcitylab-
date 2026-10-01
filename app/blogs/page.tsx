'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import { usePortalStore } from '@/lib/store';
import {
  Search, Clock, Eye, Heart, ArrowRight, BookOpen,
  ExternalLink, Tag, Sparkles
} from 'lucide-react';

const CATEGORIES = [
  'View all',
  'Design',
  'Software Engineering',
  'Edge AI & Vision',
  'IoT & Sensors',
  'Green Energy',
  'Smart Mobility',
  'Product',
];

// Placeholder covers by category (Unsplash)
const CATEGORY_COVERS: Record<string, string> = {
  'Design':              'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
  'Software Engineering':'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
  'Edge AI & Vision':    'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80',
  'IoT & Sensors':       'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
  'Green Energy':        'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&q=80',
  'Smart Mobility':      'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80',
  'Product':             'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&q=80',
};

const DEFAULT_COVER = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80';

const CAT_COLOR: Record<string, string> = {
  'Design':              'text-violet-600',
  'Software Engineering':'text-blue-600',
  'Edge AI & Vision':    'text-indigo-600',
  'IoT & Sensors':       'text-cyan-600',
  'Green Energy':        'text-emerald-600',
  'Smart Mobility':      'text-orange-600',
  'Product':             'text-rose-600',
};

function formatDate(d: string) {
  try { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }
  catch { return d; }
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};
const stagger: Variants = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

export default function BlogsPage() {
  const { blogs } = usePortalStore();
  const [category, setCategory] = useState('View all');
  const [search, setSearch]     = useState('');

  const publicBlogs = useMemo(() =>
    blogs.filter((b) => b.status === 'approved' && b.isVisible !== false), [blogs]);

  const featured = useMemo(() =>
    publicBlogs.find((b) => b.isFeatured) || publicBlogs[0], [publicBlogs]);

  const grid = useMemo(() => {
    let list = publicBlogs.filter((b) => b.id !== featured?.id);
    if (category !== 'View all') {
      list = publicBlogs.filter((b) =>
        b.category?.toLowerCase() === category.toLowerCase() ||
        b.tags?.some((t) => t.toLowerCase() === category.toLowerCase())
      );
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((b) =>
        b.title.toLowerCase().includes(q) ||
        b.excerpt.toLowerCase().includes(q) ||
        b.author.name.toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }, [publicBlogs, featured, category, search]);

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      <Navbar />

      <main className="flex-grow pt-20">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">

          {/* ── Page header ── */}
          <div className="pt-10 pb-10 border-b border-gray-100">
            <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-2">Our blog</p>
            <h1 className="text-[42px] sm:text-[54px] font-black tracking-tight text-gray-900 leading-[1.05] mb-3">
              Resources and insights
            </h1>
            <p className="text-[17px] text-gray-500">The latest research, interviews, technologies, and resources.</p>
          </div>

          {/* ── Main layout: sidebar + content ── */}
          <div className="flex gap-10 py-12">

            {/* ── LEFT SIDEBAR ── */}
            <aside className="hidden lg:block w-52 shrink-0">
              <div className="sticky top-24 space-y-6">
                {/* Search */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search"
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                  {search && (
                    <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs hover:text-gray-700">✕</button>
                  )}
                </div>

                {/* Category list */}
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">Blog categories</p>
                  <div className="space-y-0.5">
                    {CATEGORIES.map((cat) => {
                      const active = category === cat;
                      return (
                        <button
                          key={cat}
                          onClick={() => setCategory(cat)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-[13.5px] font-medium transition-all duration-150 ${
                            active
                              ? 'bg-blue-50 text-blue-700 font-semibold'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                        >
                          {cat}
                          {active && (
                            <span className="ml-2 inline-block w-1 h-1 rounded-full bg-blue-600 align-middle" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </aside>

            {/* ── RIGHT MAIN CONTENT ── */}
            <div className="flex-1 min-w-0">

              {/* ── Mobile category pills ── */}
              <div className="lg:hidden flex gap-2 overflow-x-auto pb-4 mb-6">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`shrink-0 px-3.5 py-1.5 rounded-full text-[12.5px] font-semibold border transition-all ${
                      category === cat
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'border-gray-200 text-gray-600 bg-white hover:border-gray-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {publicBlogs.length === 0 && (
                <div className="text-center py-24 rounded-3xl border border-dashed border-gray-200 bg-gray-50/60">
                  <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-4" />
                  <p className="text-[16px] font-semibold text-gray-500">No posts published yet.</p>
                </div>
              )}

              {/* ── Featured hero post (top full-width) ── */}
              {featured && category === 'View all' && !search && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="mb-10"
                >
                  <Link href={`/blogs/${featured.slug}`} className="group block">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden hover:border-gray-200 hover:shadow-md transition-all duration-200">
                      {/* Image */}
                      <div className="aspect-[4/3] md:aspect-[3/2] overflow-hidden">
                        <img
                          src={featured.coverImage || CATEGORY_COVERS[featured.category ?? ''] || DEFAULT_COVER}
                          alt={featured.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                          onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_COVER; }}
                        />
                      </div>
                      {/* Content */}
                      <div className="p-7">
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`text-[11px] font-bold uppercase tracking-wide ${CAT_COLOR[featured.category ?? ''] || 'text-blue-600'}`}>
                            {featured.category || 'Research'}
                          </span>
                          {featured.readTime && (
                            <><span className="text-gray-300">·</span><span className="text-[11px] text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {featured.readTime} min read</span></>
                          )}
                        </div>
                        <h2 className="text-[22px] font-black text-gray-900 leading-tight mb-3 group-hover:text-blue-600 transition-colors">
                          {featured.title}
                        </h2>
                        <p className="text-[13.5px] text-gray-500 leading-relaxed line-clamp-3 mb-5">
                          {featured.excerpt}
                        </p>
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-200 to-indigo-200 flex items-center justify-center text-[10px] font-black text-blue-800">
                            {featured.author.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <div className="text-[12px] font-semibold text-gray-800">{featured.author.name}</div>
                            <div className="text-[10px] text-gray-400">{formatDate(featured.publishedAt)}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )}

              {/* ── Grid of blog cards ── */}
              {grid.length === 0 ? (
                <div className="text-center py-20 rounded-2xl border border-dashed border-gray-200">
                  <Sparkles className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                  <p className="text-[15px] font-semibold text-gray-500 mb-1">No articles found</p>
                  <p className="text-[13px] text-gray-400">
                    {search ? `Nothing matched "${search}"` : `No posts in "${category}" yet.`}
                  </p>
                  {search && <button onClick={() => setSearch('')} className="mt-3 text-[13px] font-semibold text-blue-600 hover:underline">Clear search</button>}
                </div>
              ) : (
                <motion.div
                  variants={stagger}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8"
                >
                  {grid.map((blog) => {
                    const cover = blog.coverImage || CATEGORY_COVERS[blog.category ?? ''] || DEFAULT_COVER;
                    const catColor = CAT_COLOR[blog.category ?? ''] || 'text-blue-600';

                    return (
                      <motion.article
                        key={blog.id}
                        variants={fadeUp}
                        className="group flex flex-col"
                      >
                        {/* Cover image */}
                        <Link href={`/blogs/${blog.slug}`} className="block overflow-hidden rounded-xl mb-4 aspect-video">
                          <img
                            src={cover}
                            alt={blog.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                            onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_COVER; }}
                          />
                        </Link>

                        {/* Meta */}
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-[11px] font-bold uppercase tracking-wide ${catColor}`}>
                            {blog.category || 'Research'}
                          </span>
                          {blog.readTime && (
                            <><span className="text-gray-300 text-[10px]">·</span><span className="text-[11px] text-gray-400">{blog.readTime} min read</span></>
                          )}
                          {blog.isFeatured && (
                            <span className="text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100 px-1.5 py-0.5 rounded-full ml-1">Featured</span>
                          )}
                        </div>

                        {/* Title */}
                        <Link href={`/blogs/${blog.slug}`}>
                          <h3 className="text-[17px] font-bold text-gray-900 leading-snug mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                            {blog.title}
                          </h3>
                        </Link>

                        <p className="text-[13px] text-gray-500 leading-relaxed line-clamp-2 mb-4">
                          {blog.excerpt}
                        </p>

                        {/* Author + stats row */}
                        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                          <div className="flex items-center gap-2.5">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-[9px] font-black text-gray-700">
                              {blog.author.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                            </div>
                            <div>
                              <div className="text-[11.5px] font-semibold text-gray-800">{blog.author.name}</div>
                              <div className="text-[10px] text-gray-400">{formatDate(blog.publishedAt)}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-gray-400">
                            {blog.views != null && <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{blog.views}</span>}
                            {blog.likes != null && <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{blog.likes}</span>}
                            <Link href={`/blogs/${blog.slug}`} className="text-blue-500 hover:text-blue-700">
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      </motion.article>
                    );
                  })}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}