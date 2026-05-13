import { badRequest, notFound, ok } from "../../../../lib/server/http";
import {
  getGame,
  getGameEvents,
  getModeTrustNotice,
  getProgressForUser,
  projectGameForApi,
  getRewardsForUser,
} from "../../../../lib/server/memoryStore";

export async function GET(
  request: Request,
  context: { params: Promise<{ gameId: string }> }
): Promise<Response> {
  const { gameId } = await context.params;
  const game = getGame(gameId);
  if (!game) return notFound("game not found");

  const userId = new URL(request.url).searchParams.get("userId");
  if (userId && userId !== game.hostUserId && userId !== game.joinerUserId) {
    return badRequest("userId is not a participant in this game");
  }

  const rewards = userId ? getRewardsForUser(userId).filter((reward) => reward.gameId === game.id) : [];
  const progression = userId ? getProgressForUser(userId) : undefined;

  return ok({
    game: projectGameForApi(game),
    ledger: getGameEvents(game.id),
    rewards,
    progression,
    trustLabel: game.mode === "ON_CHAIN_PLAY" ? "WALLET_PATH" : "NO_FUNDS_PATH",
    trustNotice: getModeTrustNotice(game.mode),
    modeLanguage:
      game.mode === "ON_CHAIN_PLAY"
        ? "Wallet play mode. Settlement remains explicit and user signed."
        : "No-funds play mode. Off-chain result ledger and non-cash progression only.",
  });
}
