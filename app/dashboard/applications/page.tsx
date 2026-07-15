"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { StatusBadge } from "@/components/shared/StatCard";
import { mockApplications } from "@/lib/mock-data";
import { FileText, Calendar, Building2, IndianRupee, Briefcase } from "lucide-react";

export default function ApplicationsPage() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto animate-fade-in">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track all your job applications in one place</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total", value: mockApplications.length, color: "blue" },
            { label: "Interview", value: mockApplications.filter(a => a.status === "Interview").length, color: "purple" },
            { label: "Joined", value: mockApplications.filter(a => a.status === "Joined").length, color: "green" },
            { label: "Rejected", value: mockApplications.filter(a => a.status === "Rejected").length, color: "red" },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4">
              <p className={`text-2xl font-bold ${
                s.color === "blue" ? "text-blue-600" :
                s.color === "purple" ? "text-purple-600" :
                s.color === "green" ? "text-green-600" : "text-red-500"
              }`}>{s.value}</p>
              <p className="text-sm text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="relative space-y-6">
            {/* Timeline line */}
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-100" />

            {mockApplications.map((app, i) => (
              <div key={app.id} className="relative flex gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 border-4 border-white ${
                  app.status === "Joined" ? "bg-green-500" :
                  app.status === "Selected" ? "bg-green-500" :
                  app.status === "Interview" ? "bg-purple-500" :
                  app.status === "Shortlisted" ? "bg-orange-500" :
                  app.status === "Rejected" ? "bg-red-500" :
                  "bg-blue-500"
                }`}>
                  <FileText size={16} className="text-white" />
                </div>
                <div className="flex-1 bg-gray-50 rounded-2xl p-4 hover:bg-gray-100/70 transition-colors">
                  <div className="flex items-start justify-between flex-wrap gap-2 mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{app.job}</h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5">
                        <Building2 size={14} /> {app.company}
                      </p>
                    </div>
                    <StatusBadge status={app.status} />
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs text-gray-500 pt-2 border-t border-gray-100">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} /> Applied: {app.appliedDate}
                    </span>
                    {app.interviewDate && (
                      <span className="flex items-center gap-1">
                        <Calendar size={12} /> Interview: {app.interviewDate}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <IndianRupee size={12} /> {app.salary}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
