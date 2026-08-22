export type JobType = 'Full-Time' | 'Part-Time' | 'Internship';
export type JobStatus = 'Open' | 'Closed';

export interface Job {
  id: string;
  title: string;
  company_name: string;
  sector: string;
  job_type: JobType;
  zone: string;
  city: string;
  centre?: string;
  location: string;
  salary_range: string;
  salary_min?: number | null;
  salary_max?: number | null;
  description: string;
  requirements: string[] | string;
  status: JobStatus;
  external_link?: string;
  posted_by?: string | null;
  created_at?: string;
}

export type ApplicationStatus =
  | 'Link Opened'
  | 'Applied'
  | 'Shortlisted'
  | 'Interview Scheduled'
  | 'Interview Completed'
  | 'Selected'
  | 'Rejected'
  | 'Joined'
  | 'Not Joined';

export interface JobApplication {
  id: string;
  job_id: string;
  user_id: string;
  status: ApplicationStatus;
  interview_count?: number;
  interview_date?: string | null;
  link_opened_at?: string | null;
  confirmed_applied_at?: string | null;
  joining_date?: string | null;
  probation_end_date?: string | null;
  designation?: string | null;
  salary_offered?: string | null;
  proof_document_url?: string | null;
  admin_notes?: string | null;
  self_reported_status?: ApplicationStatus | null;
  self_reported_at?: string | null;
  applied_at: string;
  updated_at?: string;
  job?: Job;
}

export interface EducationEntry {
  degree: string;
  institution: string;
  year: string;
}

export interface ExperienceEntry {
  role: string;
  company: string;
  duration: string;
  description: string;
}

export interface ResumeProfile {
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  education: EducationEntry[];
  experience: ExperienceEntry[];
  skills: string[];
  certifications: string;
  resume_pdf_url?: string | null;
  updated_at?: string;
}

export interface NewsletterSubscriber {
  id?: string;
  email: string;
  is_active?: boolean;
  subscribed_at?: string;
}
