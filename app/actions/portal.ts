'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { ApplicationStatus, Job, JobApplication, ResumeProfile } from '@/lib/supabase/portal-types';

export interface FetchJobsFilters {
  search?: string;
  zone?: string;
  city?: string;
  sector?: string;
  job_type?: string;
}

export async function fetchOpenJobs(filters: FetchJobsFilters = {}): Promise<{ data: Job[]; error?: string }> {
  try {
    const supabase = createServerSupabaseClient();
    let query = (supabase.from('jobs') as any).select('*').eq('status', 'Open');

    if (filters.search && filters.search.trim() !== '') {
      const s = `%${filters.search.trim()}%`;
      query = query.or(`title.ilike.${s},company_name.ilike.${s},description.ilike.${s}`);
    }

    if (filters.zone && filters.zone !== 'all') {
      query = query.eq('zone', filters.zone);
    }
    if (filters.city && filters.city !== 'all') {
      query = query.eq('city', filters.city);
    }
    if (filters.sector && filters.sector !== 'all') {
      query = query.eq('sector', filters.sector);
    }
    if (filters.job_type && filters.job_type !== 'all') {
      query = query.eq('job_type', filters.job_type);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      return { data: [], error: error.message };
    }

    return { data: (data as Job[]) || [] };
  } catch (err: any) {
    return { data: [], error: err.message || 'Failed to load job postings.' };
  }
}

export async function fetchAllJobsAdmin(): Promise<{ data: Job[]; error?: string }> {
  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await (supabase.from('jobs') as any)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return { data: [], error: error.message };
    }

    return { data: (data as Job[]) || [] };
  } catch (err: any) {
    return { data: [], error: err.message || 'Failed to load job postings.' };
  }
}

function normalizeJobRequirements(requirements: Job['requirements']): string {
  return Array.isArray(requirements) ? requirements.join('\n') : requirements || '';
}

export async function createJob(jobData: Omit<Job, 'id' | 'created_at'>): Promise<{ success: boolean; data?: Job; error?: string }> {
  try {
    if (!jobData.title || !jobData.company_name) {
      return { success: false, error: 'Job title and company name are required.' };
    }

    const supabase = createServerSupabaseClient();
    const { data, error } = await (supabase.from('jobs') as any)
      .insert({
        ...jobData,
        requirements: normalizeJobRequirements(jobData.requirements),
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating job:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data as Job };
  } catch (err: any) {
    return { success: false, error: err.message || 'An error occurred while creating the job posting.' };
  }
}

export async function updateJob(id: string, jobData: Omit<Job, 'id' | 'created_at'>): Promise<{ success: boolean; data?: Job; error?: string }> {
  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await (supabase.from('jobs') as any)
      .update({ ...jobData, requirements: normalizeJobRequirements(jobData.requirements) })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating job:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data as Job };
  } catch (err: any) {
    return { success: false, error: err.message || 'An error occurred while updating the job posting.' };
  }
}

export async function deleteJob(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServerSupabaseClient();
    const { error } = await (supabase.from('jobs') as any)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting job:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'An error occurred while deleting the job posting.' };
  }
}

export async function fetchJobById(id: string): Promise<{ data?: Job; error?: string }> {
  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await (supabase.from('jobs') as any)
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return { error: 'Job posting not found.' };
    }

    return { data: data as Job };
  } catch (err: any) {
    return { error: err.message || 'Failed to fetch job details.' };
  }
}

