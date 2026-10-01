'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Card from '@/components/shared/Card';
import Button from '@/components/shared/Button';
import { Input, Textarea } from '@/components/shared/Input';
import { usePortalStore } from '@/lib/store';
import { BatchInfo } from '@/lib/data';
import { 
  ArrowLeft, 
  Layers, 
  Check, 
  Calendar, 
  Users, 
  Award, 
  Sparkles, 
  CheckCircle2, 
  X, 
  Loader2 
} from 'lucide-react';

const COHORT_YEARS = ['2028', '2027', '2026', '2025', '2024', '2023', '2022', '2021'];

function BatchEditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id') || searchParams.get('edit');

  const { 
    batchInfos, 
    innovators, 
    addBatch, 
    updateBatch 
  } = usePortalStore();

  const isEditing = Boolean(editId);
  const existingBatch = isEditing ? batchInfos.find((b) => b.id === editId || b.year === editId) : null;

  // Form state
  const [name, setName] = useState('');
  const [year, setYear] = useState('2026');
  const [academicSession, setAcademicSession] = useState('2025 – 2026 Senior Research Cohort');
  const [status, setStatus] = useState<BatchInfo['status']>('active');
  const [mentorLead, setMentorLead] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('August 2025');
  const [endDate, setEndDate] = useState('June 2026');

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (innovators.length > 0 && !mentorLead) {
      setMentorLead(innovators[0].name);
    }
  }, [innovators, mentorLead]);

  useEffect(() => {
    if (existingBatch) {
      setName(existingBatch.name || '');
      setYear(existingBatch.year || '2026');
      setAcademicSession(existingBatch.academicSession || '');
      setStatus(existingBatch.status || 'active');
      setMentorLead(existingBatch.mentorLead || (innovators[0]?.name || 'Dr. Vivek Upadhyay'));
      setDescription(existingBatch.description || '');
      setStartDate(existingBatch.startDate || '');
      setEndDate(existingBatch.endDate || '');
    }
  }, [existingBatch, innovators]);

  const handleYearSelect = (selectedYear: string) => {
    setYear(selectedYear);
    if (!name || name.startsWith('Batch ')) {
      setName(`Batch ${selectedYear}`);
    }
    const startY = parseInt(selectedYear, 10) - 1;
    setAcademicSession(`${startY} – ${selectedYear} Academic Cohort`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setNotification({ type: 'error', message: 'Batch cohort name is required.' });
      return;
    }
    if (!year.trim()) {
      setNotification({ type: 'error', message: 'Year identifier is required.' });
      return;
    }

    setIsSubmitting(true);
    setNotification(null);

    try {
      if (isEditing && existingBatch) {
        updateBatch(existingBatch.id, {
          name: name.trim(),
          year: year.trim(),
          academicSession: academicSession.trim(),
          status,
          mentorLead: mentorLead || (innovators[0]?.name || 'Faculty In-Charge'),
          description: description.trim(),
          startDate: startDate.trim(),
          endDate: endDate.trim(),
        });

        setNotification({ type: 'success', message: 'Cohort batch updated and synced to Firebase Firestore!' });
      } else {
        addBatch({
          name: name.trim(),
          year: year.trim(),
          academicSession: academicSession.trim(),
          status,
          mentorLead: mentorLead || (innovators[0]?.name || 'Dr. Vivek Upadhyay'),
          description: description.trim(),
          startDate: startDate.trim(),
          endDate: endDate.trim(),
          uploadedFiles: [],
        });

        setNotification({ type: 'success', message: `Cohort "${name}" created and synced to Firebase Firestore!` });
      }

      setTimeout(() => {
        router.push('/admin/batches');
      }, 1200);

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Save error';
      setNotification({ type: 'error', message: msg });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto pb-20">
      
      {/* Top Header with Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-5">
        <div className="flex items-center gap-3.5">
          <Link
            href="/admin/batches"
            className="p-2.5 rounded-xl border border-[#E5E7EB] bg-white text-[#0A0A0A] hover:bg-[#F8F9FA] transition-all shadow-xs flex items-center gap-1.5 text-[14px] font-semibold"
          >
            <ArrowLeft className="w-4 h-4 text-[#6B7280]" />
            <span>Back to Batches</span>
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[24px] sm:text-[28px] font-extrabold text-[#0A0A0A] tracking-tight">
                {isEditing ? 'Edit Cohort Batch' : 'Create New Cohort Batch'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                {isEditing ? 'Batch Editor' : 'New Cohort'}
              </span>
            </div>
            <p className="text-[13px] text-[#6B7280] mt-0.5">
              Configure student cohorts, assign faculty leads, and manage academic sessions.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <Link href="/admin/batches">
            <Button variant="outline" size="sm">
              Cancel
            </Button>
          </Link>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            disabled={isSubmitting}
            icon={isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          >
            {isSubmitting ? 'Saving to Firebase...' : isEditing ? 'Save Changes' : 'Create Cohort'}
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

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6 sm:p-7 space-y-5 border-[#E5E7EB]">
          
          {/* Year Quick Selector */}
          <div className="space-y-2">
            <label className="block text-[13px] font-semibold text-[#0A0A0A]">
              Quick Select Batch Year
            </label>
            <div className="flex flex-wrap gap-2">
              {COHORT_YEARS.map((y) => (
                <button
                  key={y}
                  type="button"
                  onClick={() => handleYearSelect(y)}
                  className={`px-3.5 py-1.5 rounded-lg text-[13px] font-bold border transition-all ${
                    year === y
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white text-[#6B7280] border-[#E5E7EB] hover:text-[#0A0A0A] hover:bg-gray-50'
                  }`}
                >
                  Batch {y}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <Input
              label="Batch Cohort Name *"
              placeholder="e.g. Batch 2026"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Input
              label="Batch Year Identifier *"
              placeholder="e.g. 2026"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Academic Session"
              placeholder="e.g. 2025 – 2026 Senior Research Cohort"
              value={academicSession}
              onChange={(e) => setAcademicSession(e.target.value)}
            />

            <div className="space-y-1.5">
              <label className="block text-[13px] font-semibold text-[#0A0A0A]">Cohort Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as BatchInfo['status'])}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E7EB] bg-white text-[14px] text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors"
              >
                <option value="active">Active Cohort (Ongoing Research)</option>
                <option value="upcoming">Upcoming Cohort (Pre-Enrollment)</option>
                <option value="graduated">Graduated Alumni Cohort</option>
              </select>
            </div>
          </div>

          {/* Dynamic Faculty Mentor Selector */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-[13px] font-semibold text-[#0A0A0A]">
                Faculty Mentor In-Charge
              </label>
              <Link href="/admin/faculty/new" className="text-[12px] font-semibold text-blue-600 hover:text-blue-800">
                + Add New Faculty
              </Link>
            </div>
            <select
              value={mentorLead}
              onChange={(e) => setMentorLead(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E7EB] bg-white text-[14px] text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors"
            >
              {innovators.map((f) => (
                <option key={f.id} value={f.name}>
                  {f.name} ({f.designation} {f.department ? `– ${f.department}` : ''})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Start Date"
              placeholder="e.g. August 2025"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <Input
              label="End Date"
              placeholder="e.g. June 2026"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <Textarea
            label="Cohort Mission / Research Focus"
            placeholder="Describe key research domains, sensor testbed targets, and goals for this student batch..."
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="pt-2 flex items-center justify-between border-t border-[#F3F4F6]">
            <Link href="/admin/batches">
              <Button type="button" variant="outline" size="sm">
                Cancel
              </Button>
            </Link>

            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isSubmitting}
              icon={isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            >
              {isSubmitting ? 'Syncing...' : isEditing ? 'Save Changes' : 'Create Cohort Batch'}
            </Button>
          </div>

        </Card>
      </form>

    </div>
  );
}

export default function AdminNewBatchPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-[#6B7280]">Loading batch creator...</div>}>
      <BatchEditorContent />
    </Suspense>
  );
}
