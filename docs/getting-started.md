# Getting Started From Zero

This guide is for engineers joining the project with no prior local setup.

## 1) Prerequisites

- macOS/Linux shell environment
- Node.js 20+ (Node.js 22 recommended)
- npm 10+
- Git

## 2) Clone and Bootstrap

```bash
git clone <repo-url>
cd ergo-games-interface
cp .env.example .env
npm install
```

## 3) Verify Baseline Health

Run the standard repository check:

```bash
npm run check
```

What this runs today:
- Workspace `lint` scripts (currently placeholders in some packages)
- Workspace tests (active test coverage in `apps/web` and `packages/domain`)
- Workspace `build` scripts (currently placeholders in some packages)

## 4) Confirm Runtime Surface

Try the web workspace dev command:

```bash
npm run dev --workspace @ergo-games/web
```

Current expected result: the command prints `TODO: initialize Next.js app`.  
This confirms the workspace wiring exists, but a full interactive Next.js runtime has not been enabled yet.

## 5) Read Next

- Architecture and package boundaries: `docs/architecture.md`
- Local development workflows and smoke checks: `docs/local-development.md`
- API catalog and trust semantics: `docs/api-catalog.md`
- Release progression and adoption gates: `docs/release-progression.md`
- EKB delivery workflow: `docs/ekb-integration.md`
- Operations basics and troubleshooting: `docs/operations-runbook.md`
