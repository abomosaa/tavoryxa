# Tavoryxa — مساحة ليومك / Make room for your day

[![Validate](https://github.com/abomosaa/tavoryxa/actions/workflows/ci.yml/badge.svg)](https://github.com/abomosaa/tavoryxa/actions/workflows/ci.yml)

[Visit Tavoryxa](https://tavoryxa.qirvexa.workers.dev)

<div dir="rtl" align="right">

متجر عربي وإنجليزي لثماني قطع مكتبية، بهوية ورقية دافئة وصور تصورية مولدة محليًا. يضم صفحات منتجات وروابط مباشرة، ومعرضًا وتكبيرًا، وبحثًا وفئات وترتيبًا، ومفضلة وسلة وسجل طلبات.

تحديث 25 أكتوبر: اختيار كمية رقمي دون مربعات أو إطار حول الرقم، أسعار تقديرية من9 إلى59ريالًا، صور مصغرة أصغر، وتنقل ظاهر على الجوال. ثلاث توليفات مكتبية تضيف المنتجات العادية إلى السلة بأسعارها الحالية. حركة افتتاحية للصور، وتبديل المعرض، وتأكيد الإضافة، ونوافذ وإشعارات قصيرة؛ يحترم الموقع تقليل الحركة.

الضيف يحفظ السلة والمفضلة والطلبات على جهازه. Google متاح للحسابات؛ طلبات الحساب تُحفظ في Supabase وتعزل حسب صاحبها. البريد مؤجل حتى اكتمال إعداد المرسل والتحقق من الإرسال. لا تُنقل طلبات الضيف تلقائيًا للحساب.

المنتجات والأسعار والتوصيل تصورات تقديرية. تأكيد الطلب يحفظ محاكاة واضحة، دون تحصيل أو شحن أو جمع بيانات بطاقة أو عنوان. الطلب السحابي القديم بقيمة83ريالًا محفوظ بقيمته الأصلية بعد تخفيض الأسعار.

</div>

An Arabic-first and English storefront for eight fictional desk objects. Product photography is generated concept imagery, served locally with responsive sources and honest SVG failure fallbacks. Product routes, gallery/detail crop/zoom, search/categories/sorting, device-local saved objects, a persistent bag and order history all work.

The 25 October refinement removes quantity presets and the number's rectangular border, introduces lower illustrative prices (SAR9–59), compact gallery thumbnails and visible mobile navigation. Three desk combinations add regular catalogue objects at their current prices; no discount or inventory claim is invented. The photographic opening, gallery, add confirmation, dialogs and notifications have distinct short motion with a reduced-motion alternative.

Guests use device-local storage. Google login supports owner-isolated Supabase order records; guest history is not automatically imported. Email delivery is deferred and gated. Checkout saves explicitly simulated orders only: no payment, shipment, card or address collection.

## Run / التشغيل

```powershell
npm ci
npm run dev
npm run build
npm test
npm run format:check
```

Copy `.env.example` to `.env.local` and configure the public Supabase URL/publishable key. Never expose service-role, OAuth or SMTP secrets. Keep the email-delivery gate false until sending and recovery are verified.

For a new database, use `supabase/001_tavoryxa.sql`. Existing deployments use the bounded `supabase/reprice-catalogue.sql` data update; it changes the eight catalogue prices and leaves historical order snapshots alone. The server RPC ignores caller prices, calculates from the canonical table, checks the authenticated owner and preserves request idempotency.

Routes: `#collection`, `#story`, `#/saved`, and `#/product/notebook` (plus the other seven stable IDs).

## Verification / التحقق

- 19 source tests; production build and format checks.

- `qa/refinement.cjs`: numeric quantity styling/bounds, combination totals and keyboard tabs, visible mobile navigation,32 combinations of routes/languages/widths360/390/820/1440, normal/reduced motion.
- `qa/storefront.cjs`: eight images, gallery/crop/zoom and focus return, wishlist persistence, saved totals/re-add, unknown route and image failure fallback;18 responsive cases.
- Shopping flow, Auth forms, account races/isolation and installed-SDK recovery PKCE regressions passed with fixtures. No real Auth requests are sent by those fixtures.
- Live SQL verified new server totals and ignored forged prices in a rolled-back transaction. The single existing cloud order retained its original fingerprint and total.
- Independent source/visual review by the Qirvexa agent; root review/fixes and publication.

Browser fixtures require Playwright via `PLAYWRIGHT_MODULE` and a local server via `BASE_URL`. Tests in `qa/refinement.cjs` and `qa/storefront.cjs` block external traffic.

![Product page](qa/refinement/product-en-desktop.png)
