'use client';

import React, { useState } from 'react';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import Modal from '@/components/shared/Modal';
import GalleryCard from './components/GalleryCard';
import { usePortalStore } from '@/lib/store';
import { GalleryItem } from '@/lib/data';

export default function GalleryPage() {
  const { gallery } = usePortalStore();
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activePhoto, setActivePhoto] = useState<GalleryItem | null>(null);

  const categories = ['All', 'Hackathons', 'Field Testing', 'Tech Expo', 'Lab Session'];

  const filteredPhotos = activeCategory === 'All'
    ? gallery
    : gallery.filter((g) => g.category === activeCategory);

  return (
    <div className="min-h-screen bg-white text-[#0A0A0A] flex flex-col font-sans">
      <Navbar />

      <main className="flex-grow pt-24 sm:pt-28 pb-24">
        
        {/* Header Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-8 pb-10 border-b border-[#E5E7EB]">
          <div className="max-w-2xl text-left space-y-3">
            <p className="text-[13px] font-semibold text-[#2563EB] tracking-wider uppercase">
              Visual Archives
            </p>
            <h1 className="text-[32px] sm:text-[40px] font-bold text-[#0A0A0A] tracking-tight">
              Lab Events & Field Testing Gallery
            </h1>
            <p className="text-[15px] text-[#6B7280] leading-relaxed">
              Moments from hardware hackathons, sensor rigging, antenna deployments, and prototype showcases.
            </p>
          </div>
        </section>

        {/* Filter Pills and Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
          
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[13px] text-[#6B7280] mr-2">Category:</span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-[13px] font-medium border transition-colors ${
                  activeCategory === cat
                    ? 'border-[#2563EB] text-[#2563EB] bg-[#F8F9FA]'
                    : 'border-[#E5E7EB] text-[#6B7280] hover:text-[#0A0A0A]'
                }`}
              >
                {cat}
              </button>
            ))}
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
            <div className="rounded-lg overflow-hidden border border-[#E5E7EB] bg-[#F8F9FA] max-h-[70vh]">
              <img
                src={activePhoto.imageUrl}
                alt={activePhoto.title}
                className="w-full h-auto object-contain max-h-[60vh] mx-auto"
              />
            </div>
            <div className="flex items-center justify-between text-[13px] text-[#6B7280]">
              <span className="font-semibold text-[#2563EB]">{activePhoto.category}</span>
              <span>{activePhoto.date}</span>
            </div>
            <p className="text-[15px] text-[#0A0A0A] leading-relaxed">
              {activePhoto.description}
            </p>
          </div>
        )}
      </Modal>

    </div>
  );
}