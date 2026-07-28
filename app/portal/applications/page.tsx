'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { StudentLayout } from '@/components/portal/StudentLayout';
import { useAuth } from '@/components/auth/AuthProvider';
import { fetchStudentApplications, confirmJobApplication, reportApplicationStatus, uploadApplicationProof, getApplicationProofSignedUrl } from '@/app/actions/portal';
import { JobApplication, ApplicationStatus } from '@/lib/supabase/portal-types';
import { toast } from 'sonner';
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
  HelpCircle,
  ExternalLink,
  Upload,
  FileCheck,
  Megaphone,
} from 'lucide-react';

const STUDENT_REPORTABLE_STATUSES: ApplicationStatus[] = ['Shortlisted', 'Interview Scheduled', 'Selected', 'Rejected'];

function SelfReportPanel({ app, onUpdated }: { app: JobApplication; onUpdated: (updated: JobApplication) => void }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<ApplicationStatus>('Shortlisted');
  const [interviewDate, setInterviewDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (app.status === 'Not Joined') return null;

  const handleSubmit = async () => {
    setSubmitting(true);
    const iso = status === 'Interview Scheduled' && interviewDate ? new Date(interviewDate).toISOString() : null;
    const res = await reportApplicationStatus(app.id, status, iso);
    if (res.success && res.data) {
      onUpdated(res.data);
      toast.success('Thanks — we let the placement team know.');
      setOpen(false);
    } else {
      toast.error(res.error || 'Could not update your status.');
    }
    setSubmitting(false);
  };

  return (
    <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl space-y-2.5">
      {app.self_reported_at && !open && (
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-blue-700">
          <CheckCircle2 size={12} /> You told us: {app.self_reported_status} on {new Date(app.self_reported_at).toLocaleDateString()} — awaiting confirmation
        </div>
      )}

      {!open ? (
        <button type="button" onClick={() => { setOpen(true); setStatus(app.self_reported_status || 'Shortlisted'); }} className="text-xs font-bold text-blue-700 flex items-center gap-1.5">
          <Megaphone size={14} /> {app.self_reported_at ? 'Update your report' : 'Got an update from the employer? Let us know'}
        </button>
      ) : (
        <>
          <p className="text-xs font-bold text-blue-800">What did the employer tell you?</p>
          <div className="flex flex-wrap gap-2">
            {STUDENT_REPORTABLE_STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  status === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          {status === 'Interview Scheduled' && (
            <div>
              <label className="block text-[11px] font-medium text-gray-600 mb-1">Interview date & time (if you know it)</label>
              <input
                type="datetime-local"
                value={interviewDate}
                onChange={(e) => setInterviewDate(e.target.value)}
                className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs"
              />
            </div>
          )}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 disabled:opacity-60"
            >
              {submitting ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />} Submit Update
            </button>
            <button type="button" onClick={() => setOpen(false)} className="px-3 py-2 text-xs font-medium text-gray-500 hover:text-gray-700">
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function MyApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [proofUrls, setProofUrls] = useState<Record<string, string>>({});
  const [uploadingProofId, setUploadingProofId] = useState<string | null>(null);

  const handleUploadProof = async (applicationId: string, files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;

    setUploadingProofId(applicationId);
    const fd = new FormData();
    fd.append('file', file);

    const res = await uploadApplicationProof(applicationId, fd);
    if (res.success && res.data) {
      setApplications((prev) => prev.map((a) => (a.id === applicationId ? res.data! : a)));
      if (res.data.proof_document_url) {
        const signed = await getApplicationProofSignedUrl(res.data.proof_document_url);
        if (signed.url) setProofUrls((prev) => ({ ...prev, [applicationId]: signed.url! }));
      }
      toast.success('Proof document uploaded — the placement team can now review it.');
    } else {
      toast.error(res.error || 'Could not upload proof document.');
    }
    setUploadingProofId(null);
  };

  const handleConfirm = async (applicationId: string) => {
    setConfirmingId(applicationId);
    try {
      const res = await confirmJobApplication(applicationId);
      if (res.success && res.data) {
        setApplications((prev) => prev.map((a) => (a.id === applicationId ? res.data! : a)));
        toast.success('Thanks for confirming!');
      } else {
        toast.error(res.error || 'Could not confirm application.');
      }
    } finally {
      setConfirmingId(null);
    }
  };

  useEffect(() => {
    async function loadApplications() {
      if (!user?.id) {
        setApplications([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await fetchStudentApplications(user.id);
        setApplications(res.data);

        const withProof = res.data.filter((a) => a.proof_document_url);
        if (withProof.length > 0) {
          const entries = await Promise.all(
            withProof.map(async (a) => {
              const signed = await getApplicationProofSignedUrl(a.proof_document_url!);
              return [a.id, signed.url] as const;
            })
          );
          setProofUrls(Object.fromEntries(entries.filter(([, url]) => !!url)) as Record<string, string>);
        }
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
      case 'Link Opened':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 font-bold rounded-full text-xs border border-amber-200">
            <HelpCircle size={12} /> Awaiting Confirmation
          </span>
        );

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
        ) : !user ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center space-y-4 max-w-md mx-auto shadow-sm">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
              <Briefcase size={32} />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-gray-800">Sign in to see your applications</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Create an account or sign in to track the jobs you've applied to.
              </p>
            </div>
            <Link
              href="/portal/login"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all"
            >
              Sign In <ArrowRight size={14} />
            </Link>
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
              const isInterviewStage = app.status === 'Shortlisted' || app.status === 'Interview Scheduled' || app.status === 'Interview Completed';
              const isRejected = app.status === 'Rejected' || app.status === 'Not Joined';
              const isSuccess = app.status === 'Selected' || app.status === 'Joined';

              return (
                <div
                  key={app.id}
                  className="bg-white rounded-2xl border border-gray-100 p-6 shadow-2xs hover:shadow-md transition-all duration-200 space-y-4"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <h3 className="text-base font-bold text-gray-900">{jobTitle}</h3>
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

                  {app.job?.external_link && app.status === 'Link Opened' && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                      <div className="flex items-start gap-2 text-xs text-amber-800">
                        <HelpCircle size={14} className="shrink-0 mt-0.5" />
                        <span>You opened the link but haven't confirmed. Did you finish applying on {companyName}'s site?</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => window.open(app.job!.external_link, '_blank', 'noopener,noreferrer')}
                          className="px-3 py-1.5 bg-white border border-amber-300 text-amber-700 rounded-lg text-xs font-bold hover:bg-amber-100 transition-all flex items-center gap-1.5"
                        >
                          <ExternalLink size={12} /> Reopen Link
                        </button>
                        <button
                          onClick={() => handleConfirm(app.id)}
                          disabled={confirmingId === app.id}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                        >
                          {confirmingId === app.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />} Yes, I've Applied
                        </button>
                      </div>
                    </div>
                  )}
                  {app.job?.external_link && app.status === 'Applied' && app.confirmed_applied_at && (
                    <div className="flex items-center gap-2 p-2.5 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700">
                      <CheckCircle2 size={13} className="shrink-0" /> Confirmed applied on {companyName}'s site
                    </div>
                  )}

                  {isInterviewStage && app.interview_date && (
                    <div className="flex items-center gap-2.5 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                      <Clock size={14} className="shrink-0" />
                      <span>
                        <span className="font-bold">Interview scheduled:</span>{' '}
                        {new Date(app.interview_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at{' '}
                        {new Date(app.interview_date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}

                  {isRejected && app.admin_notes && (
                    <div className="flex items-start gap-2.5 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                      <XCircle size={14} className="shrink-0 mt-0.5" />
                      <span><span className="font-bold">Note from placement team:</span> {app.admin_notes}</span>
                    </div>
                  )}

                  {isSuccess && (app.designation || app.salary_offered || app.joining_date || app.probation_end_date) && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-green-50 border border-green-200 rounded-xl text-xs text-green-800">
                      {app.designation && <div><p className="font-bold uppercase text-[10px] text-green-600">Designation</p>{app.designation}</div>}
                      {app.salary_offered && <div><p className="font-bold uppercase text-[10px] text-green-600">Salary</p>{app.salary_offered}</div>}
                      {app.joining_date && <div><p className="font-bold uppercase text-[10px] text-green-600">Joining Date</p>{new Date(app.joining_date).toLocaleDateString()}</div>}
                      {app.probation_end_date && (
                        <div>
                          <p className="font-bold uppercase text-[10px] text-green-600">Probation Ends</p>
                          {new Date(app.probation_end_date).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                        </div>
                      )}
                    </div>
                  )}

                  {isSuccess && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl">
                      <div className="flex items-start gap-2 text-xs text-gray-600">
                        {proofUrls[app.id] ? <FileCheck size={14} className="shrink-0 mt-0.5 text-green-600" /> : <Upload size={14} className="shrink-0 mt-0.5" />}
                        <span>
                          {proofUrls[app.id]
                            ? 'Proof of joining uploaded — the placement team has it on file.'
                            : "Upload your offer letter, joining letter, or ID card as proof of joining so the placement team can verify it."}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {proofUrls[app.id] && (
                          <a
                            href={proofUrls[app.id]}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-100 transition-all"
                          >
                            View
                          </a>
                        )}
                        <label className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer">
                          {uploadingProofId === app.id ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                          {proofUrls[app.id] ? 'Replace' : 'Upload Proof'}
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="hidden"
                            disabled={uploadingProofId === app.id}
                            onChange={(e) => handleUploadProof(app.id, e.target.files)}
                          />
                        </label>
                      </div>
                    </div>
                  )}

                  <SelfReportPanel
                    app={app}
                    onUpdated={(updated) => setApplications((prev) => prev.map((a) => (a.id === updated.id ? updated : a)))}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
