import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from './environment.config';

// Client for public operations (anon key)
export const supabasePublic: SupabaseClient = createClient(
  config.SUPABASE_URL,
  config.SUPABASE_ANON_KEY
);

// Client for admin operations (service key)
export const supabaseAdmin: SupabaseClient = createClient(
  config.SUPABASE_URL,
  config.SUPABASE_SERVICE_KEY
);

export default { supabasePublic, supabaseAdmin };