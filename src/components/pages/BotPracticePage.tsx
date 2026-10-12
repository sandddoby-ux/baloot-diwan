import React from 'react';
import { useGame } from '../../context/GameContext';

interface BotPracticeProps {
  onStartGame: (mode: 'bot') => void;
}

export const BotPracticePage: React.FC<BotPracticeProps> = ({ onStartGame }) => {
  const { botDifficulty, setBotDifficulty } = useGame();

  const difficulties = [
    {
      id: 'beginner' as const,
      title: 'مستوى مبتدئ 🟢',
      description: 'يلعب بحذر وهدوء، مناسب لمن يتعلم أصول الصن والحكم وقواعد الأكلات الأساسية.',
      badge: 'للمبتدئين',
    },
    {
      id: 'intermediate' as const,
      title: 'مستوى متوسط 🟡',
      description: 'يدير الأوراق بشكل منطقي، يدق في الوقت المناسب، ويعرف كيف يساعد خويّه (اللاعب المتوازن).',
      badge: 'الأكثر شعبية',
    },
    {
      id: 'expert' as const,
      title: 'مستوى محترف 🔴',
      description: 'يحسب الأوراق بدقة، يحفظ كروت الخصم، يسحب الحكم في الوقت القاتل، ويستغل كبوت الجولة.',
      badge: 'للمحترفين',
    },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 select-none">
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">
          التدريب ضد روبوتات الديوان 🤖
        </h1>
        <p className="text-xs sm:text-sm text-gray-400">
          تدرّب مع 3 روبوتات ذكية تلعب بقواعد البلوت الرسمية 100%. بدون وقت انتظار وبدون أي ضغوطات.
        </p>
      </div>

      <div className="space-y-4 mb-8">
        <p className="text-xs font-bold text-gray-300">اختر مستوى صعوبة وذكاء الروبوتات:</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {difficulties.map((diff) => {
            const isSelected = botDifficulty === diff.id;
            return (
              <div
                key={diff.id}
                onClick={() => setBotDifficulty(diff.id)}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-amber-400 bg-amber-500/10 shadow-[0_0_20px_rgba(251,191,36,0.2)]'
                    : 'border-white/10 bg-[#0f2119] hover:border-white/30'
                }`}
              >
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-black text-gray-100">{diff.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-black/40 text-gray-400 border border-white/5">
                      {diff.badge}
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">{diff.description}</p>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-amber-400 bg-amber-400' : 'border-gray-500'
                    }`}
                  >
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                  </div>
                  <span className="text-xs font-bold text-gray-400">
                    {isSelected ? 'تم الاختيار' : 'تحديد'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bot Personas Preview */}
      <div className="bg-black/30 border border-[#c5a059]/20 rounded-2xl p-5 mb-8">
        <h3 className="text-xs font-bold text-amber-300 mb-3">تشكيلة الطاولة التدريبية:</h3>
        <div className="grid grid-cols-3 gap-3 text-center text-xs">
          <div className="bg-[#12281e] p-3 rounded-xl border border-white/5">
            <span className="text-2xl block mb-1">🧕🏻</span>
            <strong className="text-emerald-300 block">فيصل المطيري</strong>
            <span className="text-[10px] text-gray-400">خويّك (المساعد)</span>
          </div>
          <div className="bg-[#12281e] p-3 rounded-xl border border-white/5">
            <span className="text-2xl block mb-1">🧔🏻</span>
            <strong className="text-rose-300 block">سعود الدوسري</strong>
            <span className="text-[10px] text-gray-400">خصم (يمينك)</span>
          </div>
          <div className="bg-[#12281e] p-3 rounded-xl border border-white/5">
            <span className="text-2xl block mb-1">👳🏻</span>
            <strong className="text-rose-300 block">بدر الشمري</strong>
            <span className="text-[10px] text-gray-400">خصم (يسارك)</span>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onStartGame('bot')}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-black font-black text-base shadow-xl transition-all hover:scale-[1.02] cursor-pointer"
      >
        بدء التدريب الآن 🚀
      </button>
    </div>
  );
};
