'use client';

import React from 'react';
import Link from 'next/link';
import { BatchMember, ProjectItem } from '@/lib/data';
import { getMediaDisplayUrl } from '@/lib/mediaService';
import { 
  ArrowRight, 
  GraduationCap,
  Users,
  Plus
} from 'lucide-react';

interface StudentProjectSpotlightProps {
  students: BatchMember[];
  projects?: ProjectItem[];
  onOpenProject?: (project: ProjectItem) => void;
}

export default function StudentProjectSpotlight({
  students,
}: StudentProjectSpotlightProps) {
  // Only display real, active students from store / database
  const realStudents = students.filter(
    (s) =>
      s.status === 'active' &&
      !s.name?.toLowerCase().includes('demo') &&
      !s.role?.toLowerCase().includes('demo')
  );

  // If there are real students, duplicate enough times so the marquee train loops smoothly without gaps
  const repeatMultiplier = realStudents.length > 0 ? Math.max(2, Math.ceil(12 / realStudents.length)) : 1;
  const trainItems = Array(repeatMultiplier).fill(realStudents).flat();

  return (
    <div className="mt-20 pt-16 border-t border-gray-100 text-left overflow-hidden relative">
      
      {/* ── Section Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[11.5px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-3.5 py-1 rounded-full uppercase tracking-wider mb-2.5">
            <GraduationCap className="w-3.5 h-3.5 text-blue-600" /> Student Talent & Cohorts
          </span>
          <h3 className="text-[28px] sm:text-[36px] font-black tracking-tight text-gray-900 leading-tight">
            Our Students
          </h3>
          <p className="text-[14.5px] text-gray-500 mt-1 max-w-2xl">
            The undergraduate researchers, hardware innovators, and software developers building at SmartCity Lab.
          </p>
        </div>

        {/* Action button leading to batches */}
        <Link 
          href="/batches"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[13.5px] shadow-[0_4px_14px_rgba(37,99,235,0.3)] transition-all shrink-0 hover:scale-102 active:scale-98"
        >
          <span>View All Batches & Students</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* ── REAL STUDENTS TRAIN OR EMPTY STATE ── */}
      {realStudents.length === 0 ? (
        <div className="p-12 rounded-3xl border border-dashed border-gray-200 bg-slate-50/60 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-xs">
            <Users className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto">
            <h4 className="text-[17px] font-bold text-gray-900">No students registered yet</h4>
            <p className="text-[13px] text-gray-500 mt-1">
              Add student researchers to Cream Layer cohorts in the Admin Console or Batch Manager to showcase them here.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/admin/students/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-bold shadow-xs transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Student</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="relative w-full overflow-hidden py-4 -mx-4 px-4 mask-gradient group">
          
          {/* Soft edge blur masks */}
          <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

          <div className="flex gap-5 w-max animate-train hover:[animation-play-state:paused]">
            {trainItems.map((student, idx) => (
              <Link
                key={`${student.id}-${idx}`}
                href="/batches"
                className="w-[200px] sm:w-[220px] rounded-3xl p-5 bg-gradient-to-b from-white to-slate-50/80 border border-slate-200/90 shadow-[0_8px_20px_-6px_rgba(0,0,0,0.06)] hover:shadow-[0_18px_32px_-8px_rgba(37,99,235,0.22)] hover:border-blue-500/80 hover:-translate-y-2 transition-all duration-300 cursor-pointer flex flex-col items-center text-center shrink-0 select-none group/card"
              >
                {/* Circular Face / Avatar */}
                <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-900 border-3 border-white ring-2 ring-slate-200/80 shadow-md flex items-center justify-center text-white font-black text-[20px] mb-3.5 shrink-0 group-hover/card:ring-blue-500 transition-all">
                  {student.photoUrl && !student.photoUrl.includes('ui-avatars') ? (
                    <img
                      src={getMediaDisplayUrl(student.photoUrl)}
                      alt={student.name}
                      className="w-full h-full object-cover group-hover/card:scale-108 transition-transform duration-300"
                    />
                  ) : (
                    <span>
                      {student.name
                        .replace(/^(Mr\.|Ms\.|Dr\.)\s*/, '')
                        .split(' ')
                        .map((n: string) => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Student Name */}
                <h4 className="text-[15.5px] font-black text-gray-900 leading-snug truncate max-w-full group-hover/card:text-blue-600 transition-colors">
                  {student.name}
                </h4>

                {/* Cohort / Batch Badge */}
                <span className="mt-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-blue-50 text-blue-700 border border-blue-100/80 truncate max-w-full">
                  {student.batchYear || 'Cream Layer – I'}
                </span>

                {/* Domain & Year */}
                <p className="text-[11.5px] text-gray-500 font-medium mt-1 truncate max-w-full">
                  {student.domain || 'IoT & Embedded Systems'}
                </p>
                <p className="text-[11px] text-gray-400 font-normal">
                  {student.role || 'Student'} • {student.year || '3rd Year'}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── CSS Keyframe Animation for Smooth Train Motion ── */}
      <style jsx>{`
        @keyframes trainScroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-train {
          display: flex;
          animation: trainScroll 25s linear infinite;
        }
      `}</style>

    </div>
  );
}
