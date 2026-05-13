import assert from "node:assert/strict";
import test from "node:test";

import {
  parseCreateGameInput,
  parseMoveInput,
  parseSettlementIndexerObservationInput,
  parseSettlementWorkerRunInput,
  parseTxIntentControlsUpdateInput,
  parseTxIntentCreateInput,
  parseTxIntentUpdateInput,
  parseWalletBindInput,
} from "./validators";

test("parseCreateGameInput accepts ON_CHAIN_PLAY mode", () => {
  const payload = parseCreateGameInput({
    hostUserId: "user-1",
    mode: "ON_CHAIN_PLAY",
  });
  assert.equal(payload.hostUserId, "user-1");
  assert.equal(payload.mode, "ON_CHAIN_PLAY");
});

test("parseCreateGameInput accepts no-funds mode values", () => {
  const freePlay = parseCreateGameInput({
    hostUserId: "user-1",
    mode: "FREE_PLAY",
  });
  const sponsoredPlay = parseCreateGameInput({
    hostUserId: "user-2",
    mode: "SPONSORED_PLAY",
  });

  assert.equal(freePlay.mode, "FREE_PLAY");
  assert.equal(sponsoredPlay.mode, "SPONSORED_PLAY");
});

test("parseWalletBindInput rejects unsupported network", () => {
  assert.throws(
    () =>
      parseWalletBindInput({
        userId: "u1",
        network: "UNKNOWN",
        address: "addr",
      }),
    /network must be ERGO_MAINNET or ERGO_TESTNET/
  );
});

test("parseMoveInput requires integer cell", () => {
  assert.throws(
    () =>
      parseMoveInput({
        gameId: "g1",
        actorUserId: "u1",
        cell: 1.2,
      }),
    /cell must be an integer/
  );
});

test("parseMoveInput accepts optional replay-safe requestId", () => {
  const payload = parseMoveInput({
    gameId: "game-1",
    actorUserId: "user-1",
    cell: 2,
    requestId: "req-123",
  });

  assert.equal(payload.requestId, "req-123");
});

test("parseSettlementWorkerRunInput validates retry delay", () => {
  assert.throws(
    () => parseSettlementWorkerRunInput({ retryDelayMs: -1 }),
    /retryDelayMs must be a non-negative integer/
  );
  assert.deepEqual(parseSettlementWorkerRunInput({ retryDelayMs: 2000 }), { retryDelayMs: 2000 });
});

test("parseSettlementIndexerObservationInput validates confirmations", () => {
  assert.throws(
    () =>
      parseSettlementIndexerObservationInput({
        commitmentHash: "abc",
        txId: "tx",
        confirmations: -2,
      }),
    /confirmations must be a non-negative integer/
  );
});

test("parseTxIntentCreateInput requires idempotency key", () => {
  const payload = parseTxIntentCreateInput({
    gameId: "game-1",
    initiatorUserId: "user-1",
    idempotencyKey: "idem-1",
  });
  assert.equal(payload.idempotencyKey, "idem-1");
});

test("parseTxIntentUpdateInput validates lifecycle status and confirmations", () => {
  assert.throws(
    () =>
      parseTxIntentUpdateInput({
        status: "UNKNOWN",
      }),
    /status must be a valid tx intent lifecycle status/
  );
  const payload = parseTxIntentUpdateInput({
    status: "CONFIRMED",
    confirmations: 2,
  });
  assert.equal(payload.status, "CONFIRMED");
  assert.equal(payload.confirmations, 2);
});

test("parseTxIntentControlsUpdateInput validates numeric depth", () => {
  assert.throws(
    () =>
      parseTxIntentControlsUpdateInput({
        confirmationDepth: 0,
      }),
    /confirmationDepth must be a positive integer/
  );
});
