'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Job, JobApplication, ResumeProfile } from '@/lib/supabase/portal-types';

// Seeded sample jobs fallback if Supabase jobs table has no rows yet
const SEEDED_JOBS: Job[] = [
  {
    id: 'seed-job-1',
    title: 'Retail Sales Executive',
    company_name: 'Reliance Retail',
    sector: 'Retail & E-commerce',
    job_type: 'Full-Time',
    zone: 'North Zone',
    city: 'Delhi',
    centre: 'Delhi (Munirka)',
    location: 'Munirka, New Delhi',
    salary_range: '₹18,000 – ₹24,000 / month',
    description: 'We are seeking energetic Retail Sales Executives to engage customers, demonstrate products, manage inventory displays, and achieve daily sales targets at Reliance Retail outlets.',
    requirements: [
      '12th Pass or Graduate',
      'Good verbal communication skills in Hindi & basic English',
      'Customer-first attitude and teamwork',
      'Basic computer or POS terminal knowledge'
    ],
    status: 'Open',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'seed-job-2',
    title: 'Customer Support Associate',
    company_name: 'Concentrix India',
    sector: 'BPO & Customer Care',
    job_type: 'Full-Time',
    zone: 'North Zone',
    city: 'Gurugram',
    centre: 'Delhi (Gurugram)',
    location: 'Cyber City, Gurugram',
    salary_range: '₹22,000 – ₹28,000 / month',
    description: 'Join Concentrix customer support team to resolve inbound queries via phone and chat. Complete 4-week paid training program provided upon joining.',
    requirements: [
      '12th Pass or Any Graduate',
      'Fluent English & Hindi communication',
      'Willingness to work flexible shift rotations',
      'Typing speed > 30 WPM'
    ],
    status: 'Open',
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'seed-job-3',
    title: 'Junior Web & UI Developer',
    company_name: 'TechSpark Solutions',
    sector: 'IT & Software',
    job_type: 'Full-Time',
    zone: 'South Zone',
    city: 'Bengaluru',
    centre: 'Bengaluru (Whitefield)',
    location: 'Whitefield, Bengaluru',
    salary_range: '₹3.5 LPA – ₹4.8 LPA',
    description: 'Build modern user interfaces with HTML, CSS, JavaScript, and React. Work alongside senior frontend engineers on client web applications.',
    requirements: [
      'Certification or diploma in Full Stack / Web Development',
      'Hands-on knowledge of HTML5, CSS3, JavaScript ES6, and Git',
      'Understanding of responsive design principles',
      'Problem-solving mindset'
    ],
    status: 'Open',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'seed-job-4',
    title: 'Data Entry & Tally Associate',
    company_name: 'HDFC Financial Services',
    sector: 'Banking & Finance',
    job_type: 'Full-Time',
    zone: 'West Zone',
    city: 'Mumbai',
    centre: 'Mumbai (Thane)',
    location: 'Thane West, Mumbai',
    salary_range: '₹16,000 – ₹20,000 / month',
    description: 'Perform digital record keeping, voucher entry in Tally ERP 9, and verify customer KYC documentation for banking workflows.',
    requirements: [
      'Graduate (B.Com / B.A / B.Sc)',
      'Knowledge of Tally ERP 9 and MS Excel (VLOOKUP, Pivot Tables)',
      'High accuracy in numerical data entry'
    ],
    status: 'Open',
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 'seed-job-5',
    title: 'Digital Marketing Intern',
    company_name: 'MediaCraft Digital',
    sector: 'Digital Marketing & Media',
    job_type: 'Internship',
    zone: 'South Zone',
    city: 'Hyderabad',
    centre: 'Hyderabad (Hitech)',
    location: 'Hitech City, Hyderabad',
    salary_range: '₹12,000 / month stipend',
    description: '6-month paid internship focused on social media content creation, SEO keyword research, and running Meta & Google ad campaigns.',
    requirements: [
      'Certification in Digital Marketing',
      'Basic graphic design skills (Canva / Photoshop)',
      'Good written English copy skills'
    ],
    status: 'Open',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'seed-job-6',
    title: 'Hospitality & Guest Desk Trainee',
    company_name: 'Taj Hotels & Resorts',
    sector: 'Hospitality & Tourism',
    job_type: 'Part-Time',
    zone: 'East Zone',
    city: 'Kolkata',
    centre: 'Kolkata (Salt Lake)',
    location: 'Salt Lake Sector 5, Kolkata',
    salary_range: '₹15,000 / month',
    description: 'Assist guest check-ins, manage front desk reservations, and coordinate guest queries at world-class luxury hotel desk.',
    requirements: [
      'Diploma in Hospitality or Graduate',
      'Pleasing personality and strong interpersonal skills',
      'Fluency in Bengali, English & Hindi'
    ],
    status: 'Open',
    created_at: new Date(Date.now() - 86400000 * 6).toISOString(),
  }
];

export interface FetchJobsFilters {
  search?: string;
  zone?: string;
  city?: string;
  centre?: string;
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
    if (filters.centre && filters.centre !== 'all') {
      query = query.eq('centre', filters.centre);
    }
    if (filters.sector && filters.sector !== 'all') {
      query = query.eq('sector', filters.sector);
    }
    if (filters.job_type && filters.job_type !== 'all') {
      query = query.eq('job_type', filters.job_type);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      // Filter seeded jobs as fallback
      let filtered = [...SEEDED_JOBS];
      if (filters.search && filters.search.trim() !== '') {
        const s = filters.search.toLowerCase();
        filtered = filtered.filter(j => j.title.toLowerCase().includes(s) || j.company_name.toLowerCase().includes(s));
      }
      if (filters.zone && filters.zone !== 'all') filtered = filtered.filter(j => j.zone === filters.zone);
      if (filters.city && filters.city !== 'all') filtered = filtered.filter(j => j.city === filters.city);
      if (filters.centre && filters.centre !== 'all') filtered = filtered.filter(j => j.centre === filters.centre);
      if (filters.sector && filters.sector !== 'all') filtered = filtered.filter(j => j.sector === filters.sector);
      if (filters.job_type && filters.job_type !== 'all') filtered = filtered.filter(j => j.job_type === filters.job_type);

      return { data: filtered };
    }

    return { data: data as Job[] };
  } catch (err: any) {
    return { data: SEEDED_JOBS };
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
      const seeded = SEEDED_JOBS.find(j => j.id === id);
      if (seeded) return { data: seeded };
      return { error: 'Job posting not found.' };
    }

    return { data: data as Job };
  } catch (err: any) {
    const seeded = SEEDED_JOBS.find(j => j.id === id);
    if (seeded) return { data: seeded };
    return { error: err.message || 'Failed to fetch job details.' };
  }
}

export async function applyForJob(jobId: string, userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServerSupabaseClient();

    // Check if duplicate application exists
    const { data: existing } = await (supabase.from('job_applications') as any)
      .select('id')
      .eq('job_id', jobId)
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) {
      return { success: false, error: 'You have already applied to this job.' };
    }

    const { error } = await (supabase.from('job_applications') as any).insert({
      job_id: jobId,
      user_id: userId,
      status: 'Applied',
      applied_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (error) {
      if (error.code === '23505') {
        return { success: false, error: 'You have already applied to this job.' };
      }
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Application submission failed.' };
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
