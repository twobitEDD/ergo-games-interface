# Contributing

## Workflow

1. Create a short-lived branch from `main`.
2. Keep pull requests focused on a single objective.
3. Run `npm run check` before opening or updating a PR.
4. Update docs for architecture/API/trust-semantic changes.

## Standards

- Preserve deterministic game rule behavior in `packages/domain`.
- Keep settlement and orchestration behavior in `packages/services`.
- Document architecture-impacting changes under `docs`.
- Keep no-wager language explicit in API responses, UI copy, and docs.
- Preserve mode trust semantics (`ON_CHAIN_PLAY`, `FREE_PLAY`, `SPONSORED_PLAY`) without overpromising finality.
- Avoid mixing runtime concerns across workspace boundaries.

## Developer Quality Gates

- Run workspace checks locally (`npm run check`) before requesting review.
- Add or update tests for behavior changes in domain rules or API lifecycles.
- Keep compatibility behavior explicit when changing existing routes.
- For wallet/settlement/contract changes, attach EKB references and audit evidence per `docs/ekb-integration.md`.

## Documentation Expectations

Update relevant docs when changing:
- API shapes or status semantics (`docs/api-catalog.md`)
- Architecture boundaries (`docs/architecture.md`)
- Release expectations (`docs/release-progression.md`)
- Operational behavior (`docs/operations-runbook.md`)

## Pull Request Expectations

- Include a short problem statement and change summary.
- Include test notes and any known follow-up tasks.
- Keep CI green (`lint`, `test`, and `build`).
- Include compliance/trust-language notes for user-facing copy or settlement behavior updates.
