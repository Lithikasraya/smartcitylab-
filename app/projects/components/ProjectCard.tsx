'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import MemberAvatar from '@/components/shared/MemberAvatar';
import { ProjectItem } from '@/lib/data';
import { Github } from '@/components/shared/Icons';
import { ExternalLink, ArrowRight, ShieldCheck, Video } from 'lucide-react';

import { getMediaDisplayUrl, getYouTubeEmbedUrl } from '@/lib/mediaService';

interface ProjectCardProps {
  project: ProjectItem;
  onSelect: (project: ProjectItem) => void;
}

// Category → gradient mapping fallback
const CATEGORY_GRADIENT: Record<string, string> = {
  'AI & Computer Vision': 'from-blue-900/90 via-indigo-900/80 to-slate-900',
  'IoT & Sensors': 'from-cyan-950 via-teal-900/80 to-slate-900',
  'Green Energy': 'from-emerald-950 via-green-900/80 to-slate-900',
  'Smart Mobility': 'from-slate-900 via-purple-950 to-slate-900',
  'Web & Cloud': 'from-indigo-950 via-blue-900/80 to-slate-900',
};

const CATEGORY_ACCENT: Record<string, string> = {
  'AI & Computer Vision': '#3B82F6',
  'IoT & Sensors': '#06B6D4',
  'Green Energy': '#10B981',
  'Smart Mobility': '#8B5CF6',
  'Web & Cloud': '#2563EB',
};

const CATEGORY_SYMBOL: Record<string, string> = {
  'AI & Computer Vision': '⬡',
  'IoT & Sensors': '◈',
  'Green Energy': '◎',
  'Smart Mobility': '◁◁',
  'Web & Cloud': '⟁',
};

