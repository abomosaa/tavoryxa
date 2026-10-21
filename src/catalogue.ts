export type Lang = 'ar' | 'en';
export type Category = 'all' | 'paper' | 'tools' | 'organize';
export interface Product {
  id: string;
  name: Record<Lang, string>;
  description: Record<Lang, string>;
  category: Category;
  price: number;
  color: string;
  kind: string;
  material: Record<Lang, string>;
}
export const products: Product[] = [
  {
    id: 'notebook',
    name: { ar: 'دفتر البدايات', en: 'The daily notebook' },
    description: {
      ar: 'صفحات منقّطة لكل فكرة تستحق أن تبقى. غلاف قماشي بلون الأرض، وفتحة مسطحة للكتابة براحة.',
      en: 'Dot-grid pages for thoughts worth keeping. An earthy cloth cover and a lay-flat binding for unhurried notes.',
    },
    category: 'paper',
    price: 6500,
    color: '#a84932',
    kind: 'notebook',
    material: { ar: 'قماش وورق · A5 · 160 صفحة', en: 'Cloth & paper · A5 · 160 pages' },
  },
  {
    id: 'tray',
    name: { ar: 'صينية التفاصيل', en: 'The catch-all tray' },
    description: {
      ar: 'مكان صغير للمفاتيح والأشياء التي تبحث عنها دائمًا. حواف ناعمة وملمس حجري هادئ.',
      en: 'A little home for the things you are always looking for. Soft edges and a quiet stone-like finish.',
    },
    category: 'organize',
    price: 8900,
    color: '#e1b99b',
    kind: 'tray',
    material: { ar: 'مركّب حجري · 20 × 12 سم', en: 'Stone composite · 20 × 12 cm' },
  },
  {
    id: 'pen',
    name: { ar: 'قلم الفكرة', en: 'The everyday pen' },
    description: {
      ar: 'وزن متوازن وخط انسيابي. قلم بسيط يعود إليه يومك، من أول ملاحظة إلى آخر توقيع.',
      en: 'Balanced weight and a fluid line. A simple pen for the first note and the final signature.',
    },
    category: 'tools',
    price: 4500,
    color: '#434b3c',
    kind: 'pen',
    material: { ar: 'ألمنيوم · حبر أسود · 0.5 مم', en: 'Aluminium · black ink · 0.5 mm' },
  },
  {
    id: 'calendar',
    name: { ar: 'تقويم على مهل', en: 'The slow calendar' },
    description: {
      ar: 'شهر واحد أمامك ومساحة للتخطيط. تقويم مكتبي بلا تواريخ مطبوعة لتبدأ وقتما تشاء.',
      en: 'One month at a time, with room to plan. An undated desk calendar so you can start whenever you like.',
    },
    category: 'paper',
    price: 5500,
    color: '#d4c49e',
    kind: 'calendar',
    material: { ar: 'ورق معاد التدوير · 24 ورقة', en: 'Recycled paper · 24 sheets' },
  },
  {
    id: 'cup',
    name: { ar: 'حامل الأقلام', en: 'The pencil vessel' },
    description: {
      ar: 'رفيق هادئ لأقلامك وفرشك. شكل أسطواني بتفاصيل مخددة يضيف ملمسًا إلى مكتبك.',
      en: 'A quiet companion for pens and brushes. A ribbed cylinder brings a little texture to your desk.',
    },
    category: 'organize',
    price: 7500,
    color: '#d1a37f',
    kind: 'cup',
    material: { ar: 'خزف · ارتفاع 11 سم', en: 'Ceramic · 11 cm tall' },
  },
  {
    id: 'clips',
    name: { ar: 'مشابك صغيرة', en: 'The brass clips' },
    description: {
      ar: 'لترتيب الأوراق أو حفظ صفحة مفضلة. مجموعة من أربعة مشابك بلون نحاسي دافئ.',
      en: 'Keep papers together or mark a favourite page. Four warm brass-coloured clips in a small paper box.',
    },
    category: 'tools',
    price: 2900,
    color: '#b9975b',
    kind: 'clips',
    material: { ar: 'فولاذ مطلي · 4 قطع', en: 'Coated steel · set of 4' },
  },
  {
    id: 'mat',
    name: { ar: 'بساط التركيز', en: 'The focus mat' },
    description: {
      ar: 'حدود واضحة لمساحة عملك. سطح ناعم للكتابة وتحريك الفأرة، ولون أخضر يريح العين.',
      en: 'A clear boundary for your working space. A smooth writing and mousing surface in a restful green.',
    },
    category: 'organize',
    price: 11900,
    color: '#7c876e',
    kind: 'mat',
    material: { ar: 'لباد نباتي · 60 × 35 سم', en: 'Plant-based felt · 60 × 35 cm' },
  },
  {
    id: 'notes',
    name: { ar: 'أوراق عابرة', en: 'The little notes' },
    description: {
      ar: 'للرسائل القصيرة والأفكار السريعة. ثلاث دفاتر جيب بألوان متناسقة ترافقك خارج المكتب.',
      en: 'For quick messages and passing ideas. Three pocket notebooks in a considered palette, ready to leave the desk with you.',
    },
    category: 'paper',
    price: 3900,
    color: '#b56b4f',
    kind: 'notes',
    material: { ar: 'ورق · A6 · 3 دفاتر', en: 'Paper · A6 · set of 3' },
  },
];
export const byId = new Map(products.map((p) => [p.id, p]));
