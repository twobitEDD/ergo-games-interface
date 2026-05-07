import { parseJoinGameInput } from "../../../../lib/api/validators";
import {
  badRequest,
  conflict,
  notFound,
  ok,
  parseJsonBody,
} from "../../../../lib/server/http";
import {
  getModeTrustNotice,
  getUserById,
  joinGame,
  projectGameForApi,
} from "../../../../lib/server/memoryStore";

export async function POST(request: Request): Promise<Response> {
  try {
    const payload = parseJoinGameInput(await parseJsonBody(request));
    if (!getUserById(payload.joinerUserId)) return notFound("joiner user not found");

    const joined = joinGame(payload.gameId, payload.joinerUserId);
    if (joined === "NOT_FOUND") return notFound("game not found");
    if (joined === "FULL") return conflict("game already has another joiner");
    if (joined === "INVALID_JOINER") return conflict("host user cannot join as opponent");

    return ok({
      game: projectGameForApi(joined),
      trustLabel: joined.mode === "ON_CHAIN_PLAY" ? "WALLET_PATH" : "NO_FUNDS_PATH",
      trustNotice: getModeTrustNotice(joined.mode),
      message:
        joined.mode === "ON_CHAIN_PLAY"
          ? "Game joined. Participants still confirm wallet settlement steps explicitly."
          : "Game joined in no-funds mode. Outcomes are recorded off-chain with non-cash progression only.",
    });
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "invalid request");
  }
}
