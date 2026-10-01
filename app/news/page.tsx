'use client';

import React, { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import { usePortalStore } from '@/lib/store';
import { NewsItem } from '@/lib/data';
import {
  Radio, ArrowRight, Heart, Share2, Check,
  Clock, Tag, Flame, Newspaper, X
} from 'lucide-react';

const CATEGORIES = ['All', 'Lab Update', 'Achievement', 'Announcement', 'Hackathon'];

const CAT_BADGE: Record<string, { bg: string; text: string; dot: string }> = {
  'Lab Update':    { bg: 'bg-blue-50',    text: 'text-blue-700',   dot: 'bg-blue-500' },
  'Achievement':   { bg: 'bg-emerald-50', text: 'text-emerald-700',dot: 'bg-emerald-500' },
  'Announcement':  { bg: 'bg-violet-50',  text: 'text-violet-700', dot: 'bg-violet-500' },
  'Hackathon':     { bg: 'bg-orange-50',  text: 'text-orange-700', dot: 'bg-orange-500' },
};

const TOP_STRIPE: Record<string, string> = {
  'Lab Update':    'bg-blue-500',
  'Achievement':   'bg-emerald-500',
  'Announcement':  'bg-violet-500',
  'Hackathon':     'bg-orange-500',
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.42 } },
};
const stagger: Variants = { hidden: {}, visible: { transition: { staggerChildren: 0.065 } } };

