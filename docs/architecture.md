# Baseline Architecture

## Principle

The product keeps core gameplay consistent while allowing multiple settlement paths:
same rules, different funding and settlement rails.

## Boundaries

- `apps/web`: product UI and API edge.
- `packages/domain`: deterministic game logic and shared contracts.
- `packages/db`: persistence models and data-access primitives.
- `packages/services`: settlement orchestration and background workflows.

## Upcoming Milestones

- Release 1: Ergo-native wallet path.
- Release 2: Unfunded participation path.
- Release 3: Gasless server-sponsored settlement path.
