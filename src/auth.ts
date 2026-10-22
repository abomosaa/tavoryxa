import { authConfig } from './auth-config';
import type { RecoveryGrant } from './supabase';

export interface AuthCapabilities {
  email: boolean;
  google: boolean;
  github: boolean;
  signup: boolean;
}
export function parseAuthSettings(value: unknown): AuthCapabilities {
  if (!value || typeof value !== 'object' || !('external' in value)) {
    throw new Error('Unavailable settings');
  }
  const external = value.external;
  if (!external || typeof external !== 'object') throw new Error('Unavailable settings');
  const settings = external as Record<string, unknown>;
  return {
    email: settings.email === true,
    google: settings.google === true,
    github: settings.github === true,
    signup: 'disable_signup' in value && value.disable_signup === false,
  };
}
export async function loadAuthSettings(signal: AbortSignal): Promise<AuthCapabilities> {
  if (!authConfig.url || !authConfig.publishableKey) throw new Error('Unavailable settings');
  const response = await fetch(`${authConfig.url.replace(/\/$/, '')}/auth/v1/settings`, {
    headers: { apikey: authConfig.publishableKey },
    credentials: 'omit',
    cache: 'no-store',
    signal,
  });
  if (!response.ok) throw new Error('Unavailable settings');
  return parseAuthSettings(await response.json());
}
export function passwordIssue(password: string, confirmation: string) {
  if (password.length < 8 || password.length > 128) return 'length';
  if (password !== confirmation) return 'mismatch';
  return null;
}
export function authErrorKind(value: unknown) {
  if (!value || typeof value !== 'object') return 'generic';
  if ('status' in value && value.status === 429) return 'rate';
  if ('code' in value) {
    if (value.code === 'email_not_confirmed') return 'confirmation';
    if (value.code === 'weak_password' || value.code === 'same_password') return 'password';
  }
  return 'generic';
}
export function authRedirect(recovery = false) {
  const url = new URL('/', window.location.origin);
  if (recovery) url.searchParams.set('auth', 'recovery');
  return url.href;
}

// Bind the mutation to the verified recovery event's immutable owner/token.
// The singleton SDK's updateUser() reads its mutable session after acquiring a lock;
// a different tab could replace that session with another account in the meantime.
export async function updateRecoveryPassword(
  grant: RecoveryGrant,
  password: string,
  isCurrent: () => boolean,
  config: Pick<typeof authConfig, 'url' | 'publishableKey'> = authConfig,
) {
  if (!config.url || !config.publishableKey || !isCurrent()) throw new Error('Recovery expired');
  const response = await fetch(`${config.url.replace(/\/$/, '')}/auth/v1/user`, {
    method: 'PUT',
    headers: {
      apikey: config.publishableKey,
      Authorization: `Bearer ${grant.accessToken}`,
      'Content-Type': 'application/json',
    },
    credentials: 'omit',
    cache: 'no-store',
    body: JSON.stringify({ password }),
    signal: AbortSignal.timeout(15000),
  });
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const code = body && typeof body === 'object' && 'code' in body ? body.code : undefined;
    throw { status: response.status, code };
  }
  if (!body || typeof body !== 'object' || !('id' in body) || body.id !== grant.owner) {
    throw new Error('Invalid recovery response');
  }
}
