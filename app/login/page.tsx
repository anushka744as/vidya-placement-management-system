"use client";

import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { GraduationCap, Briefcase, TrendingUp, Heart } from "lucide-react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);

  return (
    <div className="min-h-screen flex">
      {/* Left - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-500/20 rounded-full translate-y-1/3 -translate-x-1/3" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-400/20 rounded-full" />

        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <div className="flex items-center gap-3">
            <Image src="/images/image.png" alt="Vidya" width={44} height={44} />
            <div>
              <p className="font-bold text-lg leading-tight">Vidya</p>
              <p className="text-xs text-blue-200 leading-tight">Placement Management System</p>
            </div>
          </div>

          <div className="max-w-md">
            <h1 className="text-4xl font-bold mb-4 leading-tight">
              Empowering careers, one student at a time.
            </h1>
            <p className="text-blue-100 text-lg mb-10 leading-relaxed">
              Sign in to manage student placements, track applications, and connect skilled
              candidates with the right opportunities.
            </p>

            <div className="space-y-4">
              {[
                { icon: GraduationCap, text: "Track 2,800+ students across 7 centers" },
                { icon: Briefcase, text: "Manage 150+ active job openings" },
                { icon: TrendingUp, text: "84% retention rate after placement" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <item.icon size={20} />
                  </div>
                  <p className="text-blue-100">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-blue-200 text-sm">
            <Heart size={14} /> © 2024 Vidya NGO
          </div>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-8">
            <Image src="/images/image.png" alt="Vidya" width={40} height={40} />
            <div>
              <p className="font-bold text-gray-900 leading-tight">Vidya</p>
              <p className="text-xs text-gray-400 leading-tight">Placement Management</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back</h2>
          <p className="text-gray-500 mb-8">Sign in to your VPMS account to continue.</p>

          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  placeholder="admin@vidya.org"
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <a href="#" className="text-xs text-blue-600 hover:underline">Forgot password?</a>
              </div>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRemember(!remember)}
                className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                  remember ? "bg-blue-600 border-blue-600" : "border-gray-300"
                }`}
              >
                {remember && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
              <label className="text-sm text-gray-600 cursor-pointer" onClick={() => setRemember(!remember)}>
                Remember me for 30 days
              </label>
            </div>

            {/* Submit */}
            <Link
              href="/dashboard"
              className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-100 transition-all"
            >
              Sign In <ArrowRight size={18} />
            </Link>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            Don't have an account?{" "}
            <a href="#" className="text-blue-600 font-medium hover:underline">Contact admin</a>
          </p>
        </div>
      </div>
    </div>
  );
}
