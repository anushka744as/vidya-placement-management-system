'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Lock, Eye, EyeOff, ArrowRight, GraduationCap, Briefcase, TrendingUp, Heart, Loader2, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { fetchUserRole } from '@/app/actions/auth';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error('Please enter both email and password.');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        toast.error(error.message || 'Invalid email or password');
        setLoading(false);
        return;
      }

      const { role } = await fetchUserRole(data.user.id);

      if (role !== 'admin') {
        await supabase.auth.signOut();
        toast.error('This account does not have admin access.');
        setLoading(false);
        return;
      }

      toast.success('Signed in successfully!');
      router.push('/dashboard/records');
    } catch (err: any) {
      toast.error(err.message || 'Authentication error');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Banner */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-500/20 rounded-full translate-y-1/3 -translate-x-1/3" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-400/20 rounded-full" />

        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <div className="flex items-center gap-3">
            <Image src="/images/image.png" alt="Vidya" width={44} height={44} className="rounded-lg bg-white p-1" />
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
              Sign in to manage candidate records, run bulk CSV imports, track employment stats, and connect skilled students with employers.
            </p>

            <div className="space-y-4">
              {[
                { icon: GraduationCap, text: "Track placement candidates across 5 Zones & 15+ Centers" },
                { icon: Briefcase, text: "Full-Time, Part-Time & Internship Role Tracking" },
                { icon: ShieldCheck, text: "Role-based Database Row-Level Security" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <item.icon size={20} />
                  </div>
                  <p className="text-blue-100 text-sm">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-blue-200 text-sm">
            <Heart size={14} /> © 2026 Vidya NGO
          </div>
        </div>
      </div>

      {/* Right Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile Header */}
          <div className="flex lg:hidden items-center gap-3 mb-8">
            <Image src="/images/image.png" alt="Vidya" width={40} height={40} className="rounded-lg border p-1" />
            <div>
              <p className="font-bold text-gray-900 leading-tight">Vidya</p>
              <p className="text-xs text-gray-400 leading-tight">Placement Management</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back</h2>
          <p className="text-gray-500 mb-8 text-sm">Sign in to your VPMS Admin Portal to manage placement records.</p>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@vidya.org"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-gray-700">Password</label>
              </div>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-11 pr-11 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-sm shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Processing...
                </>
              ) : (
                <>
                  Sign In <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-gray-400">
            Admin accounts are provisioned by the placement team — this portal doesn't support self-registration.
          </p>
        </div>
      </div>
    </div>
  );
}
