import { parseMoveInput } from "../../../../lib/api/validators";
import {
  badRequest,
  conflict,
  notFound,
  ok,
  parseJsonBody,
} from "../../../../lib/server/http";
import {
  applyMoveToGame,
  getModeTrustNotice,
  projectGameForApi,
} from "../../../../lib/server/memoryStore";

export async function POST(request: Request): Promise<Response> {
  try {
    const payload = parseMoveInput(await parseJsonBody(request));
    const moved = applyMoveToGame(payload.gameId, payload.actorUserId, payload.cell, payload.requestId);
    if (moved === "NOT_FOUND") return notFound("game not found");
    if (moved === "INVALID_ACTOR") return conflict("actor is not a game participant");
    if (moved === "INVALID_MOVE") return conflict("move is not valid for current board");

    return ok({
      game: projectGameForApi(moved),
      trustLabel: moved.mode === "ON_CHAIN_PLAY" ? "WALLET_PATH" : "NO_FUNDS_PATH",
      trustNotice: getModeTrustNotice(moved.mode),
      message:
        moved.mode === "ON_CHAIN_PLAY"
          ? "Deterministic rule-engine move applied."
          : "Deterministic rule-engine move applied and recorded in off-chain authoritative event log.",
    });
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "invalid request");
  }
}
