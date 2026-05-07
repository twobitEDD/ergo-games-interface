# API Endpoint Catalog and Trust Semantics

This catalog documents the current API surface in `apps/web/src/app/api` and the trust semantics expected in responses.

## Mode and Trust Vocabulary

- Modes:
  - `ON_CHAIN_PLAY`
  - `FREE_PLAY`
  - `SPONSORED_PLAY`
- Trust labels used across gameplay endpoints:
  - `WALLET_PATH`
  - `NO_FUNDS_PATH`
- Trust intent:
  - Never imply wagers, guaranteed payout, or guaranteed monetary return.
  - Keep chain finality as provisional until configured confirmation depth.

## Auth and User Endpoints

- `POST /api/auth/sync`
  - Purpose: create/update user from external auth identity.
  - Body: `externalAuthId`, `displayName`.
- `GET /api/me?userId=<id>`
  - Purpose: fetch user profile by user ID.
- `POST /api/wallet/bind`
  - Purpose: attach Ergo wallet metadata to an existing user.
  - Body: `userId`, `network`, `address`.

## Gameplay Endpoints

- `POST /api/games/create`
  - Body: `hostUserId`, `mode`.
  - Returns created game plus trust label/notice.
- `POST /api/games/join`
  - Body: `gameId`, `joinerUserId`.
  - Enforces host/joiner constraints and mode-specific trust messaging.
- `POST /api/games/move`
  - Body: `gameId`, `actorUserId`, `cell`, optional `requestId`.
  - Applies deterministic move rules with replay-safe idempotency using `requestId`.
- `GET /api/games/[gameId]?userId=<participantId>`
  - Returns game projection, append-only ledger events, rewards/progression (when participant provided), and mode trust notice.

## Rewards and Settlement Visibility

- `GET /api/rewards/[userId]`
  - Returns progression summary, rewards, and settlement lifecycle entries for user.
  - Includes lifecycle guide (`reward granted` -> `proof pending` -> `verified on Ergo`).

## On-Chain Intent Lifecycle Endpoints

- `POST /api/on-chain/intents`
  - Creates idempotent on-chain intent.
  - Restricted to `ON_CHAIN_PLAY` games.
- `GET /api/on-chain/intents`
  - List intents with filters: `status`, `gameId`, `settlementId`, `pendingOnly`, `includeRecovery`.
- `GET /api/on-chain/intents/[intentId]`
  - Fetch full intent record and trust notice.
- `POST /api/on-chain/intents/[intentId]/status`
  - Update lifecycle status; rejects invalid transitions and incident-fallback-blocked updates.
- `GET /api/on-chain/status/[intentId]`
  - Compatibility status endpoint returning finality view and controls.
- `POST /api/on-chain/prepare`
  - Compatibility endpoint that creates a prepared intent scaffold.
- `GET /api/on-chain/controls`
  - Read intent finality controls.
- `POST /api/on-chain/controls`
  - Update controls (`strictConfirmationMode`, `optimisticMode`, fallback, depth).

## Settlement Queue and Reconciliation Endpoints

- `POST /api/settlement/enqueue`
  - Queue a sponsored-eligible settlement.
- `POST /api/settlement/worker/run`
  - Execute worker pass for queued/retry settlements.
- `GET /api/settlement/status/[settlementId]`
  - Return lifecycle status, queue status, rail/reason, and proof metadata.
- `POST /api/settlement/indexer/observe`
  - Record commitment hash observation and reconcile verified settlements.

## Trust Semantics by Mode

- `ON_CHAIN_PLAY`
  - API responses must describe lifecycle signals, not guaranteed outcomes.
  - Finality labels remain provisional until threshold confirmations.
- `FREE_PLAY`
  - API responses describe off-chain event logging and non-cash progression only.
- `SPONSORED_PLAY`
  - API responses describe no-funds user path with controlled server-sponsored scaffolding when eligible.

## Error Semantics (Current Pattern)

- `400`: malformed or invalid payload.
- `404`: missing user/game/intent/settlement resource.
- `409`: conflict with lifecycle or policy constraints (invalid transition, mode mismatch, non-eligible queueing).

## Adoption Note

As this API matures, keep this catalog versioned and map each endpoint to release gate ownership in `docs/release-progression.md`.
