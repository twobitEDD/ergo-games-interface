import assert from "node:assert/strict";
import test from "node:test";

import { POST as getPrepareIntent } from "./prepare/route";
import { GET as getIntentStatus } from "./status/[intentId]/route";
import { GET as getControls, POST as updateControls } from "./controls/route";
import { GET as getIntentById } from "./intents/[intentId]/route";
import { POST as updateIntentStatus } from "./intents/[intentId]/status/route";
import { GET as listIntents, POST as createIntent } from "./intents/route";
import { createGame, resetMemoryStoreForTests, upsertUserFromAuth } from "../../../lib/server/memoryStore";

const postJson = (url: string, payload: Record<string, unknown>): Request =>
  new Request(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });

test.beforeEach(() => {
  resetMemoryStoreForTests();
});

test("intent api create/list/update/status lifecycle behavior", async () => {
  const user = upsertUserFromAuth("auth-intent-1", "Intent User");
  const game = createGame(user.id, "ON_CHAIN_PLAY");

  const createResponse = await createIntent(
    postJson("http://localhost/api/on-chain/intents", {
      gameId: game.id,
      initiatorUserId: user.id,
      idempotencyKey: "intent-idem-1",
    })
  );
  assert.equal(createResponse.status, 201);
  const createdPayload = (await createResponse.json()) as { intent: { id: string; status: string } };
  assert.equal(createdPayload.intent.status, "PREPARED");

  const updateResponse = await updateIntentStatus(
    postJson("http://localhost/api/on-chain/intents/status", {
      status: "SIGNED",
      note: "wallet approved",
    }),
    { params: { intentId: createdPayload.intent.id } }
  );
  assert.equal(updateResponse.status, 200);

  const statusResponse = await getIntentStatus(new Request("http://localhost"), {
    params: { intentId: createdPayload.intent.id },
  });
  assert.equal(statusResponse.status, 200);
  const statusPayload = (await statusResponse.json()) as { status: string; finality: { trustLabel: string } };
  assert.equal(statusPayload.status, "SIGNED");
  assert.equal(statusPayload.finality.trustLabel, "PROVISIONAL_CHAIN_SIGNAL");

  const listResponse = await listIntents(new Request("http://localhost/api/on-chain/intents?pendingOnly=true"));
  const listPayload = (await listResponse.json()) as { intents: Array<{ id: string }> };
  assert.equal(listPayload.intents.length, 1);
  assert.equal(listPayload.intents[0].id, createdPayload.intent.id);
});

test("controls endpoint toggles strict/optimistic/fallback state", async () => {
  const before = await getControls();
  const beforePayload = (await before.json()) as { controls: { strictConfirmationMode: boolean } };
  assert.equal(typeof beforePayload.controls.strictConfirmationMode, "boolean");

  const updated = await updateControls(
    postJson("http://localhost/api/on-chain/controls", {
      strictConfirmationMode: true,
      optimisticMode: false,
      confirmationDepth: 4,
    })
  );
  const updatedPayload = (await updated.json()) as {
    controls: { strictConfirmationMode: boolean; optimisticMode: boolean; confirmationDepth: number };
  };
  assert.equal(updatedPayload.controls.strictConfirmationMode, true);
  assert.equal(updatedPayload.controls.optimisticMode, false);
  assert.equal(updatedPayload.controls.confirmationDepth, 4);
});

test("legacy prepare and lookup routes remain compatible", async () => {
  const user = upsertUserFromAuth("auth-intent-2", "Legacy User");
  const game = createGame(user.id, "ON_CHAIN_PLAY");

  const response = await getPrepareIntent(
    postJson("http://localhost/api/on-chain/prepare", {
      gameId: game.id,
      initiatorUserId: user.id,
    })
  );
  assert.equal(response.status, 200);
  const payload = (await response.json()) as { intent: { id: string } };

  const byIdResponse = await getIntentById(new Request("http://localhost"), {
    params: { intentId: payload.intent.id },
  });
  assert.equal(byIdResponse.status, 200);
});
