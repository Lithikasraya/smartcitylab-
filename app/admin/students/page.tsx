'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import Card from '@/components/shared/Card';
import Button from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import Modal from '@/components/shared/Modal';
import { usePortalStore } from '@/lib/store';
import { BatchMember } from '@/lib/data';
import MemberAvatar from '@/components/shared/MemberAvatar';
import { parseExcelOrCsv, downloadSampleExcelTemplate, ParsedStudentRow } from '@/lib/excelHelper';
import { uploadMediaFile } from '@/lib/mediaService';
import { 
  GraduationCap, 
  Users, 
  KeyRound, 
  Search, 
  CheckCircle2, 
  Copy, 
  RefreshCw, 
  ShieldCheck, 
  Trash2, 
  Edit3,
  FileSpreadsheet,
  Upload,
  Download,
  Check,
  UserPlus,
  User,
  Mail,
  Hash,
  Cpu,
  Sparkles,
  Calendar,
  Layers,
  Building2,
  Lock,
  Camera,
  Image as ImageIcon,
  Loader2
} from 'lucide-react';

export default function AdminStudentsCRMPage() {
  const { 
    batches, 
    batchInfos, 
    teams, 
    addStudentToCRM, 
    addStudentsBulk,
    updateStudentRole,
    updateIntern, 
    deleteIntern, 
    resetStudentPassword 
  } = usePortalStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [batchFilter, setBatchFilter] = useState<string>('all');
  const [branchFilter, setBranchFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [teamFilter, setTeamFilter] = useState<string>('all');

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [excelModalOpen, setExcelModalOpen] = useState(false);
  const [credModalStudent, setCredModalStudent] = useState<BatchMember | null>(null);
  const [editingStudent, setEditingStudent] = useState<BatchMember | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);

  // Excel bulk upload state
  const [parsedExcelRows, setParsedExcelRows] = useState<ParsedStudentRow[]>([]);
  const [excelFileName, setExcelFileName] = useState<string | null>(null);
  const [isParsingExcel, setIsParsingExcel] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Photo Upload State
  const [photoUrl, setPhotoUrl] = useState('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isUploadingEditPhoto, setIsUploadingEditPhoto] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const editPhotoInputRef = useRef<HTMLInputElement>(null);

  // Fallback batches if custom batchInfos haven't been created yet
  const availableBatches = batchInfos.length > 0
    ? batchInfos.map((b) => ({ value: b.year, label: `${b.name} (${b.academicSession || b.year})` }))
    : [
        { value: '2027', label: 'Batch 2027 (2026-2027)' },
        { value: '2026', label: 'Batch 2026 (2025-2026)' },
        { value: '2025', label: 'Batch 2025 (2024-2025)' },
        { value: '2024', label: 'Batch 2024 (2023-2024)' },
      ];

  // New Student Form State
  const [name, setName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [email, setEmail] = useState('');
  const [year, setYear] = useState('3rd Year');
  const [branch, setBranch] = useState('CSE');
  const [batchYear, setBatchYear] = useState<string>(batchInfos[0]?.year || '2026');
  const [teamName, setTeamName] = useState('Unassigned');
  const [studentRole, setStudentRole] = useState<'Student' | 'Team Lead' | 'Mentor' | 'Faculty'>('Student');
  const [domain, setDomain] = useState('IoT & Embedded Systems');

  // Photo upload handler
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (isEdit) setIsUploadingEditPhoto(true);
    else setIsUploadingPhoto(true);

    try {
      const url = await uploadMediaFile(file, 'students/avatars');
      if (isEdit && editingStudent) {
        setEditingStudent({ ...editingStudent, photoUrl: url });
      } else {
        setPhotoUrl(url);
      }
    } catch (err: unknown) {
      console.warn('Photo upload note:', err);
    } finally {
      if (isEdit) setIsUploadingEditPhoto(false);
      else setIsUploadingPhoto(false);
    }
  };

  // Filter students
  const filteredStudents = batches.filter((s) => {
    const matchesSearch = 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.teamName && s.teamName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.skills && s.skills.some(sk => sk.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesBatch = batchFilter === 'all' || s.batchYear === batchFilter;
    const matchesBranch = branchFilter === 'all' || s.branch === branchFilter;
    
    const currentRole = s.role || (s.isTeamLead ? 'Team Lead' : 'Student');
    const matchesRole = 
      roleFilter === 'all' 
        ? true 
        : roleFilter === 'leads' 
        ? s.isTeamLead || s.role === 'Team Lead'
        : roleFilter === 'members' 
        ? !s.isTeamLead && s.role !== 'Team Lead'
        : currentRole === roleFilter;

    const matchesTeam = 
      teamFilter === 'all'
        ? true
        : teamFilter === 'unassigned'
        ? !s.teamName || s.teamName === 'Unassigned'
        : s.teamName === teamFilter;

    return matchesSearch && matchesBatch && matchesBranch && matchesRole && matchesTeam;
  });

  // Metrics
  const totalStudents = batches.length;
  const unassignedCount = batches.filter((b) => !b.teamName || b.teamName === 'Unassigned').length;
  const totalLeads = batches.filter((b) => b.isTeamLead || b.role === 'Team Lead').length;
  const pendingResetCount = batches.filter((b) => b.passwordResetRequired).length;

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !rollNo) return;

    const studentEmail = email || `${name.toLowerCase().replace(/\s+/g, '.')}@kiet.edu`;
    const tempPass = `SCL@${Math.floor(1000 + Math.random() * 9000)}`;
    const isLead = studentRole === 'Team Lead';

    const created = addStudentToCRM({
      name,
      rollNo,
      email: studentEmail,
      year,
      branch,
      batchYear,
      teamName: teamName || 'Unassigned',
      domain,
      role: studentRole,
      isTeamLead: isLead,
      photoUrl: photoUrl || undefined,
      tempPassword: tempPass,
      passwordResetRequired: true,
    });

    setCreateModalOpen(false);
    // Reset form
    setName('');
    setRollNo('');
    setEmail('');
    setPhotoUrl('');
    setStudentRole('Student');
    setTeamName('Unassigned');

    setBannerNotice(
      `Student "${created.name}" registered successfully into ${batchYear ? `Batch ${batchYear}` : 'CRM'} with role "${studentRole}". Temporary credentials generated.`
    );
    setTimeout(() => setBannerNotice(null), 8000);
  };

  const handleExcelFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsParsingExcel(true);
    try {
      const rows = await parseExcelOrCsv(file);
      setParsedExcelRows(rows);
      setExcelFileName(file.name);
    } catch (err: any) {
      alert('Failed to parse Excel/CSV file: ' + (err?.message || 'Invalid format'));
    } finally {
      setIsParsingExcel(false);
    }
  };

  const handleConfirmExcelImport = () => {
    if (parsedExcelRows.length === 0) return;
    addStudentsBulk(parsedExcelRows);
    setBannerNotice(`Successfully enrolled ${parsedExcelRows.length} students from "${excelFileName}" into the CRM roster.`);
    setExcelModalOpen(false);
    setParsedExcelRows([]);
    setExcelFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setTimeout(() => setBannerNotice(null), 6000);
  };

  const handleResetPassword = (studentId: string) => {
    const newPass = resetStudentPassword(studentId);
    if (credModalStudent && credModalStudent.id === studentId) {
      setCredModalStudent({
        ...credModalStudent,
        tempPassword: newPass,
        passwordResetRequired: true,
      });
    }
    setBannerNotice(`Temporary password reset to "${newPass}" for ${credModalStudent?.name}. Student must update upon login.`);
    setTimeout(() => setBannerNotice(null), 6000);
  };

  const handleCopyCredentials = (student: BatchMember) => {
    const text = `KIET Smart City Lab Credentials:\nEmail: ${student.email}\nTemporary Password: ${student.tempPassword || 'SCL@2026'}\nPortal: http://localhost:3000/portal\nNote: You will be asked to set a new password on first login.`;
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    updateIntern(editingStudent.id, {
      name: editingStudent.name,
      rollNo: editingStudent.rollNo,
      email: editingStudent.email,
      year: editingStudent.year,
      branch: editingStudent.branch,
      batchYear: editingStudent.batchYear,
      teamName: editingStudent.teamName || 'Unassigned',
      domain: editingStudent.domain,
      role: editingStudent.role || (editingStudent.isTeamLead ? 'Team Lead' : 'Student'),
      isTeamLead: editingStudent.role === 'Team Lead' || !!editingStudent.isTeamLead,
      photoUrl: editingStudent.photoUrl,
    });
    setEditingStudent(null);
    setBannerNotice(`Details for ${editingStudent.name} updated.`);
    setTimeout(() => setBannerNotice(null), 4000);
  };

  return (
    <div className="space-y-8 text-left">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E5E7EB]">
        <div>
          <h1 className="text-[28px] sm:text-[32px] font-bold text-[#0A0A0A] tracking-tight">
            Students Data Registry
          </h1>
          <p className="text-[14px] text-[#6B7280] mt-1">
            Complete student directory: enroll individual students, bulk upload spreadsheets, and manage team roles.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="md" 
            onClick={() => setExcelModalOpen(true)}
            className="flex items-center gap-2 border-[#2563EB] text-[#2563EB] hover:bg-blue-50"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Upload Excel / CSV</span>
          </Button>

          <Link href="/admin/students/new">
            <Button 
              variant="primary" 
              size="md" 
              className="shadow-sm shadow-blue-600/30 hover:shadow-md hover:shadow-blue-600/40 flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>Enroll Student</span>
            </Button>
          </Link>
        </div>
      </div>

      {bannerNotice && (
        <div className="p-4 rounded-lg bg-[#F8F9FA] border border-[#2563EB] text-[14px] text-[#0A0A0A] flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#2563EB] flex-shrink-0" />
            <span>{bannerNotice}</span>
          </div>
          <button 
            onClick={() => setBannerNotice(null)}
            className="text-[12px] text-[#6B7280] hover:text-[#0A0A0A] underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#F8F9FA] border border-[#E5E7EB] flex items-center justify-center text-[#2563EB]">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[24px] font-bold text-[#0A0A0A]">{totalStudents}</div>
            <div className="text-[13px] text-[#6B7280]">Total Registered Students</div>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#F8F9FA] border border-[#E5E7EB] flex items-center justify-center text-amber-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[24px] font-bold text-[#0A0A0A]">{unassignedCount}</div>
            <div className="text-[13px] text-[#6B7280]">Available (No Team Yet)</div>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#F8F9FA] border border-[#E5E7EB] flex items-center justify-center text-[#2563EB]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[24px] font-bold text-[#0A0A0A]">{totalLeads}</div>
            <div className="text-[13px] text-[#6B7280]">Designated Team Leads</div>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#F8F9FA] border border-[#E5E7EB] flex items-center justify-center text-[#6B7280]">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[24px] font-bold text-[#0A0A0A]">{pendingResetCount}</div>
            <div className="text-[13px] text-[#6B7280]">Pending 1st Login Reset</div>
          </div>
        </Card>
      </div>

      {/* Main CRM Table Container */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden shadow-sm">
        
        {/* Search & Filters Bar */}
        <div className="p-4 sm:p-5 border-b border-[#E5E7EB] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by student name, roll no, email, domain, team, skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#E5E7EB] bg-[#F8F9FA] text-[14px] text-[#0A0A0A] placeholder-[#6B7280] focus:outline-none focus:border-[#2563EB] focus:bg-white transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[13px]">
            {/* Batch Filter */}
            <select
              value={batchFilter}
              onChange={(e) => setBatchFilter(e.target.value)}
              className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 text-[#0A0A0A] focus:border-[#2563EB] focus:outline-none"
            >
              <option value="all">All Batches</option>
              {availableBatches.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.label}
                </option>
              ))}
            </select>

            {/* Team Filter */}
            <select
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
              className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 text-[#0A0A0A] focus:border-[#2563EB] focus:outline-none"
            >
              <option value="all">All Teams</option>
              <option value="unassigned">Unassigned (Available)</option>
              {teams.map((t) => (
                <option key={t.id} value={t.name}>
                  {t.name}
                </option>
              ))}
            </select>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 text-[#0A0A0A] focus:border-[#2563EB] focus:outline-none"
            >
              <option value="all">All Roles</option>
              <option value="Student">Students Only</option>
              <option value="Team Lead">Team Leads</option>
              <option value="Mentor">Mentors</option>
              <option value="Faculty">Faculty</option>
            </select>

            {/* Branch Filter */}
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 text-[#0A0A0A] focus:border-[#2563EB] focus:outline-none"
            >
              <option value="all">All Branches</option>
              <option value="CSE">CSE</option>
              <option value="ECE">ECE</option>
              <option value="IT">IT</option>
              <option value="EE">EE</option>
              <option value="ME">ME</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        {filteredStudents.length === 0 ? (
          <div className="p-12 text-center text-[#6B7280] text-[14px]">
            No students found matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F8F9FA] text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider">
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Roll No & Email</th>
                  <th className="py-3.5 px-4">Batch</th>
                  <th className="py-3.5 px-4">Assigned Team</th>
                  <th className="py-3.5 px-4">Role Designation</th>
                  <th className="py-3.5 px-4">Credentials</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB] text-[14px]">
                {filteredStudents.map((student, idx) => {
                  const currentRole = student.role || (student.isTeamLead ? 'Team Lead' : 'Student');
                  const isUnassigned = !student.teamName || student.teamName === 'Unassigned';

                  return (
                    <tr
                      key={student.id}
                      className={`transition-colors ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-[#F8F9FA]'
                      } hover:bg-[#F1F3F5]`}
                    >
                      {/* Student Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <MemberAvatar
                            name={student.name}
                            photoUrl={student.photoUrl}
                            size="md"
                            isLead={currentRole === 'Team Lead'}
                          />
                          <div>
                            <div className="font-semibold text-[#0A0A0A] flex items-center gap-1.5">
                              {student.name}
                              {currentRole === 'Team Lead' && (
                                <span className="text-[10px] font-bold bg-[#2563EB] text-white px-1.5 py-0.2 rounded tracking-wide">
                                  LEAD
                                </span>
                              )}
                            </div>
                            <div className="text-[12px] text-[#6B7280] line-clamp-1">
                              {student.domain || 'IoT & Embedded'} • {student.year || '3rd Year'} ({student.branch || 'CSE'})
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Roll No & Email */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-[13px] text-[#0A0A0A]">{student.rollNo}</div>
                        <div className="text-[12px] text-[#6B7280]">{student.email}</div>
                      </td>

                      {/* Batch */}
                      <td className="py-3.5 px-4 text-[13px]">
                        <span className="px-2 py-0.5 rounded border border-[#E5E7EB] bg-white text-[#0A0A0A] font-medium whitespace-nowrap">
                          Batch {student.batchYear}
                        </span>
                      </td>

                      {/* Team */}
                      <td className="py-3.5 px-4">
                        {isUnassigned ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[12px] font-medium bg-gray-100 text-gray-700 border border-gray-200">
                            Unassigned (Available)
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[12px] font-semibold bg-blue-50 text-[#2563EB] border border-blue-200">
                            {student.teamName}
                          </span>
                        )}
                      </td>

                      {/* Role Selector Dropdown */}
                      <td className="py-3.5 px-4">
                        <select
                          value={currentRole}
                          onChange={(e) => {
                            const newRole = e.target.value as 'Student' | 'Team Lead' | 'Mentor' | 'Faculty';
                            updateStudentRole(student.id, newRole);
                            setBannerNotice(`Updated role for ${student.name} to "${newRole}".`);
                            setTimeout(() => setBannerNotice(null), 3000);
                          }}
                          className={`text-[12px] font-semibold rounded-md px-2 py-1 border transition-colors focus:outline-none ${
                            currentRole === 'Team Lead'
                              ? 'bg-blue-600 text-white border-blue-700'
                              : currentRole === 'Mentor'
                              ? 'bg-purple-50 text-purple-700 border-purple-300'
                              : currentRole === 'Faculty'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <option value="Student">Student</option>
                          <option value="Team Lead">Team Lead</option>
                          <option value="Mentor">Mentor</option>
                          <option value="Faculty">Faculty</option>
                        </select>
                      </td>

                      {/* Credentials Status */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => setCredModalStudent(student)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[#E5E7EB] bg-white text-[12px] font-medium text-[#0A0A0A] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors"
                        >
                          <KeyRound className="w-3.5 h-3.5 text-[#2563EB]" />
                          <span>Credentials</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1 justify-end">
                          <Link
                            href={`/admin/students/new?id=${student.id}`}
                            className="p-1.5 rounded text-[#6B7280] hover:text-[#0A0A0A] hover:bg-[#E5E7EB] transition-colors"
                            title="Edit Student Record"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => {
                              if (confirm(`Remove ${student.name} from the lab roster?`)) {
                                deleteIntern(student.id);
                              }
                            }}
                            className="p-1.5 rounded text-[#EF4444] hover:bg-[#FEE2E2] transition-colors"
                            title="Delete Student"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ======================= REGISTER STUDENT MODAL ======================= */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Register New Student"
        subtitle="Enroll student into the research lab CRM, assign cohort & auto-issue login credentials."
        icon={<UserPlus className="w-5 h-5 text-white" />}
        maxWidth="2xl"
      >
        <form onSubmit={handleCreateStudent} className="space-y-5 text-left">
          
          {/* Section 1: Student Identity & Photo */}
          <div className="bg-slate-50/70 border border-slate-200/70 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-200/60">
              <span className="w-6 h-6 rounded-lg bg-blue-100/80 text-blue-700 flex items-center justify-center text-[12px] font-bold">1</span>
              <h4 className="text-[13px] font-bold uppercase tracking-wider text-slate-700">
                Personal & Academic Identity
              </h4>
            </div>

            {/* Photo Upload Row */}
            <div className="flex flex-col sm:flex-row items-center gap-4 p-3 bg-white rounded-xl border border-slate-200">
              <div className="relative w-16 h-16 rounded-full overflow-hidden bg-slate-100 border-2 border-blue-200 shrink-0 flex items-center justify-center">
                {photoUrl ? (
                  <img src={photoUrl} alt="Student Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-slate-400" />
                )}
                {isUploadingPhoto && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  </div>
                )}
              </div>

              <div className="flex-1 text-center sm:text-left space-y-1">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span className="text-[13px] font-semibold text-slate-900">Student Profile Photo</span>
                  {photoUrl && (
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      ✓ Photo Uploaded
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500">
                  Upload portrait photo (PNG, JPG, WebP) for student ID & team roster cards.
                </p>
                <div className="pt-1 flex items-center justify-center sm:justify-start gap-2">
                  <input
                    type="file"
                    ref={photoInputRef}
                    onChange={(e) => handlePhotoUpload(e, false)}
                    accept="image/*"
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => photoInputRef.current?.click()}
                    disabled={isUploadingPhoto}
                    icon={isUploadingPhoto ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
                  >
                    {isUploadingPhoto ? 'Uploading...' : photoUrl ? 'Change Photo' : 'Upload Student Photo'}
                  </Button>
                  {photoUrl && (
                    <button
                      type="button"
                      onClick={() => setPhotoUrl('')}
                      className="text-[11px] text-red-500 hover:text-red-700 font-semibold"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="block text-[13px] font-semibold text-slate-800">
                  Student Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="e.g. Siddharth Rao"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (!email) {
                        setEmail(`${e.target.value.toLowerCase().replace(/\s+/g, '.')}@kiet.edu`);
                      }
                    }}
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-3 focus:ring-blue-500/15 transition-all shadow-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[13px] font-semibold text-slate-800">
                  University Roll Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Hash className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="e.g. 2300290100099"
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value)}
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-[14px] text-slate-900 font-mono placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-3 focus:ring-blue-500/15 transition-all shadow-xs"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="block text-[13px] font-semibold text-slate-800">
                  Official Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    placeholder="e.g. siddharth.rao@kiet.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-3 focus:ring-blue-500/15 transition-all shadow-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[13px] font-semibold text-slate-800">
                  Academic Year
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-[14px] text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-3 focus:ring-blue-500/15 transition-all shadow-xs"
                  >
                    <option value="1st Year">1st Year (Freshman)</option>
                    <option value="2nd Year">2nd Year (Sophomore)</option>
                    <option value="3rd Year">3rd Year (Junior Intern)</option>
                    <option value="4th Year">4th Year (Senior Lead)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Cohort & Lab Placement */}
          <div className="bg-slate-50/70 border border-slate-200/70 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-200/60">
              <span className="w-6 h-6 rounded-lg bg-indigo-100/80 text-indigo-700 flex items-center justify-center text-[12px] font-bold">2</span>
              <h4 className="text-[13px] font-bold uppercase tracking-wider text-slate-700">
                Department & Cohort Allocation
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="block text-[13px] font-semibold text-slate-800">
                  Engineering Branch
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-[14px] text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-3 focus:ring-blue-500/15 transition-all shadow-xs"
                  >
                    <option value="CSE">CSE (Computer Science & Engg)</option>
                    <option value="ECE">ECE (Electronics & Comm)</option>
                    <option value="IT">IT (Information Technology)</option>
                    <option value="EE">EE (Electrical Engg)</option>
                    <option value="ME">ME (Mechanical Engg)</option>
                    <option value="AI&ML">AI & ML (Artificial Intelligence)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[13px] font-semibold text-slate-800">
                  Batch Cohort
                </label>
                <div className="relative">
                  <Layers className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={batchYear}
                    onChange={(e) => setBatchYear(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-[14px] text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-3 focus:ring-blue-500/15 transition-all shadow-xs"
                  >
                    {availableBatches.map((b) => (
                      <option key={b.value} value={b.value}>
                        {b.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="block text-[13px] font-semibold text-slate-800">
                  Role Designation
                </label>
                <div className="relative">
                  <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={studentRole}
                    onChange={(e) => setStudentRole(e.target.value as 'Student' | 'Team Lead' | 'Mentor' | 'Faculty')}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-[14px] text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-3 focus:ring-blue-500/15 transition-all shadow-xs"
                  >
                    <option value="Student">Student (Research Intern)</option>
                    <option value="Team Lead">Team Lead</option>
                    <option value="Mentor">Student Mentor</option>
                    <option value="Faculty">Faculty Advisor</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[13px] font-semibold text-slate-800">
                  Initial Team (Optional)
                </label>
                <div className="relative">
                  <Users className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-[14px] text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-3 focus:ring-blue-500/15 transition-all shadow-xs"
                  >
                    <option value="Unassigned">Unassigned (Assign Later)</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.name}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Research Domain & Competency */}
          <div className="bg-slate-50/70 border border-slate-200/70 rounded-2xl p-4 sm:p-5 space-y-3.5">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-200/60">
              <span className="w-6 h-6 rounded-lg bg-emerald-100/80 text-emerald-700 flex items-center justify-center text-[12px] font-bold">3</span>
              <h4 className="text-[13px] font-bold uppercase tracking-wider text-slate-700">
                Research Domain & Specialization
              </h4>
            </div>

            <div className="space-y-2">
              <div className="relative">
                <Cpu className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="e.g. Edge AI, IoT Sensors, Cloud Architecture, Robotics"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-3 focus:ring-blue-500/15 transition-all shadow-xs"
                />
              </div>

              {/* Quick Pick Domain Chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] font-medium text-slate-400 mr-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" /> Quick select:
                </span>
                {[
                  'IoT & Embedded Systems',
                  'Edge AI & Vision',
                  'Smart Mobility',
                  'Green Energy & Solar',
                  'Robotics & Drones',
                  'Cloud & Telemetry'
                ].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setDomain(tag)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                      domain === tag
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Credentials Notice Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50/60 to-blue-50 border border-blue-200/80 flex items-start gap-3.5 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/30 mt-0.5">
              <KeyRound className="w-4 h-4" />
            </div>
            <div className="text-[13px] leading-relaxed">
              <div className="font-semibold text-slate-900 flex items-center gap-2">
                <span>Automatic Credential Issuance</span>
                <span className="font-mono text-[11px] font-bold bg-white text-blue-700 px-2 py-0.5 rounded border border-blue-200 shadow-xs">
                  SCL@XXXX
                </span>
              </div>
              <p className="text-slate-600 mt-0.5 text-[12px]">
                A unique secure temporary access key will be generated. The student will be prompted to configure their password via Firebase Authentication on first login.
              </p>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setCreateModalOpen(false)}
              className="px-5 py-2.5 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100 font-medium"
            >
              Cancel
            </Button>
            <button 
              type="submit" 
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-[14px] shadow-md shadow-blue-500/25 hover:shadow-blue-500/40 active:scale-[0.98] transition-all flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Confirm Registration</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* ======================= EXCEL / CSV BULK IMPORT MODAL ======================= */}
      <Modal
        isOpen={excelModalOpen}
        onClose={() => {
          setExcelModalOpen(false);
          setParsedExcelRows([]);
          setExcelFileName(null);
        }}
        title="Upload Student Roster via Excel / CSV"
        maxWidth="2xl"
      >
        <div className="space-y-5 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-blue-50/60 border border-blue-200">
            <div>
              <p className="text-[14px] font-semibold text-blue-900">
                Bulk Import Students
              </p>
              <p className="text-[12px] text-blue-700 mt-0.5">
                Upload .xlsx, .xls, or .csv containing student details. Columns detected: Name, Roll No, Email, Batch, Branch, Domain, Role, Team Name.
              </p>
            </div>
            <button
              type="button"
              onClick={() => downloadSampleExcelTemplate('general', batchInfos)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-blue-300 text-[12px] font-semibold text-blue-700 hover:bg-blue-50 transition-colors whitespace-nowrap shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Template</span>
            </button>
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
              onChange={handleExcelFileChange}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-full bg-blue-50 text-[#2563EB] flex items-center justify-center mx-auto mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-[15px] font-semibold text-[#0A0A0A]">
              {excelFileName ? `Selected: ${excelFileName}` : 'Click to select Excel (.xlsx, .xls) or CSV'}
            </p>
            <p className="text-[13px] text-[#6B7280] mt-1">
              Supports standard tabular student data exported from Google Sheets, Microsoft Excel, or university ERP.
            </p>
            {isParsingExcel && (
              <p className="text-[13px] text-[#2563EB] font-medium mt-2 animate-pulse">
                Parsing spreadsheet rows...
              </p>
            )}
          </div>

          {/* Preview Table if rows parsed */}
          {parsedExcelRows.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-semibold text-[#0A0A0A]">
                  Ready to enroll: <strong className="text-[#2563EB]">{parsedExcelRows.length}</strong> students
                </span>
                <span className="text-[12px] text-[#6B7280]">
                  Showing preview of first 5 records
                </span>
              </div>

              <div className="max-h-56 overflow-y-auto border border-[#E5E7EB] rounded-lg">
                <table className="w-full text-left text-[12px]">
                  <thead className="bg-[#F8F9FA] border-b border-[#E5E7EB] text-[#6B7280]">
                    <tr>
                      <th className="py-2 px-3">Name</th>
                      <th className="py-2 px-3">Roll No</th>
                      <th className="py-2 px-3">Phone</th>
                      <th className="py-2 px-3">Batch</th>
                      <th className="py-2 px-3">Year</th>
                      <th className="py-2 px-3">Branch</th>
                      <th className="py-2 px-3">Role</th>
                      <th className="py-2 px-3">Team</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB]">
                    {parsedExcelRows.slice(0, 5).map((row, i) => (
                      <tr key={i} className="hover:bg-[#F8F9FA]">
                        <td className="py-2 px-3 font-semibold text-[#0A0A0A]">{row.name}</td>
                        <td className="py-2 px-3 font-mono text-[#6B7280]">{row.rollNo}</td>
                        <td className="py-2 px-3 font-mono text-slate-600">{row.phone || '—'}</td>
                        <td className="py-2 px-3">Batch {row.batchYear || '2026'}</td>
                        <td className="py-2 px-3">{row.year || '3rd Year'}</td>
                        <td className="py-2 px-3">{row.branch || 'CSE'}</td>
                        <td className="py-2 px-3 font-medium text-[#2563EB]">{row.role || 'Student'}</td>
                        <td className="py-2 px-3 text-[#6B7280]">{row.teamName || 'Unassigned'}</td>
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
                setExcelModalOpen(false);
                setParsedExcelRows([]);
                setExcelFileName(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={parsedExcelRows.length === 0}
              onClick={handleConfirmExcelImport}
              className="flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Enroll {parsedExcelRows.length > 0 ? `(${parsedExcelRows.length}) Students` : 'Students'}</span>
            </Button>
          </div>
        </div>
      </Modal>

      {/* ======================= CREDENTIALS & PASSWORD RESET MODAL ======================= */}
      {credModalStudent && (
        <Modal
          isOpen={!!credModalStudent}
          onClose={() => setCredModalStudent(null)}
          title={`Credentials & Access: ${credModalStudent.name}`}
          subtitle="View temporary login access key and manage password reset requirements."
          icon={<KeyRound className="w-5 h-5 text-white" />}
          maxWidth="lg"
        >
          <div className="space-y-5 text-left">
            
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3.5 shadow-xs">
              <div className="flex items-center justify-between text-[13px] pb-2 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Role Designation:</span>
                <span className="font-bold text-slate-900 bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-lg border border-blue-200/70">
                  {credModalStudent.role || (credModalStudent.isTeamLead ? 'Team Lead' : 'Student')}
                </span>
              </div>
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-slate-500">Official Email ID:</span>
                <span className="font-mono text-slate-900 font-semibold">{credModalStudent.email}</span>
              </div>
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-slate-500">University Roll No:</span>
                <span className="font-mono text-slate-900 font-semibold">{credModalStudent.rollNo}</span>
              </div>
              <div className="flex items-center justify-between text-[13px] pt-1 border-t border-slate-200/60">
                <span className="text-slate-500 font-medium">Temporary Password:</span>
                <span className="font-mono font-bold text-blue-600 text-[15px] bg-white px-3 py-1 rounded-xl border border-blue-200 shadow-xs">
                  {credModalStudent.tempPassword || 'SCL@8241'}
                </span>
              </div>
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-slate-500">Security Status:</span>
                <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                  credModalStudent.passwordResetRequired !== false
                    ? 'border-blue-200 text-blue-700 bg-blue-50'
                    : 'border-emerald-200 text-emerald-700 bg-emerald-50'
                }`}>
                  {credModalStudent.passwordResetRequired !== false ? '● Reset Required on 1st Login' : '✓ Password Configured'}
                </span>
              </div>
            </div>

            {/* Actions for credentials */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => handleCopyCredentials(credModalStudent)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-[13px] font-semibold text-white transition-all shadow-sm"
              >
                <Copy className="w-4 h-4" />
                <span>{copiedKey ? '✓ Credentials Copied to Clipboard!' : 'Copy Login Details to Share with Student'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleResetPassword(credModalStudent.id)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 bg-white text-[13px] font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors"
              >
                <RefreshCw className="w-4 h-4 text-blue-600" />
                <span>Generate New Temporary Password</span>
              </button>
            </div>

            <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-xl text-[12px] text-blue-900 flex items-start gap-2.5">
              <KeyRound className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <span>
                When the student logs in to the Student Portal (<span className="font-mono font-medium">/portal</span>) with this temporary password, the system prompts them to verify their account and set their permanent password via Firebase Authentication.
              </span>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setCredModalStudent(null)}>
                Close
              </Button>
            </div>

          </div>
        </Modal>
      )}

      {/* ======================= EDIT STUDENT MODAL ======================= */}
      {editingStudent && (
        <Modal
          isOpen={!!editingStudent}
          onClose={() => setEditingStudent(null)}
          title={`Edit Student: ${editingStudent.name}`}
          subtitle="Update student roster records, modify lab placement or re-assign batch."
          icon={<Edit3 className="w-5 h-5 text-white" />}
          maxWidth="2xl"
        >
          <form onSubmit={handleSaveEdit} className="space-y-5 text-left">
            
            {/* Section 1: Student Identity & Photo */}
            <div className="bg-slate-50/70 border border-slate-200/70 rounded-2xl p-4 sm:p-5 space-y-4">
              <div className="flex items-center gap-2 pb-1 border-b border-slate-200/60">
                <span className="w-6 h-6 rounded-lg bg-blue-100/80 text-blue-700 flex items-center justify-center text-[12px] font-bold">1</span>
                <h4 className="text-[13px] font-bold uppercase tracking-wider text-slate-700">
                  Student Identity & Profile Photo
                </h4>
              </div>

              {/* Photo Upload Row */}
              <div className="flex flex-col sm:flex-row items-center gap-4 p-3 bg-white rounded-xl border border-slate-200">
                <div className="relative w-16 h-16 rounded-full overflow-hidden bg-slate-100 border-2 border-blue-200 shrink-0 flex items-center justify-center">
                  {editingStudent.photoUrl ? (
                    <img src={editingStudent.photoUrl} alt="Student Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-slate-400" />
                  )}
                  {isUploadingEditPhoto && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    </div>
                  )}
                </div>

                <div className="flex-1 text-center sm:text-left space-y-1">
                  <span className="text-[13px] font-semibold text-slate-900 block">Student Profile Photo</span>
                  <p className="text-[11px] text-slate-500">
                    Update student portrait photo for cards and team rosters.
                  </p>
                  <div className="pt-1 flex items-center justify-center sm:justify-start gap-2">
                    <input
                      type="file"
                      ref={editPhotoInputRef}
                      onChange={(e) => handlePhotoUpload(e, true)}
                      accept="image/*"
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => editPhotoInputRef.current?.click()}
                      disabled={isUploadingEditPhoto}
                      icon={isUploadingEditPhoto ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
                    >
                      {isUploadingEditPhoto ? 'Uploading...' : editingStudent.photoUrl ? 'Change Photo' : 'Upload Photo'}
                    </Button>
                    {editingStudent.photoUrl && (
                      <button
                        type="button"
                        onClick={() => setEditingStudent({ ...editingStudent, photoUrl: undefined })}
                        className="text-[11px] text-red-500 hover:text-red-700 font-semibold"
                      >
                        Remove Photo
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="block text-[13px] font-semibold text-slate-800">Student Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={editingStudent.name}
                      onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                      required
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-[14px] text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-3 focus:ring-blue-500/15 transition-all shadow-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[13px] font-semibold text-slate-800">University Roll Number</label>
                  <div className="relative">
                    <Hash className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={editingStudent.rollNo}
                      onChange={(e) => setEditingStudent({ ...editingStudent, rollNo: e.target.value })}
                      required
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-[14px] text-slate-900 font-mono focus:outline-none focus:border-blue-600 focus:ring-3 focus:ring-blue-500/15 transition-all shadow-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="block text-[13px] font-semibold text-slate-800">Official Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      value={editingStudent.email}
                      onChange={(e) => setEditingStudent({ ...editingStudent, email: e.target.value })}
                      required
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-[14px] text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-3 focus:ring-blue-500/15 transition-all shadow-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[13px] font-semibold text-slate-800">Academic Year</label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      value={editingStudent.year || '3rd Year'}
                      onChange={(e) => setEditingStudent({ ...editingStudent, year: e.target.value })}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-[14px] text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-3 focus:ring-blue-500/15 transition-all shadow-xs"
                    >
                      <option value="1st Year">1st Year (Freshman)</option>
                      <option value="2nd Year">2nd Year (Sophomore)</option>
                      <option value="3rd Year">3rd Year (Junior Intern)</option>
                      <option value="4th Year">4th Year (Senior Lead)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Department & Allocation */}
            <div className="bg-slate-50/70 border border-slate-200/70 rounded-2xl p-4 sm:p-5 space-y-4">
              <div className="flex items-center gap-2 pb-1 border-b border-slate-200/60">
                <span className="w-6 h-6 rounded-lg bg-indigo-100/80 text-indigo-700 flex items-center justify-center text-[12px] font-bold">2</span>
                <h4 className="text-[13px] font-bold uppercase tracking-wider text-slate-700">
                  Cohort & Team Allocation
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="block text-[13px] font-semibold text-slate-800">Engineering Branch</label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      value={editingStudent.branch || 'CSE'}
                      onChange={(e) => setEditingStudent({ ...editingStudent, branch: e.target.value })}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-[14px] text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-3 focus:ring-blue-500/15 transition-all shadow-xs"
                    >
                      <option value="CSE">CSE (Computer Science & Engg)</option>
                      <option value="ECE">ECE (Electronics & Comm)</option>
                      <option value="IT">IT (Information Technology)</option>
                      <option value="EE">EE (Electrical Engg)</option>
                      <option value="ME">ME (Mechanical Engg)</option>
                      <option value="AI&ML">AI & ML (Artificial Intelligence)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[13px] font-semibold text-slate-800">Batch Cohort</label>
                  <div className="relative">
                    <Layers className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      value={editingStudent.batchYear}
                      onChange={(e) => setEditingStudent({ ...editingStudent, batchYear: e.target.value })}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-[14px] text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-3 focus:ring-blue-500/15 transition-all shadow-xs"
                    >
                      {availableBatches.map((b) => (
                        <option key={b.value} value={b.value}>
                          {b.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="block text-[13px] font-semibold text-slate-800">Role Designation</label>
                  <div className="relative">
                    <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      value={editingStudent.role || (editingStudent.isTeamLead ? 'Team Lead' : 'Student')}
                      onChange={(e) => {
                        const newRole = e.target.value as 'Student' | 'Team Lead' | 'Mentor' | 'Faculty';
                        setEditingStudent({ 
                          ...editingStudent, 
                          role: newRole,
                          isTeamLead: newRole === 'Team Lead',
                        });
                      }}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-[14px] text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-3 focus:ring-blue-500/15 transition-all shadow-xs"
                    >
                      <option value="Student">Student (Research Intern)</option>
                      <option value="Team Lead">Team Lead</option>
                      <option value="Mentor">Student Mentor</option>
                      <option value="Faculty">Faculty Advisor</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[13px] font-semibold text-slate-800">Assigned Team</label>
                  <div className="relative">
                    <Users className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      value={editingStudent.teamName || 'Unassigned'}
                      onChange={(e) => setEditingStudent({ ...editingStudent, teamName: e.target.value })}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-[14px] text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-3 focus:ring-blue-500/15 transition-all shadow-xs"
                    >
                      <option value="Unassigned">Unassigned (Available)</option>
                      {teams.map((t) => (
                        <option key={t.id} value={t.name}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Domain & Specialization */}
            <div className="bg-slate-50/70 border border-slate-200/70 rounded-2xl p-4 sm:p-5 space-y-3.5">
              <div className="flex items-center gap-2 pb-1 border-b border-slate-200/60">
                <span className="w-6 h-6 rounded-lg bg-emerald-100/80 text-emerald-700 flex items-center justify-center text-[12px] font-bold">3</span>
                <h4 className="text-[13px] font-bold uppercase tracking-wider text-slate-700">
                  Research Domain & Competency
                </h4>
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <Cpu className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={editingStudent.domain || ''}
                    onChange={(e) => setEditingStudent({ ...editingStudent, domain: e.target.value })}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-3 focus:ring-blue-500/15 transition-all shadow-xs"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] font-medium text-slate-400 mr-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" /> Quick select:
                  </span>
                  {[
                    'IoT & Embedded Systems',
                    'Edge AI & Vision',
                    'Smart Mobility',
                    'Green Energy & Solar',
                    'Robotics & Drones',
                    'Cloud & Telemetry'
                  ].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setEditingStudent({ ...editingStudent, domain: tag })}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                        editingStudent.domain === tag
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setEditingStudent(null)}
                className="px-5 py-2.5 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100 font-medium"
              >
                Cancel
              </Button>
              <button 
                type="submit" 
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-[14px] shadow-md shadow-blue-500/25 hover:shadow-blue-500/40 active:scale-[0.98] transition-all flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
}
