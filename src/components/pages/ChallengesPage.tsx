import React, { useState, useEffect } from 'react';
import {
  getChallenges,
  saveChallenges,
  getUserProfile,
  saveUserProfile,
  DailyChallenge,
  UserProfile,
  trackChallengeProgress,
} from '../../services/storage';
import { useFirebaseAuth } from '../../firebase/AuthContext';
import { soundService } from '../../services/sound';
import confetti from 'canvas-confetti';
import { VipUpgradePromptModal } from '../payment/VipUpgradePromptModal';

interface ChallengesPageProps {
  onStartGame?: (mode: 'quick' | 'bot' | 'private' | 'training') => void;
  onSelectTab?: (tab: string) => void;
}

export const ChallengesPage: React.FC<ChallengesPageProps> = ({ onStartGame, onSelectTab }) => {
  const { userProfile: authUser, syncProfileToFirestore } = useFirebaseAuth();
  const [challenges, setChallenges] = useState<DailyChallenge[]>(getChallenges());
  const [user, setUser] = useState<UserProfile>(authUser || getUserProfile());
  const [claimedId, setClaimedId] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [testToast, setTestToast] = useState<string | null>(null);
  const [showVipModal, setShowVipModal] = useState(false);

  // Sync user state when authUser changes
  useEffect(() => {
    if (authUser) {
      setUser(authUser);
    }
  }, [authUser]);

  // Keep challenges in sync with storage events
  useEffect(() => {
    const handleChallengesUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<DailyChallenge[]>;
      if (customEvent.detail) {
        setChallenges(customEvent.detail);
      } else {
        setChallenges(getChallenges());
      }
    };

    window.addEventListener('baloot_challenges_updated', handleChallengesUpdate);
    return () => {
      window.removeEventListener('baloot_challenges_updated', handleChallengesUpdate);
    };
  }, []);

  // Countdown timer to midnight reset
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
      const diffMs = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
      return `${hours} ساعة و ${minutes} دقيقة و ${seconds} ثانية`;
    };

    setTimeLeft(calculateTimeLeft());
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Handle claiming a challenge reward
  const handleClaim = async (challenge: DailyChallenge) => {
    if (!challenge.completed || challenge.claimed) return;

    soundService.playWin();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    const updatedChallenges = challenges.map((c) =>
      c.id === challenge.id ? { ...c, claimed: true, completed: true, current: c.target } : c
    );

    setChallenges(updatedChallenges);
    saveChallenges(updatedChallenges);

    // Calculate real user XP, Coins, and Level with 3x VIP multiplier
    const multiplier = user.isSubscriber ? 3 : 1;
    const addedXp = challenge.rewardXp * multiplier;
    const addedCoins = challenge.rewardCoins * multiplier;

    const newXp = (user.xp || 0) + addedXp;
    const newCoins = (user.coins || 0) + addedCoins;
    const newLevel = Math.max(1, Math.floor(newXp / 500) + 1);

    const updatedUser: UserProfile = {
      ...user,
      xp: newXp,
      coins: newCoins,
      level: newLevel,
    };

    setUser(updatedUser);
    saveUserProfile(updatedUser);

    try {
      await syncProfileToFirestore(updatedUser);
    } catch (e) {
      console.warn('Firestore sync failed on claim:', e);
    }

    setClaimedId(challenge.id);
    setTimeout(() => setClaimedId(null), 3000);
  };

  // Simulation helper to verify challenge tracking easily
  const handleSimulateProgress = (type: DailyChallenge['type']) => {
    const updated = trackChallengeProgress(type, 1);
    setChallenges(updated);
    setTestToast('⚡ تم تسجيل حركة تجريبية وتقدّم التحدي بنجاح!');
    setTimeout(() => setTestToast(null), 3000);
  };

  const completedCount = challenges.filter((c) => c.completed || c.claimed).length;
  const claimedCount = challenges.filter((c) => c.claimed).length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 select-none space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl sm:text-4xl font-black text-white mb-2 flex items-center justify-center gap-2">
          <span>🎯</span>
          <span>تحديات ديوان البلوت اليومية</span>
        </h1>
        <p className="text-xs sm:text-sm text-gray-300 max-w-xl mx-auto leading-relaxed">
          أنجز المهام أثناء الصكات الرسمية لتكسب نقاط خبرة وعملات تميز حقيقية ترفع مستواك وتوثق في سجلك الدائم.
        </p>
      </div>

      {testToast && (
        <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs px-4 py-2.5 rounded-xl text-center animate-in fade-in">
          {testToast}
        </div>
      )}

      {/* Daily Progress & Reset Countdown Banner */}
      <div className="bg-gradient-to-r from-[#12281e] via-[#0f2319] to-[#091811] border border-[#c5a059]/30 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-right w-full sm:w-auto">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-amber-300 font-bold">مستوى اللاعب الحقيقي:</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-black">
              مستوى {user.level}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl sm:text-3xl font-black text-white">{user.xp.toLocaleString()} XP</span>
            <span className="text-sm text-gray-400">/ {user.level * 500} XP للمستوى التالي</span>
          </div>
          {/* XP Progress Bar */}
          <div className="w-full sm:w-64 bg-black/50 rounded-full h-2 overflow-hidden border border-white/10 mt-2">
            <div
              className="bg-gradient-to-r from-amber-500 to-amber-300 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.round(((user.xp % 500) / 500) * 100))}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-6 text-center sm:text-left w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-white/10 pt-3 sm:pt-0">
          <div>
            <span className="text-[11px] text-gray-400 block mb-0.5">عملاتك الحقيقية:</span>
            <span className="text-2xl font-black text-amber-300">{user.coins.toLocaleString()} 🪙</span>
          </div>
          <div className="border-r border-white/10 pr-6">
            <span className="text-[11px] text-gray-400 block mb-0.5">تتجدد التحديات خلال:</span>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-black/40 px-2.5 py-1 rounded-lg border border-emerald-500/30 block">
              {timeLeft || 'جاري الحساب...'}
            </span>
          </div>
        </div>
      </div>

      {/* Completion Metric Chips */}
      <div className="flex items-center justify-between text-xs px-1 text-gray-400">
        <span>
          التحديات المنجزة اليوم: <strong className="text-amber-300 font-black">{completedCount}</strong> من {challenges.length}
        </span>
        <span>
          المكافآت المستلمة: <strong className="text-emerald-400 font-black">{claimedCount}</strong> من {challenges.length}
        </span>
      </div>

      {/* Challenge Cards List */}
      <div className="space-y-3.5">
        {challenges.map((c) => {
          const progressPercent = Math.min(100, Math.round((c.current / c.target) * 100));
          const isReadyToClaim = c.completed && !c.claimed;

          return (
            <div
              key={c.id}
              className={`bg-[#0d2016] border rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg transition-all ${
                c.claimed
                  ? 'border-emerald-500/20 opacity-80'
                  : isReadyToClaim
                  ? 'border-amber-400 ring-1 ring-amber-400/50 bg-[#12281c] shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                  : 'border-white/10 hover:border-white/25'
              }`}
            >
              {/* Challenge Details */}
              <div className="flex items-start gap-3.5 w-full text-right">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 border ${
                    c.claimed
                      ? 'bg-emerald-900/30 border-emerald-500/40 text-emerald-300'
                      : isReadyToClaim
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                      : 'bg-black/40 border-white/10 text-gray-300'
                  }`}
                >
                  {c.claimed ? '✓' : c.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-black text-white text-sm sm:text-base">{c.title}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 font-bold">
                      +{user.isSubscriber ? c.rewardXp * 3 : c.rewardXp} XP {user.isSubscriber ? '⚡ 3x' : ''}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 font-bold">
                      +{user.isSubscriber ? c.rewardCoins * 3 : c.rewardCoins} 🪙 {user.isSubscriber ? '⚡ 3x' : ''}
                    </span>
                    {!user.isSubscriber && (
                      <button
                        type="button"
                        onClick={() => setShowVipModal(true)}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-black hover:bg-emerald-500/25 transition-all cursor-pointer flex items-center gap-1"
                        title="اشترك في ديوان VIP لمضاعفة الجوائز 3 أضعاف"
                      >
                        <span>👑</span>
                        <span>مكافأة VIP كاشير: +{c.rewardCoins * 3} 🪙 (مقفلة 🔒)</span>
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-gray-300 mb-2.5 leading-normal">{c.description}</p>

                  {/* Progress Bar & Percentage */}
                  <div className="w-full bg-black/50 rounded-full h-2.5 overflow-hidden border border-white/5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        c.claimed
                          ? 'bg-emerald-500'
                          : isReadyToClaim
                          ? 'bg-gradient-to-r from-amber-400 to-amber-300'
                          : 'bg-amber-500/70'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-gray-400 mt-1">
                    <span>
                      التقدم: <strong className="text-white font-bold">{c.current}</strong> من {c.target}
                    </span>
                    <span className={isReadyToClaim ? 'text-amber-300 font-bold' : ''}>
                      {progressPercent}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Action / Claim Button */}
              <div className="w-full sm:w-auto shrink-0 flex sm:flex-col items-center justify-end gap-2">
                {c.claimed ? (
                  <span className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-black flex items-center justify-center gap-1">
                    <span>✓</span>
                    <span>تم الاستلام</span>
                  </span>
                ) : isReadyToClaim ? (
                  <button
                    type="button"
                    onClick={() => handleClaim(c)}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs shadow-lg transition-all hover:scale-105 active:scale-95 animate-pulse"
                  >
                    {claimedId === c.id ? '✅ تم بنجاح!' : 'استلام المكافأة 🎁'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onStartGame && onStartGame('quick')}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-bold text-xs border border-white/10 transition-all flex items-center justify-center gap-1"
                  >
                    <span>العب الآن 🃏</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Play & Simulation Toolbar */}
      <div className="bg-[#0a1813] border border-[#c5a059]/20 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <span className="text-gray-400 text-center sm:text-right">
          💡 يتم تسجيل تقدم التحديات تلقائياً في الخلفية أثناء لعبك في أي صكة رسمية أو غرفة خاصة.
        </span>

        <div className="flex flex-wrap gap-2 justify-center">
          <button
            type="button"
            onClick={() => handleSimulateProgress('play_match')}
            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-amber-300 border border-white/10 transition-all font-semibold"
            title="تقدم تجريبي لصكة واحدة"
          >
            ⚡ تجربة صكة (+1)
          </button>
          <button
            type="button"
            onClick={() => handleSimulateProgress('announce_project')}
            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-amber-300 border border-white/10 transition-all font-semibold"
            title="تقدم تجريبي لمشروع"
          >
            📜 تجربة مشروع (+1)
          </button>
          <button
            type="button"
            onClick={() => onStartGame && onStartGame('quick')}
            className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-black transition-all"
          >
            ابدأ صكة الآن 🃏
          </button>
        </div>
      </div>

      {/* VIP Paywall Upgrade Modal */}
      <VipUpgradePromptModal
        isOpen={showVipModal}
        onClose={() => setShowVipModal(false)}
        reasonTitle="مضاعف مكافآت التحديات اليومية (3x) مقفل"
        reasonDescription="مشتركو ديوان VIP عبر كاشير يحصلون على 3 أضعاف الدنانير والـ XP لكل تحدٍ يومي يتم إنجازه. اشترك الآن بخصم 62% وضاعف أرباحك فوراً!"
        onUpgradeClick={() => {
          setShowVipModal(false);
          if (onSelectTab) onSelectTab('subscription');
        }}
      />
    </div>
  );
};
