import { createClient } from '@supabase/supabase-js';
import { Database } from './types';

export function createServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xdkzllsdmxfvkwsstqjc.supabase.co';
  // Use service role key if available for administrative server actions, or fallback to anon key
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhka3psbHNkbXhmdmt3c3N0cWpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2MjgxNjUsImV4cCI6MjEwMDIwNDE2NX0.wJmGEnt0L2ExYgf0PKsmqdcIEA0loOsSdZKj-KxDgQ8';

  return createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
    },
  });
}
