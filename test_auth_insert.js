import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  // Login as a test user
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'test@test.com',
    password: 'password123'
  });
  
  if (authError) {
    // try sign up
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: 'test@test.com',
      password: 'password123'
    });
    if (signUpError) {
      console.log("Signup error:", signUpError);
      return;
    }
  }

  const { data, error } = await supabase.from('games_catalog').insert({
    name: 'Test Game BGG',
    description: 'A nice game',
    is_expansion: false,
    bgg_image: 'http://example.com/img.jpg'
  }).select().single();
  
  console.log("Insert Data:", data);
  console.log("Insert Error:", error);
}

test();
