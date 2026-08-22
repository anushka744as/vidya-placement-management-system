"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { StatusBadge } from "@/components/shared/StatCard";
import {
  fetchStudentProfileByEmail,
  getStudentDocumentSignedUrls,
  updateStudentDocuments,
  ensureStudentLinkedByEmail,
} from "@/app/actions/students";
import { fetchPlacementRecordByEmail } from "@/app/actions/records";
import { fetchApplicationsByEmail, updateApplicationStatus, uploadApplicationProof, getApplicationProofSignedUrls } from "@/app/actions/portal";
import { Student } from "@/lib/supabase/student-types";
import { PlacementRecord } from "@/lib/supabase/types";
import { JobApplication, ApplicationStatus } from "@/lib/supabase/portal-types";
import { MONTHS, BATCH_YEARS } from "@/lib/constants";
import {
  Mail,
  Phone,
  MapPin,
  Download,
  GraduationCap,
  CheckCircle2,
  File,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Briefcase,
  Building2,
  Calendar,
  Clock,
  XCircle,
  Link2Off,
  Upload,
  FileCheck,
  Database,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const APPLICATION_STATUSES: ApplicationStatus[] = [
  "Link Opened",
  "Applied",
  "Shortlisted",
  "Interview Scheduled",
  "Interview Completed",
  "Selected",
  "Rejected",
  "Joined",
  "Not Joined",
];

function toDateTimeLocal(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toDateInput(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function monthYearFromDate(iso?: string | null): { month: string; year: string } {
  if (!iso) return { month: "", year: "" };
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { month: "", year: "" };
  return { month: MONTHS[d.getMonth()], year: String(d.getFullYear()) };
}

function dateFromMonthYear(month: string, year: string): string | null {
  if (!month || !year) return null;
  const monthIndex = MONTHS.indexOf(month as (typeof MONTHS)[number]);
  if (monthIndex === -1) return null;
  return new Date(Number(year), monthIndex, 1).toISOString();
}

function ApplicationRow({ app, onUpdated, initialProofSignedUrl }: { app: JobApplication; onUpdated: (updated: JobApplication) => void; initialProofSignedUrl: string | null }) {
  const [status, setStatus] = useState<ApplicationStatus>(app.status);
  const [interviewDate, setInterviewDate] = useState(toDateTimeLocal(app.interview_date));
  const [adminNotes, setAdminNotes] = useState(app.admin_notes || "");
  const [designation, setDesignation] = useState(app.designation || "");
  const [salaryOffered, setSalaryOffered] = useState(app.salary_offered || "");
  const [joiningDate, setJoiningDate] = useState(toDateInput(app.joining_date));
  const [probationMonth, setProbationMonth] = useState(monthYearFromDate(app.probation_end_date).month);
  const [probationYear, setProbationYear] = useState(monthYearFromDate(app.probation_end_date).year);
  const [isSaving, setIsSaving] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [proofSignedUrl, setProofSignedUrl] = useState<string | null>(initialProofSignedUrl);
  const [isUploadingProof, setIsUploadingProof] = useState(false);
  const proofInputRef = useRef<HTMLInputElement>(null);

  const needsInterviewDate = status === "Interview Scheduled" || status === "Interview Completed";
  const isPlaced = status === "Selected" || status === "Joined";

  useEffect(() => {
    setProofSignedUrl(initialProofSignedUrl);
  }, [initialProofSignedUrl]);

  const handleSave = async () => {
    setIsSaving(true);
    const res = await updateApplicationStatus(app.id, {
      status,
      interview_date: needsInterviewDate && interviewDate ? new Date(interviewDate).toISOString() : app.interview_date,
      admin_notes: adminNotes.trim() || null,
      designation: designation.trim() || null,
      salary_offered: salaryOffered.trim() || null,
      joining_date: joiningDate || null,
      probation_end_date: dateFromMonthYear(probationMonth, probationYear),
    });

    if (res.success && res.data) {
      toast.success("Application updated.");
      onUpdated(res.data);
      setExpanded(false);
    } else {
      toast.error(res.error || "Could not update application.");
    }
    setIsSaving(false);
  };

  const handleAcceptSelfReported = async () => {
    if (!app.self_reported_status) return;
    setIsAccepting(true);
    const res = await updateApplicationStatus(app.id, {
      status: app.self_reported_status,
      interview_date: app.interview_date,
      admin_notes: app.admin_notes,
      designation: app.designation,
      salary_offered: app.salary_offered,
      joining_date: app.joining_date,
      probation_end_date: app.probation_end_date,
    });

    if (res.success && res.data) {
      toast.success(`Accepted student-reported status: ${app.self_reported_status}.`);
      setStatus(res.data.status);
      onUpdated(res.data);
    } else {
      toast.error(res.error || "Could not accept the reported status.");
    }
    setIsAccepting(false);
  };

  const handleProofFileChange = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;

    setIsUploadingProof(true);
    const fd = new FormData();
    fd.append("file", file);

    const res = await uploadApplicationProof(app.id, fd);
    if (res.success && res.data) {
      toast.success("Proof document uploaded.");
      onUpdated(res.data);
      if (res.data.proof_document_url) {
        const signed = await getApplicationProofSignedUrls([res.data.proof_document_url]);
        setProofSignedUrl(signed.urls[res.data.proof_document_url] || null);
      }
    } else {
      toast.error(res.error || "Could not upload proof document.");
    }
    setIsUploadingProof(false);
  };

  return (
    <div className="p-4 bg-gray-50 rounded-xl space-y-3">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-gray-900">{app.job?.title || "Placement Application"}</p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1"><Building2 size={12} /> {app.job?.company_name || "Partner Employer"}</span>
            <span className="flex items-center gap-1"><Calendar size={12} /> Applied {app.applied_at ? new Date(app.applied_at).toLocaleDateString() : "recently"}</span>
            {app.interview_date && (
              <span className="flex items-center gap-1 text-amber-700"><Clock size={12} /> Interview {new Date(app.interview_date).toLocaleString()}</span>
            )}
          </div>
          {app.job?.external_link && (
            <div>
              {app.confirmed_applied_at ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
                  <CheckCircle2 size={10} /> Student confirmed they applied on the company site
                </span>
              ) : app.link_opened_at ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                  <AlertCircle size={10} /> Link opened only — not yet confirmed as applied
                </span>
              ) : null}
            </div>
          )}
          {app.self_reported_at && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-full px-2 py-0.5">
                <AlertCircle size={10} /> Student self-reported: {app.self_reported_status} on {new Date(app.self_reported_at).toLocaleDateString()} — unconfirmed
              </span>
              <button
                type="button"
                onClick={handleAcceptSelfReported}
                disabled={isAccepting}
                className="inline-flex items-center gap-1 text-[10px] font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-full px-2.5 py-0.5 disabled:opacity-60"
              >
                {isAccepting ? <Loader2 size={10} className="animate-spin" /> : <CheckCircle2 size={10} />} Accept
              </button>
            </div>
          )}
          {isPlaced && (
            <div className="flex flex-wrap items-center gap-1.5">
              {app.proof_document_url ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
                  <FileCheck size={10} /> Proof on file
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                  <AlertCircle size={10} /> Proof not yet collected
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <ApplicationStatusBadge status={app.status} />
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="text-xs font-medium text-blue-600 hover:underline"
          >
            {expanded ? "Cancel" : "Update"}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="grid md:grid-cols-2 gap-3 pt-3 border-t border-gray-100">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as ApplicationStatus)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs bg-white">
              {APPLICATION_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          {needsInterviewDate && (
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Interview Date & Time</label>
              <input
                type="datetime-local"
                value={interviewDate}
                onChange={(e) => setInterviewDate(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs bg-white"
              />
            </div>
          )}

          {isPlaced && (
            <>
              <div className="md:col-span-2 pt-2 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-800 mb-2">Placement Details</p>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Designation</label>
                <input value={designation} onChange={(e) => setDesignation(e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs bg-white" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Monthly Salary Offered</label>
                <input value={salaryOffered} onChange={(e) => setSalaryOffered(e.target.value)} placeholder="₹20,000 / month" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs bg-white" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Joining Date</label>
                <input type="date" value={joiningDate} onChange={(e) => setJoiningDate(e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs bg-white" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Probation Period Completion</label>
                <div className="flex gap-2">
                  <select value={probationMonth} onChange={(e) => setProbationMonth(e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs bg-white">
                    <option value="">Month</option>
                    {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <select value={probationYear} onChange={(e) => setProbationYear(e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs bg-white">
                    <option value="">Year</option>
                    {BATCH_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Proof of Joining</label>
                <div
                  onClick={() => proofInputRef.current?.click()}
                  className={`flex items-center gap-2 rounded-lg border border-dashed px-3 py-2 text-xs cursor-pointer transition-colors ${
                    proofSignedUrl ? "border-green-300 bg-green-50/60 text-green-700" : "border-gray-300 bg-white text-gray-500 hover:border-blue-300"
                  }`}
                >
                  <input
                    ref={proofInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => handleProofFileChange(e.target.files)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  {isUploadingProof ? (
                    <Loader2 size={14} className="animate-spin shrink-0" />
                  ) : proofSignedUrl ? (
                    <FileCheck size={14} className="shrink-0" />
                  ) : (
                    <Upload size={14} className="shrink-0" />
                  )}
                  <span className="truncate">{isUploadingProof ? "Uploading..." : proofSignedUrl ? "Proof on file — click to replace" : "Click to upload (offer letter, ID, etc.)"}</span>
                </div>
                {proofSignedUrl && (
                  <a href={proofSignedUrl} target="_blank" rel="noreferrer" className="mt-1 inline-block text-[11px] font-medium text-blue-600 hover:underline">
                    View uploaded proof →
                  </a>
                )}
              </div>
            </>
          )}

          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-medium text-gray-600">Admin Notes (visible reasoning, e.g. rejection note)</label>
            <textarea
              rows={2}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs bg-white"
            />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {isSaving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function docLabel(path: string) {
  const parts = path.split("/").pop() || path;
  return parts.replace(/^(photo|resume|id-proof|certificate)-\d+-/, "");
}

function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  switch (status) {
    case "Link Opened":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 font-bold rounded-full text-xs border border-amber-200">
          <AlertCircle size={12} /> Awaiting Confirmation
        </span>
      );
    case "Applied":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-700 font-bold rounded-full text-xs border border-gray-200">
          <Clock size={12} /> Applied
        </span>
      );
    case "Shortlisted":
    case "Interview Scheduled":
    case "Interview Completed":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 font-bold rounded-full text-xs border border-amber-200">
          <AlertCircle size={12} /> {status}
        </span>
      );
    case "Selected":
    case "Joined":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 font-bold rounded-full text-xs border border-green-200">
          <CheckCircle2 size={12} /> {status}
        </span>
      );
    case "Rejected":
    case "Not Joined":
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
}

function DocumentUploadSlot({
  label,
  studentId,
  fieldName,
  existingUrl,
  multiple,
  onUploaded,
}: {
  label: string;
  studentId: string;
  fieldName: "photo" | "resume" | "id_proof" | "certificates";
  existingUrl: string | null | undefined;
  multiple?: boolean;
  onUploaded: (updated: Student) => void;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    const fd = new FormData();
    if (multiple) {
      Array.from(files).forEach((f) => fd.append("certificates", f));
    } else {
      fd.append(fieldName, files[0]);
    }
    const res = await updateStudentDocuments(studentId, fd);
    if (res.success && res.data) {
      toast.success(`${label} uploaded.`);
      onUploaded(res.data);
    } else {
      toast.error(res.error || `Could not upload ${label}.`);
    }
    setIsUploading(false);
  };

  return (
    <div
      onClick={() => inputRef.current?.click()}
      className={`border-2 border-dashed rounded-2xl p-5 text-center transition-colors cursor-pointer ${
        existingUrl ? "border-green-300 bg-green-50/40" : "border-gray-200 hover:border-blue-300"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        multiple={multiple}
        accept={fieldName === "photo" ? "image/*" : ".pdf,.jpg,.jpeg,.png"}
        className="hidden"
        onChange={(e) => handleSelect(e.target.files)}
        onClick={(e) => e.stopPropagation()}
      />
      {isUploading ? (
        <Loader2 size={22} className="mx-auto animate-spin text-blue-600 mb-2" />
      ) : existingUrl ? (
        <FileCheck size={22} className="mx-auto text-green-600 mb-2" />
      ) : (
        <Upload size={22} className="mx-auto text-gray-400 mb-2" />
      )}
      <p className="text-sm font-medium text-gray-700">{label}</p>
      <p className="text-xs text-gray-400 mt-1">{existingUrl ? "On file — click to replace" : "Click to upload · PDF, JPG, PNG"}</p>
    </div>
  );
}

function RecordProfileContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [student, setStudent] = useState<Student | null>(null);
  const [placementRecord, setPlacementRecord] = useState<PlacementRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [idProofUrl, setIdProofUrl] = useState<string | null>(null);
  const [certificateUrls, setCertificateUrls] = useState<{ path: string; url: string | null }[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [applicationsLinked, setApplicationsLinked] = useState(true);
  const [applicationsLoading, setApplicationsLoading] = useState(true);
  const [proofSignedUrls, setProofSignedUrls] = useState<Record<string, string>>({});

  const loadDocuments = async (s: Student) => {
    setPhotoUrl(null);
    setResumeUrl(null);
    setIdProofUrl(null);
    setCertificateUrls([]);

    const paths = [s.photo_url, s.resume_url, s.id_proof_url, ...(s.certificate_urls || [])].filter(
      (p): p is string => !!p
    );
    if (paths.length === 0) return;

    const { urls } = await getStudentDocumentSignedUrls(paths);
    if (s.photo_url) setPhotoUrl(urls[s.photo_url] || null);
    if (s.resume_url) setResumeUrl(urls[s.resume_url] || null);
    if (s.id_proof_url) setIdProofUrl(urls[s.id_proof_url] || null);
    if (s.certificate_urls?.length) {
      setCertificateUrls(s.certificate_urls.map((path) => ({ path, url: urls[path] || null })));
    }
  };

  useEffect(() => {
    if (!email) {
      setIsLoading(false);
      return;
    }
    (async () => {
      setIsLoading(true);

      const recordRes = await fetchPlacementRecordByEmail(email);
      setPlacementRecord(recordRes.data || null);

      let studentRes = await fetchStudentProfileByEmail(email);
      if (!studentRes.data && recordRes.data) {
        await ensureStudentLinkedByEmail(recordRes.data);
        studentRes = await fetchStudentProfileByEmail(email);
      }

      if (studentRes.data) {
        const s = studentRes.data;
        setStudent(s);
        loadDocuments(s);

        setApplicationsLoading(true);
        const appsRes = await fetchApplicationsByEmail(s.email);
        setApplications(appsRes.data);
        setApplicationsLinked(appsRes.linked);
        setApplicationsLoading(false);

        const proofPaths = appsRes.data.map((a) => a.proof_document_url).filter((p): p is string => !!p);
        if (proofPaths.length > 0) {
          const { urls } = await getApplicationProofSignedUrls(proofPaths);
          setProofSignedUrls(urls);
        }
      }
      setIsLoading(false);
    })();
  }, [email]);

  const timeline = student ? [
    { event: "Profile created", date: student.created_at ? new Date(student.created_at).toLocaleDateString() : "", icon: GraduationCap, color: "blue" },
    ...(student.status === "Placed" ? [{ event: `Placed at ${student.company_placed || "employer"}`, date: student.join_date ? new Date(student.join_date).toLocaleDateString() : "", icon: CheckCircle2, color: "green" }] : []),
  ] : [];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="py-24 text-center flex flex-col items-center justify-center gap-3">
          <Loader2 size={32} className="animate-spin text-blue-600" />
          <p className="text-sm font-medium text-gray-500">Loading profile...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!student) {
    return (
      <DashboardLayout>
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center space-y-4 max-w-lg mx-auto">
          <AlertCircle size={40} className="mx-auto text-amber-500" />
          <h2 className="text-lg font-bold text-gray-800">Profile Not Found</h2>
          <p className="text-xs text-gray-500">No record matches this email.</p>
          <Link href="/dashboard/records" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold">
            <ArrowLeft size={14} /> Back to Placement Records
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const documents = [
    { label: "Resume", url: resumeUrl, present: !!student.resume_url },
    { label: "ID Proof", url: idProofUrl, present: !!student.id_proof_url },
    ...certificateUrls.map((c) => ({ label: docLabel(c.path), url: c.url, present: true })),
  ];

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto animate-fade-in">
        <Link href="/dashboard/records" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-blue-600 transition-colors mb-6">
          <ArrowLeft size={16} /> Back to Placement Records
        </Link>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left - Profile Card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
            {photoUrl ? (
              <img src={photoUrl} alt={student.full_name} className="w-20 h-20 rounded-2xl object-cover mx-auto mb-4" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                {student.full_name?.charAt(0)?.toUpperCase() || "?"}
              </div>
            )}
            <h2 className="text-lg font-bold text-gray-900">{student.full_name}</h2>
            <p className="text-sm text-gray-400 mb-3">{student.preferred_job_role || "No preference set"}</p>
            <div className="flex justify-center mb-5">
              <StatusBadge status={student.status} />
            </div>
            <div className="space-y-2.5 text-left text-sm">
              <div className="flex items-center gap-2 text-gray-600"><Mail size={14} className="text-gray-400" /> {student.email || "—"}</div>
              <div className="flex items-center gap-2 text-gray-600"><Phone size={14} className="text-gray-400" /> {student.phone || "—"}</div>
              <div className="flex items-center gap-2 text-gray-600"><MapPin size={14} className="text-gray-400" /> {student.city || "—"}</div>
            </div>
            {resumeUrl && (
              <a
                href={resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-5 flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
              >
                <Download size={16} /> Resume
              </a>
            )}
          </div>

          {/* Right - Details */}
          <div className="lg:col-span-2 space-y-6">
            {placementRecord && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-900 mb-5 flex items-center gap-2"><Database size={18} className="text-blue-600" /> Placement Record Details</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-5 text-sm">
                  <div><p className="text-xs text-gray-400 mb-1">Age</p><p className="text-gray-800 font-medium">{placementRecord.age ?? "—"}</p></div>
                  <div><p className="text-xs text-gray-400 mb-1">Course</p><p className="text-gray-800 font-medium">{placementRecord.course_name || "—"}</p></div>
                  <div><p className="text-xs text-gray-400 mb-1">Batch Completion</p><p className="text-gray-800 font-medium">{[placementRecord.batch_completion_month, placementRecord.batch_completion_year].filter(Boolean).join(" ") || "—"}</p></div>
                  <div><p className="text-xs text-gray-400 mb-1">Employment Nature</p><p className="text-gray-800 font-medium">{placementRecord.nature_of_employment || "—"}</p></div>
                  <div className="col-span-2 md:col-span-1"><p className="text-xs text-gray-400 mb-1">Source</p><p className="text-gray-800 font-medium capitalize">{placementRecord.source?.replace(/_/g, " ") || "manual"}</p></div>
                  {placementRecord.work_experience && (
                    <div className="col-span-2 md:col-span-3"><p className="text-xs text-gray-400 mb-1">Work Experience</p><p className="text-gray-800 font-medium">{placementRecord.work_experience}</p></div>
                  )}
                  {placementRecord.additional_notes && (
                    <div className="col-span-2 md:col-span-3"><p className="text-xs text-gray-400 mb-1">Additional Notes</p><p className="text-gray-800 font-medium">{placementRecord.additional_notes}</p></div>
                  )}
                </div>
              </div>
            )}

            {/* Personal + Basic Info Combined */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-5">Personal Details</h3>
              <div className="grid grid-cols-2 gap-5 text-sm">
                <div><p className="text-xs text-gray-400 mb-1">Gender</p><p className="text-gray-800 font-medium">{student.gender || "—"}</p></div>
                <div><p className="text-xs text-gray-400 mb-1">Date of Birth</p><p className="text-gray-800 font-medium">{student.date_of_birth || "—"}</p></div>
                <div><p className="text-xs text-gray-400 mb-1">Zone</p><p className="text-gray-800 font-medium">{student.zone || "—"}</p></div>
                <div><p className="text-xs text-gray-400 mb-1">Centre</p><p className="text-gray-800 font-medium">{student.centre || "—"}</p></div>
                <div className="col-span-2"><p className="text-xs text-gray-400 mb-1">Address</p><p className="text-gray-800 font-medium">{student.address || "—"}</p></div>
              </div>
            </div>

            {/* Education + Skills Combined */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-5">Education & Skills</h3>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <GraduationCap size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{student.qualification || "Not specified"}</p>
                  <p className="text-xs text-gray-400">{student.institution || "Highest Qualification"}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-2">Skills</p>
                <div className="flex flex-wrap gap-2">
                  {(student.skills || []).map((skill, i) => (
                    <span key={i} className="px-3 py-1.5 bg-gray-50 text-gray-700 text-xs font-medium rounded-lg">{skill}</span>
                  ))}
                  {(!student.skills || student.skills.length === 0) && <p className="text-sm text-gray-400">No skills recorded.</p>}
                </div>
              </div>
            </div>

            {/* Job Preferences */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-5">Job Preferences</h3>
              <div className="grid grid-cols-3 gap-5 text-sm">
                <div><p className="text-xs text-gray-400 mb-1">Preference</p><p className="text-gray-800 font-medium">{student.preferred_job_role || "—"}</p></div>
                <div><p className="text-xs text-gray-400 mb-1">Salary Exp.</p><p className="text-gray-800 font-medium">{student.salary_expectation || "—"}</p></div>
                <div><p className="text-xs text-gray-400 mb-1">Travel</p><p className="text-gray-800 font-medium">{student.travel_preference || "—"}</p></div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-5">Placement Timeline</h3>
              <div className="space-y-4">
                {timeline.map((t, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        t.color === "blue" ? "bg-blue-50 text-blue-600" : "bg-green-50 text-green-600"
                      }`}>
                        <t.icon size={16} />
                      </div>
                      {i < timeline.length - 1 && <div className="w-0.5 h-6 bg-gray-100 mt-1" />}
                    </div>
                    <div className="pt-1">
                      <p className="text-sm font-medium text-gray-800">{t.event}</p>
                      <p className="text-xs text-gray-400">{t.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Job Applications */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2"><Briefcase size={18} className="text-blue-600" /> Job Applications</h3>
                {applications.length > 0 && (
                  <span className="text-xs font-semibold px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
                    {applications.length} total
                  </span>
                )}
              </div>

              {applicationsLoading ? (
                <div className="py-8 text-center">
                  <Loader2 size={22} className="mx-auto animate-spin text-blue-600" />
                </div>
              ) : !applicationsLinked ? (
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl text-sm text-gray-500">
                  <Link2Off size={18} className="text-gray-400 shrink-0 mt-0.5" />
                  <span>No student portal account found for <span className="font-medium text-gray-700">{student.email || "this email"}</span> yet. Applications will appear here once the student signs up and applies from the portal.</span>
                </div>
              ) : applications.length === 0 ? (
                <p className="text-sm text-gray-400">No job applications submitted yet.</p>
              ) : (
                <div className="space-y-3">
                  {applications.map((app) => (
                    <ApplicationRow
                      key={app.id}
                      app={app}
                      initialProofSignedUrl={app.proof_document_url ? proofSignedUrls[app.proof_document_url] || null : null}
                      onUpdated={(updated) => setApplications((prev) => prev.map((a) => (a.id === updated.id ? { ...a, ...updated } : a)))}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Documents */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-5">Documents</h3>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <DocumentUploadSlot label="Photo" studentId={student.id} fieldName="photo" existingUrl={student.photo_url} onUploaded={(s) => { setStudent(s); loadDocuments(s); }} />
                <DocumentUploadSlot label="Resume" studentId={student.id} fieldName="resume" existingUrl={student.resume_url} onUploaded={(s) => { setStudent(s); loadDocuments(s); }} />
                <DocumentUploadSlot label="ID Proof" studentId={student.id} fieldName="id_proof" existingUrl={student.id_proof_url} onUploaded={(s) => { setStudent(s); loadDocuments(s); }} />
                <DocumentUploadSlot label="Certificates" studentId={student.id} fieldName="certificates" multiple existingUrl={student.certificate_urls?.[0]} onUploaded={(s) => { setStudent(s); loadDocuments(s); }} />
              </div>
              <div className="space-y-2">
                {documents.filter((d) => d.present).map((doc, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <File size={18} className="text-gray-400" />
                    <span className="text-sm text-gray-700 flex-1">{doc.label}</span>
                    {doc.url ? (
                      <a href={doc.url} target="_blank" rel="noreferrer" title="Download">
                        <Download size={16} className="text-blue-600 cursor-pointer" />
                      </a>
                    ) : (
                      <Loader2 size={16} className="text-gray-300 animate-spin" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function RecordProfilePage() {
  return (
    <Suspense fallback={<DashboardLayout><div className="max-w-4xl mx-auto animate-fade-in" /></DashboardLayout>}>
      <RecordProfileContent />
    </Suspense>
  );
}
