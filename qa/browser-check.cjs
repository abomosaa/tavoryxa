// Install Playwright in your QA environment, or set PLAYWRIGHT_MODULE to its module path.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs = require('node:fs');
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const base = process.env.BASE_URL || 'http://127.0.0.1:5174';
  fs.mkdirSync('qa/flow', { recursive: true });
  await page.goto(base);
  await page.evaluate(() => document.fonts.ready);
  await page.getByRole('button', { name: 'أضف دفتر البدايات', exact: true }).click();
  await page.getByRole('button', { name: 'السلة، 1 قطعة', exact: true }).click();
  await page.getByRole('button', { name: 'زيادة الكمية', exact: true }).click();
  await page.getByRole('button', { name: 'متابعة إلى الطلب', exact: true }).click();
  await page.getByRole('textbox', { name: 'اسم العرض للطلب' }).fill('زائر تجريبي');
  await page.screenshot({ path: 'qa/flow/checkout-ar.png', fullPage: true });
  await page.getByRole('button', { name: 'تأكيد الطلب التجريبي', exact: true }).click();
  await page.getByRole('heading', { name: 'حُفظ طلبك التجريبي', exact: true }).waitFor();
  await page.getByRole('button', { name: 'عرض طلباتي', exact: true }).click();
  if ((await page.locator('.order-card').count()) !== 1) throw new Error('Order not saved');
  await page.getByRole('button', { name: 'إغلاق', exact: true }).click();
  await page.reload();
  if ((await page.getByRole('button', { name: 'السلة، 0 قطعة', exact: true }).count()) !== 1)
    throw new Error('Cart did not clear');
  await page.getByRole('textbox', { name: 'ابحث عن قطعة', exact: true }).fill('لايوجد');
  await page.getByRole('heading', { name: 'لم نجد هذه القطعة', exact: true }).waitFor();
  await page.getByRole('button', { name: 'عرض الكل', exact: true }).click();
  await page.getByRole('button', { name: 'EN', exact: true }).click();
  await page.getByRole('heading', { name: 'Objects for your everyday.', exact: true }).waitFor();
  await page.screenshot({ path: 'qa/flow/desktop-en.png', fullPage: true });
  for (const width of [390, 820, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth))
      throw new Error(`English overflow ${width}`);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Account', exact: true }).click();
  await page.getByRole('button', { name: 'View my orders', exact: true }).click();
  if ((await page.locator('.order-card').count()) !== 1)
    throw new Error('Persistent guest orders unavailable on mobile');
  await page.screenshot({ path: 'qa/flow/mobile-orders-en.png', fullPage: true });
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  await page.getByRole('button', { name: 'عربي', exact: true }).click();
  for (const width of [390, 820, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth))
      throw new Error(`Arabic overflow ${width}`);
  }
  if (errors.length) throw new Error(errors.join('\n'));
  fs.writeFileSync(
    'qa/browser-results.json',
    JSON.stringify(
      {
        passed: true,
        flows: [
          'cart add and quantity',
          'guest checkout and confirmation',
          'persistent order after reload',
          'empty search and reset',
          'English switch',
          'mobile order navigation',
        ],
        widths: [390, 820, 1440],
        languages: ['ar', 'en'],
        pageErrors: errors,
      },
      null,
      2,
    ),
  );
  await browser.close();
  console.log(
    'Browser checks passed: AR/EN, checkout, persistent orders, 3 responsive widths, no page errors.',
  );
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
