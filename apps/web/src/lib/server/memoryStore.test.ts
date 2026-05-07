import assert from "node:assert/strict";
import test from "node:test";

import {
  applyMoveToGame,
  createGame,
  getGameEvents,
  getProgressForUser,
  getRewardsForUser,
  joinGame,
  resetMemoryStoreForTests,
  upsertUserFromAuth,
} from "./memoryStore";

const playHostWin = (gameId: string, hostUserId: string, joinerUserId: string): void => {
  const sequence: Array<{ actorUserId: string; cell: number; requestId: string }> = [
    { actorUserId: hostUserId, cell: 0, requestId: "req-1" },
    { actorUserId: joinerUserId, cell: 3, requestId: "req-2" },
    { actorUserId: hostUserId, cell: 1, requestId: "req-3" },
    { actorUserId: joinerUserId, cell: 4, requestId: "req-4" },
    { actorUserId: hostUserId, cell: 2, requestId: "req-5" },
  ];

  for (const step of sequence) {
    const result = applyMoveToGame(gameId, step.actorUserId, step.cell, step.requestId);
    assert.notEqual(result, "NOT_FOUND");
    assert.notEqual(result, "INVALID_ACTOR");
    assert.notEqual(result, "INVALID_MOVE");
  }
};

test.beforeEach(() => {
  resetMemoryStoreForTests();
});

test("records append-only events and grants non-cash rewards in FREE_PLAY", () => {
  const host = upsertUserFromAuth("auth-host", "Host");
  const joiner = upsertUserFromAuth("auth-joiner", "Joiner");

  const game = createGame(host.id, "FREE_PLAY");
  const joined = joinGame(game.id, joiner.id);
  assert.notEqual(joined, "NOT_FOUND");
  assert.notEqual(joined, "FULL");
  assert.notEqual(joined, "INVALID_JOINER");

  playHostWin(game.id, host.id, joiner.id);

  const events = getGameEvents(game.id);
  assert.equal(events.length, 8);
  assert.deepEqual(
    events.map((event) => event.type),
    ["CREATED", "JOINED", "MOVE_APPLIED", "MOVE_APPLIED", "MOVE_APPLIED", "MOVE_APPLIED", "MOVE_APPLIED", "RESULT_RECORDED"]
  );
  assert.deepEqual(
    events.map((event) => event.sequence),
    [1, 2, 3, 4, 5, 6, 7, 8]
  );

  const hostProgress = getProgressForUser(host.id);
  const joinerProgress = getProgressForUser(joiner.id);
  assert.equal(hostProgress.xp > 0, true);
  assert.equal(hostProgress.credits > 0, true);
  assert.equal(joinerProgress.xp > 0, true);
  assert.equal(joinerProgress.credits > 0, true);
});

test("keeps wallet mode intact by not issuing off-chain progression rewards", () => {
  const host = upsertUserFromAuth("auth-host", "Host");
  const joiner = upsertUserFromAuth("auth-joiner", "Joiner");

  const game = createGame(host.id, "ON_CHAIN_PLAY");
  const joined = joinGame(game.id, joiner.id);
  assert.notEqual(joined, "NOT_FOUND");
  assert.notEqual(joined, "FULL");
  assert.notEqual(joined, "INVALID_JOINER");

  playHostWin(game.id, host.id, joiner.id);

  assert.equal(getRewardsForUser(host.id).length, 0);
  assert.equal(getRewardsForUser(joiner.id).length, 0);
  assert.deepEqual(getProgressForUser(host.id), { xp: 0, credits: 0 });
  assert.deepEqual(getProgressForUser(joiner.id), { xp: 0, credits: 0 });
});

test("rejects invalid move and keeps event log append-only", () => {
  const host = upsertUserFromAuth("auth-host", "Host");
  const joiner = upsertUserFromAuth("auth-joiner", "Joiner");

  const game = createGame(host.id, "SPONSORED_PLAY");
  const joined = joinGame(game.id, joiner.id);
  assert.notEqual(joined, "NOT_FOUND");
  assert.notEqual(joined, "FULL");
  assert.notEqual(joined, "INVALID_JOINER");

  const firstMove = applyMoveToGame(game.id, host.id, 0, "req-1");
  assert.notEqual(firstMove, "NOT_FOUND");
  assert.notEqual(firstMove, "INVALID_ACTOR");
  assert.notEqual(firstMove, "INVALID_MOVE");

  const invalidMove = applyMoveToGame(game.id, joiner.id, 0, "req-2");
  assert.equal(invalidMove, "INVALID_MOVE");
  assert.deepEqual(
    getGameEvents(game.id).map((event) => event.type),
    ["CREATED", "JOINED", "MOVE_APPLIED"]
  );
});

test("deduplicates replayed move requestId and enforces daily reward caps", () => {
  const host = upsertUserFromAuth("auth-host", "Host");
  const joiner = upsertUserFromAuth("auth-joiner", "Joiner");

  const game = createGame(host.id, "FREE_PLAY");
  const joined = joinGame(game.id, joiner.id);
  assert.notEqual(joined, "NOT_FOUND");
  assert.notEqual(joined, "FULL");
  assert.notEqual(joined, "INVALID_JOINER");

  const once = applyMoveToGame(game.id, host.id, 0, "dup-req");
  const replay = applyMoveToGame(game.id, host.id, 0, "dup-req");
  assert.notEqual(once, "INVALID_MOVE");
  assert.notEqual(replay, "INVALID_MOVE");
  assert.equal(getGameEvents(game.id).filter((event) => event.type === "MOVE_APPLIED").length, 1);

  for (let i = 0; i < 8; i += 1) {
    const extraGame = createGame(host.id, "FREE_PLAY");
    const extraJoined = joinGame(extraGame.id, joiner.id);
    assert.notEqual(extraJoined, "NOT_FOUND");
    assert.notEqual(extraJoined, "FULL");
    assert.notEqual(extraJoined, "INVALID_JOINER");
    playHostWin(extraGame.id, host.id, joiner.id);
  }

  const hostProgress = getProgressForUser(host.id);
  assert.equal(hostProgress.xp <= 180, true);
  assert.equal(hostProgress.credits <= 75, true);
});
