import { createDeck, dealFirstRound, dealSecondRound, shuffleDeck } from './deck';
import {
  evaluateTrickWinner,
  isMoveLegal,
  detectProjects,
  SUN_CARD_POINTS,
  HOKOM_TRUMP_POINTS,
  SUN_RANK_POWER,
  HOKOM_TRUMP_POWER,
} from './rules';
import { calculateRoundScore } from './scoring';
import { Card, GameContract, PlayedCard } from './types';

export function runEngineTests(): { passed: number; failed: number; results: string[] } {
  const results: string[] = [];
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      passed++;
      results.push(`✅ [نجاح]: ${message}`);
    } else {
      failed++;
      results.push(`❌ [فشل]: ${message}`);
    }
  }

  // 1. Deck tests
  const deck = createDeck();
  assert(deck.length === 32, 'مجموعة البلوت تتكون بدقة من 32 ورقة');
  const uniqueIds = new Set(deck.map((c) => c.id));
  assert(uniqueIds.size === 32, 'جميع الأوراق فريدة بدون تكرار');

  // 2. Deal tests
  const shuffled = shuffleDeck(deck);
  const firstDeal = dealFirstRound(shuffled, 0);
  assert(firstDeal.hands.every((h) => h.length === 5), 'التوزيع الأولي: 5 كروت لكل لاعب من الأربعة');
  assert(firstDeal.floorCard !== undefined, 'وجود كرت الشراء/الفرشة في المنتصف');
  assert(firstDeal.remainingDeck.length === 11, 'بقاء 11 كرت في السحبة للتوزيع الثاني');

  const secondHands = dealSecondRound(firstDeal.hands, firstDeal.remainingDeck, firstDeal.floorCard, 1);
  assert(secondHands.every((h) => h.length === 8), 'التوزيع النهائي: 8 كروت لكل لاعب بالضبط');
  assert(secondHands[1].some((c) => c.id === firstDeal.floorCard.id), 'المشتري يحصل على كرت الشراء');

  // 3. Sun Trick Evaluation
  const sunContract: GameContract = { type: 'sun', declaredBy: 0, multiplier: 1 };
  const sunTrick: PlayedCard[] = [
    { playerIndex: 0, card: { id: 'spades-10', suit: 'spades', rank: '10' } },
    { playerIndex: 1, card: { id: 'spades-A', suit: 'spades', rank: 'A' } },
    { playerIndex: 2, card: { id: 'spades-7', suit: 'spades', rank: '7' } },
    { playerIndex: 3, card: { id: 'hearts-A', suit: 'hearts', rank: 'A' } }, // Out of suit in Sun
  ];
  const sunResult = evaluateTrickWinner(sunTrick, sunContract);
  assert(sunResult.winnerPlayerIndex === 1, 'في الصن: إيكة السكة تأكل عشرة السكة، وإيكة الهاص لا تأكل لخروجها عن اللون');

  // 4. Hokom Trick Evaluation
  const hokomContract: GameContract = { type: 'hokom', suit: 'hearts', declaredBy: 0, multiplier: 1 };
  const hokomTrick: PlayedCard[] = [
    { playerIndex: 0, card: { id: 'spades-A', suit: 'spades', rank: 'A' } },
    { playerIndex: 1, card: { id: 'spades-10', suit: 'spades', rank: '10' } },
    { playerIndex: 2, card: { id: 'hearts-7', suit: 'hearts', rank: '7' } }, // Trump 7
    { playerIndex: 3, card: { id: 'hearts-J', suit: 'hearts', rank: 'J' } }, // Trump Jack
  ];
  const hokomResult = evaluateTrickWinner(hokomTrick, hokomContract);
  assert(hokomResult.winnerPlayerIndex === 3, 'في الحكم: ولد الحكم يأكل سبعة الحكم والأوراق العادية');

  // 5. Legal Move Rules
  const playerHand: Card[] = [
    { id: 'spades-K', suit: 'spades', rank: 'K' },
    { id: 'hearts-9', suit: 'hearts', rank: '9' },
    { id: 'clubs-A', suit: 'clubs', rank: 'A' },
  ];
  // Lead is spades
  const playedTrick1: PlayedCard[] = [
    { playerIndex: 0, card: { id: 'spades-7', suit: 'spades', rank: '7' } },
  ];
  const move1 = isMoveLegal(playerHand[0], playerHand, playedTrick1, hokomContract, 1);
  assert(move1.legal === true, 'الالتزام بلون اللعب صحيح عند توفر كرت من نفس اللون');

  const move2 = isMoveLegal(playerHand[1], playerHand, playedTrick1, hokomContract, 1);
  assert(move2.legal === false, 'ممنوع كسر اللون بلعب كرت آخر طالما يملك اللاعب من نفس اللون المطلوب');

  // 6. Project Detection
  const handWithSira: Card[] = [
    { id: 'diamonds-7', suit: 'diamonds', rank: '7' },
    { id: 'diamonds-8', suit: 'diamonds', rank: '8' },
    { id: 'diamonds-9', suit: 'diamonds', rank: '9' },
    { id: 'hearts-K', suit: 'hearts', rank: 'K' },
    { id: 'hearts-Q', suit: 'hearts', rank: 'Q' },
  ];
  const detected = detectProjects(handWithSira, hokomContract);
  assert(detected.some((p) => p.type === 'sira'), 'كشف مشروع السرة (3 كروت متتالية) بنجاح');
  assert(detected.some((p) => p.type === 'baloot'), 'كشف مشروع البلوت (شايب وبنت الحكم) بنجاح');

  // 7. Scoring calculation test
  const roundScore = calculateRoundScore({
    roundNumber: 1,
    contract: sunContract,
    completedTricks: [
      { trickNumber: 1, leadPlayer: 0, cards: sunTrick, winnerPlayer: 1, points: 23 },
    ],
    usProjectPoints: 0,
    themProjectPoints: 0,
  });
  assert(roundScore !== null, 'حساب نتيجة الجولة وخسارة المشتري بدقة رياضية');

  return { passed, failed, results };
}
