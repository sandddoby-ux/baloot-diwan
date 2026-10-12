import React from 'react';
import { Card } from '../../engine/types';
import { SUIT_SYMBOLS } from '../../engine/deck';

interface CardViewProps {
  card: Card;
  onClick?: () => void;
  isPlayable?: boolean;
  isHighlighted?: boolean;
  isSmall?: boolean;
  className?: string;
}

export const CardView: React.FC<CardViewProps> = ({
  card,
  onClick,
  isPlayable = true,
  isHighlighted = false,
  isSmall = false,
  className = '',
}) => {
  const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
  const symbol = SUIT_SYMBOLS[card.suit];
  const suitColorClass = isRed ? 'text-red-600' : 'text-slate-900';

  return (
    <button
      type="button"
      onClick={isPlayable ? onClick : undefined}
      disabled={!isPlayable}
      className={`relative select-none rounded-lg sm:rounded-xl bg-gradient-to-b from-[#fdfbf7] to-[#f3ece0] border border-[#d6c7b2] transition-all duration-200 transform
        ${
          isSmall
            ? 'w-9 h-13 sm:w-11 sm:h-16 text-[10px] sm:text-xs'
            : 'w-11 h-16 sm:w-16 sm:h-24 md:w-19 md:h-28 lg:w-21 lg:h-30 text-xs sm:text-sm'
        }
        ${
          isPlayable
            ? 'hover:-translate-y-3 sm:hover:-translate-y-4 active:-translate-y-2 hover:shadow-2xl hover:border-amber-400 hover:z-30 cursor-pointer shadow-md'
            : 'opacity-90 cursor-default shadow-sm'
        }
        ${isHighlighted ? 'ring-2 ring-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.5)] z-10' : ''}
        ${className}`}
      style={{
        boxShadow: isPlayable
          ? '0 4px 12px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.85)'
          : '0 2px 6px rgba(0,0,0,0.3)',
      }}
    >
      {/* Top Left Rank & Suit */}
      <div className={`absolute top-0.5 sm:top-1 left-1 sm:left-1.5 flex flex-col items-center leading-none font-bold ${suitColorClass}`}>
        <span className="text-[10px] sm:text-xs md:text-sm font-black">{card.rank}</span>
        <span className="text-[9px] sm:text-[11px] md:text-xs leading-none">{symbol}</span>
      </div>

      {/* Center Suit Graphic */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className={`font-serif select-none pointer-events-none transition-transform ${suitColorClass} ${
            isSmall
              ? 'text-sm sm:text-lg opacity-85'
              : 'text-xl sm:text-3xl md:text-4xl opacity-90'
          }`}
        >
          {symbol}
        </span>
      </div>

      {/* Bottom Right Rank & Suit (Inverted) */}
      <div
        className={`absolute bottom-0.5 sm:bottom-1 right-1 sm:right-1.5 flex flex-col items-center leading-none font-bold rotate-180 ${suitColorClass}`}
      >
        <span className="text-[10px] sm:text-xs md:text-sm font-black">{card.rank}</span>
        <span className="text-[9px] sm:text-[11px] md:text-xs leading-none">{symbol}</span>
      </div>
    </button>
  );
};

export const CardBack: React.FC<{ isSmall?: boolean; className?: string }> = ({
  isSmall = false,
  className = '',
}) => {
  return (
    <div
      className={`relative select-none rounded-lg sm:rounded-xl bg-gradient-to-br from-[#1e3a2e] to-[#0d1e17] border border-[#c5a059] sm:border-2 shadow-md flex items-center justify-center overflow-hidden
        ${isSmall ? 'w-8 h-12 sm:w-10 sm:h-14' : 'w-10 h-14 sm:w-14 sm:h-20 md:w-16 md:h-24'}
        ${className}`}
      style={{
        boxShadow: '0 3px 8px rgba(0,0,0,0.4), inset 0 0 8px rgba(0,0,0,0.6)',
      }}
    >
      {/* Ornamental pattern */}
      <div className="w-[82%] h-[84%] rounded border border-[#c5a059]/40 flex items-center justify-center bg-[#152e24]">
        <div className="text-[#c5a059] text-[10px] sm:text-xs font-serif opacity-70">⚜️</div>
      </div>
    </div>
  );
};
