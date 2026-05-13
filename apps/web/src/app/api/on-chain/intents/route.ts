import { parseTxIntentCreateInput } from "../../../../lib/api/validators";
import { badRequest, conflict, created, notFound, ok, parseJsonBody } from "../../../../lib/server/http";
import {
  createOnChainIntent,
  getGame,
  listOnChainIntents,
  recoverOnChainPendingIntents,
} from "../../../../lib/server/memoryStore";
import { getSettlement } from "../../../../lib/server/settlement/settlementQueue";

export async function POST(request: Request): Promise<Response> {
  try {
    const payload = parseTxIntentCreateInput(await parseJsonBody(request));
    const game = getGame(payload.gameId);
    if (!game) return notFound("game not found");
    if (game.mode !== "ON_CHAIN_PLAY") {
      return conflict("intent lifecycle API is only available for ON_CHAIN_PLAY mode");
    }
    if (payload.settlementId) {
      const settlement = getSettlement(payload.settlementId);
      if (!settlement) return notFound("settlement not found");
      if (settlement.gameId !== payload.gameId) {
        return conflict("settlement does not belong to the specified game");
      }
    }
    const intent = createOnChainIntent(payload);
    return created({
      intent,
      trustNotice:
        "Intent creation tracks a no-wager transaction lifecycle only. It does not promise value transfer finality before threshold confirmations.",
    });
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "invalid request");
  }
}

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const allowedStatuses = new Set([
    "PREPARED",
    "SIGNED",
    "SUBMITTED",
    "MEMPOOL_SEEN",
    "CONFIRMED",
    "FINALIZED",
    "FAILED",
    "REPLACED",
  ]);
  if (status && !allowedStatuses.has(status)) {
    return badRequest("status must be a valid tx intent lifecycle status");
  }
  const gameId = url.searchParams.get("gameId") ?? undefined;
  const settlementId = url.searchParams.get("settlementId") ?? undefined;
  const pendingOnly = (url.searchParams.get("pendingOnly") ?? "").toLowerCase() === "true";
  const includeRecovery = (url.searchParams.get("includeRecovery") ?? "").toLowerCase() === "true";

  const intents = listOnChainIntents({
    gameId,
    settlementId,
    status: (status ?? undefined) as
      | "PREPARED"
      | "SIGNED"
      | "SUBMITTED"
      | "MEMPOOL_SEEN"
      | "CONFIRMED"
      | "FINALIZED"
      | "FAILED"
      | "REPLACED"
      | undefined,
    onlyPending: pendingOnly,
  });

  return ok({
    intents,
    recovery: includeRecovery ? recoverOnChainPendingIntents() : [],
    trustNotice:
      "Listed intents expose provisional vs finalized chain signals. Final status remains provisional until configured depth is reached.",
  });
}