export async function applyForJob(jobId: string, userId: string, opts: { externalLinkOpened?: boolean } = {}): Promise<{ success: boolean; data?: JobApplication; error?: string }> {
  try {
    const supabase = createServerSupabaseClient();

    // Check if duplicate application exists
    const { data: existing } = await (supabase.from('job_applications') as any)
      .select('*')
      .eq('job_id', jobId)
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) {
      return { success: false, error: 'You have already applied to this job.', data: existing as JobApplication };
    }

    const now = new Date().toISOString();
    const { data, error } = await (supabase.from('job_applications') as any)
      .insert({
        job_id: jobId,
        user_id: userId,
        // For external-link jobs we can't verify the application actually happened on the
        // company's site, so it stays 'Link Opened' (not 'Applied') until the student self-confirms.
        status: opts.externalLinkOpened ? 'Link Opened' : 'Applied',
        applied_at: now,
        updated_at: now,
        link_opened_at: opts.externalLinkOpened ? now : null,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return { success: false, error: 'You have already applied to this job.' };
      }
      return { success: false, error: error.message };
    }

    return { success: true, data: data as JobApplication };
  } catch (err: any) {
    return { success: false, error: err.message || 'Application submission failed.' };
  }
}

export async function confirmJobApplication(applicationId: string): Promise<{ success: boolean; data?: JobApplication; error?: string }> {
  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await (supabase.from('job_applications') as any)
      .update({ status: 'Applied', confirmed_applied_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', applicationId)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as JobApplication };
  } catch (err: any) {
    return { success: false, error: err.message || 'Could not confirm application.' };
  }
}

export async function fetchStudentApplications(userId: string): Promise<{ data: JobApplication[]; error?: string }> {
  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await (supabase.from('job_applications') as any)
      .select('*, job:jobs(*)')
      .eq('user_id', userId)
      .order('applied_at', { ascending: false });

    if (error) {
      return { data: [], error: error.message };
    }

    return { data: (data as JobApplication[]) || [] };
  } catch (err: any) {
    return { data: [], error: err.message || 'Failed to load applications.' };
  }
}

export interface RecentApplicationSummary {
  id: string;
  applied_at: string;
  job_title: string;
  company_name: string;
  student_name: string;
}

export async function fetchRecentApplicationsAdmin(limit: number = 5): Promise<{ data: RecentApplicationSummary[]; error?: string }> {
  try {
    const supabase = createServerSupabaseClient();
    const { data: apps, error } = await (supabase.from('job_applications') as any)
      .select('id, user_id, applied_at, job:jobs(title, company_name)')
      .order('applied_at', { ascending: false })
      .limit(limit);

    if (error || !apps) {
      return { data: [], error: error?.message };
    }

    const userIds = Array.from(new Set(apps.map((a: any) => a.user_id).filter(Boolean)));
    const emailByUserId: Record<string, string> = {};
    if (userIds.length > 0) {
      const { data: profiles } = await (supabase.from('profiles') as any).select('id, email').in('id', userIds);
      (profiles || []).forEach((p: any) => { emailByUserId[p.id] = p.email; });
    }

    const emails = Object.values(emailByUserId);
    const nameByEmail: Record<string, string> = {};
    if (emails.length > 0) {
      const { data: students } = await (supabase.from('students') as any).select('email, full_name').in('email', emails);
      (students || []).forEach((s: any) => { if (s.email && s.full_name) nameByEmail[s.email] = s.full_name; });
    }

    const result: RecentApplicationSummary[] = apps.map((a: any) => {
      const email = emailByUserId[a.user_id];
      return {
        id: a.id,
        applied_at: a.applied_at,
        job_title: a.job?.title || 'Placement Application',
        company_name: a.job?.company_name || 'Partner Employer',
        student_name: (email && nameByEmail[email]) || email || 'Student',
      };
    });

    return { data: result };
  } catch (err: any) {
    return { data: [], error: err.message || 'Failed to load recent applications.' };
  }
}

export interface SelectedStudentSummary {
  id: string;
  student_name: string;
  student_email: string;
  job_title: string;
  company_name: string;
  status: ApplicationStatus;
  designation: string | null;
  joining_date: string | null;
  proof_document_url: string | null;
}

