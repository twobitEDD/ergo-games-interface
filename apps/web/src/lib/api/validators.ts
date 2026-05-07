import {
  ApiTxIntentStatus,
  AuthSyncInput,
  CreateGameInput,
  JoinGameInput,
  MoveInput,
  OnChainPrepareInput,
  SettlementEnqueueInput,
  SettlementIndexerObservationInput,
  SettlementWorkerRunInput,
  TxIntentControlsUpdateInput,
  TxIntentCreateInput,
  TxIntentUpdateInput,
  WalletBindInput,
} from "./types";

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const asTrimmed = (value: unknown, name: string): string => {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${name} is required`);
  }
  return value.trim();
};

export const parseAuthSyncInput = (value: unknown): AuthSyncInput => {
  if (!isObject(value)) throw new Error("body must be an object");
  return {
    externalAuthId: asTrimmed(value.externalAuthId, "externalAuthId"),
    displayName: asTrimmed(value.displayName, "displayName"),
  };
};

export const parseWalletBindInput = (value: unknown): WalletBindInput => {
  if (!isObject(value)) throw new Error("body must be an object");
  const network = asTrimmed(value.network, "network");
  if (network !== "ERGO_MAINNET" && network !== "ERGO_TESTNET") {
    throw new Error("network must be ERGO_MAINNET or ERGO_TESTNET");
  }
  return {
    userId: asTrimmed(value.userId, "userId"),
    network,
    address: asTrimmed(value.address, "address"),
  };
};

export const parseCreateGameInput = (value: unknown): CreateGameInput => {
  if (!isObject(value)) throw new Error("body must be an object");
  const mode = asTrimmed(value.mode, "mode");
  if (mode !== "ON_CHAIN_PLAY" && mode !== "FREE_PLAY" && mode !== "SPONSORED_PLAY") {
    throw new Error("mode must be ON_CHAIN_PLAY, FREE_PLAY, or SPONSORED_PLAY");
  }

  return {
    hostUserId: asTrimmed(value.hostUserId, "hostUserId"),
    mode,
  };
};

export const parseJoinGameInput = (value: unknown): JoinGameInput => {
  if (!isObject(value)) throw new Error("body must be an object");
  return {
    gameId: asTrimmed(value.gameId, "gameId"),
    joinerUserId: asTrimmed(value.joinerUserId, "joinerUserId"),
  };
};

export const parseMoveInput = (value: unknown): MoveInput => {
  if (!isObject(value)) throw new Error("body must be an object");
  const cell = value.cell;
  if (typeof cell !== "number" || !Number.isInteger(cell)) {
    throw new Error("cell must be an integer");
  }
  const requestIdRaw = value.requestId;
  let requestId: string | undefined;
  if (requestIdRaw !== undefined) {
    requestId = asTrimmed(requestIdRaw, "requestId");
  }
  return {
    gameId: asTrimmed(value.gameId, "gameId"),
    actorUserId: asTrimmed(value.actorUserId, "actorUserId"),
    cell,
    requestId,
  };
};

export const parseOnChainPrepareInput = (value: unknown): OnChainPrepareInput => {
  if (!isObject(value)) throw new Error("body must be an object");
  const idempotencyKeyRaw = value.idempotencyKey;
  const settlementIdRaw = value.settlementId;
  return {
    gameId: asTrimmed(value.gameId, "gameId"),
    initiatorUserId: asTrimmed(value.initiatorUserId, "initiatorUserId"),
    idempotencyKey:
      typeof idempotencyKeyRaw === "string" && idempotencyKeyRaw.trim().length > 0
        ? idempotencyKeyRaw.trim()
        : undefined,
    settlementId:
      typeof settlementIdRaw === "string" && settlementIdRaw.trim().length > 0
        ? settlementIdRaw.trim()
        : undefined,
  };
};

const parseIntentStatus = (value: unknown): ApiTxIntentStatus => {
  const status = asTrimmed(value, "status");
  const allowed: ApiTxIntentStatus[] = [
    "PREPARED",
    "SIGNED",
    "SUBMITTED",
    "MEMPOOL_SEEN",
    "CONFIRMED",
    "FINALIZED",
    "FAILED",
    "REPLACED",
  ];
  if (!allowed.includes(status as ApiTxIntentStatus)) {
    throw new Error("status must be a valid tx intent lifecycle status");
  }
  return status as ApiTxIntentStatus;
};

export const parseTxIntentCreateInput = (value: unknown): TxIntentCreateInput => {
  if (!isObject(value)) throw new Error("body must be an object");
  const settlementIdRaw = value.settlementId;
  return {
    gameId: asTrimmed(value.gameId, "gameId"),
    initiatorUserId: asTrimmed(value.initiatorUserId, "initiatorUserId"),
    idempotencyKey: asTrimmed(value.idempotencyKey, "idempotencyKey"),
    settlementId:
      typeof settlementIdRaw === "string" && settlementIdRaw.trim().length > 0
        ? settlementIdRaw.trim()
        : undefined,
  };
};

export const parseTxIntentUpdateInput = (value: unknown): TxIntentUpdateInput => {
  if (!isObject(value)) throw new Error("body must be an object");
  const txIdRaw = value.txId;
  const noteRaw = value.note;
  const replacementIntentIdRaw = value.replacementIntentId;
  const failureReasonRaw = value.failureReason;
  const confirmationsRaw = value.confirmations;
  let confirmations: number | undefined;
  if (confirmationsRaw !== undefined) {
    if (typeof confirmationsRaw !== "number" || !Number.isInteger(confirmationsRaw) || confirmationsRaw < 0) {
      throw new Error("confirmations must be a non-negative integer");
    }
    confirmations = confirmationsRaw;
  }
  return {
    status: parseIntentStatus(value.status),
    txId: typeof txIdRaw === "string" && txIdRaw.trim().length > 0 ? txIdRaw.trim() : undefined,
    confirmations,
    note: typeof noteRaw === "string" && noteRaw.trim().length > 0 ? noteRaw.trim() : undefined,
    replacementIntentId:
      typeof replacementIntentIdRaw === "string" && replacementIntentIdRaw.trim().length > 0
        ? replacementIntentIdRaw.trim()
        : undefined,
    failureReason:
      typeof failureReasonRaw === "string" && failureReasonRaw.trim().length > 0
        ? failureReasonRaw.trim()
        : undefined,
  };
};

export const parseTxIntentControlsUpdateInput = (value: unknown): TxIntentControlsUpdateInput => {
  if (!isObject(value)) throw new Error("body must be an object");
  const output: TxIntentControlsUpdateInput = {};
  if (value.strictConfirmationMode !== undefined) {
    if (typeof value.strictConfirmationMode !== "boolean") {
      throw new Error("strictConfirmationMode must be a boolean");
    }
    output.strictConfirmationMode = value.strictConfirmationMode;
  }
  if (value.optimisticMode !== undefined) {
    if (typeof value.optimisticMode !== "boolean") {
      throw new Error("optimisticMode must be a boolean");
    }
    output.optimisticMode = value.optimisticMode;
  }
  if (value.incidentFallbackToOffChain !== undefined) {
    if (typeof value.incidentFallbackToOffChain !== "boolean") {
      throw new Error("incidentFallbackToOffChain must be a boolean");
    }
    output.incidentFallbackToOffChain = value.incidentFallbackToOffChain;
  }
  if (value.confirmationDepth !== undefined) {
    if (
      typeof value.confirmationDepth !== "number" ||
      !Number.isInteger(value.confirmationDepth) ||
      value.confirmationDepth < 1
    ) {
      throw new Error("confirmationDepth must be a positive integer");
    }
    output.confirmationDepth = value.confirmationDepth;
  }
  return output;
};

export const parseSettlementEnqueueInput = (value: unknown): SettlementEnqueueInput => {
  if (!isObject(value)) throw new Error("body must be an object");
  return {
    settlementId: asTrimmed(value.settlementId, "settlementId"),
  };
};

export const parseSettlementWorkerRunInput = (value: unknown): SettlementWorkerRunInput => {
  if (!isObject(value)) throw new Error("body must be an object");
  const retryDelayMsRaw = value.retryDelayMs;
  if (retryDelayMsRaw === undefined) return {};
  if (typeof retryDelayMsRaw !== "number" || !Number.isInteger(retryDelayMsRaw) || retryDelayMsRaw < 0) {
    throw new Error("retryDelayMs must be a non-negative integer");
  }
  return {
    retryDelayMs: retryDelayMsRaw,
  };
};

export const parseSettlementIndexerObservationInput = (
  value: unknown
): SettlementIndexerObservationInput => {
  if (!isObject(value)) throw new Error("body must be an object");
  const confirmations = value.confirmations;
  if (typeof confirmations !== "number" || !Number.isInteger(confirmations) || confirmations < 0) {
    throw new Error("confirmations must be a non-negative integer");
  }
  return {
    commitmentHash: asTrimmed(value.commitmentHash, "commitmentHash"),
    txId: asTrimmed(value.txId, "txId"),
    confirmations,
  };
};
