import React, { useState, useEffect } from 'react';
import {
  getUserProfile,
  saveUserProfile,
  recalculateStatsFromHistory,
  resetUserStatsToZero,
  getGameHistory,
  UserProfile,
} from '../../services/storage';
import { useFirebaseAuth } from '../../firebase/AuthContext';
import { soundService } from '../../services/sound';

interface ProfileProps {
  onSelectTab: (tab: string) => void;
  onStartGame?: (mode: 'quick' | 'bot' | 'private' | 'training') => void;
}

export const ProfilePage: React.FC<ProfileProps> = ({ onSelectTab, onStartGame }) => {
  const { currentUser, userProfile: authProfile, syncProfileToFirestore, loginWithGoogle, logout } = useFirebaseAuth();
  const [user, setUser] = useState<UserProfile>(authProfile || getUserProfile());
  const [history, setHistory] = useState(getGameHistory());
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState(user.name);
  const [selectedAvatar, setSelectedAvatar] = useState(user.avatar);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Sync with auth context profile updates
  useEffect(() => {
    if (authProfile) {
      setUser(authProfile);
      setNameInput(authProfile.name);
      setSelectedAvatar(authProfile.avatar);
    }
  }, [authProfile]);

  // Keep local history fresh
  useEffect(() => {
    const handleHistoryUpdate = () => {
      setHistory(getGameHistory());
    };
    window.addEventListener('baloot_history_updated', handleHistoryUpdate);
    return () => {
      window.removeEventListener('baloot_history_updated', handleHistoryUpdate);
    };
  }, []);

  const availableAvatars = ['🦅', '🇸🇦', '🏇', '⚔️', '🦁', '👳🏻', '🧔🏻', '👑', '🌟', '🧕🏻'];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSave = async () => {
    soundService.playClick();
    const updated: UserProfile = {
      ...user,
      name: nameInput.trim() || user.name,
      avatar: selectedAvatar,
    };
    setUser(updated);
    saveUserProfile(updated);
    try {
      await syncProfileToFirestore(updated);
    } catch (e) {
      console.warn('Could not sync to firestore:', e);
    }
    setIsEditing(false);
    showToast('✓ تم حفظ وتحديث بيانات اللاعب بنجاح!');
  };

  const handleRecalculate = () => {
    soundService.playClick();
    const recalculated = recalculateStatsFromHistory();
    setUser(recalculated);
    syncProfileToFirestore(recalculated);
    showToast('✓ تمت مزامنة الإحصائيات بدقة من سجل المباريات الفعلي!');
  };

  const handleResetToZero = () => {
    soundService.playClick();
    const zeroed = resetUserStatsToZero();
    setUser(zeroed);
    syncProfileToFirestore(zeroed);
    setShowResetConfirm(false);
    showToast('✓ تم تصفير جميع الإحصائيات وبدء سجل حقيقي جديد!');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 select-none space-y-8">
      {toastMessage && (
        <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs px-4 py-2.5 rounded-xl text-center animate-in fade-in shadow-md">
          {toastMessage}
        </div>
      )}

      {/* Profile Header Card */}
      <div className="bg-gradient-to-b from-[#152e22] to-[#0c1c14] border-2 border-[#c5a059]/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
        <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-right">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 rounded-3xl bg-black/40 border-2 border-amber-400/60 flex items-center justify-center text-5xl shadow-xl">
              {user.avatar}
            </div>
            {user.isSubscriber && (
              <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-amber-400 text-black text-[10px] font-black shadow-md">
                بلس ⭐
              </span>
            )}
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1.5">
              <h1 className="text-2xl sm:text-3xl font-black text-white truncate max-w-xs">{user.name}</h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                مستوى {user.level}
              </span>
              {currentUser?.email ? (
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold flex items-center gap-1">
                  <span>✓</span>
                  <span>موثق ({currentUser.email})</span>
                </span>
              ) : (
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/10 text-gray-300 border border-white/10 font-medium">
                  حساب محلي
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-gray-400 mb-4">
              <span>معرف اللاعب: #{user.id.slice(0, 12)}</span>
              <span>•</span>
              <span className="text-amber-300 font-bold">{user.coins.toLocaleString()} 🪙 عملة تميز</span>
              <span>•</span>
              <span className="text-gray-300 font-bold">{user.xp.toLocaleString()} XP خبرة</span>
            </div>

            {/* Actions Toolbar */}
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="text-xs px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold border border-white/10 transition-all cursor-pointer"
              >
                {isEditing ? 'إلغاء التعديل ✕' : 'تعديل البيانات ✏️'}
              </button>

              {!currentUser ? (
                <button
                  type="button"
                  onClick={loginWithGoogle}
                  className="text-xs px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-black font-black shadow-md transition-all cursor-pointer flex items-center gap-1"
                >
                  <span>🌐</span>
                  <span>ربط بحساب Google لحفظ البيانات</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={logout}
                  className="text-xs px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-rose-900/20 text-gray-400 hover:text-rose-300 font-bold border border-white/10 transition-all cursor-pointer"
                >
                  تسجيل الخروج 🚪
                </button>
              )}

              <button
                type="button"
                onClick={() => onSelectTab('challenges')}
                className="text-xs px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold border border-amber-500/40 transition-all cursor-pointer"
              >
                التحديات اليومية 🎯
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('subscription')}
                className="text-xs px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-bold border border-white/10 transition-all cursor-pointer"
              >
                {user.isSubscriber ? 'إدارة الاشتراك ⭐' : 'ديوان بلس ⭐'}
              </button>
            </div>
          </div>
        </div>

        {/* Editing Modal / Drawer */}
        {isEditing && (
          <div className="mt-6 pt-6 border-t border-white/10 space-y-4 animate-in fade-in duration-200">
            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1">اسم اللاعب الحقيقي:</label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                maxLength={24}
                placeholder="اكتب اسمك..."
                className="bg-black/50 border border-white/20 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-amber-400 w-full max-w-xs"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-300 block mb-2">اختر الصورة الرمزية (الأفاتار):</label>
              <div className="flex flex-wrap gap-2">
                {availableAvatars.map((av) => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => setSelectedAvatar(av)}
                    className={`w-10 h-10 rounded-xl border text-xl flex items-center justify-center transition-all cursor-pointer ${
                      selectedAvatar === av
                        ? 'border-amber-400 bg-amber-500/30 scale-110 shadow-md'
                        : 'border-white/10 bg-black/30 hover:border-white/30'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSave}
                className="py-2 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs shadow-md transition-all cursor-pointer"
              >
                حفظ التعديلات سحابياً ✓
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="py-2 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-gray-300 text-xs font-bold"
              >
                إلغاء
              </button>
            </div>
          </div>
        )}
      </div>

      {/* REAL STATS MATRIX */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <span>📊</span>
              <span>إحصائيات الصكات الرسمية (بيانات حقيقية 100%)</span>
            </h2>
            <p className="text-xs text-gray-400">
              جميع الأرقام هنا تعكس المباريات التي لُعبت بالفعل دون أي قيم افتراضية وهمية.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRecalculate}
              className="text-xs px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-all flex items-center gap-1 cursor-pointer"
              title="إعادة احتساب الأرقام بناءً على سجل المباريات المسجل"
            >
              <span>🔄</span>
              <span>مزامنة من السجل</span>
            </button>
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="text-xs px-3 py-1.5 rounded-xl bg-rose-950/30 hover:bg-rose-900/40 text-rose-300 border border-rose-500/20 transition-all cursor-pointer"
              title="تصفير الإحصائيات وبدء سجل جديد من الصفر"
            >
              🗑️ تصفير
            </button>
          </div>
        </div>

        {/* Confirmation Modal for Resetting Stats */}
        {showResetConfirm && (
          <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 space-y-3 animate-in fade-in">
            <div className="flex items-center gap-2 text-rose-300 font-bold text-sm">
              <span>⚠️</span>
              <span>هل أنت متأكد من رغبتك في تصفير جميع الإحصائيات إلى الصفر؟</span>
            </div>
            <p className="text-xs text-gray-300">
              سيتم إعادة ضبط عدد المباريات، الفوز، الخسارة، ونسبة الفوز إلى 0 لتبدأ من جديد بصكات حقيقية.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleResetToZero}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
              >
                نعم، صفّر الإحصائيات الآن
              </button>
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-1.5 rounded-lg bg-white/10 text-gray-300 font-bold text-xs"
              >
                إلغاء
              </button>
            </div>
          </div>
        )}

        {/* Clean Zero Notice if no matches have been played yet */}
        {user.stats.matchesPlayed === 0 && (
          <div className="bg-[#0f251a] border border-emerald-500/30 rounded-2xl p-5 text-center space-y-2">
            <span className="text-3xl block">🎴</span>
            <h3 className="text-sm font-bold text-emerald-300">
              سجلك الحقيقي خالٍ وجاهز لأول صكة!
            </h3>
            <p className="text-xs text-gray-400 max-w-md mx-auto">
              تم إزالة أي بيانات وهمية مسبقة. بمجرد إكمال صكتك الأولى، سيتم احتساب نتائجك، نقاط الأبناط، ونسبة فوزك تلقائياً وبدقة عالية.
            </p>
            {onStartGame && (
              <button
                type="button"
                onClick={() => onStartGame('quick')}
                className="mt-2 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs shadow-md transition-all cursor-pointer inline-block"
              >
                العب أول صكة الآن 🃏
              </button>
            )}
          </div>
        )}

        {/* 8-Grid Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="bg-[#0f2319] border border-white/10 rounded-2xl p-4 text-center">
            <span className="text-xs text-gray-400 block mb-1">المباريات الملعوبة</span>
            <span className="text-2xl font-black text-white">{user.stats.matchesPlayed}</span>
            <span className="text-[10px] text-gray-500 block mt-0.5">صكة رسمية</span>
          </div>

          <div className="bg-[#0f2319] border border-white/10 rounded-2xl p-4 text-center">
            <span className="text-xs text-gray-400 block mb-1">نسبة الفوز الحقيقية</span>
            <span className="text-2xl font-black text-emerald-400">
              {user.stats.matchesPlayed > 0 ? `${user.stats.winRate}%` : '0%'}
            </span>
            <span className="text-[10px] text-gray-500 block mt-0.5">من إجمالي الصكات</span>
          </div>

          <div className="bg-[#0f2319] border border-white/10 rounded-2xl p-4 text-center">
            <span className="text-xs text-gray-400 block mb-1">الصكات الفائزة</span>
            <span className="text-2xl font-black text-emerald-400">{user.stats.matchesWon}</span>
            <span className="text-[10px] text-gray-500 block mt-0.5">فوز بالصكة</span>
          </div>

          <div className="bg-[#0f2319] border border-white/10 rounded-2xl p-4 text-center">
            <span className="text-xs text-gray-400 block mb-1">الصكات الخاسرة</span>
            <span className="text-2xl font-black text-rose-400">{user.stats.matchesLost}</span>
            <span className="text-[10px] text-gray-500 block mt-0.5">خسارة القيد</span>
          </div>

          <div className="bg-[#0f2319] border border-white/10 rounded-2xl p-4 text-center">
            <span className="text-xs text-gray-400 block mb-1">مرات الفوز بالصن ☀️</span>
            <span className="text-2xl font-black text-amber-300">{user.stats.sunWins}</span>
            <span className="text-[10px] text-gray-500 block mt-0.5">عقد صن فائز</span>
          </div>

          <div className="bg-[#0f2319] border border-white/10 rounded-2xl p-4 text-center">
            <span className="text-xs text-gray-400 block mb-1">مرات الفوز بالحكم ⚔️</span>
            <span className="text-2xl font-black text-blue-300">{user.stats.hokomWins}</span>
            <span className="text-[10px] text-gray-500 block mt-0.5">عقد حكم فائز</span>
          </div>

          <div className="bg-[#0f2319] border border-white/10 rounded-2xl p-4 text-center">
            <span className="text-xs text-gray-400 block mb-1">مرات الكبوت (Kaboot) 👑</span>
            <span className="text-2xl font-black text-purple-300">{user.stats.kabootsAchieved}</span>
            <span className="text-[10px] text-gray-500 block mt-0.5">كل اللمات الثمانية</span>
          </div>

          <div className="bg-[#0f2319] border border-white/10 rounded-2xl p-4 text-center">
            <span className="text-xs text-gray-400 block mb-1">مجموع الأبناط المحققة</span>
            <span className="text-2xl font-black text-amber-400">
              {user.stats.totalAbnatScored.toLocaleString()}
            </span>
            <span className="text-[10px] text-gray-500 block mt-0.5">بنط محقق لفريقك</span>
          </div>
        </div>
      </div>

      {/* RECENT MATCH HISTORY PREVIEW */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
            <span>📜</span>
            <span>آخر الصكات المسجلة في سجلك</span>
          </h2>
          <button
            type="button"
            onClick={() => onSelectTab('history')}
            className="text-xs text-amber-300 hover:text-amber-200 font-bold"
          >
            عرض السجل الكامل ({history.length}) ←
          </button>
        </div>

        {history.length === 0 ? (
          <div className="bg-[#0f2319] border border-white/10 rounded-2xl p-6 text-center text-gray-400 text-xs">
            لا توجد مباريات سابقة مسجلة حتى الآن. ابدأ صكة لتظهر هنا مباشرة مع النتيجة الرسمية.
          </div>
        ) : (
          <div className="space-y-2">
            {history.slice(0, 3).map((h) => {
              const isWin = h.result === 'win';
              return (
                <div
                  key={h.id}
                  className={`bg-[#0f2319] border rounded-xl p-3 sm:p-4 flex items-center justify-between gap-3 text-xs ${
                    isWin ? 'border-emerald-500/30' : 'border-rose-500/25'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{isWin ? '🏆' : '✕'}</span>
                    <div className="text-right">
                      <span className={`font-bold block ${isWin ? 'text-emerald-300' : 'text-rose-300'}`}>
                        {isWin ? 'فوز بالصكة' : 'خسارة'} ({h.contractType === 'sun' ? 'صن ☀️' : 'حكم ⚔️'})
                      </span>
                      <span className="text-[11px] text-gray-400">
                        خويّك: {h.partnerName} • التاريخ: {h.date}
                      </span>
                    </div>
                  </div>
                  <div className="text-left bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 font-mono font-bold text-amber-300">
                    {h.finalScoreUs} - {h.finalScoreThem}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
