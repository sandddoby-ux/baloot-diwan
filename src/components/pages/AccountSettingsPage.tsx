import React, { useState } from 'react';
import { getUserProfile, saveUserProfile } from '../../services/storage';

export const AccountSettingsPage: React.FC = () => {
  const [user, setUser] = useState(getUserProfile());
  const [savedToast, setSavedToast] = useState(false);

  const tableThemes = [
    { id: 'emerald', label: 'الزمردي التراثي 🌲', color: 'from-[#0e382b] to-[#072419]', requiresPlus: false },
    { id: 'royal_blue', label: 'النيلي الملكي 💎', color: 'from-[#12284a] to-[#08152b]', requiresPlus: true },
    { id: 'majlis_crimson', label: 'العنابي النجدي 🍷', color: 'from-[#421319] to-[#24080c]', requiresPlus: true },
    { id: 'onyx_gold', label: 'الأسود والذهب الفاخر ⚜️', color: 'from-[#1a1815] to-[#0d0c0b]', requiresPlus: true },
  ];

  const cardBacks = [
    { id: 'heritage_gold', label: 'الذهب التراثي ⚜️', border: 'border-amber-400', requiresPlus: false },
    { id: 'royal_green', label: 'الأخضر السعودي 🇸🇦', border: 'border-emerald-500', requiresPlus: false },
    { id: 'classic_blue', label: 'الأزرق الكلاسيكي 🌊', border: 'border-blue-500', requiresPlus: true },
    { id: 'falcon_crimson', label: 'الصقر العنابي 🦅', border: 'border-rose-500', requiresPlus: true },
  ];

  const handleSelectTableTheme = (themeId: 'emerald' | 'royal_blue' | 'majlis_crimson' | 'onyx_gold') => {
    const updated = { ...user, tableTheme: themeId };
    setUser(updated);
    saveUserProfile(updated);
    showToast();
  };

  const handleSelectCardBack = (backId: 'heritage_gold' | 'royal_green' | 'classic_blue' | 'falcon_crimson') => {
    const updated = { ...user, cardBackTheme: backId };
    setUser(updated);
    saveUserProfile(updated);
    showToast();
  };

  const showToast = () => {
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 select-none space-y-8">
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">
          إعدادات وتخصيص الطاولة 🎨
        </h1>
        <p className="text-xs sm:text-sm text-gray-400">
          خصص مظهر طاولتك التراثية ولون ظهر ورق اللعب المفضل لديك
        </p>
      </div>

      {savedToast && (
        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs text-center animate-in fade-in">
          ✓ تم حفظ التفضيلات بنجاح!
        </div>
      )}

      {/* Table Felt Theme */}
      <div className="bg-[#0f2319] border border-[#c5a059]/30 rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="flex justify-between items-center">
          <h2 className="text-base font-bold text-amber-200">لون جوخ الطاولة (Table Felt):</h2>
          {!user.isSubscriber && (
            <span className="text-[11px] text-amber-400">
              * الثيمات الملكية متاحة لمشتركي ديوان بلس
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {tableThemes.map((t) => {
            const isSelected = user.tableTheme === t.id;
            const isLocked = t.requiresPlus && !user.isSubscriber;

            return (
              <button
                key={t.id}
                type="button"
                disabled={isLocked}
                onClick={() => handleSelectTableTheme(t.id as typeof user.tableTheme)}
                className={`p-4 rounded-2xl border text-center transition-all relative ${
                  isSelected
                    ? 'border-amber-400 ring-2 ring-amber-400 shadow-lg'
                    : 'border-white/10 hover:border-white/30'
                } ${isLocked ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className={`w-full h-12 rounded-xl bg-gradient-to-b ${t.color} mb-2 shadow-inner border border-white/10`} />
                <span className="text-xs font-bold text-gray-200 block truncate">{t.label}</span>
                {isLocked && (
                  <span className="text-[10px] text-amber-400 font-bold block mt-1">🔒 بلس</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Card Back Theme */}
      <div className="bg-[#0f2319] border border-[#c5a059]/30 rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="flex justify-between items-center">
          <h2 className="text-base font-bold text-amber-200">تصميم ظهر ورق اللعب (Card Backs):</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {cardBacks.map((b) => {
            const isSelected = user.cardBackTheme === b.id;
            const isLocked = b.requiresPlus && !user.isSubscriber;

            return (
              <button
                key={b.id}
                type="button"
                disabled={isLocked}
                onClick={() => handleSelectCardBack(b.id as typeof user.cardBackTheme)}
                className={`p-4 rounded-2xl border text-center transition-all ${
                  isSelected
                    ? 'border-amber-400 ring-2 ring-amber-400 shadow-lg'
                    : 'border-white/10 hover:border-white/30'
                } ${isLocked ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className={`w-12 h-16 mx-auto rounded-lg bg-[#14281f] border-2 ${b.border} mb-2 flex items-center justify-center text-xs text-amber-400 shadow-md`}>
                  ⚜️
                </div>
                <span className="text-xs font-bold text-gray-200 block truncate">{b.label}</span>
                {isLocked && (
                  <span className="text-[10px] text-amber-400 font-bold block mt-1">🔒 بلس</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
