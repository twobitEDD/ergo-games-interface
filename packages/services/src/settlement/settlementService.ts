export type SettlementMode = "OFF_CHAIN_ONLY" | "USER_SIGNED_ON_CHAIN" | "SERVER_SPONSORED_ON_CHAIN";
export type SettlementStatus = "NOT_STARTED" | "PREPARED" | "WAITING_SIGNATURE" | "SUBMITTED" | "CONFIRMED";

export interface SettlementContext {
  gameId: string;
  mode: SettlementMode;
  initiatorUserId: string;
}

export interface SettlementIntent {
  intentId: string;
  gameId: string;
  mode: SettlementMode;
  status: SettlementStatus;
  trustNotice: string;
}

const statuses = new Map<string, SettlementIntent>();

const generateIntentId = (): string => `set_${Math.random().toString(36).slice(2, 10)}`;

export class SettlementService {
  prepareIntent(context: SettlementContext): SettlementIntent {
    const intent: SettlementIntent = {
      intentId: generateIntentId(),
      gameId: context.gameId,
      mode: context.mode,
      status: "PREPARED",
      trustNotice:
        "Settlement service is scaffolded for release 1 and does not execute risky value automation.",
    };
    statuses.set(intent.intentId, intent);
    return intent;
  }

  getIntentStatus(intentId: string): SettlementIntent | undefined {
    return statuses.get(intentId);
  }
}
