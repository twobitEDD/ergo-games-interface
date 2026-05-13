Expand sponsored settlement with clear eligibility, refusal, queue, retry, kill switch, and fallback behavior.

Create:
- sponsoredSettlementPolicy
- sponsoredEligibilityService
- sponsoredLimitService
- sponsoredRefusalReason enum
- sponsoredSettlementAuditLog

Eligibility should consider:
- mode must be SPONSORED_PLAY
- game result must be validated
- replay must validate
- batch commitment must be deterministic
- user/account must pass abuse checks
- sponsored settlement must be globally enabled
- gameType must be eligible
- daily/user/system limits must not be exceeded

Refusal reasons:
- NOT_SPONSORED_MODE
- GAME_NOT_COMPLETE
- REPLAY_INVALID
- BATCH_INVALID
- USER_LIMIT_EXCEEDED
- SYSTEM_LIMIT_EXCEEDED
- ABUSE_FLAGGED
- SPONSORED_SETTLEMENT_DISABLED
- POLICY_NOT_ELIGIBLE

Add controls:
- SPONSORED_SETTLEMENT_ENABLED
- FORCE_FREE_PLAY_ONLY
- DISABLE_BATCH_COMMITMENTS
- DISABLE_REWARD_GRANTS
- DISABLE_RANKED_PLAY

Acceptance:
- sponsored settlement can be disabled without disabling core gameplay
- ineligible sponsored settlement returns explicit refusal reason
- retry behavior is controlled and auditable
- queue status is visible
- failure handling is explicit