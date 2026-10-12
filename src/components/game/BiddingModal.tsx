import React, { useState } from 'react';
import { Card, Suit } from '../../engine/types';
import { CardView } from './CardView';
import { SUIT_NAMES_AR, SUIT_SYMBOLS } from '../../engine/deck';

interface BiddingModalProps {
  floorCard: Card | null;
  phase: 'bidding_round_1' | 'bidding_round_2';
  isPlayerTurn: boolean;
  onBid: (action: 'pass' | 'sun' | 'hokom', suit?: Suit) => void;
}

export const BiddingModal: React.FC<BiddingModalProps> = ({
  floorCard,
  phase,
  isPlayerTurn,
  onBid,
}) => {
  const [selectedSuit, setSelectedSuit] = useState<Suit>('spades');

  if (!isPlayerTurn) {
    return (
      <div className="bg-[#12221b]/90 backdrop-blur-md border border-[#c5a059]/30 rounded-xl px-5 py-3 text-center shadow-2xl">
        <div className="flex items-center justify-center gap-2 text-amber-200">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
          <span className="text-sm font-semibold">بانتظار مزايدة اللاعب الآخر...</span>
        </div>
      </div>
    );
  }

  const suits: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];

  return (
    <div className="bg-[#10221a]/95 backdrop-blur-md border border-[#c5a059]/40 rounded-2xl p-4 sm:p-6 shadow-[0_10px_35px_rgba(0,0,0,0.7)] max-w-md w-full mx-auto text-center animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-center justify-between border-b border-[#c5a059]/20 pb-2 mb-3">
        <span className="text-xs uppercase tracking-wider text-amber-300 font-bold">
          {phase === 'bidding_round_1' ? 'مزايدة الدورة الأولى (الشراء)' : 'مزايدة الدورة الثانية (الثاني)'}
        </span>
        <span className="text-xs px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-600/30">
          دورك الآن
        </span>
      </div>

      {floorCard && phase === 'bidding_round_1' && (
        <div className="flex items-center justify-center gap-4 my-2">
          <div className="text-right">
            <p className="text-xs text-gray-400">كرت الشراء المكشوف:</p>
            <p className="text-sm font-bold text-amber-200">
              {SUIT_NAMES_AR[floorCard.suit]} ({floorCard.rank})
            </p>
          </div>
          <CardView card={floorCard} isSmall={true} isPlayable={false} />
        </div>
      )}

      {/* Round 2 suit selector */}
      {phase === 'bidding_round_2' && (
        <div className="my-3">
          <p className="text-xs text-gray-300 mb-2">اختر لون الحكم المطلوب:</p>
          <div className="grid grid-cols-4 gap-2">
            {suits.map((s) => {
              const isFloorSuit = Boolean(floorCard && s === floorCard.suit);
              const isSelected = selectedSuit === s;
              const isRed = s === 'hearts' || s === 'diamonds';

              return (
                <button
                  key={s}
                  type="button"
                  disabled={isFloorSuit}
                  onClick={() => setSelectedSuit(s)}
                  className={`py-2 px-1 rounded-lg border text-sm font-bold flex flex-col items-center gap-1 transition-all ${
                    isFloorSuit
                      ? 'opacity-30 border-gray-700 bg-black/20 cursor-not-allowed'
                      : isSelected
                      ? 'border-amber-400 bg-amber-500/20 text-white shadow-md'
                      : 'border-white/10 hover:border-white/30 bg-white/5 text-gray-200'
                  }`}
                >
                  <span className={`text-lg ${isRed ? 'text-red-400' : 'text-slate-200'}`}>
                    {SUIT_SYMBOLS[s]}
                  </span>
                  <span className="text-[11px] truncate">{SUIT_NAMES_AR[s].split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-4">
        {/* Pass Button */}
        <button
          type="button"
          onClick={() => onBid('pass')}
          className="py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-600 text-gray-200 font-bold text-sm transition-all hover:scale-105 active:scale-95"
        >
          بس (طوّف)
        </button>

        {/* Hokom Button */}
        <button
          type="button"
          onClick={() =>
            onBid('hokom', phase === 'bidding_round_1' ? floorCard?.suit : selectedSuit)
          }
          className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 border border-emerald-400/40 text-white font-bold text-sm shadow-lg transition-all hover:scale-105 active:scale-95"
        >
          حكم ⚔️
        </button>

        {/* Sun Button */}
        <button
          type="button"
          onClick={() => onBid('sun')}
          className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 border border-amber-300/40 text-white font-bold text-sm shadow-lg transition-all hover:scale-105 active:scale-95"
        >
          صن ☀️
        </button>
      </div>
    </div>
  );
};
