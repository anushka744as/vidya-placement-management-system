'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';

export interface DashboardStats {
  totalStudents: number;
  activeJobs: number;
  placedStudents: number;
  retainedStudents: number;
}

export async function fetchDashboardStats(): Promise<{ data: DashboardStats; error?: string }> {
  const empty: DashboardStats = { totalStudents: 0, activeJobs: 0, placedStudents: 0, retainedStudents: 0 };

  try {
    const supabase = createServerSupabaseClient();

    // "Total Students" counts everyone added through any path — admin's Add Student
    // form (students table) and Placement Records manual entry / CSV import
    // (placement_records table) — deduplicated by email so the same person added
    // through both paths (e.g. backfilled portal signups) is only counted once.
    const [studentEmailsRes, recordEmailsRes, jobsRes, placedRes, retainedRes] = await Promise.all([
      (supabase.from('students') as any).select('email'),
      (supabase.from('placement_records') as any).select('email'),
      (supabase.from('jobs') as any).select('*', { count: 'exact', head: true }).eq('status', 'Open'),
      (supabase.from('students') as any).select('*', { count: 'exact', head: true }).eq('status', 'Placed'),
      (supabase.from('job_applications') as any).select('*', { count: 'exact', head: true }).eq('retention_status', 'Retained'),
    ]);

    const uniqueEmails = new Set<string>();
    [...(studentEmailsRes.data || []), ...(recordEmailsRes.data || [])].forEach((row: any) => {
      if (row.email) uniqueEmails.add(String(row.email).toLowerCase().trim());
    });

    return {
      data: {
        totalStudents: uniqueEmails.size,
        activeJobs: jobsRes.count || 0,
        placedStudents: placedRes.count || 0,
        retainedStudents: retainedRes.count || 0,
      },
    };
  } catch (err: any) {
    return { data: empty, error: err.message || 'Failed to load dashboard stats.' };
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
