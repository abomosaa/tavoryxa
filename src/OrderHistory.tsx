import { Package, ArrowUpRight, ShoppingBag } from 'lucide-react';
import { byId, type Lang } from './catalogue';
import type { Order } from './orders';
import { ProductMedia } from './ProductMedia';

export function OrderHistory({
  orders,
  lang,
  money,
  onRepeat,
}: {
  orders: Order[];
  lang: Lang;
  money: (c: number) => string;
  onRepeat: (order: Order) => void;
}) {
  const t = (a: string, e: string) => (lang === 'ar' ? a : e);
  return (
    <div className="order-history">
      {orders.map((o) => (
        <details className="order-record" key={o.id}>
          <summary>
            <span className="order-symbol">
              <Package size={22} />
            </span>
            <span className="order-record-title">
              <b dir="ltr">#{o.id.slice(0, 8).toUpperCase()}</b>
              <span>
                {new Date(o.created_at).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-GB', {
                  calendar: 'gregory',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </span>
            <span className="order-record-total">
              <b>{money(o.total_cents)}</b>
              <small>{t('محاكاة · لا شحن', 'Simulated · No fulfillment')}</small>
            </span>
            <ArrowUpRight size={18} />
          </summary>
          <div className="order-record-body">
            <p className="mode-note">
              {o.source === 'cloud'
                ? t('محفوظ في حسابك السحابي', 'Saved to your cloud account')
                : t('محفوظ على هذا الجهاز فقط', 'Saved on this device only')}
            </p>
            {o.items.map((line) => {
              const p = byId.get(line.id);
              return (
                <div className="history-line" key={line.id}>
                  {p && <ProductMedia product={p} lang={lang} />}
                  <div>
                    <h3>{p?.name[lang] || line.id}</h3>
                    <p>
                      {t('الكمية', 'Quantity')}: {line.quantity} · {money(line.unit_price)}{' '}
                      {t('للقطعة', 'each')}
                    </p>
                  </div>
                  <b>{money(line.unit_price * line.quantity)}</b>
                </div>
              );
            })}
            <dl className="history-totals">
              <div>
                <dt>{t('المجموع الفرعي المحفوظ', 'Saved subtotal')}</dt>
                <dd>{money(o.total_cents - o.delivery_cents)}</dd>
              </div>
              <div>
                <dt>{t('توصيل تجريبي', 'Demo delivery')}</dt>
                <dd>{money(o.delivery_cents)}</dd>
              </div>
              <div>
                <dt>{t('الإجمالي المحفوظ', 'Saved total')}</dt>
                <dd>{money(o.total_cents)}</dd>
              </div>
            </dl>
            <p className="auth-hint">
              {t(
                'إعادة الإضافة تستخدم الأسعار الحالية والكميات حتى 20 لكل منتج؛ لا تغيّر الطلب السابق.',
                'Re-adding uses current prices, up to 20 of each object. Your saved order stays unchanged.',
              )}
            </p>
            <button className="secondary" onClick={() => onRepeat(o)}>
              <ShoppingBag size={17} />
              {t('أضف القطع إلى السلة مجددًا', 'Add objects to bag again')}
            </button>
          </div>
        </details>
      ))}
    </div>
  );
}
