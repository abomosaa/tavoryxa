// Isolated local fixtures only. No real accounts, order submissions or external network.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const base = process.env.BASE_URL || 'http://127.0.0.1:5175';
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const errors = [];
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  await context.route('**/*', (r) =>
    new URL(r.request().url()).origin === new URL(base).origin ? r.continue() : r.abort(),
  );
  const page = await context.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  fs.mkdirSync('qa/refinement', { recursive: true });
  try {
    await page.goto(`${base}/#/product/notebook`);
    await page.getByRole('heading', { name: 'دفتر البدايات', exact: true }).waitFor();
    assert.equal(await page.locator('.quantity-options').count(), 0);
    const quantity = page.getByRole('spinbutton', { name: 'الكمية', exact: true });
    await quantity.focus();
    const style = await quantity.evaluate((el) => ({
      border: getComputedStyle(el).borderWidth,
      outline: getComputedStyle(el).outlineStyle,
      wrapBorder: getComputedStyle(el.parentElement).borderWidth,
    }));
    assert.equal(style.border, '0px');
    assert.equal(style.outline, 'none');
    assert.equal(style.wrapBorder, '0px');
    await quantity.fill('20');
    assert.equal(
      await page.getByRole('button', { name: 'زيادة الكمية', exact: true }).isDisabled(),
      true,
    );
    await quantity.fill('1');
    assert.equal(
      await page.getByRole('button', { name: 'تقليل الكمية', exact: true }).isDisabled(),
      true,
    );
    await page.getByRole('button', { name: 'زيادة الكمية', exact: true }).click();
    assert.equal(await quantity.inputValue(), '2');
    assert.ok(
      (await page.getByRole('button', { name: /أضف إلى السلة/ }).innerText()).includes('٥٨'),
    );
    await page.getByRole('link', { name: 'Tavoryxa home', exact: true }).click();
    await page.locator('.hero').waitFor();
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({
      path: 'qa/refinement/home-ar-desktop.png',
      fullPage: true,
      animations: 'disabled',
    });
    const tabs = page.getByRole('tablist', { name: 'توليفات المكتب', exact: true });
    await tabs.getByRole('tab').first().focus();
    await page.keyboard.press('End');
    assert.equal(await tabs.getByRole('tab').last().getAttribute('aria-selected'), 'true');
    await page.keyboard.press('Home');
    assert.equal(await tabs.getByRole('tab').first().getAttribute('aria-selected'), 'true');
    await page.getByRole('button', { name: 'أضف التوليفة إلى السلة', exact: true }).click();
    await page.getByRole('button', { name: 'السلة، 3 قطعة', exact: true }).click();
    assert.equal(await page.locator('.cart-line').count(), 3);
    assert.ok((await page.locator('.summary').innerText()).includes('٥٠'));
    assert.ok((await page.locator('.summary').innerText()).includes('٦٨'));
    await page.getByRole('button', { name: 'إغلاق', exact: true }).click();
    await page.getByRole('textbox', { name: 'ابحث عن قطعة', exact: true }).fill('قلم');
    assert.equal(await page.locator('#collection .product').count(), 1);
    await page.getByRole('button', { name: 'مسح البحث', exact: true }).click();
    assert.equal(await page.locator('#collection .product').count(), 8);
    const checks = [];
    for (const language of ['ar', 'en']) {
      if (language === 'en') await page.getByRole('button', { name: 'EN', exact: true }).click();
      for (const width of [360, 390, 820, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        for (const hash of ['', '#collection', '#/product/notebook', '#/saved']) {
          await page.goto(`${base}/${hash}`);
          await page.locator('header').waitFor();
          assert.equal(
            await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
            false,
            `${language}/${width}/${hash}`,
          );
          if (width < 750) {
            assert.equal(
              await page
                .getByRole('navigation', {
                  name: language === 'ar' ? 'التنقل الرئيسي' : 'Main navigation',
                  exact: true,
                })
                .isVisible(),
              true,
            );
            if (hash.includes('product'))
              assert.ok(
                (await page.locator('.gallery-options .product-media').first().boundingBox())
                  .height <= 80,
              );
          }
          checks.push({ language, width, hash, overflow: false });
        }
      }
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(`${base}/#/product/notebook`);
    await page.screenshot({
      path: 'qa/refinement/product-en-desktop.png',
      fullPage: true,
      animations: 'disabled',
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({
      path: 'qa/refinement/product-en-mobile.png',
      fullPage: true,
      animations: 'disabled',
    });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(base);
    assert.equal(
      await page.locator('.hero-photo').evaluate((el) => getComputedStyle(el).animationName),
      'none',
    );
    await page.getByRole('link', { name: 'View The daily notebook', exact: true }).click();
    await page.getByRole('button', { name: 'Open enlarged image', exact: true }).click();
    assert.equal(
      await page.locator('.image-lightbox').evaluate((el) => getComputedStyle(el).animationName),
      'none',
    );
    await page.keyboard.press('Escape');
    await page.locator('.image-lightbox').waitFor({ state: 'detached' });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto(base);
    assert.equal(
      await page.locator('.hero-photo').evaluate((el) => getComputedStyle(el).animationName),
      'shelf-open',
    );
    assert.deepEqual(errors, []);
    fs.writeFileSync(
      'qa/refinement/results.json',
      JSON.stringify(
        {
          passed: true,
          checks,
          quantity: 'no presets, no number box, bounds/total verified',
          combinations: '3 objects at canonical prices, keyboard tabs',
          motion: 'authored keyframes and reduced motion verified',
          externalNetworkBlocked: true,
          errors,
        },
        null,
        2,
      ),
    );
    console.log(
      `Refinement passed: numeric quantity, prices, combinations, mobile navigation, ${checks.length} responsive checks, reduced motion.`,
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
