'use client';

import React from 'react';

export default function Loader({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="py-12 flex flex-col items-center justify-center space-y-3">
      <div className="w-6 h-6 border-2 border-[#E5E7EB] border-t-[#2563EB] rounded-full animate-spin" />
      <span className="text-[13px] text-[#6B7280]">{text}</span>
    </div>
  );
}