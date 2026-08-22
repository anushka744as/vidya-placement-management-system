'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { StudentLayout } from '@/components/portal/StudentLayout';
import { useAuth } from '@/components/auth/AuthProvider';
import { fetchJobById, applyForJob, fetchStudentApplications, fetchResumeProfile } from '@/app/actions/portal';
import { Job, JobApplication } from '@/lib/supabase/portal-types';
import { formatSalary } from '@/lib/utils';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Building2,
  MapPin,
  DollarSign,
  Briefcase,
  CheckCircle2,
  FileText,
  Loader2,
  AlertCircle,
  GraduationCap,
  ExternalLink,
  HelpCircle,
} from 'lucide-react';

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user } = useAuth();

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [application, setApplication] = useState<JobApplication | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [showResumeNudgeModal, setShowResumeNudgeModal] = useState(false);
  const [awaitingSelfReport, setAwaitingSelfReport] = useState(false);

  const hasApplied = !!application;

  useEffect(() => {
    async function loadJobDetails() {
      setLoading(true);
      try {
        const res = await fetchJobById(resolvedParams.id);
        if (res.data) {
          setJob(res.data);
        } else {
          toast.error(res.error || 'Job not found');
        }

        // Check if student already applied to this job
        if (user?.id) {
          const appsRes = await fetchStudentApplications(user.id);
          const matched = appsRes.data.find((a) => a.job_id === resolvedParams.id);
          if (matched) {
            setApplication(matched);
          }
        }
      } catch {
        toast.error('Failed to load job details.');
      } finally {
        setLoading(false);
      }
    }

    loadJobDetails();
  }, [resolvedParams.id, user?.id]);

  const handleApplyClick = async () => {
    if (!user?.id) {
      toast.error('Please sign in to apply for this job.');
      router.push('/portal/login');
      return;
    }

    // For jobs with an external application link, we can't verify the student actually
    // applied on the company's site. So we only open the link and ask them to self-report
    // afterwards — no application record is created until they confirm they've applied.
    if (job?.external_link) {
      window.open(job.external_link, '_blank', 'noopener,noreferrer');
      setAwaitingSelfReport(true);
      return;
    }

    setApplying(true);

    try {
      const res = await applyForJob(resolvedParams.id, user.id, {});

      if (res.success) {
        if (res.data) setApplication(res.data);
        toast.success(`Application submitted for "${job?.title}"!`);

        // Check if student has a resume profile setup
        const resumeRes = await fetchResumeProfile(user.id);
        if (!resumeRes.data || !resumeRes.data.full_name) {
          // Gently nudge toward resume builder
          setShowResumeNudgeModal(true);
        }
      } else {
        toast.error(res.error || 'Could not submit application');
      }
    } catch (err: any) {
      toast.error(err.message || 'Application failed');
    } finally {
      setApplying(false);
    }
  };

  const handleConfirmApplied = async () => {
    if (!user?.id) return;
    setConfirming(true);
    try {
      const res = await applyForJob(resolvedParams.id, user.id, { selfConfirmedExternal: true });
      if (res.success && res.data) {
        setApplication(res.data);
        setAwaitingSelfReport(false);
        toast.success('Thanks for confirming! This application now shows in My Applications.');

        const resumeRes = await fetchResumeProfile(user.id);
        if (!resumeRes.data || !resumeRes.data.full_name) {
          setShowResumeNudgeModal(true);
        }
      } else {
        toast.error(res.error || 'Could not confirm application.');
      }
    } finally {
      setConfirming(false);
    }
  };

  const handleNotApplied = () => {
    setAwaitingSelfReport(false);
    toast.info('No problem — come back and let us know once you\'ve applied.');
  };

  if (loading) {
    return (
      <StudentLayout>
        <div className="py-24 text-center flex flex-col items-center justify-center gap-3">
          <Loader2 size={32} className="animate-spin text-blue-600" />
          <p className="text-sm font-medium text-gray-500">Loading job details...</p>
        </div>
      </StudentLayout>
    );
  }

  if (!job) {
    return (
      <StudentLayout>
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center space-y-4 max-w-lg mx-auto">
          <AlertCircle size={40} className="mx-auto text-amber-500" />
          <h2 className="text-lg font-bold text-gray-800">Job Posting Not Found</h2>
          <p className="text-xs text-gray-500">The job listing you are trying to view is no longer available.</p>
          <Link
            href="/portal/jobs"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold"
          >
            <ArrowLeft size={14} /> Back to Open Jobs
          </Link>
        </div>
      </StudentLayout>
    );
  }

  const requirementsList = Array.isArray(job.requirements)
    ? job.requirements
    : typeof job.requirements === 'string'
    ? job.requirements.split('\n').filter(Boolean)
    : [];

  return (
    <StudentLayout>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        {/* Back Link */}
        <Link
          href="/portal/jobs"
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Job Listings
        </Link>

        {/* Job Header Card */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-gray-100 pb-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
                  {job.sector}
                </span>
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full ${
                    job.job_type === 'Full-Time'
                      ? 'bg-blue-50 text-blue-700 border border-blue-100'
                      : job.job_type === 'Internship'
                      ? 'bg-purple-50 text-purple-700 border border-purple-100'
                      : 'bg-amber-50 text-amber-700 border border-amber-100'
                  }`}
                >
                  {job.job_type}
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 bg-green-50 text-green-700 rounded-md border border-green-200">
                  Status: {job.status}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">{job.title}</h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
                <span className="font-semibold text-gray-900 flex items-center gap-1.5">
                  <Building2 size={16} className="text-gray-400" /> {job.company_name}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin size={16} className="text-gray-400" /> {job.location || `${job.city}, ${job.zone}`}
                </span>
                <span className="font-bold text-green-700 flex items-center gap-1.5">
                  <DollarSign size={16} className="text-green-600" /> Monthly Salary: {formatSalary(job.salary_range)}
                </span>
              </div>
            </div>

            {/* Apply Action Button */}
            <div className="shrink-0">
              {hasApplied && application?.status === 'Applied' ? (
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-50 border border-green-200 text-green-700 font-bold rounded-2xl text-sm shadow-2xs">
                  <CheckCircle2 size={18} /> Applied ✓
                </div>
              ) : awaitingSelfReport ? (
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-amber-50 border border-amber-200 text-amber-700 font-bold rounded-2xl text-sm shadow-2xs">
                  <HelpCircle size={18} /> Awaiting Confirmation
                </div>
              ) : (
                <div className="flex flex-col items-end gap-1.5">
                  <button
                    onClick={handleApplyClick}
                    disabled={applying || job.status === 'Closed'}
                    className="w-full md:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {applying ? (
                      <>
                        <Loader2 size={18} className="animate-spin" /> Submitting Application...
                      </>
                    ) : job.external_link ? (
                      <>
                        <ExternalLink size={18} /> Apply for Position
                      </>
                    ) : (
                      <>
                        <Briefcase size={18} /> Apply for Position
                      </>
                    )}
                  </button>
                  {job.external_link && (
                    <p className="text-[10px] text-gray-400 text-right max-w-[220px]">You'll be redirected to the company's original listing to finish applying.</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Self-Reported External Application Confirmation */}
          {awaitingSelfReport && !hasApplied && (
            <div className="flex flex-col gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
              <div className="flex items-start gap-2.5 text-xs text-amber-800">
                <HelpCircle size={16} className="shrink-0 mt-0.5" />
                <span>
                  We opened {job.company_name}'s application link for you, but this doesn't count as applied yet. <span className="font-bold">Have you finished applying there?</span> This application will only show in My Applications and to the placement team once you confirm.
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleConfirmApplied}
                  disabled={confirming}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {confirming ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} Yes, I've Applied
                </button>
                <button
                  onClick={() => window.open(job.external_link, '_blank', 'noopener,noreferrer')}
                  className="px-4 py-2 bg-white border border-amber-300 text-amber-700 rounded-xl text-xs font-bold hover:bg-amber-100 transition-all flex items-center gap-2"
                >
                  <ExternalLink size={14} /> Reopen Application Link
                </button>
                <button
                  onClick={handleNotApplied}
                  disabled={confirming}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-100 transition-all disabled:opacity-50"
                >
                  No, not yet
                </button>
              </div>
            </div>
          )}
          {hasApplied && job.external_link && application?.status === 'Applied' && application?.confirmed_applied_at && (
            <div className="flex items-center gap-2.5 p-3 bg-green-50 border border-green-200 rounded-xl text-xs text-green-700">
              <CheckCircle2 size={16} className="shrink-0" />
              <span>You confirmed on {new Date(application.confirmed_applied_at).toLocaleDateString()} that you completed this application on {job.company_name}'s site.</span>
            </div>
          )}

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50/80 p-4 rounded-2xl border border-gray-100 text-xs">
            <div>
              <p className="text-gray-400 font-semibold uppercase text-[10px]">Zone</p>
              <p className="font-bold text-gray-800 mt-0.5">{job.zone}</p>
            </div>
            <div>
              <p className="text-gray-400 font-semibold uppercase text-[10px]">City</p>
              <p className="font-bold text-gray-800 mt-0.5">{job.city}</p>
            </div>
            <div>
              <p className="text-gray-400 font-semibold uppercase text-[10px]">Employment Type</p>
              <p className="font-bold text-blue-700 mt-0.5">{job.job_type}</p>
            </div>
            <div>
              <p className="text-gray-400 font-semibold uppercase text-[10px]">Posted Date</p>
              <p className="font-bold text-gray-800 mt-0.5">
                {job.created_at ? new Date(job.created_at).toLocaleDateString() : 'Recently'}
              </p>
            </div>
          </div>

          {/* Description Section */}
          <div className="space-y-3 pt-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900 border-l-4 border-blue-600 pl-3">
              Job Description
            </h2>
            <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">{job.description}</p>
          </div>

          {/* Requirements Section */}
          {requirementsList.length > 0 && (
            <div className="space-y-3 pt-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900 border-l-4 border-orange-500 pl-3">
                Key Requirements & Qualifications
              </h2>
              <ul className="space-y-2 text-xs text-gray-700">
                {requirementsList.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="text-green-600 shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Bottom Action Footer */}
          <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-400">
              Verified placement opportunity by Vidya Placement Management System.
            </p>
            {hasApplied ? (
              <Link
                href="/portal/applications"
                className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
              >
                Track Status in My Applications →
              </Link>
            ) : (
              <button
                onClick={handleApplyClick}
                disabled={applying}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all disabled:opacity-50"
              >
                Submit Application
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Gentle Resume Nudge Modal */}
      {showResumeNudgeModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center space-y-5 border border-gray-100 shadow-xl animate-fade-in">
            <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
              <GraduationCap size={30} />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-gray-900">Application Submitted!</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Your application for <span className="font-bold text-gray-800">{job.title}</span> has been logged.
                To increase your chances of selection, set up your digital resume in the Resume Builder.
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Link
                href="/portal/resume"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-xs transition-all flex items-center justify-center gap-2"
              >
                <FileText size={16} /> Complete My Resume Profile Now
              </Link>

              <button
                onClick={() => setShowResumeNudgeModal(false)}
                className="w-full py-2.5 text-xs text-gray-500 hover:text-gray-800 font-medium"
              >
                I'll complete it later
              </button>
            </div>
          </div>
        </div>
      )}
    </StudentLayout>
  );
}
