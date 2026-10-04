'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Card from '@/components/shared/Card';
import Button from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import Modal from '@/components/shared/Modal';
import MemberAvatar from '@/components/shared/MemberAvatar';
import { usePortalStore } from '@/lib/store';
import { ProjectItem } from '@/lib/data';
import { 
  Plus, 
  Search, 
  Eye, 
  EyeOff, 
  Edit3, 
  Trash2, 
  Sparkles, 
  ExternalLink, 
  FolderGit2, 
  CheckCircle2, 
  Layers, 
  Calendar, 
  ShieldCheck, 
  Filter, 
  Video,
  X,
  RotateCcw
} from 'lucide-react';
import { Github } from '@/components/shared/Icons';

export default function AdminProjectsPage() {
  const { 
    projects, 
    batchInfos, 
    deleteProject, 
    toggleProjectVisibility 
  } = usePortalStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [batchFilter, setBatchFilter] = useState('all');
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'live' | 'hidden'>('all');

  // Preview & Delete modals
  const [previewProject, setPreviewProject] = useState<ProjectItem | null>(null);
  const [deletingProject, setDeletingProject] = useState<ProjectItem | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Available batches
  const availableBatches = batchInfos.length > 0
    ? batchInfos.map((b) => b.year)
    : ['2026', '2025', '2024'];

  const categories = [
    'IoT & Sensors',
    'AI & Computer Vision',
    'Green Energy',
    'Smart Mobility',
    'Web & Cloud',
  ];

  // Filter logic
  const filteredProjects = projects.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || (
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.teamName.toLowerCase().includes(q) ||
      (p.techStack && p.techStack.some((t) => t.toLowerCase().includes(q)))
    );

    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    const matchesBatch = batchFilter === 'all' || p.batchYear === batchFilter;
    const isLive = p.isVisible !== false && p.status !== 'rejected' && p.status !== 'pending';
    const matchesVisibility = 
      visibilityFilter === 'all' ? true :
      visibilityFilter === 'live' ? isLive :
      !isLive;

    return matchesSearch && matchesCategory && matchesBatch && matchesVisibility;
  });

  const handleToggleVisibility = (id: string, currentStatus: boolean) => {
    toggleProjectVisibility(id);
    setNotification(`Project is now ${!currentStatus ? 'Visible (Live)' : 'Hidden'} on the public showcase.`);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleConfirmDelete = () => {
    if (!deletingProject) return;
    deleteProject(deletingProject.id);
    setNotification(`Project "${deletingProject.title}" deleted from Firebase and showcase.`);
    setDeletingProject(null);
    setTimeout(() => setNotification(null), 3500);
  };

  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto pb-20">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[26px] sm:text-[30px] font-black text-[#0A0A0A] tracking-tight">
              Lab Projects Studio
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              {projects.length} Total Projects
            </span>
          </div>
          <p className="text-[14px] text-[#6B7280] mt-1">
            Manage, upload, edit, and curate research projects showcased across the Smart City Lab portal.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/proposal" target="_blank" rel="noopener noreferrer">
            <Button
              variant="outline"
              size="md"
              icon={<ExternalLink className="w-4 h-4" />}
            >
              Public Proposal Form
            </Button>
          </Link>
          <Link href="/admin/approvals">
            <Button
              variant="outline"
              size="md"
              icon={<CheckCircle2 className="w-4 h-4" />}
            >
              Review Proposals
            </Button>
          </Link>
          <Link href="/admin/projects/new">
            <Button
              variant="primary"
              size="md"
              icon={<Plus className="w-4 h-4" />}
            >
              Upload New Project
            </Button>
          </Link>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-[13px] font-medium flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4.5 border-[#E5E7EB]">
          <div className="text-[12px] font-semibold text-[#6B7280]">Total Projects</div>
          <div className="text-[24px] font-black text-[#0A0A0A] mt-1">{projects.length}</div>
        </Card>
        <Card className="p-4.5 border-[#E5E7EB]">
          <div className="text-[12px] font-semibold text-emerald-600">Live on Showcase</div>
          <div className="text-[24px] font-black text-emerald-700 mt-1">
            {projects.filter((p) => p.isVisible !== false && p.status !== 'rejected' && p.status !== 'pending').length}
          </div>
        </Card>
        <Card className="p-4.5 border-[#E5E7EB]">
          <div className="text-[12px] font-semibold text-amber-600">Featured In Highlights</div>
          <div className="text-[24px] font-black text-amber-700 mt-1">
            {projects.filter((p) => p.featured).length}
          </div>
        </Card>
        <Card className="p-4.5 border-[#E5E7EB]">
          <div className="text-[12px] font-semibold text-blue-600">Categories</div>
          <div className="text-[24px] font-black text-blue-700 mt-1">
            {new Set(projects.map((p) => p.category)).size}
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 sm:p-5 border-[#E5E7EB] space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
          <div className="md:col-span-5">
            <Input
              placeholder="Search projects by title, description, team, tech..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="w-4 h-4 text-gray-400" />}
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg border border-[#E5E7EB] bg-white text-[13px] text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={batchFilter}
              onChange={(e) => setBatchFilter(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg border border-[#E5E7EB] bg-white text-[13px] text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
            >
              <option value="all">All Batches</option>
              {availableBatches.map((b) => (
                <option key={b} value={b}>Batch {b}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={visibilityFilter}
              onChange={(e) => setVisibilityFilter(e.target.value as typeof visibilityFilter)}
              className="w-full px-3.5 py-2 rounded-lg border border-[#E5E7EB] bg-white text-[13px] text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
            >
              <option value="all">All Status</option>
              <option value="live">Live Only</option>
              <option value="hidden">Hidden</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-[12px] text-[#6B7280] pt-1">
          <span>Showing <strong>{filteredProjects.length}</strong> of {projects.length} projects</span>
          {(searchQuery || categoryFilter !== 'all' || batchFilter !== 'all' || visibilityFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('all');
                setBatchFilter('all');
                setVisibilityFilter('all');
              }}
              className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Reset Filters
            </button>
          )}
        </div>
      </Card>

      {/* Projects Grid / Cards */}
      {filteredProjects.length === 0 ? (
        <Card className="p-12 text-center border-[#E5E7EB] bg-[#FAFAFA]">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
            <FolderGit2 className="w-6 h-6" />
          </div>
          <h3 className="text-[17px] font-bold text-[#0A0A0A]">No projects match your query</h3>
          <p className="text-[13px] text-[#6B7280] mt-1 max-w-sm mx-auto">
            Try adjusting search keywords or filters, or upload a new research project.
          </p>
          <div className="mt-5">
            <Link href="/admin/projects/new">
              <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />}>
                Upload Project
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const isLive = project.isVisible !== false && project.status === 'approved';
            return (
              <Card 
                key={project.id}
                className="overflow-hidden border-[#E5E7EB] hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  {/* Media Header */}
                  <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                    {project.videoUrl ? (
                      <video src={project.videoUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                    ) : project.imageUrl ? (
                      <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-900 to-blue-950 flex items-center justify-center text-white/40 font-bold">
                        ◈ No Media
                      </div>
                    )}

                    <div className="absolute top-2.5 left-2.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/50 backdrop-blur-md text-white border border-white/15">
                        Batch {project.batchYear}
                      </span>
                    </div>

                    <div className="absolute top-2.5 right-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isLive ? 'bg-emerald-500 text-white' : 'bg-gray-500 text-white'
                      }`}>
                        {isLive ? 'LIVE' : 'HIDDEN'}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5 space-y-2.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 block">
                      {project.category}
                    </span>

                    <h3 className="text-[16px] font-bold text-[#0A0A0A] leading-snug line-clamp-2" title={project.title}>
                      {project.title}
                    </h3>

                    <p className="text-[13px] text-[#6B7280] line-clamp-2 leading-relaxed">
                      {project.tagline || project.description}
                    </p>

                    <div className="pt-1 flex flex-wrap gap-1">
                      {(project.techStack || []).slice(0, 3).map((t) => (
                        <span key={t} className="px-2 py-0.5 rounded text-[11px] bg-gray-100 text-gray-700 font-medium">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="p-4 border-t border-[#F3F4F6] bg-[#FAFAFA] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MemberAvatar name={project.teamLead || 'Aarav'} size="sm" isLead={true} />
                    <span className="text-[12px] font-bold text-[#0A0A0A] truncate max-w-[110px]">
                      {project.teamName}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Toggle Live/Hidden */}
                    <button
                      onClick={() => handleToggleVisibility(project.id, isLive)}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        isLive 
                          ? 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100' 
                          : 'text-gray-500 bg-gray-100 border-gray-200 hover:bg-gray-200'
                      }`}
                      title={isLive ? 'Hide from Showcase' : 'Publish to Showcase'}
                    >
                      {isLive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>

                    {/* Edit button */}
                    <Link
                      href={`/admin/projects/new?id=${project.id}`}
                      className="p-1.5 rounded-lg border border-blue-200 text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
                      title="Edit Project"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Link>

                    {/* Delete button */}
                    <button
                      onClick={() => setDeletingProject(project)}
                      className="p-1.5 rounded-lg border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                      title="Delete Project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingProject}
        onClose={() => setDeletingProject(null)}
        title="Confirm Project Deletion"
        maxWidth="md"
      >
        {deletingProject && (
          <div className="space-y-4 text-left">
            <p className="text-[14px] text-[#0A0A0A]">
              Are you sure you want to permanently delete <strong>&ldquo;{deletingProject.title}&rdquo;</strong>?
            </p>
            <p className="text-[13px] text-[#6B7280]">
              This action will remove the project from Firebase Firestore and the public showcase. This cannot be undone.
            </p>

            <div className="pt-4 border-t border-[#E5E7EB] flex items-center justify-end gap-2.5">
              <Button variant="outline" size="sm" onClick={() => setDeletingProject(null)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={handleConfirmDelete}>
                Delete Project
              </Button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}
