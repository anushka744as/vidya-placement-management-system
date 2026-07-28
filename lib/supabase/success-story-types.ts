export interface SuccessStory {
  id: string;
  student_name: string;
  photo_url: string | null;
  course_name: string | null;
  centre: string | null;
  zone: string | null;
  company_placed: string | null;
  job_role: string | null;
  package_stipend: string | null;
  testimonial: string;
  batch_year: number | null;
  is_featured: boolean;
  display_order: number;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type SuccessStoryInsert = Omit<SuccessStory, 'id' | 'created_at' | 'updated_at'>;
export type SuccessStoryUpdate = Partial<SuccessStoryInsert>;
