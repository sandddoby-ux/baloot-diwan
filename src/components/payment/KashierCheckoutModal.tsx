import React, { useState } from 'react';
import {
  kashierService,
  KashierPaymentMethod,
  SupportedCurrency,
  KASHIER_PLANS,
  KASHIER_TOKEN_PACKS,
  KashierTransaction,
} from '../../services/kashierPaymentService';
import { getUserProfile, saveUserProfile } from '../../services/storage';
import { analytics } from '../../services/analytics';
import confetti from 'canvas-confetti';

interface KashierCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId?: 'monthly' | 'annual' | 'hawameer';
  packId?: 'starter' | 'pro' | 'hawameer_vault';
  initialCurrency?: SupportedCurrency;
  onSuccess?: (tx: KashierTransaction) => void;
}

export const KashierCheckoutModal: React.FC<KashierCheckoutModalProps> = ({
  isOpen,
  onClose,
  planId,
  packId,
  initialCurrency = 'SAR',
  onSuccess,
}) => {
  const [currency, setCurrency] = useState<SupportedCurrency>(initialCurrency);
  const [method, setMethod] = useState<KashierPaymentMethod>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [walletPhone, setWalletPhone] = useState('01012345678');
  const [installmentProvider, setInstallmentProvider] = useState<'valu' | 'souhoola' | 'sympl'>('valu');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successTx, setSuccessTx] = useState<KashierTransaction | null>(null);
  const [fawryCodeGenerated, setFawryCodeGenerated] = useState<string | null>(null);

  if (!isOpen) return null;

  const plan = planId ? KASHIER_PLANS.find((p) => p.id === planId) : null;
  const pack = packId ? KASHIER_TOKEN_PACKS.find((p) => p.id === packId) : null;

  const amount = plan
    ? currency === 'SAR'
      ? plan.priceSar
      : plan.priceEgp
    : pack
    ? currency === 'SAR'
      ? pack.priceSar
      : pack.priceEgp
    : 0;

  const titleAr = plan ? plan.tierNameAr : pack ? pack.nameAr : 'الدفع عبر كاشير';
  const merchantInfo = kashierService.getMerchantInfo();

  const handleQuickFillCard = (type: 'success' | 'fail') => {
    if (type === 'success') {
      setCardNumber('4000 1234 5678 9010');
      setCardExpiry('12/28');
      setCardCvv('789');
      setErrorMsg(null);
    } else {
      setCardNumber('4000 0000 0000 0000');
      setCardExpiry('01/26');
      setCardCvv('000');
      setErrorMsg(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setErrorMsg(null);

    const res = await kashierService.processKashierCheckout({
      planId,
      packId,
      method,
      currency,
      cardNumber,
      mobileWalletNumber: walletPhone,
      installmentProvider: method === 'installments' ? installmentProvider : undefined,
    });

    setIsProcessing(false);

    if (res.success && res.transaction) {
      if (method === 'fawry') {
        setFawryCodeGenerated(res.transaction.fawryCode || '78942150');
      } else {
        setSuccessTx(res.transaction);
        try {
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.55 },
          });
        } catch {
          // ignore
        }
      }

      // Apply subscription or coins to user
      const user = getUserProfile();
      if (planId) {
        const days = planId === 'hawameer' ? 540 : planId === 'annual' ? 365 : 30;
        const expiresAt = new Date(Date.now() + days * 86400000).toLocaleDateString('ar-SA');
        
        let bonusCoins = 0;
        if (planId === 'annual') bonusCoins = 3000;
        if (planId === 'hawameer') bonusCoins = 15000;

        const updated = {
          ...user,
          isSubscriber: true,
          subscriptionPlan: planId,
          subscriptionExpiresAt: expiresAt,
          subscriptionAutoRenew: true,
          kashierReference: res.transaction.kashierReference,
          coins: user.coins + bonusCoins,
          dailyMatchesLimit: Infinity,
        };
        saveUserProfile(updated);
      } else if (packId && pack) {
        const totalCoins = pack.coins + pack.bonusCoins;
        const updated = {
          ...user,
          coins: user.coins + totalCoins,
          kashierReference: res.transaction.kashierReference,
        };
        saveUserProfile(updated);
      }

      analytics.track('kashier_payment_completed', {
        planId,
        packId,
        amount,
        currency,
        method,
      });

      if (onSuccess) {
        onSuccess(res.transaction);
      }
    } else {
      setErrorMsg(res.error || 'تعذر إتمام الدفع عبر بوابة كاشير');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="bg-gradient-to-b from-[#13271e] to-[#0c1913] border-2 border-emerald-500/60 rounded-3xl p-5 sm:p-7 max-w-lg w-full shadow-[0_0_50px_rgba(16,185,129,0.25)] relative text-right max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center text-sm transition-all cursor-pointer"
        >
          ✕
        </button>

        {/* Kashier Gateway Brand Badge */}
        <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-black font-black text-sm flex items-center justify-center shadow-md">
              K
            </span>
            <div>
              <span className="text-xs font-black text-emerald-400 block leading-tight">
                كاشير للدفع الإلكتروني • Kashier
              </span>
              <span className="text-[10px] text-gray-400">
                بوابة معتمدة ومرخصة بالكامل • PCI-DSS Certified
              </span>
            </div>
          </div>

          {/* Currency Toggle */}
          <div className="flex bg-black/40 rounded-xl p-0.5 border border-white/10 text-xs font-bold">
            <button
              type="button"
              onClick={() => setCurrency('SAR')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                currency === 'SAR' ? 'bg-amber-500 text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              🇸🇦 ريال (SAR)
            </button>
            <button
              type="button"
              onClick={() => setCurrency('EGP')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                currency === 'EGP' ? 'bg-emerald-500 text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              🇪🇬 جنيه (EGP)
            </button>
          </div>
        </div>

        {/* Success Screen */}
        {successTx ? (
          <div className="text-center py-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-5xl shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              👑
            </div>
            <h3 className="text-2xl font-black text-amber-300">
              تم الدفع وتفعيل المزايا بنجاح!
            </h3>
            <p className="text-xs sm:text-sm text-gray-200 leading-relaxed max-w-sm mx-auto">
              تهانينا! تم تفعيل اشتراكك عبر بوابة كاشير فورياً. استمتع باللعب اللامحدود والجوخ الفاخر والتحليلات التكتيكية.
            </p>

            {/* Official Kashier Receipt */}
            <div className="bg-black/50 border border-emerald-500/30 rounded-2xl p-4 text-xs space-y-2 text-right">
              <div className="flex justify-between text-gray-400 border-b border-white/10 pb-1.5">
                <span>رقم إيصال كاشير:</span>
                <span className="font-mono text-emerald-300 font-bold">{successTx.receiptNumber}</span>
              </div>
              <div className="flex justify-between text-gray-400 border-b border-white/10 pb-1.5">
                <span>معرف الطلب:</span>
                <span className="font-mono text-white">{successTx.orderId}</span>
              </div>
              <div className="flex justify-between text-gray-400 border-b border-white/10 pb-1.5">
                <span>المبلغ المسدد:</span>
                <span className="font-bold text-amber-300">
                  {successTx.amount} {successTx.currency === 'SAR' ? 'ريال سعودي' : 'جنيه مصري'}
                </span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>حالة العملية:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <span>✓</span> مكتمل ومؤكد عبر البنك
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-black font-black text-sm shadow-xl transition-all cursor-pointer"
            >
              دخول ديوان البلوت الآن 🃏
            </button>
          </div>
        ) : fawryCodeGenerated ? (
          /* Fawry / Kiosk Code Screen */
          <div className="text-center py-4 space-y-4">
            <span className="text-5xl block">🏪</span>
            <h3 className="text-xl font-black text-amber-300">
              كود كاشير / فوري للدفع النقدي
            </h3>
            <p className="text-xs text-gray-300">
              تفضل بزيارة أي فرع فوري أو كشك أو أمان وادفع باستخدام الرقم المرجعي التالي:
            </p>

            <div className="bg-black/60 border-2 border-dashed border-amber-400 rounded-2xl p-4">
              <span className="text-xs text-gray-400 block mb-1">الرقم المرجعي (Fawry Reference Code):</span>
              <span className="text-3xl font-mono font-black text-amber-300 tracking-wider">
                {fawryCodeGenerated}
              </span>
              <span className="text-[11px] text-emerald-400 block mt-2 font-bold">
                المبلغ المطلوب سداده: {amount} {currency === 'SAR' ? 'ريال' : 'جنيه'} (صالح لمدة 48 ساعة)
              </span>
            </div>

            <div className="bg-white/5 rounded-xl p-3 text-right text-xs text-gray-300 space-y-1">
              <p className="font-bold text-amber-200">خطوات السداد:</p>
              <p>1. اطلب من التاجر الدفع عبر خدمة «مدفوعات كاشير / فوري» (كود الخدمة: 788).</p>
              <p>2. أعطه الرقم المرجعي الموضح أعلاه.</p>
              <p>3. سيتم تفعيل حسابك تلقائياً وبشكل فوري بمجرد إتمام السداد.</p>
            </div>

            <button
              type="button"
              onClick={() => {
                setSuccessTx({
                  orderId: kashierService.generateOrderId(),
                  kashierReference: `ksh_fawry_${fawryCodeGenerated}`,
                  planId,
                  packId,
                  amount,
                  currency,
                  method: 'fawry',
                  status: 'succeeded',
                  receiptNumber: kashierService.generateReceiptNumber(),
                  createdAt: new Date().toISOString(),
                });
                setFawryCodeGenerated(null);
              }}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition-all cursor-pointer"
            >
              محاكاة إتمام السداد الفوري في الكشك (تجريبي) ✓
            </button>
          </div>
        ) : (
          /* Normal Checkout Form */
          <div>
            {/* Package Summary Header */}
            <div className="bg-black/40 border border-emerald-500/20 rounded-2xl p-3.5 mb-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-emerald-400 font-bold block">الطلب المحدد:</span>
                <h4 className="text-sm font-black text-white">{titleAr}</h4>
              </div>
              <div className="text-left">
                <span className="text-2xl font-black text-amber-300">{amount}</span>
                <span className="text-xs font-bold text-gray-300 mr-1">
                  {currency === 'SAR' ? 'ريال' : 'جنيه'}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Payment Methods Tabs */}
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-2">
                  طريقة الدفع المعتمدة عبر كاشير:
                </label>
                <div className="grid grid-cols-4 gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setMethod('card')}
                    className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                      method === 'card'
                        ? 'border-emerald-400 bg-emerald-500/20 text-white font-black shadow-md'
                        : 'border-white/10 bg-black/20 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    <span className="text-base">💳</span>
                    <span>بطاقات بنكية</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMethod('wallet')}
                    className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                      method === 'wallet'
                        ? 'border-emerald-400 bg-emerald-500/20 text-white font-black shadow-md'
                        : 'border-white/10 bg-black/20 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    <span className="text-base">📱</span>
                    <span>محافظ ذكية</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMethod('fawry')}
                    className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                      method === 'fawry'
                        ? 'border-emerald-400 bg-emerald-500/20 text-white font-black shadow-md'
                        : 'border-white/10 bg-black/20 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    <span className="text-base">🏪</span>
                    <span>كشك / فوري</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMethod('installments')}
                    className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                      method === 'installments'
                        ? 'border-emerald-400 bg-emerald-500/20 text-white font-black shadow-md'
                        : 'border-white/10 bg-black/20 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    <span className="text-base">🛍️</span>
                    <span>تقسيط ميسر</span>
                  </button>
                </div>
              </div>

              {/* CARD METHOD INPUTS */}
              {method === 'card' && (
                <div className="space-y-3 bg-black/30 p-3 rounded-2xl border border-white/5">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-gray-400">يدعم: مدى، فيزا، ماستركارد، وميزة</span>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleQuickFillCard('success')}
                        className="text-emerald-400 underline hover:text-emerald-300 font-bold"
                      >
                        بطاقة نجاح تجريبية
                      </button>
                      <span className="text-gray-600">|</span>
                      <button
                        type="button"
                        onClick={() => handleQuickFillCard('fail')}
                        className="text-rose-400 underline hover:text-rose-300"
                      >
                        بطاقة رفض
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-300 block mb-1">
                      رقم البطاقة (Card Number):
                    </label>
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4000 1234 5678 9010"
                      className="w-full bg-black/60 border border-white/20 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400 text-left font-mono dir-ltr"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-gray-300 block mb-1">
                        تاريخ الانتهاء (MM/YY):
                      </label>
                      <input
                        type="text"
                        required
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="12/28"
                        maxLength={5}
                        className="w-full bg-black/60 border border-white/20 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400 text-center font-mono dir-ltr"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-gray-300 block mb-1">
                        رمز الأمان (CVV):
                      </label>
                      <input
                        type="password"
                        required
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="•••"
                        maxLength={4}
                        className="w-full bg-black/60 border border-white/20 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400 text-center font-mono dir-ltr"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* WALLET METHOD INPUTS */}
              {method === 'wallet' && (
                <div className="space-y-3 bg-black/30 p-3 rounded-2xl border border-white/5">
                  <p className="text-xs text-gray-300">
                    ادفع مباشرة عبر محفظتك الإلكترونية (فودافون كاش، أورنج كاش، اتصالات، وي، أو STC Pay):
                  </p>
                  <div>
                    <label className="text-[11px] font-bold text-gray-300 block mb-1">
                      رقم هاتف المحفظة:
                    </label>
                    <input
                      type="tel"
                      required
                      value={walletPhone}
                      onChange={(e) => setWalletPhone(e.target.value)}
                      placeholder="01012345678 أو 0501234567"
                      className="w-full bg-black/60 border border-white/20 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400 text-left font-mono dir-ltr"
                    />
                  </div>
                  <span className="text-[10px] text-gray-400 block">
                    * ستصلك رسالة نصية أو إشعار فوري على هاتفك لتأكيد الخصم برقمك السري.
                  </span>
                </div>
              )}

              {/* FAWRY KIOSK METHOD */}
              {method === 'fawry' && (
                <div className="space-y-2 bg-black/30 p-3 rounded-2xl border border-white/5 text-xs text-gray-300">
                  <div className="flex items-center gap-2 text-amber-300 font-bold">
                    <span>⚡</span>
                    <span>دفع نقدي فوري بدون الحاجة لبطاقة بنكية</span>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    بالضغط على الزر أدناه، ستنشئ كاشير كود دفع رقمي مخصص يمكنك سداده في أي كشك، صيدلية، أو متجر يحمل علامة فوري أو أمان.
                  </p>
                </div>
              )}

              {/* INSTALLMENTS METHOD */}
              {method === 'installments' && (
                <div className="space-y-3 bg-black/30 p-3 rounded-2xl border border-white/5 text-xs">
                  <span className="text-gray-300 font-bold block">اختر مزود خدمة التقسيط:</span>
                  <div className="grid grid-cols-3 gap-2">
                    {(['valu', 'souhoola', 'sympl'] as const).map((prov) => (
                      <button
                        key={prov}
                        type="button"
                        onClick={() => setInstallmentProvider(prov)}
                        className={`p-2 rounded-xl border text-center font-bold uppercase transition-all ${
                          installmentProvider === prov
                            ? 'border-emerald-400 bg-emerald-500/20 text-white'
                            : 'border-white/10 bg-black/20 text-gray-400'
                        }`}
                      >
                        {prov}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-400">
                    تقسيط فوري على 3 إلى 12 شهراً بدون فوائد لعملاء كاشير المعتمدين.
                  </p>
                </div>
              )}

              {/* Error Message */}
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs">
                  {errorMsg}
                </div>
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-black font-black text-sm shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                    <span>جارٍ الاتصال الآمن مع بوابة كاشير...</span>
                  </>
                ) : method === 'fawry' ? (
                  <span>إنشاء كود كاشير للدفع النقدي (فوري) 🏪</span>
                ) : (
                  <span>تأكيد الدفع عبر كاشير ({amount} {currency === 'SAR' ? 'ريال' : 'جنيه'}) 🚀</span>
                )}
              </button>
            </form>

            {/* Trust Footer */}
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-gray-400">
              <span className="flex items-center gap-1">
                <span>🛡️</span>
                <span>تشفير بنكي 256-bit SSL</span>
              </span>
              <span>{merchantInfo.poweredBy}</span>
              <span className="text-emerald-400 font-bold">ضمان استرجاع 14 يوماً</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
