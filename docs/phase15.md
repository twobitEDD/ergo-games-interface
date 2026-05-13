Implement game-event batch commitments that can group off-chain actions into deterministic proofs.

Create:
- batchBuilder
- merkleRootService
- commitmentSerializer
- batchCommitmentRepository
- batchSettlementPolicy
- batchReconciliationService

GameBatchCommitment:
{
  batchId: string;
  gameType?: string;
  mode: "FREE_PLAY" | "SPONSORED_PLAY" | "ON_CHAIN_PLAY";
  fromEventId: string;
  toEventId: string;
  eventCount: number;
  merkleRoot: string;
  commitmentHash: string;
  settlementId?: string;
  status:
    | "CREATED"
    | "QUEUED"
    | "COMMITTED"
    | "OBSERVED"
    | "VERIFIED"
    | "FAILED";
  createdAt: string;
}

Add APIs:
- POST /api/game-batches/create
- GET /api/game-batches/[batchId]
- POST /api/game-batches/[batchId]/enqueue-settlement
- GET /api/game-batches/[batchId]/status

Behavior:
- FREE_PLAY batches may remain off-chain only
- SPONSORED_PLAY batches may be eligible for server-sponsored settlement
- ON_CHAIN_PLAY batches must align with user-signed intent boundaries
- commitment hashes must be deterministic
- settlement lifecycle must stay trust-labeled
- finality remains provisional until confirmation depth threshold