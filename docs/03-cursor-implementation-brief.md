# Cursor Implementation Brief — Ergo Games Interface Phase 6+

You are working in the existing Ergo Games Interface repository.

This is not a single-game implementation request. This is the Phase 6+ expansion of Ergo Games Interface into a reusable deterministic online game platform.

The platform must allow future games to plug into shared infrastructure for:

- deterministic game rules
- free no-funds play
- sponsored no-funds settlement scaffolding
- wallet-aware on-chain play
- explicit user-signed wallet actions
- rematches
- match series
- replay validation
- ranking
- prestige/achievements
- non-cash progression
- account conversion from no-funds user to wallet-bound user
- event batch commitments
- settlement queue/reconciliation
- operational kill switches
- compliance-safe trust language
- EKB-gated Ergo-facing implementation

## Existing Architecture Boundaries

Respect the current project architecture:

- `apps/web`: API routes, UI, mode notices, auth, wallet, rewards, on-chain intent lifecycle, settlement scaffolding.
- `packages/domain`: canonical deterministic game rule engine only.
- `packages/services`: gameplay orchestration, replay, ranking, progression, wallet, settlement, batching, rematches, series, achievements.
- `packages/db`: schema and durable repository seams.
- `docs`: architecture, API catalog, compliance gates, EKB workflow, local development, operations, release progression.

## Core Principle

Same rules, different settlement rails.

## Supported Modes

- `ON_CHAIN_PLAY`: wallet-aware path, explicit user-signed actions, finality provisional until confirmation threshold.
- `FREE_PLAY`: no-funds mode, off-chain authoritative event log, non-cash progression only.
- `SPONSORED_PLAY`: no-funds user path with controlled server-sponsored settlement scaffolding when eligible.

## Compliance

Default mode is no-wager.

Do not use:

- bet
- wager
- stake
- jackpot
- odds
- guaranteed payout
- yield
- profit
- double your money
- cash prize
- cash out

Use:

- play mode
- match result
- reward eligibility
- verification status
- on-chain confirmation
- sponsored settlement
- off-chain progression
- rank
- title
- badge
- season standing

Do not imply guaranteed monetary return.

Do not imply direct conversion from progression points to cash value.

Do not represent provisional chain states as final.

## Phase 6 — Generic Game Module Framework

1. Add `GameRules` interface in `packages/domain`.
2. Add shared `GameResult`, `ValidationResult`, `GameConfig`, and `StateHash` types.
3. Wrap existing deterministic game modules behind `GameRules`.
4. Add `gameRegistry`.
5. Extend gameplay service to resolve game rules by `gameType`.
6. Extend `/api/games/create` to accept `gameType` and config.
7. Extend `/api/games/move` to accept generic move payload while preserving existing `requestId` idempotency.
8. Add deterministic state serialization and hashing.
9. Add tests for deterministic rule execution and replayed hash output.

## Phase 7 — Game-Agnostic Gameplay Sessions

1. Add `GameSession` model with gameType, gameVersion, mode, trustLabel, status, participants, stateHash, ranked, rematchGroupId, and seriesId.
2. Add append-only `GameEvent` model.
3. Preserve `requestId` idempotency.
4. Keep route handlers thin.

## Phase 8 — Durable Repository Seams

1. Add repositories for users, wallets, game sessions, events, replays, rankings, rewards, settlement, and batch commitments.
2. Keep in-memory adapters if needed for local tests.
3. Prepare for durable DB without coupling route handlers to storage.

## Phase 9 — Replay and Verification

1. Add `replayRecorder`, `replayValidator`, and `replayProjector`.
2. Add replay APIs.
3. Reconstruct matches from initial state and moves.
4. Validate previous and next state hashes.
5. Return replay mismatch status without mutating original result.

## Phase 10 — Rematches and Series

1. Add `rematchService`, `seriesService`, and `rivalryService`.
2. Add rematch request/accept/decline APIs.
3. Add match series APIs.
4. Rematches preserve gameType and compatible config.
5. Series and rivalry logic stays outside domain rules.

## Phase 11 — Ranking and Prestige

