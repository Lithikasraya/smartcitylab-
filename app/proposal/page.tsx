'use client';

import React, { useState, useRef, useMemo, useEffect } from 'react';
import Link from 'next/link';
import ProjectThumbnail from '@/components/shared/ProjectThumbnail';
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
  ChevronRight,
  LogOut,
  Eye,
  Calendar,
  Sparkle,
  Globe
} from 'lucide-react';
import { Github } from '@/components/shared/Icons';

const PRESET_TECH = [
  'ESP32', 'Arduino', 'Raspberry Pi', 'Python', 'OpenCV', 'TensorFlow', 'PyTorch',
  'MQTT', 'LoRaWAN', 'Next.js', 'React', 'Node.js', 'FastAPI', 'YOLOv8', 'Edge AI',
  'Sensor Fusion', 'FreeRTOS', 'Flutter', 'TailwindCSS'
];

export default function PublicProposalPage() {
  const { batches, batchInfos, switchUser, addQuickSubmission } = usePortalStore();

  // Student Profile Selection State ("Who are you?")
  const [searchStudentQuery, setSearchStudentQuery] = useState('');
  const [selectedBatchFilter, setSelectedBatchFilter] = useState('all');
  const [authenticatedStudent, setAuthenticatedStudent] = useState<any>(null);

  // Proposal Form State
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [category, setCategory] = useState('IoT & Sensors');
  const [batchYear, setBatchYear] = useState('Cream Layer I');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [teamName, setTeamName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<any[]>([]);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [techStack, setTechStack] = useState<string[]>(['ESP32', 'Python', 'IoT & Sensors']);
  const [customTechInput, setCustomTechInput] = useState('');

  // Media & Links (Photos & Video first)
  const [imageUrl, setImageUrl] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [newPhotoUrlInput, setNewPhotoUrlInput] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [docsUrl, setDocsUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');

  // Uploading states
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingMultiPhotos, setIsUploadingMultiPhotos] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const [videoUploadError, setVideoUploadError] = useState<string | null>(null);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submittedProposal, setSubmittedProposal] = useState<any | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const multiPhotosInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Filter students for "Who are you?"
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

  // Select student in "Who are you?" (Passwordless)
  const handleSelectProfile = (student: any) => {
    setAuthenticatedStudent(student);
    const defaultTeam = student.teamName && student.teamName !== 'Unassigned' 
      ? student.teamName 
      : `Team ${student.name.split(' ')[0]}`;
    setTeamName(defaultTeam);
    
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

  // Upload Additional Project Photos
  const handleMultiPhotosChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingMultiPhotos(true);
    try {
      const urls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const u = await uploadMediaFile(files[i], 'projects/gallery');
        if (u) urls.push(u);
      }
      setImages((prev) => [...prev, ...urls]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Photo upload failed';
      setImageUploadError(msg);
    } finally {
      setIsUploadingMultiPhotos(false);
      if (multiPhotosInputRef.current) multiPhotosInputRef.current.value = '';
    }
  };

  const handleAddPhotoUrl = () => {
    if (!newPhotoUrlInput.trim()) return;
    setImages((prev) => [...prev, newPhotoUrlInput.trim()]);
    setNewPhotoUrlInput('');
  };

  const handleRemovePhoto = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
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
    if (!imageUrl.trim() && !videoUrl.trim()) {
      setFormError('Please upload at least a Project Cover Image or a Demo Video (or YouTube link).');
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
          imageUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
          images: images.filter((i) => Boolean(i && i.trim())),
          videoUrl: videoUrl.trim() || undefined,
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

  // Live checklist completion calculation
  const hasMedia = Boolean(imageUrl.trim() || videoUrl.trim());
  const checklist = {
    image: Boolean(imageUrl.trim()),
    video: Boolean(videoUrl.trim()),
    media: hasMedia,
    title: Boolean(title.trim()),
    description: Boolean(description.trim()),
    team: Boolean(teamName.trim()),
  };
  const completedCount = [checklist.media, checklist.title, checklist.description, checklist.team].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* ══════════════════════════════════════════════════════════════════
          CLEAN SLIM HEADER (MINIMAL LAB TITLE + LOGOUT / SWITCH USER TOP RIGHT)
      ══════════════════════════════════════════════════════════════════ */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-xs shadow-sm">
            SCL
          </div>
          <div>
            <div className="text-[14px] font-black tracking-tight text-slate-900 leading-none">
              KIET SMART CITY LAB
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              Project Proposal Submission
            </div>
          </div>
        </div>

        {authenticatedStudent ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-[12px] bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200 text-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-bold">{authenticatedStudent.name}</span>
              <span className="text-slate-500 font-mono text-[11px]">({authenticatedStudent.rollNo})</span>
            </div>
            <button
              onClick={() => {
                setAuthenticatedStudent(null);
                setSubmittedProposal(null);
              }}
              className="text-[12px] font-bold text-red-600 hover:text-red-800 hover:bg-red-50 px-2.5 py-1.5 rounded-lg border border-red-200 transition-colors flex items-center gap-1"
              title="Logout / Switch Student Profile"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        ) : (
          <div className="text-[12px] font-semibold text-slate-400">
            Student Proposal Portal
          </div>
        )}
      </header>

      <main className="flex-grow py-6 sm:py-8 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">

          {/* ══════════════════════════════════════════════════════════════════
              CASE 1: SUCCESS RECEIPT
          ══════════════════════════════════════════════════════════════════ */}
          {submittedProposal ? (
            <div className="p-8 sm:p-12 text-center border border-slate-200 bg-white shadow-xl rounded-3xl animate-fade-up max-w-xl mx-auto my-12">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-200">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <span className="inline-block px-3 py-1 rounded-full text-[12px] font-bold bg-amber-50 text-amber-800 border border-amber-200 mb-3">
                Status: Pending Super Admin Approval
              </span>
              <h2 className="text-[26px] font-black text-slate-900 tracking-tight">
                Proposal Submitted Successfully!
              </h2>
              <p className="text-[14px] text-slate-600 max-w-md mx-auto mt-2 leading-relaxed">
                Thank you, <strong>{submittedProposal.teamLead}</strong>. Your proposal for{' '}
                <strong>&ldquo;{submittedProposal.title}&rdquo;</strong> on behalf of{' '}
                <strong>{submittedProposal.teamName}</strong> has been routed to the Super Admin.
              </p>

              <div className="my-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2 text-[13px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Proposal ID:</span>
                  <span className="font-mono font-bold text-slate-900">{submittedProposal.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Team Lead:</span>
                  <span className="font-semibold text-slate-900">{submittedProposal.teamLead}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Team Members:</span>
                  <span className="font-semibold text-slate-900">{submittedProposal.membersCount} students</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Submitted At:</span>
                  <span className="font-mono text-slate-700">{submittedProposal.submittedAt}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => {
                    setSubmittedProposal(null);
                    setTitle('');
                    setDescription('');
                    setImageUrl('');
                    setVideoUrl('');
                    setSelectedMembers([]);
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-[14px] hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Submit Another Proposal
                </button>
                <Link href="/projects" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-100 text-slate-800 font-bold text-[14px] hover:bg-slate-200 transition-colors border border-slate-200">
                    Explore Live Showcase
                  </button>
                </Link>
              </div>
            </div>

          /* ══════════════════════════════════════════════════════════════════
              CASE 2: "WHO ARE YOU?" - STUDENT SELECTION MODAL/CARD
          ══════════════════════════════════════════════════════════════════ */
          ) : !authenticatedStudent ? (
            <div className="max-w-2xl mx-auto my-8 space-y-6 animate-fade-up">
              
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Student Verification</span>
                </div>
                <h1 className="text-[30px] sm:text-[36px] font-black text-slate-900 tracking-tight">
                  Who are you?
                </h1>
                <p className="text-[14px] text-slate-600 max-w-md mx-auto">
                  Select your name from the registered active student directory to begin.
                </p>
              </div>

              <div className="p-6 sm:p-7 border border-slate-200 shadow-xl rounded-3xl bg-white space-y-4">
                
                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search your Name, Roll Number, or College Email..."
                    value={searchStudentQuery}
                    onChange={(e) => setSearchStudentQuery(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 text-[14px] bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-slate-900 placeholder:text-slate-400 font-medium"
                    autoFocus
                  />
                  {searchStudentQuery && (
                    <button
                      onClick={() => setSearchStudentQuery('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Batch Filter Pills */}
                <div className="flex items-center justify-between text-[12px] text-slate-500 pt-1">
                  <span>
                    Showing <strong>{filteredActiveStudents.length}</strong> registered student{filteredActiveStudents.length !== 1 ? 's' : ''}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="font-medium mr-1">Batch:</span>
                    {['all', '2026', '2025', '2024'].map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setSelectedBatchFilter(b)}
                        className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase transition-colors ${
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

                {/* Students Directory Grid */}
                <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                  {filteredActiveStudents.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-[13px] space-y-1">
                      <p className="font-bold text-slate-700">No student profile found for &ldquo;{searchStudentQuery}&rdquo;</p>
                      <p className="text-[12px] text-slate-400">Please check your spelling or contact your lab coordinator.</p>
                    </div>
                  ) : (
                    filteredActiveStudents.map((student) => (
                      <button
                        key={student.id}
                        type="button"
                        onClick={() => handleSelectProfile(student)}
                        className="w-full text-left p-3.5 rounded-2xl border border-slate-200 bg-white hover:bg-blue-50/70 hover:border-blue-300 transition-all flex items-center justify-between group shadow-xs"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-black text-sm flex items-center justify-center uppercase group-hover:bg-blue-600 transition-colors shrink-0">
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
                              <span className="font-mono text-slate-700">{student.rollNo || 'Roll No Pending'}</span>
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

                        <div className="flex items-center gap-1 text-blue-600 font-bold text-[12px] opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0">
                          <span>Select</span>
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </button>
                    ))
                  )}
                </div>

                <div className="text-center text-[11px] text-slate-400 pt-1">
                  🔒 Only active registered students in the Smart City Lab database can submit proposals.
                </div>
              </div>
            </div>

          /* ══════════════════════════════════════════════════════════════════
              CASE 3: 2-COLUMN HORIZONTAL WORKSPACE (FORM LEFT, LIVE PREVIEW RIGHT)
          ══════════════════════════════════════════════════════════════════ */
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start animate-fade-up">
              
              {/* ──────────────────────────────────────────────────────────────
                  LEFT COLUMN: INPUT FORM FLOW (PHOTOS & VIDEO FIRST)
              ────────────────────────────────────────────────────────────── */}
              <div className="lg:col-span-7 space-y-5">
                
                {formError && (
                  <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-[13px] font-semibold flex items-center gap-2.5">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <form onSubmit={handleSubmitProposal} className="space-y-5">
                  
                  {/* CARD 1: MEDIA UPLOADS (PHOTO & VIDEO FIRST AS REQUESTED) */}
                  <div className="p-5 sm:p-6 border border-slate-200 rounded-3xl bg-white shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">1</span>
                        <h2 className="text-[16px] font-bold text-slate-900">Project Media Assets</h2>
                      </div>
                      <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded-md tracking-wide">
                        Upload Image or Video Demo *
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      {/* Image Uploader */}
                      <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 space-y-2.5">
                        <div className="flex items-center justify-between text-[13px]">
                          <span className="font-bold text-slate-800 flex items-center gap-1.5">
                            <ImageIcon className="w-4 h-4 text-blue-600" />
                            <span>Cover Image {Boolean(videoUrl) && <span className="text-[10px] text-slate-400 font-normal">(Optional)</span>}</span>
                          </span>
                          {imageUrl && (
                            <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5">
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
                          <div className="relative rounded-xl overflow-hidden border border-slate-300 h-32 bg-slate-900">
                            <img src={displayImageUrl} alt="Preview" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setImageUrl('')}
                              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 hover:bg-red-600 text-white transition-colors"
                              title="Remove Image"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => imageInputRef.current?.click()}
                            className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-4 text-center cursor-pointer bg-white transition-colors h-32 flex flex-col items-center justify-center"
                          >
                            {isUploadingImage ? (
                              <div className="flex flex-col items-center gap-1.5 text-blue-600">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span className="text-[11px] font-bold">Uploading Cover...</span>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <Upload className="w-5 h-5 text-slate-400 mx-auto" />
                                <div className="text-[12px] font-bold text-slate-700">Upload Cover Image</div>
                                <div className="text-[10px] text-slate-400">PNG, JPG, WebP</div>
                              </div>
                            )}
                          </div>
                        )}

                        {imageUploadError && (
                          <div className="text-[11px] text-red-600 font-semibold">{imageUploadError}</div>
                        )}

                        <input
                          type="text"
                          placeholder="Or paste direct image URL..."
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                          className="w-full px-3 py-1.5 text-[11px] rounded-lg border border-slate-200 bg-white"
                        />
                      </div>

                      {/* Video Uploader */}
                      <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 space-y-2.5">
                        <div className="flex items-center justify-between text-[13px]">
                          <span className="font-bold text-slate-800 flex items-center gap-1.5">
                            <Video className="w-4 h-4 text-amber-600" />
                            <span>Demo Video {Boolean(imageUrl) && <span className="text-[10px] text-slate-400 font-normal">(Optional)</span>}</span>
                          </span>
                          {videoUrl && (
                            <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5">
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
                          <div className="relative rounded-xl overflow-hidden border border-slate-300 h-32 bg-slate-900">
                            <iframe
                              src={ytEmbedUrl}
                              title="Video preview"
                              className="w-full h-full border-0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            />
                            <button
                              type="button"
                              onClick={() => setVideoUrl('')}
                              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 hover:bg-red-600 text-white transition-colors"
                              title="Remove Video"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : displayVideoUrl ? (
                          <div className="relative rounded-xl overflow-hidden border border-slate-300 h-32 bg-slate-900">
                            <video src={displayVideoUrl} controls className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setVideoUrl('')}
                              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 hover:bg-red-600 text-white transition-colors"
                              title="Remove Video"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => videoInputRef.current?.click()}
                            className="border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-xl p-4 text-center cursor-pointer bg-white transition-colors h-32 flex flex-col items-center justify-center"
                          >
                            {isUploadingVideo ? (
                              <div className="flex flex-col items-center gap-1.5 text-amber-600">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span className="text-[11px] font-bold">Uploading Video...</span>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <Video className="w-5 h-5 text-slate-400 mx-auto" />
                                <div className="text-[12px] font-bold text-slate-700">Upload MP4 Video</div>
                                <div className="text-[10px] text-slate-400">Direct or YouTube link</div>
                              </div>
                            )}
                          </div>
                        )}

                        {videoUploadError && (
                          <div className="text-[11px] text-red-600 font-semibold">{videoUploadError}</div>
                        )}

                        <input
                          type="text"
                          placeholder="Or paste YouTube / video URL..."
                          value={videoUrl}
                          onChange={(e) => setVideoUrl(e.target.value)}
                          className="w-full px-3 py-1.5 text-[11px] rounded-lg border border-slate-200 bg-white"
                        />
                      </div>

                      {/* Additional Project Photos & Schematics ("Add more photos") */}
                      <div className="pt-3 border-t border-slate-100 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[12px] font-bold text-slate-700 flex items-center gap-1.5">
                            <ImageIcon className="w-4 h-4 text-blue-600" />
                            <span>Additional Project Photos & Hardware Schematics</span>
                            <span className="text-[10px] text-slate-400 font-normal">({images.length} photos)</span>
                          </span>
                          
                          <button
                            type="button"
                            onClick={() => multiPhotosInputRef.current?.click()}
                            disabled={isUploadingMultiPhotos}
                            className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            <span>{isUploadingMultiPhotos ? 'Uploading...' : 'Add Photos'}</span>
                          </button>
                        </div>

                        <input
                          type="file"
                          ref={multiPhotosInputRef}
                          onChange={handleMultiPhotosChange}
                          accept="image/*"
                          multiple
                          className="hidden"
                        />

                        {/* Paste image URL row */}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Or paste photo URL..."
                            value={newPhotoUrlInput}
                            onChange={(e) => setNewPhotoUrlInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddPhotoUrl();
                              }
                            }}
                            className="w-full px-3 py-1.5 text-[11px] rounded-lg border border-slate-200 bg-white"
                          />
                          <button
                            type="button"
                            onClick={handleAddPhotoUrl}
                            disabled={!newPhotoUrlInput.trim()}
                            className="px-3 py-1 text-[11px] font-bold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors disabled:opacity-50 shrink-0"
                          >
                            Add
                          </button>
                        </div>

                        {/* Photos Grid */}
                        {images.length > 0 && (
                          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 pt-1">
                            {images.map((img, idx) => (
                              <div key={idx} className="group relative aspect-square rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                                <img src={getMediaDisplayUrl(img)} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                                <span className="absolute bottom-1 left-1 px-1 py-0.2 rounded bg-black/70 text-white text-[8px] font-bold">
                                  #{idx + 1}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleRemovePhoto(idx)}
                                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-600/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                    </div>
                  </div>

                  {/* CARD 2: PROJECT BASIC INFORMATION */}
                  <div className="p-5 sm:p-6 border border-slate-200 rounded-3xl bg-white shadow-xs space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                      <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">2</span>
                      <h2 className="text-[16px] font-bold text-slate-900">Project Information</h2>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[13px] font-semibold text-slate-700">Project Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Real-Time Smart Traffic Flow Optimizer"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-[13px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 font-medium"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <label className="block text-[12px] font-semibold text-slate-700">Category *</label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-[12px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 font-medium"
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
                        <label className="block text-[12px] font-semibold text-slate-700">Lab Cohort / Cream Layer</label>
                        <select
                          value={batchYear}
                          onChange={(e) => setBatchYear(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-[12px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 font-medium"
                        >
                          {batchInfos && batchInfos.length > 0 ? (
                            batchInfos.map((b) => (
                              <option key={b.id} value={b.year}>
                                {b.name} ({b.academicSession || b.year})
                              </option>
                            ))
                          ) : (
                            <>
                              <option value="Cream Layer I">CREAM LAYER – I (CORE GROUP)</option>
                              <option value="Cream Layer II">CREAM LAYER – II (4TH YEARS)</option>
                              <option value="Cream Layer III">CREAM LAYER – III (3RD YEARS)</option>
                            </>
                          )}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[12px] font-semibold text-slate-700">Start Date *</label>
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-[12px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 font-medium"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[13px] font-semibold text-slate-700">Tagline / Short Summary</label>
                      <input
                        type="text"
                        placeholder="A concise one-line highlight for the showcase card..."
                        value={tagline}
                        onChange={(e) => setTagline(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-[13px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 font-medium"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[13px] font-semibold text-slate-700">Detailed Technical Description *</label>
                      <textarea
                        placeholder="Explain problem statement, hardware architecture, methodology, software pipeline, and lab findings..."
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-[13px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 font-medium"
                        required
                      />
                    </div>
                  </div>

                  {/* CARD 3: TEAM & REGISTERED MEMBERS */}
                  <div className="p-5 sm:p-6 border border-slate-200 rounded-3xl bg-white shadow-xs space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                      <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">3</span>
                      <h2 className="text-[16px] font-bold text-slate-900">Team Details & Registered Members</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-[13px] font-semibold text-slate-700">Team Name *</label>
                        <input
                          type="text"
                          placeholder="e.g. Team CyberVision"
                          value={teamName}
                          onChange={(e) => setTeamName(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-[13px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 font-medium"
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[13px] font-semibold text-slate-700">Designated Team Lead</label>
                        <div className="p-2.5 px-3 bg-blue-50/80 border border-blue-200 rounded-xl text-[13px] text-blue-950 font-bold flex items-center justify-between">
                          <span>{authenticatedStudent.name} (You)</span>
                          <span className="text-[11px] text-blue-700 font-mono">{authenticatedStudent.rollNo}</span>
                        </div>
                      </div>
                    </div>

                    {/* Member Directory Picker */}
                    <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
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
                          className="w-full pl-9 pr-3 py-2 text-[12px] bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 font-medium"
                        />
                      </div>

                      {/* Dropdown suggestions */}
                      {memberSearchQuery.trim() && (
                        <div className="max-h-36 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-md divide-y divide-slate-100">
                          {batches
                            .filter(
                              (s) =>
                                s.id !== authenticatedStudent.id &&
                                !selectedMembers.some((m) => m.id === s.id) &&
                                (s.name.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
                                  (s.rollNo && s.rollNo.includes(memberSearchQuery)))
                            )
                            .slice(0, 5)
                            .map((s) => (
                              <button
                                key={s.id}
                                type="button"
                                onClick={() => handleAddMember(s)}
                                className="w-full p-2 text-left text-[12px] hover:bg-blue-50 flex items-center justify-between"
                              >
                                <div>
                                  <span className="font-bold text-slate-900">{s.name}</span>
                                  <span className="text-slate-500 ml-2 font-mono text-[11px]">({s.rollNo})</span>
                                </div>
                                <span className="text-blue-600 font-bold flex items-center gap-0.5 text-[11px]">
                                  <Plus className="w-3 h-3" /> Add
                                </span>
                              </button>
                            ))}
                        </div>
                      )}

                      {/* Selected Teammates Tags */}
                      <div className="pt-1 flex flex-wrap gap-1.5">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-[11px] font-bold border border-blue-200">
                          <ShieldCheck className="w-3 h-3 text-blue-700" />
                          <span>{authenticatedStudent.name} (Lead)</span>
                        </span>

                        {selectedMembers.map((m) => (
                          <span
                            key={m.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-slate-800 text-[11px] font-semibold border border-slate-200 shadow-2xs"
                          >
                            <span>{m.name}</span>
                            <span className="text-slate-400 font-mono text-[10px]">({m.rollNo})</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveMember(m.id)}
                              className="text-slate-400 hover:text-red-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* CARD 4: TECH STACK & LINKS */}
                  <div className="p-5 sm:p-6 border border-slate-200 rounded-3xl bg-white shadow-xs space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                      <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">4</span>
                      <h2 className="text-[16px] font-bold text-slate-900">Tech Stack & External Links</h2>
                    </div>

                    {/* Tech Pills */}
                    <div className="space-y-2">
                      <label className="block text-[12px] font-semibold text-slate-700">Technologies & Frameworks</label>
                      <div className="flex flex-wrap gap-1.5">
                        {PRESET_TECH.map((t) => {
                          const active = techStack.includes(t);
                          return (
                            <button
                              key={t}
                              type="button"
                              onClick={() => toggleTech(t)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors border ${
                                active
                                  ? 'bg-blue-600 text-white border-blue-600'
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
                          placeholder="Add custom tag (e.g. Next.js)..."
                          value={customTechInput}
                          onChange={(e) => setCustomTechInput(e.target.value)}
                          className="px-3 py-1.5 text-[11px] rounded-lg border border-slate-200 bg-white flex-1 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                        />
                        <button
                          type="button"
                          onClick={handleAddCustomTech}
                          className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-[11px] font-bold hover:bg-black"
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    {/* Links Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-slate-600">GitHub Repository</label>
                        <input
                          type="text"
                          placeholder="https://github.com/..."
                          value={repoUrl}
                          onChange={(e) => setRepoUrl(e.target.value)}
                          className="w-full px-3 py-2 text-[11px] rounded-xl border border-slate-200 bg-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-slate-600">Documentation Link</label>
                        <input
                          type="text"
                          placeholder="https://docs.google.com/..."
                          value={docsUrl}
                          onChange={(e) => setDocsUrl(e.target.value)}
                          className="w-full px-3 py-2 text-[11px] rounded-xl border border-slate-200 bg-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-slate-600">Live Demo Link</label>
                        <input
                          type="text"
                          placeholder="https://..."
                          value={demoUrl}
                          onChange={(e) => setDemoUrl(e.target.value)}
                          className="w-full px-3 py-2 text-[11px] rounded-xl border border-slate-200 bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* SUBMIT BUTTON */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-[15px] shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Submitting Proposal to Super Admin...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-5 h-5" />
                          <span>Submit Project Proposal for Admin Approval</span>
                        </>
                      )}
                    </button>
                  </div>

                </form>
              </div>

              {/* ──────────────────────────────────────────────────────────────
                  RIGHT COLUMN: STICKY REAL-TIME PROJECT SHOWCASE PREVIEW
              ────────────────────────────────────────────────────────────── */}
              <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-16">
                
                {/* Header title */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2 text-[13px] font-bold text-slate-800">
                    <Eye className="w-4 h-4 text-blue-600" />
                    <span>Live Showcase Preview</span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400">
                    What viewers will see
                  </span>
                </div>

                {/* THE LIVE PREVIEW CARD */}
                <div className="rounded-3xl border border-slate-200/90 bg-white overflow-hidden shadow-lg transition-all flex flex-col justify-between">
                  
                  <div>
                    {/* Media Header with Interactive Thumbnail & Photo Strip */}
                    <div className="p-3 bg-slate-950/5 border-b border-slate-100">
                      <ProjectThumbnail
                        imageUrl={imageUrl}
                        images={images}
                        videoUrl={videoUrl}
                        title={title || 'Project Proposal'}
                        category={category}
                        className="h-48 w-full rounded-2xl"
                      />
                    </div>

                    {/* Body */}
                    <div className="p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black uppercase tracking-wider text-blue-600">
                          {category}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {startDate}
                        </span>
                      </div>

                      <h3 className="text-[17px] font-extrabold text-slate-900 leading-snug">
                        {title.trim() || 'Untitled Project Proposal'}
                      </h3>

                      <p className="text-[13px] text-slate-600 line-clamp-3 leading-relaxed">
                        {tagline.trim() || description.trim() || 'Provide a project tagline and technical description to preview your project card summary here...'}
                      </p>

                      {/* Tech Stack Pills */}
                      <div className="pt-1 flex flex-wrap gap-1">
                        {(techStack.length > 0 ? techStack : ['IoT', 'AI']).slice(0, 4).map((t) => (
                          <span key={t} className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 font-semibold">
                            {t}
                          </span>
                        ))}
                        {techStack.length > 4 && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-500 font-bold">
                            +{techStack.length - 4}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Footer Meta */}
                  <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center uppercase shadow-2xs">
                        {(authenticatedStudent?.name || 'T').charAt(0)}
                      </div>
                      <div>
                        <div className="text-[12px] font-bold text-slate-900 truncate max-w-[120px]">
                          {teamName.trim() || 'Team Name'}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {selectedMembers.length + 1} member{selectedMembers.length !== 0 ? 's' : ''}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-400">
                      {repoUrl && <Github className="w-4 h-4 text-slate-700" />}
                      {docsUrl && <FileText className="w-4 h-4 text-blue-600" />}
                      {demoUrl && <Globe className="w-4 h-4 text-emerald-600" />}
                    </div>
                  </div>

                </div>

                {/* Submission Readiness Checklist */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2.5 shadow-2xs text-[12px]">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span>Submission Readiness</span>
                    <span className={completedCount === 4 ? 'text-emerald-600 font-black' : 'text-blue-600'}>
                      {completedCount} / 4 Required Ready
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                    <div className={`flex items-center gap-1.5 ${checklist.image ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
                      <Check className="w-3.5 h-3.5" />
                      <span>Cover Image {checklist.image ? '✓' : '(Optional)'}</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${checklist.video ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
                      <Check className="w-3.5 h-3.5" />
                      <span>Video Demo {checklist.video ? '✓' : '(Optional)'}</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${checklist.title ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
                      <Check className="w-3.5 h-3.5" />
                      <span>Project Name</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${checklist.team ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
                      <Check className="w-3.5 h-3.5" />
                      <span>Team Name</span>
                    </div>
                    <div className={`col-span-2 flex items-center gap-1.5 ${checklist.description ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
                      <Check className="w-3.5 h-3.5" />
                      <span>Technical Description</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="py-4 border-t border-slate-200 text-center text-[11px] text-slate-400 bg-white">
        © {new Date().getFullYear()} KIET Smart City Lab • Project Proposal Portal
      </footer>
    </div>
  );
}
