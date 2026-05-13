Improve ON_CHAIN_PLAY UX without changing deterministic fairness.

Preserve:
- explicit user signing
- wallet-aware path
- provisional finality labels
- confirmation threshold controls
- lifecycle state visibility

Intent lifecycle:
PREPARED
SIGNED
SUBMITTED
CONFIRMED
FINALIZED
FAILED
RECOVERY_AVAILABLE
CANCELLED

Enhance:
- pending intent visibility
- user-facing recovery actions
- confidence/finality cues
- interrupted lifecycle recovery
- strict vs optimistic status display
- on-chain controls UI

Do not:
- imply guaranteed outcome
- imply monetary return
- imply finality before threshold confirmations
- automatically sign user actions