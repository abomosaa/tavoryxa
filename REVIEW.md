# Review and verification / المراجعة والتحقق

## Public upgrade acceptance — 2026-10-24 / التحقق من التوسعة

Real Google sign-in was reverified through the deployed store. The expanded account history displayed the previous cloud order #B8290AF4, one notebook at SAR65 plus SAR18 delivery, retaining its saved SAR83 total. No new order was submitted. Proof is retained outside the public repository in the root research artifacts.

The lead reviewed collection/product/order screenshots and source. Confirmed image defects were fixed: the hover arrow stays 16px and the calendar's Latin text has an explicit LTR direction. Nine generated photos plus responsive variants are shipped locally. Gallery uses a clearly labeled detail crop, with honest illustration fallback on failure. Global demo banners were replaced by brand copy; simulated checkout and order status remain explicit.

19 source tests, production build, formatting and the storefront browser packet passed. The latter verifies AR/EN at 390/820/1440, all eight photos, gallery/zoom and focus return, quantity bounds, wishlist reload, order totals/re-add and image failure. The lead added centralized user-authorized shipping estimates and raised remaining small CSS text to a 12px floor, then reran the packet successfully. Estimates do not enable commercial fulfillment; see COMMERCE_SETUP.md.

First public Webforge acceptance scored 99 with no high accessibility findings or responsive overflow. Heuristic low issues were reviewed separately from actual usability. This score is an automated design audit, not a Lighthouse or field-performance measurement.

<div dir="rtl" align="right">أُصلحت الصور واتجاه النص، وأضيفت صفحات المنتجات والمعرض والمفضلة وسجل الطلبات. نجح 19 اختبارًا والبناء وفحوص المتصفح بالعربية والإنجليزية وثلاثة أحجام. أُضيفت بيانات توصيل تقديرية بموافقة المستخدم دون تفعيل بيع أو شحن غير مؤكد. راجع الوكيل الرئيسي النتائج والمصدر، واكتملت الاختبارات المستهدفة بعد تكبير النصوص.</div>

## Local upgrade verification — 2026-10-23 / تحقق التوسعة المحلية

This section concerns expanded local source, not a new deployment. TypeScript, production build and 19 unit tests passed. Existing shopping, auth-isolation, auth-form and installed-SDK PKCE fixtures passed. New `qa/storefront.cjs` passed with external traffic blocked: eight photos loaded; arrow is 16px; product deep links, detail crop, enlargement/Escape/focus return, bounded quantities, wishlist reload, simulated order detail/re-add, missing route and image-failure fallback work. AR/EN at 390/820/1440px had no horizontal overflow or page errors. Proof: `qa/upgrade/`.

Eight IDs, prices, old order parsing, saved financial values and canonical RPC are preserved. Wishlist is device-local. Root requested removal of global demo banners, correct hero dimensions/fallback, useful nonduplicated product copy and responsive image sources; these corrections are implemented for final verification. Fresh independent acceptance/deployment are separate. Real commerce remains pending supplied business/inventory/contact/payment/shipping facts; no acceptance or fulfillment is claimed.

<div dir="rtl" align="right">هذه نتائج المصدر الموسّع المحلي وليست نشرًا جديدًا. نجح TypeScript والبناء و19 اختبارًا وفحوص الشراء والحسابات وPKCE السابقة، ومعرض الصور والتكبير وإرجاع التركيز والكمية والمفضلة والطلبات وفشل الصور والروابط. لا تجاوز أفقي أو أخطاء صفحة في العربية والإنجليزية عند ثلاثة أحجام. عولجت ملاحظات المراجع حول التنبيهات العامة والصورة الرئيسية وتكرار الوصف والصور المتجاوبة، وتبقى المراجعة النهائية والنشر منفصلين. البيع الفعلي معلق ببيانات النشاط.</div>

## Current live verification — 2026-10-23 / التحقق الفعلي الحالي

