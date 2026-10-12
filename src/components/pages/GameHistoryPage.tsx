import React, { useState } from 'react';
import { getGameHistory } from '../../services/storage';

export const GameHistoryPage: React.FC = () => {
  const [history] = useState(getGameHistory());

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 select-none space-y-6">
      <div className="text-center">
        <h1 className="text-2xl sm:text-4xl font-black text-white mb-2">
          سجل الصكات والمباريات السابقة 📜
        </h1>
        <p className="text-xs sm:text-sm text-gray-400">
          استعرض تفاصيل المباريات التي لعبتها، نتائج القيد، وتفاصيل أداء فريقك
        </p>
      </div>

      <div className="space-y-3">
        {history.length === 0 ? (
          <div className="bg-[#0f2319] border border-white/10 rounded-2xl p-8 text-center text-gray-400 text-sm">
            لا توجد مباريات سابقة مسجلة بعد. ابدأ أول صكة الآن!
          </div>
        ) : (
          history.map((h) => {
            const isWin = h.result === 'win';
            return (
              <div
                key={h.id}
                className={`bg-[#0f2319] border rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all shadow-md ${
                  isWin ? 'border-emerald-500/40 hover:border-emerald-400' : 'border-rose-500/30 hover:border-rose-400'
                }`}
              >
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-black shrink-0 ${
                      isWin ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                    }`}
                  >
                    {isWin ? '🏆' : '✕'}
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-black ${isWin ? 'text-emerald-300' : 'text-rose-300'}`}>
                        {isWin ? 'فوز مستحق بالصكة' : 'خسارة في القيد'}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-black/40 text-gray-300 border border-white/5">
                        {h.mode === 'quick' ? 'مباراة أونلاين' : h.mode === 'private' ? 'ديوانية خاصة' : 'تدريب كمبيوتر'}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 block mt-0.5">
                      خويّك: {h.partnerName} • التاريخ: {h.date} • العقد الأبرز: {h.contractType === 'sun' ? 'صن ☀️' : 'حكم ⚔️'}
                    </span>
                  </div>
                </div>

                {/* Final Score */}
                <div className="bg-black/40 px-5 py-2.5 rounded-xl border border-white/5 text-center shrink-0">
                  <span className="text-[10px] text-gray-400 block">نتيجة القيد النهائية (لنا / لهم):</span>
                  <span className="text-base sm:text-lg font-black text-amber-300">
                    {h.finalScoreUs} - {h.finalScoreThem}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
