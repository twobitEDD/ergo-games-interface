import { parseJoinGameInput } from "../../../../lib/api/validators";
import {
  badRequest,
  conflict,
  notFound,
  ok,
  parseJsonBody,
} from "../../../../lib/server/http";
import { getUserById, joinGame } from "../../../../lib/server/memoryStore";

export async function POST(request: Request): Promise<Response> {
  try {
    const payload = parseJoinGameInput(await parseJsonBody(request));
    if (!getUserById(payload.joinerUserId)) return notFound("joiner user not found");

    const joined = joinGame(payload.gameId, payload.joinerUserId);
    if (joined === "NOT_FOUND") return notFound("game not found");
    if (joined === "FULL") return conflict("game already has another joiner");

    return ok({
      game: joined,
      message: "Game joined. Participants still confirm wallet settlement steps explicitly.",
    });
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "invalid request");
  }
}
