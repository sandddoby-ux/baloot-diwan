export type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs';
export type Rank = '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
}

export type PlayerPosition = 'bottom' | 'left' | 'top' | 'right'; // bottom = current user (player 0), right = player 1, top = partner (player 2), left = player 3
export type Team = 'us' | 'them'; // 'us' = bottom & top, 'them' = right & left

export type GameContractType = 'sun' | 'hokom';

export interface GameContract {
  type: GameContractType;
  suit?: Suit; // For Hokom
  declaredBy: number; // Player index (0-3)
  multiplier: number; // 1, 2 (double), 3, 4, etc.
}

export type ProjectType = 'sira' | 'khamsin' | 'mia' | 'arba_meya' | 'baloot';

export interface DeclaredProject {
  playerIndex: number;
  type: ProjectType;
  suit?: Suit;
  highestRank?: Rank;
  points: number; // Raw project points (e.g. 20, 50, 100, 400)
  gamePoints: number; // Converted points towards game score
  approved: boolean; // Highest project between both teams gets approved
}

export interface PlayedCard {
  playerIndex: number;
  card: Card;
}

export interface Trick {
  trickNumber: number;
  leadPlayer: number;
  cards: PlayedCard[];
  winnerPlayer?: number;
  points?: number; // Total points in this trick
}

export type GamePhase = 
  | 'dealing'
  | 'bidding_round_1'
  | 'bidding_round_2'
  | 'announcing_projects'
  | 'playing'
  | 'round_end'
  | 'match_end';

export interface PlayerState {
  id: string;
  name: string;
  avatar: string;
  isBot: boolean;
  botDifficulty?: 'beginner' | 'intermediate' | 'expert';
  isHost?: boolean;
  hand: Card[];
  team: Team;
  seatIndex: number; // 0, 1, 2, 3
  connected: boolean;
  ready: boolean;
}

export interface RoundScore {
  roundNumber: number;
  contract: GameContract;
  usCardPoints: number;
  themCardPoints: number;
  usProjectsPoints: number;
  themProjectsPoints: number;
  usRoundPoints: number; // Abat added to total
  themRoundPoints: number; // Abat added to total
  winnerTeam: Team;
  isKaboot: boolean;
  notes?: string;
}

export interface MatchScore {
  us: number; // Target 152
  them: number; // Target 152
  target: number; // 152
  roundHistory: RoundScore[];
}

export interface BalootGameState {
  id: string;
  roomCode?: string;
  phase: GamePhase;
  dealerIndex: number; // Current dealer (0-3)
  turnIndex: number; // Whose turn is it now (0-3)
  turnSequenceId?: number; // Monotonically increasing sequence to trigger turn changes reliably
  isTrickResolving?: boolean; // When true, table displays completed trick before collecting
  lastTrickWinner?: number; // Winner of the trick being collected
  floorCard: Card | null; // The card exposed during bidding
  contract: GameContract | null;
  players: PlayerState[];
  currentTrick: Trick;
  completedTricks: Trick[];
  projects: DeclaredProject[];
  matchScore: MatchScore;
  lastRoundScore?: RoundScore | null;
  currentRoundNumber: number;
  lastActionTime: number;
  turnTimeoutSeconds: number;
  biddingPassCount: number;
}
