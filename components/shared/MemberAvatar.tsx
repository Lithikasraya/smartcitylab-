'use client';

import React, { useState } from 'react';
import { getMediaDisplayUrl } from '@/lib/mediaService';

interface MemberAvatarProps {
  name: string;
  photoUrl?: string;
  role?: string;
  size?: 'sm' | 'md' | 'lg';
  isLead?: boolean;
}

const COLOR_PALETTE = [
  'bg-blue-600',
  'bg-emerald-600',
  'bg-purple-600',
  'bg-amber-600',
  'bg-cyan-600',
  'bg-slate-800',
];

export default function MemberAvatar({
  name,
  photoUrl,
  role,
  size = 'md',
  isLead = false,
}: MemberAvatarProps) {
  const displayPhotoUrl = getMediaDisplayUrl(photoUrl);
  const [imgError, setImgError] = useState(!displayPhotoUrl);

  const getInitials = (n: string) => {
    if (!n) return 'S';
    const parts = n.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return n.slice(0, 2).toUpperCase();
  };

  const getHashColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const idx = Math.abs(hash) % COLOR_PALETTE.length;
    return COLOR_PALETTE[idx];
  };

  const sizeClasses = {
    sm: 'w-6 h-6 text-[10px]',
    md: 'w-8 h-8 text-[12px]',
    lg: 'w-12 h-12 text-[15px]',
  }[size];

  const bgColor = getHashColor(name);

  return (
    <div
      title={`${name}${role ? ` (${role})` : ''}`}
      className={`relative inline-flex items-center justify-center rounded-full font-bold select-none border-2 border-white shadow-xs flex-shrink-0 ${sizeClasses} ${bgColor} text-white`}
    >
      {!imgError && displayPhotoUrl ? (
        <img
          src={displayPhotoUrl}
          alt={name}
          onError={() => setImgError(true)}
          referrerPolicy="no-referrer"
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        <span>{getInitials(name)}</span>
      )}

      {isLead && (
        <span
          title="Team Lead"
          className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#2563EB] border border-white rounded-full flex items-center justify-center text-[7px] text-white"
        >
          ★
        </span>
      )}
    </div>
  );
}
