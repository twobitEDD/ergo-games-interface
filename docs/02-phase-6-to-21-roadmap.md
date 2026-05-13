# Ergo Games Interface Phase 6–21 Roadmap

## Phase 6 — Multi-Game Domain Framework

Objective: Create a reusable deterministic game framework.

Requirements:

- Add a generic `GameRules` interface.
- Add shared `GameResult`, `ValidationResult`, `GameConfig`, and `StateHash` types.
- Wrap existing deterministic game modules behind the interface.
- Add `gameRegistry`.
- Extend gameplay services to resolve rules by `gameType`.
- Add deterministic serialization and hashing.
- Add tests for validation, result detection, replayed state hash, and deterministic state transitions.

Acceptance:

- Any future deterministic game can be registered.
- Game rules stay isolated in `packages/domain`.
- Route handlers do not fork game logic.

## Phase 7 — Game-Agnostic Gameplay Sessions

Objective: Upgrade sessions to support any registered game.

Requirements:

- Add `GameSession`.
- Add `GameEvent`.
- Preserve `requestId` idempotency.
- Support `gameType`, `gameVersion`, mode, trust label, participants, ranked flag, rematch group, and series ID.
- Keep route handlers thin.

Acceptance:

- Game sessions are no longer hardcoded around one move shape.
- Move validation is routed through `gameRegistry`.
- Trust notices remain mode-aware.

## Phase 8 — Durable Repository Seams

Objective: Prepare in-memory state for durable storage.

Requirements:

- Add repositories for users, wallets, game sessions, events, replays, rankings, rewards, settlement, and batch commitments.
- Keep in-memory adapters available for local tests.
- Avoid direct DB access from route handlers.

Acceptance:

- Server restart path can be supported later.
- Append-only event ledger is abstracted.
- Tests can run against repository interfaces.

## Phase 9 — Replay and Verification

Objective: Make every completed game reconstructable.

Requirements:

- Add `replayRecorder`.
- Add `replayValidator`.
- Add `replayProjector`.
- Add replay APIs.
- Validate previous and next state hashes.
- Reconstruct final state from initial state and moves.

Acceptance:

- A replay can independently reproduce final state hash.
- Replay mismatch is reportable.
- Replay validation does not mutate original game result.

## Phase 10 — Rematches and Series

Objective: Add healthy repeat-play infrastructure.

Requirements:

- Add `rematchService`.
- Add `seriesService`.
- Add `rivalryService`.
- Add rematch request, accept, decline APIs.
- Add match series APIs.
- Preserve game type and compatible config for rematches.

Acceptance:

- Completed games can trigger rematch.
- Series can track best-of formats or open rivalries.
- Rematch and series logic stays outside domain rules.

## Phase 11 — Ranking and Prestige

Objective: Add reusable competitive progression.

Requirements:

- Add `rankingService`.
- Add `ratingEngine`.
- Add `rankTierService`.
- Add `leaderboardService`.
- Add `achievementService`.
- Add `progressionService`.
- Add ranking, leaderboard, achievement, and progression APIs.

Acceptance:

- Ranked games update ranking after validated completion.
- Casual games do not affect ranking unless configured.
- Achievements are derived from events or replay analysis.
- Progression remains non-cash.

## Phase 12 — Healthy Post-Game Analysis

Objective: Add replay-derived skill feedback.

Requirements:

- Add `matchStatsService`.
- Add `postGameSummaryService`.
- Add analyzer registry for optional game-specific metrics.
- Derive metrics from events/replays.
- Keep metrics separate from official result.

Acceptance:

- Post-game summary includes replay, rematch, rank change, achievements, series state, and trust notice.
- Analysis failure does not invalidate game result.

## Phase 13 — Browser Runtime and Game-Agnostic UI

Objective: Build the real interactive web runtime.

Requirements:

