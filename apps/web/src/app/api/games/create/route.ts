import { parseCreateGameInput } from "../../../../lib/api/validators";
import { badRequest, created, notFound, parseJsonBody } from "../../../../lib/server/http";
import { createGame, getUserById } from "../../../../lib/server/memoryStore";

export async function POST(request: Request): Promise<Response> {
  try {
    const payload = parseCreateGameInput(await parseJsonBody(request));
    if (!getUserById(payload.hostUserId)) return notFound("host user not found");

    const game = createGame(payload.hostUserId, payload.mode);
    return created({
      game,
      message: "Game lobby created. This release ships safe scaffolding for wallet-oriented play.",
    });
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "invalid request");
  }
}
