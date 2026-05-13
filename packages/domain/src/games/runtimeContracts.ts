import type { GameType, GameTypeMetadata, RuntimeGameStatus } from "./platformContracts";

export interface RuntimeGameRecord {
  gameId: string;
  gameType: GameType;
  createdByUserId: string;
  participants: string[];
  playerSeats: {
    X: string;
    O: string | null;
  };
  /** Optional wager stake per player (credits-style hosted matches). */
  wagerCreditsPerPlayer?: number;
  /** Whether the host offered on-chain settlement for this match. */
  offerOnChainSettlement?: boolean;
}

export interface RuntimeJoinGameResult<TGameRecord extends RuntimeGameRecord = RuntimeGameRecord> {
  ok: boolean;
  game?: TGameRecord;
  reason?: string;
}

export interface RuntimeMoveResult {
  ok: boolean;
  reason?: string;
}

export interface GameSessionService<
  TGameRecord extends RuntimeGameRecord = RuntimeGameRecord,
  TJoinResult extends RuntimeJoinGameResult<TGameRecord> = RuntimeJoinGameResult<TGameRecord>,
  TMoveResult extends RuntimeMoveResult = RuntimeMoveResult,
> {
  createGame(createdByUserId: string, gameType: GameType): TGameRecord;
  joinGame(gameId: string, userId: string): TJoinResult;
  getGame(gameId: string): TGameRecord | null;
  applyMove(gameId: string, userId: string, cell: number): TMoveResult | null;
}

export interface RewardPolicy<TGameRecord extends RuntimeGameRecord = RuntimeGameRecord> {
  onGameSettled(input: { game: TGameRecord; status: RuntimeGameStatus }): void;
}

export interface SettlementPolicy<TGameRecord extends RuntimeGameRecord = RuntimeGameRecord> {
  canCreateIntent(input: { game: TGameRecord; action: "SETTLE_GAME" | "SYNC_RESULT" }): {
    allowed: boolean;
    reason?: string;
  };
}

export interface GameEngine<
  TGameRecord extends RuntimeGameRecord = RuntimeGameRecord,
  TMoveResult extends RuntimeMoveResult = RuntimeMoveResult,
  TSessionService extends GameSessionService<TGameRecord, RuntimeJoinGameResult<TGameRecord>, TMoveResult> =
    GameSessionService<TGameRecord, RuntimeJoinGameResult<TGameRecord>, TMoveResult>,
> {
  readonly metadata: GameTypeMetadata;
  getStatus(game: TGameRecord): RuntimeGameStatus;
  applyMove(input: {
    sessionService: TSessionService;
    gameId: string;
    userId: string;
    cell: number;
  }): TMoveResult | null;
}
