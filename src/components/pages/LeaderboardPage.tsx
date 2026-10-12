import React, { useEffect, useState } from 'react';
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { getUserProfile } from '../../services/storage';

interface LeaderItem {
  id: string;
  rank: number;
  name: string;
  avatar: string;
  country: string;
  winRate: number;
  matches: number;
  points: number;
  badge: string;
}

export const LeaderboardPage: React.FC = () => {
  const [filter, setFilter] = useState<'weekly' | 'all_time'>('weekly');
  const [leaders, setLeaders] = useState<LeaderItem[]>([]);
  const [loading, setLoading] = useState(true);

  const localUser = getUserProfile();

  useEffect(() => {
    async function loadLeaderboard() {
      setLoading(true);
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, orderBy('xp', 'desc'), limit(10));
        const snap = await getDocs(q);

        if (!snap.empty) {
          const list: LeaderItem[] = snap.docs.map((docSnap, index) => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              rank: index + 1,
              name: data.name || 'لاعب ديوان',
              avatar: data.avatar || '🦅',
              country: 'المملكة العربية السعودية',
              winRate: data.stats?.winRate || 0,
              matches: data.stats?.matchesPlayed || 0,
              points: data.xp || data.coins || 0,
              badge: index === 0 ? '👑 صقر الصن' : index === 1 ? '🥈 فارس الحكم' : index === 2 ? '🥉 أستاذ الديوان' : 'محترف',
            };
          });
          setLeaders(list);
        } else {
          // Empty or fresh database: show current user
          setLeaders([
            {
              id: localUser.id,
              rank: 1,
              name: localUser.name,
              avatar: localUser.avatar,
              country: 'المملكة العربية السعودية',
              winRate: localUser.stats.winRate,
              matches: localUser.stats.matchesPlayed,
              points: localUser.xp,
              badge: '⭐ رائد الديوان',
            },
          ]);
        }
      } catch {
        setLeaders([
          {
            id: localUser.id,
            rank: 1,
            name: localUser.name,
            avatar: localUser.avatar,
            country: 'المملكة العربية السعودية',
            winRate: localUser.stats.winRate,
            matches: localUser.stats.matchesPlayed,
            points: localUser.xp,
            badge: '⭐ رائد الديوان',
          },
        ]);
      } finally {
        setLoading(false);
      }
    }

    loadLeaderboard();
  }, [localUser.id, localUser.name, localUser.avatar, localUser.stats.winRate, localUser.stats.matchesPlayed, localUser.xp]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 select-none space-y-6">
      <div className="text-center">
        <h1 className="text-2xl sm:text-4xl font-black text-white mb-2">
          قائمة متصدري ديوان البلوت 🏆
        </h1>
        <p className="text-xs sm:text-sm text-gray-400">
          تصنيف نخبة لاعبي البلوت المحدث مباشرة من سحابة Firebase
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex justify-center gap-2">
        <button
          type="button"
          onClick={() => setFilter('weekly')}
          className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
            filter === 'weekly'
              ? 'bg-amber-500 text-black border-amber-400 shadow-md'
              : 'bg-white/5 border-white/10 text-gray-300'
          }`}
        >
          المتصدرون هذا الأسبوع 📅
        </button>
        <button
          type="button"
          onClick={() => setFilter('all_time')}
          className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
            filter === 'all_time'
              ? 'bg-amber-500 text-black border-amber-400 shadow-md'
              : 'bg-white/5 border-white/10 text-gray-300'
          }`}
        >
          التصنيف العام التاريخي 🌟
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400 text-xs">
          <span className="w-6 h-6 rounded-full border-2 border-amber-400 border-t-transparent animate-spin inline-block mb-2" />
          <p>جارٍ تحميل بيانات المتصدرين من قاعدة البيانات...</p>
        </div>
      ) : leaders.length === 0 ? (
        <div className="bg-[#0f2319] border border-white/10 rounded-2xl p-8 text-center text-gray-400 text-xs">
          لا يوجد لاعبون مسجلون بعد. العب أول صكة لتتصدر القائمة!
        </div>
      ) : (
        <div className="bg-[#0f2319] border border-[#c5a059]/30 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs sm:text-sm">
              <thead>
                <tr className="bg-black/40 border-b border-white/10 text-gray-400">
                  <th className="py-3 px-4">الترتيب</th>
                  <th className="py-3 px-4">اللاعب</th>
                  <th className="py-3 px-4">المنطقة</th>
                  <th className="py-3 px-4">نسبة الفوز</th>
                  <th className="py-3 px-4">المباريات</th>
                  <th className="py-3 px-4 text-left">مجموع النقاط</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {leaders.map((p) => (
                  <tr key={p.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4 font-black">
                      {p.rank === 1 ? '🥇' : p.rank === 2 ? '🥈' : p.rank === 3 ? '🥉' : `#${p.rank}`}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{p.avatar}</span>
                        <div>
                          <span className="font-bold text-gray-200 block">{p.name}</span>
                          <span className="text-[10px] text-amber-400">{p.badge}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-gray-300">{p.country}</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-400">{p.winRate}%</td>
                    <td className="py-3.5 px-4 text-gray-400">{p.matches}</td>
                    <td className="py-3.5 px-4 text-left font-black text-amber-300">
                      {p.points.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
