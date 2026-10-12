import React from 'react';

interface LearnBalootProps {
  onStartGame: (mode: 'training' | 'bot') => void;
  onSelectTab: (tab: string) => void;
}

export const LearnBalootPage: React.FC<LearnBalootProps> = ({ onStartGame, onSelectTab }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 select-none space-y-10">
      {/* Header */}
      <div className="text-center">
        <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full inline-block mb-3">
          🎓 البوابة التعليمية الشاملة
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-white mb-3">
          تعلم لعبة البلوت من الصفر حتى الاحتراف
        </h1>
        <p className="text-xs sm:text-sm text-gray-300 max-w-2xl mx-auto leading-relaxed">
          دليلك السريع والمبسط لفهم أساسيات البلوت وقوانينها بدون تعقيد، مع إمكانية التطبيق العملي فوراً في نمط التدريب التفاعلي.
        </p>
      </div>

      {/* Step by step cards */}
      <div className="space-y-6">
        {/* Step 1 */}
        <div className="bg-[#0f2319] border border-[#c5a059]/30 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row gap-6 items-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-300 text-3xl font-black flex items-center justify-center shrink-0">
            ١
          </div>
          <div className="flex-1 text-right">
            <h2 className="text-lg font-bold text-amber-200 mb-2">الفكرة الأساسية والهدف من اللعبة</h2>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              البلوت لعبة أوراق شعبية ذكية يلعبها 4 أشخاص (فريقان متنافسان، كل لاعب يقابل خويّه). الهدف هو جمع أكبر عدد ممكن من "الأكلات" التي تحتوي على أوراق ذات نقاط عالية (أبناط)، حتى يصل فريقك إلى 152 نقطة (القيد) ويفوز بالصكة.
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="bg-[#0f2319] border border-[#c5a059]/30 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row gap-6 items-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-300 text-3xl font-black flex items-center justify-center shrink-0">
            ٢
          </div>
          <div className="flex-1 text-right">
            <h2 className="text-lg font-bold text-amber-200 mb-2">ما هو الفرق بين الصن والحكم؟</h2>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-3">
              هذا هو السؤال الأهم لكل مبتدئ في البلوت:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                <strong className="text-amber-400 block mb-1">عقد الصن (Sun):</strong>
                <span>لا يوجد لون مميز؛ الأقوى من نفس اللون الملعوب هو الآكل دائماً. والإيكة (A) هي الملكة.</span>
              </div>
              <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                <strong className="text-emerald-400 block mb-1">عقد الحكم (Hokom):</strong>
                <span>يوجد لون متسيد (الحكم)؛ وأوراق الحكم تأكل أي لون آخر، وولد الحكم (J) هو الأقوى بلا منازع!</span>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="bg-[#0f2319] border border-[#c5a059]/30 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row gap-6 items-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-300 text-3xl font-black flex items-center justify-center shrink-0">
            ٣
          </div>
          <div className="flex-1 text-right">
            <h2 className="text-lg font-bold text-amber-200 mb-2">القاعدة الذهبية: الالتزام باللون وعدم الكسر</h2>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              عندما يلعب اللاعب الأول ورقة (مثلاً سكة ♠)، يجب على جميع اللاعبين الآخرين رمي ورقة سكة إن كانوا يملكونها! لا يجوز لك رمي أي لون آخر طالما تملك من اللون الملعوب، وإلا اعتبر ذلك حركة مخالفة وغشاً في البلوت.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Box */}
      <div className="bg-gradient-to-r from-[#173a2b] to-[#0f261c] border-2 border-[#c5a059]/40 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-2xl">
        <div className="text-4xl">💡</div>
        <h3 className="text-xl font-black text-amber-200">خير وسيلة لتعلم البلوت هي التجربة العملية!</h3>
        <p className="text-xs sm:text-sm text-gray-300 max-w-xl mx-auto leading-relaxed">
          جرب الآن النمط التفاعلي؛ سيقوم النظام بتوجيهك وتنبيهك لكل حركة شرعية مع روبوتات صبورة تساعدك على الإتقان.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            type="button"
            onClick={() => onStartGame('training')}
            className="py-3 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-sm shadow-lg transition-all"
          >
            بدء الدرس التفاعلي خطوة بخطوة 🎯
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('rules')}
            className="py-3 px-6 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm border border-white/15 transition-all"
          >
            قراءة الدليل التفصيلي الكامل 📜
          </button>
        </div>
      </div>
    </div>
  );
};
