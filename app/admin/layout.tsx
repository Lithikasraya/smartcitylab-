'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { usePortalStore } from '@/lib/store';
import { auth, isFirebaseConfigured } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { logoutUser } from '@/lib/firebaseService';
import { 
  LayoutDashboard, 
  FolderGit2, 
  CheckSquare, 
  Users, 
  Target, 
  Mail, 
  Settings as SettingsIcon,
  Search,
  LogOut,
  ShieldCheck, 
  GraduationCap,
  Layers,
  BookOpen,
  Newspaper,
  Award
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, setUser } = usePortalStore();
  const [searchQuery, setSearchQuery] = useState('');

  // If on login page `/admin`, render clean without sidebar and avoid attaching listeners
  const isLoginPage = pathname === '/admin';

  // Sync Firebase Auth state once when mounted on admin CRM sub-routes
  useEffect(() => {
    if (!isFirebaseConfigured || isLoginPage) {
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Authenticated admin
        setUser({
          role: 'super_admin',
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Super Admin',
          email: firebaseUser.email || 'admin@kiet.edu',
          avatar: firebaseUser.photoURL || undefined,
        });
      }
    });

    return () => unsubscribe();
  }, [isLoginPage]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoginPage) {
    return <>{children}</>;
  }

  // Super Admin Navigation Links for all Admin Data pages
  const superAdminLinks = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Projects', href: '/admin/projects', icon: FolderGit2 },
    { name: 'Approvals', href: '/admin/approvals', icon: CheckSquare },
    { name: 'Students Data', href: '/admin/students', icon: GraduationCap },
    { name: 'Batches', href: '/admin/batches', icon: Layers },
    { name: 'Faculty & Mentors', href: '/admin/faculty', icon: Award },
    { name: 'Teams', href: '/admin/teams', icon: Users },
    { name: 'Quests', href: '/admin/quests', icon: Target },
    { name: 'Blogs', href: '/admin/blogs', icon: BookOpen },
    { name: 'News', href: '/admin/news', icon: Newspaper },
    { name: 'Newsletter', href: '/admin/newsletter', icon: Mail },
    { name: 'Settings', href: '/admin/settings', icon: SettingsIcon },
  ];

  const isActive = (href: string) => {
    if (href === '/admin/dashboard') return pathname === '/admin/dashboard';
    return pathname.startsWith(href);
  };

  const handleSignOut = async () => {
    try {
      await logoutUser();
    } catch {
      // ignore
    }
    router.push('/admin');
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col md:flex-row font-sans text-[#0A0A0A]">
      
      {/* ===================== LEFT SIDEBAR ===================== */}
      <aside className="w-full md:w-64 bg-white border-r border-[#E5E7EB] flex flex-col md:h-screen md:sticky md:top-0 z-30">
        
        {/* Brand / Logo */}
        <div className="p-5 border-b border-[#E5E7EB]">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 p-1 flex items-center justify-center shrink-0">
              <img src="/smartcity-logo.png" alt="Smart City Lab" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="text-[16px] font-bold tracking-tight text-[#0A0A0A] block leading-tight">
                KIET Smart City Lab
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-1.5 mt-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-50 border border-blue-200 text-blue-600">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              Super Admin Console
            </span>
          </div>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {superAdminLinks.map((link) => {
            const active = isActive(link.href);
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-3 px-3.5 py-2 rounded-lg text-[14px] font-medium transition-colors ${
                  active
                    ? 'bg-[#2563EB] text-white font-semibold shadow-sm shadow-blue-500/20'
                    : 'text-[#0A0A0A] hover:bg-[#F8F9FA] hover:text-[#2563EB]'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-[#6B7280]'}`} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Sign Out with real Firebase Logout */}
        <div className="p-4 border-t border-[#E5E7EB]">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-between px-3 py-2 text-[13px] font-medium text-[#6B7280] hover:text-red-600 rounded-lg transition-colors border border-transparent hover:border-red-200 hover:bg-red-50"
          >
            <span>Sign Out</span>
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>

      </aside>

      {/* ===================== MAIN CONTENT AREA ===================== */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-[#E5E7EB] px-6 sm:px-8 flex items-center justify-between sticky top-0 z-20">
          
          {/* Search field */}
          <div className="relative w-72 sm:w-96">
            <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search projects, students, cohorts, faculty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-[#E5E7EB] bg-[#F8F9FA] text-[14px] text-[#0A0A0A] placeholder-[#6B7280] focus:outline-none focus:border-[#2563EB] focus:bg-white transition-colors"
            />
          </div>

          {/* Admin Avatar & Profile */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-[13px] font-bold text-[#0A0A0A] leading-tight">
                {user?.name || 'Super Admin'}
              </p>
              <p className="text-[11px] text-[#2563EB] font-semibold">
                Super Admin
              </p>
            </div>
            <div className="w-9 h-9 rounded-full border border-blue-200 bg-blue-50 overflow-hidden flex items-center justify-center font-bold text-[13px] text-[#2563EB]">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                (user?.name || 'A').charAt(0).toUpperCase()
              )}
            </div>
          </div>

        </header>

        {/* Dashboard Page Body */}
        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>

      </div>

    </div>
  );
}
