// Exercise the installed Supabase SDK + early recovery latch with network fixtures.
// Intercepts every Auth request: no real email, user, token exchange or update is sent.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const base = process.env.BASE_URL || 'http://127.0.0.1:5174';
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    const owner = '00000000-0000-4000-8000-000000000001';
    const user = {
      id: owner,
      aud: 'authenticated',
      role: 'authenticated',
      email: 'sdk-fixture@example.test',
      email_confirmed_at: new Date().toISOString(),
      app_metadata: { provider: 'email', providers: ['email'] },
      user_metadata: {},
      identities: [],
      created_at: new Date().toISOString(),
      is_anonymous: false,
    };
    const encode = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');
    const accessToken = `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ sub: owner, exp: Math.floor(Date.now() / 1000) + 3600, aud: 'authenticated', role: 'authenticated' })}.fixture-signature`;
    let resetRedirect = null,
      updates = 0,
      exchanges = 0;
    await page.route('**/auth/v1/**', async (route) => {
      const request = route.request(),
        url = new URL(request.url());
      let body;
      if (url.pathname.endsWith('/recover')) {
        resetRedirect = url.searchParams.get('redirect_to');
        body = {};
      } else if (url.pathname.endsWith('/token') && url.searchParams.get('grant_type') === 'pkce') {
        exchanges++;
        assert.ok(request.postDataJSON().code_verifier);
        body = {
          access_token: accessToken,
          refresh_token: 'fixture-refresh-token',
          token_type: 'bearer',
          expires_in: 3600,
          user,
        };
      } else if (url.pathname.endsWith('/user')) {
        assert.equal(request.headers().authorization, `Bearer ${accessToken}`);
        if (request.method() === 'PUT') {
          updates++;
          assert.equal(request.postDataJSON().password, 'Sdk-fixture-password-123');
        }
        body = user;
      } else if (url.pathname.endsWith('/settings'))
        body = { external: { email: true }, disable_signup: false };
      else throw new Error(`Unexpected intercepted Auth endpoint: ${url.pathname}`);
      await route.fulfill({ contentType: 'application/json', body: JSON.stringify(body) });
    });
    await page.goto(base);
    const result = await page.evaluate(async (base) => {
      const entry = performance
        .getEntriesByType('resource')
        .find((entry) => new URL(entry.name).pathname === '/src/supabase.ts');
      if (!entry) throw new Error('Existing Supabase module was not loaded');
      const { supabase } = await import(entry.name);
      if (!supabase)
        throw new Error('Public Supabase environment is required for this local SDK fixture test');
      const result = await supabase.auth.resetPasswordForEmail('sdk-fixture@example.test', {
        redirectTo: `${base}/?auth=recovery`,
      });
      return { failed: Boolean(result.error) };
    }, base);
    assert.equal(result.failed, false);
    assert.ok(resetRedirect);
    const callback = new URL(resetRedirect);
    callback.searchParams.set('code', 'fixture-code');
    await page.goto(callback.href);
    await page.getByRole('heading', { name: 'كلمة مرور جديدة', exact: true }).waitFor();
    assert.equal(exchanges, 1);
    assert.equal(new URL(page.url()).searchParams.has('code'), false);
    await page.locator('#auth-password').fill('Sdk-fixture-password-123');
    await page.locator('#auth-confirm').fill('Sdk-fixture-password-123');
    await page.getByRole('button', { name: 'حفظ كلمة المرور', exact: true }).click();
    try {
      await page
        .getByRole('status')
        .filter({ hasText: 'حُفظت كلمة المرور الجديدة.' })
        .waitFor({ timeout: 10000 });
    } catch (error) {
      console.error({
        updates,
        visibleErrors: await page.locator('.error').allTextContents(),
        recoveryHeading: await page.locator('.auth-heading').count(),
      });
      throw error;
    }
    assert.equal(updates, 1);
    assert.equal(new URL(page.url()).searchParams.has('auth'), false);
    assert.equal(await page.locator('#auth-password').count(), 0);
    assert.deepEqual(errors, []);
    console.log(
      'Installed SDK PKCE recovery passed: generated verifier, callback exchange, early PASSWORD_RECOVERY latch, fixed-owner password PUT, callback URL cleanup. No live Auth requests.',
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
