export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  email?: string;
  level: number;
  xp: number;
  isSubscriber: boolean;
  subscriptionPlan?: 'free' | 'monthly' | 'annual' | 'hawameer';
  subscriptionExpiresAt?: string;
  subscriptionAutoRenew?: boolean;
  kashierReference?: string;
  dailyMatchesLimit?: number; // 5 for free users, unlimited (Infinity) for VIP
  dailyMatchesUsed?: number;
  dailyMatchesDate?: string;
  tableTheme: 'emerald' | 'royal_blue' | 'majlis_crimson' | 'onyx_gold';
  cardBackTheme: 'heritage_gold' | 'royal_green' | 'classic_blue' | 'falcon_crimson';
  stats: {
    matchesPlayed: number;
    matchesWon: number;
    matchesLost: number;
    sunWins: number;
    hokomWins: number;
    kabootsAchieved: number;
    totalAbnatScored: number;
    winRate: number;
  };
  coins: number; // In-game prestige tokens (purely cosmetic, earned through playing and daily challenges)
  createdAt?: string;
}

export interface Friend {
  id: string;
  name: string;
  avatar: string;
  level: number;
  isOnline: boolean;
  status: 'online' | 'in_game' | 'offline';
  lastSeen: string;
}

export type ChallengeEventType =
  | 'play_match'
  | 'win_match'
  | 'win_sun'
  | 'win_hokom'
  | 'announce_project'
  | 'play_private'
  | 'kaboot'
  | 'score_abnat';

export interface DailyChallenge {
  id: string;
  type: ChallengeEventType;
  title: string;
  description: string;
  target: number;
  current: number;
  rewardXp: number;
  rewardCoins: number;
  completed: boolean;
  claimed: boolean;
  icon: string;
}

export interface GameHistoryEntry {
  id: string;
  date: string;
  mode: 'quick' | 'private' | 'bot' | 'training';
  contractType: 'sun' | 'hokom';
  result: 'win' | 'loss';
  finalScoreUs: number;
  finalScoreThem: number;
  partnerName: string;
  durationMinutes: number;
}

const STORAGE_KEYS = {
  USER: 'baloot_user_profile',
  HISTORY: 'baloot_game_history',
  CHALLENGES: 'baloot_challenges_data',
  FRIENDS: 'baloot_friends',
  ANALYTICS: 'baloot_analytics_events',
};

const DEFAULT_USER: UserProfile = {
  id: `usr-${Math.random().toString(36).substring(2, 8)}`,
  name: 'لاعب جديد',
  avatar: '🦅',
  level: 1,
  xp: 0,
  isSubscriber: false,
  subscriptionPlan: 'free',
  tableTheme: 'emerald',
  cardBackTheme: 'heritage_gold',
  stats: {
    matchesPlayed: 0,
    matchesWon: 0,
    matchesLost: 0,
    sunWins: 0,
    hokomWins: 0,
    kabootsAchieved: 0,
    totalAbnatScored: 0,
    winRate: 0,
  },
  coins: 0, // Starts at 0 real tokens
  createdAt: new Date().toISOString(),
};

const DEFAULT_FRIENDS: Friend[] = [];

export const DAILY_CHALLENGE_TEMPLATES: Omit<DailyChallenge, 'current' | 'completed' | 'claimed'>[] = [
  {
    id: 'dc-play-match',
    type: 'play_match',
    title: 'صكة اليوم',
    description: 'العب صكة بلوت رسمية حتى النهاية (بلوغ 152 نقطة)',
    target: 1,
    rewardXp: 120,
    rewardCoins: 20,
    icon: '🎴',
  },
  {
    id: 'dc-win-sun',
    type: 'win_sun',
    title: 'فوز الصن الحاسم',
    description: 'حقق الفوز في مباراة لُعبت بعقد الصن ☀️',
    target: 1,
    rewardXp: 200,
    rewardCoins: 35,
    icon: '☀️',
  },
  {
    id: 'dc-win-hokom',
    type: 'win_hokom',
    title: 'سلطان الحكم',
    description: 'حقق الفوز في مباراة لُعبت بعقد الحكم ⚔️',
    target: 1,
    rewardXp: 200,
    rewardCoins: 35,
    icon: '⚔️',
  },
  {
    id: 'dc-projects',
    type: 'announce_project',
    title: 'مهندس المشاريع',
    description: 'أعلن عن مشروع سرة أو خمسين أو مية أو بلوت في جولة رسمية',
    target: 2,
    rewardXp: 160,
    rewardCoins: 30,
    icon: '📜',
  },
  {
    id: 'dc-private-room',
    type: 'play_private',
    title: 'الديوانية العامرة',
    description: 'أنشئ أو انضم إلى ديوانية خاصة مع الأصدقاء والربع',
    target: 1,
    rewardXp: 250,
    rewardCoins: 50,
    icon: '🏛️',
  },
  {
    id: 'dc-score-points',
    type: 'score_abnat',
    title: 'حاصد الأبناط',
    description: 'احصد 100 بنط/نقطة لفريقك في مجموع الجولات',
    target: 100,
    rewardXp: 220,
    rewardCoins: 40,
    icon: '🎯',
  },
];

