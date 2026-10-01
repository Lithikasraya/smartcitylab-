'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePortalStore } from '@/lib/store';
import Button from '@/components/shared/Button';
import Card from '@/components/shared/Card';
import { Input } from '@/components/shared/Input';
import { loginAdmin } from '@/lib/firebaseService';
import { ShieldCheck, AlertCircle, Sparkles, Lock } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const { setUser } = usePortalStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const sanitizedEmail = email.includes('@') ? email.trim() : `${email.trim()}@kiet.edu`;

    try {
      const profile = await loginAdmin(sanitizedEmail, password);
      setUser(profile);
      setSuccessMsg('Authentication verified. Accessing Super Admin Console...');
      setTimeout(() => router.push('/admin/dashboard'), 400);
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      console.error('Firebase Auth Error:', error);

      if (
        error.code === 'auth/invalid-credential' || 
        error.code === 'auth/wrong-password' || 
        error.code === 'auth/user-not-found' ||
        error.code === 'auth/invalid-email'
      ) {
        setErrorMsg('Invalid credentials. Please verify your admin email/ID and password.');
      } else if (error.code === 'auth/too-many-requests') {
        setErrorMsg('Access temporarily blocked due to multiple failed attempts. Please try again in a few minutes.');
      } else if (error.code === 'auth/network-request-failed') {
        setErrorMsg('Network error. Please verify your internet connection.');
      } else {
        setErrorMsg(error.message || 'Authentication failed. Access restricted.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-center items-center px-4 font-sans">
      <div className="w-full max-w-md">
        
        {/* Centered card with clean borders */}
        <Card className="p-8 text-left space-y-6 bg-white border border-[#E5E7EB] rounded-2xl shadow-sm">
          
          <div className="text-center space-y-2 pb-1">
            <Link href="/" className="inline-block text-[18px] font-bold tracking-tight text-[#0A0A0A]">
              KIET Smart City Lab
            </Link>
            <div className="flex justify-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold bg-blue-50 text-blue-600 border border-blue-200">
                <ShieldCheck className="w-3.5 h-3.5" /> Super Admin CRM
              </span>
            </div>
            <h1 className="text-[22px] sm:text-[24px] font-black text-[#0A0A0A] pt-1">
              Admin Sign In
            </h1>
            <p className="text-[13.5px] text-[#6B7280]">
              Sign in with your administrator account added in Firebase Console.
            </p>
          </div>

          {/* Error Alert */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[13px] flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success Alert */}
          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-[13px] flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Admin Email or ID"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@kiet.edu"
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full justify-center mt-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm"
              loading={loading}
              icon={<Lock className="w-4 h-4" />}
            >
              Sign In to Super Admin Console
            </Button>
          </form>

          <div className="pt-2 text-center border-t border-[#E5E7EB]">
            <Link
              href="/"
              className="text-[13px] text-[#6B7280] hover:text-[#0A0A0A] transition-colors inline-block pt-1"
            >
              ← Return to public website
            </Link>
          </div>

        </Card>

      </div>
    </div>
  );
}
