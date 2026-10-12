import React, { useState } from 'react';
import { BalootLogo } from '../common/BalootLogo';
import {
  getUserProfile,
  getDailyMatchesStatus,
  consumeDailyMatch,
  saveUserProfile,
} from '../../services/storage';
import { VipUpgradePromptModal } from '../payment/VipUpgradePromptModal';

interface PlayHubProps {
  onStartGame: (mode: 'quick' | 'bot' | 'private' | 'training') => void;
  onSelectTab: (tab: string) => void;
}

export const PlayHubPage: React.FC<PlayHubProps> = ({ onStartGame, onSelectTab }) => {
  const [user, setUser] = useState(getUserProfile());
  const [showVipModal, setShowVipModal] = useState(false);
  const [vipReason, setVipReason] = useState<{ title: string; desc: string }>({
    title: 'نفدت صكات الطاقة اليومية (5/5 صكات)',
    desc: 'لقد استنفدت حد اللعب اليومي المجاني. اشترك الآن في ديوان VIP عبر كاشير للعب اللامحدود، أو انتظر تجدد الطاقة عند منتصف الليل.',
  });
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [adSuccessMsg, setAdSuccessMsg] = useState<string | null>(null);

  const energyStatus = getDailyMatchesStatus(user);

  const handleStartCompetitiveGame = (mode: 'quick' | 'private') => {
    if (!user.isSubscriber && energyStatus.remaining <= 0) {
      setVipReason({
        title: 'نفدت صكات الطاقة اليومية المجانية (5/5)',
        desc: 'لقد استنفدت حد الصكات اليومية المجاني. اشترك الآن في ديوان VIP عبر كاشير بخصم 62% لفتح اللعب اللامحدود على مدار الساعة وبدون أي فواصل!',
      });
      setShowVipModal(true);
      return;
    }

    consumeDailyMatch();
    setUser(getUserProfile());
    onStartGame(mode);
  };

  const handleSimulateWatchAd = () => {
    setIsWatchingAd(true);
    setTimeout(() => {
      setIsWatchingAd(false);
      // Give 1 extra match by decrementing used
      const updated = {
        ...user,
        dailyMatchesUsed: Math.max(0, (user.dailyMatchesUsed || 0) - 1),
      };
      saveUserProfile(updated);
      setUser(updated);
      setAdSuccessMsg('شكراً لدعمك للرعاة! تمت إضافة صكة واحدة لطاقتك اليومية. للتخلص من الإعلانات تماماً اشترك في VIP.');
      setTimeout(() => setAdSuccessMsg(null), 5000);
    }, 2500);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 select-none">
      {/* Header */}
      <div className="text-center flex flex-col items-center">
        <div className="mb-3">
          <BalootLogo size="lg" showText={false} withGlow={true} />
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-[#f7f2e7] mb-2">
          ديوان اللعب والمباريات 🃏
        </h1>
        <p className="text-xs sm:text-sm text-gray-400">
          اختر طاولتك المفضلة وابدأ صكة البلوت مباشرة بدون أي انتظار
        </p>
      </div>

      {/* Daily Energy & VIP Meter Bar */}
      <div className="bg-[#0e2118] border border-emerald-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-2xl">
            {energyStatus.isUnlimited ? '👑' : '⚡'}
          </span>
          <div className="flex-1 text-right">
            <div className="flex items-center gap-2">
              <strong className="text-xs sm:text-sm text-white font-black">
                {energyStatus.isUnlimited
                  ? 'طاقة الصكات: غير محدودة 24/7 (مشترك ديوان VIP كاشير)'
                  : `طاقة الصكات اليومية: ${energyStatus.remaining} من ${energyStatus.limit} صكات متبقية`}
              </strong>
              {!energyStatus.isUnlimited && (
                <span className="text-[10px] text-amber-300 font-bold bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                  تتجدد بعد {energyStatus.resetsInHours} س
                </span>
              )}
            </div>

            {/* Progress bar */}
            {!energyStatus.isUnlimited && (
              <div className="w-full sm:w-64 bg-black/50 h-2 rounded-full overflow-hidden mt-1.5 border border-white/10">
                <div
                  className={`h-full transition-all ${
                    energyStatus.remaining > 2
                      ? 'bg-emerald-400'
                      : energyStatus.remaining > 0
                      ? 'bg-amber-400'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${(energyStatus.remaining / energyStatus.limit) * 100}%` }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Action on Energy Bar */}
        <div>
          {energyStatus.isUnlimited ? (
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
              جميع المزايا مفتوحة ✓
            </span>
          ) : (
            <button
              type="button"
              onClick={() => {
                setVipReason({
                  title: 'العب بدون قيود مع ديوان VIP',
                  desc: 'تخلص من عداد الصكات اليومية واستمتع بلعب لامحدود على مدار الساعة وكاشفة الأكلات الحصرية عبر كاشير.',
                });
                setShowVipModal(true);
              }}
              className="text-xs font-black text-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 px-3.5 py-1.5 rounded-xl shadow-md transition-all hover:scale-105 cursor-pointer flex items-center gap-1.5"
            >
              <span>فتح اللعب اللامحدود (كاشير) 🚀</span>
            </button>
          )}
        </div>
      </div>

      {adSuccessMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs text-center animate-in fade-in">
          {adSuccessMsg}
        </div>
      )}

      {/* If Out of Energy, Prompt Warning */}
      {!energyStatus.isUnlimited && energyStatus.remaining <= 0 && (
        <div className="bg-rose-950/40 border border-rose-500/40 rounded-2xl p-4 text-center space-y-3">
          <p className="text-xs sm:text-sm text-rose-200 font-bold">
            ⚠️ لقد استنفدت صكاتك الـ 5 اليومية المجانية!
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                setVipReason({
                  title: 'نفدت صكات الطاقة اليومية (5/5)',
                  desc: 'اشترك الآن في ديوان VIP عبر كاشير بخصم 62% واستمر في اللعب فوراً بدون انتظار الغد!',
                });
                setShowVipModal(true);
              }}
              className="px-4 py-2 rounded-xl bg-amber-400 text-black font-black text-xs shadow-lg hover:scale-105 transition-all cursor-pointer"
            >
              ترقية فورية إلى VIP عبر كاشير (149 ريال/سنة) 👑
            </button>
            <button
              type="button"
              disabled={isWatchingAd}
              onClick={handleSimulateWatchAd}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-gray-200 font-bold text-xs border border-white/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              {isWatchingAd ? (
                <>
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>جارٍ عرض إعلان الراعي (3 ثوانٍ)...</span>
                </>
              ) : (
                <span>مشاهدة إعلان راعٍ لصكة إضافية 📺</span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Game Mode Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quick Match Card */}
        <div className="bg-[#10241b] border-2 border-[#c5a059]/40 rounded-3xl p-6 sm:p-8 flex flex-col justify-between hover:border-amber-400 shadow-2xl transition-all">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-300 text-2xl flex items-center justify-center font-bold">
                ⚡
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                متاح الآن • متصلون
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-amber-200 mb-2">
              مباراة سريعة أونلاين
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-6">
              نظام مطابقة فوري يجمعك مع لاعبين سعوديين وخليجيين. صكة رسمية إلى 152 نقطة (قيد)، مع تبديل تلقائي للموزع وإحصائيات مباشرة.
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleStartCompetitiveGame('quick')}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-black font-black text-base shadow-lg transition-all hover:scale-[1.02] cursor-pointer"
          >
            بدء مباراة سريعة فوراً 🚀
          </button>
        </div>

        {/* Private Room Card */}
        <div className="bg-[#10241b] border-2 border-[#c5a059]/40 rounded-3xl p-6 sm:p-8 flex flex-col justify-between hover:border-emerald-400 shadow-2xl transition-all">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-300 text-2xl flex items-center justify-center font-bold">
                🚪
              </span>
              <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/30">
                رمز سري • برابط دعوة
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-emerald-200 mb-2">
              ديوانية خاصة مع أصحابك
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-6">
              أنشئ طاولة خاصة لك ولأصدقائك، احصل على كود فريد وشاركه عبر واتساب. تحكم في إعدادات اللعب وزمن كل رمية.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onSelectTab('rooms')}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 text-white font-black text-base shadow-lg transition-all hover:scale-[1.02] cursor-pointer"
          >
            إنشاء ديوانية خاصة 🔑
          </button>
        </div>

        {/* Bot Practice Card */}
        <div className="bg-[#0f2119] border border-white/10 hover:border-blue-400/50 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl transition-all">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-300 text-2xl flex items-center justify-center font-bold">
                🤖
              </span>
              <span className="px-3 py-1 rounded-full bg-white/10 text-gray-300 text-xs font-bold">
                بدون استهلاك طاقة
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-blue-200 mb-2">
              تدريب حر ضد الروبوتات
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-6">
              تدرّب على قراءة اللعب، حساب الأوراق، واتخاذ قرارات الشراء بدون أي ضغوطات زمنيّة.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onStartGame('bot')}
            className="w-full py-3.5 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 border border-blue-400/40 text-blue-200 font-bold text-sm transition-all hover:scale-[1.02] cursor-pointer"
          >
            بدء التدريب 🎮
          </button>
        </div>

        {/* Training Mode Card */}
        <div className="bg-[#0f2119] border border-white/10 hover:border-purple-400/50 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl transition-all">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-300 text-2xl flex items-center justify-center font-bold">
                🎓
              </span>
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold">
                تفاعلي خطوة بخطوة
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-purple-200 mb-2">
              نمط التعليم التفاعلي
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-6">
              هل أنت مبتدئ في البلوت؟ هذا النمط يوجهك أثناء اللعب، يوضح لك الحركات النظامية، ولماذا لا يجوز كسر اللون.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onStartGame('training')}
            className="w-full py-3.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-400/40 text-purple-200 font-bold text-sm transition-all hover:scale-[1.02] cursor-pointer"
          >
            بدء الدرس التفاعلي 📚
          </button>
        </div>
      </div>

      {/* VIP Upgrade Prompt Modal */}
      <VipUpgradePromptModal
        isOpen={showVipModal}
        onClose={() => setShowVipModal(false)}
        reasonTitle={vipReason.title}
        reasonDescription={vipReason.desc}
        onUpgradeClick={() => {
          setShowVipModal(false);
          onSelectTab('subscription');
        }}
      />
    </div>
  );
};
