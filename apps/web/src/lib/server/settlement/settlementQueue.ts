import { decideSettlementRail } from "./decisionService";
import { buildBatchCommitment } from "./batchCommitment";
import type {
  RegisterSettlementInput,
  SettlementRecord,
  WorkerRunResult,
} from "./types";

const recordsById = new Map<string, SettlementRecord>();
const settlementIdsByUser = new Map<string, string[]>();
const commitmentsByHash = new Map<string, { txId: string; confirmations: number }>();
const simulatedFailuresRemainingBySettlementId = new Map<string, number>();

let batchSequence = 0;
let settlementSequence = 0;

const nowIso = (): string => new Date().toISOString();
const generateSettlementId = (): string => `stl_${(++settlementSequence).toString().padStart(6, "0")}`;
const generateBatchId = (): string => `batch_${(++batchSequence).toString().padStart(6, "0")}`;

const pushHistory = (record: SettlementRecord, event: string, detail?: string): void => {
  record.history.push({
    at: nowIso(),
    event,
    detail,
  });
};

const trackUserSettlement = (userId: string, settlementId: string): void => {
  const existing = settlementIdsByUser.get(userId) ?? [];
  existing.push(settlementId);
  settlementIdsByUser.set(userId, existing);
};

export const registerSettlement = (input: RegisterSettlementInput): SettlementRecord => {
  const decision = decideSettlementRail(input.decisionInput);
  const createdAt = nowIso();
  const settlementId = generateSettlementId();
  const maxAttempts = Math.max(1, input.maxAttempts ?? 3);
  const shouldQueue = decision.rail === "SERVER_SPONSORED_ON_CHAIN";
  const record: SettlementRecord = {
    settlementId,
    rewardId: input.rewardId,
    userId: input.userId,
    gameId: input.gameId,
    units: input.units,
    unitKind: input.unitKind,
    decision,
    lifecycleStatus: shouldQueue ? "PROOF_PENDING" : "REWARD_GRANTED",
    queueStatus: shouldQueue ? "ENQUEUED" : "NOT_QUEUED",
    attempts: 0,
    maxAttempts,
    createdAt,
    updatedAt: createdAt,
    history: [],
  };
  pushHistory(record, "REGISTERED", `rail=${decision.rail}`);
  if (shouldQueue) {
    pushHistory(record, "ENQUEUED", "eligible for server-sponsored settlement");
  }

  recordsById.set(settlementId, record);
  trackUserSettlement(input.userId, settlementId);
  simulatedFailuresRemainingBySettlementId.set(
    settlementId,
    Math.max(0, input.simulatedFailuresBeforeSuccess ?? 0)
  );
  return record;
};

export const getSettlement = (settlementId: string): SettlementRecord | undefined => {
  const record = recordsById.get(settlementId);
  return record ? { ...record, history: [...record.history] } : undefined;
};

export const getSettlementsForUser = (userId: string): SettlementRecord[] => {
  const settlementIds = settlementIdsByUser.get(userId) ?? [];
  return settlementIds
    .map((settlementId) => recordsById.get(settlementId))
    .filter((record): record is SettlementRecord => Boolean(record))
    .map((record) => ({ ...record, history: [...record.history] }));
};

export const enqueueSettlement = (
  settlementId: string
): SettlementRecord | "NOT_FOUND" | "NOT_SPONSORED_ELIGIBLE" | "TERMINAL_STATUS" => {
  const record = recordsById.get(settlementId);
  if (!record) return "NOT_FOUND";
  if (record.decision.rail !== "SERVER_SPONSORED_ON_CHAIN") return "NOT_SPONSORED_ELIGIBLE";
  if (record.queueStatus === "FAILED" || record.queueStatus === "VERIFIED") return "TERMINAL_STATUS";

  record.queueStatus = "ENQUEUED";
  record.lifecycleStatus = "PROOF_PENDING";
  record.lastError = undefined;
  record.nextAttemptAt = undefined;
  record.updatedAt = nowIso();
  pushHistory(record, "ENQUEUED", "requested via enqueue endpoint");
  return { ...record, history: [...record.history] };
};

