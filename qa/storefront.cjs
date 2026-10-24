// Local browser regression. All external traffic is blocked; no live account/order writes.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const base = process.env.BASE_URL || 'http://127.0.0.1:5174';
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.route('**/*', (r) =>
    new URL(r.request().url()).origin === new URL(base).origin ? r.continue() : r.abort(),
  );
  fs.mkdirSync('qa/upgrade', { recursive: true });
  async function capture(path) {
    await page.locator('footer').scrollIntoViewIfNeeded();
    await page.waitForFunction(() =>
      Array.from(document.querySelectorAll('img')).every((img) => img.complete),
    );
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.screenshot({ path, fullPage: true });
  }
  try {
    await page.goto(base);
    await page.getByRole('link', { name: 'المجموعة', exact: true }).click();
    await page.locator('.product-image').first().hover();
    const arrow = await page.locator('.product-image .view-product svg').first().boundingBox();
    assert.equal(arrow.width, 16);
    assert.equal(arrow.height, 16);
    assert.equal(await page.locator('.product-image img').count(), 8);
    await page.waitForFunction(() =>
      Array.from(document.querySelectorAll('.product-image img')).every(
        (im) => im.complete && im.naturalWidth > 0,
      ),
    );
    await capture('qa/upgrade/collection-ar-desktop.png');
    await page.getByRole('link', { name: 'عرض دفتر البدايات', exact: true }).click();
    await page.getByRole('heading', { name: 'دفتر البدايات', exact: true }).waitFor();
    assert.ok(page.url().endsWith('#/product/notebook'));
    await page.getByRole('button', { name: 'تكبير التفاصيل', exact: true }).click();
    assert.equal(await page.locator('.gallery-stage .is-closeup').count(), 1);
    await page.getByRole('button', { name: 'فتح الصورة المكبرة', exact: true }).click();
    await page.locator('dialog.image-lightbox[open]').waitFor();
    await page.keyboard.press('Escape');
    await page.locator('dialog.image-lightbox').waitFor({ state: 'detached' });
    // Native dialog close must restore focus to its invoker.
    assert.equal(
      await page
        .getByRole('button', { name: 'فتح الصورة المكبرة', exact: true })
        .evaluate((el) => el === document.activeElement),
      true,
    );
    await page.getByRole('button', { name: 'صورة المنتج', exact: true }).click();
    await page.getByRole('button', { name: 'ثلاث قطع', exact: false }).click();
    await page.getByRole('button', { name: /أضف إلى السلة/ }).click();
    await page.getByRole('button', { name: 'السلة، 3 قطعة', exact: true }).waitFor();
    await page.getByRole('button', { name: 'حفظ في المفضلة', exact: true }).click();
    await page.getByRole('link', { name: 'المفضلة، 1 قطعة', exact: true }).click();
    assert.equal(await page.locator('.saved-page .product').count(), 1);
    await page.reload();
    assert.equal(await page.locator('.saved-page .product').count(), 1);
    await page.goBack();
    await page.goto(`${base}/#/product/notebook`);
    await capture('qa/upgrade/product-ar-desktop.png');
    for (const lang of ['ar', 'en']) {
      if (lang === 'en') await page.getByRole('button', { name: 'EN', exact: true }).click();
      for (const width of [390, 820, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        for (const hash of ['#/product/notebook', '#/saved', '#collection']) {
          await page.goto(`${base}/${hash}`);
          await page.locator('.header').waitFor();
          assert.equal(
            await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
            false,
            `${lang} ${width} ${hash} overflow`,
          );
        }
      }
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${base}/#/product/notebook`);
    await capture('qa/upgrade/product-en-mobile.png');
    await page.getByRole('button', { name: 'Bag, 3 items', exact: true }).click();
    await page.getByRole('button', { name: 'Continue to checkout', exact: true }).click();
    await page
      .getByRole('textbox', { name: 'Display name for the order', exact: true })
      .fill('Local QA');
    await page.getByRole('button', { name: 'Confirm demo order', exact: true }).click();
    await page.getByRole('button', { name: 'View my orders', exact: true }).click();
    await page.locator('.order-record summary').click();
    assert.equal(await page.locator('.history-line').count(), 1);
    assert.ok((await page.locator('.history-totals').innerText()).includes('195'));
    await page.screenshot({ path: 'qa/upgrade/orders-en-mobile.png', fullPage: true });
    await page.getByRole('button', { name: 'Add objects to bag again', exact: true }).click();
    assert.equal(await page.locator('.quantity span').innerText(), '3');
    await page.getByRole('button', { name: 'Close', exact: true }).click();
    await page.goto(`${base}/#/product/unknown`);
    await page
      .getByRole('heading', { name: 'This object could not be found.', exact: true })
      .waitFor();
    const fallbackPage = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await fallbackPage.addInitScript(() => localStorage.setItem('tavoryxa.lang', '"en"'));
    await fallbackPage.route('**/*', (r) => {
      const url = new URL(r.request().url());
      return url.origin !== new URL(base).origin || url.pathname.startsWith('/images/products/pen')
        ? r.abort()
        : r.continue();
    });
    await fallbackPage.goto(`${base}/#/product/pen`);
    await fallbackPage.locator('.gallery-stage .media-fallback').waitFor();
    await fallbackPage.screenshot({ path: 'qa/upgrade/image-fallback-en.png', fullPage: true });
    await fallbackPage.close();
    assert.deepEqual(errors, []);
    fs.writeFileSync(
      'qa/upgrade/results.json',
      JSON.stringify(
        {
          passed: true,
          languages: ['ar', 'en'],
          widths: [390, 820, 1440],
          checks: [
            'all8 photos loaded',
            '16px arrow',
            'product deep link',
            'detail crop',
            'zoom Escape focus return',
            'quantity presets',
            'wishlist persistence',
            'unknown route',
            'saved totals and re-add',
            'honest failed-image fallback',
          ],
          externalNetworkBlocked: true,
          pageErrors: errors,
        },
        null,
        2,
      ),
    );
    console.log(
      'Storefront passed: 8 photos, gallery/crop/zoom, focus, quantity, wishlist, orders/re-add, fallback, AR/EN 3 widths; external network blocked.',
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
