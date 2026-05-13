import { parseSettlementEnqueueInput } from "../../../../lib/api/validators";
import {
  badRequest,
  conflict,
  notFound,
  ok,
  parseJsonBody,
} from "../../../../lib/server/http";
import { enqueueSettlement, getSettlement } from "../../../../lib/server/settlement/settlementQueue";

export async function POST(request: Request): Promise<Response> {
  try {
    const payload = parseSettlementEnqueueInput(await parseJsonBody(request));
    const enqueueResult = enqueueSettlement(payload.settlementId);
    if (enqueueResult === "NOT_FOUND") return notFound("settlement not found");
    if (enqueueResult === "NOT_SPONSORED_ELIGIBLE") {
      return conflict("settlement rail is not server-sponsored eligible");
    }
    if (enqueueResult === "TERMINAL_STATUS") {
      return conflict("settlement is in terminal status");
    }

    const settlement = getSettlement(payload.settlementId);
    return ok({
      settlementId: payload.settlementId,
      queueStatus: settlement?.queueStatus ?? enqueueResult.queueStatus,
      lifecycleStatus: settlement?.lifecycleStatus ?? enqueueResult.lifecycleStatus,
      trustNotice:
        "Server-sponsored settlement queue is a controlled scaffold and does not introduce wagers or guaranteed monetary returns.",
    });
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "invalid request");
  }
}
