import assert from "node:assert/strict";
import test from "node:test";

import {
  parseCreateGameInput,
  parseMoveInput,
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
