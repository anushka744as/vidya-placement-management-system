'use client';

import { Search, ChevronDown, User, ShieldCheck } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Overview Dashboard',
  '/dashboard/records': 'Placement Records',
  '/dashboard/students': 'Students',
  '/dashboard/students/profile': 'Student Profile',
  '/dashboard/students/new': 'Add Student',
  '/dashboard/jobs': 'Job Listings',
  '/dashboard/applications': 'My Applications',
};

export default function Navbar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const title = pageTitles[pathname] || 'Placement Records';

  const userEmail = user?.email || 'admin@vidya.org';
  const initial = userEmail[0].toUpperCase();

  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-400 font-semibold">VPMS Admin</span>
          <span className="text-gray-300">/</span>
          <span className="font-bold text-gray-800">{title}</span>
        </div>

        {/* Right Info */}
        <div className="flex items-center gap-3">
          {/* Supabase Connected Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full border border-green-200 text-xs font-semibold">
            <ShieldCheck size={14} /> Supabase Auth Active
          </div>

          {/* Profile */}
          <div className="flex items-center gap-2.5 pl-2 pr-3 py-1 rounded-xl bg-gray-50/80 border border-gray-100">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white text-xs font-bold shadow-xs">
              {initial}
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-gray-800 leading-tight">{userEmail}</p>
              <p className="text-[10px] text-gray-400 leading-tight font-medium">Administrator</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
