"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { Job } from "@/lib/supabase/portal-types";
import { ZONES, SALARY_RANGE_BUCKETS, jobMatchesSalaryBucket } from "@/lib/constants";
import { fetchAllJobsAdmin, createJob, updateJob, deleteJob } from "@/app/actions/portal";
import {
  Search,
  MapPin,
  Briefcase,
  Clock,
  Plus,
  Trash2,
  ExternalLink,
  Loader2,
  CheckCircle2,
  X,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { useEffect, useMemo, useState } from "react";

function createJobDraft(): Omit<Job, 'id' | 'created_at'> {
  return {
    title: '',
    company_name: '',
    sector: 'Retail & E-commerce',
    job_type: 'Full-Time',
    zone: 'North Zone',
    city: '',
    location: '',
    salary_range: '',
    salary_min: null,
    salary_max: null,
    description: '',
    requirements: [],
    status: 'Open',
    external_link: '',
  };
}

const ALL_SECTORS = [
  "Retail & E-commerce",
  "BPO & Customer Care",
  "IT & Software",
  "Banking & Finance",
  "Healthcare",
  "Digital Marketing & Media",
  "Hospitality & Tourism",
  "Electrical & Trade Services",
];

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState("");
  const [zone, setZone] = useState("all");
  const [city, setCity] = useState("all");
  const [sector, setSector] = useState("all");
  const [jobType, setJobType] = useState("all");
  const [salaryRange, setSalaryRange] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(createJobDraft());
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadJobs = async () => {
    setIsLoading(true);
    const res = await fetchAllJobsAdmin();
    setJobs(res.data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const availableCities = useMemo(() => {
    if (zone === "all") return Array.from(new Set(jobs.flatMap((job) => [job.city]).filter(Boolean)));
    const zoneCities = {
      "North Zone": ["Delhi", "Gurugram", "Noida", "Chandigarh"],
      "South Zone": ["Bengaluru", "Hyderabad", "Chennai", "Kochi"],
      "East Zone": ["Kolkata", "Bhubaneswar", "Patna"],
      "West Zone": ["Mumbai", "Pune", "Ahmedabad"],
      "Central Zone": ["Indore", "Bhopal", "Nagpur", "Raipur"],
    } as Record<string, string[]>;
    return zoneCities[zone] || [];
  }, [jobs, zone]);

  const filtered = useMemo(() => jobs.filter((job) => {
    const searchText = `${job.title} ${job.company_name} ${job.description}`.toLowerCase();
    const matchSearch = searchText.includes(search.toLowerCase());
    const matchZone = zone === "all" || job.zone === zone;
    const matchCity = city === "all" || job.city === city;
    const matchSector = sector === "all" || job.sector === sector;
    const matchType = jobType === "all" || job.job_type === jobType;
    const matchSalary = jobMatchesSalaryBucket(job, salaryRange);
    return matchSearch && matchZone && matchCity && matchSector && matchType && matchSalary;
  }), [jobs, search, zone, city, sector, jobType, salaryRange]);

  const resetForm = () => {
    setForm(createJobDraft());
    setEditingId(null);
    setShowForm(false);
  };

  const openEdit = (job: Job) => {
    setEditingId(job.id);
    setForm({
      title: job.title,
      company_name: job.company_name,
      sector: job.sector,
      job_type: job.job_type,
      zone: job.zone,
      city: job.city,
      location: job.location,
      salary_range: job.salary_range,
      salary_min: job.salary_min ?? null,
      salary_max: job.salary_max ?? null,
      description: job.description,
      requirements: Array.isArray(job.requirements) ? job.requirements : (job.requirements || '').split('\n').filter(Boolean),
      status: job.status,
      external_link: job.external_link || '',
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const payload = {
      ...form,
      title: form.title.trim(),
      company_name: form.company_name.trim(),
      city: form.city.trim(),
      location: form.location.trim(),
      salary_range: form.salary_range.trim(),
      description: form.description.trim(),
      external_link: form.external_link?.trim() || '',
      requirements: Array.isArray(form.requirements) ? form.requirements : (form.requirements || '').split('\n').filter(Boolean),
    };

    const res = editingId ? await updateJob(editingId, payload) : await createJob(payload);

    if (res.success) {
      toast.success(editingId ? 'Job posting updated.' : 'Job posting published — now visible to students.');
      resetForm();
      await loadJobs();
    } else {
      toast.error(res.error || 'Could not save job posting.');
    }

    setIsSaving(false);
  };

  const handleDelete = async (jobId: string) => {
    if (!window.confirm('Delete this job posting? This cannot be undone.')) return;

    const res = await deleteJob(jobId);
    if (res.success) {
      setJobs((prev) => prev.filter((job) => job.id !== jobId));
      toast.success('Job posting removed.');
    } else {
      toast.error(res.error || 'Could not delete job posting.');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Job Listings</h1>
            <p className="text-sm text-gray-500 mt-0.5">Create, edit, remove, and share job postings for students.</p>
          </div>
          <button
            onClick={() => {
              setForm(createJobDraft());
              setEditingId(null);
              setShowForm((prev) => !prev);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Plus size={16} /> {showForm ? 'Close Form' : 'Add Job'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">{editingId ? 'Edit Job Posting' : 'Add New Job Posting'}</h2>
              <button type="button" onClick={resetForm} className="rounded-full p-2 hover:bg-gray-100">
                <X size={16} className="text-gray-500" />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Job Title</label>
                <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Company Name</label>
                <input required value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Sector</label>
                <select value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value })} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm">
                  {ALL_SECTORS.map((sectorName) => <option key={sectorName} value={sectorName}>{sectorName}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Job Type</label>
                <select value={form.job_type} onChange={(e) => setForm({ ...form, job_type: e.target.value as Job['job_type'] })} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm">
                  <option value="Full-Time">Full-Time</option>
                  <option value="Part-Time">Part-Time</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Zone</label>
                <select value={form.zone} onChange={(e) => setForm({ ...form, zone: e.target.value })} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm">
                  {ZONES.map((z) => <option key={z} value={z}>{z}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">City</label>
                <input required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Location</label>
                <input required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Monthly Salary (display text)</label>
                <input required value={form.salary_range} onChange={(e) => setForm({ ...form, salary_range: e.target.value })} placeholder="e.g. ₹20,000 - ₹25,000/month" className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Monthly Salary Min (₹)</label>
                <input type="number" min={0} value={form.salary_min ?? ''} onChange={(e) => setForm({ ...form, salary_min: e.target.value === '' ? null : Number(e.target.value) })} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Monthly Salary Max (₹)</label>
                <input type="number" min={0} value={form.salary_max ?? ''} onChange={(e) => setForm({ ...form, salary_max: e.target.value === '' ? null : Number(e.target.value) })} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Job['status'] })} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm">
                  <option value="Open">Open</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Original Listing Link</label>
                <input value={form.external_link || ''} onChange={(e) => setForm({ ...form, external_link: e.target.value })} placeholder="https://example.com/jobs/123" className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm" />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
              <textarea required rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Requirements (one per line)</label>
              <textarea rows={4} value={Array.isArray(form.requirements) ? form.requirements.join('\n') : form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value.split('\n').filter(Boolean) })} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm" />
            </div>

            <div className="flex justify-end gap-3">
              <button type="button" onClick={resetForm} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600">Cancel</button>
              <button type="submit" disabled={isSaving} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />} {editingId ? 'Save Changes' : 'Publish Job'}
              </button>
            </div>
          </form>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search title, company, or keywords..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-200 transition-all" />
            </div>
            <select value={zone} onChange={(e) => { setZone(e.target.value); setCity('all'); }} className="px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer">
              <option value="all">All Zones</option>
              {ZONES.map((z) => <option key={z} value={z}>{z}</option>)}
            </select>
            <select value={city} onChange={(e) => setCity(e.target.value)} className="px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer">
              <option value="all">All Cities</option>
              {availableCities.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={sector} onChange={(e) => setSector(e.target.value)} className="px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer">
              <option value="all">All Sectors</option>
              {ALL_SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={jobType} onChange={(e) => setJobType(e.target.value)} className="px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer">
              <option value="all">All Types</option>
              <option value="Full-Time">Full-Time</option>
              <option value="Part-Time">Part-Time</option>
              <option value="Internship">Internship</option>
            </select>
            <select value={salaryRange} onChange={(e) => setSalaryRange(e.target.value)} className="px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer">
              <option value="all">All Salary Ranges</option>
              {SALARY_RANGE_BUCKETS.map((b) => <option key={b.label} value={b.label}>{b.label}</option>)}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Showing {filtered.length} job{filtered.length === 1 ? '' : 's'}</p>
        </div>

        {isLoading && (
          <div className="rounded-2xl border border-gray-100 bg-white py-16 text-center">
            <Loader2 size={28} className="mx-auto animate-spin text-blue-600" />
            <p className="mt-3 font-medium text-gray-500">Loading job postings...</p>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {!isLoading && filtered.map((job) => (
            <div key={job.id} className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-lg">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400">{job.sector}</p>
                  <h3 className="mt-1 text-base font-semibold text-gray-900">{job.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">{job.company_name}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${job.status === 'Open' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {job.status}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-500">
                <span className="flex items-center gap-1 rounded-lg bg-gray-50 px-2.5 py-1"><MapPin size={12} /> {job.location || `${job.city}, ${job.zone}`}</span>
                <span className="flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-blue-700"><Briefcase size={12} /> {job.job_type}</span>
                {job.salary_range ? (
                  <span className="flex items-center gap-1 rounded-lg bg-green-50 px-2.5 py-1 text-green-700"><Wallet size={12} /> {job.salary_range}</span>
                ) : null}
              </div>

              <p className="mt-4 line-clamp-3 text-sm text-gray-600">{job.description}</p>

              <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                <span className="flex items-center gap-1 text-xs text-gray-400"><Clock size={12} /> {job.created_at ? new Date(job.created_at).toLocaleDateString() : 'Recently added'}</span>
                <div className="flex items-center gap-2">
                  {job.external_link ? (
                    <a href={job.external_link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50">
                      <ExternalLink size={14} /> Link
                    </a>
                  ) : null}
                  <button onClick={() => openEdit(job)} className="rounded-lg border border-gray-200 px-2.5 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50">Edit</button>
                  <button onClick={() => handleDelete(job.id)} className="rounded-lg border border-red-200 px-2.5 py-2 text-xs font-medium text-red-600 hover:bg-red-50"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {!isLoading && filtered.length === 0 && (
          <div className="rounded-2xl border border-gray-100 bg-white py-16 text-center">
            <Briefcase size={28} className="mx-auto text-gray-300" />
            <p className="mt-3 font-medium text-gray-500">No jobs found</p>
            <p className="mt-1 text-sm text-gray-400">Try changing the filters or add a new posting.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
