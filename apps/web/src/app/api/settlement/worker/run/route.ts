import { parseSettlementWorkerRunInput } from "../../../../../../lib/api/validators";
import { badRequest, ok, parseJsonBody } from "../../../../../../lib/server/http";
import { runSettlementWorker } from "../../../../../../lib/server/settlement/settlementQueue";

export async function POST(request: Request): Promise<Response> {
  try {
    const payload = parseSettlementWorkerRunInput(await parseJsonBody(request));
    const result = runSettlementWorker({
      retryDelayMs: payload.retryDelayMs,
    });
    return ok({
      workerResult: result,
      trustNotice:
        "Worker run commits only deterministic proof placeholders and does not execute wagering or automated value transfer.",
    });
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "invalid request");
  }
}
