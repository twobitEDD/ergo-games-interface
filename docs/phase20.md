Implement long-term competitive infrastructure.

Create Season:
{
  seasonId: string;
  gameType?: string;
  name: string;
  startsAt: string;
  endsAt: string;
  status: "UPCOMING" | "ACTIVE" | "COMPLETE";
}

Create SeasonStanding:
{
  seasonId: string;
  userId: string;
  gameType: string;
  finalRank: string;
  finalRating: number;
  wins: number;
  losses: number;
  draws: number;
  achievementsEarned: string[];
}

Create Tournament:
{
  tournamentId: string;
  gameType: string;
  mode: "FREE_PLAY" | "SPONSORED_PLAY" | "ON_CHAIN_PLAY";
  name: string;
  format: "SINGLE_ELIMINATION" | "DOUBLE_ELIMINATION" | "ROUND_ROBIN";
  status: "DRAFT" | "OPEN" | "ACTIVE" | "COMPLETE";
  participantLimit: number;
  createdAt: string;
}

Add APIs:
- POST /api/seasons/create
- GET /api/seasons/current
- GET /api/seasons/[seasonId]/standings
- POST /api/tournaments/create
- POST /api/tournaments/[tournamentId]/join
- GET /api/tournaments/[tournamentId]
- POST /api/tournaments/[tournamentId]/start
- GET /api/tournaments/[tournamentId]/bracket

Compliance:
- default tournament mode should be FREE_PLAY unless policy allows otherwise
- no pooled participant funds
- no cash-prize-from-losses language
- no payout framing
- use placement, title, badge, standing, rank, season reward eligibility, verification status