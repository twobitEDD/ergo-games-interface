import {
  applyDeterministicTicTacToeMove,
  createTicTacToeState,
  TicTacToeState,
} from "@ergo-games/domain";

import { ApiGameMode } from "../api/types";
import {
  getSettlementsForUser,
  registerSettlement,
  resetSettlementQueueForTests,
} from "./settlement/settlementQueue";
import { decideSettlementRail } from "./settlement/decisionService";
import { getRuntimeDecisionInput } from "./settlement/runtimeCapabilities";
import {
  createIntent,
  getIntent,
  getIntentControls,
  listIntents,
  recoverPendingIntents,
  resetIntentServiceForTests,
  updateIntent,
  updateIntentControls,
} from "./intent/intentService";
import type { TxIntentLifecycleStatus, TxIntentView } from "./intent/types";

type StoredGameEventType = "CREATED" | "JOINED" | "MOVE_APPLIED" | "RESULT_RECORDED";

interface UserRecord {
  id: string;
  externalAuthId: string;
  displayName: string;
  wallets: Array<{ network: "ERGO_MAINNET" | "ERGO_TESTNET"; address: string }>;
}

interface StoredGameEvent {
  id: string;
  sequence: number;
  type: StoredGameEventType;
  actorUserId?: string;
  payload: Record<string, unknown>;
  createdAt: string;
}

interface RewardRecord {
  id: string;
  userId: string;
  gameId: string;
  type: "PARTICIPATION" | "ACHIEVEMENT";
  units: number;
  unitKind: "XP" | "CREDITS";
  reason: string;
  status: "GRANTED" | "REVOKED";
  capApplied: boolean;
  settlementId?: string;
  createdAt: string;
}

interface GameRecord {
  id: string;
  mode: ApiGameMode;
  hostUserId: string;
  joinerUserId?: string;
  status: "LOBBY" | "ACTIVE" | "FINISHED";
  state: TicTacToeState;
  eventLog: StoredGameEvent[];
  appliedRequestIds: Set<string>;
  rewardsIssued: boolean;
}

type PublicGameRecord = Omit<GameRecord, "appliedRequestIds" | "rewardsIssued">;

const usersByExternalAuth = new Map<string, UserRecord>();
const usersById = new Map<string, UserRecord>();
const gamesById = new Map<string, GameRecord>();
const rewardsByUserId = new Map<string, RewardRecord[]>();
const progressionByUserId = new Map<string, { xp: number; credits: number }>();

const generateId = (prefix: string): string =>
  `${prefix}_${Math.random().toString(36).slice(2, 10)}`;

const DAILY_XP_CAP = 180;
const DAILY_CREDITS_CAP = 75;

const trustNoticeByMode: Record<ApiGameMode, string> = {
  ON_CHAIN_PLAY:
    "Wallet mode remains explicit and user-signed. No automated value transfer is executed.",
  FREE_PLAY:
    "No-funds Free Play: off-chain authoritative event trail plus non-cash progression only.",
  SPONSORED_PLAY:
    "No-funds Sponsored Play: progression starts off-chain with optional proof lifecycle scaffolding. Wagers and payout guarantees remain disabled.",
};
const settlementRailForMode = (mode: ApiGameMode) =>
  decideSettlementRail(getRuntimeDecisionInput(mode)).rail;

const nowIso = (): string => new Date().toISOString();

const appendGameEvent = (
  game: GameRecord,
  input: Omit<StoredGameEvent, "id" | "sequence" | "createdAt">
): StoredGameEvent => {
  const event: StoredGameEvent = {
    id: generateId("evt"),
    sequence: game.eventLog.length + 1,
    createdAt: nowIso(),
    ...input,
  };
  game.eventLog.push(event);
  return event;
};

const sameUtcDay = (aIso: string, bIso: string): boolean => aIso.slice(0, 10) === bIso.slice(0, 10);

