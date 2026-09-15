import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://fbqhbpqrpwvjmslexcoe.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_AvjY2zHviF9oF5CDnY6aAg_T43jjlpJ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const { data, error } = await supabase.from('games_catalog').insert({ name: 'Test Game' }).select();
  console.log("Data:", data);
  console.log("Error:", error);
}

test();
