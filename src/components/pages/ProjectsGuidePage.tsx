import React from 'react';

export const ProjectsGuidePage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 select-none space-y-8">
      <div className="text-center">
        <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full inline-block mb-3">
          🃏 أسرار ونقاط المشاريع
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-white mb-2">
          دليل مشاريع البلوت: سرة، خمسين، مية، و400
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 max-w-xl mx-auto">
          المشاريع هي بطاقات الربح الخفية التي قد تقلب موازين الصكة لصالح فريقك وتختصر طريق الوصول للـ 152
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sira Card */}
        <div className="bg-[#0f2319] border border-[#c5a059]/30 rounded-3xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-black text-amber-300">1. مشروع السرة (Sira)</h2>
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold">
              20 نقطة
            </span>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed mb-4">
            ثلاث أوراق متتالية من نفس اللون (مثل: 7-8-9 أو 10-J-Q أو Q-K-A).
          </p>
          <div className="bg-black/30 p-3 rounded-xl border border-white/5 text-xs text-gray-300 space-y-1">
            <p>• قيمة الأبناط في الصن: <strong className="text-amber-300">4 أبناط</strong> (20 / 5).</p>
            <p>• قيمة الأبناط في الحكم: <strong className="text-emerald-300">2 أبنط</strong> (20 / 10).</p>
          </div>
        </div>

        {/* Khamsin Card */}
        <div className="bg-[#0f2319] border border-[#c5a059]/30 rounded-3xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-black text-amber-300">2. مشروع الخمسين (Khamsin)</h2>
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold">
              50 نقطة
            </span>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed mb-4">
            أربع أوراق متتالية من نفس اللون (مثل: 8-9-10-J أو 10-J-Q-K).
          </p>
          <div className="bg-black/30 p-3 rounded-xl border border-white/5 text-xs text-gray-300 space-y-1">
            <p>• قيمة الأبناط في الصن: <strong className="text-amber-300">10 أبناط</strong> (50 / 5).</p>
            <p>• قيمة الأبناط في الحكم: <strong className="text-emerald-300">5 أبناط</strong> (50 / 10).</p>
          </div>
        </div>

        {/* Mia Card */}
        <div className="bg-[#0f2319] border border-[#c5a059]/30 rounded-3xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-black text-amber-300">3. مشروع المية (Mia)</h2>
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold">
              100 نقطة
            </span>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed mb-4">
            خمس أوراق متتالية من نفس اللون، أو أربع أوراق متماثلة من رتب: 10 أو أولاد أو بنات أو شيبان أو إيكات (في الحكم).
          </p>
          <div className="bg-black/30 p-3 rounded-xl border border-white/5 text-xs text-gray-300 space-y-1">
            <p>• قيمة الأبناط في الصن: <strong className="text-amber-300">20 أبنط</strong> (100 / 5).</p>
            <p>• قيمة الأبناط في الحكم: <strong className="text-emerald-300">10 أبناط</strong> (100 / 10).</p>
          </div>
        </div>

        {/* Arba Meya Card */}
        <div className="bg-[#0f2319] border border-[#c5a059]/30 rounded-3xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-black text-amber-300">4. مشروع الأربعمية (400)</h2>
            <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold">
              400 نقطة
            </span>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed mb-4">
            أربع إيكات (4 Aces) وتكون في عقد <strong className="text-white">الصن حصراً</strong>!
          </p>
          <div className="bg-black/30 p-3 rounded-xl border border-white/5 text-xs text-gray-300 space-y-1">
            <p>• قيمة الأبناط في الصن: <strong className="text-amber-300">40 أبنط كاملة</strong> تضاف لفريقك مباشرة!</p>
          </div>
        </div>
      </div>

      {/* Priority Rules */}
      <div className="bg-black/30 border border-white/10 rounded-3xl p-6 text-xs sm:text-sm text-gray-300 space-y-3">
        <h3 className="font-black text-amber-300 text-base">قاعدة أولوية المشاريع (من يأخذ المشروع؟):</h3>
        <p>
          إذا أعلن الفريقان عن مشاريع في نفس الجولة، لا تحتسب المشاريع إلا للفريق صاحب <strong className="text-white">المشروع الأكبر</strong>:
        </p>
        <ul className="list-disc list-inside space-y-1 text-gray-400">
          <li>المية تسقط الخمسين والسرة.</li>
          <li>الخمسين تسقط السرة.</li>
          <li>عند تساوي نوع المشروع (مثلاً سرة ضد سرة)، يكسب الفريق صاحب السرة ذات الورقة الأعلى (سرة تنتهي بإيكة أعلى من سرة تنتهي بشايب).</li>
          <li>إن تساوت رتبة الورقة، يلغى المشروعان في الصن ولا يحتسب لأحد، أما في الحكم فيفوز صاحب لون الحكم.</li>
        </ul>
      </div>
    </div>
  );
};
