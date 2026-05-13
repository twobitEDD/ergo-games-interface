import { parseCreateGameInput } from "../../../../lib/api/validators";
import { badRequest, created, notFound, parseJsonBody } from "../../../../lib/server/http";
import {
  createGame,
  getModeTrustNotice,
  getUserById,
  projectGameForApi,
} from "../../../../lib/server/memoryStore";

export async function POST(request: Request): Promise<Response> {
  try {
    const payload = parseCreateGameInput(await parseJsonBody(request));
    if (!getUserById(payload.hostUserId)) return notFound("host user not found");

    const game = createGame(payload.hostUserId, payload.mode);
    const trustNotice = getModeTrustNotice(payload.mode);
    return created({
      game: projectGameForApi(game),
      trustLabel: payload.mode === "ON_CHAIN_PLAY" ? "WALLET_PATH" : "NO_FUNDS_PATH",
      trustNotice,
      message:
        payload.mode === "ON_CHAIN_PLAY"
          ? "Game lobby created. Wallet mode keeps explicit user-signing for settlement."
          : "Game lobby created in no-funds mode. Moves are recorded off-chain and progression is non-cash only.",
    });
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "invalid request");
  }
}
