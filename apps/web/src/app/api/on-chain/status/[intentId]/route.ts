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
    intentId: intent.id,
    status: intent.status,
    finality: intent.finality,
    controls: intent.controls,
    trustNotice:
      "Status reflects a no-wager lifecycle signal. Finality is trust-labeled and not treated as final before the configured threshold.",
  });
}
