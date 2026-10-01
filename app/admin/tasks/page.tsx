'use client';

import React, { useState } from 'react';
import Button from '@/components/shared/Button';
import { Input, Textarea } from '@/components/shared/Input';
import Modal from '@/components/shared/Modal';
import { usePortalStore } from '@/lib/store';
import { CheckCircle2, Video } from 'lucide-react';

export default function AdminTasksPage() {
  const { user, tasks, teams, assignTask } = usePortalStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [teamId, setTeamId] = useState(teams[0]?.id || 'team-1');
  const [assignedTo, setAssignedTo] = useState('All Team Members');
  const [deadline, setDeadline] = useState('Tomorrow, 5:00 PM');
  const [notification, setNotification] = useState<string | null>(null);

  const isSuperAdmin = user.role === 'super_admin';
  const myTeam = teams.find((t) => t.id === user.teamId) || teams[0];

  const visibleTasks = isSuperAdmin
    ? tasks
    : tasks.filter((t) => t.teamName === myTeam.name);

  const handleAssignTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    const targetTeam = isSuperAdmin
      ? teams.find((t) => t.id === teamId) || teams[0]
      : myTeam;

    assignTask({
      title,
      description,
      teamId: targetTeam.id,
      teamName: targetTeam.name,
      assignedTo: assignedTo || targetTeam.teamLead.name,
      assignedBy: isSuperAdmin ? 'Super Admin' : `${user.name} (Team Lead)`,
      deadline,
    });

    setModalOpen(false);
    setTitle('');
    setDescription('');
    setNotification(`Task assigned to ${assignedTo} in ${targetTeam.name}.`);
    setTimeout(() => setNotification(null), 3500);
  };

  return (
    <div className="space-y-8 text-left">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E5E7EB]">
        <div>
          <h1 className="text-[28px] sm:text-[32px] font-bold text-[#0A0A0A] tracking-tight">
            Task Assignments
          </h1>
          <p className="text-[14px] text-[#6B7280] mt-1">
            {isSuperAdmin
              ? 'Assign projects and milestones directly to teams or Team Leads.'
              : `Assign tasks and review 30-second learning video submissions for ${myTeam.name}.`}
          </p>
        </div>

        <Button variant="primary" size="md" onClick={() => setModalOpen(true)}>
          + Assign New Task
        </Button>
      </div>

      {notification && (
        <div className="p-4 rounded-lg bg-[#F8F9FA] border border-[#2563EB] text-[14px] text-[#0A0A0A] flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-[#2563EB] flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Tasks Table */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F8F9FA] text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider">
                <th className="py-3 px-4">Task Title & Details</th>
                <th className="py-3 px-4">Team</th>
                <th className="py-3 px-4">Assigned To</th>
                <th className="py-3 px-4">Assigned By</th>
                <th className="py-3 px-4">Deadline</th>
                <th className="py-3 px-4">Status & Video</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB] text-[14px]">
              {visibleTasks.map((t, idx) => (
                <tr
                  key={t.id}
                  className={`transition-colors ${
                    idx % 2 === 0 ? 'bg-white' : 'bg-[#F8F9FA]'
                  } hover:bg-[#F1F3F5]`}
                >
                  <td className="py-3.5 px-4 font-medium text-[#0A0A0A]">
                    <div>{t.title}</div>
                    <div className="text-[12px] text-[#6B7280] line-clamp-1">{t.description}</div>
                  </td>
                  <td className="py-3.5 px-4 text-[#6B7280]">
                    {t.teamName}
                  </td>
                  <td className="py-3.5 px-4 text-[#0A0A0A]">
                    {t.assignedTo}
                  </td>
                  <td className="py-3.5 px-4 text-[#6B7280] text-[13px]">
                    {t.assignedBy}
                  </td>
                  <td className="py-3.5 px-4 text-[#6B7280] text-[13px]">
                    {t.deadline}
                  </td>
                  <td className="py-3.5 px-4">
                    {t.status === 'submitted' && t.submissionVideoUrl ? (
                      <a
                        href={t.submissionVideoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[12px] font-medium border border-[#2563EB] text-[#2563EB] hover:bg-[#F8F9FA]"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Watch 30s Video</span>
                      </a>
                    ) : (
                      <span className="capitalize text-[12px] px-2 py-0.5 rounded border border-[#E5E7EB] bg-white text-[#6B7280]">
                        {t.status}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Assign Task */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Assign Task or Learning Milestone"
      >
        <form onSubmit={handleAssignTask} className="space-y-4 text-left">
          {isSuperAdmin && (
            <div className="space-y-1.5">
              <label className="block text-[14px] font-medium text-[#0A0A0A]">Assign to Team</label>
              <select
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
                className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-[15px] text-[#0A0A0A] focus:border-[#2563EB] focus:outline-none"
              >
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          )}

          <Input
            label="Task Title"
            placeholder="e.g. Calibrate MQ-135 Gas Sensor ADC Readings"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <Textarea
            label="Instructions & Learning Objective"
            placeholder="Detail the technical requirements and instructions for the 30-second learning video upload..."
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Assigned To (Member or Lead)"
              placeholder="e.g. Rohan Gupta or All Members"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              required
            />
            <Input
              label="Deadline"
              placeholder="e.g. Friday 6:00 PM"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              required
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Assign Task
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
