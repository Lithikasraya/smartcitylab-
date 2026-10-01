'use client';

import React from 'react';
import Card from '@/components/shared/Card';
import Button from '@/components/shared/Button';
import { usePortalStore } from '@/lib/store';
import { ExternalLink } from 'lucide-react';

export default function StudentTeamPage() {
  const { user, teams, tasks } = usePortalStore();

  const currentTeam = teams.find((t) => t.id === user.teamId) || teams[0];
  const teamTasks = tasks.filter((t) => t.teamName === currentTeam.name);

  return (
    <div className="space-y-8 text-left max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="pb-2 border-b border-[#E5E7EB]">
        <h1 className="text-[28px] sm:text-[32px] font-bold text-[#0A0A0A] tracking-tight">
          {currentTeam.name}
        </h1>
        <p className="text-[14px] text-[#6B7280] mt-1">
          Coordinated by Team Lead <strong className="text-[#0A0A0A]">{currentTeam.teamLead.name}</strong> • Accent: {currentTeam.colorTheme}
        </p>
      </div>

      {/* Standup & Meeting Link Card */}
      <Card className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-[17px] font-bold text-[#0A0A0A]">Daily Lab Standup</h2>
            <span className="text-[11px] font-medium text-[#10B981] bg-[#F8F9FA] px-2 py-0.5 rounded border border-[#E5E7EB]">
              Daily 4:30 PM
            </span>
          </div>
          <p className="text-[13px] text-[#6B7280]">
            Fixed video conference link for team sync, hardware debugging, and code reviews.
          </p>
          <p className="text-[13px] font-mono text-[#2563EB]">
            {currentTeam.meetingLink || 'https://meet.google.com/scl-cybervision-sync'}
          </p>
        </div>

        <a
          href={currentTeam.meetingLink || 'https://meet.google.com/scl-cybervision-sync'}
          target="_blank"
          rel="noreferrer"
        >
          <Button variant="outline" size="md" icon={<ExternalLink className="w-4 h-4" />}>
            Join Call
          </Button>
        </a>
      </Card>

      {/* Team Roster Card */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
          <h2 className="text-[18px] font-bold text-[#0A0A0A]">
            Team Members ({currentTeam.members.length})
          </h2>
          <span className="text-[13px] text-[#6B7280]">
            Average Attendance: <strong className="text-[#10B981]">93%</strong>
          </span>
        </div>

        <div className="divide-y divide-[#E5E7EB]">
          {currentTeam.members.map((member) => (
            <div key={member.id} className="py-3.5 flex items-center justify-between">
              <div>
                <h3 className="text-[15px] font-bold text-[#0A0A0A]">{member.name}</h3>
                <p className="text-[12px] text-[#6B7280]">
                  {member.role} • Roll: {member.rollNo} • {member.email}
                </p>
              </div>

              <div className="flex items-center gap-4 text-[13px]">
                <span className="text-[#6B7280]">
                  Attendance: <strong className="text-[#10B981]">{member.attendance}%</strong>
                </span>
                {member.name === currentTeam.teamLead.name && (
                  <span className="text-[11px] font-semibold text-[#2563EB] bg-[#F8F9FA] px-2 py-0.5 rounded border border-[#E5E7EB]">
                    Team Lead
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Ongoing Team Tasks */}
      <Card className="space-y-4">
        <h2 className="text-[18px] font-bold text-[#0A0A0A]">
          Ongoing Team Assignments ({teamTasks.length})
        </h2>

        <div className="space-y-3">
          {teamTasks.map((task) => (
            <div
              key={task.id}
              className="p-3.5 rounded-lg border border-[#E5E7EB] bg-[#F8F9FA] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[13px]"
            >
              <div className="space-y-0.5">
                <span className="font-bold text-[#0A0A0A] block">{task.title}</span>
                <span className="text-[#6B7280]">{task.description}</span>
                <span className="text-[12px] text-[#6B7280] block">
                  Assigned to: {task.assignedTo} • Deadline: {task.deadline}
                </span>
              </div>

              <span className="capitalize px-2.5 py-1 rounded border border-[#E5E7EB] bg-white font-medium text-[#2563EB] self-start sm:self-auto">
                {task.status}
              </span>
            </div>
          ))}
        </div>
      </Card>

    </div>
  );
}
