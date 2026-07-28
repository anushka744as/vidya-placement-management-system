'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Database,
  Briefcase,
  Star,
  CheckCircle2,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from 'sonner';

const navItems = [
  { label: 'Placement Records', icon: Database, href: '/dashboard/records' },
  { label: 'Dashboard Overview', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Selected Students', icon: CheckCircle2, href: '/dashboard/selected-students' },
  { label: 'Jobs', icon: Briefcase, href: '/dashboard/jobs' },
  { label: 'Success Stories', icon: Star, href: '/dashboard/success-stories' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await signOut();
    toast.success('Signed out of Admin Session');
    router.push('/login');
  };

  return (
    <aside
      className={cn(
        'relative flex flex-col h-screen bg-white border-r border-gray-100 transition-all duration-300 shrink-0',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className={cn('flex items-center gap-3 px-4 py-5 border-b border-gray-100', collapsed && 'justify-center px-0')}>
        <Image src="/images/image.png" alt="Vidya Logo" width={36} height={36} className="shrink-0" />
        {!collapsed && (
          <div>
            <p className="text-sm font-bold text-gray-900 leading-tight">VPMS Admin</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map(({ label, icon: Icon, href }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-blue-50 text-blue-600 font-semibold shadow-2xs'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800',
                collapsed && 'justify-center px-2'
              )}
              title={collapsed ? label : undefined}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom User / Logout */}
      <div className="p-2 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all duration-150',
            collapsed && 'justify-center px-2'
          )}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 bg-white border border-gray-200 rounded-full p-0.5 shadow-sm hover:shadow-md transition-shadow z-10"
      >
        {collapsed ? <ChevronRight size={14} className="text-gray-500" /> : <ChevronLeft size={14} className="text-gray-500" />}
      </button>
    </aside>
  );
}
