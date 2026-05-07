import { notFound, ok } from "../../../../../../lib/server/http";
import { getSettlement } from "../../../../../../lib/server/settlement/settlementQueue";

export async function GET(
  _request: Request,
  context: { params: { settlementId: string } }
): Promise<Response> {
  const settlement = getSettlement(context.params.settlementId);
  if (!settlement) return notFound("settlement not found");

  return ok({
    settlementId: settlement.settlementId,
    rewardId: settlement.rewardId,
    lifecycleStatus: settlement.lifecycleStatus,
    queueStatus: settlement.queueStatus,
    decisionRail: settlement.decision.rail,
    decisionReasons: settlement.decision.reasons,
    attempts: settlement.attempts,
    maxAttempts: settlement.maxAttempts,
    lastError: settlement.lastError ?? null,
    batchId: settlement.batchId ?? null,
    commitmentHash: settlement.commitmentHash ?? null,
    txId: settlement.txId ?? null,
    lifecycleGuide: ["reward granted", "proof pending", "verified on Ergo"],
    trustNotice:
      "Status signals reflect no-wager progression verification. They are not payout guarantees or wagering outcomes.",
  });
}
