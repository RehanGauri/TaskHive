import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase configuration error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in environment variables.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// v1→v2 compatibility: some legacy code might call auth.session()
if (!supabase.auth.session) {
  supabase.auth.session = async () => {
    const { data } = await supabase.auth.getSession();
    return data?.session || null;
  };
}

