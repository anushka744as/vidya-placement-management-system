"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/shared/StatCard";
import {
  Users,
  Briefcase,
  CheckCircle2,
  Building2,
  Loader2,
  Clock,
  XCircle,
  AlertCircle,
  X,
  MapPin,
} from "lucide-react";
import {
  fetchDashboardStats,
  DashboardStats,
  fetchApplicationPipelineCounts,
  ApplicationPipelineCounts,
  fetchTotalStudentsList,
  fetchActiveJobsList,
  StudentListItem,
  ActiveJobListItem,
} from "@/app/actions/dashboard";
import { fetchRecentApplicationsAdmin, RecentApplicationSummary, fetchApplicationsByStatuses, ApplicationGroupItem } from "@/app/actions/portal";
import { ApplicationStatus } from "@/lib/supabase/portal-types";
import { useEffect, useState } from "react";
import Link from "next/link";

type ModalKind = "students" | "jobs" | null;
type PipelineKind = "shortlisted" | "interview" | "selected" | "rejected" | null;

const PIPELINE_STATUSES: Record<Exclude<PipelineKind, null>, ApplicationStatus[]> = {
  shortlisted: ["Shortlisted"],
  interview: ["Interview Scheduled", "Interview Completed"],
  selected: ["Selected", "Joined"],
  rejected: ["Rejected", "Not Joined"],
};

