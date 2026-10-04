'use client';

import React, { useState, useRef } from 'react';
import Button from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import Modal from '@/components/shared/Modal';
import Card from '@/components/shared/Card';
import { usePortalStore } from '@/lib/store';
import { TeamItem, BatchMember } from '@/lib/data';
import { parseExcelOrCsv, downloadSampleExcelTemplate, ParsedStudentRow } from '@/lib/excelHelper';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  FileSpreadsheet, 
  Upload, 
  Download, 
  CheckCircle2, 
  Check, 
  Crown, 
  UserMinus, 
  Search, 
  Calendar 
} from 'lucide-react';

export default function AdminTeamsPage() {
  const { 
    user, 
    teams, 
    batches,
    batchInfos,
    createTeam, 
    updateTeamColor, 
    markAttendance,
    assignStudentToTeam,
    removeStudentFromTeam,
    updateStudentRole,
    addStudentsBulk
  } = usePortalStore();

  const isSuperAdmin = user.role === 'super_admin';
  const myTeam = teams.find((t) => t.id === user.teamId) || teams[0];
  const visibleTeams = isSuperAdmin ? teams : [myTeam];

  // Notification Banner
  const [notification, setNotification] = useState<string | null>(null);

  // Available students (students not yet assigned to any team or marked 'Unassigned')
  const availableStudents = batches.filter((s) => !s.teamName || s.teamName === 'Unassigned');

  // Modals state
  const [createTeamModalOpen, setCreateTeamModalOpen] = useState(false);
  const [assignMembersModalOpen, setAssignMembersModalOpen] = useState(false);
  const [teamExcelModalOpen, setTeamExcelModalOpen] = useState(false);
  const [targetTeam, setTargetTeam] = useState<TeamItem | null>(null);

  // Create Team State
  const [newTeamName, setNewTeamName] = useState('');
  const [newColorTheme, setNewColorTheme] = useState<TeamItem['colorTheme']>('blue');
  const [leadChoiceType, setLeadChoiceType] = useState<'existing' | 'manual'>('existing');
  const [selectedLeadStudentId, setSelectedLeadStudentId] = useState<string>('');
  const [manualLeadName, setManualLeadName] = useState('');
  const [manualLeadEmail, setManualLeadEmail] = useState('');
  const [manualLeadRoll, setManualLeadRoll] = useState('');

  // Assign Available Members Modal State
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [selectedStudentIdsToAssign, setSelectedStudentIdsToAssign] = useState<string[]>([]);

  // Team Excel Upload State
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [excelFileName, setExcelFileName] = useState<string | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedStudentRow[]>([]);
  const [selectedTeamForExcel, setSelectedTeamForExcel] = useState<string>(teams[0]?.id || 'team-1');
  const [isParsingExcel, setIsParsingExcel] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Create Team
  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName) return;

    let leadData: { id: string; name: string; email: string; rollNo: string };

    if (leadChoiceType === 'existing' && selectedLeadStudentId) {
      const student = batches.find((s) => s.id === selectedLeadStudentId);
      if (!student) return;
      leadData = {
        id: student.id,
        name: student.name,
        email: student.email,
        rollNo: student.rollNo,
      };
      // Assign student to this team and set role to Team Lead
      assignStudentToTeam(student.id, newTeamName, true);
    } else {
      if (!manualLeadName) return;
      leadData = {
        id: `lead-${Date.now()}`,
        name: manualLeadName,
        email: manualLeadEmail || `${manualLeadName.toLowerCase().replace(/\s+/g, '.')}@kiet.edu`,
        rollNo: manualLeadRoll || `2200290100${Math.floor(100 + Math.random() * 900)}`,
      };
    }

    const created = createTeam({
      name: newTeamName,
      colorTheme: newColorTheme,
      teamLead: leadData,
      membersCount: 1,
      members: [
        {
          id: leadData.id,
          name: leadData.name,
          email: leadData.email,
          rollNo: leadData.rollNo,
          role: 'Team Lead',
          attendance: 100,
        },
      ],
      activeProject: 'New Research Initiative',
    });

    setCreateTeamModalOpen(false);
    setNewTeamName('');
    setSelectedLeadStudentId('');
    setManualLeadName('');
    setManualLeadEmail('');
    setManualLeadRoll('');
    setNotification(`Team "${created.name}" created with Team Lead ${created.teamLead.name}.`);
    setTimeout(() => setNotification(null), 4000);
  };

  // 2. Open Assign Members to Team Modal
  const openAssignModalForTeam = (team: TeamItem) => {
    setTargetTeam(team);
    setSelectedStudentIdsToAssign([]);
    setMemberSearchQuery('');
    setAssignMembersModalOpen(true);
  };

  // 3. Confirm assigning available students
  const handleConfirmAssignStudents = () => {
    if (!targetTeam || selectedStudentIdsToAssign.length === 0) return;

    selectedStudentIdsToAssign.forEach((studentId) => {
      assignStudentToTeam(studentId, targetTeam.name, false);
    });

    setNotification(`Assigned ${selectedStudentIdsToAssign.length} student(s) to ${targetTeam.name}.`);
    setAssignMembersModalOpen(false);
    setSelectedStudentIdsToAssign([]);
    setTimeout(() => setNotification(null), 4000);
  };

  // 4. Promote member to Team Lead
  const handlePromoteToLead = (team: TeamItem, member: { id: string; name: string; email: string; rollNo: string }) => {
    assignStudentToTeam(member.id, team.name, true);
    setNotification(`${member.name} is now designated as Team Lead for ${team.name}.`);
    setTimeout(() => setNotification(null), 4000);
  };

  // 5. Remove member from team
  const handleRemoveMember = (team: TeamItem, memberId: string, memberName: string) => {
    if (confirm(`Remove ${memberName} from ${team.name}? They will return to the Unassigned student pool.`)) {
      removeStudentFromTeam(memberId);
      setNotification(`${memberName} has been removed from ${team.name} and is now available.`);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  // 6. Handle Team Excel Upload
  const handleTeamExcelFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsParsingExcel(true);
    try {
      const rows = await parseExcelOrCsv(file);
      setParsedRows(rows);
      setExcelFileName(file.name);
      setExcelFile(file);
    } catch (err: any) {
      alert('Failed to parse Excel/CSV: ' + (err?.message || 'Invalid format'));
    } finally {
      setIsParsingExcel(false);
    }
  };

  const handleConfirmTeamExcelImport = () => {
    if (parsedRows.length === 0) return;
    const team = teams.find((t) => t.id === selectedTeamForExcel);
    if (!team) return;

    // Set team name on all parsed rows
    const rowsWithTeam = parsedRows.map((r) => ({
      ...r,
      teamName: team.name,
    }));

    addStudentsBulk(rowsWithTeam);

    // Also update team roster in teams
    rowsWithTeam.forEach((r) => {
      team.members.push({
        id: `mem-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name: r.name,
        email: r.email || `${r.name.toLowerCase().replace(/\s+/g, '.')}@kiet.edu`,
        rollNo: r.rollNo,
        role: r.role || 'Student',
        attendance: 100,
      });
    });
    team.membersCount = team.members.length;

    setNotification(`Imported ${parsedRows.length} members directly into ${team.name} from "${excelFileName}".`);
    setTeamExcelModalOpen(false);
    setParsedRows([]);
    setExcelFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setTimeout(() => setNotification(null), 5000);
  };

  // Filter available students inside modal
  const filteredAvailableStudents = availableStudents.filter((s) => {
    const q = memberSearchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      s.name.toLowerCase().includes(q) ||
      s.rollNo.toLowerCase().includes(q) ||
      (s.domain && s.domain.toLowerCase().includes(q)) ||
      (s.batchYear && s.batchYear.toLowerCase().includes(q)) ||
      (s.skills && s.skills.some((sk) => sk.toLowerCase().includes(q)))
    );
  });

  return (
    <div className="space-y-8 text-left font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E5E7EB]">
        <div>
          <h1 className="text-[28px] sm:text-[32px] font-bold text-[#0A0A0A] tracking-tight">
            {isSuperAdmin ? 'Teams & Member Allocations' : `${myTeam.name} Roster & Attendance`}
          </h1>
          <p className="text-[14px] text-[#6B7280] mt-1">
            Assign students from the available unassigned student pool, designate Team Leads, or upload team-wise Excel rosters.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isSuperAdmin && (
            <Button
              variant="outline"
              size="md"
              onClick={() => setTeamExcelModalOpen(true)}
              className="flex items-center gap-2 border-[#2563EB] text-[#2563EB] hover:bg-blue-50"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Upload Team Excel</span>
            </Button>
          )}

          {isSuperAdmin && (
            <Button
              variant="primary"
              size="md"
              onClick={() => setCreateTeamModalOpen(true)}
              className="shadow-sm shadow-blue-600/30 hover:shadow-md hover:shadow-blue-600/40"
            >
              + Create Team
            </Button>
          )}
        </div>
      </div>

      {notification && (
        <div className="p-4 rounded-lg bg-[#F8F9FA] border border-[#2563EB] text-[14px] text-[#0A0A0A] flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#2563EB] flex-shrink-0" />
            <span>{notification}</span>
          </div>
          <button 
            onClick={() => setNotification(null)}
            className="text-[12px] text-[#6B7280] hover:text-[#0A0A0A] underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[24px] font-bold text-[#0A0A0A]">{teams.length}</div>
            <div className="text-[13px] text-[#6B7280]">Active Research Teams</div>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[24px] font-bold text-[#0A0A0A]">
              {teams.reduce((acc, t) => acc + (t.members?.length || 0), 0)}
            </div>
            <div className="text-[13px] text-[#6B7280]">Total Team Interns</div>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[24px] font-bold text-[#0A0A0A]">{availableStudents.length}</div>
            <div className="text-[13px] text-[#6B7280]">Available for Allocation</div>
          </div>
        </Card>
      </div>

      {/* Teams Display */}
      <div className="space-y-8">
        {visibleTeams.map((team) => {
          const teamRoster = batches.filter((b) => b.teamName === team.name);
          const totalMembersCount = Math.max(teamRoster.length, team.members?.length || 0);

          return (
            <div key={team.id} className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-sm">
              {/* Team Header */}
              <div className="p-6 border-b border-[#E5E7EB] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#F8F9FA]">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <h2 className="text-[22px] font-bold text-[#0A0A0A]">{team.name}</h2>
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-[#2563EB]">
                      {team.colorTheme} Theme
                    </span>
                    <span className="text-[12px] px-2.5 py-0.5 rounded-full border border-[#E5E7EB] bg-white text-[#6B7280] font-medium">
                      {totalMembersCount} Members
                    </span>
                  </div>
                  <p className="text-[13px] text-[#6B7280]">
                    Designated Team Lead: <strong className="text-[#0A0A0A]">{team.teamLead.name}</strong> ({team.teamLead.email})
                    {team.activeProject && <> • Active Project: <strong className="text-[#0A0A0A]">{team.activeProject}</strong></>}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {/* Accent Color picker (Super Admin only) */}
                  {isSuperAdmin && (
                    <div className="flex items-center gap-1.5 mr-2">
                      <span className="text-[12px] text-[#6B7280]">Accent:</span>
                      {(['blue', 'emerald', 'purple', 'amber', 'cyan'] as const).map((color) => (
                        <button
                          key={color}
                          onClick={() => updateTeamColor(team.id, color)}
                          className={`w-5 h-5 rounded-full border transition-transform ${
                            team.colorTheme === color ? 'scale-125 border-[#0A0A0A]' : 'border-transparent'
                          } ${
                            color === 'blue' ? 'bg-[#2563EB]' :
                            color === 'emerald' ? 'bg-[#10B981]' :
                            color === 'purple' ? 'bg-[#8B5CF6]' :
                            color === 'amber' ? 'bg-[#F59E0B]' : 'bg-[#06B6D4]'
                          }`}
                          title={color}
                        />
                      ))}
                    </div>
                  )}

                  {isSuperAdmin && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => openAssignModalForTeam(team)}
                      className="flex items-center gap-1.5"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>+ Assign Available Students</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* Interns Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#E5E7EB] bg-white text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider">
                      <th className="py-3 px-4">Member Name</th>
                      <th className="py-3 px-4">Roll Number</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Batch Cohort</th>
                      <th className="py-3 px-4">Attendance</th>
                      <th className="py-3 px-4 text-right">Team Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB] text-[14px]">
                    {team.members.map((member, idx) => {
                      const isLead = member.role === 'Team Lead' || team.teamLead.id === member.id || team.teamLead.name === member.name;
                      const batchEntry = batches.find((b) => b.rollNo === member.rollNo || b.id === member.id);

                      return (
                        <tr
                          key={member.id || idx}
                          className={`transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-[#F8F9FA]'} hover:bg-[#F1F3F5]`}
                        >
                          <td className="py-3.5 px-4 font-medium text-[#0A0A0A]">
                            <div className="flex items-center gap-2">
                              {isLead && <Crown className="w-4 h-4 text-amber-500 flex-shrink-0" />}
                              <div>
                                <div className="font-semibold text-[#0A0A0A]">{member.name}</div>
                                <div className="text-[12px] text-[#6B7280]">{member.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[13px] text-[#0A0A0A]">
                            {member.rollNo}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                                isLead
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 text-gray-700 border border-gray-200'
                              }`}
                            >
                              {isLead ? 'Team Lead' : member.role || 'Member'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-[13px]">
                            <span className="font-medium text-[#0A0A0A]">
                              Batch {batchEntry?.batchYear || '2026'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-[#10B981]">
                              {member.attendance || 95}%
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center gap-2 justify-end">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  markAttendance(team.id, member.id, 100);
                                  setNotification(`Attendance recorded for ${member.name}.`);
                                  setTimeout(() => setNotification(null), 2500);
                                }}
                              >
                                Mark Present
                              </Button>

                              {isSuperAdmin && !isLead && (
                                <button
                                  type="button"
                                  onClick={() => handlePromoteToLead(team, member)}
                                  className="p-1.5 rounded text-amber-600 hover:bg-amber-50 transition-colors"
                                  title="Promote to Team Lead"
                                >
                                  <Crown className="w-4 h-4" />
                                </button>
                              )}

                              {isSuperAdmin && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveMember(team, member.id, member.name)}
                                  className="p-1.5 rounded text-rose-500 hover:bg-rose-50 transition-colors"
                                  title="Remove from Team"
                                >
                                  <UserMinus className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>

      {/* ======================= CREATE TEAM MODAL ======================= */}
      <Modal
        isOpen={createTeamModalOpen}
        onClose={() => setCreateTeamModalOpen(false)}
        title="Create New Research Team"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateTeam} className="space-y-4 text-left">
          <Input
            label="Team Name"
            placeholder="e.g. Team CleanMobility"
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            required
          />

          <div className="space-y-2">
            <label className="block text-[14px] font-medium text-[#0A0A0A]">
              Assign Team Lead
            </label>
            <div className="flex items-center gap-4 text-[13px]">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="leadChoice"
                  checked={leadChoiceType === 'existing'}
                  onChange={() => setLeadChoiceType('existing')}
                  className="text-[#2563EB]"
                />
                <span>Pick from Available Students ({availableStudents.length})</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="leadChoice"
                  checked={leadChoiceType === 'manual'}
                  onChange={() => setLeadChoiceType('manual')}
                  className="text-[#2563EB]"
                />
                <span>Enter New Lead</span>
              </label>
            </div>

            {leadChoiceType === 'existing' ? (
              <div className="pt-1">
                {availableStudents.length > 0 ? (
                  <select
                    value={selectedLeadStudentId}
                    onChange={(e) => setSelectedLeadStudentId(e.target.value)}
                    required
                    className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-[14px] text-[#0A0A0A] focus:border-[#2563EB] focus:outline-none"
                  >
                    <option value="">-- Choose an Available Student as Lead --</option>
                    {availableStudents.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.rollNo}) • Batch {s.batchYear} • {s.domain}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-[13px] text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200">
                    No unassigned students currently available. Please select "Enter New Lead" or register students first.
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-3 pt-1">
                <Input
                  label="Lead Full Name"
                  placeholder="e.g. Meera Nambiar"
                  value={manualLeadName}
                  onChange={(e) => setManualLeadName(e.target.value)}
                  required
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Lead Email"
                    type="email"
                    placeholder="meera.nambiar@kiet.edu"
                    value={manualLeadEmail}
                    onChange={(e) => setManualLeadEmail(e.target.value)}
                  />
                  <Input
                    label="Lead Roll No"
                    placeholder="2200290100088"
                    value={manualLeadRoll}
                    onChange={(e) => setManualLeadRoll(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-[14px] font-medium text-[#0A0A0A]">UI Accent Color</label>
            <select
              value={newColorTheme}
              onChange={(e) => setNewColorTheme(e.target.value as TeamItem['colorTheme'])}
              className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-[15px] text-[#0A0A0A] focus:border-[#2563EB] focus:outline-none"
            >
              <option value="blue">Blue (#2563EB)</option>
              <option value="emerald">Emerald</option>
              <option value="purple">Purple</option>
              <option value="amber">Amber</option>
              <option value="cyan">Cyan</option>
            </select>
          </div>

          <div className="pt-2 flex justify-end gap-3 border-t border-[#E5E7EB]">
            <Button type="button" variant="outline" onClick={() => setCreateTeamModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Team
            </Button>
          </div>
        </form>
      </Modal>

      {/* ======================= ASSIGN AVAILABLE STUDENTS MODAL ======================= */}
      {targetTeam && (
        <Modal
          isOpen={assignMembersModalOpen}
          onClose={() => setAssignMembersModalOpen(false)}
          title={`Assign Available Students to ${targetTeam.name}`}
          maxWidth="2xl"
        >
          <div className="space-y-4 text-left">
            <p className="text-[13px] text-[#6B7280]">
              Showing all registered students in the CRM who are currently <strong>Unassigned</strong> and available for team allocation.
            </p>

            <div className="relative">
              <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search available students by name, roll no, domain, skills..."
                value={memberSearchQuery}
                onChange={(e) => setMemberSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-[13px] rounded-lg border border-[#E5E7EB] bg-white text-[#0A0A0A] focus:outline-none focus:border-[#2563EB]"
              />
            </div>

            {filteredAvailableStudents.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-[#E5E7EB] rounded-xl text-[#6B7280] text-[14px]">
                {memberSearchQuery
                  ? 'No available students match your search.'
                  : 'All registered students are currently allocated to teams. You can register new students or upload an Excel roster.'}
              </div>
            ) : (
              <div className="max-h-72 overflow-y-auto border border-[#E5E7EB] rounded-xl divide-y divide-[#E5E7EB]">
                {filteredAvailableStudents.map((student) => {
                  const isChecked = selectedStudentIdsToAssign.includes(student.id);
                  return (
                    <div
                      key={student.id}
                      onClick={() => {
                        setSelectedStudentIdsToAssign((prev) =>
                          isChecked ? prev.filter((id) => id !== student.id) : [...prev, student.id]
                        );
                      }}
                      className={`p-3 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                        isChecked ? 'bg-blue-50/70' : 'hover:bg-[#F8F9FA]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="w-4 h-4 rounded text-[#2563EB]"
                        />
                        <div>
                          <div className="text-[14px] font-semibold text-[#0A0A0A]">{student.name}</div>
                          <div className="text-[12px] text-[#6B7280]">
                            Roll: <span className="font-mono">{student.rollNo}</span> • Batch {student.batchYear} • {student.domain}
                          </div>
                        </div>
                      </div>

                      <span className="text-[11px] font-medium text-[#2563EB] bg-white px-2 py-0.5 rounded border border-[#E5E7EB]">
                        {student.branch || 'CSE'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="pt-3 flex items-center justify-between border-t border-[#E5E7EB]">
              <span className="text-[13px] text-[#6B7280]">
                Selected: <strong className="text-[#0A0A0A]">{selectedStudentIdsToAssign.length}</strong> student(s)
              </span>

              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={() => setAssignMembersModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  disabled={selectedStudentIdsToAssign.length === 0}
                  onClick={handleConfirmAssignStudents}
                >
                  Confirm Allocation
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ======================= TEAM EXCEL UPLOAD MODAL ======================= */}
      <Modal
        isOpen={teamExcelModalOpen}
        onClose={() => {
          setTeamExcelModalOpen(false);
          setParsedRows([]);
          setExcelFileName(null);
        }}
        title="Upload Team-Wise Student Excel"
        maxWidth="2xl"
      >
        <div className="space-y-5 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-blue-50/60 border border-blue-200">
            <div>
              <p className="text-[14px] font-semibold text-blue-900">
                Team-Wise Student Roster Import
              </p>
              <p className="text-[12px] text-blue-700 mt-0.5">
                Upload student Excel spreadsheet (.xlsx, .xls, .csv). All imported members will be assigned to the selected team.
              </p>
            </div>
            <button
              type="button"
              onClick={() => downloadSampleExcelTemplate('team', batchInfos)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-blue-300 text-[12px] font-semibold text-blue-700 hover:bg-blue-50 transition-colors whitespace-nowrap shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Template</span>
            </button>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[14px] font-medium text-[#0A0A0A]">
              Target Team for Import
            </label>
            <select
              value={selectedTeamForExcel}
              onChange={(e) => setSelectedTeamForExcel(e.target.value)}
              className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-[14px] text-[#0A0A0A] focus:border-[#2563EB] focus:outline-none"
            >
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} (Current Members: {t.members?.length || 0})
                </option>
              ))}
            </select>
          </div>

          {/* Upload Drop Zone */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-[#E5E7EB] hover:border-[#2563EB] rounded-xl p-8 text-center cursor-pointer bg-[#F8F9FA] hover:bg-white transition-colors"
          >
            <input
              type="file"
              ref={fileInputRef}
              accept=".xlsx,.xls,.csv"
              onChange={handleTeamExcelFileChange}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-full bg-blue-50 text-[#2563EB] flex items-center justify-center mx-auto mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-[15px] font-semibold text-[#0A0A0A]">
              {excelFileName ? `Selected: ${excelFileName}` : 'Select Team Excel (.xlsx, .xls) or CSV'}
            </p>
            <p className="text-[13px] text-[#6B7280] mt-1">
              File can include columns: Name, Roll No, Email, Batch, Domain, Role, Skills.
            </p>
            {isParsingExcel && (
              <p className="text-[13px] text-[#2563EB] font-medium mt-2 animate-pulse">
                Parsing spreadsheet...
              </p>
            )}
          </div>

          {/* Preview */}
          {parsedRows.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[13px]">
                <span className="font-semibold text-[#0A0A0A]">
                  Detected: <strong className="text-[#2563EB]">{parsedRows.length}</strong> team members
                </span>
                <span className="text-[#6B7280]">Previewing first 5 rows</span>
              </div>

              <div className="max-h-48 overflow-y-auto border border-[#E5E7EB] rounded-lg">
                <table className="w-full text-left text-[12px]">
                  <thead className="bg-[#F8F9FA] border-b border-[#E5E7EB] text-[#6B7280]">
                    <tr>
                      <th className="py-2 px-3">Name</th>
                      <th className="py-2 px-3">Roll No</th>
                      <th className="py-2 px-3">Batch</th>
                      <th className="py-2 px-3">Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB]">
                    {parsedRows.slice(0, 5).map((row, i) => (
                      <tr key={i} className="hover:bg-[#F8F9FA]">
                        <td className="py-2 px-3 font-semibold text-[#0A0A0A]">{row.name}</td>
                        <td className="py-2 px-3 font-mono text-[#6B7280]">{row.rollNo}</td>
                        <td className="py-2 px-3">Batch {row.batchYear || '2026'}</td>
                        <td className="py-2 px-3 font-medium text-[#2563EB]">{row.role || 'Member'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#E5E7EB]">
            <Button
              variant="outline"
              onClick={() => {
                setTeamExcelModalOpen(false);
                setParsedRows([]);
                setExcelFileName(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={parsedRows.length === 0}
              onClick={handleConfirmTeamExcelImport}
              className="flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Import {parsedRows.length > 0 ? `(${parsedRows.length}) Members` : 'Members'}</span>
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
