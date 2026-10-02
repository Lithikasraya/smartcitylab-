'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Users } from 'lucide-react';

const DotLottieReact = dynamic(
  () => import('@lottiefiles/dotlottie-react').then((mod) => mod.DotLottieReact),
  { ssr: false }
);

interface ResearchersLottieProps {
  className?: string;
  size?: number;
}

export default function ResearchersLottie({ 
  className = '',
  size = 72 
}: ResearchersLottieProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div style={{ width: size, height: size }} className={`flex items-center justify-center ${className}`}>
        <Users className="w-8 h-8 text-white/40 animate-pulse" />
      </div>
    );
  }

  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      <div style={{ width: size, height: size }} className="flex items-center justify-center">
        <DotLottieReact
          src="https://lottie.host/9e506062-5f1a-4fe1-a03a-df1822b1b1b9/taZABzSbck.lottie"
          loop
          autoplay
          className="w-full h-full object-contain pointer-events-none drop-shadow-md"
        />
      </div>
    </div>
  );
}
