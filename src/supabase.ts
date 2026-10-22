import { createClient } from '@supabase/supabase-js';
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
export const supabase =
  url && key
    ? createClient(url, key, { auth: { storageKey: 'tavoryxa.auth', flowType: 'pkce' } })
    : null;

// Subscribe before React mounts: PKCE initialization can emit recovery very early.
// URL parameters only request a status message; they never authorize a password update.
export interface RecoveryGrant {
  readonly owner: string;
  readonly accessToken: string;
}
let recoveryGrant: RecoveryGrant | null = null;
export const recoveryCallbackRequested =
  typeof window !== 'undefined' &&
  new URL(window.location.href).searchParams.get('auth') === 'recovery';
export const getRecoveryUserId = () => recoveryGrant?.owner ?? null;
export const getRecoveryGrant = () => recoveryGrant;
export function clearRecoverySignal() {
  recoveryGrant = null;
  const current = new URL(window.location.href);
  if (current.searchParams.get('auth') === 'recovery') {
    for (const key of ['auth', 'code', 'error', 'error_code', 'error_description']) {
      current.searchParams.delete(key);
    }
    window.history.replaceState(window.history.state, '', current);
  }
}
const recoveryListener = supabase?.auth.onAuthStateChange((event, session) => {
  if (event === 'PASSWORD_RECOVERY' && session?.user.id && session.access_token) {
    if (
      recoveryGrant?.owner !== session.user.id ||
      recoveryGrant.accessToken !== session.access_token
    ) {
      recoveryGrant = Object.freeze({ owner: session.user.id, accessToken: session.access_token });
    }
  } else if (
    event === 'SIGNED_OUT' ||
    event === 'SIGNED_IN' ||
    (session && recoveryGrant && session.user.id !== recoveryGrant.owner)
  ) {
    recoveryGrant = null;
  }
});
if (import.meta.hot)
  import.meta.hot.dispose(() => recoveryListener?.data.subscription.unsubscribe());
