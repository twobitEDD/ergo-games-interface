# Template Migration Map (`ergo-basic-template` -> `ergo-games-interface`)

## Scope and Audit Notes

- Template analyzed from local clone: `../ergo-basic-template-src`.
- Target architecture is monorepo-first (`apps/web`, `packages/domain`, `packages/services`, `packages/db`) with release-sequenced delivery.
- This map intentionally favors deterministic game-domain reuse first and defers UI/runtime coupling until Next.js/API boundaries are in place.

## Keep / Refactor / Discard Classification

| Classification | Source area | Destination | Rationale | Risk |
|---|---|---|---|---|
| Keep | `src/lib/games/ticTacToeLogic.ts` | `packages/domain/src/games/ticTacToeLogic.ts` | Pure deterministic rules; no React/browser dependencies | Low |
| Keep | `src/lib/games/superTicTacToeLogic.ts` | `packages/domain/src/games/superTicTacToeLogic.ts` | Pure deterministic rules for super mode; extends same contract model | Low |
| Keep | `src/lib/games/*.test.ts` logic coverage patterns | `packages/domain` tests (future) | Good baseline invariants for move legality/state transitions | Low |
| Refactor | `src/context/WalletContext.tsx` + wallet components | `apps/web` wallet adapters + `packages/services` integration ports | Current implementation is CRA + Dynamic/Nautilus app wiring; needs Next.js boundary + mode-aware contracts | Medium |
| Refactor | `src/lib/passkey.ts`, `src/lib/ergoKeyVault.ts`, `src/lib/vaultStorage.ts` | `packages/services/src/wallet-security/*` and web adapter layer | Valuable passkey/key-vault model, but needs threat-model review and API boundary separation | Medium |
| Refactor | `src/lib/appEnv.ts` | `apps/web/src/lib/config/*` (future) | Useful environment parsing model but currently CRA-specific env names and coupling | Low |
| Refactor | `src/lib/games/pendingTx.ts`, `pendingSuperTx.ts` | `apps/web` optimistic client state + server status APIs | Useful UX pattern; needs release 4.5 status lifecycle alignment and persistence policy | Medium |
| Refactor | `src/lib/games/*Tx.ts`, `*Contract.ts`, `*Discovery.ts` | `packages/services` (settlement/chain adapters) + `apps/web/api` | Valuable chain wiring references; must be split into service abstractions with retries/auditability | High |
| Refactor | `src/lib/ergoTxActivity.ts`, `src/components/wallet/ErgoTxActivityPanel.tsx` | `packages/services` indexer/gateway + web UI | Useful for funded UX acceleration phase; needs provider abstraction and finality policy | Medium |
| Discard | CRA runtime scaffold (`src/index.tsx`, `react-scripts`, `craco.config.js`, service worker setup) | None (replace with monorepo app stack) | Conflicts with planned Next.js/API architecture | Low |
| Discard | Generic NFT gallery/token showcase pages/components (`src/pages/GalleryPage.tsx`, `src/pages/NFTGalleryPage.tsx`, `src/components/gallery/*`, `src/components/tokens/*`) | None for core roadmap | Out of current release scope (game-first settlement roadmap) | Low |
| Discard | Legacy Dynamic derivation helper `src/lib/ergoFromDynamic.ts` | None | File itself states non-production signing caveat; avoid accidental unsafe usage | Medium |
| Discard | Template-specific landing/theme/navigation shell (`src/components/layout/*`, `src/theme.ts`, `src/pages/DeveloperGuidePage.tsx`) | None | Better to build product-specific UX from release requirements | Low |

## Source -> Destination Mapping (Current and Planned)

| Source | Destination | Decision | Status | Notes |
|---|---|---|---|---|
| `src/lib/games/ticTacToeLogic.ts` | `packages/domain/src/games/ticTacToeLogic.ts` | Keep | Imported | Adapted as framework-agnostic domain logic |
| `src/lib/games/superTicTacToeLogic.ts` | `packages/domain/src/games/superTicTacToeLogic.ts` | Keep | Imported | Adapted to depend only on domain module |
| `src/lib/games/ticTacToeGameRecord.ts` | `packages/domain/src/games/gameRecord.ts` (future) | Refactor | Pending | Requires decoupling from template discovery types |
| `src/lib/games/gameWagerLimits.ts` | `packages/domain/src/settlement/wagerLimits.ts` (future) | Refactor | Pending | Keep constants, align with compliance gates |
| `src/context/WalletContext.tsx` | `apps/web/src/lib/wallet/wallet-provider.tsx` (future) | Refactor | Pending | Rebuild around product mode labels and release gating |
| `src/lib/passkey.ts` | `packages/services/src/wallet-security/passkey.ts` (future) | Refactor | Pending | Security review required before enabling production paths |
| `src/lib/ergoSigning.ts` | `packages/services/src/chain/ergoSigning.ts` (future) | Refactor | Pending | Move to backend/service boundary for controlled signing flow |
| `src/lib/games/pendingTx.ts` | `apps/web/src/lib/tx/pendingClientState.ts` (future) | Refactor | Pending | Align with optimistic status machine and idempotency |
| `src/lib/ergoFromDynamic.ts` | N/A | Discard | Not importing | Keep as historical reference only in template clone |
| CRA entry/build files | N/A | Discard | Not importing | Replaced by monorepo app strategy |

## Recommended Import Order

1. **Domain rules first (completed)**: import deterministic rule logic that is runtime-agnostic.
2. **Domain serialization contracts**: port game-record schemas after removing template discovery coupling.
3. **Config parsing adapters**: migrate env parsing to `apps/web` with monorepo naming conventions.
4. **Wallet abstraction layer**: port wallet provider shape behind mode-aware interfaces.
5. **Chain transaction services**: split tx build/sign/submit/discovery into service modules with retries and observability.
6. **Optimistic tx UX**: bring pending transaction trackers only after lifecycle statuses are defined.
7. **UI components last**: rebuild product UX using migrated domain/service contracts, not direct template composition.

## Risk Register

- **Architecture drift risk (high):** direct UI/component imports from template could pull CRA assumptions into monorepo.  
  **Control:** only import framework-agnostic domain modules at this stage.
- **Signing/security risk (high):** legacy and wallet-signing files require security review before production usage.  
  **Control:** quarantine in planned refactor phase and gate by release checklist.
- **State-model mismatch (medium):** template pending-tx trackers do not yet match planned release 4.5 lifecycle states.  
  **Control:** defer import until intent/status model is finalized.
- **Scope creep risk (medium):** template has broad NFT/gallery features outside release sequence.  
  **Control:** classify as discard for current roadmap.

## Initial Low-Risk Imports Applied

- Added `packages/domain/src/games/ticTacToeLogic.ts` from template logic with no runtime coupling.
- Added `packages/domain/src/games/superTicTacToeLogic.ts` from template logic with no runtime coupling.
- Updated `packages/domain/src/index.ts` to export both migrated rule modules.

