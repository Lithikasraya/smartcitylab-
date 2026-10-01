'use client';

import React, { useState } from 'react';
import { Sun, Radio, Eye } from 'lucide-react';
import { getMediaDisplayUrl, getYouTubeEmbedUrl } from '@/lib/mediaService';

interface ProjectThumbnailProps {
  imageUrl?: string;
  videoUrl?: string;
  title: string;
  category: string;
  className?: string;
}

export default function ProjectThumbnail({
  imageUrl,
  videoUrl,
  title,
  category,
  className = 'h-52 w-full',
}: ProjectThumbnailProps) {
  const [imgError, setImgError] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const ytEmbedUrl = getYouTubeEmbedUrl(videoUrl);
  const displayVideoUrl = getMediaDisplayUrl(videoUrl);
  const displayImageUrl = getMediaDisplayUrl(imageUrl);

  // If a YouTube video is provided
  if (ytEmbedUrl && !videoError) {
    return (
      <div className={`relative bg-slate-950 overflow-hidden ${className}`}>
        <iframe
          src={ytEmbedUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full border-0 pointer-events-auto"
        />
        <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-black/70 text-white text-[11px] font-semibold flex items-center gap-1.5 backdrop-blur-sm border border-white/10 pointer-events-none">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span>VIDEO DEMO</span>
        </div>
      </div>
    );
  }

  // If direct MP4/WebM video is provided and hasn't errored
  if (displayVideoUrl && !videoError) {
    return (
      <div className={`relative bg-slate-950 overflow-hidden ${className}`}>
        <video
          src={displayVideoUrl}
          autoPlay
          loop
          muted
          playsInline
          controls
          onError={() => setVideoError(true)}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-black/70 text-white text-[11px] font-semibold flex items-center gap-1.5 backdrop-blur-sm border border-white/10 pointer-events-none">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>LIVE DEMO</span>
        </div>
      </div>
    );
  }

  // If image is provided and hasn't failed to load
  if (displayImageUrl && !imgError) {
    return (
      <div className={`relative bg-slate-900 overflow-hidden ${className}`}>
        <img
          src={displayImageUrl}
          alt={title}
          onError={() => setImgError(true)}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
      </div>
    );
  }

  // High-Graphic Graphical Fallback tailored to the project category
  const renderCategoryGraphic = () => {
    switch (category) {
      case 'AI & Computer Vision':
        return (
          <div className="relative w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-6 flex flex-col justify-between select-none">
            {/* Camera Reticle Overlay */}
            <div className="flex items-center justify-between text-blue-400 font-mono text-[11px]">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                CAM_01 // YOLOv8 45.2 FPS
              </span>
              <span className="px-2 py-0.5 bg-blue-500/20 border border-blue-400/30 rounded text-blue-300">
                EDGE AI
              </span>
            </div>

            {/* Bounding box illustration */}
            <div className="my-auto mx-auto w-4/5 h-20 border border-dashed border-blue-400/60 rounded-md relative flex items-center justify-center bg-blue-500/5">
              <span className="absolute -top-3 left-2 bg-[#2563EB] text-white text-[10px] font-mono px-1.5 py-0.5 rounded font-bold">
                VEHICLE : 98.4%
              </span>
              <div className="flex items-center gap-2 text-blue-300 text-[13px] font-mono">
                <Eye className="w-4 h-4 text-blue-400" />
                <span>TRAFFIC DENSITY DETECTED</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>LATENCY: 11.4ms</span>
              <span>DEVICE: JETSON ORIN</span>
            </div>
          </div>
        );

      case 'Green Energy':
        return (
          <div className="relative w-full h-full bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 p-6 flex flex-col justify-between select-none">
            <div className="flex items-center justify-between text-emerald-400 font-mono text-[11px]">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                SOLAR ARRAY A-E // GRID
              </span>
              <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-400/30 rounded text-emerald-300">
                MICROGRID
              </span>
            </div>

            <div className="my-auto text-center space-y-1">
              <div className="flex items-center justify-center gap-2 text-emerald-400">
                <Sun className="w-6 h-6 animate-spin-slow" />
                <span className="text-[28px] font-bold font-mono text-white">48.2 kW</span>
              </div>
              <p className="text-[11px] font-mono text-emerald-300">AUTONOMOUS LOAD BALANCED</p>
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>EFFICIENCY: 94.6%</span>
              <span>STORAGE: 88% CHARGED</span>
            </div>
          </div>
        );

      case 'IoT & Sensors':
      default:
        return (
          <div className="relative w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 p-6 flex flex-col justify-between select-none">
            <div className="flex items-center justify-between text-cyan-400 font-mono text-[11px]">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                LoRaWAN 868MHz // ACTIVE
              </span>
              <span className="px-2 py-0.5 bg-cyan-500/20 border border-cyan-400/30 rounded text-cyan-300">
                TELEMETRY
              </span>
            </div>

            <div className="my-auto text-center space-y-1">
              <div className="flex items-center justify-center gap-2 text-cyan-400">
                <Radio className="w-6 h-6" />
                <span className="text-[24px] font-bold font-mono text-white">pH 7.4 • TDS 120</span>
              </div>
              <p className="text-[11px] font-mono text-cyan-300">WATER DISTRIBUTION SENSOR GRID</p>
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>RSSI: -72 dBm</span>
              <span>POWER: SUB-15mW</span>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`relative overflow-hidden border-b border-[#E5E7EB] ${className}`}>
      {renderCategoryGraphic()}
    </div>
  );
}
