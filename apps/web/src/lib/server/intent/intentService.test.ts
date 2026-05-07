import assert from "node:assert/strict";
import test from "node:test";

import {
  createIntent,
  listIntents,
  recoverPendingIntents,
  resetIntentServiceForTests,
  updateIntent,
  updateIntentControls,
} from "./intentService";

test.beforeEach(() => {
  resetIntentServiceForTests();
});

test("createIntent is idempotent by idempotency key", () => {
  const first = createIntent({
    idempotencyKey: "idem-1",
    gameId: "game-1",
    initiatorUserId: "user-1",
  });
  const second = createIntent({
    idempotencyKey: "idem-1",
    gameId: "game-1",
    initiatorUserId: "user-1",
  });
  assert.equal(first.id, second.id);
  assert.equal(listIntents().length, 1);
});

test("intent lifecycle transitions and auto-finalizes at depth", () => {
  updateIntentControls({ confirmationDepth: 2 });
  const intent = createIntent({
    idempotencyKey: "idem-2",
    gameId: "game-2",
    initiatorUserId: "user-2",
  });

  const signed = updateIntent({ intentId: intent.id, status: "SIGNED" });
  assert.notEqual(signed, "NOT_FOUND");
  assert.notEqual(signed, "INVALID_TRANSITION");
  assert.notEqual(signed, "TERMINAL_STATUS");
  assert.notEqual(signed, "INCIDENT_FALLBACK_ACTIVE");

  const submitted = updateIntent({
    intentId: intent.id,
    status: "SUBMITTED",
    txId: "tx-demo",
  });
  assert.notEqual(submitted, "NOT_FOUND");
  assert.notEqual(submitted, "INVALID_TRANSITION");
  assert.notEqual(submitted, "TERMINAL_STATUS");
  assert.notEqual(submitted, "INCIDENT_FALLBACK_ACTIVE");

  updateIntent({
    intentId: intent.id,
    status: "CONFIRMED",
    confirmations: 2,
  });
  const finalized = listIntents({ gameId: "game-2" })[0];
  assert.equal(finalized.status, "FINALIZED");
  assert.equal(finalized.finality.trustLabel, "CONFIRMED_FINALITY_THRESHOLD");
});

test("recovery returns non-terminal intents only", () => {
  const pending = createIntent({
    idempotencyKey: "idem-pending",
    gameId: "game-3",
    initiatorUserId: "user-3",
  });
  const completed = createIntent({
    idempotencyKey: "idem-finalized",
    gameId: "game-4",
    initiatorUserId: "user-4",
  });

  updateIntent({ intentId: completed.id, status: "SIGNED" });
  updateIntent({ intentId: completed.id, status: "SUBMITTED" });
  updateIntent({ intentId: completed.id, status: "CONFIRMED", confirmations: 3 });

  const recovered = recoverPendingIntents();
  assert.deepEqual(recovered.map((intent) => intent.id), [pending.id]);
});

test("incident fallback blocks lifecycle updates", () => {
  const intent = createIntent({
    idempotencyKey: "idem-incident",
    gameId: "game-5",
    initiatorUserId: "user-5",
  });
  updateIntentControls({ incidentFallbackToOffChain: true });

  const blocked = updateIntent({
    intentId: intent.id,
    status: "SIGNED",
  });
  assert.equal(blocked, "INCIDENT_FALLBACK_ACTIVE");
});
