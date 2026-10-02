'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import Button from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import Modal from '@/components/shared/Modal';
import ProjectCard from './components/ProjectCard';
import ProjectCardSkeleton from './components/ProjectCardSkeleton';
import ProjectThumbnail from '@/components/shared/ProjectThumbnail';
import MemberAvatar from '@/components/shared/MemberAvatar';
import { StaggerGrid, StaggerItem, FadeUp } from '@/components/shared/Motion';
import { usePortalStore } from '@/lib/store';
import { ProjectItem } from '@/lib/data';
import { ExternalLink, Sparkles, Search, Layers, Calendar, RotateCcw } from 'lucide-react';
import { Github } from '@/components/shared/Icons';

export default function ProjectsPage() {
  const { projects } = usePortalStore();
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedBatch, setSelectedBatch] = useState<string>('All');
  const [activeModalProject, setActiveModalProject] = useState<ProjectItem | null>(null);

  useEffect(() => {
    // Simulate initial loading to show skeleton gracefully
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  const categories = ['All', 'AI & Computer Vision', 'IoT & Sensors', 'Green Energy', 'Smart Mobility', 'Web & Cloud'];
  const batches = ['All', '2026', '2025', '2024'];

  const approvedProjects = projects.filter(
    (p) => (p.isVisible !== false) && (p.status === 'approved')
  );

  const filteredProjects = approvedProjects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.techStack.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesBatch = selectedBatch === 'All' || p.batchYear === selectedBatch;

    return matchesSearch && matchesCategory && matchesBatch;
  });

  return (
    <div className="min-h-screen bg-white text-[#0A0A0A] flex flex-col font-sans">
      <Navbar />

      <main className="flex-grow pt-24 sm:pt-28 pb-24">
        
        {/* Header Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-8 pb-8 border-b border-[#E5E7EB]">
          <div className="max-w-3xl text-left">
            <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full mb-3.5">
              <Sparkles className="w-3.5 h-3.5" /> Lab Showcase & Verified Innovations
            </span>
            <h1 className="text-[32px] sm:text-[42px] font-black text-[#0A0A0A] tracking-tight leading-tight mb-3">
              Approved Lab Projects
            </h1>
            <p className="text-[15px] sm:text-[16px] text-[#6B7280] leading-relaxed">
              Explore smart urban systems, edge IoT devices, and AI models engineered by KIET students and approved by the Super Admin.
            </p>
          </div>
        </section>

        {/* Filter and Search Bar */}
        <section className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="w-full lg:w-96 relative">
              <Input
                placeholder="Search projects or technologies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
              <span className="text-[13px] font-medium text-[#6B7280] flex items-center gap-1.5 mr-1">
                <Layers className="w-3.5 h-3.5" /> Category:
              </span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-[13px] font-medium border transition-all ${
                    selectedCategory === cat
                      ? 'border-blue-600 text-blue-600 bg-blue-50/70 shadow-sm font-semibold'
                      : 'border-[#E5E7EB] text-[#6B7280] hover:text-[#0A0A0A] hover:bg-[#F8F9FA]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

          </div>

          {/* Batch Selector & Status bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
            <div className="flex flex-wrap items-center gap-2 text-[13px] text-[#6B7280]">
              <span className="font-medium flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Filter by Batch:
              </span>
              {batches.map((b) => (
                <button
                  key={b}
                  onClick={() => setSelectedBatch(b)}
                  className={`px-3 py-1 rounded-lg text-[13px] font-medium border transition-colors ${
                    selectedBatch === b
                      ? 'border-[#0A0A0A] text-[#0A0A0A] bg-gray-100 font-semibold shadow-xs'
                      : 'border-[#E5E7EB] text-[#6B7280] hover:text-[#0A0A0A] hover:bg-[#F8F9FA]'
                  }`}
                >
                  {b === 'All' ? 'All Batches' : `Batch ${b}`}
                </button>
              ))}
            </div>

            <div className="text-[13px] text-[#6B7280]">
              {!isLoading && (
                <span>
                  Showing <strong className="text-[#0A0A0A]">{filteredProjects.length}</strong> of {approvedProjects.length} projects
                </span>
              )}
            </div>
          </div>

          {/* Project Cards Grid / Skeleton Loader */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
              {Array.from({ length: 6 }).map((_, idx) => (
                <ProjectCardSkeleton key={idx} />
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="py-20 text-center border border-[#E5E7EB] rounded-2xl bg-[#F8F9FA] p-8">
              <p className="text-[17px] font-bold text-[#0A0A0A]">No projects match your filter</p>
              <p className="text-[14px] text-[#6B7280] mt-1.5 max-w-md mx-auto">
                Try resetting the category or search keywords to view all approved projects.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-5"
                icon={<RotateCcw className="w-3.5 h-3.5" />}
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setSelectedBatch('All');
                }}
              >
                Reset Filters
              </Button>
            </div>
          ) : (
            <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2 items-stretch">
              {filteredProjects.map((project) => (
                <StaggerItem key={project.id} className="h-full">
                  <ProjectCard
                    project={project}
                    onSelect={(p) => setActiveModalProject(p)}
                  />
                </StaggerItem>
              ))}
            </StaggerGrid>
          )}

        </section>

      </main>

      <Footer />

      {/* Project Detail Modal */}
      <Modal
        isOpen={!!activeModalProject}
        onClose={() => setActiveModalProject(null)}
        title={activeModalProject?.title}
        maxWidth="2xl"
      >
        {activeModalProject && (
          <div className="space-y-6 text-left">
            <ProjectThumbnail
              imageUrl={activeModalProject.imageUrl}
              images={activeModalProject.images}
              videoUrl={activeModalProject.videoUrl}
              title={activeModalProject.title}
              category={activeModalProject.category}
              className="h-72 sm:h-80 w-full rounded-xl"
            />

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5 text-[13px] text-[#6B7280]">
                <span className="font-bold text-[#2563EB] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                  {activeModalProject.category}
                </span>
                <span>•</span>
                <span className="font-semibold text-gray-700">Batch {activeModalProject.batchYear}</span>
                <span>•</span>
                <span>Team: <strong className="text-gray-900">{activeModalProject.teamName}</strong></span>
              </div>
              <p className="text-[15px] text-[#0A0A0A] leading-relaxed pt-1">
                {activeModalProject.description}
              </p>
            </div>

            <div>
              <h4 className="text-[13px] font-bold uppercase tracking-wider text-gray-400 mb-2">Technologies & Hardware</h4>
              <div className="flex flex-wrap gap-2">
                {activeModalProject.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="px-2.5 py-1 rounded-md text-[12px] bg-[#F8F9FA] text-[#0A0A0A] font-medium border border-[#E5E7EB]"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Team Profiles & Contributors */}
            <div className="p-4 rounded-xl border border-[#E5E7EB] bg-[#F8F9FA] space-y-3">
              <h4 className="text-[14px] font-bold text-[#0A0A0A] flex items-center justify-between">
                <span>Research Team Roster</span>
                <span className="text-[12px] font-normal text-[#2563EB]">{activeModalProject.teamName}</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Team Lead */}
                <div className="p-2.5 rounded-lg bg-white border border-blue-200 flex items-center gap-2.5">
                  <MemberAvatar
                    name={activeModalProject.teamLead}
                    size="md"
                    isLead={true}
                  />
                  <div>
                    <div className="text-[13px] font-bold text-[#0A0A0A] flex items-center gap-1">
                      {activeModalProject.teamLead}
                      <span className="text-[9px] bg-[#2563EB] text-white px-1 py-0.2 rounded font-bold">
                        LEAD
                      </span>
                    </div>
                    <div className="text-[11px] text-[#6B7280]">Team Coordinator</div>
                  </div>
                </div>

                {/* Other Members */}
                {(activeModalProject.members || [])
                  .filter((m) => m !== activeModalProject.teamLead)
                  .map((mName, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-white border border-[#E5E7EB] flex items-center gap-2.5">
                      <MemberAvatar
                        name={mName}
                        size="md"
                      />
                      <div>
                        <div className="text-[13px] font-semibold text-[#0A0A0A]">{mName}</div>
                        <div className="text-[11px] text-[#6B7280]">Research Intern</div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Links and Action Bar */}
            <div className="pt-3 border-t border-[#E5E7EB] flex flex-wrap items-center justify-between gap-3">
              <span className="text-[12px] text-gray-500">
                Published {activeModalProject.publishedAt || '2026'}
              </span>
              <div className="flex items-center gap-2.5">
                {activeModalProject.repoUrl && (
                  <a
                    href={activeModalProject.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button variant="outline" size="sm" icon={<Github className="w-4 h-4" />}>
                      Source Code
                    </Button>
                  </a>
                )}
                {activeModalProject.demoUrl && (
                  <a
                    href={activeModalProject.demoUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button variant="primary" size="sm" icon={<ExternalLink className="w-4 h-4" />}>
                      Live Demo
                    </Button>
                  </a>
                )}
              </div>
            </div>

            {/* LOWER SECTION: Other Lab Projects */}
            {approvedProjects.filter((p) => p.id !== activeModalProject.id).length > 0 && (
              <div className="pt-5 border-t border-[#E5E7EB] space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-[14px] font-bold text-[#0A0A0A] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span>Explore Other Lab Projects</span>
                  </h4>
                  <span className="text-[12px] text-gray-400">Click to preview</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {approvedProjects
                    .filter((p) => p.id !== activeModalProject.id)
                    .slice(0, 4)
                    .map((otherProj) => (
                      <button
                        key={otherProj.id}
                        type="button"
                        onClick={() => setActiveModalProject(otherProj)}
                        className="p-3 rounded-xl border border-gray-200 hover:border-blue-500 bg-white hover:bg-blue-50/40 transition-all flex items-center gap-3 text-left group"
                      >
                        <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-slate-900 border border-gray-200">
                          {otherProj.imageUrl ? (
                            <img
                              src={otherProj.imageUrl}
                              alt={otherProj.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white text-[10px] font-bold">
                              DEMO
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block truncate">
                            {otherProj.category}
                          </span>
                          <h5 className="text-[13px] font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                            {otherProj.title}
                          </h5>
                          <span className="text-[11px] text-gray-500 truncate block">
                            Batch {otherProj.batchYear} • {otherProj.teamName}
                          </span>
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

    </div>
  );
}