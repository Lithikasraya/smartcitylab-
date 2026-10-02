'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Card from '@/components/shared/Card';
import Button from '@/components/shared/Button';
import { Input, Textarea } from '@/components/shared/Input';
import Modal from '@/components/shared/Modal';
import { usePortalStore } from '@/lib/store';
import { SubmissionItem } from '@/lib/data';
import { 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Check, 
  X, 
  Calendar,
  Share2,
  Copy,
  ExternalLink,
  FileText,
  Globe,
  Video,
  Image as ImageIcon,
  Users,
  Sparkles,
  Layers,
  ArrowUpRight,
  MessageCircle,
  Send,
  FolderGit2
} from 'lucide-react';
import { Github } from '@/components/shared/Icons';

export default function AdminApprovalsPage() {
  const { 
    user, 
    submissions, 
    teams,
    approveSubmission, 
    rejectSubmission, 
    addQuickSubmission 
  } = usePortalStore();

  const [filterType, setFilterType] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [inspectingSub, setInspectingSub] = useState<SubmissionItem | null>(null);
  const [rejectingItem, setRejectingItem] = useState<SubmissionItem | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [proposalUrl, setProposalUrl] = useState('');

  // Team Lead content submission state
  const [tlTitle, setTlTitle] = useState('');
  const [tlSummary, setTlSummary] = useState('');
  const [tlType, setTlType] = useState<'project' | 'blog' | 'news'>('project');
  const [tlSuccess, setTlSuccess] = useState(false);

  const isSuperAdmin = user.role === 'super_admin';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setProposalUrl(`${window.location.origin}/proposal`);
    }
  }, []);

  const handleCopyProposalLink = () => {
    if (!proposalUrl) return;
    navigator.clipboard.writeText(proposalUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const shareText = encodeURIComponent(
    `Smart City Lab - Project Proposal Submission Link:\nSubmit your project proposal directly via the link below (Student Login Required):\n${proposalUrl || 'https://smartcitylab.in/proposal'}`
  );

  const filteredSubs = submissions.filter((sub) => {
    const matchesType = filterType === 'all' || sub.type === filterType;
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    return matchesType && matchesStatus;
  });

  const handleApprove = (id: string, title: string) => {
    approveSubmission(id);
    setActionSuccess(`"${title}" has been approved and published to the live public platform.`);
    if (inspectingSub?.id === id) setInspectingSub(null);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const handleRejectConfirm = () => {
    if (!rejectingItem) return;
    rejectSubmission(rejectingItem.id, rejectReason || 'Changes requested by Super Admin');
    setActionSuccess(`"${rejectingItem.title}" has been rejected with feedback.`);
    setRejectingItem(null);
    setRejectReason('');
    if (inspectingSub?.id === rejectingItem.id) setInspectingSub(null);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const handleTeamLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tlTitle || !tlSummary) return;

    addQuickSubmission({
      type: tlType,
      title: tlTitle,
      summary: tlSummary,
      studentName: user.name,
      studentRoll: user.rollNo || '2200290100012',
      teamName: user.teamName || 'Team CyberVision',
      details: {
        submittedByRole: 'Team Lead',
        requiresAdminSignOff: true,
      },
    });

    setTlSuccess(true);
    setTimeout(() => {
      setTlSuccess(false);
      setTlTitle('');
      setTlSummary('');
    }, 2500);
  };

  const getYoutubeEmbedUrl = (url?: string) => {
    if (!url) return null;
    try {
      const parsed = new URL(url);
      if (parsed.hostname.includes('youtube.com')) {
        const v = parsed.searchParams.get('v');
        return v ? `https://www.youtube-nocookie.com/embed/${v}` : null;
      }
      if (parsed.hostname === 'youtu.be') {
        const id = parsed.pathname.replace('/', '');
        return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
      }
    } catch {
      return null;
    }
    return null;
  };

  return (
    <div className="space-y-8 text-left max-w-7xl mx-auto pb-16">
      
      {/* Page Header */}
      <div className="pb-2 border-b border-[#E5E7EB] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] sm:text-[32px] font-black text-[#0A0A0A] tracking-tight">
            {isSuperAdmin ? 'Proposals & Submission Approvals' : 'Submit Team Content for Review'}
          </h1>
          <p className="text-[14px] text-[#6B7280] mt-1">
            {isSuperAdmin
              ? 'Review pending student project proposals, verify team members, inspect images & videos, and approve for the live showcase.'
              : 'As Team Lead, submit projects, blogs, or news on behalf of your team. All items route to the Super Admin for final approval.'}
          </p>
        </div>

        {isSuperAdmin && (
          <div className="flex items-center gap-2">
            <Link href="/proposal" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" icon={<ExternalLink className="w-3.5 h-3.5" />}>
                Open Proposal Form
              </Button>
            </Link>
          </div>
        )}
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-[14px] text-emerald-900 flex items-center justify-between shadow-xs animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span className="font-semibold">{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-700 hover:text-emerald-900 font-bold text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* ======================= PUBLIC PROPOSAL LINK SHARE CARD ======================= */}
      {isSuperAdmin && (
        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-lg border border-blue-800/40 relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-44 h-44 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="space-y-1.5 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-[12px] font-semibold">
                <Share2 className="w-3.5 h-3.5 text-blue-300" />
                <span>Public Shareable Link for Students</span>
              </div>
              <h2 className="text-[20px] sm:text-[22px] font-extrabold text-white tracking-tight">
                Direct Project Proposal Link
              </h2>
              <p className="text-[13px] sm:text-[14px] text-blue-100/80 leading-relaxed">
                Share this link directly on WhatsApp, Telegram, or Email. Students can log in with their college credentials and submit proposals with mandatory cover images, video demos, and database-verified team members.
              </p>
            </div>

            {/* Quick Share Buttons & Link Box */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
              <div className="flex items-center bg-black/40 backdrop-blur-md rounded-xl border border-white/20 p-1.5 px-3 text-[13px] font-mono text-blue-200 max-w-xs truncate">
                <span className="truncate">{proposalUrl || '/proposal'}</span>
              </div>

              <button
                onClick={handleCopyProposalLink}
                className={`px-4 py-2.5 rounded-xl font-bold text-[13px] transition-all flex items-center justify-center gap-2 shadow-sm ${
                  copiedLink
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white text-blue-900 hover:bg-blue-50'
                }`}
              >
                {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
              </button>

              <a
                href={`https://api.whatsapp.com/send?text=${shareText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-[13px] flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                title="Share on WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="hidden sm:inline">WhatsApp</span>
              </a>

              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(proposalUrl || '')}&text=${encodeURIComponent('Submit your Smart City Lab project proposal here:')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2.5 rounded-xl bg-[#0088cc] hover:bg-[#0077b5] text-white font-bold text-[13px] flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                title="Share on Telegram"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Telegram</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* TEAM LEAD: Content Submission Form */}
      {!isSuperAdmin && (
        <Card className="space-y-5">
          <div>
            <h2 className="text-[18px] font-bold text-[#0A0A0A]">Create Post on Behalf of Team</h2>
            <p className="text-[13px] text-[#6B7280]">
              This submission will appear in the Super Admin verification queue with your team details.
            </p>
          </div>

          {tlSuccess ? (
            <div className="p-4 bg-[#F8F9FA] border border-[#10B981] rounded-lg text-[14px] text-[#0A0A0A]">
              ✓ Successfully queued for Super Admin review. You will see it listed below.
            </div>
          ) : (
            <form onSubmit={handleTeamLeadSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[14px] font-medium text-[#0A0A0A]">Content Type</label>
                <div className="flex gap-2">
                  {(['project', 'blog', 'news'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTlType(t)}
                      className={`px-4 py-2 rounded-lg text-[13px] font-medium border capitalize transition-colors ${
                        tlType === t
                          ? 'border-[#2563EB] text-[#2563EB] bg-[#F8F9FA]'
                          : 'border-[#E5E7EB] text-[#6B7280]'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <Input
                label="Title"
                placeholder="e.g. Smart Traffic Density Signal Optimization"
                value={tlTitle}
                onChange={(e) => setTlTitle(e.target.value)}
                required
              />

              <Textarea
                label="Detailed Description / Write-up"
                placeholder="Provide a comprehensive summary of the team's work, methodology, and outcome..."
                rows={4}
                value={tlSummary}
                onChange={(e) => setTlSummary(e.target.value)}
                required
              />

              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  variant="primary"
                  className="shadow-sm shadow-blue-600/30 hover:shadow-md hover:shadow-blue-600/40"
                >
                  Submit to Super Admin
                </Button>
              </div>
            </form>
          )}
        </Card>
      )}

      {/* Approvals Table with Alternating Faint Row Shading */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden shadow-sm">
        
        {/* Table Filters */}
        <div className="p-4 sm:p-5 border-b border-[#E5E7EB] flex flex-wrap items-center justify-between gap-4 bg-[#FAFAFA]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[13px] text-[#6B7280] font-semibold mr-1">Status:</span>
            {[
              { key: 'all', label: 'All', count: submissions.length },
              { key: 'pending', label: 'Pending', count: submissions.filter((s) => s.status === 'pending').length },
              { key: 'approved', label: 'Approved', count: submissions.filter((s) => s.status === 'approved').length },
              { key: 'rejected', label: 'Rejected', count: submissions.filter((s) => s.status === 'rejected').length },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key as any)}
                className={`px-3 py-1.5 rounded-lg text-[13px] font-semibold border capitalize transition-colors flex items-center gap-1.5 ${
                  statusFilter === tab.key
                    ? 'border-[#2563EB] text-[#2563EB] bg-blue-50 font-bold shadow-2xs'
                    : 'border-[#E5E7EB] bg-white text-[#6B7280] hover:text-[#0A0A0A]'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  statusFilter === tab.key ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[13px] text-[#6B7280] font-semibold mr-1">Type:</span>
            {['all', 'project', 'blog', 'news', 'task_video'].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 rounded-lg text-[13px] font-semibold border capitalize transition-colors ${
                  filterType === t
                    ? 'border-[#0A0A0A] text-[#0A0A0A] bg-white shadow-xs'
                    : 'border-[#E5E7EB] bg-white text-[#6B7280] hover:text-[#0A0A0A]'
                }`}
              >
                {t.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Table Contents */}
        {filteredSubs.length === 0 ? (
          <div className="p-16 text-center text-[#6B7280] text-[14px]">
            <Sparkles className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="font-semibold text-gray-700">No submissions found matching selected filters.</p>
            <p className="text-xs text-gray-400 mt-1">Share the public proposal link to start receiving student projects.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F8F9FA] text-[12px] font-bold text-[#6B7280] uppercase tracking-wider">
                  <th className="py-3.5 px-4">Submission / Proposal</th>
                  <th className="py-3.5 px-4">Requesting Team</th>
                  <th className="py-3.5 px-4">Team Lead</th>
                  <th className="py-3.5 px-4">Team Members</th>
                  <th className="py-3.5 px-4">Media</th>
                  <th className="py-3.5 px-4">Timeline</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB] text-[14px]">
                {filteredSubs.map((sub, idx) => {
                  const details = (sub.details || {}) as Record<string, unknown>;
                  const associatedTeam = teams.find((t) => t.name === sub.teamName);
                  const leadName = (details.teamLead as string) || associatedTeam?.teamLead?.name || sub.studentName || 'Team Lead';
                  const leadEmail = (details.teamLeadEmail as string) || associatedTeam?.teamLead?.email || `${leadName.toLowerCase().replace(/\s+/g, '.')}@kiet.edu`;
                  
                  // Extract and normalize members from proposal details, member roster, or associated team
                  const rawMembers = (details.memberRoster as any[]) || (details.members as any[]) || associatedTeam?.members || [
                    { name: sub.studentName, rollNo: sub.studentRoll, role: 'Author' }
                  ];
                  const membersList = (Array.isArray(rawMembers) ? rawMembers : []).map((m: any) => {
                    if (typeof m === 'string') {
                      return { name: m, rollNo: '', role: 'Member' };
                    }
                    return {
                      name: m?.name || 'Member',
                      rollNo: m?.rollNo || '',
                      role: m?.role || 'Member',
                      email: m?.email || '',
                      attendance: m?.attendance,
                    };
                  });

                  const hasImage = Boolean(details.imageUrl);
                  const hasVideo = Boolean(details.videoUrl);

                  return (
                    <tr
                      key={sub.id}
                      className={`transition-colors ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'
                      } hover:bg-blue-50/40`}
                    >
                      {/* Submission Title & Type */}
                      <td className="py-3.5 px-4 font-medium text-[#0A0A0A] max-w-xs">
                        <div className="flex items-center gap-2">
                          <span className="capitalize text-[11px] px-2 py-0.5 rounded border border-blue-200 bg-blue-50 text-blue-700 font-bold flex-shrink-0">
                            {sub.type.replace('_', ' ')}
                          </span>
                          <span className="font-bold text-[#0A0A0A] line-clamp-1">{sub.title}</span>
                        </div>
                        <div className="text-[12px] text-[#6B7280] line-clamp-1 mt-1">
                          {sub.summary}
                        </div>
                      </td>

                      {/* Requesting Team */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[13px] font-bold bg-blue-50/80 border border-blue-200 text-[#2563EB]">
                          <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
                          {sub.teamName}
                        </span>
                      </td>

                      {/* Team Lead */}
                      <td className="py-3.5 px-4 text-[13px]">
                        <div className="font-bold text-[#0A0A0A] flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span className="truncate max-w-[140px]">{leadName}</span>
                        </div>
                        <div className="text-[11px] text-[#6B7280] truncate max-w-[140px]">
                          {sub.studentRoll}
                        </div>
                      </td>

                      {/* Team Members with side-by-side circles */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center -space-x-2">
                          {membersList.slice(0, 4).map((m, i) => (
                            <div
                              key={i}
                              title={`${m.name} (${m.role || 'Member'})`}
                              className="w-7 h-7 rounded-full border-2 border-white bg-slate-800 text-white text-[11px] font-bold flex items-center justify-center uppercase shadow-xs"
                            >
                              {(m.name || 'M').charAt(0)}
                            </div>
                          ))}
                          {membersList.length > 4 && (
                            <div className="w-7 h-7 rounded-full border-2 border-white bg-gray-200 text-[#0A0A0A] text-[10px] font-bold flex items-center justify-center">
                              +{membersList.length - 4}
                            </div>
                          )}
                        </div>
                        <div className="text-[11px] text-[#6B7280] mt-1 font-medium">
                          {membersList.length} member{membersList.length !== 1 ? 's' : ''}
                        </div>
                      </td>

                      {/* Media Badges */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          {hasImage && (
                            <span className="p-1 rounded bg-indigo-50 border border-indigo-200 text-indigo-700" title="Cover Image Uploaded">
                              <ImageIcon className="w-3.5 h-3.5" />
                            </span>
                          )}
                          {hasVideo && (
                            <span className="p-1 rounded bg-amber-50 border border-amber-200 text-amber-700" title="Project Video Uploaded">
                              <Video className="w-3.5 h-3.5" />
                            </span>
                          )}
                          {!hasImage && !hasVideo && (
                            <span className="text-[11px] text-gray-400">—</span>
                          )}
                        </div>
                      </td>

                      {/* Submission Timeline */}
                      <td className="py-3.5 px-4 text-[12px] text-[#6B7280] whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-semibold text-[#0A0A0A]">
                          <Calendar className="w-3.5 h-3.5 text-[#2563EB]" />
                          <span>{sub.submittedAt}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-[#6B7280] mt-0.5">
                          <Clock className="w-3 h-3" />
                          <span>{details.submittedVia === 'public_proposal_link' ? 'Public Portal' : 'Admin Queue'}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[12px] px-2.5 py-1 rounded-full font-bold border uppercase tracking-wider ${
                            sub.status === 'approved'
                              ? 'border-emerald-300 text-emerald-700 bg-emerald-50'
                              : sub.status === 'rejected'
                              ? 'border-red-300 text-red-700 bg-red-50'
                              : 'border-blue-300 text-blue-700 bg-blue-50 animate-pulse'
                          }`}
                        >
                          {sub.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        {isSuperAdmin ? (
                          <div className="inline-flex items-center gap-1.5 justify-end">
                            {/* Inspect Details Button */}
                            <button
                              onClick={() => setInspectingSub(sub)}
                              className="px-3 py-1.5 rounded-lg border border-[#E5E7EB] bg-white text-[12px] font-bold text-[#0A0A0A] hover:border-[#2563EB] hover:text-[#2563EB] shadow-xs transition-colors"
                              title="Inspect full submission details"
                            >
                              Inspect
                            </button>

                            {sub.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApprove(sub.id, sub.title)}
                                  className="p-1.5 rounded-lg border border-[#10B981] bg-emerald-50 text-[#10B981] hover:bg-emerald-100 transition-colors shadow-xs"
                                  title="Approve & Publish Live"
                                >
                                  <Check className="w-4 h-4" />
                                </button>

                                <button
                                  onClick={() => setRejectingItem(sub)}
                                  className="p-1.5 rounded-lg border border-[#EF4444] bg-red-50 text-[#EF4444] hover:bg-red-100 transition-colors shadow-xs"
                                  title="Reject with Feedback"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            )}

                            {sub.status === 'approved' && (
                              <Link
                                href={sub.type === 'project' ? '/projects' : sub.type === 'blog' ? '/blogs' : '/news'}
                                target="_blank"
                                className="px-2.5 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-700 text-[11px] font-bold inline-flex items-center gap-1 hover:bg-emerald-100 transition-colors shadow-2xs"
                                title="View published content on live site"
                              >
                                <span>View Live</span>
                                <ExternalLink className="w-3 h-3" />
                              </Link>
                            )}

                            {sub.status === 'rejected' && (
                              <button
                                onClick={() => handleApprove(sub.id, sub.title)}
                                className="px-2.5 py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 text-[11px] font-bold flex items-center gap-1 hover:bg-blue-100 transition-colors shadow-2xs"
                                title="Re-approve submission"
                              >
                                <span>Re-approve</span>
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-[12px] text-[#6B7280]">
                            {sub.status === 'pending' ? 'Pending Review' : 'Verified'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* ======================= INSPECT SUBMISSION MODAL ======================= */}
      {inspectingSub && (() => {
        const details = (inspectingSub.details || {}) as Record<string, unknown>;
        const imageUrl = details.imageUrl as string | undefined;
        const videoUrl = details.videoUrl as string | undefined;
        const repoUrl = details.repoUrl as string | undefined;
        const docsUrl = details.docsUrl as string | undefined;
        const demoUrl = details.demoUrl as string | undefined;
        const startDate = details.startDate as string | undefined;
        const category = details.category as string | undefined;
        const batchYear = details.batchYear as string | undefined;
        const tagline = details.tagline as string | undefined;
        const techStack = (details.techStack as string[]) || [];

        const associatedTeam = teams.find((t) => t.name === inspectingSub.teamName);
        const rawModalMembers = (details.memberRoster as any[]) || (details.members as any[]) || associatedTeam?.members || [];
        const membersList = (Array.isArray(rawModalMembers) ? rawModalMembers : []).map((m: any) => {
          if (typeof m === 'string') {
            return { name: m, rollNo: '', role: 'Member', email: '' };
          }
          return {
            name: m?.name || 'Member',
            rollNo: m?.rollNo || '',
            email: m?.email || '',
            role: m?.role || 'Member',
            attendance: m?.attendance,
          };
        });
        const leadName = (details.teamLead as string) || associatedTeam?.teamLead?.name || inspectingSub.studentName || 'Team Lead';
        const leadRoll = (details.teamLeadRoll as string) || inspectingSub.studentRoll || 'N/A';
        const leadEmail = (details.teamLeadEmail as string) || associatedTeam?.teamLead?.email || '';

        const ytEmbed = getYoutubeEmbedUrl(videoUrl);

        return (
          <Modal
            isOpen={!!inspectingSub}
            onClose={() => setInspectingSub(null)}
            title={`Project Proposal Review: ${inspectingSub.title}`}
            maxWidth="xl"
          >
            <div className="space-y-6 text-left max-h-[80vh] overflow-y-auto pr-1">
              
              {/* Media Previews (Image & Video) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Image Preview */}
                <div className="rounded-xl border border-gray-200 overflow-hidden bg-slate-900 flex flex-col justify-between">
                  <div className="px-3.5 py-2 bg-slate-800 text-white text-[12px] font-bold flex items-center gap-2">
                    <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                    <span>Project Cover Image</span>
                  </div>
                  <div className="relative h-48 w-full bg-slate-950 flex items-center justify-center">
                    {imageUrl ? (
                      <img src={imageUrl} alt={inspectingSub.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-gray-500 text-xs font-semibold">No Image Uploaded</div>
                    )}
                  </div>
                  {imageUrl && (
                    <div className="p-2 bg-white border-t border-gray-200 flex justify-end">
                      <a href={imageUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 font-semibold">
                        View Full Image <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Video Preview */}
                <div className="rounded-xl border border-gray-200 overflow-hidden bg-slate-900 flex flex-col justify-between">
                  <div className="px-3.5 py-2 bg-slate-800 text-white text-[12px] font-bold flex items-center gap-2">
                    <Video className="w-3.5 h-3.5 text-amber-400" />
                    <span>Project Demo Video</span>
                  </div>
                  <div className="relative h-48 w-full bg-slate-950 flex items-center justify-center overflow-hidden">
                    {ytEmbed ? (
                      <iframe
                        src={ytEmbed}
                        title="Project Video"
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : videoUrl ? (
                      <video src={videoUrl} controls className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-gray-500 text-xs font-semibold">No Video Uploaded</div>
                    )}
                  </div>
                  {videoUrl && (
                    <div className="p-2 bg-white border-t border-gray-200 flex justify-end">
                      <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 font-semibold">
                        Direct Video Link <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Meta Header */}
              <div className="p-4 rounded-xl bg-[#F8F9FA] border border-[#E5E7EB] grid grid-cols-2 sm:grid-cols-4 gap-3 text-[13px]">
                <div>
                  <span className="text-[#6B7280] block text-[11px] font-semibold uppercase">Team Name</span>
                  <span className="font-bold text-[#2563EB]">{inspectingSub.teamName}</span>
                </div>
                <div>
                  <span className="text-[#6B7280] block text-[11px] font-semibold uppercase">Category</span>
                  <span className="font-semibold text-[#0A0A0A]">{category || 'General Project'}</span>
                </div>
                <div>
                  <span className="text-[#6B7280] block text-[11px] font-semibold uppercase">Batch Year</span>
                  <span className="font-semibold text-[#0A0A0A]">Batch {batchYear || '2026'}</span>
                </div>
                <div>
                  <span className="text-[#6B7280] block text-[11px] font-semibold uppercase">Start Date</span>
                  <span className="font-semibold text-[#0A0A0A]">{startDate || 'Not specified'}</span>
                </div>
              </div>

              {/* Tagline & Technical Summary */}
              <div className="space-y-2">
                {tagline && (
                  <p className="text-[14px] font-semibold text-blue-800 bg-blue-50/70 p-3 rounded-lg border border-blue-200">
                    &ldquo;{tagline}&rdquo;
                  </p>
                )}
                <div>
                  <h4 className="font-bold text-[#0A0A0A] text-[14px] mb-1">Project Description / Technical Summary</h4>
                  <p className="text-[13px] text-[#374151] leading-relaxed bg-white p-4 rounded-xl border border-[#E5E7EB] whitespace-pre-wrap">
                    {inspectingSub.summary}
                  </p>
                </div>
              </div>

              {/* Tech Stack Pills */}
              {techStack.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="font-bold text-[#0A0A0A] text-[13px]">Technologies & Frameworks</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {techStack.map((tech) => (
                      <span key={tech} className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 text-[12px] font-semibold border border-slate-200">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Links Bar (Repo, Docs, Demo) */}
              <div className="space-y-2">
                <h4 className="font-bold text-[#0A0A0A] text-[13px]">Repository & Documentation Links</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {repoUrl ? (
                    <a
                      href={repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-xl border border-gray-200 hover:border-black bg-white flex items-center justify-between text-[13px] font-bold text-gray-900 transition-colors group"
                    >
                      <div className="flex items-center gap-2">
                        <Github className="w-4 h-4 text-gray-700" />
                        <span>GitHub Repo</span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-black" />
                    </a>
                  ) : (
                    <div className="p-3 rounded-xl border border-gray-100 bg-gray-50 text-[12px] text-gray-400 flex items-center gap-2">
                      <Github className="w-4 h-4" />
                      <span>No GitHub Provided</span>
                    </div>
                  )}

                  {docsUrl ? (
                    <a
                      href={docsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-xl border border-blue-200 hover:border-blue-600 bg-blue-50/50 flex items-center justify-between text-[13px] font-bold text-blue-900 transition-colors group"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span>Documentation</span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-blue-400 group-hover:text-blue-700" />
                    </a>
                  ) : (
                    <div className="p-3 rounded-xl border border-gray-100 bg-gray-50 text-[12px] text-gray-400 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span>No Docs Link</span>
                    </div>
                  )}

                  {demoUrl ? (
                    <a
                      href={demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-xl border border-emerald-200 hover:border-emerald-600 bg-emerald-50/50 flex items-center justify-between text-[13px] font-bold text-emerald-900 transition-colors group"
                    >
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-emerald-600" />
                        <span>Live Demo</span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-emerald-400 group-hover:text-emerald-700" />
                    </a>
                  ) : (
                    <div className="p-3 rounded-xl border border-gray-100 bg-gray-50 text-[12px] text-gray-400 flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      <span>No Demo Link</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Team Members Roster */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-[#0A0A0A] text-[13px]">
                    Team Roster ({membersList.length + (leadName ? 1 : 0)} Registered Students)
                  </h4>
                  <span className="text-[11px] text-gray-500 font-mono">Verified DB Profiles</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* Team Lead Card */}
                  <div className="p-3 rounded-xl border border-blue-300 bg-blue-50/50 text-[13px] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center uppercase shadow-xs">
                        {(leadName || 'T').charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-blue-950 flex items-center gap-1.5">
                          <span>{leadName}</span>
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-600 text-white">Lead</span>
                        </div>
                        <div className="text-[11px] text-blue-700">{leadRoll} {leadEmail ? `• ${leadEmail}` : ''}</div>
                      </div>
                    </div>
                  </div>

                  {/* Other Team Members */}
                  {membersList.filter(m => m.name !== leadName).map((m, idx) => (
                    <div key={idx} className="p-3 rounded-xl border border-gray-200 bg-white text-[13px] flex items-center justify-between shadow-2xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center uppercase">
                          {(m.name || 'M').charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-[#0A0A0A]">{m.name}</div>
                          <div className="text-[11px] text-[#6B7280]">
                            {m.rollNo || 'Registered Student'} {m.role ? `• ${m.role}` : ''}
                          </div>
                        </div>
                      </div>
                      {typeof m.attendance === 'number' && (
                        <span className="text-[11px] font-mono font-bold text-blue-600">{m.attendance}%</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Actions */}
              {isSuperAdmin && (
                <div className="pt-4 border-t border-[#E5E7EB] flex items-center justify-end gap-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setRejectingItem(inspectingSub)}
                  >
                    Reject / Request Revisions
                  </Button>
                  <Button 
                    variant="primary" 
                    size="sm" 
                    onClick={() => handleApprove(inspectingSub.id, inspectingSub.title)}
                    className="shadow-sm shadow-blue-600/30 hover:shadow-md hover:shadow-blue-600/40"
                  >
                    Approve & Make Live
                  </Button>
                </div>
              )}

            </div>
          </Modal>
        );
      })()}

      {/* Reject Confirmation Modal with Reason */}
      <Modal
        isOpen={!!rejectingItem}
        onClose={() => setRejectingItem(null)}
        title="Reject Submission / Request Changes"
      >
        {rejectingItem && (
          <div className="space-y-4 text-left">
            <p className="text-[14px] text-[#6B7280]">
              You are reviewing <strong className="text-[#0A0A0A]">{rejectingItem.title}</strong> from {rejectingItem.studentName} ({rejectingItem.teamName}).
            </p>

            <Textarea
              label="Feedback / Reason for rejection"
              placeholder="e.g. Please clarify sensor calibration procedures and re-upload schematic..."
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />

            <div className="pt-2 flex justify-end gap-3">
              <Button variant="outline" size="sm" onClick={() => setRejectingItem(null)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={handleRejectConfirm}>
                Confirm Rejection
              </Button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}