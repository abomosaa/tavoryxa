# Tavoryxa — مساحة ليومك / Make room for your day

[![Validate demo](https://github.com/abomosaa/tavoryxa/actions/workflows/ci.yml/badge.svg)](https://github.com/abomosaa/tavoryxa/actions/workflows/ci.yml)

<div dir="rtl" align="right">

متجر عرض عربي وإنجليزي لثمانية منتجات مكتبية خيالية. يتضمن تصفح الفئات والبحث والترتيب وتفاصيل المنتج وسلة محفوظة والكمية والحذف وطلبًا تجريبيًا وسجل طلبات. الرسومات SVG محلية أصلية؛ لا بيع أو دفع أو شحن حقيقي، ولا تُجمع بيانات بطاقة أو عنوان.

**الحالة المتحققة:** نُشر المتجر على Cloudflare واستجاب الرابط العام بنجاح. نجح البناء وTypeScript والاختبارات التسعة وفحص المتصفح لمسار الطلب وحفظه وإعادة التحميل وتبديل اللغة والتجاوب عند 390 و820 و1440 بكسل. لم يظهر تجاوز أفقي أو أخطاء صفحة. طُبق SQL واختُبر عزل المستخدمين والأسعار. تفعيل دخول GitHub للزوار لم يكتمل بعد.

وضع الضيف يعمل دون إعداد: تحفظ السلة والطلبات في هذا المتصفح فقط. لا تُنقل الطلبات المحلية تلقائيًا إلى الحساب. تفعيل الدخول عبر GitHub يحتاج إعداد مقدم الخدمة والسماح بعنوان العودة ثم متغير البيئة الموضح أدناه. فشل الطلب السحابي يظهر خطأ ولا يحفظ نجاحًا محليًا بديلًا.

</div>

A complete Arabic-first / English storefront demo with eight fictional desk objects, original local SVG artwork, category/search/sort, product detail, persistent bag, quantity/removal, simulated checkout, confirmation and order history. No real sales, card/address collection, charges or fulfillment.

Published on Cloudflare with a successful public HTTP response. Build, TypeScript, nine cart/checkout/storage tests, browser checkout + persistence + bilingual/mobile navigation passed; no page errors or horizontal overflow at 390/820/1440px. Live SQL isolation/trusted-price assertions passed. Visitor GitHub provider setup remains pending.

[Live demo / العرض المباشر](https://tavoryxa.qirvexa.workers.dev) · [Source / المصدر](https://github.com/abomosaa/tavoryxa)

**Authentication source update (2026-10-22):** email/password sign-in, confirmation-gated signup, forgot/reset password, and runtime Google/GitHub visibility are implemented and locally verified. This update still requires the main agent's fresh review/redeployment and external provider/mail delivery checks. No mail or OAuth configuration was changed by this implementation.

**تحديث مصدر الحسابات:** أُضيفت نماذج البريد وكلمة المرور والاستعادة وإظهار Google وGitHub حسب الإعداد الفعلي. اختُبرت محليًا؛ اعتماد التحديث ونشره والتحقق الفعلي من المزود والبريد لدى الوكيل الرئيسي. لم يغيّر هذا التنفيذ إعدادات السحابة أو تأكيد البريد.

![Arabic storefront / واجهة المتجر العربية](qa/screenshots/capture/shots/desktop-fold.png)

## Run / التشغيل

```powershell
npm ci
npm run dev
npm run typecheck
npm test
npm run build
npm run format:check
```

`npm run format` formats source, QA scripts and primary configuration/docs with pinned Prettier 3.9.10. CI checks formatting before type checks/tests/build. Development tools are pinned to patched Vite 7.3.7, Vitest 4.1.12 and Wrangler 4.151.3; the full dependency audit and production-only audit reported zero findings on 2026-10-22.

الأمر `npm run format` ينسق المصدر وملفات الاختبار والإعداد والتوثيق، ويفحص CI التنسيق قبل بقية التحقق. حُدثت الأدوات المتأثرة أمنيًا فقط؛ أظهر التدقيق الكامل وتدقيق الإنتاج صفر ثغرات في 22 أكتوبر 2026.

Node 22.12+ or Node 24 recommended. Copy `.env.example` to `.env.local` for cloud mode, populate browser-safe Supabase URL/publishable key, and rebuild. Never put `service_role`, secret keys or OAuth secrets in Vite environment variables.

تُنسخ `.env.example` إلى `.env.local` عند تفعيل السحابة. متغيرات Vite عامة للمتصفح؛ لا توضع فيها مفاتيح سرية.

| Variable                        | Meaning / المعنى                                                                                                                                          |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `VITE_SUPABASE_URL`             | New approved shared project URL / عنوان المشروع الجديد المعتمد                                                                                            |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Public browser key only / المفتاح العام فقط                                                                                                               |
| `VITE_EMAIL_DELIVERY_ENABLED`   | Defaults to `false`; enable only after real confirmation/reset mail delivery is verified / يبقى معطلًا حتى التحقق الفعلي من وصول رسائل التأكيد والاستعادة |

## Cloud contract / ربط السحابة

- Apply `supabase/001_tavoryxa.sql` once to the approved NEW project. It creates only `tavoryxa_*` tables and `tavoryxa_private` functions.
- Public catalogue: `tavoryxa_products` is read-only for visitors/users. Prices are integer halalas.
- Orders: authenticated owner-only SELECT, no direct public INSERT/UPDATE/DELETE. Public invoker RPC calls a private-schema definer writer with fixed empty search path and explicit `auth.uid()` check.
- `tavoryxa_create_order(p_items, p_name, p_request_id)` accepts only product IDs/quantities and a display name/request UUID. The database derives canonical prices/delivery/total, atomically creates order and lines (JSON), and returns an idempotent record for retries. No caller-supplied user ID/status/price accepted.
- Email sign-in uses the existing Supabase client. Google/GitHub buttons appear only when `GET /auth/v1/settings` confirms their exact `external` flag is `true`; failures default to unavailable. No provider secrets enter the browser. The former `VITE_GITHUB_AUTH_ENABLED` switch is no longer used.
- New email registration/reset requests require both the public email-provider flag and `VITE_EMAIL_DELIVERY_ENABLED=true`; signup also honors `disable_signup`. Ordinary email/password sign-in remains usable when the email provider is enabled. Email confirmation is not disabled or bypassed.
- OAuth/signup callbacks target the current origin's `/`; reset requests target the current origin's `/?auth=recovery`. Root must allow the actual deployed and local callback URLs and configure provider callbacks in the external consoles.
- The singleton client uses PKCE. A module-level listener captures only a genuine SDK `PASSWORD_RECOVERY` event before React mounts; a URL marker or ordinary session never grants access to password update. Reset links must be opened in the browser that initiated the request.
- Password mutation is deliberately bound to the recovery event's immutable owner/access token with `PUT /auth/v1/user`, public `apikey`, and that captured Bearer. A pre-dispatch current-grant check stops known stale requests; a later cross-tab singleton-session change cannot change the request's owner. The grant is held only in memory and cleared after success/sign-out/ordinary sign-in. Do not replace this with a mutable-session `auth.updateUser()` call without equivalent owner binding.
- There is no custom Worker API. The client uses Supabase REST/RPC and Auth. `wrangler.jsonc` serves `dist` assets with SPA fallback. Main agent owns deployment/resource authorization.

<div dir="rtl" align="right">

تُطبّق SQL مرة واحدة على المشروع الجديد فقط. الكتالوج للقراءة، والطلبات تُقرأ بصلاحية المالك فقط. إجراء الطلب يستمد الأسعار من قاعدة البيانات ويحفظ السطور والمجموع معًا؛ لا يسمح للمستخدم بتغيير المالك أو الحالة أو السعر. لا توجد واجهة API خاصة في Worker؛ يتصل المتصفح مباشرة بخدمات Supabase المصرح بها، ويقدّم Worker ملفات الموقع.

</div>

## Evidence / أدلة التحقق

- `qa/browser-results.json`: actual browser flow results. `qa/browser-check.cjs` can rerun with Playwright installed in the QA environment (or `PLAYWRIGHT_MODULE` set to an existing module path) and installed Edge. Default URL `http://127.0.0.1:5174`; override `BASE_URL`.
- `qa/flow/`: English desktop, Arabic checkout, mobile order screenshots.
- `qa/screenshots/capture/shots/`: initial AR 1440/820/390 screenshots.
- `qa/audit/`: Webforge audit after contrast/touch fixes: 98 overall, no high accessibility issues, no responsive findings. It heuristically missed the existing Arabic skip link. Remaining low/medium findings include tiny decorative labels, no public canonical/social metadata and font-count advice. This is a tool audit, not Lighthouse certification.
- `qa/auth-forms.cjs`: isolated AR/EN form regression, validation/no request on mismatch, safe errors, signup/reset/OAuth arguments, delivery gate, settings failure, forged recovery marker rejection, early recovery and update. `qa/auth-pkce.cjs`: actual installed SDK with every Auth request intercepted, generated verifier, callback exchange, early recovery event, fixed-owner password update and URL cleanup. These fixtures do not prove live mail or OAuth delivery.
- Current unit suite: 15 passing tests, including settings fail-closed, password matching and fixed-owner recovery mutation guards. `qa/auth/` contains inspected mobile auth screenshots.
- The current Impeccable detector reports design-system palette/type-ramp advisories against the incomplete/stale sidecar. Product record schema and sidecar advisories were reported without automatic repair; `DESIGN.md` remains visual authority. The earlier empty detector result predates that schema.

الدليل البصري وتقارير المتصفح محفوظة داخل `qa`. نتائج الأدوات لا تمثل اختبارًا يدويًا لكل تقنية مساعدة، ولا تثبت عمل OAuth أو النشر قبل اختباره فعليًا.

## Reuse / إعادة الاستخدام

Replace names/artwork/catalogue, update SQL seeded catalogue consistently, then provide the new project environment and redirect URLs. Local cart/order keys and Supabase auth storage are prefixed `tavoryxa`. Do not reuse a real store's privacy/payment claims without implementing them.

يمكن إعادة تخصيص الاسم والمنتجات والرسومات، مع تحديث كتالوج قاعدة البيانات بما يطابق الأسعار المعروضة. مفاتيح التخزين معزولة باسم المشروع. لا تُستخدم ادعاءات متجر فعلي قبل تنفيذ متطلباته.

Auth isolation regression: `qa/auth-isolation.cjs` substitutes a browser-only Supabase module and verifies stale getUser/order/checkout responses and corrupt local history. It makes no live backend calls. مراجعة عزل الحساب تستخدم بديلًا محليًا داخل المتصفح دون اتصالات سحابية فعلية.

نماذج الحسابات عربية وإنجليزية، ولا تحفظ كلمات المرور أو تعرض أخطاء الخادم الخام. اختبارات الاستعادة تربط التغيير بمالك الجلسة التي صدرت لها الاستعادة، وتمنع نتيجة حساب قديم من الظهور في حساب آخر. اختبارات المتصفح تستبدل الشبكة ببيانات تجريبية ولا تثبت وصول رسالة أو نجاح تسجيل Google الفعلي.
