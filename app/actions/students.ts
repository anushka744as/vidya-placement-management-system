'use server';

import { randomUUID } from 'crypto';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Student, StudentInsert, StudentUpdate } from '@/lib/supabase/student-types';
import { isValidPhone } from '@/lib/utils';

const DOCUMENTS_BUCKET = 'student-documents';

export interface StudentFilters {
  search?: string;
  zone?: string;
  centre?: string;
  job_category?: string;
  status?: string;
}

export async function fetchStudents(filters: StudentFilters = {}): Promise<{ data: Student[]; error?: string }> {
  try {
    const supabase = createServerSupabaseClient();
    let query = (supabase.from('students') as any).select('*');

    if (filters.search && filters.search.trim() !== '') {
      const s = `%${filters.search.trim()}%`;
      query = query.or(`full_name.ilike.${s},email.ilike.${s},phone.ilike.${s},preferred_job_role.ilike.${s}`);
    }
    if (filters.zone && filters.zone !== 'all') query = query.eq('zone', filters.zone);
    if (filters.centre && filters.centre !== 'all') query = query.eq('centre', filters.centre);
    if (filters.job_category && filters.job_category !== 'all') query = query.eq('job_category', filters.job_category);
    if (filters.status && filters.status !== 'all') query = query.eq('status', filters.status);

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching students:', error);
      return { data: [], error: error.message };
    }

    return { data: (data as Student[]) || [] };
  } catch (err: any) {
    return { data: [], error: err.message || 'Failed to load students.' };
  }
}

export async function fetchStudentProfileByEmail(email: string): Promise<{ data?: Student; error?: string }> {
  try {
    if (!email) return {};
    const supabase = createServerSupabaseClient();
    const { data, error } = await (supabase.from('students') as any)
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error) {
      return { error: error.message };
    }

    return { data: (data as Student) || undefined };
  } catch (err: any) {
    return { error: err.message || 'Failed to fetch student profile.' };
  }
}

export async function fetchStudentById(id: string): Promise<{ data?: Student; error?: string }> {
  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await (supabase.from('students') as any)
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return { error: error?.message || 'Student not found.' };
    }

    return { data: data as Student };
  } catch (err: any) {
    return { error: err.message || 'Failed to fetch student.' };
  }
}

function readText(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

function readSkills(formData: FormData): string[] {
  const raw = formData.get('skills');
  if (typeof raw !== 'string' || !raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    return [];
  }
}

async function uploadStudentFile(supabase: ReturnType<typeof createServerSupabaseClient>, studentId: string, file: File, prefix: string): Promise<string> {
  const path = `${studentId}/${prefix}-${Date.now()}-${file.name}`;
  const arrayBuffer = await file.arrayBuffer();
  const { error } = await supabase.storage.from(DOCUMENTS_BUCKET).upload(path, arrayBuffer, {
    contentType: file.type || 'application/octet-stream',
    upsert: true,
  });
  if (error) throw new Error(`Failed to upload ${prefix}: ${error.message}`);
  return path;
}

function buildFieldsFromForm(formData: FormData): StudentInsert {
  return {
    full_name: readText(formData, 'full_name'),
    email: readText(formData, 'email'),
    phone: readText(formData, 'phone'),
    gender: readText(formData, 'gender'),
    date_of_birth: readText(formData, 'date_of_birth'),
    zone: readText(formData, 'zone'),
    centre: readText(formData, 'centre'),
    city: readText(formData, 'city'),
    address: readText(formData, 'address'),
    qualification: readText(formData, 'qualification'),
    institution: readText(formData, 'institution'),
    year_of_passing: readText(formData, 'year_of_passing'),
    percentage_grade: readText(formData, 'percentage_grade'),
    course_name: readText(formData, 'course_name'),
    batch_completion_month: readText(formData, 'batch_completion_month'),
    batch_completion_year: readText(formData, 'batch_completion_year'),
    skills: readSkills(formData),
    preferred_job_role: readText(formData, 'preferred_job_role'),
    salary_expectation: readText(formData, 'salary_expectation'),
    preferred_city: readText(formData, 'preferred_city'),
    travel_preference: readText(formData, 'travel_preference'),
    job_category: readText(formData, 'job_category'),
    status: (readText(formData, 'status') || 'Seeking') as Student['status'],
    photo_url: readText(formData, 'existing_photo_url') || null,
    resume_url: readText(formData, 'existing_resume_url') || null,
    id_proof_url: readText(formData, 'existing_id_proof_url') || null,
    certificate_urls: (() => {
      const raw = formData.get('existing_certificate_urls');
      if (typeof raw !== 'string' || !raw) return [];
      try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
      } catch {
        return [];
      }
    })(),
    company_placed: readText(formData, 'company_placed') || null,
    join_date: readText(formData, 'join_date') || null,
    placed_salary: readText(formData, 'placed_salary') || null,
  };
}

