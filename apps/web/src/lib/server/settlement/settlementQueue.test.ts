import assert from "node:assert/strict";
import test from "node:test";

import { decideSettlementRail } from "./decisionService";
import {
  getSettlement,
  reconcileIndexerObservations,
  recordIndexerObservation,
  registerSettlement,
  resetSettlementQueueForTests,
  runSettlementWorker,
} from "./settlementQueue";

test.beforeEach(() => {
  resetSettlementQueueForTests();
});

test("decision service selects rail with clear eligibility reasons", () => {
  const free = decideSettlementRail({
    gameMode: "FREE_PLAY",
    sponsorshipEnabled: true,
    proofPipelineReady: true,
    relayerFunded: true,
  });
  assert.equal(free.rail, "OFF_CHAIN_ONLY");
  assert.deepEqual(free.reasons, ["MODE_FREE_PLAY_OFF_CHAIN"]);

  const sponsoredBlocked = decideSettlementRail({
    gameMode: "SPONSORED_PLAY",
    sponsorshipEnabled: false,
    proofPipelineReady: false,
    relayerFunded: false,
  });
  assert.equal(sponsoredBlocked.rail, "OFF_CHAIN_ONLY");
  assert.deepEqual(sponsoredBlocked.reasons, ["SPONSORSHIP_CAPABILITY_DISABLED"]);

  const sponsoredEligible = decideSettlementRail({
    gameMode: "SPONSORED_PLAY",
    sponsorshipEnabled: true,
    proofPipelineReady: true,
    relayerFunded: true,
  });
  assert.equal(sponsoredEligible.rail, "SERVER_SPONSORED_ON_CHAIN");
  assert.deepEqual(sponsoredEligible.reasons, ["SERVER_SPONSORED_ELIGIBLE"]);
});

test("queue worker transitions settlement from proof pending to verified", () => {
  const settlement = registerSettlement({
    rewardId: "rwd-1",
    userId: "user-1",
    gameId: "game-1",
    units: 40,
    unitKind: "XP",
    decisionInput: {
      gameMode: "SPONSORED_PLAY",
      sponsorshipEnabled: true,
      proofPipelineReady: true,
      relayerFunded: true,
    },
  });
  assert.equal(settlement.lifecycleStatus, "PROOF_PENDING");
  assert.equal(settlement.queueStatus, "ENQUEUED");

  const workerResult = runSettlementWorker({ retryDelayMs: 1 });
  assert.equal(workerResult.processedSettlementIds.includes(settlement.settlementId), true);

  const afterCommit = getSettlement(settlement.settlementId);
  assert.equal(afterCommit?.queueStatus, "COMMITTED");
  assert.equal(afterCommit?.lifecycleStatus, "PROOF_PENDING");
  assert.equal(typeof afterCommit?.commitmentHash, "string");

  recordIndexerObservation({
    commitmentHash: afterCommit?.commitmentHash ?? "",
    txId: "tx_123",
    confirmations: 2,
  });
  const reconciled = reconcileIndexerObservations(1);
  assert.equal(reconciled.includes(settlement.settlementId), true);

  const verified = getSettlement(settlement.settlementId);
  assert.equal(verified?.queueStatus, "VERIFIED");
  assert.equal(verified?.lifecycleStatus, "VERIFIED_ON_ERGO");
  assert.equal(verified?.txId, "tx_123");
});

test("queue worker retries and fails after max attempts", () => {
  const settlement = registerSettlement({
    rewardId: "rwd-2",
    userId: "user-2",
    gameId: "game-2",
    units: 18,
    unitKind: "CREDITS",
    maxAttempts: 2,
    simulatedFailuresBeforeSuccess: 2,
    decisionInput: {
      gameMode: "SPONSORED_PLAY",
      sponsorshipEnabled: true,
      proofPipelineReady: true,
      relayerFunded: true,
    },
  });

  const firstRun = runSettlementWorker({ retryDelayMs: 0 });
  assert.equal(firstRun.retryScheduledSettlementIds.includes(settlement.settlementId), true);
  const firstState = getSettlement(settlement.settlementId);
  assert.equal(firstState?.queueStatus, "RETRY_SCHEDULED");
  assert.equal(firstState?.lifecycleStatus, "PROOF_PENDING");

  const secondRun = runSettlementWorker({ retryDelayMs: 0 });
  assert.equal(secondRun.failedSettlementIds.includes(settlement.settlementId), true);
  const failedState = getSettlement(settlement.settlementId);
  assert.equal(failedState?.queueStatus, "FAILED");
  assert.equal(failedState?.lifecycleStatus, "FAILED");
  assert.equal(failedState?.attempts, 2);
});
