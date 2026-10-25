import { useState } from 'react';
import { ArrowLeft, ArrowRight, ShoppingBag } from 'lucide-react';
import { byId, type Lang } from './catalogue';
import { ProductMedia } from './ProductMedia';
import { productHref } from './storefront';

const edits = [
  {
    id: 'write',
    name: { ar: 'بداية على الورق', en: 'Start on paper' },
    description: {
      ar: 'دفتر لأفكارك، قلم لكل يوم، ومشابك للتفاصيل.',
      en: 'A notebook for ideas, a pen for every day, and clips for the details.',
    },
    ids: ['notebook', 'pen', 'clips'],
  },
  {
    id: 'order',
    name: { ar: 'كل شيء في مكانه', en: 'Everything in its place' },
    description: {
      ar: 'مساحة مرتبة للأقلام والمفاتيح وخطة الشهر.',
      en: 'A considered place for pencils, keys, and the month ahead.',
    },
    ids: ['tray', 'cup', 'calendar'],
  },
  {
    id: 'focus',
    name: { ar: 'مساحة للتركيز', en: 'Room to focus' },
    description: {
      ar: 'بساط يجمع مكتبك، وأوراق وقلم للفكرة التالية.',
      en: 'A mat to anchor your desk, with notes and a pen for the next idea.',
    },
    ids: ['mat', 'notes', 'pen'],
  },
] as const;

export function DeskEdit({
  lang,
  money,
  onAdd,
}: {
  lang: Lang;
  money: (cents: number) => string;
  onAdd: (ids: readonly string[]) => void;
}) {
  const [selected, setSelected] = useState(0);
  const edit = edits[selected];
  const ar = lang === 'ar';
  return (
    <section className="desk-edit wrap" aria-labelledby="desk-edit-title">
      <div className="desk-edit-copy">
        <h2 id="desk-edit-title">{ar ? 'مكتب يشبه يومك.' : 'A desk that fits your day.'}</h2>
        <p>
          {ar
            ? 'ابدأ من هنا. ثلاث توليفات من المجموعة، اختر ما يناسب طريقتك.'
            : 'Start here. Three combinations from the collection, chosen for the way you work.'}
        </p>
        <div
          className="edit-tabs"
          role="tablist"
          aria-label={ar ? 'توليفات المكتب' : 'Desk combinations'}
        >
          {edits.map((item, i) => (
            <button
              key={item.id}
              id={`edit-tab-${item.id}`}
              role="tab"
              aria-selected={selected === i}
              aria-controls="edit-panel"
              tabIndex={selected === i ? 0 : -1}
              onClick={() => setSelected(i)}
              onKeyDown={(event) => {
                let next = selected;
                if (event.key === 'ArrowRight') next = (selected + (ar ? 2 : 1)) % edits.length;
                else if (event.key === 'ArrowLeft') next = (selected + (ar ? 1 : 2)) % edits.length;
                else if (event.key === 'Home') next = 0;
                else if (event.key === 'End') next = edits.length - 1;
                else return;
                event.preventDefault();
                setSelected(next);
                document.getElementById(`edit-tab-${edits[next].id}`)?.focus();
              }}
            >
              {item.name[lang]}
            </button>
          ))}
        </div>
        <div id="edit-panel" role="tabpanel" aria-labelledby={`edit-tab-${edit.id}`} tabIndex={0}>
          <p className="edit-description" key={edit.id}>
            {edit.description[lang]}
          </p>
          <div className="edit-total">
            <span>{ar ? 'مجموع القطع الثلاث' : 'Total for three objects'}</span>
            <b>{money(edit.ids.reduce((sum, id) => sum + byId.get(id)!.price, 0))}</b>
          </div>
          <button className="primary" onClick={() => onAdd(edit.ids)}>
            <ShoppingBag size={18} />
            {ar ? 'أضف التوليفة إلى السلة' : 'Add combination to bag'}
            {ar ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
          </button>
        </div>
      </div>
      <div className="edit-objects" key={edit.id}>
        {edit.ids.map((id) => {
          const product = byId.get(id)!;
          return (
            <a href={productHref(product)} key={id}>
              <ProductMedia product={product} lang={lang} sizes="(max-width: 750px) 30vw, 20vw" />
              <span>{product.name[lang]}</span>
              <b>{money(product.price)}</b>
            </a>
          );
        })}
      </div>
    </section>
  );
}
