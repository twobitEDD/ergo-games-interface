Implement shared ranking and prestige infrastructure for deterministic skill-based games.

Do not put ranking inside domain game rules.

Create services:
- rankingService
- ratingEngine
- rankTierService
- leaderboardService
- achievementService
- progressionService
- seasonService

RankingProfile:
{
  userId: string;
  gameType: string;
  rating: number;
  rankTier: string;
  rankDivision: number;
  wins: number;
  losses: number;
  draws: number;
  currentStreak: number;
  bestStreak: number;
  seasonId?: string;
  updatedAt: string;
}

RankingEvent:
{
  eventId: string;
  userId: string;
  gameId: string;
  gameType: string;
  oldRating: number;
  newRating: number;
  oldRank?: string;
  newRank?: string;
  reason:
    | "MATCH_RESULT"
    | "SEASON_RESET"
    | "ADMIN_ADJUSTMENT"
    | "ABUSE_CORRECTION";
  createdAt: string;
}

Achievement:
{
  achievementId: string;
  gameType?: string;
  title: string;
  description: string;
  criteriaType: string;
  visible: boolean;
}

AchievementEvent:
{
  eventId: string;
  userId: string;
  achievementId: string;
  gameId?: string;
  gameType?: string;
  createdAt: string;
}

Add APIs:
- GET /api/rankings/[userId]?gameType=<gameType>
- GET /api/leaderboards?gameType=<gameType>&period=<period>
- GET /api/achievements/[userId]?gameType=<gameType>
- GET /api/progression/[userId]?gameType=<gameType>

Ranking behavior:
- ranked games update ranking after validated game completion
- casual games do not update ranking
- ranking updates are evented and auditable
- achievements are derived from completed game events or replay analysis
- leaderboard entries can be global, weekly, seasonal, friends/private group, and game-specific

Compliance:
- progression must be non-cash
- rewards must be framed as progression, eligibility, titles, badges, or verification status
- do not use payout, wager, stake, yield, jackpot, odds, or cash-out language