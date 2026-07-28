"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/shared/StatCard";
import {
  Users,
  Award,
  Briefcase,
  CheckCircle2,
  Building2,
  Loader2,
  Clock,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { fetchDashboardStats, DashboardStats, fetchApplicationPipelineCounts, ApplicationPipelineCounts } from "@/app/actions/dashboard";
import { fetchRecentApplicationsAdmin, RecentApplicationSummary } from "@/app/actions/portal";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pipeline, setPipeline] = useState<ApplicationPipelineCounts | null>(null);
  const [recentApplications, setRecentApplications] = useState<RecentApplicationSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchDashboardStats(), fetchApplicationPipelineCounts(), fetchRecentApplicationsAdmin(5)]).then(([statsRes, pipelineRes, appsRes]) => {
      setStats(statsRes.data);
      setPipeline(pipelineRes.data);
      setRecentApplications(appsRes.data);
      setIsLoading(false);
    });
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-1">Welcome back, here's what's happening.</p>
        </div>

        {/* 4 Key Stats Only */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard label="Total Students" value={isLoading ? "—" : (stats?.totalStudents ?? 0).toLocaleString()} icon={Users} color="blue" />
          <StatCard label="Active Jobs" value={isLoading ? "—" : (stats?.activeJobs ?? 0).toLocaleString()} icon={Briefcase} color="orange" />
          <StatCard label="Placed Students" value={isLoading ? "—" : (stats?.placedStudents ?? 0).toLocaleString()} icon={CheckCircle2} color="green" />
          <StatCard label="Retained Students" value={isLoading ? "—" : (stats?.retainedStudents ?? 0).toLocaleString()} icon={Award} color="purple" />
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
            <div className="flex items-center gap-3 p-4 bg-amber-50/60 border border-amber-100 rounded-xl">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0"><Clock size={18} /></div>
              <div>
                <p className="text-xl font-bold text-gray-900">{isLoading ? "—" : pipeline?.shortlisted ?? 0}</p>
                <p className="text-xs text-gray-500">Shortlisted</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-amber-50/60 border border-amber-100 rounded-xl">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0"><Clock size={18} /></div>
              <div>
                <p className="text-xl font-bold text-gray-900">{isLoading ? "—" : pipeline?.interview ?? 0}</p>
                <p className="text-xs text-gray-500">Interview Stage</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-green-50/60 border border-green-100 rounded-xl">
              <div className="w-10 h-10 rounded-xl bg-green-100 text-green-700 flex items-center justify-center shrink-0"><CheckCircle2 size={18} /></div>
              <div>
                <p className="text-xl font-bold text-gray-900">{isLoading ? "—" : pipeline?.selected ?? 0}</p>
                <p className="text-xs text-gray-500">Selected</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-red-50/60 border border-red-100 rounded-xl">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0"><XCircle size={18} /></div>
              <div>
                <p className="text-xl font-bold text-gray-900">{isLoading ? "—" : pipeline?.rejected ?? 0}</p>
                <p className="text-xs text-gray-500">Rejected</p>
              </div>
            </div>
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
    </DashboardLayout>
  );
}
