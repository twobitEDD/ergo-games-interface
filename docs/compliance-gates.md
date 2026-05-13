# Compliance Gates and Boundaries

This document defines mandatory no-wager boundaries, language constraints, release go/no-go criteria, and incident controls for Ergo Games Interface.

## Core Compliance Position

- Default operating mode is **no-wager** across all releases.
- Gameplay outcomes and rewards must not represent gambling, staking, or speculative return.
- User-facing messaging must prioritize skill/gameplay framing and avoid payout framing.

## No-Wager Product Boundaries

The following boundaries are mandatory unless legal approval explicitly changes project policy:

- No betting mechanics (no wagers placed on outcomes).
- No pooled stake or prize pool funded by participant losses.
- No guaranteed monetary return promises from gameplay.
- No chance-based payout framing that resembles casino-style outcomes.
- No direct conversion claims from in-product progression points to cash value.

## Prohibited Language (Product + Marketing + Support)

Do not use copy that implies wagering or financial yield. Prohibited examples:

- "Bet", "wager", "stake your funds", "jackpot", "odds", "casino-style".
- "Guaranteed payout", "risk-free profit", "earn yield", "double your money".
- "Win real money every game", "cash prize from entry pool".

Use neutral alternatives such as:

- "Play mode", "match result", "reward eligibility", "verification status".
- "On-chain confirmation", "sponsored settlement", "off-chain progression".

## Release Go/No-Go Criteria

A release is **NO-GO** if any required control is missing.

### Universal Gates (All Releases)

- Compliance language review completed for UI copy, docs, and release notes.
- Security/compliance documentation updated for newly introduced behavior.
- Incident response owner assigned and on-call escalation path documented.
- Rollback strategy defined for newly enabled user-facing features.

### Release 1: Ergo-Native Wallet Play

- Wallet-connected flow does not imply guaranteed monetary outcomes.
- Transaction state labels avoid finality misrepresentation.
- Security review confirms no unsafe default signing behavior.

### Release 2: Unfunded Participation

- Off-chain progression path has explicit non-cash framing.
- Rewards system copy avoids payout or investment framing.
- Abuse controls and rate limits are in place for progression endpoints.

### Release 3: Gasless Server-Sponsored Settlement

- Sponsored settlement policy documented (eligibility, limits, refusal conditions).
- Batch and retry controls validated with explicit failure handling.
- Kill switch tested to disable sponsored settlement without disabling core gameplay.
- Incident runbook includes chain event delays, replay anomalies, and confirmation drift.

## Incident Controls

The team must maintain the following controls before production rollout of settlement features:

- **Kill switch:** immediate disablement of sponsored settlement paths.
- **Mode fallback:** automatic downgrade to off-chain-only mode on critical failures.
- **Auditability:** immutable event trail for settlement intent, processing, and verification.
- **Escalation:** severity matrix with response SLAs and ownership.
- **Post-incident review:** mandatory RCA with remediation actions and follow-up verification.

## Release Decision Process

Before each release:

1. Run gate review using this document and `docs/releases.md`.
2. Record pass/fail status for each gate and owner sign-off.
3. If any gate fails, classify release as NO-GO and track remediation tasks.
4. Re-run gate review after remediation before promoting to production.
