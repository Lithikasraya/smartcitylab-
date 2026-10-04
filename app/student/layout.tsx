'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Target, 
  Plus, 
  Users, 
  User, 
  Bell 
} from 'lucide-react';
import { usePortalStore } from '@/lib/store';
import QuickSubmitModal from '@/components/shared/QuickSubmitModal';
import Button from '@/components/shared/Button';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = usePortalStore();
  const [quickSubmitOpen, setQuickSubmitOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/student/dashboard') return pathname === '/student/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#0A0A0A] flex flex-col font-sans pb-20 md:pb-0">
      
      {/* ===================== DESKTOP & MOBILE TOP HEADER ===================== */}
      <header className="sticky top-0 z-30 w-full bg-white border-b border-[#E5E7EB] px-4 sm:px-8 h-16 flex items-center justify-between">
        
        {/* Brand logo & team badge */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 text-[17px] font-bold text-[#0A0A0A] tracking-tight">
            <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 p-0.5 flex items-center justify-center shrink-0">
              <img src="/smartcity-logo.png" alt="Smart City Lab" className="w-full h-full object-contain" />
            </div>
            <span>KIET Smart City Lab</span>
          </Link>
          <span className="hidden sm:inline-block px-2.5 py-0.5 rounded text-[12px] font-medium border border-[#E5E7EB] bg-[#F8F9FA] text-[#2563EB]">
            {user.teamName || 'Team CyberVision'}
          </span>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/student/dashboard"
            className={`text-[14px] font-medium transition-colors ${
              isActive('/student/dashboard') ? 'text-[#2563EB]' : 'text-[#6B7280] hover:text-[#0A0A0A]'
            }`}
          >
            Home
          </Link>
          <Link
            href="/student/quests"
            className={`text-[14px] font-medium transition-colors ${
              isActive('/student/quests') ? 'text-[#2563EB]' : 'text-[#6B7280] hover:text-[#0A0A0A]'
            }`}
          >
            Quests
          </Link>
          <Link
            href="/student/submit"
            className={`text-[14px] font-medium transition-colors ${
              isActive('/student/submit') ? 'text-[#2563EB]' : 'text-[#6B7280] hover:text-[#0A0A0A]'
            }`}
          >
            Task Video
          </Link>
          <Link
            href="/student/team"
            className={`text-[14px] font-medium transition-colors ${
              isActive('/student/team') ? 'text-[#2563EB]' : 'text-[#6B7280] hover:text-[#0A0A0A]'
            }`}
          >
            Team
          </Link>
          <Link
            href="/student/profile"
            className={`text-[14px] font-medium transition-colors ${
              isActive('/student/profile') ? 'text-[#2563EB]' : 'text-[#6B7280] hover:text-[#0A0A0A]'
            }`}
          >
            Profile & ID
          </Link>
          <Link
            href="/workspace"
            className="text-[13px] font-bold text-[#6366F1] hover:text-[#4F46E5] flex items-center gap-1.5 transition-colors bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-lg border border-indigo-200"
          >
            <span>SCL Space</span>
            <span className="text-[10px] bg-[#6366F1] text-white px-1.5 py-0.2 rounded font-semibold">Studio</span>
          </Link>
        </nav>

        {/* Header Right Actions */}
        <div className="flex items-center gap-3">
          {/* Quick Submit button on Desktop */}
          <Button
            variant="primary"
            size="sm"
            className="hidden sm:inline-flex"
            onClick={() => setQuickSubmitOpen(true)}
          >
            + Quick Submit
          </Button>

          {/* Notifications bell */}
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 rounded-lg text-[#6B7280] hover:text-[#0A0A0A] hover:bg-[#F8F9FA] transition-colors relative"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="w-2 h-2 rounded-full bg-[#2563EB] absolute top-2 right-2" />
          </button>

          {/* User Avatar */}
          <Link href="/student/profile" className="flex items-center gap-2">
            <img
              src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover border border-[#E5E7EB]"
            />
          </Link>
        </div>

      </header>

      {/* Notifications Drawer Dropdown */}
      {notificationsOpen && (
        <div className="fixed top-16 right-4 sm:right-8 z-50 w-80 bg-white border border-[#E5E7EB] rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB]">
            <h4 className="text-[14px] font-bold text-[#0A0A0A]">Push Notifications</h4>
            <span className="text-[11px] text-[#2563EB]">Mark all read</span>
          </div>
          <div className="space-y-2 text-left">
            <div className="p-2.5 rounded-lg bg-[#F8F9FA] border border-[#E5E7EB] text-[13px] space-y-0.5">
              <p className="font-semibold text-[#0A0A0A]">Task Submission Approved</p>
              <p className="text-[#6B7280] text-[12px]">Your 30s video assignment was reviewed by the Super Admin.</p>
            </div>
            <div className="p-2.5 rounded-lg bg-[#F8F9FA] border border-[#E5E7EB] text-[13px] space-y-0.5">
              <p className="font-semibold text-[#0A0A0A]">Team Meeting Tomorrow</p>
              <p className="text-[#6B7280] text-[12px]">Team CyberVision lab review at 4:30 PM.</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>

      {/* ===================== MOBILE BOTTOM TAB BAR ===================== */}
      {/* Home, Quests, Submit (center, blue circular + button), Team, Profile — simple line icons with labels, blue for active */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E5E7EB] px-3 py-1.5 flex items-center justify-around">
        
        {/* Tab 1: Home */}
        <Link
          href="/student/dashboard"
          className={`flex flex-col items-center py-1 transition-colors ${
            isActive('/student/dashboard') ? 'text-[#2563EB]' : 'text-[#6B7280]'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[11px] mt-0.5 font-medium">Home</span>
        </Link>

        {/* Tab 2: Quests */}
        <Link
          href="/student/quests"
          className={`flex flex-col items-center py-1 transition-colors ${
            isActive('/student/quests') ? 'text-[#2563EB]' : 'text-[#6B7280]'
          }`}
        >
          <Target className="w-5 h-5" />
          <span className="text-[11px] mt-0.5 font-medium">Quests</span>
        </Link>

        {/* Tab 3: Submit (Center, blue circular + button) */}
        <div className="flex flex-col items-center -mt-5">
          <button
            onClick={() => setQuickSubmitOpen(true)}
            className="w-12 h-12 rounded-full bg-[#2563EB] text-white flex items-center justify-center transition-transform active:scale-95"
            aria-label="Quick Submit"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
          <span className="text-[11px] mt-1 font-medium text-[#2563EB]">Submit</span>
        </div>

        {/* Tab 4: Team */}
        <Link
          href="/student/team"
          className={`flex flex-col items-center py-1 transition-colors ${
            isActive('/student/team') ? 'text-[#2563EB]' : 'text-[#6B7280]'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[11px] mt-0.5 font-medium">Team</span>
        </Link>

        {/* Tab 5: Profile */}
        <Link
          href="/student/profile"
          className={`flex flex-col items-center py-1 transition-colors ${
            isActive('/student/profile') ? 'text-[#2563EB]' : 'text-[#6B7280]'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[11px] mt-0.5 font-medium">Profile</span>
        </Link>

      </nav>

      {/* Shared Quick Submit Modal for + button */}
      <QuickSubmitModal
        isOpen={quickSubmitOpen}
        onClose={() => setQuickSubmitOpen(false)}
      />

    </div>
  );
}
