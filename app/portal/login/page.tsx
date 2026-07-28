'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Mail, Lock, Eye, EyeOff, ArrowRight, GraduationCap, Briefcase, FileEdit, Heart, Loader2, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

function getPasswordError(password: string): string | null {
  if (password.length <= 6) return 'Password must be longer than 6 characters.';
  if (!/[a-z]/.test(password)) return 'Password must include a lowercase letter.';
  if (!/[A-Z]/.test(password)) return 'Password must include an uppercase letter.';
  if (!/[0-9]/.test(password)) return 'Password must include a digit.';
  return null;
}

export default function StudentLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [isSignUpMode, setIsSignUpMode] = useState(false);

  const handleGoogleAuth = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/portal/jobs`,
        },
      });
      if (error) {
        toast.error(error.message);
        setGoogleLoading(false);
      }
    } catch (err: any) {
      toast.error(err.message || 'Could not continue with Google.');
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error('Please enter both email and password.');
      return;
    }

    if (isSignUpMode) {
      const passwordError = getPasswordError(password);
      if (passwordError) {
        toast.error(passwordError);
        return;
      }
    }

    setLoading(true);

    try {
      if (isSignUpMode) {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });

        if (error) {
          toast.error(error.message);
        } else {
          toast.success('Account created! Check your email to confirm your account before signing in.', { duration: 6000 });
          setIsSignUpMode(false);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          toast.error(error.message || 'Invalid email or password');
        } else {
          toast.success('Signed in successfully!');
          router.push('/portal/jobs');
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Banner */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/20 rounded-full translate-y-1/3 -translate-x-1/3" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-400/20 rounded-full" />

        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <div className="flex items-center gap-3">
            <Image src="/images/image.png" alt="Vidya" width={44} height={44} className="rounded-lg bg-white p-1" />
            <div>
              <p className="font-bold text-lg leading-tight">Vidya</p>
              <p className="text-xs text-blue-200 leading-tight">Student Placement Portal</p>
            </div>
          </div>

          <div className="max-w-md">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 text-blue-100 text-xs font-semibold rounded-full backdrop-blur-sm mb-4">
              <Sparkles size={14} /> Certified Student Placement Portal
            </span>
            <h1 className="text-4xl font-bold mb-4 leading-tight">
              Find your next opportunity.
            </h1>
            <p className="text-blue-100 text-lg mb-10 leading-relaxed">
              Sign in to browse open job listings, track your applications in real time, and build your resume.
            </p>

            <div className="space-y-4">
              {[
                { icon: Briefcase, text: 'Browse verified job listings across every zone & centre' },
                { icon: GraduationCap, text: 'Track application status: shortlisted, interview, selected' },
                { icon: FileEdit, text: 'Build a single-page resume with PDF export' },
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
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-gradient-to-br from-amber-50/70 via-white to-orange-50/50">
        <div className="w-full max-w-md">
          {/* Mobile Header */}
          <div className="flex lg:hidden items-center gap-3 mb-8">
            <Image src="/images/image.png" alt="Vidya" width={40} height={40} className="rounded-lg border p-1" />
            <div>
              <p className="font-bold text-gray-900 leading-tight">Vidya</p>
              <p className="text-xs text-gray-400 leading-tight">Student Placement Portal</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isSignUpMode ? 'Create your account' : 'Welcome back'}
          </h2>
          <p className="text-gray-500 mb-8 text-sm">
            {isSignUpMode
              ? 'Register to apply for jobs and track your placement status.'
              : 'Sign in to browse jobs, track applications, and build your resume.'}
          </p>

          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={googleLoading}
            className="w-full py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2.5 transition-all disabled:opacity-50 mb-6"
          >
            {googleLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46c-.28 1.5-1.13 2.78-2.4 3.63v3.02h3.89c2.28-2.1 3.57-5.2 3.57-8.84z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.89-3.02c-1.08.72-2.46 1.15-4.06 1.15-3.12 0-5.77-2.11-6.72-4.94H1.27v3.11C3.25 21.3 7.31 24 12 24z" />
                <path fill="#FBBC05" d="M5.28 14.29A7.2 7.2 0 0 1 4.9 12c0-.79.14-1.57.38-2.29V6.6H1.27A11.98 11.98 0 0 0 0 12c0 1.93.46 3.76 1.27 5.4z" />
                <path fill="#EA4335" d="M12 4.77c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.27 6.6l4.01 3.11C6.23 6.88 8.88 4.77 12 4.77z" />
              </svg>
            )}
            Continue with Google
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white text-gray-400">or use your email</span>
            </div>
          </div>

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
                  placeholder="you@email.com"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  autoComplete={isSignUpMode ? 'new-password' : 'current-password'}
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
              {isSignUpMode && (
                <p className="mt-1.5 text-xs text-gray-400">
                  Must be longer than 6 characters and include an uppercase letter, a lowercase letter, and a digit.
                </p>
              )}
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
                  {isSignUpMode ? 'Create Account' : 'Sign In'} <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsSignUpMode(!isSignUpMode)}
                className="text-xs text-blue-600 hover:underline font-medium"
              >
                {isSignUpMode
                  ? 'Already have an account? Sign In'
                  : "New here? Create an account"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
