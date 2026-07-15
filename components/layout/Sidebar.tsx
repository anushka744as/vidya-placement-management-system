"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  LogOut,
  ChevronLeft,
  ChevronRight,
  FileEdit,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import Image from "next/image";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Students", icon: Users, href: "/dashboard/students" },
  { label: "Jobs", icon: Briefcase, href: "/dashboard/jobs" },
  { label: "Applications", icon: FileText, href: "/dashboard/applications" },
  { label: "Resume Builder", icon: FileEdit, href: "/dashboard/resume" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "relative flex flex-col h-screen bg-white border-r border-gray-100 transition-all duration-300 shrink-0",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div className={cn("flex items-center gap-3 px-4 py-5 border-b border-gray-100", collapsed && "justify-center px-0")}>
        <Image src="/images/image.png" alt="Vidya Logo" width={36} height={36} className="shrink-0" />
        {!collapsed && (
          <div>
            <p className="text-sm font-700 text-gray-900 leading-tight font-bold">VPMS</p>
            <p className="text-[10px] text-gray-400 leading-tight">Placement Portal</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map(({ label, icon: Icon, href }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                active
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-800",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? label : undefined}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-2 border-t border-gray-100">
        <Link
          href="/login"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all duration-150",
            collapsed && "justify-center px-2"
          )}
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span>Logout</span>}
        </Link>
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
