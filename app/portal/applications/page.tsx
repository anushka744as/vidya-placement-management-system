'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { StudentLayout } from '@/components/portal/StudentLayout';
import { useAuth } from '@/components/auth/AuthProvider';
import { fetchStudentApplications } from '@/app/actions/portal';
import { JobApplication, ApplicationStatus } from '@/lib/supabase/portal-types';
import {
  Briefcase,
  Building2,
  Calendar,
  Clock,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Sparkles,
} from 'lucide-react';

export default function MyApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadApplications() {
      setLoading(true);
      const studentUserId = user?.id || 'demo-student-id';
      try {
        const res = await fetchStudentApplications(studentUserId);
        setApplications(res.data);
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    }

    loadApplications();
  }, [user?.id]);

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'Applied':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-700 font-bold rounded-full text-xs border border-gray-200">
            <Clock size={12} /> Applied
          </span>
        );

      case 'Shortlisted':
      case 'Interview Scheduled':
      case 'Interview Completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 font-bold rounded-full text-xs border border-amber-200">
            <AlertCircle size={12} /> {status}
          </span>
        );

      case 'Selected':
      case 'Joined':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 font-bold rounded-full text-xs border border-green-200">
            <CheckCircle2 size={12} /> {status}
          </span>
        );

      case 'Rejected':
      case 'Not Joined':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 font-bold rounded-full text-xs border border-red-200">
            <XCircle size={12} /> {status}
          </span>
        );

      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-700 font-bold rounded-full text-xs">
            {status}
          </span>
        );
    }
  };

  return (
    <StudentLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="border-b border-gray-100 pb-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Briefcase className="text-blue-600" size={26} /> My Job Applications
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Track real-time placement status updates from Vidya placement officers.
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
            Total Applications: {applications.length}
          </span>
        </div>

        {/* Applications List */}
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
            <Loader2 size={32} className="animate-spin text-blue-600" />
            <p className="text-sm font-medium text-gray-500">Loading your applications...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center space-y-4 max-w-md mx-auto shadow-sm">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
              <Briefcase size={32} />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-gray-800">You haven't applied to any jobs yet</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Browse our open placement listings and submit your application with a single click.
              </p>
            </div>
            <Link
              href="/portal/jobs"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all"
            >
              Browse Open Jobs <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => {
              const jobTitle = app.job?.title || 'Placement Application';
              const companyName = app.job?.company_name || 'Partner Employer';

              return (
                <div
                  key={app.id}
                  className="bg-white rounded-2xl border border-gray-100 p-6 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-gray-900">{jobTitle}</h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                      <span className="font-semibold text-gray-700 flex items-center gap-1.5">
                        <Building2 size={14} className="text-gray-400" /> {companyName}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-gray-400" /> Applied:{' '}
                        {app.applied_at ? new Date(app.applied_at).toLocaleDateString() : 'Recently'}
                      </span>
                    </div>
                  </div>

                  {/* Right Status Badge */}
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Current Status</p>
                      {getStatusBadge(app.status)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
