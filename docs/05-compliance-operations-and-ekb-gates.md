# Compliance, Operations, and EKB Gates

## Compliance Requirements

The platform remains no-wager by default.

### Prohibited Product Language

Do not use:

- bet
- wager
- stake your funds
- jackpot
- odds
- casino-style
- guaranteed payout
- risk-free profit
- earn yield
- double your money
- win real money every game
- cash prize from entry pool
- cash out

### Approved Product Language

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
- standing
- season reward eligibility

## Mode-Specific Trust Language

### ON_CHAIN_PLAY

Required messaging:

- wallet-aware path
- explicit user-signed actions
- submitted state is not final
- confirmed state is not necessarily finalized unless confirmation depth is met
- finality remains provisional until configured threshold

### FREE_PLAY

Required messaging:

- no-funds path
- off-chain progression
- non-cash progression
- event logging
- no wallet required

### SPONSORED_PLAY

Required messaging:

- no-funds user path
- sponsored settlement may be available when eligible
- eligibility is not guaranteed
- sponsored settlement can fail or be disabled
- core gameplay can continue off-chain

## Operational Kill Switches

Required controls:

```txt
DISABLE_SPONSORED_SETTLEMENT
DISABLE_ON_CHAIN_INTENTS
DISABLE_RANKED_PLAY
DISABLE_REWARD_GRANTS
FORCE_FREE_PLAY_ONLY
DISABLE_BATCH_COMMITMENTS
DISABLE_REMATCH_RANKING
DISABLE_TOURNAMENTS
```

## Abuse Prevention

Required abuse checks:

- duplicate account farming
- self-play ranking abuse
- rematch farming
- suspicious win trading
- ranking manipulation
- reward endpoint abuse
- sponsored settlement spam
- replay mismatch frequency
- batch commitment anomalies
- settlement retry anomalies

## Operational Dashboard Seams

Track:

- active games
- completed games
- invalid move attempts
- replay validation failures
- settlement queue depth
- settlement retries
- indexer observations
- provisional vs finalized intent counts
- sponsored settlement refusal counts
- abuse flags
- ranking correction events
- batch commitment failures

## Incident Behavior

The platform must support:

- pause lifecycle progression when trust/finality is uncertain
- fallback to off-chain-only mode when settlement path fails
- quarantine replay mismatches
- pause reward grants during abuse review
- preserve audit log
- record post-incident review

## Sponsored Settlement Eligibility

Sponsored settlement is allowed only when:

- mode is `SPONSORED_PLAY`
- sponsored settlement is enabled
- game is complete
- replay validates
- batch commitment validates
- account passes abuse checks
- game type is eligible
- user/system limits are not exceeded

Refusal reasons:

- `NOT_SPONSORED_MODE`
- `GAME_NOT_COMPLETE`
- `REPLAY_INVALID`
- `BATCH_INVALID`
- `USER_LIMIT_EXCEEDED`
- `SYSTEM_LIMIT_EXCEEDED`
- `ABUSE_FLAGGED`
- `SPONSORED_SETTLEMENT_DISABLED`
- `POLICY_NOT_ELIGIBLE`

## EKB-Gated Ergo Work

All wallet, settlement, contract, transaction-building, signature UX, ErgoScript, box/value handling, Fleet SDK, Nautilus, Babel fee, or AppKit work must follow the EKB workflow.

### Before Implementation

Classify scope:

- UI/API only
- domain/game rules
- wallet
- settlement
- contract
- database
- compliance/trust copy

Mark stories as EKB-required if they touch:

- wallet flow
- settlement flow
- transaction building
- signature UX
- ErgoScript
- box/value handling
- indexer reconciliation
- sponsored settlement
- confirmation/finality logic

Use relevant EKB tools:

- `get_pattern`
- `get_skill`
- `get_eip`
- `get_ergoscript_ref`

### Before Merge

Required PR evidence:

- scope classification
- EKB queries performed
- implementation decision
- pattern/EIP/ErgoScript references used
- `audit_contract` artifact where applicable
- `audit_verify` artifact where applicable
- affected release gates
- compliance/trust-language impact

### Stop Conditions

Do not merge if:

- EKB evidence is missing
- contract audit findings remain unresolved
- audit verification has not run after fixes
- compliance controls are undefined
- incident controls are undefined for a new settlement capability

## Release Gate Requirements

A phase is not complete until:

### Engineering

- `npm run lint` passes
- `npm run test` passes
- `npm run build` passes
- `npm run check` passes
- replay validation tests pass where applicable
- idempotency tests pass where applicable
- trust-language tests pass where applicable

### Compliance

- no-wager language review completed
- no payout language introduced
- no cash conversion language introduced
- finality not overstated
- mode notices remain explicit

### Operations

- rollback path documented
- incident controls reviewed
- kill switches tested where applicable
- settlement fallback tested where applicable
- runbook updated

### Ergo-Facing Changes

- EKB evidence attached
- contract audit completed where applicable
- audit verification completed after fixes
- release gate impact documented
- stop conditions cleared
