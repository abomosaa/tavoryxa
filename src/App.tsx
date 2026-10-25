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
  Heart,
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
import { isOrder, localOrders, type Order } from './orders';
import { ProductCard } from './ProductCard';
import { ProductPage } from './ProductPage';
import { OrderHistory } from './OrderHistory';
import { HeroMedia, ProductMedia } from './ProductMedia';
import { parseStoreRoute, savedProducts, repeatOrder, productHref } from './storefront';
import { commerceEstimate } from './commerce';
import { DeskEdit } from './DeskEdit';
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
  const [route, setRoute] = useState(() => parseStoreRoute(window.location.hash));
  const selected = route.page === 'product' ? byId.get(route.id)! : null;
  const [savedIds, setSavedIds] = useState(() => savedProducts(readStorage('tavoryxa.saved', [])));
  const [savedError, setSavedError] = useState(false);
  const [panel, setPanel] = useState<Panel>(recoveryCallbackRequested ? 'account' : null);
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
    const onRoute = () => {
      const next = parseStoreRoute(window.location.hash);
      setRoute(next);
      setPanel(null);
      if (next.page !== 'home') window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', onRoute);
    return () => window.removeEventListener('hashchange', onRoute);
  }, []);
  useEffect(() => {
    if (route.page === 'home') {
      const anchor = window.location.hash.slice(1);
      if (['collection', 'story', 'main-content'].includes(anchor))
        document.getElementById(anchor)?.scrollIntoView();
      else if (!anchor) window.scrollTo({ top: 0 });
    } else document.getElementById('main-content')?.focus({ preventScroll: true });
  }, [route]);
  useEffect(() => {
    document.title = selected
      ? `${selected.name[lang]} — Tavoryxa`
      : route.page === 'saved'
        ? t('المفضلة — Tavoryxa', 'Saved objects — Tavoryxa')
        : t('Tavoryxa — مساحة ليومك', 'Tavoryxa — Make room for your day');
  }, [route, lang]);
  useEffect(() => {
    try {
      localStorage.setItem('tavoryxa.saved', JSON.stringify(savedIds));
      setSavedError(false);
    } catch {
      setSavedError(true);
    }
  }, [savedIds]);
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
  function add(p: Product, quantity = 1) {
    const currentQuantity = cart.find((line) => line.id === p.id)?.quantity || 0;
    setCart((c) => updateCart(c, p.id, (c.find((l) => l.id === p.id)?.quantity || 0) + quantity));
    setNotice(
      currentQuantity + quantity > 20
        ? t(
            'الحد الأقصى 20 قطعة لكل منتج؛ راجع كمية السلة.',
            'The limit is 20 of each object; review your bag quantity.',
          )
        : t('أُضيف إلى السلة', 'Added to your bag'),
    );
    return currentQuantity < 20;
  }
  function toggleSaved(id: string) {
    setNotice(
      savedIds.includes(id)
        ? t('أُزيلت القطعة من مفضلة هذا الجهاز.', 'Object removed from saved items on this device.')
        : t('حُفظت القطعة في مفضلة هذا الجهاز.', 'Object saved on this device.'),
    );
    setSavedIds((ids) => (ids.includes(id) ? ids.filter((v) => v !== id) : [...ids, id]));
  }
  function addCombination(ids: readonly string[]) {
    setCart((previous) =>
      ids.reduce(
        (next, id) =>
          updateCart(next, id, (next.find((line) => line.id === id)?.quantity || 0) + 1),
        previous,
      ),
    );
    const atLimit = ids.some((id) => (cart.find((line) => line.id === id)?.quantity || 0) >= 20);
    setNotice(
      atLimit
        ? t(
            'أُضيفت القطع المتاحة؛ الحد الأقصى 20 لكل منتج.',
            'Objects added where possible; the limit is 20 of each.',
          )
        : t(
            'أُضيفت التوليفة إلى سلتك. يمكنك تعديل كل قطعة.',
            'Combination added. You can adjust each object in your bag.',
          ),
    );
  }
  function reAddOrder(previous: Order) {
    setCart((c) => repeatOrder(c, previous));
    open('cart');
    setNotice(
      t(
        'أُضيفت القطع بالأسعار الحالية. الطلب السابق محفوظ دون تغيير.',
        'Objects added at current prices. Your saved order is unchanged.',
      ),
    );
  }
  function open(p: Panel) {
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
        <span>{t('توصيل تقديري', 'Estimated delivery')}</span>
        <b>{totals.delivery ? money(totals.delivery) : t('مجاني', 'Free')}</b>
      </div>
      <div className="summary-total">
        <span>{t('الإجمالي التقديري', 'Estimated total')}</span>
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
        {t('قطع صغيرة لمساحة تفكير أفضل', 'Small objects. A little more room to think.')}
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
          <a
            className="icon-button saved-nav"
            href="#/saved"
            aria-label={t(
              `المفضلة، ${savedIds.length} قطعة`,
              `Saved objects, ${savedIds.length} items`,
            )}
          >
            <Heart size={19} />
            <span>{savedIds.length || ''}</span>
          </a>
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
            <span key={count}>{count}</span>
          </button>
        </div>
      </header>
      <main id="main-content" tabIndex={-1}>
        {selected && (
          <ProductPage
            key={selected.id}
            product={selected}
            lang={lang}
            saved={savedIds.includes(selected.id)}
            savedIds={savedIds}
            onSave={toggleSaved}
            onAdd={add}
            money={money}
            cartQuantity={cart.find((l) => l.id === selected.id)?.quantity || 0}
          />
        )}
        {route.page === 'saved' && (
          <section className="saved-page wrap">
            <nav className="breadcrumb">
              <a href="#collection">{t('العودة إلى المجموعة', 'Back to collection')}</a>
            </nav>
            <div className="section-heading">
              <div>
                <h1>{t('مساحة لما تحب.', 'Room for your favourites.')}</h1>
                <p>
                  {t(
                    'مفضّلتك محفوظة على هذا الجهاز فقط؛ لا تتصل بحسابك السحابي.',
                    'Your saved objects stay on this device only; they do not sync to your cloud account.',
                  )}
                </p>
              </div>
              <span>
                {savedIds.length} {t('قطع', 'objects')}
              </span>
            </div>
            {savedError && (
              <p className="error" role="alert">
                {t(
                  'تعذر حفظ المفضلة على الجهاز. تبقى اختياراتك متاحة خلال هذه الزيارة.',
                  'Could not save favourites on this device. Your choices remain available during this visit.',
                )}
              </p>
            )}
            {savedIds.length ? (
              <div className="product-grid">
                {savedIds.map((id) => (
                  <ProductCard
                    key={id}
                    product={byId.get(id)!}
                    lang={lang}
                    saved
                    onSave={toggleSaved}
                    onAdd={add}
                    money={money}
                  />
                ))}
              </div>
            ) : (
              <div className="empty">
                <Heart size={40} />
                <h2>{t('احتفظ بالقطع التي تعجبك.', 'Keep the objects you love.')}</h2>
                <p>
                  {t(
                    'اضغط القلب بجانب أي قطعة لتعود إليها هنا.',
                    'Tap the heart beside an object to find it here later.',
                  )}
                </p>
                <a className="primary" href="#collection">
                  {t('اكتشف المجموعة', 'Explore the collection')}
                </a>
              </div>
            )}
          </section>
        )}
        {route.page === 'missing' && (
          <section className="empty wrap missing-page">
            <Package size={40} />
            <h1>{t('هذه القطعة غير موجودة.', 'This object could not be found.')}</h1>
            <p>
              {t(
                'قد يكون الرابط غير صحيح. القطع الثمانية ما زالت في المجموعة.',
                'The link may be incorrect. Find all eight objects in the collection.',
              )}
            </p>
            <a className="primary" href="#collection">
              {t('العودة إلى المجموعة', 'Back to collection')}
            </a>
          </section>
        )}
        {route.page === 'home' && (
          <>
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
                <HeroMedia lang={lang} />
                <a className="hero-feature" href={productHref(products[0])}>
                  <span>
                    {t('دفتر البدايات', 'The daily notebook')}
                    <small>{t('قطعة تبدأ معها الحكاية', 'Where the good ideas begin')}</small>
                  </span>
                  <span>
                    {money(products[0].price)}
                    <MoveUpRight size={18} />
                  </span>
                </a>
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
                    {query && (
                      <button
                        type="button"
                        className="clear-search icon-button"
                        aria-label={t('مسح البحث', 'Clear search')}
                        onClick={() => setQuery('')}
                      >
                        <X size={16} />
                      </button>
                    )}
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
              <p className="catalogue-results" role="status">
                {t(
                  `${filtered.length} من ${products.length} قطع`,
                  `${filtered.length} of ${products.length} objects`,
                )}
                {(query || category !== 'all') && (
                  <button
                    className="text-link"
                    onClick={() => {
                      setQuery('');
                      setCategory('all');
                    }}
                  >
                    {t('مسح المرشحات', 'Clear filters')}
                    <X size={14} />
                  </button>
                )}
              </p>
              {filtered.length ? (
                <div className="product-grid" key={`${category}-${sort}`}>
                  {filtered.map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      lang={lang}
                      saved={savedIds.includes(p.id)}
                      onSave={toggleSaved}
                      onAdd={add}
                      money={money}
                    />
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
            <DeskEdit lang={lang} money={money} onAdd={addCombination} />
            <section className="story wrap" id="story">
              <div className="story-art">
                <ProductMedia product={products[7]} lang={lang} />
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
          </>
        )}
      </main>
      <footer className="wrap footer">
        <a href="#" className="wordmark">
          tavoryxa
        </a>
        <p>
          {t('مساحة ليومك.', 'Make room for your day.')}
          <small>
            {t(
              'قطع للمكتب والحياة اليومية · الأسعار بالريال السعودي',
              'Objects for work and everyday life · Prices in SAR',
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
        <div className="toast" role="status" key={`${notice}-${count}`}>
          <Check size={18} />
          {notice}
          <button
            className="icon-button"
            onClick={() => setNotice('')}
            aria-label={t('إغلاق الإشعار', 'Dismiss notification')}
          >
            <X size={17} />
          </button>
        </div>
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
          wide={panel === 'checkout' || panel === 'orders'}
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
                          <ProductMedia product={p} lang={lang} />
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
                <section
                  className="delivery-estimate"
                  aria-label={t('بيانات التوصيل التقديرية', 'Delivery estimates')}
                >
                  <h3>{t('تصوّر التوصيل', 'Delivery estimate')}</h3>
                  <p>
                    {t('وجهة المثال: ', 'Example destination: ')}
                    {commerceEstimate.destination[lang]}
                  </p>
                  <p>
                    {t('المدة التقديرية: ', 'Estimated timing: ')}
                    {commerceEstimate.deliveryDays.min}–{commerceEstimate.deliveryDays.max}{' '}
                    {t('أيام عمل.', 'working days.')}
                  </p>
                  <p>
                    {t(
                      'هذه بيانات تقديرية للعرض، وليست موعد شحن مؤكدًا. قبول الطلبات التجارية غير مفعّل.',
                      'These are illustrative estimates, not a confirmed delivery promise. Commercial order acceptance is not enabled.',
                    )}
                  </p>
                </section>
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
                <OrderHistory orders={orders} lang={lang} money={money} onRepeat={reAddOrder} />
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
