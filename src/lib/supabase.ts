import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../backend/types/database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

/**
 * True when env vars are missing (e.g. Vercel deploy without secrets configured).
 * The app still renders — it just can't connect to Supabase.
 * A banner in App.tsx guides the user.
 */
export const supabaseMisconfigured = !supabaseUrl || !supabaseKey;

// Use placeholder values so createClient() never throws at import time.
// All actual DB calls will fail gracefully with network errors rather than
// crashing the whole bundle before React mounts.
export const supabase = createClient<Database>(
  supabaseUrl  || 'https://placeholder.supabase.co',
  supabaseKey  || 'placeholder-anon-key',
);