export async function createStudent(formData: FormData): Promise<{ success: boolean; data?: Student; error?: string }> {
  try {
    const fields = buildFieldsFromForm(formData);
    if (!fields.full_name) {
      return { success: false, error: 'Full name is required.' };
    }
    if (!isValidPhone(fields.phone)) {
      return { success: false, error: 'Phone number must be a valid 10-digit number.' };
    }

    const supabase = createServerSupabaseClient();
    const studentId = randomUUID();

    const photo = formData.get('photo') as File | null;
    const resume = formData.get('resume') as File | null;
    const idProof = formData.get('id_proof') as File | null;
    const certificates = formData.getAll('certificates').filter((f): f is File => f instanceof File && f.size > 0);

    if (photo && photo.size > 0) fields.photo_url = await uploadStudentFile(supabase, studentId, photo, 'photo');
    if (resume && resume.size > 0) fields.resume_url = await uploadStudentFile(supabase, studentId, resume, 'resume');
    if (idProof && idProof.size > 0) fields.id_proof_url = await uploadStudentFile(supabase, studentId, idProof, 'id-proof');
    if (certificates.length > 0) {
      const uploaded = await Promise.all(certificates.map((cert) => uploadStudentFile(supabase, studentId, cert, 'certificate')));
      fields.certificate_urls = [...fields.certificate_urls, ...uploaded];
    }

    const { data, error } = await (supabase.from('students') as any)
      .insert({
        id: studentId,
        ...fields,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating student:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data as Student };
  } catch (err: any) {
    return { success: false, error: err.message || 'An error occurred while creating the student.' };
  }
}

export async function updateStudent(id: string, formData: FormData): Promise<{ success: boolean; data?: Student; error?: string }> {
  try {
    const fields = buildFieldsFromForm(formData);
    if (!fields.full_name) {
      return { success: false, error: 'Full name is required.' };
    }
    if (!isValidPhone(fields.phone)) {
      return { success: false, error: 'Phone number must be a valid 10-digit number.' };
    }

    const supabase = createServerSupabaseClient();

    const photo = formData.get('photo') as File | null;
    const resume = formData.get('resume') as File | null;
    const idProof = formData.get('id_proof') as File | null;
    const certificates = formData.getAll('certificates').filter((f): f is File => f instanceof File && f.size > 0);

    if (photo && photo.size > 0) fields.photo_url = await uploadStudentFile(supabase, id, photo, 'photo');
    if (resume && resume.size > 0) fields.resume_url = await uploadStudentFile(supabase, id, resume, 'resume');
    if (idProof && idProof.size > 0) fields.id_proof_url = await uploadStudentFile(supabase, id, idProof, 'id-proof');
    if (certificates.length > 0) {
      const uploaded = await Promise.all(certificates.map((cert) => uploadStudentFile(supabase, id, cert, 'certificate')));
      fields.certificate_urls = [...fields.certificate_urls, ...uploaded];
    }

    const update: StudentUpdate = { ...fields };

    const { data, error } = await (supabase.from('students') as any)
      .update({ ...update, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating student:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data as Student };
  } catch (err: any) {
    return { success: false, error: err.message || 'An error occurred while updating the student.' };
  }
}

export async function deleteStudent(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServerSupabaseClient();

    const { data: student } = await (supabase.from('students') as any)
      .select('photo_url, resume_url, id_proof_url, certificate_urls')
      .eq('id', id)
      .single();

    const paths = [
      student?.photo_url,
      student?.resume_url,
      student?.id_proof_url,
      ...(Array.isArray(student?.certificate_urls) ? student.certificate_urls : []),
    ].filter(Boolean) as string[];

    if (paths.length > 0) {
      await supabase.storage.from(DOCUMENTS_BUCKET).remove(paths);
    }

    const { error } = await (supabase.from('students') as any).delete().eq('id', id);

    if (error) {
      console.error('Error deleting student:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'An error occurred while deleting the student.' };
  }
}

function computeAge(dateOfBirth: string): number | null {
  const birth = new Date(dateOfBirth);
  if (Number.isNaN(birth.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

export async function createStudentFromPortal(formData: FormData): Promise<{ success: boolean; data?: Student; error?: string }> {
  const res = await createStudent(formData);
  if (!res.success || !res.data) {
    return res;
  }

  try {
    const supabase = createServerSupabaseClient();
    const s = res.data;
    const now = new Date().toISOString();
    await (supabase.from('placement_records') as any).insert({
      full_name: s.full_name,
      contact_number: s.phone || '',
      email: s.email,
      age: s.date_of_birth ? computeAge(s.date_of_birth) : null,
      date_of_birth: s.date_of_birth || null,
      gender: s.gender || null,
      address: s.address || null,
      institution: s.institution || null,
      year_of_passing: s.year_of_passing || null,
      percentage_grade: s.percentage_grade || null,
      job_category: s.job_category || null,
      travel_preference: s.travel_preference || null,
      current_location: s.city || null,
      qualification: s.qualification || null,
      zone: s.zone || null,
      centre: s.centre || null,
      course_name: s.course_name || null,
      batch_completion_month: s.batch_completion_month || null,
      batch_completion_year: s.batch_completion_year || null,
      technical_skills: s.skills?.length ? s.skills.join(', ') : null,
      work_experience: null,
      nature_of_employment: null,
      preferred_job_role: s.preferred_job_role || null,
      preferred_location: s.preferred_city || null,
      expected_salary_stipend: s.salary_expectation || null,
      additional_notes: null,
      source: 'student_portal',
      created_by: null,
      created_at: now,
      updated_at: now,
    });
  } catch (err) {
    console.error('Could not seed placement record from portal signup:', err);
  }

  return res;
}

export interface LinkableRecordFields {
  full_name: string;
  email: string;
  contact_number?: string | null;
  current_location?: string | null;
  qualification?: string | null;
  zone?: string | null;
  centre?: string | null;
  technical_skills?: string | null;
  preferred_job_role?: string | null;
  preferred_location?: string | null;
  expected_salary_stipend?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;
  address?: string | null;
  institution?: string | null;
  year_of_passing?: string | null;
  percentage_grade?: string | null;
  job_category?: string | null;
  travel_preference?: string | null;
  course_name?: string | null;
  batch_completion_month?: string | null;
  batch_completion_year?: string | number | null;
}

// Placement Records (manual entry / CSV import) don't carry document uploads or job
// application tracking — both live on the `students` table. This creates the linked
// students row (by email) the first time a placement record needs that functionality,
// and is a no-op if one already exists so we never end up with duplicate email rows.
export async function ensureStudentLinkedByEmail(record: LinkableRecordFields): Promise<void> {
  if (!record.email) return;

  try {
    const supabase = createServerSupabaseClient();
    const { data: existing } = await (supabase.from('students') as any).select('id').eq('email', record.email).maybeSingle();
    if (existing) return;

    const now = new Date().toISOString();
    await (supabase.from('students') as any).insert({
      full_name: record.full_name,
      email: record.email,
      phone: record.contact_number || '',
      gender: record.gender || '',
      date_of_birth: record.date_of_birth || '',
      zone: record.zone || '',
      centre: record.centre || '',
      city: record.current_location || '',
      address: record.address || '',
      qualification: record.qualification || '',
      institution: record.institution || '',
      year_of_passing: record.year_of_passing || '',
      percentage_grade: record.percentage_grade || '',
      course_name: record.course_name || '',
      batch_completion_month: record.batch_completion_month || '',
      batch_completion_year: record.batch_completion_year != null ? String(record.batch_completion_year) : '',
      skills: record.technical_skills ? record.technical_skills.split(',').map((s) => s.trim()).filter(Boolean) : [],
      preferred_job_role: record.preferred_job_role || '',
      salary_expectation: record.expected_salary_stipend || '',
      preferred_city: record.preferred_location || '',
      travel_preference: record.travel_preference || 'Within City',
      job_category: record.job_category || '',
      status: 'Seeking',
      photo_url: null,
      resume_url: null,
      id_proof_url: null,
      certificate_urls: [],
      company_placed: null,
      join_date: null,
      placed_salary: null,
      created_at: now,
      updated_at: now,
    });
  } catch (err) {
    console.error('Could not link placement record to a student profile:', err);
  }
}

export async function updateStudentDocuments(studentId: string, formData: FormData): Promise<{ success: boolean; data?: Student; error?: string }> {
  try {
    const supabase = createServerSupabaseClient();
    const update: Partial<StudentUpdate> = {};

    const photo = formData.get('photo') as File | null;
    const resume = formData.get('resume') as File | null;
    const idProof = formData.get('id_proof') as File | null;
    const certificates = formData.getAll('certificates').filter((f): f is File => f instanceof File && f.size > 0);

    if (photo && photo.size > 0) update.photo_url = await uploadStudentFile(supabase, studentId, photo, 'photo');
    if (resume && resume.size > 0) update.resume_url = await uploadStudentFile(supabase, studentId, resume, 'resume');
    if (idProof && idProof.size > 0) update.id_proof_url = await uploadStudentFile(supabase, studentId, idProof, 'id-proof');
    if (certificates.length > 0) {
      const uploaded = await Promise.all(certificates.map((cert) => uploadStudentFile(supabase, studentId, cert, 'certificate')));
      const { data: current } = await (supabase.from('students') as any).select('certificate_urls').eq('id', studentId).maybeSingle();
      update.certificate_urls = [...(current?.certificate_urls || []), ...uploaded];
    }

    if (Object.keys(update).length === 0) {
      return { success: false, error: 'No files selected.' };
    }

    const { data, error } = await (supabase.from('students') as any)
      .update({ ...update, updated_at: new Date().toISOString() })
      .eq('id', studentId)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as Student };
  } catch (err: any) {
    return { success: false, error: err.message || 'Could not upload documents.' };
  }
}

export async function getStudentDocumentSignedUrl(path: string): Promise<{ url?: string; error?: string }> {
  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase.storage.from(DOCUMENTS_BUCKET).createSignedUrl(path, 60 * 10);

    if (error || !data) {
      return { error: error?.message || 'Could not generate document link.' };
    }

    return { url: data.signedUrl };
  } catch (err: any) {
    return { error: err.message || 'Could not generate document link.' };
  }
}

export async function getStudentDocumentSignedUrls(paths: string[]): Promise<{ urls: Record<string, string>; error?: string }> {
  const uniquePaths = Array.from(new Set(paths.filter(Boolean)));
  if (uniquePaths.length === 0) return { urls: {} };

  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase.storage.from(DOCUMENTS_BUCKET).createSignedUrls(uniquePaths, 60 * 10);

    if (error || !data) {
      return { urls: {}, error: error?.message || 'Could not generate document links.' };
    }

    const urls: Record<string, string> = {};
    data.forEach((entry, i) => {
      if (entry.signedUrl) urls[uniquePaths[i]] = entry.signedUrl;
    });
    return { urls };
  } catch (err: any) {
    return { urls: {}, error: err.message || 'Could not generate document links.' };
  }
}
