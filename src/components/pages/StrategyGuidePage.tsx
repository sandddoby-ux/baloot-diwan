import React from 'react';

export const StrategyGuidePage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 select-none space-y-8">
      <div className="text-center">
        <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full inline-block mb-3">
          🧠 ذكاء وتكتيكات البلوت
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-white mb-2">
          استراتيجيات البلوت المتقدمة (تكتيكات الشيبان)
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 max-w-xl mx-auto">
          البلوت ليست حظاً، بل قراءة أوراق، إشارات صامتة، وتناغم دقيق مع شريكك في الطاولة
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-[#0f2319] border border-[#c5a059]/30 rounded-3xl p-6 sm:p-8 space-y-3">
          <h2 className="text-lg font-black text-amber-300">1. مبدأ "تزبيط الخوي" (دعم الشريك بالنقاط)</h2>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            عندما يلعب خويّك ورقة قوية ضامنة للأكلة (مثل إيكة في الصن أو ولد في الحكم)، وأنت اللاعب الأخير، لا ترمي ورقة صغيرة عديمة القيمة! تخلص من العشرات والإيكات الأخرى إن كنت لا تضمن أكلها لاحقاً لترفع مجموع نقاط فوز خويّك إلى أقصى حد.
          </p>
        </div>

        <div className="bg-[#0f2319] border border-[#c5a059]/30 rounded-3xl p-6 sm:p-8 space-y-3">
          <h2 className="text-lg font-black text-amber-300">2. متى تشتري الصن ومتى تمرر؟</h2>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            لا تشترِ الصن إلا إذا كنت تملك على الأقل إيكتين قادرتين على فرض السيطرة، أو إيكة وعشرتين مسنودتين بشيبان. الشراء في الصن بدون أوراق أمان يعرضك لخطر الخسارة (Khasara) ويمنح الخصم 26 أبنط مجانية.
          </p>
        </div>

        <div className="bg-[#0f2319] border border-[#c5a059]/30 rounded-3xl p-6 sm:p-8 space-y-3">
          <h2 className="text-lg font-black text-amber-300">3. سحب الحكم في التوقيت القاتل</h2>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            إذا كنت أنت مشتري الحكم وتملك ولد الحكم وتسعته، فابدأ فوراً بسحب الحكم من أيدي الخصوم في الأكلات الأولى لتجريدهم من أسلحتهم الدفاعية وتأمين مرور إيكاتك العادية دون أن يقطعوها بالدق.
          </p>
        </div>

        <div className="bg-[#0f2319] border border-[#c5a059]/30 rounded-3xl p-6 sm:p-8 space-y-3">
          <h2 className="text-lg font-black text-amber-300">4. حساب الكروت المسحوبة (Card Counting)</h2>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            اللاعب المحترف لا يرفع عينه عن الورق الملعوب. راقب أين ذهبت الإيكات الأربعة، ومن رمى الشايب، وهل نفد لون معين من يد الخصم. معرفة الورق المتبقي في الجولة الثامنة يضمن لك خطف الأكلة الأخيرة (الأرض) التي تحسم النشرة.
          </p>
        </div>
      </div>
    </div>
  );
};
