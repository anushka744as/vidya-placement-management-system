'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { SuccessStory } from '@/lib/supabase/success-story-types';

const PHOTOS_BUCKET = 'success-story-photos';

export async function fetchFeaturedSuccessStories(): Promise<{ data: SuccessStory[]; error?: string }> {
  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await (supabase.from('success_stories') as any)
      .select('*')
      .eq('is_featured', true)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      return { data: [], error: error.message };
    }

    return { data: (data as SuccessStory[]) || [] };
  } catch (err: any) {
    return { data: [], error: err.message || 'Failed to load success stories.' };
  }
}

export async function fetchAllSuccessStories(): Promise<{ data: SuccessStory[]; error?: string }> {
  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await (supabase.from('success_stories') as any)
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      return { data: [], error: error.message };
    }

    return { data: (data as SuccessStory[]) || [] };
  } catch (err: any) {
    return { data: [], error: err.message || 'Failed to load success stories.' };
  }
}

function readText(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

async function uploadStoryPhoto(supabase: ReturnType<typeof createServerSupabaseClient>, file: File): Promise<string> {
  const path = `${Date.now()}-${file.name}`;
  const arrayBuffer = await file.arrayBuffer();
  const { error } = await supabase.storage.from(PHOTOS_BUCKET).upload(path, arrayBuffer, {
    contentType: file.type || 'image/jpeg',
    upsert: true,
  });
  if (error) throw new Error(`Failed to upload photo: ${error.message}`);

  const { data } = supabase.storage.from(PHOTOS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function createSuccessStory(formData: FormData): Promise<{ success: boolean; data?: SuccessStory; error?: string }> {
  try {
    const studentName = readText(formData, 'student_name');
    const testimonial = readText(formData, 'testimonial');
    if (!studentName || !testimonial) {
      return { success: false, error: 'Student name and testimonial are required.' };
    }

    const supabase = createServerSupabaseClient();
    let photoUrl = readText(formData, 'existing_photo_url') || null;
    const photo = formData.get('photo') as File | null;
    if (photo && photo.size > 0) {
      photoUrl = await uploadStoryPhoto(supabase, photo);
    }

    const batchYear = readText(formData, 'batch_year');
    const displayOrder = readText(formData, 'display_order');

    const { data, error } = await (supabase.from('success_stories') as any)
      .insert({
        student_name: studentName,
        photo_url: photoUrl,
        course_name: readText(formData, 'course_name') || null,
        centre: readText(formData, 'centre') || null,
        zone: readText(formData, 'zone') || null,
        company_placed: readText(formData, 'company_placed') || null,
        job_role: readText(formData, 'job_role') || null,
        package_stipend: readText(formData, 'package_stipend') || null,
        testimonial,
        batch_year: batchYear ? Number(batchYear) : null,
        is_featured: formData.get('is_featured') === 'true',
        display_order: displayOrder ? Number(displayOrder) : 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating success story:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data as SuccessStory };
  } catch (err: any) {
    return { success: false, error: err.message || 'An error occurred while creating the success story.' };
  }
}

export async function updateSuccessStory(id: string, formData: FormData): Promise<{ success: boolean; data?: SuccessStory; error?: string }> {
  try {
    const studentName = readText(formData, 'student_name');
    const testimonial = readText(formData, 'testimonial');
    if (!studentName || !testimonial) {
      return { success: false, error: 'Student name and testimonial are required.' };
    }

    const supabase = createServerSupabaseClient();
    let photoUrl = readText(formData, 'existing_photo_url') || null;
    const photo = formData.get('photo') as File | null;
    if (photo && photo.size > 0) {
      photoUrl = await uploadStoryPhoto(supabase, photo);
    }

    const batchYear = readText(formData, 'batch_year');
    const displayOrder = readText(formData, 'display_order');

    const { data, error } = await (supabase.from('success_stories') as any)
      .update({
        student_name: studentName,
        photo_url: photoUrl,
        course_name: readText(formData, 'course_name') || null,
        centre: readText(formData, 'centre') || null,
        zone: readText(formData, 'zone') || null,
        company_placed: readText(formData, 'company_placed') || null,
        job_role: readText(formData, 'job_role') || null,
        package_stipend: readText(formData, 'package_stipend') || null,
        testimonial,
        batch_year: batchYear ? Number(batchYear) : null,
        is_featured: formData.get('is_featured') === 'true',
        display_order: displayOrder ? Number(displayOrder) : 0,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating success story:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data as SuccessStory };
  } catch (err: any) {
    return { success: false, error: err.message || 'An error occurred while updating the success story.' };
  }
}

export async function deleteSuccessStory(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServerSupabaseClient();
    const { error } = await (supabase.from('success_stories') as any).delete().eq('id', id);

    if (error) {
      console.error('Error deleting success story:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'An error occurred while deleting the success story.' };
  }
}
