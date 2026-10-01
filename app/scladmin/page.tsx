'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SCLAdmin() {
  const router = useRouter();
  useEffect(() => { router.replace('/admin'); }, [router]);
  return null;
}
