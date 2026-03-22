import { createClient } from '@supabase/supabase-js';

// Headless Subapase configuration mapping to Railway Postgres
// Ensure your `.env` contains NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY 
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock_key';

export const supabase = createClient(supabaseUrl, supabaseKey);
