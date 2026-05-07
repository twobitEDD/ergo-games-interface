import { evaluateFinality, getInitialIntentControls } from "./finalityPolicy";
import type {
  CreateTxIntentInput,
  TxIntentControlState,
  TxIntentLifecycleStatus,
  TxIntentRecord,
  TxIntentView,
  UpdateTxIntentInput,
} from "./types";

const intentsById = new Map<string, TxIntentRecord>();
const intentIdsByIdempotencyKey = new Map<string, string>();
const intentIdsByGameId = new Map<string, string[]>();
const intentIdsBySettlementId = new Map<string, string[]>();

let intentSequence = 0;
let controls: TxIntentControlState = getInitialIntentControls();

const nowIso = (): string => new Date().toISOString();
const generateIntentId = (): string => `intent_${(++intentSequence).toString().padStart(6, "0")}`;

const statusTransitionMap: Record<TxIntentLifecycleStatus, TxIntentLifecycleStatus[]> = {
  PREPARED: ["SIGNED", "FAILED", "REPLACED"],
  SIGNED: ["SUBMITTED", "FAILED", "REPLACED"],
  SUBMITTED: ["MEMPOOL_SEEN", "CONFIRMED", "FAILED", "REPLACED"],
  MEMPOOL_SEEN: ["CONFIRMED", "FAILED", "REPLACED"],
  CONFIRMED: ["FINALIZED", "FAILED", "REPLACED"],
  FINALIZED: [],
  FAILED: [],
  REPLACED: [],
};

const terminalStatuses: TxIntentLifecycleStatus[] = ["FINALIZED", "FAILED", "REPLACED"];

const indexIntent = (intent: TxIntentRecord): void => {
  const byGame = intentIdsByGameId.get(intent.gameId) ?? [];
  byGame.push(intent.id);
  intentIdsByGameId.set(intent.gameId, byGame);
  if (intent.settlementId) {
    const bySettlement = intentIdsBySettlementId.get(intent.settlementId) ?? [];
    bySettlement.push(intent.id);
    intentIdsBySettlementId.set(intent.settlementId, bySettlement);
  }
};

const addAuditEntry = (intent: TxIntentRecord, note: string): void => {
  intent.auditTrail.push({
    at: nowIso(),
    status: intent.status,
    note,
  });
};

const getTimestampKey = (status: TxIntentLifecycleStatus): keyof TxIntentRecord["timestamps"] => {
  switch (status) {
    case "PREPARED":
      return "preparedAt";
    case "SIGNED":
      return "signedAt";
    case "SUBMITTED":
      return "submittedAt";
    case "MEMPOOL_SEEN":
      return "mempoolSeenAt";
    case "CONFIRMED":
      return "confirmedAt";
    case "FINALIZED":
      return "finalizedAt";
    case "FAILED":
      return "failedAt";
    case "REPLACED":
      return "replacedAt";
    default:
      return "preparedAt";
  }
};

const copyIntent = (intent: TxIntentRecord): TxIntentRecord => ({
  ...intent,
  timestamps: { ...intent.timestamps },
  auditTrail: [...intent.auditTrail],
});

const asIntentView = (intent: TxIntentRecord): TxIntentView => ({
  ...copyIntent(intent),
  finality: evaluateFinality(intent, controls),
  controls: { ...controls },
});

const maybeAutoFinalize = (intent: TxIntentRecord): void => {
  const finality = evaluateFinality(intent, controls);
  if (intent.status !== "CONFIRMED") return;
  if (!finality.reorgRisk && finality.observedConfirmations >= controls.confirmationDepth) {
    intent.status = "FINALIZED";
    const at = nowIso();
    intent.updatedAt = at;
    intent.timestamps.finalizedAt = intent.timestamps.finalizedAt ?? at;
    addAuditEntry(intent, "finalized at configured confirmation depth");
  }
};

