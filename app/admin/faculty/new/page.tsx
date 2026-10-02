'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Card from '@/components/shared/Card';
import Button from '@/components/shared/Button';
import { Input, Textarea } from '@/components/shared/Input';
import { usePortalStore } from '@/lib/store';
import { LabInnovator } from '@/lib/data';
import { uploadMediaFile } from '@/lib/mediaService';
import { 
  ArrowLeft, 
  Award, 
  Check, 
  Upload, 
  User, 
  Building2, 
  Camera, 
  CheckCircle2, 
  X, 
  Loader2, 
  Sparkles 
} from 'lucide-react';

function FacultyEditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id') || searchParams.get('edit');

  const { innovators, addFaculty, updateFaculty } = usePortalStore();

  const isEditing = Boolean(editId);
  const existingFaculty = isEditing ? innovators.find((f) => f.id === editId) : null;

  // Form states
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [department, setDepartment] = useState('Department of ECE / Smart City Lab');
  const [photoUrl, setPhotoUrl] = useState('');
  const [bio, setBio] = useState('');
  const [isHead, setIsHead] = useState(true);

  // UI states
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const photoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (existingFaculty) {
      setName(existingFaculty.name || '');
      setDesignation(existingFaculty.designation || '');
      setDepartment(existingFaculty.department || '');
      setPhotoUrl(existingFaculty.photoUrl || '');
      setBio(existingFaculty.bio || '');
      setIsHead(existingFaculty.isHead !== false);
    }
  }, [existingFaculty]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    try {
      const url = await uploadMediaFile(file, 'faculty/photos');
      setPhotoUrl(url);
      setNotification({ type: 'success', message: 'Faculty photo uploaded successfully!' });
      setTimeout(() => setNotification(null), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Photo upload failed';
      setNotification({ type: 'error', message: msg });
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setNotification({ type: 'error', message: 'Faculty name is required.' });
      return;
    }
    if (!designation.trim()) {
      setNotification({ type: 'error', message: 'Designation is required.' });
      return;
    }

    setIsSubmitting(true);
    setNotification(null);

    try {
      const fallbackPhoto = photoUrl.trim() || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4F46E5&color=fff&size=200`;

      if (isEditing && editId) {
        updateFaculty(editId, {
          name: name.trim(),
          designation: designation.trim(),
          department: department.trim(),
          photoUrl: fallbackPhoto,
          bio: bio.trim(),
          isHead,
        });

        setNotification({ type: 'success', message: 'Faculty record updated and synced to Firebase Firestore!' });
      } else {
        addFaculty({
          name: name.trim(),
          designation: designation.trim(),
          department: department.trim(),
          photoUrl: fallbackPhoto,
          bio: bio.trim(),
          isHead,
        });

        setNotification({ type: 'success', message: `Faculty mentor "${name}" added successfully!` });
      }

      setTimeout(() => {
        router.push('/admin/faculty');
      }, 1200);

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Save error';
      setNotification({ type: 'error', message: msg });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto pb-20">
      
      {/* Top Header with Back Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-5">
        <div className="flex items-center gap-3.5">
          <Link
            href="/admin/faculty"
            className="p-2.5 rounded-xl border border-[#E5E7EB] bg-white text-[#0A0A0A] hover:bg-[#F8F9FA] transition-all shadow-xs flex items-center gap-1.5 text-[14px] font-semibold"
          >
            <ArrowLeft className="w-4 h-4 text-[#6B7280]" />
            <span>Back to Faculty</span>
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[24px] sm:text-[28px] font-extrabold text-[#0A0A0A] tracking-tight">
                {isEditing ? 'Edit Faculty Record' : 'Add Faculty Mentor'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                {isEditing ? 'Faculty Editor' : 'New Mentor'}
              </span>
            </div>
            <p className="text-[13px] text-[#6B7280] mt-0.5">
              Add real lab mentors, professors, research guides, and project advisors.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <Link href="/admin/faculty">
            <Button variant="outline" size="sm">
              Cancel
            </Button>
          </Link>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            disabled={isSubmitting || isUploadingPhoto}
            icon={isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          >
            {isSubmitting ? 'Saving to Firebase...' : isEditing ? 'Save Changes' : 'Add Mentor'}
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
          
          {/* Photo Upload Dropzone */}
          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-[#FAFAFA] rounded-2xl border border-slate-200">
            <div className="relative w-20 h-20 rounded-full overflow-hidden bg-indigo-50 border-2 border-indigo-200 shrink-0 flex items-center justify-center shadow-xs">
              {photoUrl ? (
                <img src={photoUrl} alt="Faculty Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-indigo-400" />
              )}
              {isUploadingPhoto && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                </div>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-[14px] font-bold text-slate-900">Faculty Portrait Photo</span>
                {photoUrl && (
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    ✓ Photo Synced
                  </span>
                )}
              </div>
              <p className="text-[12px] text-slate-500">
                Upload portrait photo (PNG, JPG, WebP).
              </p>
              <div className="pt-1.5 flex items-center justify-center sm:justify-start gap-2.5">
                <input
                  type="file"
                  ref={photoInputRef}
                  onChange={handlePhotoUpload}
                  accept="image/*"
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => photoInputRef.current?.click()}
                  disabled={isUploadingPhoto}
                  icon={isUploadingPhoto ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
                >
                  {isUploadingPhoto ? 'Uploading...' : photoUrl ? 'Change Photo' : 'Upload Mentor Photo'}
                </Button>
                {photoUrl && (
                  <button
                    type="button"
                    onClick={() => setPhotoUrl('')}
                    className="text-[12px] text-red-500 hover:text-red-700 font-semibold"
                  >
                    Remove
                  </button>
                )}
              </div>
              <div className="pt-2">
                <input
                  type="text"
                  placeholder="Or paste direct image URL (https://...)"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="w-full px-3 py-1.5 text-[12px] rounded-lg border border-[#E5E7EB] bg-white text-[#0A0A0A] focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name *"
              placeholder="e.g. Dr. Vivek Upadhyay"
              value={name}
              onChange={(e) => setName(e.target.value)}
              icon={<User className="w-4 h-4 text-gray-400" />}
              required
            />

            <Input
              label="Official Designation *"
              placeholder="e.g. Director & Lead Research Scientist"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              icon={<Award className="w-4 h-4 text-gray-400" />}
              required
            />
          </div>

          <Input
            label="Department / Affiliation"
            placeholder="e.g. Department of ECE / Smart City Research Lab"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            icon={<Building2 className="w-4 h-4 text-gray-400" />}
          />

          <Textarea
            label="Biography & Research Areas"
            placeholder="Brief background, research specializations (Edge AI, Embedded IoT, Wireless Sensor Networks), and mentoring focus..."
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />

          <label className="flex items-center gap-2.5 cursor-pointer select-none p-3 rounded-xl border border-blue-100 bg-blue-50/50 hover:bg-blue-50 transition-colors">
            <input
              type="checkbox"
              checked={isHead}
              onChange={(e) => setIsHead(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <div>
              <span className="text-[13px] font-bold text-[#0A0A0A] block">
                Showcase on Landing Page as Lab Head / Core Innovator
              </span>
              <span className="text-[11px] text-[#6B7280] block">
                When enabled, this leader appears directly in the "Meet the Innovators Behind SmartCity Lab" section.
              </span>
            </div>
          </label>

          <div className="pt-2 flex items-center justify-between border-t border-[#F3F4F6]">
            <Link href="/admin/faculty">
              <Button type="button" variant="outline" size="sm">
                Cancel
              </Button>
            </Link>

            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isSubmitting || isUploadingPhoto}
              icon={isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            >
              {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Register Faculty Mentor'}
            </Button>
          </div>

        </Card>
      </form>

    </div>
  );
}

export default function AdminNewFacultyPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-[#6B7280]">Loading faculty form...</div>}>
      <FacultyEditorContent />
    </Suspense>
  );
}
