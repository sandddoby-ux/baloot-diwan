import React, { useState } from 'react';

export const RulesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'basics' | 'sun' | 'hokom' | 'projects' | 'khasara'>('basics');

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 select-none">
      {/* Title & Introduction */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold mb-3">
          📜 المرجع المعتمد لقوانين البلوت في المملكة والخليج
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-white mb-3">
          دليل القوانين الرسمية للعبة البلوت
        </h1>
        <p className="text-xs sm:text-sm text-gray-300 max-w-2xl mx-auto leading-relaxed">
          شرح شامل ومفصل لقواعد البلوت السعودية كما تلعب في البطولات الرسمية والمجالس العريقة. من حساب الأبناط إلى شروط الكبوت والخسارة.
        </p>
      </div>

      {/* Navigation Pills */}
      <div className="flex items-center justify-center gap-1 sm:gap-2 overflow-x-auto pb-4 mb-6 border-b border-white/10 no-scrollbar">
        {[
          { id: 'basics', label: 'أساسيات وتوزيع الورق' },
          { id: 'sun', label: 'عقد الصن (Sun)' },
          { id: 'hokom', label: 'عقد الحكم (Hokom)' },
          { id: 'projects', label: 'المشاريع وشروطها' },
          { id: 'khasara', label: 'الكبوت والخسارة والقيد' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-amber-500 text-black shadow-md'
                : 'bg-white/5 text-gray-300 hover:bg-white/10'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* CONTENT SECTIONS */}
      <div className="bg-[#0f2319] border border-[#c5a059]/30 rounded-3xl p-6 sm:p-8 space-y-6 text-sm leading-relaxed text-gray-300">
        {/* BASICS */}
        {activeTab === 'basics' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-black text-amber-300 mb-3">1. أوراق اللعب والتوزيع</h2>
              <p className="mb-3">
                تلعب البلوت بواسطة <strong className="text-white">32 ورقة</strong> فقط من مجموعة الأوراق الفرنسية التقليدية (تستبعد الأوراق من 2 إلى 6). تنقسم الأوراق إلى 4 ألوان: الهاص ♥، الديمن ♦، السكة (السبيد) ♠، والكلفس (الشيريا) ♣.
              </p>
              <p>
                يشارك في اللعبة أربعة لاعبين يشكل كل اثنين متقابلين فريقاً واحداً (أنت وخويّك ضد الخصمين).
              </p>
            </div>

            <div className="bg-black/30 p-4 rounded-2xl border border-white/5">
              <h3 className="font-bold text-amber-200 mb-2">طريقة التوزيع الشرعية:</h3>
              <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-gray-300">
                <li>يبدأ التوزيع من اللاعب الذي على يمين الموزع (عكس عقارب الساعة).</li>
                <li>يوزع 3 كروت لكل لاعب أولاً، ثم كرتين (المجموع 5 كروت لكل لاعب).</li>
                <li>يُكشف الكرت رقم 21 في منتصف الطاولة ويسمى <strong className="text-amber-300">"كرت الشراء"</strong> أو الفرشة.</li>
                <li>تتبقى 11 ورقة مقلوبة على الطاولة للتوزيع الثاني بعد تحديد نوع العقد.</li>
              </ul>
            </div>

            <div className="bg-black/30 p-4 rounded-2xl border border-white/5">
              <h3 className="font-bold text-amber-200 mb-2">مراحل المزايدة (الشراء):</h3>
              <p className="text-xs sm:text-sm mb-2">
                <strong>الدورة الأولى:</strong> يمكن لأي لاعب شراء الورقة المكشوفة حكماً بنفس لونها، أو شراء صن، أو التمرير (بس).
              </p>
              <p className="text-xs sm:text-sm">
                <strong>الدورة الثانية:</strong> في حال تمرير الجميع بالدورة الأولى، يمكن شراء حكم بأي لون آخر غير لون الكرت المكشوف، أو شراء صن، أو أشكال (لخوي الموزع). وإذا باص الجميع يعاد التوزيع.
              </p>
            </div>
          </div>
        )}

        {/* SUN */}
        {activeTab === 'sun' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-black text-amber-300 mb-3">2. عقد الصن (قواعده وقيم أوراقه)</h2>
              <p className="mb-3">
                في الصن لا يوجد لون أقوى من لون آخر (لا يوجد حكم). الورقة الأقوى من نفس اللون الملعوب هي التي تأكل الأكلة دائماً.
              </p>
            </div>

            <div className="bg-black/30 p-4 rounded-2xl border border-white/5">
              <h3 className="font-bold text-amber-200 mb-3">ترتيب قوة الأوراق في الصن (من الأقوى للأضعف):</h3>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 text-center text-xs font-bold">
                <div className="bg-[#193a2b] p-2 rounded-lg border border-amber-400/40 text-amber-300">A (11)</div>
                <div className="bg-[#193a2b] p-2 rounded-lg border border-white/10 text-white">10 (10)</div>
                <div className="bg-[#193a2b] p-2 rounded-lg border border-white/10 text-white">K (4)</div>
                <div className="bg-[#193a2b] p-2 rounded-lg border border-white/10 text-white">Q (3)</div>
                <div className="bg-[#193a2b] p-2 rounded-lg border border-white/10 text-white">J (2)</div>
                <div className="bg-black/40 p-2 rounded-lg border border-white/5 text-gray-400">9 (0)</div>
                <div className="bg-black/40 p-2 rounded-lg border border-white/5 text-gray-400">8 (0)</div>
                <div className="bg-black/40 p-2 rounded-lg border border-white/5 text-gray-400">7 (0)</div>
              </div>
            </div>

            <div className="space-y-2 text-xs sm:text-sm">
              <p>• مجموع نقاط أوراق الصن = 130 نقطة + 10 نقاط للأكلة الأخيرة (الأرض) = <strong className="text-amber-300">140 نقطة</strong>.</p>
              <p>• في الصن تقسم النقاط على 5 للحصول على أبناط القيد (130 / 5 = 26 أبنط).</p>
              <p>• يلتزم اللاعب برمي نفس اللون الملعوب، وإن لم يملك منه يرمي أي ورقة أخرى (لا يوجد دق في الصن).</p>
            </div>
          </div>
        )}

        {/* HOKOM */}
        {activeTab === 'hokom' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-black text-emerald-300 mb-3">3. عقد الحكم (قواعده وقوة أوراقه)</h2>
              <p className="mb-3">
                يحدد المشتري لوناً واحداً يكون هو "الحكم". أوراق لون الحكم تأكل أي ورقة من الألوان الثلاثة الأخرى مهما بلغت قوتها.
              </p>
            </div>

            <div className="bg-black/30 p-4 rounded-2xl border border-white/5">
              <h3 className="font-bold text-amber-200 mb-3">ترتيب قوة ونقاط أوراق لون الحكم:</h3>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 text-center text-xs font-bold">
                <div className="bg-[#193a2b] p-2 rounded-lg border border-amber-400/40 text-amber-300">ولد J (20)</div>
                <div className="bg-[#193a2b] p-2 rounded-lg border border-amber-400/40 text-amber-300">تسعة 9 (14)</div>
                <div className="bg-[#193a2b] p-2 rounded-lg border border-white/10 text-white">إيكة A (11)</div>
                <div className="bg-[#193a2b] p-2 rounded-lg border border-white/10 text-white">عشرة 10 (10)</div>
                <div className="bg-[#193a2b] p-2 rounded-lg border border-white/10 text-white">شايب K (4)</div>
                <div className="bg-[#193a2b] p-2 rounded-lg border border-white/10 text-white">بنت Q (3)</div>
                <div className="bg-black/40 p-2 rounded-lg border border-white/5 text-gray-400">ثمانية 8 (0)</div>
                <div className="bg-black/40 p-2 rounded-lg border border-white/5 text-gray-400">سبعة 7 (0)</div>
              </div>
            </div>

            <div className="bg-black/30 p-4 rounded-2xl border border-white/5 space-y-2 text-xs sm:text-sm">
              <h4 className="font-bold text-amber-300">قواعد اللعب في الحكم:</h4>
              <p>• <strong>الالتزام باللون:</strong> يجب على اللاعب لعب نفس اللون الملعوب أولاً إن كان يملكه.</p>
              <p>• <strong>الدق في الحكم:</strong> إن لم يكن يملك من اللون الملعوب والخصم هو الآكل للأكلة، يجب عليه رمي ورقة حكم (يدق). أما إذا كان خويّه هو الآكل للأكلة، فلا يلزمه الدق (أكل خويّه).</p>
              <p>• <strong>التعلاية في الحكم:</strong> إن لُعب الحكم أولاً، يلزم كل من يملك حكماً أعلى أن يعلّي ويكبر عليه.</p>
            </div>
          </div>
        )}

        {/* PROJECTS */}
        {activeTab === 'projects' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-black text-amber-300 mb-3">4. مشاريع البلوت الرسمية</h2>
              <p className="mb-3">
                المشاريع هي تسلسلات متتالية أو تطابقات خاصة يعلن عنها اللاعبون في الدورة الأولى من الأكلات وتمنح نقاطاً إضافية في النشرة.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-black/30 p-4 rounded-2xl border border-white/5">
                <span className="text-amber-400 font-bold block mb-1">السرة (20 نقطة)</span>
                <p className="text-xs text-gray-300 leading-relaxed">
                  3 أوراق متتالية من نفس اللون (مثل: 7, 8, 9 أو 10, J, Q). تحسب 4 أبناط في الصن و2 أبنط في الحكم.
                </p>
              </div>

              <div className="bg-black/30 p-4 rounded-2xl border border-white/5">
                <span className="text-amber-400 font-bold block mb-1">الخمسين (50 نقطة)</span>
                <p className="text-xs text-gray-300 leading-relaxed">
                  4 أوراق متتالية من نفس اللون (مثل: 8, 9, 10, J). تحسب 10 أبناط في الصن و5 أبناط في الحكم.
                </p>
              </div>

              <div className="bg-black/30 p-4 rounded-2xl border border-white/5">
                <span className="text-amber-400 font-bold block mb-1">المية (100 نقطة)</span>
                <p className="text-xs text-gray-300 leading-relaxed">
                  5 أوراق متتالية من نفس اللون، أو 4 أوراق من نفس الرتبة (أربع شيبان، أربع بنات، أربع أولاد، أربع عشرات).
                </p>
              </div>

              <div className="bg-black/30 p-4 rounded-2xl border border-white/5">
                <span className="text-amber-400 font-bold block mb-1">الأربعمية (400 نقطة)</span>
                <p className="text-xs text-gray-300 leading-relaxed">
                  أربع إيكات (Aces) وتكون في الصن حصراً! تمنح 40 أبنط في الصن.
                </p>
              </div>
            </div>

            <div className="bg-black/40 p-4 rounded-2xl border border-amber-400/30 text-xs sm:text-sm">
              <strong className="text-amber-300 block mb-1">مشروع البلوت:</strong>
              <p>
                وجود شايب وبنت الحكم مع لاعب واحد في عقد الحكم. لا يعلن عنها في البداية، بل يعلن عنها عند لعب أول كرت منهما بقول كلمة "بلوت"، وعند الكرت الثاني يقول "ولد". تمنح 20 نقطة (أبنطين).
              </p>
            </div>
          </div>
        )}

        {/* KHASARA & KABOOT */}
        {activeTab === 'khasara' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-black text-amber-300 mb-3">5. الكبوت والخسارة ونظام القيد (152)</h2>
              <p className="mb-3">
                تعتبر النشرة هي الجولة الواحدة، وتنتهي الصكة بالوصول إلى القيد وهو <strong className="text-white">152 نقطة</strong>.
              </p>
            </div>

            <div className="bg-black/30 p-4 rounded-2xl border border-white/5 space-y-3">
              <h3 className="font-bold text-amber-300">الخسارة (Khasara):</h3>
              <p className="text-xs sm:text-sm">
                المشتري ملزم بالحصول على أكثر من نصف النقاط:
              </p>
              <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-gray-300">
                <li>في الصن: يحتاج المشتري إلى 71 نقطة فما فوق. إن حصل على 70 أو أقل، <strong className="text-rose-400">تخسر نشرته</strong> وتذهب كامل الأبناط (26 أبنط + المشاريع) للفريق الآخر.</li>
                <li>في الحكم: يحتاج المشتري إلى 82 نقطة فما فوق. إن حصل على 81 أو أقل، <strong className="text-rose-400">تخسر نشرته</strong> وتذهب كامل الأبناط (16 أبنط + المشاريع) للفريق الآخر.</li>
              </ul>
            </div>

            <div className="bg-black/30 p-4 rounded-2xl border border-white/5 space-y-2">
              <h3 className="font-bold text-emerald-300">الكبوت (Kaboot):</h3>
              <p className="text-xs sm:text-sm">
                هو فوز أحد الفريقين بجميع الأكلات الثمانية في الجولة دون أن يترك للخصم أي أكلة:
              </p>
              <p className="text-xs sm:text-sm">• كبوت الصن = <strong className="text-amber-300">44 أبنط</strong>.</p>
              <p className="text-xs sm:text-sm">• كبوت الحكم = <strong className="text-amber-300">25 أبنط</strong>.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
