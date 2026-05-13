import assert from "node:assert/strict";
import test from "node:test";
import {
  buildDefaultGameTypeListResponse,
  buildGameCapabilitySnapshot,
  describeRuntimeGameStatus,
  GAME_TYPES,
} from "./platformContracts";

test("buildGameCapabilitySnapshot reports continuity and on-chain blockers", () => {
  const snapshot = buildGameCapabilitySnapshot({
    hasSession: true,
    hasWalletBinding: false,
    canRunWithoutDynamic: false,
    canExportEncryptedVault: false,
    canUseRecoveryPhrase: false,
    canExportToRecoveryService: false,
  });

  assert.equal(snapshot.canCreateMatches, true);
  assert.equal(snapshot.canCreateOnChainIntents, false);
  assert.equal(snapshot.canUseRecoveryService, false);
  assert.ok(snapshot.blockers.length >= 2);
});

test("GAME_TYPES includes xo3 for shared catalog contracts", () => {
  assert.ok(GAME_TYPES.includes("xo3"));
});

test("buildDefaultGameTypeListResponse lists every GAME_TYPES entry with metadata", () => {
  const payload = buildDefaultGameTypeListResponse();
  assert.equal(payload.scaffold, true);
  assert.equal(payload.gameTypes.length, GAME_TYPES.length);
  const ids = payload.gameTypes.map((g) => g.gameType).sort();
  assert.deepEqual(ids, [...GAME_TYPES].sort());
});

test("describeRuntimeGameStatus covers all RuntimeGameStatus variants", () => {
  assert.equal(describeRuntimeGameStatus({ kind: "open" }), "Waiting for opponent");
  assert.equal(describeRuntimeGameStatus({ kind: "ongoing", turn: "O" }), "Turn: O");
  assert.equal(describeRuntimeGameStatus({ kind: "won", winner: "X" }), "Winner: X");
  assert.equal(describeRuntimeGameStatus({ kind: "drawn" }), "Draw");
});

