import { createClient } from '@supabase/supabase-js';
import { Database } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xdkzllsdmxfvkwsstqjc.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhka3psbHNkbXhmdmt3c3N0cWpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2MjgxNjUsImV4cCI6MjEwMDIwNDE2NX0.wJmGEnt0L2ExYgf0PKsmqdcIEA0loOsSdZKj-KxDgQ8';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
