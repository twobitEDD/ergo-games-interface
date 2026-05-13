import { badRequest, notFound, ok } from "../../../lib/server/http";
import { getUserById } from "../../../lib/server/memoryStore";

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");
  if (!userId) return badRequest("userId query param is required");

  const user = getUserById(userId);
  if (!user) return notFound("user not found");

  return ok({
    user,
    modeNotice:
      "No-wager default: gameplay outcomes may be recorded off-chain or wallet-settled depending on selected mode.",
  });
}
