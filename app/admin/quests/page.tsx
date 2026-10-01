'use client';

import React, { useState } from 'react';
import Card from '@/components/shared/Card';
import Button from '@/components/shared/Button';
import { Input, Textarea } from '@/components/shared/Input';
import Modal from '@/components/shared/Modal';
import { usePortalStore } from '@/lib/store';
import { Users, Calendar, CheckCircle2 } from 'lucide-react';

export default function AdminQuestsPage() {
  const { user, quests, postQuest } = usePortalStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requirementsText, setRequirementsText] = useState('');
  const [teamSizeLimit, setTeamSizeLimit] = useState(4);
  const [deadline, setDeadline] = useState('2026-06-30');
  const [department, setDepartment] = useState('IoT & Embedded Systems');
  const [contactEmail, setContactEmail] = useState('quests.smartcity@kiet.edu');
  const [reward, setReward] = useState('₹25,000 Hardware Research Grant');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const isSuperAdmin = user.role === 'super_admin';

  const handlePostQuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    postQuest({
      title,
      description,
      requirements: requirementsText
        ? requirementsText.split('\n').filter(Boolean)
        : ['Hardware circuit diagram', 'Firmware code repository', '30-second live test video'],
      teamSizeLimit: Number(teamSizeLimit),
      deadline,
      department,
      contactEmail,
      reward,
    });

    setModalOpen(false);
    setTitle('');
    setDescription('');
    setRequirementsText('');
    setSuccessMsg(`Quest "${title}" posted. It is now live on the Student Portal and Landing Page.`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  return (
    <div className="space-y-8 text-left">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E5E7EB]">
        <div>
          <h1 className="text-[28px] sm:text-[32px] font-bold text-[#0A0A0A] tracking-tight">
            The Quest System
          </h1>
          <p className="text-[14px] text-[#6B7280] mt-1">
            {isSuperAdmin
              ? 'Post open project opportunities. Quests automatically sync to the Student Portal for student research teams to claim.'
              : 'Browse open opportunities posted by the Super Admin for student research teams.'}
          </p>
        </div>

        {isSuperAdmin && (
          <Button 
            variant="primary" 
            size="md" 
            onClick={() => setModalOpen(true)}
            className="shadow-sm shadow-blue-600/30 hover:shadow-md hover:shadow-blue-600/40"
          >
            + Post New Quest
          </Button>
        )}
      </div>

      {successMsg && (
        <div className="p-4 rounded-lg bg-[#F8F9FA] border border-[#2563EB] text-[14px] text-[#0A0A0A] flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-[#2563EB] flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Quests Grid */}
      {quests.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-[#E5E7EB] rounded-2xl bg-[#F8F9FA] space-y-3">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-[#2563EB] flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <p className="text-[16px] font-semibold text-[#0A0A0A]">No Open Quests Available</p>
          <p className="text-[13px] text-[#6B7280] max-w-md mx-auto">
            Admins can post real-world lab quests and engineering challenges to invite student teams to build hardware solutions.
          </p>
          {isSuperAdmin && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setModalOpen(true)}
              className="mt-2"
            >
              + Post First Quest
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {quests.map((quest) => (
            <Card key={quest.id} className="flex flex-col justify-between hover:border-[#0A0A0A] transition-colors h-full p-6 pb-6">
              <div className="space-y-3 flex-1 flex flex-col">
                <div className="flex items-center justify-between text-[12px] text-[#6B7280]">
                  <span className="font-semibold text-[#2563EB]">{quest.department}</span>
                  <span className="capitalize px-2 py-0.5 rounded border border-[#E5E7EB] bg-[#F8F9FA] text-[#0A0A0A] font-medium">
                    {quest.status}
                  </span>
                </div>

                <h3 className="text-[18px] font-bold text-[#0A0A0A]">
                  {quest.title}
                </h3>

                <p className="text-[14px] text-[#6B7280] leading-relaxed flex-1">
                  {quest.description}
                </p>

                <div className="pt-2 text-[13px] space-y-1">
                  <p className="font-semibold text-[#0A0A0A]">Requirements:</p>
                  <ul className="space-y-1 text-[#6B7280]">
                    {quest.requirements.map((req, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] flex-shrink-0" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-5 mt-5 border-t border-[#E5E7EB] space-y-2.5 text-[13px] text-[#6B7280]">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 flex-shrink-0" /> Max {quest.teamSizeLimit} members
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 flex-shrink-0" /> Due {quest.deadline}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-1">
                  <span className="text-[#2563EB] font-semibold text-[13px]">{quest.reward}</span>
                  <span className="text-[11px] text-[#6B7280] truncate">{quest.contactEmail}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Post Quest Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Post New Engineering Quest"
        maxWidth="xl"
      >
        <form onSubmit={handlePostQuest} className="space-y-4 text-left">
          <Input
            label="Quest Title"
            placeholder="e.g. Edge-AI Solar Microgrid Power Balancer"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <Textarea
            label="Description & Problem Statement"
            placeholder="Describe the engineering challenge, target deployment location, and expected architecture..."
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          <Textarea
            label="Hardware & Software Requirements (one per line)"
            placeholder="ESP32-S3 microcontroller&#10;Current & voltage CT sensors&#10;MQTT communication pipeline&#10;Live Grafana dashboard"
            rows={4}
            value={requirementsText}
            onChange={(e) => setRequirementsText(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Team Size Limit"
              type="number"
              min={1}
              max={6}
              value={teamSizeLimit}
              onChange={(e) => setTeamSizeLimit(Number(e.target.value))}
              required
            />
            <Input
              label="Submission Deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Lab Department / Domain"
              placeholder="IoT & Embedded Systems"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />
            <Input
              label="Contact Email"
              type="email"
              placeholder="quests.smartcity@kiet.edu"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
            />
          </div>

          <Input
            label="Incentive / Research Grant"
            placeholder="₹25,000 Component Grant + Certificate"
            value={reward}
            onChange={(e) => setReward(e.target.value)}
          />

          <div className="pt-2 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Publish Quest
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
