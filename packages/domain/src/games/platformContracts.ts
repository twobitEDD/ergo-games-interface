export const GAME_TYPES = ["tic_tac_toe", "coin_flip_demo", "xo3"] as const;

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

/** Canonical metadata for every registered `GameType` (lobby/catalog UIs, capability hints). */
export const GAME_TYPE_CATALOG: Record<GameType, GameTypeMetadata> = {
  tic_tac_toe: {
    gameType: "tic_tac_toe",
    displayName: "Tic-Tac-Toe",
    description: "Classic 3×3 deterministic grid play.",
    supportsMoves: true,
    maturity: "ga",
  },
  coin_flip_demo: {
    gameType: "coin_flip_demo",
    displayName: "Coin Flip Demo",
    description: "Lightweight demo surface for randomness and settlement hooks.",
    supportsMoves: false,
    maturity: "preview",
  },
  xo3: {
    gameType: "xo3",
    displayName: "XO3 (Ultimate Tic-Tac-Toe)",
    description: "Nine-board meta game with forcing rules (XO3 / super tic-tac-toe family).",
    supportsMoves: true,
    maturity: "preview",
  },
};

/** Scaffold response listing all known game types with stable display copy. */
export const buildDefaultGameTypeListResponse = (): ApiGameTypeListResponse => ({
  scaffold: true,
  gameTypes: GAME_TYPES.map((gameType) => GAME_TYPE_CATALOG[gameType]),
});

export const describeRuntimeGameStatus = (status: RuntimeGameStatus): string => {
  switch (status.kind) {
    case "open":
      return "Waiting for opponent";
    case "ongoing":
      return `Turn: ${status.turn}`;
    case "won":
      return `Winner: ${status.winner}`;
    case "drawn":
      return "Draw";
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
};

export type PlayerSeatMark = "X" | "O";

/**
 * Row shape for “my games” / session game lists where the caller knows their seat
 * (matches common XO3-style HTTP payloads; reusable by other hosted games).
 */
export interface SeatedPlayerGameSummary {
  gameId: string;
  gameType: GameType;
  mySeat: PlayerSeatMark;
  playStatus: RuntimeGameStatus;
  waitingGuest: boolean;
  wagerCreditsPerPlayer: number;
  offerOnChainSettlement: boolean;
}

export interface ApiListPlayerGamesResponse {
  ok: boolean;
  games?: SeatedPlayerGameSummary[];
  error?: string;
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
