'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Card from '@/components/shared/Card';
import Button from '@/components/shared/Button';
import { Input, Textarea } from '@/components/shared/Input';
import MemberAvatar from '@/components/shared/MemberAvatar';
import { usePortalStore } from '@/lib/store';
import { ProjectItem } from '@/lib/data';
import { uploadMediaFile } from '@/lib/mediaService';
import { 
  ArrowLeft, 
  Upload, 
  Sparkles, 
  Image as ImageIcon, 
  Video, 
  ExternalLink, 
  FolderGit2, 
  ShieldCheck, 
  Check, 
  Plus, 
  X, 
  Layers, 
  Users, 
  Cpu, 
  Eye, 
  CheckCircle2, 
  Loader2,
  Trash2,
  Calendar
} from 'lucide-react';
import { Github } from '@/components/shared/Icons';

const PRESET_TECH_STACKS = [
  'ESP32', 'Arduino', 'Raspberry Pi', 'Python', 'OpenCV', 'TensorFlow', 'PyTorch', 
  'MQTT', 'LoRaWAN', 'Next.js', 'React', 'TailwindCSS', 'Node.js', 'Firebase', 
  'FastAPI', 'Docker', 'YOLOv8', 'Edge AI', 'Zigbee', 'Sensor Fusion'
];

function ProjectEditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id') || searchParams.get('edit');

  const { 
    projects, 
    teams, 
    batches, 
    batchInfos, 
    addProject, 
    updateProject 
  } = usePortalStore();

  const isEditing = Boolean(editId);
  const existingProject = isEditing ? projects.find((p) => p.id === editId) : null;

  // Form states
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ProjectItem['category']>('IoT & Sensors');
  const [batchYear, setBatchYear] = useState<ProjectItem['batchYear']>('2026');
  const [featured, setFeatured] = useState(true);
  const [isVisible, setIsVisible] = useState(true);

  // Team & Author state
  const [teamSelectionMode, setTeamSelectionMode] = useState<'existing_team' | 'crm_students' | 'custom'>('existing_team');
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [teamName, setTeamName] = useState('');
  const [teamLead, setTeamLead] = useState('');
  const [members, setMembers] = useState<string[]>([]);
  const [customMemberInput, setCustomMemberInput] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [studentSearch, setStudentSearch] = useState('');

  // Media state
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);

  // Tech stack & Links
  const [techStack, setTechStack] = useState<string[]>(['IoT & Sensors', 'ESP32']);
  const [customTechInput, setCustomTechInput] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [repoUrl, setRepoUrl] = useState('');

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [previewTab, setPreviewTab] = useState<'card' | 'details'>('card');

  const imageFileInputRef = useRef<HTMLInputElement>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);

  // Populate data if editing
  useEffect(() => {
    if (existingProject) {
      setTitle(existingProject.title || '');
      setTagline(existingProject.tagline || '');
      setDescription(existingProject.description || '');
      setCategory(existingProject.category || 'IoT & Sensors');
      setBatchYear(existingProject.batchYear || '2026');
      setFeatured(existingProject.featured ?? true);
      setIsVisible(existingProject.isVisible !== false);
      setTeamName(existingProject.teamName || '');
      setTeamLead(existingProject.teamLead || '');
      setMembers(existingProject.members || []);
      setImageUrl(existingProject.imageUrl || '');
      setVideoUrl(existingProject.videoUrl || '');
      setDemoUrl(existingProject.demoUrl || '');
      setRepoUrl(existingProject.repoUrl || '');
      setTechStack(existingProject.techStack || []);

      // Check if matches an existing team
      const matchedTeam = teams.find((t) => t.name === existingProject.teamName);
      if (matchedTeam) {
        setTeamSelectionMode('existing_team');
        setSelectedTeamId(matchedTeam.id);
      } else {
        setTeamSelectionMode('custom');
      }
    }
  }, [existingProject]);

  // Handle existing team selection
  const handleSelectTeam = (tId: string) => {
    setSelectedTeamId(tId);
    if (!tId) return;
    const found = teams.find((t) => t.id === tId);
    if (found) {
      setTeamName(found.name);
      setTeamLead(found.teamLead?.name || 'Team Lead');
      const roster = (found.members || []).map((m) => m.name);
      setMembers(roster.length > 0 ? roster : [found.teamLead?.name || 'Team Lead']);
    }
  };

  // Toggle student selection from CRM
  const handleToggleStudent = (studentId: string) => {
    const student = batches.find((s) => s.id === studentId);
    if (!student) return;

    let nextIds = [...selectedStudentIds];
    if (nextIds.includes(studentId)) {
      nextIds = nextIds.filter((id) => id !== studentId);
    } else {
      nextIds.push(studentId);
    }
    setSelectedStudentIds(nextIds);

    const selectedStudents = batches.filter((s) => nextIds.includes(s.id));
    const memberNames = selectedStudents.map((s) => s.name);
    setMembers(memberNames);

    if (selectedStudents.length > 0) {
      const lead = selectedStudents.find((s) => s.isTeamLead || s.role === 'Team Lead') || selectedStudents[0];
      setTeamLead(lead.name);
      if (!teamName || teamName === 'Smart City Lab Team') {
        setTeamName(lead.teamName && lead.teamName !== 'Unassigned' ? lead.teamName : `Team ${lead.name.split(' ')[0]}`);
      }
    }
  };

  // Add custom member
  const handleAddCustomMember = () => {
    if (!customMemberInput.trim()) return;
    if (!members.includes(customMemberInput.trim())) {
      const updated = [...members, customMemberInput.trim()];
      setMembers(updated);
      if (!teamLead) setTeamLead(customMemberInput.trim());
    }
    setCustomMemberInput('');
  };

  // Remove member
  const handleRemoveMember = (mName: string) => {
    const updated = members.filter((m) => m !== mName);
    setMembers(updated);
    if (teamLead === mName) {
      setTeamLead(updated[0] || '');
    }
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
    if (!customTechInput.trim()) return;
    const val = customTechInput.trim();
    if (!techStack.includes(val)) {
      setTechStack([...techStack, val]);
    }
    setCustomTechInput('');
  };

  // File upload handlers
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setUploadSuccessMessage(null);

    try {
      const uploadedUrl = await uploadMediaFile(file, 'projects/covers');
      setImageUrl(uploadedUrl);
      setUploadSuccessMessage('Cover image uploaded and verified successfully!');
      setTimeout(() => setUploadSuccessMessage(null), 3500);
    } catch (err: unknown) {
      const eMsg = err instanceof Error ? err.message : 'Image upload error';
      setNotification({ type: 'error', message: `Upload failed: ${eMsg}` });
    } finally {
      setIsUploadingImage(false);
      if (imageFileInputRef.current) imageFileInputRef.current.value = '';
    }
  };

  const handleVideoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingVideo(true);
    setUploadSuccessMessage(null);

    try {
      const uploadedUrl = await uploadMediaFile(file, 'projects/videos');
      setVideoUrl(uploadedUrl);
      setUploadSuccessMessage('Project video uploaded and linked successfully!');
      setTimeout(() => setUploadSuccessMessage(null), 3500);
    } catch (err: unknown) {
      const eMsg = err instanceof Error ? err.message : 'Video upload error';
      setNotification({ type: 'error', message: `Upload failed: ${eMsg}` });
    } finally {
      setIsUploadingVideo(false);
      if (videoFileInputRef.current) videoFileInputRef.current.value = '';
    }
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setNotification({ type: 'error', message: 'Project title is required.' });
      return;
    }
    if (!description.trim()) {
      setNotification({ type: 'error', message: 'Project description is required.' });
      return;
    }

    setIsSubmitting(true);
    setNotification(null);

    try {
      const finalImage = imageUrl.trim() || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80';
      const finalTeamName = teamName.trim() || 'Smart City Lab Team';
      const finalTeamLead = teamLead.trim() || (members[0] || 'Team Lead');
      const finalMembers = members.length > 0 ? members : [finalTeamLead];
      const finalTechStack = techStack.length > 0 ? techStack : [category, 'IoT'];

      if (isEditing && editId) {
        updateProject(editId, {
          title: title.trim(),
          tagline: tagline.trim() || title.trim(),
          description: description.trim(),
          category,
          batchYear,
          teamName: finalTeamName,
          teamLead: finalTeamLead,
          members: finalMembers,
          imageUrl: finalImage,
          videoUrl: videoUrl.trim() || undefined,
          demoUrl: demoUrl.trim() || undefined,
          repoUrl: repoUrl.trim() || undefined,
          techStack: finalTechStack,
          featured,
          isVisible,
        });

        setNotification({ type: 'success', message: 'Project updated and synced to Firebase Firestore!' });
      } else {
        addProject({
          title: title.trim(),
          tagline: tagline.trim() || title.trim(),
          description: description.trim(),
          category,
          batchYear,
          teamName: finalTeamName,
          teamLead: finalTeamLead,
          members: finalMembers,
          imageUrl: finalImage,
          videoUrl: videoUrl.trim() || undefined,
          demoUrl: demoUrl.trim() || undefined,
          repoUrl: repoUrl.trim() || undefined,
          views: 0,
          featured,
          status: 'approved',
          isVisible,
          publishedAt: new Date().toISOString().split('T')[0],
          techStack: finalTechStack,
        });

        setNotification({ type: 'success', message: 'Project successfully created and published to live showcase!' });
      }

      setTimeout(() => {
        router.push('/admin/projects');
      }, 1200);

    } catch (err: unknown) {
      const eMsg = err instanceof Error ? err.message : 'Save error';
      setNotification({ type: 'error', message: `Could not save project: ${eMsg}` });
      setIsSubmitting(false);
    }
  };

  // Available batch options
  const batchOptions = batchInfos.length > 0
    ? batchInfos.map((b) => b.year)
    : ['2026', '2025', '2024'];

  const filteredCrmStudents = batches.filter((s) => {
    if (!studentSearch) return true;
    const q = studentSearch.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.rollNo.toLowerCase().includes(q) || (s.teamName && s.teamName.toLowerCase().includes(q));
  });

  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto pb-20">
      {/* Top Header with Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-5">
        <div className="flex items-center gap-3.5">
          <Link
            href="/admin/projects"
            className="p-2.5 rounded-xl border border-[#E5E7EB] bg-white text-[#0A0A0A] hover:bg-[#F8F9FA] hover:border-gray-300 transition-all shadow-xs flex items-center gap-1.5 text-[14px] font-semibold"
          >
            <ArrowLeft className="w-4 h-4 text-[#6B7280]" />
            <span>Back to Projects</span>
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[24px] sm:text-[28px] font-extrabold text-[#0A0A0A] tracking-tight">
                {isEditing ? 'Edit Project' : 'Add New Lab Project'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                {isEditing ? 'Editor' : 'Showcase Creator'}
              </span>
            </div>
            <p className="text-[13px] text-[#6B7280] mt-0.5">
              {isEditing 
                ? 'Update project details, media assets, team contributors, and live links.'
                : 'Upload research projects, prototypes, and innovations directly to Firebase and the public showcase.'}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2.5">
          <Link href="/admin/projects">
            <Button variant="outline" size="sm">
              Cancel
            </Button>
          </Link>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            disabled={isSubmitting || isUploadingImage || isUploadingVideo}
            icon={isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          >
            {isSubmitting ? 'Saving to Firebase...' : isEditing ? 'Update & Sync Project' : 'Publish Project Live'}
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {notification && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-red-50 border-red-200 text-red-900'
          }`}
        >
          <div className="flex items-center gap-2.5 text-[14px] font-medium">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <X className="w-5 h-5 text-red-600 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {uploadSuccessMessage && (
        <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl text-[13px] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
          <span>{uploadSuccessMessage}</span>
        </div>
      )}

      {/* Main Grid: Form + Live Card Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Form Area (7 cols on large screens) */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
          
          {/* Card 1: Project Essentials */}
          <Card className="p-6 sm:p-7 space-y-5 border-[#E5E7EB]">
            <div className="flex items-center gap-2.5 pb-2 border-b border-[#F3F4F6]">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-[14px]">
                1
              </div>
              <div>
                <h3 className="text-[16px] font-bold text-[#0A0A0A]">Project Essentials</h3>
                <p className="text-[12px] text-[#6B7280]">Primary identity, category, and academic batch</p>
              </div>
            </div>

            <div className="space-y-4">
              <Input
                label="Project Title *"
                placeholder="e.g. Edge AI Traffic Sentinel & License Plate Recognizer"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <Input
                label="Short Tagline / Summary"
                placeholder="e.g. Real-time edge compute camera processing automated traffic congestion alerts"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[13px] font-semibold text-[#0A0A0A]">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ProjectItem['category'])}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E7EB] bg-white text-[14px] text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors"
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
                    onChange={(e) => setBatchYear(e.target.value as ProjectItem['batchYear'])}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E7EB] bg-white text-[14px] text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors"
                  >
                    {batchOptions.map((b) => (
                      <option key={b} value={b}>Batch {b}</option>
                    ))}
                  </select>
                </div>
              </div>

              <Textarea
                label="Full Description & Engineering Overview *"
                placeholder="Provide a comprehensive technical description of the project, problem statement solved, hardware components used, and real-world impact..."
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />

              <div className="flex flex-wrap items-center gap-6 pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isVisible}
                    onChange={(e) => setIsVisible(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-[13px] font-medium text-[#0A0A0A]">Visible on Public Showcase</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-[13px] font-medium text-[#0A0A0A]">Featured Project Badge</span>
                </label>
              </div>
            </div>
          </Card>

          {/* Card 2: Media & Assets Upload */}
          <Card className="p-6 sm:p-7 space-y-5 border-[#E5E7EB]">
            <div className="flex items-center gap-2.5 pb-2 border-b border-[#F3F4F6]">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-[14px]">
                2
              </div>
              <div>
                <h3 className="text-[16px] font-bold text-[#0A0A0A]">Media & Visual Showcase</h3>
                <p className="text-[12px] text-[#6B7280]">Directly upload project image / poster and video demonstration</p>
              </div>
            </div>

            {/* Cover Image Upload Area */}
            <div className="space-y-2">
              <label className="block text-[13px] font-semibold text-[#0A0A0A]">
                Project Cover Image (PNG, JPG, WebP)
              </label>

              <div className="border-2 border-dashed border-[#E5E7EB] hover:border-blue-400 rounded-xl p-5 text-center transition-colors bg-[#FAFAFA] relative">
                <input
                  type="file"
                  ref={imageFileInputRef}
                  onChange={handleImageFileChange}
                  accept="image/*"
                  className="hidden"
                />

                {imageUrl ? (
                  <div className="space-y-3">
                    <div className="relative h-44 w-full max-w-md mx-auto rounded-lg overflow-hidden border border-gray-200 shadow-xs">
                      <img src={imageUrl} alt="Project Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImageUrl('')}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                        title="Remove Image"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        icon={<Upload className="w-3.5 h-3.5" />}
                        onClick={() => imageFileInputRef.current?.click()}
                        disabled={isUploadingImage}
                      >
                        {isUploadingImage ? 'Uploading...' : 'Replace Image'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="py-4 space-y-3">
                    <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                      {isUploadingImage ? <Loader2 className="w-6 h-6 animate-spin" /> : <ImageIcon className="w-6 h-6" />}
                    </div>
                    <div>
                      <p className="text-[14px] font-bold text-[#0A0A0A]">
                        {isUploadingImage ? 'Uploading Cover Image...' : 'Click to Upload Cover Image'}
                      </p>
                      <p className="text-[12px] text-[#6B7280] mt-0.5">
                        High-resolution 16:9 images look best in the showcase cards
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      icon={<Upload className="w-3.5 h-3.5" />}
                      onClick={() => imageFileInputRef.current?.click()}
                      disabled={isUploadingImage}
                    >
                      Browse Files
                    </Button>
                  </div>
                )}
              </div>

              {/* Direct image URL input fallback */}
              <div className="pt-1">
                <Input
                  placeholder="Or paste external image URL (e.g. https://images.unsplash.com/...)"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="text-[13px]"
                />
              </div>
            </div>

            {/* Video Demo Upload / Link Area */}
            <div className="space-y-2 pt-2 border-t border-[#F3F4F6]">
              <label className="block text-[13px] font-semibold text-[#0A0A0A]">
                Video Demonstration / MP4 / Walkthrough (Optional)
              </label>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="file"
                  ref={videoFileInputRef}
                  onChange={handleVideoFileChange}
                  accept="video/*"
                  className="hidden"
                />

                <div className="flex-1">
                  <Input
                    placeholder="Enter video URL (MP4 link, YouTube, or direct CDN stream)"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                  />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  icon={isUploadingVideo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  onClick={() => videoFileInputRef.current?.click()}
                  disabled={isUploadingVideo}
                  className="shrink-0"
                >
                  {isUploadingVideo ? 'Uploading Video...' : 'Upload Video File'}
                </Button>
              </div>

              {videoUrl && (
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-[12px] flex items-center justify-between">
                  <span className="font-mono text-[#2563EB] truncate max-w-xs">{videoUrl}</span>
                  <button
                    type="button"
                    onClick={() => setVideoUrl('')}
                    className="text-red-500 hover:text-red-700 text-[11px] font-semibold"
                  >
                    Remove Video
                  </button>
                </div>
              )}
            </div>
          </Card>

          {/* Card 3: Research Team & Authors */}
          <Card className="p-6 sm:p-7 space-y-5 border-[#E5E7EB]">
            <div className="flex items-center gap-2.5 pb-2 border-b border-[#F3F4F6]">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-[14px]">
                3
              </div>
              <div>
                <h3 className="text-[16px] font-bold text-[#0A0A0A]">Research Team & Contributors</h3>
                <p className="text-[12px] text-[#6B7280]">Link existing team, pick registered interns, or enter names</p>
              </div>
            </div>

            {/* Selection mode toggle */}
            <div className="grid grid-cols-3 gap-2 bg-[#F8F9FA] p-1.5 rounded-xl border border-[#E5E7EB]">
              {[
                { id: 'existing_team', label: 'Registered Team' },
                { id: 'crm_students', label: 'Pick Students' },
                { id: 'custom', label: 'Custom Names' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setTeamSelectionMode(m.id as typeof teamSelectionMode)}
                  className={`py-2 px-3 text-[13px] font-semibold rounded-lg transition-all ${
                    teamSelectionMode === m.id
                      ? 'bg-white text-blue-600 shadow-xs border border-[#E5E7EB]'
                      : 'text-[#6B7280] hover:text-[#0A0A0A]'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Mode 1: Existing Team */}
            {teamSelectionMode === 'existing_team' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-[13px] font-semibold text-[#0A0A0A]">Select Registered Team</label>
                  <select
                    value={selectedTeamId}
                    onChange={(e) => handleSelectTeam(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E7EB] bg-white text-[14px] text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  >
                    <option value="">-- Choose a Lab Team --</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} (Lead: {t.teamLead?.name || 'Unassigned'}, {t.membersCount} members)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Team Name"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="e.g. Team CyberVision"
                  />
                  <Input
                    label="Team Lead Name"
                    value={teamLead}
                    onChange={(e) => setTeamLead(e.target.value)}
                    placeholder="e.g. Aarav Sharma"
                  />
                </div>
              </div>
            )}

            {/* Mode 2: CRM Students Selection */}
            {teamSelectionMode === 'crm_students' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-[13px] font-semibold text-[#0A0A0A]">
                      Select Registered Students from CRM ({selectedStudentIds.length} selected)
                    </label>
                    <span className="text-[12px] text-[#6B7280]">{batches.length} students available</span>
                  </div>
                  <Input
                    placeholder="Search by student name, roll number, or domain..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="text-[13px]"
                  />
                </div>

                <div className="max-h-56 overflow-y-auto border border-[#E5E7EB] rounded-xl p-2 divide-y divide-gray-100 bg-[#FAFAFA]">
                  {filteredCrmStudents.length === 0 ? (
                    <p className="text-[13px] text-[#6B7280] text-center py-4">No matching students found</p>
                  ) : (
                    filteredCrmStudents.map((s) => {
                      const isSelected = selectedStudentIds.includes(s.id);
                      return (
                        <div
                          key={s.id}
                          onClick={() => handleToggleStudent(s.id)}
                          className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors ${
                            isSelected ? 'bg-blue-50/70 border border-blue-200' : 'hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <MemberAvatar name={s.name} size="sm" isLead={s.isTeamLead || s.role === 'Team Lead'} />
                            <div>
                              <div className="text-[13px] font-bold text-[#0A0A0A] flex items-center gap-1.5">
                                {s.name}
                                {s.isTeamLead && (
                                  <span className="text-[9px] bg-blue-600 text-white px-1.5 py-0.2 rounded font-bold">
                                    LEAD
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-[#6B7280]">
                                {s.rollNo} • {s.branch} • Batch {s.batchYear}
                              </div>
                            </div>
                          </div>
                          <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                            isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 bg-white'
                          }`}>
                            {isSelected && <Check className="w-3.5 h-3.5" />}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Team Name"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="e.g. Edge AI Team"
                  />
                  <Input
                    label="Team Lead Name"
                    value={teamLead}
                    onChange={(e) => setTeamLead(e.target.value)}
                    placeholder="e.g. Lead Student"
                  />
                </div>
              </div>
            )}

            {/* Mode 3: Custom Entry */}
            {teamSelectionMode === 'custom' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Team Name"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="e.g. Autonomous Systems Group"
                  />
                  <Input
                    label="Team Lead Name"
                    value={teamLead}
                    onChange={(e) => setTeamLead(e.target.value)}
                    placeholder="e.g. Aarav Sharma"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[13px] font-semibold text-[#0A0A0A]">Add Team Members</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter student member name..."
                      value={customMemberInput}
                      onChange={(e) => setCustomMemberInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomMember();
                        }
                      }}
                    />
                    <Button type="button" variant="outline" onClick={handleAddCustomMember} icon={<Plus className="w-4 h-4" />}>
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Members List Chips */}
            {members.length > 0 && (
              <div className="space-y-1.5 pt-2">
                <label className="block text-[12px] font-semibold text-[#6B7280]">
                  Active Team Roster ({members.length} contributors)
                </label>
                <div className="flex flex-wrap gap-2">
                  {members.map((mName) => (
                    <span
                      key={mName}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[13px] border ${
                        mName === teamLead
                          ? 'bg-blue-50 border-blue-200 text-blue-700 font-bold'
                          : 'bg-gray-50 border-gray-200 text-[#0A0A0A]'
                      }`}
                    >
                      {mName}
                      {mName === teamLead && <span className="text-[9px] bg-blue-600 text-white px-1 rounded">LEAD</span>}
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(mName)}
                        className="text-gray-400 hover:text-red-500 ml-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Card 4: Tech Stack & Deployment Links */}
          <Card className="p-6 sm:p-7 space-y-5 border-[#E5E7EB]">
            <div className="flex items-center gap-2.5 pb-2 border-b border-[#F3F4F6]">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-[14px]">
                4
              </div>
              <div>
                <h3 className="text-[16px] font-bold text-[#0A0A0A]">Tech Stack & Project Links</h3>
                <p className="text-[12px] text-[#6B7280]">Technologies used, GitHub repository, and live deployment</p>
              </div>
            </div>

            {/* Tech Stack Pills Selector */}
            <div className="space-y-2">
              <label className="block text-[13px] font-semibold text-[#0A0A0A]">Technologies & Frameworks</label>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_TECH_STACKS.map((tech) => {
                  const isSelected = techStack.includes(tech);
                  return (
                    <button
                      key={tech}
                      type="button"
                      onClick={() => handleToggleTech(tech)}
                      className={`px-3 py-1 rounded-lg text-[12px] font-medium border transition-colors ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white text-[#6B7280] border-[#E5E7EB] hover:text-[#0A0A0A] hover:bg-gray-50'
                      }`}
                    >
                      {isSelected ? `✓ ${tech}` : `+ ${tech}`}
                    </button>
                  );
                })}
              </div>

              {/* Add Custom Tech Input */}
              <div className="flex gap-2 pt-2">
                <Input
                  placeholder="Or type custom framework/hardware (e.g. ROS2, FreeRTOS)..."
                  value={customTechInput}
                  onChange={(e) => setCustomTechInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomTech();
                    }
                  }}
                  className="text-[13px]"
                />
                <Button type="button" variant="outline" size="sm" onClick={handleAddCustomTech} icon={<Plus className="w-3.5 h-3.5" />}>
                  Add Tag
                </Button>
              </div>
            </div>

            {/* Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#F3F4F6]">
              <Input
                label="GitHub Repository Link"
                placeholder="https://github.com/org/repo"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                icon={<Github className="w-4 h-4 text-gray-400" />}
              />
              <Input
                label="Live Demo / Prototype URL"
                placeholder="https://project-demo.kiet.edu"
                value={demoUrl}
                onChange={(e) => setDemoUrl(e.target.value)}
                icon={<ExternalLink className="w-4 h-4 text-gray-400" />}
              />
            </div>
          </Card>

          {/* Bottom Submit Bar */}
          <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-[#E5E7EB] shadow-xs">
            <Link href="/admin/projects">
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
            >
              {isSubmitting ? 'Syncing with Firestore...' : isEditing ? 'Save Changes' : 'Publish Project Live'}
            </Button>
          </div>

        </form>

        {/* Right Sticky Preview (5 cols on large screens) */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
          <div className="flex items-center justify-between">
            <h3 className="text-[14px] font-bold text-[#0A0A0A] flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-600" />
              Live Public Card Preview
            </h3>
            <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Real-time update
            </span>
          </div>

          {/* Render the Exact Project Card */}
          <div className="border border-[#E5E7EB] rounded-[20px] bg-white overflow-hidden shadow-md">
            {/* Media Header */}
            <div className="relative h-48 w-full bg-slate-950 overflow-hidden">
              {videoUrl ? (
                <div className="relative w-full h-full">
                  <video src={videoUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/40 pointer-events-none" />
                  <div className="absolute bottom-3 left-3">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-white bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                      <Video className="w-3 h-3 text-red-400" />
                      VIDEO
                    </span>
                  </div>
                </div>
              ) : imageUrl ? (
                <div className="relative w-full h-full">
                  <img src={imageUrl} alt={title || 'Project'} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30 pointer-events-none" />
                </div>
              ) : (
                <div className="relative w-full h-full bg-gradient-to-br from-cyan-950 via-teal-900/80 to-slate-900 p-4 flex flex-col justify-between select-none">
                  <div className="relative z-10 flex items-center justify-between">
                    <span className="text-3xl font-black text-cyan-400 opacity-40">◈</span>
                  </div>
                  <span className="text-xs text-white/50">Upload an image to see live preview</span>
                </div>
              )}

              {/* Batch badge */}
              <div className="absolute top-3 left-3 z-10">
                <span className="text-[11px] font-bold uppercase tracking-wider text-white/95 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15 shadow-xs">
                  Batch {batchYear}
                </span>
              </div>

              {/* Verified badge */}
              <div className="absolute top-3 right-3 z-10">
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-white/95 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15 shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Verified
                </span>
              </div>
            </div>

            {/* Card Content Body */}
            <div className="p-5 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 block">
                {category}
              </span>
              <h3 className="text-[17px] font-bold text-[#0A0A0A] tracking-tight leading-snug line-clamp-2">
                {title || 'Your Project Title Will Appear Here'}
              </h3>
              <p className="text-[13px] text-[#6B7280] line-clamp-2 leading-relaxed">
                {tagline || description || 'Provide a brief tagline or technical summary to describe this research project.'}
              </p>

              {/* Tech stack */}
              <div className="pt-2 flex flex-wrap gap-1.5">
                {techStack.slice(0, 4).map((tech) => (
                  <span key={tech} className="px-2 py-0.5 rounded-md text-[11px] bg-[#F3F4F6] text-[#374151] font-medium border border-[#E5E7EB]">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Card Footer */}
            <div className="px-5 py-3.5 border-t border-[#F3F4F6] flex items-center justify-between bg-white">
              <div className="flex items-center gap-2">
                <div className="flex items-center -space-x-2">
                  {(members.length > 0 ? members : [teamLead || 'Aarav']).slice(0, 3).map((mName, i) => (
                    <MemberAvatar key={i} name={mName} size="sm" isLead={mName === teamLead} />
                  ))}
                </div>
                <span className="text-[12px] font-bold text-[#0A0A0A] truncate max-w-[130px]">
                  {teamName || 'Lab Team'}
                </span>
              </div>

              <div className="flex items-center gap-1 text-[#9CA3AF]">
                {repoUrl && <Github className="w-4 h-4 text-blue-600" />}
                {demoUrl && <ExternalLink className="w-4 h-4 text-blue-600" />}
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-xl text-[12px] text-blue-900 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Instant Firebase Sync
            </p>
            <p className="text-blue-800/80">
              When you submit, this project is instantly saved in Firebase Firestore and will be visible on the public showcase at <code className="bg-blue-100 px-1 py-0.5 rounded font-mono text-[11px]">/projects</code> and the homepage.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function AdminNewProjectPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-[#6B7280]">Loading project studio...</div>}>
      <ProjectEditorContent />
    </Suspense>
  );
}
