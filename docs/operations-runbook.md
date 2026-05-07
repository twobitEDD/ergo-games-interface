# Operational Runbook Basics

This runbook covers baseline operations for local validation, issue triage, and incident-safe behavior.

## Service Surface (Current)

- API and app scaffold live in `apps/web`.
- Runtime state for gameplay, intents, and settlements is currently in-memory.
- Settlement worker and indexer observation endpoints are scaffolds for lifecycle behavior.

## Pre-Release Operational Checklist

- `npm run check` passes.
- API trust semantics remain explicit (no finality overstatement).
- No-wager language review completed for touched UI/API copy.
- Incident fallback controls reviewed (`/api/on-chain/controls`).
- Rollback path documented for new behavior.

## Smoke Runbook (Local)

1. Run test suites:
   - `npm run test`
2. Exercise endpoint smoke suites:
   - `npm run test --workspace @ergo-games/web`
3. Confirm known runtime behavior:
   - `npm run dev --workspace @ergo-games/web`
   - Expected today: scaffold message, no long-running app server.

## Basic Incident Response

- Detect:
  - Unexpected lifecycle transitions.
  - Rising settlement retries/failures.
  - Confirmation drift or reorg-risk trust labels.
- Contain:
  - Toggle incident fallback behavior through on-chain controls endpoint.
  - Pause lifecycle progression where trust/finality is uncertain.
- Recover:
  - Reconcile via status endpoints and indexer observations.
  - Re-run worker safely with controlled retry delay.
- Review:
  - Record timeline, impacted flows, and remediation steps.

## Troubleshooting

### `npm install` fails

- Verify Node/npm versions.
- Delete lockfile artifacts only with team approval.
- Retry install after checking network/proxy settings.

### `npm run check` fails

- Run `npm run lint`, `npm run test`, and `npm run build` separately to isolate failing workspace.
- For test failures, run failing workspace tests directly.

### Web `dev` command does not start a server

- This is currently expected behavior (`TODO: initialize Next.js app`).
- Use endpoint-level tests as primary local smoke validation until runtime server setup is added.

### Settlement does not verify

- Check whether settlement rail is sponsored-eligible.
- Confirm worker was run and commitment hash exists.
- Confirm indexer observation includes matching commitment hash and sufficient confirmations.

### Intent status appears provisional for too long

- Verify confirmation depth controls.
- Check for reorg risk conditions and max observed confirmation drift.
- Use strict vs optimistic control settings deliberately during incident handling.
