import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { products, type Lang } from './catalogue';
import { ProductMedia } from './ProductMedia';
import { productHref } from './storefront';
import './desk-guide.css';

export function DeskGuide({ lang }: { lang: Lang }) {
  const [purpose, setPurpose] = useState(0);
  const ar = lang === 'ar';
  const choices = [
    {
      ar: 'أفكار على الورق',
      en: 'Think on paper',
      index: 0,
      textAr: 'ابدأ صفحة جديدة. دوّن فكرة واحدة، ثم اترك مساحة لما يأتي بعدها.',
      textEn: 'Start a fresh page. Write down one idea, then leave room for what follows.',
    },
    {
      ar: 'مساحة مرتبة',
      en: 'Make room',
      index: 1,
      textAr: 'اجمع التفاصيل الصغيرة في مكان واحد، واترك سطح المكتب للعمل الذي يهمك.',
      textEn: 'Give the little things a home and keep your desk clear for the work that matters.',
    },
    {
      ar: 'لحظة هدوء',
      en: 'Take a moment',
      index: 4,
      textAr: 'استراحة قصيرة وكوب قريب. امنح يومك إيقاعًا يناسبك.',
      textEn: 'A short pause and a cup within reach. Find a rhythm that feels like yours.',
    },
  ];
  const choice = choices[purpose];
  const product = products[choice.index];
  return (
    <>
      <section className="desk-guide wrap" aria-labelledby="desk-guide-heading">
        <div className="desk-guide-copy">
          <h2 id="desk-guide-heading">
            {ar ? 'ماذا تحتاج مساحتك؟' : 'What does your space need?'}
          </h2>
          <p>
            {ar ? 'اختر لحظتك، واكتشف قطعة تناسبها.' : 'Choose your moment. Find an object for it.'}
          </p>
          <div
            className="desk-guide-choices"
            role="group"
            aria-label={ar ? 'اختر استخدامك' : 'Choose your purpose'}
          >
            {choices.map((item, index) => (
              <button
                key={item.en}
                aria-pressed={purpose === index}
                onClick={() => setPurpose(index)}
              >
                {ar ? item.ar : item.en}
              </button>
            ))}
          </div>
          <div className="desk-guide-answer" key={purpose} aria-live="polite">
            <h3>{ar ? product.name.ar : product.name.en}</h3>
            <p>{ar ? choice.textAr : choice.textEn}</p>
            <a className="text-link" href={productHref(product)}>
              {ar ? 'اكتشف تفاصيل القطعة' : 'Explore the details'} <ArrowUpRight size={18} />
            </a>
          </div>
        </div>
        <a
          className="desk-guide-image"
          key={product.id}
          href={productHref(product)}
          aria-label={ar ? product.name.ar : product.name.en}
        >
          <ProductMedia product={product} lang={lang} />
        </a>
      </section>
      <section className="desk-questions wrap" aria-labelledby="desk-questions-heading">
        <h2 id="desk-questions-heading">{ar ? 'قبل أن تختار.' : 'Before you choose.'}</h2>
        {[
          [
            ar ? 'كيف أعرف تفاصيل القطعة؟' : 'Where can I find product details?',
            ar
              ? 'افتح صفحة القطعة لتجد صورًا مكبرة، والمواصفات، والألوان، والأبعاد المتاحة. الصور تصورية؛ راجع التفاصيل المكتوبة قبل إضافة القطعة.'
              : 'Open a product page for enlarged images, specifications, colors and available dimensions. Images are conceptual; check written details before adding an object.',
          ],
          [
            ar ? 'هل أحتاج إلى حساب؟' : 'Do I need an account?',
            ar
              ? 'يمكنك تصفح القطع وحفظ المفضلة والسلة كضيف على جهازك. يتيح تسجيل الدخول مراجعة الطلبات المحفوظة في حسابك.'
              : 'Browse, save favorites and use your bag as a guest on this device. Sign in to review orders saved to your account.',
          ],
          [
            ar ? 'كيف يعمل تأكيد الطلب؟' : 'How does order confirmation work?',
            ar
              ? 'الطلب حاليًا تجربة محفوظة دون خصم مبلغ أو شحن فعلي. تظهر هذه التفاصيل بوضوح عند التأكيد.'
              : 'Orders currently provide a saved experience with no charge or actual shipment. This is explained at confirmation.',
          ],
        ].map(([question, answer]) => (
          <details key={question}>
            <summary>
              {question}
              <span aria-hidden="true">+</span>
            </summary>
            <p>{answer}</p>
          </details>
        ))}
      </section>
    </>
  );
}
