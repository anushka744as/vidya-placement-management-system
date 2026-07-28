'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Bell, Briefcase, Building2 } from 'lucide-react';
import { fetchOpenJobs } from '@/app/actions/portal';
import { Job } from '@/lib/supabase/portal-types';
import { useAuth } from '@/components/auth/AuthProvider';

const POLL_INTERVAL_MS = 60_000;

function lastSeenKey(userId: string) {
  return `vpms_jobs_last_seen_${userId}`;
}

export function JobNotificationBell() {
  const { user } = useAuth();
  const [newJobs, setNewJobs] = useState<Job[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user?.id) return;

    let cancelled = false;

    async function checkForNewJobs() {
      const res = await fetchOpenJobs({});
      if (cancelled) return;

      const key = lastSeenKey(user!.id);
      const stored = localStorage.getItem(key);

      if (!stored) {
        // First time ever seeing the bell — establish a baseline, don't backlog-spam.
        localStorage.setItem(key, new Date().toISOString());
        setNewJobs([]);
        return;
      }

      const lastSeen = new Date(stored);
      const fresh = res.data.filter((job) => job.created_at && new Date(job.created_at) > lastSeen);
      setNewJobs(fresh);
    }

    checkForNewJobs();
    const interval = setInterval(checkForNewJobs, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [user?.id]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    setOpen((prev) => !prev);
    if (!open && user?.id) {
      // Mark as seen once they open the dropdown; the snapshot in state keeps showing until they navigate away.
      localStorage.setItem(lastSeenKey(user.id), new Date().toISOString());
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={handleToggle}
        className="relative p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
        title="New job postings"
      >
        <Bell size={18} />
        {newJobs.length > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {newJobs.length > 9 ? '9+' : newJobs.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white rounded-2xl border border-gray-100 shadow-xl z-50 animate-fade-in">
          <div className="p-3 border-b border-gray-100">
            <p className="text-xs font-bold text-gray-800">New Job Postings</p>
          </div>
          {newJobs.length === 0 ? (
            <div className="p-6 text-center">
              <Briefcase size={24} className="mx-auto text-gray-300 mb-2" />
              <p className="text-xs text-gray-400">No new postings since your last visit.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {newJobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/portal/jobs/${job.id}`}
                  onClick={() => setOpen(false)}
                  className="block p-3 hover:bg-gray-50 transition-colors"
                >
                  <p className="text-xs font-bold text-gray-900 line-clamp-1">{job.title}</p>
                  <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                    <Building2 size={11} /> {job.company_name}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
