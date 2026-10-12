import React from 'react';

interface BalootLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  showText?: boolean;
  withGlow?: boolean;
  className?: string;
  onClick?: () => void;
}

const SIZE_MAP = {
  xs: { badge: 'w-7 h-7', title: 'text-xs', subtitle: 'text-[9px]' },
  sm: { badge: 'w-9 h-9', title: 'text-sm', subtitle: 'text-[10px]' },
  md: { badge: 'w-12 h-12', title: 'text-lg', subtitle: 'text-xs' },
  lg: { badge: 'w-16 h-16', title: 'text-xl', subtitle: 'text-xs' },
  xl: { badge: 'w-24 h-24', title: 'text-3xl', subtitle: 'text-sm' },
  hero: { badge: 'w-32 h-32 sm:w-40 sm:h-40', title: 'text-3xl sm:text-4xl', subtitle: 'text-xs sm:text-sm' },
};

export const BalootLogo: React.FC<BalootLogoProps> = ({
  size = 'md',
  showText = false,
  withGlow = true,
  className = '',
  onClick,
}) => {
  const currentSize = SIZE_MAP[size] || SIZE_MAP.md;

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-3 select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* 3D Luxury Gold & Emerald Emblem */}
      <div className={`relative ${currentSize.badge} shrink-0 group`}>
        {/* Ambient Pulsing Gold Glow */}
        {withGlow && (
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400/40 via-yellow-500/20 to-amber-600/40 blur-md group-hover:blur-lg transition-all duration-300 pointer-events-none" />
        )}

        {/* Embedded Vector Emblem SVG */}
        <div className="relative w-full h-full rounded-full p-[2px] bg-gradient-to-br from-[#ffe89e] via-[#c5a059] to-[#7c5208] shadow-[0_4px_16px_rgba(0,0,0,0.6)]">
          <div className="w-full h-full rounded-full bg-[#0a1e15] overflow-hidden flex items-center justify-center border border-amber-300/30">
            <img
              src="/logo.svg"
              alt="شعار ديوان البلوت"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] transform group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>

        {/* Mini Jewel Accent */}
        <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-300 shadow-[0_0_6px_#f59e0b] ring-1 ring-amber-500/80" />
      </div>

      {/* Typography Label */}
      {showText && (
        <div className="flex flex-col text-right justify-center">
          <span
            className={`font-black tracking-wide leading-tight bg-gradient-to-r from-amber-200 via-amber-300 to-yellow-100 bg-clip-text text-transparent drop-shadow-sm ${currentSize.title}`}
          >
            ديوان البلوت
          </span>
          <span
            className={`font-bold tracking-widest uppercase text-emerald-400/90 leading-tight ${currentSize.subtitle}`}
          >
            BALOOT DIWAN • الخليج
          </span>
        </div>
      )}
    </div>
  );
};
