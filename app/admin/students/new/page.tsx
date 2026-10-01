'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Card from '@/components/shared/Card';
import Button from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import { usePortalStore } from '@/lib/store';
import { BatchMember } from '@/lib/data';
import { uploadMediaFile } from '@/lib/mediaService';
import { 
  ArrowLeft, 
  UserPlus, 
  Check, 
  Upload, 
  User, 
  Mail, 
  Hash, 
  Calendar, 
  Building2, 
  Layers, 
  ShieldCheck, 
  Users, 
  Camera, 
  CheckCircle2, 
  X, 
  Loader2, 
  Sparkles,
  KeyRound
} from 'lucide-react';

const ACADEMIC_YEARS = [
  { value: '2028', label: '2028 (Upcoming Cohort)' },
  { value: '2027', label: '2027 (2026-2027 Cohort)' },
  { value: '2026', label: '2026 (2025-2026 Cohort)' },
  { value: '2025', label: '2025 (2024-2025 Cohort)' },
  { value: '2024', label: '2024 (2023-2024 Cohort)' },
  { value: '2023', label: '2023 (Alumni Cohort)' },
  { value: '2022', label: '2022 (Alumni Cohort)' },
];

function StudentEditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id') || searchParams.get('edit');

  const { 
    batches, 
    batchInfos, 
    teams, 
    addStudentToCRM, 
    updateIntern 
  } = usePortalStore();

  const isEditing = Boolean(editId);
  const existingStudent = isEditing ? batches.find((b) => b.id === editId) : null;

  // Form states
  const [name, setName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [email, setEmail] = useState('');
  const [year, setYear] = useState('3rd Year');
  const [branch, setBranch] = useState('CSE');
  const [batchYear, setBatchYear] = useState<string>(batchInfos[0]?.year || '2026');
  const [teamName, setTeamName] = useState('Unassigned');
  const [studentRole, setStudentRole] = useState<'Student' | 'Team Lead' | 'Mentor' | 'Faculty'>('Student');
  const [domain, setDomain] = useState('IoT & Embedded Systems');
  const [photoUrl, setPhotoUrl] = useState('');
  
  // UI states
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const photoInputRef = useRef<HTMLInputElement>(null);

  // Populate data if editing
  useEffect(() => {
    if (existingStudent) {
      setName(existingStudent.name || '');
      setRollNo(existingStudent.rollNo || '');
      setEmail(existingStudent.email || '');
      setYear(existingStudent.year || '3rd Year');
      setBranch(existingStudent.branch || 'CSE');
      setBatchYear(existingStudent.batchYear || '2026');
      setTeamName(existingStudent.teamName || 'Unassigned');
      setStudentRole((existingStudent.role as typeof studentRole) || (existingStudent.isTeamLead ? 'Team Lead' : 'Student'));
      setDomain(existingStudent.domain || 'IoT & Embedded Systems');
      setPhotoUrl(existingStudent.photoUrl || '');
    }
  }, [existingStudent]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    try {
      const url = await uploadMediaFile(file, 'students/avatars');
      setPhotoUrl(url);
      setNotification({ type: 'success', message: 'Profile photo uploaded successfully!' });
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
      setNotification({ type: 'error', message: 'Student full name is required.' });
      return;
    }
    if (!rollNo.trim()) {
      setNotification({ type: 'error', message: 'University roll number is required.' });
      return;
    }

    setIsSubmitting(true);
    setNotification(null);

    const studentEmail = email.trim() || `${name.toLowerCase().replace(/\s+/g, '.')}@kiet.edu`;
    const isLead = studentRole === 'Team Lead';

    try {
      if (isEditing && editId) {
        updateIntern(editId, {
          name: name.trim(),
          rollNo: rollNo.trim(),
          email: studentEmail,
          year,
          branch,
          batchYear,
          teamName: teamName || 'Unassigned',
          domain: domain.trim(),
          role: studentRole,
          isTeamLead: isLead,
          photoUrl: photoUrl || undefined,
        });

        setNotification({ type: 'success', message: 'Student details updated and synced with Firebase Firestore!' });
      } else {
        const tempPass = `SCL@${Math.floor(1000 + Math.random() * 9000)}`;
        addStudentToCRM({
          name: name.trim(),
          rollNo: rollNo.trim(),
          email: studentEmail,
          year,
          branch,
          batchYear,
          teamName: teamName || 'Unassigned',
          domain: domain.trim(),
          role: studentRole,
          isTeamLead: isLead,
          photoUrl: photoUrl || undefined,
          tempPassword: tempPass,
          passwordResetRequired: true,
        });

        setNotification({ type: 'success', message: `Student "${name}" enrolled successfully into Batch ${batchYear}!` });
      }

      setTimeout(() => {
        router.push('/admin/students');
      }, 1200);

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Save error';
      setNotification({ type: 'error', message: msg });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto pb-20">
      
      {/* Top Header with Back Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-5">
        <div className="flex items-center gap-3.5">
          <Link
            href="/admin/students"
            className="p-2.5 rounded-xl border border-[#E5E7EB] bg-white text-[#0A0A0A] hover:bg-[#F8F9FA] transition-all shadow-xs flex items-center gap-1.5 text-[14px] font-semibold"
          >
            <ArrowLeft className="w-4 h-4 text-[#6B7280]" />
            <span>Back to Students Data</span>
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[24px] sm:text-[28px] font-extrabold text-[#0A0A0A] tracking-tight">
                {isEditing ? 'Edit Student Details' : 'Enroll New Student'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                {isEditing ? 'Editor' : 'Direct Registration'}
              </span>
            </div>
            <p className="text-[13px] text-[#6B7280] mt-0.5">
              Enter student credentials, academic branch, cohort batch, and profile photo directly into Firebase.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <Link href="/admin/students">
            <Button variant="outline" size="sm">
              Cancel
            </Button>
          </Link>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            disabled={isSubmitting || isUploadingPhoto}
            icon={isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          >
            {isSubmitting ? 'Saving to Firebase...' : isEditing ? 'Update Student Record' : 'Enroll Student'}
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

      {/* Main Single Page Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Section 1: Photo & Identity */}
        <Card className="p-6 sm:p-7 space-y-5 border-[#E5E7EB]">
          <div className="flex items-center gap-2.5 pb-2 border-b border-[#F3F4F6]">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-[14px]">
              1
            </div>
            <div>
              <h3 className="text-[16px] font-bold text-[#0A0A0A]">Personal & Photo Identity</h3>
              <p className="text-[12px] text-[#6B7280]">Official name, university roll number, and student avatar</p>
            </div>
          </div>

          {/* Photo Upload Dropzone */}
          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-[#FAFAFA] rounded-2xl border border-slate-200">
            <div className="relative w-20 h-20 rounded-full overflow-hidden bg-slate-100 border-2 border-blue-200 shrink-0 flex items-center justify-center shadow-xs">
              {photoUrl ? (
                <img src={photoUrl} alt="Student Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-slate-400" />
              )}
              {isUploadingPhoto && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                </div>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-[14px] font-bold text-slate-900">Student Profile Picture</span>
                {photoUrl && (
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    ✓ Photo Synced
                  </span>
                )}
              </div>
              <p className="text-[12px] text-slate-500">
                Upload student portrait photo (PNG, JPG, WebP) directly to cloud storage.
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
                  {isUploadingPhoto ? 'Uploading to Cloudflare R2...' : photoUrl ? 'Change Photo' : 'Upload Student Photo'}
                </Button>
                {photoUrl && (
                  <button
                    type="button"
                    onClick={() => setPhotoUrl('')}
                    className="text-[12px] text-red-500 hover:text-red-700 font-semibold"
                  >
                    Remove Photo
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Student Full Name *"
              placeholder="e.g. Siddharth Rao"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!email) {
                  setEmail(`${e.target.value.toLowerCase().replace(/\s+/g, '.')}@kiet.edu`);
                }
              }}
              icon={<User className="w-4 h-4 text-gray-400" />}
              required
            />

            <Input
              label="University Roll Number *"
              placeholder="e.g. 2300290100099"
              value={rollNo}
              onChange={(e) => setRollNo(e.target.value)}
              icon={<Hash className="w-4 h-4 text-gray-400" />}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Official Institutional Email *"
              placeholder="e.g. siddharth.rao@kiet.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-4 h-4 text-gray-400" />}
              required
            />

            <div className="space-y-1.5">
              <label className="block text-[13px] font-semibold text-[#0A0A0A]">Academic Year</label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E7EB] bg-white text-[14px] text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors"
              >
                <option value="1st Year">1st Year (Freshman)</option>
                <option value="2nd Year">2nd Year (Sophomore)</option>
                <option value="3rd Year">3rd Year (Junior Intern)</option>
                <option value="4th Year">4th Year (Senior Lead)</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Section 2: Department & Academic Cohort Batch */}
        <Card className="p-6 sm:p-7 space-y-5 border-[#E5E7EB]">
          <div className="flex items-center gap-2.5 pb-2 border-b border-[#F3F4F6]">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-[14px]">
              2
            </div>
            <div>
              <h3 className="text-[16px] font-bold text-[#0A0A0A]">Department & Cohort Batch</h3>
              <p className="text-[12px] text-[#6B7280]">Select academic cohort year and engineering department</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[13px] font-semibold text-[#0A0A0A]">Engineering Branch *</label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E7EB] bg-white text-[14px] text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors"
              >
                <option value="CSE">CSE (Computer Science & Engg)</option>
                <option value="ECE">ECE (Electronics & Comm)</option>
                <option value="IT">IT (Information Technology)</option>
                <option value="EE">EE (Electrical Engg)</option>
                <option value="ME">ME (Mechanical Engg)</option>
                <option value="AI&ML">AI & ML (Artificial Intelligence)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[13px] font-semibold text-[#0A0A0A]">Cohort Batch Year *</label>
              <select
                value={batchYear}
                onChange={(e) => setBatchYear(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E7EB] bg-white text-[14px] text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors"
              >
                {ACADEMIC_YEARS.map((y) => (
                  <option key={y.value} value={y.value}>
                    Batch {y.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[13px] font-semibold text-[#0A0A0A]">Role Designation *</label>
              <select
                value={studentRole}
                onChange={(e) => setStudentRole(e.target.value as typeof studentRole)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E7EB] bg-white text-[14px] text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors"
              >
                <option value="Student">Student (Research Intern)</option>
                <option value="Team Lead">Team Lead</option>
                <option value="Mentor">Student Mentor</option>
                <option value="Faculty">Faculty Advisor</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[13px] font-semibold text-[#0A0A0A]">Initial Team Assignment</label>
              <select
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E7EB] bg-white text-[14px] text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors"
              >
                <option value="Unassigned">Unassigned (Assign Later)</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.name}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Input
            label="Domain / Primary Skill Area"
            placeholder="e.g. Edge AI, LoRa Sensors, Cloud Telemetry, Embedded C"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
          />
        </Card>

        {/* Section 3: Automatic Credentials Box */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50/60 to-blue-50 border border-blue-200 flex items-start gap-3.5 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/30 mt-0.5">
            <KeyRound className="w-4 h-4" />
          </div>
          <div className="text-[13px] leading-relaxed">
            <div className="font-semibold text-slate-900 flex items-center gap-2">
              <span>Firebase Authentication & Portal Passkey</span>
              <span className="font-mono text-[11px] font-bold bg-white text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                Auto-Issued
              </span>
            </div>
            <p className="text-slate-600 mt-0.5 text-[12px]">
              Upon saving, the student profile is registered into Firebase Firestore and issued an auto-generated temporary password to log in at <code className="bg-white px-1 py-0.5 rounded text-blue-700 font-mono">/portal</code>.
            </p>
          </div>
        </div>

        {/* Bottom Submit Bar */}
        <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-[#E5E7EB] shadow-xs">
          <Link href="/admin/students">
            <Button type="button" variant="outline" size="sm">
              Cancel
            </Button>
          </Link>

          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={isSubmitting || isUploadingPhoto}
            icon={isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          >
            {isSubmitting ? 'Syncing with Firestore...' : isEditing ? 'Save Changes' : 'Enroll Student Record'}
          </Button>
        </div>

      </form>

    </div>
  );
}

export default function AdminNewStudentPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-[#6B7280]">Loading student enrollment form...</div>}>
      <StudentEditorContent />
    </Suspense>
  );
}
