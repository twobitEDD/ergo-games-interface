import { parseAuthSyncInput } from "../../../../lib/api/validators";
import { badRequest, ok, parseJsonBody } from "../../../../lib/server/http";
import { upsertUserFromAuth } from "../../../../lib/server/memoryStore";

export async function POST(request: Request): Promise<Response> {
  try {
    const payload = parseAuthSyncInput(await parseJsonBody(request));
    const user = upsertUserFromAuth(payload.externalAuthId, payload.displayName);
    return ok({
      user,
      trustNotice:
        "Account sync only. Wallet actions and settlement actions remain explicit and user-confirmed.",
    });
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "invalid request");
  }
}
