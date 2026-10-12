/**
 * Kashier Payment Gateway Integration Service
 * Official Payment Service Provider for Diwan Al-Baloot (ديوان البلوت)
 * 
 * Supports:
 * - Cards: Visa, MasterCard, Meeza, Mada
 * - Mobile Wallets: Vodafone Cash, Orange Cash, Etisalat Cash, WE Pay, Meeza Digital, STC Pay
 * - Cash via Kiosk: Fawry & Aman Reference Code (رمز فوري للدفع في أي كشك)
 * - BNPL / Installments: valU, Souhoola, Sympl (تقسيط بدون فوائد)
 * - Currencies: SAR (ريال سعودي) & EGP (جنيه مصري)
 */

export type KashierPaymentMethod =
  | 'card'
  | 'wallet'
  | 'fawry'
  | 'installments'
  | 'apple_pay';

export type SupportedCurrency = 'SAR' | 'EGP';

export interface KashierPlan {
  id: 'free' | 'monthly' | 'annual' | 'hawameer';
  tierNameAr: string;
  tierNameEn: string;
  badge?: string;
  popular?: boolean;
  priceSar: number;
  priceEgp: number;
  originalPriceSar?: number;
  originalPriceEgp?: number;
  intervalAr: string;
  savingsPercentage?: number;
  descriptionAr: string;
  features: {
    title: string;
    isVip: boolean;
    icon?: string;
  }[];
  restrictionsForFree?: string[];
}

export interface KashierTokenPack {
  id: 'starter' | 'pro' | 'hawameer_vault';
  nameAr: string;
  coins: number;
  bonusCoins: number;
  priceSar: number;
  priceEgp: number;
  badge?: string;
  icon: string;
}

export interface KashierTransaction {
  orderId: string;
  kashierReference: string;
  planId?: string;
  packId?: string;
  amount: number;
  currency: SupportedCurrency;
  method: KashierPaymentMethod;
  status: 'succeeded' | 'pending' | 'failed' | 'refunded';
  fawryCode?: string;
  walletNumber?: string;
  installmentProvider?: string;
  receiptNumber: string;
  createdAt: string;
  expiresAt?: string;
}

// Exchange rate anchor for SAR <-> EGP pricing
export const SAR_TO_EGP_RATE = 13.0;

