import React, { useState } from 'react';
import { MatchScore } from '../../engine/types';
import { getUserProfile } from '../../services/storage';
import { VipUpgradePromptModal } from '../payment/VipUpgradePromptModal';

interface GameOverModalProps {
  score: MatchScore;
  onRematch: () => void;
  onLeave: () => void;
  onGoToSubscription?: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  onRematch,
  onLeave,
  onGoToSubscription,
}) => {
  const [showVipModal, setShowVipModal] = useState(false);
  const [showTacticalAnalysis, setShowTacticalAnalysis] = useState(false);

  const user = getUserProfile();
  const isUsWinner = score.us >= 152;
  const isVip = Boolean(user.isSubscriber);

  const handleOpenTacticalAnalysis = () => {
    if (!isVip) {
      setShowVipModal(true);
    } else {
      setShowTacticalAnalysis(!showTacticalAnalysis);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300 select-none">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#142921] to-[#0a1511] border-2 border-[#c5a059] rounded-3xl p-6 sm:p-8 text-center shadow-[0_0_50px_rgba(197,160,89,0.3)] max-h-[92vh] overflow-y-auto">
        {/* Laurel or Cup Icon */}
        <div className="text-5xl sm:text-6xl mb-3">
          {isUsWinner ? '🏆' : '🤝'}
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-amber-300 mb-1">
          {isUsWinner ? 'مبروك! فوز مستحق بالصكة' : 'هاردلك! خيرها بغيرها'}
        </h2>
        <p className="text-sm text-gray-300 mb-5">
          {isUsWinner
            ? 'أبدعت أنت وخويّك في إدارة اللعب والوصول للقيد أولاً!'
            : 'مباراة حماسية قوية، الفريق الخصم تقدم في اللحظات الأخيرة.'}
        </p>

        {/* Big Score Board */}
        <div className="grid grid-cols-2 gap-4 bg-black/40 rounded-2xl p-4 border border-[#c5a059]/20 mb-5">
          <div className={`p-3 rounded-xl ${isUsWinner ? 'bg-amber-500/20 border border-amber-500/40' : 'bg-white/5'}`}>
            <span className="text-xs text-gray-400 block mb-1">فريقنا (لنا)</span>
            <span className="text-3xl sm:text-4xl font-black text-amber-300">{score.us}</span>
            <span className="text-xs text-gray-400 block mt-1">نقطة / أبنط</span>
          </div>
          <div className={`p-3 rounded-xl ${!isUsWinner ? 'bg-amber-500/20 border border-amber-500/40' : 'bg-white/5'}`}>
            <span className="text-xs text-gray-400 block mb-1">فريق الخصم (لهم)</span>
            <span className="text-3xl sm:text-4xl font-black text-white">{score.them}</span>
            <span className="text-xs text-gray-400 block mt-1">نقطة / أبنط</span>
          </div>
        </div>

        {/* Tactical Replay Hook (Conversion Anchor) */}
        <div className="mb-5">
          <button
            type="button"
            onClick={handleOpenTacticalAnalysis}
            className={`w-full py-3 px-4 rounded-2xl border text-xs sm:text-sm font-black transition-all flex items-center justify-between shadow-md cursor-pointer ${
              isVip
                ? 'bg-emerald-500/15 border-emerald-400/50 text-emerald-200 hover:bg-emerald-500/25'
                : 'bg-amber-500/10 border-amber-400/40 text-amber-300 hover:bg-amber-500/20'
            }`}
          >
            <div className="flex items-center gap-2">
              <span>{isVip ? '🔍' : '🔒'}</span>
              <span>كاشفة الأكلات والتحليل التكتيكي الذكي</span>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-black/40 border border-white/10">
              {isVip ? 'عرض التحليل ✓' : 'حصري لمشتركي VIP كاشير 🚀'}
            </span>
          </button>

          {/* Expanded VIP Tactical Insights */}
          {showTacticalAnalysis && isVip && (
            <div className="mt-3 bg-black/50 border border-emerald-500/30 rounded-2xl p-4 text-xs text-right space-y-2.5 animate-in fade-in">
              <strong className="text-emerald-300 block font-black border-b border-white/10 pb-1.5">
                📊 تقرير كاشفة اللعب التكتيكي (Diwan VIP Analytics):
              </strong>
              <div className="grid grid-cols-2 gap-2 text-gray-300 text-[11px]">
                <div className="bg-white/5 p-2 rounded-xl">
                  <span className="text-gray-400 block">دقة قرارات الشراء:</span>
                  <span className="text-amber-300 font-bold text-sm">88% (ممتازة)</span>
                </div>
                <div className="bg-white/5 p-2 rounded-xl">
                  <span className="text-gray-400 block">تناغم وتفاهم الخوي:</span>
                  <span className="text-emerald-300 font-bold text-sm">94% (تناغم عالي)</span>
                </div>
                <div className="bg-white/5 p-2 rounded-xl">
                  <span className="text-gray-400 block">أكبر أكلة محققة:</span>
                  <span className="text-white font-bold text-sm">48 أبنط (جولة حكم)</span>
                </div>
                <div className="bg-white/5 p-2 rounded-xl">
                  <span className="text-gray-400 block">نسبة كشف ورق الخصم:</span>
                  <span className="text-amber-300 font-bold text-sm">100% (مكتملة)</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Round History Summary */}
        <div className="bg-black/20 rounded-xl p-3 border border-white/5 mb-6 text-xs text-right max-h-32 overflow-y-auto">
          <p className="font-bold text-gray-300 mb-1 border-b border-white/10 pb-1">سجل الجولات (النشرات):</p>
          {score.roundHistory.map((rh, idx) => (
            <div key={idx} className="flex justify-between py-1 border-b border-white/5 last:border-0 text-gray-400">
              <span>جولة {rh.roundNumber} ({rh.contract.type === 'sun' ? 'صن' : 'حكم'}):</span>
              <span className="font-semibold text-gray-200">
                لنا: +{rh.usRoundPoints} | لهم: +{rh.themRoundPoints} {rh.isKaboot ? '⭐ كبوت' : ''}
              </span>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onRematch}
            className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-[#0b1311] font-black text-base shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            صكة ثانية (إعادة) 🔄
          </button>
          <button
            type="button"
            onClick={onLeave}
            className="flex-1 py-3 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-gray-200 font-bold text-base transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            العودة للديوانية 🚪
          </button>
        </div>
      </div>

      {/* Paywall Prompt Modal */}
      <VipUpgradePromptModal
        isOpen={showVipModal}
        onClose={() => setShowVipModal(false)}
        reasonTitle="كاشفة الأكلات والتحليل التكتيكي مقفلة"
        reasonDescription="ميزة كاشفة الأكلات وتحليل قرارات الشراء وأخطاء الصكة حصرية لمشتركي ديوان VIP عبر كاشير. اكتشف كيف فاز الخصم، أين ذهبت الأوراق الكبيرة، وحسّن تكتيكك فوراً!"
        onUpgradeClick={() => {
          setShowVipModal(false);
          if (onGoToSubscription) onGoToSubscription();
        }}
      />
    </div>
  );
};
