'use client';

import React, { useState } from 'react';
import Card from '@/components/shared/Card';
import Button from '@/components/shared/Button';
import { Input, Textarea } from '@/components/shared/Input';
import Modal from '@/components/shared/Modal';
import { usePortalStore } from '@/lib/store';
import { NewsItem } from '@/lib/data';
import { 
  Newspaper, 
  Eye, 
  EyeOff, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Flame, 
  Calendar 
} from 'lucide-react';

export default function AdminNewsPage() {
  const { 
    user, 
    news, 
    addNews, 
    updateNews, 
    deleteNews, 
    toggleNewsVisibility 
  } = usePortalStore();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'live' | 'hidden'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Form State
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<NewsItem['category']>('Lab Update');
  const [author, setAuthor] = useState(user.name || 'Super Admin');
  const [teamName, setTeamName] = useState(user.teamName || '');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80');
  const [trending, setTrending] = useState(false);

  const isSuperAdmin = user.role === 'super_admin';

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !summary) return;

    addNews({
      title,
      summary,
      content: content || summary,
      category,
      author,
      teamName: teamName || undefined,
      publishedAt: new Date().toISOString().split('T')[0],
      imageUrl: imageUrl || undefined,
      status: 'approved',
      isVisible: true,
      trending,
    });

    setCreateModalOpen(false);
    setTitle('');
    setSummary('');
    setContent('');
    setNotification(`News update "${title}" published live to the public feed.`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNews) return;

    updateNews(editingNews.id, {
      title: editingNews.title,
      summary: editingNews.summary,
      content: editingNews.content,
      category: editingNews.category,
      author: editingNews.author,
      teamName: editingNews.teamName || undefined,
      imageUrl: editingNews.imageUrl || undefined,
      trending: editingNews.trending,
      status: editingNews.status,
      isVisible: editingNews.isVisible,
    });

    setNotification(`News "${editingNews.title}" updated.`);
    setEditingNews(null);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleToggleVisibility = (n: NewsItem) => {
    toggleNewsVisibility(n.id);
    const nextState = n.isVisible === false;
    setNotification(
      nextState
        ? `"${n.title}" is now SHOWN LIVE on the public news feed.`
        : `"${n.title}" is now HIDDEN from the public website.`
    );
    setTimeout(() => setNotification(null), 4000);
  };

  const filteredNews = news.filter((n) => {
    const isLive = n.isVisible !== false && n.status === 'approved';
    const matchesVis = 
      visibilityFilter === 'all' 
        ? true 
        : visibilityFilter === 'live' 
        ? isLive 
        : !isLive;
    const matchesCat = categoryFilter === 'all' || n.category === categoryFilter;

    return matchesVis && matchesCat;
  });

  return (
    <div className="space-y-8 text-left">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E5E7EB]">
        <div>
          <h1 className="text-[28px] sm:text-[32px] font-bold text-[#0A0A0A] tracking-tight">
            Manage News & Announcements
          </h1>
          <p className="text-[14px] text-[#6B7280] mt-1">
            Publish real-time lab updates, awards, and hackathon highlights. Toggle items between Live and Hidden.
          </p>
        </div>

        {isSuperAdmin && (
          <Button 
            variant="primary" 
            size="md" 
            onClick={() => setCreateModalOpen(true)}
            className="shadow-sm shadow-blue-600/30 hover:shadow-md hover:shadow-blue-600/40"
          >
            + Post News Update
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
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#F8F9FA] border border-[#E5E7EB] flex items-center justify-center text-[#2563EB]">
            <Newspaper className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[24px] font-bold text-[#0A0A0A]">{news.length}</div>
            <div className="text-[13px] text-[#6B7280]">Total Updates</div>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#10B981]">
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[24px] font-bold text-[#0A0A0A]">
              {news.filter((n) => n.isVisible !== false && n.status === 'approved').length}
            </div>
            <div className="text-[13px] text-[#6B7280]">Live on Public Feed</div>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[24px] font-bold text-[#0A0A0A]">
              {news.filter((n) => n.trending).length}
            </div>
            <div className="text-[13px] text-[#6B7280]">Trending Highlights</div>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gray-50 border border-[#E5E7EB] flex items-center justify-center text-[#6B7280]">
            <EyeOff className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[24px] font-bold text-[#0A0A0A]">
              {news.filter((n) => n.isVisible === false || n.status !== 'approved').length}
            </div>
            <div className="text-[13px] text-[#6B7280]">Hidden Updates</div>
          </div>
        </Card>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden shadow-sm">
        
        {/* Filter Bar */}
        <div className="p-4 sm:p-5 border-b border-[#E5E7EB] flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
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
                {v === 'all' ? 'All Updates' : v === 'live' ? 'Live on Site' : 'Hidden'}
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
              <option value="Lab Update">Lab Update</option>
              <option value="Achievement">Achievement</option>
              <option value="Announcement">Announcement</option>
              <option value="Hackathon">Hackathon</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        {filteredNews.length === 0 ? (
          <div className="p-12 text-center text-[#6B7280] text-[14px]">
            No news items found matching selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F8F9FA] text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider">
                  <th className="py-3.5 px-4">Headline & Summary</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Author / Team</th>
                  <th className="py-3.5 px-4">Published Date</th>
                  <th className="py-3.5 px-4">Website Display</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB] text-[14px]">
                {filteredNews.map((n, idx) => {
                  const isLive = n.isVisible !== false && n.status === 'approved';

                  return (
                    <tr
                      key={n.id}
                      className={`transition-colors ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-[#F8F9FA]'
                      } hover:bg-[#F1F3F5]`}
                    >
                      {/* Headline & Summary */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {n.imageUrl && (
                            <img
                              src={n.imageUrl}
                              alt=""
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                const target = e.currentTarget as HTMLImageElement;
                                target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="56" height="44" viewBox="0 0 56 44"><rect width="56" height="44" fill="%232563EB"/><text x="28" y="26" fill="white" font-size="9" font-family="sans-serif" font-weight="bold" text-anchor="middle">NEWS</text></svg>';
                              }}
                              className="w-14 h-11 rounded-lg object-cover border border-[#E5E7EB] flex-shrink-0"
                            />
                          )}
                          <div>
                            <div className="font-semibold text-[#0A0A0A] line-clamp-1 flex items-center gap-1.5">
                              {n.title}
                              {n.trending && (
                                <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                                  <Flame className="w-2.5 h-2.5" /> TRENDING
                                </span>
                              )}
                            </div>
                            <div className="text-[12px] text-[#6B7280] line-clamp-1">
                              {n.summary}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <span className="capitalize text-[12px] px-2 py-0.5 rounded border border-[#E5E7EB] bg-white text-[#2563EB] font-medium">
                          {n.category}
                        </span>
                      </td>

                      {/* Author / Team */}
                      <td className="py-3.5 px-4 text-[13px]">
                        <div className="font-medium text-[#0A0A0A]">{n.author}</div>
                        {n.teamName && (
                          <div className="text-[11px] text-[#6B7280]">{n.teamName}</div>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-[13px] text-[#6B7280]">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {n.publishedAt}
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
                              onClick={() => handleToggleVisibility(n)}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[12px] font-medium border transition-colors ${
                                isLive
                                  ? 'border-[#E5E7EB] bg-white text-[#6B7280] hover:text-[#0A0A0A]'
                                  : 'border-[#2563EB] bg-[#F8F9FA] text-[#2563EB]'
                              }`}
                              title={isLive ? 'Hide news from public site' : 'Show news on public site'}
                            >
                              {isLive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              <span>{isLive ? 'Hide' : 'Show Live'}</span>
                            </button>

                            {/* Edit */}
                            <button
                              onClick={() => setEditingNews(n)}
                              className="p-1.5 rounded-lg border border-[#E5E7EB] bg-white text-[#6B7280] hover:text-[#0A0A0A] transition-colors"
                              title="Edit News"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => {
                                if (confirm(`Delete "${n.title}"?`)) {
                                  deleteNews(n.id);
                                  setNotification(`"${n.title}" deleted.`);
                                  setTimeout(() => setNotification(null), 3000);
                                }
                              }}
                              className="p-1.5 rounded-lg text-[#EF4444] hover:bg-[#FEE2E2] transition-colors"
                              title="Delete News"
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

      {/* ======================= CREATE NEWS MODAL ======================= */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Post New Lab News / Announcement"
        maxWidth="xl"
      >
        <form onSubmit={handleCreate} className="space-y-4 text-left">
          <Input
            label="News Headline"
            placeholder="e.g. KIET Smart City Lab Deploys Campus-wide LoRaWAN Mesh"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <Input
            label="Brief Summary (Lead-in sentence)"
            placeholder="e.g. 12 multi-channel gateways deployed enabling long-range sub-gigahertz sensor telemetry..."
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            required
          />

          <Textarea
            label="Full Content / Details"
            placeholder="Provide complete event coverage, quotes from director, and hardware specs..."
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[14px] font-medium text-[#0A0A0A]">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as NewsItem['category'])}
                className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-[15px] text-[#0A0A0A] focus:border-[#2563EB] focus:outline-none"
              >
                <option value="Lab Update">Lab Update</option>
                <option value="Achievement">Achievement</option>
                <option value="Announcement">Announcement</option>
                <option value="Hackathon">Hackathon</option>
              </select>
            </div>

            <Input
              label="Author Name"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Associated Team (Optional)"
              placeholder="e.g. Team CyberVision"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
            />

            <Input
              label="Header Photo URL"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>

          <div className="p-3.5 rounded-lg border border-[#E5E7EB] bg-[#F8F9FA] flex items-center gap-3">
            <input
              type="checkbox"
              id="trendingCheck"
              checked={trending}
              onChange={(e) => setTrending(e.target.checked)}
              className="w-4 h-4 rounded text-[#2563EB]"
            />
            <label htmlFor="trendingCheck" className="text-[13px] font-medium text-[#0A0A0A] cursor-pointer flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-600" />
              <span>Mark as Trending Highlight (Featured at the top of the feed)</span>
            </label>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary"
              className="shadow-sm shadow-blue-600/30 hover:shadow-md hover:shadow-blue-600/40"
            >
              Publish News Live
            </Button>
          </div>
        </form>
      </Modal>

      {/* ======================= EDIT NEWS MODAL ======================= */}
      {editingNews && (
        <Modal
          isOpen={!!editingNews}
          onClose={() => setEditingNews(null)}
          title={`Edit News: ${editingNews.title}`}
          maxWidth="xl"
        >
          <form onSubmit={handleSaveEdit} className="space-y-4 text-left">
            <Input
              label="Headline"
              value={editingNews.title}
              onChange={(e) => setEditingNews({ ...editingNews, title: e.target.value })}
              required
            />

            <Input
              label="Summary"
              value={editingNews.summary}
              onChange={(e) => setEditingNews({ ...editingNews, summary: e.target.value })}
              required
            />

            <Textarea
              label="Content"
              rows={4}
              value={editingNews.content}
              onChange={(e) => setEditingNews({ ...editingNews, content: e.target.value })}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[14px] font-medium text-[#0A0A0A]">Category</label>
                <select
                  value={editingNews.category}
                  onChange={(e) => setEditingNews({ ...editingNews, category: e.target.value as NewsItem['category'] })}
                  className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-[15px] text-[#0A0A0A]"
                >
                  <option value="Lab Update">Lab Update</option>
                  <option value="Achievement">Achievement</option>
                  <option value="Announcement">Announcement</option>
                  <option value="Hackathon">Hackathon</option>
                </select>
              </div>

              <Input
                label="Author"
                value={editingNews.author}
                onChange={(e) => setEditingNews({ ...editingNews, author: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Team Name"
                value={editingNews.teamName || ''}
                onChange={(e) => setEditingNews({ ...editingNews, teamName: e.target.value })}
              />

              <Input
                label="Image URL"
                value={editingNews.imageUrl || ''}
                onChange={(e) => setEditingNews({ ...editingNews, imageUrl: e.target.value })}
              />
            </div>

            <div className="p-3.5 rounded-lg border border-[#E5E7EB] bg-[#F8F9FA] flex items-center gap-3">
              <input
                type="checkbox"
                id="editTrendingCheck"
                checked={!!editingNews.trending}
                onChange={(e) => setEditingNews({ ...editingNews, trending: e.target.checked })}
                className="w-4 h-4 rounded text-[#2563EB]"
              />
              <label htmlFor="editTrendingCheck" className="text-[13px] font-medium text-[#0A0A0A] cursor-pointer">
                Mark as Trending Highlight
              </label>
            </div>

            {/* Visibility Toggle in Edit Modal */}
            <div className="p-4 rounded-xl border border-[#E5E7EB] bg-[#F8F9FA] flex items-center justify-between">
              <div>
                <span className="font-semibold text-[#0A0A0A] block text-[14px]">
                  Show on Public Feed
                </span>
                <span className="text-[12px] text-[#6B7280] block">
                  Toggle whether this news article is visible to visitors on the public website news page.
                </span>
              </div>
              <input
                type="checkbox"
                checked={editingNews.isVisible !== false && editingNews.status === 'approved'}
                onChange={(e) => setEditingNews({
                  ...editingNews,
                  isVisible: e.target.checked,
                  status: e.target.checked ? 'approved' : editingNews.status,
                })}
                className="w-5 h-5 rounded text-[#2563EB] cursor-pointer"
              />
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setEditingNews(null)}>
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
