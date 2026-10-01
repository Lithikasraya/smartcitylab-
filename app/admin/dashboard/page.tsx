'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Button from '@/components/shared/Button';
import { usePortalStore } from '@/lib/store';
import { CheckCircle2, Plus, Sparkles } from 'lucide-react';

export default function AdminDashboardPage() {
  const { 
    user, 
    projects, 
    teams, 
    batches,
    batchInfos,
    innovators,
    quests, 
    tasks, 
    submissions, 
    approveSubmission, 
    rejectSubmission 
  } = usePortalStore();

  const [notification, setNotification] = useState<string | null>(null);

  const isSuperAdmin = user.role === 'super_admin';
  const myTeam = teams.find((t) => t.id === user.teamId) || teams[0];

  // Pending submissions for approval
  const pendingSubmissions = isSuperAdmin
    ? submissions.filter((s) => s.status === 'pending')
    : submissions.filter((s) => s.teamName === myTeam?.name);

  const handleApprove = (id: string, title: string) => {
    approveSubmission(id);
    setNotification(`Approved "${title}". It has been automatically published to the public showcase.`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleReject = (id: string, title: string) => {
    rejectSubmission(id);
    setNotification(`Rejected "${title}". Feedback sent back to team.`);
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="space-y-8 text-left">
      
      {/* Role Notice / Context Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E5E7EB]">
        <div>
          <h1 className="text-[28px] sm:text-[32px] font-bold text-[#0A0A0A] tracking-tight">
            Super Admin Dashboard
          </h1>
          <p className="text-[14px] text-[#6B7280] mt-1">
            Real-time platform overview: manage students data, projects, faculty mentors, and cohort batches.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/projects/new">
            <Button variant="primary" size="md" icon={<Plus className="w-4 h-4" />}>
              Add Project
            </Button>
          </Link>
          <Link href="/admin/students/new">
            <Button variant="outline" size="md" icon={<Plus className="w-4 h-4" />}>
              Add Student
            </Button>
          </Link>
        </div>
      </div>

      {notification && (
        <div className="p-4 rounded-lg bg-[#F8F9FA] border border-[#2563EB] text-[14px] text-[#0A0A0A] flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-[#2563EB] flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* ===================== REAL-DATA STAT CARDS ===================== */}
      <div className="space-y-4">
        {/* Row 1: Projects breakdown */}
        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Projects Overview</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 text-left shadow-xs">
            <span className="text-[32px] font-bold text-[#0A0A0A] block leading-none">
              {projects.length}
            </span>
            <span className="text-[12px] text-[#6B7280] font-medium mt-1.5 block">Total Projects</span>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-left shadow-xs">
            <span className="text-[32px] font-bold text-emerald-700 block leading-none">
              {projects.filter((p) => p.isVisible !== false && p.status === 'approved').length}
            </span>
            <span className="text-[12px] text-emerald-600 font-medium mt-1.5 block">Live on Website</span>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-left shadow-xs">
            <span className="text-[32px] font-bold text-amber-700 block leading-none">
              {submissions.filter((s) => s.status === 'pending').length}
            </span>
            <span className="text-[12px] text-amber-600 font-medium mt-1.5 block">Pending Approval</span>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-left shadow-xs">
            <span className="text-[32px] font-bold text-red-700 block leading-none">
              {projects.filter((p) => p.status === 'rejected').length}
            </span>
            <span className="text-[12px] text-red-500 font-medium mt-1.5 block">Rejected</span>
          </div>
        </div>

        {/* Row 2: People & activity */}
        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 pt-2">People & Academic Cohorts</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link href="/admin/students" className="block">
            <div className="bg-white border border-[#E5E7EB] hover:border-blue-300 rounded-xl p-5 text-left transition-colors shadow-xs">
              <span className="text-[32px] font-bold text-[#0A0A0A] block leading-none">
                {batches.length}
              </span>
              <span className="text-[12px] text-[#6B7280] font-medium mt-1.5 block">Total Students Enrolled</span>
            </div>
          </Link>
          <Link href="/admin/batches" className="block">
            <div className="bg-blue-50 border border-blue-200 hover:border-blue-300 rounded-xl p-5 text-left transition-colors shadow-xs">
              <span className="text-[32px] font-bold text-blue-700 block leading-none">
                {batchInfos.length}
              </span>
              <span className="text-[12px] text-blue-600 font-medium mt-1.5 block">Active Cohort Batches</span>
            </div>
          </Link>
          <Link href="/admin/faculty" className="block">
            <div className="bg-indigo-50 border border-indigo-200 hover:border-indigo-300 rounded-xl p-5 text-left transition-colors shadow-xs">
              <span className="text-[32px] font-bold text-indigo-700 block leading-none">
                {innovators.length}
              </span>
              <span className="text-[12px] text-indigo-600 font-medium mt-1.5 block">Faculty & Mentors</span>
            </div>
          </Link>
          <Link href="/admin/teams" className="block">
            <div className="bg-violet-50 border border-violet-200 hover:border-violet-300 rounded-xl p-5 text-left transition-colors shadow-xs">
              <span className="text-[32px] font-bold text-violet-700 block leading-none">
                {teams.length}
              </span>
              <span className="text-[12px] text-violet-600 font-medium mt-1.5 block">Registered Teams</span>
            </div>
          </Link>
        </div>
      </div>

      {/* ===================== CLEAN DATA TABLES ===================== */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden shadow-xs">
        
        <div className="p-6 border-b border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-[18px] font-bold text-[#0A0A0A]">
              Submissions Awaiting Approval
            </h2>
            <p className="text-[13px] text-[#6B7280] mt-0.5">
              Review and verify student/lead submissions before they go live on the public website.
            </p>
          </div>

          <Link href="/admin/approvals">
            <Button variant="outline" size="sm">
              View All Approvals
            </Button>
          </Link>
        </div>

        {pendingSubmissions.length === 0 ? (
          <div className="p-12 text-center text-[#6B7280] text-[14px]">
            No pending submissions waiting for review. All items are up to date.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F8F9FA] text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider">
                  <th className="py-3 px-4">Item Details</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Submitted By</th>
                  <th className="py-3 px-4">Team</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB] text-[14px]">
                {pendingSubmissions.map((sub, idx) => (
                  <tr
                    key={sub.id}
                    className={`transition-colors ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-[#F8F9FA]'
                    } hover:bg-[#F1F3F5]`}
                  >
                    <td className="py-3.5 px-4 font-medium text-[#0A0A0A]">
                      <div>{sub.title}</div>
                      <div className="text-[12px] text-[#6B7280] line-clamp-1">{sub.summary}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="capitalize text-[12px] px-2 py-0.5 rounded border border-[#E5E7EB] bg-white text-[#2563EB] font-medium">
                        {sub.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#0A0A0A] font-medium">
                      {sub.studentName}
                    </td>
                    <td className="py-3.5 px-4 text-[#6B7280]">
                      {sub.teamName}
                    </td>
                    <td className="py-3.5 px-4 text-[#6B7280] text-[13px]">
                      {sub.submittedAt}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {isSuperAdmin ? (
                        <div className="inline-flex items-center gap-2 justify-end">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleApprove(sub.id, sub.title)}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReject(sub.id, sub.title)}
                          >
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="text-[12px] text-[#6B7280] italic">
                          Awaiting Super Admin
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
}