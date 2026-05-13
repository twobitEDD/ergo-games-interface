import { parseTxIntentControlsUpdateInput } from "../../../../lib/api/validators";
import { badRequest, ok, parseJsonBody } from "../../../../lib/server/http";
import { getOnChainIntentControls, updateOnChainIntentControls } from "../../../../lib/server/memoryStore";

export async function GET(): Promise<Response> {
  return ok({
    controls: getOnChainIntentControls(),
    trustNotice:
      "Control toggles adjust confirmation strictness and optimistic UX behavior for no-wager lifecycle messaging.",
  });
}

export async function POST(request: Request): Promise<Response> {
  try {
    const payload = parseTxIntentControlsUpdateInput(await parseJsonBody(request));
    return ok({
      controls: updateOnChainIntentControls(payload),
      trustNotice:
        "Incident fallback and mode toggles are operational safeguards. They do not alter gameplay fairness rules.",
    });
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "invalid request");
  }
}
