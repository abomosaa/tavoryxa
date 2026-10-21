import { createClient } from '@supabase/supabase-js';
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
export const supabase =
  url && key
    ? createClient(url, key, { auth: { storageKey: 'tavoryxa.auth', flowType: 'pkce' } })
    : null;
export const githubEnabled =
  Boolean(supabase) && import.meta.env.VITE_GITHUB_AUTH_ENABLED === 'true';
