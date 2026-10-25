## 2026-10-25 — Quantity, pricing and motion / الكمية والأسعار والحركة

<div dir="rtl" align="right">الوكيل الرئيسي بسّط الكمية إلى رقم مع زري الزيادة والنقصان، وأزال إطار الرقم مع إبقاء مؤشر لوحة مفاتيح تحته. خُفضت الأسعار التقديرية ووُحدت بين المصدر وSupabase دون تغيير الطلب القديم. أضاف توليفات المكتب وتنقل الجوال وصغّر معرض الصور وحسّن البحث ورأس الصفحة وأدخل حركة محدودة تحترم تقليل الحركة. اكتشف الفحص تمددًا عند820بكسل بسبب خلفية رأس الصفحة وأُصلح. راجع وكيل Qirvexa المصدر والصور باللغتين دون موانع نشر في نطاق مراجعته.</div>

Lead: numeric stepper with no presets/number box, lower canonical catalogue prices, real three-SKU desk combinations, compact gallery, mobile navigation, sticky header/filters, clear-search action and purposeful motion. The 820px header pseudo-element overflow found by tests was fixed. The Qirvexa agent independently reviewed source and settled desktop/mobile screenshots without blockers at that scope.

Validation:19 source tests, build/format,32 new responsive cases plus18 storefront cases; gallery/focus/fallback/shopping and Auth/PKCE/isolation fixtures pass. Webforge local audit99 with no high accessibility issues or overflow (bounded automated audit, not Lighthouse/field evidence). Detector:0 primary findings,74 palette/type documentation advisories before documentation refresh. Live SQL canonical-price/forgery assertions passed inside rollback; existing order fingerprint stayed `970132442b0f63825eee07ec845f8d8c`. No real order/payment submitted.

# Change log / سجل التغييرات

## 2026-10-23 — Expanded local storefront / توسعة المتجر محليًا

- Added shareable product pages, generated product/hero photography, responsive image sources, truthful full-image/detail-crop gallery and keyboard-accessible enlargement. Fixed the oversized overlay arrow and RTL calendar lettering.
- Added quantity choices, device-local wishlist, result counts/filter reset, missing-product recovery, route titles/focus handling and useful product-use copy. Kept eight IDs/prices and aligned specifications with generated imagery.
- Expanded order history with saved line prices/totals, local/cloud source and re-add at current prices. Preserved owner guards, Google/auth/recovery, guest isolation and canonical RPC; no schema/cloud/environment change.
- Removed global demo banners in favor of product language; material simulated-order notices remain at checkout/history, and generated-image disclosure remains by the gallery. Real commercial acceptance stays pending business/inventory/contact/payment/shipping facts.
- Build/typecheck, 19 unit tests, existing shopping/auth fixtures and the expanded AR/EN browser packet passed; current proof is in `qa/upgrade/`. This local expansion awaits independent acceptance and deployment; historical deployed evidence below is preserved.

<div dir="rtl" align="right">أُضيفت صفحات منتجات وصور مولدة متجاوبة ومعرض وتكبير وخيارات كمية ومفضلة وسجل طلبات مفصّل، مع إصلاح سهم الصور واتجاه النص. حُفظت المعرّفات والأسعار والطلبات والحسابات دون تعديل السحابة. أُزيل تكرار التنبيهات العامة وبقي توضيح المحاكاة عند الطلب وسجله. البيع الحقيقي معلق ببيانات النشاط؛ التوسعة محلية حتى المراجعة والنشر.</div>

## 2026-10-23 — Live Google and cloud-order verification / تحقق Google والطلب السحابي

