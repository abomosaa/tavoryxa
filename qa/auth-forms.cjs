// Browser-only authentication regression. All SDK methods/settings are fixtures.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const base = process.env.BASE_URL || 'http://127.0.0.1:5174';
const user = { id: 'auth-fixture-user', email: 'fixture@example.test' };
async function setup(
  browser,
  { delivery = true, settingsFail = false, signedIn = false, recovery = false } = {},
) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.route('**/auth/v1/**', (route) =>
    route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Fixture guard: unexpected Auth request' }),
    }),
  );
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.route('**/src/auth-config.ts*', (route) =>
    route.fulfill({
      contentType: 'application/javascript',
      body: `export const authConfig={url:'https://auth.test',publishableKey:'fixture-public-key',emailDeliveryEnabled:${delivery}};`,
    }),
  );
  await page.route('https://auth.test/auth/v1/settings', (route) =>
    route.fulfill({
      status: settingsFail ? 503 : 200,
      contentType: 'application/json',
      body: JSON.stringify({
        external: { email: true, google: true, github: true },
        disable_signup: false,
      }),
    }),
  );
  await page.route('**/src/supabase.ts*', (route) =>
    route.fulfill({
      contentType: 'application/javascript',
      body: `
    const user=${JSON.stringify(user)}; const subscribers=new Set(); let recoveryId=${recovery ? 'user.id' : 'null'};
    let currentUser=${signedIn || recovery ? 'user' : 'null'};
    export const recoveryCallbackRequested=new URL(location.href).searchParams.get('auth')==='recovery';
    let grant=recoveryId?Object.freeze({owner:user.id,accessToken:'fixture-recovery-token'}):null;
    export const getRecoveryUserId=()=>recoveryId;
    export const getRecoveryGrant=()=>grant;
    export const clearRecoverySignal=()=>{recoveryId=null;grant=null;window.__cleared=true};
    window.__calls=[];
    window.__auth=(event,session)=>{currentUser=session?.user||null;if(event==='PASSWORD_RECOVERY'){recoveryId=currentUser?.id||null;grant=recoveryId?Object.freeze({owner:recoveryId,accessToken:'fixture-recovery-token'}):null;}else if(event==='SIGNED_OUT'||event==='SIGNED_IN'){recoveryId=null;grant=null;}for(const cb of subscribers)cb(event,session)};
    const call=(method,args)=>{window.__calls.push({method,args});if(window.__fail)return {data:{user:null,session:null},error:{code:'invalid_credentials',message:'PRIVATE_TOKEN_DO_NOT_RENDER'}};return {data:{user,session:null},error:null}};
    export const supabase={auth:{
      getUser:async()=>({data:{user:currentUser},error:null}),
      onAuthStateChange:cb=>{subscribers.add(cb);return{data:{subscription:{unsubscribe(){subscribers.delete(cb)}}}}},
      signInWithPassword:async args=>{const r=call('signin',args);if(!r.error)window.__auth('SIGNED_IN',{user});return r},
      signUp:async args=>call('signup',args),
      resetPasswordForEmail:async(email,options)=>call('reset',{email,options}),
      updateUser:async()=>{throw new Error('Mutable SDK session must not be used for recovery')},
      signInWithOAuth:async args=>call('oauth',args),
      signOut:async()=>{window.__auth('SIGNED_OUT',null);return {error:null}}
    }};
  `,
    }),
  );
  await page.route('https://auth.test/auth/v1/user', async (route) => {
    assert.equal(route.request().headers().authorization, 'Bearer fixture-recovery-token');
    await page.evaluate(
      (args) => window.__calls.push({ method: 'update', args }),
      route.request().postDataJSON(),
    );
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify(user) });
  });
  return { page, errors };
}
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  fs.mkdirSync('qa/auth', { recursive: true });
  try {
    // Enabled methods: real form validation, sanitized failure, signup/reset arguments.
    const { page, errors } = await setup(browser);
    await page.goto(base);
    await page.getByRole('button', { name: 'الحساب', exact: true }).click();
    await page
      .getByRole('textbox', { name: 'البريد الإلكتروني', exact: true })
      .fill('fixture@example.test');
    await page.locator('#auth-password').fill('Fixture-password-123');
    await page.evaluate(() => (window.__fail = true));
    await page.getByRole('button', { name: 'دخول بالبريد', exact: true }).click();
    await page.getByRole('alert').waitFor();
    assert.equal((await page.getByRole('alert').innerText()).includes('PRIVATE_TOKEN'), false);
    assert.equal(await page.locator('#auth-password').inputValue(), '');
    await page.getByRole('button', { name: 'إنشاء حساب', exact: true }).click();
    await page.locator('#auth-password').fill('Fixture-password-123');
    await page.locator('#auth-confirm').fill('Different-password-123');
    await page.getByRole('button', { name: 'إنشاء الحساب', exact: true }).click();
    await page.getByText('كلمتا المرور غير متطابقتين.', { exact: true }).waitFor();
    assert.equal(
      await page.evaluate(() => window.__calls.filter((c) => c.method === 'signup').length),
      0,
    );
    await page.evaluate(() => (window.__fail = false));
    await page.locator('#auth-confirm').fill('Fixture-password-123');
    await page.screenshot({ path: 'qa/auth/signup-ar.png', fullPage: true });
    await page.getByRole('button', { name: 'إنشاء الحساب', exact: true }).click();
    await page.getByText(/راجع بريدك لتأكيد الحساب/).waitFor();
    const signup = await page.evaluate(() => window.__calls.find((c) => c.method === 'signup'));
    assert.equal(signup.args.options.emailRedirectTo, new URL('/', base).href);
    await page.getByRole('button', { name: 'تسجيل الدخول', exact: true }).click();
    await page.getByRole('button', { name: 'نسيت كلمة المرور؟', exact: true }).click();
    await page.getByRole('button', { name: 'إرسال رابط الاستعادة', exact: true }).click();
    await page.getByText(/إذا كان الحساب مؤهلًا/).waitFor();
    const reset = await page.evaluate(() => window.__calls.find((c) => c.method === 'reset'));
    assert.equal(reset.args.options.redirectTo, new URL('/?auth=recovery', base).href);
    await page.getByRole('button', { name: 'المتابعة باستخدام Google', exact: true }).click();
    const oauth = await page.evaluate(() => window.__calls.find((c) => c.method === 'oauth'));
    assert.equal(oauth.args.provider, 'google');
    assert.equal(oauth.args.options.redirectTo, new URL('/', base).href);
    assert.equal(
      await page.evaluate(
        () =>
          JSON.stringify(localStorage).includes('Fixture-password') ||
          JSON.stringify(sessionStorage).includes('Fixture-password'),
      ),
      false,
    );
    assert.deepEqual(errors, []);
    await page.close();

    // Delivery gate does not block ordinary email sign-in.
    const gated = await setup(browser, { delivery: false });
    await gated.page.goto(base);
    await gated.page.getByRole('button', { name: 'EN', exact: true }).click();
    await gated.page.getByRole('button', { name: 'Account', exact: true }).click();
    await gated.page.getByRole('button', { name: 'Create account', exact: true }).click();
    await gated.page.getByText(/Email registration is temporarily unavailable/).waitFor();
    assert.equal(await gated.page.locator('form.auth-form').count(), 0);
    await gated.page.getByRole('button', { name: 'Sign in', exact: true }).click();
    await gated.page.getByRole('button', { name: 'Forgot password?', exact: true }).click();
    await gated.page.getByText(/Password reset is temporarily unavailable/).waitFor();
    assert.equal(await gated.page.evaluate(() => window.__calls.length), 0);
    await gated.page.getByRole('button', { name: 'Back to sign in', exact: true }).click();
    await gated.page
      .getByRole('textbox', { name: 'Email address', exact: true })
      .fill('fixture@example.test');
    await gated.page.locator('#auth-password').fill('Fixture-password-123');
    await gated.page.screenshot({ path: 'qa/auth/signin-en-mobile.png', fullPage: true });
    await gated.page.getByRole('button', { name: 'Sign in with email', exact: true }).click();
    await gated.page.waitForFunction(() => !document.querySelector('dialog'));
    assert.deepEqual(gated.errors, []);
    await gated.page.close();

    // Settings failure fails closed: no invented provider buttons or active email form.
    const failed = await setup(browser, { settingsFail: true });
    await failed.page.goto(base);
    await failed.page.getByRole('button', { name: 'الحساب', exact: true }).click();
    await failed.page.getByText(/تعذر تحميل خيارات الدخول/).waitFor();
    assert.equal(
      await failed.page
        .getByRole('button', { name: 'المتابعة باستخدام Google', exact: true })
        .count(),
      0,
    );
    assert.equal(await failed.page.getByRole('button', { name: 'GitHub', exact: true }).count(), 0);
    assert.equal(await failed.page.locator('form.auth-form').count(), 0);
    await failed.page.getByRole('button', { name: 'أكمل كضيف', exact: true }).click();
    assert.deepEqual(failed.errors, []);
    await failed.page.close();

    // A forged URL marker plus an ordinary session never authorizes password update.
    const forged = await setup(browser, { signedIn: true });
    await forged.page.goto(`${base}/?auth=recovery`);
    await forged.page.getByText(/رابط الاستعادة غير صالح/).waitFor();
    assert.equal(await forged.page.locator('#auth-password').count(), 0);
    assert.equal(
      await forged.page.getByRole('button', { name: 'حفظ كلمة المرور', exact: true }).count(),
      0,
    );
    assert.deepEqual(forged.errors, []);
    await forged.page.close();

    // Early recovery signal is available before React; update only that user.
    const recovered = await setup(browser, { recovery: true, delivery: false });
    await recovered.page.goto(`${base}/?auth=recovery&code=fixture`);
    await recovered.page.getByRole('heading', { name: 'كلمة مرور جديدة', exact: true }).waitFor();
    await recovered.page.locator('#auth-password').fill('New-fixture-password-123');
    await recovered.page.locator('#auth-confirm').fill('New-fixture-password-123');
    await recovered.page.screenshot({ path: 'qa/auth/recovery-ar.png', fullPage: true });
    await recovered.page.getByRole('button', { name: 'حفظ كلمة المرور', exact: true }).click();
    await recovered.page.waitForFunction(() => window.__cleared === true);
    assert.equal(await recovered.page.locator('#auth-password').count(), 0);
    assert.equal(
      await recovered.page.evaluate(
        () => window.__calls.filter((c) => c.method === 'update').length,
      ),
      1,
    );
    assert.deepEqual(recovered.errors, []);
    await recovered.page.close();
    console.log(
      'Auth forms passed: AR/EN, mismatch/no request, sanitized errors, signup/reset/OAuth arguments, delivery gate, settings fail-closed, URL spoof rejection, early recovery + update, no persisted passwords.',
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
