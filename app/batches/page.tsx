'use client';

import React, { useState } from 'react';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import Card from '@/components/shared/Card';
import BatchCard from './components/BatchCard';
import { usePortalStore } from '@/lib/store';
import { Search, Users, Calendar, ShieldCheck, Sparkles, UserPlus } from 'lucide-react';
import Link from 'next/link';

export default function BatchesPage() {
  const { batches, innovators, batchInfos } = usePortalStore();
  
  // Set default tab to the first active batch or first batch available
  const defaultTab = batchInfos.find(b => b.status === 'active')?.year || batchInfos[0]?.year || '2026';
  const [selectedTab, setSelectedTab] = useState<string>(defaultTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [domainFilter, setDomainFilter] = useState('all');

  // Currently selected batch metadata (if not mentors)
  const currentBatchInfo = batchInfos.find(b => b.year === selectedTab);

  // Filter members by batch year
  const batchMembers = batches.filter((b) => b.batchYear === selectedTab);

  // Available domains for filtering
  const domains = Array.from(new Set(batchMembers.map((m) => m.domain).filter(Boolean)));

  // Filtered members based on search and domain
  const filteredMembers = batchMembers.filter((member) => {
    const matchesDomain = domainFilter === 'all' || member.domain === domainFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      member.name.toLowerCase().includes(q) ||
      member.rollNo.toLowerCase().includes(q) ||
      (member.teamName && member.teamName.toLowerCase().includes(q)) ||
      (member.domain && member.domain.toLowerCase().includes(q)) ||
      (member.skills && member.skills.some((s) => s.toLowerCase().includes(q)));

    return matchesDomain && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-white text-[#0A0A0A] flex flex-col font-sans">
      <Navbar />

      <main className="flex-grow pt-24 sm:pt-28 pb-24">
        {/* Header Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-8 pb-10 border-b border-[#E5E7EB]">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl text-left space-y-3">
              <p className="text-[13px] font-semibold text-[#2563EB] tracking-wider uppercase">
                Student Directory & Cohorts
              </p>
              <h1 className="text-[32px] sm:text-[40px] font-bold text-[#0A0A0A] tracking-tight">
                Lab Batches & Mentors
              </h1>
              <p className="text-[15px] text-[#6B7280] leading-relaxed">
                Meet the undergraduate researchers, alumni, and student engineers building connected urban systems at KIET Smart City Lab.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/admin/batches"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-[#E5E7EB] bg-[#F8F9FA] text-[13px] font-medium text-[#0A0A0A] hover:bg-white hover:border-[#0A0A0A] transition-colors"
              >
                <UserPlus className="w-4 h-4 text-[#2563EB]" />
                <span>Manage Batches (Admin)</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Tab Selector */}
        <section className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 space-y-8">
          <div className="flex border-b border-[#E5E7EB] gap-2 sm:gap-6 overflow-x-auto scrollbar-none">
            {batchInfos.map((batch) => (
              <button
                key={batch.id}
                onClick={() => {
                  setSelectedTab(batch.year);
                  setSearchQuery('');
                  setDomainFilter('all');
                }}
                className={`pb-3.5 px-1 text-[14px] sm:text-[15px] font-medium border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
                  selectedTab === batch.year
                    ? 'border-[#2563EB] text-[#2563EB]'
                    : 'border-transparent text-[#6B7280] hover:text-[#0A0A0A]'
                }`}
              >
                <span>{batch.name}</span>
                <span
                  className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                    batch.status === 'active'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : batch.status === 'upcoming'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-gray-100 text-gray-600 border border-gray-200'
                  }`}
                >
                  {batch.status === 'active' ? 'Active' : batch.status === 'upcoming' ? 'Incoming' : 'Alumni'}
                </span>
              </button>
            ))}

            <button
              onClick={() => {
                setSelectedTab('mentors');
                setSearchQuery('');
                setDomainFilter('all');
              }}
              className={`pb-3.5 px-1 text-[14px] sm:text-[15px] font-medium border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                selectedTab === 'mentors'
                  ? 'border-[#2563EB] text-[#2563EB]'
                  : 'border-transparent text-[#6B7280] hover:text-[#0A0A0A]'
              }`}
            >
              <span>Faculty Mentors & Leaders</span>
              <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-[#F8F9FA] text-[#6B7280] border border-[#E5E7EB]">
                {innovators.length}
              </span>
            </button>
          </div>

          {/* Cohort Overview Banner (When a batch is selected) */}
          {selectedTab !== 'mentors' && currentBatchInfo && (
            <div className="p-6 rounded-2xl bg-[#F8F9FA] border border-[#E5E7EB] text-left space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-[20px] font-bold text-[#0A0A0A]">
                      {currentBatchInfo.name} Overview
                    </h2>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        currentBatchInfo.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : currentBatchInfo.status === 'upcoming'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      {currentBatchInfo.status === 'active'
                        ? 'Current Active Cohort'
                        : currentBatchInfo.status === 'upcoming'
                        ? 'Upcoming Cohort'
                        : 'Graduated Alumni'}
                    </span>
                  </div>
                  <p className="text-[13px] text-[#6B7280] mt-1">
                    Academic Session: <strong className="text-[#0A0A0A] font-semibold">{currentBatchInfo.academicSession}</strong>
                    {currentBatchInfo.mentorLead && (
                      <> • Faculty Mentors: <strong className="text-[#0A0A0A] font-semibold">{currentBatchInfo.mentorLead}</strong></>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="px-3.5 py-1.5 rounded-lg bg-white border border-[#E5E7EB] text-[13px] font-medium text-[#0A0A0A] flex items-center gap-2 shadow-sm">
                    <Users className="w-4 h-4 text-[#2563EB]" />
                    <span><strong>{batchMembers.length}</strong> Registered Interns</span>
                  </div>
                </div>
              </div>

              {currentBatchInfo.description && (
                <p className="text-[14px] text-[#4B5563] leading-relaxed max-w-4xl border-t border-[#E5E7EB] pt-3">
                  {currentBatchInfo.description}
                </p>
              )}

              {/* Search & Domain Filter Bar */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by student name, roll no, team, or skills..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-[13px] rounded-lg border border-[#E5E7EB] bg-white text-[#0A0A0A] focus:outline-none focus:border-[#2563EB]"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-[#6B7280] hover:text-[#0A0A0A]"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {domains.length > 0 && (
                  <select
                    value={domainFilter}
                    onChange={(e) => setDomainFilter(e.target.value)}
                    className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-[13px] text-[#0A0A0A] focus:outline-none focus:border-[#2563EB]"
                  >
                    <option value="all">All Research Domains</option>
                    {domains.map((dom) => (
                      <option key={dom} value={dom}>
                        {dom}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          )}

          {/* Members Grid or Mentors Grid */}
          {selectedTab === 'mentors' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {innovators.map((mentor) => (
                <Card key={mentor.id} className="text-left flex items-start gap-4 hover:border-[#0A0A0A] transition-colors">
                  <img
                    src={mentor.photoUrl}
                    alt={mentor.name}
                    className="w-16 h-16 rounded-xl object-cover border border-[#E5E7EB] bg-[#F8F9FA] flex-shrink-0"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(mentor.name)}&background=2563EB&color=fff&size=128`;
                    }}
                  />
                  <div className="space-y-1">
                    <h3 className="text-[17px] font-bold text-[#0A0A0A]">
                      {mentor.name}
                    </h3>
                    <p className="text-[13px] font-medium text-[#2563EB]">
                      {mentor.designation}
                    </p>
                    <p className="text-[13px] text-[#6B7280]">
                      {mentor.department || 'Smart City Lab'}
                    </p>
                    {mentor.bio && (
                      <p className="text-[13px] text-[#6B7280] pt-1 leading-relaxed">
                        {mentor.bio}
                      </p>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div>
              {filteredMembers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredMembers.map((member) => (
                    <BatchCard key={member.id} member={member} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 px-4 border border-dashed border-[#E5E7EB] rounded-2xl bg-[#F8F9FA] space-y-3">
                  <Users className="w-10 h-10 text-[#9CA3AF] mx-auto" />
                  <h3 className="text-[17px] font-semibold text-[#0A0A0A]">
                    {searchQuery || domainFilter !== 'all'
                      ? 'No students match your filter criteria'
                      : `No students registered yet in ${currentBatchInfo?.name || `Batch ${selectedTab}`}`}
                  </h3>
                  <p className="text-[14px] text-[#6B7280] max-w-md mx-auto">
                    {searchQuery || domainFilter !== 'all'
                      ? 'Try clearing your search query or domain filter to see all enrolled cohort members.'
                      : 'You can enroll students and assign them to this batch directly from the Super Admin Batches portal.'}
                  </p>
                  <div className="pt-2">
                    <Link
                      href="/admin/batches"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#2563EB] text-white text-[13px] font-medium hover:bg-blue-700 transition-colors"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Enroll Students to this Batch in Admin CRM</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}