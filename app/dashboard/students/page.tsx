"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { StatusBadge } from "@/components/shared/StatCard";
import { mockStudents } from "@/lib/mock-data";
import {
  Search,
  Plus,
  Download,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Filter,
  ChevronLeft,
  ChevronRight,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function StudentsPage() {
  const [search, setSearch] = useState("");
  const [course, setCourse] = useState("all");
  const [center, setCenter] = useState("all");
  const [status, setStatus] = useState("all");

  const courses = Array.from(new Set(mockStudents.map((s) => s.course)));
  const centers = Array.from(new Set(mockStudents.map((s) => s.center)));
  const statuses = ["Placed", "Interview", "Shortlisted", "Applied", "Seeking", "Retained"];

  const filtered = mockStudents.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.jobPreference.toLowerCase().includes(search.toLowerCase());
    const matchCourse = course === "all" || s.course === course;
    const matchCenter = center === "all" || s.center === center;
    const matchStatus = status === "all" || s.status === status;
    return matchSearch && matchCourse && matchCenter && matchStatus;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Students</h1>
            <p className="text-sm text-gray-500 mt-0.5">{filtered.length} of {mockStudents.length} students</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <Download size={16} /> Export
            </button>
            <Link
              href="/dashboard/students/new"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-100 transition-all"
            >
              <Plus size={16} /> Add Student
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or job preference..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-200 transition-all"
              />
            </div>
            <select
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer"
            >
              <option value="all">All Courses</option>
              {courses.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select
              value={center}
              onChange={(e) => setCenter(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer"
            >
              <option value="all">All Centers</option>
              {centers.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 border-b border-gray-100 bg-gray-50/50">
                  <th className="px-4 py-3 font-medium">Student</th>
                  <th className="px-4 py-3 font-medium">Course</th>
                  <th className="px-4 py-3 font-medium">Center</th>
                  <th className="px-4 py-3 font-medium">City</th>
                  <th className="px-4 py-3 font-medium">Job Preference</th>
                  <th className="px-4 py-3 font-medium">Salary Exp.</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={s.photo} alt={s.name} className="w-9 h-9 rounded-full object-cover" />
                        <span className="font-medium text-gray-800">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{s.course}</td>
                    <td className="px-4 py-3 text-gray-600">{s.center}</td>
                    <td className="px-4 py-3 text-gray-600">{s.city}</td>
                    <td className="px-4 py-3 text-gray-600">{s.jobPreference}</td>
                    <td className="px-4 py-3 text-gray-600">{s.salaryExpectation}</td>
                    <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/dashboard/students/profile?id=${s.id}`}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                          title="View"
                        >
                          <Eye size={16} />
                        </Link>
                        <Link
                          href={`/dashboard/students/new?id=${s.id}`}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </Link>
                        <button className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty state */}
          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Users size={28} className="text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium">No students found</p>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
            </div>
          )}

          {/* Pagination */}
          {filtered.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <p className="text-xs text-gray-400">Showing 1–{filtered.length} of {filtered.length}</p>
              <div className="flex items-center gap-1">
                <button className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 transition-colors disabled:opacity-50" disabled>
                  <ChevronLeft size={16} />
                </button>
                <button className="w-8 h-8 rounded-lg bg-blue-600 text-white text-xs font-medium">1</button>
                <button className="w-8 h-8 rounded-lg border border-gray-200 text-gray-500 text-xs font-medium hover:bg-gray-50">2</button>
                <button className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 transition-colors">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