export default function NewsPage() {
  const { news } = usePortalStore();
  const [category, setCategory]   = useState('All');
  const [reading, setReading]     = useState<NewsItem | null>(null);
  const [likedMap, setLikedMap]   = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId]   = useState<string | null>(null);

  const visible   = news.filter((n) => n.status === 'approved' && n.isVisible !== false);
  const sorted    = [...visible].reverse();
  const spotlight = sorted.find((n) => n.trending) || sorted[0];

  const filtered = category === 'All'
    ? sorted.filter((n) => n.id !== spotlight?.id)
    : sorted.filter((n) => n.category === category);

  const handleLike  = (id: string) => setLikedMap((m) => ({ ...m, [id]: !m[id] }));
  const handleShare = (item: NewsItem) => {
    navigator.clipboard?.writeText?.(`${window.location.origin}/news#${item.id}`);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      <Navbar />

      <main className="flex-grow pt-20">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">

          {/* ── Header ── */}
          <div className="pt-10 pb-8 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5">
              <div>
                <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full mb-4">
                  <Radio className="w-3 h-3 animate-pulse" /> Live Newsroom
                </span>
                <h1 className="text-[38px] sm:text-[50px] font-black tracking-tight text-gray-900 leading-[1.06] mb-3">
                  Research Updates<br />
                  <span className="font-light italic text-gray-400">&amp; Lab Dispatches.</span>
                </h1>
                <p className="text-[15px] text-gray-500 max-w-xl">
                  Verified news from KIET Smart City Lab — awards, deployments, and research milestones.
                </p>
              </div>
              <div className="text-[13px] text-gray-400 shrink-0">
                <span className="font-semibold text-gray-600">{visible.length}</span> updates published
              </div>
            </div>

            {/* Category pills */}
            <div className="flex flex-wrap gap-2 mt-7">
              {CATEGORIES.map((cat) => {
                const count = cat === 'All' ? visible.length : visible.filter((n) => n.category === cat).length;
                const active = category === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold border transition-all duration-150 ${
                      active
                        ? 'bg-blue-600 border-blue-600 text-white shadow-[0_2px_8px_rgba(37,99,235,0.3)]'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900'
                    }`}
                  >
                    {cat === 'All' ? 'All Updates' : cat}
                    <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-bold min-w-[20px] text-center ${active ? 'bg-blue-700 text-white' : 'bg-gray-100 text-gray-500'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Empty state ── */}
          {visible.length === 0 && (
            <div className="py-24 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-100 mb-4">
                <Newspaper className="w-7 h-7 text-gray-400" />
              </div>
              <p className="text-[17px] font-semibold text-gray-500 mb-2">No updates yet</p>
              <p className="text-[13px] text-gray-400">Lab news will appear here once published by admin.</p>
            </div>
          )}

          <div className="py-10 space-y-8">

            {/* ── SPOTLIGHT FEATURED CARD — dark style matching screenshot ── */}
            {category === 'All' && spotlight && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
              >
                <button
                  onClick={() => setReading(spotlight)}
                  className="w-full text-left group"
                >
                  <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 via-blue-950 to-gray-950 min-h-[220px] flex flex-col justify-between p-8 sm:p-10 shadow-xl hover:shadow-2xl transition-shadow duration-200">
                    {/* Subtle grid pattern */}
                    <div className="absolute inset-0 grid-bg opacity-[0.06]" />
                    {/* Blue glow */}
                    <div className="absolute top-0 right-0 w-80 h-64 bg-blue-700/20 rounded-full blur-3xl pointer-events-none" />

                    {/* Top badges */}
                    <div className="relative z-10 flex flex-wrap items-center gap-2 mb-6">
                      <span className="flex items-center gap-1.5 text-[11px] font-bold bg-blue-600 text-white px-3 py-1.5 rounded-full">
                        <Flame className="w-3 h-3 fill-white" /> FEATURED
                      </span>
                      {spotlight.category && (
                        <span className="text-[11px] font-semibold bg-white/10 border border-white/20 text-white/80 px-3 py-1.5 rounded-full">
                          {spotlight.category}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <div className="relative z-10">
                      <h2 className="text-[24px] sm:text-[30px] font-black text-white leading-tight mb-5 group-hover:text-blue-200 transition-colors max-w-2xl">
                        {spotlight.title}
                      </h2>

                      {/* Bottom row */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[12px] text-gray-400">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{spotlight.publishedAt || 'Recent'}</span>
                          {spotlight.teamName && (
                            <><span className="text-gray-600">·</span><span className="text-gray-300">{spotlight.teamName}</span></>
                          )}
                        </div>
                        <span className="flex items-center gap-1.5 text-[13px] font-semibold text-blue-400 group-hover:text-white transition-colors">
                          Read update <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              </motion.div>
            )}

            {/* ── NEWS GRID ── */}
            {filtered.length === 0 ? (
              <div className="text-center py-20 text-gray-400 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                <p className="text-[16px] font-semibold text-gray-700">No news updates published yet</p>
                <p className="text-[13px] text-gray-400 mt-1">Updates and announcements will appear here once published from the Admin CRM.</p>
              </div>
            ) : (
              <motion.div
                variants={stagger}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
              >
                {filtered.map((item) => {
                  const badge = CAT_BADGE[item.category ?? ''] || { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' };
                  const stripe = TOP_STRIPE[item.category ?? ''] || 'bg-blue-400';
                  const isLiked = likedMap[item.id];

                  return (
                    <motion.div
                      key={item.id}
                      variants={fadeUp}
                      className="group bg-white rounded-2xl border border-gray-100 overflow-hidden card-shadow hover:card-shadow-hover hover:-translate-y-1 transition-all duration-200 flex flex-col"
                    >
                      {/* Colour stripe top */}
                      <div className={`h-[3px] w-full ${stripe}`} />

                      <div className="p-5 flex flex-col flex-1">
                        {/* Badge row */}
                        <div className="flex items-center justify-between mb-3">
                          <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full ${badge.bg} ${badge.text}`}>
                            <Tag className="w-2.5 h-2.5" />
                            {item.category || 'Update'}
                          </span>
                          {item.trending && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-orange-600 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-full">
                              <Flame className="w-2.5 h-2.5 fill-orange-500" /> Trending
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <button
                          onClick={() => setReading(item)}
                          className="text-left"
                        >
                          <h3 className="text-[15px] font-bold text-gray-900 leading-snug mb-3 group-hover:text-blue-600 transition-colors">
                            {item.title}
                          </h3>
                        </button>

                        {/* Description */}
                        {(item.summary || item.content) && (
                          <p className="text-[12.5px] text-gray-500 leading-relaxed line-clamp-2 mb-4 flex-1">
                            {item.summary || item.content}
                          </p>
                        )}

                        {/* Footer */}
                        <div className="pt-3 border-t border-gray-100 flex items-center justify-between mt-auto">
                          <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                            <Clock className="w-3 h-3" />
                            <span>{item.publishedAt || 'Recent'}</span>
                            {item.teamName && (
                              <><span className="text-gray-300">·</span><span className="font-medium text-gray-500 truncate max-w-[80px]">{item.teamName}</span></>
                            )}
                          </div>
                          <div className="flex items-center gap-0.5">
                            <button
                              onClick={() => handleLike(item.id)}
                              className={`p-1.5 rounded-lg text-[12px] transition-colors ${isLiked ? 'text-rose-500 bg-rose-50' : 'text-gray-400 hover:text-rose-400 hover:bg-rose-50'}`}
                            >
                              <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500' : ''}`} />
                            </button>
                            <button
                              onClick={() => handleShare(item)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                            >
                              {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => setReading(item)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                            >
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </div>
        </div>
      </main>

      <Footer />

      {/* ── Reading modal ── */}
      {reading && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setReading(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[88vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Stripe */}
            <div className={`h-1.5 rounded-t-3xl ${TOP_STRIPE[reading.category ?? ''] || 'bg-blue-500'}`} />
            <div className="p-8">
              <div className="flex items-start justify-between mb-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${CAT_BADGE[reading.category ?? '']?.bg || 'bg-gray-100'} ${CAT_BADGE[reading.category ?? '']?.text || 'text-gray-600'}`}>
                    {reading.category || 'Update'}
                  </span>
                  {reading.trending && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-orange-600 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-full">
                      <Flame className="w-2.5 h-2.5 fill-orange-500" /> Trending
                    </span>
                  )}
                </div>
                <button onClick={() => setReading(null)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <h2 className="text-[26px] font-black text-gray-900 leading-tight mb-4">{reading.title}</h2>
              <div className="flex items-center gap-3 text-[12px] text-gray-400 mb-6 pb-5 border-b border-gray-100">
                <Clock className="w-4 h-4" />
                <span>{reading.publishedAt || 'Recent'}</span>
                {reading.teamName && <><span>·</span><span className="font-semibold text-gray-600">{reading.teamName}</span></>}
              </div>
              <p className="text-[16px] text-gray-600 leading-[1.75]">{reading.summary || reading.content}</p>

              <div className="mt-8 flex items-center justify-between pt-6 border-t border-gray-100">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleLike(reading.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-medium border transition-colors ${likedMap[reading.id] ? 'bg-rose-50 border-rose-200 text-rose-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                  >
                    <Heart className={`w-4 h-4 ${likedMap[reading.id] ? 'fill-rose-500' : ''}`} /> Like
                  </button>
                  <button
                    onClick={() => handleShare(reading)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    {copiedId === reading.id ? <><Check className="w-4 h-4 text-emerald-500" />Copied!</> : <><Share2 className="w-4 h-4" />Share</>}
                  </button>
                </div>
                <button onClick={() => setReading(null)} className="px-4 py-2 rounded-xl text-[13px] font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}