export const runSettlementWorker = (
  input?: { retryDelayMs?: number; windowStartedAt?: string; windowClosedAt?: string }
): WorkerRunResult => {
  const retryDelayMs = Math.max(1000, input?.retryDelayMs ?? 5000);
  const now = Date.now();
  const candidates = [...recordsById.values()].filter((record) => {
    if (record.decision.rail !== "SERVER_SPONSORED_ON_CHAIN") return false;
    if (record.queueStatus === "ENQUEUED" || record.queueStatus === "PROCESSING") return true;
    if (record.queueStatus !== "RETRY_SCHEDULED") return false;
    if (!record.nextAttemptAt) return true;
    return Date.parse(record.nextAttemptAt) <= now;
  });

  if (candidates.length === 0) {
    return {
      processedSettlementIds: [],
      retryScheduledSettlementIds: [],
      failedSettlementIds: [],
    };
  }

  const batchId = generateBatchId();
  const windowStartedAt = input?.windowStartedAt ?? new Date(now).toISOString();
  const windowClosedAt = input?.windowClosedAt ?? new Date(now + 1).toISOString();
  const commitment = buildBatchCommitment(candidates, { batchId, windowStartedAt, windowClosedAt });
  const processedSettlementIds: string[] = [];
  const retryScheduledSettlementIds: string[] = [];
  const failedSettlementIds: string[] = [];

  for (const record of candidates) {
    record.queueStatus = "PROCESSING";
    record.updatedAt = nowIso();
    pushHistory(record, "PROCESSING", `batch=${batchId}`);

    const failuresRemaining = simulatedFailuresRemainingBySettlementId.get(record.settlementId) ?? 0;
    if (failuresRemaining > 0) {
      simulatedFailuresRemainingBySettlementId.set(record.settlementId, failuresRemaining - 1);
      record.attempts += 1;
      record.lastError = "simulated commitment failure";
      if (record.attempts >= record.maxAttempts) {
        record.queueStatus = "FAILED";
        record.lifecycleStatus = "FAILED";
        record.updatedAt = nowIso();
        pushHistory(record, "FAILED", record.lastError);
        failedSettlementIds.push(record.settlementId);
      } else {
        record.queueStatus = "RETRY_SCHEDULED";
        record.nextAttemptAt = new Date(Date.now() + retryDelayMs).toISOString();
        record.updatedAt = nowIso();
        pushHistory(record, "RETRY_SCHEDULED", `nextAttemptAt=${record.nextAttemptAt}`);
        retryScheduledSettlementIds.push(record.settlementId);
      }
      continue;
    }

    record.attempts += 1;
    record.queueStatus = "COMMITTED";
    record.lifecycleStatus = "PROOF_PENDING";
    record.batchId = batchId;
    record.merkleRoot = commitment.merkleRoot;
    record.commitmentHash = commitment.commitmentHash;
    record.updatedAt = nowIso();
    pushHistory(record, "COMMITTED", `commitmentHash=${commitment.commitmentHash}`);
    processedSettlementIds.push(record.settlementId);
  }

  return {
    batchId,
    processedSettlementIds,
    retryScheduledSettlementIds,
    failedSettlementIds,
  };
};

export const recordIndexerObservation = (input: {
  commitmentHash: string;
  txId: string;
  confirmations: number;
}): void => {
  commitmentsByHash.set(input.commitmentHash, {
    txId: input.txId,
    confirmations: input.confirmations,
  });
};

export const reconcileIndexerObservations = (minConfirmations = 1): string[] => {
  const verifiedSettlementIds: string[] = [];
  for (const record of recordsById.values()) {
    if (!record.commitmentHash || record.queueStatus !== "COMMITTED") continue;
    const observed = commitmentsByHash.get(record.commitmentHash);
    if (!observed || observed.confirmations < minConfirmations) continue;
    record.queueStatus = "VERIFIED";
    record.lifecycleStatus = "VERIFIED_ON_ERGO";
    record.txId = observed.txId;
    record.updatedAt = nowIso();
    pushHistory(record, "VERIFIED", `txId=${observed.txId}`);
    verifiedSettlementIds.push(record.settlementId);
  }
  return verifiedSettlementIds;
};

export const resetSettlementQueueForTests = (): void => {
  recordsById.clear();
  settlementIdsByUser.clear();
  commitmentsByHash.clear();
  simulatedFailuresRemainingBySettlementId.clear();
  batchSequence = 0;
  settlementSequence = 0;
};
