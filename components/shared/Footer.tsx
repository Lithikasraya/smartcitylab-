'use client';

import React from 'react';
import Link from 'next/link';
import { Zap, Mail } from 'lucide-react';
import { usePortalStore } from '@/lib/store';

const NAV = {
  Platform: [
    { label: 'Project Showcase', href: '/projects' },
    { label: 'Research Blogs', href: '/blogs' },
    { label: 'News Feed', href: '/news' },
    { label: 'Photo Gallery', href: '/gallery' },
    { label: 'Intern Batches', href: '/batches' },
  ],
  Research: [
    { label: 'Edge AI & CV', href: '/projects' },
    { label: 'IoT & LoRaWAN', href: '/projects' },
    { label: 'Solar Microgrids', href: '/projects' },
    { label: 'Smart Mobility', href: '/projects' },
    { label: 'Architecture Papers', href: '/blogs' },
  ],
  Lab: [
    { label: 'About the Lab', href: '/' },
    { label: 'Student Portal', href: '/student/dashboard' },
    { label: 'Admin Login', href: '/admin' },
    { label: 'Contact Us', href: '/' },
  ],
};

export default function Footer() {
  const { contactSettings } = usePortalStore();
  const contactEmail = contactSettings?.contactEmail || 'smartcitylab@kiet.edu';
  const githubUrl = contactSettings?.githubUrl || 'https://github.com';
  const twitterUrl = contactSettings?.twitterUrl || 'https://twitter.com';
  const linkedinUrl = contactSettings?.linkedinUrl || 'https://linkedin.com';

  return (
    <footer className="bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-16 pb-10">

        {/* Top grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-white/[0.08]">

          {/* Brand */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-blue-600 rounded-[10px] flex items-center justify-center shadow-[0_2px_8px_rgba(37,99,235,0.5)]">
                <Zap className="w-4 h-4 text-white fill-white" />
              </div>
              <span className="font-bold text-[16px] text-white">
                KIET <span className="text-blue-500">Smart City Lab</span>
              </span>
            </div>
            <p className="text-[14px] text-gray-400 leading-relaxed max-w-sm">
              {contactSettings?.address ? `${contactSettings.address}. We design, build, and deploy intelligent urban systems.` : 'A Center of Excellence at KIET Group of Institutions. We design, build, and deploy intelligent urban systems — from IoT sensor networks to autonomous energy grids.'}
            </p>
            <div className="flex items-center gap-3 pt-1">
              <a href={githubUrl} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-white/[0.07] hover:bg-white/[0.12] flex items-center justify-center text-gray-400 hover:text-white transition-colors" title="GitHub">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.929.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
              </a>
              <a href={twitterUrl} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-white/[0.07] hover:bg-white/[0.12] flex items-center justify-center text-gray-400 hover:text-white transition-colors" title="Twitter">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.261 5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href={linkedinUrl} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-white/[0.07] hover:bg-white/[0.12] flex items-center justify-center text-gray-400 hover:text-white transition-colors" title="LinkedIn">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
              <a href={`mailto:${contactEmail}`} className="w-8 h-8 rounded-lg bg-white/[0.07] hover:bg-white/[0.12] flex items-center justify-center text-gray-400 hover:text-white transition-colors" title={`Email: ${contactEmail}`}>
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(NAV).map(([section, links]) => (
            <div key={section} className="space-y-3">
              <h4 className="text-[12px] font-bold uppercase tracking-widest text-gray-500">{section}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-[14px] text-gray-400 hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-gray-500">
          <div className="flex items-center gap-3">
            <span>© {new Date().getFullYear()} KIET Smart City Lab.</span>
            <span className="hidden sm:inline text-gray-700">·</span>
            <span className="hidden sm:inline">Innovation Block C, Ghaziabad 201206</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-gray-300 transition-colors">Privacy</Link>
            <Link href="/" className="hover:text-gray-300 transition-colors">Terms</Link>
            <Link href="/projects" className="hover:text-gray-300 transition-colors">Open Research</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}