1. Add `rankingService`, `ratingEngine`, `rankTierService`, and `leaderboardService`.
2. Add `achievementService` and `progressionService`.
3. Add ranking, leaderboard, achievement, and progression APIs.
4. Ranked games update ranking after validated completion.
5. Casual games do not affect ranking unless configured.
6. Achievements are derived from events/replays.

## Phase 12 — Healthy Post-Game Analysis

1. Add `matchStatsService` and `postGameSummaryService`.
2. Add analyzer registry for game-specific metrics.
3. Metrics are derived from replay/events.
4. Metrics do not affect official game result.
5. Post-game summary includes replay, rematch, series state, progression, ranking, achievements, and trust notice.

## Phase 13 — Browser Runtime and Game-Agnostic UI

1. Build actual Next.js runtime.
2. Add game renderer registry.
3. Add shared UI components:
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
4. UI must support `FREE_PLAY`, `SPONSORED_PLAY`, and `ON_CHAIN_PLAY` trust language.

## Phase 14 — No-Funds Account Path and Wallet Conversion

1. Add guest/register/wallet-bound account states.
2. Add account conversion endpoint.
3. Preserve match history, replays, rankings, achievements, progression, and reward lifecycle when wallet is bound.
4. Do not imply progression converts into cash value.
5. Wallet-aware actions still require explicit signing.

## Phase 15 — Batch Commitments

1. Add `batchBuilder`, `merkleRootService`, `commitmentSerializer`, and `batchCommitmentRepository`.
2. Add game batch APIs.
3. Build deterministic commitment hash from append-only game events.
4. `FREE_PLAY` batches can remain off-chain.
5. `SPONSORED_PLAY` batches can be queued if eligible.
6. `ON_CHAIN_PLAY` batches align with user-signed intent lifecycle.

## Phase 16 — Sponsored Settlement Policy

1. Add `sponsoredEligibilityService`.
2. Add refusal reasons.
3. Add policy limits.
4. Add kill switch.
5. Sponsored settlement failures must not disable core gameplay.

## Phase 17 — Wallet-Aware/Funded UX Acceleration

1. Improve intent lifecycle visibility.
2. Add recovery actions.
3. Add confirmation/finality cues.
4. Preserve explicit user signing.
5. Preserve provisional finality labels.

## Phase 18 — EKB-Gated Ergo Hardening

1. Mark wallet, settlement, contract, transaction, signature, ErgoScript, box/value stories as EKB-required.
2. Require `get_pattern`, `get_skill`, `get_eip`, and `get_ergoscript_ref` as applicable.
3. Require `audit_contract` and `audit_verify` for settlement/contract changes.
4. Block merge on missing EKB evidence or unresolved audit findings.

## Phase 19 — Abuse Prevention and Operations

1. Add abuse checks for duplicate accounts, self-play, rematch farming, ranking manipulation, settlement spam, replay mismatches.
2. Add kill switches:
   - `DISABLE_SPONSORED_SETTLEMENT`
   - `DISABLE_ON_CHAIN_INTENTS`
   - `DISABLE_RANKED_PLAY`
   - `DISABLE_REWARD_GRANTS`
   - `FORCE_FREE_PLAY_ONLY`
   - `DISABLE_BATCH_COMMITMENTS`
   - `DISABLE_REMATCH_RANKING`
3. Add operational metrics and dashboard seams.
4. Update runbook.

## Phase 20 — Seasons and Tournaments

1. Add `Season`, `SeasonStanding`, and `Tournament` models.
2. Add season and tournament APIs.
3. Default tournament mode should be `FREE_PLAY` unless policy changes.
4. No pooled participant funds or payout language.

## Phase 21 — Documentation and Release Gates

1. Update architecture, API catalog, compliance gates, EKB integration, local development, operations runbook, release progression, releases, and README.
2. Document every new API.
3. Map every endpoint to release gate ownership.
4. Add acceptance criteria, test requirements, compliance requirements, and rollback behavior.

## Validation

Run:

```bash
npm run lint
npm run test
npm run build
npm run check
```

Also validate:

- existing API smoke tests
- replay validation tests
- idempotency tests
- trust-language tests
- compliance review
- operational fallback tests

Do not implement future game-specific logic yet. Build the reusable platform layer so a future game can use these features without bloating its core rule engine.
