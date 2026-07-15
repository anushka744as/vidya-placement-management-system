"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { mockJobs } from "@/lib/mock-data";
import {
  MapPin,
  Briefcase,
  Bookmark,
  ArrowLeft,
  Building2,
  Clock,
  Users,
  CheckCircle2,
  IndianRupee,
  Calendar,
  Share2,
} from "lucide-react";
import Link from "next/link";
import { use } from "react";

export default function JobDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const job = mockJobs.find((j) => j.id === id) || mockJobs[0];
  const relatedJobs = mockJobs.filter((j) => j.id !== id && j.category === job.category).slice(0, 3);
  if (relatedJobs.length < 3) {
    relatedJobs.push(...mockJobs.filter((j) => j.id !== id && !relatedJobs.includes(j)).slice(0, 3 - relatedJobs.length));
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto animate-fade-in">
        <Link href="/dashboard/jobs" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors mb-6">
          <ArrowLeft size={16} /> Back to Jobs
        </Link>

        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 mb-6">
          <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-4">
              <img src={job.logo} alt={job.company} className="w-16 h-16 rounded-2xl object-cover" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
                <p className="text-gray-500 flex items-center gap-1.5 mt-1">
                  <Building2 size={16} /> {job.company}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
                <Share2 size={18} />
              </button>
              <button className="p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                <Bookmark size={18} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="text-xs text-gray-400 mb-1 flex items-center gap-1"><MapPin size={12} /> Location</p>
              <p className="text-sm font-semibold text-gray-800">{job.location}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1 flex items-center gap-1"><IndianRupee size={12} /> Salary</p>
              <p className="text-sm font-semibold text-gray-800">{job.salary}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1 flex items-center gap-1"><Briefcase size={12} /> Experience</p>
              <p className="text-sm font-semibold text-gray-800">{job.experience}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1 flex items-center gap-1"><Users size={12} /> Openings</p>
              <p className="text-sm font-semibold text-gray-800">{job.openings} positions</p>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-6">
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-100 transition-all">
              Apply Now
            </button>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Clock size={12} /> Posted {job.posted}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Job Description</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{job.description}</p>
            </div>

            {/* Requirements */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Requirements</h3>
              <ul className="space-y-2">
                {job.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle2 size={16} className="text-blue-600 mt-0.5 shrink-0" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>

            {/* Benefits */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Benefits</h3>
              <div className="grid grid-cols-2 gap-3">
                {job.benefits.map((benefit, i) => (
                  <div key={i} className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                    <CheckCircle2 size={16} className="text-green-600 shrink-0" />
                    <span className="text-sm text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Job Overview</h3>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-400">Job Type</dt>
                  <dd className="text-gray-800 font-medium">{job.type}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-400">Category</dt>
                  <dd className="text-gray-800 font-medium">{job.category}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-400">Location</dt>
                  <dd className="text-gray-800 font-medium">{job.location}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-400">Openings</dt>
                  <dd className="text-gray-800 font-medium">{job.openings}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-400">Posted</dt>
                  <dd className="text-gray-800 font-medium">{job.posted}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Related Jobs */}
        {relatedJobs.length > 0 && (
          <div className="mt-8">
            <h3 className="font-semibold text-gray-900 mb-4">Related Jobs</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {relatedJobs.map((rj) => (
                <Link
                  key={rj.id}
                  href={`/dashboard/jobs/${rj.id}`}
                  className="group bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg hover:border-gray-200 transition-all"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <img src={rj.logo} alt={rj.company} className="w-10 h-10 rounded-xl object-cover" />
                    <div>
                      <p className="font-medium text-gray-900 text-sm group-hover:text-blue-600 transition-colors">{rj.title}</p>
                      <p className="text-xs text-gray-500">{rj.company}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <MapPin size={12} /> {rj.location}
                    <span className="text-blue-600 font-medium">{rj.salary}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
