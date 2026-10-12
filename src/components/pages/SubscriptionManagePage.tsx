import React, { useState } from 'react';
import { getUserProfile, saveUserProfile } from '../../services/storage';

interface SubscriptionManageProps {
  onSelectTab: (tab: string) => void;
}

export const SubscriptionManagePage: React.FC<SubscriptionManageProps> = ({ onSelectTab }) => {
  const [user, setUser] = useState(getUserProfile());
  const [feedback, setFeedback] = useState<string | null>(null);

  const tierLabels: Record<string, string> = {
    monthly: 'ديوان بلس الشهري',
    annual: 'ديوان VIP الملكي السنوي (الأكثر شعبية)',
    hawameer: 'ديوان الهوامير والنخبة المطلقة',
    free: 'الباقة المجانية الأساسية',
  };

  const currentTier = user.subscriptionPlan || (user.isSubscriber ? 'annual' : 'free');

  const handleCancelSubscription = () => {
    const updated = {
      ...user,
      isSubscriber: false,
      subscriptionPlan: 'free' as const,
      subscriptionAutoRenew: false,
      dailyMatchesLimit: 5,
    };
    setUser(updated);
    saveUserProfile(updated);
    setFeedback('تم إلغاء التجديد التلقائي عبر بوابة كاشير بنجاح. لا توجد أي التزامات مستقبلية ويمكنك الترقية مجدداً في أي وقت.');
  };

  const handleRequestRefund = () => {
    setFeedback('تم تسجيل طلب استرداد المبلغ عبر بوابة كاشير (Kashier Refund Request) بنجاح. ستصلك رسالة تأكيد مصرفية خلال 24 ساعة.');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 select-none space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold mb-2">
          <span>🛡️ بوابة كاشير المعتمدة • Kashier Payments</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">
          إدارة اشتراك ديوان VIP ⭐
        </h1>
        <p className="text-xs sm:text-sm text-gray-400">
          تحكم كامل وفوري في باقتك، تفاصيل فواتير كاشير، والتجديد التلقائي بدون أي تعقيد
        </p>
      </div>

      {feedback && (
        <div className="p-4 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs sm:text-sm text-center animate-in fade-in">
          {feedback}
        </div>
      )}

      <div className="bg-[#0f2319] border border-emerald-500/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl text-right">
        {/* Status Chip */}
        <div className="flex justify-between items-center border-b border-white/10 pb-4">
          <div>
            <span className="text-xs text-gray-400 block mb-0.5">الباقة المفعلة:</span>
            <span className="text-base font-black text-amber-300">
              {tierLabels[currentTier] || 'ديوان VIP'}
            </span>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              user.isSubscriber
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-white/10 text-gray-400'
            }`}
          >
            {user.isSubscriber ? 'نشط ومفعل ✓' : 'حساب مجاني'}
          </span>
        </div>

        {user.isSubscriber ? (
          <>
            <div className="space-y-3 text-xs sm:text-sm text-gray-300">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-400">طاقة الصكات اليومية:</span>
                <span className="font-bold text-emerald-400">⚡ غير محدودة 24/7 (VIP)</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-400">تاريخ انتهاء الفترة الحالية:</span>
                <span className="font-bold text-white">{user.subscriptionExpiresAt || 'بعد سنة'}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-400">التجديد التلقائي:</span>
                <span className="font-bold text-amber-300">
                  {user.subscriptionAutoRenew ? 'مفعل تلقائياً' : 'ملغى'}
                </span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-400">بوابة الدفع المسجلة:</span>
                <span className="font-bold text-emerald-300">كاشير (Kashier Gateway)</span>
              </div>
              {user.kashierReference && (
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-400">الرقم المرجعي لكاشير:</span>
                  <span className="font-mono text-gray-300 text-xs">{user.kashierReference}</span>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleCancelSubscription}
                className="flex-1 py-3 px-4 rounded-xl bg-rose-950/40 hover:bg-rose-900 border border-rose-500/30 text-rose-300 font-bold text-xs transition-all cursor-pointer"
              >
                إلغاء التجديد التلقائي ✕
              </button>

              <button
                type="button"
                onClick={handleRequestRefund}
                className="py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-gray-300 font-bold text-xs transition-all cursor-pointer"
              >
                طلب استرجاع (ضمان 14 يوماً) 🛡️
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-4 space-y-4">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/20 text-amber-400 text-2xl flex items-center justify-center">
              🔒
            </div>
            <p className="text-xs sm:text-sm text-gray-300 max-w-md mx-auto leading-relaxed">
              أنت تستخدم حالياً الباقة المجانية مع حد أقصى 5 صكات يومياً وخيارات طاولة عادية.
              اشترك في ديوان VIP عبر كاشير واستمتع بلعب لامحدود وتحليلات كاشفة الأكلات فورياً.
            </p>
            <button
              type="button"
              onClick={() => onSelectTab('subscription')}
              className="py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-black font-black text-xs shadow-xl transition-all hover:scale-105 cursor-pointer"
            >
              الترقية إلى VIP بخصم 62% عبر كاشير 🚀
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
