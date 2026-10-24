# تشغيل المتجر / Commerce setup

<div dir="rtl" align="right">

طلب المستخدم بيانات تقديرية في 24 أكتوبر 2026. أُعدت القيم التالية لعرض تجربة المتجر دون نسبتها إلى مورد أو نشاط قائم. لا توجد منتجات فعلية أو حساب تاجر أو وسيلة استلام طلبات مؤكدة في المعلومات المقدمة. لذلك تُحفظ الطلبات بحالة محاكاة؛ لا تُحصّل مبالغ ولا تُرسل طلبات إلى مورد، ولا تُجمع عناوين توصيل.

الأسعار الحالية للمنتجات الثمانية محفوظة كما كانت، وكذلك الطلبات السابقة. يمكن استعمال هذا المشروع كأساس لمتجر حقيقي بعد استبدال بيانات العرض بالمنتجات المتوفرة وصورها المطابقة وتحديد جهة استلام الطلبات والدفع والتوصيل وسياسات البيع. لا يكفي تغيير نص الزر لتفعيل ذلك.

</div>

The user authorized estimated example data on 24 October 2026. The values below demonstrate store behavior; they are not verified supplier or business facts. No actual inventory, merchant account, or order recipient has been supplied. Orders therefore remain simulated, with no payment, supplier transmission, or collection of delivery addresses.

| Setting / الإعداد                 | Estimate / القيمة التقديرية                                                                    |
| --------------------------------- | ---------------------------------------------------------------------------------------------- |
| Brand / العلامة                   | Tavoryxa                                                                                       |
| Example market / السوق المقترح    | Saudi Arabia / السعودية                                                                        |
| Example destination / وجهة المثال | Riyadh / الرياض                                                                                |
| Currency / العملة                 | SAR / الريال السعودي                                                                           |
| Delivery / التوصيل                | SAR 18 below SAR 200; free from SAR 200 / 18 ريالًا دون 200، ومجاني من 200                     |
| Timing / المدة                    | 2–5 working days, illustrative only / 2–5 أيام عمل للتوضيح فقط                                 |
| Order mode / حالة الطلب           | Simulated, no fulfillment / محاكاة دون تنفيذ أو شحن                                            |
| Product imagery / الصور           | Generated concept photography / تصورات مولّدة                                                  |
| Business contact / التواصل        | Not provided; no invented functioning address or phone / غير مقدم، ولم يُخترع بريد أو رقم فعلي |
| Payment / الدفع                   | Not connected / غير مربوط                                                                      |

Estimates are centralized in `src/commerce.ts`. The delivery fee/threshold match the existing server-side checkout rules, so historical totals remain compatible. The eight product IDs and prices were preserved. Changing commercial prices, shipping, real SKUs or payment behavior requires corresponding server-side validation and a migration that retains old order snapshots.

Before commercial activation, replace concept images/specifications with real merchandise, designate the order recipient, connect an appropriate payment or agreed offline method, and implement stock/fulfillment and accurate customer-facing policies. Until then, the current confirmation explicitly states that no funds are charged or products shipped.