const DEFAULT_HISTORY: GameHistoryEntry[] = [];

/**
 * Returns today's date string in YYYY-MM-DD
 */
export function getTodayDateString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function getUserProfile(): UserProfile {
  if (typeof window === 'undefined') return DEFAULT_USER;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(DEFAULT_USER));
      return DEFAULT_USER;
    }
    const parsed = JSON.parse(raw);
    // Ensure all stat keys exist cleanly
    return {
      ...DEFAULT_USER,
      ...parsed,
      stats: {
        matchesPlayed: parsed.stats?.matchesPlayed ?? 0,
        matchesWon: parsed.stats?.matchesWon ?? 0,
        matchesLost: parsed.stats?.matchesLost ?? 0,
        sunWins: parsed.stats?.sunWins ?? 0,
        hokomWins: parsed.stats?.hokomWins ?? 0,
        kabootsAchieved: parsed.stats?.kabootsAchieved ?? 0,
        totalAbnatScored: parsed.stats?.totalAbnatScored ?? 0,
        winRate: parsed.stats?.matchesPlayed > 0 
          ? Math.round((parsed.stats.matchesWon / parsed.stats.matchesPlayed) * 100) 
          : 0,
      },
      coins: parsed.coins ?? 0,
      dailyMatchesLimit: parsed.isSubscriber ? Infinity : 5,
      dailyMatchesUsed: parsed.dailyMatchesDate === getTodayDateString() ? (parsed.dailyMatchesUsed ?? 0) : 0,
      dailyMatchesDate: parsed.dailyMatchesDate || getTodayDateString(),
    };
  } catch {
    return DEFAULT_USER;
  }
}

export function isUserVip(user?: UserProfile): boolean {
  const u = user || getUserProfile();
  return Boolean(u.isSubscriber);
}

export function getDailyMatchesStatus(user?: UserProfile): {
  used: number;
  limit: number;
  remaining: number;
  isUnlimited: boolean;
  resetsInHours: number;
} {
  const u = user || getUserProfile();
  const today = getTodayDateString();
  const isVip = Boolean(u.isSubscriber);

  if (isVip) {
    return {
      used: u.dailyMatchesDate === today ? (u.dailyMatchesUsed ?? 0) : 0,
      limit: Infinity,
      remaining: Infinity,
      isUnlimited: true,
      resetsInHours: 0,
    };
  }

  const limit = 5;
  const used = u.dailyMatchesDate === today ? (u.dailyMatchesUsed ?? 0) : 0;
  const remaining = Math.max(0, limit - used);

  const now = new Date();
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  const resetsInHours = Math.max(1, Math.ceil((endOfDay.getTime() - now.getTime()) / (1000 * 60 * 60)));

  return {
    used,
    limit,
    remaining,
    isUnlimited: false,
    resetsInHours,
  };
}

export function canStartMatch(user?: UserProfile): boolean {
  const status = getDailyMatchesStatus(user);
  return status.isUnlimited || status.remaining > 0;
}

export function consumeDailyMatch(): boolean {
  const u = getUserProfile();
  if (u.isSubscriber) return true;

  const today = getTodayDateString();
  const currentUsed = u.dailyMatchesDate === today ? (u.dailyMatchesUsed ?? 0) : 0;
  if (currentUsed >= 5) return false;

  u.dailyMatchesDate = today;
  u.dailyMatchesUsed = currentUsed + 1;
  saveUserProfile(u);
  return true;
}

export function saveUserProfile(user: UserProfile) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    window.dispatchEvent(new CustomEvent('baloot_user_updated', { detail: user }));
  } catch (e) {
    console.error('Failed to save user profile', e);
  }
}

export function recalculateStatsFromHistory(): UserProfile {
  const user = getUserProfile();
  const history = getGameHistory();

  let matchesPlayed = history.length;
  let matchesWon = 0;
  let matchesLost = 0;
  let sunWins = 0;
  let hokomWins = 0;
  let totalAbnatScored = 0;

  for (const h of history) {
    totalAbnatScored += (h.finalScoreUs || 0);
    if (h.result === 'win') {
      matchesWon++;
      if (h.contractType === 'sun') sunWins++;
      else hokomWins++;
    } else {
      matchesLost++;
    }
  }

  user.stats = {
    matchesPlayed,
    matchesWon,
    matchesLost,
    sunWins,
    hokomWins,
    kabootsAchieved: user.stats?.kabootsAchieved || 0,
    totalAbnatScored,
    winRate: matchesPlayed > 0 ? Math.round((matchesWon / matchesPlayed) * 100) : 0,
  };

  saveUserProfile(user);
  return user;
}

export function resetUserStatsToZero(): UserProfile {
  const user = getUserProfile();
  user.stats = {
    matchesPlayed: 0,
    matchesWon: 0,
    matchesLost: 0,
    sunWins: 0,
    hokomWins: 0,
    kabootsAchieved: 0,
    totalAbnatScored: 0,
    winRate: 0,
  };
  saveUserProfile(user);
  return user;
}

