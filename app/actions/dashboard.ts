'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';

export interface DashboardStats {
  totalStudents: number;
  activeJobs: number;
}

export async function fetchDashboardStats(): Promise<{ data: DashboardStats; error?: string }> {
  const empty: DashboardStats = { totalStudents: 0, activeJobs: 0 };

  try {
    const supabase = createServerSupabaseClient();

    // "Total Students" counts everyone added through any path — admin's Add Student
    // form (students table) and Placement Records manual entry / CSV import
    // (placement_records table) — deduplicated by email so the same person added
    // through both paths (e.g. backfilled portal signups) is only counted once.
    const [studentEmailsRes, recordEmailsRes, jobsRes] = await Promise.all([
      (supabase.from('students') as any).select('email'),
      (supabase.from('placement_records') as any).select('email'),
      (supabase.from('jobs') as any).select('*', { count: 'exact', head: true }).eq('status', 'Open'),
    ]);

    const uniqueEmails = new Set<string>();
    [...(studentEmailsRes.data || []), ...(recordEmailsRes.data || [])].forEach((row: any) => {
      if (row.email) uniqueEmails.add(String(row.email).toLowerCase().trim());
    });

    return {
      data: {
        totalStudents: uniqueEmails.size,
        activeJobs: jobsRes.count || 0,
      },
    };
  } catch (err: any) {
    return { data: empty, error: err.message || 'Failed to load dashboard stats.' };
  }
}

export interface StudentListItem {
  id: string;
  full_name: string;
  email: string;
  centre: string | null;
  status: string | null;
  source: string;
}

export async function fetchTotalStudentsList(): Promise<{ data: StudentListItem[]; error?: string }> {
  try {
    const supabase = createServerSupabaseClient();
    const [studentsRes, recordsRes] = await Promise.all([
      (supabase.from('students') as any).select('id, full_name, email, centre, status'),
      (supabase.from('placement_records') as any).select('id, full_name, email, centre, source'),
    ]);

    const byEmail = new Map<string, StudentListItem>();
    (recordsRes.data || []).forEach((r: any) => {
      if (!r.email) return;
      byEmail.set(String(r.email).toLowerCase().trim(), {
        id: r.id,
        full_name: r.full_name,
        email: r.email,
        centre: r.centre,
        status: null,
        source: r.source || 'manual',
      });
    });
    // Students-table rows win over placement_records for the same email — richer profile data.
    (studentsRes.data || []).forEach((s: any) => {
      if (!s.email) return;
      byEmail.set(String(s.email).toLowerCase().trim(), {
        id: s.id,
        full_name: s.full_name,
        email: s.email,
        centre: s.centre,
        status: s.status,
        source: 'student_profile',
      });
    });

    const result = Array.from(byEmail.values()).sort((a, b) => a.full_name.localeCompare(b.full_name));
    return { data: result };
  } catch (err: any) {
    return { data: [], error: err.message || 'Failed to load students.' };
  }
}

export interface ActiveJobListItem {
  id: string;
  title: string;
  company_name: string;
  city: string | null;
  job_type: string | null;
}

export async function fetchActiveJobsList(): Promise<{ data: ActiveJobListItem[]; error?: string }> {
  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await (supabase.from('jobs') as any)
      .select('id, title, company_name, city, job_type')
      .eq('status', 'Open')
      .order('created_at', { ascending: false });

    if (error) return { data: [], error: error.message };
    return { data: data || [] };
  } catch (err: any) {
    return { data: [], error: err.message || 'Failed to load active jobs.' };
  }
}

export interface ApplicationPipelineCounts {
  shortlisted: number;
  interview: number;
  selected: number;
  rejected: number;
  pendingSelfReports: number;
}

export async function fetchApplicationPipelineCounts(): Promise<{ data: ApplicationPipelineCounts; error?: string }> {
  const empty: ApplicationPipelineCounts = { shortlisted: 0, interview: 0, selected: 0, rejected: 0, pendingSelfReports: 0 };

  try {
    const supabase = createServerSupabaseClient();

    const [shortlistedRes, interviewRes, selectedRes, rejectedRes, pendingRes] = await Promise.all([
      (supabase.from('job_applications') as any).select('*', { count: 'exact', head: true }).eq('status', 'Shortlisted'),
      (supabase.from('job_applications') as any).select('*', { count: 'exact', head: true }).in('status', ['Interview Scheduled', 'Interview Completed']),
      (supabase.from('job_applications') as any).select('*', { count: 'exact', head: true }).in('status', ['Selected', 'Joined']),
      (supabase.from('job_applications') as any).select('*', { count: 'exact', head: true }).in('status', ['Rejected', 'Not Joined']),
      (supabase.from('job_applications') as any).select('*', { count: 'exact', head: true }).not('self_reported_at', 'is', null),
    ]);

    return {
      data: {
        shortlisted: shortlistedRes.count || 0,
        interview: interviewRes.count || 0,
        selected: selectedRes.count || 0,
        rejected: rejectedRes.count || 0,
        pendingSelfReports: pendingRes.count || 0,
      },
    };
  } catch (err: any) {
    return { data: empty, error: err.message || 'Failed to load application pipeline counts.' };
  }
}
