'use client';

import React from 'react';

export default function CityLineArt() {
  return (
    <div className="w-full h-full flex items-center justify-center p-8 select-none">
      <svg
        viewBox="0 0 480 360"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full max-w-[440px] h-auto text-[#0A0A0A]"
      >
        {/* Abstract Architectural & Grid Line Art */}
        <line x1="40" y1="300" x2="440" y2="300" stroke="#E5E7EB" strokeWidth="1.5" />
        <line x1="40" y1="240" x2="440" y2="240" stroke="#F3F4F6" strokeWidth="1" strokeDasharray="4 4" />
        <line x1="40" y1="180" x2="440" y2="180" stroke="#F3F4F6" strokeWidth="1" strokeDasharray="4 4" />

        {/* Building 1 (Left Tower) */}
        <rect x="70" y="160" width="60" height="140" stroke="#0A0A0A" strokeWidth="1.5" fill="#FFFFFF" />
        <line x1="85" y1="180" x2="115" y2="180" stroke="#E5E7EB" strokeWidth="1.5" />
        <line x1="85" y1="205" x2="115" y2="205" stroke="#E5E7EB" strokeWidth="1.5" />
        <line x1="85" y1="230" x2="115" y2="230" stroke="#E5E7EB" strokeWidth="1.5" />
        <line x1="85" y1="255" x2="115" y2="255" stroke="#E5E7EB" strokeWidth="1.5" />

        {/* Building 2 (Center High-Rise Lab) */}
        <rect x="150" y="90" width="80" height="210" stroke="#0A0A0A" strokeWidth="1.5" fill="#FFFFFF" />
        <line x1="190" y1="90" x2="190" y2="60" stroke="#0A0A0A" strokeWidth="1.5" />
        <circle cx="190" cy="55" r="4" fill="#2563EB" />
        {/* Radio signal arcs */}
        <path d="M182 47 C186 43, 194 43, 198 47" stroke="#2563EB" strokeWidth="1" fill="none" />
        <path d="M176 41 C184 35, 196 35, 204 41" stroke="#2563EB" strokeWidth="1" fill="none" opacity="0.6" />
        {/* Windows */}
        <rect x="165" y="115" width="20" height="15" stroke="#E5E7EB" strokeWidth="1.5" />
        <rect x="195" y="115" width="20" height="15" stroke="#E5E7EB" strokeWidth="1.5" />
        <rect x="165" y="145" width="20" height="15" stroke="#E5E7EB" strokeWidth="1.5" />
        <rect x="195" y="145" width="20" height="15" stroke="#E5E7EB" strokeWidth="1.5" />
        <rect x="165" y="175" width="20" height="15" stroke="#E5E7EB" strokeWidth="1.5" />
        <rect x="195" y="175" width="20" height="15" stroke="#E5E7EB" strokeWidth="1.5" />
        <rect x="165" y="205" width="20" height="15" stroke="#E5E7EB" strokeWidth="1.5" />
        <rect x="195" y="205" width="20" height="15" stroke="#E5E7EB" strokeWidth="1.5" />
        <rect x="165" y="235" width="20" height="15" stroke="#E5E7EB" strokeWidth="1.5" />
        <rect x="195" y="235" width="20" height="15" stroke="#E5E7EB" strokeWidth="1.5" />

        {/* Building 3 (Angled Civic Hub) */}
        <polygon points="250,300 250,140 320,180 320,300" stroke="#0A0A0A" strokeWidth="1.5" fill="#FFFFFF" />
        <line x1="270" y1="190" x2="300" y2="207" stroke="#E5E7EB" strokeWidth="1.5" />
        <line x1="270" y1="220" x2="300" y2="237" stroke="#E5E7EB" strokeWidth="1.5" />
        <line x1="270" y1="250" x2="300" y2="267" stroke="#E5E7EB" strokeWidth="1.5" />

        {/* Building 4 (Right Data Center) */}
        <rect x="340" y="200" width="70" height="100" stroke="#0A0A0A" strokeWidth="1.5" fill="#FFFFFF" />
        <line x1="355" y1="225" x2="395" y2="225" stroke="#2563EB" strokeWidth="1.5" />
        <line x1="355" y1="245" x2="395" y2="245" stroke="#E5E7EB" strokeWidth="1.5" />
        <line x1="355" y1="265" x2="395" y2="265" stroke="#E5E7EB" strokeWidth="1.5" />

        {/* Network Connection Lines */}
        <path d="M190 55 L320 180" stroke="#2563EB" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
        <path d="M100 160 L190 90" stroke="#2563EB" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
        <circle cx="100" cy="160" r="3" fill="#2563EB" />
        <circle cx="320" cy="180" r="3" fill="#2563EB" />
        <circle cx="375" cy="200" r="3" fill="#2563EB" />
      </svg>
    </div>
  );
}
