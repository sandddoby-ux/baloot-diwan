import { GameContract, RoundScore, Team, Trick } from './types';

export interface ScoreRoundParams {
  roundNumber: number;
  contract: GameContract;
  completedTricks: Trick[];
  usProjectPoints: number; // Raw project points
  themProjectPoints: number;
}

/**
 * Calculates end-of-round points, handles Khasara, Kaboot, and rounding rules.
 */
export function calculateRoundScore(params: ScoreRoundParams): RoundScore {
  const { roundNumber, contract, completedTricks, usProjectPoints, themProjectPoints } = params;

  let usRawCardPoints = 0;
  let themRawCardPoints = 0;
  let usTricksWon = 0;
  let themTricksWon = 0;

  for (let i = 0; i < completedTricks.length; i++) {
    const trick = completedTricks[i];
    const isUs = trick.winnerPlayer === 0 || trick.winnerPlayer === 2;
    const isThem = trick.winnerPlayer === 1 || trick.winnerPlayer === 3;
    const points = trick.points ?? 0;

    if (isUs) {
      usRawCardPoints += points;
      usTricksWon++;
    } else if (isThem) {
      themRawCardPoints += points;
      themTricksWon++;
    }

    // Last trick bonus (الأرض) = 10 raw points
    if (i === completedTricks.length - 1 && completedTricks.length === 8) {
      if (isUs) {
        usRawCardPoints += 10;
      } else if (isThem) {
        themRawCardPoints += 10;
      }
    }
  }

  const isKabootUs = usTricksWon === 8;
  const isKabootThem = themTricksWon === 8;
  const isKaboot = isKabootUs || isKabootThem;

  let usRoundPoints = 0;
  let themRoundPoints = 0;
  const buyerTeam: Team = contract.declaredBy === 0 || contract.declaredBy === 2 ? 'us' : 'them';
  let winnerTeam: Team = 'us';

  const multiplier = Math.max(1, contract.multiplier);

  if (contract.type === 'sun') {
    // SUN SCORING:
    // Total card points = 140 (130 + 10 last trick).
    // In Sun, points are divided by 5:
    // Base game points = 26.
    if (isKabootUs) {
      usRoundPoints = 44 * multiplier + Math.round(usProjectPoints / 10) * 2;
      themRoundPoints = 0;
      winnerTeam = 'us';
    } else if (isKabootThem) {
      themRoundPoints = 44 * multiplier + Math.round(themProjectPoints / 10) * 2;
      usRoundPoints = 0;
      winnerTeam = 'them';
    } else {
      // Check Khasara: buyer needs strictly > 70 card points
      const buyerPoints = buyerTeam === 'us' ? usRawCardPoints : themRawCardPoints;
      const isKhasara = buyerPoints <= 70;

      const usAbnat = Math.round(usRawCardPoints / 5);
      const themAbnat = Math.round(themRawCardPoints / 5);
      const usProjAbnat = Math.round(usProjectPoints / 10) * 2;
      const themProjAbnat = Math.round(themProjectPoints / 10) * 2;

      if (isKhasara) {
        // Buyer loses: Defender takes all 26 points + all projects
        if (buyerTeam === 'us') {
          themRoundPoints = (26 + usProjAbnat + themProjAbnat) * multiplier;
          usRoundPoints = 0;
          winnerTeam = 'them';
        } else {
          usRoundPoints = (26 + usProjAbnat + themProjAbnat) * multiplier;
          themRoundPoints = 0;
          winnerTeam = 'us';
        }
      } else {
        // Normal split
        usRoundPoints = (usAbnat + usProjAbnat) * multiplier;
        themRoundPoints = (themAbnat + themProjAbnat) * multiplier;
        winnerTeam = usRoundPoints >= themRoundPoints ? 'us' : 'them';
      }
    }
  } else {
    // HOKOM SCORING:
    // Total card points = 162 (152 + 10 last trick).
    // In Hokom, points are divided by 10 and rounded.
    if (isKabootUs) {
      usRoundPoints = 25 * multiplier + Math.round(usProjectPoints / 10);
      themRoundPoints = 0;
      winnerTeam = 'us';
    } else if (isKabootThem) {
      themRoundPoints = 25 * multiplier + Math.round(themProjectPoints / 10);
      usRoundPoints = 0;
      winnerTeam = 'them';
    } else {
      // Check Khasara: buyer needs strictly > 81 points
      const buyerPoints = buyerTeam === 'us' ? usRawCardPoints : themRawCardPoints;
      const isKhasara = buyerPoints <= 81;

      const usAbnat = roundHokom(usRawCardPoints);
      const themAbnat = roundHokom(themRawCardPoints);
      const usProjAbnat = Math.round(usProjectPoints / 10);
      const themProjAbnat = Math.round(themProjectPoints / 10);

      if (isKhasara) {
        // Buyer loses: Defender takes all 16 points + all projects
        if (buyerTeam === 'us') {
          themRoundPoints = (16 + usProjAbnat + themProjAbnat) * multiplier;
          usRoundPoints = 0;
          winnerTeam = 'them';
        } else {
          usRoundPoints = (16 + usProjAbnat + themProjAbnat) * multiplier;
          themRoundPoints = 0;
          winnerTeam = 'us';
        }
      } else {
        usRoundPoints = (usAbnat + usProjAbnat) * multiplier;
        themRoundPoints = (themAbnat + themProjAbnat) * multiplier;
        winnerTeam = usRoundPoints >= themRoundPoints ? 'us' : 'them';
      }
    }
  }

  return {
    roundNumber,
    contract,
    usCardPoints: usRawCardPoints,
    themCardPoints: themRawCardPoints,
    usProjectsPoints: usProjectPoints,
    themProjectsPoints: themProjectPoints,
    usRoundPoints,
    themRoundPoints,
    winnerTeam,
    isKaboot,
    notes: isKaboot ? 'كبوت كامل' : undefined,
  };
}

/**
 * Hokom rounding rule: 81 points -> 8, 86 points -> 9, etc.
 */
function roundHokom(rawPoints: number): number {
  const quotient = Math.floor(rawPoints / 10);
  const remainder = rawPoints % 10;
  return remainder >= 6 ? quotient + 1 : quotient;
}
