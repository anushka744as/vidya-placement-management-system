'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Briefcase, FileText, FileEdit, LogOut, GraduationCap, Menu, X, ChevronRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { NewsletterFooter } from './NewsletterFooter';
import { JobNotificationBell } from './JobNotificationBell';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { fetchStudentProfileByEmail } from '@/app/actions/students';

const studentNavItems = [
  { label: 'Job Listings', icon: Briefcase, href: '/portal/jobs' },
  { label: 'My Applications', icon: FileText, href: '/portal/applications' },
  { label: 'Resume Builder', icon: FileEdit, href: '/portal/resume' },
];

export function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileChecked, setProfileChecked] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/portal/login');
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (loading || !user) return;
    let cancelled = false;
    fetchStudentProfileByEmail(user.email || '').then((res) => {
      if (cancelled) return;
      if (!res.data) {
        router.replace('/portal/onboarding');
        return;
      }
      setHasProfile(true);
      setProfileChecked(true);
    });
    return () => { cancelled = true; };
  }, [loading, user, router]);

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out of Student Portal');
    router.push('/portal/login');
  };

  const userEmail = user?.email;
  const initial = (userEmail || '?')[0].toUpperCase();

  if (loading || !user || !profileChecked || !hasProfile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-gray-50/60">
        <Loader2 size={32} className="animate-spin text-blue-600" />
        <p className="text-sm font-medium text-gray-500">
          {loading ? 'Loading...' : !user ? 'Redirecting to sign in...' : !hasProfile ? 'Redirecting to complete your profile...' : 'Loading...'}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/60 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-2xs">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          {/* Logo & Portal Badge */}
          <Link href="/portal/jobs" className="flex items-center gap-3">
            <Image src="/images/image.png" alt="Vidya Logo" width={38} height={38} className="shrink-0" />
            <div>
              <p className="font-bold text-gray-900 leading-tight">Vidya VPMS</p>
              <p className="text-[10px] text-blue-600 font-semibold leading-tight flex items-center gap-1">
                <GraduationCap size={12} /> Student Placement Portal
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-100">
            {studentNavItems.map(({ label, icon: Icon, href }) => {
              const active = pathname === href || (href !== '/portal' && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-150',
                    active
                      ? 'bg-white text-blue-600 shadow-2xs'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/60'
                  )}
                >
                  <Icon size={16} />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right side: notifications, user & sign out, mobile menu */}
          <div className="flex items-center gap-2">
            <JobNotificationBell />

            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-blue-50/60 border border-blue-100">
                <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-xs">
                  {initial}
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-gray-800 leading-tight">{userEmail}</p>
                  <p className="text-[10px] text-blue-600 font-semibold leading-tight">Certified Student</p>
                </div>
              </div>

              <button
                onClick={handleSignOut}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                title="Sign Out"
              >
                <LogOut size={18} />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-xl"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-6 py-4 space-y-2 animate-fade-in">
            {studentNavItems.map(({ label, icon: Icon, href }) => {
              const active = pathname === href || pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all',
                    active ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-600 hover:bg-gray-50'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} />
                    <span>{label}</span>
                  </div>
                  <ChevronRight size={16} className="text-gray-400" />
                </Link>
              );
            })}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-500">{userEmail}</span>
              <button
                onClick={handleSignOut}
                className="text-xs text-red-500 font-semibold flex items-center gap-1.5 px-3 py-1.5 bg-red-50 rounded-lg"
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>

      {/* Newsletter Footer */}
      <NewsletterFooter />
    </div>
  );
}
