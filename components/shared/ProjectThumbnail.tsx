'use client';

import React, { useState, useMemo } from 'react';
import { Sun, Radio, Eye, Video, Image as ImageIcon, Sparkles, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { getMediaDisplayUrl, getYouTubeEmbedUrl } from '@/lib/mediaService';

interface ProjectThumbnailProps {
  imageUrl?: string;
  images?: string[];
  videoUrl?: string;
  title: string;
  category: string;
  className?: string;
  showMediaTabs?: boolean;
  showThumbnails?: boolean;
}

export default function ProjectThumbnail({
  imageUrl,
  images = [],
  videoUrl,
  title,
  category,
  className = 'h-64 w-full',
  showMediaTabs = true,
  showThumbnails = true,
}: ProjectThumbnailProps) {
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});
  const [videoError, setVideoError] = useState(false);

  // Combine primary imageUrl and additional images into a clean list
  const allPhotos = useMemo(() => {
    const list: string[] = [];
    if (imageUrl && imageUrl.trim()) list.push(imageUrl.trim());
    if (Array.isArray(images)) {
      images.forEach((img) => {
        if (img && img.trim() && !list.includes(img.trim())) {
          list.push(img.trim());
        }
      });
    }
    return list;
  }, [imageUrl, images]);

  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  const ytEmbedUrl = getYouTubeEmbedUrl(videoUrl);
  const displayVideoUrl = getMediaDisplayUrl(videoUrl);
  const hasValidVideo = Boolean((ytEmbedUrl || displayVideoUrl) && !videoError);
  const hasPhotos = allPhotos.length > 0;

  // Active view mode: 'video' | 'photo'
  const [activeTab, setActiveTab] = useState<'video' | 'photo'>(() => {
    if (hasValidVideo) return 'video';
    return 'photo';
  });

  // Current active photo URL
  const currentPhotoUrl = allPhotos[activePhotoIndex] ? getMediaDisplayUrl(allPhotos[activePhotoIndex]) : '';

  // High-Graphic Graphical Fallback tailored to the project category
  const renderCategoryGraphic = () => {
    switch (category) {
      case 'AI & Computer Vision':
        return (
          <div className="relative w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-6 flex flex-col justify-between select-none">
            <div className="flex items-center justify-between text-blue-400 font-mono text-[11px]">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                CAM_01 // YOLOv8 45.2 FPS
              </span>
              <span className="px-2 py-0.5 bg-blue-500/20 border border-blue-400/30 rounded text-blue-300">
                EDGE AI
              </span>
            </div>
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
    <div className="w-full space-y-2.5">
      {/* Media Type Tabs (Video Demo vs Project Photos) */}
      {showMediaTabs && hasValidVideo && hasPhotos && (
        <div className="flex items-center justify-between bg-gray-100/90 p-1 rounded-xl border border-gray-200">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('video')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[12px] font-bold transition-all ${
                activeTab === 'video'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Video Demo</span>
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse ml-0.5" />
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('photo')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[12px] font-bold transition-all ${
                activeTab === 'photo'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Project Photos</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/10 font-mono">
                {allPhotos.length}
              </span>
            </button>
          </div>

          <span className="text-[11px] font-medium text-gray-400 px-2">
            {activeTab === 'video' ? 'Interactive Video Player' : `Photo ${activePhotoIndex + 1} of ${allPhotos.length}`}
          </span>
        </div>
      )}

      {/* Main Media Display Viewport */}
      <div className={`relative bg-slate-950 overflow-hidden rounded-xl border border-[#E5E7EB] ${className}`}>
        {/* VIDEO MODE */}
        {activeTab === 'video' && hasValidVideo ? (
          ytEmbedUrl ? (
            <div className="relative w-full h-full">
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
          ) : (
            <div className="relative w-full h-full bg-black flex items-center justify-center">
              <video
                src={displayVideoUrl}
                autoPlay
                loop
                muted
                playsInline
                controls
                onError={() => setVideoError(true)}
                className="w-full h-full object-contain max-h-full"
              />
              <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-black/70 text-white text-[11px] font-semibold flex items-center gap-1.5 backdrop-blur-sm border border-white/10 pointer-events-none">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>LIVE DEMO</span>
              </div>
            </div>
          )
        ) : hasPhotos && currentPhotoUrl && !imgErrors[activePhotoIndex] ? (
          /* PHOTO MODE */
          <div className="relative w-full h-full group bg-slate-900 flex items-center justify-center">
            <img
              src={currentPhotoUrl}
              alt={`${title} - Photo ${activePhotoIndex + 1}`}
              onError={() => setImgErrors((prev) => ({ ...prev, [activePhotoIndex]: true }))}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-102"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

            {/* Photo Navigation arrows if multiple photos */}
            {allPhotos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActivePhotoIndex((prev) => (prev > 0 ? prev - 1 : allPhotos.length - 1));
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all opacity-0 group-hover:opacity-100"
                  aria-label="Previous Photo"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActivePhotoIndex((prev) => (prev < allPhotos.length - 1 ? prev + 1 : 0));
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all opacity-0 group-hover:opacity-100"
                  aria-label="Next Photo"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}

            {/* Photo count indicator */}
            {allPhotos.length > 1 && (
              <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-full bg-black/70 text-white text-[10px] font-bold backdrop-blur-sm border border-white/10">
                {activePhotoIndex + 1} / {allPhotos.length} Photos
              </div>
            )}
          </div>
        ) : (
          /* High-Graphic Fallback */
          renderCategoryGraphic()
        )}
      </div>

      {/* LOWER PHOTO STRIP: If user uploaded multiple photos, show clickable thumbnails below */}
      {showThumbnails && allPhotos.length > 1 && (
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[11px] font-medium text-gray-500">
            <span className="flex items-center gap-1">
              <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
              <span>Project Photo Gallery ({allPhotos.length} images)</span>
            </span>
            <span>Click thumbnail to view</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {allPhotos.map((photo, idx) => {
              const displayUrl = getMediaDisplayUrl(photo);
              const isSelected = activeTab === 'photo' && activePhotoIndex === idx;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setActiveTab('photo');
                    setActivePhotoIndex(idx);
                  }}
                  className={`relative shrink-0 w-16 h-14 rounded-lg overflow-hidden border-2 transition-all group ${
                    isSelected
                      ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-md scale-105'
                      : 'border-gray-200 hover:border-gray-400 opacity-75 hover:opacity-100'
                  }`}
                >
                  <img
                    src={displayUrl}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                  <span className="absolute bottom-0.5 right-0.5 px-1 py-0.2 rounded bg-black/70 text-white text-[8px] font-bold">
                    #{idx + 1}
                  </span>
                </button>
              );
            })}

            {hasValidVideo && (
              <button
                type="button"
                onClick={() => setActiveTab('video')}
                className={`relative shrink-0 w-16 h-14 rounded-lg overflow-hidden border-2 transition-all flex flex-col items-center justify-center bg-slate-900 text-white ${
                  activeTab === 'video'
                    ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-md scale-105'
                    : 'border-gray-200 hover:border-gray-400 opacity-75 hover:opacity-100'
                }`}
              >
                <Play className="w-4 h-4 text-red-500 fill-red-500" />
                <span className="text-[8px] font-bold mt-0.5 uppercase tracking-wider text-slate-300">Video</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
