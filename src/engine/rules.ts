import { Card, GameContract, PlayedCard, ProjectType, Rank, Suit } from './types';

// Standard Sun rank order: 7 < 8 < 9 < J < Q < K < 10 < A
export const SUN_RANK_POWER: Record<Rank, number> = {
  '7': 0,
  '8': 1,
  '9': 2,
  J: 3,
  Q: 4,
  K: 5,
  '10': 6,
  A: 7,
};

// Standard Hokom Trump rank order: 7 < 8 < Q < K < 10 < A < 9 < J
export const HOKOM_TRUMP_POWER: Record<Rank, number> = {
  '7': 0,
  '8': 1,
  Q: 2,
  K: 3,
  '10': 4,
  A: 5,
  '9': 6,
  J: 7,
};

// Points in Sun
export const SUN_CARD_POINTS: Record<Rank, number> = {
  A: 11,
  '10': 10,
  K: 4,
  Q: 3,
  J: 2,
  '9': 0,
  '8': 0,
  '7': 0,
};

// Points in Hokom (Trump)
export const HOKOM_TRUMP_POINTS: Record<Rank, number> = {
  J: 20,
  '9': 14,
  A: 11,
  '10': 10,
  K: 4,
  Q: 3,
  '8': 0,
  '7': 0,
};

// Points in Hokom (Non-Trump)
export const HOKOM_NON_TRUMP_POINTS: Record<Rank, number> = {
  A: 11,
  '10': 10,
  K: 4,
  Q: 3,
  J: 2,
  '9': 0,
  '8': 0,
  '7': 0,
};

/**
 * Calculates raw card point value.
 */
export function getCardPoints(card: Card, contract: GameContract): number {
  if (contract.type === 'sun') {
    return SUN_CARD_POINTS[card.rank];
  }
  // Hokom
  if (contract.suit && card.suit === contract.suit) {
    return HOKOM_TRUMP_POINTS[card.rank];
  }
  return HOKOM_NON_TRUMP_POINTS[card.rank];
}

/**
 * Determines which of the played cards won the trick.
 */
export function evaluateTrickWinner(cards: PlayedCard[], contract: GameContract): {
  winnerPlayerIndex: number;
  winningCard: Card;
  totalPoints: number;
} {
  if (cards.length === 0) {
    throw new Error('Cannot evaluate empty trick');
  }

  const leadCard = cards[0].card;
  let bestCard = leadCard;
  let winnerPlayerIndex = cards[0].playerIndex;
  let totalPoints = getCardPoints(leadCard, contract);

  for (let i = 1; i < cards.length; i++) {
    const currentPlayed = cards[i];
    const currentCard = currentPlayed.card;
    totalPoints += getCardPoints(currentCard, contract);

    const isCurrentBetter = isCardHigherThan(currentCard, bestCard, leadCard.suit, contract);
    if (isCurrentBetter) {
      bestCard = currentCard;
      winnerPlayerIndex = currentPlayed.playerIndex;
    }
  }

  return {
    winnerPlayerIndex,
    winningCard: bestCard,
    totalPoints,
  };
}

/**
 * Compares two cards in the context of lead suit and contract.
 */
export function isCardHigherThan(
  candidate: Card,
  currentBest: Card,
  leadSuit: Suit,
  contract: GameContract
): boolean {
  if (contract.type === 'sun') {
    // Only cards of the lead suit can beat the lead card
    if (candidate.suit !== leadSuit) {
      return false;
    }
    if (currentBest.suit !== leadSuit) {
      return true;
    }
    return SUN_RANK_POWER[candidate.rank] > SUN_RANK_POWER[currentBest.rank];
  }

  // Hokom:
  const trump = contract.suit!;
  const isCandidateTrump = candidate.suit === trump;
  const isCurrentBestTrump = currentBest.suit === trump;

  if (isCandidateTrump && !isCurrentBestTrump) {
    return true; // Trump beats non-trump
  }
  if (!isCandidateTrump && isCurrentBestTrump) {
    return false; // Non-trump cannot beat trump
  }
  if (isCandidateTrump && isCurrentBestTrump) {
    // Both are trump
    return HOKOM_TRUMP_POWER[candidate.rank] > HOKOM_TRUMP_POWER[currentBest.rank];
  }

  // Neither is trump
  if (candidate.suit !== leadSuit) {
    return false;
  }
  if (currentBest.suit !== leadSuit) {
    return true;
  }
  return SUN_RANK_POWER[candidate.rank] > SUN_RANK_POWER[currentBest.rank];
}

