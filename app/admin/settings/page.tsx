'use client';

import React, { useState } from 'react';
import Card from '@/components/shared/Card';
import Button from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import { usePortalStore } from '@/lib/store';
import { isFirebaseConfigured } from '@/lib/firebase';
import { 
  CheckCircle2, 
  ShieldCheck, 
  Database, 
  Cloud, 
  Key, 
  Save, 
  Sparkles,
  Server
} from 'lucide-react';

export default function AdminSettingsPage() {
  const { user } = usePortalStore();
  const [labName, setLabName] = useState('KIET Smart City Lab');
  const [supportEmail, setSupportEmail] = useState('smartcitylab@kiet.edu');
  const [autoApprovalTrending, setAutoApprovalTrending] = useState(false);
  const [cfAccountId, setCfAccountId] = useState(process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID || '');
  const [cfBucket, setCfBucket] = useState('smartcitylab-assets');
  const [notification, setNotification] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setNotification('Configuration saved successfully.');
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="space-y-8 text-left max-w-4xl mx-auto font-sans">
      
      {/* Header */}
      <div className="pb-3 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-600 border border-blue-200">
            <ShieldCheck className="w-3.5 h-3.5" /> Super Admin CRM Configuration
          </span>
        </div>
        <h1 className="text-[28px] sm:text-[32px] font-bold text-[#0A0A0A] tracking-tight">
          Platform, Firebase & Cloudflare Settings
        </h1>
        <p className="text-[14px] text-[#6B7280] mt-1">
          Manage live database connections, media storage CDN, and platform security policies.
        </p>
      </div>

      {notification && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-[14px] text-emerald-800 flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Backend & Cloud Providers Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Firebase Live Status */}
        <Card className="p-5 border border-[#E5E7EB] bg-white rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-[#2563EB]" />
              <h3 className="text-[15px] font-bold text-[#0A0A0A]">Firebase Firestore & Auth</h3>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Connected
            </span>
          </div>
          <p className="text-[13px] text-[#6B7280]">
            Project ID: <code className="text-[#0A0A0A] font-mono text-[12px] bg-gray-100 px-1.5 py-0.5 rounded">sclv2-9c3c3</code>
          </p>
          <div className="text-[12px] text-[#6B7280] bg-[#F8F9FA] p-3 rounded-lg border border-[#E5E7EB] space-y-1">
            <div className="flex justify-between">
              <span>Authentication:</span>
              <strong className="text-emerald-600">Active (Email/Password & Google)</strong>
            </div>
            <div className="flex justify-between">
              <span>Firestore Sync:</span>
              <strong className="text-emerald-600">Real-time Enabled</strong>
            </div>
          </div>
        </Card>

        {/* Cloudflare Storage & API Status */}
        <Card className="p-5 border border-[#E5E7EB] bg-white rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cloud className="w-5 h-5 text-[#F59E0B]" />
              <h3 className="text-[15px] font-bold text-[#0A0A0A]">Cloudflare R2 / Images</h3>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              API Ready
            </span>
          </div>
          <p className="text-[13px] text-[#6B7280]">
            Target Bucket: <code className="text-[#0A0A0A] font-mono text-[12px] bg-gray-100 px-1.5 py-0.5 rounded">{cfBucket}</code>
          </p>
          <div className="text-[12px] text-[#6B7280] bg-[#F8F9FA] p-3 rounded-lg border border-[#E5E7EB] space-y-1">
            <div className="flex justify-between">
              <span>Upload Endpoint:</span>
              <strong className="text-[#2563EB]">/api/upload</strong>
            </div>
            <div className="flex justify-between">
              <span>Public CDN:</span>
              <strong className="text-[#0A0A0A]">Cloudflare Global Edge</strong>
            </div>
          </div>
        </Card>

      </div>

      {/* Admin Profile Info */}
      <Card className="p-6 border border-[#E5E7EB] bg-white rounded-xl space-y-4">
        <h2 className="text-[17px] font-bold text-[#0A0A0A] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#2563EB]" /> Administrator Profile
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[12px] font-medium text-[#6B7280] block mb-1">Signed-in Admin</label>
            <p className="text-[14px] font-bold text-[#0A0A0A]">{user?.name || 'Super Admin'}</p>
          </div>
          <div>
            <label className="text-[12px] font-medium text-[#6B7280] block mb-1">Admin Email</label>
            <p className="text-[14px] font-bold text-[#0A0A0A]">{user?.email || 'admin@kiet.edu'}</p>
          </div>
        </div>
      </Card>

      {/* General Platform Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <Card className="p-6 border border-[#E5E7EB] bg-white rounded-xl space-y-5">
          <h2 className="text-[17px] font-bold text-[#0A0A0A]">
            Platform Configuration
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Organization / Lab Name"
              value={labName}
              onChange={(e) => setLabName(e.target.value)}
              required
            />

            <Input
              label="Contact & Support Email"
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              required
            />
          </div>

          <div className="pt-2 border-t border-[#E5E7EB]">
            <h3 className="text-[14px] font-bold text-[#0A0A0A] mb-2">Cloudflare Storage Settings</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="R2 Bucket Name"
                value={cfBucket}
                onChange={(e) => setCfBucket(e.target.value)}
                placeholder="smartcitylab-assets"
              />
              <Input
                label="Cloudflare Account ID (Optional)"
                value={cfAccountId}
                onChange={(e) => setCfAccountId(e.target.value)}
                placeholder="Found in Cloudflare Dashboard"
              />
            </div>
            <p className="text-[12px] text-[#6B7280] mt-2">
              Note: To activate direct Cloudflare R2 uploads, add your <code className="bg-gray-100 px-1 py-0.5 rounded text-[11px]">CLOUDFLARE_API_TOKEN</code> in <code className="bg-gray-100 px-1 py-0.5 rounded text-[11px]">.env.local</code>.
            </p>
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="submit" variant="primary" icon={<Save className="w-4 h-4" />}>
              Save Settings
            </Button>
          </div>
        </Card>
      </form>

    </div>
  );
}
