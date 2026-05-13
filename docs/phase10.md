Implement shared rematch and series infrastructure.

Do not implement this inside domain game rules.

Create services:
- rematchService
- seriesService
- rivalryService

Create RematchGroup:
{
  rematchGroupId: string;
  originalGameId: string;
  gameType: string;
  participantUserIds: string[];
  gameIds: string[];
  createdAt: string;
  updatedAt: string;
}

Create RematchRequest:
{
  rematchRequestId: string;
  sourceGameId: string;
  requestedByUserId: string;
  requestedToUserId: string;
  status: "PENDING" | "ACCEPTED" | "DECLINED" | "EXPIRED";
  createdAt: string;
  expiresAt: string;
}

Create MatchSeries:
{
  seriesId: string;
  gameType: string;
  participantUserIds: string[];
  gameIds: string[];
  format: "BEST_OF_3" | "BEST_OF_5" | "OPEN_RIVALRY";
  scoreByUserId: Record<string, number>;
  status: "ACTIVE" | "COMPLETE";
  createdAt: string;
}

Add APIs:
- POST /api/games/rematch/request
- POST /api/games/rematch/accept
- POST /api/games/rematch/decline
- GET /api/games/rematch-group/[rematchGroupId]
- POST /api/games/series/create
- GET /api/games/series/[seriesId]

Behavior:
- completed games may offer rematch when allowRematch is true
- rematch creates a new GameSession with same gameType and compatible config
- rematch must preserve mode unless explicitly allowed by policy
- series tracks scores across linked games
- rematch/series logic must not affect deterministic game results