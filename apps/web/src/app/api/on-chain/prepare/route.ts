import { parseOnChainPrepareInput } from "../../../../lib/api/validators";
import { badRequest, conflict, notFound, ok, parseJsonBody } from "../../../../lib/server/http";
import { createOnChainIntent, getGame } from "../../../../lib/server/memoryStore";

export async function POST(request: Request): Promise<Response> {
  try {
    const payload = parseOnChainPrepareInput(await parseJsonBody(request));
    const game = getGame(payload.gameId);
    if (!game) return notFound("game not found");
    if (game.mode !== "ON_CHAIN_PLAY") {
      return conflict("on-chain intent is only available for ON_CHAIN_PLAY mode");
    }

    const intent = createOnChainIntent({
      gameId: payload.gameId,
      initiatorUserId: payload.initiatorUserId,
      idempotencyKey:
        payload.idempotencyKey ?? `${payload.gameId}:${payload.initiatorUserId}:prepared-intent`,
      settlementId: payload.settlementId,
    });
    return ok({
      gameId: game.id,
      intent,
      trustNotice:
        "Prepare endpoint creates an idempotent intent lifecycle scaffold. Finality remains provisional until configured confirmation depth is met.",
    });
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "invalid request");
  }
}
