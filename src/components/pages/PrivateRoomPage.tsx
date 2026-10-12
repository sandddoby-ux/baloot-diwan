import React, { useState, useEffect } from 'react';
import {
  createOnlineRoom,
  joinOnlineRoom,
  subscribeToOnlineRoom,
  fillRemainingSeatsWithBots,
  leaveOnlineRoom,
  sendRoomChatMessage,
  subscribeToRoomChat,
  updateRoomTimer,
  sendRoomInvitation,
  getRegisteredUsers,
  UserPresenceInfo,
  OnlineRoomData,
  OnlineChatMessage,
} from '../../firebase/onlineGameService';
import { getUserProfile, trackChallengeProgress, getFriends, Friend } from '../../services/storage';
import { BalootLogo } from '../common/BalootLogo';
import { soundService } from '../../services/sound';
import { VipUpgradePromptModal } from '../payment/VipUpgradePromptModal';

interface PrivateRoomProps {
  onStartGame: (mode: 'private', roomCode?: string, roomId?: string, turnTimer?: number) => void;
  initialRoomCode?: string;
  onSelectTab?: (tab: string) => void;
}

export const PrivateRoomPage: React.FC<PrivateRoomProps> = ({ onStartGame, initialRoomCode, onSelectTab }) => {
  const [activeRoom, setActiveRoom] = useState<OnlineRoomData | null>(null);
  const [joinCodeInput, setJoinCodeInput] = useState<string>(initialRoomCode || '');
  const [turnTimer, setTurnTimer] = useState<number>(30);
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // In-lobby chat
  const [lobbyMessages, setLobbyMessages] = useState<OnlineChatMessage[]>([]);
  const [lobbyChatText, setLobbyChatText] = useState('');

  // Friends & Invitation state
  const [friendsList, setFriendsList] = useState<Friend[]>(getFriends());
  const [registeredUsers, setRegisteredUsers] = useState<UserPresenceInfo[]>([]);
  const [invitedFriendIds, setInvitedFriendIds] = useState<Record<string, boolean>>({});
  const [inviteSuccessMsg, setInviteSuccessMsg] = useState<string | null>(null);

  // VIP paywall modal state
  const [showVipModal, setShowVipModal] = useState(false);
  const [vipReason, setVipReason] = useState<{ title: string; desc: string }>({
    title: 'مؤقتات اللعب المخصصة مقفلة',
    desc: 'مؤقتات السرعة الخاطفة (10ث و15ث) والتفكير المتأني (45ث) حصرية لمشتركي ديوان VIP عبر كاشير. اشترك الآن بخصم 62% لتحكم كامل في إعدادات اللعب.',
  });

  const user = getUserProfile();
  const isHost = activeRoom && activeRoom.hostId === user.id;

  // Auto-join room if opened with initialRoomCode from invitation
  useEffect(() => {
    if (!initialRoomCode || activeRoom) return;
    async function autoJoin() {
      setIsJoining(true);
      try {
        const room = await joinOnlineRoom(initialRoomCode!.trim(), user.name);
        if (room) {
          setActiveRoom(room);
          soundService.playCardDeal();
        }
      } catch (e) {
        console.warn('Auto join invitation failed:', e);
      } finally {
        setIsJoining(false);
      }
    }
    autoJoin();
  }, [initialRoomCode, user.name]);

  // Load registered users and friends for real presence
  useEffect(() => {
    async function loadPresence() {
      const users = await getRegisteredUsers();
      setRegisteredUsers(users);

      // Merge online presence into saved friends
      const localFriends = getFriends();
      const updated = localFriends.map((f) => {
        const remoteUser = users.find((u) => u.userId === f.id || u.name === f.name);
        if (remoteUser) {
          return {
            ...f,
            isOnline: remoteUser.isOnline,
            status: remoteUser.status,
            level: remoteUser.level || f.level,
          };
        }
        return f;
      });
      setFriendsList(updated);
    }

    loadPresence();
    const interval = setInterval(loadPresence, 15000);
    return () => clearInterval(interval);
  }, []);

  // Real-time Firestore room subscription
  useEffect(() => {
    if (!activeRoom?.roomId) return;

    const unsubRoom = subscribeToOnlineRoom(activeRoom.roomId, (updatedRoom) => {
      if (!updatedRoom || updatedRoom.status === 'finished') {
        setActiveRoom(null);
        return;
      }

      setActiveRoom(updatedRoom);

      // If host started the game, transition all seated players automatically with exact timer!
      if (updatedRoom.status === 'playing') {
        onStartGame('private', updatedRoom.roomCode, updatedRoom.roomId, updatedRoom.turnTimer);
      }
    });

    const unsubChat = subscribeToRoomChat(activeRoom.roomId, (msgs) => {
      setLobbyMessages(msgs);
    });

    return () => {
      unsubRoom();
      unsubChat();
    };
  }, [activeRoom?.roomId, onStartGame]);

  const handleCreateRoom = async () => {
    soundService.playClick();
    setIsCreating(true);
    setJoinError(null);
    const code = `DWN-${Math.floor(100 + Math.random() * 900)}`;

    try {
      const room = await createOnlineRoom(code, user.name, turnTimer);
      setActiveRoom(room);
    } catch (e) {
      console.warn('Failed to create room online, falling back:', e);
      // Fallback local mock room
      setActiveRoom({
        roomId: `local_${Date.now()}`,
        roomCode: code,
        hostId: user.id,
        hostName: user.name,
        status: 'waiting',
        turnTimer,
        playerIds: [user.id],
        players: [{ id: user.id, name: user.name, avatar: user.avatar, seatIndex: 0, connected: true, ready: true }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) return;
    soundService.playClick();
    setIsJoining(true);
    setJoinError(null);

    try {
      const room = await joinOnlineRoom(joinCodeInput.trim(), user.name);
      if (room) {
        setActiveRoom(room);
        if (room.status === 'playing') {
          onStartGame('private', room.roomCode, room.roomId, room.turnTimer);
        }
      } else {
        setJoinError('لم يتم العثور على غرفة مفتوحة بهذا الرمز. تأكد من صحة الرمز.');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'تعذر الانضمام للغرفة';
      setJoinError(msg);
    } finally {
      setIsJoining(false);
    }
  };

  const handleFillBots = async () => {
    if (!activeRoom) return;
    soundService.playClick();
    try {
      const updated = await fillRemainingSeatsWithBots(activeRoom.roomId);
      if (updated) {
        setActiveRoom(updated);
      }
    } catch (err) {
      console.error('Error filling bots:', err);
    }
  };

  const handleStartMatch = async () => {
    if (!activeRoom) return;
    soundService.playClick();
    trackChallengeProgress('play_private', 1);

    const effectiveTimer = activeRoom.turnTimer || turnTimer || 30;

    if (activeRoom.players.length < 4) {
      try {
        const updated = await fillRemainingSeatsWithBots(activeRoom.roomId);
        if (updated) {
          setActiveRoom(updated);
          onStartGame('private', updated.roomCode, updated.roomId, effectiveTimer);
          return;
        }
      } catch (err) {
        console.error('Error auto-filling bots on match start:', err);
      }
    }
    onStartGame('private', activeRoom.roomCode, activeRoom.roomId, effectiveTimer);
  };

  const handleLeaveRoom = async () => {
    soundService.playClick();
    if (activeRoom) {
      await leaveOnlineRoom(activeRoom.roomId, user.id);
      setActiveRoom(null);
    }
  };

  const handleChangeTimerInLobby = async (newSec: number) => {
    if (!activeRoom || !isHost) return;

    if (newSec !== 30 && !user.isSubscriber) {
      setVipReason({
        title: `مؤقت السرعة (${newSec} ثوانٍ) مقفل`,
        desc: 'مؤقتات السرعة الخاطفة والمخصصة حصرية لمشتركي ديوان VIP عبر كاشير. اشترك الآن بخصم 62% لتحكم كامل في سرعة رميات الصكة بدون قيود!',
      });
      setShowVipModal(true);
      return;
    }

    soundService.playClick();
    setTurnTimer(newSec);
    setActiveRoom({ ...activeRoom, turnTimer: newSec });
    await updateRoomTimer(activeRoom.roomId, newSec);
  };

  const handleInviteFriendToRoom = async (targetId: string, targetName: string) => {
    if (!activeRoom) return;
    soundService.playClick();

    try {
      await sendRoomInvitation({
        toUserId: targetId,
        roomId: activeRoom.roomId,
        roomCode: activeRoom.roomCode,
        senderName: user.name,
      });

      setInvitedFriendIds((prev) => ({ ...prev, [targetId]: true }));
      setInviteSuccessMsg(`✓ تم إرسال دعوة فورية إلى ${targetName}!`);
      setTimeout(() => setInviteSuccessMsg(null), 3500);
    } catch (err) {
      console.error('Invite failed:', err);
    }
  };

  const handleCopyLink = () => {
    if (!activeRoom) return;
    const link = `https://balootdiwan.com/join/${activeRoom.roomCode}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    soundService.playClick();
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    if (!activeRoom) return;
    navigator.clipboard.writeText(activeRoom.roomCode);
    setCopiedCode(true);
    soundService.playClick();
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSendLobbyMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lobbyChatText.trim() || !activeRoom) return;
    await sendRoomChatMessage(activeRoom.roomId, user.name, lobbyChatText.trim());
    setLobbyChatText('');
  };

  // If in active room, show live lobby waiting view
  if (activeRoom) {
    const totalSeated = activeRoom.players.length;
    const isReadyToStart = totalSeated === 4;

    const seat0 = activeRoom.players.find((p) => p.seatIndex === 0);
    const seat1 = activeRoom.players.find((p) => p.seatIndex === 1);
    const seat2 = activeRoom.players.find((p) => p.seatIndex === 2);
    const seat3 = activeRoom.players.find((p) => p.seatIndex === 3);

    // Combined candidate list: saved friends prioritized + registered online users
    const seatedIds = new Set(activeRoom.playerIds);
    const combinedCandidates: UserPresenceInfo[] = [];
    const seenCandidateIds = new Set<string>();

    for (const f of friendsList) {
      if (f.id !== user.id && !seatedIds.has(f.id)) {
        combinedCandidates.push({
          userId: f.id,
          name: f.name,
          avatar: f.avatar,
          isOnline: !!f.isOnline,
          status: f.status || (f.isOnline ? 'online' : 'offline'),
          lastSeen: f.lastSeen || 'الآن',
          level: f.level || 1,
        });
        seenCandidateIds.add(f.id);
      }
    }

    for (const u of registeredUsers) {
      if (u.userId !== user.id && !seatedIds.has(u.userId) && !seenCandidateIds.has(u.userId)) {
        combinedCandidates.push(u);
        seenCandidateIds.add(u.userId);
      }
    }

    const inviteCandidates = combinedCandidates.slice(0, 8);

    return (
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 select-none space-y-6 animate-in fade-in duration-200">
        {inviteSuccessMsg && (
          <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs px-4 py-2.5 rounded-xl text-center shadow-lg animate-in fade-in">
            {inviteSuccessMsg}
          </div>
        )}

        {/* Header bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#10241b] border-2 border-[#c5a059]/40 rounded-3xl p-5 sm:p-6 shadow-xl">
          <div className="text-center sm:text-right">
            <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs text-emerald-300 font-bold">مجلس الانتظار • متصل بـ Firebase</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              ديوانية {activeRoom.hostName}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-300">وقت الرمية:</span>
              <span className="text-xs font-mono font-bold text-amber-300 bg-black/40 px-2 py-0.5 rounded-lg border border-amber-400/30">
                {activeRoom.turnTimer || 30} ثانية
              </span>
            </div>
          </div>

          {/* Room Code Badge */}
          <div className="flex items-center gap-2 bg-black/40 border border-amber-400/40 rounded-2xl px-4 py-2.5">
            <div className="text-center">
              <span className="text-[10px] text-gray-400 block">رمز الغرفة:</span>
              <span className="text-2xl font-black text-amber-300 tracking-wider font-mono">
                {activeRoom.roomCode}
              </span>
            </div>
            <div className="flex flex-col gap-1 pr-2 border-r border-white/10 mr-1">
              <button
                type="button"
                onClick={handleCopyCode}
                className="text-xs px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-bold transition-all cursor-pointer"
              >
                {copiedCode ? '✓ تم النسخ' : 'نسخ الرمز'}
              </button>
              <button
                type="button"
                onClick={handleCopyLink}
                className="text-xs px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 font-bold transition-all cursor-pointer"
              >
                {copiedLink ? '✓ تم النسخ' : 'نسخ الرابط'}
              </button>
            </div>
          </div>
        </div>

        {/* Turn Timer Selector for Host */}
        {isHost && (
          <div className="bg-[#0b1d14] border border-[#c5a059]/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
            <div className="text-right">
              <strong className="text-xs font-bold text-amber-200 block">⏱️ ضبط وقت الرمية للغرفة:</strong>
              <span className="text-[11px] text-gray-400">
                اختر سرعة اللعب المناسبة لمجلسك (يتم تفعيلها لجميع اللاعبين فوراً).
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[10, 15, 30, 45, 60].map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => handleChangeTimerInLobby(sec)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    (activeRoom.turnTimer || 30) === sec
                      ? 'bg-amber-500 text-black border-amber-400 shadow-md scale-105 font-black'
                      : 'bg-black/40 text-gray-300 border-white/10 hover:border-amber-400/40'
                  }`}
                >
                  {sec}ث {sec === 10 ? '⚡ خاطف' : sec === 15 ? '🚀 سريع' : sec === 30 ? '⏱️ قياسي' : ''}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 4 Seats Gathering Table Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {/* Seat 0: Host (Bottom / Player 0) */}
          <div className="bg-[#142d22] border-2 border-amber-400/60 rounded-2xl p-4 text-center shadow-lg flex flex-col justify-between min-h-[140px]">
            <div className="text-xs text-amber-300 font-bold flex items-center justify-center gap-1 mb-2">
              <span>👑</span>
              <span>المقعد 1 (المضيف)</span>
            </div>
            <div className="my-auto">
              <span className="text-3xl block mb-1">{seat0?.avatar || '🦅'}</span>
              <strong className="text-sm font-black text-white block truncate">{seat0?.name}</strong>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold mt-2">جاهز للصكة ✓</span>
          </div>

          {/* Seat 1: Right (Opponent 1) */}
          <div
            className={`rounded-2xl p-4 text-center shadow-lg flex flex-col justify-between min-h-[140px] border-2 transition-all ${
              seat1
                ? 'bg-[#142d22] border-emerald-500/50'
                : 'bg-black/30 border-dashed border-white/15'
            }`}
          >
            <div className="text-xs text-gray-400 font-bold mb-2">المقعد 2 (يمينك)</div>
            {seat1 ? (
              <div className="my-auto">
                <span className="text-3xl block mb-1">{seat1.avatar}</span>
                <strong className="text-sm font-black text-white block truncate">{seat1.name}</strong>
                <span className="text-[10px] text-emerald-400 font-bold mt-2 block">منضم ✓</span>
              </div>
            ) : (
              <div className="my-auto text-gray-500 space-y-1">
                <span className="text-2xl block opacity-40">👤</span>
                <span className="text-xs block">شاغر</span>
                <span className="text-[10px] text-amber-400/80 block">بانتظار لاعب...</span>
              </div>
            )}
          </div>

          {/* Seat 2: Top (Partner) */}
          <div
            className={`rounded-2xl p-4 text-center shadow-lg flex flex-col justify-between min-h-[140px] border-2 transition-all ${
              seat2
                ? 'bg-[#142d22] border-amber-400/50'
                : 'bg-black/30 border-dashed border-white/15'
            }`}
          >
            <div className="text-xs text-amber-300/80 font-bold mb-2">المقعد 3 (خويّك)</div>
            {seat2 ? (
              <div className="my-auto">
                <span className="text-3xl block mb-1">{seat2.avatar}</span>
                <strong className="text-sm font-black text-white block truncate">{seat2.name}</strong>
                <span className="text-[10px] text-emerald-400 font-bold mt-2 block">منضم ✓</span>
              </div>
            ) : (
              <div className="my-auto text-gray-500 space-y-1">
                <span className="text-2xl block opacity-40">🧕🏻</span>
                <span className="text-xs block">شاغر</span>
                <span className="text-[10px] text-amber-400/80 block">بانتظار خويك...</span>
              </div>
            )}
          </div>

          {/* Seat 3: Left (Opponent 2) */}
          <div
            className={`rounded-2xl p-4 text-center shadow-lg flex flex-col justify-between min-h-[140px] border-2 transition-all ${
              seat3
                ? 'bg-[#142d22] border-emerald-500/50'
                : 'bg-black/30 border-dashed border-white/15'
            }`}
          >
            <div className="text-xs text-gray-400 font-bold mb-2">المقعد 4 (يسارك)</div>
            {seat3 ? (
              <div className="my-auto">
                <span className="text-3xl block mb-1">{seat3.avatar}</span>
                <strong className="text-sm font-black text-white block truncate">{seat3.name}</strong>
                <span className="text-[10px] text-emerald-400 font-bold mt-2 block">منضم ✓</span>
              </div>
            ) : (
              <div className="my-auto text-gray-500 space-y-1">
                <span className="text-2xl block opacity-40">👤</span>
                <span className="text-xs block">شاغر</span>
                <span className="text-[10px] text-amber-400/80 block">بانتظار لاعب...</span>
              </div>
            )}
          </div>
        </div>

        {/* INVITE ONLINE FRIENDS / PLAYERS PANEL */}
        <div className="bg-[#0f2319] border border-[#c5a059]/30 rounded-3xl p-5 sm:p-6 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-amber-200 flex items-center gap-2">
              <span>👥</span>
              <span>دعوة الأصدقاء واللاعبين المتصلين للمجلس اللحظي</span>
            </h3>
            <span className="text-[11px] text-gray-400">
              يصلهم إشعار دعوة فوري داخل التطبيق
            </span>
          </div>

          {inviteCandidates.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-3 bg-black/20 rounded-xl">
              لا يوجد لاعبون آخرون متصلون حالياً. يمكنك نسخ رمز الغرفة ({activeRoom.roomCode}) وإرساله لأصحابك مباشرة!
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {inviteCandidates.map((p) => {
                const isInvited = invitedFriendIds[p.userId];
                return (
                  <div
                    key={p.userId}
                    className="bg-black/30 border border-white/10 rounded-xl p-2.5 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-2xl shrink-0">{p.avatar}</span>
                      <div className="text-right truncate">
                        <span className="text-xs font-bold text-gray-200 block truncate">{p.name}</span>
                        <div className="flex items-center gap-1.5 text-[10px]">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              p.isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'
                            }`}
                          />
                          <span className={p.isOnline ? 'text-emerald-300' : 'text-gray-400'}>
                            {p.isOnline ? 'متصل الآن' : 'غير متصل'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isInvited}
                      onClick={() => handleInviteFriendToRoom(p.userId, p.name)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                        isInvited
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500 hover:bg-amber-400 text-black shadow-sm'
                      }`}
                    >
                      {isInvited ? '✓ تم الإرسال' : 'دعوة ✉️'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Lobby Actions */}
        <div className="bg-[#0f2319] border border-[#c5a059]/30 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <span className="text-sm font-bold text-white block">
                حالة اكتمال الطاولة: {totalSeated} من 4 مقاعد
              </span>
              <span className="text-xs text-gray-400">
                {isReadyToStart
                  ? 'اكتملت المقاعد الأربعة! جاهزون لبدء الصكة فوراً.'
                  : 'شارك الرمز أو الرابط مع أصحابك للدخول، أو املأ المقاعد بروبوتات ذكية.'}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              {isHost && !isReadyToStart && (
                <button
                  type="button"
                  onClick={handleFillBots}
                  className="flex-1 sm:flex-none py-2.5 px-4 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 border border-blue-400/40 text-blue-200 text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  🤖 ملء المقاعد الشاغرة بالروبوتات
                </button>
              )}

              {isHost ? (
                <button
                  type="button"
                  onClick={handleStartMatch}
                  className="flex-1 sm:flex-none py-3 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 text-white font-black text-sm shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  {isReadyToStart ? '🚀 إطلاق وبدء الصكة' : '🚀 بدء الصكة (إكمال الباقي بروبوتات)'}
                </button>
              ) : (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <span>بانتظار إطلاق الصكة من المضيف...</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleLeaveRoom}
                className="py-2.5 px-4 rounded-xl bg-red-950/50 hover:bg-red-900 border border-red-500/30 text-red-300 text-xs font-bold transition-all cursor-pointer"
              >
                مغادرة 🚪
              </button>
            </div>
          </div>

          {/* In-Lobby Live Chat */}
          <div className="border-t border-white/10 pt-4 space-y-3">
            <span className="text-xs font-bold text-amber-300 block">دردشة المجلس اللحظية:</span>
            <div className="bg-black/30 rounded-2xl p-3 h-28 overflow-y-auto space-y-1.5 text-xs">
              {lobbyMessages.length === 0 ? (
                <span className="text-gray-500 block text-center py-4">
                  لا توجد رسائل بعد. رحب باللاعبين الحاضرين!
                </span>
              ) : (
                lobbyMessages.map((msg) => (
                  <div key={msg.id} className="flex items-baseline gap-2">
                    <span className="font-bold text-amber-200">{msg.senderName}:</span>
                    <span className="text-gray-200">{msg.text}</span>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleSendLobbyMessage} className="flex gap-2">
              <input
                type="text"
                value={lobbyChatText}
                onChange={(e) => setLobbyChatText(e.target.value)}
                placeholder="اكتب رسالة للحاضرين في المجلس..."
                className="flex-1 bg-black/40 border border-white/20 rounded-xl px-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
                maxLength={100}
              />
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                إرسال 💬
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Initial Rooms Screen (Create or Join)
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 select-none">
      <div className="text-center mb-8 flex flex-col items-center">
        <div className="mb-3">
          <BalootLogo size="lg" showText={false} withGlow={true} />
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-white mb-2">
          الديوانية الخاصة (لعب مع الأصدقاء) 🚪
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 max-w-lg">
          أنشئ غرفتك الخاصة، حدد وقت الرمية المناسب، وادعُ أصحابك للانضمام فوراً عبر الرمز أو الرابط المباشر
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CREATE ROOM PANEL */}
        <div className="bg-[#10241b] border-2 border-[#c5a059]/40 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-xl">
                ➕
              </span>
              <div>
                <h2 className="text-lg font-black text-amber-200">إنشاء ديوانية جديدة</h2>
                <span className="text-xs text-gray-400">كن أنت صاحب الجلسة والمضيف</span>
              </div>
            </div>

            <div className="space-y-4 my-6">
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-2">
                  مدة رمي الورقة (الوقت المستغرق لكل لاعب):
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[15, 30, 45, 60].map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => {
                        if (sec !== 30 && !user.isSubscriber) {
                          setVipReason({
                            title: `مؤقت السرعة (${sec} ثوانٍ) مقفل`,
                            desc: 'مؤقتات السرعة الخاطفة والمخصصة حصرية لمشتركي ديوان VIP عبر كاشير. اشترك الآن بخصم 62% لضبط مؤقتات اللعب بحرية!',
                          });
                          setShowVipModal(true);
                          return;
                        }
                        setTurnTimer(sec);
                      }}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        turnTimer === sec
                          ? 'border-amber-400 bg-amber-500/20 text-amber-300 shadow-md'
                          : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/30'
                      }`}
                    >
                      {sec} ثانية {sec !== 30 && !user.isSubscriber ? '🔒' : ''}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-black/30 p-3 rounded-xl border border-white/5 text-xs text-gray-400 leading-relaxed">
                💡 سيتم إنشاء غرفة حقيقية على خوادم Firebase السحابية، وستفتح لك مجلس انتظار لحظي يتيح لك دعوة أصدقائك أو ملء المقاعد بروبوتات ذكية.
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCreateRoom}
            disabled={isCreating}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 disabled:opacity-50 text-black font-black text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isCreating ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                <span>جارٍ فتح الغرفة سحابياً...</span>
              </>
            ) : (
              <span>تأكيد وإنشاء الغرفة 🔑</span>
            )}
          </button>
        </div>

        {/* JOIN ROOM PANEL */}
        <div className="bg-[#10241b] border-2 border-white/10 hover:border-emerald-500/40 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-xl">
                🔗
              </span>
              <div>
                <h2 className="text-lg font-black text-emerald-200">الانضمام لديوانية قائمة</h2>
                <span className="text-xs text-gray-400">أدخل الرمز الذي أرسله لك خويّك</span>
              </div>
            </div>

            <form onSubmit={handleJoin} className="space-y-4 my-6">
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-2">
                  رمز الغرفة (Room Code):
                </label>
                <input
                  type="text"
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value)}
                  placeholder="مثال: DWN-720 أو 849312"
                  className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-3 text-center text-lg font-black text-amber-300 placeholder-gray-500 tracking-wider uppercase focus:outline-none focus:border-amber-400"
                />
                {joinError && (
                  <span className="text-xs text-rose-400 block mt-1.5 font-bold text-center">
                    ⚠️ {joinError}
                  </span>
                )}
              </div>

              <div className="bg-black/30 p-3 rounded-xl border border-white/5 text-xs text-gray-400 leading-relaxed">
                📌 بمجرد إدخال الرمز، ستنتقل مباشرة إلى مجلس الانتظار وتلتقي بأعضاء الصكة.
              </div>
            </form>
          </div>

          <button
            type="button"
            onClick={handleJoin}
            disabled={!joinCodeInput.trim() || isJoining}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 disabled:opacity-40 text-white font-black text-sm shadow-lg transition-all cursor-pointer"
          >
            {isJoining ? 'جارٍ التحقق والدخول...' : 'الانضمام للغرفة الآن 🚪'}
          </button>
        </div>
      </div>

      {/* VIP Upgrade Paywall Prompt */}
      <VipUpgradePromptModal
        isOpen={showVipModal}
        onClose={() => setShowVipModal(false)}
        reasonTitle={vipReason.title}
        reasonDescription={vipReason.desc}
        onUpgradeClick={() => {
          setShowVipModal(false);
          if (onSelectTab) onSelectTab('subscription');
        }}
      />
    </div>
  );
};