const PIPELINE_LABELS: Record<Exclude<PipelineKind, null>, string> = {
  shortlisted: "Shortlisted",
  interview: "Interview Stage",
  selected: "Selected",
  rejected: "Rejected",
};

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-gray-100 shadow-xl animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 sticky top-0 bg-white">
          <h3 className="text-base font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pipeline, setPipeline] = useState<ApplicationPipelineCounts | null>(null);
  const [recentApplications, setRecentApplications] = useState<RecentApplicationSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [activeModal, setActiveModal] = useState<ModalKind>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [studentsList, setStudentsList] = useState<StudentListItem[] | null>(null);
  const [jobsList, setJobsList] = useState<ActiveJobListItem[] | null>(null);

  const [activePipeline, setActivePipeline] = useState<PipelineKind>(null);
  const [pipelineLoading, setPipelineLoading] = useState(false);
  const [pipelineLists, setPipelineLists] = useState<Partial<Record<Exclude<PipelineKind, null>, ApplicationGroupItem[]>>>({});

  useEffect(() => {
    Promise.all([fetchDashboardStats(), fetchApplicationPipelineCounts(), fetchRecentApplicationsAdmin(5)]).then(([statsRes, pipelineRes, appsRes]) => {
      setStats(statsRes.data);
      setPipeline(pipelineRes.data);
      setRecentApplications(appsRes.data);
      setIsLoading(false);
    });
  }, []);

  const openStudents = async () => {
    setActiveModal("students");
    if (studentsList) return;
    setModalLoading(true);
    const res = await fetchTotalStudentsList();
    setStudentsList(res.data);
    setModalLoading(false);
  };

  const openJobs = async () => {
    setActiveModal("jobs");
    if (jobsList) return;
    setModalLoading(true);
    const res = await fetchActiveJobsList();
    setJobsList(res.data);
    setModalLoading(false);
  };

  const openPipeline = async (kind: Exclude<PipelineKind, null>) => {
    setActivePipeline(kind);
    if (pipelineLists[kind]) return;
    setPipelineLoading(true);
    const res = await fetchApplicationsByStatuses(PIPELINE_STATUSES[kind]);
    setPipelineLists((prev) => ({ ...prev, [kind]: res.data }));
    setPipelineLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-1">Welcome back, here's what's happening.</p>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-2 gap-5">
          <StatCard label="Total Students" value={isLoading ? "—" : (stats?.totalStudents ?? 0).toLocaleString()} icon={Users} color="blue" onClick={openStudents} />
          <StatCard label="Active Jobs" value={isLoading ? "—" : (stats?.activeJobs ?? 0).toLocaleString()} icon={Briefcase} color="orange" onClick={openJobs} />
        </div>

        {/* Application Pipeline */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-gray-900">Application Pipeline</h3>
            {!isLoading && (pipeline?.pendingSelfReports ?? 0) > 0 && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
                <AlertCircle size={12} /> {pipeline!.pendingSelfReports} student-reported update{pipeline!.pendingSelfReports === 1 ? "" : "s"} awaiting confirmation
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            <button
              type="button"
              onClick={() => openPipeline("shortlisted")}
              className="flex items-center gap-3 p-4 bg-amber-50/60 border border-amber-100 rounded-xl text-left cursor-pointer hover:shadow-md hover:border-amber-200 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0"><Clock size={18} /></div>
              <div>
                <p className="text-xl font-bold text-gray-900">{isLoading ? "—" : pipeline?.shortlisted ?? 0}</p>
                <p className="text-xs text-gray-500">Shortlisted</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => openPipeline("interview")}
              className="flex items-center gap-3 p-4 bg-amber-50/60 border border-amber-100 rounded-xl text-left cursor-pointer hover:shadow-md hover:border-amber-200 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0"><Clock size={18} /></div>
              <div>
                <p className="text-xl font-bold text-gray-900">{isLoading ? "—" : pipeline?.interview ?? 0}</p>
                <p className="text-xs text-gray-500">Interview Stage</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => openPipeline("selected")}
              className="flex items-center gap-3 p-4 bg-green-50/60 border border-green-100 rounded-xl text-left cursor-pointer hover:shadow-md hover:border-green-200 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-green-100 text-green-700 flex items-center justify-center shrink-0"><CheckCircle2 size={18} /></div>
              <div>
                <p className="text-xl font-bold text-gray-900">{isLoading ? "—" : pipeline?.selected ?? 0}</p>
                <p className="text-xs text-gray-500">Selected</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => openPipeline("rejected")}
              className="flex items-center gap-3 p-4 bg-red-50/60 border border-red-100 rounded-xl text-left cursor-pointer hover:shadow-md hover:border-red-200 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0"><XCircle size={18} /></div>
              <div>
                <p className="text-xl font-bold text-gray-900">{isLoading ? "—" : pipeline?.rejected ?? 0}</p>
                <p className="text-xs text-gray-500">Rejected</p>
              </div>
            </button>
          </div>
        </div>

        {/* Recent Applications */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-gray-900">Recent Applications</h3>
          </div>

          {isLoading ? (
            <div className="py-8 text-center">
              <Loader2 size={22} className="mx-auto animate-spin text-blue-600" />
            </div>
          ) : recentApplications.length === 0 ? (
            <p className="text-sm text-gray-400 py-4">No applications submitted yet.</p>
          ) : (
            <div className="space-y-1">
              {recentApplications.map((app) => (
                <div key={app.id} className="flex items-center justify-between py-2.5 px-2 -mx-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{app.student_name}</p>
                    <p className="text-xs text-gray-400 truncate flex items-center gap-1">
                      <Building2 size={11} className="shrink-0" /> {app.job_title} · {app.company_name}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 shrink-0 ml-3">
                    {app.applied_at ? new Date(app.applied_at).toLocaleDateString() : "Recently"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Total Students Modal */}
      {activeModal === "students" && (
        <Modal title={`Total Students (${studentsList?.length ?? 0})`} onClose={() => setActiveModal(null)}>
          {modalLoading ? (
            <div className="py-10 text-center"><Loader2 size={24} className="mx-auto animate-spin text-blue-600" /></div>
          ) : !studentsList || studentsList.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">No students found.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {studentsList.map((s) => (
                <Link
                  key={s.id}
                  href={`/dashboard/records/profile?email=${encodeURIComponent(s.email)}`}
                  onClick={() => setActiveModal(null)}
                  className="flex items-center justify-between py-3 px-2 -mx-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{s.full_name}</p>
                    <p className="text-xs text-gray-400 truncate">Email ID: {s.email}</p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    {s.centre && <p className="text-xs text-gray-500 flex items-center gap-1 justify-end"><MapPin size={11} /> {s.centre}</p>}
                    {s.status && <p className="text-xs text-blue-600 font-semibold mt-0.5">{s.status}</p>}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Modal>
      )}

      {/* Active Jobs Modal */}
      {activeModal === "jobs" && (
        <Modal title={`Active Jobs (${jobsList?.length ?? 0})`} onClose={() => setActiveModal(null)}>
          {modalLoading ? (
            <div className="py-10 text-center"><Loader2 size={24} className="mx-auto animate-spin text-blue-600" /></div>
          ) : !jobsList || jobsList.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">No open jobs right now.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {jobsList.map((j) => (
                <Link
                  key={j.id}
                  href="/dashboard/jobs"
                  onClick={() => setActiveModal(null)}
                  className="flex items-center justify-between py-3 px-2 -mx-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{j.title}</p>
                    <p className="text-xs text-gray-400 truncate flex items-center gap-1"><Building2 size={11} /> {j.company_name}</p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    {j.city && <p className="text-xs text-gray-500">{j.city}</p>}
                    {j.job_type && <p className="text-xs text-orange-600 font-semibold mt-0.5">{j.job_type}</p>}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Modal>
      )}

      {/* Application Pipeline Modal */}
      {activePipeline && (
        <Modal
          title={`${PIPELINE_LABELS[activePipeline]} (${pipelineLists[activePipeline]?.length ?? 0})`}
          onClose={() => setActivePipeline(null)}
        >
          {pipelineLoading ? (
            <div className="py-10 text-center"><Loader2 size={24} className="mx-auto animate-spin text-blue-600" /></div>
          ) : !pipelineLists[activePipeline] || pipelineLists[activePipeline]!.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">No applications in this stage right now.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {pipelineLists[activePipeline]!.map((a) => (
                <Link
                  key={a.id}
                  href={a.student_email ? `/dashboard/records/profile?email=${encodeURIComponent(a.student_email)}` : "/dashboard/records"}
                  onClick={() => setActivePipeline(null)}
                  className="flex items-center justify-between py-3 px-2 -mx-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{a.student_name}</p>
                    <p className="text-xs text-gray-400 truncate flex items-center gap-1"><Building2 size={11} /> {a.job_title} · {a.company_name}</p>
                    {activePipeline === "rejected" && a.admin_notes && (
                      <p className="text-xs text-red-600 mt-0.5 truncate">Note: {a.admin_notes}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="text-xs font-semibold text-gray-700">{a.status}</p>
                    {activePipeline === "interview" && a.interview_date && (
                      <p className="text-xs text-gray-500 mt-0.5">{new Date(a.interview_date).toLocaleString()}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Modal>
      )}
    </DashboardLayout>
  );
}
