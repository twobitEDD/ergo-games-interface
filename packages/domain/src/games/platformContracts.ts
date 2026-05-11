export const GAME_TYPES = ["tic_tac_toe", "coin_flip_demo"] as const;

export type GameType = (typeof GAME_TYPES)[number];

export type RuntimeGameStatus =
  | { kind: "open" }
  | { kind: "ongoing"; turn: "X" | "O" }
  | { kind: "won"; winner: "X" | "O" }
  | { kind: "drawn" };

export interface GameTypeMetadata {
  gameType: GameType;
  displayName: string;
  description: string;
  supportsMoves: boolean;
  maturity: "ga" | "preview";
}

export interface ApiGameTypeListResponse {
  scaffold: true;
  gameTypes: GameTypeMetadata[];
}

export interface ApiCreateGameRequest {
  gameType?: GameType;
}

// Shared account/profile and progression contracts used by game clients/services.
export interface PlayerProfile {
  userId: string;
  displayName: string;
  walletStatus: "unbound" | "bound_stub" | "bound";
  walletAddress?: string;
  gamesPlayed: number;
  wins: number;
}

export interface PlayerRewardSnapshot {
  userId: string;
  tier: "none" | "starter" | "engaged" | "veteran" | "elite";
  points: number;
  note: string;
}

export interface PlayerRecentActivity {
  userId: string;
  displayName: string;
  lastActiveAt: string;
  gamesPlayed: number;
  wins: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  points: number;
  wins: number;
  gamesPlayed: number;
}

export interface AchievementProgressSnapshot {
  playerId: string;
  xp: number;
  level: number;
  achievements: Array<{
    id: string;
    unlockedAt?: string;
    progress?: number;
  }>;
  stats: Record<string, number>;
  updatedAt: string;
}

export type MatchLifecycleState = "open" | "active" | "completed" | "cancelled";

export interface MatchSessionSummary {
  gameId: string;
  gameType: GameType;
  status: RuntimeGameStatus;
  lifecycle: MatchLifecycleState;
  participants: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SecurityMetricPoint {
  key: string;
  count: number;
}

export interface EndpointMetricPoint {
  key: string;
  requests: number;
  errors: number;
  avgLatencyMs: number;
  updatedAt: string;
}

export interface BuildGameCapabilitySnapshotInput {
  hasSession: boolean;
  hasWalletBinding: boolean;
  canRunWithoutDynamic: boolean;
  canExportEncryptedVault: boolean;
  canUseRecoveryPhrase: boolean;
  canExportToRecoveryService: boolean;
}

export interface GameCapabilitySnapshot {
  canCreateMatches: boolean;
  canJoinMatches: boolean;
  canCreateOnChainIntents: boolean;
  canUseRecoveryService: boolean;
  canExportEncryptedWallet: boolean;
  canExportMnemonic: boolean;
  blockers: string[];
}

export const buildGameCapabilitySnapshot = (
  input: BuildGameCapabilitySnapshotInput
): GameCapabilitySnapshot => {
  const blockers: string[] = [];
  if (!input.hasSession) {
    blockers.push("Active application session is required.");
  }
  if (!input.hasWalletBinding) {
    blockers.push("Wallet binding is required for on-chain intent preparation.");
  }
  if (!input.canRunWithoutDynamic) {
    blockers.push("Provider-independent continuity has not been completed.");
  }

  return {
    canCreateMatches: input.hasSession,
    canJoinMatches: input.hasSession,
    canCreateOnChainIntents: input.hasSession && input.hasWalletBinding,
    canUseRecoveryService: input.canExportToRecoveryService && input.canRunWithoutDynamic,
    canExportEncryptedWallet: input.canExportEncryptedVault,
    canExportMnemonic: input.canUseRecoveryPhrase,
    blockers,
  };
};

/**
 * Canonical capability matrix for authenticated Day1-style gameplay accounts.
 * Capability booleans are authoritative server decisions, not client-derived hints.
 */
export interface AccountCapabilityMatrix {
  canPlayFree: boolean;
  canReceiveRewards: boolean;
  canWager: boolean;
  needsWalletSetup: boolean;
}

/**
 * Explicit server authority descriptor used when upstream auth (e.g. Dynamic)
 * acts as onboarding only and final authorization remains server-owned.
 */
export interface ServerAuthorityRef {
  authority: "day1-server-user-id";
  userId: string;
}

export interface ApiCapabilityEnvelope {
  scaffold: true;
  capabilities: AccountCapabilityMatrix;
  authority: ServerAuthorityRef;
}
