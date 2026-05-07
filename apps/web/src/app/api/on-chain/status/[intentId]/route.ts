import { notFound, ok } from "../../../../../../lib/server/http";
import { getOnChainIntent } from "../../../../../../lib/server/memoryStore";

export async function GET(
  _request: Request,
  context: { params: { intentId: string } }
): Promise<Response> {
  const intent = getOnChainIntent(context.params.intentId);
  if (!intent) return notFound("intent not found");

  return ok({
    intentId: intent.id,
    status: intent.status,
    trustNotice: intent.trustNotice,
  });
}
