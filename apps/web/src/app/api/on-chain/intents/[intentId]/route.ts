import { notFound, ok } from "../../../../../lib/server/http";
import { getOnChainIntent } from "../../../../../lib/server/memoryStore";

export async function GET(
  _request: Request,
  context: { params: Promise<{ intentId: string }> }
): Promise<Response> {
  const { intentId } = await context.params;
  const intent = getOnChainIntent(intentId);
  if (!intent) return notFound("intent not found");

  return ok({
    intent,
    trustNotice:
      "Intent status reports are lifecycle signals only. They do not represent wagering outcomes or guaranteed monetary return.",
  });
}
