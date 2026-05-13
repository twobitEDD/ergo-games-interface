export type GameMode = "ON_CHAIN_PLAY" | "FREE_PLAY" | "SPONSORED_PLAY";
export type GameStatus = "LOBBY" | "ACTIVE" | "FINISHED" | "CANCELLED";
export type PlayerSymbol = "X" | "O";

export type GameEventType = "CREATED" | "JOINED" | "MOVE_APPLIED" | "RESULT_RECORDED";
export type RewardType = "PARTICIPATION" | "ACHIEVEMENT";
export type RewardStatus = "PENDING" | "GRANTED" | "REVOKED";
export type SettlementType = "OFF_CHAIN_ONLY" | "USER_SIGNED_ON_CHAIN" | "SERVER_SPONSORED_ON_CHAIN";
export type SettlementStatus = "NOT_STARTED" | "PREPARED" | "SUBMITTED" | "CONFIRMED" | "FAILED";

export interface Wallet {
  id: string;
  userId: string;
  network: "ERGO_MAINNET" | "ERGO_TESTNET";
  address: string;
  label?: string;
  isPrimary: boolean;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlayerProfile {
  id: string;
  userId: string;
  displayName: string;
  trustNoticeAcceptedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  externalAuthId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Game {
  id: string;
  mode: GameMode;
  status: GameStatus;
  hostUserId: string;
  joinerUserId?: string;
  boardSnapshot: readonly number[];
  currentTurn: PlayerSymbol;
  winnerPlayer?: PlayerSymbol;
  createdAt: string;
  updatedAt: string;
}

export interface GameEvent {
  id: string;
  gameId: string;
  type: GameEventType;
  actorUserId?: string;
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface Reward {
  id: string;
  userId: string;
  gameId?: string;
  type: RewardType;
  status: RewardStatus;
  units: number;
  reason: string;
  createdAt: string;
  updatedAt: string;
}

export interface Settlement {
  id: string;
  gameId: string;
  type: SettlementType;
  status: SettlementStatus;
  txIntentId?: string;
  txId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}
