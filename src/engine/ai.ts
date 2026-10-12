import { Card, GameContract, PlayedCard, Suit } from './types';
import { evaluateTrickWinner, getLegalCards, HOKOM_TRUMP_POWER, SUN_RANK_POWER } from './rules';

export interface BotDecisionContext {
  playerIndex: number;
  hand: Card[];
  contract: GameContract;
  currentTrickCards: PlayedCard[];
  difficulty: 'beginner' | 'intermediate' | 'expert';
  playedCardsHistory: PlayedCard[];
}

/**
 * Intelligent bot card player.
 */
export function botChooseCard(context: BotDecisionContext): Card {
  const { playerIndex, hand, contract, currentTrickCards, difficulty } = context;
  const legalCards = getLegalCards(hand, currentTrickCards, contract, playerIndex);

  if (legalCards.length === 0) {
    if (hand.length > 0) {
      console.warn(`[Bot AI] Warning: No legal cards returned for bot ${playerIndex}, using first hand card`);
      return hand[0];
    }
    throw new Error('Bot has no cards in hand to play');
  }

  if (legalCards.length === 1) {
    return legalCards[0];
  }

  if (difficulty === 'beginner') {
    // Beginner: Plays randomly or first legal
    const randomIndex = Math.floor(Math.random() * legalCards.length);
    return legalCards[randomIndex];
  }

  const partnerIndex = (playerIndex + 2) % 4;

  // If Bot is LEADING the trick:
  if (currentTrickCards.length === 0) {
    return botChooseLeadCard(legalCards, contract, difficulty);
  }

  // Not leading: Evaluate current trick winner
  const currentBest = evaluateTrickWinner(currentTrickCards, contract);
  const isPartnerWinning = currentBest.winnerPlayerIndex === partnerIndex;

  if (isPartnerWinning) {
    // Partner is winning:
    // If we have valuable cards to feed partner (Ace, 10) in Sun or non-trump in Hokom, and we can't be beaten by later players:
    const isLastPlayer = currentTrickCards.length === 3;
    if (isLastPlayer || difficulty === 'expert') {
      // Feed points to partner ("تزبيط الخوي")
      const highPointCards = legalCards.filter((c) => c.rank === 'A' || c.rank === '10');
      if (highPointCards.length > 0 && isLastPlayer) {
        return highPointCards[0];
      }
    }
    // Otherwise play lowest card
    return getLowestCard(legalCards, contract);
  }

  // Opponent is winning:
  // Find which of our legal cards can beat the current winning card
  const winningOptions = legalCards.filter((c) => {
    const testTrick = [...currentTrickCards, { playerIndex, card: c }];
    const evalTest = evaluateTrickWinner(testTrick, contract);
    return evalTest.winnerPlayerIndex === playerIndex;
  });

  if (winningOptions.length > 0) {
    // We can win! Pick the lowest card that still wins to save higher power
    return getLowestWinningCard(winningOptions, contract);
  }

  // We cannot win the trick:
  // Discard the lowest useless card
  return getLowestCard(legalCards, contract);
}

function botChooseLeadCard(
  legalCards: Card[],
  contract: GameContract,
  difficulty: 'intermediate' | 'expert'
): Card {
  if (contract.type === 'sun') {
    // Lead with Aces first (guaranteed win)
    const aces = legalCards.filter((c) => c.rank === 'A');
    if (aces.length > 0) return aces[0];

    // Otherwise lead with 10s if we also hold the Ace or partner might have it
    const tens = legalCards.filter((c) => c.rank === '10');
    if (tens.length > 0 && difficulty === 'expert') return tens[0];

    // Otherwise lead low card
    return getLowestCard(legalCards, contract);
  }

  // Hokom:
  const trumpSuit = contract.suit!;
  const trumps = legalCards.filter((c) => c.suit === trumpSuit);

  // If we have high trumps (Jack or 9), lead trump to pull opponents' trumps
  if (trumps.length > 0 && difficulty === 'expert') {
    const highTrumps = trumps.filter((c) => c.rank === 'J' || c.rank === '9');
    if (highTrumps.length > 0) return highTrumps[0];
  }

  // Non-trump Aces
  const nonTrumpAces = legalCards.filter((c) => c.suit !== trumpSuit && c.rank === 'A');
  if (nonTrumpAces.length > 0) return nonTrumpAces[0];

  return getLowestCard(legalCards, contract);
}

