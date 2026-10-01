'use client';

import React, { useState } from 'react';
import { X, CheckCircle2, Upload } from 'lucide-react';
import { usePortalStore } from '@/lib/store';
import { uploadMediaFile } from '@/lib/mediaService';
import Button from './Button';
import { Input, Textarea } from './Input';

interface QuickSubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickSubmitModal({ isOpen, onClose }: QuickSubmitModalProps) {
  const { user, addQuickSubmission } = usePortalStore();
  const [type, setType] = useState<'project' | 'blog' | 'news' | 'trending'>('project');
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [category, setCategory] = useState('IoT & Sensors');
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [repoUrl, setRepoUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [trendingLink, setTrendingLink] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !summary) return;

    if (type === 'trending') {
      // Instant trending update publishes immediately without approval
      const generatedLink = `/news#trend-${Date.now()}`;
      setTrendingLink(generatedLink);
      addQuickSubmission({
        type: 'news',
        title: `[Trending] ${title}`,
        summary,
        studentName: user.name,
        studentRoll: user.rollNo || '2300290100098',
        teamName: user.teamName || 'Team CyberVision',
        details: {
          category: 'Announcement',
          instantPublish: true,
          shareableLink: generatedLink,
        },
      });
    } else {
      // Projects, blogs, news route to Super Admin for approval
      addQuickSubmission({
        type,
        title,
        summary,
        studentName: user.name,
        studentRoll: user.rollNo || '2300290100098',
        teamName: user.teamName || 'Team CyberVision',
        details: {
          category,
          imageUrl: imageUrl || undefined,
          repoUrl: repoUrl || undefined,
          demoUrl: demoUrl || undefined,
          submittedVia: 'Quick Submit Action',
        },
      });
    }

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setTitle('');
      setSummary('');
      setRepoUrl('');
      setDemoUrl('');
      setTrendingLink('');
      onClose();
    }, 2200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div 
        className="w-full max-w-lg bg-white rounded-xl border border-[#E5E7EB] p-6 sm:p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 rounded-lg text-[#6B7280] hover:text-[#0A0A0A] hover:bg-[#F8F9FA] transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="py-8 text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-[#10B981] mx-auto" />
            <h3 className="text-[20px] font-bold text-[#0A0A0A]">
              {type === 'trending' ? 'Trending Update Published!' : 'Submitted for Super Admin Approval'}
            </h3>
            <p className="text-[14px] text-[#6B7280] max-w-md mx-auto">
              {type === 'trending'
                ? 'Your update has been published immediately to the public news feed with a permanent shareable link.'
                : 'Your submission has been queued for Super Admin review. Once approved, it will automatically go live on the public showcase.'}
            </p>
            {trendingLink && (
              <p className="text-[13px] font-mono text-[#2563EB] bg-[#F8F9FA] p-2 rounded border border-[#E5E7EB]">
                {trendingLink}
              </p>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <h3 className="text-[20px] font-bold text-[#0A0A0A]">Quick Submit</h3>
              <p className="text-[14px] text-[#6B7280]">
                Submit your project, blog, news, or share an instant trending update.
              </p>
            </div>

            {/* Type selector */}
            <div className="space-y-1.5">
              <label className="block text-[14px] font-medium text-[#0A0A0A]">Submission Type</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'project', label: 'Project' },
                  { id: 'blog', label: 'Blog' },
                  { id: 'news', label: 'News' },
                  { id: 'trending', label: 'Trending ⚡' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setType(item.id as typeof type)}
                    className={`py-2 px-3 text-[14px] font-medium rounded-lg border transition-colors ${
                      type === item.id
                        ? 'border-[#2563EB] text-[#2563EB] bg-[#F8F9FA]'
                        : 'border-[#E5E7EB] text-[#6B7280] hover:text-[#0A0A0A]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              {type === 'trending' && (
                <p className="text-[12px] text-[#2563EB]">
                  Instant post: Publishes directly to the public feed with a shareable link without waiting for approval.
                </p>
              )}
            </div>

            <Input
              label="Title"
              placeholder="e.g. Smart IoT Grid Monitoring with ESP32"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <Textarea
              label="Summary / Description"
              placeholder="Describe what you built or learned..."
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              required
            />

            {type === 'project' && (
              <>
                <div className="space-y-1.5">
                  <label className="block text-[14px] font-medium text-[#0A0A0A]">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-[15px] text-[#0A0A0A] focus:border-[#2563EB] focus:outline-none"
                  >
                    <option value="IoT & Sensors">IoT & Sensors</option>
                    <option value="AI & Computer Vision">AI & Computer Vision</option>
                    <option value="Smart Mobility">Smart Mobility</option>
                    <option value="Green Energy">Green Energy</option>
                    <option value="Web & Cloud">Web & Cloud</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[14px] font-medium text-[#0A0A0A]">Project Cover Image</label>
                  <Input
                    placeholder="Image URL or upload below..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                  <div className="pt-1 flex items-center gap-2">
                    <input
                      type="file"
                      id="quick-image-upload"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setIsUploading(true);
                          try {
                            const url = await uploadMediaFile(file, 'submissions/covers');
                            setImageUrl(url);
                          } catch (err) {
                            console.warn('Upload error:', err);
                          } finally {
                            setIsUploading(false);
                          }
                        }
                      }}
                      className="hidden"
                    />
                    <label
                      htmlFor="quick-image-upload"
                      className="px-3 py-1.5 rounded-lg border border-[#E5E7EB] text-[12px] font-medium text-[#6B7280] hover:text-[#0A0A0A] hover:bg-[#F8F9FA] cursor-pointer flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploading ? 'Uploading...' : imageUrl ? 'Replace Image' : 'Upload Image File'}</span>
                    </label>
                    {imageUrl && (
                      <span className="text-[11px] text-emerald-600 font-semibold">✓ Image attached</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="GitHub Repository"
                    placeholder="https://github.com/..."
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                  />
                  <Input
                    label="Live Demo Link"
                    placeholder="https://..."
                    value={demoUrl}
                    onChange={(e) => setDemoUrl(e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="pt-2 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {type === 'trending' ? 'Publish Now' : 'Submit for Review'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
