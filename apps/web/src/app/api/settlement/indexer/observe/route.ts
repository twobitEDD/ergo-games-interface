import { parseSettlementIndexerObservationInput } from "../../../../../../lib/api/validators";
import { badRequest, ok, parseJsonBody } from "../../../../../../lib/server/http";
import {
  reconcileIndexerObservations,
  recordIndexerObservation,
} from "../../../../../../lib/server/settlement/settlementQueue";

export async function POST(request: Request): Promise<Response> {
  try {
    const payload = parseSettlementIndexerObservationInput(await parseJsonBody(request));
    recordIndexerObservation(payload);
    const verifiedSettlementIds = reconcileIndexerObservations(1);

    return ok({
      recorded: {
        commitmentHash: payload.commitmentHash,
        txId: payload.txId,
        confirmations: payload.confirmations,
      },
      verifiedSettlementIds,
      trustNotice:
        "Indexer observation endpoint is a reconciliation scaffold; no wagering behavior or payout automation is enabled.",
    });
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "invalid request");
  }
}
