'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Mail } from 'lucide-react';
import { usePortalStore } from '@/lib/store';

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Projects', href: '/projects' },
  { name: 'News', href: '/news' },
  { name: 'Batches', href: '/batches' },
  { name: 'Blogs', href: '/blogs' },
  { name: 'Gallery', href: '/gallery' },
];

export default function Navbar() {
  const { contactSettings } = usePortalStore();
  const contactEmail = contactSettings?.contactEmail || 'smartcitylab@kiet.edu';
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/85 backdrop-blur-2xl border-b border-black/[0.06] shadow-[0_2px_20px_rgba(0,0,0,0.06)]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Official Smart City Lab Logo ── */}
          <Link href="/" className="group flex items-center gap-2.5 shrink-0 select-none">
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/80 p-1 flex items-center justify-center shadow-xs group-hover:scale-105 group-hover:border-blue-500/80 transition-all duration-200">
              <img
                src="/smartcity-logo.png"
                alt="KIET Smart City Lab Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-black text-[16px] tracking-tight text-gray-900 group-hover:text-blue-600 transition-colors uppercase leading-tight">
                KIET <span className="text-blue-600">SmartCity Lab</span>
              </span>
            </div>
          </Link>

          {/* ── Desktop Nav ── */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative px-3.5 py-2 rounded-lg text-[14px] font-medium transition-colors duration-150 ${
                    active
                      ? 'text-blue-600'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/70'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-lg bg-blue-50 border border-blue-100"
                      transition={{ type: 'spring', stiffness: 400, damping: 40 }}
                    />
                  )}
                  <span className="relative">{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* ── Contact Us CTA ── */}
          <div className="hidden md:flex items-center gap-2.5">
            <a
              href={`mailto:${contactEmail}`}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[13.5px] font-semibold rounded-lg shadow-[0_2px_8px_rgba(37,99,235,0.3)] hover:shadow-[0_4px_14px_rgba(37,99,235,0.4)] transition-all duration-200"
            >
              <Mail className="w-3.5 h-3.5" />
              Contact Us
            </a>
          </div>

          {/* ── Mobile Menu Button ── */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="md:hidden bg-white/95 backdrop-blur-2xl border-b border-gray-100 shadow-xl"
          >
            <div className="max-w-7xl mx-auto px-5 py-4 space-y-1">
              <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-center px-3 py-2.5 rounded-xl text-[15px] font-semibold text-gray-900 hover:bg-gray-50">
                Home
              </Link>
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center px-3 py-2.5 rounded-xl text-[15px] font-medium transition-colors ${
                    isActive(link.href) ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-3 pb-1 border-t border-gray-100 mt-2">
                <a
                  href={`mailto:${contactEmail}`}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-center text-[14px] font-semibold text-white"
                >
                  <Mail className="w-4 h-4" /> Contact Us
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}