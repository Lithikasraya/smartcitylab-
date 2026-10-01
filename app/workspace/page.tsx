'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import Button from '@/components/shared/Button';
import Card from '@/components/shared/Card';
import Input from '@/components/shared/Input';
import { usePortalStore } from '@/lib/store';
import {
  PenTool,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Code,
  List,
  ListOrdered,
  Minus,
  Link as LinkIcon,
  Image as ImageIcon,
  Columns,
  Eye,
  Edit3,
  Sparkles,
  Users,
  User,
  Clock,
  Calendar,
  ArrowRight,
  CheckCircle2,
  Share2,
  Monitor,
  Laptop,
  Smartphone,
  ExternalLink,
  Trash2,
  FileText
} from 'lucide-react';

const COVER_PRESETS = [
  {
    label: 'Modern Tech Portrait',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Abstract 3D Glass',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Circuit Board & PCB',
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Solar & Clean Energy',
    url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Edge AI & Camera Sensor',
    url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Team Engineering Collaboration',
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
  },
];

const TEMPLATES = [
  {
    id: 'edge-ai',
    name: 'Edge AI & Vision Deployment',
    description: 'YOLO/TensorRT inference pipelines, thermal envelopes, camera mounting, and benchmark FPS.',
    content: `## Executive Overview
Summarize the computer vision problem on campus and why cloud processing failed to meet real-time latency demands.

### Hardware & Power Constraints
- **Target Edge Board**: NVIDIA Jetson Orin Nano / Raspberry Pi 5
- **Power Envelope**: 15 Watts sustained
- **Inference Runtime**: TensorRT FP16 quantization

\`\`\`python
# Quantized inference loop sample
import tensorrt as trt
# Serialized engine execution
\`\`\`

### Field Benchmark Results
Over a 30-day testing cycle, the edge station sustained 45+ FPS with zero dropped packets under outdoor sunlight.`,
  },
  {
    id: 'iot-telemetry',
    name: 'IoT Hardware & Telemetry Grid',
    description: 'Microcontroller pinout, LoRaWAN / MQTT transmission, sensor calibration, and battery optimization.',
    content: `## Project Summary
Deployment of multi-channel sensor nodes across campus water tanks and energy meters.

### Sensor Pinout & Telemetry Architecture
- **Microcontroller**: ESP32-S3 or STM32WL
- **Protocol**: LoRaWAN 868MHz (Spreading Factor 7)
- **Power Supply**: 3.7V 18650 Li-ion battery with MPPT solar charger

\`\`\`c
// LoRaWAN payload packaging
void sendTelemetryPacket() {
  uint16_t voltage = readBatteryVoltage();
  lora_send(voltage);
}
\`\`\`

### Calibration & Reliability
Demonstrated zero packet collisions over a 5km radius across the main university academic quadrangles.`,
  },
  {
    id: 'case-study',
    name: 'Urban Systems Milestone Report',
    description: 'Sprint breakdown, civic department collaboration, test metrics, and architectural post-mortem.',
    content: `## Challenge Statement
Detailed problem breakdown faced by university administration or municipal delegates.

### Collaborative Sprint Execution
Our team structured this project into three distinct phases:
1. **Week 1-2**: Breadboard prototyping and bench testing.
2. **Week 3-4**: Field deployment and telemetry logging.
3. **Week 5**: Dashboard UI integration and stakeholder review.

### Key Outcomes & Lessons Learned
- Reduced system response latency from 40 minutes to under 5 minutes.
- Verified fault tolerance during local Wi-Fi dropouts.`,
  },
];

