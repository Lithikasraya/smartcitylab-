'use client';

import React, { useState, useRef, useMemo } from 'react';
import Link from 'next/link';
import Card from '@/components/shared/Card';
import Button from '@/components/shared/Button';
import { Input, Textarea } from '@/components/shared/Input';
import { usePortalStore } from '@/lib/store';
import { uploadMediaFile, getMediaDisplayUrl, getYouTubeEmbedUrl } from '@/lib/mediaService';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Users,
  Layers,
  Upload,
  Video,
  ExternalLink,
  Search,
  Plus,
  X,
  Loader2,
  Trash2,
  Check,
  FileText,
  AlertCircle,
  FolderGit2,
  Image as ImageIcon,
  UserCheck,
  ChevronRight
} from 'lucide-react';
import { Github } from '@/components/shared/Icons';

const PRESET_TECH = [
  'ESP32', 'Arduino', 'Raspberry Pi', 'Python', 'OpenCV', 'TensorFlow', 'PyTorch',
  'MQTT', 'LoRaWAN', 'Next.js', 'React', 'Node.js', 'FastAPI', 'YOLOv8', 'Edge AI',
  'Sensor Fusion', 'FreeRTOS', 'Flutter', 'TailwindCSS'
];

export default function PublicProposalPage() {
  const { batches, switchUser, addQuickSubmission } = usePortalStore();

  // Student Profile Selection State ("Who are you?")
  const [searchStudentQuery, setSearchStudentQuery] = useState('');
  const [selectedBatchFilter, setSelectedBatchFilter] = useState('all');
  const [authenticatedStudent, setAuthenticatedStudent] = useState<any>(null);

  // Proposal Form State
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [category, setCategory] = useState('IoT & Sensors');
  const [batchYear, setBatchYear] = useState('2026');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [teamName, setTeamName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<any[]>([]);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [techStack, setTechStack] = useState<string[]>(['ESP32', 'Python', 'IoT & Sensors']);
  const [customTechInput, setCustomTechInput] = useState('');

  // Media & Links
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [docsUrl, setDocsUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');

  // Uploading state
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const [videoUploadError, setVideoUploadError] = useState<string | null>(null);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submittedProposal, setSubmittedProposal] = useState<any | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Available students list for "Who are you?" selection
  const filteredActiveStudents = useMemo(() => {
    return batches.filter((student) => {
      const q = searchStudentQuery.toLowerCase().trim();
      const matchesSearch = !q || (
        student.name.toLowerCase().includes(q) ||
        (student.rollNo && student.rollNo.toLowerCase().includes(q)) ||
        (student.email && student.email.toLowerCase().includes(q)) ||
        (student.teamName && student.teamName.toLowerCase().includes(q))
      );
      const matchesBatch = selectedBatchFilter === 'all' || student.batchYear === selectedBatchFilter;
      return matchesSearch && matchesBatch;
    });
  }, [batches, searchStudentQuery, selectedBatchFilter]);

  // Handle selecting a student in "Who are you?" (NO PASSWORD NEEDED)
  const handleSelectProfile = (student: any) => {
    setAuthenticatedStudent(student);
    const defaultTeam = student.teamName && student.teamName !== 'Unassigned' 
      ? student.teamName 
      : `Team ${student.name.split(' ')[0]}`;
    setTeamName(defaultTeam);
    
    // Also update global store user for this session
    switchUser({
      role: 'student',
      name: student.name,
      email: student.email,
      rollNo: student.rollNo,
      teamName: defaultTeam,
    });
  };

  // Add teammate from database
  const handleAddMember = (student: any) => {
    if (student.id === authenticatedStudent?.id) return;
    if (selectedMembers.some((m) => m.id === student.id)) return;
    setSelectedMembers((prev) => [...prev, student]);
    setMemberSearchQuery('');
  };

  // Remove teammate
  const handleRemoveMember = (studentId: string) => {
    setSelectedMembers((prev) => prev.filter((m) => m.id !== studentId));
  };

  // Tech stack toggling
  const toggleTech = (tech: string) => {
    setTechStack((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
    );
  };

  const handleAddCustomTech = () => {
    const trimmed = customTechInput.trim();
    if (trimmed && !techStack.includes(trimmed)) {
      setTechStack((prev) => [...prev, trimmed]);
      setCustomTechInput('');
    }
  };

  // Upload Project Image
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setImageUploadError(null);

    try {
      const url = await uploadMediaFile(file, 'projects/images');
      if (url) {
        setImageUrl(url);
      } else {
        setImageUploadError('Failed to upload image. Please try again.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Image upload failed';
      setImageUploadError(msg);
    } finally {
      setIsUploadingImage(false);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  // Upload Project Video
  const handleVideoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingVideo(true);
    setVideoUploadError(null);

    try {
      const url = await uploadMediaFile(file, 'projects/videos');
      if (url) {
        setVideoUrl(url);
      } else {
        setVideoUploadError('Failed to upload video. Please try again.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Video upload failed';
      setVideoUploadError(msg);
    } finally {
      setIsUploadingVideo(false);
      if (videoInputRef.current) videoInputRef.current.value = '';
    }
  };

  // Submit Proposal
  const handleSubmitProposal = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!authenticatedStudent) {
      setFormError('Please select your student profile before submitting.');
      return;
    }
    if (!title.trim()) {
      setFormError('Project Name is required.');
      return;
    }
    if (!description.trim()) {
      setFormError('Project Technical Description is required.');
      return;
    }
    if (!teamName.trim()) {
      setFormError('Team Name is required.');
      return;
    }
    if (!imageUrl.trim()) {
      setFormError('Project Cover Image is required. Please upload an image.');
      return;
    }
    if (!videoUrl.trim()) {
      setFormError('Project Demo Video is required. Please upload a video or enter a YouTube link.');
      return;
    }

    setIsSubmitting(true);

    try {
      const leadName = authenticatedStudent.name;
      const allMemberNames = [leadName, ...selectedMembers.map((m) => m.name)];
      const allMemberDetails = [
        {
          name: authenticatedStudent.name,
          rollNo: authenticatedStudent.rollNo,
          email: authenticatedStudent.email,
          role: 'Team Lead',
        },
        ...selectedMembers.map((m) => ({
          name: m.name,
          rollNo: m.rollNo,
          email: m.email,
          role: 'Team Member',
        })),
      ];

      const proposalData = {
        type: 'project' as const,
        title: title.trim(),
        summary: tagline.trim() || description.trim().slice(0, 160),
        studentName: leadName,
        studentRoll: authenticatedStudent.rollNo || '2300290100099',
        teamName: teamName.trim(),
        details: {
          category,
          batchYear,
          startDate,
          description: description.trim(),
          tagline: tagline.trim() || title.trim(),
          teamLead: leadName,
          teamLeadRoll: authenticatedStudent.rollNo,
          teamLeadEmail: authenticatedStudent.email,
          members: allMemberNames,
          memberRoster: allMemberDetails,
          imageUrl: imageUrl.trim(),
          videoUrl: videoUrl.trim(),
          repoUrl: repoUrl.trim() || undefined,
          docsUrl: docsUrl.trim() || undefined,
          demoUrl: demoUrl.trim() || undefined,
          techStack: techStack.length > 0 ? techStack : [category, 'IoT'],
          submittedVia: 'public_proposal_link',
          submittedAt: new Date().toISOString(),
        },
      };

      const created = addQuickSubmission(proposalData);

      setSubmittedProposal({
        id: created.id,
        title: title.trim(),
        teamName: teamName.trim(),
        teamLead: leadName,
        membersCount: allMemberNames.length,
        submittedAt: new Date().toLocaleString(),
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Proposal submission error';
      setFormError(`Submission failed: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const ytEmbedUrl = getYouTubeEmbedUrl(videoUrl);
  const displayVideoUrl = getMediaDisplayUrl(videoUrl);
  const displayImageUrl = getMediaDisplayUrl(imageUrl);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0A0A0A] flex flex-col font-sans">
      
      {/* ══════════════════════════════════════════════════════════════════
          FOCUSED TOP BRANDING BAR (NO WEBSITE NAVBAR)
      ══════════════════════════════════════════════════════════════════ */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-sm">
            SCL
          </div>
          <div>
            <div className="text-[15px] font-black tracking-tight text-slate-900 leading-none">
              KIET SMART CITY LAB
            </div>
            <div className="text-[11px] font-medium text-slate-500 mt-0.5">
              Project Proposal Submission Portal
            </div>
          </div>
        </div>

        {authenticatedStudent && (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-[12px] bg-blue-50/80 px-3.5 py-1.5 rounded-full border border-blue-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-blue-950">{authenticatedStudent.name}</span>
              <span className="text-blue-600">({authenticatedStudent.rollNo})</span>
            </div>
            <button
              onClick={() => {
                setAuthenticatedStudent(null);
                setSubmittedProposal(null);
              }}
              className="text-[12px] font-bold text-red-600 hover:text-red-800 hover:bg-red-50 px-2.5 py-1 rounded-lg border border-red-200 transition-colors"
            >
              Switch Profile
            </button>
          </div>
        )}
      </header>

      <main className="flex-grow py-8 sm:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">

          {/* ══════════════════════════════════════════════════════════════════
              CASE 1: SUCCESS CONFIRMATION
          ══════════════════════════════════════════════════════════════════ */}
          {submittedProposal ? (
            <Card className="p-8 sm:p-12 text-center border-[#E5E7EB] bg-white shadow-xl rounded-2xl animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-200">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <span className="inline-block px-3 py-1 rounded-full text-[12px] font-bold bg-amber-50 text-amber-800 border border-amber-200 mb-3">
                Status: Pending Super Admin Approval
              </span>
              <h2 className="text-[26px] sm:text-[30px] font-black text-[#0A0A0A] tracking-tight">
                Proposal Submitted Successfully!
              </h2>
              <p className="text-[14px] sm:text-[15px] text-[#6B7280] max-w-lg mx-auto mt-2 leading-relaxed">
                Thank you, <strong>{submittedProposal.teamLead}</strong>. Your project proposal for{' '}
                <strong>&ldquo;{submittedProposal.title}&rdquo;</strong> on behalf of{' '}
                <strong>{submittedProposal.teamName}</strong> has been received.
              </p>

              <div className="my-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-left max-w-md mx-auto space-y-2 text-[13px]">
                <div className="flex justify-between">
                  <span className="text-gray-500">Submission ID:</span>
                  <span className="font-mono font-bold text-gray-900">{submittedProposal.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Team Lead:</span>
                  <span className="font-semibold text-gray-900">{submittedProposal.teamLead}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Team Members:</span>
                  <span className="font-semibold text-gray-900">{submittedProposal.membersCount} students</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Submitted At:</span>
                  <span className="font-mono text-gray-700">{submittedProposal.submittedAt}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setSubmittedProposal(null);
                    setTitle('');
                    setDescription('');
                    setImageUrl('');
                    setVideoUrl('');
                    setSelectedMembers([]);
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-[14px] hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Submit Another Proposal
                </button>
                <Link href="/projects" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 text-slate-800 font-bold text-[14px] hover:bg-slate-200 transition-colors border border-slate-200">
                    Explore Live Projects
                  </button>
                </Link>
              </div>
            </Card>

          /* ══════════════════════════════════════════════════════════════════
              CASE 2: "WHO ARE YOU?" - STUDENT SELECTION (NO PASSWORD REQUIRED)
          ══════════════════════════════════════════════════════════════════ */
          ) : !authenticatedStudent ? (
            <div className="space-y-6 max-w-2xl mx-auto">
              
              {/* Header Title */}
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Student Verification</span>
                </div>
                <h1 className="text-[28px] sm:text-[34px] font-black text-slate-900 tracking-tight">
                  Who are you?
                </h1>
                <p className="text-[14px] sm:text-[15px] text-slate-600 max-w-md mx-auto">
                  Select your name from the registered student directory to begin submitting your project proposal.
                </p>
              </div>

              <Card className="p-6 sm:p-7 border-slate-200 shadow-lg rounded-2xl bg-white space-y-5">
                
                {/* Search Bar & Batch Filter */}
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Type your Name, University Roll No, or Email..."
                      value={searchStudentQuery}
                      onChange={(e) => setSearchStudentQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-[14px] bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-slate-900 placeholder:text-slate-400 font-medium"
                      autoFocus
                    />
                    {searchStudentQuery && (
                      <button
                        onClick={() => setSearchStudentQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[12px] text-slate-500">
                    <span>
                      Showing <strong>{filteredActiveStudents.length}</strong> active students
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span>Batch:</span>
                      {['all', '2026', '2025', '2024'].map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => setSelectedBatchFilter(b)}
                          className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase transition-colors ${
                            selectedBatchFilter === b
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Students List */}
                <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                  {filteredActiveStudents.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-[13px] space-y-1">
                      <p className="font-bold text-slate-700">No student profile found for &ldquo;{searchStudentQuery}&rdquo;</p>
                      <p className="text-[12px] text-slate-400">Please check your spelling or contact the lab administrator.</p>
                    </div>
                  ) : (
                    filteredActiveStudents.map((student) => (
                      <button
                        key={student.id}
                        type="button"
                        onClick={() => handleSelectProfile(student)}
                        className="w-full text-left p-3.5 rounded-xl border border-slate-200/80 bg-white hover:bg-blue-50/60 hover:border-blue-300 transition-all flex items-center justify-between group shadow-2xs"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-800 text-white font-black text-sm flex items-center justify-center uppercase group-hover:bg-blue-600 transition-colors shrink-0">
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-[14px] text-slate-900 group-hover:text-blue-900 flex items-center gap-2">
                              <span>{student.name}</span>
                              {student.isTeamLead && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200">
                                  Lead
                                </span>
                              )}
                            </div>
                            <div className="text-[12px] text-slate-500 flex items-center gap-2 mt-0.5">
                              <span className="font-mono text-slate-700">{student.rollNo || 'No Roll No'}</span>
                              <span>•</span>
                              <span>Batch {student.batchYear || '2026'}</span>
                              {student.teamName && student.teamName !== 'Unassigned' && (
                                <>
                                  <span>•</span>
                                  <span className="text-blue-600 font-semibold">{student.teamName}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 text-blue-600 font-bold text-[13px] opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0">
                          <span className="hidden sm:inline">Select</span>
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </button>
                    ))
                  )}
                </div>

                <div className="pt-2 text-center text-[12px] text-slate-400">
                  Only registered students from the Smart City Lab database can submit proposals.
                </div>
              </Card>
            </div>

          /* ══════════════════════════════════════════════════════════════════
              CASE 3: PROJECT PROPOSAL FORM
          ══════════════════════════════════════════════════════════════════ */
          ) : (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Authenticated Student Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md border border-blue-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-base shadow-sm">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[15px] font-bold text-white">{authenticatedStudent.name}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500 text-white">
                        Team Lead
                      </span>
                    </div>
                    <div className="text-[12px] text-blue-200">
                      Roll No: {authenticatedStudent.rollNo} • Batch {authenticatedStudent.batchYear || '2026'}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setAuthenticatedStudent(null)}
                  className="text-[12px] font-bold text-blue-200 hover:text-white underline self-start sm:self-auto"
                >
                  Not {authenticatedStudent.name}? Switch Student
                </button>
              </div>

              {/* Proposal Form Card */}
              <Card className="p-6 sm:p-8 border-slate-200 shadow-sm rounded-2xl bg-white space-y-8">
                
                <div>
                  <h2 className="text-[22px] sm:text-[24px] font-black text-slate-900 tracking-tight">
                    Project Proposal Details
                  </h2>
                  <p className="text-[13px] sm:text-[14px] text-slate-500 mt-1">
                    Fill in all required fields. Both project cover image and video demonstration are mandatory.
                  </p>
                </div>

                {formError && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-[13px] font-semibold flex items-center gap-2.5">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <form onSubmit={handleSubmitProposal} className="space-y-6">
                  
                  {/* Section 1: Core Details */}
                  <div className="space-y-4">
                    <h3 className="text-[15px] font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                      <FolderGit2 className="w-4 h-4 text-blue-600" />
                      <span>1. Project Information</span>
                    </h3>

                    <div className="space-y-1.5">
                      <Input
                        label="Project Name *"
                        placeholder="e.g. Smart City Edge IoT Traffic & Pollution Analytics"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-[13px] font-semibold text-slate-700">Category *</label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-[13px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 font-medium"
                        >
                          <option value="IoT & Sensors">IoT & Sensors</option>
                          <option value="AI & Computer Vision">AI & Computer Vision</option>
                          <option value="Green Energy">Green Energy</option>
                          <option value="Smart Mobility">Smart Mobility</option>
                          <option value="Web & Cloud">Web & Cloud</option>
                          <option value="Robotics & Drones">Robotics & Drones</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[13px] font-semibold text-slate-700">Academic Batch Year</label>
                        <select
                          value={batchYear}
                          onChange={(e) => setBatchYear(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-[13px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 font-medium"
                        >
                          <option value="2026">Batch 2026</option>
                          <option value="2025">Batch 2025</option>
                          <option value="2024">Batch 2024</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <Input
                          type="date"
                          label="Project Start Date *"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Input
                        label="Tagline / One-Line Summary"
                        placeholder="A real-time edge computing node detecting traffic bottlenecks via computer vision..."
                        value={tagline}
                        onChange={(e) => setTagline(e.target.value)}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Textarea
                        label="Project Technical Description *"
                        placeholder="Explain problem statement, methodology, hardware/software architecture, and expected impact..."
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Section 2: Team Roster */}
                  <div className="space-y-4 pt-4">
                    <h3 className="text-[15px] font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span>2. Team Details & Members</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Team Name *"
                        placeholder="e.g. Team CyberVision"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        required
                      />

                      <div className="space-y-1.5">
                        <label className="block text-[13px] font-semibold text-slate-700">Designated Team Lead</label>
                        <div className="p-2.5 px-3.5 bg-blue-50/70 border border-blue-200 rounded-xl text-[13px] text-blue-950 font-bold flex items-center justify-between">
                          <span>{authenticatedStudent.name} (You)</span>
                          <span className="text-[11px] text-blue-700 font-mono">{authenticatedStudent.rollNo}</span>
                        </div>
                      </div>
                    </div>

                    {/* Team Member Picker from Database */}
                    <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <label className="block text-[13px] font-semibold text-slate-800">
                        Add Team Members (Select from Database)
                      </label>
                      
                      <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Search database by student name or roll number..."
                          value={memberSearchQuery}
                          onChange={(e) => setMemberSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-[13px] bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 font-medium"
                        />
                      </div>

                      {/* Dropdown Suggestions */}
                      {memberSearchQuery.trim() && (
                        <div className="max-h-40 overflow-y-auto bg-white border border-slate-200 rounded-lg shadow-md divide-y divide-slate-100">
                          {batches
                            .filter(
                              (s) =>
                                s.id !== authenticatedStudent.id &&
                                !selectedMembers.some((m) => m.id === s.id) &&
                                (s.name.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
                                  (s.rollNo && s.rollNo.includes(memberSearchQuery)))
                            )
                            .slice(0, 6)
                            .map((s) => (
                              <button
                                key={s.id}
                                type="button"
                                onClick={() => handleAddMember(s)}
                                className="w-full p-2.5 text-left text-[12px] hover:bg-blue-50 flex items-center justify-between"
                              >
                                <div>
                                  <span className="font-bold text-slate-900">{s.name}</span>
                                  <span className="text-slate-500 ml-2 font-mono">({s.rollNo})</span>
                                </div>
                                <span className="text-blue-600 font-bold flex items-center gap-0.5">
                                  <Plus className="w-3.5 h-3.5" /> Add
                                </span>
                              </button>
                            ))}
                        </div>
                      )}

                      {/* Selected Teammates Tags */}
                      <div className="pt-2">
                        <span className="text-[12px] font-semibold text-slate-500 block mb-1.5">
                          Selected Team Members ({selectedMembers.length + 1} total including Lead):
                        </span>
                        
                        <div className="flex flex-wrap gap-2">
                          {/* Lead Pill */}
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-[12px] font-bold border border-blue-200">
                            <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
                            <span>{authenticatedStudent.name} (Lead)</span>
                          </span>

                          {/* Member Pills */}
                          {selectedMembers.map((m) => (
                            <span
                              key={m.id}
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-slate-800 text-[12px] font-semibold border border-slate-200 shadow-2xs"
                            >
                              <span>{m.name}</span>
                              <span className="text-slate-400 font-mono text-[11px]">({m.rollNo})</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveMember(m.id)}
                                className="text-slate-400 hover:text-red-600"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Tech Stack */}
                  <div className="space-y-3 pt-4">
                    <h3 className="text-[15px] font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-blue-600" />
                      <span>3. Technology Stack</span>
                    </h3>

                    <div className="flex flex-wrap gap-1.5">
                      {PRESET_TECH.map((t) => {
                        const active = techStack.includes(t);
                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() => toggleTech(t)}
                            className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors border ${
                              active
                                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {t}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex gap-2 max-w-sm pt-1">
                      <input
                        type="text"
                        placeholder="Add other tech (e.g. Docker, Rust)..."
                        value={customTechInput}
                        onChange={(e) => setCustomTechInput(e.target.value)}
                        className="px-3 py-1.5 text-[12px] rounded-lg border border-slate-200 bg-white flex-1 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomTech}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 text-white text-[12px] font-bold hover:bg-black"
                      >
                        Add Tag
                      </button>
                    </div>
                  </div>

                  {/* Section 4: Repository & Documentation Links */}
                  <div className="space-y-3 pt-4">
                    <h3 className="text-[15px] font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                      <ExternalLink className="w-4 h-4 text-blue-600" />
                      <span>4. Repository & Project Links</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Input
                        label="GitHub Repository Link"
                        placeholder="https://github.com/..."
                        value={repoUrl}
                        onChange={(e) => setRepoUrl(e.target.value)}
                        icon={<Github className="w-4 h-4 text-gray-400" />}
                      />
                      <Input
                        label="Documentation Link"
                        placeholder="https://docs.google.com/..."
                        value={docsUrl}
                        onChange={(e) => setDocsUrl(e.target.value)}
                        icon={<FileText className="w-4 h-4 text-gray-400" />}
                      />
                      <Input
                        label="Live Project / Demo Link"
                        placeholder="https://..."
                        value={demoUrl}
                        onChange={(e) => setDemoUrl(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Section 5: Mandatory Cover Image & Video Uploads */}
                  <div className="space-y-4 pt-4">
                    <h3 className="text-[15px] font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-blue-600" />
                        <span>5. Media Assets (Both Required *)</span>
                      </div>
                      <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider">
                        Image & Video Mandatory
                      </span>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      
                      {/* Image Upload Box */}
                      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-[13px] font-bold text-slate-800 flex items-center gap-1.5">
                            <ImageIcon className="w-4 h-4 text-blue-600" />
                            <span>Project Cover Image *</span>
                          </label>
                          {imageUrl && (
                            <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" /> Attached
                            </span>
                          )}
                        </div>

                        <input
                          type="file"
                          ref={imageInputRef}
                          accept="image/*"
                          onChange={handleImageFileChange}
                          className="hidden"
                        />

                        {displayImageUrl ? (
                          <div className="relative rounded-lg overflow-hidden border border-slate-300 h-40 bg-slate-900">
                            <img src={displayImageUrl} alt="Preview" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setImageUrl('')}
                              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-red-600 text-white transition-colors"
                              title="Remove Image"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => imageInputRef.current?.click()}
                            className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-6 text-center cursor-pointer bg-white transition-colors"
                          >
                            {isUploadingImage ? (
                              <div className="flex flex-col items-center gap-2 text-blue-600">
                                <Loader2 className="w-6 h-6 animate-spin" />
                                <span className="text-[12px] font-bold">Uploading Cover Image...</span>
                              </div>
                            ) : (
                              <div className="space-y-1.5">
                                <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                                <div className="text-[13px] font-bold text-slate-700">Click to upload cover image</div>
                                <div className="text-[11px] text-slate-400">PNG, JPG, WebP up to 10MB</div>
                              </div>
                            )}
                          </div>
                        )}

                        {imageUploadError && (
                          <div className="text-[12px] text-red-600 font-semibold">{imageUploadError}</div>
                        )}

                        <div className="pt-1">
                          <input
                            type="text"
                            placeholder="Or paste direct image URL (https://...)"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            className="w-full px-3 py-1.5 text-[12px] rounded-lg border border-slate-200 bg-white"
                          />
                        </div>
                      </div>

                      {/* Video Upload Box */}
                      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-[13px] font-bold text-slate-800 flex items-center gap-1.5">
                            <Video className="w-4 h-4 text-amber-600" />
                            <span>Project Demo Video *</span>
                          </label>
                          {videoUrl && (
                            <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" /> Attached
                            </span>
                          )}
                        </div>

                        <input
                          type="file"
                          ref={videoInputRef}
                          accept="video/mp4,video/webm,video/quicktime"
                          onChange={handleVideoFileChange}
                          className="hidden"
                        />

                        {ytEmbedUrl ? (
                          <div className="relative rounded-lg overflow-hidden border border-slate-300 h-40 bg-slate-900">
                            <iframe
                              src={ytEmbedUrl}
                              title="Video preview"
                              className="w-full h-full border-0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            />
                            <button
                              type="button"
                              onClick={() => setVideoUrl('')}
                              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-red-600 text-white transition-colors"
                              title="Remove Video"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ) : displayVideoUrl ? (
                          <div className="relative rounded-lg overflow-hidden border border-slate-300 h-40 bg-slate-900">
                            <video src={displayVideoUrl} controls className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setVideoUrl('')}
                              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-red-600 text-white transition-colors"
                              title="Remove Video"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => videoInputRef.current?.click()}
                            className="border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-xl p-6 text-center cursor-pointer bg-white transition-colors"
                          >
                            {isUploadingVideo ? (
                              <div className="flex flex-col items-center gap-2 text-amber-600">
                                <Loader2 className="w-6 h-6 animate-spin" />
                                <span className="text-[12px] font-bold">Uploading Project Video...</span>
                              </div>
                            ) : (
                              <div className="space-y-1.5">
                                <Video className="w-6 h-6 text-slate-400 mx-auto" />
                                <div className="text-[13px] font-bold text-slate-700">Click to upload MP4/WebM video</div>
                                <div className="text-[11px] text-slate-400">Direct upload or YouTube link</div>
                              </div>
                            )}
                          </div>
                        )}

                        {videoUploadError && (
                          <div className="text-[12px] text-red-600 font-semibold">{videoUploadError}</div>
                        )}

                        <div className="pt-1">
                          <input
                            type="text"
                            placeholder="Or paste YouTube / direct video URL..."
                            value={videoUrl}
                            onChange={(e) => setVideoUrl(e.target.value)}
                            className="w-full px-3 py-1.5 text-[12px] rounded-lg border border-slate-200 bg-white"
                          />
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={() => setAuthenticatedStudent(null)}
                      className="text-[13px] font-semibold text-slate-500 hover:text-slate-800"
                    >
                      ← Back to Student Selector
                    </button>

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      disabled={isSubmitting}
                      icon={isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      className="w-full sm:w-auto shadow-md shadow-blue-600/30 font-bold"
                    >
                      {isSubmitting ? 'Submitting Proposal...' : 'Submit Proposal for Admin Review'}
                    </Button>
                  </div>

                </form>
              </Card>
            </div>
          )}

        </div>
      </main>

      {/* Footer minimal */}
      <footer className="py-6 border-t border-slate-200 text-center text-[12px] text-slate-400">
        © {new Date().getFullYear()} KIET Smart City Lab. All rights reserved.
      </footer>
    </div>
  );
}
