"use client";

import Link from "next/link";
import {
  GraduationCap,
  Briefcase,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Heart,
  FileEdit,
  Database,
  Search,
  Upload,
} from "lucide-react";
import Image from "next/image";
import { SuccessStoriesCarousel } from "@/components/home/SuccessStoriesCarousel";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans flex flex-col justify-between">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/images/image.png" alt="Vidya" width={40} height={40} className="rounded-lg p-1 border" />
            <div>
              <p className="font-bold text-gray-900 leading-tight">Vidya VPMS</p>
              <p className="text-xs text-blue-600 font-semibold leading-tight">Placement Management System</p>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Dual Interface Cards */}
      <section className="relative overflow-hidden py-16 md:py-24 bg-gradient-to-b from-blue-50/40 via-white to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100/80 text-blue-700 text-xs font-bold rounded-full">
              <Heart size={14} className="fill-blue-600" /> Vidya NGO Placement Initiative
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
              One Unified System — <span className="text-blue-600">Dual Portals</span> for Students & Admins
            </h1>
            <p className="text-base text-gray-500 max-w-2xl mx-auto leading-relaxed">
              Empowering students to find jobs, apply, and build single-page resumes, while providing admins with a complete placement records management system.
            </p>
          </div>

          {/* Dual Interfaces Selection Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Interface 1: Student / User Portal */}
            <div className="bg-white rounded-3xl border-2 border-blue-100 hover:border-blue-500 p-8 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-6 group">
              <div className="space-y-4">
                <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center font-bold">
                  <GraduationCap size={32} />
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                    Interface 1: For Students & Job Seekers
                  </span>
                  <h2 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    Student Career Portal
                  </h2>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Browse open verified job listings, apply with a single click, track real-time application status, and build an auto-saving single-page PDF resume.
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-xs text-gray-700 font-medium">
                    <Search size={14} className="text-blue-600" /> Open Job Listings with Zone/City Cascading Filters
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-700 font-medium">
                    <Briefcase size={14} className="text-blue-600" /> Single-click Apply & Application Tracker
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-700 font-medium">
                    <FileEdit size={14} className="text-blue-600" /> Single-Page Resume Builder with PDF Export
                  </div>
                </div>
              </div>

              <Link
                href="/portal/jobs"
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                Enter Student Portal <ArrowRight size={16} />
              </Link>
            </div>

            {/* Interface 2: Admin Portal */}
            <div className="bg-white rounded-3xl border-2 border-gray-100 hover:border-gray-900 p-8 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-6 group">
              <div className="space-y-4">
                <div className="w-14 h-14 bg-gray-100 text-gray-900 rounded-2xl flex items-center justify-center font-bold">
                  <ShieldCheck size={32} />
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-700 bg-gray-100 px-2.5 py-1 rounded-full border border-gray-200">
                    Interface 2: For Administrators & NGO Staff
                  </span>
                  <h2 className="text-2xl font-bold text-gray-900 group-hover:text-gray-900 transition-colors">
                    Admin Management Panel
                  </h2>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Full admin system to manage placement records, run bulk CSV imports with column mapping, and track placement metrics.
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-xs text-gray-700 font-medium">
                    <Database size={14} className="text-gray-800" /> Secure Database CRUD & Auth
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-700 font-medium">
                    <Upload size={14} className="text-gray-800" /> CSV Bulk Upload with Interactive Header Mapping
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-700 font-medium">
                    <TrendingUp size={14} className="text-gray-800" /> Records Search, Filter & CSV Export
                  </div>
                </div>
              </div>

              <Link
                href="/login"
                className="w-full py-3.5 bg-gray-900 hover:bg-black text-white font-bold rounded-2xl text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                Enter Admin Portal <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SuccessStoriesCarousel />

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-100 py-6 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-6">
          <p>© 2026 Vidya Placement Management System (VPMS). All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
