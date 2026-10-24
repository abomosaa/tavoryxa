# Product browsing upgrade / تطوير تجربة المنتجات

## Direction approved by delegation — 2026-10-23

The user approved a richer catalogue, real product pages, gallery, quantity options, wishlist and detailed order history, with generated realistic product imagery. Visual decisions are delegated; no further design interview is required. This is an extension of the established paper/paprika stationery identity, built in code. It does not authorize commercial fulfillment before real business/payment/shipping facts are supplied.

Seven considered structures: (1) compact specification page, (2) full-width image with purchase footer, (3) editorial product narrative, (4) image-led gallery beside a stable purchase column, (5) collection-first side sheet, (6) mobile image stack with anchored controls, (7) comparison-led product workspace. Impeccable surface seed `seed:a54f20f4a8a1a355` dealt 4, 6, 1. Chosen under delegated judgment: **4**, with familiar navigation and mobile reading order from 6. The warm established palette/type remain; photography leads, purchasing controls stay precise. No speculative brand replacement or comp approval claim.

The network seed completed successfully after the first sandbox-only request degraded. Existing legacy PRODUCT schema/stale design sidecar were reported, not automatically repaired.

## Data and commercial boundary

- Preserve all eight existing IDs, prices, saved orders, OAuth and owner-isolation guards. No database migration is needed for quantity options; the existing canonical checkout already validates quantities/prices.
- Quantity options are one, two or three of the existing product, editable up to twenty. Material, color and dimensions are facts of the fictional catalogue, not invented alternative SKUs or live inventory.
- Wishlist is explicitly device-local, contains product IDs only, and is not silently imported to an account. Existing cart and guest orders retain their storage keys.
- Real order acceptance, stock availability, payment, shipping/contact policies remain pending business facts. Checkout continues to create clearly simulated records only.
- Product image paths: `/images/products/{id}.webp` with 480px variants; primary IDs are notebook, tray, pen, calendar, cup, clips, mat, notes. `/images/products/hero.webp` is the editorial composition with a 768px variant. The gallery uses full view and an explicitly labeled crop of the same photo, not another product angle. Original illustrations are retained as image-failure fallbacks. The catalogue describes the generated green linen notebook, oak vessel and sage leather mat consistently.

## Verified local state

- 19 unit tests pass, including safe route parsing, malformed wishlist recovery, bounded quantities and old-price preservation during re-add. TypeScript and production build pass.
- `qa/storefront.cjs` blocks external traffic and passed photo loading, arrow sizing, deep links, detail crop, zoom keyboard/focus return, wishlist persistence, quantities, simulated checkout, order detail/re-add, missing route and failed-image fallback. Arabic/English checked at 390/820/1440px without horizontal overflow or page errors.
- Existing shopping, account-isolation, form and real-SDK PKCE fixtures passed after integration. They do not constitute a fresh live Google/mail test or commercial-order acceptance.
- Review screenshots/results are in `qa/upgrade/`. Independent main-agent review and deployment remain separate gates. Root requested cleanup of global demo banners, hero fallback, repeated description and responsive image sizes; these source corrections are implemented and included in final verification.

<div dir="rtl" align="right">

اعتمد المستخدم توسيع المتجر وفوّض اختيار التصميم. التوجه المختار: صورة ومعرض واضحان بجانب عمود معلومات وشراء ثابت، مع ترتيب مناسب للهاتف، والحفاظ على هوية الورق واللون الأحمر الدافئ. تبقى المنتجات والأسعار والطلبات والحسابات الحالية محفوظة. الخيارات هي كميات حقيقية للمنتج نفسه، دون اختراع ألوان أو مخزون أو أسعار بديلة. المفضلة محلية لهذا الجهاز، ولا تُنقل إلى الحساب تلقائيًا. البيع الحقيقي والدفع والشحن معلقون حتى تتوفر بيانات النشاط؛ إنشاء الطلب يظل تجريبيًا بوضوح.

</div>
