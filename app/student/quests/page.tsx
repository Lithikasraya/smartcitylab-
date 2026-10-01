'use client';

import React, { useState } from 'react';
import Card from '@/components/shared/Card';
import Button from '@/components/shared/Button';
import { usePortalStore } from '@/lib/store';
import { Users, Calendar, CheckCircle2 } from 'lucide-react';

export default function StudentQuestsPage() {
  const { user, quests, applyForQuest } = usePortalStore();
  const [appliedId, setAppliedId] = useState<string | null>(null);

  const handleApply = (questId: string) => {
    applyForQuest(questId, user.teamName || 'Team CyberVision');
    setAppliedId(questId);
    setTimeout(() => setAppliedId(null), 3500);
  };

  return (
    <div className="space-y-8 text-left max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="pb-2 border-b border-[#E5E7EB]">
        <h1 className="text-[28px] sm:text-[32px] font-bold text-[#0A0A0A] tracking-tight">
          Quest Board & Open Challenges
        </h1>
        <p className="text-[14px] text-[#6B7280] mt-1">
          Pick up real-world challenges posted by the Super Admin, engineer a prototype with your team, and submit for evaluation.
        </p>
      </div>

      {appliedId && (
        <div className="p-4 rounded-lg bg-[#F8F9FA] border border-[#2563EB] text-[14px] text-[#0A0A0A] flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-[#2563EB] flex-shrink-0" />
          <span>Your team has claimed this quest! Coordinate with Team Lead to begin development.</span>
        </div>
      )}

      {/* Quests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {quests.map((quest) => (
          <Card key={quest.id} className="flex flex-col justify-between hover:border-[#0A0A0A] transition-colors">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-[12px] text-[#6B7280]">
                <span className="font-semibold text-[#2563EB]">{quest.department}</span>
                <span className="capitalize px-2 py-0.5 rounded border border-[#E5E7EB] bg-[#F8F9FA] text-[#0A0A0A] font-medium">
                  {quest.status}
                </span>
              </div>

              <h3 className="text-[18px] font-bold text-[#0A0A0A]">
                {quest.title}
              </h3>

              <p className="text-[14px] text-[#6B7280] leading-relaxed">
                {quest.description}
              </p>

              <div>
                <p className="text-[12px] font-semibold text-[#0A0A0A] mb-1.5">Deliverables:</p>
                <ul className="space-y-1 text-[13px] text-[#6B7280]">
                  {quest.requirements.map((req, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-[#E5E7EB] space-y-4">
              <div className="flex items-center justify-between text-[13px] text-[#6B7280]">
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" /> Max {quest.teamSizeLimit} members
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" /> Due {quest.deadline}
                </span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[13px] font-medium text-[#2563EB]">
                  {quest.reward}
                </span>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleApply(quest.id)}
                  disabled={quest.status === 'completed'}
                >
                  {quest.acceptedTeam ? 'Claimed' : 'Take Up Quest'}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

    </div>
  );
}
