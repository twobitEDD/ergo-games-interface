# EKB Integration Workflow

This document defines how engineers must use the Ergo Knowledge Base (EKB) workflow during design, implementation, review, and release.

## Why This Exists

EKB usage is a required control for Ergo-facing architecture and contract correctness. It reduces drift, aligns implementations with known patterns, and enforces a repeatable audit trail before production enablement.

## Required EKB Touchpoints

- `get_pattern`: use during architecture/design decisions (headless dApp shape, transaction-building flow, signature UX).
- `get_ergoscript_ref`: use when writing or modifying ErgoScript and box/value handling logic.
- `get_eip`: use when implementation depends on standards-level behavior or data formats.
- `get_skill`: use when selecting implementation paths for Fleet SDK, Nautilus wallet integration, Babel fees, and AppKit.
- `audit_contract`: first-pass contract review before merge for settlement-related changes.
- `audit_verify`: second-pass verification that confirms audit fixes were applied.

## Developer Workflow (Mandatory)

1. Scope the change and identify whether it impacts wallet flow, settlement flow, or ErgoScript behavior.
2. Query EKB (`get_pattern` / `get_skill`) before coding architecture-affecting logic.
3. Implement with references captured in the pull request description (pattern/ref/EIP links or IDs).
4. Run local checks (`npm run lint`, plus any package-level tests relevant to changed modules).
5. For any contract or settlement-path change, run `audit_contract`.
6. Address findings and run `audit_verify`.
7. Do not merge until required checks and release gates in this doc are satisfied.

## Required Pull Request Evidence

Every settlement- or wallet-related PR must include:

- EKB queries used (tool + topic) and the resulting implementation decision.
- Any ErgoScript/EIP references used for correctness decisions.
- Audit artifact for both passes where applicable (`audit_contract`, `audit_verify`).
- Explicit statement of affected release gate(s): Release 1, Release 2, and/or Release 3.

## Merge Checks (Required)

- Scope classification recorded (`UI/API only`, `wallet`, `settlement`, `contract`).
- EKB references attached for design-affecting decisions.
- Lint and relevant tests pass.
- Two-pass contract audit completed for contract/settlement changes.
- Security/compliance docs updated when boundary behavior changed.

## Release Gate Checklist

Use this checklist before enabling each release phase in production.

### Release 1: Ergo-Native Wallet Play

- Wallet-connect and signature UX backed by EKB `get_skill`/`get_pattern`.
- Transaction-intent handling reviewed against EKB patterns.
- No production contract path enabled without two-pass audit artifacts.
- Product copy clearly distinguishes intent, submitted, and finalized states.

### Release 2: Unfunded Participation

- Rule parity validated between wallet and unfunded paths.
- Rewards/progression copy reviewed for no-wager compliance.
- No language implies guaranteed payout, betting, or monetary return.
- Compliance gates in `docs/compliance-gates.md` reviewed and acknowledged.

### Release 3: Gasless Server-Sponsored Settlement

- Sponsored settlement design validated with EKB pattern/skill references.
- Batch/queue/retry behavior reviewed for replay, idempotency, and failure safety.
- Any production ErgoScript path has current two-pass audit evidence.
- Operational rollback and kill switch procedures are documented before launch.

## Stop Conditions

Pause merge or release if any of the following is true:

- EKB evidence is missing for an Ergo-facing architecture decision.
- `audit_contract` findings remain unresolved for production-path code.
- `audit_verify` has not been run after fixes.
- Compliance or incident controls are undefined for a new settlement capability.
