import { Heart, Plus, ArrowUpRight, Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Product, Lang } from './catalogue';
import { ProductMedia } from './ProductMedia';
import { productHref } from './storefront';

export function ProductCard({
  product: p,
  lang,
  saved,
  onSave,
  onAdd,
  money,
}: {
  product: Product;
  lang: Lang;
  saved: boolean;
  onSave: (id: string) => void;
  onAdd: (p: Product) => boolean | void;
  money: (c: number) => string;
}) {
  const ar = lang === 'ar';
  const [added, setAdded] = useState(false);
  useEffect(() => {
    if (!added) return;
    const timer = setTimeout(() => setAdded(false), 1400);
    return () => clearTimeout(timer);
  }, [added]);
  return (
    <article className="product">
      <div className={`product-frame tone-${p.category}`}>
        <a
          className="product-image"
          href={productHref(p)}
          aria-label={ar ? `عرض ${p.name.ar}` : `View ${p.name.en}`}
        >
          <ProductMedia product={p} lang={lang} />
          <span className="view-product">
            {ar ? 'اكتشف القطعة' : 'Explore object'}
            <ArrowUpRight size={16} />
          </span>
        </a>
        <button
          className={`save-product icon-button ${saved ? 'is-saved' : ''}`}
          onClick={() => onSave(p.id)}
          aria-pressed={saved}
          aria-label={
            ar
              ? `${saved ? 'إزالة' : 'حفظ'} ${p.name.ar} ${saved ? 'من' : 'في'} المفضلة`
              : `${saved ? 'Unsave' : 'Save'} ${p.name.en}`
          }
        >
          <Heart size={19} fill={saved ? 'currentColor' : 'none'} />
        </button>
      </div>
      <div className="product-info">
        <a href={productHref(p)}>
          <h3>{p.name[lang]}</h3>
          <p>{p.material[lang]}</p>
        </a>
        <button
          className={`add-button ${added ? 'just-added' : ''}`}
          onClick={() => {
            if (onAdd(p) !== false) setAdded(true);
          }}
          aria-label={ar ? `أضف ${p.name.ar}` : `Add ${p.name.en}`}
        >
          {added ? <Check size={19} /> : <Plus size={19} />}
        </button>
      </div>
      <p className="price">{money(p.price)}</p>
    </article>
  );
}
