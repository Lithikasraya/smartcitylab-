'use client';

import React, { useState, useRef } from 'react';
import Card from '@/components/shared/Card';
import Button from '@/components/shared/Button';
import { Input, Textarea } from '@/components/shared/Input';
import Modal from '@/components/shared/Modal';
import MemberAvatar from '@/components/shared/MemberAvatar';
import { usePortalStore } from '@/lib/store';
import { BatchInfo, BatchMember, LabInnovator } from '@/lib/data';
import { parseExcelOrCsv, downloadSampleExcelTemplate, ParsedStudentRow } from '@/lib/excelHelper';
import { 
  Layers, 
  Users, 
  GraduationCap, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Calendar, 
  ShieldCheck, 
  Sparkles,
  FileSpreadsheet,
  FileText,
  Upload,
  Download,
  Check,
  UserPlus,
  Search,
  BookOpen
} from 'lucide-react';

export default function AdminBatchesPage() {
  const { 
    batchInfos, 
    batches, 
    innovators,
    addBatch, 
    updateBatch, 
    deleteBatch, 
    addStudentToCRM,
    addStudentsBulk,
    assignStudentsToBatch,
    addBatchFile,
    assignBatchMentor,
    addFaculty,
    updateFaculty,
    deleteFaculty
  } = usePortalStore();

  const [activeMainTab, setActiveMainTab] = useState<'cohorts' | 'faculty'>('cohorts');
  const [selectedBatchYear, setSelectedBatchYear] = useState<string>('2026');
  
  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<BatchInfo | null>(null);
  const [addStudentModalOpen, setAddStudentModalOpen] = useState(false);
  const [assignExistingModalOpen, setAssignExistingModalOpen] = useState(false);
  const [uploadExcelModalOpen, setUploadExcelModalOpen] = useState(false);
  const [uploadPdfModalOpen, setUploadPdfModalOpen] = useState(false);
  const [addFacultyModalOpen, setAddFacultyModalOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<LabInnovator | null>(null);

  const [notification, setNotification] = useState<string | null>(null);

  // New Batch Form State
  const [name, setName] = useState('');
  const [year, setYear] = useState('2027');
  const [academicSession, setAcademicSession] = useState('2026-2027 Academic Cohort');
  const [status, setStatus] = useState<BatchInfo['status']>('upcoming');
  const [mentorLead, setMentorLead] = useState('Dr. Vivek Upadhyay');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('August 2026');
  const [endDate, setEndDate] = useState('June 2027');

  // Add Single Student to Selected Batch State
  const [studentName, setStudentName] = useState('');
  const [studentRoll, setStudentRoll] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentYear, setStudentYear] = useState('3rd Year');
  const [studentBranch, setStudentBranch] = useState('CSE');
  const [studentDomain, setStudentDomain] = useState('IoT & Embedded Systems');
  const [studentRole, setStudentRole] = useState<'Student' | 'Team Lead' | 'Mentor' | 'Faculty'>('Student');

  // Assign Existing Students State
  const [existingSearchQuery, setExistingSearchQuery] = useState('');
  const [selectedExistingIds, setSelectedExistingIds] = useState<string[]>([]);

  // Excel / CSV Upload State for Batch
  const [excelFileName, setExcelFileName] = useState<string | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedStudentRow[]>([]);
  const [isParsingExcel, setIsParsingExcel] = useState(false);
  const excelInputRef = useRef<HTMLInputElement>(null);

  // PDF Upload State for Batch
  const [pdfFileName, setPdfFileName] = useState<string | null>(null);
  const [pdfFileSize, setPdfFileSize] = useState<string>('1.2 MB');
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // Faculty Form State
  const [facName, setFacName] = useState('');
  const [facDesignation, setFacDesignation] = useState('');
  const [facDepartment, setFacDepartment] = useState('Smart City Lab');
  const [facPhotoUrl, setFacPhotoUrl] = useState('');
  const [facBio, setFacBio] = useState('');

  // Active batch object
  const activeBatch = batchInfos.find((b) => b.year === selectedBatchYear) || batchInfos[0];

  // Students belonging to the active batch
  const batchStudents = batches.filter((s) => s.batchYear === (activeBatch?.year || selectedBatchYear));

  // Students not currently in active batch
  const nonBatchStudents = batches.filter((s) => s.batchYear !== (activeBatch?.year || selectedBatchYear));

  const filteredNonBatchStudents = nonBatchStudents.filter((s) => {
    const q = existingSearchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      s.name.toLowerCase().includes(q) ||
      s.rollNo.toLowerCase().includes(q) ||
      (s.teamName && s.teamName.toLowerCase().includes(q)) ||
      (s.batchYear && s.batchYear.toLowerCase().includes(q)) ||
      (s.domain && s.domain.toLowerCase().includes(q))
    );
  });

  // Handlers
  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !year) return;

    const created = addBatch({
      name,
      year,
      academicSession,
      status,
      mentorLead,
      description,
      startDate,
      endDate,
      uploadedFiles: [],
    });

    setCreateModalOpen(false);
    setSelectedBatchYear(created.year);
    setName('');
    setDescription('');
    setNotification(`New cohort "${created.name}" created successfully.`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSaveEditBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBatch) return;

    updateBatch(editingBatch.id, {
      name: editingBatch.name,
      year: editingBatch.year,
      academicSession: editingBatch.academicSession,
      status: editingBatch.status,
      mentorLead: editingBatch.mentorLead,
      description: editingBatch.description,
      startDate: editingBatch.startDate,
      endDate: editingBatch.endDate,
    });

    setNotification(`Batch "${editingBatch.name}" updated.`);
    setEditingBatch(null);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleAddStudentToBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !studentRoll) return;

    addStudentToCRM({
      name: studentName,
      rollNo: studentRoll,
      email: studentEmail || `${studentName.toLowerCase().replace(/\s+/g, '.')}@kiet.edu`,
      year: studentYear,
      branch: studentBranch,
      batchYear: activeBatch?.year || '2026',
      teamName: 'Unassigned',
      domain: studentDomain,
      role: studentRole,
      isTeamLead: studentRole === 'Team Lead',
    });

    setAddStudentModalOpen(false);
    setStudentName('');
    setStudentRoll('');
    setStudentEmail('');
    setStudentRole('Student');
    setNotification(`Enrolled student "${studentName}" into ${activeBatch?.name || 'Batch'}.`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleConfirmAssignExisting = () => {
    if (selectedExistingIds.length === 0 || !activeBatch) return;
    assignStudentsToBatch(selectedExistingIds, activeBatch.year);
    setNotification(`Assigned ${selectedExistingIds.length} student(s) to ${activeBatch.name}.`);
    setAssignExistingModalOpen(false);
    setSelectedExistingIds([]);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleExcelFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsParsingExcel(true);
    try {
      const rows = await parseExcelOrCsv(file);
      setParsedRows(rows);
      setExcelFileName(file.name);
    } catch (err: any) {
      alert('Failed to parse Excel: ' + (err?.message || 'Invalid format'));
    } finally {
      setIsParsingExcel(false);
    }
  };

  const handleConfirmExcelImport = () => {
    if (parsedRows.length === 0 || !activeBatch) return;

    // Stamp batchYear on all parsed rows
    const rowsWithBatch = parsedRows.map((r) => ({
      ...r,
      batchYear: activeBatch.year,
      teamName: r.teamName || 'Unassigned',
    }));

    addStudentsBulk(rowsWithBatch);

    // Record file in batch
    addBatchFile(activeBatch.id, {
      name: excelFileName || 'student_roster.xlsx',
      type: 'excel',
      size: `${Math.round((parsedRows.length * 150) / 1024)} KB`,
      rowCount: parsedRows.length,
    });

    setNotification(`Successfully imported and enrolled ${parsedRows.length} students into ${activeBatch.name}.`);
    setUploadExcelModalOpen(false);
    setParsedRows([]);
    setExcelFileName(null);
    if (excelInputRef.current) excelInputRef.current.value = '';
    setTimeout(() => setNotification(null), 5000);
  };

  const handlePdfUploadConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBatch || !pdfFileName) return;

    addBatchFile(activeBatch.id, {
      name: pdfFileName,
      type: 'pdf',
      size: pdfFileSize,
    });

    setNotification(`PDF document "${pdfFileName}" attached to ${activeBatch.name}.`);
    setUploadPdfModalOpen(false);
    setPdfFileName(null);
    if (pdfInputRef.current) pdfInputRef.current.value = '';
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSaveFaculty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!facName) return;

    if (editingFaculty) {
      updateFaculty(editingFaculty.id, {
        name: facName,
        designation: facDesignation,
        department: facDepartment,
        photoUrl: facPhotoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(facName)}&background=2563EB&color=fff&size=128`,
        bio: facBio,
      });
      setNotification(`Faculty "${facName}" updated.`);
      setEditingFaculty(null);
    } else {
      addFaculty({
        name: facName,
        designation: facDesignation || 'Faculty Mentor',
        department: facDepartment || 'Smart City Lab',
        photoUrl: facPhotoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(facName)}&background=2563EB&color=fff&size=128`,
        bio: facBio,
      });
      setNotification(`Faculty mentor "${facName}" added to directory.`);
      setAddFacultyModalOpen(false);
    }

    setFacName('');
    setFacDesignation('');
    setFacDepartment('Smart City Lab');
    setFacPhotoUrl('');
    setFacBio('');
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="space-y-8 text-left font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E5E7EB]">
        <div>
          <h1 className="text-[28px] sm:text-[32px] font-bold text-[#0A0A0A] tracking-tight">
            Batches & Faculty Management
          </h1>
          <p className="text-[14px] text-[#6B7280] mt-1">
            Configure student cohorts, upload batch-specific Excel rosters or PDF charters, and manage faculty mentors.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeMainTab === 'cohorts' ? (
            <Button 
              variant="primary" 
              size="md" 
              onClick={() => {
                setName(`Batch ${new Date().getFullYear() + 1}`);
                setYear(String(new Date().getFullYear() + 1));
                setCreateModalOpen(true);
              }}
              className="shadow-sm shadow-blue-600/30 hover:shadow-md hover:shadow-blue-600/40"
            >
              + Create New Batch
            </Button>
          ) : (
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                setEditingFaculty(null);
                setFacName('');
                setFacDesignation('');
                setFacDepartment('Smart City Lab');
                setFacPhotoUrl('');
                setFacBio('');
                setAddFacultyModalOpen(true);
              }}
              className="shadow-sm shadow-blue-600/30 hover:shadow-md hover:shadow-blue-600/40"
            >
              + Add Faculty / Mentor
            </Button>
          )}
        </div>
      </div>

      {notification && (
        <div className="p-4 rounded-lg bg-[#F8F9FA] border border-[#2563EB] text-[14px] text-[#0A0A0A] flex items-center justify-between gap-2 animate-fadeIn">
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

      {/* Main Section Navigation Tabs */}
      <div className="flex border-b border-[#E5E7EB] gap-6 text-[15px] font-semibold">
        <button
          onClick={() => setActiveMainTab('cohorts')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeMainTab === 'cohorts'
              ? 'border-[#2563EB] text-[#2563EB]'
              : 'border-transparent text-[#6B7280] hover:text-[#0A0A0A]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Student Cohorts & Batches ({batchInfos.length})</span>
        </button>

        <button
          onClick={() => setActiveMainTab('faculty')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeMainTab === 'faculty'
              ? 'border-[#2563EB] text-[#2563EB]'
              : 'border-transparent text-[#6B7280] hover:text-[#0A0A0A]'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Faculty Mentors & Leaders ({innovators.length})</span>
        </button>
      </div>

      {activeMainTab === 'cohorts' ? (
        <div className="space-y-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Card className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[24px] font-bold text-[#0A0A0A]">{batchInfos.length}</div>
                <div className="text-[13px] text-[#6B7280]">Total Cohorts</div>
              </div>
            </Card>

            <Card className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[24px] font-bold text-[#0A0A0A]">
                  {batches.filter((b) => b.batchYear === '2026').length}
                </div>
                <div className="text-[13px] text-[#6B7280]">Batch 2026 Interns</div>
              </div>
            </Card>

            <Card className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[24px] font-bold text-[#0A0A0A]">
                  {batches.filter((b) => b.isTeamLead || b.role === 'Team Lead').length}
                </div>
                <div className="text-[13px] text-[#6B7280]">Designated Team Leads</div>
              </div>
            </Card>

            <Card className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gray-50 text-[#6B7280] flex items-center justify-center font-bold">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[24px] font-bold text-[#0A0A0A]">{batches.length}</div>
                <div className="text-[13px] text-[#6B7280]">Total Registered Interns</div>
              </div>
            </Card>
          </div>

          {/* Cohorts Tabs / Selector */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[18px] font-bold text-[#0A0A0A]">Select Batch Cohort:</h2>
              <span className="text-[13px] text-[#6B7280]">
                Click any batch to inspect membership, upload batch Excel/PDF, and assign students
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {batchInfos.map((b) => {
                const isSelected = (activeBatch?.id === b.id) || (selectedBatchYear === b.year);
                const count = batches.filter((s) => s.batchYear === b.year).length;

                return (
                  <div
                    key={b.id}
                    onClick={() => setSelectedBatchYear(b.year)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer text-left flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#2563EB] bg-blue-50/40 shadow-sm ring-1 ring-[#2563EB]'
                        : 'border-[#E5E7EB] bg-white hover:border-[#0A0A0A]'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[18px] font-bold text-[#0A0A0A]">{b.name}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${
                            b.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : b.status === 'upcoming'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-gray-100 text-gray-700 border-gray-200'
                          }`}
                        >
                          {b.status}
                        </span>
                      </div>

                      <p className="text-[13px] text-[#6B7280] font-medium">{b.academicSession}</p>
                      
                      {b.description && (
                        <p className="text-[13px] text-[#4B5563] line-clamp-2 leading-relaxed">
                          {b.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-4 mt-4 border-t border-[#E5E7EB] flex items-center justify-between text-[12px]">
                      <span className="font-semibold text-[#2563EB] flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" />
                        {count} Students Enrolled
                      </span>

                      <div className="inline-flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setEditingBatch(b)}
                          className="p-1.5 rounded text-[#6B7280] hover:text-[#0A0A0A] hover:bg-[#E5E7EB] transition-colors"
                          title="Edit Batch Info"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        {batchInfos.length > 1 && (
                          <button
                            onClick={() => {
                              if (confirm(`Delete ${b.name}?`)) {
                                deleteBatch(b.id);
                              }
                            }}
                            className="p-1.5 rounded text-[#EF4444] hover:bg-red-50 transition-colors"
                            title="Delete Batch"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Batch Details & Students Roster */}
          {activeBatch && (
            <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-sm text-left">
              {/* Header of Active Batch */}
              <div className="p-6 border-b border-[#E5E7EB] bg-[#F8F9FA] space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-[22px] font-bold text-[#0A0A0A]">
                        {activeBatch.name} Dashboard
                      </h3>
                      <span className="text-[12px] font-semibold px-2.5 py-0.5 rounded-full bg-white border border-[#E5E7EB] text-[#2563EB]">
                        {batchStudents.length} Students Enrolled
                      </span>
                    </div>
                    <p className="text-[13px] text-[#6B7280] mt-1">
                      Academic Session: <strong className="text-[#0A0A0A]">{activeBatch.academicSession}</strong> • Common Faculty Mentor:{' '}
                      <strong className="text-[#0A0A0A]">{activeBatch.mentorLead || 'Dr. Vivek Upadhyay'}</strong>
                    </p>
                  </div>

                  {/* Batch Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setUploadExcelModalOpen(true)}
                      className="flex items-center gap-1.5 border-[#2563EB] text-[#2563EB] bg-white hover:bg-blue-50"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>Upload Batch Excel</span>
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setUploadPdfModalOpen(true)}
                      className="flex items-center gap-1.5 border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Attach PDF Charter</span>
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedExistingIds([]);
                        setExistingSearchQuery('');
                        setAssignExistingModalOpen(true);
                      }}
                      className="flex items-center gap-1.5"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Assign Existing Students</span>
                    </Button>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setAddStudentModalOpen(true)}
                    >
                      + Enroll New Student
                    </Button>
                  </div>
                </div>

                {/* Common Mentor Selector */}
                <div className="p-3.5 rounded-xl bg-white border border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[13px]">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-[#2563EB]" />
                    <span className="text-[#6B7280]">Assigned Cohort Mentor:</span>
                    <strong className="text-[#0A0A0A]">{activeBatch.mentorLead || 'None Assigned'}</strong>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[#6B7280]">Change Mentor:</span>
                    <select
                      value={activeBatch.mentorLead || ''}
                      onChange={(e) => {
                        assignBatchMentor(activeBatch.id, e.target.value);
                        setNotification(`Updated mentor for ${activeBatch.name} to "${e.target.value}".`);
                        setTimeout(() => setNotification(null), 3000);
                      }}
                      className="rounded-lg border border-[#E5E7EB] bg-[#F8F9FA] px-3 py-1.5 text-[12px] text-[#0A0A0A] focus:outline-none focus:border-[#2563EB]"
                    >
                      {innovators.map((mentor) => (
                        <option key={mentor.id} value={mentor.name}>
                          {mentor.name} ({mentor.designation})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Uploaded Files for this Batch */}
                {activeBatch.uploadedFiles && activeBatch.uploadedFiles.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <span className="text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider">
                      Batch Documents & Spreadsheet Rosters:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {activeBatch.uploadedFiles.map((file, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#E5E7EB] bg-white text-[12px] shadow-xs"
                        >
                          {file.type === 'excel' ? (
                            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <FileText className="w-3.5 h-3.5 text-rose-600" />
                          )}
                          <span className="font-medium text-[#0A0A0A]">{file.name}</span>
                          <span className="text-[#6B7280]">({file.size || 'Spreadsheet'})</span>
                          <span className="text-[10px] text-gray-400">• {file.uploadedAt}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Students Table for Selected Batch */}
              {batchStudents.length === 0 ? (
                <div className="p-16 text-center text-[#6B7280] text-[14px] space-y-3">
                  <Users className="w-10 h-10 text-gray-300 mx-auto" />
                  <p className="font-semibold text-[#0A0A0A]">
                    No students currently enrolled in {activeBatch.name}.
                  </p>
                  <p className="text-[13px] text-[#6B7280] max-w-md mx-auto">
                    You can bulk import an Excel roster, assign existing students from other cohorts, or register a new student using the buttons above.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#E5E7EB] bg-[#F8F9FA] text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider">
                        <th className="py-3.5 px-4">Student</th>
                        <th className="py-3.5 px-4">Roll No & Email</th>
                        <th className="py-3.5 px-4">Year & Branch</th>
                        <th className="py-3.5 px-4">Assigned Team</th>
                        <th className="py-3.5 px-4">Role & Domain</th>
                        <th className="py-3.5 px-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E7EB] text-[14px]">
                      {batchStudents.map((s, idx) => (
                        <tr
                          key={s.id}
                          className={`transition-colors ${
                            idx % 2 === 0 ? 'bg-white' : 'bg-[#F8F9FA]'
                          } hover:bg-[#F1F3F5]`}
                        >
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <MemberAvatar
                                name={s.name}
                                photoUrl={s.photoUrl}
                                size="md"
                                isLead={!!s.isTeamLead}
                              />
                              <div>
                                <div className="font-semibold text-[#0A0A0A] flex items-center gap-1.5">
                                  {s.name}
                                  {s.isTeamLead && (
                                    <span className="text-[10px] font-bold bg-[#2563EB] text-white px-1.5 py-0.2 rounded tracking-wide">
                                      LEAD
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-[#6B7280]">
                                  {s.role || (s.isTeamLead ? 'Team Lead' : 'Student')}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-mono text-[13px] text-[#0A0A0A]">{s.rollNo}</div>
                            <div className="text-[12px] text-[#6B7280]">{s.email}</div>
                          </td>

                          <td className="py-3.5 px-4 text-[13px]">
                            <span className="font-medium text-[#0A0A0A]">{s.year || '3rd Year'}</span>
                            <span className="text-[#6B7280] ml-1.5">({s.branch || 'CSE'})</span>
                          </td>

                          <td className="py-3.5 px-4">
                            {s.teamName && s.teamName !== 'Unassigned' ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-semibold bg-blue-50/70 border border-blue-200 text-[#2563EB]">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
                                {s.teamName}
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[12px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                Unassigned
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-[13px] text-[#4B5563]">
                            {s.domain}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <span className="capitalize text-[12px] px-2.5 py-0.5 rounded-full font-medium border border-[#10B981] text-[#10B981] bg-emerald-50/60">
                              {s.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* ======================= FACULTY & MENTORS DIRECTORY TAB ======================= */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[20px] font-bold text-[#0A0A0A]">Faculty Mentors & Leaders</h2>
              <p className="text-[13px] text-[#6B7280]">
                All mentors listed here can be designated as batch leads and appear publicly on the website under Batches.
              </p>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setEditingFaculty(null);
                setFacName('');
                setFacDesignation('');
                setFacDepartment('Smart City Lab');
                setFacPhotoUrl('');
                setFacBio('');
                setAddFacultyModalOpen(true);
              }}
            >
              + Add Mentor
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {innovators.map((mentor) => (
              <Card key={mentor.id} className="p-5 flex flex-col justify-between hover:border-[#0A0A0A] transition-colors">
                <div className="flex items-start gap-4">
                  <img
                    src={mentor.photoUrl}
                    alt={mentor.name}
                    className="w-14 h-14 rounded-xl object-cover border border-[#E5E7EB] bg-[#F8F9FA] flex-shrink-0"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(mentor.name)}&background=2563EB&color=fff&size=128`;
                    }}
                  />
                  <div className="space-y-1">
                    <h3 className="text-[17px] font-bold text-[#0A0A0A]">{mentor.name}</h3>
                    <p className="text-[13px] font-medium text-[#2563EB]">{mentor.designation}</p>
                    <p className="text-[12px] text-[#6B7280]">{mentor.department || 'Smart City Lab'}</p>
                    {mentor.bio && (
                      <p className="text-[12px] text-[#4B5563] pt-1 line-clamp-2">{mentor.bio}</p>
                    )}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-[#E5E7EB] flex items-center justify-end gap-2">
                  <button
                    onClick={() => {
                      setEditingFaculty(mentor);
                      setFacName(mentor.name);
                      setFacDesignation(mentor.designation);
                      setFacDepartment(mentor.department || 'Smart City Lab');
                      setFacPhotoUrl(mentor.photoUrl);
                      setFacBio(mentor.bio || '');
                      setAddFacultyModalOpen(true);
                    }}
                    className="p-1.5 rounded text-[#6B7280] hover:text-[#0A0A0A] hover:bg-[#E5E7EB] transition-colors"
                    title="Edit Faculty"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  {innovators.length > 1 && (
                    <button
                      onClick={() => {
                        if (confirm(`Remove ${mentor.name} from faculty directory?`)) {
                          deleteFaculty(mentor.id);
                        }
                      }}
                      className="p-1.5 rounded text-rose-500 hover:bg-rose-50 transition-colors"
                      title="Delete Faculty"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ======================= CREATE BATCH MODAL ======================= */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Add New Student Research Batch"
        maxWidth="xl"
      >
        <form onSubmit={handleCreateBatch} className="space-y-4 text-left">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Batch Name"
              placeholder="e.g. Batch 2027"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Batch Year Identifier"
              placeholder="e.g. 2027"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Academic Session"
              placeholder="e.g. 2026 – 2027 Senior Research Cohort"
              value={academicSession}
              onChange={(e) => setAcademicSession(e.target.value)}
              required
            />

            <div className="space-y-1.5">
              <label className="block text-[14px] font-medium text-[#0A0A0A]">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as BatchInfo['status'])}
                className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-[15px] text-[#0A0A0A] focus:border-[#2563EB] focus:outline-none"
              >
                <option value="upcoming">Upcoming Cohort</option>
                <option value="active">Active Cohort</option>
                <option value="graduated">Graduated Alumni</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[14px] font-medium text-[#0A0A0A]">
              Faculty Mentor In-Charge
            </label>
            <select
              value={mentorLead}
              onChange={(e) => setMentorLead(e.target.value)}
              className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-[14px] text-[#0A0A0A] focus:border-[#2563EB] focus:outline-none"
            >
              {innovators.length > 0 ? (
                innovators.map((m) => (
                  <option key={m.id} value={m.name}>
                    {m.name} ({m.designation})
                  </option>
                ))
              ) : (
                <>
                  <option value="Dr. Vivek Upadhyay">Dr. Vivek Upadhyay (Lab Director)</option>
                  <option value="Smart City Lab Faculty">Smart City Lab Faculty Mentor</option>
                </>
              )}
            </select>
          </div>

          <Textarea
            label="Cohort Mission / Description"
            placeholder="Focus areas, active urban system domains, and goals for this cohort..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />

          <div className="pt-2 flex justify-end gap-3 border-t border-[#E5E7EB]">
            <Button type="button" variant="outline" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Cohort
            </Button>
          </div>
        </form>
      </Modal>

      {/* ======================= EDIT BATCH MODAL ======================= */}
      {editingBatch && (
        <Modal
          isOpen={!!editingBatch}
          onClose={() => setEditingBatch(null)}
          title={`Edit ${editingBatch.name}`}
          maxWidth="xl"
        >
          <form onSubmit={handleSaveEditBatch} className="space-y-4 text-left">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Batch Name"
                value={editingBatch.name}
                onChange={(e) => setEditingBatch({ ...editingBatch, name: e.target.value })}
                required
              />
              <Input
                label="Year Identifier"
                value={editingBatch.year}
                onChange={(e) => setEditingBatch({ ...editingBatch, year: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Academic Session"
                value={editingBatch.academicSession}
                onChange={(e) => setEditingBatch({ ...editingBatch, academicSession: e.target.value })}
                required
              />

              <div className="space-y-1.5">
                <label className="block text-[14px] font-medium text-[#0A0A0A]">Status</label>
                <select
                  value={editingBatch.status}
                  onChange={(e) => setEditingBatch({ ...editingBatch, status: e.target.value as BatchInfo['status'] })}
                  className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-[14px] text-[#0A0A0A] focus:border-[#2563EB] focus:outline-none"
                >
                  <option value="active">Active Cohort</option>
                  <option value="upcoming">Upcoming Cohort</option>
                  <option value="graduated">Graduated Alumni</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[14px] font-medium text-[#0A0A0A]">Faculty Mentor In-Charge</label>
              <select
                value={editingBatch.mentorLead || ''}
                onChange={(e) => setEditingBatch({ ...editingBatch, mentorLead: e.target.value })}
                className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-[14px] text-[#0A0A0A] focus:border-[#2563EB] focus:outline-none"
              >
                {innovators.length > 0 ? (
                  innovators.map((m) => (
                    <option key={m.id} value={m.name}>
                      {m.name} ({m.designation})
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Dr. Vivek Upadhyay">Dr. Vivek Upadhyay (Lab Director)</option>
                    <option value="Smart City Lab Faculty">Smart City Lab Faculty Mentor</option>
                  </>
                )}
              </select>
            </div>

            <Textarea
              label="Cohort Mission / Description"
              value={editingBatch.description || ''}
              onChange={(e) => setEditingBatch({ ...editingBatch, description: e.target.value })}
              rows={3}
            />

            <div className="pt-2 flex justify-end gap-3 border-t border-[#E5E7EB]">
              <Button type="button" variant="outline" onClick={() => setEditingBatch(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ======================= ENROLL SINGLE STUDENT MODAL ======================= */}
      <Modal
        isOpen={addStudentModalOpen}
        onClose={() => setAddStudentModalOpen(false)}
        title={`Enroll Student into ${activeBatch?.name || 'Cohort'}`}
        maxWidth="xl"
      >
        <form onSubmit={handleAddStudentToBatch} className="space-y-4 text-left">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              placeholder="e.g. Priyanshu Sharma"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              required
            />

            <Input
              label="Roll Number"
              placeholder="e.g. 2300290100088"
              value={studentRoll}
              onChange={(e) => setStudentRoll(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email Address"
              placeholder="priyanshu.sharma@kiet.edu"
              value={studentEmail}
              onChange={(e) => setStudentEmail(e.target.value)}
            />

            <div className="space-y-1.5">
              <label className="block text-[14px] font-medium text-[#0A0A0A]">Academic Year</label>
              <select
                value={studentYear}
                onChange={(e) => setStudentYear(e.target.value)}
                className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-[14px] text-[#0A0A0A] focus:border-[#2563EB] focus:outline-none"
              >
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[14px] font-medium text-[#0A0A0A]">Branch</label>
              <select
                value={studentBranch}
                onChange={(e) => setStudentBranch(e.target.value)}
                className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-[14px] text-[#0A0A0A] focus:border-[#2563EB] focus:outline-none"
              >
                <option value="CSE">CSE (Computer Science & Engg)</option>
                <option value="ECE">ECE (Electronics & Comm)</option>
                <option value="IT">IT (Information Technology)</option>
                <option value="EE">EE (Electrical Engg)</option>
                <option value="ME">ME (Mechanical Engg)</option>
                <option value="AI&ML">AI & ML</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[14px] font-medium text-[#0A0A0A]">Role Designation</label>
              <select
                value={studentRole}
                onChange={(e) => setStudentRole(e.target.value as 'Student' | 'Team Lead')}
                className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-[14px] text-[#0A0A0A] focus:border-[#2563EB] focus:outline-none"
              >
                <option value="Student">Student (Research Intern)</option>
                <option value="Team Lead">Team Lead</option>
              </select>
            </div>
          </div>

          <div>
            <Input
              label="Domain / Specialization"
              placeholder="e.g. Edge AI, LoRa Sensors, Cloud Telemetry"
              value={studentDomain}
              onChange={(e) => setStudentDomain(e.target.value)}
            />
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-[#E5E7EB]">
            <Button type="button" variant="outline" onClick={() => setAddStudentModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Enroll Student
            </Button>
          </div>
        </form>
      </Modal>

      {/* ======================= ASSIGN EXISTING STUDENTS MODAL ======================= */}
      {activeBatch && (
        <Modal
          isOpen={assignExistingModalOpen}
          onClose={() => setAssignExistingModalOpen(false)}
          title={`Assign Registered Students to ${activeBatch.name}`}
          maxWidth="2xl"
        >
          <div className="space-y-4 text-left">
            <p className="text-[13px] text-[#6B7280]">
              Select students from other batches or newly registered members to move or assign to <strong>{activeBatch.name}</strong>.
            </p>

            <div className="relative">
              <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search registered students by name, roll no, domain, team..."
                value={existingSearchQuery}
                onChange={(e) => setExistingSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-[13px] rounded-lg border border-[#E5E7EB] bg-white text-[#0A0A0A] focus:outline-none focus:border-[#2563EB]"
              />
            </div>

            {filteredNonBatchStudents.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-[#E5E7EB] rounded-xl text-[#6B7280] text-[14px]">
                {existingSearchQuery
                  ? 'No students match your search.'
                  : 'All registered students in the CRM already belong to this batch.'}
              </div>
            ) : (
              <div className="max-h-72 overflow-y-auto border border-[#E5E7EB] rounded-xl divide-y divide-[#E5E7EB]">
                {filteredNonBatchStudents.map((s) => {
                  const isChecked = selectedExistingIds.includes(s.id);
                  return (
                    <div
                      key={s.id}
                      onClick={() => {
                        setSelectedExistingIds((prev) =>
                          isChecked ? prev.filter((id) => id !== s.id) : [...prev, s.id]
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
                          <div className="text-[14px] font-semibold text-[#0A0A0A]">{s.name}</div>
                          <div className="text-[12px] text-[#6B7280]">
                            Roll: <span className="font-mono">{s.rollNo}</span> • Currently in: <strong>Batch {s.batchYear}</strong> • {s.domain}
                          </div>
                        </div>
                      </div>

                      <span className="text-[11px] font-medium text-[#2563EB] bg-white px-2 py-0.5 rounded border border-[#E5E7EB]">
                        {s.teamName || 'Unassigned'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="pt-3 flex items-center justify-between border-t border-[#E5E7EB]">
              <span className="text-[13px] text-[#6B7280]">
                Selected: <strong className="text-[#0A0A0A]">{selectedExistingIds.length}</strong> student(s)
              </span>

              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={() => setAssignExistingModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  disabled={selectedExistingIds.length === 0}
                  onClick={handleConfirmAssignExisting}
                >
                  Assign to {activeBatch.name}
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ======================= UPLOAD BATCH EXCEL MODAL ======================= */}
      {activeBatch && (
        <Modal
          isOpen={uploadExcelModalOpen}
          onClose={() => {
            setUploadExcelModalOpen(false);
            setParsedRows([]);
            setExcelFileName(null);
          }}
          title={`Upload Student Roster Excel for ${activeBatch.name}`}
          maxWidth="2xl"
        >
          <div className="space-y-5 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-blue-50/60 border border-blue-200">
              <div>
                <p className="text-[14px] font-semibold text-blue-900">
                  Bulk Upload for {activeBatch.name}
                </p>
                <p className="text-[12px] text-blue-700 mt-0.5">
                  Upload an Excel (.xlsx, .xls) or CSV sheet. All students will be enrolled directly into <strong>{activeBatch.name} ({activeBatch.academicSession})</strong>.
                </p>
              </div>
              <button
                type="button"
                onClick={() => downloadSampleExcelTemplate('batch')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-blue-300 text-[12px] font-semibold text-blue-700 hover:bg-blue-50 transition-colors whitespace-nowrap shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Template</span>
              </button>
            </div>

            {/* Drop Zone */}
            <div
              onClick={() => excelInputRef.current?.click()}
              className="border-2 border-dashed border-[#E5E7EB] hover:border-[#2563EB] rounded-xl p-8 text-center cursor-pointer bg-[#F8F9FA] hover:bg-white transition-colors"
            >
              <input
                type="file"
                ref={excelInputRef}
                accept=".xlsx,.xls,.csv"
                onChange={handleExcelFileChange}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-full bg-blue-50 text-[#2563EB] flex items-center justify-center mx-auto mb-3">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-[15px] font-semibold text-[#0A0A0A]">
                {excelFileName ? `Selected: ${excelFileName}` : `Click to select Excel for ${activeBatch.name}`}
              </p>
              <p className="text-[13px] text-[#6B7280] mt-1">
                Columns supported: Name, Roll No, Email, Branch, Domain, Role, Team.
              </p>
              {isParsingExcel && (
                <p className="text-[13px] text-[#2563EB] font-medium mt-2 animate-pulse">
                  Reading spreadsheet...
                </p>
              )}
            </div>

            {/* Preview */}
            {parsedRows.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="font-semibold text-[#0A0A0A]">
                    Parsed: <strong className="text-[#2563EB]">{parsedRows.length}</strong> students ready to enroll
                  </span>
                  <span className="text-[#6B7280]">Previewing first 5 rows</span>
                </div>

                <div className="max-h-48 overflow-y-auto border border-[#E5E7EB] rounded-lg">
                  <table className="w-full text-left text-[12px]">
                    <thead className="bg-[#F8F9FA] border-b border-[#E5E7EB] text-[#6B7280]">
                      <tr>
                        <th className="py-2 px-3">Name</th>
                        <th className="py-2 px-3">Roll No</th>
                        <th className="py-2 px-3">Branch</th>
                        <th className="py-2 px-3">Role</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E7EB]">
                      {parsedRows.slice(0, 5).map((row, i) => (
                        <tr key={i} className="hover:bg-[#F8F9FA]">
                          <td className="py-2 px-3 font-semibold text-[#0A0A0A]">{row.name}</td>
                          <td className="py-2 px-3 font-mono text-[#6B7280]">{row.rollNo}</td>
                          <td className="py-2 px-3">{row.branch || 'CSE'}</td>
                          <td className="py-2 px-3 font-medium text-[#2563EB]">{row.role || 'Student'}</td>
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
                  setUploadExcelModalOpen(false);
                  setParsedRows([]);
                  setExcelFileName(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                disabled={parsedRows.length === 0}
                onClick={handleConfirmExcelImport}
                className="flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Enroll {parsedRows.length > 0 ? `(${parsedRows.length}) Students` : 'Students'}</span>
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ======================= UPLOAD BATCH PDF MODAL ======================= */}
      {activeBatch && (
        <Modal
          isOpen={uploadPdfModalOpen}
          onClose={() => {
            setUploadPdfModalOpen(false);
            setPdfFileName(null);
          }}
          title={`Attach PDF Charter / Syllabus for ${activeBatch.name}`}
          maxWidth="lg"
        >
          <form onSubmit={handlePdfUploadConfirm} className="space-y-4 text-left">
            <div 
              onClick={() => pdfInputRef.current?.click()}
              className="border-2 border-dashed border-[#E5E7EB] hover:border-[#2563EB] rounded-xl p-8 text-center cursor-pointer bg-[#F8F9FA] hover:bg-white transition-colors"
            >
              <input
                type="file"
                ref={pdfInputRef}
                accept=".pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setPdfFileName(file.name);
                    setPdfFileSize(`${Math.round(file.size / 1024)} KB`);
                  }
                }}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6" />
              </div>
              <p className="text-[15px] font-semibold text-[#0A0A0A]">
                {pdfFileName ? `Selected: ${pdfFileName}` : `Choose PDF document for ${activeBatch.name}`}
              </p>
              <p className="text-[13px] text-[#6B7280] mt-1">
                Upload batch charter, research roadmap, or orientation document (.pdf).
              </p>
            </div>

            <div className="pt-2 flex justify-end gap-3 border-t border-[#E5E7EB]">
              <Button type="button" variant="outline" onClick={() => setUploadPdfModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={!pdfFileName}>
                Attach PDF Document
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ======================= ADD / EDIT FACULTY MODAL ======================= */}
      <Modal
        isOpen={addFacultyModalOpen}
        onClose={() => setAddFacultyModalOpen(false)}
        title={editingFaculty ? `Edit Faculty: ${editingFaculty.name}` : 'Add Faculty Mentor'}
        maxWidth="lg"
      >
        <form onSubmit={handleSaveFaculty} className="space-y-4 text-left">
          <Input
            label="Faculty Full Name"
            placeholder="e.g. Dr. Vivek Upadhyay"
            value={facName}
            onChange={(e) => setFacName(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Designation / Title"
              placeholder="e.g. Director & Head of Lab"
              value={facDesignation}
              onChange={(e) => setFacDesignation(e.target.value)}
              required
            />
            <Input
              label="Department"
              placeholder="e.g. Smart City Lab / CSE"
              value={facDepartment}
              onChange={(e) => setFacDepartment(e.target.value)}
            />
          </div>

          <Input
            label="Profile Photo URL (Optional)"
            placeholder="https://... or leave empty for auto-generated avatar"
            value={facPhotoUrl}
            onChange={(e) => setFacPhotoUrl(e.target.value)}
          />

          <Textarea
            label="Biography / Research Focus"
            placeholder="Short overview of faculty mentor's guidance areas, urban research interests..."
            value={facBio}
            onChange={(e) => setFacBio(e.target.value)}
            rows={3}
          />

          <div className="pt-2 flex justify-end gap-3 border-t border-[#E5E7EB]">
            <Button type="button" variant="outline" onClick={() => setAddFacultyModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingFaculty ? 'Save Changes' : 'Add Faculty Mentor'}
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
