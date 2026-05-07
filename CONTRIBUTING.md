# Contributing

## Workflow

1. Create a short-lived branch from `main`.
2. Keep pull requests focused on a single objective.
3. Run `npm run check` before opening or updating a PR.

## Standards

- Preserve deterministic game rule behavior in `packages/domain`.
- Keep settlement and orchestration behavior in `packages/services`.
- Document architecture-impacting changes under `docs`.

## Pull Request Expectations

- Include a short problem statement and change summary.
- Include test notes and any known follow-up tasks.
- Keep CI green (`lint`, `test`, and `build`).
