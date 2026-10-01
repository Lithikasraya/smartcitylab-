'use client';

import React, { useState } from 'react';
import Card from '@/components/shared/Card';
import Button from '@/components/shared/Button';
import { usePortalStore } from '@/lib/store';
import { QrCode, Bell, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function StudentProfilePage() {
  const { user, teams } = usePortalStore();

  const [taskPush, setTaskPush] = useState(true);
  const [approvalPush, setApprovalPush] = useState(true);
  const [teamPush, setTeamPush] = useState(true);
  const [savedNotice, setSavedNotice] = useState(false);

  const currentTeam = teams.find((t) => t.id === user.teamId) || teams[0];

  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="space-y-8 text-left max-w-2xl mx-auto">
      
      {/* Header */}
      <div className="pb-2 border-b border-[#E5E7EB]">
        <h1 className="text-[28px] sm:text-[32px] font-bold text-[#0A0A0A] tracking-tight">
          Student Profile & ID
        </h1>
        <p className="text-[14px] text-[#6B7280] mt-1">
          Your official laboratory credentials, team affiliation, and push notification preferences.
        </p>
      </div>

      {savedNotice && (
        <div className="p-4 rounded-lg bg-[#F8F9FA] border border-[#2563EB] text-[14px] text-[#0A0A0A] flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-[#2563EB] flex-shrink-0" />
          <span>Notification preferences updated.</span>
        </div>
      )}

      {/* ===================== DIGITAL ID CARD AT THE TOP ===================== */}
      {/* (This is the ONLY place a blue or blue-to-black gradient background is allowed per design system) */}
      <div className="rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#0A0A0A] text-white p-7 shadow-none select-none relative overflow-hidden">
        
        {/* Top Header of ID */}
        <div className="flex items-center justify-between pb-6 border-b border-white/20">
          <div>
            <span className="text-[11px] font-bold tracking-widest uppercase text-white/80 block">
              KIET Group of Institutions
            </span>
            <span className="text-[16px] font-bold text-white tracking-tight">
              Smart City Lab • Identity Pass
            </span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/20">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Identity Details */}
        <div className="pt-6 flex flex-col sm:flex-row sm:items-center gap-6">
          <img
            src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'}
            alt={user.name}
            className="w-20 h-20 rounded-xl object-cover border-2 border-white/40 flex-shrink-0"
          />

          <div className="space-y-1 flex-1">
            <h2 className="text-[22px] font-bold tracking-tight text-white leading-tight">
              {user.name}
            </h2>
            <p className="text-[14px] font-medium text-white/90">
              {user.teamName || 'Team CyberVision'} • Research Intern
            </p>
            <p className="text-[13px] font-mono text-white/70">
              Roll: {user.rollNo || '2300290100098'}
            </p>
            <p className="text-[12px] text-white/70">
              {user.email}
            </p>
          </div>

          {/* QR Code representation */}
          <div className="w-16 h-16 rounded-lg bg-white p-1.5 flex items-center justify-center self-start sm:self-auto flex-shrink-0">
            <QrCode className="w-full h-full text-[#0A0A0A]" />
          </div>
        </div>

        {/* Valid until badge */}
        <div className="pt-6 mt-6 border-t border-white/15 flex items-center justify-between text-[11px] text-white/70">
          <span>Official Lab Credential</span>
          <span>Valid Cohort 2025–2026</span>
        </div>

      </div>

      {/* ===================== TEAM INFO & TEAM LEAD PLAINLY BELOW ===================== */}
      <Card className="space-y-4">
        <h3 className="text-[18px] font-bold text-[#0A0A0A]">
          Team Affiliation Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[14px]">
          <div className="p-3.5 rounded-lg border border-[#E5E7EB] bg-[#F8F9FA] space-y-1">
            <span className="text-[12px] text-[#6B7280] font-medium block">Allocated Research Team</span>
            <span className="font-bold text-[#0A0A0A] block">{currentTeam.name}</span>
            <span className="text-[12px] text-[#2563EB]">Accent Theme: {currentTeam.colorTheme}</span>
          </div>

          <div className="p-3.5 rounded-lg border border-[#E5E7EB] bg-[#F8F9FA] space-y-1">
            <span className="text-[12px] text-[#6B7280] font-medium block">Assigned Team Lead</span>
            <span className="font-bold text-[#0A0A0A] block">{currentTeam.teamLead.name}</span>
            <span className="text-[12px] text-[#6B7280]">{currentTeam.teamLead.email}</span>
          </div>
        </div>

        <div className="pt-2 text-[13px] text-[#6B7280]">
          Active Research Domain: <strong className="text-[#0A0A0A]">IoT, Embedded Telemetry & Computer Vision</strong>
        </div>
      </Card>

      {/* ===================== PUSH NOTIFICATIONS SETTINGS ===================== */}
      <Card className="space-y-5">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-[#2563EB]" />
          <h3 className="text-[18px] font-bold text-[#0A0A0A]">
            Push Notifications
          </h3>
        </div>
        <p className="text-[13px] text-[#6B7280]">
          Configure real-time browser and mobile notifications for tasks, approvals, and team updates.
        </p>

        <form onSubmit={handleSaveNotifications} className="space-y-4 divide-y divide-[#E5E7EB]">
          
          <div className="flex items-center justify-between pt-3">
            <div>
              <p className="text-[14px] font-medium text-[#0A0A0A]">Task & Assignment Deadlines</p>
              <p className="text-[12px] text-[#6B7280]">Get reminders for 30s video assignment submissions</p>
            </div>
            <input
              type="checkbox"
              checked={taskPush}
              onChange={(e) => setTaskPush(e.target.checked)}
              className="w-4 h-4 text-[#2563EB] rounded border-[#E5E7EB]"
            />
          </div>

          <div className="flex items-center justify-between pt-3">
            <div>
              <p className="text-[14px] font-medium text-[#0A0A0A]">Super Admin Approval Alerts</p>
              <p className="text-[12px] text-[#6B7280]">Notify when your project, blog, or news post is verified</p>
            </div>
            <input
              type="checkbox"
              checked={approvalPush}
              onChange={(e) => setApprovalPush(e.target.checked)}
              className="w-4 h-4 text-[#2563EB] rounded border-[#E5E7EB]"
            />
          </div>

          <div className="flex items-center justify-between pt-3">
            <div>
              <p className="text-[14px] font-medium text-[#0A0A0A]">Team Updates & Standup Calls</p>
              <p className="text-[12px] text-[#6B7280]">Announcements from Team Lead {currentTeam.teamLead.name}</p>
            </div>
            <input
              type="checkbox"
              checked={teamPush}
              onChange={(e) => setTeamPush(e.target.checked)}
              className="w-4 h-4 text-[#2563EB] rounded border-[#E5E7EB]"
            />
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="submit" variant="primary" size="md">
              Save Preferences
            </Button>
          </div>

        </form>
      </Card>

    </div>
  );
}