const grantedToday = (userId: string, unitKind: RewardRecord["unitKind"], dateIso: string): number => {
  const rewards = rewardsByUserId.get(userId) ?? [];
  return rewards
    .filter(
      (reward) =>
        reward.status === "GRANTED" && reward.unitKind === unitKind && sameUtcDay(reward.createdAt, dateIso)
    )
    .reduce((sum, reward) => sum + reward.units, 0);
};

const grantReward = (input: {
  userId: string;
  gameId: string;
  type: RewardRecord["type"];
  unitKind: RewardRecord["unitKind"];
  requestedUnits: number;
  reason: string;
}): RewardRecord | undefined => {
  const cap = input.unitKind === "XP" ? DAILY_XP_CAP : DAILY_CREDITS_CAP;
  const currentIso = nowIso();
  const used = grantedToday(input.userId, input.unitKind, currentIso);
  const remaining = Math.max(0, cap - used);
  const grantedUnits = Math.max(0, Math.min(input.requestedUnits, remaining));
  if (grantedUnits === 0) return undefined;

  const reward: RewardRecord = {
    id: generateId("rwd"),
    userId: input.userId,
    gameId: input.gameId,
    type: input.type,
    units: grantedUnits,
    unitKind: input.unitKind,
    reason: input.reason,
    status: "GRANTED",
    capApplied: grantedUnits < input.requestedUnits,
    createdAt: currentIso,
  };
  const rewards = rewardsByUserId.get(input.userId) ?? [];
  rewards.push(reward);
  rewardsByUserId.set(input.userId, rewards);

  const settlement = registerSettlement({
    rewardId: reward.id,
    userId: reward.userId,
    gameId: reward.gameId,
    units: reward.units,
    unitKind: reward.unitKind,
    decisionInput: getRuntimeDecisionInput(gamesById.get(reward.gameId)?.mode ?? "FREE_PLAY"),
  });
  reward.settlementId = settlement.settlementId;

  const progression = progressionByUserId.get(input.userId) ?? { xp: 0, credits: 0 };
  if (input.unitKind === "XP") progression.xp += reward.units;
  if (input.unitKind === "CREDITS") progression.credits += reward.units;
  progressionByUserId.set(input.userId, progression);

  return reward;
};

const replayStateFromEvents = (game: GameRecord): TicTacToeState => {
  let state = createTicTacToeState(false);
  for (const event of game.eventLog) {
    if (event.type !== "MOVE_APPLIED") continue;
    const cell = event.payload.cell;
    const actorUserId = event.payload.actorUserId;
    if (typeof cell !== "number" || typeof actorUserId !== "string") continue;
    const next = applyDeterministicTicTacToeMove(state, { actorUserId, cell });
    if (!next.ok) {
      throw new Error(`cannot replay game ${game.id}: invalid event sequence at ${event.id}`);
    }
    state = next.state;
  }
  return state;
};

const issueNoFundsRewards = (game: GameRecord): RewardRecord[] => {
  if (game.mode === "ON_CHAIN_PLAY" || game.rewardsIssued) return [];
  if (!game.joinerUserId) return [];

  const winner = game.eventLog
    .filter((event) => event.type === "RESULT_RECORDED")
    .map((event) => event.payload.winnerPlayer)
    .find((winnerPlayer) => winnerPlayer === "X" || winnerPlayer === "O");
  const isDraw = game.eventLog
    .filter((event) => event.type === "RESULT_RECORDED")
    .some((event) => event.payload.drawn === true);

  const hostBase = winner === "X" ? { xp: 40, credits: 18 } : winner === "O" ? { xp: 22, credits: 9 } : { xp: 28, credits: 12 };
  const joinerBase = winner === "O" ? { xp: 40, credits: 18 } : winner === "X" ? { xp: 22, credits: 9 } : { xp: 28, credits: 12 };
  const reason = isDraw ? "Draw result progression (non-cash)." : "Match completion progression (non-cash).";

  const rewards = [
    grantReward({
      userId: game.hostUserId,
      gameId: game.id,
      type: "PARTICIPATION",
      unitKind: "XP",
      requestedUnits: hostBase.xp,
      reason,
    }),
    grantReward({
      userId: game.hostUserId,
      gameId: game.id,
      type: "PARTICIPATION",
      unitKind: "CREDITS",
      requestedUnits: hostBase.credits,
      reason,
    }),
    grantReward({
      userId: game.joinerUserId,
      gameId: game.id,
      type: "PARTICIPATION",
      unitKind: "XP",
      requestedUnits: joinerBase.xp,
      reason,
    }),
    grantReward({
      userId: game.joinerUserId,
      gameId: game.id,
      type: "PARTICIPATION",
      unitKind: "CREDITS",
      requestedUnits: joinerBase.credits,
      reason,
    }),
  ].filter((reward): reward is RewardRecord => Boolean(reward));

  game.rewardsIssued = true;
  return rewards;
};

