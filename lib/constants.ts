export const ZONES = [
  'North Zone',
  'South Zone',
  'East Zone',
  'West Zone',
  'Central Zone',
] as const;

export const CENTRES: Record<string, string[]> = {
  'North Zone': ['Delhi (Munirka)', 'Delhi (Gurugram)', 'Noida Sector 62', 'Chandigarh'],
  'South Zone': ['Bengaluru (Whitefield)', 'Hyderabad (Hitech)', 'Chennai (Guindy)', 'Kochi'],
  'East Zone': ['Kolkata (Salt Lake)', 'Bhubaneswar', 'Patna'],
  'West Zone': ['Mumbai (Thane)', 'Pune (Hinjewadi)', 'Ahmedabad'],
  'Central Zone': ['Indore', 'Bhopal', 'Nagpur', 'Raipur'],
};

export const ALL_CENTRES = Object.values(CENTRES).flat();

export const COURSES = [
  'Full Stack Web Development',
  'Data Analytics & Python',
  'Digital Marketing & SEO',
  'UI/UX Design',
  'Cybersecurity Fundamentals',
  'Cloud Computing & DevOps',
  'Banking & Financial Services',
  'Business Development & Sales',
] as const;

export const JOB_CATEGORIES = [
  'Retail & E-commerce',
  'BPO & Customer Care',
  'IT & Software',
  'Banking & Finance',
  'Healthcare',
  'Digital Marketing & Media',
  'Hospitality & Tourism',
  'Electrical & Trade Services',
] as const;

export const SALARY_RANGE_BUCKETS: { label: string; min: number; max: number }[] = [
  { label: 'Below ₹10,000/month', min: 0, max: 10000 },
  { label: '₹10,000 - ₹20,000/month', min: 10000, max: 20000 },
  { label: '₹20,000 - ₹30,000/month', min: 20000, max: 30000 },
  { label: '₹30,000 - ₹50,000/month', min: 30000, max: 50000 },
  { label: 'Above ₹50,000/month', min: 50000, max: Infinity },
];

export function jobMatchesSalaryBucket(
  job: { salary_min?: number | null; salary_max?: number | null },
  bucketLabel: string
): boolean {
  if (bucketLabel === 'all') return true;
  const bucket = SALARY_RANGE_BUCKETS.find((b) => b.label === bucketLabel);
  if (!bucket) return true;
  const jobMin = job.salary_min ?? null;
  const jobMax = job.salary_max ?? jobMin;
  if (jobMin == null && jobMax == null) return false;
  const lo = jobMin ?? jobMax!;
  const hi = jobMax ?? jobMin!;
  return lo <= bucket.max && hi >= bucket.min;
}

export const NATURE_OF_EMPLOYMENT = [
  'Full-Time',
  'Part-Time',
  'Internship',
] as const;

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
] as const;

export const BATCH_YEARS = Array.from({ length: 10 }, (_, i) => (new Date().getFullYear() - 5 + i).toString());

// System Field Schema Definition for Mapping & Validation
export const FIELD_DEFINITIONS: {
  key: string;
  label: string;
  required: boolean;
  type: 'text' | 'number' | 'email' | 'enum' | 'date';
  enumOptions?: readonly string[];
  aliases: string[];
}[] = [
  { key: 'full_name', label: 'Full Name', required: true, type: 'text', aliases: ['name', 'full_name', 'fullname', 'candidate_name', 'student_name'] },
  { key: 'contact_number', label: 'Contact Number', required: true, type: 'text', aliases: ['contact', 'phone', 'contact_number', 'mobile', 'phone_number', 'mobile_number'] },
  { key: 'email', label: 'Email Address', required: true, type: 'email', aliases: ['email', 'email_address', 'mail', 'emailid', 'e_mail', 'student_email', 'candidate_email', 'personal_email', 'official_email'] },
  { key: 'date_of_birth', label: 'Date of Birth', required: false, type: 'date', aliases: ['date_of_birth', 'dob', 'birth_date', 'dateofbirth', 'birthday'] },
  { key: 'current_location', label: 'Current Location', required: false, type: 'text', aliases: ['location', 'city', 'current_location', 'address'] },
  { key: 'qualification', label: 'Qualification', required: false, type: 'text', aliases: ['qualification', 'degree', 'education', 'highest_qualification'] },
  { key: 'zone', label: 'Zone', required: false, type: 'text', aliases: ['zone', 'region'] },
  { key: 'centre', label: 'Centre', required: false, type: 'text', aliases: ['centre', 'center', 'training_centre', 'branch'] },
  { key: 'course_name', label: 'Course Name', required: false, type: 'text', aliases: ['course', 'course_name', 'program', 'stream'] },
  { key: 'batch_completion_month', label: 'Completion Month', required: false, type: 'text', aliases: ['batch_completion_month', 'completion_month', 'passout_month', 'month'] },
  { key: 'batch_completion_year', label: 'Completion Year', required: false, type: 'number', aliases: ['batch_completion_year', 'completion_year', 'passout_year', 'year', 'batch_year'] },
  { key: 'technical_skills', label: 'Technical Skills', required: false, type: 'text', aliases: ['technical_skills', 'skills', 'tech_skills', 'skill_set'] },
  { key: 'work_experience', label: 'Work Experience', required: false, type: 'text', aliases: ['work_experience', 'experience', 'past_experience', 'exp'] },
  { key: 'nature_of_employment', label: 'Employment Type', required: false, type: 'enum', enumOptions: NATURE_OF_EMPLOYMENT, aliases: ['nature_of_employment', 'employment_nature', 'job_type', 'employment_type'] },
  { key: 'preferred_job_role', label: 'Preferred Job Role', required: false, type: 'text', aliases: ['preferred_job_role', 'preferred_role', 'role', 'target_role'] },
  { key: 'preferred_location', label: 'Preferred Location', required: false, type: 'text', aliases: ['preferred_location', 'job_location', 'desired_location'] },
  { key: 'expected_salary_stipend', label: 'Expected Package / Salary / Stipend', required: false, type: 'text', aliases: ['expected_salary_stipend', 'expected_salary', 'expected_monthly_salary', 'expected_package', 'stipend', 'ctc_expectation', 'salary', 'monthly_salary', 'package', 'lpa'] },
  { key: 'additional_notes', label: 'Additional Notes', required: false, type: 'text', aliases: ['additional_notes', 'notes', 'remarks', 'comments'] },
];
