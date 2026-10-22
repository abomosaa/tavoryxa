import { afterEach, describe, expect, it, vi } from 'vitest';
import { authErrorKind, parseAuthSettings, passwordIssue, updateRecoveryPassword } from './auth';

describe('public auth settings and safe form boundaries', () => {
  it('enables only explicitly true providers and explicitly allowed signup', () => {
    expect(parseAuthSettings({ external: { email: true, google: 'true', github: false } })).toEqual(
      {
        email: true,
        google: false,
        github: false,
        signup: false,
      },
    );
    expect(
      parseAuthSettings({ external: { google: true, github: true }, disable_signup: false }),
    ).toEqual({
      email: false,
      google: true,
      github: true,
      signup: true,
    });
  });
  it('rejects unusable settings instead of inventing enabled sign-in methods', () => {
    for (const value of [null, {}, { external: null }, 'enabled']) {
      expect(() => parseAuthSettings(value)).toThrow('Unavailable settings');
    }
  });
  it('requires matching bounded new passwords without changing ordinary sign-in rules', () => {
    expect(passwordIssue('short', 'short')).toBe('length');
    expect(passwordIssue('Valid-password-1', 'different')).toBe('mismatch');
    expect(passwordIssue('Valid-password-1', 'Valid-password-1')).toBe(null);
  });
  it('classifies errors from safe codes and never returns raw backend messages', () => {
    expect(authErrorKind({ message: 'token=private', status: 429 })).toBe('rate');
    expect(authErrorKind({ code: 'email_not_confirmed', message: 'private' })).toBe('confirmation');
    expect(authErrorKind({ message: 'private backend error' })).toBe('generic');
  });
});

describe('recovery mutation owner binding', () => {
  afterEach(() => vi.unstubAllGlobals());
  const grant = Object.freeze({ owner: 'owner-a', accessToken: 'fixture-token-a' });
  const config = { url: 'https://auth.test', publishableKey: 'fixture-public-key' };
  it('does not dispatch if an account switch invalidated the recovery grant', async () => {
    const request = vi.fn();
    vi.stubGlobal('fetch', request);
    await expect(
      updateRecoveryPassword(grant, 'Fixture-password', () => false, config),
    ).rejects.toThrow('Recovery expired');
    expect(request).not.toHaveBeenCalled();
  });
  it('sends the captured owner token even if shared SDK session changes after dispatch', async () => {
    const request = vi.fn(
      async () => new Response(JSON.stringify({ id: 'owner-a' }), { status: 200 }),
    );
    vi.stubGlobal('fetch', request);
    await updateRecoveryPassword(grant, 'Fixture-password', () => true, config);
    expect(request.mock.calls[0]).toEqual([
      'https://auth.test/auth/v1/user',
      expect.objectContaining({
        method: 'PUT',
        credentials: 'omit',
        headers: expect.objectContaining({ Authorization: 'Bearer fixture-token-a' }),
      }),
    ]);
  });
});