- Main-agent verification: real Google OAuth succeeded after the user selected the authorized owner account. The retest returned to the correct Tavoryxa origin and showed the cloud connection.
- The first callback had fallen back to Qirvexa because the storefront's trailing-slash origin was absent from the allowlist. The main agent saved six exact Supabase redirect URLs: the previous four plus both deployed origins ending in `/`. No backend schema, IP or SMTP change accompanied the retest.
- Created simulated cloud order `#B8290AF4`: one notebook, SAR 83 total. Reload and order history retained the cloud record. No payment or shipment occurred.
- Signed out through the interface: guest history showed previous local order `#68DA4835` only, without the cloud order; guest browsing remained available.
- Email delivery is unverified and its gate remains false; GitHub remains disabled. Brevo setup is deferred by the user. Google remains **Testing**, with no In Production or verified-brand claim. Its [basic-identity exception](https://support.google.com/cloud/answer/15549945?hl=en) applies only to identity scopes, allowing access without the test-user list or seven-day authorization expiry.
- Evidence: root-workspace `research-artifacts/tavoryxa-google-cloud-order.png`; no screenshot was copied into this repository for this documentation update.

<div dir="rtl" align="right">

تحقق الوكيل الرئيسي من دخول Google الحقيقي بالحساب المصرح به والعودة إلى المتجر الصحيح، بعد إضافة عنوانَي الموقعين المنتهيين بشرطة مائلة إلى قائمة العودة ليصبح مجموعها ستة عناوين. حُفظ الطلب السحابي التجريبي `#B8290AF4` لدفتر واحد بإجمالي 83 ريالًا وظهر بعد إعادة التحميل، دون دفع أو شحن. بعد الخروج ظهر الطلب المحلي السابق `#68DA4835` فقط ولم يظهر الطلب السحابي في سجل الضيف. إرسال البريد غير متحقق وبوابة التسجيل والاستعادة بالبريد معطلة، وGitHub معطل، وإعداد Brevo مؤجل بطلب المستخدم. Google في Testing دون ادعاء توثيق العلامة أو النشر العام؛ استثناء الهوية الأساسية المرتبط أعلاه مشروط بعدم طلب صلاحيات إضافية. بقيت إعدادات قاعدة البيانات وIP وSMTP دون تغيير أثناء إعادة الاختبار.

</div>

## Historical release checkpoint — 2026-10-22 / نقطة الإصدار التاريخية

The main agent completed review of the authentication source, immutable recovery-owner Bearer and 15-second recovery request timeout. Auth release [5bfbfb1](https://github.com/abomosaa/tavoryxa/commit/5bfbfb1) is deployed as Cloudflare version `5f9b5286-19b1-4c58-8482-6afe12e03efb`; [CI 39772228693 succeeded](https://github.com/abomosaa/tavoryxa/actions/runs/39772228693).

At this 2026-10-22 checkpoint, live email delivery and Google/GitHub OAuth were unverified, the email-delivery gate was false and both external providers were disabled. Brevo had been chosen (300 emails/day), with sender verification and direct SMTP setup pending. The 2026-10-23 section above supersedes this provider-test status; the historical original baseline below is preserved.

The lead inspected the newly deployed Arabic account panel: email/password sign-in is visible, signup explains the temporary delivery restriction, unavailable providers are absent, and guest access stays available. / فُحصت واجهة الحسابات المنشورة الجديدة وبوابة التسجيل ووضع الضيف؛ هذا فحص واجهة دون دخول أو بريد حقيقي.

<div dir="rtl" align="right">في نقطة 22 أكتوبر التاريخية اكتملت مراجعة المصدر وجلسة الاستعادة الثابتة ومهلة الطلب، ونُشر التحديث ونجح CI. لم يكن البريد أو OAuth قد اختُبر فعليًا، وكانت بوابة البريد والمزودان معطلين وإعداد Brevo معلقًا. حالة 23 أكتوبر أعلاه أحدث من حالة المزودين هنا؛ يبقى سجل الخط الأساسي الأصلي أدناه محفوظًا.</div>

## 2026-10-22 — Authentication update / تحديث الحسابات

- Source checks: format/typecheck, 15 unit tests and build; new tests cover strict provider flags, unusable settings, password confirmation, safe error codes, pre-dispatch recovery invalidation and fixed-owner Bearer.
- Browser fixtures: `qa/auth-forms.cjs` passed AR/EN fields and errors, mismatch without API call, signup/reset/OAuth payloads, delivery gate with ordinary sign-in usable, public-settings failure, forged URL marker rejection, early recovery latch and update.
- Installed SDK fixture: `qa/auth-pkce.cjs` uses the real pinned Supabase SDK, intercepts all Auth requests, initiates PKCE reset, exchanges the callback, receives recovery before/around React startup, completes the fixed-owner password PUT and cleans the callback URL.
- Existing shopping and auth-isolation browser packets passed after integration. Screenshots `qa/auth/` were inspected at mobile size.
- Root's cross-tab recovery review finding was addressed by avoiding mutable singleton `updateUser()` for password mutation. The event owner/token is captured in memory and checked before a fixed-Bearer request.
- External at this local-test checkpoint: no live registration/reset email or Google/GitHub completion was performed by this author. Delivery gate was false. Source review/deployment was completed by the main agent; subsequent live Google verification is recorded in the 2026-10-23 section above.

<div dir="rtl" align="right">نجحت فحوص المصدر و15 اختبارًا وفحوص النماذج وPKCE عبر الشبكة التجريبية وعزل الحسابات والشراء. عولجت ملاحظة تبديل الحساب بربط تعديل كلمة المرور بجلسة الاستعادة الثابتة. لم ينفذ هذا الوكيل بريدًا أو OAuth فعليًا ضمن تلك الفحوص المحلية؛ أكمل الوكيل الرئيسي المراجعة والنشر ثم تحقق من Google في 23 أكتوبر كما هو موثق أعلاه.</div>

## Author verification — 2026-10-21 / تحقق المنفذ

| Check / الفحص               | Actual result / النتيجة الفعلية                                                                                                                                                                                                                                                                                                          |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run build`             | Passed / ناجح                                                                                                                                                                                                                                                                                                                            |
| `npm run typecheck`         | Passed / ناجح                                                                                                                                                                                                                                                                                                                            |
| `npm test`                  | 9 tests passed: six cart/checkout tests plus three stored-order shape/integrity tests / تسعة اختبارات ناجحة للسلة والطلب وسلامة البيانات المحفوظة                                                                                                                                                                                        |
| Browser guest flow          | Added product, changed quantity, checkout, confirmation, saved order, reload, empty-search recovery / نجاح الطلب التجريبي وحفظه وإعادة التحميل والبحث الفارغ                                                                                                                                                                             |
| Language / responsiveness   | AR RTL + EN, 390/820/1440: no horizontal overflow; no page errors / لا تجاوز أفقي ولا أخطاء صفحة                                                                                                                                                                                                                                         |
| Mobile order access         | Account panel → My orders works after reload / سجل الطلبات متاح من الحساب بعد إعادة التحميل                                                                                                                                                                                                                                              |
| Visual review               | Inspected AR desktop/mobile and EN desktop/AR checkout screenshots / فحص صور سطح المكتب والهاتف والدفع                                                                                                                                                                                                                                   |
| Webforge                    | Overall 98, no high a11y issues, no responsive findings; remaining heuristics documented in README / النتائج المتبقية موثقة                                                                                                                                                                                                              |
| Impeccable detector         | Empty findings array / بلا نتائج                                                                                                                                                                                                                                                                                                         |
| SQL source self-review      | No price/owner/status input; private privileged writer, explicit auth, fixed path, owner read RLS, no direct writes, idempotent request ID / مراجعة المصدر لحدود الصلاحية والأسعار والتكرار                                                                                                                                              |
| Auth-race regression        | Browser-only Supabase stub: late getUser, sign-out during fetch, account change during checkout and malformed persisted orders all pass / اختبار معزول ناجح لتأخر الاستجابات وتبديل الحساب والبيانات التالفة                                                                                                                             |
| Production dependency audit | `npm audit --omit=dev`: zero reported vulnerabilities / لا ثغرات مُبلّغ عنها في اعتماديات الإنتاج                                                                                                                                                                                                                                        |
| Live SQL                    | Main agent reports applied on approved new backend, security advisors empty, transactional assertions passed and rolled back: owner-read, crossuser isolation, forged prices ignored, retry ID stable, negative quantity rejected / أبلغ الوكيل الرئيسي بنجاح اختبارات الأسعار والعزل والتكرار على السحابة مع التراجع عن بيانات الاختبار |
| Live OAuth                  | Pending provider configuration; remains visibly disabled / بانتظار إعداد مقدم الخدمة ويظهر الدخول معطلًا بوضوح                                                                                                                                                                                                                           |

## Mutual review / المراجعة المتبادلة

Main agent reviewed source/SQL and requested four fixes: unverified registered-trademark symbol, malformed local orders, stale asynchronous auth/order state, and explicit Gregorian formatting. The author removed the symbol, validated order shapes, added auth generation/unmount guards and private-state clearing, and set the calendar explicitly. Build, nine unit tests, shopping browser flow and the four targeted race/storage browser checks passed after fixes. Final reviewer visual/deployment acceptance remains separate.

<div dir="rtl" align="right">راجع الوكيل الرئيسي المصدر وSQL وطلب إزالة علامة تسجيل تجاري غير مثبتة، والتحقق من الطلبات المخزنة، وحماية حالة الحساب من الاستجابات المتأخرة، وتحديد التقويم. أُصلحت الأربع وأُعيد البناء و9 اختبارات وفحص الشراء واختبارات الحساب والبيانات التالفة بنجاح. يبقى اعتماد المراجع البصري والنشر منفصلين.</div>
