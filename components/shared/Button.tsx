'use client';

import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  icon?: React.ReactNode;
  loading?: boolean;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  loading = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  // Base button styles strictly per design system: 8-10px radius, 14-15px medium text, no gradient, no shadow
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-[9px] transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-[14px] gap-1.5',
    md: 'px-4 py-2 text-[15px] gap-2',
    lg: 'px-6 py-2.5 text-[15px] gap-2.5',
  };

  const variantStyles = {
    // Solid blue with white text and cool shadow as requested by user
    primary: 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-sm shadow-blue-600/30 hover:shadow-md hover:shadow-blue-600/40 active:translate-y-0.5 transition-all',
    // Black-outline with black text
    outline: 'border border-[#0A0A0A] text-[#0A0A0A] hover:bg-[#F8F9FA] active:bg-[#E5E7EB] bg-transparent shadow-xs transition-all',
    // Light gray outline / secondary
    secondary: 'border border-[#E5E7EB] text-[#0A0A0A] hover:bg-[#F8F9FA] bg-white shadow-xs transition-all',
    // Error state button
    danger: 'border border-[#EF4444] text-[#EF4444] hover:bg-[#FEF2F2] bg-white shadow-xs transition-all',
    // Ghost variant
    ghost: 'text-[#6B7280] hover:text-[#0A0A0A] hover:bg-[#F8F9FA] bg-transparent',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg>
      ) : icon ? (
        <span className="flex-shrink-0">{icon}</span>
      ) : null}
      <span>{children}</span>
    </button>
  );
}