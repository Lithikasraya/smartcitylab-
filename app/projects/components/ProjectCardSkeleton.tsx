'use client';

import React from 'react';

export default function ProjectCardSkeleton() {
  return (
    <div className="rounded-[20px] border border-[#E5E7EB] bg-white overflow-hidden flex flex-col h-full shadow-sm text-left">
      {/* Skeleton Media Header */}
      <div className="relative h-48 w-full bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-pulse overflow-hidden shrink-0">
        <div className="absolute top-3 left-3 w-20 h-5 rounded-full bg-white/50" />
        <div className="absolute top-3 right-3 w-16 h-5 rounded-full bg-white/50" />
      </div>

      {/* Skeleton Body */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {/* Category Pill */}
          <div className="h-3 w-24 bg-gray-200 rounded-full animate-pulse" />

          {/* Title (2 lines) */}
          <div className="space-y-1.5 min-h-[2.75rem]">
            <div className="h-4.5 w-4/5 bg-gray-200 rounded-md animate-pulse" />
            <div className="h-4.5 w-3/5 bg-gray-200 rounded-md animate-pulse" />
          </div>

          {/* Tagline (2 lines) */}
          <div className="space-y-1.5 min-h-[2.5rem]">
            <div className="h-3 w-full bg-gray-100 rounded animate-pulse" />
            <div className="h-3 w-4/6 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>

        {/* Tech Stack Pills */}
        <div className="pt-2">
          <div className="flex items-center gap-1.5 h-6">
            <div className="h-5 w-14 bg-gray-100 border border-gray-200 rounded-md animate-pulse" />
            <div className="h-5 w-16 bg-gray-100 border border-gray-200 rounded-md animate-pulse" />
            <div className="h-5 w-12 bg-gray-100 border border-gray-200 rounded-md animate-pulse" />
          </div>
        </div>
      </div>

      {/* Skeleton Footer */}
      <div className="px-5 sm:px-6 py-4 border-t border-[#F3F4F6] flex items-center justify-between shrink-0 bg-white mt-auto">
        <div className="flex items-center gap-2.5">
          <div className="flex -space-x-2">
            <div className="w-7 h-7 rounded-full bg-gray-200 border-2 border-white animate-pulse" />
            <div className="w-7 h-7 rounded-full bg-gray-200 border-2 border-white animate-pulse" />
          </div>
          <div className="h-3.5 w-20 bg-gray-200 rounded animate-pulse" />
        </div>

        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-lg bg-gray-100 animate-pulse" />
          <div className="w-6 h-6 rounded-lg bg-gray-100 animate-pulse" />
          <div className="w-6 h-6 rounded-lg bg-gray-100 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