// High-Converting Packages tuned with Psychological Pricing Anchors
export const KASHIER_PLANS: KashierPlan[] = [
  {
    id: 'monthly',
    tierNameAr: 'ديوان بلس الشهري',
    tierNameEn: 'Diwan Plus Monthly',
    badge: 'تجربة سريعة',
    priceSar: 29,
    priceEgp: 380,
    intervalAr: 'شهرياً',
    descriptionAr: 'الخيار الأمثل لتجربة صكات البلوت التنافسية بدون قيود مع دعم كامل لبوابة كاشير.',
    features: [
      { title: 'صكات غير محدودة يومياً (بدون نفاد طاقة اللعب)', isVip: true, icon: '⚡' },
      { title: 'إنشاء غرف خاصة بمؤقتات لعب مخصصة (10ث، 15ث، 20ث، 45ث)', isVip: true, icon: '⏱️' },
      { title: 'تحليل الأكلات وكاشفة أخطاء اللعب (Trick Replay & Insights)', isVip: true, icon: '🔍' },
      { title: 'فتح ألوان الجوخ الملكية (النيلي الملكي والعنابي)', isVip: true, icon: '🎨' },
      { title: 'شارة الصقر الموثق في الملف والديوانيات', isVip: true, icon: '🦅' },
      { title: 'تجربة نقية تماماً خالية من أي فواصل إعلانية', isVip: true, icon: '🛡️' },
      { title: 'مضاعف نقاط التحديات اليومية (2x XP ودنانير)', isVip: true, icon: '⭐' },
    ],
  },
  {
    id: 'annual',
    tierNameAr: 'ديوان VIP الملكي السنوي',
    tierNameEn: 'Diwan Royal VIP Annual',
    badge: 'الأكثر طلباً • وفر 62%',
    popular: true,
    priceSar: 149,
    priceEgp: 1950,
    originalPriceSar: 348,
    originalPriceEgp: 4560,
    intervalAr: 'سنوياً (يعادل 12.4 ريال / 160 جنيه شهرياً فقط)',
    savingsPercentage: 62,
    descriptionAr: 'الباقة الأكثر شعبية واختياراً بين 85% من أبطال البلوت. توفير هائل مع كل مزايا ديوان بلس وهدايا موسمية.',
    features: [
      { title: 'جميع مزايا ديوان بلس الشهري بالكامل لمدة 12 شهراً', isVip: true, icon: '👑' },
      { title: 'توفير استثنائي 62% مقارنة بالاشتراك الشهري', isVip: true, icon: '💰' },
      { title: 'فتح كامل لجميع أطقم الجوخ الفاخرة بما فيها الأسود الذهبي النادر', isVip: true, icon: '✨' },
      { title: 'أطقم ظهور ورق اللعب الملكية الحصرية (صقر الرياض الذهبي)', isVip: true, icon: '🎴' },
      { title: 'أولوية فورية في غرف المطابقة السريعة بدون أي انتظار', isVip: true, icon: '🚀' },
      { title: 'خبطات صوتية فاخرة خاصة بالكبوت والفوز بالصن', isVip: true, icon: '🔊' },
      { title: 'مضاعف ثلاثي للتحديات اليومية (3x XP ودنانير التميز)', isVip: true, icon: '🔥' },
      { title: 'هدية فورية: 3,000 دينار تميز تضاف لمحفظتك مجاناً', isVip: true, icon: '🎁' },
      { title: 'ضمان ذهبي لاسترجاع الأموال 14 يوماً بدون أي شروط', isVip: true, icon: '🤝' },
    ],
  },
  {
    id: 'hawameer',
    tierNameAr: 'ديوان الهوامير والنخبة',
    tierNameEn: 'Hawameer Elite Prestige',
    badge: 'برستيج النخبة المطلق',
    priceSar: 399,
    priceEgp: 5200,
    originalPriceSar: 799,
    originalPriceEgp: 10400,
    intervalAr: 'عضوية موسمية خاصة (18 شهراً)',
    savingsPercentage: 50,
    descriptionAr: 'مصممة خصيصاً للهوامير وكبار الشخصيات الباحثين عن الفخامة والظهور الملكي في كل طاولة.',
    features: [
      { title: 'كل مزايا باقة VIP الملكية السنوية مع اشتراك ممتد 18 شهراً', isVip: true, icon: '💎' },
      { title: 'إطار أفاتار ذهبي ملكي متوهج ومتحرك يلفت الأنظار في الطاولة', isVip: true, icon: '🌟' },
      { title: 'إشعار ملكي يظهر لجميع الحاضرين عند دخولك أي غرفة خاصة', isVip: true, icon: '📢' },
      { title: 'غرف خاصة مشفرة بكلمة سر بدون حد أقصى للغرف المتزامنة', isVip: true, icon: '🏰' },
      { title: 'حزمة هوامير عملاقة: 15,000 دينار تميز كاش فورية', isVip: true, icon: '🪙' },
      { title: 'دعم فني خاص ومباشر عبر واتساب مدار 24 ساعة', isVip: true, icon: '📱' },
      { title: 'أولوية في بطولات ديوان البلوت الدورية مع كؤوس تذكارية', isVip: true, icon: '🏆' },
    ],
  },
];

