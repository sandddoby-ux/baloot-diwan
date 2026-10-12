import React from 'react';
import { BalootLogo } from '../common/BalootLogo';

interface FooterProps {
  onSelectTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab }) => {
  return (
    <footer className="bg-[#06100c] border-t border-[#c5a059]/20 text-gray-400 text-xs py-10 px-4 sm:px-6 lg:px-8 select-none">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-right">
        {/* Brand info */}
        <div>
          <div className="mb-3">
            <BalootLogo size="sm" showText={true} withGlow={false} onClick={() => onSelectTab('home')} />
          </div>
          <p className="text-xs text-gray-400 leading-relaxed mb-4">
            المنصة العربية الأولى المتخصصة في تقديم لعبة البلوت الشعبية السعودية بأصولها وقوانينها الرسمية، في بيئة رقمية آمنة وعادلة تضمن النزاهة 100%.
          </p>
          <div className="flex items-center gap-2 text-[11px] text-emerald-400">
            <span>🛡️</span>
            <span>لعبة مهارة وذكاء خالية تماماً من المراهنات</span>
          </div>
        </div>

        {/* Quick Game Navigation */}
        <div>
          <h4 className="text-sm font-bold text-gray-200 mb-3 border-b border-white/10 pb-1">
            أنماط اللعب
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <button onClick={() => onSelectTab('play')} className="hover:text-amber-300 transition-colors">
                مباراة سريعة أونلاين
              </button>
            </li>
            <li>
              <button onClick={() => onSelectTab('practice')} className="hover:text-amber-300 transition-colors">
                تدريب ضد الروبوتات الذكية
              </button>
            </li>
            <li>
              <button onClick={() => onSelectTab('rooms')} className="hover:text-amber-300 transition-colors">
                إنشاء ديوانية خاصة للأصدقاء
              </button>
            </li>
            <li>
              <button onClick={() => onSelectTab('challenges')} className="hover:text-amber-300 transition-colors">
                التحديات والجوائز اليومية
              </button>
            </li>
            <li>
              <button onClick={() => onSelectTab('leaderboard')} className="hover:text-amber-300 transition-colors">
                قائمة متصدري الموسم
              </button>
            </li>
          </ul>
        </div>

        {/* Educational SEO & Rules Guides */}
        <div>
          <h4 className="text-sm font-bold text-gray-200 mb-3 border-b border-white/10 pb-1">
            دليل وقوانين البلوت
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <button onClick={() => onSelectTab('learn')} className="hover:text-amber-300 transition-colors">
                كيف تلعب البلوت (دليل المبتدئين)
              </button>
            </li>
            <li>
              <button onClick={() => onSelectTab('rules')} className="hover:text-amber-300 transition-colors">
                قوانين الصن والحكم الرسمية
              </button>
            </li>
            <li>
              <button onClick={() => onSelectTab('scoring')} className="hover:text-amber-300 transition-colors">
                حاسبة نقاط ونشرات البلوت
              </button>
            </li>
            <li>
              <button onClick={() => onSelectTab('projects_guide')} className="hover:text-amber-300 transition-colors">
                شرح المشاريع (سرة، خمسين، مية)
              </button>
            </li>
            <li>
              <button onClick={() => onSelectTab('strategies')} className="hover:text-amber-300 transition-colors">
                تكتيكات واحتراف قيد 152
              </button>
            </li>
          </ul>
        </div>

        {/* Legal, Payment & Support */}
        <div>
          <h4 className="text-sm font-bold text-gray-200 mb-3 border-b border-white/10 pb-1">
            الاشتراكات والسياسات
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <button onClick={() => onSelectTab('subscription')} className="hover:text-amber-300 transition-colors">
                باقات ديوان بلس المميزة
              </button>
            </li>
            <li>
              <button onClick={() => onSelectTab('faq')} className="hover:text-amber-300 transition-colors">
                الأسئلة الشائعة وإجاباتها
              </button>
            </li>
            <li>
              <button onClick={() => onSelectTab('contact')} className="hover:text-amber-300 transition-colors">
                الدعم الفني وخدمة العملاء
              </button>
            </li>
            <li>
              <button onClick={() => onSelectTab('legal')} className="hover:text-amber-300 transition-colors">
                شروط الاستخدام وسياسة الخصوصية
              </button>
            </li>
            <li>
              <button onClick={() => onSelectTab('delete_account')} className="text-rose-400 hover:text-rose-300 transition-colors">
                طلب حذف الحساب والبيانات
              </button>
            </li>
          </ul>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2">
            <span className="text-[10px] text-gray-500">طرق الدفع المدعومة:</span>
            <span className="text-xs">💳 مدى • Apple Pay • Visa</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-500">
        <div>
          جميع الحقوق محفوظة © {new Date().getFullYear()} ديوان البلوت (Baloot Diwan).
        </div>
        <div className="mt-2 sm:mt-0 text-gray-400">
          صُممت اللعبة لخدمة اللاعبين في المملكة العربية السعودية، الكويت، الإمارات، قطر، والبحرين.
        </div>
      </div>
    </footer>
  );
};
