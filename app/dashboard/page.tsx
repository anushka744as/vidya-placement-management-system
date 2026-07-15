"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { StatCard, StatusBadge } from "@/components/shared/StatCard";
import {
  Users,
  Award,
  Briefcase,
  CheckCircle2,
  ArrowRight,
  Clock,
} from "lucide-react";
import {
  mockStats,
  mockPlacementTrend,
  mockPlacementByCenter,
  mockRecentApplications,
  mockUpcomingInterviews,
} from "@/lib/mock-data";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-1">Welcome back, here's what's happening.</p>
        </div>

        {/* 4 Key Stats Only */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard label="Total Students" value={mockStats.totalStudents.toLocaleString()} icon={Users} trend="+12%" color="blue" />
          <StatCard label="Active Jobs" value={mockStats.activeJobs} icon={Briefcase} trend="+15%" color="orange" />
          <StatCard label="Placed Students" value={mockStats.placedStudents.toLocaleString()} icon={CheckCircle2} trend="+18%" color="green" />
          <StatCard label="Certified" value={mockStats.certifiedStudents.toLocaleString()} icon={Award} trend="+8%" color="purple" />
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-6">Placement Trend</h3>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={mockPlacementTrend} margin={{ left: -20, right: 10, top: 5 }}>
                <defs>
                  <linearGradient id="gradPlaced" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB", fontSize: 12 }} />
                <Area type="monotone" dataKey="placed" stroke="#2563EB" strokeWidth={2.5} fill="url(#gradPlaced)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-6">By Center</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={mockPlacementByCenter} layout="vertical" margin={{ left: 0, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <YAxis dataKey="center" type="category" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} width={70} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB", fontSize: 12 }} cursor={{ fill: "#F9FAFB" }} />
                <Bar dataKey="placed" fill="#F97316" radius={[0, 6, 6, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Applications + Upcoming Interviews */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-gray-900">Recent Applications</h3>
              <button className="text-xs text-blue-600 font-medium flex items-center gap-1 hover:gap-2 transition-all">
                View All <ArrowRight size={14} />
              </button>
            </div>
            <div className="space-y-1">
              {mockRecentApplications.slice(0, 4).map((app, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 px-2 -mx-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{app.student}</p>
                    <p className="text-xs text-gray-400 truncate">{app.job} · {app.company}</p>
                  </div>
                  <StatusBadge status={app.status} />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-gray-900">Upcoming Interviews</h3>
              <span className="text-xs text-gray-400">{mockUpcomingInterviews.length} scheduled</span>
            </div>
            <div className="space-y-1">
              {mockUpcomingInterviews.map((iv, i) => (
                <div key={i} className="flex items-center gap-4 py-2.5 px-2 -mx-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-11 h-11 rounded-xl bg-blue-50 flex flex-col items-center justify-center shrink-0">
                    <span className="text-[10px] text-blue-500 font-medium">{iv.date.split(" ")[0]}</span>
                    <span className="text-base font-bold text-blue-600 leading-none">{iv.date.split(" ")[1]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{iv.student}</p>
                    <p className="text-xs text-gray-400 truncate">{iv.role} · {iv.company}</p>
                  </div>
                  <p className="text-xs text-gray-500 flex items-center gap-1 shrink-0">
                    <Clock size={12} /> {iv.time}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