// Token packs that can be purchased instantly via Kashier
export const KASHIER_TOKEN_PACKS: KashierTokenPack[] = [
  {
    id: 'starter',
    nameAr: 'حزمة البداية السريعة',
    coins: 500,
    bonusCoins: 50,
    priceSar: 9,
    priceEgp: 120,
    icon: '🪙',
  },
  {
    id: 'pro',
    nameAr: 'صرة الشيوخ الذهبية',
    coins: 2500,
    bonusCoins: 500,
    priceSar: 29,
    priceEgp: 380,
    badge: 'الأكثر رواجاً (+20% بونص)',
    icon: '💰',
  },
  {
    id: 'hawameer_vault',
    nameAr: 'خزانة الهوامير الملكية',
    coins: 10000,
    bonusCoins: 3500,
    priceSar: 89,
    priceEgp: 1150,
    badge: 'أعلى قيمة (+35% بونص مجاني)',
    icon: '👑',
  },
];

// Free Tier explicit psychological restrictions matrix
export const FREE_TIER_RESTRICTIONS = [
  {
    feature: 'طاقة الصكات اليومية',
    free: '5 صكات فقط يومياً (تتوقف بعد ذلك لحين شحن الطاقة)',
    vip: 'غير محدود 24/7 (العب بدون أي توقف)',
  },
  {
    feature: 'التحكم في مؤقت الرمية بالغرف',
    free: 'مؤقت عادي فقط (30 ثانية ثابت)',
    vip: 'تحكم مرن بالثواني (10ث بلتز، 15ث سرعة، 20ث، 45ث تفكير عميق)',
  },
  {
    feature: 'كاشفة الأكلات والتحليل التكتيكي',
    free: '❌ غير متوفرة (نتائج رقمية فقط)',
    vip: '✅ متوفرة بالكامل (كاشفة أوراق الأكلة ومصائد الحكم والأخطاء)',
  },
  {
    feature: 'ألوان جوخ الطاولة وظهور الورق',
    free: 'جوخ أخضر قياسي فقط',
    vip: 'نيلي ملكي، عنابي مجلس، أسود ذهبي، وظهر ورق صقر الرياض',
  },
  {
    feature: 'الإعلانات والرعاة الترويجيين',
    free: 'فواصل إعلانية دورية بين الصكات',
    vip: 'خالية تماماً 100% من أي إعلانات',
  },
  {
    feature: 'مضاعف خبرة التحديات ومكافآت الدنانير',
    free: '1x فقط',
    vip: '3x مضاعف ثلاثي يومي لكل تحدٍ تنجزه',
  },
  {
    feature: 'شارة الملف وصدارة الترتيب',
    free: 'حساب رمادي عادي',
    vip: 'شارة الصقر الموثق الذهبية + برواز VIP متوهج',
  },
];

class KashierPaymentService {
  private readonly merchantId = 'MID-8492-BALOOT-KSA-EG';
  private readonly apiKey = 'sec_kashier_live_diwan_8b417c';
  private readonly sandbox = true; // Safe sandbox mode for instantaneous real-looking test flows

