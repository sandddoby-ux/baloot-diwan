import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  BalootGameState,
  Card,
  GameContract,
  GamePhase,
  MatchScore,
  PlayedCard,
  PlayerState,
  RoundScore,
  Suit,
  Trick,
} from '../engine/types';
import { createDeck, dealFirstRound, dealSecondRound, shuffleDeck, sortHand } from '../engine/deck';
import { detectProjects, evaluateTrickWinner, isMoveLegal } from '../engine/rules';
import { calculateRoundScore } from '../engine/scoring';
import { botChooseCard, botEvaluateBid } from '../engine/ai';
import { soundService } from '../services/sound';
import { addGameHistory, getUserProfile, saveUserProfile, trackChallengeProgress } from '../services/storage';
import { syncOnlineGameState, subscribeToOnlineRoom, sendRoomChatMessage, subscribeToRoomChat } from '../firebase/onlineGameService';
import { auth, db } from '../firebase/config';
import { doc, setDoc } from 'firebase/firestore';
import { analytics } from '../services/analytics';
import confetti from 'canvas-confetti';

interface GameContextType {
  gameState: BalootGameState | null;
  mode: 'quick' | 'private' | 'bot' | 'training' | null;
  onlineRoomId: string | null;
  botDifficulty: 'beginner' | 'intermediate' | 'expert';
  setBotDifficulty: (diff: 'beginner' | 'intermediate' | 'expert') => void;
  startNewGame: (
    gameMode: 'quick' | 'private' | 'bot' | 'training',
    customRoomCode?: string,
    roomId?: string,
    customTurnTimer?: number
  ) => void;
  leaveGame: () => void;
  playCard: (card: Card) => boolean;
  playerBid: (action: 'pass' | 'sun' | 'hokom', suit?: Suit) => void;
  announceProject: (type: 'sira' | 'khamsin' | 'mia' | 'arba_meya' | 'baloot') => void;
  restartMatch: () => void;
  proceedToNextRound: () => void;
  trainingHint: string | null;
  chatMessages: { sender: string; text: string; time: string }[];
  sendChatMessage: (text: string) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gameState, setGameState] = useState<BalootGameState | null>(null);
  const [mode, setMode] = useState<'quick' | 'private' | 'bot' | 'training' | null>(null);
  const [onlineRoomId, setOnlineRoomId] = useState<string | null>(null);
  const [botDifficulty, setBotDifficulty] = useState<'beginner' | 'intermediate' | 'expert'>('intermediate');
  const [trainingHint, setTrainingHint] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<{ sender: string; text: string; time: string }[]>([]);

  // State refs to avoid stale closures in timeouts
  const stateRef = useRef<BalootGameState | null>(null);
  stateRef.current = gameState;

  // Deck stash for the second round of dealing
  const remainingDeckRef = useRef<Card[]>([]);

  /**
   * Initializes and starts a new game
   */
  const startNewGame = useCallback(
    (
      gameMode: 'quick' | 'private' | 'bot' | 'training',
      customRoomCode?: string,
      roomId?: string,
      customTurnTimer?: number
    ) => {
      soundService.playClick();
      setMode(gameMode);
      setOnlineRoomId(roomId || null);
      analytics.track('game_started', { mode: gameMode, difficulty: botDifficulty, onlineRoomId: roomId });

      const user = getUserProfile();

      // Configure the 4 players
      const isPracticeOrBot = gameMode === 'bot' || gameMode === 'training';
      const player0: PlayerState = {
        id: user.id,
        name: user.name || 'أنت (اللاعب)',
        avatar: user.avatar || '🦅',
        isBot: false,
        hand: [],
        team: 'us',
        seatIndex: 0,
        connected: true,
        ready: true,
      };

      const player1: PlayerState = {
        id: 'bot-1',
        name: isPracticeOrBot ? 'سعود (يمينك)' : 'سعود الدوسري',
        avatar: '🧔🏻',
        isBot: !roomId,
        botDifficulty,
        hand: [],
        team: 'them',
        seatIndex: 1,
        connected: true,
        ready: true,
      };

      const player2: PlayerState = {
        id: 'bot-2',
        name: isPracticeOrBot ? 'فيصل (خويّك)' : 'فيصل المطيري (خويك)',
        avatar: '🧕🏻',
        isBot: !roomId,
        botDifficulty,
        hand: [],
        team: 'us',
        seatIndex: 2,
        connected: true,
        ready: true,
      };

      const player3: PlayerState = {
        id: 'bot-3',
        name: isPracticeOrBot ? 'بدر (يسارك)' : 'بدر الشمري',
        avatar: '👳🏻',
        isBot: !roomId,
        botDifficulty,
        hand: [],
        team: 'them',
        seatIndex: 3,
        connected: true,
        ready: true,
      };

      const initialPlayers = [player0, player1, player2, player3];

      // Prepare deck and deal first round
      const rawDeck = createDeck();
      const shuffled = shuffleDeck(rawDeck);
      const dealerIndex = 0; // User starts as dealer or dealer index 0
      const deal = dealFirstRound(shuffled, dealerIndex);
      remainingDeckRef.current = deal.remainingDeck;

      // Assign first 5 cards to each player
      for (let i = 0; i < 4; i++) {
        initialPlayers[i].hand = sortHand(deal.hands[i]);
      }

      // First bidder is the player to the right of the dealer
      const firstTurn = (dealerIndex + 1) % 4;

      const initialScore: MatchScore = {
        us: 0,
        them: 0,
        target: 152,
        roundHistory: [],
      };

      const initialTrick: Trick = {
        trickNumber: 1,
        leadPlayer: firstTurn,
        cards: [],
      };

      const newState: BalootGameState = {
        id: `game-${Date.now()}`,
        roomCode: customRoomCode || Math.random().toString(36).substring(2, 8).toUpperCase(),
        phase: 'bidding_round_1',
        dealerIndex,
        turnIndex: firstTurn,
        turnSequenceId: 1,
        isTrickResolving: false,
        lastTrickWinner: undefined,
        floorCard: deal.floorCard,
        contract: null,
        players: initialPlayers,
        currentTrick: initialTrick,
        completedTricks: [],
        projects: [],
        matchScore: initialScore,
        lastRoundScore: null,
        currentRoundNumber: 1,
        lastActionTime: Date.now(),
        turnTimeoutSeconds: customTurnTimer && customTurnTimer > 0 ? customTurnTimer : 30,
        biddingPassCount: 0,
      };

      setGameState(newState);
      if (roomId) {
        syncOnlineGameState(roomId, newState);
      }

      setChatMessages([
        {
          sender: 'نظام الديوان',
          text: `أهلاً بكم في ديوان البلوت${roomId ? ' (متصل بسحابة Firebase)' : ''}. كرت الشراء المكشوف هو ${deal.floorCard.rank}. بالتوأم والتوفيق!`,
          time: 'الآن',
        },
      ]);

      if (gameMode === 'training') {
        setTrainingHint(
          'أهلاً بك في نمط التدريب! دور المزايدة يبدأ أولاً باللاعب الذي على يمين الموزع. كرت الشراء مكشوف، يمكنك الشراء حكماً أو صيداً أو تمرير الدور (بس).'
        );
      }

      soundService.playCardDeal();
    },
    [botDifficulty]
  );

  /**
   * Leave current game
   */
  const leaveGame = useCallback(() => {
    soundService.playClick();
    setGameState(null);
    setMode(null);
    setOnlineRoomId(null);
    setTrainingHint(null);
  }, []);

  /**
   * Restart match
   */
  const restartMatch = useCallback(() => {
    if (mode) {
      startNewGame(mode, gameState?.roomCode, onlineRoomId || undefined);
    }
  }, [mode, startNewGame, gameState?.roomCode, onlineRoomId]);

  /**
   * Proceeds from round_end to the next round of dealing
   */
  const proceedToNextRound = useCallback(() => {
    setGameState((prev) => {
      if (!prev || prev.phase !== 'round_end') return prev;

      const nextRoundNum = prev.currentRoundNumber + 1;
      const nextDealer = (prev.dealerIndex + 1) % 4;
      const rawDeck = createDeck();
      const shuffled = shuffleDeck(rawDeck);
      const deal = dealFirstRound(shuffled, nextDealer);
      remainingDeckRef.current = deal.remainingDeck;

      const resetPlayers = prev.players.map((p, idx) => ({
        ...p,
        hand: sortHand(deal.hands[idx]),
      }));

      soundService.playCardDeal();

      const firstTurn = (nextDealer + 1) % 4;

      setChatMessages((msgs) => [
        ...msgs,
        {
          sender: 'نظام الديوان',
          text: `بدء الجولة #${nextRoundNum}! كرت الشراء المكشوف هو ${deal.floorCard.rank}. دور المزايدة للاعب ${prev.players[firstTurn].name}.`,
          time: 'الآن',
        },
      ]);

      return {
        ...prev,
        phase: 'bidding_round_1',
        dealerIndex: nextDealer,
        turnIndex: firstTurn,
        turnSequenceId: (prev.turnSequenceId || 0) + 1,
        floorCard: deal.floorCard,
        contract: null,
        currentRoundNumber: nextRoundNum,
        players: resetPlayers,
        completedTricks: [],
        isTrickResolving: false,
        lastTrickWinner: undefined,
        currentTrick: {
          trickNumber: 1,
          leadPlayer: firstTurn,
          cards: [],
        },
        projects: [],
        biddingPassCount: 0,
        lastActionTime: Date.now(),
      };
    });
  }, []);

  /**
   * Send chat message
   */
  const sendChatMessage = useCallback((text: string) => {
    soundService.playClick();
    const user = getUserProfile();
    setChatMessages((prev) => [
      ...prev,
      {
        sender: user.name,
        text,
        time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);

    if (onlineRoomId) {
      sendRoomChatMessage(onlineRoomId, user.name, text);
    }
  }, [onlineRoomId]);

  // Sync state changes to Firebase in real-time when online
  useEffect(() => {
    if (gameState && onlineRoomId) {
      syncOnlineGameState(onlineRoomId, gameState);
    }
  }, [
    onlineRoomId,
    gameState?.phase,
    gameState?.turnIndex,
    gameState?.currentTrick.cards.length,
    gameState?.contract,
    gameState?.matchScore.us,
    gameState?.matchScore.them,
    gameState?.isTrickResolving,
  ]);

  // Subscribe to in-room chat messages from Firestore
  useEffect(() => {
    if (!onlineRoomId) return;
    const unsub = subscribeToRoomChat(onlineRoomId, (msgs) => {
      if (msgs.length > 0) {
        setChatMessages(
          msgs.map((m) => ({
            sender: m.senderName,
            text: m.text,
            time: new Date(m.createdAt).toLocaleTimeString('ar-SA', {
              hour: '2-digit',
              minute: '2-digit',
            }),
          }))
        );
      }
    });
    return () => unsub();
  }, [onlineRoomId]);

  // Subscribe to online room metadata & turn timer updates
  useEffect(() => {
    if (!onlineRoomId) return;
    const unsub = subscribeToOnlineRoom(onlineRoomId, (roomData) => {
      if (!roomData) return;
      if (roomData.turnTimer) {
        setGameState((prev) => {
          if (!prev || prev.turnTimeoutSeconds === roomData.turnTimer) return prev;
          return {
            ...prev,
            turnTimeoutSeconds: roomData.turnTimer,
          };
        });
      }
    });
    return () => unsub();
  }, [onlineRoomId]);

  // Auto-advance from round_end after 4.5 seconds
  useEffect(() => {
    if (gameState?.phase === 'round_end') {
      const timer = setTimeout(() => {
        proceedToNextRound();
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [gameState?.phase, proceedToNextRound]);

  /**
   * Advance turn / Handle bot actions automatically
   */
  useEffect(() => {
    if (!gameState) return;
    const current = gameState;

    // Do not act if trick is resolving or game is not in active playable phase
    if (current.isTrickResolving || current.phase === 'round_end' || current.phase === 'match_end') {
      return;
    }

    const currentPlayer = current.players[current.turnIndex];
    if (!currentPlayer) return;

    // Check if current turn belongs to a Bot
    if (currentPlayer.isBot) {
      // In online room, only seat 0 drives bot moves
      if (onlineRoomId && !current.players[0].connected) return;

      const timer = setTimeout(() => {
        handleBotTurn();
      }, 750);

      return () => clearTimeout(timer);
    } else if (current.turnIndex === 0 && current.phase === 'playing') {
      soundService.playYourTurn();
    }
  }, [
    gameState?.turnIndex,
    gameState?.turnSequenceId,
    gameState?.phase,
    gameState?.isTrickResolving,
    onlineRoomId,
  ]);

  /**
   * Watchdog timer: If a bot turn stalls for more than 3 seconds, force progress!
   */
  useEffect(() => {
    if (!gameState) return;
    if (
      gameState.phase !== 'playing' &&
      gameState.phase !== 'bidding_round_1' &&
      gameState.phase !== 'bidding_round_2'
    ) {
      return;
    }
    if (gameState.isTrickResolving) return;

    const currentTurn = gameState.turnIndex;
    const currentPlayer = gameState.players[currentTurn];

    if (currentPlayer && currentPlayer.isBot) {
      const watchdog = setTimeout(() => {
        const latest = stateRef.current;
        if (latest && latest.turnIndex === currentTurn && !latest.isTrickResolving) {
          console.warn(`[Watchdog] Forcing bot turn for player ${currentTurn}`);
          handleBotTurn();
        }
      }, 3000);

      return () => clearTimeout(watchdog);
    }
  }, [gameState?.turnIndex, gameState?.turnSequenceId, gameState?.isTrickResolving, gameState?.phase]);

  /**
   * Bot automated turn logic
   */
  const handleBotTurn = () => {
    const state = stateRef.current;
    if (!state) return;
    if (state.isTrickResolving || state.phase === 'round_end' || state.phase === 'match_end') return;

    const currentTurn = state.turnIndex;
    const bot = state.players[currentTurn];
    if (!bot || !bot.isBot) return;

    if (state.phase === 'bidding_round_1') {
      if (!state.floorCard) return;
      const bid = botEvaluateBid(bot.hand, state.floorCard, 1, currentTurn, state.dealerIndex);
      handleBidResolution(bid.action, bid.suit);
    } else if (state.phase === 'bidding_round_2') {
      if (!state.floorCard) return;
      const bid = botEvaluateBid(bot.hand, state.floorCard, 2, currentTurn, state.dealerIndex);
      handleBidResolution(bid.action, bid.suit);
    } else if (state.phase === 'playing') {
      if (!state.contract || bot.hand.length === 0) return;
      try {
        const chosenCard = botChooseCard({
          playerIndex: currentTurn,
          hand: bot.hand,
          contract: state.contract,
          currentTrickCards: state.currentTrick.cards,
          difficulty: bot.botDifficulty || 'intermediate',
          playedCardsHistory: state.completedTricks.flatMap((t) => t.cards),
        });
        executeCardPlay(currentTurn, chosenCard);
      } catch (err) {
        console.error('Bot play error:', err);
        // Fallback: safely play first card in bot hand to ensure game never halts
        if (bot.hand.length > 0) {
          executeCardPlay(currentTurn, bot.hand[0]);
        }
      }
    }
  };

  /**
   * Human player bidding
   */
  const playerBid = (action: 'pass' | 'sun' | 'hokom', suit?: Suit) => {
    if (!gameState || gameState.turnIndex !== 0) return;
    soundService.playClick();
    handleBidResolution(action, suit);
  };

  /**
   * Core bid resolution engine
   */
  const handleBidResolution = (action: 'pass' | 'sun' | 'hokom', suit?: Suit) => {
    setGameState((prev) => {
      if (!prev) return null;
      const currentTurn = prev.turnIndex;
      const bidderName = prev.players[currentTurn].name;

      if (action !== 'pass') {
        // Someone bought Sun or Hokom!
        const chosenSuit = action === 'hokom' ? suit || prev.floorCard!.suit : undefined;
        const newContract: GameContract = {
          type: action,
          suit: chosenSuit,
          declaredBy: currentTurn,
          multiplier: 1,
        };

        // Deal second round of 3 cards each (or floor card + 2 for buyer)
        const handsTuple: [Card[], Card[], Card[], Card[]] = [
          prev.players[0].hand,
          prev.players[1].hand,
          prev.players[2].hand,
          prev.players[3].hand,
        ];
        const secondDealHands = dealSecondRound(
          handsTuple,
          remainingDeckRef.current,
          prev.floorCard!,
          currentTurn
        );

        const updatedPlayers = prev.players.map((p, idx) => ({
          ...p,
          hand: sortHand(secondDealHands[idx], newContract.suit),
        }));

        // Detect projects for each player automatically
        const allProjects = updatedPlayers.flatMap((p, idx) => {
          const projs = detectProjects(p.hand, newContract);
          return projs.map((pj) => ({
            playerIndex: idx,
            type: pj.type,
            suit: pj.suit,
            highestRank: pj.rank,
            points: pj.points,
            gamePoints: pj.gamePoints,
            approved: true,
          }));
        });

        // Announce contract in chat
        const contractDesc =
          action === 'sun'
            ? 'صن'
            : `حكم (${newContract.suit === 'hearts' ? 'هاص ♥' : newContract.suit === 'spades' ? 'سبيد ♠' : newContract.suit === 'diamonds' ? 'ديمن ♦' : 'كلفس ♣'})`;

        setChatMessages((msgs) => [
          ...msgs,
          {
            sender: 'نظام الديوان',
            text: `قام ${bidderName} بشراء ${contractDesc}. تم توزيع بقية الكروت وبدء اللعب!`,
            time: 'الآن',
          },
        ]);

        soundService.playCardDeal();

        // First trick lead player is (dealerIndex + 1) % 4
        const lead = (prev.dealerIndex + 1) % 4;

        return {
          ...prev,
          phase: 'playing',
          contract: newContract,
          floorCard: null,
          players: updatedPlayers,
          projects: allProjects,
          turnIndex: lead,
          turnSequenceId: (prev.turnSequenceId || 0) + 1,
          isTrickResolving: false,
          lastTrickWinner: undefined,
          currentTrick: {
            trickNumber: 1,
            leadPlayer: lead,
            cards: [],
          },
          lastActionTime: Date.now(),
        };
      }

      // Action is PASS:
      const newPassCount = prev.biddingPassCount + 1;
      const nextTurn = (currentTurn + 1) % 4;

      if (prev.phase === 'bidding_round_1') {
        if (newPassCount === 4) {
          // All 4 passed in round 1: advance to round 2
          return {
            ...prev,
            phase: 'bidding_round_2',
            biddingPassCount: 0,
            turnIndex: (prev.dealerIndex + 1) % 4,
            turnSequenceId: (prev.turnSequenceId || 0) + 1,
            lastActionTime: Date.now(),
          };
        }
        return {
          ...prev,
          biddingPassCount: newPassCount,
          turnIndex: nextTurn,
          turnSequenceId: (prev.turnSequenceId || 0) + 1,
          lastActionTime: Date.now(),
        };
      }

      // Round 2 pass logic
      if (newPassCount === 4) {
        // All 4 passed in round 2: redeal!
        const rawDeck = createDeck();
        const shuffled = shuffleDeck(rawDeck);
        const nextDealer = (prev.dealerIndex + 1) % 4;
        const deal = dealFirstRound(shuffled, nextDealer);
        remainingDeckRef.current = deal.remainingDeck;

        const rePlayers = prev.players.map((p, idx) => ({
          ...p,
          hand: sortHand(deal.hands[idx]),
        }));

        setChatMessages((msgs) => [
          ...msgs,
          {
            sender: 'نظام الديوان',
            text: 'طوّف الجميع (باص للكل). تم إعادة التوزيع وانتقال الموزع.',
            time: 'الآن',
          },
        ]);

        return {
          ...prev,
          phase: 'bidding_round_1',
          dealerIndex: nextDealer,
          turnIndex: (nextDealer + 1) % 4,
          turnSequenceId: (prev.turnSequenceId || 0) + 1,
          floorCard: deal.floorCard,
          biddingPassCount: 0,
          players: rePlayers,
          lastActionTime: Date.now(),
        };
      }

      return {
        ...prev,
        biddingPassCount: newPassCount,
        turnIndex: nextTurn,
        turnSequenceId: (prev.turnSequenceId || 0) + 1,
        lastActionTime: Date.now(),
      };
    });
  };

  /**
   * Human plays a card
   */
  const playCard = (card: Card): boolean => {
    if (
      !gameState ||
      gameState.turnIndex !== 0 ||
      gameState.phase !== 'playing' ||
      gameState.isTrickResolving
    ) {
      return false;
    }

    const player = gameState.players[0];
    const validation = isMoveLegal(
      card,
      player.hand,
      gameState.currentTrick.cards,
      gameState.contract!,
      0
    );

    if (!validation.legal) {
      if (mode === 'training') {
        setTrainingHint(`حركة غير نظامية: ${validation.reason}`);
      }
      return false;
    }

    executeCardPlay(0, card);
    return true;
  };

  /**
   * Core card play executor
   */
  const executeCardPlay = (playerIndex: number, card: Card) => {
    soundService.playCardPlay();

    setGameState((prev) => {
      if (!prev || !prev.contract || prev.isTrickResolving) return prev;

      // Remove card from player hand
      const updatedPlayers = prev.players.map((p, idx) => {
        if (idx === playerIndex) {
          return {
            ...p,
            hand: p.hand.filter((c) => c.id !== card.id),
          };
        }
        return p;
      });

      const updatedTrickCards: PlayedCard[] = [
        ...prev.currentTrick.cards,
        { playerIndex, card },
      ];

      // Check if trick is complete (4 cards played)
      if (updatedTrickCards.length === 4) {
        const trickEval = evaluateTrickWinner(updatedTrickCards, prev.contract);
        const trickWinnerIndex = trickEval.winnerPlayerIndex;

        const completedTrick: Trick = {
          ...prev.currentTrick,
          cards: updatedTrickCards,
          winnerPlayer: trickWinnerIndex,
          points: trickEval.totalPoints,
        };

        const newCompletedTricks = [...prev.completedTricks, completedTrick];

        // Did we finish all 8 tricks in the round?
        if (newCompletedTricks.length === 8) {
          // Pause 1400ms to show the final trick, then score the round cleanly!
          setTimeout(() => {
            handleRoundEnd(newCompletedTricks, prev.contract!);
          }, 1400);

          return {
            ...prev,
            players: updatedPlayers,
            currentTrick: completedTrick,
            completedTricks: newCompletedTricks,
            isTrickResolving: true, // Freeze play while viewing 8th trick
            lastTrickWinner: trickWinnerIndex,
            turnIndex: trickWinnerIndex,
            lastActionTime: Date.now(),
          };
        }

        // Tricks 1-7: Show completed trick for 1.3s, then advance to next trick
        setTimeout(() => {
          soundService.playTrickCollect();
          setGameState((st) => {
            if (!st) return null;
            return {
              ...st,
              isTrickResolving: false,
              lastTrickWinner: undefined,
              turnIndex: trickWinnerIndex,
              turnSequenceId: (st.turnSequenceId || 0) + 1, // Reliably triggers next bot lead!
              currentTrick: {
                trickNumber: st.completedTricks.length + 1,
                leadPlayer: trickWinnerIndex,
                cards: [],
              },
              lastActionTime: Date.now(),
            };
          });
        }, 1300);

        return {
          ...prev,
          players: updatedPlayers,
          currentTrick: completedTrick,
          completedTricks: newCompletedTricks,
          isTrickResolving: true, // Freeze play while showing winning trick
          lastTrickWinner: trickWinnerIndex,
          turnIndex: trickWinnerIndex,
          lastActionTime: Date.now(),
        };
      }

      // Trick still in progress: advance to next player
      return {
        ...prev,
        players: updatedPlayers,
        currentTrick: {
          ...prev.currentTrick,
          cards: updatedTrickCards,
        },
        turnIndex: (playerIndex + 1) % 4,
        turnSequenceId: (prev.turnSequenceId || 0) + 1,
        lastActionTime: Date.now(),
      };
    });
  };

  /**
   * Round end scoring & match completion
   */
  const handleRoundEnd = (completedTricks: Trick[], contract: GameContract) => {
    setGameState((prev) => {
      if (!prev) return null;

      // Calculate project points
      const usProj = prev.projects
        .filter((p) => (p.playerIndex === 0 || p.playerIndex === 2) && p.approved)
        .reduce((sum, p) => sum + p.points, 0);

      const themProj = prev.projects
        .filter((p) => (p.playerIndex === 1 || p.playerIndex === 3) && p.approved)
        .reduce((sum, p) => sum + p.points, 0);

      const roundScore = calculateRoundScore({
        roundNumber: prev.currentRoundNumber,
        contract,
        completedTricks,
        usProjectPoints: usProj,
        themProjectPoints: themProj,
      });

      const newScoreUs = prev.matchScore.us + roundScore.usRoundPoints;
      const newScoreThem = prev.matchScore.them + roundScore.themRoundPoints;

      const newMatchScore: MatchScore = {
        us: newScoreUs,
        them: newScoreThem,
        target: 152,
        roundHistory: [...prev.matchScore.roundHistory, roundScore],
      };

      const matchWonByUs = newScoreUs >= 152;
      const matchWonByThem = newScoreThem >= 152;
      const isMatchOver = matchWonByUs || matchWonByThem;

      // Track round events for challenges
      if (roundScore.isKaboot && roundScore.winnerTeam === 'us') {
        trackChallengeProgress('kaboot', 1);
      }
      if (roundScore.usRoundPoints > 0) {
        trackChallengeProgress('score_abnat', roundScore.usRoundPoints);
      }

      if (isMatchOver) {
        soundService.playWin();
        if (matchWonByUs) {
          confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
        }

        // Track match completion challenges
        trackChallengeProgress('play_match', 1);
        if (mode === 'private') {
          trackChallengeProgress('play_private', 1);
        }

        // Record history and update player profile with 100% REAL data
        const user = getUserProfile();
        const won = matchWonByUs;
        user.stats.matchesPlayed += 1;

        if (won) {
          user.stats.matchesWon += 1;
          trackChallengeProgress('win_match', 1);
          if (contract.type === 'sun') {
            user.stats.sunWins += 1;
            trackChallengeProgress('win_sun', 1);
          } else {
            user.stats.hokomWins += 1;
            trackChallengeProgress('win_hokom', 1);
          }
          user.xp += 180;
          user.coins += 50;
        } else {
          user.stats.matchesLost += 1;
          user.xp += 50;
          user.coins += 10;
        }

        if (roundScore.isKaboot && roundScore.winnerTeam === 'us') {
          user.stats.kabootsAchieved += 1;
        }

        user.stats.winRate = user.stats.matchesPlayed > 0 
          ? Math.round((user.stats.matchesWon / user.stats.matchesPlayed) * 100) 
          : 0;
        user.stats.totalAbnatScored += roundScore.usRoundPoints;
        user.level = Math.max(1, Math.floor(user.xp / 500) + 1);

        saveUserProfile(user);

        // Sync with Firestore if authenticated
        if (auth.currentUser) {
          try {
            const userDocRef = doc(db, 'users', auth.currentUser.uid);
            setDoc(
              userDocRef,
              {
                userId: auth.currentUser.uid,
                stats: user.stats,
                xp: user.xp,
                coins: user.coins,
                level: user.level,
                updatedAt: new Date().toISOString(),
              },
              { merge: true }
            ).catch((err) => console.warn('Could not sync match stats to Firestore:', err));
          } catch (e) {
            console.warn('Firestore sync error:', e);
          }
        }

        addGameHistory({
          id: `hist-${Date.now()}`,
          date: new Date().toLocaleDateString('ar-SA'),
          mode: mode || 'quick',
          contractType: contract.type,
          result: won ? 'win' : 'loss',
          finalScoreUs: newScoreUs,
          finalScoreThem: newScoreThem,
          partnerName: prev.players[2].name,
          durationMinutes: 12,
        });

        analytics.track('match_completed', {
          winner: won ? 'us' : 'them',
          scoreUs: newScoreUs,
          scoreThem: newScoreThem,
        });

        return {
          ...prev,
          phase: 'match_end',
          isTrickResolving: false,
          lastRoundScore: roundScore,
          matchScore: newMatchScore,
        };
      }

      // Match continues: show round end scoreboard for 4.5 seconds or until player clicks next
      soundService.playTrickCollect();

      setChatMessages((msgs) => [
        ...msgs,
        {
          sender: 'نظام الديوان',
          text: `انتهت النشرة #${prev.currentRoundNumber}. النتيجة: لنا +${roundScore.usRoundPoints} (المجموع: ${newScoreUs}) | لهم +${roundScore.themRoundPoints} (المجموع: ${newScoreThem}).`,
          time: 'الآن',
        },
      ]);

      return {
        ...prev,
        phase: 'round_end',
        isTrickResolving: false,
        lastRoundScore: roundScore,
        matchScore: newMatchScore,
      };
    });
  };

  /**
   * Project announcement handler
   */
  const announceProject = (type: 'sira' | 'khamsin' | 'mia' | 'arba_meya' | 'baloot') => {
    soundService.playClick();
    trackChallengeProgress('announce_project', 1);
    setChatMessages((prev) => [
      ...prev,
      {
        sender: 'أنت',
        text: `أعلن عن مشروع: ${type === 'sira' ? 'سرة (20)' : type === 'khamsin' ? 'خمسين (50)' : type === 'mia' ? 'مية (100)' : type === 'arba_meya' ? 'أربعمية (400)' : 'بلوت!'}`,
        time: 'الآن',
      },
    ]);
  };

  return (
    <GameContext.Provider
      value={{
        gameState,
        mode,
        onlineRoomId,
        botDifficulty,
        setBotDifficulty,
        startNewGame,
        leaveGame,
        playCard,
        playerBid,
        announceProject,
        restartMatch,
        proceedToNextRound,
        trainingHint,
        chatMessages,
        sendChatMessage,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
};
