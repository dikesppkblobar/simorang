import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  (import.meta as any).env?.VITE_SUPABASE_URL ||
  'https://pjofydlrdyxttogrxaju.supabase.co';

const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqb2Z5ZGxyZHl4dHRvZ3J4YWp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1MTk4ODksImV4cCI6MjEwMjA5NTg4OX0.1gdDShBFEymxg5-hbhiPIT6o0MHQHCcB4wETTm0HAqg';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export const supabaseUrl = SUPABASE_URL;
