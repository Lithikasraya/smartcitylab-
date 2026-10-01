'use client';

import React, { useState, useRef } from 'react';
import Card from '@/components/shared/Card';
import Button from '@/components/shared/Button';
import { Input, Textarea } from '@/components/shared/Input';
import Modal from '@/components/shared/Modal';
import { usePortalStore } from '@/lib/store';
import { ProjectItem } from '@/lib/data';
import { 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  Edit3, 
  Trash2, 
  Video, 
  FolderGit2,
  Upload,
  Image as ImageIcon,
  Link as LinkIcon,
  ExternalLink,
  Sparkles,
  Users,
  ShieldCheck,
  Check,
  X,
  Play,
  Layers,
  Cpu,
  FileText,
  UserPlus,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

export default function AdminProjectsPage() {
  const { 
    user, 
    projects, 
    teams,
    batches,
    batchInfos,
    addProject, 
    updateProject, 
    deleteProject, 
    toggleProjectVisibility 
  } = usePortalStore();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createStep, setCreateStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);
  const [editStep, setEditStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [notification, setNotification] = useState<string | null>(null);

  // Filter state
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'live' | 'hidden'>('all');

  // Available Batch Years fallback
  const availableBatches = batchInfos.length > 0
    ? batchInfos.map((b) => ({ value: b.year, label: `Batch ${b.year} (${b.academicSession || b.year})` }))
    : [
        { value: '2027', label: 'Batch 2027 (2026-2027)' },
        { value: '2026', label: 'Batch 2026 (2025-2026)' },
        { value: '2025', label: 'Batch 2025 (2024-2025)' },
        { value: '2024', label: 'Batch 2024 (2023-2024)' },
      ];

  // Create Project Form State
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ProjectItem['category']>('IoT & Sensors');
  const [batchYear, setBatchYear] = useState<ProjectItem['batchYear']>('2026');
  
  // Team Selection State
  const [teamSelectionType, setTeamSelectionType] = useState<'existing_team' | 'students_custom'>('existing_team');
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [teamName, setTeamName] = useState('');
  const [teamLead, setTeamLead] = useState('');
  const [membersText, setMembersText] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  // Media & Links State (Clean: No mock image URL by default)
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [techStackText, setTechStackText] = useState('');

  // File Uploading States
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [imageFileName, setImageFileName] = useState<string | null>(null);
  const [videoFileName, setVideoFileName] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const editImageInputRef = useRef<HTMLInputElement>(null);
  const editVideoInputRef = useRef<HTMLInputElement>(null);

  const isSuperAdmin = user.role === 'super_admin';

  // Handle Team Selection change
  const handleSelectTeam = (tId: string) => {
    setSelectedTeamId(tId);
    if (!tId) return;
    const found = teams.find((t) => t.id === tId);
    if (found) {
      setTeamName(found.name);
      setTeamLead(found.teamLead?.name || '');
      const mems = (found.members || []).map((m) => m.name);
      setMembersText(mems.join(', '));
    }
  };

  // Upload helper for direct image & video files to Cloudflare R2 / Server
  const handleFileUpload = async (
    file: File, 
    type: 'image' | 'video',
    target: 'create' | 'edit'
  ) => {
    if (type === 'image') setIsUploadingImage(true);
    else setIsUploadingVideo(true);

    try {
      // Instant local preview
      const localPreviewUrl = URL.createObjectURL(file);
      if (type === 'image') {
        setImageFileName(file.name);
        if (target === 'create') setImageUrl(localPreviewUrl);
        else if (editingProject) setEditingProject({ ...editingProject, imageUrl: localPreviewUrl });
      } else {
        setVideoFileName(file.name);
        if (target === 'create') setVideoUrl(localPreviewUrl);
        else if (editingProject) setEditingProject({ ...editingProject, videoUrl: localPreviewUrl });
      }

      // Upload to API (Stores directly in Cloudflare R2 Bucket)
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', file.name);
      formData.append('folder', type === 'image' ? 'projects/covers' : 'projects/videos');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          if (type === 'image') {
            if (target === 'create') setImageUrl(data.url);
            else if (editingProject) setEditingProject({ ...editingProject, imageUrl: data.url });
          } else {
            if (target === 'create') setVideoUrl(data.url);
            else if (editingProject) setEditingProject({ ...editingProject, videoUrl: data.url });
          }
        }
      }
    } catch (err) {
      console.warn('Upload note, keeping preview:', err);
    } finally {
      if (type === 'image') setIsUploadingImage(false);
      else setIsUploadingVideo(false);
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    addProject({
      title,
      tagline: tagline || title,
      description,
      category,
      batchYear,
      teamName: teamName || 'Smart City Lab Team',
      teamLead: teamLead || 'Team Lead',
      members: membersText ? membersText.split(',').map((m) => m.trim()).filter(Boolean) : [],
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
      videoUrl: videoUrl || undefined,
      demoUrl: demoUrl || undefined,
      repoUrl: repoUrl || undefined,
      views: 0,
      featured: true,
      status: 'approved',
      isVisible: true,
      publishedAt: new Date().toISOString().split('T')[0],
      techStack: techStackText ? techStackText.split(',').map((t) => t.trim()).filter(Boolean) : [],
    });

    setCreateModalOpen(false);
    // Reset all fields completely
    setTitle('');
    setTagline('');
    setDescription('');
    setTeamName('');
    setTeamLead('');
    setMembersText('');
    setImageUrl('');
    setVideoUrl('');
    setDemoUrl('');
    setRepoUrl('');
    setTechStackText('');
    setSelectedTeamId('');
    setImageFileName(null);
    setVideoFileName(null);
    setNotification(`Project "${title}" saved to Firestore & published live!`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    updateProject(editingProject.id, {
      title: editingProject.title,
      tagline: editingProject.tagline,
      description: editingProject.description,
      category: editingProject.category,
      batchYear: editingProject.batchYear,
      teamName: editingProject.teamName,
      teamLead: editingProject.teamLead,
      members: editingProject.members,
      imageUrl: editingProject.imageUrl,
      videoUrl: editingProject.videoUrl || undefined,
      demoUrl: editingProject.demoUrl || undefined,
      repoUrl: editingProject.repoUrl || undefined,
      status: editingProject.status,
      isVisible: editingProject.isVisible,
    });

    setNotification(`Changes to "${editingProject.title}" saved successfully.`);
    setEditingProject(null);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleToggleVisibility = (p: ProjectItem) => {
    toggleProjectVisibility(p.id);
    const nextState = p.isVisible === false;
    setNotification(
      nextState
        ? `"${p.title}" is now SHOWN LIVE on the public website showcase.`
        : `"${p.title}" is now HIDDEN from the public website.`
    );
    setTimeout(() => setNotification(null), 4000);
  };

  const filteredProjects = projects.filter((p) => {
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    const isLive = (p.isVisible !== false) && (p.status === 'approved');
    const matchesVisibility = 
      visibilityFilter === 'all' 
        ? true 
        : visibilityFilter === 'live' 
        ? isLive 
        : !isLive;

    return matchesCategory && matchesVisibility;
  });

  return (
    <div className="space-y-8 text-left">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E5E7EB]">
        <div>
          <h1 className="text-[28px] sm:text-[32px] font-bold text-[#0A0A0A] tracking-tight">
            Manage Public Showcase Projects
          </h1>
          <p className="text-[14px] text-[#6B7280] mt-1">
            Super Admin CMS: control which student research projects are displayed on the public website. Toggle between Live and Hidden at any time.
          </p>
        </div>

        {isSuperAdmin && (
          <Button 
            variant="primary" 
            size="md" 
            onClick={() => setCreateModalOpen(true)}
            className="shadow-sm shadow-blue-600/30 hover:shadow-md hover:shadow-blue-600/40"
          >
            + Add New Project
          </Button>
        )}
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#F8F9FA] border border-[#E5E7EB] flex items-center justify-center text-[#2563EB]">
            <FolderGit2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[24px] font-bold text-[#0A0A0A]">{projects.length}</div>
            <div className="text-[13px] text-[#6B7280]">Total Lab Projects</div>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#10B981]">
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[24px] font-bold text-[#0A0A0A]">
              {projects.filter((p) => p.isVisible !== false && p.status === 'approved').length}
            </div>
            <div className="text-[13px] text-[#6B7280]">Live on Public Website</div>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gray-50 border border-[#E5E7EB] flex items-center justify-center text-[#6B7280]">
            <EyeOff className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[24px] font-bold text-[#0A0A0A]">
              {projects.filter((p) => p.isVisible === false || p.status !== 'approved').length}
            </div>
            <div className="text-[13px] text-[#6B7280]">Hidden from Public Website</div>
          </div>
        </Card>
      </div>

      {/* Projects Table Container */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden shadow-sm">
        
        {/* Table Filters */}
        <div className="p-4 sm:p-5 border-b border-[#E5E7EB] flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[13px] text-[#6B7280] mr-1">Website Visibility:</span>
            {(['all', 'live', 'hidden'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setVisibilityFilter(v)}
                className={`px-3 py-1.5 rounded-lg text-[13px] font-medium border capitalize transition-colors ${
                  visibilityFilter === v
                    ? 'border-[#2563EB] text-[#2563EB] bg-[#F8F9FA]'
                    : 'border-[#E5E7EB] text-[#6B7280] hover:text-[#0A0A0A]'
                }`}
              >
                {v === 'all' ? 'All Projects' : v === 'live' ? 'Live on Site' : 'Hidden'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[13px] text-[#6B7280]">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 text-[13px] text-[#0A0A0A] focus:border-[#2563EB] focus:outline-none"
            >
              <option value="all">All Categories</option>
              <option value="IoT & Sensors">IoT & Sensors</option>
              <option value="AI & Computer Vision">AI & Computer Vision</option>
              <option value="Smart Mobility">Smart Mobility</option>
              <option value="Green Energy">Green Energy</option>
              <option value="Web & Cloud">Web & Cloud</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F8F9FA] text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider">
                <th className="py-3.5 px-4">Project & Media</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Team & Members</th>
                <th className="py-3.5 px-4">Batch</th>
                <th className="py-3.5 px-4">Website Display Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB] text-[14px]">
              {filteredProjects.map((p, idx) => {
                const isLive = p.isVisible !== false && p.status === 'approved';

                return (
                  <tr
                    key={p.id}
                    className={`transition-colors ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-[#F8F9FA]'
                    } hover:bg-[#F1F3F5]`}
                  >
                    {/* Project & Media */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-slate-900 flex-shrink-0 border border-[#E5E7EB]">
                          {p.videoUrl ? (
                            <video
                              src={p.videoUrl}
                              autoPlay
                              loop
                              muted
                              playsInline
                              onError={(e) => {
                                (e.currentTarget as HTMLVideoElement).style.display = 'none';
                              }}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <img
                              src={p.imageUrl}
                              alt=""
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                const target = e.currentTarget as HTMLImageElement;
                                const bg = p.category.includes('AI') ? '%231e3a8a' : p.category.includes('Energy') ? '%23065f46' : '%230f172a';
                                target.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="48" viewBox="0 0 64 48"><rect width="64" height="48" fill="${bg}"/><text x="32" y="27" fill="%2360a5fa" font-size="8" font-family="sans-serif" font-weight="bold" text-anchor="middle">RESEARCH</text></svg>`;
                              }}
                              className="w-full h-full object-cover"
                            />
                          )}
                          {p.videoUrl && (
                            <div className="absolute bottom-0.5 right-0.5 bg-black/75 px-1 py-0.2 rounded text-[9px] text-white font-mono flex items-center gap-0.5">
                              <Video className="w-2.5 h-2.5 text-[#2563EB]" />
                              <span>VID</span>
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="font-semibold text-[#0A0A0A] hover:text-[#2563EB] transition-colors">
                            {p.title}
                          </div>
                          <div className="text-[12px] text-[#6B7280] line-clamp-1">
                            {p.tagline || p.description}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 text-[#2563EB] font-medium text-[13px]">
                      {p.category}
                    </td>

                    {/* Team & Member Avatars Side-by-side */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-[#0A0A0A] text-[13px]">{p.teamName}</div>
                      <div className="flex items-center gap-2 mt-1">
                        {/* Member avatar circles side by side */}
                        <div className="flex items-center -space-x-2">
                          {(p.members || []).slice(0, 4).map((member, i) => (
                            <div
                              key={i}
                              title={member}
                              className="w-6 h-6 rounded-full border-2 border-white bg-[#2563EB] text-white text-[10px] font-bold flex items-center justify-center uppercase shadow-xs"
                            >
                              {member.charAt(0)}
                            </div>
                          ))}
                        </div>
                        <span className="text-[11px] text-[#6B7280]">
                          Lead: {p.teamLead}
                        </span>
                      </div>
                    </td>

                    {/* Batch */}
                    <td className="py-3.5 px-4 text-[#6B7280] text-[13px]">
                      Batch {p.batchYear}
                    </td>

                    {/* Live Website Status Badge */}
                    <td className="py-3.5 px-4">
                      {isLive ? (
                        <span className="inline-flex items-center gap-1.5 text-[12px] px-2.5 py-1 rounded-full font-semibold border border-[#10B981] text-[#10B981] bg-emerald-50/60">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                          Live on Website
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[12px] px-2.5 py-1 rounded-full font-medium border border-[#E5E7EB] text-[#6B7280] bg-white">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                          Hidden from Website
                        </span>
                      )}
                    </td>

                    {/* Actions: Hide/Show Toggle + Edit + Delete */}
                    <td className="py-3.5 px-4 text-right">
                      {isSuperAdmin ? (
                        <div className="inline-flex items-center gap-2 justify-end">
                          
                          {/* Explicit Hide / Show Toggle Button */}
                          <button
                            onClick={() => handleToggleVisibility(p)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-medium border transition-colors ${
                              isLive
                                ? 'border-[#E5E7EB] bg-white text-[#6B7280] hover:text-[#0A0A0A] hover:border-[#0A0A0A]'
                                : 'border-[#2563EB] bg-[#F8F9FA] text-[#2563EB] hover:bg-blue-50'
                            }`}
                            title={isLive ? 'Hide project from public showcase' : 'Make project live on public website'}
                          >
                            {isLive ? (
                              <>
                                <EyeOff className="w-3.5 h-3.5" />
                                <span>Hide</span>
                              </>
                            ) : (
                              <>
                                <Eye className="w-3.5 h-3.5" />
                                <span>Show Live</span>
                              </>
                            )}
                          </button>

                          {/* Edit Project */}
                          <button
                            onClick={() => setEditingProject(p)}
                            className="p-1.5 rounded-lg border border-[#E5E7EB] bg-white text-[#6B7280] hover:text-[#0A0A0A] hover:border-[#0A0A0A] transition-colors"
                            title="Edit Project Details"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Project */}
                          <button
                            onClick={() => {
                              if (confirm(`Remove "${p.title}" completely from repository?`)) {
                                deleteProject(p.id);
                                setNotification(`"${p.title}" deleted.`);
                                setTimeout(() => setNotification(null), 3000);
                              }
                            }}
                            className="p-1.5 rounded-lg border border-transparent text-[#EF4444] hover:bg-[#FEE2E2] transition-colors"
                            title="Delete Project"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                        </div>
                      ) : (
                        <span className="text-[12px] text-[#6B7280]">View Only</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================= ADD PROJECT MODAL (MULTI-STAGE WIZARD WITH LIVE PREVIEW) ======================= */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Add New Public Showcase Project"
        subtitle="Step-by-step showcase builder: fill project overview, team credits, media, and review a live preview before publishing."
        icon={<FolderGit2 className="w-5 h-5 text-blue-600" />}
        maxWidth="4xl"
      >
        <form onSubmit={handleCreate} className="space-y-5 text-left">
          
          {/* Wizard Step Progress Indicator */}
          <div className="flex items-center justify-between gap-1 pb-3 border-b border-[#E5E7EB] overflow-x-auto">
            {[
              { step: 1, label: '1. Overview', icon: FileText },
              { step: 2, label: '2. Team', icon: Users },
              { step: 3, label: '3. Tech Stack', icon: Cpu },
              { step: 4, label: '4. Media', icon: ImageIcon },
              { step: 5, label: '5. Links', icon: ExternalLink },
              { step: 6, label: '6. Live Preview', icon: Eye },
            ].map((item) => {
              const isCompleted = createStep > item.step;
              const isCurrent = createStep === item.step;
              const StepIcon = item.icon;
              return (
                <button
                  key={item.step}
                  type="button"
                  onClick={() => {
                    if (item.step <= createStep || (title.trim() && description.trim())) {
                      setCreateStep(item.step as 1 | 2 | 3 | 4 | 5 | 6);
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all whitespace-nowrap ${
                    isCurrent
                      ? 'bg-[#2563EB] text-white shadow-xs scale-102'
                      : isCompleted
                      ? 'bg-blue-50 text-[#2563EB] hover:bg-blue-100 cursor-pointer'
                      : 'bg-[#F3F4F6] text-[#6B7280] opacity-60'
                  }`}
                >
                  <StepIcon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                  {isCompleted && <span className="text-[10px] font-bold">✓</span>}
                </button>
              );
            })}
          </div>

          {/* STEP 1: PROJECT OVERVIEW */}
          {createStep === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-5 rounded-xl border border-[#E5E7EB] bg-[#F8F9FA]/60 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-[#E5E7EB]">
                  <FileText className="w-4 h-4 text-[#2563EB]" />
                  <span className="text-[13px] font-bold text-[#0A0A0A] uppercase tracking-wider">Step 1: Project Overview & Details</span>
                </div>

                <Input
                  label="Project Title"
                  placeholder="e.g. TechSpace / Ultrasonic Municipal Flow Sensor"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />

                <Input
                  label="Tagline (Sub-heading)"
                  placeholder="e.g. Real-time ultrasonic flow metering with LoRaWAN telemetry"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-[13px] font-medium text-[#0A0A0A]">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as ProjectItem['category'])}
                      className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-[14px] text-[#0A0A0A] focus:border-[#2563EB] focus:outline-none shadow-sm"
                    >
                      <option value="IoT & Sensors">IoT & Sensors</option>
                      <option value="AI & Computer Vision">AI & Computer Vision</option>
                      <option value="Smart Mobility">Smart Mobility</option>
                      <option value="Green Energy">Green Energy</option>
                      <option value="Web & Cloud">Web & Cloud</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[13px] font-medium text-[#0A0A0A]">Batch Year</label>
                    <select
                      value={batchYear}
                      onChange={(e) => setBatchYear(e.target.value as ProjectItem['batchYear'])}
                      className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-[14px] text-[#0A0A0A] focus:border-[#2563EB] focus:outline-none shadow-sm"
                    >
                      {availableBatches.map((b) => (
                        <option key={b.value} value={b.value}>{b.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <Textarea
                  label="Comprehensive Technical Description"
                  placeholder="Provide architectural background, problem statement, edge model details, and real-world deployment metrics..."
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              {/* Step 1 Footer */}
              <div className="pt-2 flex items-center justify-between">
                <Button type="button" variant="outline" onClick={() => setCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  disabled={!title.trim() || !description.trim()}
                  onClick={() => setCreateStep(2)}
                  className="flex items-center gap-1.5 shadow-sm shadow-blue-600/30"
                >
                  <span>Next: Team & Authors</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: TEAM & AUTHORS */}
          {createStep === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-5 rounded-xl border border-[#E5E7EB] bg-[#F8F9FA]/60 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB]">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#2563EB]" />
                    <span className="text-[13px] font-bold text-[#0A0A0A] uppercase tracking-wider">Step 2: Team & Authors Attribution</span>
                  </div>

                  {/* Toggle Mode */}
                  <div className="flex bg-[#E5E7EB] p-0.5 rounded-lg text-[11px] font-medium">
                    <button
                      type="button"
                      onClick={() => setTeamSelectionType('existing_team')}
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        teamSelectionType === 'existing_team'
                          ? 'bg-white text-[#2563EB] shadow-xs'
                          : 'text-[#6B7280] hover:text-[#0A0A0A]'
                      }`}
                    >
                      Select Team
                    </button>
                    <button
                      type="button"
                      onClick={() => setTeamSelectionType('students_custom')}
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        teamSelectionType === 'students_custom'
                          ? 'bg-white text-[#2563EB] shadow-xs'
                          : 'text-[#6B7280] hover:text-[#0A0A0A]'
                      }`}
                    >
                      Pick Students
                    </button>
                  </div>
                </div>

                {teamSelectionType === 'existing_team' ? (
                  <div className="space-y-1.5">
                    <label className="block text-[13px] font-medium text-[#4B5563]">Select Registered Lab Team</label>
                    <select
                      value={selectedTeamId}
                      onChange={(e) => handleSelectTeam(e.target.value)}
                      className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-[14px] text-[#0A0A0A] focus:border-[#2563EB] focus:outline-none shadow-sm"
                    >
                      <option value="">-- Choose Existing Team (or enter custom name below) --</option>
                      {teams.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} (Lead: {t.teamLead?.name || 'N/A'})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <label className="block text-[13px] font-medium text-[#4B5563]">Select Registered Lab Student</label>
                    <select
                      onChange={(e) => {
                        const studentId = e.target.value;
                        if (!studentId) return;
                        const student = batches.find((s) => s.id === studentId);
                        if (student) {
                          const currentMembers = membersText ? membersText.split(',').map(m => m.trim()).filter(Boolean) : [];
                          if (!currentMembers.includes(student.name)) {
                            const updated = [...currentMembers, student.name];
                            setMembersText(updated.join(', '));
                            if (!teamLead) setTeamLead(student.name);
                            if (!teamName) {
                              setTeamName(student.teamName || `${student.name}'s Team`);
                            }
                          }
                        }
                      }}
                      className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-[14px] text-[#0A0A0A] focus:border-[#2563EB] focus:outline-none shadow-sm"
                    >
                      <option value="">-- Add student from CRM roster --</option>
                      {batches.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.rollNo || s.domain || 'Student'})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Team Name / Number"
                    placeholder="e.g. TEAM 2 / CyberVision"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    required
                  />
                  <Input
                    label="Team Lead Name"
                    placeholder="e.g. SMARTCITY / Aarav Sharma"
                    value={teamLead}
                    onChange={(e) => setTeamLead(e.target.value)}
                    required
                  />
                </div>

                <Input
                  label="Team Members (comma-separated for circular avatars)"
                  placeholder="e.g. ABHI, Rohan Gupta, Sneha Patel, Ananya Verma"
                  value={membersText}
                  onChange={(e) => setMembersText(e.target.value)}
                />

                <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-100 text-[12px] text-[#2563EB] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Authors will receive official attribution badges on the public live showcase.</span>
                </div>
              </div>

              {/* Step 2 Footer */}
              <div className="pt-2 flex items-center justify-between">
                <Button type="button" variant="outline" onClick={() => setCreateStep(1)} className="flex items-center gap-1.5">
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back: Overview</span>
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => setCreateStep(3)}
                  className="flex items-center gap-1.5 shadow-sm shadow-blue-600/30"
                >
                  <span>Next: Tech Stack</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: TECH STACK */}
          {createStep === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-5 rounded-xl border border-[#E5E7EB] bg-[#F8F9FA]/60 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB]">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-[#2563EB]" />
                    <span className="text-[13px] font-bold text-[#0A0A0A] uppercase tracking-wider">Step 3: Tech Stack & Tools</span>
                  </div>
                  <span className="text-[12px] text-[#6B7280]">Click quick tags to toggle</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {[
                    'ESP32', 'MQTT', 'Next.js', 'React', 'Python', 'FastAPI', 
                    'TensorFlow', 'OpenCV', 'LoRaWAN', 'Arduino', 'Tailwind CSS', 
                    'Docker', 'Firebase', 'PostgreSQL', 'Node.js', 'C++', 'Raspberry Pi'
                  ].map((tech) => {
                    const currentList = techStackText.split(',').map(s => s.trim().toLowerCase());
                    const isSelected = currentList.includes(tech.toLowerCase());
                    return (
                      <button
                        type="button"
                        key={tech}
                        onClick={() => {
                          const list = techStackText.split(',').map(s => s.trim()).filter(Boolean);
                          if (isSelected) {
                            setTechStackText(list.filter(item => item.toLowerCase() !== tech.toLowerCase()).join(', '));
                          } else {
                            setTechStackText([...list, tech].join(', '));
                          }
                        }}
                        className={`text-[13px] px-3 py-1.5 rounded-lg font-medium transition-all ${
                          isSelected
                            ? 'bg-[#2563EB] text-white shadow-xs'
                            : 'bg-white border border-[#E5E7EB] text-[#4B5563] hover:border-[#2563EB] hover:text-[#2563EB]'
                        }`}
                      >
                        {isSelected ? `✓ ${tech}` : `+ ${tech}`}
                      </button>
                    );
                  })}
                </div>

                <Input
                  label="Technologies (comma-separated)"
                  placeholder="e.g. ESP32, MQTT, Next.js, Python, OpenCV"
                  value={techStackText}
                  onChange={(e) => setTechStackText(e.target.value)}
                />
              </div>

              {/* Step 3 Footer */}
              <div className="pt-2 flex items-center justify-between">
                <Button type="button" variant="outline" onClick={() => setCreateStep(2)} className="flex items-center gap-1.5">
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back: Team</span>
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => setCreateStep(4)}
                  className="flex items-center gap-1.5 shadow-sm shadow-blue-600/30"
                >
                  <span>Next: Visual Proof & Media</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: VISUAL PROOF & MEDIA */}
          {createStep === 4 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-5 rounded-xl border border-[#E5E7EB] bg-[#F8F9FA]/60 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB]">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-[#2563EB]" />
                    <span className="text-[13px] font-bold text-[#0A0A0A] uppercase tracking-wider">Step 4: Visual Proof & Media (Cloudflare R2)</span>
                  </div>
                  {(isUploadingImage || isUploadingVideo) && (
                    <span className="text-[11px] text-[#2563EB] font-medium animate-pulse">Uploading to Cloudflare R2...</span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Cover Image */}
                  <div className="space-y-3">
                    <label className="block text-[13px] font-semibold text-[#0A0A0A]">Cover Image (PNG, JPG, WebP)</label>
                    
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, 'image', 'create');
                      }}
                    />

                    {imageUrl ? (
                      <div className="relative group rounded-xl overflow-hidden border border-[#E5E7EB] bg-slate-900 aspect-video flex items-center justify-center">
                        <img 
                          src={imageUrl} 
                          alt="Cover Preview" 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => imageInputRef.current?.click()}
                            className="px-3 py-1.5 rounded-lg bg-white text-[#0A0A0A] text-[12px] font-medium hover:bg-slate-100 transition-colors flex items-center gap-1.5 shadow"
                          >
                            <Upload className="w-3.5 h-3.5" /> Replace
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setImageUrl('');
                              setImageFileName(null);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-[12px] font-medium hover:bg-red-700 transition-colors shadow"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => imageInputRef.current?.click()}
                        className="border-2 border-dashed border-[#CBD5E1] hover:border-[#2563EB] bg-white rounded-xl p-6 text-center cursor-pointer transition-colors group aspect-video flex flex-col items-center justify-center"
                      >
                        <div className="w-10 h-10 rounded-full bg-blue-50 text-[#2563EB] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                          <Upload className="w-5 h-5" />
                        </div>
                        <p className="text-[13px] font-semibold text-[#0A0A0A]">Upload Project Cover Image</p>
                        <p className="text-[11px] text-[#6B7280] mt-0.5">PNG, JPG, WebP up to 10MB</p>
                      </div>
                    )}

                    <Input
                      placeholder="Or paste Direct Image URL (https://...)"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                    />
                  </div>

                  {/* Showcase Video */}
                  <div className="space-y-3">
                    <label className="block text-[13px] font-semibold text-[#0A0A0A]">Auto-Play Showcase Video (MP4, WebM)</label>
                    
                    <input
                      ref={videoInputRef}
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, 'video', 'create');
                      }}
                    />

                    {videoUrl ? (
                      <div className="relative group rounded-xl overflow-hidden border border-[#E5E7EB] bg-black aspect-video flex items-center justify-center">
                        <video 
                          src={videoUrl} 
                          controls 
                          autoPlay 
                          muted 
                          loop 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2 flex gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => videoInputRef.current?.click()}
                            className="px-2.5 py-1 rounded-md bg-black/70 text-white text-[11px] font-medium hover:bg-black transition-colors flex items-center gap-1 backdrop-blur"
                          >
                            <Upload className="w-3 h-3" /> Replace
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setVideoUrl('');
                              setVideoFileName(null);
                            }}
                            className="px-2.5 py-1 rounded-md bg-red-600/80 text-white text-[11px] font-medium hover:bg-red-700 transition-colors backdrop-blur"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => videoInputRef.current?.click()}
                        className="border-2 border-dashed border-[#CBD5E1] hover:border-[#2563EB] bg-white rounded-xl p-6 text-center cursor-pointer transition-colors group aspect-video flex flex-col items-center justify-center"
                      >
                        <div className="w-10 h-10 rounded-full bg-blue-50 text-[#2563EB] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                          <Video className="w-5 h-5" />
                        </div>
                        <p className="text-[13px] font-semibold text-[#0A0A0A]">Upload MP4 / WebM Video</p>
                        <p className="text-[11px] text-[#6B7280] mt-0.5">Short looping demo walkthrough</p>
                      </div>
                    )}

                    <Input
                      placeholder="Or paste Direct Video URL (https://assets...mp4)"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Step 4 Footer */}
              <div className="pt-2 flex items-center justify-between">
                <Button type="button" variant="outline" onClick={() => setCreateStep(3)} className="flex items-center gap-1.5">
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back: Tech Stack</span>
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => setCreateStep(5)}
                  className="flex items-center gap-1.5 shadow-sm shadow-blue-600/30"
                >
                  <span>Next: Project Links</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 5: PROJECT LINKS */}
          {createStep === 5 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-5 rounded-xl border border-[#E5E7EB] bg-[#F8F9FA]/60 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-[#E5E7EB]">
                  <ExternalLink className="w-4 h-4 text-[#2563EB]" />
                  <span className="text-[13px] font-bold text-[#0A0A0A] uppercase tracking-wider">Step 5: External Links & Repositories</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Live Demo Link"
                    placeholder="https://your-project-demo.com"
                    value={demoUrl}
                    onChange={(e) => setDemoUrl(e.target.value)}
                  />
                  <Input
                    label="GitHub Repository Link"
                    placeholder="https://github.com/organization/repo"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                  />
                </div>
              </div>

              {/* Step 5 Footer */}
              <div className="pt-2 flex items-center justify-between">
                <Button type="button" variant="outline" onClick={() => setCreateStep(4)} className="flex items-center gap-1.5">
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back: Media</span>
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => setCreateStep(6)}
                  className="flex items-center gap-1.5 shadow-sm shadow-blue-600/30 bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                >
                  <Eye className="w-4 h-4" />
                  <span>Next: Show Live Preview</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 6: LIVE PREVIEW & FINAL SUBMIT */}
          {createStep === 6 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[13px] text-[#2563EB] font-medium">
                  <Sparkles className="w-4 h-4" />
                  <span>Live Preview: Review how your project will appear on the public showcase catalog.</span>
                </div>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-600 text-white">Live Card Mockup</span>
              </div>

              {/* Realistic Public Showcase Card Preview */}
              <div className="p-5 rounded-2xl border border-[#E5E7EB] bg-white shadow-md space-y-4">
                
                {/* Media Preview Header */}
                <div className="relative rounded-xl overflow-hidden bg-slate-950 aspect-video max-h-64 flex items-center justify-center">
                  {videoUrl ? (
                    <video 
                      src={videoUrl} 
                      controls 
                      autoPlay 
                      muted 
                      loop 
                      className="w-full h-full object-cover"
                    />
                  ) : imageUrl ? (
                    <img 
                      src={imageUrl} 
                      alt={title || 'Project Preview'} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-slate-400 flex flex-col items-center gap-1.5">
                      <ImageIcon className="w-8 h-8 opacity-40" />
                      <span className="text-[12px]">No media uploaded (default badge will display)</span>
                    </div>
                  )}

                  {/* Floating badges */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-blue-600/90 text-white backdrop-blur shadow-sm">
                      {category}
                    </span>
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-black/60 text-white backdrop-blur shadow-sm">
                      Batch {batchYear}
                    </span>
                  </div>
                </div>

                {/* Content Overview */}
                <div className="space-y-2">
                  <h3 className="text-[20px] font-bold text-[#0A0A0A] tracking-tight">
                    {title || 'Untitled Project'}
                  </h3>
                  {tagline && (
                    <p className="text-[14px] font-medium text-[#2563EB]">
                      {tagline}
                    </p>
                  )}
                  <p className="text-[13px] text-[#4B5563] leading-relaxed line-clamp-3">
                    {description || 'No description provided yet.'}
                  </p>
                </div>

                {/* Tech Stack Pills */}
                {techStackText && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {techStackText.split(',').map((t) => t.trim()).filter(Boolean).map((tech) => (
                      <span key={tech} className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#F3F4F6] text-[#374151] border border-[#E5E7EB]">
                        {tech}
                      </span>
                    ))}
                  </div>
                )}

                {/* Team Info & Links Preview Bar */}
                <div className="pt-3 border-t border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[12px]">
                  <div className="flex items-center gap-2 text-[#4B5563]">
                    <Users className="w-4 h-4 text-[#2563EB]" />
                    <span className="font-semibold text-[#0A0A0A]">{teamName || 'Smart City Lab Team'}</span>
                    <span>•</span>
                    <span>Lead: <strong className="text-[#0A0A0A]">{teamLead || 'Unassigned'}</strong></span>
                  </div>

                  <div className="flex items-center gap-2">
                    {demoUrl && (
                      <span className="px-3 py-1 rounded-lg bg-blue-50 text-[#2563EB] font-medium flex items-center gap-1 border border-blue-200">
                        <ExternalLink className="w-3.5 h-3.5" /> Demo Live
                      </span>
                    )}
                    {repoUrl && (
                      <span className="px-3 py-1 rounded-lg bg-slate-100 text-[#0A0A0A] font-medium flex items-center gap-1 border border-[#E5E7EB]">
                        <LinkIcon className="w-3.5 h-3.5" /> Code Repo
                      </span>
                    )}
                  </div>
                </div>

              </div>

              {/* Step 6 Footer */}
              <div className="pt-3 border-t border-[#E5E7EB] flex flex-col sm:flex-row items-center justify-between gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setCreateStep(5)}
                  className="flex items-center gap-1.5 w-full sm:w-auto"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Edit</span>
                </Button>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <Button type="button" variant="outline" onClick={() => setCreateModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    variant="primary"
                    loading={isUploadingImage || isUploadingVideo}
                    className="shadow-md shadow-blue-600/30 hover:shadow-lg hover:shadow-blue-600/40 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2.5 text-[14px] font-semibold"
                  >
                    🚀 Publish to Live Showcase
                  </Button>
                </div>
              </div>

            </div>
          )}

        </form>
      </Modal>

      {/* ======================= EDIT PROJECT MODAL ======================= */}
      {editingProject && (
        <Modal
          isOpen={!!editingProject}
          onClose={() => setEditingProject(null)}
          title={`Edit Project: ${editingProject.title}`}
          subtitle="Modify project overview, tech stack, team credits, media, or live public visibility."
          icon={<Edit3 className="w-5 h-5 text-blue-600" />}
          maxWidth="4xl"
        >
          <form onSubmit={handleSaveEdit} className="space-y-5 text-left">
            
            {/* 1. TOP ROW: Project Overview (Left 7-cols) & Team & Authors (Right 5-cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* 2. PROJECT OVERVIEW */}
              <div className="lg:col-span-7 p-4 rounded-xl border border-[#E5E7EB] bg-[#F8F9FA]/60 space-y-3.5">
                <div className="flex items-center gap-2 pb-1.5 border-b border-[#E5E7EB]">
                  <FileText className="w-4 h-4 text-[#2563EB]" />
                  <span className="text-[13px] font-bold text-[#0A0A0A] uppercase tracking-wider">1. Project Overview</span>
                </div>

                <Input
                  label="Project Title"
                  value={editingProject.title}
                  onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                  required
                />

                <Input
                  label="Tagline (Sub-heading)"
                  value={editingProject.tagline || ''}
                  onChange={(e) => setEditingProject({ ...editingProject, tagline: e.target.value })}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-[13px] font-medium text-[#0A0A0A]">Category</label>
                    <select
                      value={editingProject.category}
                      onChange={(e) => setEditingProject({ ...editingProject, category: e.target.value as ProjectItem['category'] })}
                      className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-[14px] text-[#0A0A0A] focus:border-[#2563EB] focus:outline-none shadow-sm"
                    >
                      <option value="IoT & Sensors">IoT & Sensors</option>
                      <option value="AI & Computer Vision">AI & Computer Vision</option>
                      <option value="Smart Mobility">Smart Mobility</option>
                      <option value="Green Energy">Green Energy</option>
                      <option value="Web & Cloud">Web & Cloud</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[13px] font-medium text-[#0A0A0A]">Batch Year</label>
                    <select
                      value={editingProject.batchYear}
                      onChange={(e) => setEditingProject({ ...editingProject, batchYear: e.target.value as ProjectItem['batchYear'] })}
                      className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-[14px] text-[#0A0A0A] focus:border-[#2563EB] focus:outline-none shadow-sm"
                    >
                      {availableBatches.map((b) => (
                        <option key={b.value} value={b.value}>{b.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <Textarea
                  label="Comprehensive Technical Description"
                  rows={4}
                  value={editingProject.description}
                  onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                  required
                />
              </div>

              {/* 3. TEAM & AUTHORS */}
              <div className="lg:col-span-5 p-4 rounded-xl border border-[#E5E7EB] bg-[#F8F9FA]/60 space-y-3.5 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-1.5 border-b border-[#E5E7EB]">
                    <Users className="w-4 h-4 text-[#2563EB]" />
                    <span className="text-[13px] font-bold text-[#0A0A0A] uppercase tracking-wider">2. Team & Authors</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <Input
                      label="Team Name / Number"
                      value={editingProject.teamName}
                      onChange={(e) => setEditingProject({ ...editingProject, teamName: e.target.value })}
                      required
                    />
                    <Input
                      label="Team Lead"
                      value={editingProject.teamLead}
                      onChange={(e) => setEditingProject({ ...editingProject, teamLead: e.target.value })}
                      required
                    />
                  </div>

                  <Input
                    label="Team Members (comma separated)"
                    value={(editingProject.members || []).join(', ')}
                    onChange={(e) => setEditingProject({
                      ...editingProject,
                      members: e.target.value.split(',').map((m) => m.trim()).filter(Boolean),
                    })}
                  />
                </div>

                {/* Visibility Toggle Card */}
                <div className="p-3.5 rounded-xl border border-[#2563EB]/20 bg-blue-50/50 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-[#0A0A0A] block text-[13px]">
                      Show on Public Showcase
                    </span>
                    <span className="text-[11px] text-[#6B7280] block">
                      Live on home page & /projects
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={editingProject.isVisible !== false && editingProject.status === 'approved'}
                    onChange={(e) => setEditingProject({
                      ...editingProject,
                      isVisible: e.target.checked,
                      status: e.target.checked ? 'approved' : editingProject.status,
                    })}
                    className="w-5 h-5 rounded text-[#2563EB] cursor-pointer"
                  />
                </div>
              </div>

            </div>

            {/* 4. TECH STACK */}
            <div className="p-4 rounded-xl border border-[#E5E7EB] bg-[#F8F9FA]/60 space-y-2.5">
              <div className="flex items-center justify-between pb-1.5 border-b border-[#E5E7EB]">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-[#2563EB]" />
                  <span className="text-[13px] font-bold text-[#0A0A0A] uppercase tracking-wider">3. Tech Stack & Technologies</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {['ESP32', 'MQTT', 'Next.js', 'React', 'Python', 'FastAPI', 'TensorFlow', 'OpenCV', 'LoRaWAN', 'Arduino', 'Tailwind CSS', 'Docker', 'Firebase', 'PostgreSQL'].map((tech) => {
                  const currentList = (editingProject.techStack || []).map(s => s.toLowerCase());
                  const isSelected = currentList.includes(tech.toLowerCase());
                  return (
                    <button
                      type="button"
                      key={tech}
                      onClick={() => {
                        const list = editingProject.techStack || [];
                        if (isSelected) {
                          setEditingProject({
                            ...editingProject,
                            techStack: list.filter(item => item.toLowerCase() !== tech.toLowerCase()),
                          });
                        } else {
                          setEditingProject({
                            ...editingProject,
                            techStack: [...list, tech],
                          });
                        }
                      }}
                      className={`text-[12px] px-2.5 py-1 rounded-md font-medium transition-all ${
                        isSelected
                          ? 'bg-[#2563EB] text-white shadow-xs'
                          : 'bg-white border border-[#E5E7EB] text-[#4B5563] hover:border-[#2563EB] hover:text-[#2563EB]'
                      }`}
                    >
                      {isSelected ? `✓ ${tech}` : `+ ${tech}`}
                    </button>
                  );
                })}
              </div>

              <Input
                label="Tech Stack (comma-separated)"
                value={(editingProject.techStack || []).join(', ')}
                onChange={(e) => setEditingProject({
                  ...editingProject,
                  techStack: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
                })}
              />
            </div>

            {/* 5. MEDIA (Cover Image + Showcase Video) */}
            <div className="p-4 rounded-xl border border-[#E5E7EB] bg-[#F8F9FA]/60 space-y-3.5">
              <div className="flex items-center justify-between pb-1.5 border-b border-[#E5E7EB]">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#2563EB]" />
                  <span className="text-[13px] font-bold text-[#0A0A0A] uppercase tracking-wider">4. Visual Proof & Media (Cloudflare R2)</span>
                </div>
                {isUploadingImage && <span className="text-[11px] text-[#2563EB] font-medium animate-pulse">Uploading to Cloudflare R2...</span>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Cover Image */}
                <div className="space-y-2.5">
                  <label className="block text-[12px] font-semibold text-[#0A0A0A]">Cover Image</label>
                  
                  <input
                    ref={editImageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'image', 'edit');
                    }}
                  />

                  {editingProject.imageUrl ? (
                    <div className="relative group rounded-xl overflow-hidden border border-[#E5E7EB] bg-slate-900 aspect-video flex items-center justify-center">
                      <img 
                        src={editingProject.imageUrl} 
                        alt="Cover Preview" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => editImageInputRef.current?.click()}
                          className="px-3 py-1.5 rounded-lg bg-white text-[#0A0A0A] text-[12px] font-medium hover:bg-slate-100 transition-colors flex items-center gap-1.5 shadow"
                        >
                          <Upload className="w-3.5 h-3.5" /> Replace Image
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => editImageInputRef.current?.click()}
                      className="border-2 border-dashed border-[#CBD5E1] hover:border-[#2563EB] bg-white rounded-xl p-6 text-center cursor-pointer transition-colors group aspect-video flex flex-col items-center justify-center"
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-50 text-[#2563EB] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                        <Upload className="w-5 h-5" />
                      </div>
                      <p className="text-[13px] font-semibold text-[#0A0A0A]">Upload Project Cover Image</p>
                    </div>
                  )}

                  <Input
                    label="Direct Image URL"
                    value={editingProject.imageUrl}
                    onChange={(e) => setEditingProject({ ...editingProject, imageUrl: e.target.value })}
                  />
                </div>

                {/* Showcase Video */}
                <div className="space-y-2.5">
                  <label className="block text-[12px] font-semibold text-[#0A0A0A]">Showcase Video</label>
                  
                  <input
                    ref={editVideoInputRef}
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'video', 'edit');
                    }}
                  />

                  {editingProject.videoUrl ? (
                    <div className="relative group rounded-xl overflow-hidden border border-[#E5E7EB] bg-black aspect-video flex items-center justify-center">
                      <video 
                        src={editingProject.videoUrl} 
                        controls 
                        autoPlay 
                        muted 
                        loop 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 flex gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => editVideoInputRef.current?.click()}
                          className="px-2.5 py-1 rounded-md bg-black/70 text-white text-[11px] font-medium hover:bg-black transition-colors flex items-center gap-1 backdrop-blur"
                        >
                          <Upload className="w-3 h-3" /> Replace
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingProject({ ...editingProject, videoUrl: '' })}
                          className="px-2.5 py-1 rounded-md bg-red-600/80 text-white text-[11px] font-medium hover:bg-red-700 transition-colors backdrop-blur"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => editVideoInputRef.current?.click()}
                      className="border-2 border-dashed border-[#CBD5E1] hover:border-[#2563EB] bg-white rounded-xl p-6 text-center cursor-pointer transition-colors group aspect-video flex flex-col items-center justify-center"
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-50 text-[#2563EB] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                        <Video className="w-5 h-5" />
                      </div>
                      <p className="text-[13px] font-semibold text-[#0A0A0A]">Upload MP4 / WebM Video</p>
                    </div>
                  )}

                  <Input
                    label="Direct Video URL (MP4 / WebM)"
                    placeholder="https://assets.mixkit.co/...mp4"
                    value={editingProject.videoUrl || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, videoUrl: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* 6. PROJECT LINKS */}
            <div className="p-4 rounded-xl border border-[#E5E7EB] bg-[#F8F9FA]/60 space-y-3">
              <div className="flex items-center gap-2 pb-1.5 border-b border-[#E5E7EB]">
                <ExternalLink className="w-4 h-4 text-[#2563EB]" />
                <span className="text-[13px] font-bold text-[#0A0A0A] uppercase tracking-wider">5. Project Links & References</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Live Demo Link"
                  value={editingProject.demoUrl || ''}
                  onChange={(e) => setEditingProject({ ...editingProject, demoUrl: e.target.value })}
                />
                <Input
                  label="GitHub Repo URL"
                  value={editingProject.repoUrl || ''}
                  onChange={(e) => setEditingProject({ ...editingProject, repoUrl: e.target.value })}
                />
              </div>
            </div>

            {/* 7. FOOTER */}
            <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setEditingProject(null)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="primary"
                loading={isUploadingImage || isUploadingVideo}
                className="shadow-sm shadow-blue-600/30 hover:shadow-md hover:shadow-blue-600/40 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              >
                Save Changes
              </Button>
            </div>

          </form>
        </Modal>
      )}

    </div>
  );
}
