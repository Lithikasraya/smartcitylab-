'use client';

import React, { useState } from 'react';
import { getMediaDisplayUrl } from '@/lib/mediaService';
import { Blobatar } from '@blobatar/react';
import 'blobatar/motion.css';

interface MemberAvatarProps {
  name: string;
  photoUrl?: string;
  role?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLead?: boolean;
}

export default function MemberAvatar({
  name,
  photoUrl,
  role,
  size = 'md',
  isLead = false,
}: MemberAvatarProps) {
  const displayPhotoUrl = getMediaDisplayUrl(photoUrl);
  const hasRealPhoto =
    !!displayPhotoUrl &&
    !displayPhotoUrl.includes('ui-avatars') &&
    !displayPhotoUrl.includes('placeholder');
  const [imgError, setImgError] = useState(!hasRealPhoto);

  const sizeClasses = {
    sm: 'w-7 h-7 text-[10px]',
    md: 'w-9 h-9 text-[12px]',
    lg: 'w-12 h-12 text-[15px]',
    xl: 'w-20 h-20 text-[20px]',
  }[size];

  return (
    <div
      title={`${name}${role ? ` (${role})` : ''}`}
      className={`relative inline-flex items-center justify-center rounded-full overflow-hidden select-none border-2 border-white ring-1 ring-slate-200/80 shadow-xs flex-shrink-0 bg-slate-50 transition-transform duration-200 hover:scale-105 ${sizeClasses}`}
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
        <div className="w-full h-full flex items-center justify-center overflow-hidden p-0.5">
          <Blobatar
            name={name || 'student'}
            animate="always"
            className="w-full h-full object-contain pointer-events-auto"
          />
        </div>
      )}

      {isLead && (
        <span
          title="Team Lead"
          className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#2563EB] border border-white rounded-full flex items-center justify-center text-[8px] text-white z-10 font-bold shadow-xs"
        >
          ★
        </span>
      )}
    </div>
  );
}
