Extend the existing gameplay APIs so they support any registered deterministic game type.

Existing APIs to preserve:
- POST /api/games/create
- POST /api/games/join
- POST /api/games/move
- GET /api/games/[gameId]?userId=<participantId>

The current API catalog says:
- create currently receives hostUserId and mode
- move currently receives gameId, actorUserId, cell, optional requestId
- move applies deterministic rules with replay-safe idempotency using requestId
- game projection returns append-only ledger events, rewards/progression when participant is provided, and mode trust notice

Extend /api/games/create body to support:
{
  hostUserId: string;
  mode: "ON_CHAIN_PLAY" | "FREE_PLAY" | "SPONSORED_PLAY";
  gameType: string;
  config?: {
    ranked?: boolean;
    timerMode?: "none" | "rapid" | "blitz";
    visibility?: "public" | "private";
    allowRematch?: boolean;
    allowSpectators?: boolean;
  };
}

Extend /api/games/move body to support:
{
  gameId: string;
  actorUserId: string;
  move: unknown;
  requestId?: string;
}

Preserve backward compatibility if existing tests still send `cell`.

Implement game service flow:
API route
  -> gameplay service
    -> load session
    -> resolve game rules from gameRegistry
    -> validate actor and turn
    -> validate move with domain rules
    -> apply move with domain rules
    -> write append-only event
    -> update session projection
    -> return trust-labeled response

Do not put game-specific branching into API route handlers beyond resolving gameType.