import React, { useState, useEffect } from 'react';
import {
  KASHIER_PLANS,
  KASHIER_TOKEN_PACKS,
  FREE_TIER_RESTRICTIONS,
  SupportedCurrency,
} from '../../services/kashierPaymentService';
import { getUserProfile } from '../../services/storage';
import { KashierCheckoutModal } from '../payment/KashierCheckoutModal';
import { analytics } from '../../services/analytics';

interface SubscriptionPageProps {
  onSelectTab: (tab: string) => void;
}

export const SubscriptionPage: React.FC<SubscriptionPageProps> = ({ onSelectTab }) => {
  const [currency, setCurrency] = useState<SupportedCurrency>('SAR');
  const [selectedPlanId, setSelectedPlanId] = useState<'monthly' | 'annual' | 'hawameer' | null>('annual');
  const [selectedPackId, setSelectedPackId] = useState<'starter' | 'pro' | 'hawameer_vault' | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 27, seconds: 40 });

  const user = getUserProfile();

  // Dynamic countdown timer for conversion urgency
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleOpenPlanCheckout = (planId: 'monthly' | 'annual' | 'hawameer') => {
    setSelectedPlanId(planId);
    setSelectedPackId(null);
    setIsCheckoutOpen(true);
    analytics.track('kashier_checkout_opened_plan', { planId, currency });
  };

  const handleOpenPackCheckout = (packId: 'starter' | 'pro' | 'hawameer_vault') => {
    setSelectedPackId(packId);
    setSelectedPlanId(null);
    setIsCheckoutOpen(true);
    analytics.track('kashier_checkout_opened_pack', { packId, currency });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 select-none space-y-12">
      {/* Urgency & Scarcity Top Banner */}
      <div className="bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-amber-500/20 border border-amber-400/40 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3 text-right">
          <span className="text-3xl animate-bounce">🔥</span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-amber-300">
                عرض تدشين بوابة كاشير الرسمية المعتمدة (Kashier)
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 text-[10px] font-bold">
                خصم 62%
              </span>
            </div>
            <p className="text-xs text-gray-200 mt-0.5">
              متبقي 4 مقاعد فقط في باقة VIP السنوية بالسعر المخفض لهذا الأسبوع.
            </p>
          </div>
        </div>

        {/* Dynamic Countdown Clock */}
        <div className="flex items-center gap-3 bg-black/60 border border-white/10 rounded-2xl px-4 py-2.5">
          <span className="text-xs text-gray-400 font-bold">ينتهي العرض بعد:</span>
          <div className="font-mono text-base font-black text-amber-400 flex items-center gap-1 dir-ltr">
            <span className="bg-amber-400/10 px-1.5 py-0.5 rounded">{String(timeLeft.hours).padStart(2, '0')}</span>:
            <span className="bg-amber-400/10 px-1.5 py-0.5 rounded">{String(timeLeft.minutes).padStart(2, '0')}</span>:
            <span className="bg-amber-400/10 px-1.5 py-0.5 rounded">{String(timeLeft.seconds).padStart(2, '0')}</span>
          </div>
        </div>
      </div>

      {/* Main Header & Currency Switcher */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
          <span>💳 مدفوعات آمنة ومشفرة عبر كاشير (Kashier Payments)</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          عضويات ديوان VIP: العب بدون قيود وتميّز على كل طاولة
        </h1>

        <p className="text-xs sm:text-sm text-gray-300 max-w-3xl mx-auto leading-relaxed">
          جميع قواعد البلوت الأساسية مجانية وعادلة للجميع 100%. الترقية مخصصة للعب اللامحدود، غرف التحكم بالثواني، كاشفة الأكلات، وأطقم الجوخ الملكية الفاخرة.
        </p>

        {/* Currency Switcher */}
        <div className="pt-2 flex justify-center">
          <div className="inline-flex bg-[#0b1a13] p-1.5 rounded-2xl border border-white/15 shadow-inner">
            <button
              type="button"
              onClick={() => setCurrency('SAR')}
              className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                currency === 'SAR'
                  ? 'bg-amber-400 text-black shadow-lg scale-105'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              🇸🇦 الدفع بالريال السعودي (SAR)
            </button>
            <button
              type="button"
              onClick={() => setCurrency('EGP')}
              className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                currency === 'EGP'
                  ? 'bg-emerald-500 text-black shadow-lg scale-105'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              🇪🇬 الدفع بالجنيه المصري (EGP)
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Cards (3 Tiers with Decoy Effect) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {KASHIER_PLANS.map((plan) => {
          const isAnnual = plan.id === 'annual';
          const isHawameer = plan.id === 'hawameer';
          const isCurrentActive = user.isSubscriber && user.subscriptionPlan === plan.id;
          const price = currency === 'SAR' ? plan.priceSar : plan.priceEgp;
          const originalPrice = currency === 'SAR' ? plan.originalPriceSar : plan.originalPriceEgp;
          const currencyLabel = currency === 'SAR' ? 'ريال' : 'جنيه';

          return (
            <div
              key={plan.id}
              className={`relative rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 ${
                isAnnual
                  ? 'bg-gradient-to-b from-[#183929] via-[#11271c] to-[#0c1c14] border-2 border-amber-400 shadow-[0_0_40px_rgba(251,191,36,0.25)] md:-translate-y-2'
                  : isHawameer
                  ? 'bg-gradient-to-b from-[#241a35] via-[#171224] to-[#0d0915] border border-purple-400/50 hover:border-purple-400 shadow-xl'
                  : 'bg-[#0f2319] border border-white/15 hover:border-white/30 shadow-lg'
              }`}
            >
              {/* Top Badge */}
              {plan.badge && (
                <div
                  className={`absolute -top-3.5 right-6 px-3.5 py-1 rounded-full text-xs font-black shadow-md ${
                    isAnnual
                      ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-black'
                      : isHawameer
                      ? 'bg-gradient-to-r from-purple-400 to-pink-500 text-white'
                      : 'bg-white/10 text-gray-200 border border-white/20'
                  }`}
                >
                  {plan.badge}
                </div>
              )}

              <div>
                {/* Header */}
                <div className="mb-4">
                  <h2 className="text-xl font-black text-white">{plan.tierNameAr}</h2>
                  <span className="text-[11px] text-gray-400 font-semibold">{plan.tierNameEn}</span>
                </div>

                {/* Price */}
                <div className="mb-4 pb-4 border-b border-white/10">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl sm:text-5xl font-black text-amber-300">
                      {price}
                    </span>
                    <span className="text-sm font-bold text-gray-200">{currencyLabel}</span>
                    {originalPrice && (
                      <span className="text-xs text-rose-400 line-through mr-1 font-semibold">
                        {originalPrice} {currencyLabel}
                      </span>
                    )}
                  </div>

                  <span className="text-xs text-gray-300 block mt-1 font-medium">
                    {plan.intervalAr}
                  </span>
                </div>

                <p className="text-xs text-gray-300 mb-6 leading-relaxed">
                  {plan.descriptionAr}
                </p>

                {/* Features */}
                <ul className="space-y-3 text-xs sm:text-sm text-gray-200 mb-8">
                  {plan.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="text-base leading-none">{feat.icon || '✓'}</span>
                      <span className="leading-snug">{feat.title}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <div>
                {isCurrentActive ? (
                  <button
                    type="button"
                    onClick={() => onSelectTab('subscription_manage')}
                    className="w-full py-4 rounded-2xl bg-emerald-600/30 border border-emerald-500/50 text-emerald-200 font-bold text-sm"
                  >
                    باقتك الحالية النشطة ✓
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleOpenPlanCheckout(plan.id as 'monthly' | 'annual' | 'hawameer')}
                    className={`w-full py-4 rounded-2xl font-black text-sm shadow-xl transition-all hover:scale-[1.02] cursor-pointer flex items-center justify-center gap-2 ${
                      isAnnual
                        ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 text-black shadow-amber-500/20'
                        : isHawameer
                        ? 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 text-white shadow-purple-500/20'
                        : 'bg-white/10 hover:bg-white/15 text-white border border-white/20'
                    }`}
                  >
                    <span>الدفع عبر كاشير بـ {price} {currencyLabel}</span>
                    <span>🚀</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Side-by-Side Psychological Comparison Matrix: Free vs VIP */}
      <div className="bg-[#0c1a13] border-2 border-emerald-500/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="text-center max-w-xl mx-auto">
          <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full inline-block mb-2">
            مقارنة المزايا والقيود
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-white">
            لماذا يختار 98% من المحترفين عضوية ديوان VIP؟
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            اطلع على الفوارق الجوهرية بين الحساب المجاني وعضوية VIP عبر كاشير
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-white/15 text-gray-300">
                <th className="py-3 px-4 font-black">الميزة / الخاصية</th>
                <th className="py-3 px-4 font-black text-gray-400 bg-white/5 rounded-t-xl">
                  الحساب المجاني
                </th>
                <th className="py-3 px-4 font-black text-amber-300 bg-amber-500/10 rounded-t-xl">
                  عضوية VIP (كاشير) 👑
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-200">
              {FREE_TIER_RESTRICTIONS.map((row, idx) => (
                <tr key={idx} className="hover:bg-white/5 transition-all">
                  <td className="py-3.5 px-4 font-bold text-white">{row.feature}</td>
                  <td className="py-3.5 px-4 text-gray-400 bg-white/5">
                    {row.free}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-emerald-300 bg-amber-500/10">
                    {row.vip}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Instant Token Packs Powered by Kashier */}
      <div className="space-y-6">
        <div className="text-center">
          <span className="text-xs font-bold text-amber-400">متجر الدنانير الفوري</span>
          <h3 className="text-xl sm:text-3xl font-black text-white">
            حزم دنانير التميز عبر بوابة كاشير 🪙
          </h3>
          <p className="text-xs text-gray-400 max-w-lg mx-auto">
            احصل على دنانير إضافية لفتح الشارات والرموز الخاصة دون الحاجة لاشتراك شهري
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {KASHIER_TOKEN_PACKS.map((pack) => {
            const price = currency === 'SAR' ? pack.priceSar : pack.priceEgp;
            const currencyLabel = currency === 'SAR' ? 'ريال' : 'جنيه';
            const totalCoins = pack.coins + pack.bonusCoins;

            return (
              <div
                key={pack.id}
                className="bg-[#0f2319] border border-amber-400/30 hover:border-amber-400 rounded-3xl p-5 flex flex-col justify-between shadow-xl transition-all relative text-center"
              >
                {pack.badge && (
                  <span className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-amber-400 text-black text-[10px] font-black">
                    {pack.badge}
                  </span>
                )}

                <div className="space-y-3">
                  <span className="text-4xl block">{pack.icon}</span>
                  <h4 className="text-base font-black text-white">{pack.nameAr}</h4>
                  <div className="flex items-center justify-center gap-1.5 text-2xl font-black text-amber-300">
                    <span>{totalCoins.toLocaleString()}</span>
                    <span className="text-xs font-bold text-gray-300">دينار</span>
                  </div>
                  {pack.bonusCoins > 0 && (
                    <span className="text-[11px] text-emerald-400 font-bold block">
                      (يشمل {pack.bonusCoins.toLocaleString()} دينار بونص مجاني)
                    </span>
                  )}
                </div>

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => handleOpenPackCheckout(pack.id)}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-black font-black text-xs shadow-md transition-all cursor-pointer"
                  >
                    شراء بـ {price} {currencyLabel} كاشير ⚡
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Social Proof & Customer Reviews */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-black/30 border border-white/10 rounded-2xl p-5 space-y-2 text-right">
          <div className="flex items-center gap-2">
            <span className="text-xl">🦅</span>
            <div>
              <strong className="text-xs text-white block">سلمان الدوسري (الرياض)</strong>
              <span className="text-[10px] text-amber-400 font-bold">مشترك سنوي VIP</span>
            </div>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            «ميزة كاشفة الأكلات والتحليل التكتيكي فرقت معي جداً في معرفة حسابات الورق، والدفع عبر كاشير بمدى كان لحظياً وسلساً.»
          </p>
        </div>

        <div className="bg-black/30 border border-white/10 rounded-2xl p-5 space-y-2 text-right">
          <div className="flex items-center gap-2">
            <span className="text-xl">👑</span>
            <div>
              <strong className="text-xs text-white block">م. عمر الشريف (القاهرة)</strong>
              <span className="text-[10px] text-emerald-400 font-bold">مشترك بلس كاشير</span>
            </div>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            «أفضل شيء هو دعم فودافون كاش وميزة في كاشير، دفعت مباشرة من المحفظة بدون أي تعقيد واللعب غير محدود بدون إعلانات!»
          </p>
        </div>

        <div className="bg-black/30 border border-white/10 rounded-2xl p-5 space-y-2 text-right">
          <div className="flex items-center gap-2">
            <span className="text-xl">🦁</span>
            <div>
              <strong className="text-xs text-white block">فهد العتيبي (جدة)</strong>
              <span className="text-[10px] text-amber-400 font-bold">باقة الهوامير الملكية</span>
            </div>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            «الجوخ الأسود الذهبي وصوت الخبطات الفاخرة تعطي هيبة غير طبيعية في الديوانية. تجربة تستحق كل ريال.»
          </p>
        </div>
      </div>

      {/* 14-Day Money-Back Guarantee Seal */}
      <div className="bg-gradient-to-r from-[#0b1a13] via-[#10241b] to-[#0b1a13] border border-emerald-500/30 rounded-3xl p-6 text-center space-y-2 max-w-3xl mx-auto shadow-xl">
        <span className="text-4xl block">🛡️</span>
        <h4 className="text-base sm:text-lg font-black text-amber-300">
          ضمان ديوان البلوت الذهبي لاسترجاع الأموال لمدة 14 يوماً
        </h4>
        <p className="text-xs text-gray-300 leading-relaxed">
          نحن واثقون تماماً من جودة تجربة ديوان VIP. إذا لم تكن راضياً بنسبة 100% لأي سبب خلال 14 يوماً من اشتراكك، يمكنك طلب استرجاع كامل المبلغ المسدد عبر كاشير بضغطة زر واحدة بدون أي أسئلة أو تعقيد.
        </p>
      </div>

      {/* Kashier Checkout Modal Instance */}
      <KashierCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        planId={selectedPlanId || undefined}
        packId={selectedPackId || undefined}
        initialCurrency={currency}
        onSuccess={() => {
          setTimeout(() => {
            onSelectTab('subscription_manage');
          }, 1500);
        }}
      />
    </div>
  );
};
