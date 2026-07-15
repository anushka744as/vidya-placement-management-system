"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { mockJobs } from "@/lib/mock-data";
import {
  Search,
  MapPin,
  Briefcase,
  Bookmark,
  ArrowRight,
  Building2,
  Clock,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function JobsPage() {
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("all");
  const [category, setCategory] = useState("all");

  const locations = Array.from(new Set(mockJobs.map((j) => j.location)));
  const categories = Array.from(new Set(mockJobs.map((j) => j.category)));

  const filtered = mockJobs.filter((j) => {
    const matchSearch = j.title.toLowerCase().includes(search.toLowerCase()) || j.company.toLowerCase().includes(search.toLowerCase());
    const matchLocation = location === "all" || j.location === location;
    const matchCategory = category === "all" || j.category === category;
    return matchSearch && matchLocation && matchCategory;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Listings</h1>
          <p className="text-sm text-gray-500 mt-0.5">{filtered.length} jobs available</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search jobs or companies..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-200 transition-all"
              />
            </div>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer"
            >
              <option value="all">All Locations</option>
              {locations.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Job Cards */}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((job) => (
            <div
              key={job.id}
              className="group bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg hover:border-gray-200 transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <img src={job.logo} alt={job.company} className="w-12 h-12 rounded-xl object-cover" />
                  <div>
                    <h3 className="font-semibold text-gray-900 leading-tight">{job.title}</h3>
                    <p className="text-sm text-gray-500">{job.company}</p>
                  </div>
                </div>
                <button className="p-2 rounded-xl hover:bg-gray-50 text-gray-400 hover:text-blue-600 transition-colors">
                  <Bookmark size={18} />
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mb-4 text-xs text-gray-500">
                <span className="flex items-center gap-1 px-2.5 py-1 bg-gray-50 rounded-lg">
                  <MapPin size={12} /> {job.location}
                </span>
                <span className="flex items-center gap-1 px-2.5 py-1 bg-gray-50 rounded-lg">
                  <Briefcase size={12} /> {job.experience}
                </span>
                <span className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg font-medium">
                  {job.salary}
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {job.tags.map((tag, i) => (
                  <span key={i} className="px-2 py-0.5 bg-orange-50 text-orange-600 text-xs font-medium rounded-md">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock size={12} /> {job.posted}
                </span>
                <Link
                  href={`/dashboard/jobs/${job.id}`}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Apply <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Briefcase size={28} className="text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">No jobs found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