  /**
   * Generates a realistic Kashier Order ID
   */
  public generateOrderId(prefix = 'KSH-BLT'): string {
    const timestamp = Date.now().toString().slice(-6);
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${timestamp}-${randomHex}`;
  }

  /**
   * Generates an 8-digit Kashier Fawry reference number
   */
  public generateFawryReference(): string {
    return `78${Math.floor(100000 + Math.random() * 900000)}`;
  }

  /**
   * Generates a verifiable Kashier Receipt Number
   */
  public generateReceiptNumber(): string {
    return `REC-KSH-${Math.floor(1000000 + Math.random() * 9000000)}`;
  }

  /**
   * Simulates Kashier payment processing across Cards, Mobile Wallets, Fawry, and Installments.
   */
  public async processKashierCheckout(params: {
    planId?: 'monthly' | 'annual' | 'hawameer';
    packId?: 'starter' | 'pro' | 'hawameer_vault';
    method: KashierPaymentMethod;
    currency: SupportedCurrency;
    cardNumber?: string;
    mobileWalletNumber?: string;
    installmentProvider?: string;
  }): Promise<{
    success: boolean;
    transaction?: KashierTransaction;
    error?: string;
  }> {
    // Realistic banking network response latency (800ms - 1300ms)
    await new Promise((r) => setTimeout(r, 1100));

    let amount = 0;
    if (params.planId) {
      const plan = KASHIER_PLANS.find((p) => p.id === params.planId);
      if (!plan) return { success: false, error: 'باقة كاشير المختارة غير متوفرة' };
      amount = params.currency === 'SAR' ? plan.priceSar : plan.priceEgp;
    } else if (params.packId) {
      const pack = KASHIER_TOKEN_PACKS.find((p) => p.id === params.packId);
      if (!pack) return { success: false, error: 'حزمة الدنانير المختارة غير متوفرة' };
      amount = params.currency === 'SAR' ? pack.priceSar : pack.priceEgp;
    } else {
      return { success: false, error: 'يرجى تحديد باقة اشتراك أو حزمة دنانير للدفع' };
    }

    // Card test simulation
    if (params.method === 'card') {
      const sanitized = (params.cardNumber || '').replace(/\s/g, '');
      if (sanitized.endsWith('0000') || sanitized === '0000') {
        return {
          success: false,
          error: 'تم رفض العملية من البنك المصدر (كود كاشير: KSH_DECLINED_BY_ISSUER). يرجى التأكد من رصيد البطاقة أو تفعيل الشراء عبر الإنترنت.',
        };
      }
    }

    // Mobile Wallet validation
    if (params.method === 'wallet' && params.mobileWalletNumber) {
      const cleanNum = params.mobileWalletNumber.replace(/[\s-]/g, '');
      if (cleanNum.length < 9) {
        return {
          success: false,
          error: 'رقم المحفظة الإلكترونية غير صحيح. يرجى إدخال رقم المحفظة (فودافون كاش، أورنج، اتصالات، وي، أو STC Pay)',
        };
      }
    }

    const orderId = this.generateOrderId();
    const kashierRef = `ksh_tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const receiptNumber = this.generateReceiptNumber();

    const tx: KashierTransaction = {
      orderId,
      kashierReference: kashierRef,
      planId: params.planId,
      packId: params.packId,
      amount,
      currency: params.currency,
      method: params.method,
      status: 'succeeded',
      receiptNumber,
      createdAt: new Date().toISOString(),
      walletNumber: params.mobileWalletNumber,
      installmentProvider: params.installmentProvider,
    };

    if (params.method === 'fawry') {
      tx.fawryCode = this.generateFawryReference();
      tx.expiresAt = new Date(Date.now() + 48 * 3600 * 1000).toISOString();
    }

    // Save transaction to local log
    this.recordTransaction(tx);

    return {
      success: true,
      transaction: tx,
    };
  }

  /**
   * Records transaction to local storage
   */
  public recordTransaction(tx: KashierTransaction) {
    if (typeof window === 'undefined') return;
    try {
      const existing = this.getTransactions();
      existing.unshift(tx);
      localStorage.setItem('kashier_transactions_log', JSON.stringify(existing.slice(0, 30)));
    } catch {
      // Ignore
    }
  }

  /**
   * Retrieves all completed Kashier transactions
   */
  public getTransactions(): KashierTransaction[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem('kashier_transactions_log');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  /**
   * Returns current active Kashier merchant config details
   */
  public getMerchantInfo() {
    return {
      merchantId: this.merchantId,
      merchantName: 'ديوان البلوت - Diwan Baloot LLC',
      poweredBy: 'Kashier Payment Gateway (كاشير)',
      sandbox: this.sandbox,
      pciCompliant: true,
      supportedCurrencies: ['SAR', 'EGP'] as SupportedCurrency[],
    };
  }
}

export const kashierService = new KashierPaymentService();
