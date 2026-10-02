'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Card from '@/components/shared/Card';
import Button from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import Modal from '@/components/shared/Modal';
import { usePortalStore } from '@/lib/store';
import { LabInnovator } from '@/lib/data';
import { 
  Award, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  User, 
  Mail, 
  Building2, 
  BookOpen, 
  Sparkles,
  X,
  RotateCcw
} from 'lucide-react';

export default function AdminFacultyPage() {
  const { innovators, deleteFaculty, toggleFacultyHead } = usePortalStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingFaculty, setDeletingFaculty] = useState<LabInnovator | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const filteredFaculty = innovators.filter((f) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      f.name.toLowerCase().includes(q) ||
      f.designation.toLowerCase().includes(q) ||
      (f.department && f.department.toLowerCase().includes(q)) ||
      (f.bio && f.bio.toLowerCase().includes(q))
    );
  });

  const handleConfirmDelete = () => {
    if (!deletingFaculty) return;
    deleteFaculty(deletingFaculty.id);
    setNotification(`Faculty mentor "${deletingFaculty.name}" removed from platform and Firestore.`);
    setDeletingFaculty(null);
    setTimeout(() => setNotification(null), 3500);
  };

  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto pb-20">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[26px] sm:text-[30px] font-black text-[#0A0A0A] tracking-tight">
              Faculty Mentors & Advisors
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {innovators.length} Mentors Registered
            </span>
          </div>
          <p className="text-[14px] text-[#6B7280] mt-1">
            Manage lab directors, research mentors, faculty guides, and academic advisors linked to cohorts and projects.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/faculty/new">
            <Button variant="primary" size="md" icon={<Plus className="w-4 h-4" />}>
              Add Faculty Mentor
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

      {/* Search & Overview Bar */}
      <Card className="p-4 sm:p-5 border-[#E5E7EB] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
          <div className="w-full sm:w-96">
            <Input
              placeholder="Search faculty by name, designation, department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="w-4 h-4 text-gray-400" />}
            />
          </div>

          <div className="text-[13px] text-[#6B7280]">
            Showing <strong>{filteredFaculty.length}</strong> of {innovators.length} mentors
          </div>
        </div>
      </Card>

      {/* Faculty Cards Grid */}
      {filteredFaculty.length === 0 ? (
        <Card className="p-12 text-center border-[#E5E7EB] bg-[#FAFAFA]">
          <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-[17px] font-bold text-[#0A0A0A]">No faculty mentors found</h3>
          <p className="text-[13px] text-[#6B7280] mt-1 max-w-sm mx-auto">
            {searchQuery ? 'Try adjusting your search terms.' : 'Add your first faculty mentor or research guide.'}
          </p>
          <div className="mt-5">
            <Link href="/admin/faculty/new">
              <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />}>
                Add Faculty Mentor
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFaculty.map((fac) => (
            <Card key={fac.id} className="p-6 border-[#E5E7EB] flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-4">
                {/* Avatar & Header */}
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-indigo-50 border-2 border-indigo-200 shrink-0 flex items-center justify-center">
                    {fac.photoUrl ? (
                      <img src={fac.photoUrl} alt={fac.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[20px] font-bold text-indigo-600">
                        {fac.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-[16px] font-bold text-[#0A0A0A] truncate">
                      {fac.name}
                    </h3>
                    <p className="text-[13px] font-semibold text-blue-600 truncate mt-0.5">
                      {fac.designation}
                    </p>
                    <p className="text-[12px] text-[#6B7280] truncate mt-0.5">
                      {fac.department || 'Smart City Lab'}
                    </p>
                  </div>
                </div>

                {fac.bio && (
                  <p className="text-[13px] text-[#6B7280] line-clamp-3 leading-relaxed bg-[#F8F9FA] p-3 rounded-xl border border-gray-100">
                    {fac.bio}
                  </p>
                )}
              </div>

              {/* Footer Controls */}
              <div className="pt-4 mt-4 border-t border-[#F3F4F6] flex items-center justify-between">
                <button
                  onClick={() => {
                    const next = toggleFacultyHead(fac.id);
                    setNotification(
                      next 
                        ? `✓ "${fac.name}" marked as Lab Head (Active on Landing Page).` 
                        : `"${fac.name}" removed from Lab Head showcase.`
                    );
                    setTimeout(() => setNotification(null), 4000);
                  }}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all flex items-center gap-1.5 border ${
                    fac.isHead !== false
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'
                  }`}
                  title="Toggle Lab Head showcase on Landing Page"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>{fac.isHead !== false ? '★ Head Person (On Home)' : '○ Set as Head'}</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <Link
                    href={`/admin/faculty/new?id=${fac.id}`}
                    className="p-1.5 rounded-lg border border-blue-200 text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
                    title="Edit Faculty Record"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => setDeletingFaculty(fac)}
                    className="p-1.5 rounded-lg border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                    title="Delete Faculty"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingFaculty}
        onClose={() => setDeletingFaculty(null)}
        title="Confirm Mentor Removal"
        maxWidth="md"
      >
        {deletingFaculty && (
          <div className="space-y-4 text-left">
            <p className="text-[14px] text-[#0A0A0A]">
              Are you sure you want to remove <strong>{deletingFaculty.name}</strong> ({deletingFaculty.designation}) from the faculty mentor registry?
            </p>
            <p className="text-[12px] text-[#6B7280]">
              This will update Firebase Firestore and remove them from active mentor selectors.
            </p>

            <div className="pt-4 border-t border-[#E5E7EB] flex items-center justify-end gap-2.5">
              <Button variant="outline" size="sm" onClick={() => setDeletingFaculty(null)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={handleConfirmDelete}>
                Delete Mentor
              </Button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}