export default function ProjectCard({ project, onSelect }: ProjectCardProps) {
  const [imgError, setImgError] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const members = project.members || [project.teamLead];
  const gradient = CATEGORY_GRADIENT[project.category] ?? 'from-slate-950 via-blue-950 to-slate-900';
  const accent = CATEGORY_ACCENT[project.category] ?? '#2563EB';
  const symbol = CATEGORY_SYMBOL[project.category] ?? '◈';

  const ytEmbedUrl = getYouTubeEmbedUrl(project.videoUrl);
  const displayVideoUrl = getMediaDisplayUrl(project.videoUrl);
  const displayImageUrl = getMediaDisplayUrl(project.imageUrl);

  const hasYtVideo = Boolean(ytEmbedUrl && !videoError);
  const hasVideo = Boolean(displayVideoUrl && !videoError);
  const hasImage = Boolean(displayImageUrl && !imgError);

  return (
    <motion.div
      whileHover={{ scale: 1.015, y: -4 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="group rounded-[20px] border border-[#E5E7EB] bg-white overflow-hidden flex flex-col h-full hover:shadow-[0_16px_48px_rgba(0,0,0,0.10)] hover:border-[#D1D5DB] transition-all duration-200 text-left cursor-pointer"
      onClick={() => onSelect(project)}
    >
      {/* ── Media Header (Video / Image / Fallback) ── */}
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
            <div className="absolute bottom-3 left-3 z-10">
              <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-white bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                <Video className="w-3 h-3 text-red-400" />
                VIDEO
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
            {/* Top gradient for badge contrast */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/40 pointer-events-none" />
            
            {/* Video Live Badge */}
            <div className="absolute bottom-3 left-3">
              <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-white bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                <Video className="w-3 h-3 text-red-400" />
                VIDEO
              </span>
            </div>
          </div>
        ) : hasImage ? (
          <div className="relative w-full h-full">
            <img
              src={displayImageUrl}
              alt={project.title}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {/* Dark gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30 pointer-events-none" />
          </div>
        ) : (
          /* High-aesthetic Graphic Fallback */
          <div className={`relative w-full h-full bg-gradient-to-br ${gradient} p-4 flex flex-col justify-between select-none`}>
            <div
              className="absolute inset-0 opacity-[0.12]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
                backgroundSize: '180px 180px',
              }}
            />
            <div className="relative z-10 flex items-center justify-between">
              <span className="text-3xl font-black opacity-40" style={{ color: accent }}>
                {symbol}
              </span>
            </div>
          </div>
        )}

        {/* Batch Badge (Bottom-left or Top-left) */}
        <div className="absolute top-3 left-3 z-10">
          <span className="text-[11px] font-bold uppercase tracking-wider text-white/95 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15 shadow-xs">
            Batch {project.batchYear}
          </span>
        </div>

        {/* Verified Status Badge */}
        <div className="absolute top-3 right-3 z-10">
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-white/95 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15 shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Verified
          </span>
        </div>
      </div>

      {/* ── Content Body (Normalized Heights) ── */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between text-left">
        <div className="space-y-2">
          {/* Category label */}
          <span
            className="text-[11px] font-bold uppercase tracking-wider block"
            style={{ color: accent }}
          >
            {project.category}
          </span>

          {/* Title (fixed 2-line height for uniform rows) */}
          <h3
            className="text-[17px] font-bold text-[#0A0A0A] tracking-tight leading-snug line-clamp-2 min-h-[2.75rem] group-hover:text-[#2563EB] transition-colors duration-150"
            title={project.title}
          >
            {project.title}
          </h3>

          {/* Tagline / Description (fixed 2-line height for uniform rows) */}
          <p className="text-[13px] text-[#6B7280] line-clamp-2 min-h-[2.5rem] leading-relaxed">
            {project.tagline || project.description}
          </p>
        </div>

        {/* Tech Stack Pills (Fixed single-row height with overflow protection) */}
        <div className="pt-3">
          <div className="flex flex-wrap items-center gap-1.5 h-6 overflow-hidden">
            {project.techStack.slice(0, 3).map((tech) => (
              <span
                key={tech}
                className="px-2 py-0.5 rounded-md text-[11px] bg-[#F3F4F6] text-[#374151] font-medium border border-[#E5E7EB] whitespace-nowrap"
              >
                {tech}
              </span>
            ))}
            {project.techStack.length > 3 && (
              <span className="px-1.5 py-0.5 rounded-md text-[11px] text-[#6B7280] bg-gray-50 border border-dashed border-[#D1D5DB] whitespace-nowrap font-medium">
                +{project.techStack.length - 3}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Footer: Avatars + Action Links (Pinned to exact baseline) ── */}
      <div className="px-5 sm:px-6 py-4 border-t border-[#F3F4F6] flex items-center justify-between shrink-0 bg-white mt-auto">
        {/* Team avatars */}
        <div className="flex items-center gap-2.5 min-w-0 pr-2">
          <div className="flex items-center -space-x-2 shrink-0">
            {members.slice(0, 3).map((mName, i) => (
              <MemberAvatar
                key={i}
                name={mName}
                size="md"
                isLead={mName === project.teamLead}
                role={mName === project.teamLead ? 'Team Lead' : 'Team Member'}
              />
            ))}
          </div>
          <div className="text-left min-w-0">
            <div className="text-[12px] font-bold text-[#0A0A0A] truncate">{project.teamName}</div>
          </div>
        </div>

        {/* 3 Icon Links: GitHub · Demo · Details */}
        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          {project.repoUrl && (
            <motion.a
              href={project.repoUrl}
              target="_blank"
              rel="noreferrer"
              whileHover={{ scale: 1.15 }}
              transition={{ duration: 0.15 }}
              className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#2563EB] hover:bg-blue-50 transition-colors"
              title="GitHub Repository"
            >
              <Github className="w-4 h-4" />
            </motion.a>
          )}
          {project.demoUrl && (
            <motion.a
              href={project.demoUrl}
              target="_blank"
              rel="noreferrer"
              whileHover={{ scale: 1.15 }}
              transition={{ duration: 0.15 }}
              className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#2563EB] hover:bg-blue-50 transition-colors"
              title="Live Demo"
            >
              <ExternalLink className="w-4 h-4" />
            </motion.a>
          )}
          <motion.button
            onClick={() => onSelect(project)}
            whileHover={{ scale: 1.15 }}
            transition={{ duration: 0.15 }}
            className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#2563EB] hover:bg-blue-50 transition-colors"
            title="View Details"
          >
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}