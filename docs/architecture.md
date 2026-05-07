# Workspace Architecture

## Core Principle

The product keeps deterministic gameplay constant while varying settlement rail behavior by mode:
**same rules, different settlement rails**.

## Package and Workspace Layout

- `apps/web`
  - API boundary (`src/app/api/*`) for auth, gameplay, wallet, rewards, on-chain intent lifecycle, and settlement scaffolding.
  - UI scaffolding and mode-language components (`ModeBadge`, wallet notice, intent placeholder).
  - In-memory service adapters for deterministic local behavior.
- `packages/domain`
  - Canonical game rule engine and reusable game logic.
  - Must remain deterministic and runtime-agnostic.
- `packages/services`
  - Service seams for wallet and settlement orchestration.
  - Home for orchestration that should not leak into UI components.
- `packages/db`
  - Schema and persistence seams.
  - Future source of durable storage for records currently kept in memory.
- `docs`
  - Delivery process, compliance controls, release progression, and runbooks.

## Architecture Boundaries (Adoption Rules)

- Keep game rule truth in `packages/domain`; do not fork logic into API route handlers.
- Keep wallet/settlement orchestration in service layers; route handlers should stay thin.
- Keep compliance and trust semantics explicit in API responses and UI copy.
- Keep no-wager language defaults across all modes, including release notes and operational messaging.

## Mode Model and Trust Semantics

- `ON_CHAIN_PLAY`
  - Wallet-aware path.
  - Explicit user-signed actions only.
  - Finality must remain trust-labeled until confirmation depth threshold.
- `FREE_PLAY`
  - No-funds mode.
  - Off-chain authoritative event log and non-cash progression only.
- `SPONSORED_PLAY`
  - No-funds mode for users.
  - Starts from off-chain progression with optional server-sponsored settlement scaffolding when eligible.

## Current Runtime Shape

- Stateful behavior is currently in-memory (`memoryStore`, settlement queue, intent service).
- API behavior and lifecycle transitions are test-covered using Node test runners.
- Web dev runtime command is scaffolded and not yet a long-lived app server.

## Architecture Progression Milestones

- R1: Wallet-aware gameplay and intent lifecycle controls.
- R2: Unfunded participation flow with progression controls.
- R3: Sponsored settlement queue + indexer reconciliation scaffolding.
- Funded UX acceleration: richer intent confidence/finality visibility and operational fallback controls.
