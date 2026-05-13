# Ergo Games Interface

Ergo Games Interface is a monorepo for deterministic game experiences with **same gameplay, different settlement rails** while preserving no-wager product language and controls.

## Start Here

- New to the repo: `docs/getting-started.md`
- Architecture and package boundaries: `docs/architecture.md`
- Local workflows, checks, and smoke paths: `docs/local-development.md`
- API endpoint catalog and mode trust semantics: `docs/api-catalog.md`
- Release progression from R1 -> R3 -> funded UX acceleration: `docs/release-progression.md`
- EKB integration in day-to-day delivery: `docs/ekb-integration.md`
- Contribution expectations and standards: `CONTRIBUTING.md`
- Runbook and incident basics: `docs/operations-runbook.md`
- Compliance gates and language boundaries: `docs/compliance-gates.md`

## Documentation Site (GitHub Pages)

This repository includes a MkDocs configuration so the `docs/` folder is published as a GitHub Pages site.

- Local preview:
  - `python3 -m pip install -r requirements-docs.txt`
  - `mkdocs serve`
  - Open `http://127.0.0.1:8000`
- Local build validation:
  - `mkdocs build --strict`
- Publishing:
  - Workflow: `.github/workflows/docs.yml`
  - Deploys on pushes to `main` when docs-related files change
  - Also supports manual publish via **Actions > Docs > Run workflow**

## Monorepo Layout

- `apps/web`: API routes, mode UX, and app entry surface
- `packages/domain`: publishable deterministic game package (`@twobitedd/ergo-games-interface`)
- `packages/db`: persistence schema and data-access stubs
- `packages/services`: settlement and wallet service seams
- `docs`: adoption, delivery, compliance, and operations documentation

## Publishable Package

The npm package identity for the interface domain surface is:

- `@twobitedd/ergo-games-interface`

Package source lives in `packages/domain`.

Release sanity checks:

```bash
npm --prefix packages/domain run prepublishOnly
npm --prefix packages/domain pack --dry-run
```

## Quick Validation Commands

```bash
cp .env.example .env
npm install
npm run check
npm run dev --workspace @ergo-games/web
```

Current workspace behavior:
- `npm run check` executes and passes lint/test/build placeholders and test suites.
- `npm run dev --workspace @ergo-games/web` currently prints a scaffold notice (`TODO: initialize Next.js app`) rather than starting a long-running server.

## Repository Scripts

- `npm run build`: run build scripts in all workspaces
- `npm run lint`: run lint scripts in all workspaces
- `npm run test`: run test scripts in all workspaces
- `npm run check`: `lint` + `test` + `build`

## Branching and Contributions

- `main` is the stable branch.
- Use short-lived feature branches with focused pull requests.
- Include EKB evidence and compliance notes when changes affect wallet, settlement, or contract behavior.
