
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error(
    "CRITICAL: Supabase URL (NEXT_PUBLIC_SUPABASE_URL) is missing. Supabase cannot initialize.\n" +
    "- If using Firebase Studio: Set this in your project's Environment Variable settings.\n" +
    "- For local development: Ensure it's in a .env.local file at your project root and you've restarted your dev server.\n" +
    "The variable MUST be prefixed with NEXT_PUBLIC_."
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    "CRITICAL: Supabase Anon Key (NEXT_PUBLIC_SUPABASE_ANON_KEY) is missing. Supabase cannot initialize.\n" +
    "- If using Firebase Studio: Set this in your project's Environment Variable settings.\n" +
    "- For local development: Ensure it's in a .env.local file at your project root and you've restarted your dev server.\n" +
    "The variable MUST be prefixed with NEXT_PUBLIC_."
  );
}

let supabase: SupabaseClient;
try {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} catch (e: any) {
  console.error("Supabase client creation error:", e);
  throw new Error(
    `CRITICAL: Supabase client initialization failed. Check your Supabase URL and Anon Key. Original error: ${e.message}`
  );
}


export { supabase };
