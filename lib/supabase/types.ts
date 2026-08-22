export type NatureOfEmployment = 'Full-Time' | 'Part-Time' | 'Internship';

export interface PlacementRecord {
  id: string;
  full_name: string;
  contact_number: string;
  email: string;
  age: number | null;
  date_of_birth: string | null;
  gender: string | null;
  address: string | null;
  institution: string | null;
  year_of_passing: string | null;
  percentage_grade: string | null;
  job_category: string | null;
  travel_preference: string | null;
  current_location: string | null;
  qualification: string | null;
  zone: string | null;
  centre: string | null;
  course_name: string | null;
  batch_completion_month: string | null;
  batch_completion_year: number | string | null;
  technical_skills: string | null;
  work_experience: string | null;
  nature_of_employment: NatureOfEmployment | null;
  preferred_job_role: string | null;
  preferred_location: string | null;
  expected_salary_stipend: string | null;
  additional_notes: string | null;
  source: 'manual' | 'csv_upload' | string;
  created_by: string | null;
  created_at?: string;
  updated_at?: string;
}

export type PlacementRecordInsert = Omit<PlacementRecord, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
};

export type PlacementRecordUpdate = Partial<PlacementRecordInsert>;

export interface Database {
  public: {
    Tables: {
      placement_records: {
        Row: PlacementRecord;
        Insert: PlacementRecordInsert;
        Update: PlacementRecordUpdate;
      };
    };
  };
}
