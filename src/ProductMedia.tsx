import { useState } from 'react';
import { products, type Product, type Lang } from './catalogue';
import { ProductArt } from './ProductArt';

/** Photos are locally served generated concept assets; never claim real inventory. */
export function ProductMedia({
  product,
  lang,
  className = '',
  illustration = false,
  eager = false,
  closeup = false,
  sizes = '(max-width: 750px) 50vw, (max-width: 1100px) 33vw, 25vw',
}: {
  product: Product;
  lang: Lang;
  className?: string;
  illustration?: boolean;
  eager?: boolean;
  closeup?: boolean;
  sizes?: string;
}) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const fallback = illustration || failed;
  return (
    <span
      className={`product-media ${className} ${loaded || fallback ? 'is-ready' : 'is-loading'} ${closeup && !fallback ? 'is-closeup' : ''}`}
      aria-busy={!loaded && !fallback}
    >
      {fallback ? (
        <ProductArt product={product} />
      ) : (
        <img
          src={`/images/products/${product.id}.webp`}
          srcSet={`/images/products/${product.id}-480.webp 480w, /images/products/${product.id}.webp 960w`}
          sizes={sizes}
          alt={
            lang === 'ar'
              ? `تصور للمنتج: ${product.name.ar}`
              : `Product concept: ${product.name.en}`
          }
          width={960}
          height={960}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
        />
      )}
      {failed && !illustration && (
        <span className="media-fallback">
          {lang === 'ar' ? 'الرسم التوضيحي · الصورة غير متاحة' : 'Illustration · Photo unavailable'}
        </span>
      )}
    </span>
  );
}

export function HeroMedia({ lang }: { lang: Lang }) {
  const [failed, setFailed] = useState(false);
  if (failed)
    return (
      <span className="hero-photo-frame hero-image-fallback">
        <ProductArt product={products[0]} />
      </span>
    );
  return (
    <span className="hero-photo-frame">
      <img
        className="hero-photo"
        src="/images/products/hero.webp"
        srcSet="/images/products/hero-768.webp 768w, /images/products/hero.webp 1536w"
        sizes="(max-width: 750px) 100vw, 50vw"
        alt={
          lang === 'ar'
            ? 'تكوين تصوري لقطع مكتبية من المجموعة'
            : 'Concept still life of objects from the collection'
        }
        width={1536}
        height={1024}
        fetchPriority="high"
        onError={() => setFailed(true)}
      />
    </span>
  );
}
