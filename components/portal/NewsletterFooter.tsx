'use client';

import React, { useState } from 'react';
import { subscribeNewsletter } from '@/app/actions/portal';
import { toast } from 'sonner';
import { Mail, Send, Loader2, Heart, ShieldCheck } from 'lucide-react';
import Image from 'next/image';

export function NewsletterFooter() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      const res = await subscribeNewsletter(email);
      if (res.success) {
        toast.success('Thank you for subscribing to Vidya placement updates!');
        setEmail('');
      } else {
        toast.error(res.error || 'Failed to subscribe.');
      }
    } catch {
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-gray-900 text-white mt-16 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Image src="/images/image.png" alt="Vidya Logo" width={36} height={36} className="bg-white rounded-lg p-1" />
              <div>
                <p className="font-bold text-white leading-tight">Vidya VPMS</p>
                <p className="text-xs text-blue-400 font-medium">Student Career Portal</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Empowering students from underserved communities with industry skills, certified placements, and career development support across India.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300">Student Services</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><a href="/portal/jobs" className="hover:text-blue-400 transition-colors">Browse Open Job Listings</a></li>
              <li><a href="/portal/resume" className="hover:text-blue-400 transition-colors">Build Single-Page Resume</a></li>
              <li><a href="/login" className="hover:text-blue-400 transition-colors">Admin Portal Sign In</a></li>
            </ul>
          </div>

          {/* Sectors */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300">Focus Sectors</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>Retail & E-commerce</li>
              <li>BPO & Customer Care</li>
              <li>IT & Software Development</li>
              <li>Banking & Financial Services</li>
            </ul>
          </div>

          {/* Newsletter Subscribe Box */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300">Stay Updated</h4>
            <p className="text-xs text-gray-400">
              Subscribe to get notified about new job openings and campus placement drives.
            </p>
            <form onSubmit={handleSubmit} className="space-y-2">
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="w-full pl-9 pr-3 py-2 text-xs bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <><Send size={14} /> Subscribe Now</>}
              </button>
            </form>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© 2026 Vidya Placement Management System (VPMS). All rights reserved.</p>
          <div className="flex items-center gap-2 text-blue-400">
            <Heart size={14} className="fill-blue-400" /> Empowering certified student placements across India
          </div>
        </div>
      </div>
    </footer>
  );
}
