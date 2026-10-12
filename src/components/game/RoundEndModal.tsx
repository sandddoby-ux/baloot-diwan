import React from 'react';
import { MatchScore, RoundScore } from '../../engine/types';
import { SUIT_NAMES_AR } from '../../engine/deck';

interface RoundEndModalProps {
  roundScore: RoundScore | null | undefined;
  matchScore: MatchScore;
  roundNumber: number;
  onNextRound: () => void;
}

export const RoundEndModal: React.FC<RoundEndModalProps> = ({
  roundScore,
  matchScore,
  roundNumber,
  onNextRound,
}) => {
  if (!roundScore) return null;

  const isUsWinner = roundScore.winnerTeam === 'us';
  const contract = roundScore.contract;
  const isSun = contract.type === 'sun';
  const contractName = isSun ? 'صن ☀️' : `حكم (${SUIT_NAMES_AR[contract.suit!]}) ⚔️`;

  const usPercent = Math.min(100, Math.round((matchScore.us / 152) * 100));
  const themPercent = Math.min(100, Math.round((matchScore.them / 152) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#142921] to-[#091510] border-2 border-[#c5a059] rounded-2xl sm:rounded-3xl p-5 sm:p-7 text-center shadow-[0_0_50px_rgba(197,160,89,0.35)] select-none">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#c5a059]/20 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs sm:text-sm font-bold text-emerald-300">
              نهاية النشرة #{roundNumber}
            </span>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
            العقد: {contractName}
          </span>
        </div>

        {/* Round Outcome Badge */}
        <div className="mb-4">
          <div className="text-4xl sm:text-5xl mb-1">
            {isUsWinner ? '✨' : '⚔️'}
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-amber-300">
            {isUsWinner ? 'أكلتم النشرة بجدارة! 👏' : 'النشرة ذهبت للخصم! 🤝'}
          </h2>
          {roundScore.isKaboot && (
            <div className="inline-block mt-1 px-3 py-0.5 rounded-full bg-amber-500/30 border border-amber-400 text-amber-200 text-xs font-black animate-pulse">
              ⭐ كبوت (أكلتم كل الأكلات)!
            </div>
          )}
        </div>

        {/* Round Points Comparison */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4">
          {/* Us Card */}
          <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all ${
            isUsWinner ? 'bg-amber-500/15 border-amber-400 shadow-md' : 'bg-black/30 border-white/10'
          }`}>
            <span className="text-[11px] sm:text-xs text-amber-300 font-bold block mb-0.5">
              فريقنا (لنا)
            </span>
            <span className="text-2xl sm:text-4xl font-black text-amber-300">
              +{roundScore.usRoundPoints}
            </span>
            <span className="text-[10px] text-gray-400 block mt-1">
              أوراق: {roundScore.usCardPoints} | مشاريع: {roundScore.usProjectsPoints}
            </span>
          </div>

          {/* Them Card */}
          <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all ${
            !isUsWinner ? 'bg-amber-500/15 border-amber-400 shadow-md' : 'bg-black/30 border-white/10'
          }`}>
            <span className="text-[11px] sm:text-xs text-gray-300 font-bold block mb-0.5">
              فريق الخصم (لهم)
            </span>
            <span className="text-2xl sm:text-4xl font-black text-white">
              +{roundScore.themRoundPoints}
            </span>
            <span className="text-[10px] text-gray-400 block mt-1">
              أوراق: {roundScore.themCardPoints} | مشاريع: {roundScore.themProjectsPoints}
            </span>
          </div>
        </div>

        {/* Total Match Progress towards 152 */}
        <div className="bg-black/40 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-[#c5a059]/25 mb-5 text-right">
          <div className="flex justify-between items-center text-xs font-bold text-gray-300 mb-2">
            <span>مجموع قيد الصكة (الهدف: 152 نقطة)</span>
            <span className="text-amber-300 font-black">
              لنا {matchScore.us} / لهم {matchScore.them}
            </span>
          </div>

          {/* Us Bar */}
          <div className="mb-2">
            <div className="flex justify-between text-[10px] text-amber-200 mb-0.5 font-semibold">
              <span>لنا ({matchScore.us} / 152)</span>
              <span>{usPercent}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-500 rounded-full"
                style={{ width: `${usPercent}%` }}
              />
            </div>
          </div>

          {/* Them Bar */}
          <div>
            <div className="flex justify-between text-[10px] text-gray-300 mb-0.5 font-semibold">
              <span>لهم ({matchScore.them} / 152)</span>
              <span>{themPercent}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-slate-400 to-white transition-all duration-500 rounded-full"
                style={{ width: `${themPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={onNextRound}
          className="w-full py-3 sm:py-3.5 px-5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-black font-black text-sm sm:text-base shadow-xl transition-all hover:scale-[1.02] active:scale-98 flex items-center justify-center gap-2"
        >
          <span>بدء النشرة التالية ({roundNumber + 1})</span>
          <span>⏭️</span>
        </button>
        <p className="text-[10px] text-gray-400 mt-2">
          الانتقال التلقائي جارٍ خلال ثوانٍ...
        </p>
      </div>
    </div>
  );
};
