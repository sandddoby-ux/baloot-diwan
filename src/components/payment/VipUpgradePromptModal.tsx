import React, { useState, useEffect } from 'react';
import { KASHIER_PLANS } from '../../services/kashierPaymentService';

interface VipUpgradePromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgradeClick: (planId: 'monthly' | 'annual' | 'hawameer') => void;
  reasonTitle?: string;
  reasonDescription?: string;
}

export const VipUpgradePromptModal: React.FC<VipUpgradePromptModalProps> = ({
  isOpen,
  onClose,
  onUpgradeClick,
  reasonTitle = 'ميزة حصرية لمشتركي ديوان VIP',
  reasonDescription = 'افتح اللعب اللامحدود، كاشفة الأكلات التكتيكية، وثيمات الجوخ الملكية عبر بوابة كاشير المعتمدة.',
}) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 28, seconds: 15 });

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const annualPlan = KASHIER_PLANS.find((p) => p.id === 'annual')!;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="bg-gradient-to-b from-[#13281d] via-[#0d1d15] to-[#07120d] border-2 border-amber-400/80 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-[0_0_60px_rgba(251,191,36,0.3)] relative text-right">
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center text-sm transition-all cursor-pointer"
        >
          ✕
        </button>

        {/* Urgency Ribbon */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-emerald-500/20 border border-amber-400/40 text-amber-300 text-xs font-black mb-3">
          <span>🔥</span>
          <span>عرض تدشين بوابة كاشير • خصم 62% ينتهي قريباً</span>
        </div>

        {/* Trigger Reason Box */}
        <div className="bg-amber-500/10 border border-amber-400/30 rounded-2xl p-3.5 mb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">🔒</span>
            <h3 className="text-sm font-black text-amber-200">{reasonTitle}</h3>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">{reasonDescription}</p>
        </div>

        {/* Dynamic Countdown Bar */}
        <div className="flex items-center justify-between bg-black/50 border border-white/10 rounded-xl px-4 py-2 mb-5 text-xs">
          <span className="text-gray-300 font-bold">باقي على انتهاء العرض الترويجي:</span>
          <div className="font-mono font-black text-amber-400 flex items-center gap-1 dir-ltr text-sm">
            <span>{String(timeLeft.hours).padStart(2, '0')}</span>:
            <span>{String(timeLeft.minutes).padStart(2, '0')}</span>:
            <span>{String(timeLeft.seconds).padStart(2, '0')}</span>
          </div>
        </div>

        {/* Feature Comparison Highlights */}
        <div className="space-y-2 mb-6 text-xs">
          <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
            <span className="text-gray-300">طاقة الصكات والمباريات:</span>
            <div className="flex items-center gap-2 font-bold">
              <span className="text-rose-400 line-through">5 صكات فقط</span>
              <span className="text-emerald-400">⚡ غير محدود VIP</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
            <span className="text-gray-300">كاشفة الأكلات والتحليل التكتيكي:</span>
            <div className="flex items-center gap-2 font-bold">
              <span className="text-rose-400">❌ محظور</span>
              <span className="text-emerald-400">✅ مفتوح بالكامل</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
            <span className="text-gray-300">أطقم الجوخ وظهور الورق الملكية:</span>
            <div className="flex items-center gap-2 font-bold">
              <span className="text-rose-400">❌ أخضر فقط</span>
              <span className="text-emerald-400">👑 كامل الألوان النادرة</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
            <span className="text-gray-300">مضاعف جوائز التحديات اليومية:</span>
            <div className="flex items-center gap-2 font-bold">
              <span className="text-gray-400">1x</span>
              <span className="text-amber-400">3x مكافأة ثلاثية 🪙</span>
            </div>
          </div>
        </div>

        {/* Primary CTA (Annual VIP Anchor) */}
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={() => {
              onClose();
              onUpgradeClick('annual');
            }}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-black font-black text-sm sm:text-base shadow-[0_0_30px_rgba(251,191,36,0.35)] transition-all hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>ترقية فورية إلى VIP السنوي بـ 149 ريال (وفر 62%) 🚀</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onUpgradeClick('monthly');
            }}
            className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-gray-300 font-bold text-xs transition-all cursor-pointer text-center"
          >
            أو الاشتراك الشهري بـ 29 ريال فقط
          </button>
        </div>

        {/* Kashier Guarantee & Social Proof */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-400">
          <span className="flex items-center gap-1 text-emerald-300">
            <span>🛡️</span>
            <span>بوابة كاشير: دفع آمن ومشفر</span>
          </span>
          <span className="text-gray-300 font-bold">
            ⭐️ تقييم 4.9/5 من 18,400+ لاعب
          </span>
        </div>
      </div>
    </div>
  );
};
