import type { ApiGameMode } from "../../api/types";

export type SettlementRail =
  | "OFF_CHAIN_ONLY"
  | "SERVER_SPONSORED_ON_CHAIN"
  | "USER_SIGNED_ON_CHAIN";

export type SettlementDecisionReason =
  | "MODE_FREE_PLAY_OFF_CHAIN"
  | "MODE_ON_CHAIN_REQUIRES_USER_SIGNATURE"
  | "SPONSORSHIP_CAPABILITY_DISABLED"
  | "PROOF_PIPELINE_NOT_READY"
  | "RELAYER_UNFUNDED_FALLBACK"
  | "SERVER_SPONSORED_ELIGIBLE";

export interface SettlementDecisionInput {
  gameMode: ApiGameMode;
  sponsorshipEnabled: boolean;
  proofPipelineReady: boolean;
  relayerFunded: boolean;
}

export interface SettlementDecision {
  rail: SettlementRail;
  reasons: SettlementDecisionReason[];
}

export type SettlementLifecycleStatus =
  | "REWARD_GRANTED"
  | "PROOF_PENDING"
  | "VERIFIED_ON_ERGO"
  | "FAILED";

export type SponsoredQueueStatus =
  | "NOT_QUEUED"
  | "ENQUEUED"
  | "PROCESSING"
  | "RETRY_SCHEDULED"
  | "COMMITTED"
  | "VERIFIED"
  | "FAILED";

export interface SettlementHistoryEntry {
  at: string;
  event: string;
  detail?: string;
}

export interface SettlementRecord {
  settlementId: string;
  rewardId: string;
  userId: string;
  gameId: string;
  units: number;
  unitKind: "XP" | "CREDITS";
  decision: SettlementDecision;
  lifecycleStatus: SettlementLifecycleStatus;
  queueStatus: SponsoredQueueStatus;
  attempts: number;
  maxAttempts: number;
  lastError?: string;
  nextAttemptAt?: string;
  batchId?: string;
  commitmentHash?: string;
  merkleRoot?: string;
  txId?: string;
  createdAt: string;
  updatedAt: string;
  history: SettlementHistoryEntry[];
}

export interface RegisterSettlementInput {
  rewardId: string;
  userId: string;
  gameId: string;
  units: number;
  unitKind: "XP" | "CREDITS";
  decisionInput: SettlementDecisionInput;
  maxAttempts?: number;
  simulatedFailuresBeforeSuccess?: number;
}

export interface WorkerRunResult {
  processedSettlementIds: string[];
  retryScheduledSettlementIds: string[];
  failedSettlementIds: string[];
  batchId?: string;
}

export interface BatchCommitment {
  batchId: string;
  settlementIds: string[];
  leafHashes: string[];
  merkleRoot: string;
  commitmentHash: string;
  windowStartedAt: string;
  windowClosedAt: string;
}
