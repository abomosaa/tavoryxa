# Change log / سجل التغييرات

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
