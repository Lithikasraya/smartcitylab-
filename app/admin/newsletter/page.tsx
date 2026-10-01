'use client';

import React, { useState } from 'react';
import Card from '@/components/shared/Card';
import Button from '@/components/shared/Button';
import { usePortalStore } from '@/lib/store';
import { CheckCircle2 } from 'lucide-react';

export default function AdminNewsletterPage() {
  const { projects, news, teams } = usePortalStore();
  const [selectedMonth, setSelectedMonth] = useState('March 2026');
  const [copied, setCopied] = useState(false);
  const [sentNotice, setSentNotice] = useState(false);

  const approvedProjects = projects.filter((p) => p.status === 'approved');
  const recentNews = news.slice(0, 3);

  const handleCopy = () => {
    const textContent = `
KIET SMART CITY LAB - MONTHLY SUMMARY (${selectedMonth})
======================================================

1. COMPLETED & APPROVED PROJECTS:
${approvedProjects.map((p, i) => `${i + 1}. ${p.title} (${p.teamName})\n   - ${p.description}\n   - Tech: ${p.techStack.join(', ')}\n`).join('\n')}

2. LAB NEWS & ACHIEVEMENTS:
${recentNews.map((n, i) => `${i + 1}. ${n.title}\n   - ${n.summary}\n`).join('\n')}

3. ACTIVE RESEARCH TEAMS:
${teams.map((t) => `- ${t.name} (Lead: ${t.teamLead.name}, Members: ${t.membersCount})`).join('\n')}
    `;

    navigator.clipboard?.writeText?.(textContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSend = () => {
    setSentNotice(true);
    setTimeout(() => setSentNotice(false), 3500);
  };

  return (
    <div className="space-y-8 text-left max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E5E7EB]">
        <div>
          <h1 className="text-[28px] sm:text-[32px] font-bold text-[#0A0A0A] tracking-tight">
            Monthly Lab Newsletter
          </h1>
          <p className="text-[14px] text-[#6B7280] mt-1">
            Generate and distribute monthly summaries of approved student innovations, quests, and field tests.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-[14px] text-[#0A0A0A] focus:border-[#2563EB] focus:outline-none"
          >
            <option value="March 2026">March 2026 Edition</option>
            <option value="February 2026">February 2026 Edition</option>
            <option value="January 2026">January 2026 Edition</option>
          </select>
          <Button variant="outline" size="md" onClick={handleCopy}>
            {copied ? 'Copied!' : 'Copy Digest'}
          </Button>
          <Button variant="primary" size="md" onClick={handleSend}>
            Broadcast
          </Button>
        </div>
      </div>

      {sentNotice && (
        <div className="p-4 rounded-lg bg-[#F8F9FA] border border-[#10B981] text-[14px] text-[#0A0A0A] flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-[#10B981] flex-shrink-0" />
          <span>Newsletter digest dispatched to all registered faculty and student interns.</span>
        </div>
      )}

      {/* Newsletter Preview Document */}
      <Card className="space-y-8 p-8 border border-[#E5E7EB]">
        
        {/* Document Header */}
        <div className="border-b border-[#E5E7EB] pb-6 space-y-2">
          <span className="text-[12px] font-semibold text-[#2563EB] uppercase tracking-wider">
            Monthly Publication
          </span>
          <h2 className="text-[24px] font-bold text-[#0A0A0A]">
            KIET Smart City Lab Research Bulletin — {selectedMonth}
          </h2>
          <p className="text-[14px] text-[#6B7280]">
            Compiled automatically from verified submissions and Super Admin sign-offs.
          </p>
        </div>

        {/* Section 1: Completed Projects */}
        <div className="space-y-4">
          <h3 className="text-[16px] font-bold text-[#0A0A0A]">
            1. Completed & Approved Projects ({approvedProjects.length})
          </h3>
          <div className="space-y-3">
            {approvedProjects.map((p) => (
              <div key={p.id} className="p-4 rounded-lg border border-[#E5E7EB] bg-[#F8F9FA] space-y-1.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-[15px] font-bold text-[#0A0A0A]">{p.title}</h4>
                  <span className="text-[12px] text-[#2563EB] font-medium">{p.teamName}</span>
                </div>
                <p className="text-[13px] text-[#6B7280]">{p.description}</p>
                <div className="text-[12px] text-[#6B7280] pt-1">
                  Stack: {p.techStack.join(', ')} • Lead: {p.teamLead}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: News & Milestones */}
        <div className="space-y-4">
          <h3 className="text-[16px] font-bold text-[#0A0A0A]">
            2. Lab Milestones & Field Testing ({recentNews.length})
          </h3>
          <div className="space-y-3">
            {recentNews.map((n) => (
              <div key={n.id} className="p-4 rounded-lg border border-[#E5E7EB] bg-[#F8F9FA] space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-[15px] font-bold text-[#0A0A0A]">{n.title}</h4>
                  <span className="text-[12px] text-[#6B7280]">{n.publishedAt}</span>
                </div>
                <p className="text-[13px] text-[#6B7280]">{n.summary}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Registered Research Teams */}
        <div className="space-y-4">
          <h3 className="text-[16px] font-bold text-[#0A0A0A]">
            3. Active Research Teams ({teams.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {teams.map((t) => (
              <div key={t.id} className="p-3.5 rounded-lg border border-[#E5E7EB] bg-white space-y-1">
                <h4 className="text-[14px] font-bold text-[#0A0A0A]">{t.name}</h4>
                <p className="text-[12px] text-[#6B7280]">
                  Team Lead: {t.teamLead.name} • {t.membersCount} Members
                </p>
              </div>
            ))}
          </div>
        </div>

      </Card>

    </div>
  );
}
