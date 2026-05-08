Move gameplay sessions and event history toward durable storage through packages/db repository seams.

Current docs say runtime state is currently in-memory:
- memoryStore
- settlement queue
- intent service

The goal is to preserve deterministic local behavior while creating repository interfaces that can later be backed by a real database.

Create or scaffold repositories:
- userRepository
- walletRepository
- gameSessionRepository
- gameEventRepository
- replayRepository
- rankingRepository
- rewardRepository
- settlementRepository
- batchCommitmentRepository

Create GameSession type:
{
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
}

Create GameEvent type:
{
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
}

Idempotency:
- preserve requestId behavior for moves
- enforce unique(gameId, actorUserId, requestId) when requestId exists
- duplicate requestId should return the original result/projection, not apply the move twice

Acceptance:
- event ledger is append-only
- every valid move has previousStateHash and nextStateHash
- rejected moves can be logged without mutating game state
- duplicate requests do not duplicate events
- state can be reconstructed from initial state plus events