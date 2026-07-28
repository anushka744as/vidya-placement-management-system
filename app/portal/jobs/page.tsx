'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { StudentLayout } from '@/components/portal/StudentLayout';
import { fetchOpenJobs } from '@/app/actions/portal';
import { Job, JobType } from '@/lib/supabase/portal-types';
import { ZONES } from '@/lib/constants';
import { formatSalary } from '@/lib/utils';
import {
  Search,
  MapPin,
  Building2,
  Briefcase,
  DollarSign,
  ArrowRight,
  Filter,
  Sparkles,
  Loader2,
  Tag,
  CheckCircle2,
} from 'lucide-react';

const CITIES_BY_ZONE: Record<string, string[]> = {
  'North Zone': ['Delhi', 'Gurugram', 'Noida', 'Chandigarh'],
  'South Zone': ['Bengaluru', 'Hyderabad', 'Chennai', 'Kochi'],
  'East Zone': ['Kolkata', 'Bhubaneswar', 'Patna'],
  'West Zone': ['Mumbai', 'Pune', 'Ahmedabad'],
  'Central Zone': ['Indore', 'Bhopal', 'Nagpur', 'Raipur'],
};

const ALL_SECTORS = [
  'Retail & E-commerce',
  'BPO & Customer Care',
  'IT & Software',
  'Banking & Finance',
  'Healthcare',
  'Digital Marketing & Media',
  'Hospitality & Tourism',
  'Electrical & Trade Services',
];

export default function StudentJobListingsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState('');
  const [selectedZone, setSelectedZone] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedSector, setSelectedSector] = useState('all');
  const [selectedJobType, setSelectedJobType] = useState('all');

  const loadJobs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchOpenJobs({
        search,
        zone: selectedZone,
        city: selectedCity,
        sector: selectedSector,
        job_type: selectedJobType,
      });
      setJobs(res.data);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  }, [search, selectedZone, selectedCity, selectedSector, selectedJobType]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  // Handle Cascading Zone -> City
  const handleZoneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedZone(val);
    setSelectedCity('all');
  };

  const availableCities = selectedZone !== 'all' ? CITIES_BY_ZONE[selectedZone] || [] : Object.values(CITIES_BY_ZONE).flat();

  return (
    <StudentLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Banner */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 rounded-3xl p-8 text-white relative overflow-hidden shadow-lg">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="max-w-2xl relative z-10 space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 text-blue-100 text-xs font-semibold rounded-full backdrop-blur-sm">
              <Sparkles size={14} /> Certified Student Placement Portal
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Discover Open Career Opportunities
            </h1>
            <p className="text-blue-100 text-sm leading-relaxed">
              Explore verified job postings matched to your Vidya skill certification. Filter by zone, city, sector, and employment type.
            </p>
          </div>
        </div>

        {/* Filter Controls Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search job title, company name, keywords..."
                className="w-full pl-11 pr-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Cascading Filters Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-gray-100 text-xs">
            {/* 1. Zone */}
            <div>
              <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">1. Zone</label>
              <select
                value={selectedZone}
                onChange={handleZoneChange}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                <option value="all">All Zones</option>
                {ZONES.map((z) => (
                  <option key={z} value={z}>
                    {z}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. City (Cascading) */}
            <div>
              <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">2. City</label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                <option value="all">All Cities</option>
                {availableCities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Sector */}
            <div>
              <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">3. Sector</label>
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                <option value="all">All Sectors</option>
                {ALL_SECTORS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Job Type */}
            <div>
              <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">4. Job Type</label>
              <select
                value={selectedJobType}
                onChange={(e) => setSelectedJobType(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                <option value="all">All Job Types</option>
                <option value="Full-Time">Full-Time</option>
                <option value="Part-Time">Part-Time</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
          </div>
        </div>

        {/* Jobs Grid Header */}
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Showing {jobs.length} Open Position{jobs.length === 1 ? '' : 's'}
          </p>
        </div>

        {/* Job Cards Grid */}
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
            <Loader2 size={32} className="animate-spin text-blue-600" />
            <p className="text-sm font-medium text-gray-500">Loading open job listings...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center space-y-3">
            <Briefcase size={40} className="mx-auto text-gray-300" />
            <h3 className="text-base font-bold text-gray-800">No Open Jobs Found</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              No active job postings match your selected filters. Try clearing your search parameters or selecting all zones.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md hover:border-blue-200 transition-all duration-200 flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  {/* Sector & Type Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full">
                      {job.sector}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        job.job_type === 'Full-Time'
                          ? 'bg-blue-50 text-blue-700 border border-blue-100'
                          : job.job_type === 'Internship'
                          ? 'bg-purple-50 text-purple-700 border border-purple-100'
                          : 'bg-amber-50 text-amber-700 border border-amber-100'
                      }`}
                    >
                      {job.job_type}
                    </span>
                  </div>

                  {/* Title & Company */}
                  <div>
                    <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {job.title}
                    </h3>
                    <p className="text-xs font-semibold text-gray-500 flex items-center gap-1.5 mt-0.5">
                      <Building2 size={14} className="text-gray-400" /> {job.company_name}
                    </p>
                  </div>

                  {/* Details summary */}
                  <div className="space-y-1.5 text-xs text-gray-600 pt-2 border-t border-gray-50">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-gray-400 shrink-0" />
                      <span className="truncate">{job.location || `${job.city}, ${job.zone}`}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign size={14} className="text-green-600 shrink-0" />
                      <span className="font-semibold text-green-700">{formatSalary(job.salary_range)}</span>
                    </div>
                  </div>

                  {/* Description snippet */}
                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                    {job.description}
                  </p>
                </div>

                {/* Card Action */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 font-medium">Status: {job.status}</span>
                  <Link
                    href={`/portal/jobs/${job.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-2xs group-hover:shadow-md transition-all"
                  >
                    View & Apply <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
