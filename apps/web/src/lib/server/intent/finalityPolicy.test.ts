import assert from "node:assert/strict";
import test from "node:test";

import { evaluateFinality } from "./finalityPolicy";
import type { TxIntentControlState, TxIntentRecord } from "./types";

const baseControls: TxIntentControlState = {
  strictConfirmationMode: false,
  optimisticMode: true,
  incidentFallbackToOffChain: false,
  confirmationDepth: 3,
};

const buildIntent = (input: Partial<TxIntentRecord>): TxIntentRecord => ({
  id: "intent_1",
  idempotencyKey: "idem",
  gameId: "game_1",
  initiatorUserId: "user_1",
  status: "CONFIRMED",
  observedConfirmations: 1,
  maxObservedConfirmations: 1,
  timestamps: { preparedAt: new Date().toISOString() },
  auditTrail: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...input,
});

test("evaluateFinality stays provisional before configured depth", () => {
  const finality = evaluateFinality(buildIntent({ observedConfirmations: 2 }), baseControls);
  assert.equal(finality.trustLabel, "PROVISIONAL_CHAIN_SIGNAL");
  assert.equal(finality.provisional, true);
  assert.equal(finality.confidencePercent, 67);
});

test("evaluateFinality marks threshold reached and no reorg risk", () => {
  const finality = evaluateFinality(buildIntent({ observedConfirmations: 3 }), baseControls);
  assert.equal(finality.trustLabel, "CONFIRMED_FINALITY_THRESHOLD");
  assert.equal(finality.reorgRisk, false);
  assert.equal(finality.confidencePercent, 100);
});

test("evaluateFinality flags REORG_RISK when confirmations drift backward", () => {
  const finality = evaluateFinality(
    buildIntent({
      observedConfirmations: 1,
      maxObservedConfirmations: 3,
      status: "CONFIRMED",
    }),
    baseControls
  );
  assert.equal(finality.trustLabel, "REORG_RISK");
  assert.equal(finality.reorgRisk, true);
  assert.equal(finality.provisional, true);
});
