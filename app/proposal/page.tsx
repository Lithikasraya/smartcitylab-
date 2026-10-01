'use client';

import React, { useState, useRef, useMemo } from 'react';
import Link from 'next/link';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import Card from '@/components/shared/Card';
import Button from '@/components/shared/Button';
import { Input, Textarea } from '@/components/shared/Input';
import MemberAvatar from '@/components/shared/MemberAvatar';
import { usePortalStore } from '@/lib/store';
import { uploadMediaFile, getMediaDisplayUrl, getYouTubeEmbedUrl } from '@/lib/mediaService';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Lock,
  User,
  Users,
  Calendar,
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
  KeyRound,
  FileText,
  Clock,
  ArrowRight,
  LogOut,
  AlertCircle
} from 'lucide-react';
import { Github } from '@/components/shared/Icons';

const PRESET_TECH = [
  'ESP32', 'Arduino', 'Raspberry Pi', 'Python', 'OpenCV', 'TensorFlow', 'PyTorch',
  'MQTT', 'LoRaWAN', 'Next.js', 'React', 'Node.js', 'FastAPI', 'YOLOv8', 'Edge AI',
  'Sensor Fusion', 'FreeRTOS', 'Flutter', 'TailwindCSS'
];

export default function PublicProposalPage() {
  const { batches, user, switchUser, addQuickSubmission } = usePortalStore();

  // Login Gate State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authenticatedStudent, setAuthenticatedStudent] = useState<any>(() => {
    // If logged in student already in session
    if (user.role === 'student' || user.role === 'team_lead') {
      const match = batches.find((b) => b.email === user.email || b.rollNo === user.rollNo);
      return match || {
        id: 'current-user',
        name: user.name,
        rollNo: user.rollNo || '2300290100099',
        email: user.email,
        branch: 'ECE',
        batchYear: '2026',
        teamName: user.teamName || 'Smart City Lab Team',
      };
    }
    return null;
  });

  // Proposal Form State
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [category, setCategory] = useState<'IoT & Sensors' | 'AI & Computer Vision' | 'Green Energy' | 'Smart Mobility' | 'Web & Cloud'>('IoT & Sensors');
  const [batchYear, setBatchYear] = useState('2026');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [teamName, setTeamName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<any[]>([]);
  const [memberSearch, setMemberSearch] = useState('');
  const [techStack, setTechStack] = useState<string[]>(['IoT & Sensors', 'ESP32']);
  const [customTech, setCustomTech] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [docsUrl, setDocsUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');

  // Media Upload States (Both Mandatory)
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);

  // Submission UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submittedProposal, setSubmittedProposal] = useState<any | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Filter registered students for teammate picker
  const filteredStudents = useMemo(() => {
    const q = memberSearch.trim().toLowerCase();
    const authId = authenticatedStudent?.id;
    const authRoll = authenticatedStudent?.rollNo?.toLowerCase();
    const selectedIds = new Set(selectedMembers.map((m) => m.id));

    return batches.filter((s) => {
      // Exclude team lead and already selected members
      if (s.id === authId || (authRoll && s.rollNo?.toLowerCase() === authRoll)) return false;
      if (selectedIds.has(s.id)) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.rollNo.toLowerCase().includes(q) ||
        (s.branch && s.branch.toLowerCase().includes(q))
      );
    });
  }, [batches, memberSearch, authenticatedStudent, selectedMembers]);

  // Handle Student Login Verification
  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const idClean = loginIdentifier.trim().toLowerCase();
    const passClean = loginPassword.trim();

    if (!idClean) {
      setAuthError('Please enter your University Roll Number or Institutional Email.');
      return;
    }

    // Verify student exists in registered database
    const matched = batches.find(
      (b) =>
        b.rollNo.toLowerCase() === idClean ||
        b.email.toLowerCase() === idClean ||
        (b.name.toLowerCase() === idClean && b.rollNo)
    );

    if (!matched) {
      setAuthError('Student record not found. Only registered KIET Smart City Lab students can submit proposals.');
      return;
    }

    // Check password (allow tempPassword or standard student password)
    if (matched.tempPassword && passClean && matched.tempPassword !== passClean && passClean !== 'scl2026' && passClean !== 'student123') {
      setAuthError('Invalid credentials. Please enter your student portal password or temporary passkey.');
      return;
    }

    setAuthenticatedStudent(matched);
    if (!teamName) {
      setTeamName(matched.teamName && matched.teamName !== 'Unassigned' ? matched.teamName : `Team ${matched.name.split(' ')[0]}`);
    }

    // Update global store session
    switchUser({
      role: 'student',
      name: matched.name,
      email: matched.email,
      rollNo: matched.rollNo,
      teamName: matched.teamName || `Team ${matched.name.split(' ')[0]}`,
    });
  };

  // Add teammate from database
  const handleAddMember = (student: any) => {
    setSelectedMembers((prev) => [...prev, student]);
  };

  // Remove teammate
  const handleRemoveMember = (studentId: string) => {
    setSelectedMembers((prev) => prev.filter((m) => m.id !== studentId));
  };

  // Tech stack toggles
  const handleToggleTech = (tech: string) => {
    if (techStack.includes(tech)) {
      setTechStack(techStack.filter((t) => t !== tech));
    } else {
      setTechStack([...techStack, tech]);
    }
  };

  const handleAddCustomTech = () => {
    if (!customTech.trim()) return;
    const val = customTech.trim();
    if (!techStack.includes(val)) {
      setTechStack([...techStack, val]);
    }
    setCustomTech('');
  };

  // Image Upload handler (Cloudflare R2)
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setFormError(null);

    try {
      const url = await uploadMediaFile(file, 'proposals/covers');
      setImageUrl(url);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Image upload failed';
      setFormError(`Image upload error: ${msg}`);
    } finally {
      setIsUploadingImage(false);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  // Video Upload handler (Cloudflare R2)
  const handleVideoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingVideo(true);
    setVideoProgress(0);
    setFormError(null);

    try {
      const url = await uploadMediaFile(
        file,
        'proposals/videos',
        undefined,
        (pct) => setVideoProgress(pct)
      );
      setVideoUrl(url);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Video upload failed';
      setFormError(`Video upload error: ${msg}`);
    } finally {
      setIsUploadingVideo(false);
      setVideoProgress(0);
      if (videoInputRef.current) videoInputRef.current.value = '';
    }
  };

  // Submit Proposal
  const handleSubmitProposal = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setFormError('Project title is required.');
      return;
    }
    if (!description.trim()) {
      setFormError('Project technical description is required.');
      return;
    }
    if (!teamName.trim()) {
      setFormError('Team name is required.');
      return;
    }
    if (!imageUrl.trim()) {
      setFormError('Project cover image is required. Please upload or paste an image URL.');
      return;
    }
    if (!videoUrl.trim()) {
      setFormError('Project video demonstration is required. Please upload an MP4/WebM video or enter a YouTube link.');
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
          members: allMemberNames,
          memberRoster: allMemberDetails,
          imageUrl: imageUrl.trim(),
          videoUrl: videoUrl.trim(),
          repoUrl: repoUrl.trim() || undefined,
          docsUrl: docsUrl.trim() || undefined,
          demoUrl: demoUrl.trim() || undefined,
          techStack: techStack.length > 0 ? techStack : [category, 'IoT'],
          submissionSource: 'Public Shareable Proposal Link',
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
    <div className="min-h-screen bg-slate-50 text-[#0A0A0A] flex flex-col font-sans">
      <Navbar />

      <main className="flex-grow pt-24 sm:pt-28 pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">

          {/* ══════════════════════════════════════════════════════════════════
              HEADER BANNER
          ══════════════════════════════════════════════════════════════════ */}
          <div className="text-center mb-8 space-y-2">
            <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-3.5 py-1 rounded-full shadow-xs">
              <Sparkles className="w-3.5 h-3.5" /> Official Research Submission Portal
            </span>
            <h1 className="text-[30px] sm:text-[40px] font-black tracking-tight text-[#0A0A0A] leading-tight">
              Project Proposal Submission
            </h1>
            <p className="text-[15px] text-[#6B7280] max-w-xl mx-auto">
              Submit your lab innovation, edge AI model, or smart city prototype for Super Admin verification and publication.
            </p>
          </div>

          {/* ══════════════════════════════════════════════════════════════════
              STEP 1: STUDENT AUTHENTICATION GATE (If not verified yet)
          ══════════════════════════════════════════════════════════════════ */}
          {!authenticatedStudent ? (
            <Card className="max-w-md mx-auto p-6 sm:p-8 space-y-6 border-[#E5E7EB] shadow-lg">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-xs">
                  <Lock className="w-6 h-6" />
                </div>
                <h2 className="text-[20px] font-bold text-[#0A0A0A]">Student Verification</h2>
                <p className="text-[13px] text-[#6B7280]">
                  Please enter your student credentials to verify your lab registration before submitting a proposal.
                </p>
              </div>

              {authError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[13px] flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleStudentLogin} className="space-y-4 text-left">
                <Input
                  label="University Roll Number or Email *"
                  placeholder="e.g. 2300290100099 or name@kiet.edu"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  icon={<User className="w-4 h-4 text-gray-400" />}
                  required
                />

                <Input
                  label="Portal Password / Passkey"
                  type="password"
                  placeholder="Enter your password or SCL PIN..."
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  icon={<KeyRound className="w-4 h-4 text-gray-400" />}
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full justify-center shadow-md shadow-blue-600/30"
                >
                  Verify & Open Proposal Form
                </Button>
              </form>

              <div className="pt-2 text-center text-[12px] text-[#6B7280] border-t border-gray-100">
                Not registered yet? Contact lab coordinator or check with Super Admin.
              </div>
            </Card>
          ) : submittedProposal ? (
            /* ══════════════════════════════════════════════════════════════════
                SUCCESS CONFIRMATION SCREEN
            ══════════════════════════════════════════════════════════════════ */
            <Card className="max-w-xl mx-auto p-8 text-center space-y-6 border-emerald-200 bg-white shadow-xl">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                  Status: Pending Super Admin Approval
                </span>
                <h2 className="text-[26px] font-black text-[#0A0A0A] tracking-tight">
                  Proposal Submitted Successfully!
                </h2>
                <p className="text-[14px] text-[#6B7280]">
                  Your project proposal for <strong className="text-[#0A0A0A]">"{submittedProposal.title}"</strong> has been queued for Super Admin review.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-2.5 text-[13px]">
                <div className="flex justify-between">
                  <span className="text-gray-500">Submission Tracking ID:</span>
                  <span className="font-mono font-bold text-blue-600">{submittedProposal.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Team Lead:</span>
                  <span className="font-semibold text-gray-900">{submittedProposal.teamLead}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Team Name:</span>
                  <span className="font-semibold text-gray-900">{submittedProposal.teamName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Registered Members:</span>
                  <span className="font-semibold text-gray-900">{submittedProposal.membersCount} students</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Submitted At:</span>
                  <span className="text-gray-700">{submittedProposal.submittedAt}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <Link href="/projects" className="w-full sm:w-auto">
                  <Button variant="outline" size="md" className="w-full justify-center">
                    Explore Public Showcase
                  </Button>
                </Link>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => {
                    setSubmittedProposal(null);
                    setTitle('');
                    setTagline('');
                    setDescription('');
                    setImageUrl('');
                    setVideoUrl('');
                    setSelectedMembers([]);
                  }}
                  className="w-full sm:w-auto justify-center"
                >
                  Submit Another Proposal
                </Button>
              </div>
            </Card>
          ) : (
            /* ══════════════════════════════════════════════════════════════════
                STEP 2: FULL PROJECT PROPOSAL FORM
            ══════════════════════════════════════════════════════════════════ */
            <form onSubmit={handleSubmitProposal} className="space-y-6 text-left">

              {/* Authenticated Student Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <MemberAvatar name={authenticatedStudent.name} size="md" isLead={true} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] font-bold text-[#0A0A0A]">{authenticatedStudent.name}</span>
                      <span className="text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full">
                        Team Lead
                      </span>
                    </div>
                    <div className="text-[12px] text-gray-500">
                      {authenticatedStudent.rollNo} • {authenticatedStudent.branch || 'ECE'} • Batch {authenticatedStudent.batchYear || '2026'}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setAuthenticatedStudent(null)}
                  className="text-[12px] font-medium text-gray-500 hover:text-red-600 flex items-center gap-1.5 transition-colors self-start sm:self-center"
                >
                  <LogOut className="w-3.5 h-3.5" /> Switch Student
                </button>
              </div>

              {formError && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[14px] flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Card 1: Project Identity */}
              <Card className="p-6 sm:p-7 space-y-5 border-[#E5E7EB]">
                <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-[14px]">
                    1
                  </div>
                  <div>
                    <h3 className="text-[16px] font-bold text-[#0A0A0A]">Project Identity & Overview</h3>
                    <p className="text-[12px] text-[#6B7280]">Title, category, timeline, and problem statement</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <Input
                    label="Project Name / Title *"
                    placeholder="e.g. Edge AI Adaptive Traffic Signal Network"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />

                  <Input
                    label="Short Tagline / Summary"
                    placeholder="e.g. Real-time edge compute sensor nodes optimizing junction queues via YOLOv8"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[13px] font-semibold text-[#0A0A0A]">Category *</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as typeof category)}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E7EB] bg-white text-[14px] text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                      >
                        <option value="IoT & Sensors">IoT & Sensors</option>
                        <option value="AI & Computer Vision">AI & Computer Vision</option>
                        <option value="Green Energy">Green Energy</option>
                        <option value="Smart Mobility">Smart Mobility</option>
                        <option value="Web & Cloud">Web & Cloud</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[13px] font-semibold text-[#0A0A0A]">Academic Batch *</label>
                      <select
                        value={batchYear}
                        onChange={(e) => setBatchYear(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E7EB] bg-white text-[14px] text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                      >
                        <option value="2026">Batch 2026</option>
                        <option value="2025">Batch 2025</option>
                        <option value="2024">Batch 2024</option>
                      </select>
                    </div>

                    <Input
                      label="Project Start Date *"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                    />
                  </div>

                  <Textarea
                    label="Comprehensive Project Description & Problem Statement *"
                    placeholder="Explain the urban problem being solved, system architecture, hardware components, algorithms, and real-world deployment goals..."
                    rows={5}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>
              </Card>

              {/* Card 2: Team Roster & Member Picker */}
              <Card className="p-6 sm:p-7 space-y-5 border-[#E5E7EB]">
                <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-[14px]">
                    2
                  </div>
                  <div>
                    <h3 className="text-[16px] font-bold text-[#0A0A0A]">Team Composition & Registered Students</h3>
                    <p className="text-[12px] text-[#6B7280]">Select team members only from registered lab students</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <Input
                    label="Team Name *"
                    placeholder="e.g. Team CyberVision, Team SmartGrid"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    required
                  />

                  {/* Team Lead Card */}
                  <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MemberAvatar name={authenticatedStudent.name} size="sm" isLead={true} />
                      <div>
                        <div className="text-[13px] font-bold text-[#0A0A0A] flex items-center gap-1.5">
                          <span>{authenticatedStudent.name}</span>
                          <span className="text-[9px] bg-blue-600 text-white px-1.5 py-0.2 rounded font-bold uppercase">
                            Team Lead
                          </span>
                        </div>
                        <div className="text-[11px] text-gray-500">
                          {authenticatedStudent.rollNo} • {authenticatedStudent.email}
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] text-blue-700 font-semibold">Author & Submitter</span>
                  </div>

                  {/* Selected Teammates List */}
                  {selectedMembers.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <label className="block text-[13px] font-semibold text-[#0A0A0A]">
                        Selected Team Members ({selectedMembers.length})
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {selectedMembers.map((m) => (
                          <div
                            key={m.id}
                            className="p-3 rounded-xl bg-white border border-gray-200 flex items-center justify-between shadow-2xs"
                          >
                            <div className="flex items-center gap-2.5">
                              <MemberAvatar name={m.name} size="sm" />
                              <div>
                                <div className="text-[13px] font-bold text-[#0A0A0A]">{m.name}</div>
                                <div className="text-[11px] text-gray-500">{m.rollNo} • {m.branch}</div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveMember(m.id)}
                              className="text-gray-400 hover:text-red-600 p-1 transition-colors"
                              title="Remove member"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add Teammate Search & Picker */}
                  <div className="space-y-2 pt-2 border-t border-gray-100">
                    <label className="block text-[13px] font-semibold text-[#0A0A0A]">
                      Add Team Members from Registered Database
                    </label>
                    <Input
                      placeholder="Search students by name, roll number, or branch..."
                      value={memberSearch}
                      onChange={(e) => setMemberSearch(e.target.value)}
                      icon={<Search className="w-4 h-4 text-gray-400" />}
                      className="text-[13px]"
                    />

                    <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-xl p-2 divide-y divide-gray-100 bg-[#FAFAFA]">
                      {filteredStudents.length === 0 ? (
                        <p className="text-[13px] text-gray-500 text-center py-3">
                          {memberSearch ? 'No matching registered students found' : 'All available students added'}
                        </p>
                      ) : (
                        filteredStudents.slice(0, 10).map((s) => (
                          <div
                            key={s.id}
                            onClick={() => handleAddMember(s)}
                            className="flex items-center justify-between p-2.5 rounded-lg hover:bg-white cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-2.5">
                              <MemberAvatar name={s.name} size="sm" />
                              <div>
                                <div className="text-[13px] font-bold text-[#0A0A0A]">{s.name}</div>
                                <div className="text-[11px] text-gray-500">
                                  {s.rollNo} • {s.branch} • Batch {s.batchYear}
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 text-[12px] font-semibold hover:bg-blue-100 flex items-center gap-1 transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" /> Add
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Card 3: Tech Stack & Project Links */}
              <Card className="p-6 sm:p-7 space-y-5 border-[#E5E7EB]">
                <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-[14px]">
                    3
                  </div>
                  <div>
                    <h3 className="text-[16px] font-bold text-[#0A0A0A]">Tech Stack & Project Links</h3>
                    <p className="text-[12px] text-[#6B7280]">GitHub repository, documentation paper, and live links</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Tech stack selector */}
                  <div className="space-y-2">
                    <label className="block text-[13px] font-semibold text-[#0A0A0A]">
                      Technologies Used ({techStack.length} selected)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {PRESET_TECH.map((tech) => {
                        const isSelected = techStack.includes(tech);
                        return (
                          <button
                            key={tech}
                            type="button"
                            onClick={() => handleToggleTech(tech)}
                            className={`px-3 py-1.5 rounded-lg text-[13px] font-medium border transition-all ${
                              isSelected
                                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            {tech}
                          </button>
                        );
                      })}
                    </div>

                    {/* Custom tech input */}
                    <div className="flex gap-2 pt-2">
                      <Input
                        placeholder="Add other tech (e.g. MQTT, ROS2)..."
                        value={customTech}
                        onChange={(e) => setCustomTech(e.target.value)}
                        className="text-[13px]"
                      />
                      <Button type="button" variant="outline" size="sm" onClick={handleAddCustomTech}>
                        Add Tag
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                    <Input
                      label="GitHub Repository Link"
                      placeholder="https://github.com/organization/repo"
                      value={repoUrl}
                      onChange={(e) => setRepoUrl(e.target.value)}
                      icon={<Github className="w-4 h-4 text-gray-400" />}
                    />

                    <Input
                      label="Documentation / Paper Link"
                      placeholder="https://drive.google.com/... or Notion link"
                      value={docsUrl}
                      onChange={(e) => setDocsUrl(e.target.value)}
                      icon={<FileText className="w-4 h-4 text-gray-400" />}
                    />
                  </div>

                  <Input
                    label="Live Demo / Deployed Link (Optional)"
                    placeholder="https://my-smart-project.vercel.app"
                    value={demoUrl}
                    onChange={(e) => setDemoUrl(e.target.value)}
                    icon={<ExternalLink className="w-4 h-4 text-gray-400" />}
                  />
                </div>
              </Card>

              {/* Card 4: Mandatory Media (Image + Video) */}
              <Card className="p-6 sm:p-7 space-y-6 border-[#E5E7EB]">
                <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-[14px]">
                    4
                  </div>
                  <div>
                    <h3 className="text-[16px] font-bold text-[#0A0A0A]">Media Assets (Both Mandatory) *</h3>
                    <p className="text-[12px] text-[#6B7280]">High-resolution poster image and functional video walkthrough</p>
                  </div>
                </div>

                {/* Cover Image Upload (Mandatory) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-[13px] font-semibold text-[#0A0A0A]">
                      Project Cover Image * <span className="text-red-500 font-bold">(Mandatory)</span>
                    </label>
                    {imageUrl && <span className="text-[11px] font-bold text-emerald-600">✓ Image Uploaded</span>}
                  </div>

                  <div className="border-2 border-dashed border-[#E5E7EB] hover:border-blue-400 rounded-xl p-5 text-center transition-colors bg-[#FAFAFA] relative">
                    <input
                      type="file"
                      ref={imageInputRef}
                      onChange={handleImageFileChange}
                      accept="image/*"
                      className="hidden"
                    />

                    {imageUrl ? (
                      <div className="space-y-3">
                        <div className="relative h-48 w-full max-w-md mx-auto rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                          <img src={displayImageUrl} alt="Cover Preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setImageUrl('')}
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => imageInputRef.current?.click()}
                          disabled={isUploadingImage}
                        >
                          {isUploadingImage ? 'Uploading...' : 'Replace Image'}
                        </Button>
                      </div>
                    ) : (
                      <div className="py-4 space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                          {isUploadingImage ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
                        </div>
                        <div>
                          <p className="text-[14px] font-bold text-[#0A0A0A]">
                            {isUploadingImage ? 'Uploading to Cloudflare R2...' : 'Upload Project Cover Image'}
                          </p>
                          <p className="text-[12px] text-gray-500 mt-0.5">PNG, JPG, or WebP (16:9 ratio recommended)</p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => imageInputRef.current?.click()}
                          disabled={isUploadingImage}
                        >
                          Browse Image File
                        </Button>
                      </div>
                    )}
                  </div>
                  <Input
                    placeholder="Or enter direct image URL (https://...)"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="text-[13px]"
                  />
                </div>

                {/* Video Demonstration Upload (Mandatory) */}
                <div className="space-y-2 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <label className="block text-[13px] font-semibold text-[#0A0A0A]">
                      Project Video Demonstration * <span className="text-red-500 font-bold">(Mandatory)</span>
                    </label>
                    {videoUrl && <span className="text-[11px] font-bold text-emerald-600">✓ Video Attached</span>}
                  </div>

                  <input
                    type="file"
                    ref={videoInputRef}
                    onChange={handleVideoFileChange}
                    accept="video/*"
                    className="hidden"
                  />

                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                      <Input
                        placeholder="Enter YouTube link (https://youtu.be/...) or upload MP4 below"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        icon={<Video className="w-4 h-4 text-gray-400" />}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="md"
                      onClick={() => videoInputRef.current?.click()}
                      disabled={isUploadingVideo}
                      icon={isUploadingVideo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      className="shrink-0"
                    >
                      {isUploadingVideo
                        ? videoProgress > 0 ? `Uploading (${videoProgress}%)...` : 'Uploading...'
                        : 'Upload MP4 Video'}
                    </Button>
                  </div>

                  {/* Live Video Preview Box */}
                  {videoUrl && (
                    <div className="mt-3 p-3 bg-slate-900 rounded-xl overflow-hidden text-center">
                      {ytEmbedUrl ? (
                        <div className="aspect-video w-full max-w-lg mx-auto rounded-lg overflow-hidden">
                          <iframe
                            src={ytEmbedUrl}
                            title="Video Demo"
                            allowFullScreen
                            className="w-full h-full border-0"
                          />
                        </div>
                      ) : (
                        <video
                          src={displayVideoUrl}
                          controls
                          className="max-h-56 mx-auto rounded-lg"
                        />
                      )}
                      <div className="flex items-center justify-between pt-2 px-1 text-[12px]">
                        <span className="text-gray-300 font-mono truncate max-w-xs">{videoUrl}</span>
                        <button
                          type="button"
                          onClick={() => setVideoUrl('')}
                          className="text-red-400 hover:text-red-300 font-semibold"
                        >
                          Remove Video
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Bottom Submit Bar */}
              <div className="flex items-center justify-between p-5 bg-white rounded-2xl border border-[#E5E7EB] shadow-sm">
                <Link href="/projects">
                  <Button type="button" variant="outline" size="sm">
                    Cancel
                  </Button>
                </Link>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={isSubmitting || isUploadingImage || isUploadingVideo}
                  icon={isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  className="shadow-md shadow-blue-600/30"
                >
                  {isSubmitting ? 'Submitting Proposal...' : 'Submit Project Proposal'}
                </Button>
              </div>

            </form>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