- Main agent completed real Google OAuth with the user's authorized account and verified return to Tavoryxa. The initial callback had fallen back to Qirvexa; saving six exact Supabase redirect URLs (previous four plus both deployed origins with trailing `/`) corrected the return path.
- Simulated cloud order `#B8290AF4` (one notebook, SAR 83 total) appeared after reload. Signing out restored guest history with local order `#68DA4835` only; the cloud order did not appear there. No charge or shipment occurred.
- Google remains Testing; no In Production publishing or verified branding is claimed. The [Google identity-only exception](https://support.google.com/cloud/answer/15549945?hl=en) permits basic identity requests without the test-user list or seven-day authorization expiry, provided no additional scopes are requested.
- Email remains unverified with the delivery gate false; GitHub remains disabled. User deferred Brevo setup. Backend schema, IP and SMTP settings were unchanged during this retest. Historical release/local-test records below are preserved.
- Proof is retained in the root workspace at `research-artifacts/tavoryxa-google-cloud-order.png`, outside this project's committed screenshots. This update changes documentation only.

<div dir="rtl" align="right">تحقق الوكيل الرئيسي من دخول Google الحقيقي بالحساب المصرح به والعودة إلى المتجر بعد تصحيح قائمة العودة إلى ستة عناوين، تشمل عنوانَي الموقعين مع الشرطة المائلة الأخيرة. بقي الطلب السحابي التجريبي `#B8290AF4` لدفتر واحد بإجمالي 83 ريالًا بعد إعادة التحميل، وبعد الخروج ظهر الطلب المحلي السابق `#68DA4835` فقط دون الطلب السحابي. لا دفع أو شحن. Google ما زال في Testing دون ادعاء توثيق العلامة أو النشر In Production؛ استثناء الهوية الأساسية مشروط بالصلاحيات المحدودة. البريد غير متحقق وبوابته معطلة، وGitHub معطل، وإعداد Brevo مؤجل بطلب المستخدم. لم تتغير إعدادات قاعدة البيانات أو IP أو SMTP أثناء إعادة الاختبار، وحُفظ السجل التاريخي أدناه.</div>

## 2026-10-22 — Auth release and selected mail provider / إصدار الحسابات ومزود البريد المختار

- Main-agent source review is complete, including fixed-owner recovery Bearer and the 15-second timeout. Auth update deployed from `5bfbfb1` as Cloudflare version `5f9b5286-19b1-4c58-8482-6afe12e03efb`; CI run `39772228693` succeeded.
- Live email and OAuth remain unverified. Email-delivery gate is false and Google/GitHub flags are false. Deployment does not imply external mail/provider acceptance.
- User chose Brevo (300 emails/day). Sender verification and direct user entry of SMTP login/SMTP key into Supabase remain pending; no SMTP secrets were added to the project. Historical implementation/local-test baseline below is preserved.

<div dir="rtl" align="right">اكتملت المراجعة ونُشر تحديث الحسابات من `5bfbfb1` بالإصدار السحابي المذكور ونجح CI. لم يُختبر البريد أو OAuth فعليًا، وتبقى بوابة البريد والمزودان معطلين. اختير Brevo بحد 300 رسالة يوميًا؛ تحقق المرسل وإدخال بيانات SMTP مباشرة في Supabase معلقان. لم تُضف أسرار للمشروع، وحُفظ سجل التنفيذ الأصلي أدناه.</div>

## 2026-10-22 — Account forms / نماذج الحساب

- Added standalone `AuthPanel.tsx`, public settings/config helpers and Arabic/English email sign-in, matching-password signup, forgot-password and recovery forms, preserving the storefront and guest checkout.
- Provider buttons fail closed against runtime public Auth settings; email delivery flag defaults false and gates signup/reset while enabled email sign-in remains usable. No cloud/provider/confirmation/environment settings changed.
- Updated Supabase JS to exact 2.118.0 for correct PKCE recovery event propagation; captured that event before React mounts. URL markers and ordinary sessions do not authorize password update.
- Bound recovery password PUT to an immutable event owner/token and checked the grant before dispatch; mutable singleton session switches cannot redirect the write to a different account. No passwords or additional recovery credentials are persisted or logged; UI errors are safe localized summaries.
- Fifteen unit tests and browser form, actual-SDK PKCE/network-fixture, account-isolation and guest-shopping packets passed. Auth screenshots inspected. Fresh main-agent review and real provider/mail checks remain external.

<div dir="rtl" align="right">أُضيفت نماذج الحساب العربية والإنجليزية مع إظهار المزودين من الإعداد العام الفعلي، وإبقاء التسجيل والاستعادة بالبريد معطلين حتى التحقق من الإرسال. تعتمد الاستعادة على حدث موثوق وتربط تعديل كلمة المرور بمالك جلسة الاستعادة، دون حفظ كلمة المرور أو عرض أخطاء خام. نجحت 15 حالة اختبار وفحوص النماذج وPKCE وعزل الحسابات والشراء ببيانات شبكة تجريبية؛ إعداد البريد والمزود والنشر لدى الوكيل الرئيسي.</div>

## 2026-10-22 — Tooling security and source formatting / أمان الأدوات وتنسيق المصدر

- Updated only affected development tools: Vite 7.3.7, Vitest 4.1.12 and Wrangler 4.151.3, with exact versions and a refreshed lockfile. No force fixes, overrides or runtime dependency changes.
- Added Prettier 3.9.10 configuration, `format` / `format:check`, consistent text line endings, and a CI formatting gate. Formatted app source, QA scripts, configuration and primary docs without intentional behavior changes.
- Verified formatting, TypeScript, nine tests and production build. Full and production-only dependency audits both report zero vulnerabilities. Vitest's sandbox temp-file rename restriction required the successful test rerun outside the filesystem sandbox.

<div dir="rtl" align="right">حُدثت الأدوات المتأثرة فقط بإصدارات محددة، دون تحديث قسري أو تغيير اعتماديات التشغيل. أُضيف إعداد Prettier وأوامر التنسيق وفحصه وبوابة CI، ونُسق المصدر والتوثيق دون تغيير مقصود للسلوك. نجحت فحوص التنسيق وTypeScript والاختبارات التسعة والبناء، وأظهر التدقيق الكامل وتدقيق الإنتاج صفر ثغرات. أُعيد تشغيل الاختبارات خارج عزل الملفات بعد منع إعادة تسمية ملف مؤقت داخله.</div>

## 2026-10-21 — Initial implementation / التنفيذ الأول

<div dir="rtl" align="right">

المنفذ: الوكيل `portfolio_research_review` بإعداد GPT-6.1-sol High المطلوب. نطاق الكتابة: مجلد `tavoryxa` فقط.

- توثيق التوجه والمنتج قبل التنفيذ؛ تحليل مرجع محدود عبر Webforge وقراءة إرشادات Impeccable وSupabase وWorkers.
- إنشاء React/TypeScript/Vite مع منتجات ورسومات SVG محلية وثنائية اللغة.
- السلة والبحث والفئات والترتيب والتفاصيل والدفع التجريبي والطلبات المحلية وتكامل الحساب السحابي الاختياري.
- قاعدة بيانات مع أسعار موثوقة وRLS وإجراء ذري للطلب، وإعداد أصول Workers وملف متغيرات بلا أسرار.
- إصلاح تباين رمز المنتج وأحجام الأهداف، وإضافة انتقال للمحتوى وإتاحة سجل الطلبات في الهاتف.
- نجاح البناء وTypeScript و6 اختبارات وفحص المتصفح بالعربية والإنجليزية. التحقق من حسابات السحابة والنشر مسؤولية الوكيل الرئيسي.

</div>

Implemented by `portfolio_research_review` (requested GPT-6.1-sol High); edited only `tavoryxa`.

- Documented design/product first; bounded Webforge reference analysis and applicable skill review.
- Built bilingual React/TS/Vite storefront with original SVG objects, complete guest shopping/order flow and optional Supabase/GitHub integration.
- Added canonical-price atomic SQL RPC, owner RLS, Worker assets configuration and secret-free environment example.
- Fixed contrast/touch-size issues, skip link, mobile order navigation and Escape while checkout is busy.
- Build/typecheck and six tests passed; browser verified bilingual checkout/persistence and three widths. Cloud/OAuth/deployment verified separately by the main agent.

## Review fixes / إصلاحات المراجعة

- Removed the unverified registered-trademark symbol. Validated persisted order shape, dates, quantities and totals before rendering; malformed entries are ignored.
- Scoped asynchronous user/order results to an auth generation and mounted component; user changes clear private views and obsolete responses cannot populate the next account.
- Made order dates explicitly Gregorian. Added three unit tests and four isolated browser race/storage regression scenarios; all passed, with a fresh successful build and shopping regression.
- Main agent reports live SQL isolation/pricing/idempotency assertions passed and test transaction rolled back. No live SQL mutation was performed by this author.

<div dir="rtl" align="right">أُزيلت علامة التسجيل غير المثبتة، وأُضيف تحقق للطلبات المخزنة وحماية من نتائج الحسابات السابقة وتحديد التقويم. نجحت الاختبارات التسعة واختبارات المتصفح الخاصة بتبديل الحساب وتأخر الاستجابة والبيانات التالفة بعد إعادة البناء. اختبار SQL السحابي أجراه الوكيل الرئيسي وأبلغ بنجاحه والتراجع عن بياناته.</div>
