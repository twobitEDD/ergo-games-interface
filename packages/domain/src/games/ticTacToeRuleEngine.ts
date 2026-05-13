import {
  applyMove,
  EMPTY_BOARD,
  isLegalMove,
  statusOf,
} from "./ticTacToeLogic";
import type { Board } from "./ticTacToeLogic";

export type TicTacToePlayer = "X" | "O";

export interface TicTacToeState {
  board: Board;
  open: boolean;
}

export interface TicTacToeMoveCommand {
  actorUserId: string;
  cell: number;
}

export interface TicTacToeMoveAppliedEvent {
  type: "MOVE_APPLIED";
  actorUserId: string;
  cell: number;
  nextTurn?: TicTacToePlayer;
  winner?: TicTacToePlayer;
  drawn?: boolean;
}

export interface TicTacToeMoveRejected {
  ok: false;
  reason:
    | "GAME_IS_OPEN"
    | "GAME_ALREADY_FINISHED"
    | "CELL_OUT_OF_RANGE"
    | "CELL_ALREADY_OCCUPIED";
}

export interface TicTacToeMoveAccepted {
  ok: true;
  state: TicTacToeState;
  event: TicTacToeMoveAppliedEvent;
}

export type TicTacToeMoveResult = TicTacToeMoveAccepted | TicTacToeMoveRejected;

export const createTicTacToeState = (open = false): TicTacToeState => ({
  board: EMPTY_BOARD,
  open,
});

export const applyDeterministicTicTacToeMove = (
  state: TicTacToeState,
  command: TicTacToeMoveCommand
): TicTacToeMoveResult => {
  if (state.open) return { ok: false, reason: "GAME_IS_OPEN" };
  if (command.cell < 0 || command.cell > 8) return { ok: false, reason: "CELL_OUT_OF_RANGE" };

  const beforeStatus = statusOf(state.board, false);
  if (beforeStatus.kind === "won" || beforeStatus.kind === "drawn") {
    return { ok: false, reason: "GAME_ALREADY_FINISHED" };
  }

  if (!isLegalMove(state.board, command.cell)) {
    return { ok: false, reason: "CELL_ALREADY_OCCUPIED" };
  }

  const nextBoard = applyMove(state.board, command.cell);
  const nextStatus = statusOf(nextBoard, false);

  const event: TicTacToeMoveAppliedEvent = {
    type: "MOVE_APPLIED",
    actorUserId: command.actorUserId,
    cell: command.cell,
    nextTurn: nextStatus.kind === "ongoing" ? nextStatus.turn : undefined,
    winner: nextStatus.kind === "won" ? nextStatus.winner : undefined,
    drawn: nextStatus.kind === "drawn" ? true : undefined,
  };

  return {
    ok: true,
    state: { ...state, board: nextBoard },
    event,
  };
};