export const upsertUserFromAuth = (externalAuthId: string, displayName: string): UserRecord => {
  const existing = usersByExternalAuth.get(externalAuthId);
  if (existing) {
    existing.displayName = displayName;
    return existing;
  }

  const next: UserRecord = {
    id: generateId("usr"),
    externalAuthId,
    displayName,
    wallets: [],
  };
  usersByExternalAuth.set(externalAuthId, next);
  usersById.set(next.id, next);
  return next;
};

export const getUserById = (userId: string): UserRecord | undefined => usersById.get(userId);

export const bindWallet = (
  userId: string,
  wallet: { network: "ERGO_MAINNET" | "ERGO_TESTNET"; address: string }
): UserRecord | undefined => {
  const user = usersById.get(userId);
  if (!user) return undefined;
  const exists = user.wallets.some(
    (existing) => existing.address.toLowerCase() === wallet.address.toLowerCase()
  );
  if (!exists) user.wallets.push(wallet);
  return user;
};

export const createGame = (hostUserId: string, mode: ApiGameMode): GameRecord => {
  const game: GameRecord = {
    id: generateId("game"),
    mode,
    hostUserId,
    status: "LOBBY",
    state: createTicTacToeState(false),
    eventLog: [],
    appliedRequestIds: new Set<string>(),
    rewardsIssued: false,
  };
  appendGameEvent(game, {
    type: "CREATED",
    actorUserId: hostUserId,
    payload: {
      hostUserId,
      mode,
      settlementRail: settlementRailForMode(mode),
      trustNotice: trustNoticeByMode[mode],
    },
  });
  gamesById.set(game.id, game);
  return game;
};

export const joinGame = (
  gameId: string,
  joinerUserId: string
): GameRecord | "NOT_FOUND" | "FULL" | "INVALID_JOINER" => {
  const game = gamesById.get(gameId);
  if (!game) return "NOT_FOUND";
  if (joinerUserId === game.hostUserId) return "INVALID_JOINER";
  if (game.joinerUserId && game.joinerUserId !== joinerUserId) return "FULL";
  if (game.joinerUserId === joinerUserId) return game;
  game.joinerUserId = joinerUserId;
  game.status = "ACTIVE";
  appendGameEvent(game, {
    type: "JOINED",
    actorUserId: joinerUserId,
    payload: {
      joinerUserId,
      trustNotice: trustNoticeByMode[game.mode],
    },
  });
  return game;
};

