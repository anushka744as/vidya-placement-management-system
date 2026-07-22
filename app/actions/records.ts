'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { PlacementRecord, PlacementRecordInsert, PlacementRecordUpdate } from '@/lib/supabase/types';

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

    const supabase = createServerSupabaseClient();
    const { data, error } = await (supabase.from('placement_records') as any)
      .insert({
        ...recordData,
        source: recordData.source || 'manual',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting record:', error);
      if (error.code === '23505') {
        return { success: false, error: 'A record with this email or contact number already exists.' };
      }
      return { success: false, error: error.message };
    }

    return { success: true, data: data as PlacementRecord };
  } catch (err: any) {
    return { success: false, error: err.message || 'An error occurred while creating record.' };
  }
}

export async function updatePlacementRecord(id: string, recordData: PlacementRecordUpdate): Promise<{ success: boolean; data?: PlacementRecord; error?: string }> {
  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await (supabase.from('placement_records') as any)
      .update({
        ...recordData,
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

    const batchSize = 50;
    for (let i = 0; i < records.length; i += batchSize) {
      const chunk = records.slice(i, i + batchSize).map(r => ({
        ...r,
        source: 'csv_upload',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      const { data, error } = await (supabase.from('placement_records') as any)
        .insert(chunk)
        .select();

      if (error) {
        console.warn(`Batch insert failed for chunk starting at index ${i}, falling back to row-by-row insertion:`, error.message);
        for (let j = 0; j < chunk.length; j++) {
          const singleRecord = chunk[j];
          const globalIdx = i + j + 1;
          const { error: singleError } = await (supabase.from('placement_records') as any)
            .insert(singleRecord);

          if (singleError) {
            errors.push({
              rowIndex: globalIdx,
              recordName: singleRecord.full_name || `Row ${globalIdx}`,
              reason: singleError.message,
            });
          } else {
            insertedCount++;
          }
        }
      } else {
        insertedCount += data ? data.length : chunk.length;
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
