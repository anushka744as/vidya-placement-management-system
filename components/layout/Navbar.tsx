"use client";

import { Search, Sun, Moon, ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/students": "Students",
  "/dashboard/students/profile": "Student Profile",
  "/dashboard/students/new": "Add Student",
  "/dashboard/jobs": "Job Listings",
  "/dashboard/applications": "My Applications",
  "/dashboard/resume": "Resume Builder",
};

export default function Navbar() {
  const pathname = usePathname();
  const [dark, setDark] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const title = pageTitles[pathname] || "Dashboard";

  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-400">VPMS</span>
          <span className="text-gray-300">/</span>
          <span className="font-semibold text-gray-800">{title}</span>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-56 pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-200 transition-all"
            />
          </div>

          {/* Mobile search */}
          <button
            className="md:hidden p-2 rounded-xl hover:bg-gray-50 text-gray-500"
            onClick={() => setSearchOpen(!searchOpen)}
          >
            <Search size={18} />
          </button>

          {/* Theme toggle */}
          <button
            onClick={() => setDark(!dark)}
            className="p-2 rounded-xl hover:bg-gray-50 text-gray-500 transition-colors"
            title="Toggle theme"
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Profile */}
          <button className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-semibold">
              A
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-semibold text-gray-800 leading-tight">Admin User</p>
              <p className="text-[10px] text-gray-400 leading-tight">Administrator</p>
            </div>
            <ChevronDown size={14} className="text-gray-400 hidden lg:block" />
          </button>
        </div>
      </div>

      {/* Mobile search */}
      {searchOpen && (
        <div className="md:hidden px-6 pb-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>
      )}
    </header>
  );
}
