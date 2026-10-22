import { useEffect, useRef, useState, type ReactNode, type FormEvent } from 'react';
import {
  ArrowUpRight,
  ArrowLeft,
  ShoppingBag,
  Search,
  X,
  Plus,
  Minus,
  ArrowRight,
  Package,
  Check,
  LogIn,
  Globe,
  Leaf,
  MoveUpRight,
} from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { products, byId, type Product, type Lang, type Category } from './catalogue';
import {
  normalizeCart,
  updateCart,
  cartTotals,
  validateCheckout,
  readStorage,
  type CartLine,
} from './cart';
import {
  supabase,
  getRecoveryUserId,
  clearRecoverySignal,
  recoveryCallbackRequested,
} from './supabase';
import { AuthPanel } from './AuthPanel';
import { ProductArt } from './ProductArt';
import { isOrder, localOrders, type Order } from './orders';
type Panel = 'cart' | 'checkout' | 'orders' | 'account' | 'confirmation' | null;
function Modal({
  children,
  title,
  onClose,
  wide = false,
}: {
  children: ReactNode;
  title: string;
  onClose: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className={wide ? 'modal wide' : 'modal'}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-label={title}
    >
      <div className="modal-head">
        <h2>{title}</h2>
        <button
          className="icon-button"
          onClick={onClose}
          aria-label={document.documentElement.lang === 'ar' ? 'إغلاق' : 'Close'}
        >
          <X />
        </button>
      </div>
      {children}
    </dialog>
  );
}
export default function App() {
  const [lang, setLang] = useState<Lang>(() =>
    readStorage<string>('tavoryxa.lang', 'ar') === 'en' ? 'en' : 'ar',
  );
  const t = (ar: string, en: string) => (lang === 'ar' ? ar : en);
  const [cart, setCart] = useState<CartLine[]>(() =>
    normalizeCart(readStorage('tavoryxa.cart', [])),
  );
  const [category, setCategory] = useState<Category>('all'),
    [query, setQuery] = useState(''),
    [sort, setSort] = useState('featured');
  const [selected, setSelected] = useState<Product | null>(null),
    [panel, setPanel] = useState<Panel>(recoveryCallbackRequested ? 'account' : null);
  const [user, setUser] = useState<User | null>(null),
    [authLoading, setAuthLoading] = useState(Boolean(supabase));
  const [recoveryUserId, setRecoveryUserId] = useState<string | null>(() => getRecoveryUserId());
  const [recoveryNotice, setRecoveryNotice] = useState(recoveryCallbackRequested);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [notice, setNotice] = useState('');
  const [orders, setOrders] = useState<Order[]>([]),
    [order, setOrder] = useState<Order | null>(null),
    [orderLoading, setOrderLoading] = useState(false);
  const requestId = useRef(crypto.randomUUID());
  const alive = useRef(true),
    authEpoch = useRef(0),
    currentUserId = useRef<string | null>(null);
  const isCurrent = (epoch: number, id: string | null) =>
    alive.current && epoch === authEpoch.current && id === currentUserId.current;
  const money = (c: number) =>
    new Intl.NumberFormat(lang === 'ar' ? 'ar-SA' : 'en-SA', {
      style: 'currency',
      currency: 'SAR',
      maximumFractionDigits: 0,
    }).format(c / 100);
  const totals = cartTotals(cart),
    count = cart.reduce((s, l) => s + l.quantity, 0);
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    try {
      localStorage.setItem('tavoryxa.lang', JSON.stringify(lang));
    } catch {}
  }, [lang]);
  useEffect(() => {
    try {
      localStorage.setItem('tavoryxa.cart', JSON.stringify(cart));
    } catch {
      setNotice(t('تعذر حفظ السلة على الجهاز.', 'Cart could not be saved on this device.'));
    }
    requestId.current = crypto.randomUUID();
  }, [cart]);
  useEffect(() => {
    alive.current = true;
    const client = supabase;
    if (!client)
      return () => {
        alive.current = false;
        authEpoch.current++;
      };
    let active = true;
    const initialEpoch = authEpoch.current;
    function applyUser(next: User | null) {
      if (!active) return;
      if (currentUserId.current !== (next?.id ?? null)) {
        authEpoch.current++;
        currentUserId.current = next?.id ?? null;
        setOrders([]);
        setOrder(null);
        setSelected(null);
        setPanel(null);
        setError('');
        setNotice('');
        setBusy(false);
        setOrderLoading(false);
      }
      setUser(next);
      setAuthLoading(false);
      const recoveryId = getRecoveryUserId();
      setRecoveryUserId(next?.id === recoveryId ? recoveryId : null);
      if (next && next.id === recoveryId) setPanel('account');
    }
    client.auth
      .getUser()
      .then(({ data }) => {
        if (active && initialEpoch === authEpoch.current) {
          applyUser(data.user);
          if (recoveryCallbackRequested) setPanel('account');
        }
      })
      .catch(() => {
        if (active && initialEpoch === authEpoch.current) setAuthLoading(false);
      });
    const { data } = client.auth.onAuthStateChange((_event, session) =>
      applyUser(session?.user ?? null),
    );
    return () => {
      active = false;
      alive.current = false;
      authEpoch.current++;
      data.subscription.unsubscribe();
    };
  }, []);
  useEffect(() => {
    if (!notice) return;
    const timeout = setTimeout(() => setNotice(''), 3500);
    return () => clearTimeout(timeout);
  }, [notice]);
  function add(p: Product) {
    setCart((c) => updateCart(c, p.id, (c.find((l) => l.id === p.id)?.quantity || 0) + 1));
    setNotice(t('أُضيف إلى السلة', 'Added to your bag'));
  }
  function open(p: Panel) {
    setSelected(null);
    setError('');
    setPanel(p);
  }
  async function loadOrders() {
    const epoch = authEpoch.current,
      id = currentUserId.current;
    if ((user?.id ?? null) !== id) return;
    open('orders');
    setOrders([]);
    setOrderLoading(true);
    try {
      if (id && supabase) {
        const { data, error: e } = await supabase
          .from('tavoryxa_orders')
          .select('id,created_at,total_cents,delivery_cents,items')
          .order('created_at', { ascending: false })
          .limit(50);
        if (!isCurrent(epoch, id)) return;
        if (e) throw e;
        setOrders((data || []).filter(isOrder).map((o) => ({ ...o, source: 'cloud' })));
      } else setOrders(localOrders(readStorage('tavoryxa.orders', [])));
    } catch {
      if (isCurrent(epoch, id))
        setError(
          t(
            'تعذر تحميل الطلبات السحابية. أعد المحاولة.',
            'Could not load cloud orders. Please retry.',
          ),
        );
    } finally {
      if (isCurrent(epoch, id)) setOrderLoading(false);
    }
  }
  async function checkout(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const epoch = authEpoch.current,
      id = currentUserId.current;
    if ((user?.id ?? null) !== id || busy) return;
    setError('');
    const data = new FormData(e.currentTarget);
    try {
      validateCheckout(cart, String(data.get('name') || ''));
    } catch {
      setError(
        t(
          'أدخل اسمًا من حرفين إلى 80 حرفًا وتأكد من وجود منتجات.',
          'Enter a name of 2–80 characters and add products.',
        ),
      );
      return;
    }
    setBusy(true);
    try {
      let result: Order;
      if (user && supabase) {
        const { data: record, error: e } = await supabase.rpc('tavoryxa_create_order', {
          p_items: cart.map((l) => ({ id: l.id, quantity: l.quantity })),
          p_name: String(data.get('name')).trim(),
          p_request_id: requestId.current,
        });
        if (e) throw e;
        result = { ...record, source: 'cloud' };
      } else {
        result = {
          id: requestId.current,
          created_at: new Date().toISOString(),
          total_cents: totals.total,
          delivery_cents: totals.delivery,
          items: cart.map((l) => ({ ...l, unit_price: byId.get(l.id)!.price })),
          source: 'local',
        };
        const saved = localOrders(readStorage('tavoryxa.orders', []));
        localStorage.setItem('tavoryxa.orders', JSON.stringify([result, ...saved].slice(0, 50)));
      }
      if (!isCurrent(epoch, id)) return;
      if (!isOrder(result)) throw new Error('Invalid order response');
      setOrder(result);
      setCart([]);
      setPanel('confirmation');
    } catch {
      if (isCurrent(epoch, id))
        setError(
          t(
            'لم يُحفظ الطلب. تحقق من الاتصال ثم أعد المحاولة؛ لن تُخصم أي مبالغ.',
            'Order was not saved. Check your connection and try again; no payment is charged.',
          ),
        );
    } finally {
      if (isCurrent(epoch, id)) setBusy(false);
    }
  }
  let filtered = products.filter(
    (p) =>
      (category === 'all' || p.category === category) &&
      `${p.name.ar} ${p.name.en} ${p.description[lang]}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  if (sort === 'low') filtered = [...filtered].sort((a, b) => a.price - b.price);
  if (sort === 'high') filtered = [...filtered].sort((a, b) => b.price - a.price);
  const categories: Array<[Category, string, string]> = [
    ['all', 'كل القطع', 'All objects'],
    ['paper', 'ورق وأفكار', 'Paper & ideas'],
    ['organize', 'تنظيم المكتب', 'Desk organization'],
    ['tools', 'أدوات يومية', 'Everyday tools'],
  ];
  const summary = (
    <div className="summary">
      <div>
        <span>{t('المجموع الفرعي', 'Subtotal')}</span>
        <b>{money(totals.subtotal)}</b>
      </div>
      <div>
        <span>{t('توصيل تجريبي', 'Demo delivery')}</span>
        <b>{totals.delivery ? money(totals.delivery) : t('مجاني', 'Free')}</b>
      </div>
      <div className="summary-total">
        <span>{t('الإجمالي التجريبي', 'Demo total')}</span>
        <b>{money(totals.total)}</b>
      </div>
    </div>
  );
  return (
    <>
      <a className="skip-link" href="#main-content">
        {t('انتقل إلى المحتوى', 'Skip to content')}
      </a>
      <div className="announcement">
        {t(
          'متجر تجريبي لمعرض الأعمال · لا بيع أو دفع أو شحن فعلي',
          'Portfolio demo store · No real sales, payments or fulfillment',
        )}
        <span>TAVORYXA OBJECTS</span>
      </div>
      <header className="header wrap">
        <a href="#" className="wordmark" aria-label="Tavoryxa home">
          tavoryxa
        </a>
        <nav aria-label={t('التنقل الرئيسي', 'Main navigation')}>
          <a href="#collection">{t('المجموعة', 'The collection')}</a>
          <a href="#story">{t('عن المساحة', 'Our approach')}</a>
          <button onClick={() => void loadOrders()}>{t('طلباتي', 'My orders')}</button>
        </nav>
        <div className="header-actions">
          <button className="language" onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}>
            <Globe size={16} />
            {lang === 'ar' ? 'EN' : 'عربي'}
          </button>
          <button
            className="icon-button account-button"
            onClick={() => open('account')}
            aria-label={t('الحساب', 'Account')}
          >
            <LogIn size={19} />
          </button>
          <button
            className="bag-button"
            onClick={() => open('cart')}
            aria-label={t(`السلة، ${count} قطعة`, `Bag, ${count} items`)}
          >
            <ShoppingBag size={19} />
            <span>{count}</span>
          </button>
        </div>
      </header>
      <main id="main-content">
        <section className="hero wrap">
          <div className="hero-copy">
            <h1>
              {t('مساحة صغيرة.', 'A little space.')}
              <br />
              <em>{t('أفكار كبيرة.', 'A lot of possibility.')}</em>
            </h1>
            <p>
              {t(
                'أشياء تختارها بعناية، ليوم تصنعه على مهل. اكتشف قطعًا بسيطة تمنح مكتبك مساحة للتفكير.',
                'Considered objects for an unhurried day. Discover simple pieces that give your desk a little more room to think.',
              )}
            </p>
            <a className="primary" href="#collection">
              {t('اكتشف المجموعة', 'Explore the collection')}
              {lang === 'ar' ? <ArrowLeft size={19} /> : <ArrowRight size={19} />}
            </a>
            <div className="hero-foot">
              <span className="tiny-line" />
              {t('ورق. ملمس. بداية جديدة.', 'Paper. Texture. A fresh start.')}
            </div>
          </div>
          <div className="hero-visual">
            <div className="visual-caption">
              <span>THE DESK EDIT</span>
              <span>VOL. 01 / 2026</span>
            </div>
            <div className="hero-stage">
              <ProductArt product={products[6]} className="hero-mat" />
              <ProductArt product={products[0]} className="hero-book" />
              <ProductArt product={products[4]} className="hero-cup" />
              <ProductArt product={products[2]} className="hero-pen" />
            </div>
            <button className="hero-feature" onClick={() => setSelected(products[0])}>
              <span>
                {t('دفتر البدايات', 'The daily notebook')}
                <small>{t('قطعة تبدأ معها الحكاية', 'Where the good ideas begin')}</small>
              </span>
              <span>
                {money(6500)}
                <MoveUpRight size={18} />
              </span>
            </button>
          </div>
        </section>
        <div className="values wrap">
          <span>
            <Leaf size={18} />
            {t('قطع مختارة بعناية', 'A considered collection')}
          </span>
          <span>{t('تفاصيل تستحق المساحة', 'Details worth making room for')}</span>
          <span>{t('تصميم بسيط، استخدام يومي', 'Simple design, everyday purpose')}</span>
        </div>
        <section id="collection" className="collection wrap">
          <div className="section-heading">
            <div>
              <h2>{t('أشياء ليومك.', 'Objects for your everyday.')}</h2>
              <p>{t('ثماني قطع، واحتمالات كثيرة.', 'Eight objects. Plenty of possibility.')}</p>
            </div>
            <span className="collection-count">
              {t('المجموعة الأولى', 'THE FIRST COLLECTION')} / 08
            </span>
          </div>
          <div className="catalog-toolbar">
            <div className="category-tabs" role="group" aria-label={t('الفئات', 'Categories')}>
              {categories.map(([key, ar, en]) => (
                <button
                  className={category === key ? 'active' : ''}
                  aria-pressed={category === key}
                  key={key}
                  onClick={() => setCategory(key)}
                >
                  {t(ar, en)}
                </button>
              ))}
            </div>
            <div className="catalog-controls">
              <label className="search">
                <Search size={17} />
                <input
                  aria-label={t('ابحث عن قطعة', 'Search objects')}
                  placeholder={t('ابحث عن قطعة…', 'Find an object…')}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
              <select
                aria-label={t('ترتيب المنتجات', 'Sort products')}
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="featured">{t('اختياراتنا', 'Our edit')}</option>
                <option value="low">{t('السعر: الأقل', 'Price: low first')}</option>
                <option value="high">{t('السعر: الأعلى', 'Price: high first')}</option>
              </select>
            </div>
          </div>
          {filtered.length ? (
            <div className="product-grid">
              {filtered.map((p, i) => (
                <article className="product" key={p.id}>
                  <button
                    className={`product-image tone-${p.category}`}
                    onClick={() => setSelected(p)}
                    aria-label={t(`عرض ${p.name.ar}`, `View ${p.name.en}`)}
                  >
                    <span className="product-index">
                      T—{String(products.indexOf(p) + 1).padStart(2, '0')}
                    </span>
                    <ProductArt product={p} />
                    <span className="view-product">
                      {t('اكتشف القطعة', 'Explore object')}
                      <ArrowUpRight size={16} />
                    </span>
                  </button>
                  <div className="product-info">
                    <button onClick={() => setSelected(p)}>
                      <h3>{p.name[lang]}</h3>
                      <p>{p.material[lang]}</p>
                    </button>
                    <button
                      className="add-button"
                      onClick={() => add(p)}
                      aria-label={t(`أضف ${p.name.ar}`, `Add ${p.name.en}`)}
                    >
                      <Plus size={19} />
                    </button>
                  </div>
                  <p className="price">{money(p.price)}</p>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty">
              <Search size={32} />
              <h3>{t('لم نجد هذه القطعة', 'No objects found')}</h3>
              <p>
                {t(
                  'جرّب كلمة أخرى أو استعرض كل القطع.',
                  'Try a different word or view all objects.',
                )}
              </p>
              <button
                className="secondary"
                onClick={() => {
                  setQuery('');
                  setCategory('all');
                }}
              >
                {t('عرض الكل', 'Show all')}
              </button>
            </div>
          )}
        </section>
        <section className="story wrap" id="story">
          <div className="story-art">
            <ProductArt product={products[7]} />
            <span>
              A PLACE FOR
              <br />
              WHAT MATTERS.
            </span>
          </div>
          <div>
            <h2>
              {t('لأن التفاصيل الصغيرة', 'Because the little things')}
              <br />
              <em>{t('تصنع يومًا مختلفًا.', 'make a different day.')}</em>
            </h2>
            <p>
              {t(
                'لا يحتاج مكتبك إلى المزيد. يحتاج إلى ما يناسبك. جمعنا هذه القطع الخيالية حول فكرة بسيطة: مساحة مرتبة تترك مجالًا للفكرة التالية.',
                'Your desk does not need more. It needs what works for you. This fictional collection comes from a simple idea: a thoughtful space leaves room for the next good thought.',
              )}
            </p>
            <a href="#collection" className="text-link">
              {t('اختر قطعتك التالية', 'Find your next object')}
              <ArrowUpRight size={20} />
            </a>
          </div>
        </section>
      </main>
      <footer className="wrap footer">
        <a href="#" className="wordmark">
          tavoryxa
        </a>
        <p>
          {t('مساحة ليومك.', 'Make room for your day.')}
          <small>
            {t(
              'عرض تفاعلي · منتجات خيالية · الأسعار بالريال السعودي',
              'Interactive demo · Fictional products · Prices in SAR',
            )}
          </small>
        </p>
        <button onClick={() => open('account')}>
          {user
            ? t('حساب سحابي متصل', 'Cloud account connected')
            : t('وضع ضيف محلي', 'Local guest mode')}
          <span className={user ? 'status-dot online' : 'status-dot'} />
        </button>
      </footer>
      {notice && (
        <div className="toast" role="status">
          <Check size={18} />
          {notice}
          <button onClick={() => open('cart')}>{t('عرض السلة', 'View bag')}</button>
        </div>
      )}
      {selected && (
        <Modal title={selected.name[lang]} onClose={() => setSelected(null)} wide>
          <div className="detail">
            <div className="detail-art">
              <ProductArt product={selected} />
            </div>
            <div className="detail-copy">
              <p className="price big-price">{money(selected.price)}</p>
              <p>{selected.description[lang]}</p>
              <p className="material">{selected.material[lang]}</p>
              <p className="muted">
                {t(
                  'رسم توضيحي للمنتج · منتج تجريبي غير متاح للبيع الفعلي',
                  'Product illustration · Demo object, not available for real purchase',
                )}
              </p>
              <button className="primary" onClick={() => add(selected)}>
                {t('أضف إلى السلة', 'Add to bag')}
                <Plus size={19} />
              </button>
            </div>
          </div>
        </Modal>
      )}
      {panel && (
        <Modal
          title={
            panel === 'cart'
              ? t('حقيبتك', 'Your bag')
              : panel === 'checkout'
                ? t('إتمام الطلب التجريبي', 'Demo checkout')
                : panel === 'orders'
                  ? t('طلباتك', 'Your orders')
                  : panel === 'confirmation'
                    ? t('بداية جميلة.', 'A lovely beginning.')
                    : t('مساحتك الخاصة', 'Your own little space')
          }
          onClose={() => !busy && setPanel(null)}
          wide={panel === 'checkout'}
        >
          {panel === 'cart' &&
            (cart.length ? (
              <>
                <div className="cart-lines">
                  {cart.map((l) => {
                    const p = byId.get(l.id)!;
                    return (
                      <div className="cart-line" key={l.id}>
                        <div className="cart-art">
                          <ProductArt product={p} />
                        </div>
                        <div className="cart-line-info">
                          <h3>{p.name[lang]}</h3>
                          <span>{money(p.price)}</span>
                          <div className="quantity">
                            <button
                              disabled={l.quantity <= 1}
                              aria-label={t('تقليل الكمية', 'Decrease quantity')}
                              onClick={() => setCart((c) => updateCart(c, l.id, l.quantity - 1))}
                            >
                              <Minus size={14} />
                            </button>
                            <span>{l.quantity}</span>
                            <button
                              disabled={l.quantity >= 20}
                              aria-label={t('زيادة الكمية', 'Increase quantity')}
                              onClick={() => setCart((c) => updateCart(c, l.id, l.quantity + 1))}
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                        <button
                          className="icon-button"
                          aria-label={t(`حذف ${p.name.ar}`, `Remove ${p.name.en}`)}
                          onClick={() => setCart((c) => updateCart(c, l.id, 0))}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    );
                  })}
                </div>
                {summary}
                <p className="muted">
                  {t(
                    'التوصيل التجريبي مجاني للطلبات من 200 ريال.',
                    'Demo delivery is free on orders of SAR 200 or more.',
                  )}
                </p>
                <button className="primary full" onClick={() => open('checkout')}>
                  {t('متابعة إلى الطلب', 'Continue to checkout')}
                  <ArrowUpRight size={18} />
                </button>
              </>
            ) : (
              <div className="empty">
                <ShoppingBag size={38} />
                <h3>{t('مساحة لشيء جميل', 'Room for something lovely')}</h3>
                <p>
                  {t(
                    'حقيبتك فارغة. اختر أول قطعة ليومك.',
                    'Your bag is empty. Find the first object for your day.',
                  )}
                </p>
                <button className="primary" onClick={() => setPanel(null)}>
                  {t('اكتشف المجموعة', 'Explore the collection')}
                </button>
              </div>
            ))}
          {panel === 'checkout' && (
            <form className="checkout" onSubmit={(e) => void checkout(e)}>
              <div>
                <div className="demo-note">
                  {t(
                    'محاكاة فقط. لا دفع، ولا شحن، ولا حاجة لعنوان أو بيانات بطاقة.',
                    'Simulation only. No payment, shipping, address or card details needed.',
                  )}
                </div>
                <label className="field">
                  {t('اسم العرض للطلب', 'Display name for the order')}
                  <input
                    name="name"
                    required
                    minLength={2}
                    maxLength={80}
                    placeholder={t('مثال: سارة', 'e.g. Sara')}
                    autoComplete="off"
                  />
                </label>
                <p className="mode-note">
                  {user
                    ? t(
                        'سيُحفظ الطلب التجريبي في حسابك السحابي.',
                        'This demo order will be saved to your cloud account.',
                      )
                    : t(
                        'وضع ضيف: يُحفظ الطلب على هذا الجهاز فقط. لن تُرسل بياناتك إلى خادم.',
                        'Guest mode: your order stays on this device. No data is sent to a server.',
                      )}
                </p>
                {!user && (
                  <button type="button" className="text-link" onClick={() => open('account')}>
                    {t('خيارات الحساب السحابي', 'Cloud account options')}
                    <LogIn size={17} />
                  </button>
                )}
              </div>
              <div>
                {summary}
                {error && (
                  <p role="alert" className="error">
                    {error}
                  </p>
                )}
                <button disabled={busy || !cart.length} className="primary full" type="submit">
                  {busy
                    ? t('جارٍ حفظ الطلب…', 'Saving your order…')
                    : t('تأكيد الطلب التجريبي', 'Confirm demo order')}
                  <Check size={18} />
                </button>
              </div>
            </form>
          )}
          {panel === 'confirmation' && order && (
            <div className="confirmation">
              <span className="check-circle">
                <Check size={30} />
              </span>
              <h3>{t('حُفظ طلبك التجريبي', 'Your demo order is saved')}</h3>
              <p>
                {t(
                  'لم تُخصم مبالغ ولن تُشحن منتجات.',
                  'No payment was collected and no products will ship.',
                )}
              </p>
              <div className="order-reference" dir="ltr">
                #{order.id.slice(0, 8).toUpperCase()}
              </div>
              <b>{money(order.total_cents)}</b>
              <p className="mode-note">
                {order.source === 'cloud'
                  ? t('محفوظ في حسابك السحابي', 'Saved to your cloud account')
                  : t('محفوظ على هذا الجهاز فقط', 'Saved on this device only')}
              </p>
              <button className="primary" onClick={() => void loadOrders()}>
                {t('عرض طلباتي', 'View my orders')}
                <Package size={18} />
              </button>
            </div>
          )}
          {panel === 'orders' && (
            <>
              <p className="mode-note">
                {user
                  ? t('طلباتك السحابية · آخر 50 طلبًا', 'Your cloud orders · Latest 50')
                  : t(
                      'طلبات هذا الجهاز · وضع ضيف محلي',
                      'Orders on this device · Local guest mode',
                    )}
              </p>
              {error ? (
                <div className="error" role="alert">
                  {error}
                  <button className="secondary" onClick={() => void loadOrders()}>
                    {t('إعادة المحاولة', 'Retry')}
                  </button>
                </div>
              ) : orderLoading ? (
                <p role="status">{t('جارٍ تحميل الطلبات…', 'Loading orders…')}</p>
              ) : orders.length ? (
                orders.map((o) => (
                  <article key={o.id} className="order-card">
                    <div>
                      <strong dir="ltr">#{o.id.slice(0, 8).toUpperCase()}</strong>
                      <span>
                        {new Date(o.created_at).toLocaleDateString(
                          lang === 'ar' ? 'ar-SA' : 'en-GB',
                          { calendar: 'gregory' },
                        )}
                      </span>
                    </div>
                    {o.items.map((l) => (
                      <p key={l.id}>
                        {byId.get(l.id)?.name[lang] || l.id}
                        <span>× {l.quantity}</span>
                      </p>
                    ))}
                    <div>
                      <b>{money(o.total_cents)}</b>
                      <small>{t('طلب محاكاة · لا شحن', 'Simulated order · No fulfillment')}</small>
                    </div>
                  </article>
                ))
              ) : (
                <div className="empty">
                  <Package size={38} />
                  <h3>{t('حكايتك تبدأ من هنا', 'Your story starts here')}</h3>
                  <p>{t('لم تُسجل طلبات بعد.', 'No orders yet.')}</p>
                  <button className="primary" onClick={() => setPanel(null)}>
                    {t('تصفح المجموعة', 'Browse the collection')}
                  </button>
                </div>
              )}
            </>
          )}
          {panel === 'account' && (
            <div className="account">
              <button className="text-link" onClick={() => void loadOrders()}>
                <Package size={18} />
                {t('عرض طلباتي', 'View my orders')}
              </button>
              <p>
                {t(
                  'احفظ طلباتك التجريبية في حسابك أو أكمل كضيف.',
                  'Save demo orders to your account, or keep exploring as a guest.',
                )}
              </p>
              {authLoading ? (
                <p role="status">{t('جارٍ التحقق من الحساب…', 'Checking account…')}</p>
              ) : (
                <AuthPanel
                  key={user?.id ?? 'guest'}
                  lang={lang}
                  user={user}
                  recoveryUserId={recoveryUserId}
                  recoveryRequested={recoveryNotice}
                  onGuest={() => setPanel(null)}
                  onRecoveryComplete={() => {
                    clearRecoverySignal();
                    setRecoveryUserId(null);
                    setRecoveryNotice(false);
                    setNotice(t('حُفظت كلمة المرور الجديدة.', 'Your new password is saved.'));
                  }}
                />
              )}
              {error && (
                <p className="error" role="alert">
                  {error}
                </p>
              )}
            </div>
          )}
        </Modal>
      )}
    </>
  );
}
