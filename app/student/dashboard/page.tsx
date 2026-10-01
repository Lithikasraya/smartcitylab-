'use client';

import React from 'react';
import Link from 'next/link';
import Card from '@/components/shared/Card';
import Button from '@/components/shared/Button';
import { usePortalStore } from '@/lib/store';
import { Video, ExternalLink } from 'lucide-react';

export default function StudentDashboardPage() {
  const { user, tasks, teams } = usePortalStore();

  const currentTeam = teams.find((t) => t.id === user.teamId) || teams[0] || {
    name: 'Unassigned',
    teamLead: { name: 'Unknown' },
    meetingLink: ''
  };
  const pendingTasks = tasks.filter((t) => t.status === 'pending');

  return (
    <div className="space-y-6 text-left">
      
      {/* 1. Plain Greeting Header */}
      <div className="pb-2 border-b border-[#E5E7EB]">
        <h1 className="text-[28px] sm:text-[32px] font-bold text-[#0A0A0A] tracking-tight">
          Hello, {user.name}
        </h1>
        <p className="text-[14px] text-[#6B7280] mt-1">
          {user.teamName || currentTeam.name} • Roll: {user.rollNo || '2300290100098'} • Team Lead: {currentTeam.teamLead.name}
        </p>
      </div>

      {/* 2. Small Row of Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 text-left">
          <span className="text-[24px] sm:text-[28px] font-bold text-[#0A0A0A] block leading-none">
            94%
          </span>
          <span className="text-[12px] text-[#6B7280] font-medium mt-1.5 block">
            Lab Attendance
          </span>
        </Card>

        <Card className="p-4 text-left">
          <span className="text-[24px] sm:text-[28px] font-bold text-[#0A0A0A] block leading-none">
            {pendingTasks.length}
          </span>
          <span className="text-[12px] text-[#6B7280] font-medium mt-1.5 block">
            Pending Tasks
          </span>
        </Card>

        <Card className="p-4 text-left">
          <span className="text-[24px] sm:text-[28px] font-bold text-[#0A0A0A] block leading-none">
            8
          </span>
          <span className="text-[12px] text-[#6B7280] font-medium mt-1.5 block">
            Approved Submissions
          </span>
        </Card>
      </div>

      {/* 3. Card Showing Today's Classes/Updates and Pending Task Submissions */}
      <Card className="space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
          <div>
            <h2 className="text-[17px] font-bold text-[#0A0A0A]">
              Today&apos;s Lab Schedule & Pending Tasks
            </h2>
            <p className="text-[13px] text-[#6B7280]">
              Complete your daily work and upload the required 30-second learning video.
            </p>
          </div>
          <span className="text-[12px] font-semibold text-[#2563EB] bg-[#F8F9FA] px-2.5 py-1 rounded border border-[#E5E7EB]">
            Today
          </span>
        </div>

        {/* Schedule item */}
        <div className="space-y-3">
          <div className="p-3.5 rounded-lg border border-[#E5E7EB] bg-[#F8F9FA] flex items-center justify-between text-[13px]">
            <div className="space-y-0.5">
              <span className="font-semibold text-[#0A0A0A] block">
                Lab Session: Edge IoT Sensor Calibration
              </span>
              <span className="text-[#6B7280]">Room 304, Innovation Block • In-person attendance required</span>
            </div>
            <span className="font-medium text-[#0A0A0A]">3:30 PM – 5:00 PM</span>
          </div>
        </div>

        {/* Pending Tasks List */}
        <div className="space-y-3 pt-2">
          <h3 className="text-[14px] font-bold text-[#0A0A0A]">
            Pending Task Video Submissions ({pendingTasks.length})
          </h3>

          {pendingTasks.length === 0 ? (
            <p className="text-[13px] text-[#6B7280]">No pending assignments. You are all caught up!</p>
          ) : (
            <div className="space-y-3">
              {pendingTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-4 rounded-lg border border-[#E5E7EB] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1 text-left">
                    <h4 className="text-[15px] font-bold text-[#0A0A0A]">{task.title}</h4>
                    <p className="text-[13px] text-[#6B7280]">{task.description}</p>
                    <p className="text-[12px] text-[#6B7280]">
                      Assigned by: {task.assignedBy} • Deadline: <span className="text-[#0A0A0A] font-medium">{task.deadline}</span>
                    </p>
                  </div>

                  <Link href={`/student/submit?taskId=${task.id}`}>
                    <Button variant="primary" size="sm" icon={<Video className="w-3.5 h-3.5" />}>
                      Upload 30s Video
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* 4. Card with the Fixed Team Meeting Link */}
      <Card className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1 text-left">
          <div className="flex items-center gap-2">
            <h2 className="text-[17px] font-bold text-[#0A0A0A]">
              Fixed Team Standup Room
            </h2>
            <span className="text-[11px] font-medium text-[#10B981] bg-[#F8F9FA] px-2 py-0.5 rounded border border-[#E5E7EB]">
              Active Link
            </span>
          </div>
          <p className="text-[13px] text-[#6B7280]">
            Daily sync at 4:30 PM with Team Lead <strong className="text-[#0A0A0A]">{currentTeam.teamLead.name}</strong>.
          </p>
          <p className="text-[12px] font-mono text-[#2563EB]">
            {currentTeam.meetingLink || 'https://meet.google.com/scl-cybervision-sync'}
          </p>
        </div>

        <a
          href={currentTeam.meetingLink || 'https://meet.google.com/scl-cybervision-sync'}
          target="_blank"
          rel="noreferrer"
        >
          <Button variant="outline" size="md" icon={<ExternalLink className="w-4 h-4" />}>
            Join Meeting
          </Button>
        </a>
      </Card>

      {/* 5. SCL Space Studio Workspace Card */}
      <Card className="bg-gradient-to-r from-indigo-50/50 via-white to-blue-50/30 border-indigo-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1 text-left">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6366F1] bg-indigo-100/70 px-2.5 py-0.5 rounded-full">
              SCL Space Studio
            </span>
            <span className="text-[11px] text-[#6B7280]">
              Laptop & Desktop Optimized
            </span>
          </div>
          <h3 className="text-[17px] font-bold text-[#0A0A0A]">
            Write & Publish Research Documentation
          </h3>
          <p className="text-[13px] text-[#6B7280]">
            Use the mouse formatting toolbar, architecture templates, and publish directly as {user.name} or {currentTeam.name} to the public portal.
          </p>
        </div>

        <Link href="/workspace">
          <Button variant="primary" size="md" className="bg-[#6366F1] hover:bg-indigo-700 text-white shrink-0">
            Launch SCL Space Studio →
          </Button>
        </Link>
      </Card>

    </div>
  );
}