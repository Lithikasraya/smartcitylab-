'use client';

import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  altBg?: boolean;
}

export default function Card({
  children,
  altBg = false,
  className = '',
  ...props
}: CardProps) {
  return (
    <div
      className={`rounded-xl border border-[#E5E7EB] ${
        altBg ? 'bg-[#F8F9FA]' : 'bg-white'
      } p-6 transition-colors ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}