export const createIntent = (input: CreateTxIntentInput): TxIntentView => {
  const existingId = intentIdsByIdempotencyKey.get(input.idempotencyKey);
  if (existingId) {
    const existing = intentsById.get(existingId);
    if (existing) return asIntentView(existing);
  }

  const createdAt = nowIso();
  const intent: TxIntentRecord = {
    id: generateIntentId(),
    idempotencyKey: input.idempotencyKey,
    gameId: input.gameId,
    settlementId: input.settlementId,
    initiatorUserId: input.initiatorUserId,
    status: "PREPARED",
    observedConfirmations: 0,
    maxObservedConfirmations: 0,
    timestamps: {
      preparedAt: createdAt,
    },
    auditTrail: [],
    createdAt,
    updatedAt: createdAt,
  };
  addAuditEntry(intent, "intent prepared");

  intentsById.set(intent.id, intent);
  intentIdsByIdempotencyKey.set(input.idempotencyKey, intent.id);
  indexIntent(intent);
  return asIntentView(intent);
};

export const updateIntent = (
  input: UpdateTxIntentInput
): TxIntentView | "NOT_FOUND" | "INVALID_TRANSITION" | "TERMINAL_STATUS" | "INCIDENT_FALLBACK_ACTIVE" => {
  const intent = intentsById.get(input.intentId);
  if (!intent) return "NOT_FOUND";
  if (controls.incidentFallbackToOffChain) return "INCIDENT_FALLBACK_ACTIVE";
  if (terminalStatuses.includes(intent.status)) return "TERMINAL_STATUS";

  const allowed = statusTransitionMap[intent.status];
  if (!allowed.includes(input.status)) return "INVALID_TRANSITION";

  intent.status = input.status;
  const at = nowIso();
  intent.updatedAt = at;
  const key = getTimestampKey(input.status);
  intent.timestamps[key] = intent.timestamps[key] ?? at;
  if (input.txId) intent.txId = input.txId;
  if (typeof input.confirmations === "number") {
    intent.observedConfirmations = Math.max(0, Math.floor(input.confirmations));
    intent.maxObservedConfirmations = Math.max(intent.maxObservedConfirmations, intent.observedConfirmations);
  }
  if (input.failureReason) intent.failureReason = input.failureReason;
  if (input.replacementIntentId) intent.replacedByIntentId = input.replacementIntentId;

  addAuditEntry(intent, input.note ?? `status updated to ${input.status}`);
  maybeAutoFinalize(intent);
  return asIntentView(intent);
};

export const getIntent = (intentId: string): TxIntentView | undefined => {
  const intent = intentsById.get(intentId);
  return intent ? asIntentView(intent) : undefined;
};

export const listIntents = (input?: {
  gameId?: string;
  settlementId?: string;
  status?: TxIntentLifecycleStatus;
  onlyPending?: boolean;
}): TxIntentView[] => {
  let ids: string[] | undefined;
  if (input?.gameId) ids = intentIdsByGameId.get(input.gameId) ?? [];
  if (input?.settlementId) {
    const settlementIds = intentIdsBySettlementId.get(input.settlementId) ?? [];
    ids = ids ? ids.filter((id) => settlementIds.includes(id)) : settlementIds;
  }

  const records = (ids ? ids.map((id) => intentsById.get(id)) : [...intentsById.values()])
    .filter((record): record is TxIntentRecord => Boolean(record))
    .filter((record) => (input?.status ? record.status === input.status : true))
    .filter((record) => (input?.onlyPending ? !terminalStatuses.includes(record.status) : true))
    .map((record) => asIntentView(record));

  return records.sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
};

export const recoverPendingIntents = (): TxIntentView[] => {
  // TODO: replace in-memory recovery with a durable store before production rollout.
  return listIntents({ onlyPending: true });
};

export const getIntentControls = (): TxIntentControlState => ({ ...controls });

export const updateIntentControls = (input: Partial<TxIntentControlState>): TxIntentControlState => {
  controls = {
    ...controls,
    ...input,
    confirmationDepth:
      typeof input.confirmationDepth === "number"
        ? Math.max(1, Math.floor(input.confirmationDepth))
        : controls.confirmationDepth,
  };
  return { ...controls };
};

export const resetIntentServiceForTests = (): void => {
  intentsById.clear();
  intentIdsByIdempotencyKey.clear();
  intentIdsByGameId.clear();
  intentIdsBySettlementId.clear();
  intentSequence = 0;
  controls = getInitialIntentControls();
};
