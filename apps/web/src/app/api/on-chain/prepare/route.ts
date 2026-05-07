import { parseOnChainPrepareInput } from "../../../../lib/api/validators";
import { badRequest, notFound, ok, parseJsonBody } from "../../../../lib/server/http";
import { createOnChainIntent, getGame } from "../../../../lib/server/memoryStore";

export async function POST(request: Request): Promise<Response> {
  try {
    const payload = parseOnChainPrepareInput(await parseJsonBody(request));
    const game = getGame(payload.gameId);
    if (!game) return notFound("game not found");

    const intent = createOnChainIntent(payload.gameId);
    return ok({
      gameId: game.id,
      intent,
      trustNotice:
        "Prepare endpoint is a release-1 scaffold. It does not submit or automate on-chain value transfer.",
    });
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "invalid request");
  }
}
