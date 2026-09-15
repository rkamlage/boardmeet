import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://fbqhbpqrpwvjmslexcoe.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_AvjY2zHviF9oF5CDnY6aAg_T43jjlpJ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
