# Local Development Workflow

## Environment Setup

```bash
cp .env.example .env
npm install
```

Key environment defaults in `.env.example`:
- `NODE_ENV=development`
- `ERGO_NETWORK=testnet`
- `SPONSORED_SETTLEMENT_ENABLED=false`

## Daily Developer Loop

1. Sync latest `main` and create a short-lived branch.
2. Implement in the correct workspace boundary (`domain`, `services`, `db`, `apps/web`).
3. Run targeted tests while iterating.
4. Run repository validation before PR:
   - `npm run lint`
   - `npm run test`
   - `npm run build`
   - or `npm run check`
5. Update docs if API, trust semantics, or release gates changed.

## Current Runnable Commands (Verified)

- `npm run check`
  - Passes with current repository state.
- `npm run test`
  - Runs active suites in `apps/web` and `packages/domain`.
- `npm run dev --workspace @ergo-games/web`
  - Currently prints a scaffold notice and exits (no long-running local app server yet).

## Smoke Workflow (Available Today)

Use existing API-level tests as executable smoke checks:

```bash
npm run test --workspace @ergo-games/web
```

What this validates:
- On-chain intent create/list/update/status flow.
- Controls toggles for strict confirmation and incident fallback.
- Settlement queue -> committed -> verified transitions.
- Validator and in-memory data-path behavior.

## When You Touch Sensitive Areas

- Wallet, settlement, or contract-related changes require EKB evidence and audits:
  - See `docs/ekb-integration.md`.
- Language or trust notice changes require compliance review:
  - See `docs/compliance-gates.md`.

## Definition of Done for Local Validation

- Repo checks pass (`npm run check`).
- Relevant workspace tests pass.
- Smoke scenario(s) for touched flows pass.
- Docs updated for operationally meaningful changes.
