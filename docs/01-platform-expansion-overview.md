# Ergo Games Interface Expansion Overview

## Purpose

The Ergo Games Interface Phase 6+ expansion turns the current project into a reusable deterministic online game platform.

The goal is not to implement a single game directly into the application logic. The goal is to create shared platform infrastructure so future deterministic games can plug into the same gameplay, replay, ranking, progression, wallet, and settlement systems without bloating the core rule engine.

## Core Principle

> Same deterministic game rules, different settlement rails.

The platform should support multiple skill-based games while keeping game rules isolated from settlement, wallet, ranking, UI, compliance, and operational systems.

## Supported Modes

### ON_CHAIN_PLAY

Wallet-aware path.

Requirements:

- User-signed wallet-aware actions only.
- Finality remains provisional until configured confirmation depth.
- Lifecycle states must be trust-labeled.
- No guaranteed payout or monetary return language.

### FREE_PLAY

No-funds mode.

Requirements:

- No wallet required.
- Off-chain authoritative event log.
- Non-cash progression only.
- Rewards, if present, are framed as progression or eligibility.

### SPONSORED_PLAY

No-funds user path with controlled server-sponsored settlement scaffolding.

Requirements:

- User does not directly fund settlement.
- Eligibility and limits must be enforced.
- Sponsored settlement can be disabled without disabling core gameplay.
- Failures downgrade safely to off-chain-only behavior.

## Package Boundaries

### `packages/domain`

Owns canonical deterministic game rules.

Allowed:

- game rules
- move validation
- state transitions
- deterministic serialization
- state hashing
- result detection

Forbidden:

- wallet logic
- settlement logic
- database calls
- API calls
- ranking
- rewards
- rematches
- achievements
- UI state
- timestamps in pure transition functions

### `packages/services`

Owns orchestration and platform behavior.

Includes:

- gameplay sessions
- replay services
- ranking
- achievements
- rematches
- match series
- wallet binding
- settlement orchestration
- batch commitments
- sponsored settlement policy
- abuse checks

### `packages/db`

Owns persistence seams and repository interfaces.

Includes:

- users
- wallets
- game sessions
- game events
- replays
- rankings
- achievements
- rewards
- settlements
- batch commitments

### `apps/web`

Owns API routes and UI.

Includes:

- auth endpoints
- gameplay endpoints
- mode notices
- trust copy
- game shell UI
- replay viewer
- ranking views
- wallet binding UI
- settlement visibility

## Compliance Position

The platform remains no-wager by default.

Do not use language implying:

- betting
- wagering
- staking
- jackpots
- odds
- guaranteed payouts
- yield
- profit
- cash prizes
- cash-out behavior

Use language such as:

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

## Platform Goal

The platform should make it possible for a future game to use:

- free onboarding
- wallet-aware progression
- rematches
- replay validation
- rankings
- prestige
- off-chain batch commitments
- sponsored settlement
- operational fallback
- compliance-safe copy

without embedding those systems into the game’s deterministic rule module.
