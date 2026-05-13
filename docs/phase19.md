Implement abuse detection and operational controls for public-facing gameplay.

Abuse checks:
- duplicate account farming
- self-play ranking abuse
- rematch farming
- suspicious win trading
- ranking manipulation
- reward endpoint abuse
- sponsored settlement spam
- replay mismatch frequency
- batch commitment anomalies
- settlement retry anomalies

Operational controls:
- DISABLE_SPONSORED_SETTLEMENT
- DISABLE_ON_CHAIN_INTENTS
- DISABLE_RANKED_PLAY
- DISABLE_REWARD_GRANTS
- FORCE_FREE_PLAY_ONLY
- DISABLE_BATCH_COMMITMENTS
- DISABLE_REMATCH_RANKING
- DISABLE_TOURNAMENTS

Operational dashboards should track:
- active games
- completed games
- invalid move attempts
- replay validation failures
- settlement queue depth
- settlement retries
- indexer observations
- provisional vs finalized intent counts
- sponsored settlement refusal counts
- abuse flags
- ranking correction events

Incident behavior:
- pause lifecycle progression when trust/finality is uncertain
- fallback to off-chain-only when settlement path fails
- quarantine replay mismatches
- pause reward grants during abuse review
- preserve audit log