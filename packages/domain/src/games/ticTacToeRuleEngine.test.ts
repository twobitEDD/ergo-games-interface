import assert from "node:assert/strict";
import test from "node:test";

import {
  applyDeterministicTicTacToeMove,
  createTicTacToeState,
} from "./ticTacToeRuleEngine";

test("applies deterministic move and flips turn", () => {
  const initialState = createTicTacToeState(false);
  const result = applyDeterministicTicTacToeMove(initialState, {
    actorUserId: "user-1",
    cell: 0,
  });

  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.state.board[0], 1);
  assert.equal(result.event.nextTurn, "O");
  assert.equal(result.event.winner, undefined);
});

test("rejects move when cell is already occupied", () => {
  const initialState = createTicTacToeState(false);
  const firstMove = applyDeterministicTicTacToeMove(initialState, {
    actorUserId: "user-1",
    cell: 0,
  });
  assert.equal(firstMove.ok, true);
  if (!firstMove.ok) return;

  const duplicateMove = applyDeterministicTicTacToeMove(firstMove.state, {
    actorUserId: "user-2",
    cell: 0,
  });

  assert.deepEqual(duplicateMove, {
    ok: false,
    reason: "CELL_ALREADY_OCCUPIED",
  });
});

test("returns winner flag on deterministic winning move", () => {
  let state = createTicTacToeState(false);
  const sequence = [0, 3, 1, 4];
  for (const cell of sequence) {
    const step = applyDeterministicTicTacToeMove(state, {
      actorUserId: `actor-${cell}`,
      cell,
    });
    assert.equal(step.ok, true);
    if (!step.ok) return;
    state = step.state;
  }

  const winningMove = applyDeterministicTicTacToeMove(state, {
    actorUserId: "actor-final",
    cell: 2,
  });

  assert.equal(winningMove.ok, true);
  if (!winningMove.ok) return;
  assert.equal(winningMove.event.winner, "X");
});
