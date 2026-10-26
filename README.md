Tavoryxa — مساحة ليومك / Make room for your day
Validate
Visit Tavoryxa
<div dir="rtl" align="right">
متجر إلكتروني ثنائي اللغة (عربي/إنجليزي) متخصص في الأدوات والقطع المكتبية، يتميز بهوية ورقية دافئة وتصوير واضح للمنتجات وتجربة تصفح سريعة ومستجيبة. يتيح الموقع استكشاف المنتجات، البحث والتصفية، إدارة السلة والمفضلة، وإتمام الطلبات ومتابعة سجلها.
أبرز التحديثات والمميزات:
 * تجربة واجهة مخصصة: اختيار مرن للكميات، أسعار محدثة (تترواح بين 9 و59 ريالاً)، عرض مصغرات صور محسّن، وشريط تنقل سلس مخصص للهواتف المحمولة.
 * توليفات ومجموعات مكتبية: إمكانية إضافة حزم منتجات متكاملة إلى السلة مباشرة بأسعارها الحالية.
 * تفاعلات وانتقالات بصرية: حركة افتتاحية للصور، تنقل ديناميكي في المعرض، وإشعارات تأكيد سريعة، مع دعم كامل لتقليل الحركة (Reduced Motion).
 * إدارة الحسابات والجلسات: حفظ السلة والمفضلة والطلبات محلياً على جهاز الزائر، مع إمكانية تسجيل الدخول عبر Google لمزامنة الطلبات سحابياً وأمان تام عبر Supabase.
</div>
An Arabic-first and English storefront for premium desk objects and stationery. Built with a warm paper-inspired aesthetic, responsive image pipeline, interactive product galleries, search, category filtering, persistent shopping bag, and order management.
Key Features
 * Intuitive Shopping Experience: Streamlined product detail routes, image zoom/crop, dynamic filtering, and custom bundle additions.
 * Mobile-Optimized: Clean, responsive navigation designed specifically for mobile and desktop screens.
 * Account & Guest Workflows: Local storage persistence for guest sessions, with seamless Google OAuth authentication and secure Supabase-backed order isolation for registered users.
 * Accessible Design: Fluid interactions and micro-animations with full support for system prefers-reduced-motion settings.
Run / التشغيل
npm ci
npm run dev
npm run build
npm test
npm run format:check

Copy .env.example to .env.local and configure the public Supabase URL and publishable key.
For a new database setup, run supabase/001_tavoryxa.sql. For catalogue updates, use supabase/reprice-catalogue.sql. The server RPC handles server-side price validation, owner authentication check, and request idempotency.
Routes: #collection, #story, #/saved, and #/product/notebook (along with all catalog product IDs).
Verification / التحقق
 * Automated Tests: 19 source tests covering production builds, formatting, and critical store paths.
 * E2E & Layout Quality: Validated across 32 combinations of routes, languages, viewports (360px to 1440px), and motion settings via Playwright (qa/refinement.cjs & qa/storefront.cjs).
 * Data & Auth Integrity: Verified backend RPC pricing calculations, transaction rollbacks, and secure session isolation.

![Product page](qa/refinement/product-en-desktop.png)
