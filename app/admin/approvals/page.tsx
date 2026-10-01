'use client';

import React, { useState } from 'react';
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
  Calendar 
} from 'lucide-react';

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

  // Team Lead content submission state
  const [tlTitle, setTlTitle] = useState('');
  const [tlSummary, setTlSummary] = useState('');
  const [tlType, setTlType] = useState<'project' | 'blog' | 'news'>('project');
  const [tlSuccess, setTlSuccess] = useState(false);

  const isSuperAdmin = user.role === 'super_admin';

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

  return (
    <div className="space-y-8 text-left">
      
      {/* Page Header */}
      <div className="pb-2 border-b border-[#E5E7EB]">
        <h1 className="text-[28px] sm:text-[32px] font-bold text-[#0A0A0A] tracking-tight">
          {isSuperAdmin ? 'Approval Authority & Submission Verification' : 'Submit Team Content for Review'}
        </h1>
        <p className="text-[14px] text-[#6B7280] mt-1">
          {isSuperAdmin
            ? 'Super Admin verification queue: review project proposals, blog write-ups, and milestone submissions with real-time team hierarchy, team leads, members, and timestamps.'
            : 'As Team Lead, submit projects, blogs, or news on behalf of your team. All items route to the Super Admin for final approval.'}
        </p>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-lg bg-[#F8F9FA] border border-[#2563EB] text-[14px] text-[#0A0A0A] flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-[#2563EB] flex-shrink-0" />
          <span>{actionSuccess}</span>
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
        <div className="p-4 sm:p-5 border-b border-[#E5E7EB] flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[13px] text-[#6B7280] mr-1">Status:</span>
            {(['all', 'pending', 'approved', 'rejected'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-[13px] font-medium border capitalize transition-colors ${
                  statusFilter === s
                    ? 'border-[#2563EB] text-[#2563EB] bg-[#F8F9FA]'
                    : 'border-[#E5E7EB] text-[#6B7280] hover:text-[#0A0A0A]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[13px] text-[#6B7280] mr-1">Type:</span>
            {['all', 'project', 'blog', 'news', 'task_video'].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 rounded-lg text-[13px] font-medium border capitalize transition-colors ${
                  filterType === t
                    ? 'border-[#0A0A0A] text-[#0A0A0A] bg-[#F8F9FA]'
                    : 'border-[#E5E7EB] text-[#6B7280] hover:text-[#0A0A0A]'
                }`}
              >
                {t.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Table Contents */}
        {filteredSubs.length === 0 ? (
          <div className="p-12 text-center text-[#6B7280] text-[14px]">
            No submissions found matching selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F8F9FA] text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider">
                  <th className="py-3.5 px-4">Submission / Proposal</th>
                  <th className="py-3.5 px-4">Requesting Team</th>
                  <th className="py-3.5 px-4">Team Lead</th>
                  <th className="py-3.5 px-4">Team Members</th>
                  <th className="py-3.5 px-4">Timeline</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB] text-[14px]">
                {filteredSubs.map((sub, idx) => {
                  const associatedTeam = teams.find((t) => t.name === sub.teamName);
                  const leadName = associatedTeam?.teamLead.name || sub.studentName;
                  const leadEmail = associatedTeam?.teamLead.email || `${leadName.toLowerCase().replace(/\s+/g, '.')}@kiet.edu`;
                  const membersList = associatedTeam?.members || [
                    { id: '1', name: sub.studentName, rollNo: sub.studentRoll, email: leadEmail, role: 'Author', attendance: 95 }
                  ];

                  return (
                    <tr
                      key={sub.id}
                      className={`transition-colors ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-[#F8F9FA]'
                      } hover:bg-[#F1F3F5]`}
                    >
                      {/* Submission Title & Type */}
                      <td className="py-3.5 px-4 font-medium text-[#0A0A0A] max-w-xs">
                        <div className="flex items-center gap-2">
                          <span className="capitalize text-[11px] px-2 py-0.5 rounded border border-[#E5E7EB] bg-white text-[#2563EB] font-bold flex-shrink-0">
                            {sub.type.replace('_', ' ')}
                          </span>
                          <span className="font-semibold text-[#0A0A0A] line-clamp-1">{sub.title}</span>
                        </div>
                        <div className="text-[12px] text-[#6B7280] line-clamp-1 mt-1">
                          {sub.summary}
                        </div>
                      </td>

                      {/* Requesting Team */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[13px] font-semibold bg-blue-50/70 border border-blue-200 text-[#2563EB]">
                          <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
                          {sub.teamName}
                        </span>
                      </td>

                      {/* Team Lead */}
                      <td className="py-3.5 px-4 text-[13px]">
                        <div className="font-semibold text-[#0A0A0A] flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#2563EB]" />
                          <span>{leadName}</span>
                        </div>
                        <div className="text-[11px] text-[#6B7280] truncate max-w-[160px]">
                          {leadEmail}
                        </div>
                      </td>

                      {/* Team Members with side-by-side circles */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center -space-x-2">
                          {membersList.slice(0, 4).map((m, i) => (
                            <div
                              key={i}
                              title={`${m.name} (${m.role})`}
                              className="w-7 h-7 rounded-full border-2 border-white bg-slate-800 text-white text-[11px] font-bold flex items-center justify-center uppercase shadow-xs"
                            >
                              {m.name.charAt(0)}
                            </div>
                          ))}
                          {membersList.length > 4 && (
                            <div className="w-7 h-7 rounded-full border-2 border-white bg-gray-200 text-[#0A0A0A] text-[10px] font-bold flex items-center justify-center">
                              +{membersList.length - 4}
                            </div>
                          )}
                        </div>
                        <div className="text-[11px] text-[#6B7280] mt-1">
                          {membersList.length} registered member{membersList.length !== 1 ? 's' : ''}
                        </div>
                      </td>

                      {/* Submission Timeline */}
                      <td className="py-3.5 px-4 text-[12px] text-[#6B7280] whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-medium text-[#0A0A0A]">
                          <Calendar className="w-3.5 h-3.5 text-[#2563EB]" />
                          <span>{sub.submittedAt}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-[#6B7280] mt-0.5">
                          <Clock className="w-3 h-3" />
                          <span>Verified Log</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[12px] px-2.5 py-1 rounded-full font-semibold border ${
                            sub.status === 'approved'
                              ? 'border-[#10B981] text-[#10B981] bg-emerald-50/60'
                              : sub.status === 'rejected'
                              ? 'border-[#EF4444] text-[#EF4444] bg-red-50/60'
                              : 'border-[#2563EB] text-[#2563EB] bg-blue-50/60 animate-pulse'
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
                              className="px-2.5 py-1 rounded-lg border border-[#E5E7EB] bg-white text-[12px] font-medium text-[#0A0A0A] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors"
                              title="Inspect full submission details"
                            >
                              Inspect
                            </button>

                            {sub.status !== 'approved' && (
                              <button
                                onClick={() => handleApprove(sub.id, sub.title)}
                                className="p-1.5 rounded-lg border border-[#10B981] bg-emerald-50 text-[#10B981] hover:bg-emerald-100 transition-colors"
                                title="Approve & Publish Live"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}

                            {sub.status !== 'rejected' && (
                              <button
                                onClick={() => setRejectingItem(sub)}
                                className="p-1.5 rounded-lg border border-[#EF4444] bg-red-50 text-[#EF4444] hover:bg-red-100 transition-colors"
                                title="Reject with Feedback"
                              >
                                <X className="w-4 h-4" />
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
      {inspectingSub && (
        <Modal
          isOpen={!!inspectingSub}
          onClose={() => setInspectingSub(null)}
          title={`Review Submission: ${inspectingSub.title}`}
          maxWidth="lg"
        >
          <div className="space-y-5 text-left">
            
            {/* Meta Header */}
            <div className="p-4 rounded-xl bg-[#F8F9FA] border border-[#E5E7EB] space-y-3">
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-[#6B7280]">Requesting Team:</span>
                <span className="font-bold text-[#2563EB]">{inspectingSub.teamName}</span>
              </div>
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-[#6B7280]">Submitted By (Lead/Author):</span>
                <span className="font-semibold text-[#0A0A0A]">
                  {inspectingSub.studentName} ({inspectingSub.studentRoll})
                </span>
              </div>
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-[#6B7280]">Content Category / Type:</span>
                <span className="capitalize font-semibold text-[#0A0A0A]">
                  {inspectingSub.type.replace('_', ' ')}
                </span>
              </div>
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-[#6B7280]">Submission Timestamp:</span>
                <span className="font-mono text-[#0A0A0A]">{inspectingSub.submittedAt}</span>
              </div>
            </div>

            {/* Content Details */}
            <div className="space-y-2">
              <h4 className="font-semibold text-[#0A0A0A] text-[15px]">Technical Summary</h4>
              <p className="text-[14px] text-[#6B7280] leading-relaxed bg-white p-3.5 rounded-lg border border-[#E5E7EB]">
                {inspectingSub.summary}
              </p>
            </div>

            {/* Team Roster Insight */}
            {(() => {
              const currentTeam = teams.find((t) => t.name === inspectingSub.teamName);
              if (!currentTeam) return null;
              return (
                <div className="space-y-2">
                  <h4 className="font-semibold text-[#0A0A0A] text-[14px]">Team Members List ({currentTeam.members.length})</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {currentTeam.members.map((m) => (
                      <div key={m.id} className="p-2.5 rounded-lg border border-[#E5E7EB] bg-[#F8F9FA] text-[13px] flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-[#0A0A0A]">{m.name}</div>
                          <div className="text-[11px] text-[#6B7280]">{m.role} • {m.rollNo}</div>
                        </div>
                        <span className="text-[11px] font-mono text-[#2563EB]">{m.attendance}% att.</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Actions */}
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
      )}

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