/**
 * Validates whether a card can be legally played by playerIndex given the current trick and hand.
 */
export function isMoveLegal(
  card: Card,
  hand: Card[],
  playedCardsInTrick: PlayedCard[],
  contract: GameContract,
  playerIndex: number
): { legal: boolean; reason?: string } {
  // 1. Must own the card
  const ownsCard = hand.some((c) => c.id === card.id);
  if (!ownsCard) {
    return { legal: false, reason: 'الورقة غير موجودة في يد اللاعب' };
  }

  // 2. Lead player can play any card
  if (playedCardsInTrick.length === 0) {
    return { legal: true };
  }

  const leadCard = playedCardsInTrick[0].card;
  const leadSuit = leadCard.suit;
  const hasLeadSuit = hand.some((c) => c.suit === leadSuit);

  // 3. Must follow suit if able
  if (hasLeadSuit) {
    if (card.suit !== leadSuit) {
      return { legal: false, reason: 'يجب أن تلعب من نفس لون الكرت الأول (الالتزام باللون)' };
    }

    // In Hokom, if lead suit is trump, player must over-trump if possible (التعلاية في الحكم)
    if (contract.type === 'hokom' && leadSuit === contract.suit) {
      const highestTrumpPlayed = playedCardsInTrick
        .filter((p) => p.card.suit === contract.suit)
        .reduce((max, p) => {
          return !max || HOKOM_TRUMP_POWER[p.card.rank] > HOKOM_TRUMP_POWER[max.rank]
            ? p.card
            : max;
        }, null as Card | null);

      if (highestTrumpPlayed) {
        const canOverTrump = hand.some(
          (c) =>
            c.suit === contract.suit &&
            HOKOM_TRUMP_POWER[c.rank] > HOKOM_TRUMP_POWER[highestTrumpPlayed.rank]
        );

        if (
          canOverTrump &&
          HOKOM_TRUMP_POWER[card.rank] <= HOKOM_TRUMP_POWER[highestTrumpPlayed.rank]
        ) {
          return { legal: false, reason: 'يجب التعلاية في الحكم عند القدرة على ذلك' };
        }
      }
    }

    return { legal: true };
  }

  // Player DOES NOT have the lead suit:
  if (contract.type === 'sun') {
    // In Sun, can play any card
    return { legal: true };
  }

  // In Hokom:
  const trumpSuit = contract.suit!;
  const hasTrump = hand.some((c) => c.suit === trumpSuit);

  if (!hasTrump) {
    // Player has no lead suit and no trump: can discard anything
    return { legal: true };
  }

  // Check current winning card and player in this trick
  const currentBest = evaluateTrickWinner(playedCardsInTrick, contract);
  const partnerIndex = (playerIndex + 2) % 4;
  const isPartnerWinning = currentBest.winnerPlayerIndex === partnerIndex;

  if (isPartnerWinning) {
    // Partner is winning: player does NOT have to play trump (أكل خويه)
    return { legal: true };
  }

  // Opponent is winning:
  // Check if an opponent already cut with trump
  const highestOpponentTrump = playedCardsInTrick
    .filter((p) => p.card.suit === trumpSuit)
    .reduce((max, p) => {
      return !max || HOKOM_TRUMP_POWER[p.card.rank] > HOKOM_TRUMP_POWER[max.rank]
        ? p.card
        : max;
    }, null as Card | null);

  if (highestOpponentTrump) {
    const canOverTrump = hand.some(
      (c) =>
        c.suit === trumpSuit &&
        HOKOM_TRUMP_POWER[c.rank] > HOKOM_TRUMP_POWER[highestOpponentTrump.rank]
    );

    if (canOverTrump) {
      // Player CAN overtrump: must play a higher trump than opponent's trump
      if (
        card.suit !== trumpSuit ||
        HOKOM_TRUMP_POWER[card.rank] <= HOKOM_TRUMP_POWER[highestOpponentTrump.rank]
      ) {
        return { legal: false, reason: 'يجب أن تدق بحكم أعلى من حكم الخصم لأنك تملك ذلك' };
      }
      return { legal: true };
    } else {
      // Player cannot overtrump: allowed to discard any card or play a lower trump (تخفيف)
      return { legal: true };
    }
  }

  // Opponent is winning with non-trump card: player MUST play trump (يدق حكم)
  if (card.suit !== trumpSuit) {
    return { legal: false, reason: 'الخصم يأكل الأكلة؛ يجب عليك دق حكم لأنك تملك حكماً' };
  }

  return { legal: true };
}

/**
 * Returns all playable legal cards from a player's hand.
 */
