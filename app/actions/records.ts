'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { PlacementRecord, PlacementRecordInsert, PlacementRecordUpdate } from '@/lib/supabase/types';
import { ensureStudentLinkedByEmail } from '@/app/actions/students';
import { isValidPhone } from '@/lib/utils';

// `age` and `batch_completion_year` are integer columns in the DB, but data coming in
// (CSV rows, manual entry) can be messy — e.g. "December 2025" instead of a bare year.
// Pull out the numeric value here so a bad value never reaches Postgres as raw text.
function toSafeInteger(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return Number.isFinite(value) ? Math.trunc(value) : null;
  const match = String(value).match(/\d+/);
  if (!match) return null;
  const n = Number(match[0]);
  return Number.isFinite(n) ? n : null;
}

function sanitizeIntegerFields<T extends Partial<PlacementRecordInsert>>(record: T): T {
  return {
    ...record,
    age: 'age' in record ? toSafeInteger(record.age) : record.age,
    batch_completion_year: 'batch_completion_year' in record ? toSafeInteger(record.batch_completion_year) : record.batch_completion_year,
  };
}

// The same person can arrive through more than one path — self-signup via the student
// portal, a manual entry, or a CSV row — all keyed by the same email. Rather than ever
// inserting a second row for an email that's already here, this updates the existing
// row in place so the candidate only ever shows up once in Placement Records.
async function upsertPlacementRecordByEmail(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  record: PlacementRecordInsert
): Promise<{ data?: PlacementRecord; error?: string }> {
  const { data: existing } = await (supabase.from('placement_records') as any).select('id').eq('email', record.email).maybeSingle();

  if (existing) {
    const { data, error } = await (supabase.from('placement_records') as any)
      .update({ ...record, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
      .select()
      .single();
    if (error) return { error: error.message };
    return { data: data as PlacementRecord };
  }

  const { data, error } = await (supabase.from('placement_records') as any)
    .insert({ ...record, created_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .select()
    .single();
  if (error) return { error: error.message };
  return { data: data as PlacementRecord };
}

export interface RecordFilters {
  search?: string;
  zone?: string;
  centre?: string;
  course_name?: string;
  nature_of_employment?: string;
  batch_completion_year?: string;
  page?: number;
  pageSize?: number;
}

export interface FetchRecordsResponse {
  data: PlacementRecord[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  error?: string;
}

export async function fetchPlacementRecords(filters: RecordFilters = {}): Promise<FetchRecordsResponse> {
  try {
    const supabase = createServerSupabaseClient();
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 10;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = (supabase.from('placement_records') as any)
      .select('*', { count: 'exact' });

    if (filters.search && filters.search.trim() !== '') {
      const s = `%${filters.search.trim()}%`;
      query = query.or(`full_name.ilike.${s},email.ilike.${s},contact_number.ilike.${s},technical_skills.ilike.${s}`);
    }

    if (filters.zone && filters.zone !== 'all') {
      query = query.eq('zone', filters.zone);
    }

    if (filters.centre && filters.centre !== 'all') {
      query = query.eq('centre', filters.centre);
    }

    if (filters.course_name && filters.course_name !== 'all') {
      query = query.eq('course_name', filters.course_name);
    }

    if (filters.nature_of_employment && filters.nature_of_employment !== 'all') {
      query = query.eq('nature_of_employment', filters.nature_of_employment);
    }

    if (filters.batch_completion_year && filters.batch_completion_year !== 'all') {
      query = query.eq('batch_completion_year', filters.batch_completion_year);
    }

    query = query.order('created_at', { ascending: false }).range(from, to);

    const { data, count, error } = await query;

    if (error) {
      console.error('Error fetching records:', error);
      return { data: [], total: 0, page, pageSize, totalPages: 0, error: error.message };
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / pageSize) || 1;

    return {
      data: (data as PlacementRecord[]) || [],
      total,
      page,
      pageSize,
      totalPages,
    };
  } catch (err: any) {
    console.error('Unexpected error fetching records:', err);
    return { data: [], total: 0, page: 1, pageSize: 10, totalPages: 0, error: err.message || 'Failed to fetch records' };
  }
}

export async function createPlacementRecord(recordData: PlacementRecordInsert): Promise<{ success: boolean; data?: PlacementRecord; error?: string }> {
  try {
    if (!recordData.full_name || !recordData.contact_number || !recordData.email) {
      return { success: false, error: 'Full Name, Contact Number, and Email are required.' };
    }
    if (!isValidPhone(recordData.contact_number)) {
      return { success: false, error: 'Contact Number must be a valid 10-digit number.' };
    }

    const supabase = createServerSupabaseClient();
    const { data, error } = await upsertPlacementRecordByEmail(supabase, {
      ...sanitizeIntegerFields(recordData),
      source: recordData.source || 'manual',
    });

    if (error || !data) {
      console.error('Error saving record:', error);
      return { success: false, error };
    }

    await ensureStudentLinkedByEmail(data);

    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message || 'An error occurred while creating record.' };
  }
}

export async function fetchPlacementRecordByEmail(email: string): Promise<{ data?: PlacementRecord; error?: string }> {
  try {
    if (!email) return {};
    const supabase = createServerSupabaseClient();
    const { data, error } = await (supabase.from('placement_records') as any).select('*').eq('email', email).maybeSingle();
    if (error) return { error: error.message };
    return { data: (data as PlacementRecord) || undefined };
  } catch (err: any) {
    return { error: err.message || 'Failed to fetch record.' };
  }
}

export async function updatePlacementRecord(id: string, recordData: PlacementRecordUpdate): Promise<{ success: boolean; data?: PlacementRecord; error?: string }> {
  try {
    if ('contact_number' in recordData && !isValidPhone(recordData.contact_number)) {
      return { success: false, error: 'Contact Number must be a valid 10-digit number.' };
    }

    const supabase = createServerSupabaseClient();
    const { data, error } = await (supabase.from('placement_records') as any)
      .update({
        ...sanitizeIntegerFields(recordData),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating record:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data as PlacementRecord };
  } catch (err: any) {
    return { success: false, error: err.message || 'An error occurred while updating record.' };
  }
}

export async function deletePlacementRecord(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServerSupabaseClient();
    const { error } = await (supabase.from('placement_records') as any)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting record:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'An error occurred while deleting record.' };
  }
}

export interface BulkInsertResult {
  insertedCount: number;
  failedCount: number;
  errors: { rowIndex: number; recordName: string; reason: string }[];
}

export async function bulkInsertPlacementRecords(
  records: PlacementRecordInsert[]
): Promise<{ success: boolean; result?: BulkInsertResult; error?: string }> {
  try {
    const supabase = createServerSupabaseClient();
    const errors: { rowIndex: number; recordName: string; reason: string }[] = [];
    let insertedCount = 0;

    // Upsert one row at a time (by email) rather than a blind batch insert, so a CSV
    // row for someone already in the system (e.g. a prior portal signup or an earlier
    // import) updates that existing record instead of creating a duplicate.
    const concurrency = 10;
    for (let i = 0; i < records.length; i += concurrency) {
      const batch = records.slice(i, i + concurrency);
      const results = await Promise.all(
        batch.map((r) =>
          isValidPhone(r.contact_number)
            ? upsertPlacementRecordByEmail(supabase, { ...sanitizeIntegerFields(r), source: 'csv_upload' })
            : Promise.resolve<{ data?: PlacementRecord; error?: string }>({ error: 'Contact Number must be a valid 10-digit number.' })
        )
      );

      for (let j = 0; j < results.length; j++) {
        const globalIdx = i + j + 1;
        const { data, error } = results[j];
        if (error || !data) {
          errors.push({
            rowIndex: globalIdx,
            recordName: batch[j].full_name || `Row ${globalIdx}`,
            reason: error || 'Unknown error',
          });
        } else {
          insertedCount++;
          await ensureStudentLinkedByEmail(data);
        }
      }
    }

    return {
      success: true,
      result: {
        insertedCount,
        failedCount: errors.length,
        errors,
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Bulk insert failed due to server error.' };
  }
}
