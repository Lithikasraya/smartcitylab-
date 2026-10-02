'use client';

import React from 'react';
import Card from '@/components/shared/Card';
import { GalleryItem } from '@/lib/data';

interface GalleryCardProps {
  item: GalleryItem;
  onSelect: (item: GalleryItem) => void;
}

export default function GalleryCard({ item, onSelect }: GalleryCardProps) {
  return (
    <Card
      className="p-0 overflow-hidden cursor-pointer rounded-2xl border border-gray-200/80 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06),0_1px_4px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_48px_rgba(0,0,0,0.12)] hover:border-blue-400/50 transition-all group flex flex-col justify-between"
      onClick={() => onSelect(item)}
    >
      <div className="h-60 w-full overflow-hidden bg-[#F8F9FA] relative">
        <img
          src={item.imageUrl}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <div className="p-4 text-left space-y-1">
        <div className="flex items-center justify-between text-[12px] text-[#6B7280]">
          <span className="font-semibold text-[#2563EB]">{item.category}</span>
          <span>{item.date}</span>
        </div>
        <h4 className="text-[15px] font-bold text-[#0A0A0A] line-clamp-1">
          {item.title}
        </h4>
        <p className="text-[13px] text-[#6B7280] line-clamp-2">
          {item.description}
        </p>
      </div>
    </Card>
  );
}