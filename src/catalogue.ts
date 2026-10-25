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
  use: Record<Lang, string>;
}
export const products: Product[] = [
  {
    id: 'notebook',
    use: {
      ar: 'اجعل الصفحة الأولى لخطة يومك، واترك الصفحات التالية للملاحظات والرسوم والقوائم. الشريط يساعدك على العودة إلى آخر فكرة.',
      en: 'Start with your plan for the day, then leave room for notes, sketches and lists. The ribbon keeps your place for the next idea.',
    },
    name: { ar: 'دفتر البدايات', en: 'The daily notebook' },
    description: {
      ar: 'صفحات منقّطة لكل فكرة تستحق أن تبقى. غلاف كتاني أخضر عميق، وعلامة شريطية للعودة إلى فكرتك التالية.',
      en: 'Dot-grid pages for thoughts worth keeping. A deep forest linen cover and ribbon marker keep your next idea close.',
    },
    category: 'paper',
    price: 2900,
    color: '#364d37',
    kind: 'notebook',
    material: { ar: 'كتان وورق · A5 · 160 صفحة', en: 'Linen & paper · A5 · 160 pages' },
  },
  {
    id: 'tray',
    use: {
      ar: 'ضعها قرب مدخل المكتب للمفاتيح والقطع الصغيرة، أو اجمع فيها الأدوات التي تستخدمها كل يوم. امسح السطح برفق بقطعة قماش جافة.',
      en: 'Keep it by the desk entrance for keys and small essentials, or group the tools you reach for every day. Wipe gently with a dry cloth.',
    },
    name: { ar: 'صينية التفاصيل', en: 'The catch-all tray' },
    description: {
      ar: 'مكان صغير للمفاتيح والأشياء التي تبحث عنها دائمًا. حواف ناعمة وملمس حجري هادئ.',
      en: 'A little home for the things you are always looking for. Soft edges and a quiet stone-like finish.',
    },
    category: 'organize',
    price: 3900,
    color: '#e1b99b',
    kind: 'tray',
    material: { ar: 'مركّب حجري · 20 × 12 سم', en: 'Stone composite · 20 × 12 cm' },
  },
  {
    id: 'pen',
    use: {
      ar: 'رفيق للقوائم والملاحظات والتوقيع، بخط أسود 0.5 مم. أعد الغطاء بعد الاستخدام واحفظه بعيدًا عن الحرارة المباشرة.',
      en: 'For lists, notes and signatures, with a 0.5 mm black line. Replace the cap after use and keep it away from direct heat.',
    },
    name: { ar: 'قلم الفكرة', en: 'The everyday pen' },
    description: {
      ar: 'وزن متوازن وخط انسيابي. قلم بسيط يعود إليه يومك، من أول ملاحظة إلى آخر توقيع.',
      en: 'Balanced weight and a fluid line. A simple pen for the first note and the final signature.',
    },
    category: 'tools',
    price: 1200,
    color: '#434b3c',
    kind: 'pen',
    material: { ar: 'ألمنيوم · حبر أسود · 0.5 مم', en: 'Aluminium · black ink · 0.5 mm' },
  },
  {
    id: 'calendar',
    use: {
      ar: 'ابدأ بأي شهر واكتب التواريخ بنفسك. خصّص مساحة صغيرة للأولويات بدل ازدحام الخطة، واقلب الورقة حين تبدأ شهرًا جديدًا.',
      en: 'Start with any month and write in your own dates. Keep a little space for priorities, then turn the page when a new month begins.',
    },
    name: { ar: 'تقويم على مهل', en: 'The slow calendar' },
    description: {
      ar: 'شهر واحد أمامك ومساحة للتخطيط. تقويم مكتبي بلا تواريخ مطبوعة لتبدأ وقتما تشاء.',
      en: 'One month at a time, with room to plan. An undated desk calendar so you can start whenever you like.',
    },
    category: 'paper',
    price: 2900,
    color: '#d4c49e',
    kind: 'calendar',
    material: { ar: 'ورق وقاعدة خشبية · 24 ورقة', en: 'Paper & wood base · 24 sheets' },
  },
  {
    id: 'cup',
    use: {
      ar: 'اجمع الأقلام والفرش في متناول اليد لتبقى مساحة الكتابة خالية. الحامل هو القطعة الأساسية؛ الأقلام المعروضة ليست جزءًا من الطلب.',
      en: 'Keep pens and brushes within reach while leaving your writing space clear. The vessel is the object; pictured pencils are not included.',
    },
    name: { ar: 'حامل الأقلام', en: 'The pencil vessel' },
    description: {
      ar: 'رفيق هادئ لأقلامك وفرشك. خشب بلوط بتفاصيل مخددة يضيف دفئًا إلى مكتبك. الأقلام في الصورة للتنسيق.',
      en: 'A quiet companion for pens and brushes. Fluted oak brings warmth to your desk. Pencils in the image are styling accessories.',
    },
    category: 'organize',
    price: 3500,
    color: '#d1a37f',
    kind: 'cup',
    material: { ar: 'خشب بلوط · ارتفاع 11 سم', en: 'Oak · 11 cm tall' },
  },
  {
    id: 'clips',
    use: {
      ar: 'أربعة مشابك للأوراق الخفيفة أو لتحديد صفحة تعود إليها. احتفظ بها في مكان جاف وامسحها بقطعة قماش ناعمة.',
      en: 'Four clips for light paper stacks or marking a page to return to. Keep them dry and wipe with a soft cloth.',
    },
    name: { ar: 'مشابك صغيرة', en: 'The brass clips' },
    description: {
      ar: 'لترتيب الأوراق أو حفظ صفحة مفضلة. مجموعة من أربعة مشابك بلون نحاسي دافئ.',
      en: 'Keep papers together or mark a favourite page. Four warm brass-coloured clips in a small paper box.',
    },
    category: 'tools',
    price: 900,
    color: '#b9975b',
    kind: 'clips',
    material: { ar: 'فولاذ مطلي · 4 قطع', en: 'Coated steel · set of 4' },
  },
  {
    id: 'mat',
    use: {
      ar: 'مساحة 60 × 35 سم لترتيب لوحة المفاتيح والفأرة وما تحتاجه للكتابة. افرده على سطح مستوٍ ونظيف وتجنّب الأدوات الحادة.',
      en: 'A 60 × 35 cm space for your keyboard, mouse and writing essentials. Place it on a clean, flat desk and avoid sharp tools.',
    },
    name: { ar: 'بساط التركيز', en: 'The focus mat' },
    description: {
      ar: 'حدود واضحة لمساحة عملك. سطح ناعم للكتابة وتحريك الفأرة، ولون أخضر يريح العين.',
      en: 'A clear boundary for your working space. A smooth writing and mousing surface in a restful green.',
    },
    category: 'organize',
    price: 5900,
    color: '#7c876e',
    kind: 'mat',
    material: { ar: 'سطح جلدي أخضر · 60 × 35 سم', en: 'Sage leather surface · 60 × 35 cm' },
  },
  {
    id: 'notes',
    use: {
      ar: 'ثلاثة دفاتر A6: خصّص واحدًا للأفكار وآخر للقوائم وثالثًا لما تتعلمه. حجمها الصغير يناسب الحقيبة والجيب الواسع.',
      en: 'Three A6 notebooks: one for ideas, one for lists and one for what you learn. Their compact size fits a bag or a roomy pocket.',
    },
    name: { ar: 'أوراق عابرة', en: 'The little notes' },
    description: {
      ar: 'للرسائل القصيرة والأفكار السريعة. ثلاث دفاتر جيب بألوان متناسقة ترافقك خارج المكتب.',
      en: 'For quick messages and passing ideas. Three pocket notebooks in a considered palette, ready to leave the desk with you.',
    },
    category: 'paper',
    price: 1900,
    color: '#b56b4f',
    kind: 'notes',
    material: { ar: 'ورق · A6 · 3 دفاتر', en: 'Paper · A6 · set of 3' },
  },
];
export const byId = new Map(products.map((p) => [p.id, p]));
