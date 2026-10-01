'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Button from '@/components/shared/Button';
import { usePortalStore } from '@/lib/store';
import { CheckCircle2 } from 'lucide-react';

export default function AdminDashboardPage() {
  const { 
    user, 
    projects, 
    teams, 
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
    : submissions.filter((s) => s.teamName === myTeam.name);

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
            Complete platform CRM: approve public submissions, assign quests, manage teams and publish monthly newsletters.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/quests">
            <Button variant="primary" size="md">
              + Create Quest
            </Button>
          </Link>
          <Link href="/admin/newsletter">
            <Button variant="outline" size="md">
              Monthly Newsletter
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
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 text-left">
            <span className="text-[32px] font-bold text-[#0A0A0A] block leading-none">
              {projects.length}
            </span>
            <span className="text-[12px] text-[#6B7280] font-medium mt-1.5 block">Total Submitted</span>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-left">
            <span className="text-[32px] font-bold text-emerald-700 block leading-none">
              {projects.filter((p) => p.status === 'approved').length}
            </span>
            <span className="text-[12px] text-emerald-600 font-medium mt-1.5 block">Live on Website</span>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-left">
            <span className="text-[32px] font-bold text-amber-700 block leading-none">
              {submissions.filter((s) => s.status === 'pending').length}
            </span>
            <span className="text-[12px] text-amber-600 font-medium mt-1.5 block">Pending Approval</span>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-left">
            <span className="text-[32px] font-bold text-red-700 block leading-none">
              {projects.filter((p) => p.status === 'rejected').length}
            </span>
            <span className="text-[12px] text-red-500 font-medium mt-1.5 block">Rejected</span>
          </div>
        </div>

        {/* Row 2: People & activity */}
        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 pt-2">People & Activity</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 text-left">
            <span className="text-[32px] font-bold text-[#0A0A0A] block leading-none">
              {teams.reduce((acc, t) => acc + (t.members?.length || 0), 0)}
            </span>
            <span className="text-[12px] text-[#6B7280] font-medium mt-1.5 block">Total Students</span>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-left">
            <span className="text-[32px] font-bold text-blue-700 block leading-none">
              {teams.length}
            </span>
            <span className="text-[12px] text-blue-600 font-medium mt-1.5 block">Registered Teams</span>
          </div>
          <div className="bg-violet-50 border border-violet-200 rounded-xl p-5 text-left">
            <span className="text-[32px] font-bold text-violet-700 block leading-none">
              {quests.filter((q) => q.status === 'open').length}
            </span>
            <span className="text-[12px] text-violet-600 font-medium mt-1.5 block">Open Quests</span>
          </div>
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 text-left">
            <span className="text-[32px] font-bold text-[#0A0A0A] block leading-none">
              {projects.filter((p) => p.status === 'approved' && !!p.demoUrl).length}
            </span>
            <span className="text-[12px] text-[#6B7280] font-medium mt-1.5 block">Live Deployments</span>
          </div>
        </div>
      </div>

      {/* ===================== CLEAN DATA TABLES ===================== */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
        
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
                          {/* Blue "Approve" button */}
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleApprove(sub.id, sub.title)}
                          >
                            Approve
                          </Button>
                          {/* Black-outline "Reject" button */}
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

      {/* ===================== SECOND TABLE: ACTIVE LAB QUESTS / TASKS ===================== */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
        <div className="p-6 border-b border-[#E5E7EB] flex items-center justify-between">
          <div>
            <h2 className="text-[18px] font-bold text-[#0A0A0A]">
              {isSuperAdmin ? 'Active Quests & Project Opportunities' : 'Assigned Team Tasks'}
            </h2>
            <p className="text-[13px] text-[#6B7280] mt-0.5">
              {isSuperAdmin
                ? 'Engineering challenges posted for student teams to claim.'
                : 'Tasks currently assigned to your team members.'}
            </p>
          </div>
          {isSuperAdmin && (
            <Link href="/admin/quests">
              <Button variant="outline" size="sm">
                Manage Quests
              </Button>
            </Link>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F8F9FA] text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider">
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Target / Team</th>
                <th className="py-3 px-4">Deadline</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB] text-[14px]">
              {isSuperAdmin ? (
                quests.slice(0, 4).map((q, idx) => (
                  <tr
                    key={q.id}
                    className={`transition-colors ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-[#F8F9FA]'
                    }`}
                  >
                    <td className="py-3.5 px-4 font-medium text-[#0A0A0A]">
                      {q.title}
                    </td>
                    <td className="py-3.5 px-4 text-[#6B7280]">
                      {q.acceptedTeam ? q.acceptedTeam : 'Open to all teams'}
                    </td>
                    <td className="py-3.5 px-4 text-[#6B7280] text-[13px]">
                      {q.deadline}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="capitalize text-[12px] px-2 py-0.5 rounded border border-[#E5E7EB] bg-white font-medium text-[#2563EB]">
                        {q.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                tasks.filter((t) => t.teamName === myTeam.name).map((t, idx) => (
                  <tr
                    key={t.id}
                    className={`transition-colors ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-[#F8F9FA]'
                    }`}
                  >
                    <td className="py-3.5 px-4 font-medium text-[#0A0A0A]">
                      {t.title}
                    </td>
                    <td className="py-3.5 px-4 text-[#6B7280]">
                      {t.assignedTo}
                    </td>
                    <td className="py-3.5 px-4 text-[#6B7280] text-[13px]">
                      {t.deadline}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="capitalize text-[12px] px-2 py-0.5 rounded border border-[#E5E7EB] bg-white font-medium text-[#2563EB]">
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}