import { ok } from "../../../../lib/server/http";
import { getProgressForUser, getRewardsForUser } from "../../../../lib/server/memoryStore";

export async function GET(
  _request: Request,
  context: { params: { userId: string } }
): Promise<Response> {
  return ok({
    userId: context.params.userId,
    progression: getProgressForUser(context.params.userId),
    rewards: getRewardsForUser(context.params.userId),
    trustNotice:
      "Rewards are non-cash progression signals with anti-abuse caps. They are not wagers, payouts, or guaranteed monetary returns.",
  });
}
