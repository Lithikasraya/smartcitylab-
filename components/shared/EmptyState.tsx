'use client';

import React from 'react';
import Button from './Button';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

export default function EmptyState({
  title = 'No items found',
  description = 'There are no records matching your current filter.',
  actionText,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="py-16 text-center border border-[#E5E7EB] rounded-xl bg-[#F8F9FA] p-8 space-y-3">
      <h3 className="text-[17px] font-bold text-[#0A0A0A]">{title}</h3>
      <p className="text-[14px] text-[#6B7280] max-w-sm mx-auto">{description}</p>
      {actionText && onAction && (
        <div className="pt-2">
          <Button variant="outline" size="sm" onClick={onAction}>
            {actionText}
          </Button>
        </div>
      )}
    </div>
  );
}