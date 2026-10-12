import React, { useState } from 'react';

export const FaqPage: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'هل اللعبة مجانية وهل يمكنني لعب البلوت بدون اشتراك؟',
      a: 'نعم بالكامل! اللعب الأساسي والمباريات السريعة، غرف الأصدقاء، وتدريب الكمبيوتر كلها مجانية 100% بدون أي رسوم. اشتراك ديوان بلس اختياري تماماً للتخصيص الشكلي وإحصائيات متقدمة فقط.',
    },
    {
      q: 'هل كروت اللعب تعتمد على حظ أو دفع للفوز (Pay-to-Win)؟',
      a: 'مستحيل تماماً في ديوان البلوت. خوارزمية التوزيع مشفرة وعشوائية 100% تطبق معيار Fisher-Yates. لا نبيع أي أوراق قوية، ولا نتدخل في توزيع الأوراق لأي مشترك على الإطلاق.',
    },
    {
      q: 'ما هي الأجهزة والمتصفحات المدعومة؟',
      a: 'ديوان البلوت يعمل بسلاسة على جميع الهواتف الذكية (آيفون Safari، أندرويد Chrome)، والأجهزة اللوحية (iPad)، وأجهزة الكمبيوتر بدون الحاجة لأي تحميل أو تثبيت برامج.',
    },
    {
      q: 'كيف تحتسب الخسارة في الصن وفي الحكم؟',
      a: 'في الصن: إذا حصل المشتري على 70 نقطة أو أقل، يعتبر خاسراً وتذهب الـ 26 أبنط + المشاريع للخصم. في الحكم: إذا حصل المشتري على 81 نقطة أو أقل، يعتبر خاسراً وتذهب الـ 16 أبنط + المشاريع للخصم.',
    },
    {
      q: 'كيف يمكنني إلغاء اشتراك ديوان بلس؟',
      a: 'بكل شفافية وسهولة من صفحة "إدارة الاشتراك" بضغطة زر واحدة تلغي التجديد التلقائي فوراً دون الحاجة لمراسلة الدعم أو ملء استبيانات معقدة.',
    },
    {
      q: 'هل توجد مراهنات أو ألعاب قمار بالمنصة؟',
      a: 'لا نهائياً. ديوان البلوت لعبة مهارة وذكاء شعبية وتراثية ولا تحتوي على أي شكل من أشكال المراهنات المالية أو الجوائز النقدية المحرمة.',
    },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 select-none space-y-8">
      <div className="text-center">
        <h1 className="text-2xl sm:text-4xl font-black text-white mb-2">
          الأسئلة الشائعة وإجاباتها ❓
        </h1>
        <p className="text-xs sm:text-sm text-gray-400">
          إجابات واضحة وموثقة لكل ما يهمك حول نظام اللعب، النزاهة، والاشتراكات
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className="bg-[#0f2319] border border-[#c5a059]/30 rounded-2xl overflow-hidden transition-all shadow-md"
            >
              <button
                type="button"
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full text-right p-4 sm:p-5 flex justify-between items-center font-bold text-sm sm:text-base text-gray-100 hover:text-amber-300 transition-colors"
              >
                <span>{faq.q}</span>
                <span className="text-amber-400 text-lg mr-2">{isOpen ? '−' : '+'}</span>
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-gray-300 leading-relaxed border-t border-white/5 animate-in fade-in duration-200">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
