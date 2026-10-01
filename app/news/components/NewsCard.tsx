'use client';

import React, { useState } from 'react';
import Card from '@/components/shared/Card';
import { NewsItem } from '@/lib/data';
import { Heart, Share2, Check, Zap } from 'lucide-react';

interface NewsCardProps {
  item: NewsItem;
}

export default function NewsCard({ item }: NewsCardProps) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(item.likes);
  const [copied, setCopied] = useState(false);

  const isTrending = item.trending || item.title.startsWith('[Trending]');
  const cleanTitle = item.title.replace('[Trending]', '').trim();

  const handleLike = () => {
    if (liked) {
      setLikesCount(likesCount - 1);
      setLiked(false);
    } else {
      setLikesCount(likesCount + 1);
      setLiked(true);
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/news#${item.id}`;
    navigator.clipboard?.writeText?.(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card id={item.id} className="text-left space-y-4 hover:border-[#0A0A0A] transition-colors">
      <div className="flex items-center justify-between text-[13px] text-[#6B7280]">
        <div className="flex items-center gap-2">
          {isTrending ? (
            <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#2563EB] bg-[#F8F9FA] px-2 py-0.5 rounded border border-[#E5E7EB]">
              <Zap className="w-3 h-3" />
              Instant Update
            </span>
          ) : (
            <span className="font-semibold text-[#2563EB]">{item.category}</span>
          )}
          <span>•</span>
          <span>{item.publishedAt}</span>
        </div>
        {item.teamName && (
          <span className="text-[12px] text-[#6B7280]">
            {item.teamName}
          </span>
        )}
      </div>

      <div className="space-y-2">
        <h3 className="text-[18px] font-bold text-[#0A0A0A] leading-snug">
          {cleanTitle}
        </h3>
        <p className="text-[15px] text-[#6B7280] leading-relaxed">
          {item.content || item.summary}
        </p>
      </div>

      {item.imageUrl && (
        <div className="rounded-lg overflow-hidden border border-[#E5E7EB] h-60 bg-[#F8F9FA]">
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="pt-4 border-t border-[#E5E7EB] flex items-center justify-between text-[13px] text-[#6B7280]">
        <div>
          Posted by <span className="text-[#0A0A0A] font-medium">{item.author}</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleLike}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[13px] border transition-colors ${
              liked
                ? 'border-[#2563EB] text-[#2563EB] bg-[#F8F9FA]'
                : 'border-[#E5E7EB] text-[#6B7280] hover:text-[#0A0A0A]'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-[#2563EB]' : ''}`} />
            <span>{likesCount}</span>
          </button>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[13px] border border-[#E5E7EB] text-[#6B7280] hover:text-[#0A0A0A] transition-colors"
            title="Copy share link"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Share'}</span>
          </button>
        </div>
      </div>
    </Card>
  );
}