export default function WorkspacePage() {
  const router = useRouter();
  const { user, blogs, addBlog, teams } = usePortalStore();

  // Author & Attribution Mode: 'individual' or 'team'
  const [attributionType, setAttributionType] = useState<'individual' | 'team'>('individual');
  const [selectedTeamName, setSelectedTeamName] = useState<string>(user.teamName || 'Team CyberVision');

  // Form Fields
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [category, setCategory] = useState('Edge AI & Vision');
  const [tagsInput, setTagsInput] = useState('Edge AI, Hardware, Telemetry');
  const [durationDays, setDurationDays] = useState('14 Days');
  const [coverImage, setCoverImage] = useState(COVER_PRESETS[0].url);
  const [content, setContent] = useState('');

  // Editor View Mode: 'split' | 'edit' | 'preview'
  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split');
  const [publishedSuccessSlug, setPublishedSuccessSlug] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'editor' | 'my-blogs'>('editor');

  // Set default team from store
  useEffect(() => {
    if (user.teamName) {
      setSelectedTeamName(user.teamName);
    }
  }, [user]);

  // Estimate Read Time
  const calculatedReadTime = useMemo(() => {
    const words = content.trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(words / 180));
    return `${minutes} min read`;
  }, [content]);

  // Insert markdown helper at cursor
  const insertFormatting = (prefix: string, suffix: string = '') => {
    const textarea = document.getElementById('blog-content-area') as HTMLTextAreaElement | null;
    if (!textarea) {
      setContent((prev) => prev + prefix + suffix);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end) || 'text';
    const replacement = `${prefix}${selected}${suffix}`;

    const newContent = text.substring(0, start) + replacement + text.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 0);
  };

  const loadTemplate = (tmpl: typeof TEMPLATES[0]) => {
    if (content.trim().length > 0) {
      if (!confirm('Replace current editor text with this template?')) return;
    }
    setTitle(tmpl.name);
    setExcerpt(tmpl.description);
    setContent(tmpl.content);
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('Please enter a title for your blog post.');
      return;
    }

    if (!content.trim()) {
      alert('Please write your blog post content.');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const newBlog = addBlog({
      title: title.trim(),
      excerpt: excerpt.trim() || title.trim(),
      content: content.trim(),
      category,
      coverImage,
      readTime: calculatedReadTime,
      tags: tags.length > 0 ? tags : ['Engineering'],
      durationDays,
      publishedAt: new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      status: 'approved',
      author: {
        name: attributionType === 'team' ? `${selectedTeamName} Cohort` : user.name,
        role: attributionType === 'team' ? 'Lab Research Team' : 'Intern',
        avatar: attributionType === 'team'
          ? 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=300&q=80'
          : (user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'),
        rollNo: attributionType === 'team' ? 'TEAM' : (user.rollNo || '2300290100098'),
      },
      teamName: selectedTeamName,
      isFeatured: false,
    });

    setPublishedSuccessSlug(newBlog.slug);
  };

  // Filter blogs authored by this student / team
  const myAuthoredBlogs = blogs.filter(
    (b) =>
      b.author.name === user.name ||
      b.teamName === selectedTeamName ||
      b.author.rollNo === user.rollNo
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#0A0A0A] flex flex-col font-sans">
      <Navbar />

      {/* ================= LAPTOP-OPTIMIZED BANNER ================= */}
      <div className="bg-[#0A0A0A] text-white px-4 py-2 text-xs flex items-center justify-between border-b border-black/20">
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
          <Laptop className="w-4 h-4 text-[#2563EB]" />
          <span>
            <strong>SCL Space Studio:</strong> Engineered for laptop & desktop mouse control. Full markdown typography, live dual-pane preview & one-click public publishing.
          </span>
        </div>
      </div>

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-8 py-8 space-y-6">
        
        {/* ================= HEADER & PROFILE BAR ================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E5E7EB] bg-white p-6 rounded-2xl shadow-sm">
          <div className="space-y-1 text-left">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#2563EB] text-white flex items-center justify-center font-bold">
                <PenTool className="w-5 h-5" />
              </div>
              <h1 className="text-[26px] font-bold text-[#0A0A0A] tracking-tight">
                SCL Space Studio
              </h1>
              <span className="text-[12px] font-semibold bg-blue-50 text-[#2563EB] border border-blue-200 px-2.5 py-0.5 rounded-full">
                Workspace
              </span>
            </div>
            <p className="text-[14px] text-[#6B7280]">
              Create, format, and publish open-access project documentation visible directly to professors and industry judges.
            </p>
          </div>

          {/* Active Logged-in User Info */}
          <div className="flex items-center gap-3 bg-[#F8F9FA] px-4 py-2 rounded-xl border border-[#E5E7EB]">
            <img
              src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
              alt={user.name}
              className="w-9 h-9 rounded-full object-cover border border-[#E5E7EB]"
            />
            <div className="text-left leading-tight">
              <span className="text-[13px] font-bold text-[#0A0A0A] block">
                {user.name}
              </span>
              <span className="text-[11px] text-[#6B7280]">
                {user.teamName || selectedTeamName} • {user.rollNo || 'Roll: 2300290100098'}
              </span>
            </div>
          </div>
        </div>

        {/* ================= SUCCESS MODAL / BANNER ================= */}
        {publishedSuccessSlug && (
          <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-left space-y-4 animate-in fade-in">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
                <div>
                  <h3 className="text-[18px] font-bold text-emerald-950">
                    Your Blog Is Published & Live Publicly!
                  </h3>
                  <p className="text-[14px] text-emerald-800">
                    Anyone (professors, evaluators, students) can now view this article without logging in.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPublishedSuccessSlug(null)}
                className="text-emerald-700 hover:text-emerald-900 text-sm font-semibold"
              >
                ✕ Close
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link href={`/blogs/${publishedSuccessSlug}`}>
                <Button variant="primary" size="md" className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2">
                  <span>View Public Article</span>
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/blogs">
                <Button variant="outline" size="md">
                  Browse All Blogs
                </Button>
              </Link>
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  setTitle('');
                  setExcerpt('');
                  setContent('');
                  setPublishedSuccessSlug(null);
                }}
              >
                Create Another Article
              </Button>
            </div>
          </div>
        )}

        {/* ================= TABS: EDITOR vs MY BLOGS ================= */}
        <div className="flex items-center gap-3 border-b border-[#E5E7EB] pb-2">
          <button
            onClick={() => setActiveTab('editor')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors ${
              activeTab === 'editor'
                ? 'bg-[#0A0A0A] text-white shadow-sm'
                : 'text-[#6B7280] hover:text-[#0A0A0A] hover:bg-white'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>Studio Composer</span>
          </button>

          <button
            onClick={() => setActiveTab('my-blogs')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors ${
              activeTab === 'my-blogs'
                ? 'bg-[#0A0A0A] text-white shadow-sm'
                : 'text-[#6B7280] hover:text-[#0A0A0A] hover:bg-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>My Published Articles ({myAuthoredBlogs.length})</span>
          </button>
        </div>

        {/* ================= TAB 1: STUDIO COMPOSER ================= */}
        {activeTab === 'editor' && (
          <div className="space-y-6">
            
            {/* Quick Templates Picker */}
            <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] text-left space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-bold uppercase tracking-wider text-[#6366F1] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  Technical Quick-Start Templates
                </span>
                <span className="text-xs text-[#9CA3AF]">
                  Click to populate structure
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => loadTemplate(tmpl)}
                    className="p-3.5 rounded-xl border border-[#E5E7EB] hover:border-[#2563EB] bg-[#F8F9FA] hover:bg-white transition-all text-left space-y-1 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-bold text-[#0A0A0A] group-hover:text-[#2563EB]">
                        {tmpl.name}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#9CA3AF] group-hover:translate-x-0.5 group-hover:text-[#2563EB]" />
                    </div>
                    <p className="text-[12px] text-[#6B7280] line-clamp-2">
                      {tmpl.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Publication Settings Form */}
            <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] text-left space-y-6">
              <h3 className="text-[16px] font-bold text-[#0A0A0A] border-b border-[#F3F4F6] pb-3">
                1. Attribution & Project Settings
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Attribution Switcher (Individual vs Team) */}
                <div className="space-y-2">
                  <label className="text-[13px] font-semibold text-[#0A0A0A] block">
                    Publish As:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setAttributionType('individual')}
                      className={`p-2.5 rounded-xl border text-[13px] font-semibold flex items-center justify-center gap-2 transition-colors ${
                        attributionType === 'individual'
                          ? 'border-[#2563EB] bg-blue-50 text-[#2563EB]'
                          : 'border-[#E5E7EB] bg-[#F8F9FA] text-[#6B7280]'
                      }`}
                    >
                      <User className="w-4 h-4" />
                      <span>Individual</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAttributionType('team')}
                      className={`p-2.5 rounded-xl border text-[13px] font-semibold flex items-center justify-center gap-2 transition-colors ${
                        attributionType === 'team'
                          ? 'border-[#2563EB] bg-blue-50 text-[#2563EB]'
                          : 'border-[#E5E7EB] bg-[#F8F9FA] text-[#6B7280]'
                      }`}
                    >
                      <Users className="w-4 h-4" />
                      <span>Lab Team</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-[#6B7280]">
                    {attributionType === 'individual'
                      ? `Attributed to ${user.name} (${user.rollNo || '2300290100098'})`
                      : `Attributed to whole team: ${selectedTeamName}`}
                  </p>
                </div>

                {/* Team Selector */}
                <div className="space-y-2">
                  <label className="text-[13px] font-semibold text-[#0A0A0A] block">
                    Associated Team:
                  </label>
                  <select
                    value={selectedTeamName}
                    onChange={(e) => setSelectedTeamName(e.target.value)}
                    className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl px-3 py-2 text-[13px] font-medium text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  >
                    {teams.map((t) => (
                      <option key={t.id} value={t.name}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category Selector */}
                <div className="space-y-2">
                  <label className="text-[13px] font-semibold text-[#0A0A0A] block">
                    Technical Category:
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl px-3 py-2 text-[13px] font-medium text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  >
                    <option value="Edge AI & Vision">Edge AI & Vision</option>
                    <option value="IoT & Sensors">IoT & Sensors</option>
                    <option value="Green Energy">Green Energy</option>
                    <option value="Smart Mobility">Smart Mobility</option>
                    <option value="Software Engineering">Software Engineering</option>
                    <option value="Design & Architecture">Design & Architecture</option>
                    <option value="Product">Product & Agile</option>
                  </select>
                </div>

              </div>

              {/* Title & Excerpt */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-semibold text-[#0A0A0A] block">
                    Article Title:
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Architecting a 15W Edge-AI Inference Hub with Jetson Orin"
                    className="w-full bg-white border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-[16px] font-bold text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-semibold text-[#0A0A0A] block">
                    Summary / Excerpt (1-2 sentences):
                  </label>
                  <input
                    type="text"
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="Short description displayed on public blog cards..."
                    className="w-full bg-white border border-[#E5E7EB] rounded-xl px-4 py-2 text-[14px] text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>
              </div>

              {/* Duration & Tags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-semibold text-[#0A0A0A] block">
                    Project Duration / Days Spent:
                  </label>
                  <input
                    type="text"
                    value={durationDays}
                    onChange={(e) => setDurationDays(e.target.value)}
                    placeholder="e.g., 14 Days, 3 Weeks"
                    className="w-full bg-white border border-[#E5E7EB] rounded-xl px-4 py-2 text-[14px] text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-semibold text-[#0A0A0A] block">
                    Tags (comma separated):
                  </label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="Edge AI, YOLOv8, Telemetry, LoRa"
                    className="w-full bg-white border border-[#E5E7EB] rounded-xl px-4 py-2 text-[14px] text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>
              </div>

              {/* Cover Image Selector & Presets */}
              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-[#0A0A0A] block">
                  Cover Image URL:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 bg-white border border-[#E5E7EB] rounded-xl px-4 py-2 text-[13px] text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                  {coverImage && (
                    <img
                      src={coverImage}
                      alt="Preview"
                      className="w-12 h-10 rounded-lg object-cover border border-[#E5E7EB]"
                    />
                  )}
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[11px] text-[#9CA3AF] mr-1">Presets:</span>
                  {COVER_PRESETS.map((cp, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCoverImage(cp.url)}
                      className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
                        coverImage === cp.url
                          ? 'border-[#2563EB] bg-blue-50 text-[#2563EB] font-semibold'
                          : 'border-[#E5E7EB] text-[#6B7280] hover:text-[#0A0A0A]'
                      }`}
                    >
                      {cp.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* ================= 2. RICH MOUSE FORMATTING TOOLBAR & WORKSPACE ================= */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden text-left">
              
              {/* Toolbar Bar */}
              <div className="p-3 bg-[#F8F9FA] border-b border-[#E5E7EB] flex flex-wrap items-center justify-between gap-2">
                {/* Mouse Control Buttons */}
                <div className="flex flex-wrap items-center gap-1">
                  <button
                    type="button"
                    onClick={() => insertFormatting('**', '**')}
                    title="Bold"
                    className="p-1.5 rounded hover:bg-white text-[#0A0A0A] border border-transparent hover:border-[#E5E7EB] transition-colors"
                  >
                    <Bold className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => insertFormatting('*', '*')}
                    title="Italic"
                    className="p-1.5 rounded hover:bg-white text-[#0A0A0A] border border-transparent hover:border-[#E5E7EB] transition-colors"
                  >
                    <Italic className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => insertFormatting('<u>', '</u>')}
                    title="Underline"
                    className="p-1.5 rounded hover:bg-white text-[#0A0A0A] border border-transparent hover:border-[#E5E7EB] transition-colors"
                  >
                    <UnderlineIcon className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => insertFormatting('~~', '~~')}
                    title="Strikethrough"
                    className="p-1.5 rounded hover:bg-white text-[#0A0A0A] border border-transparent hover:border-[#E5E7EB] transition-colors"
                  >
                    <Strikethrough className="w-4 h-4" />
                  </button>

                  <div className="h-5 w-px bg-[#E5E7EB] mx-1" />

                  <button
                    type="button"
                    onClick={() => insertFormatting('## ')}
                    title="Heading 2"
                    className="p-1.5 rounded hover:bg-white text-[#0A0A0A] border border-transparent hover:border-[#E5E7EB] transition-colors"
                  >
                    <Heading2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => insertFormatting('### ')}
                    title="Heading 3"
                    className="p-1.5 rounded hover:bg-white text-[#0A0A0A] border border-transparent hover:border-[#E5E7EB] transition-colors"
                  >
                    <Heading3 className="w-4 h-4" />
                  </button>

                  <div className="h-5 w-px bg-[#E5E7EB] mx-1" />

                  <button
                    type="button"
                    onClick={() => insertFormatting('> ')}
                    title="Blockquote"
                    className="p-1.5 rounded hover:bg-white text-[#0A0A0A] border border-transparent hover:border-[#E5E7EB] transition-colors"
                  >
                    <Quote className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => insertFormatting('```typescript\n', '\n```')}
                    title="Code Block"
                    className="p-1.5 rounded hover:bg-white text-[#0A0A0A] border border-transparent hover:border-[#E5E7EB] transition-colors"
                  >
                    <Code className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => insertFormatting('- ')}
                    title="Bullet List"
                    className="p-1.5 rounded hover:bg-white text-[#0A0A0A] border border-transparent hover:border-[#E5E7EB] transition-colors"
                  >
                    <List className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => insertFormatting('1. ')}
                    title="Numbered List"
                    className="p-1.5 rounded hover:bg-white text-[#0A0A0A] border border-transparent hover:border-[#E5E7EB] transition-colors"
                  >
                    <ListOrdered className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => insertFormatting('\n---\n')}
                    title="Horizontal Line"
                    className="p-1.5 rounded hover:bg-white text-[#0A0A0A] border border-transparent hover:border-[#E5E7EB] transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                </div>

                {/* View Mode Switcher (Split / Edit / Preview) */}
                <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-[#E5E7EB]">
                  <button
                    type="button"
                    onClick={() => setViewMode('split')}
                    className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-colors ${
                      viewMode === 'split' ? 'bg-[#2563EB] text-white' : 'text-[#6B7280] hover:text-[#0A0A0A]'
                    }`}
                  >
                    <Columns className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Split View</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewMode('edit')}
                    className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-colors ${
                      viewMode === 'edit' ? 'bg-[#2563EB] text-white' : 'text-[#6B7280] hover:text-[#0A0A0A]'
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Editor Only</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewMode('preview')}
                    className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-colors ${
                      viewMode === 'preview' ? 'bg-[#2563EB] text-white' : 'text-[#6B7280] hover:text-[#0A0A0A]'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Live Preview</span>
                  </button>
                </div>
              </div>

              {/* Dual-Pane Editor & Preview Body */}
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#E5E7EB] min-h-[500px]">
                
                {/* Editor Pane */}
                {(viewMode === 'split' || viewMode === 'edit') && (
                  <div className={`p-4 flex flex-col ${viewMode === 'edit' ? 'md:col-span-2' : ''}`}>
                    <textarea
                      id="blog-content-area"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Write your article documentation using markdown... Use the toolbar above for quick formatting."
                      className="w-full flex-grow p-4 font-mono text-[14px] text-[#0A0A0A] bg-white resize-y min-h-[460px] focus:outline-none leading-relaxed"
                    />
                    <div className="pt-2 flex items-center justify-between text-xs text-[#9CA3AF] border-t border-[#F3F4F6]">
                      <span>{content.trim().split(/\s+/).filter(Boolean).length} words</span>
                      <span>Estimated reading time: {calculatedReadTime}</span>
                    </div>
                  </div>
                )}

                {/* Live Preview Pane */}
                {(viewMode === 'split' || viewMode === 'preview') && (
                  <div className={`p-6 bg-[#FAFAFA] overflow-y-auto max-h-[700px] text-left space-y-4 ${viewMode === 'preview' ? 'md:col-span-2' : ''}`}>
                    <div className="pb-3 border-b border-[#E5E7EB]">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#6366F1]">
                        Live Public Preview
                      </span>
                      <h2 className="text-[24px] font-bold text-[#0A0A0A] leading-tight mt-1">
                        {title || 'Article Title'}
                      </h2>
                      <p className="text-[14px] text-[#6B7280] mt-1">
                        {excerpt || 'Short excerpt preview...'}
                      </p>
                    </div>

                    {coverImage && (
                      <div className="rounded-xl overflow-hidden border border-[#E5E7EB] max-h-56">
                        <img
                          src={coverImage}
                          alt="Cover"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="prose prose-sm max-w-none space-y-4 text-[#374151]">
                      {content.trim().length === 0 ? (
                        <p className="text-sm text-[#9CA3AF] italic">
                          Start typing in the editor on the left to see your formatted live article rendered here.
                        </p>
                      ) : (
                        content.split('\n\n').map((para, i) => {
                          const t = para.trim();
                          if (t.startsWith('## ')) {
                            return <h3 key={i} className="text-lg font-bold text-[#0A0A0A] border-b pb-1">{t.replace('## ', '')}</h3>;
                          }
                          if (t.startsWith('### ')) {
                            return <h4 key={i} className="text-md font-bold text-[#0A0A0A]">{t.replace('### ', '')}</h4>;
                          }
                          if (t.startsWith('```')) {
                            return (
                              <pre key={i} className="p-3 bg-[#0F172A] text-emerald-400 rounded-lg text-xs font-mono overflow-x-auto">
                                <code>{t.replace(/```[a-z]*\n?/gi, '')}</code>
                              </pre>
                            );
                          }
                          return <p key={i} className="text-sm leading-relaxed">{t}</p>;
                        })
                      )}
                    </div>
                  </div>
                )}

              </div>

              {/* Bottom Publishing Bar */}
              <div className="p-4 bg-white border-t border-[#E5E7EB] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-[#6B7280]">
                  Articles are published to the public portal immediately and linked to your student credentials.
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handlePublish}
                    className="bg-[#2563EB] hover:bg-blue-700 text-white shadow-md flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Publish to Public Blog</span>
                  </Button>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ================= TAB 2: MY PUBLISHED BLOGS ================= */}
        {activeTab === 'my-blogs' && (
          <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] text-left space-y-6">
            <div className="flex items-center justify-between border-b border-[#F3F4F6] pb-4">
              <div>
                <h3 className="text-[18px] font-bold text-[#0A0A0A]">
                  Articles Written by You & {selectedTeamName}
                </h3>
                <p className="text-[13px] text-[#6B7280]">
                  Track views, public share links, and verify published articles.
                </p>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => setActiveTab('editor')}
              >
                + Write New Article
              </Button>
            </div>

            {myAuthoredBlogs.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-[#E5E7EB] rounded-xl space-y-3">
                <FileText className="w-8 h-8 text-[#9CA3AF] mx-auto" />
                <h4 className="text-[15px] font-bold text-[#0A0A0A]">
                  No articles published yet
                </h4>
                <p className="text-[13px] text-[#6B7280]">
                  Use the Studio Composer tab to write your first technical documentation article.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#F3F4F6]">
                {myAuthoredBlogs.map((b) => (
                  <div key={b.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-[#6366F1] bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                          {b.category || b.tags?.[0]}
                        </span>
                        <span className="text-[12px] text-[#9CA3AF]">
                          {b.publishedAt}
                        </span>
                      </div>
                      <h4 className="text-[16px] font-bold text-[#0A0A0A] hover:text-[#2563EB]">
                        <Link href={`/blogs/${b.slug}`}>
                          {b.title}
                        </Link>
                      </h4>
                      <p className="text-[13px] text-[#6B7280] line-clamp-1">
                        {b.excerpt}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <span className="text-[13px] text-[#6B7280] flex items-center gap-1">
                        <Eye className="w-4 h-4 text-[#2563EB]" />
                        {b.views || 0} views
                      </span>

                      <Link href={`/blogs/${b.slug}`}>
                        <Button variant="outline" size="sm" className="flex items-center gap-1.5">
                          <span>View Live</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
