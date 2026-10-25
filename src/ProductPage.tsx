import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Heart,
  Minus,
  Plus,
  Expand,
  X,
  Check,
  ShoppingBag,
} from 'lucide-react';
import { products, type Product, type Lang } from './catalogue';
import { ProductMedia } from './ProductMedia';
import { ProductCard } from './ProductCard';
import { quantityChoice } from './storefront';

export function ProductPage({
  product,
  lang,
  saved,
  onSave,
  onAdd,
  money,
  cartQuantity,
  savedIds,
}: {
  product: Product;
  lang: Lang;
  saved: boolean;
  savedIds: string[];
  onSave: (id: string) => void;
  onAdd: (p: Product, quantity?: number) => void;
  money: (c: number) => string;
  cartQuantity: number;
}) {
  const [view, setView] = useState(0),
    [quantity, setQuantity] = useState(1),
    [zoom, setZoom] = useState(false);
  const ref = useRef<HTMLDialogElement>(null),
    closeRef = useRef<HTMLButtonElement>(null),
    zoomTrigger = useRef<HTMLButtonElement>(null);
  function closeZoom() {
    ref.current?.close();
    zoomTrigger.current?.focus({ preventScroll: true });
    setZoom(false);
  }
  const ar = lang === 'ar',
    t = (a: string, e: string) => (ar ? a : e);
  const views = [t('صورة المنتج', 'Product image'), t('تكبير التفاصيل', 'Detail crop')];
  const related = products
    .filter((p) => p.id !== product.id)
    .sort(
      (a, b) => Number(b.category === product.category) - Number(a.category === product.category),
    )
    .slice(0, 3);
  useEffect(() => {
    if (zoom) {
      ref.current?.showModal();
      closeRef.current?.focus();
    } else ref.current?.close();
  }, [zoom]);
  return (
    <>
      <section className="product-page wrap" aria-labelledby="product-title">
        <nav className="breadcrumb" aria-label={t('مسار الصفحة', 'Breadcrumb')}>
          <a href="#collection">
            {ar ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
            {t('المجموعة', 'Collection')}
          </a>
          <span>/</span>
          <span>{product.name[lang]}</span>
        </nav>
        <div className="product-layout">
          <div className="product-gallery">
            <div className={`gallery-stage tone-${product.category}`}>
              <ProductMedia
                key={`${product.id}-${view}`}
                sizes="(max-width: 750px) 100vw, 55vw"
                product={product}
                lang={lang}
                eager
                illustration={view === 2}
                closeup={view === 1}
              />
              <button
                ref={zoomTrigger}
                className="gallery-expand secondary"
                onClick={() => setZoom(true)}
                aria-label={t('فتح الصورة المكبرة', 'Open enlarged image')}
              >
                <Expand size={18} />
                {t('تكبير', 'Enlarge')}
              </button>
            </div>
            <div
              className="gallery-options"
              role="group"
              aria-label={t('مشاهد المنتج', 'Product views')}
            >
              {views.map((label, i) => (
                <button
                  key={label}
                  aria-label={label}
                  aria-pressed={view === i}
                  onClick={() => setView(i)}
                  className={view === i ? 'active' : ''}
                >
                  <ProductMedia
                    product={product}
                    lang={lang}
                    illustration={i === 2}
                    closeup={i === 1}
                    sizes="(max-width: 750px) 45vw, 25vw"
                  />
                  <span>{label}</span>
                </button>
              ))}
            </div>
            <p className="gallery-caption">
              {t(
                'صور تصورية مولدة للمجموعة؛ التفاصيل المكبرة اقتطاع من الصورة نفسها.',
                'Generated concept imagery; the detail view is a crop of the same image.',
              )}
            </p>
          </div>
          <div className="purchase-column">
            <div className="product-heading">
              <h1 id="product-title">{product.name[lang]}</h1>
              <button
                className={`icon-button save-detail ${saved ? 'is-saved' : ''}`}
                aria-pressed={saved}
                aria-label={t(
                  saved ? 'إزالة من المفضلة' : 'حفظ في المفضلة',
                  saved ? 'Remove from saved' : 'Save object',
                )}
                onClick={() => onSave(product.id)}
              >
                <Heart size={23} fill={saved ? 'currentColor' : 'none'} />
              </button>
            </div>
            <p className="product-page-price">{money(product.price)}</p>
            <p className="product-description">{product.description[lang]}</p>
            <dl className="product-specs">
              <div>
                <dt>{t('التفاصيل', 'Specification')}</dt>
                <dd>{product.material[lang]}</dd>
              </div>
              <div>
                <dt>{t('اللون', 'Colour')}</dt>
                <dd className="product-colour">
                  <i style={{ background: product.color }} />
                  {t('كما في التصور المعروض', 'As shown in the concept')}
                </dd>
              </div>
            </dl>
            <label className="quantity-label" htmlFor="product-quantity">
              {t('الكمية', 'Quantity')}
            </label>
            <div className="product-buy">
              <div className="quantity">
                <button
                  aria-label={t('تقليل الكمية', 'Decrease quantity')}
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((n) => quantityChoice(n - 1))}
                >
                  <Minus size={16} />
                </button>
                <input
                  id="product-quantity"
                  aria-label={t('الكمية', 'Quantity')}
                  type="number"
                  min="1"
                  max="20"
                  value={quantity}
                  onChange={(e) => setQuantity(quantityChoice(Number(e.target.value)))}
                />
                <button
                  aria-label={t('زيادة الكمية', 'Increase quantity')}
                  disabled={quantity >= 20}
                  onClick={() => setQuantity((n) => quantityChoice(n + 1))}
                >
                  <Plus size={16} />
                </button>
              </div>
              <button
                className="primary"
                disabled={cartQuantity >= 20}
                onClick={() => onAdd(product, quantity)}
              >
                <ShoppingBag size={18} />
                <span>
                  {cartQuantity >= 20
                    ? t('بلغت الحد الأقصى', 'Bag limit reached')
                    : t('أضف إلى السلة', 'Add to bag')}
                </span>
                <b>{money(product.price * quantity)}</b>
              </button>
            </div>
            <p className="bag-context" role="status">
              {cartQuantity > 0 ? (
                <>
                  <Check size={15} />
                  {t(
                    `${cartQuantity} من هذه القطعة في سلتك`,
                    `${cartQuantity} of this object in your bag`,
                  )}
                </>
              ) : (
                t(
                  'يمكن تعديل الكمية أو حذف القطعة من السلة.',
                  'You can adjust quantities or remove an object in your bag.',
                )
              )}
            </p>
            <details className="product-disclosure" open>
              <summary>{t('عن هذه القطعة', 'About this object')}</summary>
              <p>{product.use[lang]}</p>
              <p>
                {t(
                  'تجنّب الماء المباشر والمنظفات القوية للحفاظ على الملمس. المقاس واللون المتاحان موضحان في المواصفات.',
                  'Avoid direct water and harsh cleaners to preserve the surface. Size and colour are shown in the specifications.',
                )}
              </p>
            </details>
            <details className="product-disclosure">
              <summary>{t('الطلبات والتوصيل', 'Orders & delivery')}</summary>
              <p>
                {t(
                  'قبول الطلبات التجارية ووسائل الدفع والشحن قيد الإعداد. يمكنك تجربة السلة وحفظ طلب محاكاة؛ لن تُخصم مبالغ أو تُشحن منتجات.',
                  'Commercial ordering, payment and delivery are being prepared. You can explore the bag and save a simulated order; no payment is collected and no products ship.',
                )}
              </p>
            </details>
          </div>
        </div>
      </section>
      <section className="related-section wrap" aria-labelledby="related-title">
        <div className="section-heading">
          <h2 id="related-title">{t('تكمل مساحتك.', 'Good company for your desk.')}</h2>
          <a className="text-link" href="#collection">
            {t('كل القطع', 'All objects')}
            <ArrowRight size={17} />
          </a>
        </div>
        <div className="product-grid related-grid">
          {related.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              lang={lang}
              saved={savedIds.includes(p.id)}
              onSave={onSave}
              onAdd={onAdd}
              money={money}
            />
          ))}
        </div>
      </section>
      {zoom && (
        <dialog
          ref={ref}
          className="image-lightbox"
          aria-label={t(`صورة مكبرة: ${product.name.ar}`, `Enlarged image: ${product.name.en}`)}
          onCancel={(e) => {
            e.preventDefault();
            closeZoom();
          }}
          onClick={(e) => {
            if (e.currentTarget === e.target) closeZoom();
          }}
        >
          <button
            ref={closeRef}
            className="icon-button lightbox-close"
            aria-label={t('إغلاق الصورة', 'Close image')}
            onClick={closeZoom}
          >
            <X size={23} />
          </button>
          <div className="lightbox-media">
            <ProductMedia
              sizes="(max-width: 1000px) 100vw, 1000px"
              product={product}
              lang={lang}
              eager
              illustration={view === 2}
              closeup={view === 1}
            />
          </div>
          <p>
            {product.name[lang]} · {views[view]}
          </p>
        </dialog>
      )}
    </>
  );
}
