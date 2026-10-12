import React, { useState, useEffect } from 'react';
import {
  getFriends,
  saveFriends,
  addFriend,
  removeFriend,
  Friend,
  getUserProfile,
} from '../../services/storage';
import {
  getRegisteredUsers,
  sendRoomInvitation,
  createOnlineRoom,
  UserPresenceInfo,
} from '../../firebase/onlineGameService';
import { useFirebaseAuth } from '../../firebase/AuthContext';
import { soundService } from '../../services/sound';

interface FriendsProps {
  onStartPrivateWithFriend?: (roomCode: string) => void;
}

export const FriendsPage: React.FC<FriendsProps> = ({ onStartPrivateWithFriend }) => {
  const { currentUser } = useFirebaseAuth();
  const [friends, setFriends] = useState<Friend[]>(getFriends());
  const [registeredUsers, setRegisteredUsers] = useState<UserPresenceInfo[]>([]);
  const [newFriendInput, setNewFriendInput] = useState('');
  const [invitingFriendId, setInvitingFriendId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'my_friends' | 'find_players'>('my_friends');

  const user = getUserProfile();

  // Load registered users and sync online status
  useEffect(() => {
    async function loadOnlineUsers() {
      const users = await getRegisteredUsers();
      setRegisteredUsers(users);

      // Merge real online presence into stored friends
      const localFriends = getFriends();
      const updated = localFriends.map((f) => {
        const found = users.find((u) => u.userId === f.id || u.name.toLowerCase() === f.name.toLowerCase());
        if (found) {
          return {
            ...f,
            isOnline: found.isOnline,
            status: found.status,
            level: found.level || f.level,
            lastSeen: found.lastSeen,
          };
        }
        return f;
      });

      setFriends(updated);
      saveFriends(updated);
    }

    loadOnlineUsers();
    const interval = setInterval(loadOnlineUsers, 15000);
    return () => clearInterval(interval);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAddFriend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFriendInput.trim()) return;
    soundService.playClick();

    const queryStr = newFriendInput.trim().toLowerCase();
    const matchedUser = registeredUsers.find(
      (u) => u.name.toLowerCase() === queryStr || u.userId === queryStr
    );

    const newF: Friend = {
      id: matchedUser ? matchedUser.userId : `f-${Date.now()}`,
      name: matchedUser ? matchedUser.name : newFriendInput.trim(),
      avatar: matchedUser ? matchedUser.avatar : '👤',
      level: matchedUser ? matchedUser.level : 1,
      isOnline: matchedUser ? matchedUser.isOnline : false,
      status: matchedUser ? matchedUser.status : 'offline',
      lastSeen: matchedUser ? matchedUser.lastSeen : 'الآن',
    };

    const updated = addFriend(newF);
    setFriends(updated);
    setNewFriendInput('');
    showToast(`✓ تمت إضافة ${newF.name} إلى قائمة أصدقائك بنجاح!`);
  };

  const handleQuickAddUser = (target: UserPresenceInfo) => {
    soundService.playClick();
    const newF: Friend = {
      id: target.userId,
      name: target.name,
      avatar: target.avatar,
      level: target.level,
      isOnline: target.isOnline,
      status: target.status,
      lastSeen: target.lastSeen,
    };
    const updated = addFriend(newF);
    setFriends(updated);
    showToast(`✓ تمت إضافة ${target.name} كصديق!`);
  };

  const handleRemoveFriend = (friendId: string, friendName: string) => {
    soundService.playClick();
    const updated = removeFriend(friendId);
    setFriends(updated);
    showToast(`تم حذف ${friendName} من القائمة.`);
  };

  const handleInviteToPrivateGame = async (friend: Friend) => {
    soundService.playClick();
    setInvitingFriendId(friend.id);

    try {
      // 1. Create a private room on Firebase
      const code = `DWN-${Math.floor(100 + Math.random() * 900)}`;
      const room = await createOnlineRoom(code, user.name, 30);

      // 2. Send the real-time invitation to the friend
      await sendRoomInvitation({
        toUserId: friend.id,
        roomId: room.roomId,
        roomCode: room.roomCode,
        senderName: user.name,
      });

      showToast(`✓ تم إنشاء الغرفة (${room.roomCode}) وإرسال دعوة فورية إلى ${friend.name}!`);

      // 3. Launch room or callback
      if (onStartPrivateWithFriend) {
        onStartPrivateWithFriend(room.roomCode);
      }
    } catch (err) {
      console.error('Failed to invite friend:', err);
      showToast('تعذر إرسال الدعوة. تأكد من اتصال الإنترنت.');
    } finally {
      setTimeout(() => setInvitingFriendId(null), 2500);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 select-none space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl sm:text-4xl font-black text-white mb-2 flex items-center justify-center gap-2">
          <span>👥</span>
          <span>أصدقاء وربع ديوان البلوت</span>
        </h1>
        <p className="text-xs sm:text-sm text-gray-300 max-w-lg mx-auto">
          تابع حالة أصدقائك المتصلين لحظة بلحظة، وادعهم مباشرة بنقرة واحدة للانضمام إلى ديوانيتك الخاصة
        </p>
      </div>

      {toastMessage && (
        <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs px-4 py-2.5 rounded-xl text-center shadow-lg animate-in fade-in">
          {toastMessage}
        </div>
      )}

      {/* Tabs: My Friends vs Find Players */}
      <div className="flex justify-center gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('my_friends')}
          className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
            activeTab === 'my_friends'
              ? 'bg-amber-500 text-black border-amber-400 shadow-md font-black'
              : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
          }`}
        >
          أصدقائي ({friends.length}) 👥
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('find_players')}
          className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
            activeTab === 'find_players'
              ? 'bg-amber-500 text-black border-amber-400 shadow-md font-black'
              : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
          }`}
        >
          البحث عن لاعبين ولاعبون متصلون ({registeredUsers.filter((u) => u.isOnline).length} متصل) 🔍
        </button>
      </div>

      {/* Add Friend Input Form */}
      <form onSubmit={handleAddFriend} className="flex gap-2 bg-[#0f2319] p-2 rounded-2xl border border-white/10">
        <input
          type="text"
          value={newFriendInput}
          onChange={(e) => setNewFriendInput(e.target.value)}
          placeholder="أدخل اسم اللاعب أو معرفه لإضافته كصديق..."
          className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
        />
        <button
          type="submit"
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-black font-black text-sm shadow-md transition-all cursor-pointer shrink-0"
        >
          إضافة صديق ➕
        </button>
      </form>

      {/* TAB 1: MY FRIENDS */}
      {activeTab === 'my_friends' && (
        <div className="space-y-3">
          {friends.length === 0 ? (
            <div className="bg-[#0f2319] border border-white/10 rounded-3xl p-8 text-center space-y-3">
              <span className="text-4xl block">🤝</span>
              <h3 className="text-sm font-bold text-gray-200">لم تضف أصدقاء بعد!</h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
                اكتب اسم صديقك أعلاه أو استعرض قائمة اللاعبين المتصلين في تبويب "البحث عن لاعبين" لإضافتهم ودعوتهم للعب.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('find_players')}
                className="px-4 py-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold hover:bg-amber-500/30 transition-all cursor-pointer"
              >
                استعراض اللاعبين المتصلين الآن ←
              </button>
            </div>
          ) : (
            friends.map((f) => (
              <div
                key={f.id}
                className="bg-[#0d2016] border border-white/10 hover:border-amber-400/40 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md transition-all"
              >
                <div className="flex items-center gap-3.5 w-full sm:w-auto text-right">
                  <div className="relative">
                    <span className="text-3xl sm:text-4xl block">{f.avatar}</span>
                    <span
                      className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-[#0d2016] ${
                        f.isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'
                      }`}
                      title={f.isOnline ? 'متصل الآن' : 'غير متصل'}
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-gray-100 text-sm sm:text-base">{f.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold">
                        مستوى {f.level}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs">
                      <span className={f.isOnline ? 'text-emerald-400 font-bold' : 'text-gray-400'}>
                        {f.isOnline ? '🟢 متصل الآن بالديوان' : `⚪ غير متصل (${f.lastSeen || 'سابقاً'})`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions: Invite & Delete */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => handleInviteToPrivateGame(f)}
                    disabled={invitingFriendId === f.id}
                    className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-black shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      f.isOnline
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 text-white shadow-emerald-900/30'
                        : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    <span>🚪</span>
                    <span>
                      {invitingFriendId === f.id ? 'جارٍ إرسال الدعوة...' : 'دعوة للعب في غرفة خاصة'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRemoveFriend(f.id, f.name)}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-rose-900/30 text-gray-400 hover:text-rose-300 border border-white/10 transition-all cursor-pointer"
                    title="حذف من الأصدقاء"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: FIND & EXPLORE REGISTERED PLAYERS */}
      {activeTab === 'find_players' && (
        <div className="space-y-3">
          <div className="text-xs text-gray-400 mb-2">
            اللاعبون المسجلون والمتصلون حالياً في ديوان البلوت:
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {registeredUsers
              .filter((u) => u.userId !== currentUser?.uid && u.userId !== user.id)
              .map((u) => {
                const isAlreadyFriend = friends.some((f) => f.id === u.userId || f.name === u.name);

                return (
                  <div
                    key={u.userId}
                    className="bg-[#0f2319] border border-white/10 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-sm hover:border-amber-400/30 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative">
                        <span className="text-3xl block">{u.avatar}</span>
                        <span
                          className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-[#0f2319] ${
                            u.isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'
                          }`}
                        />
                      </div>
                      <div className="text-right truncate">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="font-bold text-white text-sm truncate">{u.name}</span>
                          <span className="text-[10px] text-amber-300 font-semibold shrink-0">
                            (مستوى {u.level})
                          </span>
                        </div>
                        <span className={`text-[11px] block mt-0.5 ${u.isOnline ? 'text-emerald-300 font-bold' : 'text-gray-400'}`}>
                          {u.isOnline ? '🟢 متصل الآن' : `⚪ غير متصل (${u.lastSeen})`}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isAlreadyFriend}
                      onClick={() => handleQuickAddUser(u)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                        isAlreadyFriend
                          ? 'bg-white/5 border border-white/10 text-gray-400 cursor-default'
                          : 'bg-amber-500 hover:bg-amber-400 text-black shadow-sm'
                      }`}
                    >
                      {isAlreadyFriend ? 'صديق ✓' : 'إضافة ➕'}
                    </button>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};
