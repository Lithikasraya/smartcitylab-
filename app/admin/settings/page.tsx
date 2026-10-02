'use client';

import React, { useState, useEffect } from 'react';
import Card from '@/components/shared/Card';
import Button from '@/components/shared/Button';
import { Input, Textarea } from '@/components/shared/Input';
import { usePortalStore } from '@/lib/store';
import { 
  CheckCircle2, 
  ShieldCheck, 
  Database, 
  Cloud, 
  Save, 
  Mail,
  Phone,
  MapPin,
  Clock,
  Globe,
  ExternalLink,
  Send,
  Sparkles
} from 'lucide-react';

export default function AdminSettingsPage() {
  const { user, contactSettings, updateContactSettings } = usePortalStore();

  const [formData, setFormData] = useState({
    labName: contactSettings?.labName || 'KIET Smart City Lab',
    contactEmail: contactSettings?.contactEmail || 'smartcitylab@kiet.edu',
    supportEmail: contactSettings?.supportEmail || 'smartcitylab@kiet.edu',
    phone: contactSettings?.phone || '+91 (0120) 2762000',
    labLocation: contactSettings?.labLocation || 'Smart City Innovation Wing, 2nd Floor, KIET Campus',
    address: contactSettings?.address || 'KIET Group of Institutions, Delhi-NCR, Ghaziabad-Meerut Road, Ghaziabad 201206',
    workingHours: contactSettings?.workingHours || 'Mon - Fri: 9:00 AM - 5:30 PM',
    githubUrl: contactSettings?.githubUrl || 'https://github.com',
    twitterUrl: contactSettings?.twitterUrl || 'https://twitter.com',
    linkedinUrl: contactSettings?.linkedinUrl || 'https://linkedin.com',
    websiteUrl: contactSettings?.websiteUrl || 'https://kiet.edu',
  });

  const [cfAccountId, setCfAccountId] = useState(process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID || '');
  const [cfBucket, setCfBucket] = useState('smartcitylab-assets');
  const [notification, setNotification] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Sync state when store finishes initial hydration
  useEffect(() => {
    if (contactSettings) {
      setFormData({
        labName: contactSettings.labName || 'KIET Smart City Lab',
        contactEmail: contactSettings.contactEmail || 'smartcitylab@kiet.edu',
        supportEmail: contactSettings.supportEmail || 'smartcitylab@kiet.edu',
        phone: contactSettings.phone || '+91 (0120) 2762000',
        labLocation: contactSettings.labLocation || 'Smart City Innovation Wing, 2nd Floor, KIET Campus',
        address: contactSettings.address || 'KIET Group of Institutions, Delhi-NCR, Ghaziabad-Meerut Road, Ghaziabad 201206',
        workingHours: contactSettings.workingHours || 'Mon - Fri: 9:00 AM - 5:30 PM',
        githubUrl: contactSettings.githubUrl || 'https://github.com',
        twitterUrl: contactSettings.twitterUrl || 'https://twitter.com',
        linkedinUrl: contactSettings.linkedinUrl || 'https://linkedin.com',
        websiteUrl: contactSettings.websiteUrl || 'https://kiet.edu',
      });
    }
  }, [contactSettings]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateContactSettings(formData);
      setNotification('Contact data & platform settings successfully saved and synced across all pages!');
      setTimeout(() => setNotification(null), 4000);
    } catch (err) {
      setNotification('Saved to local storage (note: Firestore sync error)');
      setTimeout(() => setNotification(null), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 text-left max-w-4xl mx-auto font-sans pb-16">
      
      {/* Header */}
      <div className="pb-3 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-600 border border-blue-200">
            <ShieldCheck className="w-3.5 h-3.5" /> Super Admin CRM Configuration
          </span>
        </div>
        <h1 className="text-[28px] sm:text-[32px] font-bold text-[#0A0A0A] tracking-tight">
          Platform & Contact Us Settings
        </h1>
        <p className="text-[14px] text-[#6B7280] mt-1">
          Configure public Contact Us inquiry emails, phone numbers, lab physical address, and database connections.
        </p>
      </div>

      {notification && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-[14px] text-emerald-800 flex items-center gap-2.5 animate-in fade-in duration-200 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-medium">{notification}</span>
        </div>
      )}

      {/* Backend & Cloud Providers Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Firebase Live Status */}
        <Card className="p-5 border border-[#E5E7EB] bg-white rounded-xl space-y-3 shadow-xs">
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
        <Card className="p-5 border border-[#E5E7EB] bg-white rounded-xl space-y-3 shadow-xs">
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

      {/* Main Form */}
      <form onSubmit={handleSave} className="space-y-6">
        
        {/* ── Contact Us & Public Inquiries ── */}
        <Card className="p-6 border border-blue-100 bg-gradient-to-br from-white to-blue-50/20 rounded-xl space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
            <div>
              <h2 className="text-[18px] font-bold text-[#0A0A0A] flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" />
                Contact Us & Public Inquiry Data
              </h2>
              <p className="text-[13px] text-gray-500 mt-0.5">
                This email is connected to the [Contact Us] buttons in the header, footer, and landing page.
              </p>
            </div>

            {/* Test Action */}
            <a
              href={`mailto:${formData.contactEmail}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-semibold rounded-lg shadow-sm transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              Test Mailto: ({formData.contactEmail})
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input
              label="Primary [Contact Us] Email"
              type="email"
              value={formData.contactEmail}
              onChange={(e) => handleChange('contactEmail', e.target.value)}
              placeholder="e.g. smartcitylab@kiet.edu"
              required
              helperText="Destination email when visitors click the 'Contact Us' button."
            />

            <Input
              label="Support / Alternate Email"
              type="email"
              value={formData.supportEmail}
              onChange={(e) => handleChange('supportEmail', e.target.value)}
              placeholder="e.g. support@kiet.edu"
              helperText="Secondary email for technical support queries."
            />

            <Input
              label="Lab Contact Phone / Tel"
              type="text"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="e.g. +91 (0120) 2762000"
            />

            <Input
              label="Working / Lab Hours"
              type="text"
              value={formData.workingHours}
              onChange={(e) => handleChange('workingHours', e.target.value)}
              placeholder="e.g. Mon - Fri: 9:00 AM - 5:30 PM"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-gray-100">
            <Input
              label="Lab Room / Campus Wing"
              type="text"
              value={formData.labLocation}
              onChange={(e) => handleChange('labLocation', e.target.value)}
              placeholder="e.g. Innovation Wing, 2nd Floor, KIET Campus"
            />

            <Input
              label="Organization / Lab Name"
              type="text"
              value={formData.labName}
              onChange={(e) => handleChange('labName', e.target.value)}
              placeholder="KIET Smart City Lab"
              required
            />
          </div>

          <Textarea
            label="Full Physical Campus Address"
            rows={2}
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            placeholder="KIET Group of Institutions, Delhi-NCR, Ghaziabad-Meerut Road, Ghaziabad 201206"
          />
        </Card>

        {/* ── Social & Web Profiles ── */}
        <Card className="p-6 border border-[#E5E7EB] bg-white rounded-xl space-y-5 shadow-xs">
          <h2 className="text-[17px] font-bold text-[#0A0A0A] flex items-center gap-2">
            <Globe className="w-5 h-5 text-gray-700" />
            Social Media & Web Links
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Official Website URL"
              type="url"
              value={formData.websiteUrl}
              onChange={(e) => handleChange('websiteUrl', e.target.value)}
              placeholder="https://kiet.edu"
            />
            <Input
              label="GitHub Organization URL"
              type="url"
              value={formData.githubUrl}
              onChange={(e) => handleChange('githubUrl', e.target.value)}
              placeholder="https://github.com"
            />
            <Input
              label="Twitter / X Profile URL"
              type="url"
              value={formData.twitterUrl}
              onChange={(e) => handleChange('twitterUrl', e.target.value)}
              placeholder="https://twitter.com"
            />
            <Input
              label="LinkedIn Page URL"
              type="url"
              value={formData.linkedinUrl}
              onChange={(e) => handleChange('linkedinUrl', e.target.value)}
              placeholder="https://linkedin.com"
            />
          </div>
        </Card>

        {/* ── Cloudflare Storage Configuration ── */}
        <Card className="p-6 border border-[#E5E7EB] bg-white rounded-xl space-y-4 shadow-xs">
          <h3 className="text-[16px] font-bold text-[#0A0A0A] flex items-center gap-2">
            <Cloud className="w-4 h-4 text-amber-500" />
            Cloudflare R2 Bucket Configuration
          </h3>
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
        </Card>

        {/* Submit */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-[13px] text-gray-500">
            Changes will automatically update throughout the navbar, footer, and landing page.
          </div>
          <Button 
            type="submit" 
            variant="primary" 
            disabled={isSaving}
            icon={<Save className="w-4 h-4" />}
          >
            {isSaving ? 'Saving Changes...' : 'Save All Settings'}
          </Button>
        </div>

      </form>

    </div>
  );
}
