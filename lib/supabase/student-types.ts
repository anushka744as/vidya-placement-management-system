export type StudentStatus =
  | 'Seeking'
  | 'Applied'
  | 'Shortlisted'
  | 'Interview'
  | 'Placed'
  | 'Retained';

export interface Student {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  gender: string;
  date_of_birth: string;
  zone: string;
  centre: string;
  city: string;
  address: string;
  qualification: string;
  institution: string;
  year_of_passing: string;
  percentage_grade: string;
  skills: string[];
  preferred_job_role: string;
  salary_expectation: string;
  preferred_city: string;
  travel_preference: string;
  job_category: string;
  status: StudentStatus;
  photo_url: string | null;
  resume_url: string | null;
  id_proof_url: string | null;
  certificate_urls: string[];
  company_placed: string | null;
  join_date: string | null;
  placed_salary: string | null;
  created_at?: string;
  updated_at?: string;
}

export type StudentInsert = Omit<Student, 'id' | 'created_at' | 'updated_at'>;
export type StudentUpdate = Partial<StudentInsert>;

export interface StudentDocumentUrls {
  photo_url?: string | null;
  resume_url?: string | null;
  id_proof_url?: string | null;
  certificate_urls?: string[];
}
