'use client';

import React, { useState } from 'react';
import Card from '@/components/shared/Card';
import Button from '@/components/shared/Button';
import { Input, Textarea } from '@/components/shared/Input';
import Modal from '@/components/shared/Modal';
import { usePortalStore } from '@/lib/store';
import { BlogItem } from '@/lib/data';
import { 
  BookOpen, 
  Eye, 
  EyeOff, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';

export default function AdminBlogsPage() {
  const { 
    user, 
    blogs, 
    addBlog, 
    updateBlog, 
    deleteBlog, 
    toggleBlogVisibility 
  } = usePortalStore();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogItem | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'live' | 'hidden'>('all');

  // Form State
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [authorName, setAuthorName] = useState(user.name || 'Aarav Sharma');
  const [authorRoll, setAuthorRoll] = useState(user.rollNo || '2200290100012');
  const [teamName, setTeamName] = useState(user.teamName || 'Team CyberVision');
  const [readTime, setReadTime] = useState('5 min read');
  const [tagsText, setTagsText] = useState('Edge AI, Embedded, IoT');
  const [coverImage, setCoverImage] = useState('https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80');

  const isSuperAdmin = user.role === 'super_admin';

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    addBlog({
      title,
      excerpt: excerpt || title,
      content,
      author: {
        name: authorName,
        role: 'Research Intern',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        rollNo: authorRoll,
      },
      teamName,
      coverImage: coverImage || 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
      readTime,
      tags: tagsText.split(',').map((t) => t.trim()).filter(Boolean),
      publishedAt: new Date().toISOString().split('T')[0],
      status: 'approved',
      isVisible: true,
    });

    setCreateModalOpen(false);
    setTitle('');
    setExcerpt('');
    setContent('');
    setNotification(`Article "${title}" published live to the public blogs feed.`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBlog) return;

    updateBlog(editingBlog.id, {
      title: editingBlog.title,
      excerpt: editingBlog.excerpt,
      content: editingBlog.content,
      author: editingBlog.author,
      teamName: editingBlog.teamName,
      coverImage: editingBlog.coverImage,
      readTime: editingBlog.readTime,
      tags: editingBlog.tags,
      status: editingBlog.status,
      isVisible: editingBlog.isVisible,
    });

    setNotification(`Article "${editingBlog.title}" updated.`);
    setEditingBlog(null);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleToggleVisibility = (b: BlogItem) => {
    toggleBlogVisibility(b.id);
    const nextState = b.isVisible === false;
    setNotification(
      nextState
        ? `"${b.title}" is now SHOWN LIVE on the public website.`
        : `"${b.title}" is now HIDDEN from the public website.`
    );
    setTimeout(() => setNotification(null), 4000);
  };

  const filteredBlogs = blogs.filter((b) => {
    const isLive = b.isVisible !== false && b.status === 'approved';
    if (visibilityFilter === 'live') return isLive;
    if (visibilityFilter === 'hidden') return !isLive;
    return true;
  });

  return (
    <div className="space-y-8 text-left">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E5E7EB]">
        <div>
          <h1 className="text-[28px] sm:text-[32px] font-bold text-[#0A0A0A] tracking-tight">
            Manage Student Research Blogs
          </h1>
          <p className="text-[14px] text-[#6B7280] mt-1">
            Publish technical articles, manage submissions from student teams, and control visibility on the public website.
          </p>
        </div>

        {isSuperAdmin && (
          <Button 
            variant="primary" 
            size="md" 
            onClick={() => setCreateModalOpen(true)}
            className="shadow-sm shadow-blue-600/30 hover:shadow-md hover:shadow-blue-600/40"
          >
            + Publish Article
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
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[24px] font-bold text-[#0A0A0A]">{blogs.length}</div>
            <div className="text-[13px] text-[#6B7280]">Total Articles</div>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#10B981]">
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[24px] font-bold text-[#0A0A0A]">
              {blogs.filter((b) => b.isVisible !== false && b.status === 'approved').length}
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
              {blogs.filter((b) => b.isVisible === false || b.status !== 'approved').length}
            </div>
            <div className="text-[13px] text-[#6B7280]">Hidden from Public Website</div>
          </div>
        </Card>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden shadow-sm">
        
        {/* Visibility Filter Bar */}
        <div className="p-4 sm:p-5 border-b border-[#E5E7EB] flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[13px] text-[#6B7280] mr-1">Display Status:</span>
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
                {v === 'all' ? 'All Articles' : v === 'live' ? 'Live on Site' : 'Hidden'}
              </button>
            ))}
          </div>

          <span className="text-[13px] text-[#6B7280]">
            Showing {filteredBlogs.length} articles
          </span>
        </div>

        {/* Table Content */}
        {filteredBlogs.length === 0 ? (
          <div className="p-12 text-center text-[#6B7280] text-[14px]">
            No blogs found matching the filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F8F9FA] text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider">
                  <th className="py-3.5 px-4">Article Title & Excerpt</th>
                  <th className="py-3.5 px-4">Author & Team</th>
                  <th className="py-3.5 px-4">Tags</th>
                  <th className="py-3.5 px-4">Read Time</th>
                  <th className="py-3.5 px-4">Website Display</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB] text-[14px]">
                {filteredBlogs.map((b, idx) => {
                  const isLive = b.isVisible !== false && b.status === 'approved';

                  return (
                    <tr
                      key={b.id}
                      className={`transition-colors ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-[#F8F9FA]'
                      } hover:bg-[#F1F3F5]`}
                    >
                      {/* Title & Cover */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={b.coverImage}
                            alt={b.title}
                            className="w-14 h-11 rounded-lg object-cover border border-[#E5E7EB] flex-shrink-0"
                          />
                          <div>
                            <div className="font-semibold text-[#0A0A0A] line-clamp-1">
                              {b.title}
                            </div>
                            <div className="text-[12px] text-[#6B7280] line-clamp-1">
                              {b.excerpt}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Author & Team */}
                      <td className="py-3.5 px-4 text-[13px]">
                        <div className="font-medium text-[#0A0A0A]">{b.author.name}</div>
                        <div className="text-[12px] text-[#6B7280]">{b.teamName}</div>
                      </td>

                      {/* Tags */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {(b.tags || []).slice(0, 2).map((t, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#F8F9FA] border border-[#E5E7EB] text-[#2563EB]"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Read Time */}
                      <td className="py-3.5 px-4 text-[13px] text-[#6B7280]">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {b.readTime}
                        </span>
                      </td>

                      {/* Website Display Badge */}
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

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        {isSuperAdmin ? (
                          <div className="inline-flex items-center gap-2 justify-end">
                            {/* Hide / Show Toggle */}
                            <button
                              onClick={() => handleToggleVisibility(b)}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[12px] font-medium border transition-colors ${
                                isLive
                                  ? 'border-[#E5E7EB] bg-white text-[#6B7280] hover:text-[#0A0A0A]'
                                  : 'border-[#2563EB] bg-[#F8F9FA] text-[#2563EB]'
                              }`}
                              title={isLive ? 'Hide blog from public site' : 'Show blog on public site'}
                            >
                              {isLive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              <span>{isLive ? 'Hide' : 'Show Live'}</span>
                            </button>

                            {/* Edit */}
                            <button
                              onClick={() => setEditingBlog(b)}
                              className="p-1.5 rounded-lg border border-[#E5E7EB] bg-white text-[#6B7280] hover:text-[#0A0A0A] transition-colors"
                              title="Edit Article"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => {
                                if (confirm(`Delete article "${b.title}"?`)) {
                                  deleteBlog(b.id);
                                  setNotification(`Article "${b.title}" deleted.`);
                                  setTimeout(() => setNotification(null), 3000);
                                }
                              }}
                              className="p-1.5 rounded-lg text-[#EF4444] hover:bg-[#FEE2E2] transition-colors"
                              title="Delete Article"
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
        )}
      </div>

      {/* ======================= CREATE BLOG MODAL ======================= */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Publish New Student Research Blog"
        maxWidth="xl"
      >
        <form onSubmit={handleCreate} className="space-y-4 text-left">
          <Input
            label="Article Title"
            placeholder="e.g. Ultra-Low Latency YOLOv8 Inference on Jetson Orin Nano"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <Input
            label="Short Excerpt (Summary for Cards)"
            placeholder="e.g. How our team achieved 45 FPS on an embedded 15W power envelope..."
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            required
          />

          <Textarea
            label="Article Content (Markdown supported)"
            placeholder="Write the full case study breakdown, hardware choices, benchmarks, and outcomes..."
            rows={6}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Author Student Name"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              required
            />
            <Input
              label="Student Roll No"
              value={authorRoll}
              onChange={(e) => setAuthorRoll(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Team Name"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              required
            />
            <Input
              label="Read Time"
              value={readTime}
              onChange={(e) => setReadTime(e.target.value)}
            />
            <Input
              label="Tags (comma-separated)"
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
            />
          </div>

          <Input
            label="Cover Image URL"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
          />

          <div className="pt-2 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary"
              className="shadow-sm shadow-blue-600/30 hover:shadow-md hover:shadow-blue-600/40"
            >
              Publish Article Live
            </Button>
          </div>
        </form>
      </Modal>

      {/* ======================= EDIT BLOG MODAL ======================= */}
      {editingBlog && (
        <Modal
          isOpen={!!editingBlog}
          onClose={() => setEditingBlog(null)}
          title={`Edit Blog: ${editingBlog.title}`}
          maxWidth="xl"
        >
          <form onSubmit={handleSaveEdit} className="space-y-4 text-left">
            <Input
              label="Article Title"
              value={editingBlog.title}
              onChange={(e) => setEditingBlog({ ...editingBlog, title: e.target.value })}
              required
            />

            <Input
              label="Excerpt"
              value={editingBlog.excerpt}
              onChange={(e) => setEditingBlog({ ...editingBlog, excerpt: e.target.value })}
              required
            />

            <Textarea
              label="Content"
              rows={5}
              value={editingBlog.content}
              onChange={(e) => setEditingBlog({ ...editingBlog, content: e.target.value })}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Author Name"
                value={editingBlog.author.name}
                onChange={(e) => setEditingBlog({
                  ...editingBlog,
                  author: { ...editingBlog.author, name: e.target.value },
                })}
                required
              />
              <Input
                label="Team Name"
                value={editingBlog.teamName}
                onChange={(e) => setEditingBlog({ ...editingBlog, teamName: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Read Time"
                value={editingBlog.readTime}
                onChange={(e) => setEditingBlog({ ...editingBlog, readTime: e.target.value })}
              />
              <Input
                label="Tags (comma separated)"
                value={(editingBlog.tags || []).join(', ')}
                onChange={(e) => setEditingBlog({
                  ...editingBlog,
                  tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
                })}
              />
            </div>

            <Input
              label="Cover Image URL"
              value={editingBlog.coverImage}
              onChange={(e) => setEditingBlog({ ...editingBlog, coverImage: e.target.value })}
            />

            {/* Visibility Toggle in Edit Modal */}
            <div className="p-4 rounded-xl border border-[#E5E7EB] bg-[#F8F9FA] flex items-center justify-between">
              <div>
                <span className="font-semibold text-[#0A0A0A] block text-[14px]">
                  Show on Public Website
                </span>
                <span className="text-[12px] text-[#6B7280] block">
                  Toggle whether this blog article is visible to anyone on the public website.
                </span>
              </div>
              <input
                type="checkbox"
                checked={editingBlog.isVisible !== false && editingBlog.status === 'approved'}
                onChange={(e) => setEditingBlog({
                  ...editingBlog,
                  isVisible: e.target.checked,
                  status: e.target.checked ? 'approved' : editingBlog.status,
                })}
                className="w-5 h-5 rounded text-[#2563EB] cursor-pointer"
              />
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setEditingBlog(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
}
