import {
  applyDeterministicTicTacToeMove,
  createTicTacToeState,
  TicTacToeState,
} from "@ergo-games/domain";

import { ApiGameMode } from "../api/types";

interface UserRecord {
  id: string;
  externalAuthId: string;
  displayName: string;
  wallets: Array<{ network: "ERGO_MAINNET" | "ERGO_TESTNET"; address: string }>;
}

interface GameRecord {
  id: string;
  mode: ApiGameMode;
  hostUserId: string;
  joinerUserId?: string;
  status: "LOBBY" | "ACTIVE" | "FINISHED";
  state: TicTacToeState;
  eventLog: Array<Record<string, unknown>>;
}

interface TxIntentRecord {
  id: string;
  gameId: string;
  status: "PREPARED" | "WAITING_FOR_SIGNATURE" | "CONFIRMED";
  trustNotice: string;
}

const usersByExternalAuth = new Map<string, UserRecord>();
const usersById = new Map<string, UserRecord>();
const gamesById = new Map<string, GameRecord>();
const intentsById = new Map<string, TxIntentRecord>();

const generateId = (prefix: string): string =>
  `${prefix}_${Math.random().toString(36).slice(2, 10)}`;

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
    eventLog: [{ type: "CREATED", hostUserId, mode }],
  };
  gamesById.set(game.id, game);
  return game;
};

export const joinGame = (gameId: string, joinerUserId: string): GameRecord | "NOT_FOUND" | "FULL" => {
  const game = gamesById.get(gameId);
  if (!game) return "NOT_FOUND";
  if (game.joinerUserId && game.joinerUserId !== joinerUserId) return "FULL";
  game.joinerUserId = joinerUserId;
  game.status = "ACTIVE";
  game.eventLog.push({ type: "JOINED", joinerUserId });
  return game;
};

export const applyMoveToGame = (
  gameId: string,
  actorUserId: string,
  cell: number
): GameRecord | "NOT_FOUND" | "INVALID_ACTOR" | "INVALID_MOVE" => {
  const game = gamesById.get(gameId);
  if (!game) return "NOT_FOUND";
  const allowedActors = [game.hostUserId, game.joinerUserId].filter(Boolean);
  if (!allowedActors.includes(actorUserId)) return "INVALID_ACTOR";

  const applied = applyDeterministicTicTacToeMove(game.state, { actorUserId, cell });
  if (!applied.ok) return "INVALID_MOVE";

  game.state = applied.state;
  game.eventLog.push(applied.event);
  if (applied.event.winner || applied.event.drawn) {
    game.status = "FINISHED";
  }
  return game;
};

export const getGame = (gameId: string): GameRecord | undefined => gamesById.get(gameId);

export const createOnChainIntent = (gameId: string): TxIntentRecord => {
  const intent: TxIntentRecord = {
    id: generateId("intent"),
    gameId,
    status: "PREPARED",
    trustNotice:
      "Transaction intent scaffold only. No automated value transfer is executed in this release.",
  };
  intentsById.set(intent.id, intent);
  return intent;
};

export const getOnChainIntent = (intentId: string): TxIntentRecord | undefined => intentsById.get(intentId);
