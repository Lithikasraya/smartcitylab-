'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const DotLottieReact = dynamic(
  () => import('@lottiefiles/dotlottie-react').then((mod) => mod.DotLottieReact),
  { ssr: false }
);

interface WhatWeBuildVisualProps {
  className?: string;
}

export default function WhatWeBuildVisual({ className = '' }: WhatWeBuildVisualProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className={`w-full h-44 sm:h-52 flex items-center justify-center ${className}`}>
        <div className="w-12 h-12 rounded-full border-2 border-blue-600/20 border-t-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className={`relative flex items-center justify-center overflow-hidden ${className}`}>
      <div className="w-full max-w-[280px] sm:max-w-[340px] md:max-w-[380px] aspect-square flex items-center justify-center">
        <DotLottieReact
          src="https://lottie.host/9e2c6c40-3b61-4a51-b274-7bbe973bdaff/vldJEzOHPK.lottie"
          loop
          autoplay
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
}
