# API and Data Model Requirements

## Existing APIs to Preserve

```txt
POST /api/auth/sync
GET  /api/me
POST /api/wallet/bind

POST /api/games/create
POST /api/games/join
POST /api/games/move
GET  /api/games/[gameId]

GET  /api/rewards/[userId]

POST /api/on-chain/intents
GET  /api/on-chain/intents
GET  /api/on-chain/intents/[intentId]
POST /api/on-chain/intents/[intentId]/status
GET  /api/on-chain/status/[intentId]
POST /api/on-chain/prepare
GET  /api/on-chain/controls
POST /api/on-chain/controls

POST /api/settlement/enqueue
POST /api/settlement/worker/run
GET  /api/settlement/status/[settlementId]
POST /api/settlement/indexer/observe
```

## New APIs to Add

```txt
GET  /api/games/types
GET  /api/games/types/[gameType]

POST /api/games/rematch/request
POST /api/games/rematch/accept
POST /api/games/rematch/decline
GET  /api/games/rematch-group/[rematchGroupId]

POST /api/games/series/create
GET  /api/games/series/[seriesId]

GET  /api/games/[gameId]/replay
GET  /api/replays/[replayId]
POST /api/replays/[replayId]/validate

GET  /api/rankings/[userId]
GET  /api/leaderboards
GET  /api/achievements/[userId]
GET  /api/progression/[userId]

POST /api/account/guest
POST /api/account/register
POST /api/account/convert-to-wallet
GET  /api/account/[userId]/history

POST /api/game-batches/create
GET  /api/game-batches/[batchId]
POST /api/game-batches/[batchId]/enqueue-settlement
GET  /api/game-batches/[batchId]/status

POST /api/seasons/create
GET  /api/seasons/current
GET  /api/seasons/[seasonId]/standings

POST /api/tournaments/create
POST /api/tournaments/[tournamentId]/join
GET  /api/tournaments/[tournamentId]
POST /api/tournaments/[tournamentId]/start
GET  /api/tournaments/[tournamentId]/bracket
```

## Core Data Models

### GameSession

```ts
export type GameSession = {
  gameId: string;
  gameType: string;
  gameVersion: string;
  mode: "ON_CHAIN_PLAY" | "FREE_PLAY" | "SPONSORED_PLAY";
  trustLabel: "WALLET_PATH" | "NO_FUNDS_PATH";
  status: "WAITING" | "ACTIVE" | "COMPLETE" | "ABANDONED";
  hostUserId: string;
  joinerUserId?: string;
  participantUserIds: string[];
  currentTurnUserId?: string;
  winnerUserId?: string | null;
  resultReason?: "WIN" | "DRAW" | "FORFEIT" | "TIMEOUT";
  currentStateHash: string;
  moveCount: number;
  ranked: boolean;
  rematchGroupId?: string;
  seriesId?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
};
```

### GameEvent

```ts
export type GameEvent = {
  eventId: string;
  gameId: string;
  eventIndex: number;
  eventType:
    | "GAME_CREATED"
    | "PLAYER_JOINED"
    | "MOVE_SUBMITTED"
    | "MOVE_REJECTED"
    | "MOVE_APPLIED"
    | "GAME_COMPLETED"
    | "GAME_ABANDONED"
    | "REMATCH_REQUESTED"
    | "REMATCH_ACCEPTED";
  actorUserId?: string;
  requestId?: string;
  previousStateHash?: string;
  nextStateHash?: string;
  payload: unknown;
  createdAt: string;
};
```

### GameReplay

```ts
export type GameReplay = {
  replayId: string;
  gameId: string;
  gameType: string;
  gameVersion: string;
  initialState: unknown;
  initialStateHash: string;
  finalStateHash: string;
  moves: ReplayMove[];
  result: GameResult;
  createdAt: string;
};
```

### ReplayMove

```ts
export type ReplayMove = {
  moveNumber: number;
  actorUserId: string;
  move: unknown;
  previousStateHash: string;
  nextStateHash: string;
  appliedAt: string;
};
```

### RematchGroup

```ts
export type RematchGroup = {
  rematchGroupId: string;
  originalGameId: string;
  gameType: string;
  participantUserIds: string[];
  gameIds: string[];
  createdAt: string;
  updatedAt: string;
};
```

### MatchSeries

```ts
export type MatchSeries = {
  seriesId: string;
  gameType: string;
  participantUserIds: string[];
  gameIds: string[];
  format: "BEST_OF_3" | "BEST_OF_5" | "OPEN_RIVALRY";
  scoreByUserId: Record<string, number>;
  status: "ACTIVE" | "COMPLETE";
  createdAt: string;
};
```

### RankingProfile

```ts
export type RankingProfile = {
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
};
```

### RankingEvent

```ts
export type RankingEvent = {
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
};
```

### WalletBinding

```ts
export type WalletBinding = {
  walletBindingId: string;
  userId: string;
  network: "testnet" | "mainnet";
  address: string;
  verified: boolean;
  createdAt: string;
};
```

### GameBatchCommitment

```ts
export type GameBatchCommitment = {
  batchId: string;
  gameType?: string;
  mode: "FREE_PLAY" | "SPONSORED_PLAY" | "ON_CHAIN_PLAY";
  fromEventId: string;
  toEventId: string;
  eventCount: number;
  merkleRoot: string;
  commitmentHash: string;
  settlementId?: string;
  status:
    | "CREATED"
    | "QUEUED"
    | "COMMITTED"
    | "OBSERVED"
    | "VERIFIED"
    | "FAILED";
  createdAt: string;
};
```

### Sponsored Settlement Refusal Reasons

```ts
export type SponsoredSettlementRefusalReason =
  | "NOT_SPONSORED_MODE"
  | "GAME_NOT_COMPLETE"
  | "REPLAY_INVALID"
  | "BATCH_INVALID"
  | "USER_LIMIT_EXCEEDED"
  | "SYSTEM_LIMIT_EXCEEDED"
  | "ABUSE_FLAGGED"
  | "SPONSORED_SETTLEMENT_DISABLED"
  | "POLICY_NOT_ELIGIBLE";
```

## Required Service Modules

```txt
packages/services/src/gameplay/
  gameSessionService.ts
  moveService.ts
  rematchService.ts
  seriesService.ts

packages/services/src/replay/
  replayRecorder.ts
  replayValidator.ts
  replayProjector.ts

packages/services/src/ranking/
  ratingEngine.ts
  rankTierService.ts
  leaderboardService.ts
  seasonService.ts

packages/services/src/achievements/
  achievementService.ts
  achievementDefinitions.ts

packages/services/src/progression/
  progressionService.ts

packages/services/src/settlement/
  settlementQueue.ts
  sponsoredEligibilityService.ts
  batchCommitments/
    batchBuilder.ts
    merkleRootService.ts
    commitmentSerializer.ts

packages/services/src/wallet/
  walletBindingService.ts
  walletVerificationService.ts
```