export async function fetchSelectedStudentsAdmin(): Promise<{ data: SelectedStudentSummary[]; error?: string }> {
  try {
    const supabase = createServerSupabaseClient();
    const { data: apps, error } = await (supabase.from('job_applications') as any)
      .select('id, user_id, status, designation, joining_date, proof_document_url, job:jobs(title, company_name)')
      .in('status', ['Selected', 'Joined'])
      .order('updated_at', { ascending: false });

    if (error || !apps) {
      return { data: [], error: error?.message };
    }

    const userIds = Array.from(new Set(apps.map((a: any) => a.user_id).filter(Boolean)));
    const emailByUserId: Record<string, string> = {};
    if (userIds.length > 0) {
      const { data: profiles } = await (supabase.from('profiles') as any).select('id, email').in('id', userIds);
      (profiles || []).forEach((p: any) => { emailByUserId[p.id] = p.email; });
    }

    const emails = Object.values(emailByUserId);
    const nameByEmail: Record<string, string> = {};
    if (emails.length > 0) {
      const { data: students } = await (supabase.from('students') as any).select('email, full_name').in('email', emails);
      (students || []).forEach((s: any) => { if (s.email && s.full_name) nameByEmail[s.email] = s.full_name; });
    }

    const result: SelectedStudentSummary[] = apps.map((a: any) => {
      const email = emailByUserId[a.user_id] || '';
      return {
        id: a.id,
        student_name: (email && nameByEmail[email]) || email || 'Student',
        student_email: email,
        job_title: a.job?.title || 'Placement Application',
        company_name: a.job?.company_name || 'Partner Employer',
        status: a.status,
        designation: a.designation,
        joining_date: a.joining_date,
        proof_document_url: a.proof_document_url,
      };
    });

    return { data: result };
  } catch (err: any) {
    return { data: [], error: err.message || 'Failed to load selected students.' };
  }
}

export async function fetchApplicationsByEmail(email: string): Promise<{ data: JobApplication[]; linked: boolean; error?: string }> {
  try {
    if (!email) {
      return { data: [], linked: false };
    }

    const supabase = createServerSupabaseClient();
    const { data: profile, error: profileError } = await (supabase.from('profiles') as any)
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (profileError || !profile) {
      return { data: [], linked: false };
    }

    const { data, error } = await (supabase.from('job_applications') as any)
      .select('*, job:jobs(*)')
      .eq('user_id', profile.id)
      .order('applied_at', { ascending: false });

    if (error) {
      return { data: [], linked: true, error: error.message };
    }

    return { data: (data as JobApplication[]) || [], linked: true };
  } catch (err: any) {
    return { data: [], linked: false, error: err.message || 'Failed to load applications.' };
  }
}

export interface ApplicationStatusUpdate {
  status: ApplicationStatus;
  interview_date?: string | null;
  admin_notes?: string | null;
  designation?: string | null;
  salary_offered?: string | null;
  joining_date?: string | null;
  probation_end_date?: string | null;
}

async function syncStudentPlacementFromApplication(supabase: ReturnType<typeof createServerSupabaseClient>, app: any) {
  if (app.status !== 'Selected' && app.status !== 'Joined') return;

  try {
    const [{ data: profile }, { data: job }] = await Promise.all([
      (supabase.from('profiles') as any).select('email').eq('id', app.user_id).maybeSingle(),
      (supabase.from('jobs') as any).select('company_name').eq('id', app.job_id).maybeSingle(),
    ]);
    if (!profile?.email) return;

    const { data: student } = await (supabase.from('students') as any).select('id').eq('email', profile.email).maybeSingle();
    if (!student) return;

    await (supabase.from('students') as any)
      .update({
        status: 'Placed',
        company_placed: job?.company_name,
        join_date: app.joining_date,
        placed_salary: app.salary_offered,
        updated_at: new Date().toISOString(),
      })
      .eq('id', student.id);
  } catch (err) {
    console.error('Could not sync student placement status:', err);
  }
}

export async function updateApplicationStatus(applicationId: string, updates: ApplicationStatusUpdate): Promise<{ success: boolean; data?: JobApplication; error?: string }> {
  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await (supabase.from('job_applications') as any)
      .update({ ...updates, self_reported_status: null, self_reported_at: null, updated_at: new Date().toISOString() })
      .eq('id', applicationId)
      .select()
      .single();

    if (error) {
      console.error('Error updating application status:', error);
      return { success: false, error: error.message };
    }

    await syncStudentPlacementFromApplication(supabase, data);

    return { success: true, data: data as JobApplication };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update application status.' };
  }
}