export const applyMoveToGame = (
  gameId: string,
  actorUserId: string,
  cell: number,
  requestId?: string
): GameRecord | "NOT_FOUND" | "INVALID_ACTOR" | "INVALID_MOVE" => {
  const game = gamesById.get(gameId);
  if (!game) return "NOT_FOUND";
  const allowedActors = [game.hostUserId, game.joinerUserId].filter(Boolean);
  if (!allowedActors.includes(actorUserId)) return "INVALID_ACTOR";
  if (requestId && game.appliedRequestIds.has(requestId)) return game;

  // Replay event history before write so state writes stay idempotent under retries.
  const replayedState = replayStateFromEvents(game);
  game.state = replayedState;

  const applied = applyDeterministicTicTacToeMove(game.state, { actorUserId, cell });
  if (!applied.ok) return "INVALID_MOVE";

  game.state = applied.state;
  appendGameEvent(game, {
    type: "MOVE_APPLIED",
    actorUserId,
    payload: {
      actorUserId,
      cell,
      requestId,
      nextTurn: applied.event.nextTurn ?? null,
      winner: applied.event.winner ?? null,
      drawn: applied.event.drawn ?? false,
    },
  });
  if (requestId) game.appliedRequestIds.add(requestId);
  if (applied.event.winner || applied.event.drawn) {
    game.status = "FINISHED";
    appendGameEvent(game, {
      type: "RESULT_RECORDED",
      actorUserId,
      payload: {
        winnerPlayer: applied.event.winner ?? null,
        drawn: applied.event.drawn ?? false,
        trustNotice:
          "Result recorded from deterministic rules. For unfunded modes, progression is non-cash and cap-limited.",
      },
    });
    issueNoFundsRewards(game);
  }
  return game;
};

export const getGame = (gameId: string): GameRecord | undefined => gamesById.get(gameId);

export const getModeTrustNotice = (mode: ApiGameMode): string => trustNoticeByMode[mode];

export const projectGameForApi = (game: GameRecord): PublicGameRecord => ({
  id: game.id,
  mode: game.mode,
  hostUserId: game.hostUserId,
  joinerUserId: game.joinerUserId,
  status: game.status,
  state: game.state,
  eventLog: [...game.eventLog],
});

export const getGameEvents = (gameId: string): StoredGameEvent[] => {
  const game = gamesById.get(gameId);
  return game ? [...game.eventLog] : [];
};

export const getRewardsForUser = (userId: string): RewardRecord[] => [...(rewardsByUserId.get(userId) ?? [])];

export const getSettlementLifecycleForUser = (userId: string) => getSettlementsForUser(userId);

export const getProgressForUser = (userId: string): { xp: number; credits: number } => {
  return progressionByUserId.get(userId) ?? { xp: 0, credits: 0 };
};

export const createOnChainIntent = (input: {
  gameId: string;
  initiatorUserId: string;
  idempotencyKey: string;
  settlementId?: string;
}): TxIntentView => {
  return createIntent(input);
};

export const updateOnChainIntent = (input: {
  intentId: string;
  status: TxIntentLifecycleStatus;
  txId?: string;
  confirmations?: number;
  note?: string;
  replacementIntentId?: string;
  failureReason?: string;
}) => updateIntent(input);

export const getOnChainIntent = (intentId: string): TxIntentView | undefined => getIntent(intentId);

export const listOnChainIntents = (input?: {
  gameId?: string;
  settlementId?: string;
  status?: TxIntentLifecycleStatus;
  onlyPending?: boolean;
}) => listIntents(input);

export const recoverOnChainPendingIntents = () => recoverPendingIntents();

export const getOnChainIntentControls = () => getIntentControls();

export const updateOnChainIntentControls = (input: {
  strictConfirmationMode?: boolean;
  optimisticMode?: boolean;
  incidentFallbackToOffChain?: boolean;
  confirmationDepth?: number;
}) =>
  updateIntentControls({
    strictConfirmationMode: input.strictConfirmationMode,
    optimisticMode: input.optimisticMode,
    incidentFallbackToOffChain: input.incidentFallbackToOffChain,
    confirmationDepth: input.confirmationDepth,
  });

export const resetMemoryStoreForTests = (): void => {
  usersByExternalAuth.clear();
  usersById.clear();
  gamesById.clear();
  rewardsByUserId.clear();
  progressionByUserId.clear();
  resetSettlementQueueForTests();
  resetIntentServiceForTests();
};
