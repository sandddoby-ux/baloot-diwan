import React from 'react';
import { BalootLogo } from '../common/BalootLogo';

interface HomePageProps {
  onSelectTab: (tab: string) => void;
  onStartGame: (mode: 'quick' | 'bot' | 'private' | 'training') => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onSelectTab, onStartGame }) => {
  return (
    <div className="space-y-16 pb-16">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-14 px-4 sm:px-6 lg:px-8 border-b border-[#c5a059]/20 bg-gradient-to-b from-[#0c2219] via-[#091a13] to-[#07130e]">
        {/* Decorative background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Centered Grand Logo Emblem */}
          <div className="flex justify-center mb-6">
            <BalootLogo size="xl" showText={false} withGlow={true} />
          </div>

          {/* Gulf Heritage Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#152e22] border border-[#c5a059]/40 text-amber-300 text-xs sm:text-sm font-bold mb-6 shadow-md">
            <span>⚜️</span>
            <span>ديوانية البلوت الرسمية الأولى في الخليج العربي</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#f7f2e7] tracking-tight leading-tight mb-4">
            العب البلوت كما يجب أن تُلعب
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-200 mt-2">
              بروح المجلس الأصيل والنزاهة التامة
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-gray-300 leading-relaxed mb-8">
            منصة سعودية وخليجية مصممة خصيصاً لعشاق الصن والحكم. خالية من الحركات التجارية المزعجة، بقوانين موثقة، ذكاء اصطناعي محترف، وغرف خاصة تجمعك مع خويّك أينما كنت.
          </p>

          {/* Core Action CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto mb-10">
            <button
              type="button"
              onClick={() => onStartGame('quick')}
              className="w-full sm:w-auto flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-[#091812] font-black text-base shadow-[0_10px_25px_rgba(245,158,11,0.4)] transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>العب الآن أونلاين</span>
              <span className="text-lg">🃏</span>
            </button>

            <button
              type="button"
              onClick={() => onStartGame('bot')}
              className="w-full sm:w-auto flex-1 py-4 px-6 rounded-2xl bg-[#142d22] hover:bg-[#1a3a2c] border border-[#c5a059]/40 text-gray-200 hover:text-white font-bold text-base transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>تدريب ضد الكمبيوتر</span>
              <span className="text-lg">🤖</span>
            </button>
          </div>

          {/* Trust Highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto text-center text-xs">
            <div className="bg-black/30 p-3 rounded-xl border border-white/5">
              <span className="text-amber-400 font-bold block text-base">32 ورقة</span>
              <span className="text-gray-400">توزيع عشوائي مشفر</span>
            </div>
            <div className="bg-black/30 p-3 rounded-xl border border-white/5">
              <span className="text-emerald-400 font-bold block text-base">صن وحكم</span>
              <span className="text-gray-400">قوانين رسمية معتمدة</span>
            </div>
            <div className="bg-black/30 p-3 rounded-xl border border-white/5">
              <span className="text-blue-400 font-bold block text-base">بدون تحميل</span>
              <span className="text-gray-400">يعمل مباشرة بالمتصفح</span>
            </div>
            <div className="bg-black/30 p-3 rounded-xl border border-white/5">
              <span className="text-purple-400 font-bold block text-base">100% عادلة</span>
              <span className="text-gray-400">لا دفع للفوز (No P2W)</span>
            </div>
          </div>
        </div>
      </section>

      {/* GAME MODES SHOWCASE */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-[#f2ede4] mb-2">
            اختر أسلوب اللعب المناسب لك
          </h2>
          <p className="text-xs sm:text-sm text-gray-400">
            سواء كنت تريد التسلية السريعة، تحدي الأصدقاء في مجلس خاص، أو التدرب لصقل مهاراتك
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Mode 1: Quick Match */}
          <div className="bg-[#0f241a] border border-[#c5a059]/25 hover:border-amber-400/60 rounded-3xl p-6 transition-all hover:-translate-y-1.5 shadow-xl flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-2xl mb-4">
                ⚡
              </div>
              <h3 className="text-lg font-black text-amber-200 mb-2">مباراة سريعة (أونلاين)</h3>
              <p className="text-xs text-gray-300 leading-relaxed mb-4">
                انضم فوراً إلى طاولة لعب سريعة مع لاعبين خليجيين حقيقيين. نظام مطابقة متكافئ وسرعة في إنجاز الجولات.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onStartGame('quick')}
              className="w-full py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs border border-amber-500/40 transition-all"
            >
              دخول مباراة سريعة ←
            </button>
          </div>

          {/* Mode 2: Private Rooms */}
          <div className="bg-[#0f241a] border border-[#c5a059]/25 hover:border-amber-400/60 rounded-3xl p-6 transition-all hover:-translate-y-1.5 shadow-xl flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-2xl mb-4">
                🚪
              </div>
              <h3 className="text-lg font-black text-emerald-200 mb-2">ديوانية خاصة (مع الربع)</h3>
              <p className="text-xs text-gray-300 leading-relaxed mb-4">
                أنشئ غرفتك الخاصة وشارك الرمز أو الرابط مع أصحابك. خصص وقت الرمية وتحكم في الطاولة بالكامل.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onSelectTab('rooms')}
              className="w-full py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-xs border border-emerald-500/40 transition-all"
            >
              إنشاء أو انضمام لغرفة ←
            </button>
          </div>

          {/* Mode 3: Bot Practice */}
          <div className="bg-[#0f241a] border border-[#c5a059]/25 hover:border-amber-400/60 rounded-3xl p-6 transition-all hover:-translate-y-1.5 shadow-xl flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-2xl mb-4">
                🤖
              </div>
              <h3 className="text-lg font-black text-blue-200 mb-2">تدريب ضد الكمبيوتر</h3>
              <p className="text-xs text-gray-300 leading-relaxed mb-4">
                تدرّب بدون أي ضغط زمني مع 3 مستويات للذكاء الاصطناعي (مبتدئ، متوسط، محترف). مثالي للممارسة وتعلم المشاريع.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onStartGame('bot')}
              className="w-full py-2.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 font-bold text-xs border border-blue-500/40 transition-all"
            >
              بدء التدريب الآن ←
            </button>
          </div>
        </div>
      </section>

      {/* WHY DIWAN BALOOT SECTION (ANTI-EXPLOIT / TRUST) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-[#122b1f] to-[#0b1b13] border border-[#c5a059]/30 rounded-3xl p-6 sm:p-10 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <span className="text-amber-400 text-xs font-bold uppercase tracking-wider block mb-2">
                فلسفة النزاهة والريادة
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-4">
                لماذا يفضل اللاعبون "ديوان البلوت" عن التطبيقات الأخرى؟
              </h2>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-6">
                نعلم تماماً ما يزعج لاعبي البلوت في المنصات التجارية: الإعلانات المفاجئة أثناء التركيز، اتهامات خوارزميات التوزيع غير العادلة، وفرض الرسوم الباهظة لمجرد إكمال اللعب. في ديوان البلوت وضعنا النزاهة أولاً.
              </p>

              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex items-start gap-3">
                  <span className="text-emerald-400 text-base">✓</span>
                  <div>
                    <strong className="text-gray-200 block">لا نبيع كروتاً قوية أو حظاً:</strong>
                    <span className="text-gray-400">اللعبة تعتمد 100% على مهارة اللاعب، قراءته للورق، وتعاونه مع خويّه.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-emerald-400 text-base">✓</span>
                  <div>
                    <strong className="text-gray-200 block">خوارزمية توزيع عشوائية نقية:</strong>
                    <span className="text-gray-400">الـ 32 ورقة يتم خلطها بخوارزمية Fisher-Yates بدون أي تدخل أو تفضيل.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-emerald-400 text-base">✓</span>
                  <div>
                    <strong className="text-gray-200 block">بدون إعلانات مقاطعة للجولات:</strong>
                    <span className="text-gray-400">لا توجد نوافذ منبثقة أو مقاطع فيديو تقطع تفكيرك أثناء الصكة.</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-black/40 border border-[#c5a059]/30 rounded-2xl p-6 text-center">
              <div className="text-4xl mb-3">🧮</div>
              <h3 className="text-base font-bold text-amber-200 mb-2">
                حاسبة ودليل البلوت الشامل
              </h3>
              <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                هل تلعب في الاستراحة وتحتاج حاسبة لحساب الأبناط، النشرات، والخسارة؟ أو تريد مراجعة القوانين الرسمية؟ وفرنا لك أدوات مجانية متكاملة.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <button
                  type="button"
                  onClick={() => onSelectTab('challenges')}
                  className="py-2 px-3.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs border border-amber-500/40 cursor-pointer"
                >
                  التحديات اليومية 🎯
                </button>
                <button
                  type="button"
                  onClick={() => onSelectTab('profile')}
                  className="py-2 px-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/10 cursor-pointer"
                >
                  إحصائيات اللاعب 📊
                </button>
                <button
                  type="button"
                  onClick={() => onSelectTab('scoring')}
                  className="py-2 px-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 font-bold text-xs border border-white/10 cursor-pointer"
                >
                  حاسبة النقاط 🧮
                </button>
                <button
                  type="button"
                  onClick={() => onSelectTab('learn')}
                  className="py-2 px-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 font-bold text-xs border border-white/10 cursor-pointer"
                >
                  دليل القوانين 📜
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEO & PLAY GUIDE SECTION (Rank #1 Google Arabic Search Strategy) */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Editorial Guide Article Card */}
        <article className="bg-[#0e2118] border border-[#c5a059]/30 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          <header className="mb-8">
            <span className="text-amber-400 font-bold text-xs sm:text-sm tracking-wide block mb-2">
              📜 دليل البلوت الشامل • محرك بحث ديوان البلوت
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight mb-3">
              لعب بلوت أون لاين بدون تحميل: دليلك لأسرع صكة مباشرة
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-3xl">
              تعتبر لعبة البلوت اللعبة الشعبية الأولى في المملكة العربية السعودية ودول الخليج العربي. مع منصة <strong>ديوان البلوت</strong>، يمكنك بدء صكة حقيقية كاملة في متصفحك مباشرة بدون الحاجة إلى تحميل تطبيقات من المتاجر أو استهلاك ذاكرة جهازك.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-black/30 border border-white/10 rounded-2xl p-5 text-right">
              <span className="text-2xl mb-2 block">⚡</span>
              <h3 className="text-base font-bold text-amber-200 mb-1.5">1. دخول فوري بدون تسجيل</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                اضغط على زر اللعب وابدأ الصكة فوراً كضيف أو سجّل بحسابك لمزامنة رتبتك وتحدياتك اليومية وإحصائياتك الحقيقية.
              </p>
            </div>

            <div className="bg-black/30 border border-white/10 rounded-2xl p-5 text-right">
              <span className="text-2xl mb-2 block">🃏</span>
              <h3 className="text-base font-bold text-amber-200 mb-1.5">2. قوانين رسمية دقيقة</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                تطبيق محكم لقوانين الصن والحكم، شراء أول وثاني، مشاريع السرا والخمسين والمية والأربعمية، وحساب أبناط الأكلة الأخيرة.
              </p>
            </div>

            <div className="bg-black/30 border border-white/10 rounded-2xl p-5 text-right">
              <span className="text-2xl mb-2 block">🚪</span>
              <h3 className="text-base font-bold text-amber-200 mb-1.5">3. غرف خاصة ومؤقت مخصص</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                أنشئ ديوانيتك برمز خاص، اختر وقت التفكير لكل دور (15، 30، 45، أو 60 ثانية)، وشارك الرابط مع ربعك للعب المباشر.
              </p>
            </div>
          </div>

          {/* Quick Explanations: Sun vs Hokom */}
          <div className="border-t border-white/10 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm">
            <div className="bg-emerald-950/40 border border-emerald-500/20 rounded-2xl p-4 sm:p-5">
              <h4 className="text-sm sm:text-base font-black text-emerald-300 mb-2 flex items-center gap-2">
                <span>☀️</span>
                <span>قوانين الصن (Sun)</span>
              </h4>
              <p className="text-gray-300 leading-relaxed">
                في الصن لا يوجد نوع حكم، وترتيب الأوراق من الأقوى: الإكة (A بـ 11 بنط)، العشرة (10 بـ 10 أبناط)، الشايب (K بـ 4 أبناط)، البنت (Q بـ 3 أبناط)، ثم الولد (J بـ 2 بنط). مجموع الأبناط 130 يضاف لها 2 للأرض، وتُدبل في القيد النهائي.
              </p>
            </div>

            <div className="bg-amber-950/40 border border-amber-500/20 rounded-2xl p-4 sm:p-5">
              <h4 className="text-sm sm:text-base font-black text-amber-300 mb-2 flex items-center gap-2">
                <span>👑</span>
                <span>قوانين الحكم (Hokom)</span>
              </h4>
              <p className="text-gray-300 leading-relaxed">
                في الحكم يحدد الشاري نوعاً للورق، وتصبح ورقة الولد (J للحكم) هي رأس اللعبة بقيمة 20 بنط وتليها التسعة (9 للحكم) بـ 14 بنط. مجموع أبناط الحكم 152 بنط، ويجب على اللاعبين الالتزام بنظام أكل الحكم والنكول الرسمي.
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-gray-400">
              جاهز لاختبار مهاراتك الآن؟ الصكة تنتظرك على الطاولة!
            </span>
            <div className="flex gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => onStartGame('quick')}
                className="flex-1 sm:flex-none py-3 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer"
              >
                ابدأ صكة فورية 🃏
              </button>
              <button
                type="button"
                onClick={() => onSelectTab('rooms')}
                className="flex-1 sm:flex-none py-3 px-5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm transition-all cursor-pointer"
              >
                أنشئ غرفة خاصة 🚪
              </button>
            </div>
          </div>
        </article>

        {/* Interactive FAQ Section Matching Schema.org FAQPage */}
        <section className="space-y-6">
          <div className="text-center">
            <span className="text-amber-400 text-xs font-bold block mb-1">
              ❓ الأسئلة الأكثر تداولاً
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              الأسئلة الشائعة حول لعبة ديوان البلوت
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-lg mx-auto">
              إجابات موثقة لمساعدتك في فهم نظام اللعب، الأنماط المتاحة، ودعوة الأصدقاء
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: 'كيف ألعب بلوت أون لاين بدون تحميل؟',
                a: 'يمكنك الدخول مباشرة إلى موقع ديوان البلوت من أي متصفح (سواء على الهاتف الذكي أو جهاز الحاسوب) والضغط على زر "العب الآن أونلاين" لتبدأ صكة بلوت كاملة مع لاعبين حقيقيين أو ضد الروبوتات دون الحاجة إلى تنزيل أو تثبيت أي تطبيق.',
              },
              {
                q: 'هل لعبة ديوان البلوت مجانية تماماً؟',
                a: 'نعم، لعبة ديوان البلوت مجانية بنسبة 100% لجميع الأنماط: اللعب السريع، تدريب الكمبيوتر، والغرف الخاصة مع الأصدقاء، وخالية تماماً من آليات الدفع للفوز (No Pay-to-Win).',
              },
              {
                q: 'ما هو الفرق بين الصن والحكم في البلوت؟',
                a: 'في الصن، لا يوجد نوع أوراق مميز (بدون ترامب)، وأعلى ورقة هي الإكة (A) بـ 11 بنط تليها العشرة (10) بـ 10 أبناط. أما في الحكم، فيتم تحديد نوع ورق محدد كحكم، وتصبح ورقة الولد (J) للحكم هي الأقوى بقيمة 20 بنط وتليها التسعة (9) بـ 14 بنط.',
              },
              {
                q: 'كيف يتم حساب الأبناط والمشاريع في البلوت؟',
                a: 'مجموع أبناط الورق في الصن هو 130 بنط، ويضاف لها بنطين للأكلة الأخيرة (الأرض) لتصبح 132، وتُقسم على 5 وتُدبل في الصن. وفي الحكم مجموع الورق 152 بنط وتُقسم على 10. كما تُحتسب مشاريع السرا (20 / 40)، الخمسين (50 / 100)، المية (100 / 200)، والأربعمية في الصن (400) وفق القوانين الرسمية.',
              },
              {
                q: 'هل يمكنني إنشاء غرفة خاصة واللعب مع أصدقائي مع تحديد المؤقت؟',
                a: 'نعم، يمكنك إنشاء غرفة خاصة بضغطة زر وتحديد وقت التفكير لكل دور (15، 30، 45، أو 60 ثانية) ونسخ رمز الغرفة أو رابطها المباشر لمشاركته مع أصدقائك أو دعوتهم من قائمة الأصدقاء المتصلين داخل الديوان.',
              },
            ].map((faq, idx) => (
              <details
                key={idx}
                className="group bg-[#0d2218] border border-white/10 rounded-2xl p-4 sm:p-5 transition-all open:border-amber-400/40"
              >
                <summary className="flex items-center justify-between font-black text-sm sm:text-base text-gray-200 group-hover:text-amber-300 cursor-pointer list-none">
                  <span className="flex items-center gap-2.5">
                    <span className="text-amber-400 font-mono text-xs">0{idx + 1}.</span>
                    <span>{faq.q}</span>
                  </span>
                  <span className="text-amber-400 group-open:rotate-180 transition-transform text-sm">
                    ▼
                  </span>
                </summary>
                <p className="mt-3 text-xs sm:text-sm text-gray-300 leading-relaxed pr-6 border-r-2 border-amber-400/40">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </section>
      </section>
    </div>
  );
};