export function getLegalCards(
  hand: Card[],
  playedCardsInTrick: PlayedCard[],
  contract: GameContract,
  playerIndex: number
): Card[] {
  return hand.filter(
    (card) => isMoveLegal(card, hand, playedCardsInTrick, contract, playerIndex).legal
  );
}

/**
 * Project detection routines (المشاريع):
 * - Sira (سرة): 3 consecutive cards of same suit (20 pts)
 * - Khamsin (خمسين): 4 consecutive cards of same suit (50 pts)
 * - Mia (مية): 5 consecutive cards of same suit OR 4 of a kind (10s, Js, Qs, Ks, As) (100 pts)
 * - Arba' Meya (أربعمية): 4 Aces in Sun only (400 pts)
 * - Baloot (بلوت): King & Queen of trump in Hokom (20 pts)
 */
export interface DetectedProject {
  type: ProjectType;
  suit?: Suit;
  rank?: Rank;
  points: number;
  gamePoints: number; // In Sun, points are doubled when converted into game score
}

const SEQUENCE_ORDER: Rank[] = ['7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export function detectProjects(hand: Card[], contract: GameContract): DetectedProject[] {
  const projects: DetectedProject[] = [];

  // Group by suit
  const suitCards: Record<Suit, Rank[]> = {
    spades: [],
    hearts: [],
    diamonds: [],
    clubs: [],
  };

  for (const card of hand) {
    suitCards[card.suit].push(card.rank);
  }

  // Check 4 of a kind
  const rankCounts: Record<Rank, number> = {
    '7': 0,
    '8': 0,
    '9': 0,
    '10': 0,
    J: 0,
    Q: 0,
    K: 0,
    A: 0,
  };
  for (const card of hand) {
    rankCounts[card.rank]++;
  }

  // 4 Aces in Sun = 400
  if (contract.type === 'sun' && rankCounts.A === 4) {
    projects.push({
      type: 'arba_meya',
      rank: 'A',
      points: 400,
      gamePoints: 40,
    });
  } else if (
    rankCounts.A === 4 ||
    rankCounts.K === 4 ||
    rankCounts.Q === 4 ||
    rankCounts.J === 4 ||
    rankCounts['10'] === 4
  ) {
    // 4 of a kind = 100
    const matchedRank = (['A', 'K', 'Q', 'J', '10'] as Rank[]).find((r) => rankCounts[r] === 4);
    projects.push({
      type: 'mia',
      rank: matchedRank,
      points: 100,
      gamePoints: contract.type === 'sun' ? 20 : 10,
    });
  }

  // Check sequences in each suit
  for (const suit of Object.keys(suitCards) as Suit[]) {
    const ranks = suitCards[suit];
    if (ranks.length < 3) continue;

    // Check consecutive sequences
    const indices = ranks.map((r) => SEQUENCE_ORDER.indexOf(r)).sort((a, b) => a - b);
    let consecutiveCount = 1;
    let maxConsecutive = 1;
    let highestRankInSeq: Rank = SEQUENCE_ORDER[indices[0]];

    for (let i = 1; i < indices.length; i++) {
      if (indices[i] === indices[i - 1] + 1) {
        consecutiveCount++;
        if (consecutiveCount > maxConsecutive) {
          maxConsecutive = consecutiveCount;
          highestRankInSeq = SEQUENCE_ORDER[indices[i]];
        }
      } else {
        consecutiveCount = 1;
      }
    }

    if (maxConsecutive >= 5) {
      projects.push({
        type: 'mia',
        suit,
        rank: highestRankInSeq,
        points: 100,
        gamePoints: contract.type === 'sun' ? 20 : 10,
      });
    } else if (maxConsecutive === 4) {
      projects.push({
        type: 'khamsin',
        suit,
        rank: highestRankInSeq,
        points: 50,
        gamePoints: contract.type === 'sun' ? 10 : 5,
      });
    } else if (maxConsecutive === 3) {
      projects.push({
        type: 'sira',
        suit,
        rank: highestRankInSeq,
        points: 20,
        gamePoints: contract.type === 'sun' ? 4 : 2,
      });
    }
  }

  // Check Baloot in Hokom (King and Queen of trump)
  if (contract.type === 'hokom' && contract.suit) {
    const trumpRanks = suitCards[contract.suit];
    if (trumpRanks.includes('K') && trumpRanks.includes('Q')) {
      projects.push({
        type: 'baloot',
        suit: contract.suit,
        points: 20,
        gamePoints: 2,
      });
    }
  }

  return projects;
}