export function getFriends(): Friend[] {
  if (typeof window === 'undefined') return DEFAULT_FRIENDS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FRIENDS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.FRIENDS, JSON.stringify(DEFAULT_FRIENDS));
      return DEFAULT_FRIENDS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_FRIENDS;
  }
}

export function saveFriends(friends: Friend[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.FRIENDS, JSON.stringify(friends));
    window.dispatchEvent(new CustomEvent('baloot_friends_updated', { detail: friends }));
  } catch (e) {
    console.error('Failed to save friends', e);
  }
}

export function addFriend(friend: Friend): Friend[] {
  const current = getFriends();
  const exists = current.some((f) => f.id === friend.id || f.name.toLowerCase() === friend.name.toLowerCase());
  if (exists) return current;
  const updated = [friend, ...current];
  saveFriends(updated);
  return updated;
}

export function removeFriend(friendId: string): Friend[] {
  const current = getFriends();
  const updated = current.filter((f) => f.id !== friendId);
  saveFriends(updated);
  return updated;
}

interface StoredChallengesPayload {
  date: string;
  challenges: DailyChallenge[];
}

function buildFreshDailyChallenges(): DailyChallenge[] {
  return DAILY_CHALLENGE_TEMPLATES.map((tmpl) => ({
    ...tmpl,
    current: 0,
    completed: false,
    claimed: false,
  }));
}

export function getChallenges(): DailyChallenge[] {
  if (typeof window === 'undefined') return buildFreshDailyChallenges();
  try {
    const today = getTodayDateString();
    const raw = localStorage.getItem(STORAGE_KEYS.CHALLENGES);

    if (raw) {
      const parsed: StoredChallengesPayload = JSON.parse(raw);
      if (parsed && parsed.date === today && Array.isArray(parsed.challenges) && parsed.challenges.length > 0) {
        return parsed.challenges;
      }
    }

    // New day or missing data: create fresh challenges for today
    const fresh = buildFreshDailyChallenges();
    saveChallenges(fresh);
    return fresh;
  } catch {
    return buildFreshDailyChallenges();
  }
}

export function saveChallenges(challenges: DailyChallenge[]) {
  if (typeof window === 'undefined') return;
  try {
    const payload: StoredChallengesPayload = {
      date: getTodayDateString(),
      challenges,
    };
    localStorage.setItem(STORAGE_KEYS.CHALLENGES, JSON.stringify(payload));
    window.dispatchEvent(new CustomEvent('baloot_challenges_updated', { detail: challenges }));
  } catch (e) {
    console.error('Failed to save challenges', e);
  }
}

/**
 * Updates challenges when game events occur
 */
export function trackChallengeProgress(type: ChallengeEventType, count = 1): DailyChallenge[] {
  const currentChallenges = getChallenges();
  let hasChanges = false;

  const updated = currentChallenges.map((c) => {
    if (c.claimed) return c; // Already claimed

    let matches = false;
    if (type === 'play_match' && c.type === 'play_match') matches = true;
    if (type === 'win_match' && (c.type === 'win_match' || c.type === 'play_match')) matches = true;
    if (type === 'win_sun' && c.type === 'win_sun') matches = true;
    if (type === 'win_hokom' && c.type === 'win_hokom') matches = true;
    if (type === 'announce_project' && c.type === 'announce_project') matches = true;
    if (type === 'play_private' && c.type === 'play_private') matches = true;
    if (type === 'kaboot' && c.type === 'kaboot') matches = true;
    if (type === 'score_abnat' && c.type === 'score_abnat') matches = true;

    if (matches) {
      const newCurrent = Math.min(c.target, c.current + count);
      if (newCurrent !== c.current) {
        hasChanges = true;
        return {
          ...c,
          current: newCurrent,
          completed: newCurrent >= c.target,
        };
      }
    }
    return c;
  });

  if (hasChanges) {
    saveChallenges(updated);
  }

  return updated;
}

export function getGameHistory(): GameHistoryEntry[] {
  if (typeof window === 'undefined') return DEFAULT_HISTORY;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(DEFAULT_HISTORY));
      return DEFAULT_HISTORY;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_HISTORY;
  }
}

export function addGameHistory(entry: GameHistoryEntry) {
  if (typeof window === 'undefined') return;
  try {
    const history = getGameHistory();
    history.unshift(entry);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history.slice(0, 50)));
    window.dispatchEvent(new CustomEvent('baloot_history_updated', { detail: entry }));
  } catch (e) {
    console.error('Failed to save history', e);
  }
}

export function resetUserData() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.USER);
  localStorage.removeItem(STORAGE_KEYS.HISTORY);
  localStorage.removeItem(STORAGE_KEYS.CHALLENGES);
  localStorage.removeItem(STORAGE_KEYS.FRIENDS);
  window.dispatchEvent(new Event('baloot_user_reset'));
}
