// Browser-only Supabase stub: never contacts or writes to a live backend.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.route('**/src/supabase.ts*', (route) =>
      route.fulfill({
        contentType: 'application/javascript',
        body: `
 const wait=key=>new Promise(resolve=>window[key]=resolve);
 export const getRecoveryUserId=()=>null; export const getRecoveryGrant=()=>null; export const clearRecoverySignal=()=>{}; export const recoveryCallbackRequested=false;
 export const supabase={auth:{getUser:()=>wait('__resolveInitial'),onAuthStateChange:cb=>{window.__auth=cb;return{data:{subscription:{unsubscribe(){}}}}},signOut:async()=>({error:null})},from:()=>({select:()=>({order:()=>({limit:()=>wait('__resolveOrders')})})}),rpc:()=>wait('__resolveCheckout')};
 `,
      }),
    );
    await page.goto(process.env.BASE_URL || 'http://127.0.0.1:5174');
    await page.waitForFunction(() => window.__auth && window.__resolveInitial);
    const a = { id: 'user-a', email: 'a@example.test' },
      b = { id: 'user-b', email: 'b@example.test' };
    // Newer auth callback must win over a late initial getUser response.
    await page.evaluate(
      ({ a, b }) => {
        window.__auth('SIGNED_IN', { user: b });
        window.__resolveInitial({ data: { user: a } });
      },
      { a, b },
    );
    await page.getByRole('button', { name: 'الحساب', exact: true }).click();
    await page.getByText('b@example.test', { exact: true }).waitFor();
    await page.getByRole('button', { name: 'إغلاق', exact: true }).click();
    await page.getByRole('button', { name: 'طلباتي', exact: true }).click();
    await page.waitForFunction(() => window.__resolveOrders);
    const order = {
      id: '00000000-0000-4000-8000-000000000001',
      created_at: '2026-10-21T00:00:00Z',
      total_cents: 8300,
      delivery_cents: 1800,
      items: [{ id: 'notebook', quantity: 1, unit_price: 6500 }],
    };
    // A pending private order response must not reappear after sign-out.
    await page.evaluate((order) => {
      window.__auth('SIGNED_OUT', null);
      window.__resolveOrders({ data: [order], error: null });
    }, order);
    await page.waitForTimeout(150);
    assert.equal(await page.locator('dialog').count(), 0);
    assert.equal(await page.locator('.order-card').count(), 0);
    // Invalid persisted order shapes must recover to an empty guest history.
    await page.evaluate(() =>
      localStorage.setItem('tavoryxa.orders', '[{"id":"bad","items":null}]'),
    );
    await page.getByRole('button', { name: 'طلباتي', exact: true }).click();
    await page.getByRole('heading', { name: 'حكايتك تبدأ من هنا', exact: true }).waitFor();
    await page.getByRole('button', { name: 'إغلاق', exact: true }).click();
    await page.evaluate((a) => window.__auth('SIGNED_IN', { user: a }), a);
    await page.getByRole('button', { name: 'أضف دفتر البدايات', exact: true }).click();
    await page.getByRole('button', { name: 'السلة، 1 قطعة', exact: true }).click();
    await page.getByRole('button', { name: 'متابعة إلى الطلب', exact: true }).click();
    await page.getByRole('textbox', { name: 'اسم العرض للطلب' }).fill('QA');
    await page.getByRole('button', { name: 'تأكيد الطلب التجريبي', exact: true }).click();
    await page.waitForFunction(() => window.__resolveCheckout);
    // An old user's in-flight checkout may not clear the new user's cart or expose its result.
    await page.evaluate(
      ({ b, order }) => {
        window.__auth('SIGNED_IN', { user: b });
        window.__resolveCheckout({ data: order, error: null });
      },
      { b, order },
    );
    await page.waitForTimeout(150);
    assert.equal(await page.locator('.confirmation').count(), 0);
    assert.equal(await page.getByRole('button', { name: 'السلة، 1 قطعة', exact: true }).count(), 1);
    await page.getByRole('button', { name: 'الحساب', exact: true }).click();
    await page.getByText('b@example.test', { exact: true }).waitFor();
    assert.deepEqual(errors, []);
    console.log(
      'Auth isolation passed: late getUser, sign-out during order fetch, malformed storage, user switch during checkout.',
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
