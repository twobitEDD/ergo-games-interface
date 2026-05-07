import { parseTxIntentUpdateInput } from "../../../../../../lib/api/validators";
import { badRequest, conflict, notFound, ok, parseJsonBody } from "../../../../../../lib/server/http";
import { updateOnChainIntent } from "../../../../../../lib/server/memoryStore";

export async function POST(
  request: Request,
  context: { params: { intentId: string } }
): Promise<Response> {
  try {
    const payload = parseTxIntentUpdateInput(await parseJsonBody(request));
    const updated = updateOnChainIntent({
      intentId: context.params.intentId,
      ...payload,
    });
    if (updated === "NOT_FOUND") return notFound("intent not found");
    if (updated === "INVALID_TRANSITION") return conflict("invalid intent lifecycle transition");
    if (updated === "TERMINAL_STATUS") return conflict("intent already reached terminal status");
    if (updated === "INCIDENT_FALLBACK_ACTIVE") {
      return conflict("incident fallback is active; intent updates are blocked for safety");
    }
    return ok({
      intent: updated,
      trustNotice:
        "Lifecycle updates are tracked for operational clarity. Finality remains trust-labeled until threshold confirmations are met.",
    });
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "invalid request");
  }
}
