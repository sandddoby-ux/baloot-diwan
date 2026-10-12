import { Card, Rank, Suit } from './types';

export const SUITS: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];
export const RANKS: Rank[] = ['7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export const SUIT_SYMBOLS: Record<Suit, string> = {
  spades: '♠',
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
};

export const SUIT_NAMES_AR: Record<Suit, string> = {
  spades: 'سبيد (سكة)',
  hearts: 'هاص',
  diamonds: 'ديمن',
  clubs: 'كلفس (شيريا)',
};

export const RANK_NAMES_AR: Record<Rank, string> = {
  '7': 'سبعة',
  '8': 'ثمانية',
  '9': 'تسعة',
  '10': 'عشرة',
  J: 'ولد (جاك)',
  Q: 'بنت (كويك)',
  K: 'شايب (كينغ)',
  A: 'كة (إيكة)',
};

/**
 * Creates a fresh, standard 32-card Baloot deck.
 */
export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({
        id: `${suit}-${rank}`,
        suit,
        rank,
      });
    }
  }
  return deck;
}

/**
 * Shuffles an array of cards using the cryptographically secure Fisher-Yates algorithm.
 */
export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export interface DealResultFirstRound {
  hands: [Card[], Card[], Card[], Card[]];
  floorCard: Card;
  remainingDeck: Card[];
}

/**
 * First round deal:
 * Each of the 4 players gets 3 cards, then 2 cards (total 5 cards).
 * The 21st card is placed face-up in the center (floorCard / كرت الشراء).
 * The remaining 11 cards stay in the deck for the second deal.
 */
export function dealFirstRound(shuffledDeck: Card[], dealerIndex: number): DealResultFirstRound {
  const hands: [Card[], Card[], Card[], Card[]] = [[], [], [], []];
  let deckIndex = 0;

  // Dealing order starts with the player to the right of the dealer: (dealerIndex + 1) % 4
  const dealOrder = [
    (dealerIndex + 1) % 4,
    (dealerIndex + 2) % 4,
    (dealerIndex + 3) % 4,
    dealerIndex,
  ];

  // First batch: 3 cards each
  for (const playerIdx of dealOrder) {
    hands[playerIdx].push(...shuffledDeck.slice(deckIndex, deckIndex + 3));
    deckIndex += 3;
  }

  // Second batch: 2 cards each
  for (const playerIdx of dealOrder) {
    hands[playerIdx].push(...shuffledDeck.slice(deckIndex, deckIndex + 2));
    deckIndex += 2;
  }

  // The floor card
  const floorCard = shuffledDeck[deckIndex];
  deckIndex += 1;

  const remainingDeck = shuffledDeck.slice(deckIndex);

  return {
    hands,
    floorCard,
    remainingDeck,
  };
}

/**
 * Second round deal after a contract is purchased:
 * The buyer takes the floorCard + 2 cards from the remaining deck (total 8 cards).
 * The other 3 players get 3 cards each from the remaining deck (total 8 cards each).
 */
export function dealSecondRound(
  hands: [Card[], Card[], Card[], Card[]],
  remainingDeck: Card[],
  floorCard: Card,
  buyerIndex: number
): [Card[], Card[], Card[], Card[]] {
  const completedHands: [Card[], Card[], Card[], Card[]] = [
    [...hands[0]],
    [...hands[1]],
    [...hands[2]],
    [...hands[3]],
  ];

  let deckIdx = 0;

  for (let p = 0; p < 4; p++) {
    if (p === buyerIndex) {
      // Buyer gets the floor card and 2 cards from the deck
      completedHands[p].push(floorCard);
      completedHands[p].push(remainingDeck[deckIdx++]);
      completedHands[p].push(remainingDeck[deckIdx++]);
    } else {
      // Other players get 3 cards from the deck
      completedHands[p].push(remainingDeck[deckIdx++]);
      completedHands[p].push(remainingDeck[deckIdx++]);
      completedHands[p].push(remainingDeck[deckIdx++]);
    }
  }

  return completedHands;
}

/**
 * Sorts cards in player's hand by suit and rank for clean UX.
 */
export function sortHand(hand: Card[], trumpSuit?: Suit): Card[] {
  const suitOrder: Record<Suit, number> = {
    spades: 0,
    hearts: 1,
    clubs: 2,
    diamonds: 3,
  };

  // If there's a trump suit, put it on the far right / left
  const rankOrderSun: Record<Rank, number> = {
    '7': 0,
    '8': 1,
    '9': 2,
    J: 3,
    Q: 4,
    K: 5,
    '10': 6,
    A: 7,
  };

  const rankOrderHokom: Record<Rank, number> = {
    '7': 0,
    '8': 1,
    Q: 2,
    K: 3,
    '10': 4,
    A: 5,
    '9': 6,
    J: 7,
  };

  return [...hand].sort((a, b) => {
    if (a.suit !== b.suit) {
      if (trumpSuit) {
        if (a.suit === trumpSuit) return -1;
        if (b.suit === trumpSuit) return 1;
      }
      return suitOrder[a.suit] - suitOrder[b.suit];
    }
    const isTrump = trumpSuit && a.suit === trumpSuit;
    const order = isTrump ? rankOrderHokom : rankOrderSun;
    return (order[a.rank] ?? 0) - (order[b.rank] ?? 0);
  });
}
