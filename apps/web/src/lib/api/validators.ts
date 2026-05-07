import {
  AuthSyncInput,
  CreateGameInput,
  JoinGameInput,
  MoveInput,
  OnChainPrepareInput,
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
  return {
    gameId: asTrimmed(value.gameId, "gameId"),
    actorUserId: asTrimmed(value.actorUserId, "actorUserId"),
    cell,
  };
};

export const parseOnChainPrepareInput = (value: unknown): OnChainPrepareInput => {
  if (!isObject(value)) throw new Error("body must be an object");
  return {
    gameId: asTrimmed(value.gameId, "gameId"),
    initiatorUserId: asTrimmed(value.initiatorUserId, "initiatorUserId"),
  };
};
