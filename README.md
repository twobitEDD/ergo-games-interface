# Ergo Games Interface

Ergo Games Interface is a monorepo for building game experiences with a shared principle:
**same gameplay, different settlement**.

## Monorepo Layout

- `apps/web`: web app and API boundary
- `packages/domain`: canonical game rules and shared types
- `packages/db`: database schema, migrations, and data access
- `packages/services`: orchestration and settlement services
- `docs`: architecture and delivery documentation

## Getting Started

1. Copy environment template:
   - `cp .env.example .env`
2. Install dependencies:
   - `npm install`
3. Run baseline checks:
   - `npm run check`

## Scripts

- `npm run build`: run build scripts in all workspaces
- `npm run lint`: run lint scripts in all workspaces
- `npm run test`: run test scripts in all workspaces
- `npm run check`: lint + test + build

## Branching

- `main` is the stable branch.
- Use short-lived feature branches for phase work.

## Contribution

See `CONTRIBUTING.md` for workflow and expectations.
