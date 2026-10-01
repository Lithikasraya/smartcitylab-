'use client';

import React from 'react';
import Card from '@/components/shared/Card';
import MemberAvatar from '@/components/shared/MemberAvatar';
import { BatchMember } from '@/lib/data';
import { Github, Linkedin } from '@/components/shared/Icons';
import { Mail } from 'lucide-react';

interface BatchCardProps {
  member: BatchMember;
}

export default function BatchCard({ member }: BatchCardProps) {
  return (
    <Card className="text-left flex flex-col justify-between hover:border-[#0A0A0A] hover:shadow-sm transition-all duration-200">
      <div className="space-y-4">
        <div className="flex items-start gap-3.5">
          <MemberAvatar
            name={member.name}
            photoUrl={member.photoUrl}
            size="lg"
            isLead={!!member.isTeamLead}
          />
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <h3 className="text-[17px] font-bold text-[#0A0A0A] leading-tight">
                {member.name}
              </h3>
              {member.isTeamLead && (
                <span className="text-[10px] font-bold bg-[#2563EB] text-white px-1.5 py-0.2 rounded tracking-wide">
                  LEAD
                </span>
              )}
            </div>
            <p className="text-[13px] font-medium text-[#2563EB]">
              {member.domain}
            </p>
            <p className="text-[12px] text-[#6B7280]">
              {member.teamName} {member.year ? `• ${member.year}` : ''} {member.branch ? `(${member.branch})` : ''}
            </p>
          </div>
        </div>

        <div>
          <p className="text-[12px] font-semibold text-[#0A0A0A] mb-1.5">Core Competencies:</p>
          <div className="flex flex-wrap gap-1">
            {(member.skills || [member.domain || 'IoT & Embedded']).map((skill) => (
              <span
                key={skill}
                className="px-2 py-0.5 rounded text-[12px] bg-[#F8F9FA] text-[#6B7280] border border-[#E5E7EB]"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-4 mt-4 border-t border-[#E5E7EB] flex items-center justify-between text-[13px] text-[#6B7280]">
        <span className="font-mono text-[12px]">{member.rollNo}</span>
        <div className="flex items-center gap-2">
          {member.github && (
            <a
              href={member.github}
              target="_blank"
              rel="noreferrer"
              className="p-1 text-[#6B7280] hover:text-[#0A0A0A] transition-colors"
              title="GitHub"
            >
              <Github className="w-4 h-4" />
            </a>
          )}
          {member.linkedin && (
            <a
              href={member.linkedin}
              target="_blank"
              rel="noreferrer"
              className="p-1 text-[#6B7280] hover:text-[#0A0A0A] transition-colors"
              title="LinkedIn"
            >
              <Linkedin className="w-4 h-4" />
            </a>
          )}
          {member.email && (
            <a
              href={`mailto:${member.email}`}
              className="p-1 text-[#6B7280] hover:text-[#0A0A0A] transition-colors"
              title="Email"
            >
              <Mail className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </Card>
  );
}