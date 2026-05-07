# Release Progression: R1 -> R3 -> Funded UX

This document explains delivery progression and what each release adds while preserving no-wager controls.

## R1: Wallet-Aware Gameplay Baseline

Primary goals:
- Deterministic gameplay with wallet mode wiring (`ON_CHAIN_PLAY`).
- Intent lifecycle scaffold (`PREPARED` -> `SIGNED` -> `SUBMITTED` -> `CONFIRMED` -> `FINALIZED`).
- Trust-labeled finality and confirmation depth controls.

Exit criteria:
- Intent lifecycle API coverage passes.
- Finality labels are explicit and non-misleading.
- No copy implies wagers or guaranteed monetary returns.

## R2: Unfunded Participation Path

Primary goals:
- Expand no-funds gameplay (`FREE_PLAY` and `SPONSORED_PLAY`) with deterministic parity.
- Maintain append-only event ledger behavior.
- Provide non-cash progression/reward lifecycle visibility.

Exit criteria:
- Mode trust semantics and no-funds language are consistent in UI/API.
- Reward caps and anti-abuse constraints remain enforced.
- Compliance language review completed.

## R3: Sponsored Settlement Scaffold

Primary goals:
- Queue/worker/indexer reconciliation for sponsored-eligible settlements.
- Explicit retry/failure behavior and lifecycle transparency.
- Operational toggles for safe fallback behavior.

Exit criteria:
- Queue to verification transitions are test-covered.
- Incident fallback behavior documented and exercised in smoke checks.
- Operational runbook and rollback notes are current.

## Funded UX Acceleration Layer (Post-R3)

Primary goals:
- Better pending intent visibility and confidence cues.
- User-facing recovery actions for interrupted lifecycle paths.
- Richer operational controls without changing deterministic fairness.

Guardrails:
- Do not represent provisional states as final.
- Keep no-wager framing throughout UX and support documentation.
- Preserve user-controlled signing boundaries.

## Gate Dependencies

Before promotion:
- Review `docs/compliance-gates.md` for no-wager and go/no-go controls.
- Review `docs/ekb-integration.md` for required EKB evidence and audits.
- Review `docs/operations-runbook.md` for incident readiness and fallback procedures.
