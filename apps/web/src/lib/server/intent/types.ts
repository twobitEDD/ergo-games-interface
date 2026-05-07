export type TxIntentLifecycleStatus =
  | "PREPARED"
  | "SIGNED"
  | "SUBMITTED"
  | "MEMPOOL_SEEN"
  | "CONFIRMED"
  | "FINALIZED"
  | "FAILED"
  | "REPLACED";

export type TxIntentTrustLabel =
  | "PROVISIONAL_CHAIN_SIGNAL"
  | "REORG_RISK"
  | "CONFIRMED_FINALITY_THRESHOLD";

export interface TxIntentAuditEntry {
  at: string;
  status: TxIntentLifecycleStatus;
  note: string;
}

export interface TxIntentStatusTimestamps {
  preparedAt: string;
  signedAt?: string;
  submittedAt?: string;
  mempoolSeenAt?: string;
  confirmedAt?: string;
  finalizedAt?: string;
  failedAt?: string;
  replacedAt?: string;
}

export interface TxIntentControlState {
  strictConfirmationMode: boolean;
  optimisticMode: boolean;
  incidentFallbackToOffChain: boolean;
  confirmationDepth: number;
}

export interface TxIntentFinalityView {
  requiredDepth: number;
  observedConfirmations: number;
  confidencePercent: number;
  provisional: boolean;
  reorgRisk: boolean;
  trustLabel: TxIntentTrustLabel;
}

export interface TxIntentRecord {
  id: string;
  idempotencyKey: string;
  gameId: string;
  settlementId?: string;
  initiatorUserId: string;
  status: TxIntentLifecycleStatus;
  txId?: string;
  replacedByIntentId?: string;
  failureReason?: string;
  observedConfirmations: number;
  maxObservedConfirmations: number;
  timestamps: TxIntentStatusTimestamps;
  auditTrail: TxIntentAuditEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface TxIntentView extends TxIntentRecord {
  finality: TxIntentFinalityView;
  controls: TxIntentControlState;
}

export interface CreateTxIntentInput {
  idempotencyKey: string;
  gameId: string;
  initiatorUserId: string;
  settlementId?: string;
}

export interface UpdateTxIntentInput {
  intentId: string;
  status: TxIntentLifecycleStatus;
  txId?: string;
  confirmations?: number;
  note?: string;
  replacementIntentId?: string;
  failureReason?: string;
}