- Initialize long-running Next.js app runtime.
- Add game renderer registry.
- Add shared UI components:
  - `ModeBadge`
  - `TrustNotice`
  - `WalletPathNotice`
  - `NoFundsPathNotice`
  - `SponsoredSettlementNotice`
  - `FinalityStatusPill`
  - `GameShell`
  - `MatchStatusBar`
  - `MoveHistory`
  - `PostGameSummary`
  - `RematchPanel`
  - `SeriesPanel`
  - `ReplayViewer`
  - `RankingPanel`
  - `LeaderboardPanel`
  - `AchievementPanel`
  - `WalletBindPanel`

Acceptance:

- Users can create, join, play, replay, and rematch.
- UI supports all modes with correct trust language.

## Phase 14 — No-Funds Account Path and Wallet Conversion

Objective: Allow players to start without funds and later bind a wallet.

Requirements:

- Add guest, registered, and wallet-bound account states.
- Add account conversion endpoint.
- Preserve match history, replays, rankings, achievements, progression, and reward lifecycle.
- Wallet binding does not convert progression into cash value.

Acceptance:

- No-funds players can become wallet-aware users without losing identity.
- Wallet-aware actions still require explicit signing.

## Phase 15 — Batch Commitments

Objective: Create deterministic commitments from off-chain actions.

Requirements:

- Add `batchBuilder`.
- Add `merkleRootService`.
- Add `commitmentSerializer`.
- Add `batchCommitmentRepository`.
- Add game batch APIs.
- Build commitment hashes from append-only events.

Acceptance:

- FREE_PLAY batches may stay off-chain.
- SPONSORED_PLAY batches may queue if eligible.
- ON_CHAIN_PLAY batches align with user-signed intent lifecycle.

## Phase 16 — Sponsored Settlement Policy

Objective: Add controlled server-sponsored settlement eligibility.

Requirements:

- Add `sponsoredEligibilityService`.
- Add refusal reasons.
- Add policy limits.
- Add kill switch.
- Add audit log.

Acceptance:

- Ineligible sponsored settlement returns explicit refusal reason.
- Sponsored settlement can be disabled without disabling gameplay.

## Phase 17 — Wallet-Aware UX Acceleration

Objective: Improve funded/wallet-aware intent visibility.

Requirements:

- Improve pending intent visibility.
- Add recovery actions.
- Add confirmation/finality cues.
- Preserve user signing boundaries.
- Never overstate finality.

Acceptance:

- Users can understand intent lifecycle state.
- Interrupted lifecycle paths have recovery actions.

## Phase 18 — EKB-Gated Ergo Hardening

Objective: Gate all Ergo-facing work through required EKB workflow.

Requirements:

- Mark wallet, settlement, contract, transaction, signature, ErgoScript, and box/value stories as EKB-required.
- Require relevant EKB references.
- Require two-pass audit artifacts for contract/settlement changes.

Acceptance:

- Missing EKB evidence blocks merge.
- Unresolved audit findings block merge.

## Phase 19 — Abuse Prevention and Operations

Objective: Add public-readiness controls.

Requirements:

- Detect duplicate accounts, self-play, rematch farming, ranking manipulation, reward abuse, settlement spam, replay mismatch frequency, and batch anomalies.
- Add kill switches.
- Add operational dashboard seams.
- Update runbook.

Acceptance:

- Critical systems can be disabled without disabling core gameplay.
- Fallback to off-chain-only mode is available.

## Phase 20 — Seasons and Tournaments

Objective: Add long-term prestige infrastructure.

Requirements:

- Add Season.
- Add SeasonStanding.
- Add Tournament.
- Add season and tournament APIs.
- Default tournaments to no-funds unless policy changes.

Acceptance:

- Seasons and tournaments use skill/prestige framing.
- No pooled participant funds or payout language.

## Phase 21 — Documentation and Release Gates

Objective: Keep docs aligned with implementation.

Requirements:

- Update architecture.
- Update API catalog.
- Update compliance gates.
- Update EKB workflow.
- Update local development docs.
- Update operations runbook.
- Update release progression.
- Update release checklist.
- Update README.

Acceptance:

- Every new API is documented.
- Every new feature maps to acceptance criteria, tests, compliance review, and rollback behavior.