const STUDENT_REPORTABLE_STATUSES: ApplicationStatus[] = ['Shortlisted', 'Interview Scheduled', 'Selected', 'Rejected'];

export async function reportApplicationStatus(
  applicationId: string,
  status: ApplicationStatus,
  interviewDate?: string | null
): Promise<{ success: boolean; data?: JobApplication; error?: string }> {
  try {
    if (!STUDENT_REPORTABLE_STATUSES.includes(status)) {
      return { success: false, error: 'Invalid status.' };
    }

    const supabase = createServerSupabaseClient();
    const now = new Date().toISOString();
    const update: Record<string, unknown> = {
      status,
      self_reported_status: status,
      self_reported_at: now,
      updated_at: now,
    };
    if (status === 'Interview Scheduled' && interviewDate) {
      update.interview_date = interviewDate;
    }

    const { data, error } = await (supabase.from('job_applications') as any)
      .update(update)
      .eq('id', applicationId)
      .select()
      .single();

    if (error) {
      console.error('Error reporting application status:', error);
      return { success: false, error: error.message };
    }

    await syncStudentPlacementFromApplication(supabase, data);

    return { success: true, data: data as JobApplication };
  } catch (err: any) {
    return { success: false, error: err.message || 'Could not update your application status.' };
  }
}

const APPLICATION_PROOF_BUCKET = 'student-documents';

export async function uploadApplicationProof(applicationId: string, formData: FormData): Promise<{ success: boolean; data?: JobApplication; error?: string }> {
  try {
    const file = formData.get('file') as File | null;
    if (!file || file.size === 0) {
      return { success: false, error: 'No file selected.' };
    }

    const supabase = createServerSupabaseClient();
    const path = `applications/${applicationId}/proof-${Date.now()}-${file.name}`;
    const arrayBuffer = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage.from(APPLICATION_PROOF_BUCKET).upload(path, arrayBuffer, {
      contentType: file.type || 'application/octet-stream',
      upsert: true,
    });

    if (uploadError) {
      return { success: false, error: `Failed to upload proof: ${uploadError.message}` };
    }

    const { data, error } = await (supabase.from('job_applications') as any)
      .update({ proof_document_url: path, updated_at: new Date().toISOString() })
      .eq('id', applicationId)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as JobApplication };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to upload proof document.' };
  }
}

export async function getApplicationProofSignedUrl(path: string): Promise<{ url?: string; error?: string }> {
  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase.storage.from(APPLICATION_PROOF_BUCKET).createSignedUrl(path, 60 * 10);

    if (error || !data) {
      return { error: error?.message || 'Could not generate document link.' };
    }

    return { url: data.signedUrl };
  } catch (err: any) {
    return { error: err.message || 'Could not generate document link.' };
  }
}

export async function fetchResumeProfile(userId: string): Promise<{ data?: ResumeProfile; error?: string }> {
  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await (supabase.from('resume_profiles') as any)
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      return { error: error.message };
    }

    return { data: data as ResumeProfile | undefined };
  } catch (err: any) {
    return { error: err.message || 'Failed to fetch resume profile.' };
  }
}

export async function upsertResumeProfile(userId: string, profile: Partial<ResumeProfile>): Promise<{ success: boolean; data?: ResumeProfile; error?: string }> {
  try {
    const supabase = createServerSupabaseClient();
    const payload = {
      ...profile,
      user_id: userId,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await (supabase.from('resume_profiles') as any)
      .upsert(payload, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as ResumeProfile };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to save resume profile.' };
  }
}

export async function subscribeNewsletter(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    const supabase = createServerSupabaseClient();
    const { error } = await (supabase.from('newsletter_subscribers') as any).insert({
      email: email.trim(),
      is_active: true,
      subscribed_at: new Date().toISOString(),
    });

    if (error) {
      if (error.code === '23505') {
        return { success: true }; // Already subscribed is fine
      }
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Subscription failed.' };
  }
}
