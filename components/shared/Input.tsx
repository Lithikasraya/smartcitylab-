'use client';

import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export function Input({
  label,
  error,
  helperText,
  icon,
  id,
  className = '',
  ...props
}: InputProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5 text-left">
      {label && (
        <label htmlFor={inputId} className="block text-[14px] font-medium text-[#0A0A0A]">
          {label}
        </label>
      )}
      <div className="relative w-full">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#6B7280] flex items-center justify-center">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={`w-full rounded-lg border bg-white ${icon ? 'pl-10 pr-3.5' : 'px-3.5'} py-2.5 text-[15px] text-[#0A0A0A] placeholder-[#6B7280]/60 transition-colors focus:border-[#2563EB] focus:outline-none disabled:bg-[#F8F9FA] disabled:text-[#6B7280] ${
            error ? 'border-[#EF4444]' : 'border-[#E5E7EB]'
          } ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-[13px] text-[#EF4444]">{error}</p>}
      {helperText && !error && <p className="text-[13px] text-[#6B7280]">{helperText}</p>}
    </div>
  );
}

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Textarea({
  label,
  error,
  helperText,
  id,
  className = '',
  ...props
}: TextareaProps) {
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5 text-left">
      {label && (
        <label htmlFor={textareaId} className="block text-[14px] font-medium text-[#0A0A0A]">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-[15px] text-[#0A0A0A] placeholder-[#6B7280]/60 transition-colors focus:border-[#2563EB] focus:outline-none disabled:bg-[#F8F9FA] disabled:text-[#6B7280] ${
          error ? 'border-[#EF4444]' : 'border-[#E5E7EB]'
        } ${className}`}
        {...props}
      />
      {error && <p className="text-[13px] text-[#EF4444]">{error}</p>}
      {helperText && !error && <p className="text-[13px] text-[#6B7280]">{helperText}</p>}
    </div>
  );
}

export default Input;
