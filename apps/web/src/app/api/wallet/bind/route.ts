import { parseWalletBindInput } from "../../../../lib/api/validators";
import { badRequest, notFound, ok, parseJsonBody } from "../../../../lib/server/http";
import { bindWallet } from "../../../../lib/server/memoryStore";

export async function POST(request: Request): Promise<Response> {
  try {
    const payload = parseWalletBindInput(await parseJsonBody(request));
    const user = bindWallet(payload.userId, {
      network: payload.network,
      address: payload.address,
    });
    if (!user) return notFound("user not found");
    return ok({
      user,
      walletStatus: "bound",
      trustNotice: "Wallet binding does not authorize automatic value transfers.",
    });
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "invalid request");
  }
}
