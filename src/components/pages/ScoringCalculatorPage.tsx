import React, { useState } from 'react';

export const ScoringCalculatorPage: React.FC = () => {
  const [contractType, setContractType] = useState<'sun' | 'hokom'>('sun');
  const [buyer, setBuyer] = useState<'us' | 'them'>('us');
  const [multiplier, setMultiplier] = useState<number>(1);
  const [usCardPoints, setUsCardPoints] = useState<number>(85);
  const [isKaboot, setIsKaboot] = useState<boolean>(false);
  const [kabootWinner, setKabootWinner] = useState<'us' | 'them'>('us');

  // Projects
  const [usProjects, setUsProjects] = useState<number>(0);
  const [themProjects, setProjectsThem] = useState<number>(0);

  // Match ledger
  const [ledger, setLedger] = useState<{ round: number; desc: string; us: number; them: number }[]>([
    { round: 1, desc: 'صن - فوز عادي', us: 17, them: 9 },
    { round: 2, desc: 'حكم - سرة لنا', us: 12, them: 4 },
  ]);

  // Derived calculation
  const totalRawCardPoints = contractType === 'sun' ? 140 : 162;
  const clampedUsPoints = Math.min(totalRawCardPoints, Math.max(0, usCardPoints));
  const themCardPoints = totalRawCardPoints - clampedUsPoints;

  let calculatedUsRound = 0;
  let calculatedThemRound = 0;
  let isKhasara = false;

  if (isKaboot) {
    const kabootBase = contractType === 'sun' ? 44 : 25;
    if (kabootWinner === 'us') {
      calculatedUsRound = (kabootBase + (contractType === 'sun' ? (usProjects / 10) * 2 : usProjects / 10)) * multiplier;
      calculatedThemRound = 0;
    } else {
      calculatedThemRound = (kabootBase + (contractType === 'sun' ? (themProjects / 10) * 2 : themProjects / 10)) * multiplier;
      calculatedUsRound = 0;
    }
  } else if (contractType === 'sun') {
    // Sun logic:
    const buyerPts = buyer === 'us' ? clampedUsPoints : themCardPoints;
    isKhasara = buyerPts <= 70;

    const usProjAbnat = (usProjects / 10) * 2;
    const themProjAbnat = (themProjects / 10) * 2;

    if (isKhasara) {
      if (buyer === 'us') {
        calculatedThemRound = (26 + usProjAbnat + themProjAbnat) * multiplier;
        calculatedUsRound = 0;
      } else {
        calculatedUsRound = (26 + usProjAbnat + themProjAbnat) * multiplier;
        calculatedThemRound = 0;
      }
    } else {
      calculatedUsRound = (Math.round(clampedUsPoints / 5) + usProjAbnat) * multiplier;
      calculatedThemRound = (Math.round(themCardPoints / 5) + themProjAbnat) * multiplier;
    }
  } else {
    // Hokom logic:
    const buyerPts = buyer === 'us' ? clampedUsPoints : themCardPoints;
    isKhasara = buyerPts <= 81;

    const usProjAbnat = usProjects / 10;
    const themProjAbnat = themProjects / 10;

    if (isKhasara) {
      if (buyer === 'us') {
        calculatedThemRound = (16 + usProjAbnat + themProjAbnat) * multiplier;
        calculatedUsRound = 0;
      } else {
        calculatedUsRound = (16 + usProjAbnat + themProjAbnat) * multiplier;
        calculatedThemRound = 0;
      }
    } else {
      const roundHokom = (pts: number) => {
        const q = Math.floor(pts / 10);
        const r = pts % 10;
        return r >= 6 ? q + 1 : q;
      };
      calculatedUsRound = (roundHokom(clampedUsPoints) + usProjAbnat) * multiplier;
      calculatedThemRound = (roundHokom(themCardPoints) + themProjAbnat) * multiplier;
    }
  }

  const currentTotalUs = ledger.reduce((sum, l) => sum + l.us, 0);
  const currentTotalThem = ledger.reduce((sum, l) => sum + l.them, 0);

  const handleAddRoundToLedger = () => {
    setLedger((prev) => [
      ...prev,
      {
        round: prev.length + 1,
        desc: `${contractType === 'sun' ? 'صن' : 'حكم'}${isKhasara ? ' (خسارة)' : ''}${isKaboot ? ' (كبوت)' : ''}`,
        us: calculatedUsRound,
        them: calculatedThemRound,
      },
    ]);
  };

  const handleClearLedger = () => {
    setLedger([]);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 select-none">
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-4xl font-black text-white mb-2">
          حاسبة نقاط ونشرات البلوت 🧮
        </h1>
        <p className="text-xs sm:text-sm text-gray-400">
          احسب نشرات صكتك في الاستراحة أو الديوانية بدقة رياضية فورية تطابق قوانين البلوت الرسمية
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* INPUTS PANEL */}
        <div className="lg:col-span-2 bg-[#0f2319] border border-[#c5a059]/30 rounded-3xl p-6 space-y-6 shadow-xl">
          {/* Contract & Buyer */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-300 block mb-2">نوع العقد:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setContractType('sun');
                    setUsCardPoints(75);
                  }}
                  className={`py-2 rounded-xl text-xs font-black border transition-all ${
                    contractType === 'sun'
                      ? 'border-amber-400 bg-amber-500/20 text-amber-300'
                      : 'border-white/10 bg-black/20 text-gray-400'
                  }`}
                >
                  صن ☀️ (140)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setContractType('hokom');
                    setUsCardPoints(90);
                  }}
                  className={`py-2 rounded-xl text-xs font-black border transition-all ${
                    contractType === 'hokom'
                      ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300'
                      : 'border-white/10 bg-black/20 text-gray-400'
                  }`}
                >
                  حكم ⚔️ (162)
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-300 block mb-2">من المشتري؟</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setBuyer('us')}
                  className={`py-2 rounded-xl text-xs font-black border transition-all ${
                    buyer === 'us'
                      ? 'border-amber-400 bg-amber-500/20 text-amber-300'
                      : 'border-white/10 bg-black/20 text-gray-400'
                  }`}
                >
                  فريقنا (لنا)
                </button>
                <button
                  type="button"
                  onClick={() => setBuyer('them')}
                  className={`py-2 rounded-xl text-xs font-black border transition-all ${
                    buyer === 'them'
                      ? 'border-amber-400 bg-amber-500/20 text-amber-300'
                      : 'border-white/10 bg-black/20 text-gray-400'
                  }`}
                >
                  الخصم (لهم)
                </button>
              </div>
            </div>
          </div>

          {/* Multiplier / Double */}
          <div>
            <label className="text-xs font-bold text-gray-300 block mb-2">الدبل والمضاعفات:</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { val: 1, label: 'عادي (x1)' },
                { val: 2, label: 'دبل (x2)' },
                { val: 3, label: 'ثلاثة (x3)' },
                { val: 4, label: 'أربعة / قهوة (x4)' },
              ].map((m) => (
                <button
                  key={m.val}
                  type="button"
                  onClick={() => setMultiplier(m.val)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    multiplier === m.val
                      ? 'border-amber-400 bg-amber-500/20 text-amber-300'
                      : 'border-white/10 bg-black/20 text-gray-400'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Points Slider */}
          <div>
            <div className="flex justify-between items-center mb-2 text-xs">
              <span className="font-bold text-gray-200">نقاط أوراق فريقنا (لنا):</span>
              <span className="font-black text-amber-300 text-sm">
                {clampedUsPoints} من {totalRawCardPoints} (نقاط الخصم: {themCardPoints})
              </span>
            </div>
            <input
              type="range"
              min="0"
              max={totalRawCardPoints}
              value={clampedUsPoints}
              onChange={(e) => setUsCardPoints(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>

          {/* Projects Selector */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1">
                مشاريع فريقنا (لنا):
              </label>
              <select
                value={usProjects}
                onChange={(e) => setUsProjects(Number(e.target.value))}
                className="w-full bg-black/40 border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value={0}>بدون مشاريع (0)</option>
                <option value={20}>سرة أو بلوت (20)</option>
                <option value={40}>سرتين (40)</option>
                <option value={50}>خمسين (50)</option>
                <option value={100}>مية (100)</option>
                <option value={400}>أربعمية في الصن (400)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1">
                مشاريع الخصم (لهم):
              </label>
              <select
                value={themProjects}
                onChange={(e) => setProjectsThem(Number(e.target.value))}
                className="w-full bg-black/40 border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value={0}>بدون مشاريع (0)</option>
                <option value={20}>سرة أو بلوت (20)</option>
                <option value={40}>سرتين (40)</option>
                <option value={50}>خمسين (50)</option>
                <option value={100}>مية (100)</option>
                <option value={400}>أربعمية في الصن (400)</option>
              </select>
            </div>
          </div>

          {/* Kaboot Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-black/30 border border-white/5">
            <div>
              <span className="text-xs font-bold text-white block">حالة الكبوت الكامل (Kaboot)</span>
              <span className="text-[11px] text-gray-400">فوز فريق بجميع الأكلات الثمانية</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isKaboot}
                onChange={(e) => setIsKaboot(e.target.checked)}
                className="w-4 h-4 accent-amber-400 cursor-pointer"
              />
              {isKaboot && (
                <select
                  value={kabootWinner}
                  onChange={(e) => setKabootWinner(e.target.value as 'us' | 'them')}
                  className="bg-black/50 border border-white/20 text-xs rounded-lg px-2 py-1 text-amber-300"
                >
                  <option value="us">كبوت لنا</option>
                  <option value="them">كبوت لهم</option>
                </select>
              )}
            </div>
          </div>
        </div>

        {/* RESULTS & LEDGER PANEL */}
        <div className="bg-[#12281e] border-2 border-[#c5a059]/40 rounded-3xl p-6 flex flex-col justify-between shadow-2xl">
          <div>
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block mb-2">
              نتيجة النشرة المحسوبة:
            </span>

            {/* Quick Result Badge */}
            <div className="bg-black/40 rounded-2xl p-4 border border-white/10 mb-4 text-center">
              {isKhasara && (
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 inline-block mb-2">
                  ⚠️ خسر المشتري النشرة!
                </span>
              )}
              {isKaboot && (
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 inline-block mb-2">
                  ⭐ كبوت كامل!
                </span>
              )}

              <div className="grid grid-cols-2 gap-3 mt-1">
                <div>
                  <span className="text-xs text-gray-400 block">لنا (فريقنا):</span>
                  <span className="text-3xl font-black text-amber-300">+{calculatedUsRound}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">لهم (الخصم):</span>
                  <span className="text-3xl font-black text-white">+{calculatedThemRound}</span>
                </div>
              </div>
            </div>

            {/* Add to Ledger Button */}
            <button
              type="button"
              onClick={handleAddRoundToLedger}
              className="w-full py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all mb-4"
            >
              + إضافة النشرة لسجل القيد 📝
            </button>

            {/* Match Total Progress */}
            <div className="border-t border-white/10 pt-3 mb-3">
              <div className="flex justify-between items-center mb-1 text-xs">
                <span className="font-bold text-gray-300">مجموع القيد (إلى 152):</span>
                <span className="text-[10px] text-gray-400">
                  {currentTotalUs >= 152 || currentTotalThem >= 152 ? 'انتهت الصكة 🏁' : 'مستمرة'}
                </span>
              </div>
              <div className="flex justify-between text-base font-black">
                <span className="text-amber-300">لنا: {currentTotalUs}</span>
                <span className="text-white">لهم: {currentTotalThem}</span>
              </div>
            </div>

            {/* Ledger List */}
            <div className="max-h-40 overflow-y-auto space-y-1.5 text-xs text-gray-300 pr-1">
              {ledger.map((item, idx) => (
                <div key={idx} className="flex justify-between bg-black/20 p-2 rounded-lg border border-white/5">
                  <span>#{item.round} {item.desc}</span>
                  <span className="font-bold text-amber-200">+{item.us} | +{item.them}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleClearLedger}
            className="w-full mt-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 text-xs transition-all border border-white/5"
          >
            تصفير سجل القيد 🔄
          </button>
        </div>
      </div>
    </div>
  );
};
