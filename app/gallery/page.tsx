'use client';

import React, { useState, useMemo } from 'react';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import Modal from '@/components/shared/Modal';
import Button from '@/components/shared/Button';
import ProjectThumbnail from '@/components/shared/ProjectThumbnail';
import GalleryCard from './components/GalleryCard';
import { usePortalStore } from '@/lib/store';
import { GalleryItem, ProjectItem } from '@/lib/data';
import { Sparkles, Image as ImageIcon, ExternalLink, Filter, Layers, ArrowRight } from 'lucide-react';

export default function GalleryPage() {
  const { gallery, projects } = usePortalStore();
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activePhoto, setActivePhoto] = useState<GalleryItem | null>(null);
  const [activeModalProject, setActiveModalProject] = useState<ProjectItem | null>(null);

  // Automatically aggregate all project cover images & additional photos across the full website into the gallery
  const allGalleryItems = useMemo<GalleryItem[]>(() => {
    const items: GalleryItem[] = [...gallery];

    // Extract images from all approved projects
    const approvedProjects = projects.filter((p) => p.isVisible !== false && p.status === 'approved');

    approvedProjects.forEach((project) => {
      // Primary project cover image
      if (project.imageUrl && project.imageUrl.trim()) {
        items.push({
          id: `proj-img-${project.id}-cover`,
          title: `${project.title}`,
          category: 'Project Showcase',
          date: project.publishedAt || '2026',
          imageUrl: project.imageUrl,
          description: project.tagline || project.description,
          projectId: project.id,
          projectTitle: project.title,
        });
      }

      // Additional project photos
      if (Array.isArray(project.images)) {
        project.images.forEach((imgUrl, idx) => {
          if (imgUrl && imgUrl.trim() && imgUrl !== project.imageUrl) {
            items.push({
              id: `proj-img-${project.id}-photo-${idx + 1}`,
              title: `${project.title} (Photo #${idx + 1})`,
              category: 'Project Showcase',
              date: project.publishedAt || '2026',
              imageUrl: imgUrl,
              description: `Hardware prototype and lab testing visual from ${project.title} (${project.teamName}).`,
              projectId: project.id,
              projectTitle: project.title,
            });
          }
        });
      }
    });

    return items;
  }, [gallery, projects]);

  const categories = ['All', 'Project Showcase', 'Hackathons', 'Field Testing', 'Tech Expo', 'Lab Session'];

  const filteredPhotos = activeCategory === 'All'
    ? allGalleryItems
    : allGalleryItems.filter((g) => g.category === activeCategory);

  const matchedProject = activePhoto?.projectId
    ? projects.find((p) => p.id === activePhoto.projectId)
    : null;

  return (
    <div className="min-h-screen bg-white text-[#0A0A0A] flex flex-col font-sans">
      <Navbar />

      <main className="flex-grow pt-24 sm:pt-28 pb-24">
        
        {/* Header Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-8 pb-10 border-b border-[#E5E7EB]">
          <div className="max-w-3xl text-left space-y-3">
            <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5" /> Visual Media & Project Archives
            </span>
            <h1 className="text-[32px] sm:text-[42px] font-black text-[#0A0A0A] tracking-tight">
              Lab Projects & Events Gallery
            </h1>
            <p className="text-[15px] sm:text-[16px] text-[#6B7280] leading-relaxed">
              Explore real-time visual captures, hardware schematics, student research prototypes, antenna field deployments, and hackathon highlights.
            </p>
          </div>
        </section>

        {/* Filter Pills and Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
          
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[13px] font-medium text-[#6B7280] mr-1 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5" /> Category:
              </span>
              {categories.map((cat) => {
                const count = cat === 'All' ? allGalleryItems.length : allGalleryItems.filter((g) => g.category === cat).length;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-[13px] font-medium border transition-all flex items-center gap-1.5 ${
                      activeCategory === cat
                        ? 'border-blue-600 text-blue-600 bg-blue-50/70 font-semibold shadow-xs'
                        : 'border-[#E5E7EB] text-[#6B7280] hover:text-[#0A0A0A] hover:bg-[#F8F9FA]'
                    }`}
                  >
                    <span>{cat}</span>
                    <span className="text-[11px] opacity-70">({count})</span>
                  </button>
                );
              })}
            </div>

            <div className="text-[13px] text-[#6B7280]">
              Showing <strong className="text-[#0A0A0A]">{filteredPhotos.length}</strong> visual captures
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPhotos.map((item) => (
              <GalleryCard
                key={item.id}
                item={item}
                onSelect={(selected) => setActivePhoto(selected)}
              />
            ))}
          </div>

        </section>

      </main>

      <Footer />

      {/* Photo Preview Modal */}
      <Modal
        isOpen={!!activePhoto}
        onClose={() => setActivePhoto(null)}
        title={activePhoto?.title}
        maxWidth="2xl"
      >
        {activePhoto && (
          <div className="space-y-4 text-left">
            <div className="rounded-xl overflow-hidden border border-[#E5E7EB] bg-slate-950 max-h-[70vh] flex items-center justify-center">
              <img
                src={activePhoto.imageUrl}
                alt={activePhoto.title}
                className="w-full h-auto object-contain max-h-[60vh] mx-auto"
              />
            </div>
            
            <div className="flex flex-wrap items-center justify-between gap-2 text-[13px] text-[#6B7280] pt-1">
              <span className="font-bold text-[#2563EB] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                {activePhoto.category}
              </span>
              <span>{activePhoto.date}</span>
            </div>

            <p className="text-[15px] text-[#0A0A0A] leading-relaxed">
              {activePhoto.description}
            </p>

            {/* If linked to a lab project, offer 1-click preview of full project modal */}
            {matchedProject && (
              <div className="pt-4 border-t border-[#E5E7EB] flex flex-wrap items-center justify-between gap-3 bg-[#F8F9FA] p-3.5 rounded-xl border">
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-bold text-gray-500 block">
                    Associated Research Project
                  </span>
                  <span className="text-[14px] font-bold text-gray-900 block">
                    {matchedProject.title}
                  </span>
                  <span className="text-[12px] text-gray-500">
                    Team: {matchedProject.teamName} • Batch {matchedProject.batchYear}
                  </span>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  icon={<ExternalLink className="w-3.5 h-3.5" />}
                  onClick={() => {
                    setActiveModalProject(matchedProject);
                  }}
                >
                  View Full Project Details
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Secondary Modal: Full Project Details & Video Modal */}
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
              <h4 className="text-[13px] font-bold uppercase tracking-wider text-gray-400 mb-2">Technologies Used</h4>
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

            <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-end gap-3">
              {activeModalProject.repoUrl && (
                <a href={activeModalProject.repoUrl} target="_blank" rel="noreferrer">
                  <Button variant="outline" size="sm">
                    Repository
                  </Button>
                </a>
              )}
              {activeModalProject.demoUrl && (
                <a href={activeModalProject.demoUrl} target="_blank" rel="noreferrer">
                  <Button variant="primary" size="sm">
                    Live Demo
                  </Button>
                </a>
              )}
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}