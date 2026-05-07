import { ok } from "../../../../lib/server/http";
import {
  getProgressForUser,
  getRewardsForUser,
  getSettlementLifecycleForUser,
} from "../../../../lib/server/memoryStore";

export async function GET(
  _request: Request,
  context: { params: { userId: string } }
): Promise<Response> {
  return ok({
    userId: context.params.userId,
    progression: getProgressForUser(context.params.userId),
    rewards: getRewardsForUser(context.params.userId),
    settlementLifecycle: getSettlementLifecycleForUser(context.params.userId).map((settlement) => ({
      settlementId: settlement.settlementId,
      rewardId: settlement.rewardId,
      lifecycleStatus: settlement.lifecycleStatus,
      queueStatus: settlement.queueStatus,
      decisionRail: settlement.decision.rail,
      decisionReasons: settlement.decision.reasons,
      txId: settlement.txId ?? null,
      commitmentHash: settlement.commitmentHash ?? null,
      updatedAt: settlement.updatedAt,
    })),
    lifecycleGuide: [
      "reward granted",
      "proof pending",
      "verified on Ergo",
    ],
    trustNotice:
      "Rewards are non-cash progression signals with anti-abuse caps. They are not wagers, payouts, or guaranteed monetary returns.",
  });
}
