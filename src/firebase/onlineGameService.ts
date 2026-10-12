import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
  addDoc,
  orderBy,
  limit,
} from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { auth, db, handleFirestoreError, OperationType } from './config';
import { BalootGameState } from '../engine/types';
import { getUserProfile } from '../services/storage';

export interface OnlineRoomData {
  roomId: string;
  roomCode: string;
  hostId: string;
  hostName: string;
  status: 'waiting' | 'playing' | 'finished';
  turnTimer: number;
  playerIds: string[];
  players: {
    id: string;
    name: string;
    avatar: string;
    seatIndex: number;
    connected: boolean;
    ready: boolean;
  }[];
  gameState?: BalootGameState;
  createdAt: string;
  updatedAt: string;
}

export interface OnlineChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
}

/**
 * Ensures user is authenticated (anonymously if not logged in).
 */
async function ensureAuth() {
  if (!auth.currentUser) {
    try {
      await signInAnonymously(auth);
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, 'auth/ensure');
    }
  }
  return auth.currentUser!;
}

/**
 * Creates an online room in Firestore
 */
export async function createOnlineRoom(
  roomCode: string,
  hostName: string,
  turnTimer: number = 30
): Promise<OnlineRoomData> {
  const user = await ensureAuth();
  const roomId = `room_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const roomDocRef = doc(db, 'rooms', roomId);

  const newRoom: OnlineRoomData = {
    roomId,
    roomCode: roomCode.toUpperCase(),
    hostId: user.uid,
    hostName,
    status: 'waiting',
    turnTimer,
    playerIds: [user.uid],
    players: [
      {
        id: user.uid,
        name: hostName,
        avatar: '🦅',
        seatIndex: 0,
        connected: true,
        ready: true,
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    await setDoc(roomDocRef, newRoom);
    return newRoom;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `rooms/${roomId}`);
    throw err;
  }
}

/**
 * Searches for an active room by 6-character roomCode and joins an open seat
 */
export async function joinOnlineRoom(
  roomCode: string,
  playerName: string
): Promise<OnlineRoomData | null> {
  const user = await ensureAuth();
  const roomsColl = collection(db, 'rooms');
  const q = query(roomsColl, where('roomCode', '==', roomCode.toUpperCase()), limit(1));

  try {
    const snap = await getDocs(q);
    if (snap.empty) {
      return null;
    }

    const docSnap = snap.docs[0];
    const room = docSnap.data() as OnlineRoomData;

    // Check if player already in room
    const existingIndex = room.players.findIndex((p) => p.id === user.uid);
    if (existingIndex !== -1) {
      return room;
    }

    // Room full check (max 4 players)
    if (room.players.length >= 4) {
      throw new Error('الغرفة ممتلئة بالكامل (4 لاعبين)');
    }

    const nextSeat = room.players.length;
    const newPlayer = {
      id: user.uid,
      name: playerName,
      avatar: nextSeat === 1 ? '🧔🏻' : nextSeat === 2 ? '🧕🏻' : '👳🏻',
      seatIndex: nextSeat,
      connected: true,
      ready: true,
    };

    const updatedPlayers = [...room.players, newPlayer];
    const updatedPlayerIds = [...room.playerIds, user.uid];

    await updateDoc(docSnap.ref, {
      players: updatedPlayers,
      playerIds: updatedPlayerIds,
      updatedAt: new Date().toISOString(),
    });

    return {
      ...room,
      players: updatedPlayers,
      playerIds: updatedPlayerIds,
    };
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, 'rooms');
    throw err;
  }
}

/**
 * Subscribes to real-time updates for a multiplayer room
 */
export function subscribeToOnlineRoom(
  roomId: string,
  onUpdate: (room: OnlineRoomData | null) => void
): () => void {
  const roomDocRef = doc(db, 'rooms', roomId);

  const unsubscribe = onSnapshot(
    roomDocRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onUpdate(snapshot.data() as OnlineRoomData);
      } else {
        onUpdate(null);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, `rooms/${roomId}`);
    }
  );

  return unsubscribe;
}

/**
 * Synchronizes the active game state to Firestore for all 4 players
 */
export async function syncOnlineGameState(
  roomId: string,
  gameState: BalootGameState
): Promise<void> {
  const roomDocRef = doc(db, 'rooms', roomId);
  try {
    await updateDoc(roomDocRef, {
      gameState,
      status: gameState.phase === 'match_end' ? 'finished' : 'playing',
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `rooms/${roomId}`);
  }
}

/**
 * Sends a real-time message to the in-room chat subcollection
 */
export async function sendRoomChatMessage(
  roomId: string,
  senderName: string,
  text: string
): Promise<void> {
  const user = await ensureAuth();
  const messagesColl = collection(db, 'rooms', roomId, 'messages');

  try {
    await addDoc(messagesColl, {
      messageId: `msg_${Date.now()}`,
      roomId,
      senderId: user.uid,
      senderName,
      text,
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `rooms/${roomId}/messages`);
  }
}

/**
 * Listens to real-time chat messages in a room
 */
export function subscribeToRoomChat(
  roomId: string,
  onMessages: (msgs: OnlineChatMessage[]) => void
): () => void {
  const messagesColl = collection(db, 'rooms', roomId, 'messages');
  const q = query(messagesColl, orderBy('createdAt', 'asc'), limit(50));

  const unsubscribe = onSnapshot(
    q,
    (snap) => {
      const messages: OnlineChatMessage[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          roomId: data.roomId,
          senderId: data.senderId,
          senderName: data.senderName,
          text: data.text,
          createdAt: data.createdAt,
        };
      });
      onMessages(messages);
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, `rooms/${roomId}/messages`);
    }
  );

  return unsubscribe;
}

/**
 * Fills any open seats in the room with AI bots so the match can start immediately
 */
export async function fillRemainingSeatsWithBots(roomId: string): Promise<OnlineRoomData | null> {
  const roomDocRef = doc(db, 'rooms', roomId);
  const botPresets = [
    { id: 'bot_1', name: 'سعود الدوسري (يمينك)', avatar: '🧔🏻', seatIndex: 1 },
    { id: 'bot_2', name: 'فيصل المطيري (خويك)', avatar: '🧕🏻', seatIndex: 2 },
    { id: 'bot_3', name: 'بدر الشمري (يسارك)', avatar: '👳🏻', seatIndex: 3 },
  ];

  try {
    const snap = await getDocs(query(collection(db, 'rooms'), where('roomId', '==', roomId), limit(1)));
    if (snap.empty) return null;

    const room = snap.docs[0].data() as OnlineRoomData;
    const currentSeats = new Set(room.players.map((p) => p.seatIndex));

    const updatedPlayers = [...room.players];
    for (const preset of botPresets) {
      if (!currentSeats.has(preset.seatIndex)) {
        updatedPlayers.push({
          id: preset.id,
          name: preset.name,
          avatar: preset.avatar,
          seatIndex: preset.seatIndex,
          connected: true,
          ready: true,
        });
        currentSeats.add(preset.seatIndex);
      }
    }

    // Sort players by seat index (0, 1, 2, 3)
    updatedPlayers.sort((a, b) => a.seatIndex - b.seatIndex);

    await updateDoc(roomDocRef, {
      players: updatedPlayers,
      updatedAt: new Date().toISOString(),
    });

    return {
      ...room,
      players: updatedPlayers,
    };
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `rooms/${roomId}`);
    return null;
  }
}

/**
 * Leaves or cancels the online room
 */
export async function leaveOnlineRoom(roomId: string, playerId: string): Promise<void> {
  const roomDocRef = doc(db, 'rooms', roomId);
  try {
    const snap = await getDocs(query(collection(db, 'rooms'), where('roomId', '==', roomId), limit(1)));
    if (snap.empty) return;
    const room = snap.docs[0].data() as OnlineRoomData;

    if (room.hostId === playerId) {
      // Host left: close room
      await updateDoc(roomDocRef, {
        status: 'finished',
        updatedAt: new Date().toISOString(),
      });
    } else {
      // Guest left: remove from seat
      const remainingPlayers = room.players.filter((p) => p.id !== playerId);
      const remainingIds = room.playerIds.filter((id) => id !== playerId);
      await updateDoc(roomDocRef, {
        players: remainingPlayers,
        playerIds: remainingIds,
        updatedAt: new Date().toISOString(),
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `rooms/${roomId}`);
  }
}

/**
 * Updates room turn timer setting (host only)
 */
export async function updateRoomTimer(roomId: string, turnTimer: number): Promise<void> {
  const roomDocRef = doc(db, 'rooms', roomId);
  try {
    await updateDoc(roomDocRef, {
      turnTimer,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `rooms/${roomId}`);
  }
}

export interface RoomInvitation {
  id: string;
  senderId: string;
  senderName: string;
  toUserId: string;
  roomId: string;
  roomCode: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

/**
 * Sends a real-time room invitation to a friend
 */
export async function sendRoomInvitation(params: {
  toUserId: string;
  roomId: string;
  roomCode: string;
  senderName: string;
}): Promise<string> {
  const user = await ensureAuth();
  const invitationId = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const invDocRef = doc(db, 'invitations', invitationId);

  const invitationData = {
    invitationId,
    senderId: user.uid,
    senderName: params.senderName,
    toUserId: params.toUserId,
    roomId: params.roomId,
    roomCode: params.roomCode,
    status: 'pending' as const,
    createdAt: new Date().toISOString(),
  };

  try {
    await setDoc(invDocRef, invitationData);
    return invitationId;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `invitations/${invitationId}`);
    throw err;
  }
}

/**
 * Subscribes to pending invitations for a specific user
 */
export function subscribeToUserInvitations(
  userId: string,
  onInvitations: (invs: RoomInvitation[]) => void
): () => void {
  const q = query(
    collection(db, 'invitations'),
    where('toUserId', '==', userId),
    where('status', '==', 'pending'),
    limit(5)
  );

  const unsubscribe = onSnapshot(
    q,
    (snap) => {
      const invs: RoomInvitation[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          senderId: data.senderId,
          senderName: data.senderName,
          toUserId: data.toUserId,
          roomId: data.roomId,
          roomCode: data.roomCode,
          status: data.status,
          createdAt: data.createdAt,
        };
      });
      onInvitations(invs);
    },
    (err) => {
      console.warn('Invitations subscription notice:', err);
    }
  );

  return unsubscribe;
}

/**
 * Responds to a room invitation (accept or decline)
 */
export async function respondToRoomInvitation(
  invitationId: string,
  status: 'accepted' | 'declined'
): Promise<void> {
  const invDocRef = doc(db, 'invitations', invitationId);
  try {
    await updateDoc(invDocRef, {
      status,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `invitations/${invitationId}`);
  }
}

/**
 * Updates player presence in Firestore users collection
 */
export async function updateUserPresence(status: 'online' | 'in_game' | 'offline' = 'online'): Promise<void> {
  const current = auth.currentUser;
  const userProf = getUserProfile();
  const uid = current?.uid || userProf.id;
  if (!uid) return;

  const userDocRef = doc(db, 'users', uid);
  try {
    await setDoc(
      userDocRef,
      {
        userId: uid,
        name: userProf.name || current?.displayName || 'لاعب ديوان',
        avatar: userProf.avatar || '🦅',
        level: userProf.level || 1,
        isOnline: status !== 'offline',
        status,
        lastSeen: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.debug('Presence update suppressed:', err);
  }
}

export interface UserPresenceInfo {
  userId: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  status: 'online' | 'in_game' | 'offline';
  lastSeen: string;
  level: number;
}

/**
 * Fetches registered users and checks who is active (within last 5 minutes)
 */
export async function getRegisteredUsers(): Promise<UserPresenceInfo[]> {
  try {
    const q = query(collection(db, 'users'), limit(25));
    const snap = await getDocs(q);
    const now = Date.now();
    const FIVE_MINUTES_MS = 5 * 60 * 1000;

    return snap.docs.map((d) => {
      const data = d.data();
      const lastSeenTime = data.lastSeen ? new Date(data.lastSeen).getTime() : 0;
      const isRecent = now - lastSeenTime < FIVE_MINUTES_MS;

      return {
        userId: d.id,
        name: data.name || 'لاعب ديوان',
        avatar: data.avatar || '🦅',
        isOnline: data.isOnline !== false && isRecent,
        status: (data.status as 'online' | 'in_game' | 'offline') || (isRecent ? 'online' : 'offline'),
        lastSeen: data.lastSeen ? new Date(data.lastSeen).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) : 'سابقاً',
        level: data.level || 1,
      };
    });
  } catch (err) {
    console.warn('Could not fetch registered users:', err);
    return [];
  }
}
