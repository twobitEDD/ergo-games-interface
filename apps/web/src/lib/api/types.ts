export type ApiGameMode = "ON_CHAIN_PLAY" | "FREE_PLAY" | "SPONSORED_PLAY";

export interface AuthSyncInput {
  externalAuthId: string;
  displayName: string;
}

export interface WalletBindInput {
  userId: string;
  network: "ERGO_MAINNET" | "ERGO_TESTNET";
  address: string;
}

export interface CreateGameInput {
  hostUserId: string;
  mode: ApiGameMode;
}

export interface JoinGameInput {
  gameId: string;
  joinerUserId: string;
}

export interface MoveInput {
  gameId: string;
  actorUserId: string;
  cell: number;
  requestId?: string;
}

export interface OnChainPrepareInput {
  gameId: string;
  initiatorUserId: string;
}