function getLowestCard(cards: Card[], contract: GameContract): Card {
  return [...cards].sort((a, b) => {
    if (contract.type === 'sun') {
      return SUN_RANK_POWER[a.rank] - SUN_RANK_POWER[b.rank];
    }
    const isTrumpA = a.suit === contract.suit;
    const isTrumpB = b.suit === contract.suit;
    if (isTrumpA && !isTrumpB) return 1; // save trump
    if (!isTrumpA && isTrumpB) return -1;
    if (isTrumpA && isTrumpB) return HOKOM_TRUMP_POWER[a.rank] - HOKOM_TRUMP_POWER[b.rank];
    return SUN_RANK_POWER[a.rank] - SUN_RANK_POWER[b.rank];
  })[0];
}

function getLowestWinningCard(winningCards: Card[], contract: GameContract): Card {
  return [...winningCards].sort((a, b) => {
    if (contract.type === 'sun') {
      return SUN_RANK_POWER[a.rank] - SUN_RANK_POWER[b.rank];
    }
    const isTrumpA = a.suit === contract.suit;
    const isTrumpB = b.suit === contract.suit;
    if (isTrumpA && isTrumpB) return HOKOM_TRUMP_POWER[a.rank] - HOKOM_TRUMP_POWER[b.rank];
    return SUN_RANK_POWER[a.rank] - SUN_RANK_POWER[b.rank];
  })[0];
}

/**
 * Bot bidding evaluation.
 * Decides whether to bid Sun, Hokom, or Pass during bidding rounds.
 */
export function botEvaluateBid(
  hand: Card[],
  floorCard: Card,
  biddingRound: 1 | 2,
  playerIndex: number,
  dealerIndex: number
): { action: 'pass' | 'sun' | 'hokom'; suit?: Suit } {
  // Hand power evaluation
  const acesCount = hand.filter((c) => c.rank === 'A').length;
  const tensCount = hand.filter((c) => c.rank === '10').length;

  if (biddingRound === 1) {
    // In Round 1, can buy Sun or Hokom in the floorCard's suit
    const matchingFloorSuit = hand.filter((c) => c.suit === floorCard.suit);
    const hasJackOfSuit = matchingFloorSuit.some((c) => c.rank === 'J');
    const hasNineOfSuit = matchingFloorSuit.some((c) => c.rank === '9');

    // Sun threshold: 2 or more Aces, or 1 Ace + 2 Tens
    if (acesCount >= 2 || (acesCount >= 1 && tensCount >= 2)) {
      return { action: 'sun' };
    }

    // Hokom threshold with floor card:
    // If floor card is Jack or 9, or player holds Jack/9 + at least 1 other card of that suit
    if (floorCard.rank === 'J' || floorCard.rank === '9' || (hasJackOfSuit && matchingFloorSuit.length >= 2) || (hasNineOfSuit && matchingFloorSuit.length >= 3)) {
      return { action: 'hokom', suit: floorCard.suit };
    }

    return { action: 'pass' };
  }

  // In Round 2: Floor card suit is locked out for Hokom (unless Sun or Ashkal)
  if (acesCount >= 2) {
    return { action: 'sun' };
  }

  // Check any other suit for Hokom:
  for (const s of ['spades', 'hearts', 'diamonds', 'clubs'] as Suit[]) {
    if (s === floorCard.suit) continue; // cannot pick floor card suit in 2nd round
    const cardsInSuit = hand.filter((c) => c.suit === s);
    const hasJack = cardsInSuit.some((c) => c.rank === 'J');
    const hasNine = cardsInSuit.some((c) => c.rank === '9');
    if ((hasJack && cardsInSuit.length >= 3) || (hasNine && cardsInSuit.length >= 4)) {
      return { action: 'hokom', suit: s };
    }
  }

  return { action: 'pass' };
}
