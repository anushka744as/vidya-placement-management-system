'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function fetchUserRole(userId: string): Promise<{ role?: string; error?: string }> {
  try {
    if (!userId) return {};
    const supabase = createServerSupabaseClient();
    const { data, error } = await (supabase.from('profiles') as any).select('role').eq('id', userId).maybeSingle();
    if (error) return { error: error.message };
    return { role: data?.role };
  } catch (err: any) {
    return { error: err.message || 'Failed to fetch user role.' };
  }
}
