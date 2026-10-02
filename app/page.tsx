'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, useInView, type Variants } from 'framer-motion';
// lottie-web loaded dynamically (browser-only)
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import Modal from '@/components/shared/Modal';
import MemberAvatar from '@/components/shared/MemberAvatar';
import ProjectThumbnail from '@/components/shared/ProjectThumbnail';
import WhatWeBuildVisual from '@/components/shared/WhatWeBuildVisual';
import { usePortalStore } from '@/lib/store';
import { ProjectItem, INITIAL_INNOVATORS } from '@/lib/data';
import { getMediaDisplayUrl, getYouTubeEmbedUrl } from '@/lib/mediaService';
import {
  ArrowRight, ArrowUpRight, Zap, Shield, Globe, Cpu,
  Users, BookOpen, CheckCircle, Radio, Layers, Code2, Wifi,
  Leaf, TrendingUp, Award, Activity, ExternalLink, Star,
  BarChart3, Clock, ChevronRight, Video, Sparkles
} from 'lucide-react';

const LOTTIE_URL = 'https://lottie.host/d12ed86a-13b1-4922-a564-c918a129e464/jVwu7ncw6O.json';

// ── Animation helpers ─────────────────────────────────────────────────────────
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};
const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

function useCountUp(target: number, duration = 1500) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px 0px' });
  const ran = useRef(false);
  useEffect(() => {
    if (!inView || ran.current || target === 0) return;
    ran.current = true;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      setValue(Math.round((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, target, duration]);
  return { ref, value };
}

// Category config
const CAT_CFG: Record<string, { gradient: string; icon: React.ElementType; accent: string }> = {
  'AI & Computer Vision': { gradient: 'from-violet-600 via-purple-500 to-blue-600', icon: Cpu, accent: '#8b5cf6' },
  'IoT & Sensors':        { gradient: 'from-blue-500 via-cyan-500 to-teal-400',     icon: Wifi, accent: '#06b6d4' },
  'Green Energy':         { gradient: 'from-emerald-500 via-green-400 to-teal-500', icon: Leaf, accent: '#10b981' },
  'Smart Mobility':       { gradient: 'from-orange-500 via-amber-400 to-yellow-400',icon: Globe, accent: '#f59e0b' },
  'Web & Cloud':          { gradient: 'from-blue-600 via-indigo-500 to-blue-400',   icon: Code2, accent: '#3b82f6' },
};

// ── Stat card with count-up ───────────────────────────────────────────────────
function LiveStat({ value, suffix = '', label, icon: Icon, color }: {
  value: number; suffix?: string; label: string; icon: React.ElementType; color: string;
}) {
  const { ref, value: count } = useCountUp(value);
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 card-shadow flex items-start gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <span ref={ref} className="text-[32px] font-black text-gray-900 leading-none tabular-nums">
          {count.toLocaleString()}{suffix}
        </span>
        <p className="text-[13px] text-gray-500 mt-1 font-medium">{label}</p>
      </div>
    </div>
  );
}

// ── Hero Visual: pure Lottie, no card chrome ────────────────────────────────
function HeroVisual() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animInstance: any = null;
    let isCancelled = false;

    import('lottie-web').then((lottie) => {
      if (isCancelled || !containerRef.current) return;
      // Clear container to guarantee no duplicate SVGs injected
      containerRef.current.innerHTML = '';
      animInstance = lottie.default.loadAnimation({
        container: containerRef.current,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: LOTTIE_URL,
      });
      if (isCancelled) {
        animInstance?.destroy();
      }
    });

    return () => {
      isCancelled = true;
      if (animInstance) {
        animInstance.destroy();
        animInstance = null;
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full aspect-square max-w-[680px] mx-auto flex items-center justify-center lg:scale-110 xl:scale-115 transform-gpu origin-center"
      style={{ background: 'transparent' }}
    />
  );
}

// ── Animated headline — word reveal stagger ──────────────────────────────────
const HEADLINE_LINES = [
  { words: ['Building', 'the', 'Future', 'of'], weight: 'font-black', color: 'text-gray-900' },
  { words: ['Smart', 'Cities'], weight: 'font-black italic', color: 'text-blue-600' },
];

function AnimatedHeadline() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  return (
    <div ref={ref}>
      <h1 className="text-[40px] sm:text-[52px] lg:text-[58px] leading-[1.1] tracking-[-0.025em]">
        {HEADLINE_LINES.map((line, li) => (
          <div key={li} className="flex flex-wrap items-baseline gap-x-3">
            {line.words.map((word, wi) => {
              const isLast = li === HEADLINE_LINES.length - 1 && wi === line.words.length - 1;
              return (
                <React.Fragment key={`${li}-${wi}`}>
                  <motion.span
                    className={`inline-block ${line.weight} ${line.color}`}
                    initial={{ opacity: 0, y: 28, filter: 'blur(6px)' }}
                    animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
                    transition={{
                      duration: 0.5,
                      delay: 0.1 + li * 0.2 + wi * 0.09,
                      ease: [0.22, 0.61, 0.36, 1],
                    }}
                  >
                    {word}
                  </motion.span>
                  {/* Inline blinking cursor right after the last word */}
                  {isLast && (
                    <motion.span
                      className="inline-block w-[3px] h-[0.85em] bg-blue-600 ml-0.5 align-middle rounded-full"
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        ))}
      </h1>
    </div>
  );
}

function HomeProjectCard({ project, onSelect }: { project: ProjectItem; onSelect: () => void }) {
  const [imgError, setImgError] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const cfg = CAT_CFG[project.category] ?? { gradient: 'from-blue-600 to-indigo-600', icon: Layers, accent: '#3b82f6' };
  const Icon = cfg.icon;
  const members = project.members || [project.teamLead];

  const ytEmbedUrl = getYouTubeEmbedUrl(project.videoUrl);
  const displayVideoUrl = getMediaDisplayUrl(project.videoUrl);
  const displayImageUrl = getMediaDisplayUrl(project.imageUrl);

  const hasYtVideo = Boolean(ytEmbedUrl && !videoError);
  const hasVideo = Boolean(displayVideoUrl && !videoError);
  const hasImage = Boolean(displayImageUrl && !imgError);

  return (
    <motion.div
      variants={fadeUp}
      onClick={onSelect}
      className="group bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.06),0_1px_4px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_48px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.06)] hover:border-blue-400/40 hover:-translate-y-1.5 transition-all duration-200 cursor-pointer flex flex-col h-full text-left"
    >
      <div className="relative h-48 w-full bg-slate-950 overflow-hidden shrink-0">
        {hasYtVideo ? (
          <div className="relative w-full h-full">
            <iframe
              src={ytEmbedUrl!}
              title={project.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              className="w-full h-full border-0 pointer-events-none"
            />
            <div className="absolute inset-0 bg-transparent pointer-events-none" />
            <div className="absolute bottom-3 right-3 z-10">
              <span className="flex items-center gap-1.5 text-[9px] font-bold text-white bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-full border border-white/15">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> VIDEO DEMO
              </span>
            </div>
          </div>
        ) : hasVideo ? (
          <div className="relative w-full h-full">
            <video
              src={displayVideoUrl}
              autoPlay
              loop
              muted
              playsInline
              onError={() => setVideoError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute bottom-3 right-3 z-10">
              <span className="flex items-center gap-1.5 text-[9px] font-bold text-white bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-full border border-white/15">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> LIVE DEMO
              </span>
            </div>
          </div>
        ) : hasImage ? (
          <div className="relative w-full h-full bg-slate-100">
            <img
              src={displayImageUrl}
              alt={project.title}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        ) : (
          <div className={`relative w-full h-full bg-gradient-to-br ${cfg.gradient} flex items-center justify-center overflow-hidden`}>
            <div className="absolute inset-0 grid-bg opacity-10" />
            <div className="w-14 h-14 bg-white/15 backdrop-blur-sm rounded-2xl border border-white/25 flex items-center justify-center shadow-lg">
              <Icon className="w-7 h-7 text-white" />
            </div>
          </div>
        )}

        <span className="absolute bottom-3 left-3 z-10 text-[10px] font-bold text-white/95 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15 uppercase tracking-wide">
          Batch {project.batchYear}
        </span>
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
          {project.images && project.images.length > 0 && (
            <span className="text-[9px] font-bold text-white bg-black/50 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/15">
              +{project.images.length} Photos
            </span>
          )}
          <span className="flex items-center gap-1 text-[9px] font-bold text-white bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/15">
            <CheckCircle className="w-2.5 h-2.5 text-emerald-400" /> Verified
          </span>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: cfg.accent }}>{project.category}</span>
          <h3 className="text-[16px] font-bold text-gray-900 mt-1.5 mb-2 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">{project.title}</h3>
          <p className="text-[13px] text-gray-500 line-clamp-2 leading-relaxed mb-4">{project.tagline || project.description}</p>
          <div className="flex flex-wrap gap-1.5 mb-5">
            {project.techStack.slice(0, 3).map((t) => (
              <span key={t} className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[11px] font-medium">{t}</span>
            ))}
            {project.techStack.length > 3 && (
              <span className="px-2 py-0.5 rounded-full text-[11px] text-gray-400 border border-dashed border-gray-200">+{project.techStack.length - 3}</span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1.5">
              {members.slice(0, 3).map((n, i) => (
                <MemberAvatar key={i} name={n} size="sm" isLead={n === project.teamLead} role={n === project.teamLead ? 'Team Lead' : 'Member'} />
              ))}
            </div>
            <span className="text-[11px] font-medium text-gray-500 truncate max-w-[90px]">{project.teamName}</span>
          </div>
          <span className="text-blue-600 text-[12px] font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            View <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function Home() {
  const { projects, news, batches, teams, quests, innovators } = usePortalStore();
  const [activeModal, setActiveModal] = useState<ProjectItem | null>(null);

  // Real data computed from store
  const approvedProjects = projects.filter((p) => p.isVisible !== false && p.status === 'approved');
  const totalStudents    = batches.filter((s) => s.status === 'active').length;
  const liveDeployments  = approvedProjects.filter((p) => !!p.demoUrl).length;
  const totalProjects    = projects.length;
  const pendingProjects  = projects.filter((p) => p.status === 'pending').length;

  const featuredProjects = approvedProjects.slice(0, 6);
  const recentNews       = news.filter((n) => n.isVisible !== false && n.status === 'approved').slice(0, 3);
  const featuredStudents = batches.filter((s) => s.status === 'active').slice(0, 6);

  // Only display leaders marked as Head / Core Innovators
  const headInnovators = (innovators && innovators.length > 0 ? innovators : INITIAL_INNOVATORS).filter(
    (f) => f.isHead === true || (f.isHead === undefined && !f.name.toLowerCase().includes('demo') && !f.name.toLowerCase().includes('abhishek'))
  );
  const displayInnovators = headInnovators.length > 0 ? headInnovators : INITIAL_INNOVATORS;

  // Scroll animation refs
  const featRef  = useRef<HTMLDivElement>(null);
  const projRef  = useRef<HTMLDivElement>(null);
  const newsRef  = useRef<HTMLDivElement>(null);
  const studRef  = useRef<HTMLDivElement>(null);
  const ctaRef   = useRef<HTMLDivElement>(null);
  const featInView  = useInView(featRef,  { once: true, margin: '-80px 0px' });
  const projInView  = useInView(projRef,  { once: true, margin: '-80px 0px' });
  const newsInView  = useInView(newsRef,  { once: true, margin: '-80px 0px' });
  const studInView  = useInView(studRef,  { once: true, margin: '-80px 0px' });
  const ctaInView   = useInView(ctaRef,   { once: true, margin: '-80px 0px' });

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      <Navbar />

      {/* ══════════════════════════════════════════════════════════════════
          HERO — Two-column: text left, visual right
      ══════════════════════════════════════════════════════════════════ */}
      <section className="relative pt-28 pb-20 md:pt-36 md:pb-28 overflow-hidden hero-mesh">
        <div className="absolute inset-0 grid-bg opacity-60 pointer-events-none" />
        <div className="absolute top-16 right-0 w-[500px] h-[500px] bg-blue-400/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* ── Left column ── */}
            <div className="space-y-7">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <span className="inline-flex items-center gap-2 text-[12.5px] font-semibold bg-white border border-gray-200 text-gray-600 px-4 py-1.5 rounded-full shadow-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  Batch 2026 · Research in Progress
                </span>
              </motion.div>

              {/* Animated headline — word-by-word reveal */}
              <div className="overflow-hidden">
                <AnimatedHeadline />
              </div>

              {/* Subtext */}
              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-[17px] text-gray-500 leading-relaxed max-w-lg font-normal"
              >
                An interdisciplinary research lab at KIET — IoT sensor networks, edge AI models, and urban infrastructure prototypes built by real students and shipped to real campuses.
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.3 }}
                className="flex flex-wrap items-center gap-3"
              >
                <Link
                  href="/projects"
                  className="flex items-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[15px] rounded-xl shadow-[0_2px_10px_rgba(37,99,235,0.35)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.45)] transition-all duration-200 group"
                >
                  Explore Projects
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link
                  href="/batches"
                  className="flex items-center gap-2 px-6 py-3.5 bg-white hover:bg-gray-50 text-gray-800 font-semibold text-[15px] rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  Meet the Team <ArrowUpRight className="w-4 h-4 text-gray-400" />
                </Link>
              </motion.div>

              {/* Mini stats row */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.45 }}
                className="flex items-center gap-6 pt-2"
              >
                {[
                  { n: approvedProjects.length > 0 ? `${approvedProjects.length}+` : '0', label: 'Published Projects' },
                  { n: totalStudents > 0 ? `${totalStudents}+` : '0', label: 'Active Students' },
                  { n: `${liveDeployments}`, label: 'Live Deployments' },
                ].map((s) => (
                  <div key={s.label} className="text-left">
                    <div className="text-[22px] font-black text-gray-900 leading-none">{s.n}</div>
                    <div className="text-[11px] text-gray-500 mt-0.5 font-medium">{s.label}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* ── Right column: Hero Visual ── */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.65, delay: 0.2 }}
              className="hidden lg:flex items-center justify-center"
            >
              <div className="w-full">
                <HeroVisual />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          REAL STATS — from live store data
      ══════════════════════════════════════════════════════════════════ */}
      <section className="py-14 border-y border-gray-100 bg-gray-50/40">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <p className="text-[12px] font-bold uppercase tracking-widest text-gray-400 mb-8 text-center">Live Lab Metrics</p>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <LiveStat value={totalProjects}         label="Total Projects Submitted" icon={BarChart3}   color="bg-blue-50 text-blue-600" />
            <LiveStat value={approvedProjects.length} suffix="" label="Approved & Published" icon={CheckCircle} color="bg-emerald-50 text-emerald-600" />
            <LiveStat value={totalStudents}          suffix={totalStudents > 0 ? "+" : ""} label="Active Researchers"  icon={Users}       color="bg-violet-50 text-violet-600" />
            <LiveStat value={liveDeployments}        label="Live Deployments"        icon={Activity}    color="bg-orange-50 text-orange-600" />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          FEATURE PILLARS
      ══════════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-white" ref={featRef}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <motion.div 
            variants={stagger} 
            initial="hidden" 
            animate={featInView ? 'visible' : 'hidden'} 
            className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            <div className="max-w-2xl text-left">
              <motion.span variants={fadeUp} className="inline-flex items-center gap-1.5 text-[12px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
                <Zap className="w-3 h-3" /> What We Build
              </motion.span>
              <motion.h2 variants={fadeUp} className="text-[34px] sm:text-[42px] font-black tracking-tight text-gray-900 mt-4 mb-4 leading-[1.1]">
                Research that ships<br />
                <span className="font-light text-gray-400">beyond the classroom.</span>
              </motion.h2>
              <motion.p variants={fadeUp} className="text-[16px] text-gray-500 max-w-xl leading-relaxed">
                Every project here is deployed, measured, and iterated by student teams with real mentorship.
              </motion.p>
            </div>

            <motion.div 
              variants={fadeUp}
              className="flex items-center justify-center md:justify-end shrink-0"
            >
              <WhatWeBuildVisual className="w-48 sm:w-56 md:w-64 lg:w-72" />
            </motion.div>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            animate={featInView ? 'visible' : 'hidden'}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {[
              { icon: Cpu,    color: 'bg-violet-50 text-violet-600 border-violet-100', title: 'Edge AI & Computer Vision', desc: 'Real-time YOLO object detection, embedded neural nets, GPU pipelines on campus hardware.' },
              { icon: Wifi,   color: 'bg-cyan-50 text-cyan-600 border-cyan-100',       title: 'LoRaWAN & IoT Telemetry', desc: 'Long-range sensor networks monitoring air quality, traffic, and structural health.' },
              { icon: Leaf,   color: 'bg-emerald-50 text-emerald-600 border-emerald-100', title: 'Solar Microgrid Balancing', desc: 'Autonomous energy load distribution across campus solar installations in real time.' },
              { icon: Globe,  color: 'bg-orange-50 text-orange-600 border-orange-100', title: 'Smart Mobility Systems', desc: 'Adaptive signals, EV diagnostics, and pedestrian density analytics via live cameras.' },
              { icon: Shield, color: 'bg-blue-50 text-blue-600 border-blue-100',       title: 'Verified Research CRM', desc: 'Every project undergoes peer verification before publishing — only credible work goes live.' },
              { icon: Users,  color: 'bg-rose-50 text-rose-600 border-rose-100',       title: 'Student Cohort System', desc: 'Structured teams, task boards, 30-sec pitches, and digital credentials in one portal.' },
            ].map((f, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="group bg-white rounded-2xl border border-gray-100 p-7 card-shadow hover:card-shadow-hover hover:-translate-y-1 transition-all duration-200"
              >
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-5 ${f.color}`}>
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="text-[16px] font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-[13.5px] text-gray-500 leading-relaxed">{f.desc}</p>
                <div className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          PROJECTS SHOWCASE
      ══════════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-gray-50/60 border-y border-gray-100" ref={projRef} id="projects">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
            <div>
              <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
                <TrendingUp className="w-3 h-3" /> Lab Showcase
              </span>
              <h2 className="text-[32px] sm:text-[40px] font-black tracking-tight text-gray-900 mt-4 mb-2">
                Approved research, live now.
              </h2>
              <p className="text-[15px] text-gray-500">
                {pendingProjects > 0 && <span className="text-orange-500 font-semibold">{pendingProjects} pending review · </span>}
                {approvedProjects.length} projects verified and published.
              </p>
            </div>
            <Link href="/projects" className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-[14px] font-semibold text-gray-700 hover:bg-white hover:shadow-sm transition-all bg-white">
              All Projects <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {featuredProjects.length === 0 ? (
            <div className="text-center py-24 rounded-2xl border border-dashed border-gray-200 bg-white">
              <p className="text-gray-400 text-[15px]">No approved projects yet — check back soon.</p>
            </div>
          ) : (
            <motion.div
              variants={stagger}
              initial="hidden"
              animate={projInView ? 'visible' : 'hidden'}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {featuredProjects.map((project) => (
                <HomeProjectCard
                  key={project.id}
                  project={project}
                  onSelect={() => setActiveModal(project)}
                />
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          WHY JOIN — split section with bento
      ══════════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
                <Award className="w-3 h-3" /> Why Smart City Lab
              </span>
              <h2 className="text-[34px] sm:text-[42px] font-black tracking-tight text-gray-900 mt-5 mb-6 leading-[1.1]">
                Not a side project.<br />
                <span className="font-light italic text-gray-400">A real research lab.</span>
              </h2>
              <div className="space-y-4 mb-8">
                {[
                  'Structured mentorship from faculty & industry experts',
                  'Full project management portal — task boards, video demos, git sync',
                  'Verified projects published on the public showcase',
                  'Recognized by MIC India & Smart Cities Mission',
                ].map((text, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                    <span className="text-[15px] text-gray-600">{text}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <Link href="/batches" className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-semibold text-[14px] rounded-xl hover:bg-blue-700 shadow-[0_2px_8px_rgba(37,99,235,0.3)] transition-all">
                  Join the Lab <ArrowRight className="w-4 h-4" />
                </Link>
                <a href="mailto:smartcitylab@kiet.edu" className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 text-gray-700 font-semibold text-[14px] rounded-xl hover:bg-gray-50 transition-all">
                  Contact Us
                </a>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { bg: 'bg-blue-600', icon: Cpu,        num: String(approvedProjects.length) + '+', label: 'Projects Shipped',      dark: true },
                { bg: 'bg-gray-900', icon: Users,      num: String(totalStudents) + '+',            label: 'Active Researchers',    dark: true },
                { bg: 'bg-emerald-50 border border-emerald-100', icon: TrendingUp, num: String(liveDeployments), label: 'Live Deployments', dark: false },
                { bg: 'bg-violet-50 border border-violet-100',   icon: Wifi,       num: '24/7',                  label: 'Active IoT Telemetry', dark: false },
              ].map((cell, i) => (
                <div key={i} className={`${cell.bg} rounded-2xl p-6 flex flex-col gap-3 ${cell.dark ? 'shadow-lg' : ''}`}>
                  <cell.icon className={`w-6 h-6 ${cell.dark ? 'text-white/80' : 'text-gray-600'}`} />
                  <div>
                    <div className={`text-[34px] font-black tracking-tight ${cell.dark ? 'text-white' : 'text-gray-900'}`}>{cell.num}</div>
                    <div className={`text-[12px] font-medium mt-0.5 ${cell.dark ? 'text-white/60' : 'text-gray-500'}`}>{cell.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          NEWS FEED
      ══════════════════════════════════════════════════════════════════ */}
      {recentNews.length > 0 && (
        <section className="py-24 bg-gray-50/60 border-y border-gray-100" ref={newsRef}>
          <div className="max-w-7xl mx-auto px-5 sm:px-8">
            <div className="flex items-end justify-between mb-12">
              <div>
                <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
                  <Radio className="w-3 h-3 animate-pulse" /> Live Feed
                </span>
                <h2 className="text-[32px] font-black tracking-tight text-gray-900 mt-4 mb-2">What's happening now.</h2>
                <p className="text-[15px] text-gray-500">Latest lab updates, awards, and milestones.</p>
              </div>
              <Link href="/news" className="shrink-0 flex items-center gap-2 text-[14px] font-semibold text-blue-600 hover:underline">
                All updates <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <motion.div variants={stagger} initial="hidden" animate={newsInView ? 'visible' : 'hidden'} className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {recentNews.map((item) => (
                <motion.div key={item.id} variants={fadeUp} className="bg-white rounded-2xl border border-gray-100 p-6 card-shadow hover:card-shadow-hover hover:-translate-y-1 transition-all duration-200">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{item.category || 'Update'}</span>
                  </div>
                  <h3 className="text-[16px] font-bold text-gray-900 mb-2 leading-snug">{item.title}</h3>
                  <p className="text-[13px] text-gray-500 leading-relaxed line-clamp-3">{item.summary || item.content}</p>
                  <div className="mt-4 pt-4 border-t border-gray-100 text-[12px] text-gray-400 font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {item.publishedAt || 'Recent'}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          INNOVATORS & LEADERSHIP SHOWCASE (HEAD PEOPLE ONLY)
      ══════════════════════════════════════════════════════════════════ */}
      {displayInnovators && displayInnovators.length > 0 && (
        <section className="py-24 bg-white" ref={studRef}>
          <div className="max-w-7xl mx-auto px-5 sm:px-8">
            <div className="text-center mb-14">
              <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full mb-3">
                <Users className="w-3 h-3" /> The Team
              </span>
              <h2 className="text-[32px] sm:text-[40px] font-black tracking-tight text-gray-900 leading-tight">
                Meet the Innovators Behind <span className="text-blue-600">SmartCity</span> <span className="text-rose-600">Lab</span>
              </h2>
              <p className="text-[15px] text-gray-500 mt-2">
                Built by students. Guided by mentors.
              </p>
            </div>

            <motion.div 
              variants={stagger} 
              initial="hidden" 
              animate={studInView ? 'visible' : 'hidden'} 
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 max-w-5xl mx-auto items-start justify-center"
            >
              {displayInnovators.map((innovator) => (
                <motion.div 
                  key={innovator.id} 
                  variants={fadeUp} 
                  className="flex flex-col items-center text-center group cursor-pointer"
                >
                  <div className="w-full aspect-[4/5] sm:aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200/80 shadow-[0_4px_16px_rgba(0,0,0,0.06)] group-hover:shadow-[0_8px_24px_rgba(37,99,235,0.15)] group-hover:-translate-y-1 transition-all duration-300 relative flex items-center justify-center mb-3">
                    {innovator.photoUrl ? (
                      <img
                        src={getMediaDisplayUrl(innovator.photoUrl)}
                        alt={innovator.name}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 flex flex-col items-center justify-center text-white p-3">
                        <span className="text-[26px] font-black tracking-wider">
                          {innovator.name
                            .replace(/^(Mr\.|Ms\.|Dr\.)\s*/, '')
                            .split(' ')
                            .map((n: string) => n[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()}
                        </span>
                        <span className="text-[10px] font-medium text-blue-100 mt-1 uppercase tracking-wider">
                          {innovator.designation}
                        </span>
                      </div>
                    )}
                  </div>
                  <h3 className="font-bold text-[14px] sm:text-[15px] text-gray-900 leading-snug group-hover:text-blue-600 transition-colors">
                    {innovator.name}
                  </h3>
                  <p className="text-[12px] text-gray-500 font-medium italic mt-0.5">
                    {innovator.designation}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          CTA BANNER — dark
      ══════════════════════════════════════════════════════════════════ */}
      <section className="py-24 relative overflow-hidden bg-gray-950" ref={ctaRef}>
        <div className="absolute inset-0 grid-bg opacity-[0.06]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[280px] bg-blue-600/18 blur-3xl rounded-full" />
        <motion.div
          variants={stagger} initial="hidden" animate={ctaInView ? 'visible' : 'hidden'}
          className="relative max-w-4xl mx-auto px-5 sm:px-8 text-center"
        >
          <motion.span variants={fadeUp} className="inline-flex items-center gap-2 text-[12px] font-semibold text-blue-400 bg-blue-400/10 border border-blue-400/20 px-4 py-1.5 rounded-full mb-8">
            <Activity className="w-3.5 h-3.5" /> Applications Open
          </motion.span>
          <motion.h2 variants={fadeUp} className="text-[36px] sm:text-[50px] font-black tracking-tight text-white mb-6 leading-[1.08]">
            Ready to build the future?<br />
            <span className="text-gradient font-light italic">Join Smart City Lab.</span>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-[16px] text-gray-400 max-w-xl mx-auto mb-10">
            Bring your ideas — we provide the lab, mentors, hardware, and a path to publication.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/batches" className="flex items-center gap-2 px-7 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[15px] rounded-xl shadow-[0_4px_16px_rgba(37,99,235,0.4)] transition-all">
              Apply Now <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="mailto:smartcitylab@kiet.edu" className="flex items-center gap-2 px-7 py-3.5 bg-white/8 hover:bg-white/12 text-white font-semibold text-[15px] rounded-xl border border-white/15 hover:border-white/25 transition-all">
              Contact Us
            </a>
          </motion.div>
        </motion.div>
      </section>

      <Footer />

      {/* ── Project Detail Modal ── */}
      {activeModal && (
        <Modal isOpen={!!activeModal} onClose={() => setActiveModal(null)} title={activeModal.title} maxWidth="2xl">
          <div className="space-y-5 text-left">
            <ProjectThumbnail
              imageUrl={activeModal.imageUrl}
              images={activeModal.images}
              videoUrl={activeModal.videoUrl}
              title={activeModal.title}
              category={activeModal.category}
              className="h-72 sm:h-80 w-full rounded-xl overflow-hidden"
            />
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[12px] font-semibold border border-blue-100">{activeModal.category}</span>
              <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[12px] font-medium">Batch {activeModal.batchYear}</span>
              <span className="text-[12px] text-gray-500">• Team: <strong className="text-gray-900">{activeModal.teamName}</strong></span>
            </div>
            <p className="text-[15px] text-gray-600 leading-relaxed">{activeModal.description}</p>
            <div>
              <h4 className="text-[12px] font-bold uppercase tracking-wider text-gray-400 mb-2">Technologies</h4>
              <div className="flex flex-wrap gap-1.5">
                {activeModal.techStack.map((t) => <span key={t} className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[12px] font-medium">{t}</span>)}
              </div>
            </div>
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <div>
                <div className="text-[13px] font-semibold text-gray-900">{activeModal.teamName}</div>
                <div className="text-[12px] text-gray-500">Lead: {activeModal.teamLead}</div>
              </div>
              <div className="flex gap-2">
                {activeModal.repoUrl && <a href={activeModal.repoUrl} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg border border-gray-200 text-[13px] font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-1.5"><ExternalLink className="w-3.5 h-3.5" /> GitHub</a>}
                {activeModal.demoUrl && <a href={activeModal.demoUrl} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg bg-blue-600 text-[13px] font-medium text-white hover:bg-blue-700 flex items-center gap-1.5"><ExternalLink className="w-3.5 h-3.5" /> Live Demo</a>}
              </div>
            </div>

            {/* LOWER SECTION: Other Lab Projects */}
            {approvedProjects.filter((p) => p.id !== activeModal.id).length > 0 && (
              <div className="pt-4 border-t border-gray-100 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-[13px] font-bold text-gray-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>Explore Other Lab Projects</span>
                  </h4>
                  <span className="text-[11px] text-gray-400">Click to switch</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {approvedProjects
                    .filter((p) => p.id !== activeModal.id)
                    .slice(0, 4)
                    .map((otherProj) => (
                      <button
                        key={otherProj.id}
                        type="button"
                        onClick={() => setActiveModal(otherProj)}
                        className="p-2.5 rounded-xl border border-gray-200 hover:border-blue-500 bg-white hover:bg-blue-50/40 transition-all flex items-center gap-3 text-left group"
                      >
                        <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-slate-900 border border-gray-200">
                          {otherProj.imageUrl ? (
                            <img
                              src={otherProj.imageUrl}
                              alt={otherProj.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white text-[9px] font-bold">
                              DEMO
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-[9px] font-bold text-blue-600 uppercase tracking-wider block truncate">
                            {otherProj.category}
                          </span>
                          <h5 className="text-[12px] font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                            {otherProj.title}
                          </h5>
                          <span className="text-[11px] text-gray-500 truncate block">
                            Batch {otherProj.batchYear} • {otherProj.teamName}
                          </span>
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}